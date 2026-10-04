import React from 'react';
import { Team, Match, TeamStanding, PlayerStatEntry } from '../types/tournament';
import { FixtureCard } from '../components/FixtureCard';
import { ResultCard } from '../components/ResultCard';
import { LeagueTable } from '../components/LeagueTable';
import { TopScorers } from '../components/TopScorers';
import { EmptyState } from '../components/EmptyState';
import { Trophy, Calendar, Award, Shield, ArrowRight } from 'lucide-react';

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

  // Next match: first upcoming match
  const nextMatch = matches.find(m => m.status === 'UPCOMING' || m.status === 'LIVE');
  const nextHomeTeam = nextMatch ? teamsMap.get(nextMatch.home_team_id) : null;
  const nextAwayTeam = nextMatch ? teamsMap.get(nextMatch.away_team_id) : null;

  // Latest result: most recently completed match
  const completedMatches = matches.filter(m => m.status === 'COMPLETED');
  const latestMatch = completedMatches.length > 0 ? completedMatches[completedMatches.length - 1] : null;
  const latestHomeTeam = latestMatch ? teamsMap.get(latestMatch.home_team_id) : null;
  const latestAwayTeam = latestMatch ? teamsMap.get(latestMatch.away_team_id) : null;

  return (
    <div className="space-y-12 md:space-y-16">
      
      {/* HERO SECTION */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-stadium-900 via-stadium-950 to-stadium-950 border border-stadium-800 p-8 sm:p-12 md:p-16 text-center shadow-2xl stadium-glow">
        <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center">
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gold-500/10 border border-gold-500/30 text-gold-400 text-xs font-bold uppercase tracking-widest mb-6">
            <Trophy className="w-3.5 h-3.5" />
            Official Tournament Hub
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black font-display tracking-tight text-white uppercase leading-none">
            HOSTEL LEAGUE <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-400 via-amber-300 to-yellow-500">26</span>
          </h1>

          <p className="mt-4 text-sm sm:text-lg md:text-xl font-bold uppercase tracking-[0.25em] text-slate-300">
            THE BATTLE FOR THE CROWN
          </p>

          <p className="mt-4 text-xs sm:text-sm text-slate-400 max-w-xl leading-relaxed">
            Six elite hostel squads go head-to-head in a single round-robin showdown. 15 matches of intense football to crown the hostel champions.
          </p>

          {/* Quick tournament badges */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 mt-8 pt-6 border-t border-stadium-800/80 text-xs font-mono text-slate-300">
            <div className="flex items-center gap-2 bg-stadium-900/80 px-3 py-1.5 rounded-lg border border-stadium-800">
              <Shield className="w-4 h-4 text-sky-400" />
              <span><strong>6</strong> TEAMS</span>
            </div>
            <div className="flex items-center gap-2 bg-stadium-900/80 px-3 py-1.5 rounded-lg border border-stadium-800">
              <Calendar className="w-4 h-4 text-gold-400" />
              <span><strong>5</strong> ROUNDS</span>
            </div>
            <div className="flex items-center gap-2 bg-stadium-900/80 px-3 py-1.5 rounded-lg border border-stadium-800">
              <Award className="w-4 h-4 text-emerald-400" />
              <span><strong>15</strong> MATCHES</span>
            </div>
          </div>

        </div>
      </section>

      {/* MATCH SPOTLIGHT: NEXT MATCH & LATEST RESULT */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Next Match */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gold-400" />
              <h2 className="text-base sm:text-lg font-black font-display uppercase tracking-wider text-slate-100">
                NEXT MATCH
              </h2>
            </div>
            <button
              onClick={() => onNavigate('fixtures')}
              className="text-xs font-bold uppercase tracking-wider text-gold-400 hover:text-white transition-colors flex items-center gap-1"
            >
              All Fixtures <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {nextMatch && nextHomeTeam && nextAwayTeam ? (
            <FixtureCard
              match={nextMatch}
              homeTeam={nextHomeTeam}
              awayTeam={nextAwayTeam}
              showRound={true}
              onClick={() => onNavigate('match-detail', nextMatch.id)}
            />
          ) : (
            <EmptyState
              title="NO UPCOMING FIXTURES"
              description="All tournament matches have been completed."
              icon={Calendar}
            />
          )}
        </div>

        {/* Latest Result */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-emerald-400" />
              <h2 className="text-base sm:text-lg font-black font-display uppercase tracking-wider text-slate-100">
                LATEST RESULT
              </h2>
            </div>
            <button
              onClick={() => onNavigate('results')}
              className="text-xs font-bold uppercase tracking-wider text-gold-400 hover:text-white transition-colors flex items-center gap-1"
            >
              All Results <ArrowRight className="w-3.5 h-3.5" />
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
              description="No matches have been completed."
              icon={Trophy}
            />
          )}
        </div>

      </section>

      {/* TABLE PREVIEW & TOP SCORERS PREVIEW */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* League Table Preview (2 Cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-black font-display uppercase tracking-wider text-slate-100">
              LEAGUE STANDINGS
            </h2>
            <button
              onClick={() => onNavigate('table')}
              className="text-xs font-bold uppercase tracking-wider text-gold-400 hover:text-white transition-colors flex items-center gap-1"
            >
              VIEW FULL TABLE <ArrowRight className="w-3.5 h-3.5" />
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
            <h2 className="text-base sm:text-lg font-black font-display uppercase tracking-wider text-slate-100">
              TOP SCORERS
            </h2>
            <button
              onClick={() => onNavigate('stats')}
              className="text-xs font-bold uppercase tracking-wider text-gold-400 hover:text-white transition-colors flex items-center gap-1"
            >
              All Stats <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <TopScorers
            scorers={topScorers}
            limit={4}
            onViewAll={() => onNavigate('stats')}
          />
        </div>

      </section>

    </div>
  );
};
