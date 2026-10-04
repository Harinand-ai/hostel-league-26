import React, { useState } from 'react';
import { PlayerStatEntry, Team, Match, TeamStanding } from '../types/tournament';
import { StatCard } from '../components/StatCard';
import { TeamBadge } from '../components/TeamBadge';
import { Flame, Compass, ShieldCheck, Award, BarChart3, Trophy } from 'lucide-react';

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
    <div className="space-y-10">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 pb-6 border-b border-stadium-800">
        <div>
          <div className="flex items-center gap-2 text-gold-400 text-xs font-mono font-bold uppercase tracking-widest mb-1.5">
            <BarChart3 className="w-3.5 h-3.5" />
            TOURNAMENT ANALYTICS & HONORS
          </div>
          <h1 className="text-3xl sm:text-5xl font-black font-display tracking-tight text-white uppercase">
            PLAYER & CLUB STATS
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 font-mono">
            Official leaderboards for Golden Boot, playmaker assists, clean sheets, and Man of the Match awards.
          </p>
        </div>

        {/* Category filter tabs */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-stadium-900 border border-stadium-750 overflow-x-auto max-w-full font-mono">
          {[
            { id: 'all', label: 'Overview' },
            { id: 'scorers', label: 'Goals' },
            { id: 'assists', label: 'Assists' },
            { id: 'motm', label: 'MOTM' },
            { id: 'cleansheets', label: 'Clean Sheets' },
            { id: 'teams', label: 'Club Goals' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-gold-500 text-stadium-980 shadow-md font-black'
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
            title="GOLDEN BOOT"
            subtitle="Leading Tournament Goalscorers"
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
            title="PLAYMAKERS"
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
            subtitle="Most MVP Accolades Awarded"
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
            subtitle="Goalkeepers with Zero Conceded"
            icon={ShieldCheck}
            entries={cleanSheets}
            valueLabel="Clean Sheets"
            emptyTitle="NO CLEAN SHEETS YET"
            emptyDescription="Clean sheets will be awarded to keepers with 0 goals conceded."
          />
        )}

        {/* 5. TEAM GOALS */}
        {(activeTab === 'all' || activeTab === 'teams') && (
          <div className="rounded-2xl bg-[#090d16] border border-stadium-750 overflow-hidden shadow-broadcast flex flex-col">
            <div className="p-5 bg-stadium-950/80 border-b border-stadium-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-stadium-850 border border-stadium-750 flex items-center justify-center text-gold-400">
                  <Trophy className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display font-black text-base text-white uppercase tracking-tight">
                    CLUB GOALS
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">Total Tournament Goals by Club</p>
                </div>
              </div>
              <div className="text-right font-mono">
                <span className="font-bold text-xs text-slate-400">TOTAL: </span>
                <span className="font-display font-black text-gold-400 text-sm">{totalGoals}</span>
              </div>
            </div>

            <div className="p-3 sm:p-4 flex-1">
              <div className="divide-y divide-stadium-800/50">
                {teamGoalsEntries.map((item, index) => (
                  <div
                    key={item.team.id}
                    onClick={() => onNavigate('team-detail', item.team.id)}
                    className="flex items-center justify-between p-3.5 rounded-xl hover:bg-stadium-850/60 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3.5">
                      <span className="font-display font-black text-2xl w-8 text-center text-slate-500">
                        {index + 1}
                      </span>
                      <TeamBadge team={item.team} size="sm" />
                      <div>
                        <span className="font-display font-black text-sm text-white block uppercase tracking-tight">
                          {item.team.name}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          Mgr: {item.team.manager_name}
                        </span>
                      </div>
                    </div>

                    <div className="text-right font-mono">
                      <span className="font-display font-black text-lg text-gold-400">
                        {item.goals}
                      </span>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block -mt-1">
                        {item.goals === 1 ? 'GOAL' : 'GOALS'}
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
