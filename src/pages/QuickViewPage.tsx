import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, ExternalLink, RotateCcw, Shield, Sparkles } from 'lucide-react';

interface QuickViewPageProps {
  onReturn: () => void;
  returnLabel?: string;
}

export const QuickViewPage: React.FC<QuickViewPageProps> = ({
  onReturn,
  returnLabel = 'More Details',
}) => {
  const [iframeKey, setIframeKey] = useState<number>(Date.now());
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const overviewUrl = 'https://hostelleague.vercel.app/';

  const handleRefresh = () => {
    setIsLoading(true);
    setIframeKey(Date.now());
  };

  return (
    <div className="relative space-y-4">
      
      {/* Top Broadcast Bar with Return to More Details Action */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-wrap items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl bg-stadium-900/90 backdrop-blur-md border border-stadium-750 shadow-broadcast"
      >
        {/* Return Button */}
        <button
          onClick={onReturn}
          className="group inline-flex items-center gap-2.5 px-4 py-2.5 rounded-badge bg-gradient-to-r from-pitch-400 via-pitch-300 to-neon-cyan text-stadium-980 font-mono font-black text-xs uppercase tracking-wider transition-all duration-200 shadow-[0_0_20px_rgba(0,255,133,0.5)] hover:shadow-[0_0_25px_rgba(0,255,133,0.7)] active:scale-[0.97]"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1 stroke-[3]" />
          <span>Return to {returnLabel}</span>
        </button>

        {/* Center Status Details */}
        <div className="hidden sm:flex items-center gap-3 font-mono text-xs">
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-stadium-950 border border-stadium-800 text-slate-300">
            <span className="w-2 h-2 rounded-full bg-pitch-500 animate-pulse" />
            <span className="text-[11px] font-semibold uppercase tracking-wider">Quick Tournament View</span>
          </div>
          <span className="text-slate-500">•</span>
          <span className="text-slate-400 text-[11px]">hostelleague.vercel.app</span>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 ml-auto sm:ml-0 font-mono text-xs">
          <button
            onClick={handleRefresh}
            title="Reload overview"
            className="p-2 rounded-badge text-slate-400 hover:text-white bg-stadium-950/60 hover:bg-stadium-800 border border-stadium-800 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          
          <a
            href={overviewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-badge text-slate-300 hover:text-white bg-stadium-950/60 hover:bg-stadium-800 border border-stadium-800 transition-colors"
          >
            <span className="hidden xs:inline">Open in New Tab</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </motion.div>

      {/* Frame Container */}
      <div className="relative w-full rounded-2xl overflow-hidden border border-stadium-750 bg-stadium-950 shadow-broadcast">
        
        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-stadium-950/80 backdrop-blur-sm">
            <div className="w-10 h-10 rounded-full border-3 border-pitch-500/20 border-t-pitch-500 animate-spin" />
            <p className="mt-3 text-xs font-mono tracking-widest uppercase text-slate-400">
              Connecting to Quick Tournament Overview...
            </p>
          </div>
        )}

        {/* Embedded Site */}
        <iframe
          key={iframeKey}
          src={overviewUrl}
          title="Quick Tournament View"
          className="w-full h-[72vh] sm:h-[80vh] md:h-[85vh] border-0"
          onLoad={() => setIsLoading(false)}
          allow="fullscreen"
        />

        {/* Floating Quick Return Pill on bottom-right (clears mobile bottom bar) */}
        <div className="fixed sm:absolute bottom-20 sm:bottom-4 right-3 sm:right-4 z-50 pointer-events-auto">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onReturn}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-gradient-to-r from-stadium-900 to-stadium-850 hover:from-stadium-850 hover:to-stadium-800 text-white border border-pitch-400 font-mono text-xs font-bold uppercase tracking-wider shadow-[0_0_20px_rgba(0,255,133,0.4)] backdrop-blur-md transition-all group"
          >
            <ArrowLeft className="w-4 h-4 text-pitch-400 group-hover:-translate-x-1 transition-transform stroke-[2.5]" />
            <span>Return to {returnLabel}</span>
          </motion.button>
        </div>

      </div>

    </div>
  );
};
