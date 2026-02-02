import React, { useState } from 'react';
import { Student, AttendanceStatus } from '../types';
import { Plus, Trash2, User as UserIcon } from 'lucide-react';

interface JournalProps {
  students: Student[];
  currentDate: Date;
  attendance: Record<string, AttendanceStatus>;
  onStatusChange: (studentId: string, dateStr: string, status: AttendanceStatus) => void;
  onAddStudent: (name: string) => void;
  onRemoveStudent: (id: string) => void;
}

export const Journal: React.FC<JournalProps> = ({
  students,
  currentDate,
  attendance,
  onStatusChange,
  onAddStudent,
  onRemoveStudent
}) => {
  const [newStudentName, setNewStudentName] = useState('');

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const getDayKey = (day: number) => {
    const year = currentDate.getFullYear();
    const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
    const dayStr = day.toString().padStart(2, '0');
    return `${year}-${month}-${dayStr}`;
  };

  const getStatusColor = (status: AttendanceStatus) => {
    switch (status) {
      case AttendanceStatus.ABSENT: return 'bg-red-100 text-red-700';
      case AttendanceStatus.PRESENT: return 'bg-green-100 text-green-700';
      case AttendanceStatus.LATE: return 'bg-yellow-100 text-yellow-700';
      case AttendanceStatus.VALID: return 'bg-blue-100 text-blue-700';
      default: return 'hover:bg-gray-50';
    }
  };

  const cycleStatus = (current: AttendanceStatus) => {
    const order = [
      AttendanceStatus.EMPTY,
      AttendanceStatus.PRESENT,
      AttendanceStatus.ABSENT,
      AttendanceStatus.LATE,
      AttendanceStatus.VALID
    ];
    const idx = order.indexOf(current);
    return order[(idx + 1) % order.length];
  };

  const handleCellClick = (studentId: string, dateStr: string) => {
    const key = `${studentId}_${dateStr}`;
    const currentStatus = attendance[key] || AttendanceStatus.EMPTY;
    const nextStatus = cycleStatus(currentStatus);
    onStatusChange(studentId, dateStr, nextStatus);
  };

  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (newStudentName.trim()) {
      onAddStudent(newStudentName.trim());
      setNewStudentName('');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col h-full">
      <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
        <h3 className="font-semibold text-gray-700">Посещаемость</h3>
        <div className="flex items-center gap-4 text-xs text-gray-500">
           <span className="flex items-center gap-1"><div className="w-3 h-3 bg-green-100 border border-green-200"></div> Присутствовал (P)</span>
           <span className="flex items-center gap-1"><div className="w-3 h-3 bg-red-100 border border-red-200"></div> Не был (H)</span>
           <span className="flex items-center gap-1"><div className="w-3 h-3 bg-yellow-100 border border-yellow-200"></div> Опоздал (O)</span>
           <span className="flex items-center gap-1"><div className="w-3 h-3 bg-blue-100 border border-blue-200"></div> Уважительная (У)</span>
        </div>
      </div>
      
      <div className="flex-1 overflow-auto">
        <table className="w-full text-sm border-collapse">
          <thead className="bg-gray-50 sticky top-0 z-10 shadow-sm">
            <tr>
              <th className="p-2 text-left min-w-[200px] border-r border-b border-gray-200 font-medium text-gray-600 bg-gray-50 sticky left-0 z-20">
                ФИО Студента
              </th>
              {days.map(day => (
                <th key={day} className="p-1 min-w-[32px] text-center border-b border-gray-200 font-normal text-gray-500">
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {students.map(student => (
              <tr key={student.id} className="border-b border-gray-100 last:border-0 group">
                <td className="p-2 border-r border-gray-200 bg-white sticky left-0 z-10 group-hover:bg-gray-50 flex justify-between items-center">
                   <div className="flex items-center gap-2">
                       <UserIcon size={14} className="text-gray-400"/>
                       {student.name}
                   </div>
                   <button 
                    onClick={() => onRemoveStudent(student.id)}
                    className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Удалить студента"
                   >
                       <Trash2 size={14} />
                   </button>
                </td>
                {days.map(day => {
                  const dateStr = getDayKey(day);
                  const key = `${student.id}_${dateStr}`;
                  const status = attendance[key] || AttendanceStatus.EMPTY;
                  return (
                    <td 
                      key={day} 
                      className={`text-center cursor-pointer select-none border-r border-gray-100 last:border-0 transition-colors ${getStatusColor(status)}`}
                      onClick={() => handleCellClick(student.id, dateStr)}
                    >
                      {status}
                    </td>
                  );
                })}
              </tr>
            ))}
            {/* Add Student Row */}
            <tr>
              <td className="p-2 border-r border-gray-200 sticky left-0 bg-white z-10" colSpan={days.length + 1}>
                <form onSubmit={handleAddStudent} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Добавить студента..."
                    className="flex-1 text-sm border-b border-gray-300 focus:border-blue-500 outline-none px-1 py-1"
                    value={newStudentName}
                    onChange={(e) => setNewStudentName(e.target.value)}
                  />
                  <button 
                    type="submit"
                    disabled={!newStudentName.trim()}
                    className="text-blue-600 hover:text-blue-800 disabled:opacity-50"
                  >
                    <Plus size={18} />
                  </button>
                </form>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};