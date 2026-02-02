import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || '/api';

// Создаем экземпляр axios с настройками
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Добавляем токен к каждому запросу
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Обработка ошибок
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const sendAuthCode = (email) => api.post('/auth/send-code', { email });
export const verifyCode = (email, code) => api.post('/auth/verify-code', { email, code });
export const getCurrentUser = () => api.get('/auth/me');

// Users (Admin)
export const getUsers = () => api.get('/users');
export const createUser = (userData) => api.post('/users', userData);
export const updateUser = (id, userData) => api.put(`/users/${id}`, userData);
export const deleteUser = (id) => api.delete(`/users/${id}`);

// Groups
export const getGroups = () => api.get('/groups');
export const createGroup = (name) => api.post('/groups', { name });
export const updateGroup = (id, name) => api.put(`/groups/${id}`, { name });
export const deleteGroup = (id) => api.delete(`/groups/${id}`);

// Students
export const getStudents = (groupId) => api.get(`/groups/${groupId}/students`);
export const createStudent = (groupId, studentData) => 
  api.post(`/groups/${groupId}/students`, studentData);
export const updateStudent = (id, studentData) => api.put(`/students/${id}`, studentData);
export const deleteStudent = (id) => api.delete(`/students/${id}`);

// Journals
export const getJournals = () => api.get('/journals');
export const getOrCreateJournal = (groupId, month, year) => 
  api.post('/journals', { group_id: groupId, month, year });

// Attendance
export const updateAttendance = (attendanceData) => api.post('/attendance', attendanceData);

// Programs
export const updateProgram = (programData) => api.post('/programs', programData);

export default api;
