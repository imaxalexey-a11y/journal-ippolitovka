
import React from 'react';
import { MonthlyWorkProgram } from '../types';

interface WorkProgramTableProps {
  currentDate: Date;
  data: MonthlyWorkProgram;
  onUpdate: (day: number, topic: string, notes: string) => void;
}

const WorkProgramTable: React.FC<WorkProgramTableProps> = ({ currentDate, data, onUpdate }) => {
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const getDayName = (day: number) => {
    return new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
      .toLocaleString('ru', { weekday: 'short' });
  };

  const isWeekend = (day: number) => {
    const d = new Date(currentDate.getFullYear(), currentDate.getMonth(), day).getDay();
    return d === 0 || d === 6;
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200 text-left">
            <th className="p-4 font-semibold text-slate-600 w-24">Дата</th>
            <th className="p-4 font-semibold text-slate-600">Тема занятия / Содержание работы</th>
            <th className="p-4 font-semibold text-slate-600 w-1/4">Заметки</th>
          </tr>
        </thead>
        <tbody>
          {days.map(day => {
            const weekend = isWeekend(day);
            const entry = data[day] || { topic: '', notes: '' };
            return (
              <tr key={day} className={`border-b border-slate-100 ${weekend ? 'bg-slate-50/80' : 'bg-white'}`}>
                <td className="p-4">
                  <div className="flex flex-col">
                    <span className={`text-lg font-bold ${weekend ? 'text-slate-400' : 'text-slate-900'}`}>{day}</span>
                    <span className="text-xs uppercase font-medium text-slate-400">{getDayName(day)}</span>
                  </div>
                </td>
                <td className="p-2">
                  <textarea
                    className={`w-full p-2 text-sm border-none bg-transparent focus:ring-1 focus:ring-blue-400 rounded transition-all resize-none min-h-[60px] ${weekend ? 'text-slate-400 italic' : 'text-slate-800'}`}
                    placeholder={weekend ? 'Выходной' : 'Введите тему занятия...'}
                    value={entry.topic}
                    onChange={(e) => onUpdate(day, e.target.value, entry.notes)}
                  />
                </td>
                <td className="p-2">
                  <input
                    className={`w-full p-2 text-sm border-none bg-transparent focus:ring-1 focus:ring-blue-400 rounded transition-all ${weekend ? 'text-slate-400' : 'text-slate-600'}`}
                    placeholder="Доп. информация"
                    value={entry.notes}
                    onChange={(e) => onUpdate(day, entry.topic, e.target.value)}
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default WorkProgramTable;
