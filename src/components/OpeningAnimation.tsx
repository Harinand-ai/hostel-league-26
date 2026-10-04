import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { INITIAL_TEAMS } from '../data/initialData';
import { TeamBadge } from './TeamBadge';
import { FastForward, Trophy } from 'lucide-react';

interface OpeningAnimationProps {
  onComplete: () => void;
}

export const OpeningAnimation: React.FC<OpeningAnimationProps> = ({ onComplete }) => {
  const [phase, setPhase] = useState<'title' | 'year' | 'teams' | 'done'>('title');

  useEffect(() => {
    const timer1 = setTimeout(() => {
      setPhase('year');
    }, 1400);

    const timer2 = setTimeout(() => {
      setPhase('teams');
    }, 2800);

    const timer3 = setTimeout(() => {
      setPhase('done');
      onComplete();
    }, 6200);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [onComplete]);

  const handleSkip = () => {
    setPhase('done');
    onComplete();
  };

  return (
    <AnimatePresence>
      <motion.div
        key="intro-screen"
        initial={{ opacity: 1 }}
        exit={{ opacity: 0, transition: { duration: 0.8, ease: 'easeInOut' } }}
        className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#050811] text-white overflow-hidden select-none"
      >
        {/* Stadium floodlight beams */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0.25, scale: 1.2 }}
            transition={{ duration: 2.5, repeat: Infinity, repeatType: 'reverse' }}
            className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-sky-500/20 rounded-full blur-[120px]"
          />
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.15 }}
            transition={{ duration: 2, delay: 1 }}
            className="absolute bottom-0 right-1/4 w-[400px] h-[300px] bg-emerald-500/20 rounded-full blur-[100px]"
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,#050811_95%)]" />
        </div>

        {/* Content Container */}
        <div className="relative z-10 flex flex-col items-center justify-center max-w-4xl px-4 text-center">
          
          {/* Phase 1 & 2: Title and "26" */}
          {(phase === 'title' || phase === 'year') && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-center"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 rounded-full bg-slate-800/80 border border-slate-700/60 text-xs font-semibold uppercase tracking-widest text-gold-400">
                <Trophy className="w-3.5 h-3.5 text-gold-400" />
                Hostel Football Championship
              </div>

              <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight font-display text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-100 to-slate-400">
                HOSTEL LEAGUE
              </h1>

              {phase === 'year' && (
                <motion.div
                  initial={{ scale: 2.2, opacity: 0, filter: 'blur(10px)' }}
                  animate={{ scale: 1, opacity: 1, filter: 'blur(0px)' }}
                  transition={{ type: 'spring', stiffness: 260, damping: 20 }}
                  className="mt-2 text-7xl md:text-9xl font-black font-display tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-gold-400 via-amber-300 to-yellow-500 drop-shadow-[0_0_35px_rgba(245,158,11,0.5)]"
                >
                  26
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Phase 3: Teams reveal */}
          {phase === 'teams' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="w-full flex flex-col items-center"
            >
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="text-xs font-bold uppercase tracking-[0.3em] text-slate-400 mb-8"
              >
                THE CONTENDERS
              </motion.div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-5 md:gap-8 w-full max-w-2xl">
                {INITIAL_TEAMS.map((team, idx) => (
                  <motion.div
                    key={team.id}
                    initial={{ opacity: 0, scale: 0.7, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{
                      duration: 0.4,
                      delay: idx * 0.12,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    className="flex flex-col items-center justify-center p-4 rounded-xl bg-stadium-850/80 border border-slate-700/50 backdrop-blur-sm shadow-lg"
                  >
                    <TeamBadge team={team} size="lg" />
                    <span className="mt-3 text-sm md:text-base font-bold font-display uppercase tracking-wider text-slate-100">
                      {team.name}
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium mt-0.5">
                      Mgr: {team.manager_name}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

        </div>

        {/* Skip button */}
        <button
          onClick={handleSkip}
          className="absolute bottom-8 right-8 inline-flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-white bg-slate-900/80 hover:bg-slate-800 border border-slate-700/70 rounded-full transition-all duration-200 z-20 backdrop-blur-sm group"
        >
          <span>Skip Intro</span>
          <FastForward className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </motion.div>
    </AnimatePresence>
  );
};
