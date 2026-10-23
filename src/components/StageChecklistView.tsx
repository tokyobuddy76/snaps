import React, { useState } from 'react';
import { RepairProject, RepairStage, PhotoChecklistItem, CapturedPhoto } from '../types';
import { calculateProjectProgress, formatDateTimeNice, formatBytes } from '../utils/naming';
import { 
  Camera, 
  CheckCircle2, 
  Circle, 
  Download, 
  FileText, 
  ArrowLeft, 
  FolderTree, 
  Eye, 
  Sparkles, 
  AlertTriangle, 
  ChevronRight,
  ShieldAlert,
  Layers,
  Image as ImageIcon,
  Check,
  Trash2,
  Plus
} from 'lucide-react';

interface StageChecklistViewProps {
  project: RepairProject;
  onBackToHome: () => void;
  onOpenExplorer: () => void;
  onStartCapture: (stage: RepairStage, item?: PhotoChecklistItem, existingCount?: number) => void;
  onInspectPhoto: (photo: CapturedPhoto) => void;
  onOpenReport: () => void;
  onExportZip: () => void;
  onUpdateStageStatus: (stageId: string, newStatus: 'Pending' | 'In Progress' | 'Complete') => void;
  onSelectStage: (stageId: string) => void;
  onDeleteProject: (projectId: string) => void;
}

export const StageChecklistView: React.FC<StageChecklistViewProps> = ({
  project,
  onBackToHome,
  onOpenExplorer,
  onStartCapture,
  onInspectPhoto,
  onOpenReport,
  onExportZip,
  onUpdateStageStatus,
  onSelectStage,
  onDeleteProject,
}) => {
  const [activeTab, setActiveTab] = useState<'checklist' | 'photos'>('checklist');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const currentStage = project.stages.find((s) => s.id === project.currentStageId) || project.stages[0];
  const stagePhotos = project.photos.filter((p) => p.stageId === currentStage.id);
  const overallProgress = calculateProjectProgress(project.stages, project.photos);

  // Stage required photo count
  const stageRequiredItems = currentStage.checklist.filter((c) => c.isRequired);
  const stageCompletedItems = stageRequiredItems.filter((c) => {
    return project.photos.some((p) => p.checklistItemId === c.id) || !!c.capturedPhotoId;
  });
  const stageProgressPct = stageRequiredItems.length === 0
    ? 100
    : Math.round((stageCompletedItems.length / stageRequiredItems.length) * 100);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 pb-24">
      {/* Top Breadcrumb & Project Isolation Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={onBackToHome}
              className="text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Projects</span>
            </button>
            <span className="text-slate-600">/</span>
            <span className="font-mono text-amber-400 font-semibold">
              SNAPs/{project.name}/
            </span>
          </div>

          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
            <span>{project.name}</span>
            <span className="text-xs font-mono font-medium px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/20">
              {project.status}
            </span>
          </h1>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
            <span>{project.assetType}</span>
            {project.workOrderNumber && (
              <>
                <span className="text-slate-700">·</span>
                <span className="font-mono">{project.workOrderNumber}</span>
              </>
            )}
            <span className="text-slate-700">·</span>
            <span>Lead: {project.leadEngineer}</span>
            <span className="text-slate-700">·</span>
            <span>{project.workshopLocation}</span>
          </div>
        </div>

        {/* Global Project Actions */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 shrink-0">
          <button
            onClick={onOpenReport}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors border border-slate-700 min-h-[42px] cursor-pointer"
          >
            <FileText className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">Report Sheet</span>
          </button>

          <button
            onClick={onExportZip}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors border border-slate-700 min-h-[42px] cursor-pointer"
          >
            <Download className="w-4 h-4 text-sky-400" />
            <span className="hidden sm:inline">Download ZIP</span>
          </button>

          {/* Delete Whole Project Button */}
          <button
            onClick={() => setShowDeleteConfirm(true)}
            title="Delete this entire project"
            className="flex items-center justify-center p-2.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 border border-slate-800 hover:border-rose-800/60 rounded-xl transition-colors min-h-[42px] min-w-[42px] cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Repair Stages Horizontal Navigation Strip */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-400 px-1">
          <span className="font-semibold uppercase tracking-wider text-[11px]">
            Repair Stage Workflow
          </span>
          <span className="font-mono">
            Overall: {overallProgress.requiredCompleted}/{overallProgress.requiredTotal} items ({overallProgress.percentage}%)
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {project.stages.map((stage, idx) => {
            const isSelected = stage.id === currentStage.id;
            const stagePhotoCount = project.photos.filter((p) => p.stageId === stage.id).length;
            const reqItems = stage.checklist.filter((c) => c.isRequired);
            const doneReq = reqItems.filter((c) =>
              project.photos.some((p) => p.checklistItemId === c.id) || !!c.capturedPhotoId
            ).length;
            const isStageDone = reqItems.length > 0 && doneReq === reqItems.length;

            return (
              <button
                key={stage.id}
                onClick={() => onSelectStage(stage.id)}
                className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between min-h-[76px] cursor-pointer ${
                  isSelected
                    ? 'bg-slate-800 border-amber-400 ring-1 ring-amber-400/40 shadow-sm'
                    : isStageDone
                    ? 'bg-slate-900/90 border-emerald-500/30 hover:border-emerald-500/60'
                    : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between gap-1 w-full text-[11px] mb-1">
                  <span className="font-mono text-slate-400 font-semibold">{stage.stageCode}</span>
                  {isStageDone ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[3]" />
                  ) : (
                    <span className="text-[10px] text-slate-500 font-mono">
                      {doneReq}/{reqItems.length}
                    </span>
                  )}
                </div>

                <div className="font-semibold text-xs text-white truncate w-full">
                  {stage.title.replace(/^\d+\.\s*/, '')}
                </div>

                <div className="text-[10px] text-slate-400 mt-1 flex items-center justify-between">
                  <span>{stagePhotoCount} photos</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Current Stage Header Details */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-amber-400">
                {currentStage.stageCode} · {currentStage.folderName}/
              </span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight mt-0.5">
              {currentStage.title}
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-3xl">
              {currentStage.description}
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800 self-start sm:self-auto shrink-0">
            <button
              onClick={() => setActiveTab('checklist')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'checklist'
                  ? 'bg-amber-400 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Standard Checklist ({stageCompletedItems.length}/{stageRequiredItems.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('photos')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === 'photos'
                  ? 'bg-amber-400 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Stage Photos ({stagePhotos.length})</span>
            </button>
          </div>
        </div>

        {/* Stage Progress Bar */}
        <div className="space-y-1.5 pt-2 border-t border-slate-800">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">
              Required Photos: <strong className="text-slate-200">{stageCompletedItems.length} of {stageRequiredItems.length} complete</strong>
            </span>
            <span className="font-mono font-bold text-amber-400">
              {stageProgressPct}%
            </span>
          </div>
          <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                stageProgressPct === 100 ? 'bg-emerald-500' : 'bg-amber-400'
              }`}
              style={{ width: `${stageProgressPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Stage Content: Checklist or Photos Tab */}
      {activeTab === 'checklist' ? (
        /* Standardized Checklist Work Instructions */
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span className="font-semibold uppercase tracking-wider text-[11px]">
              Required Photo Work Instruction
            </span>
            <span>Multiple photos can be captured per item</span>
          </div>

          <div className="space-y-3">
            {currentStage.checklist.map((item) => {
              // Find ALL photos attached to this specific work instruction item
              const attachedPhotos = project.photos.filter(
                (p) =>
                  p.checklistItemId === item.id ||
                  (item.capturedPhotoIds && item.capturedPhotoIds.includes(p.id)) ||
                  p.id === item.capturedPhotoId
              );

              return (
                <div
                  key={item.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col gap-3.5 ${
                    attachedPhotos.length > 0
                      ? 'bg-slate-900/90 border-slate-800 hover:border-slate-700'
                      : item.isRequired
                      ? 'bg-slate-900/60 border-amber-500/30 hover:border-amber-500/60'
                      : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-3.5 min-w-0 flex-1">
                      {/* Status check icon */}
                      <div className="mt-0.5 shrink-0">
                        {attachedPhotos.length > 0 ? (
                          <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center">
                            <Check className="w-4 h-4 stroke-[3]" />
                          </div>
                        ) : (
                          <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center border ${
                              item.isRequired
                                ? 'border-amber-400/60 text-amber-400 bg-amber-500/10'
                                : 'border-slate-700 text-slate-500 bg-slate-900'
                            }`}
                          >
                            <Circle className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <h3 className="text-sm font-bold text-white">
                            {item.title}
                          </h3>
                          {item.isRequired ? (
                            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                              Required
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-500">
                              Optional
                            </span>
                          )}
                          {attachedPhotos.length > 0 && (
                            <span className="text-[11px] font-semibold text-emerald-400 font-mono bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                              {attachedPhotos.length} {attachedPhotos.length === 1 ? 'photo' : 'photos'}
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-slate-400 leading-relaxed">
                          {item.description}
                        </p>

                        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500 font-mono">
                          <span>Target: {item.angleOrFeature}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action button: Capture / Add another photo */}
                    <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
                      <button
                        onClick={() => onStartCapture(currentStage, item, attachedPhotos.length)}
                        className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm min-h-[40px] cursor-pointer ${
                          attachedPhotos.length > 0
                            ? 'bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 hover:border-amber-400/50'
                            : item.isRequired
                            ? 'bg-amber-400 hover:bg-amber-300 text-slate-950'
                            : 'bg-slate-800 hover:bg-slate-700 text-white'
                        }`}
                      >
                        {attachedPhotos.length > 0 ? (
                          <>
                            <Plus className="w-4 h-4 stroke-[2.5]" />
                            <span>Add Photo</span>
                          </>
                        ) : (
                          <>
                            <Camera className="w-4 h-4 stroke-[2.5]" />
                            <span>Capture Photo</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Multiple Photos Thumbnail Strip */}
                  {attachedPhotos.length > 0 && (
                    <div className="pt-2 border-t border-slate-800/80">
                      <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2">
                        <span>Captured record ({attachedPhotos.length}):</span>
                        <span className="text-[10px] text-slate-500">Tap thumbnail to inspect & markup</span>
                      </div>
                      <div className="flex items-center gap-3 overflow-x-auto pb-1.5">
                        {attachedPhotos.map((photo, pIdx) => (
                          <div
                            key={photo.id}
                            onClick={() => onInspectPhoto(photo)}
                            className="relative group shrink-0 cursor-pointer rounded-xl overflow-hidden border border-slate-700 hover:border-amber-400 bg-slate-950 transition-all w-24"
                          >
                            <div className="w-24 h-18 bg-black relative">
                              <img
                                src={photo.dataUrl}
                                alt={photo.fileName}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              />
                              <div className="absolute top-1 left-1 px-1.5 py-0.2 rounded bg-slate-950/80 backdrop-blur-sm text-[9px] font-mono font-bold text-amber-400">
                                #{pIdx + 1}
                              </div>
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
                                <Eye className="w-4 h-4" />
                              </div>
                            </div>
                            <div className="p-1 text-[9px] font-mono text-slate-400 truncate text-center bg-slate-900">
                              {photo.conditionRating || 'Verified'}
                            </div>
                          </div>
                        ))}

                        {/* Direct "+ Add" thumbnail trigger button */}
                        <button
                          onClick={() => onStartCapture(currentStage, item, attachedPhotos.length)}
                          className="w-24 h-[92px] rounded-xl border border-dashed border-slate-700 hover:border-amber-400 bg-slate-950/60 hover:bg-slate-900 flex flex-col items-center justify-center text-slate-400 hover:text-amber-300 gap-1 transition-colors shrink-0 cursor-pointer"
                        >
                          <Plus className="w-4 h-4" />
                          <span className="text-[10px] font-semibold">+ Add More</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Stage Photos Gallery */
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span className="font-semibold uppercase tracking-wider text-[11px]">
              Archived Stage Photos ({stagePhotos.length})
            </span>
            <span className="font-mono text-amber-400">
              SNAPs/{project.name}/{currentStage.folderName}/
            </span>
          </div>

          {stagePhotos.length === 0 ? (
            <div className="text-center py-16 bg-slate-900/40 border border-slate-800 rounded-2xl p-8 space-y-3">
              <Camera className="w-10 h-10 text-slate-600 mx-auto" />
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-300">No photos captured for this stage yet</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Switch to the Standard Checklist tab to follow the guided photo protocol, or take a custom photo directly.
                </p>
              </div>
              <button
                onClick={() => onStartCapture(currentStage)}
                className="mt-2 inline-flex items-center gap-2 px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl transition-colors min-h-[44px]"
              >
                <Camera className="w-4 h-4" />
                <span>Capture First Photo</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {stagePhotos.map((photo) => (
                <div
                  key={photo.id}
                  onClick={() => onInspectPhoto(photo)}
                  className="bg-slate-900 border border-slate-800 hover:border-amber-500/50 rounded-2xl overflow-hidden cursor-pointer group transition-all flex flex-col shadow-sm"
                >
                  <div className="relative aspect-4/3 bg-black overflow-hidden">
                    <img
                      src={photo.dataUrl}
                      alt={photo.fileName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />

                    {photo.conditionRating && (
                      <span className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-950/80 backdrop-blur-md text-amber-400 border border-slate-700">
                        {photo.conditionRating}
                      </span>
                    )}

                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white gap-2">
                      <div className="px-3 py-1.5 bg-slate-900/90 rounded-lg text-xs font-semibold flex items-center gap-1.5 border border-slate-700">
                        <Eye className="w-3.5 h-3.5 text-amber-400" />
                        <span>Inspect & Markup</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3.5 space-y-1.5 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-white truncate">
                        {photo.checklistItemTitle || photo.fileName}
                      </h4>
                      <p className="font-mono text-[11px] text-amber-400/90 truncate">
                        {photo.fileName}
                      </p>
                    </div>

                    {photo.notes && (
                      <p className="text-[11px] text-slate-400 italic line-clamp-2">
                        "{photo.notes}"
                      </p>
                    )}

                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500">
                      <span>{photo.capturedBy}</span>
                      <span className="font-mono">{formatDateTimeNice(photo.timestamp)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Delete Project Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm">
          <div 
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-project-title"
            className="bg-slate-900 border border-rose-500/30 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 id="delete-project-title" className="text-base font-bold text-white tracking-tight">
                  Delete Project: {project.name}?
                </h3>
                <p className="text-xs text-slate-400">
                  Folder: <code className="font-mono text-amber-400">SNAPs/{project.name}/</code>
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-rose-950/30 border border-rose-800/40 rounded-xl space-y-1.5 text-xs text-rose-200">
              <p className="font-semibold text-rose-300 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>This action cannot be undone</span>
              </p>
              <p className="text-slate-300">
                Permanently deletes this project, its <strong className="text-white">{project.photos.length} captured repair photos</strong>, and all stage checklists from the SNAPs repository.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors min-h-[42px] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  onDeleteProject(project.id);
                }}
                className="px-4 py-2.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-xl transition-colors min-h-[42px] shadow-sm cursor-pointer"
              >
                Delete Whole Project
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
