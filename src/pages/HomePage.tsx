import React from 'react';
import { Team, Match, TeamStanding, PlayerStatEntry, Player } from '../types/tournament';
import { BroadcastMatchHero } from '../components/BroadcastMatchHero';
import { ResultCard } from '../components/ResultCard';
import { Radio, ArrowRight, Trophy, Award, Shield, FileText, PhoneCall } from 'lucide-react';

interface HomePageProps {
  teams: Team[];
  matches: Match[];
  standings: TeamStanding[];
  topScorers: PlayerStatEntry[];
  players?: Player[];
  onNavigate: (tab: string, param?: string) => void;
  onSelectPlayer?: (playerId: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  teams,
  matches,
  standings,
  topScorers,
  players = [],
  onNavigate,
  onSelectPlayer,
}) => {
  const teamsMap = new Map(teams.map(t => [t.id, t]));

  // Next match: first upcoming or live match
  const nextMatch = matches.find(m => m.status === 'UPCOMING' || m.status === 'LIVE');
  const nextHomeTeam = nextMatch ? teamsMap.get(nextMatch.home_team_id) : null;
  const nextAwayTeam = nextMatch ? teamsMap.get(nextMatch.away_team_id) : null;

  // Completed matches for latest result
  const completedMatches = matches.filter(m => m.status === 'COMPLETED');
  const latestMatch = completedMatches.length > 0 ? completedMatches[completedMatches.length - 1] : null;
  const latestHomeTeam = latestMatch ? teamsMap.get(latestMatch.home_team_id) : null;
  const latestAwayTeam = latestMatch ? teamsMap.get(latestMatch.away_team_id) : null;

  return (
    <div className="space-y-6">
      
      {/* 1. TOURNAMENT TITLE & INTRO */}
      <div className="text-center sm:text-left pt-1">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold tracking-wide uppercase mb-2 border border-emerald-200">
          <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
          <span>Official Tournament Portal</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight uppercase">
          HOSTEL LEAGUE 26
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          Six Clubs • Five Rounds • Fifteen Matches • Official Records & Statistics
        </p>
      </div>

      {/* 2. HIGH-VISIBILITY PROMINENT LIVE MATCH BUTTON */}
      <a
        href="https://hostelleague.vercel.app/"
        target="_blank"
        rel="noopener noreferrer"
        id="live-match-portal-link"
        className="block group p-4 sm:p-5 rounded-xl bg-gradient-to-r from-emerald-600 to-green-700 text-white shadow-md hover:shadow-lg transition-all"
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <Radio className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base sm:text-lg tracking-wide uppercase">
                  LIVE MATCH CENTRE
                </span>
                <span className="text-[10px] bg-white text-emerald-800 font-bold px-2 py-0.5 rounded-full uppercase">
                  LIVE
                </span>
              </div>
              <p className="text-xs text-emerald-100 font-medium mt-0.5">
                Watch the current match, live score & real-time pitch action
              </p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white text-emerald-800 font-bold text-xs uppercase tracking-wide group-hover:bg-emerald-50 transition-colors shrink-0">
            <span>Watch Live</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </a>

      {/* 3. NEXT MATCH */}
      <section className="space-y-2.5">
        <div className="flex items-center justify-between pb-1">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <span>NEXT MATCH</span>
          </h2>
          <button
            onClick={() => onNavigate('matches')}
            className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1"
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
          <div className="p-6 text-center bg-white rounded-xl border border-slate-200 text-slate-500 text-xs">
            All tournament fixtures concluded.
          </div>
        )}
      </section>

      {/* 4. LATEST RESULT */}
      <section className="space-y-2.5">
        <div className="flex items-center justify-between pb-1">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <span>LATEST RESULT</span>
          </h2>
          <button
            onClick={() => onNavigate('matches')}
            className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1"
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
          <div className="p-6 text-center bg-white rounded-xl border border-slate-200 text-slate-500 text-xs">
            No completed matches recorded yet.
          </div>
        )}
      </section>

      {/* 5. QUICK TOURNAMENT INFORMATION */}
      <section className="p-4 sm:p-5 rounded-xl bg-white border border-slate-200 shadow-sm space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
          TOURNAMENT INFORMATION
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
            <span className="text-[11px] font-semibold text-slate-500 uppercase block">Clubs</span>
            <span className="text-lg font-bold text-slate-900 mt-0.5 block">6 TEAMS</span>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
            <span className="text-[11px] font-semibold text-slate-500 uppercase block">Schedule</span>
            <span className="text-lg font-bold text-emerald-700 mt-0.5 block">15 MATCHES</span>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
            <span className="text-[11px] font-semibold text-slate-500 uppercase block">Format</span>
            <span className="text-lg font-bold text-slate-900 mt-0.5 block">5 ROUNDS</span>
          </div>
          <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
            <span className="text-[11px] font-semibold text-slate-500 uppercase block">Standings</span>
            <span className="text-lg font-bold text-slate-900 mt-0.5 block">W 3 • D 1 • L 0</span>
          </div>
        </div>

        {/* Quick Navigation Shortcuts */}
        <div className="pt-2 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <button
            onClick={() => onNavigate('matches')}
            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold border border-slate-200 transition-colors"
          >
            <Trophy className="w-3.5 h-3.5 text-emerald-600" />
            <span>Fixtures & Results</span>
          </button>
          <button
            onClick={() => onNavigate('teams')}
            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold border border-slate-200 transition-colors"
          >
            <Shield className="w-3.5 h-3.5 text-blue-600" />
            <span>Official Squads</span>
          </button>
          <button
            onClick={() => onNavigate('stats')}
            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold border border-slate-200 transition-colors"
          >
            <Award className="w-3.5 h-3.5 text-amber-600" />
            <span>Leaderboard</span>
          </button>
          <button
            onClick={() => onNavigate('rules')}
            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold border border-slate-200 transition-colors"
          >
            <FileText className="w-3.5 h-3.5 text-slate-600" />
            <span>Tournament Rules</span>
          </button>
        </div>
      </section>

    </div>
  );
};
