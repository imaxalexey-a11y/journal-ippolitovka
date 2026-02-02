export enum UserRole {
  ADMIN = 'ADMIN',
  TEACHER = 'TEACHER'
}

export interface User {
  email: string;
  name: string;
  role: UserRole;
  position: string;
  department: string;
  lastLogin?: string;
}

export interface Student {
  id: string;
  name: string;
}

export enum AttendanceStatus {
  PRESENT = 'P',
  ABSENT = 'H', // Н - Не был
  LATE = 'O',   // О - Опоздал
  VALID = 'U',  // У - Уважительная
  EMPTY = ''
}

export interface AttendanceRecord {
  studentId: string;
  date: string; // ISO Date string YYYY-MM-DD
  status: AttendanceStatus;
}

export interface WorkProgramEntry {
  date: string; // ISO Date string YYYY-MM-DD
  topic: string;
  hours: number;
}

export interface AppState {
  currentUser: User | null;
  users: User[];
  students: Student[];
  attendance: Record<string, AttendanceStatus>; // key: studentId_date
  workProgram: Record<string, WorkProgramEntry>; // key: date
}