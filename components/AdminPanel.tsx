
import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { StorageService } from '../services/storageService';
import { NotificationService } from '../services/notificationService';
import { UserPlus, Edit3, Trash2, Key, Search, Mail, Building2, UserCircle, X } from 'lucide-react';
import { ALLOWED_DOMAIN } from '../constants';

const AdminPanel: React.FC = () => {
  const [users, setUsers] = useState<User[]>(StorageService.getUsers());
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    position: '',
    department: '',
    role: UserRole.TEACHER,
    password: ''
  });

  const filteredUsers = users.filter(u => 
    u.fullName.toLowerCase().includes(search.toLowerCase()) || 
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email.endsWith(`@${ALLOWED_DOMAIN}`)) {
      alert(`Email должен быть в домене ${ALLOWED_DOMAIN}`);
      return;
    }

    let updatedUsers: User[];
    if (editingUser) {
      updatedUsers = users.map(u => u.id === editingUser.id ? { ...u, ...formData } : u);
    } else {
      const newUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        ...formData
      };
      updatedUsers = [...users, newUser];
      // Trigger Notification to Admin
      NotificationService.sendAdminNewUserNotification(newUser.email, newUser.fullName);
    }

    StorageService.saveUsers(updatedUsers);
    setUsers(updatedUsers);
    closeModal();
  };

  const openModal = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        fullName: user.fullName,
        email: user.email,
        position: user.position,
        department: user.department,
        role: user.role,
        password: user.password || ''
      });
    } else {
      setEditingUser(null);
      setFormData({
        fullName: '',
        email: '',
        position: '',
        department: '',
        role: UserRole.TEACHER,
        password: ''
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
  };

  const deleteUser = (id: string) => {
    if (window.confirm('Вы уверены, что хотите удалить этого пользователя?')) {
      const updated = users.filter(u => u.id !== id);
      StorageService.saveUsers(updated);
      setUsers(updated);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-slate-800">Управление персоналом</h2>
        <button 
          onClick={() => openModal()}
          className="flex items-center px-6 py-2.5 bg-indigo-900 hover:bg-indigo-800 text-white rounded-lg font-semibold transition-all shadow-lg transform active:scale-95"
        >
          <UserPlus className="w-5 h-5 mr-2" /> Добавить сотрудника
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-slate-50">
          <div className="relative">
            <Search className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Поиск по имени или почте..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="block w-full pl-10 pr-3 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition-all bg-white"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-xs font-bold text-slate-400 uppercase tracking-wider bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4">Сотрудник</th>
                <th className="px-6 py-4">Должность / Кафедра</th>
                <th className="px-6 py-4">Роль</th>
                <th className="px-6 py-4 text-right">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map(user => (
                <tr key={user.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 mr-3">
                        <UserCircle className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-800">{user.fullName}</div>
                        <div className="text-xs text-slate-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-slate-600 font-medium">{user.position}</div>
                    <div className="text-xs text-slate-400">{user.department}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                      user.role === UserRole.ADMIN ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button 
                        onClick={() => openModal(user)}
                        className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"
                      >
                        <Edit3 className="w-5 h-5" />
                      </button>
                      {user.email !== 'it_admin@ippolitovka.ru' && (
                        <button 
                          onClick={() => deleteUser(user.id)}
                          className="p-2 text-slate-400 hover:text-rose-500 transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="bg-indigo-900 px-6 py-4 flex items-center justify-between text-white">
              <h3 className="font-bold">{editingUser ? 'Редактировать сотрудника' : 'Новый сотрудник'}</h3>
              <button onClick={closeModal}><X className="w-6 h-6" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">ФИО</label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Иванов Иван Иванович"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="example@ippolitovka.ru"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Пароль (код)</label>
                  <input
                    type="text"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Секретный код"
                  />
                </div>
              </div>
              <div className="pt-4 flex justify-end space-x-3">
                <button type="button" onClick={closeModal} className="px-4 py-2 text-slate-500 font-bold">Отмена</button>
                <button type="submit" className="px-6 py-2 bg-indigo-900 text-white rounded-lg font-bold shadow-lg">
                  {editingUser ? 'Обновить' : 'Создать'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
