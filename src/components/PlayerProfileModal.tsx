import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Player, Team, Match, Goal, Assist, ManOfTheMatch, TeamStanding } from '../types/tournament';
import { TeamBadge } from './TeamBadge';
import { 
  X, 
  Shield, 
  Flame, 
  Award, 
  Calendar, 
  Trophy, 
  Users, 
  Compass, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  ChevronRight,
  Sparkles
} from 'lucide-react';

interface PlayerProfileModalProps {
  player: Player | null;
  team?: Team;
  matches: Match[];
  goals: Goal[];
  assists: Assist[];
  motms: ManOfTheMatch[];
  standings: TeamStanding[];
  allPlayers: Player[];
  allTeams: Team[];
  onClose: () => void;
  onNavigateToTeam?: (teamId: string) => void;
  onNavigateToMatch?: (matchId: string) => void;
}

// Animated counter for stats
const AnimatedNumber: React.FC<{ value: number }> = ({ value }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    if (value === 0) {
      setDisplayValue(0);
      return;
    }
    const duration = 600; // ms
    const steps = 24;
    const stepTime = duration / steps;
    const increment = value / steps;
    let current = 0;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      current = Math.min(value, Math.round(step * increment));
      setDisplayValue(current);
      if (step >= steps) {
        clearInterval(timer);
        setDisplayValue(value);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [value]);

  return <span>{displayValue}</span>;
};

export const PlayerProfileModal: React.FC<PlayerProfileModalProps> = ({
  player,
  team,
  matches,
  goals,
  assists,
  motms,
  standings,
  allPlayers,
  allTeams,
  onClose,
  onNavigateToTeam,
  onNavigateToMatch,
}) => {
  const [imageError, setImageError] = useState(false);

  // Reset image error state whenever player changes
  useEffect(() => {
    setImageError(false);
  }, [player?.id]);

  // Handle ESC key to dismiss
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Lock body scroll while modal is open
  useEffect(() => {
    if (player) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [player]);

  const teamsMap = useMemo(() => new Map(allTeams.map(t => [t.id, t])), [allTeams]);

  if (!player) return null;

  // Real statistics computation
  const teamMatches = matches.filter(
    m => m.home_team_id === player.team_id || m.away_team_id === player.team_id
  );
  const completedMatches = teamMatches.filter(m => m.status === 'COMPLETED');
  const matchesPlayed = completedMatches.length;

  const playerGoals = goals.filter(g => g.player_id === player.id);
  const playerAssists = assists.filter(a => a.player_id === player.id);
  const playerMotms = motms.filter(m => m.player_id === player.id);

  // Clean sheets (only if GK or CB)
  const isDefensive = player.position === 'GK' || player.position === 'CB';
  const cleanSheetsCount = completedMatches.filter(m => {
    const isHome = m.home_team_id === player.team_id;
    return isHome ? m.away_score === 0 : m.home_score === 0;
  }).length;

  // Standing
  const standing = standings.find(s => s.team.id === player.team_id);

  // Next fixture
  const nextMatch = teamMatches.find(m => m.status === 'UPCOMING' || m.status === 'LIVE');
  const nextOpponentId = nextMatch
    ? nextMatch.home_team_id === player.team_id
      ? nextMatch.away_team_id
      : nextMatch.home_team_id
    : null;
  const nextOpponent = nextOpponentId ? teamsMap.get(nextOpponentId) : null;

  const teamColor = team?.primary_color || '#1e293b';

  const positionFullName = (pos: string) => {
    switch (pos) {
      case 'GK': return 'Goalkeeper';
      case 'CB': return 'Center Back';
      case 'MID': return 'Midfielder';
      case 'CF': return 'Center Forward';
      default: return 'Squad Player';
    }
  };

  const hasPhoto = Boolean(player.photo_url) && !imageError;
  const initials = player.name
    .split(/\s+/)
    .map(p => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
        
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={onClose}
          className="fixed inset-0 bg-stadium-980/85 backdrop-blur-md"
        />

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 16 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-2xl bg-[#090d16] border border-stadium-750 rounded-3xl overflow-hidden shadow-broadcast z-10 my-auto max-h-[92vh] flex flex-col"
        >
          {/* Restrained Team Accent Rim Lighting */}
          <div
            className="absolute -top-32 -right-32 w-80 h-80 rounded-full blur-[100px] opacity-20 pointer-events-none"
            style={{ backgroundColor: teamColor }}
          />
          <div
            className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full blur-[100px] opacity-15 pointer-events-none"
            style={{ backgroundColor: team?.secondary_color || teamColor }}
          />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-stadium-950/80 hover:bg-stadium-850 border border-stadium-750 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
            aria-label="Close Profile"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Scrollable Content Container */}
          <div className="overflow-y-auto p-5 sm:p-8 space-y-6">

            {/* PLAYER HERO SECTION */}
            <div className="relative flex flex-col sm:flex-row items-center sm:items-start gap-6 pt-2 pb-4 border-b border-stadium-800">
              
              {/* PHOTO / AVATAR CONTAINER */}
              <div className="relative shrink-0">
                <div
                  className="w-32 h-40 sm:w-36 sm:h-44 rounded-2xl overflow-hidden border-2 bg-stadium-950 shadow-2xl relative"
                  style={{ borderColor: `${teamColor}80` }}
                >
                  {hasPhoto ? (
                    <>
                      <img
                        src={player.photo_url}
                        alt={player.name}
                        onError={() => setImageError(true)}
                        className="w-full h-full object-cover object-top"
                      />
                      {/* Gradient vignette for editorial tone */}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#090d16]/80 via-transparent to-transparent pointer-events-none" />
                    </>
                  ) : (
                    <div
                      className="w-full h-full flex flex-col items-center justify-center relative p-3 text-center"
                      style={{
                        background: `radial-gradient(circle at 50% 30%, ${teamColor}40, #080d17 85%)`,
                      }}
                    >
                      <div
                        className="w-12 h-1.5 rounded-full mb-3 opacity-70"
                        style={{ backgroundColor: teamColor }}
                      />
                      <span className="font-display font-black text-3xl tracking-wider text-slate-100">
                        {initials}
                      </span>
                      <span className="text-[10px] font-mono font-bold tracking-widest uppercase text-slate-400 mt-1">
                        NO PHOTO
                      </span>
                    </div>
                  )}
                </div>

                {/* Captain Badge */}
                {player.is_captain && (
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 sm:left-auto sm:right-2 sm:translate-x-0 px-2.5 py-0.5 rounded-full bg-gold-400 text-stadium-980 text-[10px] font-mono font-black uppercase tracking-wider border border-stadium-950 shadow-gold-glow flex items-center gap-1">
                    <Trophy className="w-3 h-3" />
                    <span>CAPTAIN</span>
                  </div>
                )}
              </div>

              {/* PLAYER INFO */}
              <div className="flex-1 text-center sm:text-left space-y-2.5">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 font-mono">
                  {/* Position Pill */}
                  <span className={`px-2.5 py-0.5 rounded-md text-xs font-bold font-mono uppercase tracking-wider border ${
                    player.position === 'GK'
                      ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                      : player.position === 'CB'
                      ? 'bg-sky-500/15 text-sky-300 border-sky-500/30'
                      : player.position === 'CF'
                      ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                      : player.position === 'MID'
                      ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                      : 'bg-stadium-850 text-slate-300 border-stadium-700'
                  }`}>
                    {player.position} • {positionFullName(player.position)}
                  </span>

                  {/* HL26 Official Badge */}
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-widest bg-stadium-850 text-slate-400 border border-stadium-750">
                    HL26 ROSTER
                  </span>
                </div>

                {/* Player Name */}
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black font-display text-white tracking-tight uppercase leading-none">
                  {player.name}
                </h2>

                {/* Club / Team Bar */}
                {team && (
                  <div className="pt-1 flex flex-wrap items-center justify-center sm:justify-start gap-3">
                    <button
                      onClick={() => {
                        onClose();
                        if (onNavigateToTeam) onNavigateToTeam(team.id);
                      }}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-stadium-950/80 hover:bg-stadium-900 border border-stadium-750 transition-colors group"
                    >
                      <TeamBadge team={team} size="xs" />
                      <span className="text-sm font-display font-black uppercase text-white group-hover:text-gold-400 transition-colors">
                        {team.name}
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-gold-400 transition-colors" />
                    </button>

                    <div className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-400">
                      <Shield className="w-3.5 h-3.5 text-emerald-400" />
                      <span>MANAGER:</span>
                      <strong className="text-slate-200 uppercase">{team.manager_name}</strong>
                    </div>
                  </div>
                )}
              </div>

            </div>

            {/* STATISTICAL CARDS: MATCHES | GOALS | ASSISTS | MOTM (+ CLEAN SHEETS for GK/CB) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between font-mono">
                <span className="text-xs uppercase font-bold tracking-wider text-slate-400">
                  OFFICIAL TOURNAMENT RECORD
                </span>
                <span className="text-[10px] text-slate-400 uppercase">
                  VERIFIED REAL MATCH DATA
                </span>
              </div>

              <div className={`grid gap-2.5 ${isDefensive ? 'grid-cols-2 sm:grid-cols-5' : 'grid-cols-2 sm:grid-cols-4'}`}>
                
                {/* MATCHES PLAYED */}
                <div className="p-3.5 rounded-2xl bg-stadium-950/80 border border-stadium-800 text-center flex flex-col justify-center">
                  <span className="text-[10px] uppercase font-mono font-bold text-slate-400 tracking-wider">
                    MATCHES
                  </span>
                  <span className="text-2xl sm:text-3xl font-black font-display text-white mt-0.5">
                    <AnimatedNumber value={matchesPlayed} />
                  </span>
                  <span className="text-[9px] font-mono text-slate-400 uppercase mt-0.5">
                    APPEARANCES
                  </span>
                </div>

                {/* GOALS */}
                <div className="p-3.5 rounded-2xl bg-stadium-950/80 border border-stadium-800 text-center flex flex-col justify-center">
                  <span className="text-[10px] uppercase font-mono font-bold text-slate-400 tracking-wider flex items-center justify-center gap-1">
                    <Flame className="w-3 h-3 text-gold-400" />
                    GOALS
                  </span>
                  <span className="text-2xl sm:text-3xl font-black font-display text-gold-400 mt-0.5">
                    <AnimatedNumber value={playerGoals.length} />
                  </span>
                  <span className="text-[9px] font-mono text-slate-400 uppercase mt-0.5">
                    TOURNAMENT
                  </span>
                </div>

                {/* ASSISTS */}
                <div className="p-3.5 rounded-2xl bg-stadium-950/80 border border-stadium-800 text-center flex flex-col justify-center">
                  <span className="text-[10px] uppercase font-mono font-bold text-slate-400 tracking-wider flex items-center justify-center gap-1">
                    <Compass className="w-3 h-3 text-sky-400" />
                    ASSISTS
                  </span>
                  <span className="text-2xl sm:text-3xl font-black font-display text-sky-400 mt-0.5">
                    <AnimatedNumber value={playerAssists.length} />
                  </span>
                  <span className="text-[9px] font-mono text-slate-400 uppercase mt-0.5">
                    PLAYMAKER
                  </span>
                </div>

                {/* MOTM */}
                <div className="p-3.5 rounded-2xl bg-stadium-950/80 border border-stadium-800 text-center flex flex-col justify-center">
                  <span className="text-[10px] uppercase font-mono font-bold text-slate-400 tracking-wider flex items-center justify-center gap-1">
                    <Award className="w-3 h-3 text-emerald-400" />
                    MOTM
                  </span>
                  <span className="text-2xl sm:text-3xl font-black font-display text-emerald-400 mt-0.5">
                    <AnimatedNumber value={playerMotms.length} />
                  </span>
                  <span className="text-[9px] font-mono text-slate-400 uppercase mt-0.5">
                    MVP AWARDS
                  </span>
                </div>

                {/* CLEAN SHEETS (GK / CB) */}
                {isDefensive && (
                  <div className="p-3.5 rounded-2xl bg-stadium-950/80 border border-stadium-800 text-center flex flex-col justify-center col-span-2 sm:col-span-1">
                    <span className="text-[10px] uppercase font-mono font-bold text-slate-400 tracking-wider flex items-center justify-center gap-1">
                      <Shield className="w-3 h-3 text-indigo-400" />
                      CLEAN SHEETS
                    </span>
                    <span className="text-2xl sm:text-3xl font-black font-display text-indigo-400 mt-0.5">
                      <AnimatedNumber value={cleanSheetsCount} />
                    </span>
                    <span className="text-[9px] font-mono text-slate-400 uppercase mt-0.5">
                      SHUTOUTS
                    </span>
                  </div>
                )}

              </div>
            </div>

            {/* DETAILED RECORD EVENTS (Goals or MOTMs if recorded) */}
            {(playerGoals.length > 0 || playerMotms.length > 0) && (
              <div className="p-4 rounded-2xl bg-stadium-950/60 border border-stadium-800 space-y-3 font-mono">
                <span className="text-xs uppercase font-bold tracking-wider text-slate-400 block">
                  MATCH CONTRIBUTIONS
                </span>
                
                <div className="space-y-2">
                  {playerGoals.map(goal => {
                    const match = matches.find(m => m.id === goal.match_id);
                    const opponent = match
                      ? teamsMap.get(match.home_team_id === player.team_id ? match.away_team_id : match.home_team_id)
                      : null;
                    return (
                      <div
                        key={goal.id}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-stadium-900 border border-stadium-800 text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-md bg-gold-500/20 text-gold-400 flex items-center justify-center text-xs">
                            ⚽
                          </span>
                          <span className="text-white font-bold">
                            Goal {goal.minute ? `(${goal.minute}')` : ''}
                          </span>
                          {opponent && (
                            <span className="text-slate-400">
                              vs {opponent.name}
                            </span>
                          )}
                        </div>
                        {match && (
                          <span className="text-[10px] text-slate-400 uppercase">
                            Match {match.match_number}
                          </span>
                        )}
                      </div>
                    );
                  })}

                  {playerMotms.map(motm => {
                    const match = matches.find(m => m.id === motm.match_id);
                    return (
                      <div
                        key={motm.id}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-amber-500/10 border border-gold-500/30 text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <Award className="w-4 h-4 text-gold-400" />
                          <span className="text-gold-300 font-bold uppercase tracking-wider">
                            Man of the Match
                          </span>
                        </div>
                        {match && (
                          <span className="text-[10px] text-gold-400 uppercase">
                            Match {match.match_number}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TOURNAMENT CONTEXT: STANDING & NEXT UP */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              
              {/* Current Club Standing */}
              {standing && (
                <div className="p-4 rounded-2xl bg-stadium-950/80 border border-stadium-800 space-y-2 font-mono">
                  <div className="flex items-center justify-between text-xs text-slate-400 uppercase font-bold">
                    <span>CLUB STANDING</span>
                    <span className="text-gold-400">RANK #{standing.position}</span>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <div>
                      <span className="text-xl font-display font-black text-white">{standing.points}</span>
                      <span className="text-[10px] text-slate-400 block -mt-1 uppercase">POINTS</span>
                    </div>
                    <div>
                      <span className="text-xl font-display font-black text-slate-300">{standing.played}</span>
                      <span className="text-[10px] text-slate-400 block -mt-1 uppercase">PLAYED</span>
                    </div>
                    <div>
                      <span className="text-xl font-display font-black text-slate-300">{standing.goal_difference > 0 ? `+${standing.goal_difference}` : standing.goal_difference}</span>
                      <span className="text-[10px] text-slate-400 block -mt-1 uppercase">GD</span>
                    </div>
                    <div>
                      <span className="text-xl font-display font-black text-slate-300">
                        {standing.won}-{standing.drawn}-{standing.lost}
                      </span>
                      <span className="text-[10px] text-slate-400 block -mt-1 uppercase">W-D-L</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Next Fixture Preview */}
              <div className="p-4 rounded-2xl bg-stadium-950/80 border border-stadium-800 space-y-2 font-mono">
                <div className="flex items-center justify-between text-xs text-slate-400 uppercase font-bold">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                    NEXT FIXTURE
                  </span>
                  {nextMatch && (
                    <span className="text-emerald-400">ROUND {nextMatch.round_number}</span>
                  )}
                </div>

                {nextMatch && nextOpponent ? (
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-2.5">
                      <TeamBadge team={nextOpponent} size="sm" />
                      <div>
                        <span className="text-xs font-display font-black uppercase text-white block">
                          vs {nextOpponent.name}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {nextMatch.venue || 'Venue TBA'}
                        </span>
                      </div>
                    </div>
                    {onNavigateToMatch && (
                      <button
                        onClick={() => {
                          onClose();
                          onNavigateToMatch(nextMatch.id);
                        }}
                        className="text-[10px] uppercase font-bold text-gold-400 hover:text-white transition-colors"
                      >
                        Preview →
                      </button>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 pt-2">All tournament matches concluded.</p>
                )}
              </div>

            </div>

          </div>

          {/* Bottom Action Footer */}
          <div className="p-4 bg-stadium-950/90 border-t border-stadium-800 flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400 text-[11px]">
              Hostel League 26 • Official Squad Member
            </span>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-stadium-850 hover:bg-stadium-800 text-slate-300 hover:text-white font-bold uppercase transition-colors"
            >
              Close
            </button>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};
