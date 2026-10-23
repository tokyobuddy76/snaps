import React, { useState, useEffect } from 'react';
import { QrCode, X, Copy, Check, ExternalLink, RefreshCw, Smartphone } from 'lucide-react';

interface QrModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetUrl?: string;
  projectName?: string;
}

export const QrModal: React.FC<QrModalProps> = ({
  isOpen,
  onClose,
  targetUrl,
  projectName,
}) => {
  const [copied, setCopied] = useState(false);
  const [healthStatus, setHealthStatus] = useState<{ status?: string; timestamp?: string } | null>(null);
  const [healthLoading, setHealthLoading] = useState(false);

  // Default to current URL or the requested demo URL
  const appUrl = targetUrl || (typeof window !== 'undefined' ? window.location.href : 'https://your-app.vercel.app');
  const qrEndpoint = `/api/qr?size=240x240&data=${encodeURIComponent(appUrl)}`;

  useEffect(() => {
    if (isOpen) {
      // Check /api/health
      setHealthLoading(true);
      fetch('/api/health')
        .then((res) => res.json())
        .then((data) => setHealthStatus(data))
        .catch((err) => console.warn('Health check error:', err))
        .finally(() => setHealthLoading(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(appUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div 
        role="dialog"
        aria-modal="true"
        aria-labelledby="qr-modal-title"
        className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <QrCode className="w-4 h-4" />
            </div>
            <div>
              <h2 id="qr-modal-title" className="text-sm font-bold text-white tracking-tight">
                {projectName ? `Project QR: ${projectName}` : 'Workshop Mobile Connect'}
              </h2>
              <p className="text-[11px] text-slate-400">Serverless QR proxy via /api/qr</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* QR Code Container */}
        <div className="p-6 flex flex-col items-center text-center space-y-4">
          <div className="relative p-3 bg-white rounded-2xl shadow-xl flex items-center justify-center">
            <img
              src={qrEndpoint}
              alt="Scan QR code to open SNAPs"
              width={240}
              height={240}
              className="w-60 h-60 object-contain rounded-lg"
              onError={(e) => {
                // Fallback direct URL if local dev server hasn't hot-reloaded
                (e.currentTarget as HTMLImageElement).src = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(appUrl)}`;
              }}
            />
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-200">
              <Smartphone className="w-3.5 h-3.5 text-amber-400" />
              <span>Scan with phone or iPad camera</span>
            </div>
            <p className="text-[11px] text-slate-400 max-w-xs">
              Opens SNAPs directly on your mobile device for shop-floor photo capture.
            </p>
          </div>

          {/* Target URL with Copy Button */}
          <div className="w-full flex items-center gap-2 p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono">
            <span className="truncate flex-1 text-slate-300 text-left pl-1">
              {appUrl}
            </span>
            <button
              onClick={handleCopy}
              className="p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors shrink-0"
              title="Copy link"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Serverless API Status */}
          <div className="w-full pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 font-mono">
            <span>Serverless: /api/qr</span>
            <span className="flex items-center gap-1">
              Health: 
              {healthLoading ? (
                <RefreshCw className="w-3 h-3 animate-spin text-amber-400" />
              ) : healthStatus?.status === 'ok' ? (
                <span className="text-emerald-400 font-semibold">200 OK</span>
              ) : (
                <span className="text-slate-400">Ready</span>
              )}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
