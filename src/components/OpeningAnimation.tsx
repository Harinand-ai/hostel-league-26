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
  // Intro scenes:
  // 1: Black screen with ambient light beginning
  // 2: Stadium floodlights power up & light beams
  // 3: "HOSTEL LEAGUE" typography reveal
  // 4: "26" explosive badge with gold radiance
  // 5: Broadcast club spotlight (cycling the 6 teams)
  // 6: "THE BATTLE FOR THE CROWN" finale
  const [scene, setScene] = useState<1 | 2 | 3 | 4 | 5 | 6>(1);
  const [activeTeamIdx, setActiveTeamIdx] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(audioService.getMuted());
  const completedRef = useRef(false);

  const finishIntro = () => {
    if (completedRef.current) return;
    completedRef.current = true;
    onComplete();
  };

  useEffect(() => {
    // Scene 1: Initial black ambient hum
    audioService.playStadiumRumble(5.5);

    // Scene 2: Stadium Floodlights awaken at 1.0s
    const t1 = setTimeout(() => {
      setScene(2);
    }, 1000);

    // Scene 3: "HOSTEL LEAGUE" reveal at 1.8s
    const t2 = setTimeout(() => {
      setScene(3);
      audioService.playImpactHit();
    }, 1800);

    // Scene 4: "26" explosive gold hit at 2.8s
    const t3 = setTimeout(() => {
      setScene(4);
      audioService.playImpactHit();
    }, 2800);

    // Scene 5: Broadcast club introductions at 3.9s
    const t4 = setTimeout(() => {
      setScene(5);
    }, 3900);

    // Scene 6: "THE BATTLE FOR THE CROWN" at 6.1s
    const t5 = setTimeout(() => {
      setScene(6);
      audioService.playImpactHit();
    }, 6100);

    // Finish & transition to homepage at 7.4s
    const t6 = setTimeout(() => {
      finishIntro();
    }, 7400);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
      clearTimeout(t6);
    };
  }, []);

  // Cycle through all 6 clubs during Scene 5
  useEffect(() => {
    if (scene !== 5) return;
    audioService.playCardWhoosh();
    const interval = setInterval(() => {
      setActiveTeamIdx(prev => {
        if (prev < INITIAL_TEAMS.length - 1) {
          audioService.playCardWhoosh();
          return prev + 1;
        }
        return prev;
      });
    }, 360);

    return () => clearInterval(interval);
  }, [scene]);

  const handleToggleSound = (e: React.MouseEvent) => {
    e.stopPropagation();
    const muted = audioService.toggleMute();
    setIsMuted(muted);
    if (!muted) {
      audioService.playStadiumRumble(2);
    }
  };

  const currentTeam = INITIAL_TEAMS[activeTeamIdx] || INITIAL_TEAMS[0];

  return (
    <AnimatePresence>
      <motion.div
        key="cinematic-intro"
        initial={{ opacity: 1 }}
        exit={{ opacity: 0, scale: 1.04, filter: 'blur(8px)', transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }}
        className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#030508] text-white overflow-hidden select-none"
      >
        {/* ATMOSPHERIC STADIUM LIGHTING LAYER */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Pitch lines background texture */}
          <div className="absolute inset-0 pitch-lines opacity-20" />

          {/* Left Floodlight Beam */}
          <motion.div
            initial={{ opacity: 0, rotate: -40, scaleY: 0.2 }}
            animate={{
              opacity: scene >= 2 ? [0.15, 0.3, 0.2] : 0,
              rotate: scene >= 2 ? -25 : -40,
              scaleY: scene >= 2 ? 1.5 : 0.2,
            }}
            transition={{ duration: 2, ease: 'easeOut' }}
            className="absolute -top-40 -left-20 w-[450px] h-[900px] bg-gradient-to-b from-sky-400/25 via-emerald-400/10 to-transparent blur-[80px] origin-top"
          />

          {/* Right Floodlight Beam */}
          <motion.div
            initial={{ opacity: 0, rotate: 40, scaleY: 0.2 }}
            animate={{
              opacity: scene >= 2 ? [0.15, 0.35, 0.25] : 0,
              rotate: scene >= 2 ? 25 : 40,
              scaleY: scene >= 2 ? 1.5 : 0.2,
            }}
            transition={{ duration: 2, ease: 'easeOut', delay: 0.2 }}
            className="absolute -top-40 -right-20 w-[450px] h-[900px] bg-gradient-to-b from-emerald-400/25 via-sky-400/10 to-transparent blur-[80px] origin-top"
          />

          {/* Center Stadium Halo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{
              opacity: scene >= 2 ? 0.35 : 0,
              scale: scene >= 2 ? 1.2 : 0.5,
            }}
            transition={{ duration: 2.2 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[750px] h-[450px] bg-gradient-to-tr from-stadium-750/30 via-emerald-500/10 to-transparent rounded-full blur-[120px]"
          />

          {/* Dark Vignette */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,#030508_95%)]" />
        </div>

        {/* BROADCAST PRESENTATION HEADER BADGE */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: scene >= 2 ? 1 : 0, y: scene >= 2 ? 0 : -20 }}
          transition={{ duration: 0.5 }}
          className="absolute top-8 md:top-12 z-20 flex items-center gap-2 px-4 py-1.5 rounded-full bg-stadium-900/90 border border-slate-700/60 backdrop-blur-md shadow-2xl"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-[10px] md:text-xs font-mono font-bold tracking-[0.25em] uppercase text-slate-300">
            OFFICIAL TOURNAMENT BROADCAST
          </span>
        </motion.div>

        {/* SCENES CONTAINER */}
        <div className="relative z-10 w-full max-w-4xl px-4 flex flex-col items-center justify-center text-center min-h-[400px]">
          
          {/* SCENE 3 & 4: TITLE & YEAR REVEAL */}
          {(scene === 3 || scene === 4) && (
            <div className="flex flex-col items-center">
              <motion.div
                initial={{ opacity: 0, y: 40, filter: 'blur(12px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-1"
              >
                <span className="text-xs sm:text-sm font-mono font-bold uppercase tracking-[0.4em] text-emerald-400 block mb-2">
                  THE PREMIER HOSTEL FOOTBALL LEAGUE
                </span>
                
                <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black font-display tracking-tight text-white uppercase leading-none">
                  HOSTEL
                </h1>
                
                <h2 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black font-display tracking-tight text-slate-300 uppercase leading-none">
                  LEAGUE
                </h2>
              </motion.div>

              {scene === 4 && (
                <motion.div
                  initial={{ scale: 2.8, opacity: 0, filter: 'blur(20px)' }}
                  animate={{ scale: 1, opacity: 1, filter: 'blur(0px)' }}
                  transition={{ type: 'spring', stiffness: 320, damping: 22 }}
                  className="relative mt-3"
                >
                  <span className="text-8xl sm:text-9xl md:text-[13rem] font-black font-display tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-gold-300 via-amber-400 to-yellow-600 drop-shadow-[0_0_50px_rgba(245,158,11,0.6)] leading-none select-none">
                    26
                  </span>
                  {/* Light sweep gleam */}
                  <motion.div
                    initial={{ left: '-100%' }}
                    animate={{ left: '200%' }}
                    transition={{ duration: 0.8, ease: 'easeInOut' }}
                    className="absolute inset-y-0 w-24 bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-12 pointer-events-none"
                  />
                </motion.div>
              )}
            </div>
          )}

          {/* SCENE 5: BROADCAST CLUB CONTENDER INTRODUCTIONS */}
          {scene === 5 && (
            <motion.div
              key="team-spotlight"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="w-full max-w-xl flex flex-col items-center"
            >
              <div className="text-[11px] font-mono font-extrabold uppercase tracking-[0.35em] text-slate-400 mb-6 flex items-center gap-2">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                CONTENDER {activeTeamIdx + 1} OF 6
              </div>

              {/* Animated Club Card */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentTeam.id}
                  initial={{ opacity: 0, scale: 0.85, y: 25 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 1.1, y: -25 }}
                  transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                  className="w-full p-6 sm:p-8 rounded-2xl bg-gradient-to-b from-stadium-900/95 to-stadium-950/95 border border-stadium-750/80 backdrop-blur-xl shadow-2xl relative overflow-hidden"
                >
                  {/* Subtle team color backglow */}
                  <div
                    className="absolute -top-12 -right-12 w-48 h-48 rounded-full blur-3xl opacity-30 pointer-events-none"
                    style={{ backgroundColor: currentTeam.primary_color }}
                  />

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                    <TeamBadge team={currentTeam} size="xl" glow={true} />

                    <div className="text-center sm:text-left">
                      <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded bg-stadium-800 text-gold-400 border border-stadium-700 uppercase">
                        {currentTeam.short_name}
                      </span>
                      <h3 className="text-2xl sm:text-4xl font-black font-display text-white mt-1.5 uppercase tracking-wide">
                        {currentTeam.name}
                      </h3>
                      <div className="mt-2 text-xs font-mono text-slate-300 flex items-center justify-center sm:justify-start gap-1.5">
                        <span className="text-slate-400 font-sans">MANAGER:</span>
                        <span className="font-bold text-white uppercase px-1.5 py-0.5 rounded bg-stadium-850 border border-stadium-700">
                          {currentTeam.manager_name}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Club Progress Bar */}
                  <div className="w-full bg-stadium-800 h-1 rounded-full mt-6 overflow-hidden">
                    <motion.div
                      className="bg-emerald-400 h-full rounded-full"
                      initial={{ width: '0%' }}
                      animate={{ width: `${((activeTeamIdx + 1) / 6) * 100}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </motion.div>
              </AnimatePresence>
            </motion.div>
          )}

          {/* SCENE 6: TOURNAMENT TAGLINE REVEAL */}
          {scene === 6 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, filter: 'blur(10px)' }}
              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-center"
            >
              <span className="text-xs sm:text-sm font-mono font-bold tracking-[0.3em] uppercase text-gold-400 mb-3">
                SINGLE ROUND-ROBIN CHAMPIONSHIP
              </span>
              <h2 className="text-4xl sm:text-6xl md:text-7xl font-black font-display uppercase tracking-tight text-white max-w-2xl leading-none">
                THE BATTLE FOR THE CROWN
              </h2>
              <div className="mt-6 flex items-center gap-3 text-xs font-mono text-slate-400">
                <span>15 MATCHES</span>
                <span>•</span>
                <span>6 CLUBS</span>
                <span>•</span>
                <span>1 CHAMPION</span>
              </div>
            </motion.div>
          )}

        </div>

        {/* BOTTOM CONTROLS: SOUND & ELEGANT SKIP */}
        <div className="absolute bottom-8 left-0 right-0 px-6 sm:px-12 flex items-center justify-between z-30">
          
          {/* Sound Toggle */}
          <button
            onClick={handleToggleSound}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-stadium-900/80 hover:bg-stadium-800 border border-slate-700/60 text-xs font-mono text-slate-300 hover:text-white backdrop-blur-md transition-colors"
          >
            {isMuted ? (
              <>
                <VolumeX className="w-3.5 h-3.5 text-slate-400" />
                <span className="hidden sm:inline">SOUND OFF</span>
              </>
            ) : (
              <>
                <Volume2 className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                <span className="hidden sm:inline">SOUND ON</span>
              </>
            )}
          </button>

          {/* Elegant Skip Intro */}
          <button
            onClick={finishIntro}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-stadium-900/90 hover:bg-stadium-800 border border-slate-700/80 hover:border-slate-500 text-xs font-display font-bold uppercase tracking-wider text-slate-300 hover:text-white backdrop-blur-md transition-all group"
          >
            <span>Skip Intro</span>
            <FastForward className="w-3.5 h-3.5 text-gold-400 group-hover:translate-x-1 transition-transform" />
          </button>

        </div>
      </motion.div>
    </AnimatePresence>
  );
};
