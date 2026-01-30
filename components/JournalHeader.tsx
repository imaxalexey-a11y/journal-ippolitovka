
import React from 'react';

interface JournalHeaderProps {
  currentDate: Date;
  onMonthChange: (date: Date) => void;
  activeTab: 'attendance' | 'work-program' | 'students' | 'charts';
  onTabChange: (tab: 'attendance' | 'work-program' | 'students' | 'charts') => void;
}

const JournalHeader: React.FC<JournalHeaderProps> = ({ 
  currentDate, 
  onMonthChange, 
  activeTab, 
  onTabChange
}) => {
  const months = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
  ];

  const handlePrevMonth = () => {
    const d = new Date(currentDate);
    d.setMonth(d.getMonth() - 1);
    onMonthChange(d);
  };

  const handleNextMonth = () => {
    const d = new Date(currentDate);
    d.setMonth(d.getMonth() + 1);
    onMonthChange(d);
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-4">
            <div className="bg-blue-600 p-2 rounded-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold text-slate-900 leading-tight">Журнал преподавателя</h1>
            </div>
          </div>

          <div className="flex items-center bg-slate-100 rounded-full p-1">
            <button 
              onClick={handlePrevMonth}
              className="p-1 hover:bg-white rounded-full transition-all text-slate-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span className="px-4 font-medium min-w-[140px] text-center text-slate-800 text-sm">
              {months[currentDate.getMonth()]} {currentDate.getFullYear()}
            </span>
            <button 
              onClick={handleNextMonth}
              className="p-1 hover:bg-white rounded-full transition-all text-slate-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <div className="flex items-center gap-2 text-slate-400 text-xs font-mono hidden md:flex">
             v.2.1.integrated
          </div>
        </div>

        <nav className="flex space-x-8 -mb-px">
          <TabButton 
            active={activeTab === 'attendance'} 
            onClick={() => onTabChange('attendance')}
            label="Журнал"
          />
          <TabButton 
            active={activeTab === 'work-program'} 
            onClick={() => onTabChange('work-program')}
            label="Программа"
          />
          <TabButton 
            active={activeTab === 'charts'} 
            onClick={() => onTabChange('charts')}
            label="Статистика"
          />
          <TabButton 
            active={activeTab === 'students'} 
            onClick={() => onTabChange('students')}
            label="Студенты"
          />
        </nav>
      </div>
    </header>
  );
};

const TabButton: React.FC<{ active: boolean; onClick: () => void; label: string }> = ({ active, onClick, label }) => (
  <button
    onClick={onClick}
    className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
      active 
        ? 'border-blue-600 text-blue-600' 
        : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
    }`}
  >
    {label}
  </button>
);

export default JournalHeader;
