import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { audioService } from '../services/audioService';
import { Volume2, VolumeX, FastForward } from 'lucide-react';

interface OpeningAnimationProps {
  onComplete: () => void;
}

export const OpeningAnimation: React.FC<OpeningAnimationProps> = ({ onComplete }) => {
  // Phase 1 (0.0s – 2.2s): Vertical football pitch with football in the center (NO text/writing)
  // Phase 2 (2.2s – 4.8s): Clean reveal of "HOSTEL LEAGUE 26"
  // 5.0s: Smooth transition into home
  const [phase, setPhase] = useState<'ball' | 'title'>('ball');
  const [isMuted, setIsMuted] = useState<boolean>(audioService.getMuted());
  const completedRef = useRef(false);

  const handleFinish = () => {
    if (completedRef.current) return;
    completedRef.current = true;
    try {
      sessionStorage.setItem('hl26_intro_played_session', 'true');
    } catch {}
    onComplete();
  };

  useEffect(() => {
    // 0.0s: Stadium ambient sound
    audioService.playStadiumAmbience(5.5);

    // 0.6s: Football kick impact in the center
    const tKick = setTimeout(() => {
      audioService.playBallKick();
    }, 600);

    // 2.2s: Reveal "HOSTEL LEAGUE 26"
    const tTitle = setTimeout(() => {
      setPhase('title');
      audioService.playBroadcastHit();
    }, 2200);

    // 4.8s: Transition to home
    const tEnd = setTimeout(() => {
      handleFinish();
    }, 4800);

    return () => {
      clearTimeout(tKick);
      clearTimeout(tTitle);
      clearTimeout(tEnd);
    };
  }, []);

  const toggleSound = (e: React.MouseEvent) => {
    e.stopPropagation();
    const muted = audioService.toggleMute();
    setIsMuted(muted);
    if (!muted) {
      audioService.playStadiumAmbience(5.0);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        key="hl26-vertical-phone-intro"
        initial={{ opacity: 1 }}
        exit={{ opacity: 0, transition: { duration: 0.45, ease: 'easeInOut' } }}
        className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#070b10] text-slate-100 overflow-hidden select-none"
      >
        {/* VERTICAL FOOTBALL PITCH (Portrait Phone Orientation) */}
        <div className="absolute inset-0 pointer-events-none opacity-25 flex items-center justify-center p-4">
          <svg
            className="w-full h-full max-w-sm max-h-[85vh] stroke-white/35"
            viewBox="0 0 300 500"
            fill="none"
          >
            {/* Outer Pitch Touchlines & Goal Lines */}
            <rect x="20" y="20" width="260" height="460" rx="4" strokeWidth="1.5" />

            {/* Halfway Line */}
            <line x1="20" y1="250" x2="280" y2="250" strokeWidth="1.5" />

            {/* Center Circle & Spot */}
            <circle cx="150" cy="250" r="45" strokeWidth="1.5" />
            <circle cx="150" cy="250" r="3.5" fill="white" />

            {/* Top Penalty Area (North Goal) */}
            <rect x="75" y="20" width="150" height="75" strokeWidth="1.5" />
            <rect x="105" y="20" width="90" height="30" strokeWidth="1.5" />
            <circle cx="150" cy="65" r="2.5" fill="white" />

            {/* Bottom Penalty Area (South Goal) */}
            <rect x="75" y="405" width="150" height="75" strokeWidth="1.5" />
            <rect x="105" y="450" width="90" height="30" strokeWidth="1.5" />
            <circle cx="150" cy="435" r="2.5" fill="white" />

            {/* Corner Arcs */}
            <path d="M 20 30 A 10 10 0 0 0 30 20" strokeWidth="1.5" />
            <path d="M 270 20 A 10 10 0 0 0 280 30" strokeWidth="1.5" />
            <path d="M 20 470 A 10 10 0 0 1 30 480" strokeWidth="1.5" />
            <path d="M 270 480 A 10 10 0 0 1 280 470" strokeWidth="1.5" />
          </svg>
        </div>

        {/* Top Controls: Sound & Skip */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-20 max-w-sm mx-auto">
          <button
            onClick={toggleSound}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-xs font-semibold text-white/80 transition-colors backdrop-blur-xs cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
            <span>{isMuted ? 'Muted' : 'Sound'}</span>
          </button>

          <button
            onClick={handleFinish}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-xs font-bold uppercase tracking-wider text-white transition-colors backdrop-blur-xs cursor-pointer"
          >
            <span>Skip</span>
            <FastForward className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* CENTER CONTENT */}
        <div className="relative z-10 w-full max-w-xs px-4 flex flex-col items-center justify-center text-center">
          <AnimatePresence mode="wait">
            {phase === 'ball' ? (
              /* PHASE 1: ONLY THE FOOTBALL IN BETWEEN (NO WRITING) */
              <motion.div
                key="vertical-football"
                initial={{ scale: 0.3, opacity: 0, rotate: -180 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                exit={{ scale: 0.8, opacity: 0, transition: { duration: 0.3 } }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="flex items-center justify-center"
              >
                <motion.div
                  animate={{ scale: [1, 1.08, 1] }}
                  transition={{ repeat: Infinity, duration: 1.2, ease: 'easeInOut' }}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white/95 text-slate-900 shadow-2xl flex items-center justify-center text-4xl sm:text-5xl border-2 border-slate-300 select-none"
                >
                  ⚽
                </motion.div>
              </motion.div>
            ) : (
              /* PHASE 2: ONLY HOSTEL LEAGUE 26 */
              <motion.div
                key="vertical-hl26-title"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.45, ease: 'easeOut' }}
                className="flex flex-col items-center justify-center space-y-2 select-none"
              >
                <motion.h1
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                  className="text-3xl sm:text-4xl font-black text-white tracking-widest uppercase leading-tight font-display"
                >
                  HOSTEL LEAGUE
                </motion.h1>

                <motion.div
                  initial={{ opacity: 0, scale: 1.3 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.15, duration: 0.35, ease: 'backOut' }}
                  className="inline-block px-5 py-1.5 rounded-xl bg-emerald-600 text-white font-black text-4xl sm:text-5xl tracking-tight shadow-xl border border-emerald-400/40"
                >
                  26
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </motion.div>
    </AnimatePresence>
  );
};
