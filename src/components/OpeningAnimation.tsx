import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { INITIAL_TEAMS } from '../data/initialData';
import { TeamBadge } from './TeamBadge';
import { audioService } from '../services/audioService';
import { FastForward, Volume2, VolumeX, Shield, ArrowRight } from 'lucide-react';

interface OpeningAnimationProps {
  onComplete: (targetTab?: string) => void;
}

export const OpeningAnimation: React.FC<OpeningAnimationProps> = ({ onComplete }) => {
  // Pacing:
  // Phase 1 (0.0s – 1.8s): Dark Stadium Ambience
  // Phase 2 (1.8s – 3.8s): HOSTEL LEAGUE Typography Reveal
  // Phase 3 (3.8s – 5.2s): 26 Reveal + Tournament Specs (6 Clubs • 5 Rounds • 15 Fixtures)
  // Phase 4 (5.2s – 13.0s): 6 Clubs Spotlight (Full 1.3s of readable screen time for each club)
  // Phase 5 (13.0s – 15.0s): "THE BATTLE FOR THE CROWN" + Referee Whistle & Ball Kick
  // Phase 6 (15.0s+): Tournament Overview Transition ("THE TOURNAMENT IS UNDERWAY")
  const [phase, setPhase] = useState<1 | 2 | 3 | 4 | 5 | 6>(1);
  const [clubIndex, setClubIndex] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(audioService.getMuted());
  const [overviewTimer, setOverviewTimer] = useState<number>(3);
  const completedRef = useRef(false);

  // Exact ordered list of the 6 clubs as specified
  const INTRO_CLUBS = [
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
    audioService.playBallKick();
    localStorage.setItem('hl26_seen_intro', 'true');
    onComplete();
  };

  const handleNavigateToOverview = () => {
    if (completedRef.current) return;
    completedRef.current = true;
    audioService.playBroadcastHit();
    localStorage.setItem('hl26_seen_intro', 'true');
    onComplete('quick-view');
  };

  const handleSkipToTransition = () => {
    if (phase < 6) {
      setPhase(6);
      audioService.playBroadcastHit();
    } else {
      handleFinish();
    }
  };

  // Main Scene Orchestration
  useEffect(() => {
    // 0.0s: Ambient stadium crowd rumble
    audioService.playStadiumAmbience(18);

    // 1.8s: Phase 2 - HOSTEL LEAGUE
    const t2 = setTimeout(() => {
      setPhase(2);
      audioService.playBroadcastHit();
    }, 1800);

    // 3.8s: Phase 3 - 26 & Tournament Specs
    const t3 = setTimeout(() => {
      setPhase(3);
      audioService.playBroadcastHit();
    }, 3800);

    // 5.2s: Phase 4 - Begin 6-Club Broadcast Spotlight
    const t4 = setTimeout(() => {
      setPhase(4);
      setClubIndex(0);
      audioService.playClubTransition(380);
    }, 5200);

    // 13.0s: Phase 5 - Final Battle for the Crown & Referee Whistle
    const t5 = setTimeout(() => {
      setPhase(5);
      audioService.playRefereeWhistle();
    }, 13000);

    // 15.0s: Ball Kick & Move to Tournament Overview Transition
    const t6 = setTimeout(() => {
      audioService.playBallKick();
      setPhase(6);
    }, 15000);

    return () => {
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
      clearTimeout(t6);
    };
  }, []);

  // Phase 6 Countdown to auto-navigate to Quick Tournament View
  useEffect(() => {
    if (phase !== 6) return;

    const interval = setInterval(() => {
      setOverviewTimer(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          handleNavigateToOverview();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [phase]);

  // Club Step Progression: Each of the 6 clubs gets 1300ms of dedicated screen time
  useEffect(() => {
    if (phase !== 4) return;

    const clubInterval = setInterval(() => {
      setClubIndex(prev => {
        if (prev < INTRO_CLUBS.length - 1) {
          const next = prev + 1;
          audioService.playClubTransition(380 + next * 40);
          return next;
        }
        return prev;
      });
    }, 1300);

    return () => clearInterval(clubInterval);
  }, [phase]);

  const toggleSound = (e: React.MouseEvent) => {
    e.stopPropagation();
    const muted = audioService.toggleMute();
    setIsMuted(muted);
    if (!muted) {
      audioService.playStadiumAmbience(10);
    }
  };

  const currentClub = INTRO_CLUBS[clubIndex] || INTRO_CLUBS[0];

  return (
    <AnimatePresence>
      <motion.div
        key="cinematic-broadcast-intro"
        initial={{ opacity: 1 }}
        exit={{ opacity: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }}
        className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#07090D] text-[#F4F4F0] overflow-hidden select-none"
      >
        {/* RESTRAINED STADIUM ATMOSPHERE LAYER */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute inset-0 pitch-lines opacity-30" />

          {/* Upper Stadium Lighting */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: phase >= 1 ? 0.25 : 0 }}
            transition={{ duration: 1.8 }}
            className="absolute -top-32 left-1/4 w-[500px] h-[300px] bg-stadium-700/20 blur-[100px] rounded-full"
          />
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: phase >= 1 ? 0.25 : 0 }}
            transition={{ duration: 1.8, delay: 0.2 }}
            className="absolute -top-32 right-1/4 w-[500px] h-[300px] bg-pitch-600/10 blur-[100px] rounded-full"
          />

          {/* Vignette */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_35%,#07090D_95%)]" />
        </div>

        {/* TOP BROADCAST HEADER */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: phase >= 2 ? 1 : 0 }}
          transition={{ duration: 0.4 }}
          className="absolute top-8 sm:top-12 z-20 flex items-center gap-2 font-mono text-[11px] tracking-widest text-[#9EA4AD] uppercase"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-pitch-500" />
          <span>OFFICIAL LEAGUE BROADCAST</span>
        </motion.div>

        {/* MAIN STAGE */}
        <div className="relative z-10 w-full max-w-3xl px-6 flex flex-col items-center justify-center text-center min-h-[380px]">
          
          {/* PHASE 2 & 3: HOSTEL LEAGUE 26 & TOURNAMENT STRUCTURE */}
          {(phase === 2 || phase === 3) && (
            <motion.div
              initial={{ opacity: 0, y: 15, filter: 'blur(6px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-center"
            >
              <h1 className="text-5xl sm:text-7xl md:text-8xl font-black font-display tracking-tight text-white uppercase leading-none">
                HOSTEL LEAGUE
              </h1>

              {phase === 3 && (
                <motion.div
                  initial={{ scale: 1.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 280, damping: 22 }}
                  className="mt-2 text-7xl sm:text-9xl font-black font-display text-gold-400 leading-none"
                >
                  26
                </motion.div>
              )}

              {/* TOURNAMENT SPECIFICATIONS (Replaced random horizontal line with actual tournament structure) */}
              {phase === 3 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.15 }}
                  className="mt-6 pt-5 border-t border-stadium-800 text-xs sm:text-sm font-mono tracking-widest text-[#9EA4AD] uppercase"
                >
                  <span>SIX CLUBS</span>
                  <span className="mx-2.5 text-pitch-500">•</span>
                  <span>FIVE ROUNDS</span>
                  <span className="mx-2.5 text-pitch-500">•</span>
                  <span>FIFTEEN FIXTURES</span>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* PHASE 4: CLUB SPOTLIGHT (ALL SIX TEAMS SHOWN CLEARLY FOR FULL 1.2s EACH) */}
          {phase === 4 && (
            <div className="w-full flex flex-col items-center">
              <div className="text-[11px] font-mono tracking-widest text-[#9EA4AD] uppercase mb-4 flex items-center gap-2">
                <Shield className="w-3.5 h-3.5 text-pitch-500" />
                <span>OFFICIAL CONTENDER {clubIndex + 1} OF 6</span>
              </div>

              {/* Club Spotlight Card */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentClub.id}
                  initial={{ opacity: 0, scale: 0.97, y: 8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 1.01, y: -8 }}
                  transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
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

          {/* PHASE 5: THE BATTLE FOR THE CROWN */}
          {phase === 5 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
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

          {/* PHASE 6: TOURNAMENT OVERVIEW TRANSITION */}
          {phase === 6 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="flex flex-col items-center max-w-xl mx-auto px-4"
            >
              <div className="flex items-center gap-2 font-mono text-[11px] font-bold tracking-widest text-pitch-500 uppercase mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-pitch-500 animate-pulse" />
                <span>OFFICIAL BROADCAST TRANSITION</span>
              </div>

              <h2 className="text-4xl sm:text-6xl font-black font-display uppercase tracking-tight text-white leading-tight">
                HOSTEL LEAGUE <span className="text-gold-400">26</span>
              </h2>

              <p className="mt-3 text-lg sm:text-2xl font-display font-extrabold uppercase tracking-wide text-white">
                THE TOURNAMENT IS UNDERWAY
              </p>

              <div className="mt-2 text-xs sm:text-sm font-mono tracking-widest text-[#9EA4AD] uppercase flex items-center gap-2">
                <span>6 CLUBS</span>
                <span className="text-pitch-500">•</span>
                <span>5 ROUNDS</span>
                <span className="text-pitch-500">•</span>
                <span>15 MATCHES</span>
              </div>

              {/* Progress bar leading into Quick Tournament Overview */}
              <div className="w-full max-w-sm mt-8 p-4 rounded-card bg-stadium-900 border border-stadium-800 shadow-broadcast">
                <div className="flex items-center justify-between text-[11px] font-mono text-[#9EA4AD] uppercase mb-2">
                  <span className="text-white font-bold">CONNECTING TOURNAMENT OVERVIEW</span>
                  <span className="text-pitch-400 font-bold">{overviewTimer}s</span>
                </div>
                <div className="w-full bg-stadium-950 h-1.5 rounded-full overflow-hidden border border-stadium-850">
                  <motion.div
                    initial={{ width: '0%' }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 3, ease: 'linear' }}
                    className="bg-pitch-500 h-full"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex flex-col sm:flex-row items-center gap-3 w-full max-w-sm">
                <button
                  onClick={handleNavigateToOverview}
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-badge bg-pitch-600 hover:bg-pitch-500 text-[#07090D] font-mono font-bold text-xs uppercase tracking-wider transition-colors shadow-broadcast"
                >
                  <span>Enter Tournament Overview</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={handleFinish}
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-badge bg-stadium-900 hover:bg-stadium-850 border border-stadium-800 text-white font-mono font-semibold text-xs uppercase tracking-wider transition-colors"
                >
                  <span>Explore Full Broadcast Hub</span>
                </button>
              </div>
            </motion.div>
          )}

        </div>

        {/* BOTTOM CONTROLS: SOUND & SKIP INTRO */}
        <div className="absolute bottom-8 left-0 right-0 px-6 sm:px-12 flex items-center justify-between z-30">
          
          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-badge bg-stadium-900 border border-stadium-800 text-xs font-mono text-[#9EA4AD] hover:text-white transition-colors"
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
            onClick={handleSkipToTransition}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-badge bg-stadium-900 hover:bg-stadium-850 border border-stadium-800 text-xs font-mono font-bold uppercase tracking-wider text-[#F4F4F0] hover:text-white transition-all group"
          >
            <span>{phase === 6 ? 'Enter Hub' : 'Skip Intro'}</span>
            <FastForward className="w-3.5 h-3.5 text-gold-400 group-hover:translate-x-1 transition-transform" />
          </button>

        </div>
      </motion.div>
    </AnimatePresence>
  );
};
