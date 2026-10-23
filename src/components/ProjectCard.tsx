import React from 'react';
import { RepairProject } from '../types';
import { calculateProjectProgress, formatDateTimeNice } from '../utils/naming';
import { ArrowRight, Camera, CheckCircle2, Clock, AlertCircle, Folder } from 'lucide-react';

interface ProjectCardProps {
  project: RepairProject;
  onOpenProject: (projectId: string) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, onOpenProject }) => {
  const progress = calculateProjectProgress(project.stages, project.photos);
  
  // Find current stage object
  const currentStage = project.stages.find(s => s.id === project.currentStageId) || project.stages[0];

  // Status visual cues (without garish pill cliches)
  const getStatusDisplay = () => {
    switch (project.status) {
      case 'Complete':
        return {
          textColor: 'text-emerald-400',
          dotColor: 'bg-emerald-400',
          label: 'Complete',
          icon: CheckCircle2,
        };
      case 'In Progress':
        return {
          textColor: 'text-amber-400',
          dotColor: 'bg-amber-400',
          label: 'In Progress',
          icon: Clock,
        };
      case 'Not Started':
      default:
        return {
          textColor: 'text-slate-400',
          dotColor: 'bg-slate-500',
          label: 'Not Started',
          icon: AlertCircle,
        };
    }
  };

  const statusInfo = getStatusDisplay();
  const StatusIcon = statusInfo.icon;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all flex flex-col justify-between shadow-sm">
      <div>
        {/* Top line: Logical Folder Path & Status Label */}
        <div className="flex items-center justify-between gap-2 text-xs mb-3">
          <div className="flex items-center gap-1.5 text-slate-400 font-mono truncate">
            <Folder className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span className="truncate">SNAPs/{project.name}/</span>
          </div>

          <div className={`flex items-center gap-1.5 font-medium shrink-0 ${statusInfo.textColor}`}>
            <span className={`w-2 h-2 rounded-full ${statusInfo.dotColor}`} />
            <span>{statusInfo.label}</span>
          </div>
        </div>

        {/* Project Title */}
        <h3 className="text-lg font-bold text-white tracking-tight mb-1 truncate">
          {project.name}
        </h3>

        {/* Equipment & Spec unboxed metadata */}
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-400 mb-4">
          <span>{project.assetType}</span>
          {project.workOrderNumber && (
            <>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span className="font-mono">{project.workOrderNumber}</span>
            </>
          )}
          {project.workshopLocation && (
            <>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span className="truncate">{project.workshopLocation}</span>
            </>
          )}
        </div>

        {/* Stage & Photo Completion Progress Section */}
        <div className="bg-slate-950/60 rounded-xl p-3.5 border border-slate-800/80 mb-4 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Current repair stage</span>
            <span className="font-semibold text-slate-200 truncate max-w-[60%] text-right">
              {currentStage?.title || '01. Incoming Inspection'}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Required photo progress</span>
            <span className="font-mono text-slate-200">
              {progress.requiredCompleted} / {progress.requiredTotal} required
            </span>
          </div>

          {/* Progress Bar & Percentage */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Photos captured</span>
              <span className="font-mono font-bold text-amber-400">
                {progress.percentage}% <span className="font-normal text-slate-400">({progress.totalPhotos} total)</span>
              </span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  progress.percentage === 100
                    ? 'bg-emerald-500'
                    : progress.percentage > 40
                    ? 'bg-amber-400'
                    : 'bg-amber-500/70'
                }`}
                style={{ width: `${progress.percentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Footer: Last updated & Open Project button */}
      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-3">
        <div className="text-[11px] text-slate-500 truncate">
          <span>Updated </span>
          <span className="text-slate-400">{formatDateTimeNice(project.updatedAt)}</span>
        </div>

        <button
          onClick={() => onOpenProject(project.id)}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-900 bg-slate-100 hover:bg-white rounded-lg transition-colors whitespace-nowrap min-h-[42px] cursor-pointer shadow-sm active:scale-[0.98]"
        >
          <span>Open Project</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
