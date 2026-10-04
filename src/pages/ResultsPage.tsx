import React, { useState } from 'react';
import { Match, Team, Goal, ManOfTheMatch, Player } from '../types/tournament';
import { ResultCard } from '../components/ResultCard';
import { EmptyState } from '../components/EmptyState';
import { Trophy, CheckCircle2 } from 'lucide-react';

interface ResultsPageProps {
  matches: Match[];
  teams: Team[];
  goals: Goal[];
  motms: ManOfTheMatch[];
  players: Player[];
  onNavigate: (tab: string, param?: string) => void;
}

export const ResultsPage: React.FC<ResultsPageProps> = ({
  matches,
  teams,
  goals,
  motms,
  players,
  onNavigate,
}) => {
  const [selectedRound, setSelectedRound] = useState<number | 'ALL'>('ALL');
  const teamsMap = new Map(teams.map(t => [t.id, t]));
  const motmMap = new Map(motms.map(m => [m.match_id, m]));

  const completedMatches = matches.filter(m => m.status === 'COMPLETED');
  const rounds = [1, 2, 3, 4, 5];

  if (completedMatches.length === 0) {
    return (
      <div className="space-y-8">
        <div className="pb-6 border-b border-stadium-800">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-widest mb-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Official Scores
          </div>
          <h1 className="text-3xl sm:text-4xl font-black font-display tracking-tight text-white uppercase">
            MATCH RESULTS
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Official verified scorelines, goalscorers, and Man of the Match awards.
          </p>
        </div>

        <EmptyState
          title="NO RESULTS YET"
          description="No matches have been completed. Once fixtures conclude and scores are recorded, match results will appear here."
          icon={Trophy}
          actionText="View Upcoming Fixtures"
          onAction={() => onNavigate('fixtures')}
          className="py-16"
        />
      </div>
    );
  }

  const filteredRounds = selectedRound === 'ALL'
    ? rounds
    : rounds.filter(r => r === selectedRound);

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-stadium-800">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-widest mb-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Official Scores
          </div>
          <h1 className="text-3xl sm:text-4xl font-black font-display tracking-tight text-white uppercase">
            MATCH RESULTS
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {completedMatches.length} of {matches.length} matches completed. Click any match for full report.
          </p>
        </div>

        {/* Round Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-stadium-900 border border-stadium-800 overflow-x-auto max-w-full">
          <button
            onClick={() => setSelectedRound('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
              selectedRound === 'ALL'
                ? 'bg-emerald-500 text-stadium-950 shadow-sm'
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
                  ? 'bg-emerald-500 text-stadium-950 shadow-sm'
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
          const roundMatches = completedMatches
            .filter(m => m.round_number === roundNum)
            .sort((a, b) => a.match_number - b.match_number);

          if (roundMatches.length === 0) return null;

          return (
            <section key={roundNum} className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-6 w-1 rounded-full bg-emerald-500" />
                <h2 className="text-lg sm:text-xl font-black font-display uppercase tracking-wider text-slate-100">
                  ROUND {roundNum}
                </h2>
                <span className="text-xs font-mono text-slate-400">
                  ({roundMatches.length} Completed)
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {roundMatches.map(match => {
                  const home = teamsMap.get(match.home_team_id);
                  const away = teamsMap.get(match.away_team_id);
                  if (!home || !away) return null;

                  const matchGoals = goals.filter(g => g.match_id === match.id);
                  const matchMotm = motmMap.get(match.id);

                  return (
                    <ResultCard
                      key={match.id}
                      match={match}
                      homeTeam={home}
                      awayTeam={away}
                      goals={matchGoals}
                      motm={matchMotm}
                      players={players}
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
