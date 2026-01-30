
import { JournalData } from '../types';
// MONTHS is exported from constants.ts, not types.ts
import { MONTHS } from '../constants';

export const ExportService = {
  exportToCSV: (journal: JournalData) => {
    let csvContent = "data:text/csv;charset=utf-8,\uFEFF"; // Add BOM for Excel UTF-8 support
    
    // Header for Attendance
    csvContent += `Журнал посещаемости - ${MONTHS[journal.month]} ${journal.year}\n`;
    const daysInMonth = new Date(journal.year, journal.month + 1, 0).getDate();
    
    let attendanceHeader = "Студент/Число";
    for (let i = 1; i <= daysInMonth; i++) attendanceHeader += `,${i}`;
    csvContent += attendanceHeader + "\n";

    journal.attendance.forEach(record => {
      let row = `"${record.studentName}"`;
      for (let i = 1; i <= daysInMonth; i++) {
        const val = record.days[i] || "";
        row += `,${val === 'p' ? 'Я' : val === 'a' ? 'Н' : ''}`; // Я=Явка, Н=Нет
      }
      csvContent += row + "\n";
    });

    csvContent += "\n\n";

    // Header for Work Programs
    csvContent += "Рабочая программа\n";
    csvContent += "Дата,Тема,Описание,Примечания\n";

    const sortedEntries = [...journal.workProgramEntries].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    sortedEntries.forEach(entry => {
      const dateStr = new Date(entry.date).toLocaleDateString('ru-RU');
      csvContent += `"${dateStr}","${entry.topic.replace(/"/g, '""')}","${entry.description.replace(/"/g, '""')}","${entry.notes.replace(/"/g, '""')}"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `journal_${journal.year}_${journal.month + 1}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};