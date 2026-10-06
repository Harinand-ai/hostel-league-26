import React, { useState } from 'react';
import { Match, Team } from '../types/tournament';
import { FixtureCard } from '../components/FixtureCard';

interface FixturesPageProps {
  matches: Match[];
  teams: Team[];
  activePollMatchIds?: Set<string>;
  onNavigate: (tab: string, param?: string) => void;
}

export const FixturesPage: React.FC<FixturesPageProps> = ({
  matches,
  teams,
  activePollMatchIds,
  onNavigate,
}) => {
  const [selectedRound, setSelectedRound] = useState<number | 'ALL'>('ALL');
  const teamsMap = new Map(teams.map(t => [t.id, t]));

  const rounds = [1, 2, 3, 4, 5];

  const filteredRounds = selectedRound === 'ALL' 
    ? rounds 
    : rounds.filter(r => r === selectedRound);

  return (
    <div className="space-y-5 max-w-lg mx-auto">
      
      {/* Page Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight uppercase">
              TOURNAMENT MATCHES
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              15 official fixtures across 5 rounds
            </p>
          </div>

          {/* Quick Round Filters */}
          <div className="flex items-center gap-1 overflow-x-auto py-1">
            <button
              onClick={() => setSelectedRound('ALL')}
              className={`px-2.5 py-1 rounded text-xs font-bold uppercase transition-colors shrink-0 cursor-pointer ${
                selectedRound === 'ALL'
                  ? 'bg-green-700 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All
            </button>
            {rounds.map(r => (
              <button
                key={r}
                onClick={() => setSelectedRound(r)}
                className={`px-2 py-1 rounded text-xs font-bold uppercase transition-colors shrink-0 cursor-pointer ${
                  selectedRound === r
                    ? 'bg-green-700 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                R{r}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Rounds List */}
      <div className="space-y-6">
        {filteredRounds.map(roundNum => {
          const roundMatches = matches
            .filter(m => m.round_number === roundNum)
            .sort((a, b) => a.match_number - b.match_number);

          return (
            <div key={roundNum} className="space-y-2.5">
              <div className="flex items-center justify-between px-1">
                <h2 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-2">
                  <span className="w-1.5 h-3 bg-green-700 rounded-full" />
                  ROUND {roundNum}
                </h2>
                <span className="text-[11px] text-slate-400 font-medium">
                  3 Matches
                </span>
              </div>

              <div className="space-y-2.5">
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
                      hasActivePoll={activePollMatchIds?.has(match.id)}
                      onClick={() => onNavigate('match-detail', match.id)}
                    />
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
