import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { Button } from './Button';
import { Pencil, Trash2, Plus, Save, X } from 'lucide-react';

interface AdminPanelProps {
  users: User[];
  onUpdateUser: (user: User) => void;
  onAddUser: (user: User) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ users, onUpdateUser, onAddUser }) => {
  const [editingEmail, setEditingEmail] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<User>>({});
  const [isAdding, setIsAdding] = useState(false);

  const startEdit = (user: User) => {
    setEditingEmail(user.email);
    setFormData({ ...user });
    setIsAdding(false);
  };

  const handleSave = () => {
    if (formData.email && formData.name) {
      if (isAdding) {
         onAddUser({
             email: formData.email,
             name: formData.name,
             role: formData.role || UserRole.TEACHER,
             position: formData.position || 'Преподаватель',
             department: formData.department || 'Общая'
         });
      } else {
         // eslint-disable-next-line @typescript-eslint/no-unused-vars
         const { lastLogin, ...rest } = formData; 
         // Ensure we pass a complete User object (merging with existing if strictly needed, 
         // but here formData should have everything from startEdit)
         if (editingEmail) {
            // Find original to keep other props if any
            const original = users.find(u => u.email === editingEmail);
            if (original) {
                onUpdateUser({ ...original, ...formData } as User);
            }
         }
      }
      setEditingEmail(null);
      setFormData({});
      setIsAdding(false);
    }
  };

  const startAdd = () => {
    setEditingEmail(null);
    setFormData({
        email: '',
        name: '',
        role: UserRole.TEACHER,
        position: '',
        department: ''
    });
    setIsAdding(true);
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800">Управление пользователями</h2>
        {!isAdding && (
            <Button onClick={startAdd} className="flex items-center gap-2">
                <Plus size={16} /> Добавить пользователя
            </Button>
        )}
      </div>

      {isAdding && (
          <div className="mb-6 p-4 bg-blue-50 rounded-md border border-blue-100">
              <h3 className="font-semibold mb-4">Новый пользователь</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="email"
                    placeholder="Email (@ippolitovka.ru)"
                    className="border p-2 rounded"
                    value={formData.email || ''}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                  />
                  <input
                    type="text"
                    placeholder="ФИО"
                    className="border p-2 rounded"
                    value={formData.name || ''}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                  />
                  <input
                    type="text"
                    placeholder="Должность"
                    className="border p-2 rounded"
                    value={formData.position || ''}
                    onChange={e => setFormData({...formData, position: e.target.value})}
                  />
                  <input
                    type="text"
                    placeholder="Кафедра"
                    className="border p-2 rounded"
                    value={formData.department || ''}
                    onChange={e => setFormData({...formData, department: e.target.value})}
                  />
                  <select 
                     className="border p-2 rounded"
                     value={formData.role}
                     onChange={e => setFormData({...formData, role: e.target.value as UserRole})}
                  >
                      <option value={UserRole.TEACHER}>Преподаватель</option>
                      <option value={UserRole.ADMIN}>Администратор</option>
                  </select>
              </div>
              <div className="mt-4 flex gap-2">
                  <Button onClick={handleSave}>Сохранить</Button>
                  <Button variant="ghost" onClick={() => setIsAdding(false)}>Отмена</Button>
              </div>
          </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50 text-gray-700 uppercase font-medium">
            <tr>
              <th className="p-3">Email</th>
              <th className="p-3">ФИО</th>
              <th className="p-3">Должность</th>
              <th className="p-3">Кафедра</th>
              <th className="p-3">Роль</th>
              <th className="p-3 text-right">Действия</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map((user) => (
              <tr key={user.email} className="hover:bg-gray-50">
                {editingEmail === user.email ? (
                  <>
                    <td className="p-3 text-gray-400">{user.email}</td>
                    <td className="p-3"><input className="border rounded p-1 w-full" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} /></td>
                    <td className="p-3"><input className="border rounded p-1 w-full" value={formData.position} onChange={(e) => setFormData({...formData, position: e.target.value})} /></td>
                    <td className="p-3"><input className="border rounded p-1 w-full" value={formData.department} onChange={(e) => setFormData({...formData, department: e.target.value})} /></td>
                    <td className="p-3">
                         <select className="border rounded p-1" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value as UserRole})}>
                            <option value={UserRole.TEACHER}>TEACHER</option>
                            <option value={UserRole.ADMIN}>ADMIN</option>
                         </select>
                    </td>
                    <td className="p-3 text-right flex justify-end gap-2">
                      <button onClick={handleSave} className="text-green-600 hover:text-green-800"><Save size={18} /></button>
                      <button onClick={() => setEditingEmail(null)} className="text-gray-500 hover:text-gray-700"><X size={18} /></button>
                    </td>
                  </>
                ) : (
                  <>
                    <td className="p-3 font-medium text-gray-900">{user.email}</td>
                    <td className="p-3">{user.name}</td>
                    <td className="p-3">{user.position}</td>
                    <td className="p-3">{user.department}</td>
                    <td className="p-3"><span className={`px-2 py-1 rounded text-xs ${user.role === UserRole.ADMIN ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>{user.role}</span></td>
                    <td className="p-3 text-right flex justify-end gap-2">
                       {/* Admin cannot edit their own email via this simplistic UI to prevent lockout */}
                      <button onClick={() => startEdit(user)} className="text-blue-600 hover:text-blue-800" title="Редактировать"><Pencil size={18} /></button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};