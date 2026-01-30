
import React, { useState, useEffect, useMemo } from 'react';
import { User, JournalData, AttendanceRecord, WorkProgramEntry } from '../types';
import { MONTHS } from '../constants';
import { StorageService } from '../services/storageService';
import { ExportService } from '../services/exportService';
import WorkPrograms from './WorkPrograms';
import { Save, UserPlus, Trash2, ChevronLeft, ChevronRight, Check, X, FileSpreadsheet, Users, CalendarRange } from 'lucide-react';

interface JournalProps {
  user: User;
}

const Journal: React.FC<JournalProps> = ({ user }) => {
  const currentYear = new Date().getFullYear();
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [journal, setJournal] = useState<JournalData | null>(null);
  const [activeView, setActiveView] = useState<'attendance' | 'program'>('attendance');

  useEffect(() => {
    const journals = StorageService.getJournals();
    const existing = journals.find(
      j => j.teacherId === user.id && j.month === selectedMonth && j.year === selectedYear
    );

    if (existing) {
      setJournal(existing);
    } else {
      const newJournal: JournalData = {
        id: `${user.id}-${selectedYear}-${selectedMonth}`,
        teacherId: user.id,
        month: selectedMonth,
        year: selectedYear,
        attendance: [],
        workProgramEntries: [] // Empty list of entries
      };
      setJournal(newJournal);
    }
  }, [selectedMonth, selectedYear, user.id]);

  const daysInMonth = useMemo(() => {
    return new Date(selectedYear, selectedMonth + 1, 0).getDate();
  }, [selectedMonth, selectedYear]);

  const handleSave = () => {
    if (journal) {
      StorageService.saveJournal(journal);
      alert('Данные сохранены успешно!');
    }
  };

  const handleExport = () => {
    if (journal) {
      ExportService.exportToCSV(journal);
    }
  };

  const addStudent = () => {
    const name = prompt('Введите ФИО студента:');
    if (name && journal) {
      const newRecord: AttendanceRecord = {
        studentName: name,
        days: {}
      };
      setJournal({ ...journal, attendance: [...journal.attendance, newRecord] });
    }
  };

  const toggleAttendance = (studentIndex: number, day: number) => {
    if (!journal) return;
    const newAttendance = [...journal.attendance];
    const current = newAttendance[studentIndex].days[day];
    let nextValue: 'p' | 'a' | '' = 'p';
    if (current === 'p') nextValue = 'a';
    else if (current === 'a') nextValue = '';
    newAttendance[studentIndex].days[day] = nextValue;
    setJournal({ ...journal, attendance: newAttendance });
  };

  const removeStudent = (index: number) => {
    if (journal && window.confirm('Удалить студента из журнала?')) {
      const newAttendance = [...journal.attendance];
      newAttendance.splice(index, 1);
      setJournal({ ...journal, attendance: newAttendance });
    }
  };

  // Work Program Event Handlers
  const addProgramEntry = (entry: WorkProgramEntry) => {
    if (!journal) return;
    setJournal({ ...journal, workProgramEntries: [...journal.workProgramEntries, entry] });
  };

  const updateProgramEntry = (entry: WorkProgramEntry) => {
    if (!journal) return;
    setJournal({
      ...journal,
      workProgramEntries: journal.workProgramEntries.map(e => e.id === entry.id ? entry : e)
    });
  };

  const deleteProgramEntry = (id: string) => {
    if (!journal) return;
    setJournal({
      ...journal,
      workProgramEntries: journal.workProgramEntries.filter(e => e.id !== id)
    });
  };

  if (!journal) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <button onClick={() => setSelectedMonth(m => m === 0 ? 11 : m - 1)} className="p-1 hover:bg-slate-100 rounded">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="font-bold text-lg min-w-[120px] text-center">{MONTHS[selectedMonth]} {selectedYear}</span>
            <button onClick={() => setSelectedMonth(m => m === 11 ? 0 : m + 1)} className="p-1 hover:bg-slate-100 rounded">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          
          <div className="h-8 w-px bg-slate-200 mx-2"></div>

          <div className="flex bg-slate-100 p-1 rounded-lg">
            <button 
              onClick={() => setActiveView('attendance')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                activeView === 'attendance' ? 'bg-white shadow-sm text-indigo-700' : 'text-slate-500 hover:text-indigo-600'
              }`}
            >
              Посещаемость
            </button>
            <button 
              onClick={() => setActiveView('program')}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                activeView === 'program' ? 'bg-white shadow-sm text-indigo-700' : 'text-slate-500 hover:text-indigo-600'
              }`}
            >
              Рабочая программа
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button 
            onClick={handleExport}
            className="flex items-center px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-200 transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 mr-2" /> Экспорт CSV
          </button>
          {activeView === 'attendance' && (
            <button 
              onClick={addStudent}
              className="flex items-center px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm"
            >
              <UserPlus className="w-4 h-4 mr-2" /> Студент
            </button>
          )}
          <button 
            onClick={handleSave}
            className="flex items-center px-4 py-2 bg-indigo-900 hover:bg-indigo-800 text-white rounded-lg text-sm font-semibold transition-colors shadow-md"
          >
            <Save className="w-4 h-4 mr-2" /> Сохранить
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {activeView === 'attendance' ? (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse min-w-max">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="sticky left-0 bg-slate-50 z-10 p-4 font-semibold text-slate-700 text-sm border-r w-64">ФИО Студента</th>
                  {Array.from({ length: daysInMonth }, (_, i) => (
                    <th key={i} className="p-2 text-center text-xs font-bold text-slate-500 border-r w-8 min-w-[32px]">
                      {i + 1}
                    </th>
                  ))}
                  <th className="p-2 text-center text-xs font-bold text-slate-500 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {journal.attendance.length === 0 ? (
                  <tr>
                    <td colSpan={daysInMonth + 2} className="p-12 text-center text-slate-400">
                      <div className="flex flex-col items-center">
                        <Users className="w-12 h-12 mb-2 opacity-20" />
                        <p>Список студентов пуст</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  journal.attendance.map((record, sIdx) => (
                    <tr key={sIdx} className="hover:bg-slate-50 transition-colors">
                      <td className="sticky left-0 bg-white group-hover:bg-slate-50 z-10 p-4 text-sm font-medium border-r">
                        <span className="truncate max-w-[200px]">{record.studentName}</span>
                      </td>
                      {Array.from({ length: daysInMonth }, (_, dIdx) => {
                        const day = dIdx + 1;
                        const status = record.days[day];
                        return (
                          <td 
                            key={dIdx} 
                            onClick={() => toggleAttendance(sIdx, day)}
                            className={`p-0 border-r text-center cursor-pointer select-none hover:bg-indigo-50 transition-colors h-10 ${
                              status === 'p' ? 'bg-emerald-50' : status === 'a' ? 'bg-rose-50' : ''
                            }`}
                          >
                            {status === 'p' && <Check className="w-4 h-4 mx-auto text-emerald-600" />}
                            {status === 'a' && <X className="w-4 h-4 mx-auto text-rose-600" />}
                          </td>
                        );
                      })}
                      <td className="p-2 text-center">
                        <button onClick={() => removeStudent(sIdx)} className="p-1 text-slate-300 hover:text-rose-500">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6">
            <WorkPrograms 
              entries={journal.workProgramEntries}
              onAdd={addProgramEntry}
              onUpdate={updateProgramEntry}
              onDelete={deleteProgramEntry}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Journal;
