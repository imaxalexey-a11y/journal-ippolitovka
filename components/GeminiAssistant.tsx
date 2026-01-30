
import React, { useState } from 'react';

interface GeminiAssistantProps {
  // Fix: Added subject prop and removed unused yearMonth to resolve TypeScript error on line 9
  subject?: string;
  onGenerated: (updates: { [day: number]: { topic: string, notes: string } }) => void;
}

const GeminiAssistant: React.FC<GeminiAssistantProps> = ({ subject: initialSubject = '', onGenerated }) => {
  const [isOpen, setIsOpen] = useState(false);
  // Fix: Initialize state with the prop value
  const [subject, setSubject] = useState(initialSubject);
  const [isLoading, setIsLoading] = useState(false);

  const generateProgram = async () => {
    if (!subject.trim()) return;
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/generate-program', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject })
      });

      if (!response.ok) throw new Error('Ошибка сервера');

      const data = await response.json();
      const updates: { [day: number]: { topic: string, notes: string } } = {};
      data.forEach((item: any) => {
        updates[item.day] = {
          topic: item.topic,
          notes: item.notes || ''
        };
      });

      onGenerated(updates);
      setIsOpen(false);
    } catch (error) {
      console.error('AI Error:', error);
      alert('Ошибка при генерации. Проверьте API_KEY на сервере.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100 transition-all shadow-sm"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 100 2h1z" />
        </svg>
        AI Помощник
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-xl z-50 p-4 animate-in fade-in slide-in-from-top-2">
          <h3 className="text-slate-900 font-bold mb-2">Генерация плана</h3>
          <p className="text-xs text-slate-500 mb-4">Gemini составит список тем для занятий.</p>
          <input 
            type="text" 
            placeholder="Название предмета..."
            className="w-full p-2 border border-slate-200 rounded-lg text-sm mb-4 outline-none focus:ring-2 focus:ring-blue-500"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
          <div className="flex gap-2">
            <button 
              disabled={isLoading}
              onClick={generateProgram}
              className={`flex-1 bg-blue-600 text-white p-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'}`}
            >
              {isLoading ? 'Генерация...' : 'Сгенерировать темы'}
            </button>
            <button onClick={() => setIsOpen(false)} className="bg-slate-100 text-slate-600 px-3 py-2 rounded-lg text-sm font-bold hover:bg-slate-200">Отмена</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GeminiAssistant;
