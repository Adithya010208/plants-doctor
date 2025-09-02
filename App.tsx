import React, { useState, useMemo, useCallback } from 'react';
import { DiseaseDetector } from './components/DiseaseDetector';
import { Community } from './components/Community';
import { Weather } from './components/Weather';
import { Scheduler } from './components/Scheduler';
import { Learn } from './components/Learn';
import { Login } from './components/Login';
import { SocialForum } from './components/SocialForum';
import { LeafIcon, MessageSquareIcon, SunIcon, CalendarIcon, BookOpenIcon, LogOutIcon, UsersIcon } from './components/Icons';
import { User } from './types';

type ActiveView = 'detector' | 'community' | 'weather' | 'scheduler' | 'learn' | 'socialForum';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [activeView, setActiveView] = useState<ActiveView>('detector');

  const handleLoginSuccess = useCallback((loggedInUser: User) => {
    setUser(loggedInUser);
  }, []);

  const handleLogout = () => {
    setUser(null);
    if (typeof window.google !== 'undefined') {
      window.google.accounts.id.disableAutoSelect();
    }
  };

  const navigationItems = useMemo(() => [
    { id: 'detector', label: 'Detector', icon: LeafIcon },
    { id: 'community', label: 'AI Chatbot', icon: MessageSquareIcon },
    { id: 'socialForum', label: 'Social Forum', icon: UsersIcon },
    { id: 'weather', label: 'Weather', icon: SunIcon },
    { id: 'scheduler', label: 'Scheduler', icon: CalendarIcon },
    { id: 'learn', label: 'Learn', icon: BookOpenIcon },
  ], []);

  const renderActiveView = () => {
    switch (activeView) {
      case 'detector': return <DiseaseDetector />;
      case 'community': return <Community />;
      case 'socialForum': return user ? <SocialForum user={user} /> : null;
      case 'weather': return <Weather />;
      case 'scheduler': return <Scheduler />;
      case 'learn': return <Learn />;
      default: return <DiseaseDetector />;
    }
  };
  
  if (!user) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-primary-50 dark:bg-gray-900 font-sans flex flex-col">
      <header className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <LeafIcon className="h-8 w-8 text-primary-600" />
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Plants Doctor</h1>
            </div>
            <div className="flex items-center space-x-4">
                <img src={user.picture} alt={user.name} className="h-9 w-9 rounded-full" />
                <span className="hidden sm:block font-medium text-gray-700 dark:text-gray-200">Welcome, {user.name.split(' ')[0]}</span>
                <button onClick={handleLogout} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700" aria-label="Logout">
                    <LogOutIcon className="h-6 w-6 text-gray-500 dark:text-gray-400" />
                </button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <nav className="hidden md:flex flex-col w-60 bg-white dark:bg-gray-800 p-4 border-r border-gray-200 dark:border-gray-700">
            <div className="flex-1 space-y-2">
            {navigationItems.map(item => (
                <button
                    key={item.id}
                    onClick={() => setActiveView(item.id as ActiveView)}
                    className={`${
                        activeView === item.id
                        ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-200'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    } group flex items-center w-full px-3 py-3 rounded-lg text-base font-semibold transition-colors duration-200`}
                >
                    <item.icon className="h-6 w-6 mr-3" aria-hidden="true" />
                    {item.label}
                </button>
            ))}
            </div>
        </nav>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
            {renderActiveView()}
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex justify-around p-1 z-20">
          {navigationItems.map(item => (
              <button
                  key={item.id}
                  onClick={() => setActiveView(item.id as ActiveView)}
                  className={`flex flex-col items-center justify-center w-full h-16 rounded-lg transition-colors duration-200 ${
                      activeView === item.id ? 'text-primary-600' : 'text-gray-500'
                  }`}
              >
                  <item.icon className="h-6 w-6" />
                  <span className="text-xs font-medium mt-1">{item.label}</span>
              </button>
          ))}
      </nav>
      {/* Spacer for mobile nav */}
      <div className="md:hidden h-20"></div> 
    </div>
  );
};

export default App;