/**
 * SNAPs Auto-Naming and Path Organization Utilities
 * 
 * Predefined naming conventions:
 * Root: SNAPs/
 * Project folder: SNAPs/{Project_Name}/
 * Stage folder: SNAPs/{Project_Name}/{Stage_Folder_Name}/
 * Photo file: {Project_Name}_{Stage_Code}_{Photo_Tag}_{YYYYMMDD_HHMMSS}.jpg
 * 
 * Example:
 * Logical Path: SNAPs/SG-Repair-2026-001/01_Incoming_Inspection/SG-Repair-2026-001_STG01_Nameplate_20261017_181200.jpg
 */

export function sanitizeFolderName(input: string): string {
  // Replace spaces and invalid path characters with hyphens/underscores
  return input
    .trim()
    .replace(/[<>:"/\\|?*]/g, '')
    .replace(/\s+/g, '-')
    .replace(/[-_]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function sanitizeFileNameTag(input: string): string {
  return input
    .trim()
    .replace(/[<>:"/\\|?*]/g, '')
    .replace(/\s+/g, '_')
    .replace(/[^a-zA-Z0-9_-]/g, '')
    .slice(0, 30);
}

export function formatTimestampCompact(date: Date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  const yyyy = date.getFullYear();
  const mm = pad(date.getMonth() + 1);
  const dd = pad(date.getDate());
  const hh = pad(date.getHours());
  const min = pad(date.getMinutes());
  const ss = pad(date.getSeconds());
  return `${yyyy}${mm}${dd}_${hh}${min}${ss}`;
}

export function generatePhotoFileName(
  projectName: string,
  stageCode: string,
  photoTag: string,
  date: Date = new Date(),
  sequenceIndex?: number
): string {
  const safeProject = sanitizeFolderName(projectName);
  const safeStage = stageCode.toUpperCase();
  const safeTag = sanitizeFileNameTag(photoTag);
  const timestamp = formatTimestampCompact(date);
  const seqSuffix = sequenceIndex && sequenceIndex > 1 ? `_#${String(sequenceIndex).padStart(2, '0')}` : '';
  return `${safeProject}_${safeStage}_${safeTag}${seqSuffix}_${timestamp}.jpg`;
}

export function generateLogicalPath(
  projectName: string,
  stageFolderName: string,
  fileName: string
): string {
  const safeProject = sanitizeFolderName(projectName);
  return `SNAPs/${safeProject}/${stageFolderName}/${fileName}`;
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function formatDateTimeNice(isoString: string): string {
  if (!isoString) return 'N/A';
  try {
    const d = new Date(isoString);
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return isoString;
  }
}

export function calculateProjectProgress(
  stages: { checklist: { id?: string; isRequired: boolean; capturedPhotoId?: string; capturedPhotoIds?: string[] }[] }[],
  photos: { checklistItemId?: string }[]
): {
  requiredTotal: number;
  requiredCompleted: number;
  totalPhotos: number;
  percentage: number;
} {
  let requiredTotal = 0;
  let requiredCompleted = 0;

  stages.forEach((stage) => {
    stage.checklist.forEach((item) => {
      if (item.isRequired) {
        requiredTotal++;
        const hasPhoto =
          photos.some((p) => p.checklistItemId === item.id) ||
          (item.capturedPhotoIds && item.capturedPhotoIds.length > 0) ||
          !!item.capturedPhotoId;
        if (hasPhoto) {
          requiredCompleted++;
        }
      }
    });
  });

  const percentage = requiredTotal === 0 ? 0 : Math.round((requiredCompleted / requiredTotal) * 100);

  return {
    requiredTotal,
    requiredCompleted,
    totalPhotos: photos.length,
    percentage: Math.min(100, Math.max(0, percentage)),
  };
}
