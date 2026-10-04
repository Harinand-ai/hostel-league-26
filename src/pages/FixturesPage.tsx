import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Match, Team } from '../types/tournament';
import { FixtureCard } from '../components/FixtureCard';
import { Calendar } from 'lucide-react';

interface FixturesPageProps {
  matches: Match[];
  teams: Team[];
  onNavigate: (tab: string, param?: string) => void;
}

export const FixturesPage: React.FC<FixturesPageProps> = ({
  matches,
  teams,
  onNavigate,
}) => {
  const [selectedRound, setSelectedRound] = useState<number | 'ALL'>('ALL');
  const teamsMap = new Map(teams.map(t => [t.id, t]));

  const rounds = [1, 2, 3, 4, 5];

  const filteredRounds = selectedRound === 'ALL' 
    ? rounds 
    : rounds.filter(r => r === selectedRound);

  return (
    <div className="space-y-10">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 pb-6 border-b border-stadium-800">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-mono font-bold uppercase tracking-widest mb-1.5">
            <Calendar className="w-3.5 h-3.5" />
            OFFICIAL TOURNAMENT SCHEDULE
          </div>
          <h1 className="text-3xl sm:text-5xl font-black font-display tracking-tight text-white uppercase">
            COMPETITION FIXTURES
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 font-mono">
            15 official matches across 5 single round-robin stages. Dates & kickoff times announced by tournament officials.
          </p>
        </div>

        {/* Round Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-stadium-900 border border-stadium-750 overflow-x-auto max-w-full font-mono">
          <button
            onClick={() => setSelectedRound('ALL')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
              selectedRound === 'ALL'
                ? 'bg-gold-500 text-stadium-980 shadow-md font-black'
                : 'text-slate-400 hover:text-white hover:bg-stadium-850'
            }`}
          >
            ALL ROUNDS
          </button>
          {rounds.map(r => (
            <button
              key={r}
              onClick={() => setSelectedRound(r)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                selectedRound === r
                  ? 'bg-gold-500 text-stadium-980 shadow-md font-black'
                  : 'text-slate-400 hover:text-white hover:bg-stadium-850'
              }`}
            >
              ROUND {String(r).padStart(2, '0')}
            </button>
          ))}
        </div>
      </div>

      {/* Rounds Grouping with Entrance Animation */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedRound}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="space-y-12"
        >
          {filteredRounds.map(roundNum => {
            const roundMatches = matches
              .filter(m => m.round_number === roundNum)
              .sort((a, b) => a.match_number - b.match_number);

            return (
              <section key={roundNum} className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-stadium-800/80">
                  <div className="flex items-center gap-3">
                    <div className="h-6 w-1 rounded-full bg-emerald-400" />
                    <h2 className="text-xl sm:text-2xl font-black font-display uppercase tracking-tight text-white">
                      ROUND {String(roundNum).padStart(2, '0')}
                    </h2>
                  </div>
                  <span className="text-xs font-mono text-slate-400 font-bold">
                    3 OFFICIAL FIXTURES
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {roundMatches.map(match => {
                    const home = teamsMap.get(match.home_team_id);
                    const away = teamsMap.get(match.away_team_id);
                    if (!home || !away) return null;

                    return (
                      <FixtureCard
                        key={match.id}
                        match={match}
                        homeTeam={home}
                        awayTeam={away}
                        onClick={() => onNavigate('match-detail', match.id)}
                      />
                    );
                  })}
                </div>
              </section>
            );
          })}
        </motion.div>
      </AnimatePresence>

    </div>
  );
};
