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
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Brand wordmark & Home trigger */}
        <button
          onClick={onGoHome}
          className="flex items-center gap-3 text-left focus:outline-none group shrink-0 cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors shadow-xs">
            <Camera className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold tracking-tight text-slate-900 group-hover:text-blue-600 transition-colors">
                SNAPs
              </span>
              <span className="text-xs font-mono text-slate-400 hidden sm:inline">
                / root
              </span>
            </div>
            <div className="text-[11px] font-medium text-slate-500 -mt-0.5">
              Repair Photo Management
            </div>
          </div>
        </button>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-600">
          <button
            onClick={onGoHome}
            className="hover:text-blue-600 transition-colors whitespace-nowrap cursor-pointer"
          >
            All Projects ({totalProjectsCount})
          </button>
          <button
            onClick={onOpenExplorer}
            className="flex items-center gap-1.5 hover:text-blue-600 transition-colors whitespace-nowrap cursor-pointer text-slate-600"
          >
            <FolderTree className="w-3.5 h-3.5 text-blue-600" />
            <span>Root Directory (SNAPs/)</span>
          </button>
          <button
            onClick={onOpenQr}
            className="flex items-center gap-1.5 hover:text-blue-600 transition-colors whitespace-nowrap cursor-pointer text-slate-600"
          >
            <QrCode className="w-3.5 h-3.5 text-blue-600" />
            <span>Mobile Connect (QR)</span>
          </button>
        </nav>

        {/* Zone 3: Primary Action & Quick Active Indicator */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <button
            onClick={onOpenQr}
            title="Scan QR to open on phone/iPad"
            className="p-2 rounded-lg text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 min-h-[40px] min-w-[40px] flex items-center justify-center cursor-pointer transition-colors"
          >
            <QrCode className="w-4 h-4 text-blue-600" />
          </button>

          <button
            onClick={onOpenExplorer}
            title="Browse SNAPs/ Folder Directory"
            className="md:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 min-h-[40px] min-w-[40px] flex items-center justify-center cursor-pointer transition-colors"
          >
            <FolderTree className="w-4 h-4 text-blue-600" />
          </button>

          <button
            onClick={onNewProject}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm active:scale-[0.98] transition-colors whitespace-nowrap min-h-[40px] cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span className="hidden xs:inline">+ New Project</span>
            <span className="xs:hidden">New</span>
          </button>
        </div>
      </div>

      {/* Active Project Safety Banner to prevent mixing photos */}
      {activeProjectName && (
        <div className="bg-blue-50/70 border-t border-blue-100 px-4 py-1.5 text-xs text-slate-700 flex items-center justify-between">
          <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
            <div className="flex items-center gap-2 truncate">
              <span className="w-2 h-2 rounded-full bg-blue-600 inline-block animate-pulse"></span>
              <span className="text-slate-500">Target Folder:</span>
              <span className="font-mono font-semibold text-blue-700 truncate">
                SNAPs/{activeProjectName}/
              </span>
            </div>
            <span className="text-[11px] text-slate-500 hidden sm:inline">
              Locked to current rotor to prevent photo mix-up
            </span>
          </div>
        </div>
      )}
    </header>
  );
};
