import React, { useState } from 'react';
import { RepairProject, CapturedPhoto } from '../types';
import { exportProjectZip, exportAllProjectsZip } from '../utils/exportZip';
import { formatBytes } from '../utils/naming';
import { Folder, FolderOpen, FileImage, Download, ChevronRight, ChevronDown, X, HardDrive, CheckCircle2, Shield } from 'lucide-react';

interface FolderExplorerModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: RepairProject[];
  onSelectPhoto: (photo: CapturedPhoto) => void;
}

export const FolderExplorerModal: React.FC<FolderExplorerModalProps> = ({
  isOpen,
  onClose,
  projects,
  onSelectPhoto,
}) => {
  const [expandedProjects, setExpandedProjects] = useState<Record<string, boolean>>(() => {
    // Expand first project by default
    const init: Record<string, boolean> = {};
    if (projects.length > 0) init[projects[0].id] = true;
    return init;
  });

  const [expandedStages, setExpandedStages] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    if (projects.length > 0 && projects[0].stages.length > 0) {
      init[`${projects[0].id}-${projects[0].stages[0].id}`] = true;
    }
    return init;
  });

  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen) return null;

  const toggleProject = (projId: string) => {
    setExpandedProjects((prev) => ({ ...prev, [projId]: !prev[projId] }));
  };

  const toggleStage = (key: string) => {
    setExpandedStages((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleExportAll = async () => {
    try {
      setIsExporting(true);
      await exportAllProjectsZip(projects);
    } catch (e) {
      console.error(e);
      alert('Failed to export SNAPs archive. Check browser permissions.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportProject = async (p: RepairProject, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      setIsExporting(true);
      await exportProjectZip(p);
    } catch (e) {
      console.error(e);
      alert(`Failed to export ${p.name} folder.`);
    } finally {
      setIsExporting(false);
    }
  };

  const totalPhotosCount = projects.reduce((acc, p) => acc + p.photos.length, 0);
  const totalSizeBytes = projects.reduce(
    (acc, p) => acc + p.photos.reduce((sub, ph) => sub + ph.fileSizeBytes, 0),
    0
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/40 backdrop-blur-xs">
      <div 
        role="dialog"
        aria-modal="true"
        aria-labelledby="explorer-title"
        className="bg-white border border-slate-200 rounded-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden shadow-xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <h2 id="explorer-title" className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <span>Logical Directory Explorer</span>
                <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200">
                  SNAPs/
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Hierarchical storage organization by project and repair stage
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleExportAll}
              disabled={isExporting}
              className="hidden sm:flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-xs disabled:opacity-50 min-h-[40px]"
            >
              <Download className="w-4 h-4 stroke-[2.5]" />
              <span>{isExporting ? 'Packaging ZIP...' : 'Export All (ZIP)'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Info stats strip */}
        <div className="px-6 py-2.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between text-xs text-slate-600 gap-3">
          <div className="flex items-center gap-4">
            <span>Projects: <strong className="text-slate-900 font-semibold">{projects.length}</strong></span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span>Photos: <strong className="text-slate-900 font-semibold">{totalPhotosCount}</strong></span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span>Total Volume: <strong className="text-slate-900 font-semibold font-mono">{formatBytes(totalSizeBytes)}</strong></span>
          </div>

          <div className="flex items-center gap-1.5 text-slate-600 font-mono text-[11px]">
            <Shield className="w-3.5 h-3.5 text-emerald-600" />
            <span>Strict Project Separation Enforced</span>
          </div>
        </div>

        {/* Tree View */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 font-mono text-xs text-slate-700 space-y-2 bg-slate-50/20">
          {/* Root directory line */}
          <div className="flex items-center gap-2 text-blue-700 font-bold p-2 bg-white rounded-lg border border-slate-200 shadow-xs">
            <FolderOpen className="w-4 h-4 text-blue-600" />
            <span className="text-sm">SNAPs/</span>
            <span className="text-[11px] font-normal text-slate-500 font-sans ml-2">
              (Root photo repository)
            </span>
          </div>

          {/* Projects Tree */}
          <div className="pl-4 sm:pl-6 space-y-2 border-l border-slate-200 ml-3">
            {projects.map((proj) => {
              const isProjExpanded = !!expandedProjects[proj.id];
              return (
                <div key={proj.id} className="space-y-1">
                  {/* Project Row */}
                  <div
                    onClick={() => toggleProject(proj.id)}
                    className="flex items-center justify-between p-2 rounded-lg bg-white hover:bg-blue-50/30 border border-slate-200 cursor-pointer transition-all group shadow-xs"
                  >
                    <div className="flex items-center gap-2 truncate pr-2">
                      {isProjExpanded ? (
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      )}
                      <Folder className="w-4 h-4 text-blue-600 shrink-0" />
                      <span className="font-semibold text-slate-900 truncate">
                        {proj.name}/
                      </span>
                      <span className="text-[11px] text-slate-500 font-sans hidden sm:inline">
                        ({proj.photos.length} photos)
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={(e) => handleExportProject(proj, e)}
                        title="Export project folder as ZIP"
                        className="px-2.5 py-1 text-[11px] font-medium text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-md border border-slate-200 flex items-center gap-1 transition-colors min-h-[32px]"
                      >
                        <Download className="w-3 h-3 text-blue-600" />
                        <span className="hidden sm:inline">Download</span>
                      </button>
                    </div>
                  </div>

                  {/* Stage Folders inside Project */}
                  {isProjExpanded && (
                    <div className="pl-4 sm:pl-6 space-y-1.5 border-l border-slate-200 ml-3 py-1">
                      {proj.stages.map((stage) => {
                        const stageKey = `${proj.id}-${stage.id}`;
                        const isStageExpanded = !!expandedStages[stageKey];
                        const stagePhotos = proj.photos.filter((p) => p.stageId === stage.id);

                        return (
                          <div key={stage.id} className="space-y-1">
                            {/* Stage Folder Row */}
                            <div
                              onClick={() => toggleStage(stageKey)}
                              className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer text-slate-700 hover:text-slate-900 transition-colors"
                            >
                              <div className="flex items-center gap-2 truncate">
                                {isStageExpanded ? (
                                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                                ) : (
                                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                                )}
                                <Folder className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                                <span className="font-medium truncate text-slate-800">
                                  {stage.folderName}/
                                </span>
                              </div>
                              <span className="text-[11px] text-slate-500 shrink-0">
                                {stagePhotos.length} files
                              </span>
                            </div>

                            {/* Photos inside Stage Folder */}
                            {isStageExpanded && (
                              <div className="pl-6 space-y-1 border-l border-slate-200 ml-2 py-0.5">
                                {stagePhotos.length === 0 ? (
                                  <div className="text-[11px] text-slate-400 italic py-1 pl-2">
                                    [No photos taken for this stage yet]
                                  </div>
                                ) : (
                                  stagePhotos.map((photo) => (
                                    <div
                                      key={photo.id}
                                      onClick={() => {
                                        onSelectPhoto(photo);
                                        onClose();
                                      }}
                                      className="flex items-center justify-between p-1.5 rounded-lg hover:bg-blue-50 hover:border-blue-200 border border-transparent cursor-pointer group transition-all"
                                    >
                                      <div className="flex items-center gap-2 truncate pr-2">
                                        <FileImage className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                                        <span className="text-slate-700 group-hover:text-blue-700 truncate">
                                          {photo.fileName}
                                        </span>
                                      </div>
                                      <span className="text-[10px] text-slate-500 shrink-0 font-mono">
                                        {formatBytes(photo.fileSizeBytes)}
                                      </span>
                                    </div>
                                  ))
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}

                      {/* Manifest file */}
                      <div className="flex items-center gap-2 p-1.5 text-slate-500 pl-6">
                        <FileImage className="w-3.5 h-3.5 text-slate-400" />
                        <span>INSPECTION_MANIFEST.json</span>
                      </div>
                      <div className="flex items-center gap-2 p-1.5 text-slate-500 pl-6">
                        <FileImage className="w-3.5 h-3.5 text-slate-400" />
                        <span>PHOTO_CATALOG.csv</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Files adhere to: <code className="text-blue-700 font-mono font-medium">SNAPs/[Project]/[Stage]/[Name].jpg</code>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 min-h-[40px]"
          >
            Close Explorer
          </button>
        </div>
      </div>
    </div>
  );
};
