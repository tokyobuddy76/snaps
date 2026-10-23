import React, { useState } from 'react';
import { RepairProject } from '../types';
import { calculateProjectProgress, formatDateTimeNice } from '../utils/naming';
import { ArrowRight, Camera, CheckCircle2, Clock, AlertCircle, Folder, Trash2 } from 'lucide-react';

interface ProjectCardProps {
  project: RepairProject;
  onOpenProject: (projectId: string) => void;
  onDeleteProject?: (projectId: string) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, onOpenProject, onDeleteProject }) => {
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const progress = calculateProjectProgress(project.stages, project.photos);
  
  // Find current stage object
  const currentStage = project.stages.find(s => s.id === project.currentStageId) || project.stages[0];

  // Status visual cues (without garish pill cliches)
  const getStatusDisplay = () => {
    switch (project.status) {
      case 'Complete':
        return {
          textColor: 'text-emerald-700',
          dotColor: 'bg-emerald-600',
          label: 'Complete',
          icon: CheckCircle2,
        };
      case 'In Progress':
        return {
          textColor: 'text-amber-700',
          dotColor: 'bg-amber-500',
          label: 'In Progress',
          icon: Clock,
        };
      case 'Not Started':
      default:
        return {
          textColor: 'text-slate-600',
          dotColor: 'bg-slate-400',
          label: 'Not Started',
          icon: AlertCircle,
        };
    }
  };

  const statusInfo = getStatusDisplay();
  const StatusIcon = statusInfo.icon;

  return (
    <div className="bg-white border border-slate-200 hover:border-slate-300 rounded-xl p-5 shadow-xs transition-all flex flex-col justify-between">
      <div>
        {/* Top line: Logical Folder Path & Status Label */}
        <div className="flex items-center justify-between gap-2 text-xs mb-3">
          <div className="flex items-center gap-1.5 text-slate-600 font-mono truncate">
            <Folder className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span className="truncate">SNAPs/{project.name}/</span>
          </div>

          <div className={`flex items-center gap-1.5 font-medium shrink-0 ${statusInfo.textColor}`}>
            <span className={`w-2 h-2 rounded-full ${statusInfo.dotColor}`} />
            <span>{statusInfo.label}</span>
          </div>
        </div>

        {/* Project Title */}
        <h3 className="text-lg font-bold text-slate-900 tracking-tight mb-1 truncate">
          {project.name}
        </h3>

        {/* Equipment & Spec unboxed metadata */}
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-600 mb-4">
          <span>{project.assetType}</span>
          {project.workOrderNumber && (
            <>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span className="font-mono text-slate-700">{project.workOrderNumber}</span>
            </>
          )}
          {project.workshopLocation && (
            <>
              <span aria-hidden="true" className="text-slate-300">·</span>
              <span className="truncate">{project.workshopLocation}</span>
            </>
          )}
        </div>

        {/* Stage & Photo Completion Progress Section */}
        <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 mb-4 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-600">Current repair stage</span>
            <span className="font-semibold text-slate-900 truncate max-w-[60%] text-right">
              {currentStage?.title || '01. Incoming Inspection'}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-600">Required photo progress</span>
            <span className="font-mono font-medium text-slate-900">
              {progress.requiredCompleted} / {progress.requiredTotal} required
            </span>
          </div>

          {/* Progress Bar & Percentage */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-600">Photos captured</span>
              <span className="font-mono font-bold text-slate-900">
                {progress.percentage}% <span className="font-normal text-slate-500">({progress.totalPhotos} total)</span>
              </span>
            </div>
            <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  progress.percentage === 100
                    ? 'bg-emerald-600'
                    : progress.percentage > 40
                    ? 'bg-blue-600'
                    : 'bg-amber-500'
                }`}
                style={{ width: `${progress.percentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Footer: Last updated & Actions */}
      <div className="pt-3 border-t border-slate-200">
        {isConfirmingDelete ? (
          <div className="flex items-center justify-between gap-2 p-2 bg-rose-50 border border-rose-200 rounded-lg animate-in fade-in">
            <span className="text-xs font-semibold text-rose-800 pl-1">
              Delete project?
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setIsConfirmingDelete(false)}
                className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-md min-h-[34px] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsConfirmingDelete(false);
                  if (onDeleteProject) onDeleteProject(project.id);
                }}
                className="px-2.5 py-1 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-md min-h-[34px] cursor-pointer"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-3">
            <div className="text-[11px] text-slate-500 truncate">
              <span>Updated </span>
              <span className="text-slate-700 font-medium">{formatDateTimeNice(project.updatedAt)}</span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {onDeleteProject && (
                <button
                  type="button"
                  onClick={() => setIsConfirmingDelete(true)}
                  title="Delete this project"
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg border border-transparent hover:border-rose-200 transition-colors min-h-[42px] min-w-[42px] flex items-center justify-center cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}

              <button
                type="button"
                onClick={() => onOpenProject(project.id)}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors whitespace-nowrap min-h-[42px] cursor-pointer shadow-xs active:scale-[0.98]"
              >
                <span>Open Project</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
