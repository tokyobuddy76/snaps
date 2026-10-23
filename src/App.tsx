/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { RepairProject, RepairStage, PhotoChecklistItem, CapturedPhoto, AssetType } from './types';
import { 
  getAllProjectsFromStorage, 
  saveProjectToStorage, 
  deleteProjectFromStorage, 
  clearAllProjectsFromStorage 
} from './utils/storage';
import { getSeedProjects } from './data/seedData';
import { createDefaultRepairStages } from './data/standardChecklists';
import { exportProjectZip, exportAllProjectsZip } from './utils/exportZip';
import { Header } from './components/Header';
import { ProjectCard } from './components/ProjectCard';
import { NewProjectModal } from './components/NewProjectModal';
import { OpenExistingModal } from './components/OpenExistingModal';
import { CameraCaptureModal } from './components/CameraCaptureModal';
import { PhotoInspectorModal } from './components/PhotoInspectorModal';
import { FolderExplorerModal } from './components/FolderExplorerModal';
import { RepairReportModal } from './components/RepairReportModal';
import { StageChecklistView } from './components/StageChecklistView';
import { QrModal } from './components/QrModal';
import { 
  Plus, 
  FolderOpen, 
  FolderTree, 
  Search, 
  Camera, 
  HardDrive, 
  Download, 
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';

export default function App() {
  const [projects, setProjects] = useState<RepairProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);

  // Modals state
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [isOpenExistingModalOpen, setIsOpenExistingModalOpen] = useState(false);
  const [isExplorerModalOpen, setIsExplorerModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);

  // Camera capture modal state
  const [captureSession, setCaptureSession] = useState<{
    stage: RepairStage;
    item?: PhotoChecklistItem;
    existingCount?: number;
  } | null>(null);

  // Inspector modal state
  const [inspectedPhoto, setInspectedPhoto] = useState<CapturedPhoto | null>(null);

  // Home search and filter
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'In Progress' | 'Complete' | 'Not Started'>('All');

  // Load from IndexedDB or seed initial data
  useEffect(() => {
    async function loadData() {
      try {
        const stored = await getAllProjectsFromStorage();
        if (stored && stored.length > 0) {
          setProjects(stored);
        } else {
          const seeds = getSeedProjects();
          for (const s of seeds) {
            await saveProjectToStorage(s);
          }
          setProjects(seeds);
        }
      } catch (err) {
        console.error('Failed to load projects from storage:', err);
        setProjects(getSeedProjects());
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const activeProject = projects.find((p) => p.id === activeProjectId);

  // Save changes to project
  const handleUpdateProject = async (updated: RepairProject) => {
    const nextList = projects.map((p) => (p.id === updated.id ? updated : p));
    setProjects(nextList);
    await saveProjectToStorage(updated);
  };

  // Create New Project (Sub-goal 3)
  const handleCreateProject = async (data: {
    name: string;
    assetType: AssetType;
    workOrderNumber?: string;
    serialNumber?: string;
    leadEngineer: string;
    workshopLocation: string;
  }) => {
    const newStages = createDefaultRepairStages();
    const newProj: RepairProject = {
      id: `proj-${Date.now()}`,
      name: data.name,
      folderPath: `SNAPs/${data.name}`,
      assetType: data.assetType,
      workOrderNumber: data.workOrderNumber,
      serialNumber: data.serialNumber || `SN-${Math.floor(10000 + Math.random() * 90000)}`,
      leadEngineer: data.leadEngineer,
      workshopLocation: data.workshopLocation,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      currentStageId: newStages[0].id,
      status: 'In Progress',
      stages: newStages,
      photos: [],
    };

    const nextList = [newProj, ...projects];
    setProjects(nextList);
    await saveProjectToStorage(newProj);
    setActiveProjectId(newProj.id);
  };

  // Delete an entire project and its photos
  const handleDeleteProject = async (projectId: string) => {
    await deleteProjectFromStorage(projectId);
    setProjects((prev) => prev.filter((p) => p.id !== projectId));
    if (activeProjectId === projectId) {
      setActiveProjectId(null);
    }
  };

  // Handle Photo Captured via Camera
  const handlePhotoCaptured = async (photoData: {
    dataUrl: string;
    fileName: string;
    logicalPath: string;
    checklistItemId?: string;
    checklistItemTitle?: string;
    notes?: string;
    conditionRating: 'Acceptable' | 'Minor Defect' | 'Critical Damage' | 'Information';
    fileSizeBytes: number;
  }) => {
    if (!activeProject || !captureSession) return;

    const newPhoto: CapturedPhoto = {
      id: `ph-${Date.now()}`,
      projectId: activeProject.id,
      projectName: activeProject.name,
      stageId: captureSession.stage.id,
      stageName: captureSession.stage.title,
      stageCode: captureSession.stage.stageCode,
      checklistItemId: photoData.checklistItemId,
      checklistItemTitle: photoData.checklistItemTitle,
      fileName: photoData.fileName,
      logicalPath: photoData.logicalPath,
      dataUrl: photoData.dataUrl,
      timestamp: new Date().toISOString(),
      capturedBy: activeProject.leadEngineer,
      notes: photoData.notes,
      conditionRating: photoData.conditionRating,
      fileSizeBytes: photoData.fileSizeBytes,
    };

    // Update stages checklist item reference - supports multiple photos
    const updatedStages = activeProject.stages.map((stg) => {
      if (stg.id === captureSession.stage.id) {
        return {
          ...stg,
          checklist: stg.checklist.map((chk) => {
            if (chk.id === photoData.checklistItemId) {
              const currentIds = chk.capturedPhotoIds || (chk.capturedPhotoId ? [chk.capturedPhotoId] : []);
              return {
                ...chk,
                capturedPhotoId: newPhoto.id, // latest photo
                capturedPhotoIds: [...currentIds, newPhoto.id], // append to multiple photos list
              };
            }
            return chk;
          }),
        };
      }
      return stg;
    });

    const updatedProject: RepairProject = {
      ...activeProject,
      updatedAt: new Date().toISOString(),
      photos: [newPhoto, ...activeProject.photos],
      stages: updatedStages,
    };

    await handleUpdateProject(updatedProject);
    setCaptureSession(null);
  };

  // Update Photo metadata or annotations
  const handleUpdatePhoto = async (updatedPhoto: CapturedPhoto) => {
    if (!activeProject) return;
    const updatedPhotos = activeProject.photos.map((p) =>
      p.id === updatedPhoto.id ? updatedPhoto : p
    );
    const updatedProject: RepairProject = {
      ...activeProject,
      updatedAt: new Date().toISOString(),
      photos: updatedPhotos,
    };
    await handleUpdateProject(updatedProject);
    setInspectedPhoto(updatedPhoto);
  };

  // Delete photo
  const handleDeletePhoto = async (photoId: string) => {
    if (!activeProject) return;
    const updatedPhotos = activeProject.photos.filter((p) => p.id !== photoId);
    const updatedStages = activeProject.stages.map((stg) => ({
      ...stg,
      checklist: stg.checklist.map((chk) => {
        const nextIds = chk.capturedPhotoIds ? chk.capturedPhotoIds.filter((id) => id !== photoId) : undefined;
        return {
          ...chk,
          capturedPhotoId: chk.capturedPhotoId === photoId ? (nextIds && nextIds.length > 0 ? nextIds[nextIds.length - 1] : undefined) : chk.capturedPhotoId,
          capturedPhotoIds: nextIds,
        };
      }),
    }));

    const updatedProject: RepairProject = {
      ...activeProject,
      updatedAt: new Date().toISOString(),
      photos: updatedPhotos,
      stages: updatedStages,
    };
    await handleUpdateProject(updatedProject);
    setInspectedPhoto(null);
  };

  // Stage selection inside project
  const handleSelectStage = (stageId: string) => {
    if (!activeProject) return;
    const updatedProject: RepairProject = {
      ...activeProject,
      currentStageId: stageId,
    };
    handleUpdateProject(updatedProject);
  };

  // Update stage status
  const handleUpdateStageStatus = (stageId: string, newStatus: 'Pending' | 'In Progress' | 'Complete') => {
    if (!activeProject) return;
    const updatedStages = activeProject.stages.map((s) =>
      s.id === stageId ? { ...s, status: newStatus } : s
    );
    handleUpdateProject({
      ...activeProject,
      stages: updatedStages,
      updatedAt: new Date().toISOString(),
    });
  };

  // Filter projects on home screen
  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.assetType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.workOrderNumber && p.workOrderNumber.toLowerCase().includes(searchQuery.toLowerCase()));

    if (statusFilter === 'All') return matchesSearch;
    return matchesSearch && p.status === statusFilter;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Bar adhering to Top Bar Contract */}
      <Header
        onNewProject={() => setIsNewProjectModalOpen(true)}
        onOpenExplorer={() => setIsExplorerModalOpen(true)}
        onOpenQr={() => setIsQrModalOpen(true)}
        onGoHome={() => setActiveProjectId(null)}
        activeProjectName={activeProject?.name}
        totalProjectsCount={projects.length}
      />

      {/* Main View Area */}
      <main className="flex-1">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-400 space-y-3">
            <RefreshCw className="w-8 h-8 animate-spin text-amber-400" />
            <p className="text-sm font-medium">Loading SNAPs repair photo repository...</p>
          </div>
        ) : activeProject ? (
          /* PROJECT WORKBENCH / CHECKLIST VIEW */
          <StageChecklistView
            project={activeProject}
            onBackToHome={() => setActiveProjectId(null)}
            onOpenExplorer={() => setIsExplorerModalOpen(true)}
            onStartCapture={(stage, item, count) => setCaptureSession({ stage, item, existingCount: count })}
            onInspectPhoto={(photo) => setInspectedPhoto(photo)}
            onOpenReport={() => setIsReportModalOpen(true)}
            onExportZip={() => exportProjectZip(activeProject)}
            onUpdateStageStatus={handleUpdateStageStatus}
            onSelectStage={handleSelectStage}
            onDeleteProject={handleDeleteProject}
          />
        ) : (
          /* 1. HOME SCREEN (Sub-goal 1 Specification) */
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
            {/* Top of page title and subtitle as specified in Sub-goal 1 */}
            <div className="text-center space-y-2 pt-2">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white">
                SNAPs
              </h1>
              <p className="text-base sm:text-lg text-amber-400 font-semibold tracking-wide">
                Repair Photo Management
              </p>
              <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
                Smart Networked Asset Photos: Standardized photo checklists, auto-naming, and organized folder structures for workshop turbomachinery and equipment repairs.
              </p>
            </div>

            {/* TWO PROMINENT ACTIONS (Sub-goal 1 Requirement) */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-xl mx-auto">
              {/* "+ New Project" Button */}
              <button
                onClick={() => setIsNewProjectModalOpen(true)}
                className="w-full sm:w-1/2 flex items-center justify-center gap-2.5 px-6 py-4 text-sm font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-2xl shadow-lg shadow-amber-500/10 active:scale-[0.98] transition-all cursor-pointer min-h-[52px]"
              >
                <Plus className="w-5 h-5 stroke-[2.5]" />
                <span>+ New Project</span>
              </button>

              {/* "Open Existing Project" Button */}
              <button
                onClick={() => setIsOpenExistingModalOpen(true)}
                className="w-full sm:w-1/2 flex items-center justify-center gap-2.5 px-6 py-4 text-sm font-bold text-slate-200 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 rounded-2xl active:scale-[0.98] transition-all cursor-pointer min-h-[52px]"
              >
                <FolderOpen className="w-5 h-5 text-amber-400" />
                <span>Open Existing Project</span>
              </button>
            </div>

            {/* Root Folder Quick Strip */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5 font-mono text-slate-300">
                <FolderTree className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Root Repository:</span>
                <span className="font-bold text-amber-400">SNAPs/</span>
                <span className="text-slate-500 hidden md:inline">
                  (All photos are automatically sorted into dedicated project folders)
                </span>
              </div>

              <button
                onClick={() => setIsExplorerModalOpen(true)}
                className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
              >
                <span>Browse SNAPs/ Directory</span>
                <span>→</span>
              </button>
            </div>

            {/* Existing Projects Section */}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-white tracking-tight">
                    Active Repair Projects ({projects.length})
                  </h2>
                  <p className="text-xs text-slate-400">
                    Select a project card below to open its guided photo checklist
                  </p>
                </div>

                {/* Filter and Search Bar */}
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Filter projects..."
                      className="pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 w-44 sm:w-56"
                    />
                  </div>

                  <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
                    {(['All', 'In Progress', 'Complete'] as const).map((st) => (
                      <button
                        key={st}
                        onClick={() => setStatusFilter(st)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                          statusFilter === st
                            ? 'bg-amber-400 text-slate-950 font-bold'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Cards Grid */}
              {filteredProjects.length === 0 ? (
                <div className="text-center py-16 bg-slate-900/40 border border-slate-800 rounded-2xl p-8 space-y-3">
                  <Camera className="w-10 h-10 text-slate-600 mx-auto" />
                  <p className="text-sm font-medium text-slate-300">No repair projects found matching filter</p>
                  <button
                    onClick={() => setIsNewProjectModalOpen(true)}
                    className="mt-2 px-4 py-2 bg-amber-400 text-slate-950 font-bold text-xs rounded-xl hover:bg-amber-300 min-h-[44px]"
                  >
                    + Create New Project
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filteredProjects.map((project) => (
                    <ProjectCard
                      key={project.id}
                      project={project}
                      onOpenProject={(id) => setActiveProjectId(id)}
                      onDeleteProject={handleDeleteProject}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="no-print mt-auto border-t border-slate-900 bg-slate-950/80 px-4 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-400">SNAPs</span>
            <span>·</span>
            <span>Smart Networked Asset Photos</span>
            <span>·</span>
            <span className="font-mono text-amber-500/80">SNAPs/</span>
          </div>
          <div>Workshop Repair Team · ISO-9001 Photographic Standard</div>
        </div>
      </footer>

      {/* MODALS */}
      {/* 1. New Project Modal (Sub-goal 3) */}
      <NewProjectModal
        isOpen={isNewProjectModalOpen}
        onClose={() => setIsNewProjectModalOpen(false)}
        onCreate={handleCreateProject}
        existingNames={projects.map((p) => p.name)}
      />

      {/* 2. Open Existing Project Modal */}
      <OpenExistingModal
        isOpen={isOpenExistingModalOpen}
        onClose={() => setIsOpenExistingModalOpen(false)}
        projects={projects}
        onSelectProject={(id) => setActiveProjectId(id)}
      />

      {/* 3. Camera Capture Modal */}
      {captureSession && activeProject && (
        <CameraCaptureModal
          isOpen={true}
          onClose={() => setCaptureSession(null)}
          projectName={activeProject.name}
          stageCode={captureSession.stage.stageCode}
          stageName={captureSession.stage.title}
          stageFolderName={captureSession.stage.folderName}
          checklistItemId={captureSession.item?.id}
          checklistItemTitle={captureSession.item?.title || 'General_Inspection'}
          leadEngineer={activeProject.leadEngineer}
          existingPhotosCount={captureSession.existingCount}
          onPhotoCaptured={handlePhotoCaptured}
        />
      )}

      {/* 4. Photo Inspector & Annotation Modal */}
      <PhotoInspectorModal
        photo={inspectedPhoto}
        onClose={() => setInspectedPhoto(null)}
        onDeletePhoto={handleDeletePhoto}
        onUpdatePhoto={handleUpdatePhoto}
      />

      {/* 5. Logical Root Directory Explorer (Sub-goal 2) */}
      <FolderExplorerModal
        isOpen={isExplorerModalOpen}
        onClose={() => setIsExplorerModalOpen(false)}
        projects={projects}
        onSelectPhoto={(photo) => {
          setActiveProjectId(photo.projectId);
          setInspectedPhoto(photo);
        }}
      />

      {/* 6. Repair Report Sheet Generator */}
      {activeProject && (
        <RepairReportModal
          isOpen={isReportModalOpen}
          onClose={() => setIsReportModalOpen(false)}
          project={activeProject}
        />
      )}

      {/* 7. Workshop Mobile QR Connect (/api/qr) */}
      <QrModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        projectName={activeProject?.name}
      />
    </div>
  );
}
