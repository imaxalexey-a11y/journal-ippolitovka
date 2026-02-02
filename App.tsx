import React, { useState, useEffect } from 'react';
import { User, AppState, UserRole, AttendanceStatus, Student, WorkProgramEntry } from './types';
import { loadState, saveState, sendAuthCode, verifyAuthCode } from './services/mockBackend';
import { Button } from './components/Button';
import { AdminPanel } from './components/AdminPanel';
import { Journal } from './components/Journal';
import { WorkPlan } from './components/WorkPlan';
import { LogOut, BookOpen, Settings, Github, Loader2 } from 'lucide-react';

const MONTH_NAMES = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
];

export default function App() {
  // --- Auth State ---
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'LOGIN' | 'VERIFY' | 'APP'>('LOGIN');
  const [authError, setAuthError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true);

  // --- App Data State ---
  // Initial empty state
  const [appState, setAppState] = useState<AppState>({
    currentUser: null,
    users: [],
    students: [],
    attendance: {},
    workProgram: {}
  });
  
  const [selectedDate, setSelectedDate] = useState(new Date()); 
  const [activeTab, setActiveTab] = useState<'JOURNAL' | 'ADMIN'>('JOURNAL');

  // Load initial data from server
  useEffect(() => {
    const init = async () => {
      setIsDataLoading(true);
      try {
        const data = await loadState();
        // Check if user is already in localStorage (simple session persistence)
        const savedUser = localStorage.getItem('journal_user_session');
        if (savedUser) {
           const user = JSON.parse(savedUser);
           setAppState({ ...data, currentUser: user });
           setStep('APP');
        } else {
           setAppState(prev => ({ ...prev, ...data }));
        }
      } catch (e) {
        console.error("Init error", e);
      } finally {
        setIsDataLoading(false);
      }
    };
    init();
  }, []);

  const persistUserSession = (user: User | null) => {
     if (user) {
         localStorage.setItem('journal_user_session', JSON.stringify(user));
     } else {
         localStorage.removeItem('journal_user_session');
     }
  };

  const syncState = (newState: AppState) => {
    setAppState(newState);
    saveState(newState); // Send to server
  };

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setIsLoading(true);
    try {
      await sendAuthCode(email);
      setStep('VERIFY');
    } catch (err: any) {
      setAuthError(err.message || 'Ошибка отправки кода');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setIsLoading(true);
    try {
      const user = await verifyAuthCode(email, code);
      const newState = { ...appState, currentUser: user };
      setAppState(newState);
      persistUserSession(user);
      setStep('APP');
      // Reload full state to ensure we have latest data
      const freshData = await loadState();
      setAppState(prev => ({ ...prev, ...freshData, currentUser: user }));
    } catch (err: any) {
      setAuthError(err.message || 'Ошибка проверки кода');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    const newState = { ...appState, currentUser: null };
    setAppState(newState);
    persistUserSession(null);
    setEmail('');
    setCode('');
    setStep('LOGIN');
  };

  // --- Data Handlers ---

  const handleStatusChange = (studentId: string, dateStr: string, status: AttendanceStatus) => {
    const key = `${studentId}_${dateStr}`;
    const newAttendance = { ...appState.attendance, [key]: status };
    const newState = { ...appState, attendance: newAttendance };
    syncState(newState);
  };

  const handleAddStudent = (name: string) => {
    const newStudent: Student = { id: Date.now().toString(), name };
    const newState = { ...appState, students: [...appState.students, newStudent] };
    syncState(newState);
  };

  const handleRemoveStudent = (id: string) => {
    const newState = { ...appState, students: appState.students.filter(s => s.id !== id) };
    syncState(newState);
  };

  const handleWorkEntryUpdate = (dateStr: string, entry: WorkProgramEntry) => {
    const newState = { 
        ...appState, 
        workProgram: { ...appState.workProgram, [dateStr]: entry } 
    };
    syncState(newState);
  };

  // Admin Handlers
  const handleUpdateUser = (updatedUser: User) => {
    const newUsers = appState.users.map(u => u.email === updatedUser.email ? updatedUser : u);
    let currentUser = appState.currentUser;
    if (currentUser && currentUser.email === updatedUser.email) {
        currentUser = updatedUser;
    }
    const newState = { ...appState, users: newUsers, currentUser };
    syncState(newState);
  };

  const handleAddUser = (newUser: User) => {
      const exists = appState.users.find(u => u.email === newUser.email);
      if (exists) {
          alert('Пользователь уже существует');
          return;
      }
      const newState = { ...appState, users: [...appState.users, newUser] };
      syncState(newState);
  }

  // --- Render ---

  if (isDataLoading) {
     return (
         <div className="min-h-screen flex items-center justify-center bg-gray-50">
             <Loader2 className="animate-spin text-blue-600" size={48} />
         </div>
     )
  }

  if (step !== 'APP') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-800">Journal Ippolitovka</h1>
            <p className="text-gray-500 text-sm mt-2">Вход в систему</p>
          </div>

          {authError && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 text-sm rounded border border-red-200">
              {authError}
            </div>
          )}

          {step === 'LOGIN' ? (
            <form onSubmit={handleSendCode} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email (@ippolitovka.ru)</label>
                <input 
                  type="email" 
                  required 
                  className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="name@ippolitovka.ru"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full" isLoading={isLoading}>
                Получить код
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerify} className="space-y-4">
              <div className="text-sm text-center text-gray-600 mb-2">
                Код отправлен на <strong>{email}</strong>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Код подтверждения</label>
                <input 
                  type="text" 
                  required 
                  className="w-full border border-gray-300 rounded-md p-2 text-center text-lg tracking-widest focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="123456"
                  value={code}
                  onChange={e => setCode(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full" isLoading={isLoading}>
                Войти
              </Button>
              <button 
                type="button" 
                onClick={() => setStep('LOGIN')}
                className="w-full text-sm text-gray-500 hover:text-gray-700 mt-2"
              >
                Назад
              </button>
            </form>
          )}
          
          <div className="mt-8 text-center text-xs text-gray-400">
             Система электронного журнала ГМПИ имени М.М. Ипполитова-Иванова
          </div>
        </div>
      </div>
    );
  }

  const isAdmin = appState.currentUser?.role === UserRole.ADMIN;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <BookOpen className="text-blue-600" />
            <span className="font-bold text-gray-800 text-lg hidden sm:block">Journal Ippolitovka</span>
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600 hidden md:block">
              {appState.currentUser?.name} <span className="text-gray-400">({appState.currentUser?.role})</span>
            </span>
            <Button variant="ghost" onClick={logout} title="Выйти">
              <LogOut size={20} />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Controls */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex-1 flex flex-col">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div className="flex bg-white rounded-lg shadow-sm border border-gray-200 p-1">
            <button
              onClick={() => setActiveTab('JOURNAL')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'JOURNAL' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Журнал и Программа
            </button>
            {isAdmin && (
              <button
                onClick={() => setActiveTab('ADMIN')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                  activeTab === 'ADMIN' ? 'bg-blue-50 text-blue-700' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Settings size={16} /> Администрирование
              </button>
            )}
          </div>

          {activeTab === 'JOURNAL' && (
            <div className="flex gap-2 items-center bg-white p-2 rounded-lg shadow-sm border border-gray-200">
               <button 
                  onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1))}
                  className="p-1 hover:bg-gray-100 rounded"
               >
                 &lt;
               </button>
               <span className="font-medium w-32 text-center select-none">
                 {MONTH_NAMES[selectedDate.getMonth()]} {selectedDate.getFullYear()}
               </span>
               <button 
                  onClick={() => setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1))}
                  className="p-1 hover:bg-gray-100 rounded"
               >
                 &gt;
               </button>
            </div>
          )}
        </div>

        {/* Content Area */}
        {activeTab === 'ADMIN' && isAdmin ? (
          <AdminPanel 
            users={appState.users} 
            onUpdateUser={handleUpdateUser} 
            onAddUser={handleAddUser} 
          />
        ) : (
          <div className="flex flex-col lg:flex-row gap-6 flex-1 overflow-hidden h-full">
            <div className="lg:w-2/3 h-full overflow-hidden flex flex-col">
               <Journal
                  students={appState.students}
                  currentDate={selectedDate}
                  attendance={appState.attendance}
                  onStatusChange={handleStatusChange}
                  onAddStudent={handleAddStudent}
                  onRemoveStudent={handleRemoveStudent}
               />
            </div>
            <div className="lg:w-1/3 h-full overflow-hidden flex flex-col">
              <WorkPlan 
                 currentDate={selectedDate}
                 workProgram={appState.workProgram}
                 onUpdateEntry={handleWorkEntryUpdate}
              />
            </div>
          </div>
        )}
      </div>

       {/* Footer */}
       <footer className="bg-white border-t border-gray-200 py-4 mt-auto">
         <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center text-xs text-gray-500 gap-2">
            <span>&copy; {new Date().getFullYear()} Journal Ippolitovka</span>
            <a 
              href="https://github.com/imaxalexey-a11y/journal-ippolitovka.git" 
              target="_blank" 
              rel="noreferrer"
              className="flex items-center gap-1 hover:text-blue-600 transition-colors"
            >
              <Github size={14} /> GitHub Repository
            </a>
         </div>
       </footer>
    </div>
  );
}