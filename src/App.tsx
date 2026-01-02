import { useState, useEffect } from 'react';
import { Button } from './components/ui/button';
import { LoginPage } from './components/LoginPage';
import { AppSidebar } from './components/AppSidebar';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ParentDashboard } from './components/ParentDashboard';
import { ChatbotInterface } from './components/ChatbotInterface';
import { ActivitiesPage } from './components/ActivitiesPage';
import { GamesPage } from './components/GamesPage';
import { GameScreen } from './components/GameScreen';
import { SettingsPage } from './components/SettingsPage';
import { ProgressDashboard } from './components/ProgressDashboard';
import ActivityHistoryPage from './components/ActivityHistoryPage';
import ParentOnboarding from './pages/ParentOnboarding.jsx';
import { Toaster } from './components/ui/toaster';
import MemoryGame from './components/games/MemoryGame';
import MoodPickerGame from './components/games/MoodPickerGame';
import ScenarioGame from './components/games/ScenarioGame';
import IslamicQuizGame from './components/games/IslamicQuizGame';
import { getUserType } from './api/auth';

type UserType = 'parent' | 'child' | null;
type Page = 'dashboard' | 'profiles' | 'progress' | 'chatbot' | 'activities' | 'settings' | 'games' | 'game' | 'activity-history';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userType, setUserType] = useState<UserType>(null);
  const [currentPage, setCurrentPage] = useState<Page>('chatbot');
  const [currentActivity, setCurrentActivity] = useState<string | null>(null);
  const [path, setPath] = useState<string>(window.location.pathname);

  // Check for existing token on mount and handle Google OAuth callback
  useEffect(() => {
    // Check URL query params for token (Google OAuth callback)
    const urlParams = new URLSearchParams(window.location.search);
    let tokenFromUrl = urlParams.get('token') || urlParams.get('access_token');

    // Also check URL hash (some OAuth implementations use hash)
    if (!tokenFromUrl && window.location.hash) {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      tokenFromUrl = hashParams.get('token') || hashParams.get('access_token');
    }

    if (tokenFromUrl) {
      // Store token from OAuth callback
      localStorage.setItem('access_token', tokenFromUrl);

      // Decode JWT to get user info
      try {
        const payload = JSON.parse(atob(tokenFromUrl.split('.')[1]));
        localStorage.setItem('user_info', JSON.stringify(payload));
      } catch (e) {
        console.error('Failed to decode token:', e);
      }

      // Clean up URL (remove query params and hash)
      window.history.replaceState({}, document.title, window.location.pathname);

      // Set logged in state - onboarding page will handle the redirect logic
      setIsLoggedIn(true);
      setUserType('parent');
      // Only redirect if not already on onboarding page
      if (window.location.pathname !== '/parent-onboarding') {
        window.location.replace('/parent-onboarding');
      }
    } else {
      // Check for existing token in localStorage
      const token = localStorage.getItem('access_token');
      if (token) {
        const userInfo = localStorage.getItem('user_info');
        let storedUserType: 'parent' | 'child' = 'parent';
        
        // Try to get user type from stored info
        try {
          if (userInfo) {
            const parsed = JSON.parse(userInfo);
            storedUserType = parsed.user_type || 'parent';
          }
        } catch (e) {
          console.error('Failed to parse user info:', e);
        }
        
        setIsLoggedIn(true);
        setUserType(storedUserType);
        
        if (storedUserType === 'parent') {
          const completed = localStorage.getItem('onboarding_completed') === 'true';
          // If onboarding not completed, redirect to onboarding
          if (!completed && window.location.pathname !== '/parent-onboarding') {
            window.location.replace('/parent-onboarding');
          } else {
            setCurrentPage('chatbot');
          }
        } else {
          // Child user - start at games page
          setCurrentPage('games');
          // Ensure child is redirected to /child/games
          if (window.location.pathname !== '/child/games') {
            window.history.replaceState({}, '', '/child/games');
            setPath('/child/games');
          }
        }
      }
    }
  }, []);

  // Simple path-based routing with role gating
  useEffect(() => {
    const handlePop = () => setPath(window.location.pathname);
    window.addEventListener('popstate', handlePop);
    return () => window.removeEventListener('popstate', handlePop);
  }, []);

  useEffect(() => {
    // Enforce role-based access by path
    const t = userType ?? getUserType();
    if (!t) return; // not logged in handled elsewhere
    if (t === 'child') {
      if (!path.startsWith('/child')) {
        if (window.location.pathname !== '/child/games') {
          window.history.replaceState({}, '', '/child/games');
          setPath('/child/games');
        }
      }
    } else if (t === 'parent') {
      if (path.startsWith('/child')) {
        // Redirect parent away from child-only routes
        window.history.replaceState({}, '', '/');
        setPath('/');
      }
    }
  }, [path, userType]);

  const handleLogin = (type: 'parent' | 'child') => {
    setUserType(type);
    setIsLoggedIn(true);
    // Children start at games page, parents at chatbot
    setCurrentPage(type === 'child' ? 'games' : 'chatbot');
    
    // Redirect child to /child/games route
    if (type === 'child') {
      window.history.pushState({}, '', '/child/games');
      setPath('/child/games');
    }
  };

  const handleNavigate = (page: string) => {
    setCurrentPage(page as Page);
    // Update path for child games hub for consistency
    if (userType === 'child') {
      if (page === 'games') {
        if (window.location.pathname !== '/child/games') {
          window.history.pushState({}, '', '/child/games');
          setPath('/child/games');
        }
      }
    }
  };

  const handleStartActivity = (activityId: string) => {
    setCurrentActivity(activityId);
    setCurrentPage('game');
  };

  const handleStartGame = (gameId: string) => {
    setCurrentActivity(gameId);
    setCurrentPage('game');
    if (userType === 'child') {
      const route =
        gameId === 'memory' ? '/child/games/memory' :
        gameId === 'mood' ? '/child/games/mood' :
        gameId === 'scenario' ? '/child/games/scenario' :
        gameId === 'islamic-quiz' ? '/child/games/islamic-quiz' : '/child/games';
      window.history.pushState({}, '', route);
      setPath(route);
    }
  };

  const handleBackFromGame = () => {
    setCurrentActivity(null);
    // Go back to games for children, activities for parents
    setCurrentPage(userType === 'child' ? 'games' : 'activities');
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user_info');
      localStorage.removeItem('onboarding_completed');
    } catch {}
    setIsLoggedIn(false);
    setUserType(null);
    setCurrentPage('chatbot');
  };

  // If route is onboarding and user is logged in, show onboarding page
  if (isLoggedIn && window.location.pathname === '/parent-onboarding') {
    return <ParentOnboarding />;
  }

  // If not logged in, show login page
  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLogin} />;
  }

  // Child routes rendering
  if (userType === 'child') {
    if (path === '/child/games') {
      return (
        <ErrorBoundary>
          <div className="flex h-screen overflow-hidden bg-gradient-to-br from-[#FFF8E1] to-white">
            <AppSidebar currentPage={'games'} onNavigate={handleNavigate} userType={'child'} />
            <div className="flex-1 w-full lg:ml-64 overflow-x-hidden overflow-y-auto">
              <div className="w-full flex justify-end p-4 sticky top-0 bg-gradient-to-br from-[#FFF8E1] to-white z-10">
                <Button variant="outline" onClick={handleLogout} className="rounded-lg">Logout</Button>
              </div>
              <GamesPage onStartGame={(id) => {
                // map internal ids to routes (support both old and new)
                const map: Record<string, string> = {
                  memory: 'memory',
                  mood: 'mood',
                  scenario: 'scenario',
                  'islamic-quiz': 'islamic-quiz',
                  'scenario-choice': 'scenario',
                  'moral-quest': 'scenario',
                  'empathy-challenge': 'mood',
                  'honesty-trials': 'scenario',
                };
                const key = map[id] || 'memory';
                handleStartGame(key);
              }} />
            </div>
            <Toaster />
          </div>
        </ErrorBoundary>
      );
    }
    if (path === '/child/games/memory') {
      return (
        <ErrorBoundary>
          <MemoryGame />
        </ErrorBoundary>
      );
    }
    if (path === '/child/games/mood') {
      return (
        <ErrorBoundary>
          <MoodPickerGame />
        </ErrorBoundary>
      );
    }
    if (path === '/child/games/scenario') {
      return (
        <ErrorBoundary>
          <ScenarioGame />
        </ErrorBoundary>
      );
    }
    if (path === '/child/games/islamic-quiz') {
      return (
        <ErrorBoundary>
          <IslamicQuizGame />
        </ErrorBoundary>
      );
    }
    // Fallback: redirect to games hub if route doesn't match
    return (
      <ErrorBoundary>
        <div className="flex h-screen overflow-hidden bg-gradient-to-br from-[#FFF8E1] to-white">
          <AppSidebar currentPage={'games'} onNavigate={handleNavigate} userType={'child'} />
          <div className="flex-1 w-full lg:ml-64 overflow-x-hidden overflow-y-auto">
            <div className="w-full flex justify-end p-4 sticky top-0 bg-gradient-to-br from-[#FFF8E1] to-white z-10">
              <Button variant="outline" onClick={handleLogout} className="rounded-lg">Logout</Button>
            </div>
            <GamesPage onStartGame={(id) => {
              const map: Record<string, string> = {
                memory: 'memory',
                mood: 'mood',
                scenario: 'scenario',
                'islamic-quiz': 'islamic-quiz',
                'scenario-choice': 'scenario',
                'moral-quest': 'scenario',
                'empathy-challenge': 'mood',
                'honesty-trials': 'scenario',
              };
              const key = map[id] || 'memory';
              handleStartGame(key);
            }} />
          </div>
          <Toaster />
        </div>
      </ErrorBoundary>
    );
  }

  // If in game mode, show full-screen legacy game (for parents only)
  if (currentPage === 'game' && currentActivity && userType === 'parent') {
    return <GameScreen activityId={currentActivity} onBack={handleBackFromGame} />;
  }

  // Main app layout with sidebar (for parents)
  return (
    <ErrorBoundary>
      <div className="flex h-screen overflow-hidden bg-gradient-to-br from-[#FFF8E1] to-white">
        {/* Sidebar Navigation */}
        <AppSidebar currentPage={currentPage} onNavigate={handleNavigate} userType={userType || 'parent'} />

        {/* Main Content Area */}
        <div className="flex-1 w-full lg:ml-64 overflow-x-hidden overflow-y-auto">
          {/* Top bar with Logout */}
          <div className="w-full flex justify-end p-4 sticky top-0 bg-gradient-to-br from-[#FFF8E1] to-white z-10">
            <Button variant="outline" onClick={handleLogout} className="rounded-lg">
              Logout
            </Button>
          </div>
          
          {/* Page Content */}
          {currentPage === 'dashboard' && userType === 'parent' && <ParentDashboard />}
          {currentPage === 'progress' && <ProgressDashboard />}
          {currentPage === 'chatbot' && userType === 'parent' && <ChatbotInterface />}
          {currentPage === 'games' && userType === 'parent' && <GamesPage onStartGame={handleStartGame} />}
          {currentPage === 'activities' && userType === 'parent' && <ActivitiesPage onStartActivity={handleStartActivity} />}
          {currentPage === 'activity-history' && userType === 'parent' && <ActivityHistoryPage />}
          {currentPage === 'settings' && userType === 'parent' && <SettingsPage />}
        </div>
        <Toaster />
      </div>
    </ErrorBoundary>
  );
}
