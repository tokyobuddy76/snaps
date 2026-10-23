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
  Plus,
  BarChart3,
  X,
  PlusCircle,
  HelpCircle
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
  onAddCustomStep?: (
    stageId: string,
    stepData: {
      title: string;
      description?: string;
      angleOrFeature?: string;
      isRequired?: boolean;
    }
  ) => void;
  onDeleteCustomStep?: (stageId: string, stepId: string) => void;
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
  onAddCustomStep,
  onDeleteCustomStep,
}) => {
  const [activeTab, setActiveTab] = useState<'checklist' | 'photos'>('checklist');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Custom step state
  const [isAddStepModalOpen, setIsAddStepModalOpen] = useState(false);
  const [customStepTitle, setCustomStepTitle] = useState('');
  const [customStepDescription, setCustomStepDescription] = useState('');
  const [customStepAngle, setCustomStepAngle] = useState('');
  const [customStepError, setCustomStepError] = useState<string | null>(null);
  const [stepToDelete, setStepToDelete] = useState<{
    stageId: string;
    stepId: string;
    title: string;
    photoCount: number;
  } | null>(null);

  const currentStage = project.stages.find((s) => s.id === project.currentStageId) || project.stages[0];
  const stagePhotos = project.photos.filter((p) => p.stageId === currentStage.id);

  // Handle adding custom required step
  const handleAddStepSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customStepTitle.trim()) {
      setCustomStepError('Step Name / Photo Required is mandatory.');
      return;
    }

    if (onAddCustomStep) {
      onAddCustomStep(currentStage.id, {
        title: customStepTitle.trim(),
        description: customStepDescription.trim() || `Custom required photo work instruction for ${currentStage.stageCode}.`,
        angleOrFeature: customStepAngle.trim() || 'Custom Angle / Detail',
        isRequired: true, // Always treated as a mandatory required workflow item
      });
    }

    setCustomStepTitle('');
    setCustomStepDescription('');
    setCustomStepAngle('');
    setCustomStepError(null);
    setIsAddStepModalOpen(false);
  };

  // Handle deleting custom step
  const handleConfirmDeleteStep = () => {
    if (!stepToDelete || !onDeleteCustomStep) return;
    onDeleteCustomStep(stepToDelete.stageId, stepToDelete.stepId);
    setStepToDelete(null);
  };

  // PROJECT PROGRESS TRACKING CALCULATION
  // Calculate completion percentage for each stage (STG01 to STG06)
  // Stage Completion % = (Completed Items ÷ Total Required Items in Stage) × 100
  let totalRequiredAcrossAll = 0;
  let totalCompletedAcrossAll = 0;

  const stageProgressList = project.stages.map((stage) => {
    const requiredItems = stage.checklist.filter((c) => c.isRequired);
    const completedRequiredItems = requiredItems.filter((c) => {
      return (
        project.photos.some((p) => p.checklistItemId === c.id) ||
        (c.capturedPhotoIds && c.capturedPhotoIds.length > 0) ||
        !!c.capturedPhotoId
      );
    });

    totalRequiredAcrossAll += requiredItems.length;
    totalCompletedAcrossAll += completedRequiredItems.length;

    // Stage Completion % = (Completed Items ÷ Total Required Items in Stage) × 100
    const stageCompletionPct = requiredItems.length === 0
      ? 100
      : Math.round((completedRequiredItems.length / requiredItems.length) * 100);

    const isStageDone = requiredItems.length > 0 && completedRequiredItems.length === requiredItems.length;

    return {
      stage,
      requiredCount: requiredItems.length,
      completedCount: completedRequiredItems.length,
      stageCompletionPct,
      isStageDone,
    };
  });

  // Overall Project Completion % = (Total Completed Items across STG01–STG06 ÷ Total Required Items across STG01–STG06) × 100
  // Note: Do not simply add the six stage percentages together.
  const overallProjectCompletionPct = totalRequiredAcrossAll === 0
    ? 0
    : Math.round((totalCompletedAcrossAll / totalRequiredAcrossAll) * 100);

  // Active current stage stats
  const currentStageStats = stageProgressList.find((s) => s.stage.id === currentStage.id) || {
    requiredCount: 0,
    completedCount: 0,
    stageCompletionPct: 0,
  };
  const stageRequiredItems = currentStage.checklist.filter((c) => c.isRequired);
  const stageCompletedItems = stageRequiredItems.filter((c) => {
    return (
      project.photos.some((p) => p.checklistItemId === c.id) ||
      (c.capturedPhotoIds && c.capturedPhotoIds.length > 0) ||
      !!c.capturedPhotoId
    );
  });
  const stageProgressPct = currentStageStats.stageCompletionPct;

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

      {/* ======================================================== */}
      {/* PROJECT PROGRESS TRACKING (STG01 - STG06 & Overall)      */}
      {/* ======================================================== */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-5 shadow-sm">
        {/* Overall Project Completion Header Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800/90">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <BarChart3 className="w-3.5 h-3.5" />
              </div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-white">
                Project Progress Tracking
              </h2>
              <span className="text-slate-600">·</span>
              <span className="text-xs font-mono text-amber-400 font-semibold">
                STG01 — STG06
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Completion percentage across all standardized repair workflow stages
            </p>
          </div>

          {/* Overall Project Completion Gauge Box */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 min-w-[320px] max-w-md w-full lg:w-auto space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300">Overall Project Completion</span>
              <span className="font-mono font-black text-base text-amber-400">
                {overallProjectCompletionPct}%
              </span>
            </div>

            {/* Overall Progress Bar */}
            <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  overallProjectCompletionPct === 100
                    ? 'bg-emerald-500'
                    : overallProjectCompletionPct > 35
                    ? 'bg-amber-400'
                    : 'bg-amber-500/80'
                }`}
                style={{ width: `${overallProjectCompletionPct}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono pt-0.5">
              <span>{totalCompletedAcrossAll} of {totalRequiredAcrossAll} required items</span>
              <span className="text-slate-400">
                {overallProjectCompletionPct === 100 ? 'COMPLETE' : 'IN PROGRESS'}
              </span>
            </div>
          </div>
        </div>

        {/* Six Workflow Stages (STG01 to STG06) Grid with individual completion % & progress bars */}
        <div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-semibold uppercase tracking-wider mb-2.5 px-0.5">
            <span>Workflow Stages Completion % (STG01 — STG06)</span>
            <span className="text-[10px] text-slate-500 lowercase font-normal">tap any stage to switch view</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            {stageProgressList.map(({ stage, requiredCount, completedCount, stageCompletionPct, isStageDone }) => {
              const isSelected = stage.id === currentStage.id;
              const stagePhotoCount = project.photos.filter((p) => p.stageId === stage.id).length;

              return (
                <button
                  key={stage.id}
                  type="button"
                  onClick={() => onSelectStage(stage.id)}
                  className={`p-3.5 rounded-xl border text-left transition-all flex flex-col justify-between min-h-[120px] cursor-pointer group ${
                    isSelected
                      ? 'bg-slate-800 border-amber-400 ring-2 ring-amber-400/30 shadow-md'
                      : isStageDone
                      ? 'bg-slate-950/90 border-emerald-500/40 hover:border-emerald-500/80'
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {/* Top: Stage Code & Status Badge */}
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="font-mono text-xs font-bold text-amber-400">
                        {stage.stageCode}
                      </span>
                      {isStageDone ? (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                          <Check className="w-3 h-3 stroke-[3]" />
                          <span>100%</span>
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono text-slate-400">
                          {completedCount}/{requiredCount}
                        </span>
                      )}
                    </div>

                    <div className="font-semibold text-xs text-white truncate mb-2">
                      {stage.title.replace(/^\d+\.\s*/, '')}
                    </div>
                  </div>

                  {/* Bottom: Stage Completion % & Individual Progress Bar */}
                  <div className="space-y-1.5 pt-1.5 border-t border-slate-800/80 w-full">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[10px] text-slate-400">Stage Progress</span>
                      <span
                        className={`font-mono font-bold text-xs ${
                          stageCompletionPct === 100
                            ? 'text-emerald-400'
                            : stageCompletionPct > 0
                            ? 'text-amber-400'
                            : 'text-slate-500'
                        }`}
                      >
                        {stageCompletionPct}%
                      </span>
                    </div>

                    {/* Stage Progress Bar */}
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          stageCompletionPct === 100
                            ? 'bg-emerald-500'
                            : stageCompletionPct > 0
                            ? 'bg-amber-400'
                            : 'bg-slate-700'
                        }`}
                        style={{ width: `${stageCompletionPct}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono pt-0.5">
                      <span>{completedCount}/{requiredCount} req</span>
                      <span>{stagePhotoCount} {stagePhotoCount === 1 ? 'photo' : 'photos'}</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
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
        <div className="space-y-4">
          {/* Section Header with + Add Custom Step Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold uppercase tracking-wider text-xs text-white">
                  Required Photo Work Instruction
                </span>
                <span className="text-slate-600">·</span>
                <span className="text-xs font-mono font-bold text-amber-400">
                  {stageCompletedItems.length} of {stageRequiredItems.length} Required Complete ({stageProgressPct}%)
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Standard ISO protocol & engineer custom required photo instructions for {currentStage.stageCode}
              </p>
            </div>

            {/* Prominent + Add Custom Step Action */}
            <button
              type="button"
              onClick={() => {
                setCustomStepError(null);
                setIsAddStepModalOpen(true);
              }}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 transition-all cursor-pointer shadow-md shadow-amber-500/10 active:scale-[0.98] min-h-[42px] shrink-0"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>+ Add Custom Step</span>
            </button>
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

                          {/* Predefined or Custom Step Badge */}
                          {item.isCustom ? (
                            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-purple-300 bg-purple-500/10 border border-purple-500/30 px-2 py-0.5 rounded-md">
                              Custom Step
                            </span>
                          ) : null}

                          {item.isRequired ? (
                            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
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

                    {/* Action buttons: Capture / Add photo & Delete custom step */}
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

                      {/* If this is a user-added custom step, provide option to delete */}
                      {item.isCustom && (
                        <button
                          type="button"
                          onClick={() => {
                            setStepToDelete({
                              stageId: currentStage.id,
                              stepId: item.id,
                              title: item.title,
                              photoCount: attachedPhotos.length,
                            });
                          }}
                          title="Delete this custom step"
                          className="flex items-center justify-center p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 border border-slate-800 hover:border-rose-800/60 rounded-xl transition-colors min-h-[40px] min-w-[40px] cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
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

            {/* Bottom Clear Button: + Add Custom Step to current stage */}
            <button
              type="button"
              onClick={() => {
                setCustomStepError(null);
                setIsAddStepModalOpen(true);
              }}
              className="w-full py-4 px-4 rounded-2xl border-2 border-dashed border-slate-800 hover:border-amber-400/80 bg-slate-900/40 hover:bg-slate-900 text-slate-300 hover:text-amber-300 transition-all flex items-center justify-center gap-2.5 text-xs font-bold cursor-pointer min-h-[50px] group shadow-sm"
            >
              <div className="w-5 h-5 rounded-md bg-amber-500/10 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Plus className="w-3.5 h-3.5 stroke-[3]" />
              </div>
              <span>+ Add Custom Step to {currentStage.stageCode}</span>
            </button>
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

      {/* Add Custom Step Modal Dialog */}
      {isAddStepModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm overflow-y-auto">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-custom-step-title"
            className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150 my-8"
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                  <PlusCircle className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div>
                  <h3 id="add-custom-step-title" className="text-base font-bold text-white tracking-tight">
                    Add Custom Photo Work Instruction
                  </h3>
                  <p className="text-xs font-mono text-amber-400 font-medium">
                    {currentStage.stageCode} · {currentStage.title}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsAddStepModalOpen(false);
                  setCustomStepError(null);
                }}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Impact Calculation Preview Box */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-2 text-xs">
              <div className="flex items-center gap-1.5 font-semibold text-amber-400">
                <BarChart3 className="w-4 h-4 shrink-0" />
                <span>Completion Percentage Impact</span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                This custom step will be treated as a <strong className="text-white">mandatory required workflow item</strong>.
              </p>
              <div className="flex items-center justify-between text-[11px] font-mono bg-slate-900/90 border border-slate-800 rounded-lg px-3 py-2 text-slate-300">
                <span>{currentStage.stageCode} Required Steps:</span>
                <span className="text-amber-400 font-bold">
                  {stageRequiredItems.length} → {stageRequiredItems.length + 1} steps
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Both <strong className="text-slate-300">{currentStage.stageCode} Stage Completion %</strong> and <strong className="text-slate-300">Overall Project Completion %</strong> will immediately adjust upon adding this step.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleAddStepSubmit} className="space-y-4">
              {/* Step Name / Title (Mandatory) */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-200 flex items-center justify-between">
                  <span>Step Name / Photo Required <span className="text-amber-400">*</span></span>
                  <span className="text-[10px] text-slate-500 font-normal">Mandatory</span>
                </label>
                <input
                  type="text"
                  autoFocus
                  value={customStepTitle}
                  onChange={(e) => {
                    setCustomStepTitle(e.target.value);
                    if (customStepError) setCustomStepError(null);
                  }}
                  placeholder="e.g. Bearing Oil Sump Magnetic Plug Inspection"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
                />
              </div>

              {/* Target Angle or Feature (Optional) */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-200 flex items-center justify-between">
                  <span>Target Angle / Inspection Feature</span>
                  <span className="text-[10px] text-slate-500 font-normal">Optional</span>
                </label>
                <input
                  type="text"
                  value={customStepAngle}
                  onChange={(e) => setCustomStepAngle(e.target.value)}
                  placeholder="e.g. Close-up 45° angle, Housing underside, Cleaned seal gap"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors"
                />
              </div>

              {/* Guidance Description (Optional) */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-200 flex items-center justify-between">
                  <span>Work Instruction Guidance & Notes</span>
                  <span className="text-[10px] text-slate-500 font-normal">Optional</span>
                </label>
                <textarea
                  rows={2}
                  value={customStepDescription}
                  onChange={(e) => setCustomStepDescription(e.target.value)}
                  placeholder="e.g. Check for magnetic debris, fretting wear, or surface scoring before reassembly."
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors resize-none"
                />
              </div>

              {/* Treat as Required Workflow Item Checkbox indicator */}
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs">
                <Check className="w-4 h-4 text-amber-400 shrink-0 mt-0.5 stroke-[3]" />
                <div className="text-slate-300">
                  <strong className="text-amber-300 font-semibold block">Treated as a Required Workflow Item</strong>
                  <span>Engineers must complete the photo for this step to achieve 100% stage completion.</span>
                </div>
              </div>

              {customStepError && (
                <div className="p-3 bg-rose-950/40 border border-rose-800/50 rounded-xl text-xs text-rose-300 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{customStepError}</span>
                </div>
              )}

              {/* Modal Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddStepModalOpen(false);
                    setCustomStepError(null);
                  }}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors min-h-[42px] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-xl transition-all min-h-[42px] shadow-md shadow-amber-500/20 cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>+ Add Required Step</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Custom Step Confirmation Dialog */}
      {stepToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-step-title"
            className="bg-slate-900 border border-rose-500/30 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 id="delete-step-title" className="text-base font-bold text-white tracking-tight">
                  Delete Custom Step?
                </h3>
                <p className="text-xs text-slate-400 truncate max-w-[280px]">
                  {currentStage.stageCode} · <span className="text-amber-400 font-semibold">{stepToDelete.title}</span>
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-rose-950/30 border border-rose-800/40 rounded-xl space-y-2 text-xs text-rose-200">
              <p className="text-slate-300">
                This custom step will be removed from <strong className="text-white">{currentStage.stageCode}</strong>.
              </p>
              <div className="bg-slate-900/80 p-2.5 rounded-lg border border-rose-900/50 space-y-1 font-mono text-[11px] text-slate-300">
                <div className="text-amber-300 font-bold">Automatic Recalculation:</div>
                <div>Stage Completion % and Overall Project Completion % will automatically and immediately recalculate.</div>
              </div>
              {stepToDelete.photoCount > 0 && (
                <p className="text-amber-300/90 text-[11px]">
                  Notice: {stepToDelete.photoCount} photo(s) captured for this step will remain safely in the stage photo album, but will no longer count toward required workflow completion.
                </p>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStepToDelete(null)}
                className="px-4 py-2.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors min-h-[42px] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteStep}
                className="px-4 py-2.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-xl transition-colors min-h-[42px] shadow-sm cursor-pointer"
              >
                Delete Step & Recalculate %
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
