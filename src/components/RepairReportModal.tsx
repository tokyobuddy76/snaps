import React from 'react';
import { RepairProject, CapturedPhoto } from '../types';
import { formatDateTimeNice, calculateProjectProgress } from '../utils/naming';
import { Printer, Download, X, CheckCircle2, ShieldCheck, FileText, Share2 } from 'lucide-react';
import { exportProjectZip } from '../utils/exportZip';

interface RepairReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: RepairProject;
}

export const RepairReportModal: React.FC<RepairReportModalProps> = ({
  isOpen,
  onClose,
  project,
}) => {
  if (!isOpen) return null;

  const progress = calculateProjectProgress(project.stages, project.photos);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadZip = async () => {
    try {
      await exportProjectZip(project);
    } catch (e) {
      console.error(e);
      alert('Failed to download project ZIP');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/90 backdrop-blur-md overflow-y-auto">
      <div 
        role="dialog"
        aria-modal="true"
        aria-labelledby="report-title"
        className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-5xl my-auto max-h-[96vh] flex flex-col overflow-hidden shadow-2xl"
      >
        {/* Controls Bar (Hidden during print) */}
        <div className="no-print flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 id="report-title" className="text-base font-bold text-white tracking-tight">
                Repair Inspection Photo Sheet
              </h2>
              <p className="text-xs text-slate-400">
                Ready for PDF export, customer submission, or shop traveler
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-900 bg-amber-400 hover:bg-amber-300 rounded-xl transition-colors shadow-sm min-h-[40px] cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save PDF</span>
            </button>

            <button
              onClick={handleDownloadZip}
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors min-h-[40px]"
            >
              <Download className="w-4 h-4" />
              <span>Download ZIP</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 min-h-[40px] min-w-[40px] flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-950 text-slate-100 print:bg-white print:text-slate-900 font-sans">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Engineering Document Header */}
            <div className="border-b-2 border-slate-700 print:border-slate-900 pb-5 flex flex-col sm:flex-row justify-between items-start gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400 print:text-amber-700">
                    SNAPs Workshop Photo Record
                  </span>
                  <span className="text-slate-500">·</span>
                  <span className="text-xs text-emerald-400 print:text-emerald-700 font-medium flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    QA Certified
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-1 text-white print:text-slate-900">
                  {project.name}
                </h1>
                <p className="text-sm text-slate-400 print:text-slate-600 mt-0.5">
                  {project.assetType} — Overhaul & Repair Inspection
                </p>
              </div>

              <div className="text-left sm:text-right text-xs space-y-1 font-mono text-slate-400 print:text-slate-600">
                <div>LOGICAL ROOT: <strong className="text-slate-200 print:text-slate-900">{project.folderPath}/</strong></div>
                <div>REPORT DATE: <strong className="text-slate-200 print:text-slate-900">{formatDateTimeNice(new Date().toISOString())}</strong></div>
                <div>LEAD ENGINEER: <strong className="text-slate-200 print:text-slate-900">{project.leadEngineer}</strong></div>
              </div>
            </div>

            {/* Project Specs Table */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-900 print:bg-slate-100 p-4 rounded-xl border border-slate-800 print:border-slate-300 text-xs">
              <div>
                <span className="text-slate-400 print:text-slate-600 block">Work Order #</span>
                <span className="font-mono font-bold text-white print:text-slate-900">{project.workOrderNumber || 'WO-88219'}</span>
              </div>
              <div>
                <span className="text-slate-400 print:text-slate-600 block">Serial Number</span>
                <span className="font-mono font-bold text-white print:text-slate-900">{project.serialNumber || 'ST-99420-A'}</span>
              </div>
              <div>
                <span className="text-slate-400 print:text-slate-600 block">Workshop Bay</span>
                <span className="font-semibold text-white print:text-slate-900">{project.workshopLocation}</span>
              </div>
              <div>
                <span className="text-slate-400 print:text-slate-600 block">Checklist Progress</span>
                <span className="font-bold text-amber-400 print:text-amber-700">
                  {progress.requiredCompleted}/{progress.requiredTotal} items ({progress.percentage}%)
                </span>
              </div>
            </div>

            {/* Stages Photos Breakdown */}
            <div className="space-y-8">
              {project.stages.map((stage) => {
                const stagePhotos = project.photos.filter((p) => p.stageId === stage.id);
                if (stagePhotos.length === 0) return null;

                return (
                  <div key={stage.id} className="space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800 print:border-slate-300 pb-2">
                      <div>
                        <h2 className="text-base font-bold text-amber-400 print:text-amber-800">
                          {stage.title}
                        </h2>
                        <div className="font-mono text-xs text-slate-500 print:text-slate-600">
                          Folder: {project.folderPath}/{stage.folderName}/
                        </div>
                      </div>
                      <span className="text-xs font-mono text-slate-400 print:text-slate-600">
                        {stagePhotos.length} {stagePhotos.length === 1 ? 'Photo' : 'Photos'}
                      </span>
                    </div>

                    {/* Photos 2-column Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {stagePhotos.map((photo: CapturedPhoto, idx) => (
                        <div
                          key={photo.id}
                          className="bg-slate-900 print:bg-white border border-slate-800 print:border-slate-300 rounded-xl overflow-hidden flex flex-col"
                        >
                          <div className="relative aspect-4/3 bg-black">
                            <img
                              src={photo.dataUrl}
                              alt={photo.fileName}
                              className="w-full h-full object-contain"
                            />
                            {photo.conditionRating && (
                              <div className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-950/80 backdrop-blur-sm text-amber-400 border border-slate-700 print:bg-slate-200 print:text-slate-900">
                                {photo.conditionRating}
                              </div>
                            )}
                          </div>

                          <div className="p-3.5 space-y-1.5 flex-1 flex flex-col justify-between text-xs">
                            <div>
                              <div className="font-bold text-white print:text-slate-900 text-sm">
                                {idx + 1}. {photo.checklistItemTitle || photo.fileName}
                              </div>
                              <div className="font-mono text-[11px] text-amber-400 print:text-amber-700 break-all">
                                {photo.fileName}
                              </div>
                            </div>

                            {photo.notes && (
                              <div className="p-2 bg-slate-950 print:bg-slate-50 rounded-lg text-slate-300 print:text-slate-700 text-xs italic border border-slate-800 print:border-slate-200">
                                "{photo.notes}"
                              </div>
                            )}

                            <div className="pt-2 border-t border-slate-800 print:border-slate-200 flex items-center justify-between text-[11px] text-slate-400 print:text-slate-600">
                              <span>By: {photo.capturedBy}</span>
                              <span className="font-mono">{formatDateTimeNice(photo.timestamp)}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Engineering Sign-off Box */}
            <div className="mt-8 pt-6 border-t-2 border-slate-700 print:border-slate-900 grid grid-cols-2 gap-6 text-xs">
              <div className="space-y-6">
                <div>
                  <span className="text-slate-400 print:text-slate-600 block">Repair Lead Inspector:</span>
                  <div className="h-10 border-b border-dashed border-slate-600 print:border-slate-400 flex items-end font-semibold text-slate-200 print:text-slate-900">
                    {project.leadEngineer}
                  </div>
                </div>
                <div className="text-[11px] text-slate-500">
                  All photos archived according to SNAPs standard operating procedures.
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <span className="text-slate-400 print:text-slate-600 block">Quality Assurance Authorization:</span>
                  <div className="h-10 border-b border-dashed border-slate-600 print:border-slate-400 flex items-end font-semibold text-slate-200 print:text-slate-900">
                    R. Davis (QA Department)
                  </div>
                </div>
                <div className="text-[11px] text-slate-500 font-mono text-right">
                  STAMP: [VERIFIED ISO-9001]
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
