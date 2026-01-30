
import React, { useState, useRef } from 'react';
import { Student } from '../types';
import * as XLSX from 'xlsx';

interface StudentManagerProps {
  students: Student[];
  allHistory: Student[];
  onUpdate: (students: Student[]) => void;
}

const StudentManager: React.FC<StudentManagerProps> = ({ students, allHistory, onUpdate }) => {
  const [newName, setNewName] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addStudent = (name: string) => {
    const trimmedName = name.trim();
    if (!trimmedName) return;

    const existingFromHistory = allHistory.find(s => s.fullName.toLowerCase() === trimmedName.toLowerCase());
    
    if (existingFromHistory) {
      if (!students.find(s => s.id === existingFromHistory.id)) {
        onUpdate([...students, existingFromHistory]);
      }
    } else {
      const newStudent: Student = {
        id: Math.random().toString(36).substr(2, 9),
        fullName: trimmedName
      };
      onUpdate([...students, newStudent]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addStudent(newName);
    setNewName('');
  };

  const removeStudent = (id: string) => {
    onUpdate(students.filter(s => s.id !== id));
  };

  const editStudent = (id: string, name: string) => {
    onUpdate(students.map(s => s.id === id ? { ...s, fullName: name } : s));
  };

  const handleExcelImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][];
        
        const importedNames: string[] = data
          .flat()
          .filter(val => typeof val === 'string' && val.trim().length > 2);

        if (importedNames.length === 0) {
          alert('В файле не найдено подходящих ФИО.');
        } else {
          const newOnes = importedNames.filter(name => 
            !students.some(s => s.fullName.toLowerCase() === name.toLowerCase())
          );
          
          const studentsToAdd = newOnes.map(name => ({
            id: Math.random().toString(36).substr(2, 9),
            fullName: name
          }));

          onUpdate([...students, ...studentsToAdd]);
          alert(`Успешно импортировано студентов: ${studentsToAdd.length}`);
        }
      } catch (err) {
        console.error(err);
        alert('Ошибка при чтении файла Excel.');
      } finally {
        setIsImporting(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsBinaryString(file);
  };

  const archive = allHistory.filter(h => !students.find(s => s.id === h.id));

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Список студентов</h2>
          <p className="text-slate-500 font-medium">Активных в группе: {students.length}</p>
        </div>
        
        <div className="flex flex-wrap gap-3 w-full md:w-auto">
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isImporting}
            className="flex-1 md:flex-none bg-emerald-50 text-emerald-700 border border-emerald-100 px-5 py-3 rounded-2xl font-bold hover:bg-emerald-100 transition-all flex items-center justify-center gap-2"
          >
            {isImporting ? 'Загрузка...' : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Импорт Excel
              </>
            )}
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleExcelImport} 
            accept=".xlsx, .xls, .csv" 
            className="hidden" 
          />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mb-8 relative group">
        <input
          type="text"
          className="w-full pl-6 pr-32 py-5 bg-white border-2 border-slate-100 rounded-3xl focus:ring-4 focus:ring-blue-50 focus:border-blue-500 outline-none transition-all text-lg shadow-sm font-medium"
          placeholder="Введите ФИО нового студента..."
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
        />
        <button
          type="submit"
          className="absolute right-2 top-2 bottom-2 bg-blue-600 hover:bg-blue-700 text-white px-6 rounded-2xl font-bold transition-all shadow-lg shadow-blue-100 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Добавить
        </button>
      </form>

      <div className="space-y-3 mb-12">
        {students.map((student, idx) => (
          <div key={student.id} className="group flex items-center gap-4 bg-white p-5 rounded-2xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all">
            <div className="w-10 h-10 flex items-center justify-center bg-slate-50 rounded-xl text-slate-400 font-black text-sm group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
              {idx + 1}
            </div>
            <input
              type="text"
              className="flex-1 bg-transparent border-none focus:ring-0 text-slate-800 font-semibold text-lg"
              value={student.fullName}
              onChange={(e) => editStudent(student.id, e.target.value)}
            />
            <button
              onClick={() => removeStudent(student.id)}
              className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
              title="Удалить из списка"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        ))}
        {students.length === 0 && (
          <div className="text-center py-20 bg-slate-50 rounded-3xl border-4 border-dashed border-slate-200">
            <div className="mb-4 inline-block p-4 bg-slate-100 rounded-full">
              <svg className="w-12 h-12 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <p className="text-slate-400 font-bold text-xl">Список пуст</p>
            <p className="text-slate-400 text-sm mt-1">Добавьте вручную или через Excel</p>
          </div>
        )}
      </div>

      {archive.length > 0 && (
        <div className="bg-slate-50 p-8 rounded-3xl border border-slate-200">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6">База студентов (Архив)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {archive.map(h => (
              <div key={h.id} className="flex items-center justify-between bg-white px-4 py-3 rounded-2xl border border-slate-100 hover:border-blue-200 transition-all shadow-sm">
                <span className="text-slate-600 font-medium">{h.fullName}</span>
                <button 
                  onClick={() => addStudent(h.fullName)}
                  className="p-2 text-blue-500 hover:bg-blue-50 rounded-xl transition-all"
                  title="Добавить в активный список"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentManager;
