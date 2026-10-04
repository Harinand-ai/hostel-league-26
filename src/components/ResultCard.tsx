import React from 'react';
import { Match, Team, Goal, ManOfTheMatch, Player } from '../types/tournament';
import { TeamBadge } from './TeamBadge';
import { Award, ChevronRight } from 'lucide-react';

interface ResultCardProps {
  match: Match;
  homeTeam: Team;
  awayTeam: Team;
  goals?: Goal[];
  motm?: ManOfTheMatch;
  players?: Player[];
  onClick?: () => void;
}

export const ResultCard: React.FC<ResultCardProps> = ({
  match,
  homeTeam,
  awayTeam,
  goals = [],
  motm,
  players = [],
  onClick,
}) => {
  const homeGoals = goals.filter(g => g.team_id === homeTeam.id);
  const awayGoals = goals.filter(g => g.team_id === awayTeam.id);

  const playersMap = new Map(players.map(p => [p.id, p]));
  const motmPlayer = motm ? playersMap.get(motm.player_id) : null;

  return (
    <div
      onClick={onClick}
      className="group rounded-xl bg-stadium-900 border border-stadium-800/90 overflow-hidden hover:border-stadium-700 hover:bg-stadium-850 transition-all duration-200 cursor-pointer shadow-md hover:shadow-xl"
    >
      {/* Top Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-stadium-950/60 border-b border-stadium-800/60 text-xs">
        <span className="font-mono font-bold text-slate-400">
          ROUND {match.round_number} • MATCH {String(match.match_number).padStart(2, '0')}
        </span>
        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
          FULL TIME
        </span>
      </div>

      {/* Main Score Area */}
      <div className="p-5">
        <div className="grid grid-cols-7 items-center gap-2">
          {/* Home team */}
          <div className="col-span-3 flex flex-col sm:flex-row items-center gap-3">
            <TeamBadge team={homeTeam} size="md" />
            <div className="text-center sm:text-left">
              <span className="font-display font-bold text-base text-slate-100 group-hover:text-gold-400 transition-colors block">
                {homeTeam.name}
              </span>
              <span className="text-[11px] text-slate-400">
                Mgr: {homeTeam.manager_name}
              </span>
            </div>
          </div>

          {/* Scores */}
          <div className="col-span-1 flex items-center justify-center">
            <div className="px-3 py-1.5 rounded-lg bg-stadium-950 border border-stadium-700/80 font-display font-black text-xl sm:text-2xl text-white shadow-inner flex items-center gap-2">
              <span className={match.home_score! > match.away_score! ? 'text-gold-400' : 'text-slate-100'}>
                {match.home_score}
              </span>
              <span className="text-slate-500 text-base font-normal">-</span>
              <span className={match.away_score! > match.home_score! ? 'text-gold-400' : 'text-slate-100'}>
                {match.away_score}
              </span>
            </div>
          </div>

          {/* Away team */}
          <div className="col-span-3 flex flex-col sm:flex-row-reverse items-center gap-3 text-center sm:text-right">
            <TeamBadge team={awayTeam} size="md" />
            <div>
              <span className="font-display font-bold text-base text-slate-100 group-hover:text-gold-400 transition-colors block">
                {awayTeam.name}
              </span>
              <span className="text-[11px] text-slate-400">
                Mgr: {awayTeam.manager_name}
              </span>
            </div>
          </div>
        </div>

        {/* Goal events preview */}
        {(homeGoals.length > 0 || awayGoals.length > 0) && (
          <div className="mt-4 pt-3 border-t border-stadium-800/60 grid grid-cols-2 gap-4 text-xs">
            {/* Home Goals */}
            <div className="space-y-1">
              {homeGoals.map(g => {
                const p = playersMap.get(g.player_id);
                return (
                  <div key={g.id} className="flex items-center gap-1.5 text-slate-300">
                    <span className="text-emerald-400 font-mono text-[11px]">⚽ {g.minute}'</span>
                    <span className="truncate">{p?.name || 'Goal'}</span>
                  </div>
                );
              })}
            </div>

            {/* Away Goals */}
            <div className="space-y-1 text-right">
              {awayGoals.map(g => {
                const p = playersMap.get(g.player_id);
                return (
                  <div key={g.id} className="flex items-center justify-end gap-1.5 text-slate-300">
                    <span className="truncate">{p?.name || 'Goal'}</span>
                    <span className="text-emerald-400 font-mono text-[11px]">⚽ {g.minute}'</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* MOTM and details link */}
        <div className="mt-4 pt-3 border-t border-stadium-800/60 flex items-center justify-between text-xs">
          {motmPlayer ? (
            <div className="flex items-center gap-1.5 text-gold-400 font-medium">
              <Award className="w-3.5 h-3.5" />
              <span>MOTM: <strong>{motmPlayer.name}</strong></span>
            </div>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-1 text-slate-400 group-hover:text-gold-400 transition-colors font-semibold text-xs ml-auto">
            <span>Match Details</span>
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>

      </div>
    </div>
  );
};
