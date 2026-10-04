import React from 'react';
import { Team, Match, TeamStanding, PlayerStatEntry } from '../types/tournament';
import { BroadcastMatchHero } from '../components/BroadcastMatchHero';
import { ResultCard } from '../components/ResultCard';
import { LeagueTable } from '../components/LeagueTable';
import { TopScorers } from '../components/TopScorers';
import { EmptyState } from '../components/EmptyState';
import { Trophy, ArrowRight, Shield } from 'lucide-react';

interface HomePageProps {
  teams: Team[];
  matches: Match[];
  standings: TeamStanding[];
  topScorers: PlayerStatEntry[];
  onNavigate: (tab: string, param?: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  teams,
  matches,
  standings,
  topScorers,
  onNavigate,
}) => {
  const teamsMap = new Map(teams.map(t => [t.id, t]));

  // Next match: first upcoming or live match
  const nextMatch = matches.find(m => m.status === 'UPCOMING' || m.status === 'LIVE');
  const nextHomeTeam = nextMatch ? teamsMap.get(nextMatch.home_team_id) : null;
  const nextAwayTeam = nextMatch ? teamsMap.get(nextMatch.away_team_id) : null;

  // Completed matches for latest results strip
  const completedMatches = matches.filter(m => m.status === 'COMPLETED');
  const latestMatch = completedMatches.length > 0 ? completedMatches[completedMatches.length - 1] : null;
  const latestHomeTeam = latestMatch ? teamsMap.get(latestMatch.home_team_id) : null;
  const latestAwayTeam = latestMatch ? teamsMap.get(latestMatch.away_team_id) : null;

  return (
    <div className="space-y-14 md:space-y-16">
      
      {/* 1. EDITORIAL TOURNAMENT HERO */}
      <section className="pt-2 pb-2">
        <div className="max-w-4xl">
          <div className="flex items-center gap-2 font-mono text-[11px] font-bold tracking-widest text-pitch-500 uppercase mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-pitch-500" />
            <span>OFFICIAL FOOTBALL CHAMPIONSHIP</span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black font-display tracking-tight text-white uppercase leading-none">
            HOSTEL LEAGUE <span className="text-gold-400">26</span>
          </h1>

          <div className="mt-3 flex flex-wrap items-center gap-2.5 text-xs sm:text-sm font-mono text-[#9EA4AD] uppercase tracking-wider">
            <span className="text-white font-bold">THE BATTLE FOR THE CROWN</span>
            <span className="text-pitch-500">•</span>
            <span>SIX CLUBS</span>
            <span className="text-pitch-500">•</span>
            <span>SINGLE ROUND-ROBIN</span>
            <span className="text-pitch-500">•</span>
            <span>FIFTEEN FIXTURES</span>
          </div>
        </div>
      </section>

      {/* 2. NEXT MATCH — LARGE BROADCAST COMPOSITION */}
      <section className="space-y-3">
        <div className="flex items-center justify-between pb-1 border-b border-stadium-800">
          <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-[#F4F4F0]">
            NEXT MATCH
          </h2>
          <button
            onClick={() => onNavigate('fixtures')}
            className="text-xs font-mono text-[#9EA4AD] hover:text-white transition-colors flex items-center gap-1"
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
          <EmptyState
            title="ALL FIXTURES CONCLUDED"
            description="The 15 official round-robin matches of Hostel League 26 have finished."
          />
        )}
      </section>

      {/* 3. LATEST RESULTS — HORIZONTAL MATCH STRIP */}
      <section className="space-y-3">
        <div className="flex items-center justify-between pb-1 border-b border-stadium-800">
          <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-[#F4F4F0]">
            LATEST RESULT
          </h2>
          <button
            onClick={() => onNavigate('results')}
            className="text-xs font-mono text-[#9EA4AD] hover:text-white transition-colors flex items-center gap-1"
          >
            <span>All Results</span>
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
          <EmptyState
            title="NO RESULTS YET"
            description="No matches have been completed. Once fixtures conclude and scores are verified by match officials, official results will appear here."
            icon={Trophy}
          />
        )}
      </section>

      {/* 4. LEAGUE TABLE & TOP SCORERS DUAL EDITORIAL SECTION */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* League Table Preview (2 Cols) */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between pb-1 border-b border-stadium-800">
            <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-[#F4F4F0] flex items-center gap-2">
              <Shield className="w-3.5 h-3.5 text-pitch-500" />
              <span>LEAGUE TABLE</span>
            </h2>
            <button
              onClick={() => onNavigate('table')}
              className="text-xs font-mono text-[#9EA4AD] hover:text-white transition-colors flex items-center gap-1"
            >
              <span>Full Standings</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <LeagueTable
            standings={standings}
            isCompact={true}
            onTeamClick={(teamId) => onNavigate('team-detail', teamId)}
          />
        </div>

        {/* Top Scorers Preview (1 Col) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between pb-1 border-b border-stadium-800">
            <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-[#F4F4F0]">
              TOP SCORERS
            </h2>
            <button
              onClick={() => onNavigate('stats')}
              className="text-xs font-mono text-[#9EA4AD] hover:text-white transition-colors flex items-center gap-1"
            >
              <span>All Stats</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <TopScorers
            scorers={topScorers}
            limit={4}
            onViewAll={() => onNavigate('stats')}
          />
        </div>

      </section>

      {/* 5. TOURNAMENT INFORMATION FOOTER STRIP */}
      <section className="p-6 rounded-card bg-stadium-900 border border-stadium-800 font-mono text-xs">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          <div>
            <span className="text-[#9EA4AD] uppercase text-[10px] block">TOTAL CLUBS</span>
            <span className="font-bold text-base text-white mt-1 block">6 TEAMS</span>
          </div>
          <div>
            <span className="text-[#9EA4AD] uppercase text-[10px] block">FORMAT</span>
            <span className="font-bold text-base text-pitch-500 mt-1 block">ROUND-ROBIN</span>
          </div>
          <div>
            <span className="text-[#9EA4AD] uppercase text-[10px] block">MATCHES</span>
            <span className="font-bold text-base text-white mt-1 block">15 FIXTURES</span>
          </div>
          <div>
            <span className="text-[#9EA4AD] uppercase text-[10px] block">SCORING</span>
            <span className="font-bold text-base text-gold-400 mt-1 block">WIN 3 PTS / DRAW 1 PT</span>
          </div>
        </div>
      </section>

    </div>
  );
};
