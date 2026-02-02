import React, { useState, useEffect } from 'react';
import {
  getGroups,
  getOrCreateJournal,
  getStudents,
  createStudent,
  updateStudent,
  deleteStudent,
  updateAttendance,
  updateProgram,
} from '../api';

const MONTHS = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
];

const ATTENDANCE_STATUS = {
  '': 'Не отмечено',
  'present': 'Присутствует',
  'absent': 'Отсутствует',
  'late': 'Опоздал',
  'excused': 'Уважительная'
};

function Journal() {
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  
  const [journal, setJournal] = useState(null);
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [programs, setPrograms] = useState({});
  
  const [loading, setLoading] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [newStudentName, setNewStudentName] = useState('');
  
  const [daysInMonth, setDaysInMonth] = useState(31);

  useEffect(() => {
    loadGroups();
  }, []);

  useEffect(() => {
    const days = new Date(selectedYear, selectedMonth, 0).getDate();
    setDaysInMonth(days);
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    if (selectedGroup) {
      loadJournal();
    }
  }, [selectedGroup, selectedMonth, selectedYear]);

  const loadGroups = async () => {
    try {
      const response = await getGroups();
      setGroups(response.data);
    } catch (error) {
      console.error('Ошибка загрузки групп:', error);
    }
  };

  const loadJournal = async () => {
    setLoading(true);
    try {
      const response = await getOrCreateJournal(selectedGroup, selectedMonth, selectedYear);
      setJournal(response.data.journal);
      setStudents(response.data.students);
      
      // Преобразуем массив посещаемости в объект для быстрого доступа
      const attendanceMap = {};
      response.data.attendance.forEach(record => {
        const key = `${record.student_id}_${record.day}`;
        attendanceMap[key] = record;
      });
      setAttendance(attendanceMap);
      
      // Преобразуем рабочие программы
      const programsMap = {};
      response.data.programs.forEach(program => {
        programsMap[program.day] = program;
      });
      setPrograms(programsMap);
    } catch (error) {
      console.error('Ошибка загрузки журнала:', error);
      alert('Ошибка загрузки журнала');
    } finally {
      setLoading(false);
    }
  };

  const handleAttendanceChange = async (studentId, day, status) => {
    try {
      await updateAttendance({
        journal_id: journal.id,
        student_id: studentId,
        day: day,
        status: status,
        note: ''
      });
      
      // Обновляем локальное состояние
      const key = `${studentId}_${day}`;
      setAttendance(prev => ({
        ...prev,
        [key]: { ...prev[key], status }
      }));
    } catch (error) {
      console.error('Ошибка обновления посещаемости:', error);
      alert('Ошибка обновления посещаемости');
    }
  };

  const handleProgramChange = async (day, field, value) => {
    try {
      const currentProgram = programs[day] || {};
      const updatedProgram = {
        journal_id: journal.id,
        day: day,
        topic: field === 'topic' ? value : (currentProgram.topic || ''),
        homework: field === 'homework' ? value : (currentProgram.homework || '')
      };
      
      await updateProgram(updatedProgram);
      
      setPrograms(prev => ({
        ...prev,
        [day]: updatedProgram
      }));
    } catch (error) {
      console.error('Ошибка обновления программы:', error);
      alert('Ошибка обновления программы');
    }
  };

  const handleAddStudent = async () => {
    if (!newStudentName.trim()) return;
    
    try {
      const response = await createStudent(selectedGroup, {
        full_name: newStudentName,
        order_index: students.length
      });
      setStudents([...students, response.data]);
      setNewStudentName('');
    } catch (error) {
      console.error('Ошибка добавления студента:', error);
      alert('Ошибка добавления студента');
    }
  };

  const handleUpdateStudent = async (id, newName) => {
    try {
      await updateStudent(id, { full_name: newName, order_index: 0 });
      setStudents(students.map(s => s.id === id ? { ...s, full_name: newName } : s));
      setEditingStudent(null);
    } catch (error) {
      console.error('Ошибка обновления студента:', error);
      alert('Ошибка обновления студента');
    }
  };

  const handleDeleteStudent = async (id) => {
    if (!window.confirm('Удалить студента?')) return;
    
    try {
      await deleteStudent(id);
      setStudents(students.filter(s => s.id !== id));
    } catch (error) {
      console.error('Ошибка удаления студента:', error);
      alert('Ошибка удаления студента');
    }
  };

  const getAttendanceStatus = (studentId, day) => {
    const key = `${studentId}_${day}`;
    return attendance[key]?.status || '';
  };

  const getStatusClass = (status) => {
    return `status-${status || 'none'}`;
  };

  return (
    <div>
      <div className="card">
        <h2 style={{ marginBottom: '20px' }}>Журнал посещаемости</h2>
        
        <div className="select-controls">
          <select 
            value={selectedGroup} 
            onChange={(e) => setSelectedGroup(e.target.value)}
            className="input"
            style={{ flex: 1 }}
          >
            <option value="">Выберите группу</option>
            {groups.map(group => (
              <option key={group.id} value={group.id}>{group.name}</option>
            ))}
          </select>
          
          <select 
            value={selectedMonth} 
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="input"
            style={{ flex: 1 }}
          >
            {MONTHS.map((month, index) => (
              <option key={index} value={index + 1}>{month}</option>
            ))}
          </select>
          
          <select 
            value={selectedYear} 
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="input"
            style={{ flex: 1 }}
          >
            {[2024, 2025, 2026, 2027].map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>

        {selectedGroup && !loading && (
          <div style={{ marginTop: '20px' }}>
            <div style={{ marginBottom: '10px', display: 'flex', gap: '10px' }}>
              <input
                type="text"
                className="input"
                placeholder="Фамилия И.О. студента"
                value={newStudentName}
                onChange={(e) => setNewStudentName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddStudent()}
                style={{ flex: 1 }}
              />
              <button 
                className="button button-primary"
                onClick={handleAddStudent}
              >
                Добавить студента
              </button>
            </div>
          </div>
        )}
      </div>

      {loading && <div className="loading">Загрузка...</div>}

      {selectedGroup && journal && !loading && (
        <div className="card" style={{ overflowX: 'auto' }}>
          <table className="journal-table">
            <thead>
              <tr>
                <th className="student-name">Студент</th>
                {[...Array(daysInMonth)].map((_, i) => (
                  <th key={i + 1}>{i + 1}</th>
                ))}
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {students.map(student => (
                <tr key={student.id}>
                  <td className="student-name">
                    {editingStudent === student.id ? (
                      <input
                        type="text"
                        defaultValue={student.full_name}
                        onBlur={(e) => handleUpdateStudent(student.id, e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleUpdateStudent(student.id, e.target.value);
                          }
                        }}
                        autoFocus
                        style={{ width: '100%' }}
                      />
                    ) : (
                      <span onClick={() => setEditingStudent(student.id)} style={{ cursor: 'pointer' }}>
                        {student.full_name}
                      </span>
                    )}
                  </td>
                  {[...Array(daysInMonth)].map((_, i) => {
                    const day = i + 1;
                    const status = getAttendanceStatus(student.id, day);
                    return (
                      <td key={day} className={`attendance-cell ${getStatusClass(status)}`}>
                        <select
                          value={status}
                          onChange={(e) => handleAttendanceChange(student.id, day, e.target.value)}
                          className="attendance-select"
                        >
                          {Object.entries(ATTENDANCE_STATUS).map(([value, label]) => (
                            <option key={value} value={value}>
                              {value === '' ? '-' : label.charAt(0)}
                            </option>
                          ))}
                        </select>
                      </td>
                    );
                  })}
                  <td>
                    <button
                      className="button button-danger"
                      onClick={() => handleDeleteStudent(student.id)}
                      style={{ padding: '5px 10px', fontSize: '12px' }}
                    >
                      Удалить
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ marginTop: '30px' }}>
            <h3 style={{ marginBottom: '15px' }}>Рабочая программа по дням</h3>
            <table className="table">
              <thead>
                <tr>
                  <th style={{ width: '80px' }}>День</th>
                  <th>Тема занятия</th>
                  <th>Домашнее задание</th>
                </tr>
              </thead>
              <tbody>
                {[...Array(daysInMonth)].map((_, i) => {
                  const day = i + 1;
                  const program = programs[day] || {};
                  return (
                    <tr key={day}>
                      <td style={{ textAlign: 'center' }}>{day}</td>
                      <td>
                        <input
                          type="text"
                          className="input"
                          value={program.topic || ''}
                          onChange={(e) => handleProgramChange(day, 'topic', e.target.value)}
                          placeholder="Тема занятия"
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          className="input"
                          value={program.homework || ''}
                          onChange={(e) => handleProgramChange(day, 'homework', e.target.value)}
                          placeholder="Домашнее задание"
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
            <strong>Обозначения:</strong>
            <div style={{ marginTop: '10px', display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
              <span><span className="status-present" style={{ padding: '2px 8px' }}>П</span> - Присутствует</span>
              <span><span className="status-absent" style={{ padding: '2px 8px' }}>О</span> - Отсутствует</span>
              <span><span className="status-late" style={{ padding: '2px 8px' }}>Оп</span> - Опоздал</span>
              <span><span className="status-excused" style={{ padding: '2px 8px' }}>У</span> - Уважительная</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Journal;
