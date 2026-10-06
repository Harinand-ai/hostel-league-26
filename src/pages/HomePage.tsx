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
    <div className="space-y-5">
      
      {/* 1. HOSTEL LEAGUE 26 IDENTITY */}
      <div className="text-center sm:text-left pt-1">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold tracking-wide uppercase mb-2 border border-emerald-200">
          <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
          <span>Official Tournament Portal</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight uppercase">
          HOSTEL LEAGUE 26
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
          Six Clubs • Five Rounds • Fifteen Matches • Official Records & Statistics
        </p>
      </div>

      {/* 2. COMPACT LIVE MATCH SECTION */}
      {liveMatch && liveHomeTeam && liveAwayTeam ? (
        /* State A: MATCH IS LIVE */
        <div className="bg-white rounded-xl border border-rose-200 p-4 shadow-xs">
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-rose-100">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping" />
              <span className="text-xs font-black tracking-wider uppercase text-rose-700">
                LIVE NOW • MATCH LIVE
              </span>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
              Round {liveMatch.round_number}
            </span>
          </div>

          <div className="flex items-center justify-between gap-3 py-1">
            {/* Home */}
            <div className="flex items-center gap-2.5 flex-1 min-w-0">
              <TeamBadge team={liveHomeTeam} size="md" />
              <div className="truncate">
                <span className="font-extrabold text-sm sm:text-base text-slate-900 block truncate">
                  {liveHomeTeam.name}
                </span>
                <span className="text-[10px] text-slate-500">Home</span>
              </div>
            </div>

            {/* Live Score */}
            <div className="px-3.5 py-1.5 rounded-lg bg-rose-50 border border-rose-200 text-center shrink-0 font-black text-lg sm:text-xl text-rose-700">
              {liveMatch.home_score ?? 0} — {liveMatch.away_score ?? 0}
            </div>

            {/* Away */}
            <div className="flex items-center justify-end gap-2.5 flex-1 min-w-0 text-right">
              <div className="truncate">
                <span className="font-extrabold text-sm sm:text-base text-slate-900 block truncate">
                  {liveAwayTeam.name}
                </span>
                <span className="text-[10px] text-slate-500">Away</span>
              </div>
              <TeamBadge team={liveAwayTeam} size="md" />
            </div>
          </div>

          {/* Action Footer */}
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
            <span className="text-[11px] text-slate-500 font-medium">
              Real-time match centre
            </span>
            <a
              href="https://hostelleague.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs uppercase tracking-wide transition-colors shadow-xs"
            >
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              <span>LIVE SCORE →</span>
            </a>
          </div>

          {/* POTM live match sub-surface if poll active for this live match */}
          {activePoll && activePoll.match_id === liveMatch.id && (
            <div className="mt-2.5 pt-2 border-t border-rose-100 flex items-center justify-between gap-2 bg-amber-50/70 -mx-4 -mb-4 p-3 rounded-b-xl">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-700 shrink-0" />
                <span className="text-xs font-bold text-amber-900">
                  Player of the Match voting is open!
                </span>
              </div>
              <button
                onClick={() => onNavigate('match-detail', liveMatch.id)}
                className="text-xs font-black text-amber-900 hover:text-amber-950 uppercase tracking-wide flex items-center gap-1 cursor-pointer"
              >
                <span>VOTE NOW</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      ) : (
        /* State B: NO LIVE MATCH (COMPACT) */
        <div className="bg-white rounded-xl border border-slate-200 p-3 sm:p-3.5 shadow-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="w-2 h-2 rounded-full bg-slate-300 shrink-0" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600 shrink-0">
              NO LIVE MATCH
            </span>
            {nextMatch && nextHomeTeam && nextAwayTeam && (
              <span className="hidden sm:inline text-xs text-slate-500 truncate">
                • Next: <strong className="text-slate-800 font-semibold">{nextHomeTeam.name} vs {nextAwayTeam.name}</strong>
              </span>
            )}
          </div>

          <a
            href="https://hostelleague.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wide transition-colors shrink-0"
          >
            <span>LIVE SCORE</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
      )}

      {/* 3. VOTE NOW — COMPACT POTM SURFACE IF ACTIVE */}
      {activePoll && (
        <div className="bg-amber-50/90 border border-amber-200 rounded-xl p-3.5 sm:p-4 shadow-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center shrink-0">
              <Award className="w-5 h-5 text-amber-700" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-black uppercase tracking-wider text-amber-900">
                  PLAYER OF THE MATCH
                </span>
                <span className="text-[9px] font-extrabold bg-amber-200 text-amber-900 px-1.5 py-0.2 rounded uppercase">
                  VOTING OPEN
                </span>
              </div>
              <p className="text-xs text-amber-800 font-medium mt-0.5 truncate">
                {pollMatch && pollHomeTeam && pollAwayTeam
                  ? `Who was the best player in ${pollHomeTeam.name} vs ${pollAwayTeam.name}?`
                  : "Who was today's best player?"}
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigate('match-detail', activePoll.match_id)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs uppercase tracking-wider transition-colors shadow-xs shrink-0 cursor-pointer"
          >
            <span>VOTE NOW</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 4. NEXT MATCH */}
      <section className="space-y-2">
        <div className="flex items-center justify-between pb-1">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <span>NEXT MATCH</span>
          </h2>
          <button
            onClick={() => onNavigate('matches')}
            className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1 cursor-pointer"
          >
            <span>All 15 Fixtures</span>
            <ArrowRight className="w-3.5 h-3.5" />
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
          <div className="p-5 text-center bg-white rounded-xl border border-slate-200 text-slate-500 text-xs">
            All tournament fixtures concluded.
          </div>
        )}
      </section>

      {/* 5. LATEST RESULT */}
      <section className="space-y-2">
        <div className="flex items-center justify-between pb-1">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <span>LATEST RESULT</span>
          </h2>
          <button
            onClick={() => onNavigate('matches')}
            className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1 cursor-pointer"
          >
            <span>Past Matches</span>
            <ArrowRight className="w-3.5 h-3.5" />
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
          <div className="p-5 text-center bg-white rounded-xl border border-slate-200 text-slate-500 text-xs">
            No completed matches recorded yet.
          </div>
        )}
      </section>

      {/* 6. MINIMAL TOURNAMENT INFORMATION */}
      <section className="p-4 sm:p-5 rounded-xl bg-white border border-slate-200 shadow-xs space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
          TOURNAMENT INFORMATION
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
            <span className="text-[10px] font-semibold text-slate-500 uppercase block">Clubs</span>
            <span className="text-base font-bold text-slate-900 mt-0.5 block">6 TEAMS</span>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
            <span className="text-[10px] font-semibold text-slate-500 uppercase block">Schedule</span>
            <span className="text-base font-bold text-emerald-700 mt-0.5 block">15 MATCHES</span>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
            <span className="text-[10px] font-semibold text-slate-500 uppercase block">Format</span>
            <span className="text-base font-bold text-slate-900 mt-0.5 block">5 ROUNDS</span>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
            <span className="text-[10px] font-semibold text-slate-500 uppercase block">Points</span>
            <span className="text-base font-bold text-slate-900 mt-0.5 block">W 3 • D 1 • L 0</span>
          </div>
        </div>

        {/* Quick Navigation Shortcuts */}
        <div className="pt-2 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <button
            onClick={() => onNavigate('matches')}
            className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold border border-slate-200 transition-colors cursor-pointer"
          >
            <Trophy className="w-3.5 h-3.5 text-emerald-600" />
            <span>Fixtures & Results</span>
          </button>
          <button
            onClick={() => onNavigate('teams')}
            className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold border border-slate-200 transition-colors cursor-pointer"
          >
            <Shield className="w-3.5 h-3.5 text-blue-600" />
            <span>Official Squads</span>
          </button>
          <button
            onClick={() => onNavigate('stats')}
            className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold border border-slate-200 transition-colors cursor-pointer"
          >
            <Award className="w-3.5 h-3.5 text-amber-600" />
            <span>Leaderboard</span>
          </button>
          <button
            onClick={() => onNavigate('rules')}
            className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold border border-slate-200 transition-colors cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-slate-600" />
            <span>Tournament Rules</span>
          </button>
        </div>
      </section>

    </div>
  );
};
