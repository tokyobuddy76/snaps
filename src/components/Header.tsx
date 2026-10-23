import React from 'react';
import { Camera, FolderTree, Plus, Sparkles, HardDrive, QrCode } from 'lucide-react';

interface HeaderProps {
  onNewProject: () => void;
  onOpenExplorer: () => void;
  onOpenQr: () => void;
  onGoHome: () => void;
  activeProjectName?: string;
  totalProjectsCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  onNewProject,
  onOpenExplorer,
  onOpenQr,
  onGoHome,
  activeProjectName,
  totalProjectsCount,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Brand wordmark & Home trigger */}
        <button
          onClick={onGoHome}
          className="flex items-center gap-3 text-left focus:outline-none group shrink-0"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:bg-amber-500 group-hover:text-slate-950 transition-colors">
            <Camera className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold tracking-tight text-white group-hover:text-amber-400 transition-colors">
                SNAPs
              </span>
              <span className="text-xs font-mono text-slate-400 hidden sm:inline">
                / root
              </span>
            </div>
            <div className="text-[11px] font-medium text-slate-400 -mt-0.5">
              Repair Photo Management
            </div>
          </div>
        </button>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-300">
          <button
            onClick={onGoHome}
            className="hover:text-white transition-colors whitespace-nowrap cursor-pointer"
          >
            All Projects ({totalProjectsCount})
          </button>
          <button
            onClick={onOpenExplorer}
            className="flex items-center gap-1.5 hover:text-white transition-colors whitespace-nowrap cursor-pointer text-slate-300 hover:text-amber-300"
          >
            <FolderTree className="w-3.5 h-3.5 text-amber-400" />
            <span>Root Directory (SNAPs/)</span>
          </button>
          <button
            onClick={onOpenQr}
            className="flex items-center gap-1.5 hover:text-white transition-colors whitespace-nowrap cursor-pointer text-slate-300 hover:text-amber-300"
          >
            <QrCode className="w-3.5 h-3.5 text-sky-400" />
            <span>Mobile Connect (QR)</span>
          </button>
        </nav>

        {/* Zone 3: Primary Action & Quick Active Indicator */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            onClick={onOpenQr}
            title="Scan QR to open on phone/iPad"
            className="p-2 rounded-lg text-slate-300 hover:text-white bg-slate-900 border border-slate-800 min-h-[40px] min-w-[40px] flex items-center justify-center cursor-pointer"
          >
            <QrCode className="w-4 h-4 text-sky-400" />
          </button>

          <button
            onClick={onOpenExplorer}
            title="Browse SNAPs/ Folder Directory"
            className="md:hidden p-2 rounded-lg text-slate-300 hover:text-white bg-slate-900 border border-slate-800 min-h-[40px] min-w-[40px] flex items-center justify-center cursor-pointer"
          >
            <FolderTree className="w-4 h-4 text-amber-400" />
          </button>

          <button
            onClick={onNewProject}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-sm transition-colors whitespace-nowrap min-h-[40px] cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span className="hidden xs:inline">+ New Project</span>
            <span className="xs:hidden">New</span>
          </button>
        </div>
      </div>

      {/* Active Project Safety Banner to prevent mixing photos */}
      {activeProjectName && (
        <div className="bg-amber-500/10 border-t border-amber-500/20 px-4 py-1.5 text-xs text-amber-300 flex items-center justify-between">
          <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
            <div className="flex items-center gap-2 truncate">
              <span className="w-2 h-2 rounded-full bg-amber-400 inline-block animate-pulse"></span>
              <span className="text-slate-400">Target Folder:</span>
              <span className="font-mono font-semibold text-amber-300 truncate">
                SNAPs/{activeProjectName}/
              </span>
            </div>
            <span className="text-[11px] text-slate-400 hidden sm:inline">
              Locked to current rotor to prevent photo mix-up
            </span>
          </div>
        </div>
      )}
    </header>
  );
};
