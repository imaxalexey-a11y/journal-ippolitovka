
import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';

interface AdminPanelProps {
  adminEmail: string;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ adminEmail }) => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [editingUser, setEditingUser] = useState<Partial<UserProfile> | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchUsers = async () => {
    const res = await fetch(`/api/admin/users?requesterEmail=${adminEmail}`);
    if (res.ok) setUsers(await res.json());
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ requesterEmail: adminEmail, user: editingUser })
    });
    if (res.ok) {
      setEditingUser(null);
      fetchUsers();
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Удалить пользователя?')) return;
    const res = await fetch(`/api/admin/users/${id}?requesterEmail=${adminEmail}`, { method: 'DELETE' });
    if (res.ok) fetchUsers();
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-black text-slate-900">Управление пользователями</h2>
        <button 
          onClick={() => setEditingUser({ role: 'teacher', email: '@ippolitovka.ru' })}
          className="bg-blue-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-blue-700 transition-all"
        >
          Добавить пользователя
        </button>
      </div>

      <div className="grid gap-4">
        {users.map(u => (
          <div key={u.id} className="bg-white p-4 rounded-2xl border border-slate-200 flex justify-between items-center shadow-sm">
            <div>
              <div className="font-bold text-slate-800">{u.fullName || 'Без имени'}</div>
              <div className="text-sm text-slate-500">{u.email} — {u.position} ({u.department})</div>
              <div className={`text-[10px] font-bold uppercase mt-1 ${u.role === 'admin' ? 'text-purple-600' : 'text-blue-600'}`}>
                {u.role}
              </div>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => setEditingUser(u)}
                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
              >
                Редактировать
              </button>
              {u.email !== adminEmail && (
                <button 
                  onClick={() => handleDelete(u.id)}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                >
                  Удалить
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {editingUser && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleSave} className="bg-white p-8 rounded-3xl w-full max-w-lg shadow-2xl space-y-4">
            <h3 className="text-xl font-bold mb-4">{editingUser.id ? 'Редактирование' : 'Новый пользователь'}</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <input 
                placeholder="ФИО" 
                className="p-3 bg-slate-50 border border-slate-200 rounded-xl"
                value={editingUser.fullName || ''}
                onChange={e => setEditingUser({...editingUser, fullName: e.target.value})}
              />
              <input 
                placeholder="Email" 
                className="p-3 bg-slate-50 border border-slate-200 rounded-xl"
                value={editingUser.email || ''}
                onChange={e => setEditingUser({...editingUser, email: e.target.value})}
              />
              <input 
                placeholder="Должность" 
                className="p-3 bg-slate-50 border border-slate-200 rounded-xl"
                value={editingUser.position || ''}
                onChange={e => setEditingUser({...editingUser, position: e.target.value})}
              />
              <input 
                placeholder="Кафедра" 
                className="p-3 bg-slate-50 border border-slate-200 rounded-xl"
                value={editingUser.department || ''}
                onChange={e => setEditingUser({...editingUser, department: e.target.value})}
              />
            </div>
            
            <div className="flex gap-4 pt-4">
              <button 
                type="submit" 
                disabled={loading}
                className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-all"
              >
                Сохранить
              </button>
              <button 
                type="button" 
                onClick={() => setEditingUser(null)}
                className="flex-1 bg-slate-100 text-slate-600 py-3 rounded-xl font-bold hover:bg-slate-200 transition-all"
              >
                Отмена
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
