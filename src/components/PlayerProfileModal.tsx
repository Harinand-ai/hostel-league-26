import React, { useEffect } from 'react';
import { Player, Team, Match, Goal, ManOfTheMatch, TeamStanding } from '../types/tournament';
import { PlayerAvatar } from './PlayerAvatar';
import { TeamBadge } from './TeamBadge';
import { X, Award, Shield, Trophy } from 'lucide-react';

interface PlayerProfileModalProps {
  player: Player | null;
  team?: Team;
  matches: Match[];
  goals: Goal[];
  assists?: any[]; // Ignored / removed
  motms: ManOfTheMatch[];
  standings: TeamStanding[];
  allPlayers: Player[];
  allTeams: Team[];
  onClose: () => void;
  onNavigateToTeam?: (teamId: string) => void;
  onNavigateToMatch?: (matchId: string) => void;
}

export const PlayerProfileModal: React.FC<PlayerProfileModalProps> = ({
  player,
  team,
  matches,
  goals,
  motms,
  standings,
  onClose,
  onNavigateToTeam,
}) => {
  // ESC key listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Lock scroll while modal open
  useEffect(() => {
    if (player) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [player]);

  if (!player) return null;

  // Real statistics computation
  const teamMatches = matches.filter(
    m => m.home_team_id === player.team_id || m.away_team_id === player.team_id
  );
  const completedMatches = teamMatches.filter(m => m.status === 'COMPLETED');
  const matchesPlayed = completedMatches.length;

  const playerGoals = goals.filter(g => g.player_id === player.id);
  const playerMotms = motms.filter(m => m.player_id === player.id);

  const isDefensive = player.position === 'GK' || player.position === 'CB';
  const cleanSheetsCount = completedMatches.filter(m => {
    const isHome = m.home_team_id === player.team_id;
    return isHome ? m.away_score === 0 : m.home_score === 0;
  }).length;

  const standing = standings.find(s => s.team.id === player.team_id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-sm bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="p-5 text-center bg-slate-50 border-b border-slate-100">
          <div className="flex justify-center mb-3">
            <PlayerAvatar
              player={player}
              team={team}
              size="xl"
            />
          </div>

          <div className="flex items-center justify-center gap-1.5">
            <h2 className="text-lg font-black text-slate-900 tracking-tight">
              {player.name}
            </h2>
            {player.is_captain && (
              <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase bg-amber-100 text-amber-800 border border-amber-200">
                CAPTAIN
              </span>
            )}
          </div>

          {team && (
            <button
              onClick={() => {
                onClose();
                onNavigateToTeam?.(team.id);
              }}
              className="mt-1 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-green-700 transition-colors cursor-pointer"
            >
              <TeamBadge team={team} size="xs" />
              <span>{team.name}</span>
              <span className="text-slate-400">• {player.position}</span>
            </button>
          )}
        </div>

        {/* Official Stats Grid */}
        <div className="p-4 space-y-3">
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-400 font-bold block uppercase">Matches</span>
              <span className="text-lg font-black text-slate-900">{matchesPlayed}</span>
            </div>

            <div className="p-2.5 bg-green-50 rounded-xl border border-green-200">
              <span className="text-[10px] text-green-700 font-bold block uppercase">Goals</span>
              <span className="text-lg font-black text-green-800">{playerGoals.length}</span>
            </div>

            <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200">
              <span className="text-[10px] text-amber-800 font-bold block uppercase">POTM</span>
              <span className="text-lg font-black text-amber-900">{playerMotms.length}</span>
            </div>
          </div>

          {/* Clean sheets stat if goalkeeper or defender */}
          {isDefensive && (
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-green-700" />
                <span className="font-semibold text-slate-700">Clean Sheets Kept</span>
              </div>
              <span className="text-sm font-black text-slate-900">{cleanSheetsCount}</span>
            </div>
          )}

          {/* Team Standing Context */}
          {standing && team && (
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-600" />
                <span className="font-semibold text-slate-700">{team.name} Standing</span>
              </div>
              <span className="text-xs font-bold text-slate-900">
                Rank #{standing.position} ({standing.points} pts)
              </span>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
          <button
            onClick={onClose}
            className="w-full py-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 uppercase tracking-wider transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
