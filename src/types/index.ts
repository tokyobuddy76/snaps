export type RepairStatus = 'Not Started' | 'In Progress' | 'Complete';

export type AssetType = 
  | 'Steam Turbine Rotor'
  | 'Gas Turbine Rotor'
  | 'Centrifugal Compressor'
  | 'Boiler Feed Pump'
  | 'Industrial Gearbox'
  | 'Electric Generator Rotor'
  | 'Centrifugal Blower'
  | 'General Turbomachinery';

export interface PhotoChecklistItem {
  id: string;
  stageId: string;
  title: string;
  description: string;
  isRequired: boolean;
  angleOrFeature: string;
  capturedPhotoId?: string; // links to CapturedPhoto
}

export interface CapturedPhoto {
  id: string;
  projectId: string;
  projectName: string;
  stageId: string;
  stageName: string;
  stageCode: string;
  checklistItemId?: string;
  checklistItemTitle?: string;
  fileName: string;
  logicalPath: string; // e.g. "SNAPs/SG-Repair-2026-001/01_Incoming_Inspection/SG-Repair-2026-001_STG01_Nameplate_20261017_143000.jpg"
  dataUrl: string; // base64 or blob URL
  timestamp: string; // ISO string
  capturedBy: string;
  notes?: string;
  conditionRating?: 'Acceptable' | 'Minor Defect' | 'Critical Damage' | 'Information';
  annotations?: PhotoAnnotation[];
  fileSizeBytes: number;
}

export interface PhotoAnnotation {
  id: string;
  type: 'arrow' | 'circle' | 'box' | 'text';
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  width?: number;
  height?: number;
  text?: string;
  color: string;
}

export interface RepairStage {
  id: string;
  stageCode: string; // e.g. "STG01"
  folderName: string; // e.g. "01_Incoming_Inspection"
  title: string;
  description: string;
  checklist: PhotoChecklistItem[];
  status: 'Pending' | 'In Progress' | 'Complete';
}

export interface RepairProject {
  id: string;
  name: string; // Project Name (e.g. "SG-Repair-2026-001")
  folderPath: string; // "SNAPs/SG-Repair-2026-001"
  assetType: AssetType;
  workOrderNumber?: string;
  serialNumber?: string;
  leadEngineer: string;
  workshopLocation: string;
  customerName?: string;
  createdAt: string;
  updatedAt: string;
  currentStageId: string;
  status: RepairStatus;
  stages: RepairStage[];
  photos: CapturedPhoto[];
}
