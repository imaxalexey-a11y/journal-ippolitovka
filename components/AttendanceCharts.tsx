
import React from 'react';
import { Student, MonthlyAttendance } from '../types';

interface AttendanceChartsProps {
  students: Student[];
  attendanceData: { [yearMonth: string]: MonthlyAttendance };
}

const AttendanceCharts: React.FC<AttendanceChartsProps> = ({ students, attendanceData }) => {
  // Calculate stats across all months recorded
  const stats = students.map(student => {
    let present = 0;
    let total = 0;
    
    Object.values(attendanceData).forEach(month => {
      Object.values(month).forEach(day => {
        const status = day[student.id];
        if (status) {
          total++;
          if (status === 'present') present++;
        }
      });
    });

    return {
      name: student.fullName,
      percent: total > 0 ? Math.round((present / total) * 100) : 0,
      total
    };
  });

  return (
    <div className="p-6">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Аналитика посещаемости</h2>
          <p className="text-slate-500">Статистика по всей группе за всё время</p>
        </div>
        <button 
          onClick={() => window.print()} 
          className="print:hidden flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg font-medium transition-all"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Печать отчета
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
            <span className="w-2 h-6 bg-blue-600 rounded-full"></span>
            Рейтинг посещаемости (%)
          </h3>
          <div className="space-y-6">
            {stats.sort((a,b) => b.percent - a.percent).map(s => (
              <div key={s.name}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-slate-700">{s.name}</span>
                  <span className="font-bold text-blue-600">{s.percent}%</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-1000 ${s.percent > 80 ? 'bg-green-500' : s.percent > 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                    style={{ width: `${s.percent}%` }}
                  ></div>
                </div>
              </div>
            ))}
            {stats.length === 0 && <p className="text-slate-400 text-center py-8 italic">Нет данных для анализа</p>}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
            <span className="w-2 h-6 bg-indigo-600 rounded-full"></span>
            Сводная таблица
          </h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-slate-100">
                <th className="pb-3 text-slate-500">Студент</th>
                <th className="pb-3 text-slate-500 text-center">Занятий</th>
                <th className="pb-3 text-slate-500 text-right">Статус</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {stats.map(s => (
                <tr key={s.name}>
                  <td className="py-3 font-medium text-slate-700">{s.name}</td>
                  <td className="py-3 text-center text-slate-600">{s.total}</td>
                  <td className="py-3 text-right">
                    <span className={`px-2 py-1 rounded-md text-xs font-bold ${s.percent > 70 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                      {s.percent > 70 ? 'Норма' : 'Пропуски'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AttendanceCharts;
