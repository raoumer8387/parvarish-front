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
import { ProgressDashboard } from './components/ProgressDashboard';
import { SettingsPage } from './components/SettingsPage';
import ParentOnboarding from './pages/ParentOnboarding.jsx';

type UserType = 'parent' | 'child' | null;
type Page = 'dashboard' | 'profiles' | 'progress' | 'chatbot' | 'activities' | 'settings' | 'games' | 'game';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userType, setUserType] = useState<UserType>(null);
  const [currentPage, setCurrentPage] = useState<Page>('chatbot');
  const [currentActivity, setCurrentActivity] = useState<string | null>(null);

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
        }
      }
    }
  }, []);

  const handleLogin = (type: 'parent' | 'child') => {
    setUserType(type);
    setIsLoggedIn(true);
    // Children start at games page, parents at chatbot
    setCurrentPage(type === 'child' ? 'games' : 'chatbot');
  };

  const handleNavigate = (page: string) => {
    setCurrentPage(page as Page);
  };

  const handleStartActivity = (activityId: string) => {
    setCurrentActivity(activityId);
    setCurrentPage('game');
  };

  const handleStartGame = (gameId: string) => {
    setCurrentActivity(gameId);
    setCurrentPage('game');
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

  // If in game mode, show full-screen game
  if (currentPage === 'game' && currentActivity) {
    return <GameScreen activityId={currentActivity} onBack={handleBackFromGame} />;
  }

  // Main app layout with sidebar (for parents)
  return (
    <ErrorBoundary>
      <div className="flex min-h-screen bg-gradient-to-br from-[#FFF8E1] to-white">
        {/* Sidebar Navigation */}
        <AppSidebar currentPage={currentPage} onNavigate={handleNavigate} userType={userType || 'parent'} />

        {/* Main Content Area */}
        <div className="flex-1 w-full lg:ml-64 overflow-x-hidden">
          {/* Top bar with Logout */}
          <div className="w-full flex justify-end p-4">
            <Button variant="outline" onClick={handleLogout} className="rounded-lg">
              Logout
            </Button>
          </div>
          
          {/* Page Content */}
          {currentPage === 'dashboard' && <ParentDashboard />}
          {/*currentPage === 'progress' && <ProgressDashboard />*/}
          {currentPage === 'chatbot' && <ChatbotInterface />}
          {currentPage === 'games' && <GamesPage onStartGame={handleStartGame} />}
          {currentPage === 'activities' && <ActivitiesPage onStartActivity={handleStartActivity} />}
          {currentPage === 'settings' && <SettingsPage />}
        </div>
      </div>
    </ErrorBoundary>
  );
}
