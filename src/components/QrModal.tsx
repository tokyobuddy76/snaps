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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div 
        role="dialog"
        aria-modal="true"
        aria-labelledby="qr-modal-title"
        className="bg-white border border-slate-200 rounded-xl w-full max-w-md overflow-hidden shadow-xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
              <QrCode className="w-4 h-4" />
            </div>
            <div>
              <h2 id="qr-modal-title" className="text-sm font-bold text-slate-900 tracking-tight">
                {projectName ? `Project QR: ${projectName}` : 'Workshop Mobile Connect'}
              </h2>
              <p className="text-[11px] text-slate-500">Scan to open on phone or tablet</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 min-h-[40px] min-w-[40px] flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* QR Code Container */}
        <div className="p-6 flex flex-col items-center text-center space-y-4 bg-white">
          <div className="relative p-3 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center justify-center">
            <img
              src={qrEndpoint}
              alt="Scan QR code to open SNAPs"
              width={240}
              height={240}
              className="w-56 h-56 object-contain rounded-md"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(appUrl)}`;
              }}
            />
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-800">
              <Smartphone className="w-3.5 h-3.5 text-blue-600" />
              <span>Scan with phone or tablet camera</span>
            </div>
            <p className="text-xs text-slate-500 max-w-xs">
              Opens SNAPs directly on your mobile device for shop-floor photo capture.
            </p>
          </div>

          {/* Target URL with Copy Button */}
          <div className="w-full flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono">
            <span className="truncate flex-1 text-slate-700 text-left pl-1">
              {appUrl}
            </span>
            <button
              onClick={handleCopy}
              className="p-1.5 text-slate-600 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-100 rounded-md transition-colors shrink-0"
              title="Copy link"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Serverless API Status */}
          <div className="w-full pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500 font-mono">
            <span>Route: /api/qr</span>
            <span className="flex items-center gap-1">
              Status: 
              {healthLoading ? (
                <RefreshCw className="w-3 h-3 animate-spin text-blue-600" />
              ) : healthStatus?.status === 'ok' ? (
                <span className="text-emerald-600 font-semibold">Ready</span>
              ) : (
                <span className="text-slate-600">Online</span>
              )}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
