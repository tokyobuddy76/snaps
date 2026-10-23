import React, { useState, useRef, useEffect } from 'react';
import { Camera, SwitchCamera, X, Check, RefreshCw, Upload, Grid3X3, Tag, FileText, AlertTriangle, ShieldCheck } from 'lucide-react';
import { generatePhotoFileName, generateLogicalPath } from '../utils/naming';

interface CameraCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectName: string;
  stageCode: string;
  stageName: string;
  stageFolderName: string;
  checklistItemId?: string;
  checklistItemTitle: string;
  leadEngineer: string;
  existingPhotosCount?: number;
  onPhotoCaptured: (photoData: {
    dataUrl: string;
    fileName: string;
    logicalPath: string;
    checklistItemId?: string;
    checklistItemTitle?: string;
    notes?: string;
    conditionRating: 'Acceptable' | 'Minor Defect' | 'Critical Damage' | 'Information';
    fileSizeBytes: number;
  }) => void;
}

export const CameraCaptureModal: React.FC<CameraCaptureModalProps> = ({
  isOpen,
  onClose,
  projectName,
  stageCode,
  stageName,
  stageFolderName,
  checklistItemId,
  checklistItemTitle,
  leadEngineer,
  existingPhotosCount = 0,
  onPhotoCaptured,
}) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [capturedDataUrl, setCapturedDataUrl] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [showGrid, setShowGrid] = useState(true);
  const [addWatermark, setAddWatermark] = useState(true);
  const [conditionRating, setConditionRating] = useState<'Acceptable' | 'Minor Defect' | 'Critical Damage' | 'Information'>('Acceptable');
  const [engineerNotes, setEngineerNotes] = useState('');
  const [customTag, setCustomTag] = useState(checklistItemTitle || 'Inspection');

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize camera stream
  const startCamera = async (mode: 'environment' | 'user') => {
    try {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      setCameraError(null);

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: mode },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err: any) {
      console.warn('Camera access denied or unavailable:', err);
      setCameraError('Live camera stream not available or permission denied. You can use native camera / file upload below.');
    }
  };

  useEffect(() => {
    if (isOpen) {
      setCapturedDataUrl(null);
      setCustomTag(checklistItemTitle || 'Inspection');
      startCamera(facingMode);
    } else {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
        setStream(null);
      }
    }
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const toggleCamera = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
    startCamera(nextMode);
  };

  const captureFrame = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current || document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw video frame
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // If watermark enabled, stamp project & inspection metadata
    if (addWatermark) {
      applyWatermarkToCanvas(ctx, canvas.width, canvas.height);
    }

    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    setCapturedDataUrl(dataUrl);

    // Stop stream during preview
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      setStream(null);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current || document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          if (addWatermark) {
            applyWatermarkToCanvas(ctx, canvas.width, canvas.height);
          }
          setCapturedDataUrl(canvas.toDataURL('image/jpeg', 0.9));
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const applyWatermarkToCanvas = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const bannerHeight = Math.max(54, Math.round(height * 0.08));
    ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
    ctx.fillRect(0, height - bannerHeight, width, bannerHeight);

    // Text color
    ctx.fillStyle = '#60a5fa'; // industrial clear blue accent
    ctx.font = `bold ${Math.max(12, Math.round(bannerHeight * 0.28))}px monospace`;
    ctx.fillText(`SNAPs // ${projectName} // ${stageCode}`, 16, height - bannerHeight + bannerHeight * 0.42);

    ctx.fillStyle = '#f8fafc';
    ctx.font = `${Math.max(11, Math.round(bannerHeight * 0.24))}px sans-serif`;
    ctx.fillText(`${customTag} · ${leadEngineer}`, 16, height - bannerHeight + bannerHeight * 0.82);

    // Timestamp
    ctx.fillStyle = '#94a3b8';
    ctx.font = `${Math.max(10, Math.round(bannerHeight * 0.22))}px monospace`;
    ctx.textAlign = 'right';
    const timeStr = new Date().toISOString().replace('T', ' ').slice(0, 19);
    ctx.fillText(timeStr, width - 16, height - bannerHeight + bannerHeight * 0.45);
    ctx.fillText('WORKSHOP CERTIFIED', width - 16, height - bannerHeight + bannerHeight * 0.82);
    ctx.textAlign = 'left';
  };

  const retakePhoto = () => {
    setCapturedDataUrl(null);
    startCamera(facingMode);
  };

  const confirmAndSavePhoto = () => {
    if (!capturedDataUrl) return;

    const now = new Date();
    const photoNumber = existingPhotosCount + 1;
    const fileName = generatePhotoFileName(projectName, stageCode, customTag, now, photoNumber);
    const logicalPath = generateLogicalPath(projectName, stageFolderName, fileName);

    // Estimate byte size from dataUrl
    const fileSizeBytes = Math.round((capturedDataUrl.length * 3) / 4);

    onPhotoCaptured({
      dataUrl: capturedDataUrl,
      fileName,
      logicalPath,
      checklistItemId,
      checklistItemTitle: customTag,
      notes: engineerNotes.trim() || undefined,
      conditionRating,
      fileSizeBytes,
    });

    onClose();
  };

  const nextIndex = existingPhotosCount + 1;
  const previewFileName = generatePhotoFileName(projectName, stageCode, customTag, new Date(), nextIndex);
  const previewPath = generateLogicalPath(projectName, stageFolderName, previewFileName);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs">
      <div 
        role="dialog"
        aria-modal="true"
        aria-labelledby="camera-title"
        className="relative w-full h-full max-w-4xl max-h-[100dvh] flex flex-col bg-white sm:border sm:border-slate-200 sm:rounded-xl overflow-hidden shadow-2xl"
      >
        {/* Top Bar */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-50/90 border-b border-slate-200 shrink-0 z-10">
          <div className="min-w-0 pr-2">
            <div className="flex items-center gap-2">
              <Camera className="w-4 h-4 text-blue-600 shrink-0" />
              <h2 id="camera-title" className="text-sm font-bold text-slate-900 tracking-tight truncate">
                {checklistItemTitle
                  ? `Capture: ${checklistItemTitle} (Photo #${nextIndex})`
                  : 'Workshop Photo Capture'}
              </h2>
            </div>
            <div className="text-[11px] font-mono text-blue-600 truncate mt-0.5">
              {previewPath}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {!capturedDataUrl && (
              <>
                <button
                  type="button"
                  onClick={() => setShowGrid(!showGrid)}
                  title="Toggle alignment grid"
                  aria-label="Toggle alignment grid"
                  className={`p-2 rounded-lg border text-xs min-h-[40px] min-w-[40px] flex items-center justify-center transition-colors ${
                    showGrid ? 'bg-blue-600 text-white border-blue-600 font-semibold' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={toggleCamera}
                  title="Switch camera"
                  aria-label="Switch camera"
                  className="p-2 rounded-lg bg-white text-slate-700 hover:text-slate-900 border border-slate-300 hover:bg-slate-100 min-h-[40px] min-w-[40px] flex items-center justify-center transition-colors"
                >
                  <SwitchCamera className="w-4 h-4" />
                </button>
              </>
            )}

            <button
              type="button"
              onClick={onClose}
              aria-label="Close capture"
              className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 min-h-[40px] min-w-[40px] flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Viewfinder / Preview Area */}
        <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden">
          {!capturedDataUrl ? (
            <>
              {/* Live Video */}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-contain"
              />

              {/* Guide Grid Overlay */}
              {showGrid && (
                <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3 border border-white/10">
                  <div className="border-r border-b border-white/20"></div>
                  <div className="border-r border-b border-white/20"></div>
                  <div className="border-b border-white/20"></div>
                  <div className="border-r border-b border-white/20 flex items-center justify-center">
                    <div className="w-4 h-4 border-t-2 border-l-2 border-amber-400/80 -translate-x-2 -translate-y-2"></div>
                  </div>
                  <div className="border-r border-b border-white/20 flex items-center justify-center">
                    {/* Center crosshair for shaft runout / defect alignment */}
                    <div className="w-8 h-8 rounded-full border border-amber-400/60 flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-400"></div>
                    </div>
                  </div>
                  <div className="border-b border-white/20"></div>
                  <div className="border-r border-white/20"></div>
                  <div className="border-r border-white/20"></div>
                  <div></div>
                </div>
              )}

              {/* Camera Error / Fallback Banner */}
              {cameraError && (
                <div className="absolute inset-4 m-auto max-w-md h-fit p-6 bg-white/95 backdrop-blur-md border border-slate-200 rounded-xl text-center space-y-4 shadow-xl">
                  <div className="w-12 h-12 rounded-lg bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center mx-auto">
                    <Camera className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-slate-900">Direct Camera Access</h3>
                    <p className="text-xs text-slate-600">{cameraError}</p>
                  </div>
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full py-3 px-4 bg-blue-600 text-white font-semibold text-xs rounded-lg flex items-center justify-center gap-2 hover:bg-blue-700 min-h-[44px] shadow-xs"
                    >
                      <Upload className="w-4 h-4" />
                      <span>Use Phone Camera / Browse Files</span>
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Review Captured Photo */
            <div className="relative w-full h-full flex items-center justify-center bg-slate-950 p-2">
              <img
                src={capturedDataUrl}
                alt="Captured Repair Photo Preview"
                className="max-w-full max-h-full object-contain rounded-lg"
              />
              <div className="absolute top-4 left-4 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700 text-xs text-emerald-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                <span>Ready to archive into SNAPs/</span>
              </div>
            </div>
          )}

          {/* Hidden Canvas & File Input */}
          <canvas ref={canvasRef} className="hidden" />
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleFileUpload}
          />
        </div>

        {/* Bottom Inspection Metadata & Shutter Controls */}
        <div className="p-4 bg-white border-t border-slate-200 space-y-3 shrink-0 pb-safe">
          {capturedDataUrl ? (
            /* Confirm Screen Controls */
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Condition Rating */}
                <div>
                  <label htmlFor="conditionRatingSelect" className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Condition Finding
                  </label>
                  <select
                    id="conditionRatingSelect"
                    value={conditionRating}
                    onChange={(e) => setConditionRating(e.target.value as any)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                  >
                    <option value="Acceptable">Acceptable (Normal Wear)</option>
                    <option value="Minor Defect">Minor Defect (Light Polish/Scuff)</option>
                    <option value="Critical Damage">Critical Damage (Crack / Score / Pitting)</option>
                    <option value="Information">General Baseline Reference</option>
                  </select>
                </div>

                {/* Tag / Feature label */}
                <div>
                  <label htmlFor="featureLabelInput" className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Feature / Tag
                  </label>
                  <input
                    id="featureLabelInput"
                    type="text"
                    value={customTag}
                    onChange={(e) => setCustomTag(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                  />
                </div>
              </div>

              {/* Inspection Notes */}
              <div>
                <label htmlFor="inspectionNotesInput" className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Engineer Inspection Notes (Optional)
                </label>
                <input
                  id="inspectionNotesInput"
                  type="text"
                  value={engineerNotes}
                  onChange={(e) => setEngineerNotes(e.target.value)}
                  placeholder="e.g. Scored depth ~0.08mm on journal surface. Requires grind."
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={retakePhoto}
                  className="flex-1 py-3 px-4 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 font-semibold text-xs rounded-lg flex items-center justify-center gap-2 transition-colors min-h-[44px]"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Retake</span>
                </button>

                <button
                  type="button"
                  onClick={confirmAndSavePhoto}
                  className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg flex items-center justify-center gap-2 transition-colors min-h-[44px] shadow-xs"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Accept & Save to SNAPs</span>
                </button>
              </div>
            </div>
          ) : (
            /* Live Shutter Mode */
            <div className="flex items-center justify-between gap-4">
              {/* Upload fallback button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 rounded-lg text-xs font-medium min-h-[44px]"
              >
                <Upload className="w-4 h-4 text-blue-600" />
                <span className="hidden sm:inline">Upload File</span>
              </button>

              {/* Big Ergonomic Shutter Button */}
              <button
                type="button"
                onClick={captureFrame}
                aria-label="Capture photo"
                className="w-16 h-16 rounded-full border-4 border-blue-600 bg-blue-600 hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center shadow-md cursor-pointer"
              >
                <div className="w-11 h-11 rounded-full bg-white flex items-center justify-center">
                  <Camera className="w-5 h-5 text-blue-600" />
                </div>
              </button>

              {/* Watermark toggle */}
              <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={addWatermark}
                  onChange={(e) => setAddWatermark(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-[11px] text-slate-600 font-medium">Timestamp Watermark</span>
              </label>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
