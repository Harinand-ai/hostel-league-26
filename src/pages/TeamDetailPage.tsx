import React from 'react';
import { Team, Match, TeamStanding, Player, Goal } from '../types/tournament';
import { TeamBadge } from '../components/TeamBadge';
import { PlayerAvatar } from '../components/PlayerAvatar';
import { FixtureCard } from '../components/FixtureCard';
import { ResultCard } from '../components/ResultCard';
import { EmptyState } from '../components/EmptyState';
import { ArrowLeft, Shield, Flame, Users, Calendar, Trophy, ChevronRight } from 'lucide-react';

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
      <div className="py-12 text-center">
        <EmptyState
          title="CLUB NOT FOUND"
          description="The requested club does not exist in Hostel League 26."
          actionText="Back to Clubs"
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
    <div className="space-y-12">
      
      {/* Back button */}
      <button
        onClick={() => onNavigate('teams')}
        className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to All Clubs
      </button>

      {/* CLUB PROFILE HERO BANNER */}
      <div className="relative overflow-hidden rounded-3xl bg-[#090d16] border border-stadium-750 p-6 sm:p-10 shadow-broadcast">
        
        {/* Subtle Club Color Light Halo */}
        <div
          className="absolute -top-24 -right-24 w-96 h-96 rounded-full blur-[120px] opacity-25 pointer-events-none"
          style={{ backgroundColor: team.primary_color }}
        />

        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start justify-between gap-8 text-center md:text-left">
          
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <TeamBadge team={team} size="2xl" glow={true} />

            <div>
              <div className="flex items-center justify-center sm:justify-start gap-2.5 font-mono">
                <span className="text-xs font-bold px-2.5 py-0.5 rounded bg-stadium-850 text-gold-400 border border-stadium-750">
                  {team.short_name}
                </span>
                <span className="text-xs font-bold text-slate-400">
                  CURRENT STANDINGS: #{standing.position}
                </span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black font-display text-white mt-1.5 uppercase tracking-tight">
                {team.name}
              </h1>

              {/* Explicit Manager Display as specified */}
              <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-stadium-950 border border-stadium-750 text-xs font-mono">
                <Shield className="w-4 h-4 text-emerald-400" />
                <span className="text-slate-400 font-sans">MANAGER:</span>
                <span className="text-white font-bold uppercase">{team.manager_name}</span>
              </div>
            </div>
          </div>

          {/* Form Streak */}
          <div className="flex flex-col items-center md:items-end font-mono">
            <span className="text-xs text-slate-400 uppercase font-bold mb-2">RECENT FORM</span>
            <div className="flex items-center gap-1.5">
              {standing.form.length === 0 ? (
                <span className="text-xs text-slate-400">No matches played</span>
              ) : (
                standing.form.map((r, i) => (
                  <span
                    key={i}
                    className={`w-7 h-7 rounded text-xs font-black font-mono flex items-center justify-center shadow-sm ${
                      r === 'W'
                        ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-500/40'
                        : r === 'D'
                        ? 'bg-amber-500/25 text-amber-300 border border-amber-500/40'
                        : 'bg-rose-500/25 text-rose-300 border border-rose-500/40'
                    }`}
                  >
                    {r}
                  </span>
                ))
              )}
            </div>
          </div>

        </div>

        {/* Season Record Ticker Bar */}
        <div className="mt-10 pt-6 border-t border-stadium-800 grid grid-cols-4 sm:grid-cols-8 gap-3 text-center font-mono">
          <div className="p-3 rounded-xl bg-stadium-950/80 border border-stadium-800">
            <span className="text-[10px] text-slate-400 uppercase block font-sans font-bold">PLAYED</span>
            <span className="text-lg font-bold text-slate-200">{standing.played}</span>
          </div>
          <div className="p-3 rounded-xl bg-stadium-950/80 border border-stadium-800">
            <span className="text-[10px] text-slate-400 uppercase block font-sans font-bold">WON</span>
            <span className="text-lg font-bold text-emerald-400">{standing.won}</span>
          </div>
          <div className="p-3 rounded-xl bg-stadium-950/80 border border-stadium-800">
            <span className="text-[10px] text-slate-400 uppercase block font-sans font-bold">DRAWN</span>
            <span className="text-lg font-bold text-slate-300">{standing.drawn}</span>
          </div>
          <div className="p-3 rounded-xl bg-stadium-950/80 border border-stadium-800">
            <span className="text-[10px] text-slate-400 uppercase block font-sans font-bold">LOST</span>
            <span className="text-lg font-bold text-rose-400">{standing.lost}</span>
          </div>
          <div className="p-3 rounded-xl bg-stadium-950/80 border border-stadium-800">
            <span className="text-[10px] text-slate-400 uppercase block font-sans font-bold">GF</span>
            <span className="text-lg font-bold text-slate-200">{standing.goals_for}</span>
          </div>
          <div className="p-3 rounded-xl bg-stadium-950/80 border border-stadium-800">
            <span className="text-[10px] text-slate-400 uppercase block font-sans font-bold">GA</span>
            <span className="text-lg font-bold text-slate-300">{standing.goals_against}</span>
          </div>
          <div className="p-3 rounded-xl bg-stadium-950/80 border border-stadium-800">
            <span className="text-[10px] text-slate-400 uppercase block font-sans font-bold">GD</span>
            <span className={`text-lg font-bold ${standing.goal_difference > 0 ? 'text-emerald-400' : standing.goal_difference < 0 ? 'text-rose-400' : 'text-slate-200'}`}>
              {standing.goal_difference > 0 ? `+${standing.goal_difference}` : standing.goal_difference}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-gold-500/10 border border-gold-500/30">
            <span className="text-[10px] text-gold-400 uppercase block font-sans font-black">POINTS</span>
            <span className="text-lg font-black text-gold-400">{standing.points}</span>
          </div>
        </div>
      </div>

      {/* Squad & Top Scorer Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Registered Squad Roster (2 Cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-display font-black uppercase tracking-broadcast text-white">
              REGISTERED SQUAD ({teamPlayers.length})
            </h3>
          </div>

          {teamPlayers.length === 0 ? (
            <EmptyState
              title="NO PLAYERS REGISTERED"
              description="Squad members for this club will be entered by tournament officials in the admin dashboard."
              icon={Users}
              className="py-10"
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {teamPlayers.map(player => (
                <div
                  key={player.id}
                  onClick={() => onSelectPlayer?.(player.id)}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-[#090d16] border border-stadium-750 hover:border-gold-500/40 hover:bg-stadium-900/60 transition-all cursor-pointer group shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <PlayerAvatar
                      player={player}
                      team={team}
                      size="sm"
                      showCaptainBadge={false}
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-display font-black text-sm text-white block uppercase tracking-tight group-hover:text-gold-400 transition-colors">
                          {player.name}
                        </span>
                        {player.is_captain && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-black uppercase bg-gold-400 text-stadium-980 tracking-widest shadow-sm">
                            CAPTAIN
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {player.position === 'GK' ? 'Goalkeeper' : player.position === 'CB' ? 'Center Back' : player.position === 'MID' ? 'Midfielder' : player.position === 'CF' ? 'Center Forward' : 'Position TBD'}
                      </span>
                    </div>
                  </div>

                  <span className="text-[10px] font-mono font-bold uppercase text-slate-400 group-hover:text-gold-400 transition-colors flex items-center gap-1">
                    Profile <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Club Top Scorer (1 Col) */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-gold-400" />
            <h3 className="text-sm font-display font-black uppercase tracking-broadcast text-white">
              CLUB LEADING SCORER
            </h3>
          </div>

          {topScorerPlayer ? (
            <div 
              onClick={() => onSelectPlayer?.((topScorerPlayer as any).player.id)}
              className="p-6 rounded-2xl bg-[#090d16] border border-stadium-750 hover:border-gold-500/40 hover:bg-stadium-900/60 transition-all cursor-pointer group text-center flex flex-col items-center shadow-broadcast"
            >
              <div className="mb-3">
                <PlayerAvatar
                  player={(topScorerPlayer as any).player}
                  team={team}
                  size="xl"
                  glow={true}
                />
              </div>
              <h4 className="font-display font-black text-xl text-white uppercase group-hover:text-gold-400 transition-colors">
                {(topScorerPlayer as any).player.name}
              </h4>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                {(topScorerPlayer as any).player.position}
              </p>
              <div className="mt-5 pt-4 border-t border-stadium-800 w-full flex items-center justify-center gap-2 font-mono">
                <span className="text-3xl font-black text-gold-400">{(topScorerPlayer as any).count}</span>
                <span className="text-xs uppercase text-slate-400 font-bold">Tournament Goals</span>
              </div>
              <span className="mt-3 text-[10px] font-mono font-bold uppercase text-slate-400 group-hover:text-gold-400 transition-colors flex items-center gap-1">
                View Full Profile <ChevronRight className="w-3 h-3" />
              </span>
            </div>
          ) : (
            <EmptyState
              title="NO GOALS SCORED"
              description="Club top scorer will update as matches are played."
              icon={Flame}
              className="py-10"
            />
          )}
        </div>

      </div>

      {/* Club Schedule: Upcoming Fixtures & Results */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Upcoming fixtures for this team */}
        <div className="space-y-4">
          <h3 className="text-sm font-display font-black uppercase tracking-broadcast text-white flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-400" />
            UPCOMING CLUB FIXTURES ({upcomingMatches.length})
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
          <h3 className="text-sm font-display font-black uppercase tracking-broadcast text-white flex items-center gap-2">
            <Trophy className="w-4 h-4 text-gold-400" />
            RECENT MATCH REPORTS ({recentResults.length})
          </h3>

          {recentResults.length === 0 ? (
            <EmptyState
              title="NO COMPLETED MATCHES"
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
