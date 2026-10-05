import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { tournamentService } from './services/tournamentService';
import { Team, Match, Player, Goal, Assist, ManOfTheMatch } from './types/tournament';
import { 
  calculateStandings, 
  getTopScorers, 
  getTopAssists, 
  getCleanSheets, 
  getMotmLeaderboard 
} from './utils/leagueCalculations';
import { OpeningAnimation } from './components/OpeningAnimation';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { FixturesPage } from './pages/FixturesPage';
import { ResultsPage } from './pages/ResultsPage';
import { TablePage } from './pages/TablePage';
import { TeamsPage } from './pages/TeamsPage';
import { TeamDetailPage } from './pages/TeamDetailPage';
import { StatsPage } from './pages/StatsPage';
import { MatchDetailPage } from './pages/MatchDetailPage';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { QuickViewPage } from './pages/QuickViewPage';
import { MobileBottomNav } from './components/MobileBottomNav';

export function App() {
  // Navigation & Routing state
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [activeParam, setActiveParam] = useState<string | undefined>(undefined);
  const [returnTarget, setReturnTarget] = useState<{ tab: string; param?: string }>({ tab: 'home' });

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
  const [assists, setAssists] = useState<Assist[]>([]);
  const [motms, setMotms] = useState<ManOfTheMatch[]>([]);
  const [loading, setLoading] = useState(true);

  // Load data function
  const loadData = useCallback(async () => {
    try {
      const [tData, mData, pData, gData, aData, motmData] = await Promise.all([
        tournamentService.getTeams(),
        tournamentService.getMatches(),
        tournamentService.getPlayers(),
        tournamentService.getGoals(),
        tournamentService.getAssists(),
        tournamentService.getManOfTheMatches(),
      ]);

      setTeams(tData);
      setMatches(mData);
      setPlayers(pData);
      setGoals(gData);
      setAssists(aData);
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

  // Handle URL hash routing if user enters directly e.g. #admin or /admin
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '').trim();
      if (hash) {
        const [tab, param] = hash.split('/');
        if (tab) {
          setCurrentTab(tab);
          setActiveParam(param);
        }
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const getReturnLabel = (tab: string) => {
    switch (tab) {
      case 'team-detail':
        return 'Team Details';
      case 'match-detail':
        return 'Match Details';
      case 'fixtures':
        return 'Fixtures';
      case 'results':
        return 'Results';
      case 'table':
        return 'League Table';
      case 'stats':
        return 'Statistics';
      case 'admin':
        return 'Admin Panel';
      default:
        return 'Broadcast Hub';
    }
  };

  const handleNavigate = (tab: string, param?: string) => {
    if (tab === 'quick-view' && currentTab !== 'quick-view') {
      setReturnTarget({ tab: currentTab, param: activeParam });
    }
    setCurrentTab(tab);
    setActiveParam(param);
    window.location.hash = param ? `${tab}/${param}` : tab;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleIntroComplete = (targetTab?: string) => {
    setShowIntro(false);
    localStorage.setItem('hl26_seen_intro', 'true');
    if (targetTab) {
      handleNavigate(targetTab);
    }
  };

  const handleReplayIntro = () => {
    setShowIntro(true);
  };

  const handleAdminLogin = () => {
    setIsAdminLoggedIn(true);
    localStorage.setItem('hl26_admin_auth', 'true');
  };

  const handleAdminLogout = () => {
    setIsAdminLoggedIn(false);
    localStorage.removeItem('hl26_admin_auth');
    handleNavigate('home');
  };

  // Calculated derived statistics
  const standings = useMemo(() => calculateStandings(teams, matches), [teams, matches]);
  const topScorers = useMemo(() => getTopScorers(goals, players, teams), [goals, players, teams]);
  const topAssists = useMemo(() => getTopAssists(assists, players, teams), [assists, players, teams]);
  const cleanSheets = useMemo(() => getCleanSheets(matches, players, teams), [matches, players, teams]);
  const motmLeaderboard = useMemo(() => getMotmLeaderboard(motms, players, teams), [motms, players, teams]);

  // Render current page content
  const renderCurrentPage = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="w-12 h-12 rounded-full border-4 border-emerald-500/20 border-t-emerald-400 animate-spin" />
          <p className="mt-4 text-xs uppercase tracking-widest text-slate-400 font-mono">
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
            onNavigate={handleNavigate}
          />
        );

      case 'fixtures':
        return (
          <FixturesPage
            matches={matches}
            teams={teams}
            onNavigate={handleNavigate}
          />
        );

      case 'results':
        return (
          <ResultsPage
            matches={matches}
            teams={teams}
            goals={goals}
            motms={motms}
            players={players}
            onNavigate={handleNavigate}
          />
        );

      case 'table':
        return (
          <TablePage
            standings={standings}
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
          />
        );

      case 'stats':
        return (
          <StatsPage
            topScorers={topScorers}
            topAssists={topAssists}
            cleanSheets={cleanSheets}
            motmLeaderboard={motmLeaderboard}
            teams={teams}
            matches={matches}
            standings={standings}
            onNavigate={handleNavigate}
          />
        );

      case 'match-detail':
        return (
          <MatchDetailPage
            matchId={activeParam || matches[0]?.id || ''}
            matches={matches}
            teams={teams}
            goals={goals}
            assists={assists}
            motms={motms}
            players={players}
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
            assists={assists}
            motms={motms}
            standings={standings}
            topScorers={topScorers}
            onDataChanged={loadData}
            onLogout={handleAdminLogout}
            onNavigateHome={() => handleNavigate('home')}
          />
        );

      case 'quick-view':
        return (
          <QuickViewPage
            onReturn={() => handleNavigate(returnTarget.tab || 'home', returnTarget.param)}
            returnLabel={getReturnLabel(returnTarget.tab)}
          />
        );

      default:
        return (
          <HomePage
            teams={teams}
            matches={matches}
            standings={standings}
            topScorers={topScorers}
            onNavigate={handleNavigate}
          />
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#06080d] text-slate-100 selection:bg-emerald-500/20 selection:text-emerald-400">
      
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

      {/* Main Page Body with Seamless Page Transition */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 md:py-12 pb-24 md:pb-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentTab + (activeParam || '')}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          >
            {renderCurrentPage()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <Footer onNavigate={handleNavigate} />

      {/* Mobile Floating Bottom Bar for Handheld Phones */}
      <MobileBottomNav
        currentTab={currentTab}
        onNavigate={handleNavigate}
      />

    </div>
  );
}

export default App;
