import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { tournamentService } from './services/tournamentService';
import { Team, Match, Player, Goal, ManOfTheMatch } from './types/tournament';
import { 
  calculateStandings, 
  getTopScorers, 
  getCleanSheets, 
  getMotmLeaderboard 
} from './utils/leagueCalculations';
import { OpeningAnimation } from './components/OpeningAnimation';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { FixturesPage } from './pages/FixturesPage';
import { TeamsPage } from './pages/TeamsPage';
import { TeamDetailPage } from './pages/TeamDetailPage';
import { StatsPage } from './pages/StatsPage';
import { MatchDetailPage } from './pages/MatchDetailPage';
import { RulesPage } from './pages/RulesPage';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { MobileBottomNav } from './components/MobileBottomNav';
import { PlayerProfileModal } from './components/PlayerProfileModal';
import { supabase, isSupabaseConfigured } from './lib/supabase';

const getInitialNav = (): { tab: string; param?: string } => {
  if (typeof window === 'undefined') return { tab: 'home' };
  
  // 1. Check URL hash (e.g. #matches, #teams)
  const hash = window.location.hash.replace('#', '').trim();
  if (hash) {
    const [tab, param] = hash.split('/');
    if (tab) return { tab, param };
  }
  
  // 2. Check localStorage saved tab
  const savedTab = localStorage.getItem('hl26_active_tab');
  const savedParam = localStorage.getItem('hl26_active_param') || undefined;
  if (savedTab && savedTab !== 'quick-view') {
    return { tab: savedTab, param: savedParam };
  }
  
  // 3. Default to home
  return { tab: 'home' };
};

export function App() {
  const initialNav = useMemo(() => getInitialNav(), []);

  // Navigation & Routing state
  const [currentTab, setCurrentTab] = useState<string>(initialNav.tab);
  const [activeParam, setActiveParam] = useState<string | undefined>(initialNav.param);

  // Player Profile Modal state
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);

  // Intro state (persisted in localStorage or controlled via URL)
  const [showIntro, setShowIntro] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('intro') === 'true') return true;
    if (urlParams.get('view') === 'full' || window.location.hash.length > 1) {
      return false;
    }
    return !localStorage.getItem('hl26_seen_intro');
  });

  // Admin login session state
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('hl26_admin_auth') === 'true';
  });

  // Core Tournament Data
  const [teams, setTeams] = useState<Team[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [motms, setMotms] = useState<ManOfTheMatch[]>([]);
  const [loading, setLoading] = useState(true);

  // Load data function
  const loadData = useCallback(async () => {
    try {
      const [tData, mData, pData, gData, motmData] = await Promise.all([
        tournamentService.getTeams(),
        tournamentService.getMatches(),
        tournamentService.getPlayers(),
        tournamentService.getGoals(),
        tournamentService.getManOfTheMatches(),
      ]);

      setTeams(tData);
      setMatches(mData);
      setPlayers(pData);
      setGoals(gData);
      setMotms(motmData);
    } catch (err) {
      console.error('Error fetching tournament data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle URL hash routing
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '').trim();
      if (hash) {
        const [tab, param] = hash.split('/');
        if (tab) {
          setCurrentTab(tab);
          setActiveParam(param);
          try {
            localStorage.setItem('hl26_active_tab', tab);
            if (param) {
              localStorage.setItem('hl26_active_param', param);
            } else {
              localStorage.removeItem('hl26_active_param');
            }
          } catch {}
        }
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const handleNavigate = (tab: string, param?: string) => {
    setCurrentTab(tab);
    setActiveParam(param);
    
    try {
      localStorage.setItem('hl26_active_tab', tab);
      if (param) {
        localStorage.setItem('hl26_active_param', param);
      } else {
        localStorage.removeItem('hl26_active_param');
      }
    } catch {}

    window.location.hash = param ? `${tab}/${param}` : tab;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleIntroComplete = () => {
    setShowIntro(false);
    localStorage.setItem('hl26_seen_intro', 'true');
    handleNavigate('home');
  };

  const handleReplayIntro = () => {
    setShowIntro(true);
  };

  // Check Supabase Auth session for admin status
  useEffect(() => {
    if (isSupabaseConfigured && supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user && session.user.email) {
          setIsAdminLoggedIn(true);
        }
      });
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user && session.user.email) {
          setIsAdminLoggedIn(true);
        }
      });
      return () => subscription.unsubscribe();
    }
  }, []);

  const handleAdminLogin = () => {
    setIsAdminLoggedIn(true);
    localStorage.setItem('hl26_admin_auth', 'true');
  };

  const handleAdminLogout = async () => {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.warn('Supabase signOut error:', err);
      }
    }
    setIsAdminLoggedIn(false);
    localStorage.removeItem('hl26_admin_auth');
    handleNavigate('home');
  };

  // Derived statistics (clean calculations from match records)
  const standings = useMemo(() => calculateStandings(teams, matches), [teams, matches]);
  const topScorers = useMemo(() => getTopScorers(goals, players, teams), [goals, players, teams]);
  const cleanSheets = useMemo(() => getCleanSheets(matches, players, teams), [matches, players, teams]);
  const motmLeaderboard = useMemo(() => getMotmLeaderboard(motms, players, teams), [motms, players, teams]);

  // Selected player for profile modal
  const handleSelectPlayer = useCallback((playerId: string) => {
    setSelectedPlayerId(playerId);
  }, []);

  const handleClosePlayerModal = useCallback(() => {
    setSelectedPlayerId(null);
  }, []);

  const selectedPlayer = useMemo(
    () => (selectedPlayerId ? players.find(p => p.id === selectedPlayerId) || null : null),
    [players, selectedPlayerId]
  );

  const selectedPlayerTeam = useMemo(
    () => (selectedPlayer ? teams.find(t => t.id === selectedPlayer.team_id) : undefined),
    [teams, selectedPlayer]
  );

  // Render current page content
  const renderCurrentPage = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[50vh]">
          <div className="w-8 h-8 rounded-full border-2 border-slate-300 border-t-green-600 animate-spin" />
          <p className="mt-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Loading Hostel League 26...
          </p>
        </div>
      );
    }

    switch (currentTab) {
      case 'home':
        return (
          <HomePage
            teams={teams}
            matches={matches}
            standings={standings}
            topScorers={topScorers}
            players={players}
            onNavigate={handleNavigate}
            onSelectPlayer={handleSelectPlayer}
          />
        );

      case 'matches':
      case 'fixtures':
      case 'results':
        return (
          <FixturesPage
            matches={matches}
            teams={teams}
            onNavigate={handleNavigate}
          />
        );

      case 'teams':
        return (
          <TeamsPage
            standings={standings}
            onNavigate={handleNavigate}
          />
        );

      case 'team-detail':
        return (
          <TeamDetailPage
            teamId={activeParam || teams[0]?.id || ''}
            teams={teams}
            matches={matches}
            standings={standings}
            players={players}
            goals={goals}
            onNavigate={handleNavigate}
            onSelectPlayer={handleSelectPlayer}
          />
        );

      case 'stats':
      case 'table':
        return (
          <StatsPage
            topScorers={topScorers}
            cleanSheets={cleanSheets}
            motmLeaderboard={motmLeaderboard}
            teams={teams}
            matches={matches}
            standings={standings}
            players={players}
            onNavigate={handleNavigate}
            onSelectPlayer={handleSelectPlayer}
          />
        );

      case 'match-detail':
        return (
          <MatchDetailPage
            matchId={activeParam || matches[0]?.id || ''}
            matches={matches}
            teams={teams}
            goals={goals}
            motms={motms}
            players={players}
            onNavigate={handleNavigate}
            onSelectPlayer={handleSelectPlayer}
          />
        );

      case 'rules':
        return (
          <RulesPage
            onNavigate={handleNavigate}
          />
        );

      case 'admin':
        if (!isAdminLoggedIn) {
          return (
            <AdminLoginPage
              onLoginSuccess={handleAdminLogin}
              onNavigateHome={() => handleNavigate('home')}
            />
          );
        }
        return (
          <AdminDashboardPage
            teams={teams}
            matches={matches}
            players={players}
            goals={goals}
            motms={motms}
            standings={standings}
            topScorers={topScorers}
            onDataChanged={loadData}
            onLogout={handleAdminLogout}
            onNavigateHome={() => handleNavigate('home')}
          />
        );

      default:
        return (
          <HomePage
            teams={teams}
            matches={matches}
            standings={standings}
            topScorers={topScorers}
            players={players}
            onNavigate={handleNavigate}
            onSelectPlayer={handleSelectPlayer}
          />
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] text-slate-900">
      
      {/* Animated Opening Sequence */}
      {showIntro && (
        <OpeningAnimation onComplete={handleIntroComplete} />
      )}

      {/* Main Broadcast Navigation */}
      <Navbar
        currentTab={currentTab}
        onNavigate={handleNavigate}
        onReplayIntro={handleReplayIntro}
        isAdminLoggedIn={isAdminLoggedIn}
      />

      {/* Main Page Body */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-6 pb-20 md:pb-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentTab + (activeParam || '')}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
          >
            {renderCurrentPage()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <Footer onNavigate={handleNavigate} />

      {/* Mobile Floating Bottom Bar for Handheld Phones (390px - 430px) */}
      <MobileBottomNav
        currentTab={currentTab}
        onNavigate={handleNavigate}
      />

      {/* Player Profile Modal */}
      {selectedPlayer && (
        <PlayerProfileModal
          player={selectedPlayer}
          team={selectedPlayerTeam}
          matches={matches}
          goals={goals}
          motms={motms}
          standings={standings}
          allPlayers={players}
          allTeams={teams}
          onClose={handleClosePlayerModal}
          onNavigateToTeam={teamId => handleNavigate('team-detail', teamId)}
          onNavigateToMatch={matchId => handleNavigate('match-detail', matchId)}
        />
      )}

    </div>
  );
}

export default App;
