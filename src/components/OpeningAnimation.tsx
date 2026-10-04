import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { INITIAL_TEAMS } from '../data/initialData';
import { TeamBadge } from './TeamBadge';
import { audioService } from '../services/audioService';
import { FastForward, Volume2, VolumeX, Shield } from 'lucide-react';

interface OpeningAnimationProps {
  onComplete: () => void;
}

export const OpeningAnimation: React.FC<OpeningAnimationProps> = ({ onComplete }) => {
  // Pacing:
  // Phase 1 (0.0 - 2.0s): Dark Stadium Atmosphere
  // Phase 2 (2.0 - 4.5s): HOSTEL LEAGUE Typography Reveal
  // Phase 3 (4.5 - 6.0s): 26 Reveal & Tournament Structure Info
  // Phase 4 (6.0 - 11.4s): All 6 Clubs Spotlight (~0.9s each)
  // Phase 5 (11.4 - 13.2s): "THE BATTLE FOR THE CROWN" & Referee Whistle + Kick Transition
  const [phase, setPhase] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [clubIndex, setClubIndex] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(audioService.getMuted());
  const completedRef = useRef(false);

  const handleFinish = () => {
    if (completedRef.current) return;
    completedRef.current = true;
    audioService.playBallKick();
    onComplete();
  };

  // Main Scene Orchestration
  useEffect(() => {
    // 0.0s: Start stadium ambience
    audioService.playStadiumAmbience(14);

    // 2.0s: Phase 2 - HOSTEL LEAGUE reveal
    const t2 = setTimeout(() => {
      setPhase(2);
      audioService.playBroadcastHit();
    }, 2000);

    // 4.5s: Phase 3 - 26 & Tournament Specs reveal
    const t3 = setTimeout(() => {
      setPhase(3);
      audioService.playBroadcastHit();
    }, 4500);

    // 6.0s: Phase 4 - Begin Club Introductions
    const t4 = setTimeout(() => {
      setPhase(4);
      setClubIndex(0);
      audioService.playClubTransition(380);
    }, 6000);

    // 11.4s: Phase 5 - Final Battle for the Crown & Referee Whistle
    const t5 = setTimeout(() => {
      setPhase(5);
      audioService.playRefereeWhistle();
    }, 11400);

    // 13.2s: Seamless transition into the homepage
    const t6 = setTimeout(() => {
      handleFinish();
    }, 13200);

    return () => {
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
      clearTimeout(t6);
    };
  }, []);

  // Club Step Progression: Each of the 6 clubs gets 900ms of dedicated screen time
  useEffect(() => {
    if (phase !== 4) return;

    const clubInterval = setInterval(() => {
      setClubIndex(prev => {
        if (prev < INITIAL_TEAMS.length - 1) {
          const next = prev + 1;
          audioService.playClubTransition(400 + next * 35);
          return next;
        }
        return prev;
      });
    }, 900);

    return () => clearInterval(clubInterval);
  }, [phase]);

  const toggleSound = (e: React.MouseEvent) => {
    e.stopPropagation();
    const muted = audioService.toggleMute();
    setIsMuted(muted);
    if (!muted) {
      audioService.playStadiumAmbience(8);
    }
  };

  const INTRO_CLUBS = [
    INITIAL_TEAMS.find(t => t.name === 'Crystal Palace') || INITIAL_TEAMS[0],
    INITIAL_TEAMS.find(t => t.name === 'Spurs') || INITIAL_TEAMS[1],
    INITIAL_TEAMS.find(t => t.name === 'Aston Villa') || INITIAL_TEAMS[2],
    INITIAL_TEAMS.find(t => t.name === 'Brighton') || INITIAL_TEAMS[3],
    INITIAL_TEAMS.find(t => t.name === 'Fulham') || INITIAL_TEAMS[4],
    INITIAL_TEAMS.find(t => t.name === 'Nottingham Forest') || INITIAL_TEAMS[5],
  ];

  const currentClub = INTRO_CLUBS[clubIndex] || INTRO_CLUBS[0];

  return (
    <AnimatePresence>
      <motion.div
        key="cinematic-broadcast-intro"
        initial={{ opacity: 1 }}
        exit={{ opacity: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } }}
        className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#07090D] text-[#F4F4F0] overflow-hidden select-none"
      >
        {/* RESTRAINED STADIUM LIGHTING LAYER */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute inset-0 pitch-lines opacity-40" />

          {/* Soft Upper Floodlight Glows */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: phase >= 1 ? 0.3 : 0 }}
            transition={{ duration: 2 }}
            className="absolute -top-32 left-1/4 w-[500px] h-[300px] bg-stadium-700/20 blur-[100px] rounded-full"
          />
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: phase >= 1 ? 0.3 : 0 }}
            transition={{ duration: 2, delay: 0.3 }}
            className="absolute -top-32 right-1/4 w-[500px] h-[300px] bg-pitch-600/10 blur-[100px] rounded-full"
          />

          {/* Vignette */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,#07090D_95%)]" />
        </div>

        {/* TOP BROADCAST COMPETITION IDENTIFIER */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: phase >= 2 ? 1 : 0 }}
          transition={{ duration: 0.5 }}
          className="absolute top-8 sm:top-12 z-20 flex items-center gap-2 font-mono text-[11px] tracking-widest text-[#9EA4AD] uppercase"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-pitch-500" />
          <span>OFFICIAL LEAGUE BROADCAST</span>
        </motion.div>

        {/* MAIN CINEMATIC STAGE */}
        <div className="relative z-10 w-full max-w-3xl px-6 flex flex-col items-center justify-center text-center min-h-[380px]">
          
          {/* PHASE 2 & 3: HOSTEL LEAGUE 26 & TOURNAMENT STRUCTURE */}
          {(phase === 2 || phase === 3) && (
            <motion.div
              initial={{ opacity: 0, y: 15, filter: 'blur(8px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-center"
            >
              <h1 className="text-5xl sm:text-7xl md:text-8xl font-black font-display tracking-tight text-white uppercase leading-none">
                HOSTEL LEAGUE
              </h1>

              {phase === 3 && (
                <motion.div
                  initial={{ scale: 1.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 280, damping: 22 }}
                  className="mt-2 text-7xl sm:text-9xl font-black font-display text-gold-400 leading-none"
                >
                  26
                </motion.div>
              )}

              {/* MEANINGFUL TOURNAMENT SPECIFICATION (Replaces random line) */}
              {phase === 3 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                  className="mt-6 pt-5 border-t border-stadium-800 text-xs sm:text-sm font-mono tracking-widest text-[#9EA4AD] uppercase"
                >
                  <span>SIX CLUBS</span>
                  <span className="mx-2.5 text-pitch-500">•</span>
                  <span>FIVE ROUNDS</span>
                  <span className="mx-2.5 text-pitch-500">•</span>
                  <span>FIFTEEN MATCHES</span>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* PHASE 4: CLUB SPOTLIGHT (ALL SIX TEAMS SHOWN CLEARLY FOR ~0.9s EACH) */}
          {phase === 4 && (
            <div className="w-full flex flex-col items-center">
              <div className="text-[11px] font-mono tracking-widest text-[#9EA4AD] uppercase mb-4 flex items-center gap-2">
                <Shield className="w-3.5 h-3.5 text-pitch-500" />
                <span>OFFICIAL CONTENDER {clubIndex + 1} OF 6</span>
              </div>

              {/* Club Card Spotlight */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentClub.id}
                  initial={{ opacity: 0, scale: 0.92, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 1.05, y: -15 }}
                  transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                  className="w-full max-w-md p-8 rounded-card bg-stadium-900 border border-stadium-800 shadow-broadcast relative overflow-hidden"
                >
                  {/* Subtle team color backlighting */}
                  <div
                    className="absolute -top-10 -right-10 w-40 h-40 rounded-full blur-3xl opacity-20 pointer-events-none"
                    style={{ backgroundColor: currentClub.primary_color }}
                  />

                  <div className="flex flex-col items-center justify-center text-center">
                    <TeamBadge team={currentClub} size="xl" glow={true} />

                    <h3 className="text-2xl sm:text-3xl font-black font-display text-white mt-4 uppercase tracking-tight">
                      {currentClub.name}
                    </h3>

                    <div className="mt-2.5 px-3 py-1 rounded-badge bg-stadium-950 border border-stadium-800 text-xs font-mono">
                      <span className="text-[#9EA4AD]">MANAGER: </span>
                      <strong className="text-white uppercase">{currentClub.manager_name}</strong>
                    </div>
                  </div>

                  {/* Club Progress Indicator */}
                  <div className="w-full bg-stadium-950 h-1 rounded-full mt-6 overflow-hidden">
                    <div
                      className="bg-pitch-500 h-full transition-all duration-300"
                      style={{ width: `${((clubIndex + 1) / 6) * 100}%` }}
                    />
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          )}

          {/* PHASE 5: TOURNAMENT TAGLINE REVEAL */}
          {phase === 5 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center"
            >
              <span className="text-xs font-mono tracking-widest uppercase text-pitch-500 mb-3">
                SINGLE ROUND-ROBIN CHAMPIONSHIP
              </span>
              <h2 className="text-4xl sm:text-6xl md:text-7xl font-black font-display uppercase tracking-tight text-white max-w-xl leading-tight">
                THE BATTLE FOR THE CROWN
              </h2>
            </motion.div>
          )}

        </div>

        {/* BOTTOM CONTROLS: SOUND TOGGLE & ELEGANT SKIP */}
        <div className="absolute bottom-8 left-0 right-0 px-6 sm:px-12 flex items-center justify-between z-30">
          
          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-badge bg-stadium-900 border border-stadium-800 text-xs font-mono text-[#9EA4AD] hover:text-white transition-colors"
          >
            {isMuted ? (
              <>
                <VolumeX className="w-3.5 h-3.5 text-slate-500" />
                <span className="hidden sm:inline">SOUND OFF</span>
              </>
            ) : (
              <>
                <Volume2 className="w-3.5 h-3.5 text-pitch-500" />
                <span className="hidden sm:inline">SOUND ON</span>
              </>
            )}
          </button>

          {/* Skip Intro */}
          <button
            onClick={handleFinish}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-badge bg-stadium-900 hover:bg-stadium-850 border border-stadium-800 text-xs font-mono font-bold uppercase tracking-wider text-[#F4F4F0] hover:text-white transition-all group"
          >
            <span>Skip Intro</span>
            <FastForward className="w-3.5 h-3.5 text-gold-400 group-hover:translate-x-1 transition-transform" />
          </button>

        </div>
      </motion.div>
    </AnimatePresence>
  );
};
