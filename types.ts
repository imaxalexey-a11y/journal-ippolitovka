
export enum UserRole {
  ADMIN = 'ADMIN',
  TEACHER = 'TEACHER'
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  position: string;
  department: string;
  role: UserRole;
  password?: string;
  notificationSettings?: NotificationSettings;
}

export interface NotificationSettings {
  emailAlerts: boolean;
  deadlineReminders: boolean;
  reminderDaysBefore: number;
}

export interface AttendanceRecord {
  studentName: string;
  days: { [day: number]: 'p' | 'a' | '' }; // p=present, a=absent
}

export interface WorkProgramEntry {
  id: string;
  date: string; // ISO format
  topic: string;
  description: string;
  notes: string;
}

export interface JournalData {
  id: string;
  teacherId: string;
  month: number;
  year: number;
  attendance: AttendanceRecord[];
  workProgramEntries: WorkProgramEntry[]; // Replaces simple array
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
