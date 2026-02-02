import React from 'react';
import { WorkProgramEntry } from '../types';

interface WorkPlanProps {
  currentDate: Date;
  workProgram: Record<string, WorkProgramEntry>;
  onUpdateEntry: (dateStr: string, entry: WorkProgramEntry) => void;
}

export const WorkPlan: React.FC<WorkPlanProps> = ({ currentDate, workProgram, onUpdateEntry }) => {
  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const getDayKey = (day: number) => {
    const year = currentDate.getFullYear();
    const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
    const dayStr = day.toString().padStart(2, '0');
    return `${year}-${month}-${dayStr}`;
  };

  const handleTextChange = (dateStr: string, text: string) => {
    const current = workProgram[dateStr] || { date: dateStr, topic: '', hours: 0 };
    onUpdateEntry(dateStr, { ...current, topic: text });
  };

  const handleHoursChange = (dateStr: string, hoursStr: string) => {
    const current = workProgram[dateStr] || { date: dateStr, topic: '', hours: 0 };
    const hours = parseFloat(hoursStr) || 0;
    onUpdateEntry(dateStr, { ...current, hours });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col h-full mt-6 lg:mt-0">
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <h3 className="font-semibold text-gray-700">Рабочая программа</h3>
      </div>
      <div className="flex-1 overflow-auto p-0">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600 font-medium">
            <tr>
              <th className="p-2 border-b w-16 text-center">Дата</th>
              <th className="p-2 border-b text-left">Тема занятия</th>
              <th className="p-2 border-b w-20 text-center">Часы</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {days.map(day => {
              const dateStr = getDayKey(day);
              const entry = workProgram[dateStr];
              const isWeekend = new Date(dateStr).getDay() === 0 || new Date(dateStr).getDay() === 6;
              
              return (
                <tr key={day} className={isWeekend ? 'bg-gray-50' : 'bg-white hover:bg-gray-50'}>
                  <td className="p-2 text-center text-gray-500 font-mono text-xs">{day}</td>
                  <td className="p-1">
                    <input 
                      type="text" 
                      className="w-full p-1 bg-transparent focus:bg-white border border-transparent focus:border-blue-300 rounded outline-none transition-all placeholder-gray-300"
                      placeholder={isWeekend ? "Выходной" : "Введите тему..."}
                      value={entry?.topic || ''}
                      onChange={(e) => handleTextChange(dateStr, e.target.value)}
                    />
                  </td>
                  <td className="p-1">
                    <input 
                      type="number"
                      min="0"
                      step="0.5"
                      className="w-full text-center p-1 bg-transparent focus:bg-white border border-transparent focus:border-blue-300 rounded outline-none"
                      value={entry?.hours || ''}
                      onChange={(e) => handleHoursChange(dateStr, e.target.value)}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};