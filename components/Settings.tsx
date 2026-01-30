
import React, { useState } from 'react';
import { User, NotificationSettings } from '../types';
import { StorageService } from '../services/storageService';
import { Bell, Mail, Clock, Save, ShieldCheck } from 'lucide-react';

interface SettingsProps {
  user: User;
}

const Settings: React.FC<SettingsProps> = ({ user }) => {
  const [settings, setSettings] = useState<NotificationSettings>(
    user.notificationSettings || {
      emailAlerts: true,
      deadlineReminders: true,
      reminderDaysBefore: 2
    }
  );

  const handleSave = () => {
    const users = StorageService.getUsers();
    const updatedUser = { ...user, notificationSettings: settings };
    const updatedUsers = users.map(u => u.id === user.id ? updatedUser : u);
    StorageService.saveUsers(updatedUsers);
    StorageService.setCurrentUser(updatedUser);
    alert('Настройки уведомлений успешно сохранены!');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-indigo-900 px-6 py-6 text-white flex items-center space-x-4">
          <div className="p-3 bg-indigo-800 rounded-xl">
            <Bell className="w-8 h-8 text-amber-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Уведомления и Безопасность</h2>
            <p className="text-indigo-200 text-sm">Настройте оповещения по электронной почте</p>
          </div>
        </div>

        <div className="p-8 space-y-8">
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-white rounded-lg shadow-sm">
                  <Mail className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">Email оповещения</h4>
                  <p className="text-xs text-slate-500">Получать уведомления о системных событиях</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer"
                  checked={settings.emailAlerts}
                  onChange={e => setSettings({...settings, emailAlerts: e.target.checked})}
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
              <div className="flex items-center space-x-4">
                <div className="p-2 bg-white rounded-lg shadow-sm">
                  <Clock className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-800">Напоминания о дедлайнах</h4>
                  <p className="text-xs text-slate-500">Уведомлять о приближении сроков программ</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer"
                  checked={settings.deadlineReminders}
                  onChange={e => setSettings({...settings, deadlineReminders: e.target.checked})}
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>

            {settings.deadlineReminders && (
              <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100 animate-in zoom-in-95 duration-200">
                <label className="block text-xs font-bold text-indigo-900 uppercase mb-2">Напоминать за (дней):</label>
                <div className="flex items-center space-x-4">
                  <input 
                    type="range" 
                    min="1" 
                    max="7" 
                    value={settings.reminderDaysBefore}
                    onChange={e => setSettings({...settings, reminderDaysBefore: parseInt(e.target.value)})}
                    className="flex-1 accent-indigo-600 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="bg-white px-3 py-1 rounded-lg border border-indigo-200 font-bold text-indigo-700 min-w-[40px] text-center">
                    {settings.reminderDaysBefore}
                  </span>
                </div>
              </div>
            )}
          </div>

          <button 
            onClick={handleSave}
            className="w-full flex items-center justify-center px-6 py-3 bg-indigo-900 text-white rounded-xl font-bold shadow-lg hover:bg-indigo-800 transition-all transform active:scale-[0.98]"
          >
            <Save className="w-5 h-5 mr-2" /> Сохранить изменения
          </button>
        </div>

        <div className="bg-slate-50 p-6 border-t border-slate-100 flex items-start space-x-3">
          <ShieldCheck className="w-5 h-5 text-slate-400 mt-0.5" />
          <p className="text-xs text-slate-500 leading-relaxed">
            Ваши уведомления отправляются через защищенный почтовый сервер Ипполитовки (mail.ippolitovka.ru). 
            Убедитесь, что ваш адрес электронной почты активен.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Settings;
