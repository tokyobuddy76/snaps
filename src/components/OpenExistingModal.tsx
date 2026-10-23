import React, { useState } from 'react';
import { RepairProject } from '../types';
import { Folder, Search, X, ArrowRight, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { calculateProjectProgress, formatDateTimeNice } from '../utils/naming';

interface OpenExistingModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: RepairProject[];
  onSelectProject: (projectId: string) => void;
}

export const OpenExistingModal: React.FC<OpenExistingModalProps> = ({
  isOpen,
  onClose,
  projects,
  onSelectProject,
}) => {
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'In Progress' | 'Complete' | 'Not Started'>('All');

  if (!isOpen) return null;

  const filtered = projects.filter((p) => {
    const matchesQuery =
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.assetType.toLowerCase().includes(query.toLowerCase()) ||
      (p.workOrderNumber && p.workOrderNumber.toLowerCase().includes(query.toLowerCase()));
    
    if (statusFilter === 'All') return matchesQuery;
    return matchesQuery && p.status === statusFilter;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div 
        role="dialog"
        aria-modal="true"
        aria-labelledby="open-existing-title"
        className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div>
            <h2 id="open-existing-title" className="text-lg font-bold text-white tracking-tight">Open Existing Project</h2>
            <p className="text-xs text-slate-400">Select an active repair project folder to view or capture photos</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="p-4 border-b border-slate-800 bg-slate-950/40 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by project name, asset type, or work order..."
              className="w-full pl-9 pr-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 font-sans"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {(['All', 'In Progress', 'Complete', 'Not Started'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap min-h-[36px] ${
                  statusFilter === st
                    ? 'bg-amber-400 text-slate-950 font-semibold shadow-sm'
                    : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Project List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Folder className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="text-sm font-medium">No matching repair projects found</p>
              <p className="text-xs text-slate-500 mt-1">Try modifying your search or create a new project.</p>
            </div>
          ) : (
            filtered.map((proj) => {
              const prog = calculateProjectProgress(proj.stages, proj.photos);
              const currentStage = proj.stages.find((s) => s.id === proj.currentStageId) || proj.stages[0];

              return (
                <div
                  key={proj.id}
                  onClick={() => {
                    onSelectProject(proj.id);
                    onClose();
                  }}
                  className="p-4 bg-slate-950/70 hover:bg-slate-800/80 border border-slate-800/90 hover:border-amber-500/50 rounded-xl cursor-pointer transition-all flex items-center justify-between gap-4 group"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs text-amber-400 font-semibold truncate">
                        SNAPs/{proj.name}/
                      </span>
                      <span className="text-slate-600">·</span>
                      <span className="text-xs text-slate-300 font-medium truncate">
                        {proj.assetType}
                      </span>
                    </div>

                    <div className="text-xs text-slate-400 flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span>Stage: <strong className="text-slate-200">{currentStage.title}</strong></span>
                      <span className="text-slate-600">·</span>
                      <span>{prog.totalPhotos} photos ({prog.percentage}% required done)</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span
                      className={`text-xs font-medium px-2.5 py-1 rounded-md ${
                        proj.status === 'Complete'
                          ? 'text-emerald-400 bg-emerald-500/10'
                          : proj.status === 'In Progress'
                          ? 'text-amber-400 bg-amber-500/10'
                          : 'text-slate-400 bg-slate-800'
                      }`}
                    >
                      {proj.status}
                    </span>
                    <div className="w-8 h-8 rounded-lg bg-slate-800 group-hover:bg-amber-400 group-hover:text-slate-950 flex items-center justify-center text-slate-300 transition-colors">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/40 flex items-center justify-between text-xs text-slate-400">
          <span>Showing {filtered.length} of {projects.length} projects</span>
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-slate-300 hover:text-white"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
