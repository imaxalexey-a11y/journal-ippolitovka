
import React, { useState } from 'react';
import { User, UserRole } from '../types';
import Journal from './Journal';
import AdminPanel from './AdminPanel';
import Settings from './Settings';
import { LayoutGrid, Users, Settings as SettingsIcon, BookOpen, CalendarRange } from 'lucide-react';

interface DashboardProps {
  user: User;
}

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<'journal' | 'admin' | 'settings'>('journal');

  const isAdmin = user.role === UserRole.ADMIN;

  return (
    <div className="flex h-full">
      <aside className="w-16 md:w-64 bg-white border-r border-slate-200 flex flex-col shrink-0">
        <nav className="flex-1 py-6">
          <ul className="space-y-2 px-2">
            <li>
              <button
                onClick={() => setActiveTab('journal')}
                className={`w-full flex items-center p-3 rounded-lg transition-colors ${
                  activeTab === 'journal' 
                    ? 'bg-indigo-50 text-indigo-700' 
                    : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                <CalendarRange className="w-6 h-6" />
                <span className="ml-3 hidden md:block font-medium">Журнал</span>
              </button>
            </li>
            {isAdmin && (
              <li>
                <button
                  onClick={() => setActiveTab('admin')}
                  className={`w-full flex items-center p-3 rounded-lg transition-colors ${
                    activeTab === 'admin' 
                      ? 'bg-indigo-50 text-indigo-700' 
                      : 'text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  <Users className="w-6 h-6" />
                  <span className="ml-3 hidden md:block font-medium">Пользователи</span>
                </button>
              </li>
            )}
            <li>
              <button
                onClick={() => setActiveTab('settings')}
                className={`w-full flex items-center p-3 rounded-lg transition-colors ${
                  activeTab === 'settings' 
                    ? 'bg-indigo-50 text-indigo-700' 
                    : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                <SettingsIcon className="w-6 h-6" />
                <span className="ml-3 hidden md:block font-medium">Настройки</span>
              </button>
            </li>
          </ul>
        </nav>
        
        <div className="p-4 border-t border-slate-100 hidden md:block">
          <div className="bg-slate-50 rounded-lg p-3 text-[10px] text-slate-400 uppercase font-bold tracking-tighter">
            Build v1.1.0-PRO
          </div>
        </div>
      </aside>

      <div className="flex-1 overflow-auto bg-slate-50 p-4 md:p-8">
        {activeTab === 'journal' && <Journal user={user} />}
        {activeTab === 'admin' && isAdmin && <AdminPanel />}
        {activeTab === 'settings' && <Settings user={user} />}
      </div>
    </div>
  );
};

export default Dashboard;
