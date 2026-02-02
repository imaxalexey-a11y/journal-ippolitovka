import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import Login from './components/Login';
import Journal from './components/Journal';
import Groups from './components/Groups';
import Admin from './components/Admin';
import { getCurrentUser } from './api';
import './index.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('journal');

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await getCurrentUser();
      setUser(response.data);
    } catch (error) {
      console.error('Ошибка проверки авторизации:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  if (loading) {
    return <div className="loading">Загрузка...</div>;
  }

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <Router>
      <div>
        <div className="header">
          <h1>Журнал посещаемости</h1>
          <div className="user-info">
            <span>{user.full_name}</span>
            {user.position && <span style={{ fontSize: '12px', opacity: 0.9 }}>({user.position})</span>}
            <button 
              className="button button-secondary"
              onClick={handleLogout}
              style={{ marginLeft: '10px' }}
            >
              Выход
            </button>
          </div>
        </div>

        <div className="container">
          <div className="tabs">
            <Link to="/journal" className={`tab ${activeTab === 'journal' ? 'active' : ''}`} onClick={() => setActiveTab('journal')}>
              Журнал
            </Link>
            <Link to="/groups" className={`tab ${activeTab === 'groups' ? 'active' : ''}`} onClick={() => setActiveTab('groups')}>
              Группы
            </Link>
            {user.is_admin && (
              <Link to="/admin" className={`tab ${activeTab === 'admin' ? 'active' : ''}`} onClick={() => setActiveTab('admin')}>
                Администрирование
              </Link>
            )}
          </div>

          <Routes>
            <Route path="/" element={<Navigate to="/journal" />} />
            <Route path="/journal" element={<Journal />} />
            <Route path="/groups" element={<Groups />} />
            {user.is_admin && (
              <Route path="/admin" element={<Admin />} />
            )}
            <Route path="*" element={<Navigate to="/journal" />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
