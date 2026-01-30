
import React, { useState, useEffect } from 'react';
import { Student, AppState, AttendanceStatus, UserProfile } from './types';
import JournalHeader from './components/JournalHeader';
import AttendanceTable from './components/AttendanceTable';
import WorkProgramTable from './components/WorkProgramTable';
import StudentManager from './components/StudentManager';
import GeminiAssistant from './components/GeminiAssistant';
import AttendanceCharts from './components/AttendanceCharts';
import Auth from './components/Auth';
import AdminPanel from './components/AdminPanel';

const STORAGE_KEY = 'edu_journal_data_v2_persistent';

const App: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('journal_user');
    return saved ? JSON.parse(saved) : null;
  });
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [activeTab, setActiveTab] = useState<'attendance' | 'work-program' | 'students' | 'charts' | 'admin'>('attendance');
  
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
    return {
      user: null,
      students: [],
      allStudentsHistory: [],
      attendance: {},
      workPrograms: {},
      visibleStudentIds: []
    };
  });

  useEffect(() => {
    if (user) localStorage.setItem('journal_user', JSON.stringify(user));
    else localStorage.removeItem('journal_user');
  }, [user]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...state, user }));
  }, [state, user]);

  if (!user) {
    return <Auth onLogin={setUser} />;
  }

  const yearMonthKey = `${currentDate.getFullYear()}-${currentDate.getMonth() + 1}`;
  const isAdmin = user.email === 'it_admin@ippolitovka.ru';

  const updateAttendance = (day: number, studentId: string, status: AttendanceStatus) => {
    setState(prev => {
      const currentAttendance = prev.attendance[yearMonthKey] || {};
      const dayAttendance = currentAttendance[day] || {};
      return {
        ...prev,
        attendance: {
          ...prev.attendance,
          [yearMonthKey]: { ...currentAttendance, [day]: { ...dayAttendance, [studentId]: status } }
        }
      };
    });
  };

  const updateWorkProgram = (day: number, topic: string, notes: string) => {
    setState(prev => {
      const currentWP = prev.workPrograms[yearMonthKey] || {};
      return {
        ...prev,
        workPrograms: {
          ...prev.workPrograms,
          [yearMonthKey]: { ...currentWP, [day]: { topic, notes } }
        }
      };
    });
  };

  const handleLogout = () => {
    setUser(null);
    setActiveTab('attendance');
  };

  return (
    <div className="min-h-screen pb-12 print:bg-white transition-all duration-300">
      <div className="print:hidden">
        <JournalHeader 
          currentDate={currentDate} 
          onMonthChange={setCurrentDate}
          activeTab={activeTab as any}
          onTabChange={setActiveTab as any}
        />
        <div className="max-w-7xl mx-auto px-4 mt-2 flex justify-between items-center text-xs text-slate-400">
          <span>{user.fullName} ({user.position})</span>
          <button onClick={handleLogout} className="text-red-400 hover:text-red-600 font-bold">Выйти</button>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4 print:mt-0 print:px-0">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden print:shadow-none print:border-none">
          {activeTab === 'attendance' && (
            <AttendanceTable 
              currentDate={currentDate}
              students={state.students}
              allHistory={state.allStudentsHistory}
              data={state.attendance[yearMonthKey] || {}}
              onUpdate={updateAttendance}
              onRemoveStudent={id => setState(p => ({...p, students: p.students.filter(s => s.id !== id)}))}
              onAddStudent={s => setState(p => ({...p, students: [...p.students, s]}))}
            />
          )}

          {activeTab === 'work-program' && (
            <WorkProgramTable 
              currentDate={currentDate}
              data={state.workPrograms[yearMonthKey] || {}}
              onUpdate={updateWorkProgram}
            />
          )}

          {activeTab === 'admin' && isAdmin && (
            <AdminPanel adminEmail={user.email} />
          )}

          {activeTab === 'students' && (
            <StudentManager 
              students={state.students} 
              allHistory={state.allStudentsHistory}
              onUpdate={s => setState(p => ({...p, students: s}))} 
            />
          )}

          {activeTab === 'charts' && (
            <AttendanceCharts 
              students={state.students}
              attendanceData={state.attendance}
            />
          )}
        </div>
      </main>
      
      {isAdmin && activeTab !== 'admin' && (
        <button 
          onClick={() => setActiveTab('admin')}
          className="fixed bottom-6 right-6 bg-purple-600 text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-all z-50 print:hidden"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37a1.724 1.724 0 002.572-1.065z" />
          </svg>
        </button>
      )}
    </div>
  );
};

export default App;
