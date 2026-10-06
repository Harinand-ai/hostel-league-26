import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { INITIAL_TEAMS } from '../data/initialData';
import { TeamBadge } from './TeamBadge';
import { audioService } from '../services/audioService';
import { Volume2, VolumeX, FastForward } from 'lucide-react';

interface OpeningAnimationProps {
  onComplete: () => void;
}

export const OpeningAnimation: React.FC<OpeningAnimationProps> = ({ onComplete }) => {
  // Steps:
  // 1 (0.0s – 1.5s): Dark/neutral background + subtle football-pitch markings
  // 2 (1.5s – 3.0s): Football rolls/kicks across the screen
  // 3 (3.0s – 4.5s): Reveal "HOSTEL LEAGUE"
  // 4 (4.5s – 5.5s): Reveal "26" with restrained impact & sound
  // 5 (5.5s – 7.0s): Reveal the six clubs/crests
  // 6 (7.0s – 8.0s): Show "6 CLUBS • 5 ROUNDS • 15 MATCHES" & smooth transition into home
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5 | 6>(1);
  const [isMuted, setIsMuted] = useState<boolean>(audioService.getMuted());
  const completedRef = useRef(false);

  // The 6 official clubs in tournament order
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

  const handleSkip = () => {
    handleFinish();
  };

  useEffect(() => {
    // 0.0s: Ambient stadium crowd rumble
    audioService.playStadiumAmbience(8.0);

    // 1.5s: Step 2 - Football rolls / kicks across
    const t2 = setTimeout(() => {
      setStep(2);
      audioService.playBallKick();
    }, 1500);

    // 3.0s: Step 3 - "HOSTEL LEAGUE" typography reveal
    const t3 = setTimeout(() => {
      setStep(3);
      audioService.playBroadcastHit();
    }, 3000);

    // 4.5s: Step 4 - "26" restrained impact
    const t4 = setTimeout(() => {
      setStep(4);
      audioService.playBroadcastHit();
    }, 4500);

    // 5.5s: Step 5 - Six clubs reveal
    const t5 = setTimeout(() => {
      setStep(5);
      audioService.playClubTransition(440);
    }, 5500);

    // 7.0s: Step 6 - Tournament specs: 6 CLUBS • 5 ROUNDS • 15 MATCHES
    const t6 = setTimeout(() => {
      setStep(6);
      audioService.playRefereeWhistle();
    }, 7000);

    // 8.2s: Seamless transition to application
    const tEnd = setTimeout(() => {
      handleFinish();
    }, 8200);

    return () => {
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
      clearTimeout(t6);
      clearTimeout(tEnd);
    };
  }, []);

  const toggleSound = (e: React.MouseEvent) => {
    e.stopPropagation();
    const muted = audioService.toggleMute();
    setIsMuted(muted);
    if (!muted) {
      audioService.playStadiumAmbience(6.0);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        key="hl26-tournament-intro"
        initial={{ opacity: 1 }}
        exit={{ opacity: 0, transition: { duration: 0.5, ease: 'easeInOut' } }}
        className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#090e14] text-slate-100 overflow-hidden select-none"
      >
        {/* Subtle pitch background lines */}
        <div className="absolute inset-0 pointer-events-none opacity-20 flex items-center justify-center">
          <svg className="w-full h-full max-w-2xl max-h-[80vh] stroke-white/25" viewBox="0 0 400 300" fill="none">
            {/* Outer Pitch Border */}
            <rect x="20" y="20" width="360" height="260" strokeWidth="1.5" />
            {/* Halfway Line */}
            <line x1="200" y1="20" x2="200" y2="280" strokeWidth="1.5" />
            {/* Center Circle & Spot */}
            <circle cx="200" cy="150" r="45" strokeWidth="1.5" />
            <circle cx="200" cy="150" r="3" fill="white" />
            {/* Penalty Boxes */}
            <rect x="20" y="90" width="60" height="120" strokeWidth="1.5" />
            <rect x="320" y="90" width="60" height="120" strokeWidth="1.5" />
          </svg>
        </div>

        {/* Top Controls: Sound & Skip */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-20">
          <button
            onClick={toggleSound}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-xs font-semibold text-white/80 transition-colors backdrop-blur-xs cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
            <span className="hidden sm:inline">{isMuted ? 'Muted' : 'Sound'}</span>
          </button>

          <button
            onClick={handleSkip}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-xs font-bold uppercase tracking-wider text-white transition-colors backdrop-blur-xs cursor-pointer"
          >
            <span>Skip</span>
            <FastForward className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Main Stage Presentation */}
        <div className="relative z-10 w-full max-w-lg px-6 flex flex-col items-center justify-center text-center min-h-[320px]">

          {/* STEP 1 & 2: Football rolling across screen */}
          {step <= 2 && (
            <motion.div
              initial={{ x: -200, opacity: 0, rotate: 0 }}
              animate={step === 2 ? { x: 0, opacity: 1, rotate: 720 } : { x: -80, opacity: 0.8, rotate: 180 }}
              transition={{ duration: 1.3, ease: 'easeOut' }}
              className="flex flex-col items-center justify-center"
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/95 text-slate-900 shadow-2xl flex items-center justify-center text-3xl sm:text-4xl border-2 border-slate-300">
                ⚽
              </div>
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.6 }}
                transition={{ delay: 0.4 }}
                className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mt-4"
              >
                OFFICIAL TOURNAMENT
              </motion.span>
            </motion.div>
          )}

          {/* STEP 3 & 4: HOSTEL LEAGUE 26 typography reveal */}
          {(step === 3 || step === 4) && (
            <div className="space-y-2">
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="text-xs sm:text-sm font-bold tracking-[0.25em] text-emerald-400 uppercase"
              >
                THE OFFICIAL CHAMPIONSHIP
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, scale: 0.94 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="text-3xl sm:text-5xl font-black text-white tracking-wider uppercase"
              >
                HOSTEL LEAGUE
              </motion.h1>

              {step >= 4 && (
                <motion.div
                  initial={{ opacity: 0, scale: 1.4 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                  className="inline-block mt-2 px-5 py-1 rounded-lg bg-emerald-600 text-white font-black text-4xl sm:text-6xl tracking-tight shadow-lg"
                >
                  26
                </motion.div>
              )}
            </div>
          )}

          {/* STEP 5: Six Clubs Reveal */}
          {step === 5 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="w-full space-y-4"
            >
              <div className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                OFFICIAL PARTICIPATING CLUBS
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5 sm:gap-3 items-center justify-center">
                {OFFICIAL_CLUBS.map((team, idx) => (
                  <motion.div
                    key={team.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.08, duration: 0.3 }}
                    className="flex flex-col items-center justify-center p-2 rounded-lg bg-white/5 border border-white/10 text-center"
                  >
                    <TeamBadge team={team} size="md" />
                    <span className="font-bold text-[11px] text-white mt-1.5 truncate max-w-[80px]">
                      {team.name}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* STEP 6: Tournament Specs Reveal & Wrap-Up */}
          {step === 6 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="space-y-4"
            >
              <div className="w-12 h-12 rounded-full bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 mx-auto flex items-center justify-center text-xl font-black">
                ⚽
              </div>

              <h2 className="text-xl sm:text-2xl font-black uppercase text-white tracking-wide">
                HOSTEL LEAGUE 26
              </h2>

              <div className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-white/10 border border-white/20 text-xs sm:text-sm font-bold tracking-widest text-emerald-300 uppercase">
                6 CLUBS • 5 ROUNDS • 15 MATCHES
              </div>

              <p className="text-xs text-slate-400 font-medium">
                Entering Tournament Centre...
              </p>
            </motion.div>
          )}

        </div>

        {/* Bottom subtle progress indicator */}
        <div className="absolute bottom-6 left-0 right-0 flex justify-center items-center gap-1.5">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div
              key={i}
              className={`h-1 rounded-full transition-all duration-300 ${
                i === step ? 'w-6 bg-emerald-500' : i < step ? 'w-2 bg-white/40' : 'w-2 bg-white/10'
              }`}
            />
          ))}
        </div>

      </motion.div>
    </AnimatePresence>
  );
};
