
export type AttendanceStatus = 'present' | 'absent' | 'excused' | null;

export interface Student {
  id: string;
  fullName: string;
}

export interface DailyAttendance {
  [studentId: string]: AttendanceStatus;
}

export interface MonthlyAttendance {
  [day: number]: DailyAttendance;
}

export interface WorkProgramEntry {
  topic: string;
  notes: string;
}

export interface MonthlyWorkProgram {
  [day: number]: WorkProgramEntry;
}

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  position: string;
  department: string;
  role: 'admin' | 'teacher';
  password?: string; // Для возможности традиционного входа, если потребуется
}

export interface AppState {
  user: UserProfile | null;
  students: Student[];
  allStudentsHistory: Student[];
  attendance: {
    [yearMonth: string]: MonthlyAttendance;
  };
  workPrograms: {
    [yearMonth: string]: MonthlyWorkProgram;
  };
  visibleStudentIds: string[];
}
