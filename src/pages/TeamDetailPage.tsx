import React from 'react';
import { Team, Match, TeamStanding, Player, Goal } from '../types/tournament';
import { TeamBadge } from '../components/TeamBadge';
import { PlayerAvatar } from '../components/PlayerAvatar';
import { FixtureCard } from '../components/FixtureCard';
import { ArrowLeft, Shield, Users, Calendar, ChevronRight } from 'lucide-react';

interface TeamDetailPageProps {
  teamId: string;
  teams: Team[];
  matches: Match[];
  standings: TeamStanding[];
  players: Player[];
  goals: Goal[];
  onNavigate: (tab: string, param?: string) => void;
  onSelectPlayer?: (playerId: string) => void;
}

export const TeamDetailPage: React.FC<TeamDetailPageProps> = ({
  teamId,
  teams,
  matches,
  standings,
  players,
  goals,
  onNavigate,
  onSelectPlayer,
}) => {
  const team = teams.find(t => t.id === teamId);
  const standing = standings.find(s => s.team.id === teamId);
  const teamsMap = new Map(teams.map(t => [t.id, t]));

  if (!team || !standing) {
    return (
      <div className="py-12 text-center max-w-lg mx-auto">
        <p className="text-slate-600 text-sm">Club not found.</p>
        <button
          onClick={() => onNavigate('teams')}
          className="mt-3 px-4 py-2 bg-green-600 text-white rounded-lg text-xs font-bold uppercase cursor-pointer"
        >
          Back to Teams
        </button>
      </div>
    );
  }

  // Filter team fixtures
  const teamMatches = matches
    .filter(m => m.home_team_id === teamId || m.away_team_id === teamId)
    .sort((a, b) => a.match_number - b.match_number);

  // Team players
  const teamPlayers = players.filter(p => p.team_id === teamId);

  return (
    <div className="space-y-4 max-w-lg mx-auto">
      
      {/* Back button */}
      <button
        onClick={() => onNavigate('teams')}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to All Teams</span>
      </button>

      {/* Club Hero Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <TeamBadge team={team} size="lg" />
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-green-700 block">
                RANK #{standing.position}
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-tight">
                {team.name}
              </h1>
              <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                <Shield className="w-3.5 h-3.5 text-slate-400" />
                <span>Manager: <strong className="text-slate-700">{team.manager_name}</strong></span>
              </div>
            </div>
          </div>
        </div>

        {/* Season Record Ticker */}
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 mt-4 pt-3 border-t border-slate-100 text-center text-xs">
          <div className="bg-slate-50 p-2 rounded-lg">
            <span className="text-[10px] text-slate-400 font-bold block">P</span>
            <span className="font-extrabold text-slate-800">{standing.played}</span>
          </div>
          <div className="bg-slate-50 p-2 rounded-lg">
            <span className="text-[10px] text-slate-400 font-bold block">W</span>
            <span className="font-extrabold text-green-700">{standing.won}</span>
          </div>
          <div className="bg-slate-50 p-2 rounded-lg">
            <span className="text-[10px] text-slate-400 font-bold block">D</span>
            <span className="font-extrabold text-slate-800">{standing.drawn}</span>
          </div>
          <div className="bg-slate-50 p-2 rounded-lg">
            <span className="text-[10px] text-slate-400 font-bold block">L</span>
            <span className="font-extrabold text-slate-800">{standing.lost}</span>
          </div>
          <div className="bg-slate-50 p-2 rounded-lg">
            <span className="text-[10px] text-slate-400 font-bold block">GF</span>
            <span className="font-extrabold text-slate-800">{standing.goals_for}</span>
          </div>
          <div className="bg-slate-50 p-2 rounded-lg">
            <span className="text-[10px] text-slate-400 font-bold block">GA</span>
            <span className="font-extrabold text-slate-800">{standing.goals_against}</span>
          </div>
          <div className="bg-slate-50 p-2 rounded-lg">
            <span className="text-[10px] text-slate-400 font-bold block">GD</span>
            <span className="font-extrabold text-slate-800">
              {standing.goal_difference > 0 ? `+${standing.goal_difference}` : standing.goal_difference}
            </span>
          </div>
          <div className="bg-green-50 border border-green-200 p-2 rounded-lg">
            <span className="text-[10px] text-green-700 font-bold block">PTS</span>
            <span className="font-black text-green-800 text-sm">{standing.points}</span>
          </div>
        </div>
      </div>

      {/* Squad Roster */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
        <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-100">
          <div className="flex items-center gap-1.5 font-bold text-xs uppercase text-slate-900">
            <Users className="w-4 h-4 text-green-700" />
            <span>OFFICIAL ROSTER ({teamPlayers.length} PLAYERS)</span>
          </div>
        </div>

        <div className="space-y-1.5">
          {teamPlayers.map(player => (
            <div
              key={player.id}
              onClick={() => onSelectPlayer?.(player.id)}
              className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <PlayerAvatar player={player} team={team} size="sm" />
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-xs text-slate-900">
                      {player.name}
                    </span>
                    {player.is_captain && (
                      <span className="px-1 py-0.2 rounded text-[9px] font-black uppercase bg-amber-100 text-amber-800 border border-amber-200">
                        C
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-500">
                    {player.position}
                  </span>
                </div>
              </div>

              <span className="text-[11px] text-green-700 font-semibold flex items-center gap-0.5">
                Profile <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Team Matches */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
        <div className="flex items-center gap-1.5 font-bold text-xs uppercase text-slate-900 pb-2.5 mb-2.5 border-b border-slate-100">
          <Calendar className="w-4 h-4 text-green-700" />
          <span>CLUB FIXTURES ({teamMatches.length})</span>
        </div>

        <div className="space-y-2.5">
          {teamMatches.map(match => {
            const home = teamsMap.get(match.home_team_id);
            const away = teamsMap.get(match.away_team_id);
            if (!home || !away) return null;

            return (
              <FixtureCard
                key={match.id}
                match={match}
                homeTeam={home}
                awayTeam={away}
                showRound={true}
                onClick={() => onNavigate('match-detail', match.id)}
              />
            );
          })}
        </div>
      </div>

    </div>
  );
};
