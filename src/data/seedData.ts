import { RepairProject, CapturedPhoto } from '../types';
import { createDefaultRepairStages } from './standardChecklists';
import { generateIndustrialPhotoDataUrl } from '../utils/canvasRenderer';
import { generateLogicalPath, generatePhotoFileName } from '../utils/naming';

export function getSeedProjects(): RepairProject[] {
  // Project 1: SG-Repair-2026-001
  const p1Stages = createDefaultRepairStages();
  p1Stages[0].status = 'Complete';
  p1Stages[1].status = 'Complete';
  p1Stages[2].status = 'In Progress';

  const p1Photos: CapturedPhoto[] = [];

  // STG01 Photos for SG-Repair-2026-001
  const p1_photo1_name = generatePhotoFileName('SG-Repair-2026-001', 'STG01', 'Nameplate', new Date('2026-10-14T09:15:00'));
  const p1_photo1: CapturedPhoto = {
    id: 'p1-ph-1',
    projectId: 'proj-1',
    projectName: 'SG-Repair-2026-001',
    stageId: 'stage-1',
    stageName: '01. Incoming Inspection',
    stageCode: 'STG01',
    checklistItemId: 'chk-1-1',
    checklistItemTitle: 'Asset Nameplate & Serial Stamping',
    fileName: p1_photo1_name,
    logicalPath: generateLogicalPath('SG-Repair-2026-001', '01_Incoming_Inspection', p1_photo1_name),
    dataUrl: generateIndustrialPhotoDataUrl('Asset Nameplate - TRB-680-HP5', 'SG-Repair-2026-001', 'STG01', 'nameplate'),
    timestamp: '2026-10-14T09:15:00Z',
    capturedBy: 'M. Vance (Lead Engineer)',
    notes: 'OEM serial plate intact. Verified against Work Order 44091.',
    conditionRating: 'Acceptable',
    fileSizeBytes: 245000,
  };
  p1Photos.push(p1_photo1);
  p1Stages[0].checklist[0].capturedPhotoId = p1_photo1.id;

  const p1_photo2_name = generatePhotoFileName('SG-Repair-2026-001', 'STG01', 'Overall_Condition', new Date('2026-10-14T09:22:00'));
  const p1_photo2: CapturedPhoto = {
    id: 'p1-ph-2',
    projectId: 'proj-1',
    projectName: 'SG-Repair-2026-001',
    stageId: 'stage-1',
    stageName: '01. Incoming Inspection',
    stageCode: 'STG01',
    checklistItemId: 'chk-1-2',
    checklistItemTitle: 'Overall As-Received Condition',
    fileName: p1_photo2_name,
    logicalPath: generateLogicalPath('SG-Repair-2026-001', '01_Incoming_Inspection', p1_photo2_name),
    dataUrl: generateIndustrialPhotoDataUrl('As-Received Full Shaft Overview', 'SG-Repair-2026-001', 'STG01', 'rotor'),
    timestamp: '2026-10-14T09:22:00Z',
    capturedBy: 'M. Vance (Lead Engineer)',
    notes: 'Minor surface rust on mid-span shaft body. No shipping transit impact marks.',
    conditionRating: 'Information',
    fileSizeBytes: 278000,
  };
  p1Photos.push(p1_photo2);
  p1Stages[0].checklist[1].capturedPhotoId = p1_photo2.id;

  const p1_photo3_name = generatePhotoFileName('SG-Repair-2026-001', 'STG01', 'DE_Journal', new Date('2026-10-14T09:35:00'));
  const p1_photo3: CapturedPhoto = {
    id: 'p1-ph-3',
    projectId: 'proj-1',
    projectName: 'SG-Repair-2026-001',
    stageId: 'stage-1',
    stageName: '01. Incoming Inspection',
    stageCode: 'STG01',
    checklistItemId: 'chk-1-3',
    checklistItemTitle: 'Drive End (DE) Journal Surface',
    fileName: p1_photo3_name,
    logicalPath: generateLogicalPath('SG-Repair-2026-001', '01_Incoming_Inspection', p1_photo3_name),
    dataUrl: generateIndustrialPhotoDataUrl('DE Bearing Journal Scratches', 'SG-Repair-2026-001', 'STG01', 'journal'),
    timestamp: '2026-10-14T09:35:00Z',
    capturedBy: 'M. Vance (Lead Engineer)',
    notes: 'Circumferential scoring detected along centerline of DE journal. Roughness Ra 1.4 µm.',
    conditionRating: 'Minor Defect',
    fileSizeBytes: 260000,
  };
  p1Photos.push(p1_photo3);
  p1Stages[0].checklist[2].capturedPhotoId = p1_photo3.id;

  // STG02 Photos for SG-Repair-2026-001
  const p1_photo4_name = generatePhotoFileName('SG-Repair-2026-001', 'STG02', 'Bearing_Shells', new Date('2026-10-15T11:10:00'));
  const p1_photo4: CapturedPhoto = {
    id: 'p1-ph-4',
    projectId: 'proj-1',
    projectName: 'SG-Repair-2026-001',
    stageId: 'stage-2',
    stageName: '02. Disassembly & Teardown',
    stageCode: 'STG02',
    checklistItemId: 'chk-2-2',
    checklistItemTitle: 'Bearing Shells & Pads As-Removed',
    fileName: p1_photo4_name,
    logicalPath: generateLogicalPath('SG-Repair-2026-001', '02_Disassembly', p1_photo4_name),
    dataUrl: generateIndustrialPhotoDataUrl('Lower Babbitt Shell Wipe Marks', 'SG-Repair-2026-001', 'STG02', 'journal'),
    timestamp: '2026-10-15T11:10:00Z',
    capturedBy: 'M. Vance (Lead Engineer)',
    notes: 'Babbitt material wiped in 6 oclock bottom dead center. Needs rebabbitting or replacement.',
    conditionRating: 'Critical Damage',
    fileSizeBytes: 290000,
  };
  p1Photos.push(p1_photo4);
  p1Stages[1].checklist[1].capturedPhotoId = p1_photo4.id;

  // STG03 Photos for SG-Repair-2026-001
  const p1_photo5_name = generatePhotoFileName('SG-Repair-2026-001', 'STG03', 'NDT_Liquid_Penetrant', new Date('2026-10-16T14:40:00'));
  const p1_photo5: CapturedPhoto = {
    id: 'p1-ph-5',
    projectId: 'proj-1',
    projectName: 'SG-Repair-2026-001',
    stageId: 'stage-3',
    stageName: '03. Cleaning & NDT Inspection',
    stageCode: 'STG03',
    checklistItemId: 'chk-3-2',
    checklistItemTitle: 'Magnetic Particle / Liquid Penetrant (NDT)',
    fileName: p1_photo5_name,
    logicalPath: generateLogicalPath('SG-Repair-2026-001', '03_Cleaning_NDT', p1_photo5_name),
    dataUrl: generateIndustrialPhotoDataUrl('UV Fluorescent NDT Indications', 'SG-Repair-2026-001', 'STG03', 'ndt'),
    timestamp: '2026-10-16T14:40:00Z',
    capturedBy: 'T. Kowalski (NDT Level II)',
    notes: 'Fluorescent MT revealed 12mm linear indication on thrust collar fillet. Requires light blend machining.',
    conditionRating: 'Critical Damage',
    fileSizeBytes: 310000,
  };
  p1Photos.push(p1_photo5);
  p1Stages[2].checklist[1].capturedPhotoId = p1_photo5.id;

  const project1: RepairProject = {
    id: 'proj-1',
    name: 'SG-Repair-2026-001',
    folderPath: 'SNAPs/SG-Repair-2026-001',
    assetType: 'Steam Turbine Rotor',
    workOrderNumber: 'WO-88219',
    serialNumber: 'ST-99420-A',
    leadEngineer: 'M. Vance (Senior Repair Tech)',
    workshopLocation: 'Bay 4 — Heavy Turbomachinery',
    customerName: 'Pacific Basin Power Station',
    createdAt: '2026-10-14T08:00:00Z',
    updatedAt: '2026-10-17T14:45:00Z',
    currentStageId: 'stage-3',
    status: 'In Progress',
    stages: p1Stages,
    photos: p1Photos,
  };

  // Project 2: Rotor-Job-12345
  const p2Stages = createDefaultRepairStages();
  p2Stages[0].status = 'In Progress';

  const p2Photos: CapturedPhoto[] = [];
  const p2_photo1_name = generatePhotoFileName('Rotor-Job-12345', 'STG01', 'Nameplate', new Date('2026-10-17T08:30:00'));
  const p2_photo1: CapturedPhoto = {
    id: 'p2-ph-1',
    projectId: 'proj-2',
    projectName: 'Rotor-Job-12345',
    stageId: 'stage-1',
    stageName: '01. Incoming Inspection',
    stageCode: 'STG01',
    checklistItemId: 'chk-1-1',
    checklistItemTitle: 'Asset Nameplate & Serial Stamping',
    fileName: p2_photo1_name,
    logicalPath: generateLogicalPath('Rotor-Job-12345', '01_Incoming_Inspection', p2_photo1_name),
    dataUrl: generateIndustrialPhotoDataUrl('OEM Serial Tag Frame 6B', 'Rotor-Job-12345', 'STG01', 'nameplate'),
    timestamp: '2026-10-17T08:30:00Z',
    capturedBy: 'A. Chen (Repair Engineer)',
    notes: 'Frame 6B Gas Turbine Rotor. Stamping matches customs arrival docket.',
    conditionRating: 'Acceptable',
    fileSizeBytes: 220000,
  };
  p2Photos.push(p2_photo1);
  p2Stages[0].checklist[0].capturedPhotoId = p2_photo1.id;

  const project2: RepairProject = {
    id: 'proj-2',
    name: 'Rotor-Job-12345',
    folderPath: 'SNAPs/Rotor-Job-12345',
    assetType: 'Gas Turbine Rotor',
    workOrderNumber: 'WO-91040',
    serialNumber: 'GT-6B-883',
    leadEngineer: 'A. Chen (Turbine Specialist)',
    workshopLocation: 'Bay 2 — Precision Rotor Balancing',
    customerName: 'Midwest Energy Grid',
    createdAt: '2026-10-17T08:15:00Z',
    updatedAt: '2026-10-17T11:20:00Z',
    currentStageId: 'stage-1',
    status: 'In Progress',
    stages: p2Stages,
    photos: p2Photos,
  };

  // Project 3: Compressor-Repair-002 (Complete Project with full photos)
  const p3Stages = createDefaultRepairStages();
  p3Stages.forEach(s => s.status = 'Complete');

  const p3Photos: CapturedPhoto[] = [];

  // Add sample photos for all stages
  const p3_ph1_name = generatePhotoFileName('Compressor-Repair-002', 'STG01', 'Nameplate', new Date('2026-10-02T10:00:00'));
  p3Photos.push({
    id: 'p3-ph-1',
    projectId: 'proj-3',
    projectName: 'Compressor-Repair-002',
    stageId: 'stage-1',
    stageName: '01. Incoming Inspection',
    stageCode: 'STG01',
    checklistItemId: 'chk-1-1',
    checklistItemTitle: 'Asset Nameplate & Serial Stamping',
    fileName: p3_ph1_name,
    logicalPath: generateLogicalPath('Compressor-Repair-002', '01_Incoming_Inspection', p3_ph1_name),
    dataUrl: generateIndustrialPhotoDataUrl('Centrifugal Compressor Data Tag', 'Compressor-Repair-002', 'STG01', 'nameplate'),
    timestamp: '2026-10-02T10:00:00Z',
    capturedBy: 'R. Davis (QA Inspector)',
    notes: 'Elliott 5-Stage barrel compressor rotor.',
    conditionRating: 'Acceptable',
    fileSizeBytes: 230000,
  });
  p3Stages[0].checklist[0].capturedPhotoId = 'p3-ph-1';

  const p3_ph2_name = generatePhotoFileName('Compressor-Repair-002', 'STG05', 'Balancing_Report', new Date('2026-10-08T16:00:00'));
  p3Photos.push({
    id: 'p3-ph-2',
    projectId: 'proj-3',
    projectName: 'Compressor-Repair-002',
    stageId: 'stage-5',
    stageName: '05. Dynamic Balancing & Reassembly',
    stageCode: 'STG05',
    checklistItemId: 'chk-5-2',
    checklistItemTitle: 'Balancing Computer Screen / Certificate',
    fileName: p3_ph2_name,
    logicalPath: generateLogicalPath('Compressor-Repair-002', '05_Assembly_Balancing', p3_ph2_name),
    dataUrl: generateIndustrialPhotoDataUrl('Schenck Dynamic Balancing Console', 'Compressor-Repair-002', 'STG05', 'balance'),
    timestamp: '2026-10-08T16:00:00Z',
    capturedBy: 'R. Davis (QA Inspector)',
    notes: 'Final unbalance within ISO 1940 Grade G1.0 limit. 0.42g on Plane 1, 0.38g on Plane 2.',
    conditionRating: 'Acceptable',
    fileSizeBytes: 280000,
  });
  p3Stages[4].checklist[1].capturedPhotoId = 'p3-ph-2';

  const p3_ph3_name = generatePhotoFileName('Compressor-Repair-002', 'STG06', 'Dispatch_Packaging', new Date('2026-10-10T15:30:00'));
  p3Photos.push({
    id: 'p3-ph-3',
    projectId: 'proj-3',
    projectName: 'Compressor-Repair-002',
    stageId: 'stage-6',
    stageName: '06. Final QA & Dispatch Packaging',
    stageCode: 'STG06',
    checklistItemId: 'chk-6-4',
    checklistItemTitle: 'Heavy-Duty Transport Skid & Tie-Downs',
    fileName: p3_ph3_name,
    logicalPath: generateLogicalPath('Compressor-Repair-002', '06_Final_QA_Dispatch', p3_ph3_name),
    dataUrl: generateIndustrialPhotoDataUrl('Weatherproof Crate & QA Tag', 'Compressor-Repair-002', 'STG06', 'dispatch'),
    timestamp: '2026-10-10T15:30:00Z',
    capturedBy: 'R. Davis (QA Inspector)',
    notes: 'VCI sealed barrier and desiccant packs sealed inside skid crate.',
    conditionRating: 'Acceptable',
    fileSizeBytes: 295000,
  });
  p3Stages[5].checklist[3].capturedPhotoId = 'p3-ph-3';

  // Mark all required items satisfied for project 3
  p3Stages.forEach(stg => {
    stg.checklist.forEach(chk => {
      if (chk.isRequired && !chk.capturedPhotoId) {
        chk.capturedPhotoId = 'p3-ph-3';
      }
    });
  });

  const project3: RepairProject = {
    id: 'proj-3',
    name: 'Compressor-Repair-002',
    folderPath: 'SNAPs/Compressor-Repair-002',
    assetType: 'Centrifugal Compressor',
    workOrderNumber: 'WO-77150',
    serialNumber: 'CMP-ELL-2044',
    leadEngineer: 'R. Davis (QA Inspector)',
    workshopLocation: 'Bay 1 — Clean Assembly Room',
    customerName: 'Gulf Petrochemicals Refinery',
    createdAt: '2026-10-02T08:00:00Z',
    updatedAt: '2026-10-10T16:00:00Z',
    currentStageId: 'stage-6',
    status: 'Complete',
    stages: p3Stages,
    photos: p3Photos,
  };

  return [project1, project2, project3];
}
