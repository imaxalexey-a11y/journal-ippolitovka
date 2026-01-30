
import React, { useState } from 'react';
import { GoogleGenAI, Type } from '@google/genai';

interface GeminiAssistantProps {
  yearMonth: string;
  onGenerated: (updates: { [day: number]: { topic: string, notes: string } }) => void;
}

const GeminiAssistant: React.FC<GeminiAssistantProps> = ({ yearMonth, onGenerated }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [subject, setSubject] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const generateProgram = async () => {
    if (!subject.trim()) return;
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Составь план учебных занятий на месяц для предмета "${subject}". 
        Для каждого дня месяца (с 1 по 30/31) придумай тему занятия. 
        Учти, что в выходные занятий обычно нет, но план должен быть на каждый рабочий день.
        Верни результат строго в формате JSON.`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                day: { type: Type.INTEGER },
                topic: { type: Type.STRING },
                notes: { type: Type.STRING }
              },
              required: ['day', 'topic']
            }
          }
        }
      });

      const data = JSON.parse(response.text);
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
      console.error('Error calling Gemini API:', error);
      alert('Ошибка при генерации плана. Попробуйте еще раз.');
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
          <p className="text-xs text-slate-500 mb-4">Gemini поможет составить список тем для ваших занятий на текущий месяц.</p>
          
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
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Генерация...
                </>
              ) : 'Сгенерировать темы'}
            </button>
            <button 
              onClick={() => setIsOpen(false)}
              className="bg-slate-100 text-slate-600 px-3 py-2 rounded-lg text-sm font-bold hover:bg-slate-200"
            >
              Отмена
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GeminiAssistant;
