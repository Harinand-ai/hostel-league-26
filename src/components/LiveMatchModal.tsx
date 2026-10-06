import React, { useState, useEffect } from 'react';
import { X, ExternalLink, RefreshCw, Radio } from 'lucide-react';

interface LiveMatchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LiveMatchModal: React.FC<LiveMatchModalProps> = ({ isOpen, onClose }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [iframeKey, setIframeKey] = useState(0);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleRefresh = () => {
    setIsLoading(true);
    setIframeKey(prev => prev + 1);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-xs">
      <div className="relative w-full max-w-3xl bg-[#362b21] border-4 border-[#120d08] shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        
        {/* Minecraft Window Title Bar */}
        <div className="flex items-center justify-between px-3 py-2 bg-[#261d15] border-b-3 border-[#120d08]">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-2.5 h-2.5 bg-[#ff2222] animate-ping shrink-0" />
            <div className="flex items-center gap-2 truncate">
              <span className="text-[11px] font-black uppercase text-[#ffff55] tracking-wide font-display">
                LIVE MATCH WINDOW
              </span>
              <span className="hidden sm:inline text-[9px] text-[#bda88e] uppercase truncate">
                • hostelleague.vercel.app
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Refresh iframe */}
            <button
              onClick={handleRefresh}
              title="Refresh live stream"
              className="p-1 mc-btn text-[#ffff55]"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>

            {/* Optional external popout */}
            <a
              href="https://hostelleague.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              title="Open in new browser tab"
              className="p-1 mc-btn text-[#55ffff]"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            {/* Close Button */}
            <button
              onClick={onClose}
              title="Close window"
              className="px-2 py-1 mc-btn-red text-white text-[11px] font-black"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Embedded Iframe Container */}
        <div className="relative flex-1 w-full bg-[#18110a] min-h-[380px] sm:min-h-[500px]">
          {isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#1e160f] z-10 p-4 text-center">
              <div className="w-8 h-8 bg-[#4a7227] border-2 border-white animate-spin mb-3" />
              <span className="text-xs font-black text-[#ffff55] uppercase font-display">
                CONNECTING TO LIVE STREAM...
              </span>
              <span className="text-sm text-[#c7b59e] mt-1">
                Loading official match broadcast
              </span>
            </div>
          )}

          <iframe
            key={iframeKey}
            src="https://hostelleague.vercel.app/"
            title="Hostel League 26 Live Match Centre"
            onLoad={() => setIsLoading(false)}
            className="w-full h-[65vh] sm:h-[520px] border-none bg-white"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
            allow="fullscreen; autoplay"
          />
        </div>

        {/* Footer info bar */}
        <div className="px-3 py-1.5 bg-[#261d15] border-t-2 border-[#120d08] flex items-center justify-between text-[10px] text-[#baa78e]">
          <span className="flex items-center gap-1.5 truncate">
            <Radio className="w-3 h-3 text-[#ff5555] animate-pulse" />
            <span>Official Hostel League Live Feed</span>
          </span>
          <button
            onClick={onClose}
            className="text-[9px] font-black text-[#ffff55] hover:text-white uppercase"
          >
            [ CLOSE WINDOW ]
          </button>
        </div>

      </div>
    </div>
  );
};
