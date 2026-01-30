
import React, { useState } from 'react';
import { Student, MonthlyAttendance, AttendanceStatus } from '../types';

interface AttendanceTableProps {
  currentDate: Date;
  students: Student[];
  allHistory: Student[];
  data: MonthlyAttendance;
  onUpdate: (day: number, studentId: string, status: AttendanceStatus) => void;
  onRemoveStudent: (id: string) => void;
  onAddStudent: (student: Student) => void;
}

const AttendanceTable: React.FC<AttendanceTableProps> = ({ 
  currentDate, 
  students, 
  allHistory,
  data, 
  onUpdate,
  onRemoveStudent,
  onAddStudent
}) => {
  const [showAddMenu, setShowAddMenu] = useState(false);
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const getStatusColor = (status: AttendanceStatus) => {
    switch (status) {
      case 'present': return 'bg-green-100 text-green-700 border-green-200';
      case 'absent': return 'bg-red-100 text-red-700 border-red-200';
      case 'excused': return 'bg-amber-100 text-amber-700 border-amber-200';
      default: return 'bg-slate-50 text-slate-400 border-slate-100';
    }
  };

  const cycleStatus = (day: number, studentId: string, current: AttendanceStatus) => {
    const statuses: AttendanceStatus[] = [null, 'present', 'absent', 'excused'];
    const nextIdx = (statuses.indexOf(current) + 1) % statuses.length;
    onUpdate(day, studentId, statuses[nextIdx]);
  };

  const archive = allHistory.filter(h => !students.find(s => s.id === h.id));

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200">
            <th className="sticky left-0 bg-slate-50 z-20 p-4 text-left font-semibold text-slate-700 min-w-[280px] border-r border-slate-200 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
              <div className="flex items-center justify-between">
                <span>ФИО Студента</span>
                <div className="relative print:hidden">
                  <button 
                    onClick={() => setShowAddMenu(!showAddMenu)}
                    className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                    title="Добавить студента из базы"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </button>
                  {showAddMenu && (
                    <div className="absolute left-0 mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-xl z-50 p-2 max-h-60 overflow-y-auto animate-in fade-in zoom-in-95 duration-100">
                      <div className="p-2 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 mb-1">
                        Выберите из базы
                      </div>
                      {archive.length > 0 ? archive.map(s => (
                        <button
                          key={s.id}
                          onClick={() => {
                            onAddStudent(s);
                            setShowAddMenu(false);
                          }}
                          className="w-full text-left p-2.5 text-sm hover:bg-blue-50 rounded-lg transition-colors font-medium text-slate-700 truncate"
                        >
                          {s.fullName}
                        </button>
                      )) : (
                        <div className="p-3 text-xs text-slate-400 italic text-center">Все студенты уже добавлены</div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </th>
            {days.map(day => (
              <th key={day} className="p-2 text-center text-xs font-bold text-slate-500 border-r border-slate-200 min-w-[36px]">
                {day}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {students.map((student, idx) => (
            <tr key={student.id} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'} border-b border-slate-100 hover:bg-blue-50/30 transition-colors group`}>
              <td className="sticky left-0 bg-inherit z-10 p-4 border-r border-slate-200 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] font-medium text-slate-800">
                <div className="flex items-center justify-between">
                  <span className="truncate pr-2">{student.fullName}</span>
                  <button
                    onClick={() => onRemoveStudent(student.id)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all print:hidden"
                    title="Убрать из журнала"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </td>
              {days.map(day => {
                const status = data[day]?.[student.id] || null;
                return (
                  <td key={day} className="p-0 border-r border-slate-100 text-center">
                    <button
                      onClick={() => cycleStatus(day, student.id, status)}
                      className={`w-full h-10 flex items-center justify-center transition-all border font-bold text-sm ${getStatusColor(status)}`}
                    >
                      {status === 'present' ? 'Б' : status === 'absent' ? 'Н' : status === 'excused' ? 'У' : ''}
                    </button>
                  </td>
                );
              })}
            </tr>
          ))}
          {students.length === 0 && (
            <tr>
              <td colSpan={daysInMonth + 1} className="p-12 text-center text-slate-400 bg-slate-50">
                <div className="flex flex-col items-center gap-2">
                   <svg className="w-10 h-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                   </svg>
                   <p className="font-semibold">Список пуст</p>
                   <p className="text-xs">Используйте "+" в заголовке или вкладку "Студенты"</p>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
      
      <div className="p-4 flex gap-6 text-xs text-slate-500 bg-slate-50 border-t border-slate-200">
        <div className="flex items-center gap-1.5"><span className="w-3 h-3 bg-green-100 border border-green-200 rounded"></span> Б — Был (Присутствует)</div>
        <div className="flex items-center gap-1.5"><span className="w-3 h-3 bg-red-100 border border-red-200 rounded"></span> Н — Нет (Отсутствует)</div>
        <div className="flex items-center gap-1.5"><span className="w-3 h-3 bg-amber-100 border border-amber-200 rounded"></span> У — Уважительная причина</div>
      </div>
    </div>
  );
};

export default AttendanceTable;
