import React, { useState } from 'react';
import { CapturedPhoto, PhotoAnnotation } from '../types';
import { formatDateTimeNice, formatBytes } from '../utils/naming';
import { X, Download, Trash2, Tag, Calendar, User, FileText, Check, AlertCircle, Edit3, Circle, Square, ArrowUpRight, Type } from 'lucide-react';

interface PhotoInspectorModalProps {
  photo: CapturedPhoto | null;
  onClose: () => void;
  onDeletePhoto: (photoId: string) => void;
  onUpdatePhoto: (updated: CapturedPhoto) => void;
}

export const PhotoInspectorModal: React.FC<PhotoInspectorModalProps> = ({
  photo,
  onClose,
  onDeletePhoto,
  onUpdatePhoto,
}) => {
  if (!photo) return null;

  const [notes, setNotes] = useState(photo.notes || '');
  const [conditionRating, setConditionRating] = useState(photo.conditionRating || 'Acceptable');
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [annotations, setAnnotations] = useState<PhotoAnnotation[]>(photo.annotations || []);
  const [activeAnnotationTool, setActiveAnnotationTool] = useState<'none' | 'arrow' | 'circle' | 'box' | 'text'>('none');
  const [annotationColor, setAnnotationColor] = useState('#ef4444');
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleSaveMetadata = () => {
    onUpdatePhoto({
      ...photo,
      notes: notes.trim(),
      conditionRating: conditionRating as any,
      annotations,
    });
    setIsEditingNotes(false);
  };

  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (activeAnnotationTool === 'none') return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);

    let textPrompt = '';
    if (activeAnnotationTool === 'text') {
      textPrompt = prompt('Enter inspection measurement / callout text:') || '0.12mm Defect';
    }

    const newAnnotation: PhotoAnnotation = {
      id: `ann-${Date.now()}`,
      type: activeAnnotationTool,
      x,
      y,
      color: annotationColor,
      text: textPrompt,
    };

    const updatedList = [...annotations, newAnnotation];
    setAnnotations(updatedList);
    onUpdatePhoto({
      ...photo,
      annotations: updatedList,
    });
  };

  const removeAnnotation = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = annotations.filter((a) => a.id !== id);
    setAnnotations(updated);
    onUpdatePhoto({
      ...photo,
      annotations: updated,
    });
  };

  const downloadDirectPhoto = () => {
    const a = document.createElement('a');
    a.href = photo.dataUrl;
    a.download = photo.fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/90 backdrop-blur-md">
      <div 
        role="dialog"
        aria-modal="true"
        aria-labelledby="inspector-title"
        className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-5xl max-h-[95vh] flex flex-col overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-slate-800 bg-slate-900 shrink-0">
          <div className="min-w-0 pr-3">
            <h2 id="inspector-title" className="text-base font-bold text-white tracking-tight truncate">
              {photo.checklistItemTitle || photo.fileName}
            </h2>
            <div className="font-mono text-xs text-amber-400 truncate mt-0.5">
              {photo.logicalPath}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={downloadDirectPhoto}
              title="Download photo"
              className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors"
            >
              <Download className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body: Split View (Image on left, Inspector details on right) */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* Main Photo Canvas */}
          <div className="flex-1 bg-black relative flex flex-col items-center justify-center p-3 overflow-hidden select-none">
            {/* Annotation Toolbar */}
            <div className="absolute top-4 left-4 z-20 flex items-center gap-1.5 p-1.5 bg-slate-900/90 backdrop-blur-md rounded-xl border border-slate-700 shadow-lg">
              <span className="text-[10px] font-semibold text-slate-400 px-1.5 uppercase">Markup:</span>
              <button
                onClick={() => setActiveAnnotationTool('none')}
                className={`px-2 py-1 rounded text-xs ${activeAnnotationTool === 'none' ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-300 hover:text-white'}`}
              >
                Pointer
              </button>
              <button
                onClick={() => setActiveAnnotationTool('circle')}
                className={`p-1.5 rounded ${activeAnnotationTool === 'circle' ? 'bg-amber-400 text-slate-950' : 'text-slate-300 hover:text-white'}`}
                title="Circle Defect"
              >
                <Circle className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setActiveAnnotationTool('arrow')}
                className={`p-1.5 rounded ${activeAnnotationTool === 'arrow' ? 'bg-amber-400 text-slate-950' : 'text-slate-300 hover:text-white'}`}
                title="Arrow Pointer"
              >
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setActiveAnnotationTool('text')}
                className={`p-1.5 rounded ${activeAnnotationTool === 'text' ? 'bg-amber-400 text-slate-950' : 'text-slate-300 hover:text-white'}`}
                title="Add Defect Text Measurement"
              >
                <Type className="w-3.5 h-3.5" />
              </button>

              {/* Color picker */}
              <div className="flex items-center gap-1 pl-1 border-l border-slate-700">
                {['#ef4444', '#22c55e', '#eab308', '#38bdf8'].map((c) => (
                  <button
                    key={c}
                    onClick={() => setAnnotationColor(c)}
                    className="w-4 h-4 rounded-full border border-white/40"
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            {/* Interactive Image Frame */}
            <div
              onClick={handleImageClick}
              className={`relative max-w-full max-h-full flex items-center justify-center ${
                activeAnnotationTool !== 'none' ? 'cursor-crosshair' : 'cursor-default'
              }`}
            >
              <img
                src={photo.dataUrl}
                alt={photo.fileName}
                className="max-w-full max-h-[65vh] lg:max-h-[75vh] object-contain rounded-lg shadow-2xl"
              />

              {/* Render Markups / Annotations */}
              {annotations.map((ann) => (
                <div
                  key={ann.id}
                  style={{ left: `${ann.x}%`, top: `${ann.y}%` }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 group pointer-events-auto"
                >
                  {ann.type === 'circle' && (
                    <div
                      className="w-10 h-10 rounded-full border-2 border-dashed shadow-md animate-pulse"
                      style={{ borderColor: ann.color }}
                    />
                  )}
                  {ann.type === 'arrow' && (
                    <div
                      className="flex items-center gap-1 font-mono text-xs font-bold px-1.5 py-0.5 rounded shadow-lg"
                      style={{ backgroundColor: ann.color, color: '#0f172a' }}
                    >
                      <ArrowUpRight className="w-3.5 h-3.5 stroke-[3]" />
                      <span>DEFECT</span>
                    </div>
                  )}
                  {ann.type === 'text' && (
                    <div
                      className="font-mono text-xs font-bold px-2 py-1 rounded shadow-lg border border-white/20 whitespace-nowrap"
                      style={{ backgroundColor: ann.color, color: '#0f172a' }}
                    >
                      {ann.text || 'Defect'}
                    </div>
                  )}

                  {/* Remove pill button on hover */}
                  <button
                    onClick={(e) => removeAnnotation(ann.id, e)}
                    className="hidden group-hover:flex absolute -top-3 -right-3 w-5 h-5 rounded-full bg-slate-900 border border-slate-600 text-white items-center justify-center text-[10px]"
                    title="Remove markup"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            {activeAnnotationTool !== 'none' && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-amber-500/90 text-slate-950 font-semibold px-3 py-1 rounded-full text-xs shadow-lg">
                Click anywhere on photo to place {activeAnnotationTool} markup
              </div>
            )}
          </div>

          {/* Right Sidebar: Inspection Details & Metadata */}
          <div className="w-full lg:w-80 bg-slate-950 border-t lg:border-t-0 lg:border-l border-slate-800 p-5 overflow-y-auto space-y-4">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Repair File Location
              </span>
              <div className="mt-1 p-2.5 bg-slate-900 rounded-xl border border-slate-800 font-mono text-xs text-amber-400 break-all">
                {photo.logicalPath}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Auto-indexed in {photo.stageName} folder.
              </p>
            </div>

            {/* Condition Finding */}
            <div className="space-y-1.5">
              <label htmlFor="inspectorConditionRating" className="block text-xs font-semibold text-slate-300">
                Inspection Finding
              </label>
              <select
                id="inspectorConditionRating"
                value={conditionRating}
                onChange={(e) => {
                  setConditionRating(e.target.value as any);
                  setIsEditingNotes(true);
                }}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
              >
                <option value="Acceptable">Acceptable (Normal Wear)</option>
                <option value="Minor Defect">Minor Defect (Scratches/Scuff)</option>
                <option value="Critical Damage">Critical Damage (Crack/Indication)</option>
                <option value="Information">General Baseline Reference</option>
              </select>
            </div>

            {/* Metadata list */}
            <div className="space-y-2 text-xs border-t border-b border-slate-800 py-3">
              <div className="flex items-center justify-between text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Captured</span>
                </span>
                <span className="text-slate-200 font-mono">
                  {formatDateTimeNice(photo.timestamp)}
                </span>
              </div>

              <div className="flex items-center justify-between text-slate-400">
                <span className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" />
                  <span>Engineer</span>
                </span>
                <span className="text-slate-200 truncate max-w-[150px]">
                  {photo.capturedBy}
                </span>
              </div>

              <div className="flex items-center justify-between text-slate-400">
                <span className="flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" />
                  <span>File Size</span>
                </span>
                <span className="text-slate-200 font-mono">
                  {formatBytes(photo.fileSizeBytes)}
                </span>
              </div>
            </div>

            {/* Engineer Notes */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="inspectorEngineerNotes" className="text-xs font-semibold text-slate-300">
                  Engineer Remarks
                </label>
                {isEditingNotes && (
                  <button
                    onClick={handleSaveMetadata}
                    className="text-xs text-amber-400 hover:text-amber-300 font-semibold"
                  >
                    Save Changes
                  </button>
                )}
              </div>
              <textarea
                id="inspectorEngineerNotes"
                rows={3}
                value={notes}
                onChange={(e) => {
                  setNotes(e.target.value);
                  setIsEditingNotes(true);
                }}
                placeholder="Add defect measurement, repair recommendations or observations..."
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>

            {/* Delete photo action */}
            <div className="pt-3 border-t border-slate-800">
              {!confirmDelete ? (
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  className="w-full py-2.5 px-3 bg-slate-900 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 border border-slate-800 hover:border-rose-800/60 rounded-xl text-xs font-medium flex items-center justify-center gap-2 transition-colors min-h-[44px]"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Photo from Project</span>
                </button>
              ) : (
                <div className="p-3 bg-rose-950/40 border border-rose-800/80 rounded-xl space-y-2">
                  <p className="text-xs text-rose-300 font-medium">
                    Permanently delete this photo from SNAPs?
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setConfirmDelete(false)}
                      className="flex-1 py-1.5 text-xs text-slate-300 bg-slate-800 rounded-lg hover:bg-slate-700 min-h-[36px]"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        onDeletePhoto(photo.id);
                        onClose();
                      }}
                      className="flex-1 py-1.5 text-xs text-white bg-rose-600 hover:bg-rose-500 rounded-lg font-bold min-h-[36px]"
                    >
                      Confirm Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
