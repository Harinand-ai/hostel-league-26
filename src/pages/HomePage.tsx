import React from 'react';
import { motion } from 'framer-motion';
import { Team, Match, TeamStanding, PlayerStatEntry } from '../types/tournament';
import { BroadcastMatchHero } from '../components/BroadcastMatchHero';
import { ResultCard } from '../components/ResultCard';
import { LeagueTable } from '../components/LeagueTable';
import { TopScorers } from '../components/TopScorers';
import { EmptyState } from '../components/EmptyState';
import { Trophy, Calendar, Award, Shield, ArrowRight, Flame } from 'lucide-react';

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

  // Latest result: most recently completed match
  const completedMatches = matches.filter(m => m.status === 'COMPLETED');
  const latestMatch = completedMatches.length > 0 ? completedMatches[completedMatches.length - 1] : null;
  const latestHomeTeam = latestMatch ? teamsMap.get(latestMatch.home_team_id) : null;
  const latestAwayTeam = latestMatch ? teamsMap.get(latestMatch.away_team_id) : null;

  return (
    <div className="space-y-16 md:space-y-20">
      
      {/* 1. EDITORIAL TOURNAMENT HERO */}
      <section className="relative overflow-hidden pt-6 pb-2">
        <div className="relative z-10 max-w-4xl">
          
          {/* Official Federation Badge */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2.5 px-3 py-1 rounded-full bg-stadium-900 border border-stadium-750 text-xs font-mono font-bold tracking-widest text-emerald-400 uppercase mb-4"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            OFFICIAL TOURNAMENT PORTAL
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black font-display tracking-tight text-white uppercase leading-[0.95]"
          >
            HOSTEL LEAGUE <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-300 via-amber-400 to-yellow-500">26</span>
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-3 flex items-center gap-3 text-slate-300 text-sm sm:text-lg md:text-xl font-display font-extrabold uppercase tracking-broadcast"
          >
            <span>THE BATTLE FOR THE CROWN</span>
            <span className="text-emerald-400">•</span>
            <span className="text-slate-400 font-mono text-xs sm:text-sm">SINGLE ROUND-ROBIN</span>
          </motion.div>

        </div>
      </section>

      {/* 2. CENTERPIECE: BROADCAST NEXT MATCH */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <h2 className="text-sm sm:text-base font-display font-black uppercase tracking-broadcast text-white">
              NEXT OFFICIAL FIXTURE
            </h2>
          </div>
          <button
            onClick={() => onNavigate('fixtures')}
            className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 hover:text-gold-400 transition-colors flex items-center gap-1.5"
          >
            <span>Full Fixtures Schedule (15)</span>
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
            icon={Calendar}
          />
        )}
      </section>

      {/* 3. LATEST RESULT SPOTLIGHT (BROADCAST REPORT) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Trophy className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm sm:text-base font-display font-black uppercase tracking-broadcast text-white">
              LATEST VERIFIED RESULT
            </h2>
          </div>
          <button
            onClick={() => onNavigate('results')}
            className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 hover:text-gold-400 transition-colors flex items-center gap-1.5"
          >
            <span>All Match Reports</span>
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

      {/* 4. LEAGUE STANDINGS & TOP SCORERS DUAL GRID */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* League Table Preview (2 Cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-sky-400" />
              <h2 className="text-sm sm:text-base font-display font-black uppercase tracking-broadcast text-white">
                LEAGUE TABLE STANDINGS
              </h2>
            </div>
            <button
              onClick={() => onNavigate('table')}
              className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 hover:text-gold-400 transition-colors flex items-center gap-1.5"
            >
              <span>View Full Table</span>
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
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-gold-400" />
              <h2 className="text-sm sm:text-base font-display font-black uppercase tracking-broadcast text-white">
                GOLDEN BOOT RACE
              </h2>
            </div>
            <button
              onClick={() => onNavigate('stats')}
              className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 hover:text-gold-400 transition-colors flex items-center gap-1.5"
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

      {/* 5. TOURNAMENT AT A GLANCE BANNER */}
      <section className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-stadium-900 via-stadium-850 to-stadium-900 border border-stadium-800">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block">Total Clubs</span>
            <span className="font-display font-black text-2xl sm:text-3xl text-white mt-0.5 block">6 TEAMS</span>
          </div>
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block">Competition Format</span>
            <span className="font-display font-black text-2xl sm:text-3xl text-emerald-400 mt-0.5 block">ROUND-ROBIN</span>
          </div>
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block">Total Fixtures</span>
            <span className="font-display font-black text-2xl sm:text-3xl text-gold-400 mt-0.5 block">15 MATCHES</span>
          </div>
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block">Scoring System</span>
            <span className="font-display font-black text-2xl sm:text-3xl text-sky-400 mt-0.5 block">3 PTS WIN</span>
          </div>
        </div>
      </section>

    </div>
  );
};
