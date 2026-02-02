import React, { useState, useEffect } from 'react';
import { getUsers, createUser, updateUser, deleteUser } from '../api';

function Admin() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    email: '',
    full_name: '',
    position: '',
    department: ''
  });
  const [error, setError] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await getUsers();
      setUsers(response.data);
    } catch (error) {
      console.error('Ошибка загрузки пользователей:', error);
      alert('Ошибка загрузки пользователей');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (user = null) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        email: user.email,
        full_name: user.full_name,
        position: user.position || '',
        department: user.department || ''
      });
    } else {
      setEditingUser(null);
      setFormData({
        email: '',
        full_name: '',
        position: '',
        department: ''
      });
    }
    setError('');
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingUser(null);
    setFormData({
      email: '',
      full_name: '',
      position: '',
      department: ''
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (editingUser) {
        await updateUser(editingUser.id, {
          full_name: formData.full_name,
          position: formData.position,
          department: formData.department
        });
      } else {
        await createUser(formData);
      }
      
      await loadUsers();
      handleCloseModal();
    } catch (error) {
      setError(error.response?.data?.error || 'Ошибка сохранения');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Вы уверены, что хотите удалить этого пользователя?')) {
      return;
    }

    try {
      await deleteUser(id);
      await loadUsers();
    } catch (error) {
      alert(error.response?.data?.error || 'Ошибка удаления');
    }
  };

  if (loading) {
    return <div className="loading">Загрузка...</div>;
  }

  return (
    <div>
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2>Управление пользователями</h2>
          <button 
            className="button button-primary"
            onClick={() => handleOpenModal()}
          >
            Добавить пользователя
          </button>
        </div>

        <table className="table">
          <thead>
            <tr>
              <th>Email</th>
              <th>ФИО</th>
              <th>Должность</th>
              <th>Кафедра</th>
              <th>Роль</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td>{user.email}</td>
                <td>{user.full_name}</td>
                <td>{user.position}</td>
                <td>{user.department}</td>
                <td>
                  {user.is_admin ? (
                    <span style={{ color: '#f44336', fontWeight: 'bold' }}>Администратор</span>
                  ) : (
                    'Преподаватель'
                  )}
                </td>
                <td>
                  <button
                    className="button button-secondary"
                    onClick={() => handleOpenModal(user)}
                    style={{ marginRight: '5px', padding: '5px 10px', fontSize: '12px' }}
                  >
                    Редактировать
                  </button>
                  {!user.is_admin && (
                    <button
                      className="button button-danger"
                      onClick={() => handleDelete(user.id)}
                      style={{ padding: '5px 10px', fontSize: '12px' }}
                    >
                      Удалить
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingUser ? 'Редактирование пользователя' : 'Новый пользователь'}</h2>
              <button className="close-button" onClick={handleCloseModal}>×</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  className="input"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="example@ippolitovka.ru"
                  required
                  disabled={!!editingUser}
                />
                {!editingUser && (
                  <small style={{ color: '#666', display: 'block', marginTop: '5px' }}>
                    Должен заканчиваться на @ippolitovka.ru
                  </small>
                )}
              </div>

              <div className="form-group">
                <label>ФИО</label>
                <input
                  type="text"
                  className="input"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  placeholder="Иванов Иван Иванович"
                  required
                />
              </div>

              <div className="form-group">
                <label>Должность</label>
                <input
                  type="text"
                  className="input"
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  placeholder="Преподаватель"
                />
              </div>

              <div className="form-group">
                <label>Кафедра</label>
                <input
                  type="text"
                  className="input"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  placeholder="Кафедра информатики"
                />
              </div>

              {error && <div className="error" style={{ marginBottom: '15px' }}>{error}</div>}

              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button type="submit" className="button button-primary" style={{ flex: 1 }}>
                  {editingUser ? 'Сохранить' : 'Создать'}
                </button>
                <button 
                  type="button" 
                  className="button button-secondary" 
                  onClick={handleCloseModal}
                  style={{ flex: 1 }}
                >
                  Отмена
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Admin;
