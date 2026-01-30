
import React, { useState, useEffect } from 'react';
import { User, UserRole, AuthState } from './types';
import { StorageService } from './services/storageService';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import { LogOut, User as UserIcon, BookOpen, ShieldCheck } from 'lucide-react';

const App: React.FC = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true
  });

  useEffect(() => {
    const user = StorageService.getCurrentUser();
    if (user) {
      setAuthState({ user, isAuthenticated: true, isLoading: false });
    } else {
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  const handleLogin = (user: User) => {
    StorageService.setCurrentUser(user);
    setAuthState({ user, isAuthenticated: true, isLoading: false });
  };

  const handleLogout = () => {
    StorageService.setCurrentUser(null);
    setAuthState({ user: null, isAuthenticated: false, isLoading: false });
  };

  if (authState.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-900"></div>
      </div>
    );
  }

  if (!authState.isAuthenticated) {
    return <Auth onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-indigo-900 text-white shadow-lg px-4 md:px-8 py-4 flex flex-wrap items-center justify-between">
        <div className="flex items-center space-x-3">
          <BookOpen className="w-8 h-8 text-amber-400" />
          <div>
            <h1 className="text-xl font-bold tracking-tight">ГМПИ им. Ипполитова-Иванова</h1>
            <p className="text-xs text-indigo-200">Электронный журнал посещаемости</p>
          </div>
        </div>

        <div className="flex items-center space-x-6 mt-4 md:mt-0">
          <div className="flex flex-col items-end mr-4">
            <span className="text-sm font-medium">{authState.user?.fullName}</span>
            <span className="text-[10px] uppercase tracking-wider text-indigo-300">
              {authState.user?.role === UserRole.ADMIN ? 'Администратор' : authState.user?.position}
            </span>
          </div>
          <button 
            onClick={handleLogout}
            className="p-2 bg-indigo-800 hover:bg-indigo-700 rounded-full transition-colors"
            title="Выход"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        <Dashboard user={authState.user!} />
      </main>
      
      <footer className="bg-white border-t border-slate-200 py-3 text-center text-slate-500 text-xs">
        &copy; {new Date().getFullYear()} ГМПИ имени М.М. Ипполитова-Иванова. Все права защищены.
      </footer>
    </div>
  );
};

export default App;
