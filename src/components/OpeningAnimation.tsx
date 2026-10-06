import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { INITIAL_TEAMS } from '../data/initialData';
import { TeamBadge } from './TeamBadge';
import { FastForward } from 'lucide-react';

interface OpeningAnimationProps {
  onComplete: () => void;
}

export const OpeningAnimation: React.FC<OpeningAnimationProps> = ({ onComplete }) => {
  // Phase 1 (0.0s – 1.4s): Football in the center of vertical pitch (no writing)
  // Phase 2 (1.4s – 2.8s): HOSTEL LEAGUE 26
  // Phase 3 (2.8s – 4.8s): All 6 teams displayed vertically
  // 5.0s: Transition into the home page
  const [phase, setPhase] = useState<'ball' | 'title' | 'teams'>('ball');
  const completedRef = useRef(false);

  // The 6 official tournament clubs in order
  const OFFICIAL_CLUBS = [
    INITIAL_TEAMS.find(t => t.name === 'Crystal Palace') || INITIAL_TEAMS[0],
    INITIAL_TEAMS.find(t => t.name === 'Spurs') || INITIAL_TEAMS[1],
    INITIAL_TEAMS.find(t => t.name === 'Aston Villa') || INITIAL_TEAMS[2],
    INITIAL_TEAMS.find(t => t.name === 'Brighton') || INITIAL_TEAMS[3],
    INITIAL_TEAMS.find(t => t.name === 'Fulham') || INITIAL_TEAMS[4],
    INITIAL_TEAMS.find(t => t.name === 'Nottingham Forest') || INITIAL_TEAMS[5],
  ];

  const handleFinish = () => {
    if (completedRef.current) return;
    completedRef.current = true;
    try {
      sessionStorage.setItem('hl26_intro_played_session', 'true');
    } catch {}
    onComplete();
  };

  useEffect(() => {
    // 1.4s: Reveal "HOSTEL LEAGUE 26"
    const tTitle = setTimeout(() => {
      setPhase('title');
    }, 1400);

    // 2.8s: Show all 6 clubs vertically
    const tTeams = setTimeout(() => {
      setPhase('teams');
    }, 2800);

    // 4.8s: Seamless transition into home page
    const tEnd = setTimeout(() => {
      handleFinish();
    }, 4800);

    return () => {
      clearTimeout(tTitle);
      clearTimeout(tTeams);
      clearTimeout(tEnd);
    };
  }, []);

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
            {/* Outer Pitch Border */}
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

        {/* Top Controls: Skip */}
        <div className="absolute top-4 right-4 z-20">
          <button
            onClick={handleFinish}
            className="flex items-center gap-1.5 px-3 py-1.5 mc-btn text-[10px] font-black uppercase tracking-wider cursor-pointer"
          >
            <span>Skip</span>
            <FastForward className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* CENTER CONTENT CONTAINER */}
        <div className="relative z-10 w-full max-w-xs px-4 flex flex-col items-center justify-center text-center">
          <AnimatePresence mode="wait">
            {phase === 'ball' && (
              /* 1. ONLY FOOTBALL IN THE CENTER (NO WRITING) */
              <motion.div
                key="vertical-ball-phase"
                initial={{ scale: 0.3, opacity: 0, rotate: -180 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                exit={{ scale: 0.8, opacity: 0, transition: { duration: 0.25 } }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className="flex items-center justify-center select-none"
              >
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-[#241c15] text-slate-100 shadow-2xl flex items-center justify-center text-4xl sm:text-5xl border-3 border-[#120d08]">
                  ⚽
                </div>
              </motion.div>
            )}

            {phase === 'title' && (
              /* 2. ONLY HOSTEL LEAGUE 26 */
              <motion.div
                key="vertical-title-phase"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10, transition: { duration: 0.25 } }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="flex flex-col items-center justify-center space-y-2 select-none"
              >
                <h1 className="text-2xl sm:text-3xl font-black mc-title-yellow tracking-widest uppercase leading-tight font-display">
                  HOSTEL LEAGUE
                </h1>

                <div className="inline-block px-5 py-1.5 bg-[#4a7227] text-[#ffff55] font-black text-4xl sm:text-5xl tracking-tight shadow-xl border-3 border-[#120d08]">
                  26
                </div>
              </motion.div>
            )}

            {phase === 'teams' && (
              /* 3. ALL 6 TEAMS VERTICALLY STACKED */
              <motion.div
                key="vertical-teams-phase"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, transition: { duration: 0.3 } }}
                transition={{ duration: 0.35 }}
                className="w-full flex flex-col items-center space-y-1.5 select-none max-w-[260px]"
              >
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#ffff55] mb-0.5 block">
                  6 OFFICIAL CLUBS
                </span>

                <div className="w-full flex flex-col space-y-1.5">
                  {OFFICIAL_CLUBS.map((team, idx) => (
                    <motion.div
                      key={team.id}
                      initial={{ opacity: 0, x: -15 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.06, duration: 0.25 }}
                      className="w-full flex items-center gap-2.5 px-3 py-1.5 mc-slot text-left"
                    >
                      <TeamBadge team={team} size="xs" />
                      <span className="font-black text-xs text-white uppercase tracking-wide truncate">
                        {team.name}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </motion.div>
    </AnimatePresence>
  );
};
