import React, { useState, useEffect } from 'react';
import { getGroups, createGroup, updateGroup, deleteGroup } from '../api';

function Groups() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [groupName, setGroupName] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    try {
      const response = await getGroups();
      setGroups(response.data);
    } catch (error) {
      console.error('Ошибка загрузки групп:', error);
      alert('Ошибка загрузки групп');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (group = null) => {
    if (group) {
      setEditingGroup(group);
      setGroupName(group.name);
    } else {
      setEditingGroup(null);
      setGroupName('');
    }
    setError('');
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingGroup(null);
    setGroupName('');
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!groupName.trim()) {
      setError('Введите название группы');
      return;
    }

    try {
      if (editingGroup) {
        await updateGroup(editingGroup.id, groupName);
      } else {
        await createGroup(groupName);
      }
      
      await loadGroups();
      handleCloseModal();
    } catch (error) {
      setError(error.response?.data?.error || 'Ошибка сохранения');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Вы уверены? Будут удалены все студенты и журналы этой группы!')) {
      return;
    }

    try {
      await deleteGroup(id);
      await loadGroups();
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
          <h2>Управление группами</h2>
          <button 
            className="button button-primary"
            onClick={() => handleOpenModal()}
          >
            Добавить группу
          </button>
        </div>

        {groups.length === 0 ? (
          <p style={{ color: '#666', textAlign: 'center', padding: '20px' }}>
            Нет созданных групп. Создайте первую группу.
          </p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Название группы</th>
                <th>Дата создания</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {groups.map(group => (
                <tr key={group.id}>
                  <td>{group.name}</td>
                  <td>{new Date(group.created_at).toLocaleDateString('ru-RU')}</td>
                  <td>
                    <button
                      className="button button-secondary"
                      onClick={() => handleOpenModal(group)}
                      style={{ marginRight: '5px', padding: '5px 10px', fontSize: '12px' }}
                    >
                      Редактировать
                    </button>
                    <button
                      className="button button-danger"
                      onClick={() => handleDelete(group.id)}
                      style={{ padding: '5px 10px', fontSize: '12px' }}
                    >
                      Удалить
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingGroup ? 'Редактирование группы' : 'Новая группа'}</h2>
              <button className="close-button" onClick={handleCloseModal}>×</button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Название группы</label>
                <input
                  type="text"
                  className="input"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="Например: ИТ-21"
                  required
                  autoFocus
                />
              </div>

              {error && <div className="error" style={{ marginBottom: '15px' }}>{error}</div>}

              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button type="submit" className="button button-primary" style={{ flex: 1 }}>
                  {editingGroup ? 'Сохранить' : 'Создать'}
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

export default Groups;
