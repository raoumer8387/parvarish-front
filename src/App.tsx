import { useState } from 'react';
import { LoginPage } from './components/LoginPage';
import { AppSidebar } from './components/AppSidebar';
import { ParentDashboard } from './components/ParentDashboard';
import { ChatbotInterface } from './components/ChatbotInterface';
import { ActivitiesPage } from './components/ActivitiesPage';
import { GameScreen } from './components/GameScreen';
import { ProgressDashboard } from './components/ProgressDashboard';
import { SettingsPage } from './components/SettingsPage';

type UserType = 'parent' | 'child' | null;
type Page = 'dashboard' | 'profiles' | 'progress' | 'chatbot' | 'activities' | 'settings' | 'game';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userType, setUserType] = useState<UserType>(null);
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [currentActivity, setCurrentActivity] = useState<string | null>(null);

  const handleLogin = (type: 'parent' | 'child') => {
    setUserType(type);
    setIsLoggedIn(true);
  };

  const handleNavigate = (page: string) => {
    setCurrentPage(page as Page);
  };

  const handleStartActivity = (activityId: string) => {
    setCurrentActivity(activityId);
    setCurrentPage('game');
  };

  const handleBackFromGame = () => {
    setCurrentActivity(null);
    setCurrentPage('activities');
  };

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
    <div className="flex min-h-screen bg-gradient-to-br from-[#FFF8E1] to-white">
      {/* Sidebar Navigation */}
      <AppSidebar currentPage={currentPage} onNavigate={handleNavigate} />

      {/* Main Content Area */}
      <div className="flex-1 w-full lg:w-auto overflow-x-hidden">
        {/* {currentPage === 'dashboard' && <ParentDashboard />} */}
        {/* {currentPage === 'profiles' && <ParentDashboard />} */}
        {/* {currentPage === 'progress' && <ProgressDashboard />} */}
        {currentPage === 'chatbot' && <ChatbotInterface />}
        {/* {currentPage === 'activities' && <ActivitiesPage onStartActivity={handleStartActivity} />} */}
        {/* {currentPage === 'settings' && <SettingsPage />} */}
      </div>
    </div>
  );
}
