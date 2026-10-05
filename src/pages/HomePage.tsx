import React from 'react';
import { Team, Match, TeamStanding, PlayerStatEntry } from '../types/tournament';
import { BroadcastMatchHero } from '../components/BroadcastMatchHero';
import { ResultCard } from '../components/ResultCard';
import { LeagueTable } from '../components/LeagueTable';
import { TopScorers } from '../components/TopScorers';
import { EmptyState } from '../components/EmptyState';
import { CommitteeSection } from '../components/CommitteeSection';
import { Trophy, ArrowRight, Shield, ArrowUpRight, BookOpen } from 'lucide-react';

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

          {/* TOURNAMENT CORE METRICS: 6 CLUBS • 15 FIXTURES • 5 ROUNDS */}
          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-xs sm:text-sm">
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl sm:text-2xl font-black font-display text-white">6</span>
              <span className="text-[#9EA4AD] tracking-wider uppercase text-xs font-semibold">Clubs</span>
            </div>
            <span className="text-stadium-700 select-none hidden sm:inline">|</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl sm:text-2xl font-black font-display text-white">15</span>
              <span className="text-[#9EA4AD] tracking-wider uppercase text-xs font-semibold">Fixtures</span>
            </div>
            <span className="text-stadium-700 select-none hidden sm:inline">|</span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-xl sm:text-2xl font-black font-display text-white">5</span>
              <span className="text-[#9EA4AD] tracking-wider uppercase text-xs font-semibold">Rounds</span>
            </div>
            <span className="text-stadium-700 select-none hidden sm:inline">|</span>
            <span className="text-pitch-500 font-bold tracking-wider uppercase text-xs">
              Single Round-Robin
            </span>
          </div>

          {/* Quick Tournament Overview Layer Bridge */}
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('quick-view')}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-badge bg-pitch-950/40 hover:bg-pitch-900/60 border border-pitch-800/60 text-xs font-mono font-bold text-pitch-400 hover:text-white transition-colors"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-pitch-500 animate-pulse" />
              <span>QUICK TOURNAMENT VIEW</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] font-mono text-[#9EA4AD]">
              Instant fixtures, standings & committee contacts
            </span>
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

      {/* 5. TOURNAMENT INFORMATION */}
      <section className="space-y-3 pt-6 border-t border-stadium-800">
        <h2 className="text-xs font-mono font-bold uppercase tracking-widest text-[#F4F4F0]">
          TOURNAMENT INFORMATION
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-5 px-6 rounded-card bg-stadium-900 border border-stadium-800 font-mono text-xs">
          <div>
            <span className="text-[#9EA4AD] uppercase text-[10px] block">TOTAL CLUBS</span>
            <span className="font-bold text-sm sm:text-base text-white mt-1 block">6 CLUBS</span>
          </div>
          <div>
            <span className="text-[#9EA4AD] uppercase text-[10px] block">FORMAT</span>
            <span className="font-bold text-sm sm:text-base text-pitch-500 mt-1 block">5 ROUNDS • 15 MATCHES</span>
          </div>
          <div>
            <span className="text-[#9EA4AD] uppercase text-[10px] block">COMPETITION</span>
            <span className="font-bold text-sm sm:text-base text-white mt-1 block">SINGLE ROUND-ROBIN</span>
          </div>
          <div>
            <span className="text-[#9EA4AD] uppercase text-[10px] block">POINTS SYSTEM</span>
            <span className="font-bold text-sm sm:text-base text-gold-400 mt-1 block">WIN 3 PTS • DRAW 1 PT</span>
          </div>
        </div>

        {/* Quick Tournament Overview layer bridge */}
        <div className="pt-2 px-1 flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-[#9EA4AD]">
          <span>Need the lightweight match schedule and committee contacts?</span>
          <button
            onClick={() => onNavigate('quick-view')}
            className="inline-flex items-center gap-1.5 text-pitch-400 hover:text-white font-bold transition-colors cursor-pointer"
          >
            <span>Open Quick Tournament View</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </section>

      {/* 6. TOURNAMENT RULES & REGULATIONS PROMPT BANNER */}
      <section className="p-6 rounded-2xl bg-gradient-to-r from-stadium-900 via-[#0a0f1c] to-stadium-900 border border-stadium-750 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-broadcast">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-gold-500/15 border border-gold-500/30 flex items-center justify-center text-gold-400 shrink-0">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-display font-black text-lg text-white uppercase tracking-tight">
              OFFICIAL RULES & REGULATIONS
            </h3>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Review all 12 official statutes covering 6's format, substitutions, disciplinary rules, and penalties.
            </p>
          </div>
        </div>
        <button
          onClick={() => onNavigate('rules')}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gold-500 hover:bg-gold-600 text-stadium-980 font-mono font-black text-xs uppercase tracking-wider transition-all whitespace-nowrap shadow-md cursor-pointer"
        >
          <span>READ 12 RULES</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </section>

      {/* 7. TOURNAMENT COMMITTEE (Section 17) */}
      <CommitteeSection />

    </div>
  );
};

