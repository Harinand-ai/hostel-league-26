import React from 'react';
import { Team, Match, TeamStanding, Player, Goal } from '../types/tournament';
import { TeamBadge } from '../components/TeamBadge';
import { FixtureCard } from '../components/FixtureCard';
import { ResultCard } from '../components/ResultCard';
import { EmptyState } from '../components/EmptyState';
import { ArrowLeft, Shield, Trophy, Users, Flame } from 'lucide-react';

interface TeamDetailPageProps {
  teamId: string;
  teams: Team[];
  matches: Match[];
  standings: TeamStanding[];
  players: Player[];
  goals: Goal[];
  onNavigate: (tab: string, param?: string) => void;
}

export const TeamDetailPage: React.FC<TeamDetailPageProps> = ({
  teamId,
  teams,
  matches,
  standings,
  players,
  goals,
  onNavigate,
}) => {
  const team = teams.find(t => t.id === teamId);
  const standing = standings.find(s => s.team.id === teamId);
  const teamsMap = new Map(teams.map(t => [t.id, t]));

  if (!team || !standing) {
    return (
      <div className="py-12 text-center">
        <EmptyState
          title="TEAM NOT FOUND"
          description="The requested team does not exist in Hostel League 26."
          actionText="Back to Teams"
          onAction={() => onNavigate('teams')}
        />
      </div>
    );
  }

  // Filter team fixtures and results
  const teamMatches = matches.filter(
    m => m.home_team_id === teamId || m.away_team_id === teamId
  );
  const upcomingMatches = teamMatches.filter(m => m.status === 'UPCOMING' || m.status === 'LIVE');
  const recentResults = teamMatches.filter(m => m.status === 'COMPLETED');

  // Team players
  const teamPlayers = players.filter(p => p.team_id === teamId);

  // Top scorer for this team
  const teamGoals = goals.filter(g => g.team_id === teamId);
  const scorerCounts = new Map<string, number>();
  teamGoals.forEach(g => {
    scorerCounts.set(g.player_id, (scorerCounts.get(g.player_id) || 0) + 1);
  });
  let topScorerPlayer: { player: Player; count: number } | null = null;
  scorerCounts.forEach((count, pid) => {
    const pl = players.find(p => p.id === pid);
    if (pl && (!topScorerPlayer || count > topScorerPlayer.count)) {
      topScorerPlayer = { player: pl, count };
    }
  });

  return (
    <div className="space-y-10">
      
      {/* Back button */}
      <button
        onClick={() => onNavigate('teams')}
        className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to All Teams
      </button>

      {/* Team Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-stadium-900 via-stadium-850 to-stadium-900 border border-stadium-800 p-6 sm:p-8 shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start justify-between gap-6 text-center md:text-left">
          
          <div className="flex flex-col sm:flex-row items-center gap-5">
            <TeamBadge team={team} size="xl" />
            <div>
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-stadium-800 text-gold-400 border border-stadium-700">
                  {team.short_name}
                </span>
                <span className="text-xs font-mono text-slate-400">
                  RANK #{standing.position}
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-black font-display text-white mt-1 uppercase">
                {team.name}
              </h1>

              {/* Explicit Manager Display */}
              <div className="mt-2.5 inline-flex items-center gap-2 px-3 py-1 rounded-md bg-stadium-950/80 border border-stadium-750 text-xs">
                <Shield className="w-3.5 h-3.5 text-gold-400" />
                <span className="text-slate-400">TEAM MANAGER:</span>
                <span className="text-white font-bold">{team.manager_name}</span>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="flex flex-col items-center md:items-end">
            <span className="text-xs text-slate-400 uppercase font-mono mb-1.5">Recent Form</span>
            <div className="flex items-center gap-1.5">
              {standing.form.length === 0 ? (
                <span className="text-xs text-slate-400 font-mono">No matches yet</span>
              ) : (
                standing.form.map((r, i) => (
                  <span
                    key={i}
                    className={`w-6 h-6 rounded flex items-center justify-center text-xs font-black font-mono ${
                      r === 'W'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        : r === 'D'
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                        : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                    }`}
                  >
                    {r}
                  </span>
                ))
              )}
            </div>
          </div>

        </div>

        {/* Statistics Bar */}
        <div className="mt-8 pt-6 border-t border-stadium-800 grid grid-cols-4 sm:grid-cols-8 gap-3 text-center font-mono">
          <div className="p-2 rounded bg-stadium-950/60 border border-stadium-800/60">
            <span className="text-[10px] text-slate-400 uppercase block font-sans">P</span>
            <span className="text-base font-bold text-slate-200">{standing.played}</span>
          </div>
          <div className="p-2 rounded bg-stadium-950/60 border border-stadium-800/60">
            <span className="text-[10px] text-slate-400 uppercase block font-sans">W</span>
            <span className="text-base font-bold text-emerald-400">{standing.won}</span>
          </div>
          <div className="p-2 rounded bg-stadium-950/60 border border-stadium-800/60">
            <span className="text-[10px] text-slate-400 uppercase block font-sans">D</span>
            <span className="text-base font-bold text-slate-300">{standing.drawn}</span>
          </div>
          <div className="p-2 rounded bg-stadium-950/60 border border-stadium-800/60">
            <span className="text-[10px] text-slate-400 uppercase block font-sans">L</span>
            <span className="text-base font-bold text-rose-400">{standing.lost}</span>
          </div>
          <div className="p-2 rounded bg-stadium-950/60 border border-stadium-800/60">
            <span className="text-[10px] text-slate-400 uppercase block font-sans">GF</span>
            <span className="text-base font-bold text-slate-200">{standing.goals_for}</span>
          </div>
          <div className="p-2 rounded bg-stadium-950/60 border border-stadium-800/60">
            <span className="text-[10px] text-slate-400 uppercase block font-sans">GA</span>
            <span className="text-base font-bold text-slate-300">{standing.goals_against}</span>
          </div>
          <div className="p-2 rounded bg-stadium-950/60 border border-stadium-800/60">
            <span className="text-[10px] text-slate-400 uppercase block font-sans">GD</span>
            <span className={`text-base font-bold ${standing.goal_difference > 0 ? 'text-emerald-400' : standing.goal_difference < 0 ? 'text-rose-400' : 'text-slate-200'}`}>
              {standing.goal_difference > 0 ? `+${standing.goal_difference}` : standing.goal_difference}
            </span>
          </div>
          <div className="p-2 rounded bg-gold-500/10 border border-gold-500/30">
            <span className="text-[10px] text-gold-400 uppercase block font-sans font-bold">PTS</span>
            <span className="text-base font-black text-gold-400">{standing.points}</span>
          </div>
        </div>
      </div>

      {/* Top Scorer & Squad Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Squad list (2 Cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-sky-400" />
              <h3 className="text-base font-black font-display uppercase tracking-wider text-slate-100">
                REGISTERED SQUAD ({teamPlayers.length})
              </h3>
            </div>
          </div>

          {teamPlayers.length === 0 ? (
            <EmptyState
              title="NO PLAYERS REGISTERED"
              description="Players can be added to this squad via the tournament admin dashboard."
              icon={Users}
              className="py-10"
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {teamPlayers.map(player => (
                <div
                  key={player.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-stadium-900 border border-stadium-800"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded bg-stadium-800 text-slate-300 font-bold font-mono text-xs flex items-center justify-center border border-stadium-750">
                      {player.position}
                    </span>
                    <div>
                      <span className="font-bold text-sm text-slate-100 block">
                        {player.name}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {player.position === 'GK' ? 'Goalkeeper' : player.position === 'DEF' ? 'Defender' : player.position === 'MID' ? 'Midfielder' : 'Forward'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Top Scorer Card (1 Col) */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-gold-400" />
            <h3 className="text-base font-black font-display uppercase tracking-wider text-slate-100">
              CLUB TOP SCORER
            </h3>
          </div>

          {topScorerPlayer ? (
            <div className="p-5 rounded-xl bg-stadium-900 border border-stadium-800 text-center flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-gold-500/20 border border-gold-500/40 flex items-center justify-center text-gold-400 mb-3">
                <Flame className="w-6 h-6" />
              </div>
              <h4 className="font-display font-black text-lg text-white">
                {(topScorerPlayer as any).player.name}
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                {(topScorerPlayer as any).player.position}
              </p>
              <div className="mt-4 pt-3 border-t border-stadium-800 w-full flex items-center justify-center gap-2 font-mono">
                <span className="text-2xl font-black text-gold-400">{(topScorerPlayer as any).count}</span>
                <span className="text-xs uppercase text-slate-400 font-bold">Goals Scored</span>
              </div>
            </div>
          ) : (
            <EmptyState
              title="NO GOALS SCORED YET"
              description="Club top scorer will update as matches are played."
              icon={Flame}
              className="py-10"
            />
          )}
        </div>

      </div>

      {/* Team Schedule: Upcoming Fixtures & Recent Results */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Upcoming fixtures for this team */}
        <div className="space-y-4">
          <h3 className="text-base font-black font-display uppercase tracking-wider text-slate-100 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-gold-400" />
            UPCOMING FIXTURES ({upcomingMatches.length})
          </h3>

          {upcomingMatches.length === 0 ? (
            <EmptyState
              title="NO UPCOMING FIXTURES"
              description="All fixtures for this club have been completed."
            />
          ) : (
            <div className="space-y-3">
              {upcomingMatches.map(match => {
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
          )}
        </div>

        {/* Recent results for this team */}
        <div className="space-y-4">
          <h3 className="text-base font-black font-display uppercase tracking-wider text-slate-100 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-emerald-400" />
            RECENT RESULTS ({recentResults.length})
          </h3>

          {recentResults.length === 0 ? (
            <EmptyState
              title="NO RESULTS YET"
              description="This club has not completed any tournament fixtures yet."
            />
          ) : (
            <div className="space-y-3">
              {recentResults.map(match => {
                const home = teamsMap.get(match.home_team_id);
                const away = teamsMap.get(match.away_team_id);
                if (!home || !away) return null;

                const matchGoals = goals.filter(g => g.match_id === match.id);

                return (
                  <ResultCard
                    key={match.id}
                    match={match}
                    homeTeam={home}
                    awayTeam={away}
                    goals={matchGoals}
                    players={players}
                    onClick={() => onNavigate('match-detail', match.id)}
                  />
                );
              })}
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
