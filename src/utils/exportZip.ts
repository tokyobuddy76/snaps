import JSZip from 'jszip';
import { RepairProject, CapturedPhoto } from '../types';

/**
 * Converts base64 / Data URL to binary Uint8Array for JSZip
 */
function dataUrlToBinary(dataUrl: string): Uint8Array {
  const parts = dataUrl.split(',');
  const base64Str = parts[1] || parts[0];
  const binaryStr = atob(base64Str);
  const len = binaryStr.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryStr.charCodeAt(i);
  }
  return bytes;
}

/**
 * Generates and downloads a ZIP package strictly following the SNAPs logical folder tree:
 * 
 * SNAPs/
 *   {Project_Name}/
 *     01_Incoming_Inspection/
 *     02_Disassembly/
 *     ...
 *     MANIFEST.json
 *     PHOTO_CATALOG.csv
 */
export async function exportProjectZip(project: RepairProject): Promise<void> {
  const zip = new JSZip();
  const root = zip.folder('SNAPs');
  if (!root) throw new Error('Could not create SNAPs root folder in ZIP');

  const projectFolder = root.folder(project.name);
  if (!projectFolder) throw new Error('Could not create project folder in ZIP');

  // Pre-create standard stage folders
  const stageFolderMap = new Map<string, JSZip>();
  for (const stage of project.stages) {
    const sFolder = projectFolder.folder(stage.folderName);
    if (sFolder) {
      stageFolderMap.set(stage.id, sFolder);
    }
  }

  // Populate photos into correct stage folders
  for (const photo of project.photos) {
    let targetFolder = stageFolderMap.get(photo.stageId);
    if (!targetFolder) {
      // fallback to stageName folder
      const safeStageFolder = photo.stageName.replace(/[^a-zA-Z0-9_-]/g, '_');
      targetFolder = projectFolder.folder(safeStageFolder) || projectFolder;
    }

    try {
      if (photo.dataUrl.startsWith('data:')) {
        const bin = dataUrlToBinary(photo.dataUrl);
        targetFolder.file(photo.fileName, bin);
      }
    } catch (e) {
      console.error(`Failed to serialize photo ${photo.fileName}:`, e);
    }
  }

  // Add CSV Photo Catalog
  let csvContent = 'File Name,Logical Path,Stage,Checklist Item,Timestamp,Captured By,Condition Rating,Notes\n';
  project.photos.forEach((ph: CapturedPhoto) => {
    const escapeCsv = (str: string = '') => `"${str.replace(/"/g, '""')}"`;
    csvContent += [
      escapeCsv(ph.fileName),
      escapeCsv(ph.logicalPath),
      escapeCsv(ph.stageName),
      escapeCsv(ph.checklistItemTitle || ''),
      escapeCsv(ph.timestamp),
      escapeCsv(ph.capturedBy),
      escapeCsv(ph.conditionRating || 'N/A'),
      escapeCsv(ph.notes || ''),
    ].join(',') + '\n';
  });
  projectFolder.file('PHOTO_CATALOG.csv', csvContent);

  // Add JSON Manifest
  const manifest = {
    application: 'SNAPs — Smart Networked Asset Photos',
    version: '2.0-PROD',
    exportedAt: new Date().toISOString(),
    project: {
      name: project.name,
      rootFolder: 'SNAPs',
      logicalDirectory: `SNAPs/${project.name}`,
      assetType: project.assetType,
      workOrderNumber: project.workOrderNumber,
      serialNumber: project.serialNumber,
      leadEngineer: project.leadEngineer,
      workshopLocation: project.workshopLocation,
      status: project.status,
      totalPhotos: project.photos.length,
      stages: project.stages.map(s => ({
        stageCode: s.stageCode,
        folderName: s.folderName,
        title: s.title,
        status: s.status,
        requiredItemsCount: s.checklist.filter(c => c.isRequired).length,
      })),
      files: project.photos.map(p => ({
        fileName: p.fileName,
        logicalPath: p.logicalPath,
        stage: p.stageName,
        timestamp: p.timestamp,
        notes: p.notes,
      })),
    },
  };
  projectFolder.file('INSPECTION_MANIFEST.json', JSON.stringify(manifest, null, 2));

  // Generate ZIP blob and trigger download
  const blob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE' });
  const downloadUrl = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = downloadUrl;
  a.download = `SNAPs_${project.name}_${new Date().toISOString().slice(0, 10)}.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(downloadUrl);
}

/**
 * Exports all projects under the SNAPs root archive
 */
export async function exportAllProjectsZip(projects: RepairProject[]): Promise<void> {
  const zip = new JSZip();
  const root = zip.folder('SNAPs');
  if (!root) throw new Error('Could not create SNAPs root');

  for (const project of projects) {
    const projectFolder = root.folder(project.name);
    if (!projectFolder) continue;

    for (const photo of project.photos) {
      const stage = project.stages.find(s => s.id === photo.stageId);
      const stageFolder = projectFolder.folder(stage ? stage.folderName : 'Misc_Photos');
      if (stageFolder && photo.dataUrl.startsWith('data:')) {
        try {
          const bin = dataUrlToBinary(photo.dataUrl);
          stageFolder.file(photo.fileName, bin);
        } catch (e) {
          console.error(e);
        }
      }
    }
  }

  const blob = await zip.generateAsync({ type: 'blob' });
  const downloadUrl = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = downloadUrl;
  a.download = `SNAPs_All_Projects_Backup_${new Date().toISOString().slice(0, 10)}.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(downloadUrl);
}
