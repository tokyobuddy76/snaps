import React, { useState } from 'react';
import { AssetType } from '../types';
import { sanitizeFolderName } from '../utils/naming';
import { Folder, X, AlertCircle } from 'lucide-react';

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (projectData: {
    name: string;
    assetType: AssetType;
    workOrderNumber?: string;
    serialNumber?: string;
    leadEngineer: string;
    workshopLocation: string;
  }) => void;
  existingNames: string[];
}

const ASSET_TYPES: AssetType[] = [
  'Steam Turbine Rotor',
  'Gas Turbine Rotor',
  'Centrifugal Compressor',
  'Boiler Feed Pump',
  'Industrial Gearbox',
  'Electric Generator Rotor',
  'Centrifugal Blower',
  'General Turbomachinery',
];

export const NewProjectModal: React.FC<NewProjectModalProps> = ({
  isOpen,
  onClose,
  onCreate,
  existingNames,
}) => {
  const [projectName, setProjectName] = useState('');
  const [assetType, setAssetType] = useState<AssetType>('Steam Turbine Rotor');
  const [workOrderNumber, setWorkOrderNumber] = useState('');
  const [leadEngineer, setLeadEngineer] = useState('J. Miller (Repair Engineer)');
  const [workshopLocation, setWorkshopLocation] = useState('Bay 4 — Heavy Turbomachinery');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = projectName.trim();

    if (!trimmed) {
      setError('Project Name is mandatory. Please enter a valid project identifier.');
      return;
    }

    const sanitized = sanitizeFolderName(trimmed);
    if (!sanitized) {
      setError('Project Name must contain alphanumeric characters.');
      return;
    }

    const isDuplicate = existingNames.some(
      (n) => n.toLowerCase() === sanitized.toLowerCase()
    );
    if (isDuplicate) {
      setError(`A project with the folder name "${sanitized}" already exists under SNAPs/.`);
      return;
    }

    onCreate({
      name: sanitized,
      assetType,
      workOrderNumber: workOrderNumber.trim() || undefined,
      leadEngineer: leadEngineer.trim() || 'Workshop Lead',
      workshopLocation: workshopLocation.trim() || 'Bay 1',
    });

    // Reset and close
    setProjectName('');
    setError(null);
    onClose();
  };

  const previewFolder = projectName.trim() ? sanitizeFolderName(projectName) : 'Project_Name';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div 
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-project-title"
        className="bg-white border border-slate-200 rounded-xl w-full max-w-lg overflow-hidden shadow-xl animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <div>
            <h2 id="new-project-title" className="text-lg font-bold text-slate-900 tracking-tight">Create New Project</h2>
            <p className="text-xs text-slate-500">Initialize a dedicated repair photo folder under SNAPs/</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Logical Path Preview */}
          <div className="bg-slate-50 rounded-lg p-3 border border-slate-200 flex items-center gap-2.5 text-xs">
            <Folder className="w-4 h-4 text-blue-600 shrink-0" />
            <div className="font-mono truncate">
              <span className="text-slate-500">Root / </span>
              <span className="text-blue-700 font-semibold">SNAPs/{previewFolder}/</span>
            </div>
          </div>

          {/* Project Name (MANDATORY per Sub-goal 3) */}
          <div className="space-y-1.5">
            <label htmlFor="projectNameInput" className="block text-xs font-semibold text-slate-800">
              Project Name <span className="text-rose-600">*</span>
            </label>
            <input
              id="projectNameInput"
              type="text"
              autoFocus
              required
              value={projectName}
              onChange={(e) => {
                setProjectName(e.target.value);
                if (error) setError(null);
              }}
              placeholder="e.g. SG-Repair-2026-004, Rotor-Job-55412"
              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 font-mono shadow-xs"
            />
            <p className="text-[11px] text-slate-500">
              Unique job ID used for automatic photo folder generation and image naming.
            </p>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Asset Equipment Type */}
          <div className="space-y-1.5">
            <label htmlFor="assetTypeSelect" className="block text-xs font-semibold text-slate-800">
              Asset / Equipment Type
            </label>
            <select
              id="assetTypeSelect"
              value={assetType}
              onChange={(e) => setAssetType(e.target.value as AssetType)}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-blue-600 shadow-xs"
            >
              {ASSET_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          {/* Additional Workshop Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="space-y-1">
              <label htmlFor="workOrderInput" className="block text-xs font-medium text-slate-700">
                Work Order # (Optional)
              </label>
              <input
                id="workOrderInput"
                type="text"
                value={workOrderNumber}
                onChange={(e) => setWorkOrderNumber(e.target.value)}
                placeholder="e.g. WO-90422"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 font-mono shadow-xs"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="leadEngineerInput" className="block text-xs font-medium text-slate-700">
                Lead Engineer
              </label>
              <input
                id="leadEngineerInput"
                type="text"
                value={leadEngineer}
                onChange={(e) => setLeadEngineer(e.target.value)}
                placeholder="Engineer name"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 shadow-xs"
              />
            </div>
          </div>

          {/* Workshop Bay */}
          <div className="space-y-1">
            <label htmlFor="workshopLocationInput" className="block text-xs font-medium text-slate-700">
              Workshop Bay / Stand
            </label>
            <input
              id="workshopLocationInput"
              type="text"
              value={workshopLocation}
              onChange={(e) => setWorkshopLocation(e.target.value)}
              placeholder="e.g. Bay 3 — Heavy Balancing"
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 shadow-xs"
            />
          </div>

          {/* Action Buttons as specified in Sub-goal 3 */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors min-h-[44px] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!projectName.trim()}
              className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:pointer-events-none rounded-lg transition-colors shadow-xs min-h-[44px] cursor-pointer active:scale-[0.98]"
            >
              Create Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
