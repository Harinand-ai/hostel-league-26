import React from 'react';
import { Team, Match, TeamStanding, PlayerStatEntry, Player, POTMPoll } from '../types/tournament';
import { BroadcastMatchHero } from '../components/BroadcastMatchHero';
import { ResultCard } from '../components/ResultCard';
import { TeamBadge } from '../components/TeamBadge';
import { Radio, ArrowRight, Trophy, Award, Shield, FileText } from 'lucide-react';

interface HomePageProps {
  teams: Team[];
  matches: Match[];
  standings: TeamStanding[];
  topScorers: PlayerStatEntry[];
  players?: Player[];
  activePolls?: POTMPoll[];
  onNavigate: (tab: string, param?: string) => void;
  onOpenLiveWindow?: () => void;
  onSelectPlayer?: (playerId: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  teams,
  matches,
  standings,
  topScorers,
  players = [],
  activePolls = [],
  onNavigate,
  onOpenLiveWindow,
  onSelectPlayer,
}) => {
  const teamsMap = new Map(teams.map(t => [t.id, t]));

  // Live match detection (strictly matches with status === 'LIVE')
  const liveMatch = matches.find(m => m.status === 'LIVE');
  const liveHomeTeam = liveMatch ? teamsMap.get(liveMatch.home_team_id) : null;
  const liveAwayTeam = liveMatch ? teamsMap.get(liveAwayTeam_id_helper(liveMatch)) : null;

  function liveAwayTeam_id_helper(m: Match) {
    return m.away_team_id;
  }

  // Active POTM poll (if any)
  const activePoll = activePolls.length > 0 ? activePolls[0] : null;
  const pollMatch = activePoll ? matches.find(m => m.id === activePoll.match_id) : null;
  const pollHomeTeam = pollMatch ? teamsMap.get(pollMatch.home_team_id) : null;
  const pollAwayTeam = pollMatch ? teamsMap.get(pollMatch.away_team_id) : null;

  // Next upcoming match (excluding currently live match)
  const upcomingMatches = matches.filter(m => m.status === 'UPCOMING');
  const nextMatch = upcomingMatches.length > 0 ? upcomingMatches[0] : null;
  const nextHomeTeam = nextMatch ? teamsMap.get(nextMatch.home_team_id) : null;
  const nextAwayTeam = nextMatch ? teamsMap.get(nextMatch.away_team_id) : null;

  // Completed matches for latest result
  const completedMatches = matches.filter(m => m.status === 'COMPLETED');
  const latestMatch = completedMatches.length > 0 ? completedMatches[completedMatches.length - 1] : null;
  const latestHomeTeam = latestMatch ? teamsMap.get(latestMatch.home_team_id) : null;
  const latestAwayTeam = latestMatch ? teamsMap.get(latestMatch.away_team_id) : null;

  return (
    <div className="space-y-4">
      
      {/* 1. HOSTEL LEAGUE 26 IDENTITY */}
      <div className="text-center sm:text-left pt-1">
        <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-[#4a7227] text-[#ffff55] border-2 border-[#150f09] text-[10px] font-black uppercase mb-1.5 shadow-xs">
          <span className="w-1.5 h-1.5 bg-[#ffff55] animate-pulse" />
          <span>OFFICIAL TOURNAMENT REALM</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-black mc-title-yellow uppercase leading-tight">
          HOSTEL LEAGUE 26
        </h1>
        <p className="text-base sm:text-lg text-[#d8c7b3] mt-0.5">
          Six Clubs • Five Rounds • Fifteen Matches • Official Records & Statistics
        </p>
      </div>

      {/* 2. COMPACT LIVE MATCH SECTION */}
      {liveMatch && liveHomeTeam && liveAwayTeam ? (
        /* State A: MATCH IS LIVE */
        <div className="bg-white p-3.5 shadow-md">
          <div className="flex items-center justify-between pb-2 mb-2.5 border-b-2 border-[#1f1710]">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-[#ff2222] animate-ping" />
              <span className="text-[10px] font-black uppercase text-[#ff5555]">
                LIVE NOW • MATCH LIVE
              </span>
            </div>
            <span className="text-[9px] font-black uppercase px-2 py-0.5 bg-[#801818] text-white border border-[#140e09]">
              Round {liveMatch.round_number}
            </span>
          </div>

          <div className="flex items-center justify-between gap-3 py-1">
            {/* Home */}
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <TeamBadge team={liveHomeTeam} size="md" />
              <div className="truncate">
                <span className="font-black text-sm sm:text-base text-white block truncate">
                  {liveHomeTeam.name}
                </span>
                <span className="text-xs text-[#b8a58f]">Home</span>
              </div>
            </div>

            {/* Live Score */}
            <div className="px-3 py-1 bg-[#241c15] border-2 border-[#120d08] text-center shrink-0 font-black text-base sm:text-lg text-[#ff5555]">
              {liveMatch.home_score ?? 0} — {liveMatch.away_score ?? 0}
            </div>

            {/* Away */}
            <div className="flex items-center justify-end gap-2 flex-1 min-w-0 text-right">
              <div className="truncate">
                <span className="font-black text-sm sm:text-base text-white block truncate">
                  {liveAwayTeam.name}
                </span>
                <span className="text-xs text-[#b8a58f]">Away</span>
              </div>
              <TeamBadge team={liveAwayTeam} size="md" />
            </div>
          </div>

          {/* Action Footer */}
          <div className="mt-3 pt-2.5 border-t-2 border-[#1f1710] flex items-center justify-between gap-2">
            <span className="text-xs text-[#cfbeaa]">
              Real-time match broadcast
            </span>
            <button
              onClick={onOpenLiveWindow}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 mc-btn-red text-[10px] font-black uppercase tracking-wider cursor-pointer"
            >
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              <span>LIVE SCORE →</span>
            </button>
          </div>

          {/* POTM live match sub-surface if poll active for this live match */}
          {activePoll && activePoll.match_id === liveMatch.id && (
            <div className="mt-2.5 pt-2 border-t-2 border-[#1f1710] flex items-center justify-between gap-2 bg-[#42311b] -mx-3.5 -mb-3.5 p-2.5 border-t border-[#140e09]">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-[#ffaa00] shrink-0" />
                <span className="text-xs font-bold text-[#ffff55]">
                  Player of the Match voting is open!
                </span>
              </div>
              <button
                onClick={() => onNavigate('match-detail', liveMatch.id)}
                className="text-[10px] font-black text-[#ffff55] hover:text-white uppercase flex items-center gap-1 cursor-pointer"
              >
                <span>VOTE NOW</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      ) : (
        /* State B: NO LIVE MATCH (COMPACT) */
        <div className="bg-white p-2.5 sm:p-3 shadow-md flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-2 h-2 bg-[#6b5847] shrink-0" />
            <span className="text-[10px] font-black uppercase text-[#d5c3af] shrink-0">
              NO LIVE MATCH
            </span>
            {nextMatch && nextHomeTeam && nextAwayTeam && (
              <span className="hidden sm:inline text-xs text-[#b8a58f] truncate">
                • Next: <strong className="text-[#ffff55] font-semibold">{nextHomeTeam.name} vs {nextAwayTeam.name}</strong>
              </span>
            )}
          </div>

          <button
            onClick={onOpenLiveWindow}
            className="inline-flex items-center gap-1 px-3 py-1.5 mc-btn text-[10px] font-black uppercase tracking-wide shrink-0 cursor-pointer"
          >
            <span>LIVE SCORE</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* 3. VOTE NOW — COMPACT POTM SURFACE IF ACTIVE */}
      {activePoll && (
        <div className="bg-[#3e2e1c] border-3 border-[#120d08] p-3 shadow-md flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 bg-[#63481a] border-2 border-[#120d08] flex items-center justify-center shrink-0">
              <Award className="w-4 h-4 text-[#ffff55]" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase text-[#ffff55]">
                  PLAYER OF THE MATCH
                </span>
                <span className="text-[8px] font-black bg-[#ffaa00] text-black px-1 py-0.2 uppercase">
                  VOTING OPEN
                </span>
              </div>
              <p className="text-xs text-[#f2e2ce] mt-0.5 truncate">
                {pollMatch && pollHomeTeam && pollAwayTeam
                  ? `Who was the best player in ${pollHomeTeam.name} vs ${pollAwayTeam.name}?`
                  : "Who was today's best player?"}
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigate('match-detail', activePoll.match_id)}
            className="inline-flex items-center gap-1 px-3 py-2 mc-btn-gold text-[10px] font-black uppercase tracking-wider shrink-0 cursor-pointer"
          >
            <span>VOTE NOW</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* 4. NEXT MATCH */}
      <section className="space-y-1.5">
        <div className="flex items-center justify-between pb-1">
          <h2 className="text-[10px] font-black uppercase text-[#ffff55] flex items-center gap-1.5">
            <span>NEXT MATCH</span>
          </h2>
          <button
            onClick={() => onNavigate('matches')}
            className="text-[10px] text-[#55ff55] hover:text-[#ffff55] font-black flex items-center gap-1 cursor-pointer"
          >
            <span>All 15 Fixtures</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {nextMatch && nextHomeTeam && nextAwayTeam ? (
          <BroadcastMatchHero
            match={nextMatch}
            homeTeam={nextHomeTeam}
            awayTeam={nextAwayTeam}
            onClick={() => onNavigate('match-detail', nextMatch.id)}
          />
        ) : (
          <div className="p-4 text-center bg-white text-[#cfbeaa] text-xs">
            All tournament fixtures concluded.
          </div>
        )}
      </section>

      {/* 5. LATEST RESULT */}
      <section className="space-y-1.5">
        <div className="flex items-center justify-between pb-1">
          <h2 className="text-[10px] font-black uppercase text-[#ffff55] flex items-center gap-1.5">
            <span>LATEST RESULT</span>
          </h2>
          <button
            onClick={() => onNavigate('matches')}
            className="text-[10px] text-[#55ff55] hover:text-[#ffff55] font-black flex items-center gap-1 cursor-pointer"
          >
            <span>Past Matches</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        {latestMatch && latestHomeTeam && latestAwayTeam ? (
          <ResultCard
            match={latestMatch}
            homeTeam={latestHomeTeam}
            awayTeam={latestAwayTeam}
            onClick={() => onNavigate('match-detail', latestMatch.id)}
          />
        ) : (
          <div className="p-4 text-center bg-white text-[#cfbeaa] text-xs">
            No completed matches recorded yet.
          </div>
        )}
      </section>

      {/* 6. MINIMAL TOURNAMENT INFORMATION */}
      <section className="p-3.5 bg-white space-y-3">
        <h2 className="text-[10px] font-black uppercase text-[#ffff55]">
          TOURNAMENT INFORMATION
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
          <div className="p-2 mc-slot">
            <span className="text-[9px] font-bold text-[#b5a38f] uppercase block">Clubs</span>
            <span className="text-sm font-black text-white mt-0.5 block">6 TEAMS</span>
          </div>
          <div className="p-2 mc-slot">
            <span className="text-[9px] font-bold text-[#b5a38f] uppercase block">Schedule</span>
            <span className="text-sm font-black text-[#55ff55] mt-0.5 block">15 MATCHES</span>
          </div>
          <div className="p-2 mc-slot">
            <span className="text-[9px] font-bold text-[#b5a38f] uppercase block">Format</span>
            <span className="text-sm font-black text-white mt-0.5 block">5 ROUNDS</span>
          </div>
          <div className="p-2 mc-slot">
            <span className="text-[9px] font-bold text-[#b5a38f] uppercase block">Points</span>
            <span className="text-sm font-black text-[#ffaa00] mt-0.5 block">W 3 • D 1 • L 0</span>
          </div>
        </div>

        {/* Quick Navigation Shortcuts */}
        <div className="pt-2 border-t-2 border-[#1f1710] grid grid-cols-2 sm:grid-cols-4 gap-1.5 text-xs">
          <button
            onClick={() => onNavigate('matches')}
            className="flex items-center justify-center gap-1 py-1.5 px-2 mc-btn text-[9px] font-black uppercase"
          >
            <Trophy className="w-3 h-3 text-[#55ff55]" />
            <span>Fixtures</span>
          </button>
          <button
            onClick={() => onNavigate('teams')}
            className="flex items-center justify-center gap-1 py-1.5 px-2 mc-btn text-[9px] font-black uppercase"
          >
            <Shield className="w-3 h-3 text-[#55ffff]" />
            <span>Squads</span>
          </button>
          <button
            onClick={() => onNavigate('stats')}
            className="flex items-center justify-center gap-1 py-1.5 px-2 mc-btn text-[9px] font-black uppercase"
          >
            <Award className="w-3 h-3 text-[#ffaa00]" />
            <span>Leaderboard</span>
          </button>
          <button
            onClick={() => onNavigate('rules')}
            className="flex items-center justify-center gap-1 py-1.5 px-2 mc-btn text-[9px] font-black uppercase"
          >
            <FileText className="w-3 h-3 text-slate-300" />
            <span>Rules</span>
          </button>
        </div>
      </section>

    </div>
  );
};
