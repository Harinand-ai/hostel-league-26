import React, { useState } from 'react';
import { PlayerStatEntry, Team, Match, TeamStanding } from '../types/tournament';
import { StatCard } from '../components/StatCard';
import { TeamBadge } from '../components/TeamBadge';
import { Flame, Compass, ShieldCheck, Award, BarChart3, Trophy } from 'lucide-react';
import { EmptyState } from '../components/EmptyState';

interface StatsPageProps {
  topScorers: PlayerStatEntry[];
  topAssists: PlayerStatEntry[];
  cleanSheets: PlayerStatEntry[];
  motmLeaderboard: PlayerStatEntry[];
  teams: Team[];
  matches: Match[];
  standings: TeamStanding[];
  onNavigate: (tab: string, param?: string) => void;
}

export const StatsPage: React.FC<StatsPageProps> = ({
  topScorers,
  topAssists,
  cleanSheets,
  motmLeaderboard,
  teams,
  matches,
  standings,
  onNavigate,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'scorers' | 'assists' | 'motm' | 'cleansheets' | 'teams'>('all');

  // Calculate team goals leaderboard
  const teamGoalsEntries: { team: Team; goals: number; rank: number }[] = standings
    .map((s, idx) => ({
      team: s.team,
      goals: s.goals_for,
      rank: idx + 1,
    }))
    .sort((a, b) => b.goals - a.goals || a.team.name.localeCompare(b.team.name))
    .map((entry, idx) => ({ ...entry, rank: idx + 1 }));

  const totalGoals = standings.reduce((acc, curr) => acc + curr.goals_for, 0);

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-stadium-800">
        <div>
          <div className="flex items-center gap-2 text-gold-400 text-xs font-bold uppercase tracking-widest mb-1">
            <BarChart3 className="w-3.5 h-3.5" />
            Tournament Analytics
          </div>
          <h1 className="text-3xl sm:text-4xl font-black font-display tracking-tight text-white uppercase">
            PLAYER & TEAM STATS
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Official leaderboards for Golden Boot, playmaker assists, clean sheets, and Man of the Match awards.
          </p>
        </div>

        {/* Category filter tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-stadium-900 border border-stadium-800 overflow-x-auto max-w-full">
          {[
            { id: 'all', label: 'Overview' },
            { id: 'scorers', label: 'Goals' },
            { id: 'assists', label: 'Assists' },
            { id: 'motm', label: 'MOTM' },
            { id: 'cleansheets', label: 'Clean Sheets' },
            { id: 'teams', label: 'Team Goals' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-gold-500 text-stadium-950 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-stadium-850'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* 1. TOP SCORERS */}
        {(activeTab === 'all' || activeTab === 'scorers') && (
          <StatCard
            title="TOP SCORERS"
            subtitle="Golden Boot Race"
            icon={Flame}
            entries={topScorers}
            valueLabel="Goals"
            emptyTitle="NO GOALSCORER DATA YET"
            emptyDescription="Goalscorer statistics will appear after matches are completed."
          />
        )}

        {/* 2. ASSISTS */}
        {(activeTab === 'all' || activeTab === 'assists') && (
          <StatCard
            title="TOP PLAYMAKERS"
            subtitle="Most Tournament Assists"
            icon={Compass}
            entries={topAssists}
            valueLabel="Assists"
            emptyTitle="NO ASSISTS DATA YET"
            emptyDescription="Assist statistics will appear after matches are recorded."
          />
        )}

        {/* 3. MAN OF THE MATCH */}
        {(activeTab === 'all' || activeTab === 'motm') && (
          <StatCard
            title="MAN OF THE MATCH"
            subtitle="Most MVP Accolades"
            icon={Award}
            entries={motmLeaderboard}
            valueLabel="Awards"
            emptyTitle="NO MOTM AWARDS YET"
            emptyDescription="Man of the match awards are chosen following each match."
          />
        )}

        {/* 4. CLEAN SHEETS */}
        {(activeTab === 'all' || activeTab === 'cleansheets') && (
          <StatCard
            title="CLEAN SHEETS"
            subtitle="Goalkeepers with Shutouts"
            icon={ShieldCheck}
            entries={cleanSheets}
            valueLabel="Clean Sheets"
            emptyTitle="NO CLEAN SHEETS YET"
            emptyDescription="Clean sheets will be awarded to keepers with 0 goals conceded."
          />
        )}

        {/* 5. TEAM GOALS */}
        {(activeTab === 'all' || activeTab === 'teams') && (
          <div className="rounded-xl bg-stadium-900 border border-stadium-800 overflow-hidden shadow-lg flex flex-col">
            <div className="p-4 sm:p-5 bg-stadium-950/70 border-b border-stadium-800/80 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-stadium-800 border border-stadium-750 flex items-center justify-center text-gold-400">
                  <Trophy className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-black text-base text-slate-100 uppercase tracking-wide">
                    TEAM GOALS
                  </h3>
                  <p className="text-xs text-slate-400">Total Goals Scored by Club</p>
                </div>
              </div>
              <div className="text-right">
                <span className="font-mono font-bold text-xs text-slate-400">TOTAL: </span>
                <span className="font-display font-black text-gold-400 text-sm">{totalGoals}</span>
              </div>
            </div>

            <div className="p-2 sm:p-4 flex-1">
              <div className="divide-y divide-stadium-800/50">
                {teamGoalsEntries.map((item, index) => (
                  <div
                    key={item.team.id}
                    onClick={() => onNavigate('team-detail', item.team.id)}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-stadium-850/60 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded bg-stadium-800 text-slate-400 font-mono text-xs flex items-center justify-center">
                        {index + 1}
                      </span>
                      <TeamBadge team={item.team} size="sm" />
                      <div>
                        <span className="font-display font-bold text-sm text-slate-100 block">
                          {item.team.name}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          Mgr: {item.team.manager_name}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="font-display font-black text-lg text-gold-400">
                        {item.goals}
                      </span>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block -mt-1">
                        {item.goals === 1 ? 'Goal' : 'Goals'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
