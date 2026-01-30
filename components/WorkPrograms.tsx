
import React, { useState } from 'react';
import { WorkProgramEntry } from '../types';
import { Plus, Search, Trash2, Edit2, Calendar, FileText, X, AlertCircle } from 'lucide-react';

interface WorkProgramsProps {
  entries: WorkProgramEntry[];
  onAdd: (entry: WorkProgramEntry) => void;
  onUpdate: (entry: WorkProgramEntry) => void;
  onDelete: (id: string) => void;
}

const WorkPrograms: React.FC<WorkProgramsProps> = ({ entries, onAdd, onUpdate, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    topic: '',
    description: '',
    notes: ''
  });

  const filteredEntries = entries.filter(entry => 
    entry.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.date.includes(searchTerm)
  ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const handleOpenModal = (entry?: WorkProgramEntry) => {
    if (entry) {
      setEditingId(entry.id);
      setFormData({
        date: entry.date,
        topic: entry.topic,
        description: entry.description,
        notes: entry.notes
      });
    } else {
      setEditingId(null);
      setFormData({
        date: new Date().toISOString().split('T')[0],
        topic: '',
        description: '',
        notes: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      onUpdate({ id: editingId, ...formData });
    } else {
      onAdd({ id: Math.random().toString(36).substr(2, 9), ...formData });
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <div className="relative flex-1 min-w-[300px]">
          <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
          <input 
            type="text"
            placeholder="Поиск по теме или дате (ГГГГ-ММ)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center px-4 py-2 bg-indigo-900 text-white rounded-lg text-sm font-semibold hover:bg-indigo-800 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" /> Добавить запись
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredEntries.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400 bg-white rounded-xl border border-dashed border-slate-300">
            <FileText className="w-12 h-12 mx-auto mb-2 opacity-20" />
            <p>Записи не найдены</p>
          </div>
        ) : (
          filteredEntries.map(entry => (
            <div key={entry.id} className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow group">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
                  <Calendar className="w-3 h-3 mr-1" />
                  {new Date(entry.date).toLocaleDateString('ru-RU')}
                </div>
                <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => handleOpenModal(entry)} className="p-1 hover:bg-slate-100 rounded text-slate-500">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => onDelete(entry.id)} className="p-1 hover:bg-rose-50 rounded text-rose-500">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <h4 className="font-bold text-slate-800 mb-2 leading-tight">{entry.topic}</h4>
              <p className="text-sm text-slate-600 mb-4 line-clamp-3">{entry.description}</p>
              {entry.notes && (
                <div className="mt-auto pt-3 border-t border-slate-100 flex items-start text-xs text-slate-400 italic">
                  <AlertCircle className="w-3 h-3 mr-2 mt-0.5 flex-shrink-0" />
                  <span>{entry.notes}</span>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="bg-indigo-900 p-4 flex items-center justify-between text-white">
              <h3 className="font-bold">{editingId ? 'Редактировать запись' : 'Новая запись в программу'}</h3>
              <button onClick={() => setIsModalOpen(false)}><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Дата занятия</label>
                <input 
                  type="date" 
                  required
                  value={formData.date}
                  onChange={e => setFormData({...formData, date: e.target.value})}
                  className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Тема</label>
                <input 
                  type="text" 
                  required
                  placeholder="Например: Основы сольфеджио"
                  value={formData.topic}
                  onChange={e => setFormData({...formData, topic: e.target.value})}
                  className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Описание занятий</label>
                <textarea 
                  required
                  rows={4}
                  placeholder="Подробное содержание занятия..."
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Примечания / Домашнее задание</label>
                <input 
                  type="text" 
                  placeholder="Дополнительные сведения..."
                  value={formData.notes}
                  onChange={e => setFormData({...formData, notes: e.target.value})}
                  className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-500 font-semibold">Отмена</button>
                <button type="submit" className="px-6 py-2 bg-indigo-900 text-white font-bold rounded-lg shadow-lg">
                  {editingId ? 'Сохранить' : 'Добавить'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkPrograms;
