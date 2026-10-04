import React, { useState } from 'react';
import { Match, Team } from '../types/tournament';
import { FixtureCard } from '../components/FixtureCard';
import { Calendar, Filter } from 'lucide-react';

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
    <div className="space-y-8">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-stadium-800">
        <div>
          <div className="flex items-center gap-2 text-gold-400 text-xs font-bold uppercase tracking-widest mb-1">
            <Calendar className="w-3.5 h-3.5" />
            Official Schedule
          </div>
          <h1 className="text-3xl sm:text-4xl font-black font-display tracking-tight text-white uppercase">
            TOURNAMENT FIXTURES
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            15 official matches across 5 rounds. Match dates and kickoff times are announced by tournament organizers.
          </p>
        </div>

        {/* Round Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-stadium-900 border border-stadium-800 overflow-x-auto max-w-full">
          <button
            onClick={() => setSelectedRound('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
              selectedRound === 'ALL'
                ? 'bg-gold-500 text-stadium-950 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-stadium-850'
            }`}
          >
            All Rounds
          </button>
          {rounds.map(r => (
            <button
              key={r}
              onClick={() => setSelectedRound(r)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                selectedRound === r
                  ? 'bg-gold-500 text-stadium-950 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-stadium-850'
              }`}
            >
              R{r}
            </button>
          ))}
        </div>
      </div>

      {/* Rounds Grouping */}
      <div className="space-y-12">
        {filteredRounds.map(roundNum => {
          const roundMatches = matches
            .filter(m => m.round_number === roundNum)
            .sort((a, b) => a.match_number - b.match_number);

          return (
            <section key={roundNum} className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-6 w-1 rounded-full bg-gold-500" />
                <h2 className="text-lg sm:text-xl font-black font-display uppercase tracking-wider text-slate-100">
                  ROUND {roundNum}
                </h2>
                <span className="text-xs font-mono text-slate-400">
                  (3 Matches)
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
      </div>

    </div>
  );
};
