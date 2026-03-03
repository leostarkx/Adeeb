
export interface Subject {
  id: string;
  name: string;
}

export interface TeacherAssignment {
  gradeId: number;
  sectionName: string;
  subjectId: string;
}

export interface Teacher {
  id: string;
  name: string;
  specialization?: string;
  phone?: string;
  assignments: TeacherAssignment[];
}

export interface Student {
  id: string;
  name: string;
  grade: number;
  section: string;
  status?: 'active' | 'dismissed' | 'transferred';
  birthDate?: string;
  parentPhone?: string;
  address?: string;
  parentJob?: string;
  registerNumber?: string;
  pageNumber?: string;
  recordNumber?: string;
}

export interface Graduate {
  id: string;
  name: string;
  registerNumber?: string;
  seasonName: string;
  graduationYear: string;
}

export interface GradeRecord {
  studentId: string;
  subjectId: string;
  october?: number;
  november?: number;
  december?: number;
  firstHalfAvg?: number;
  midYearExam?: number;
  february?: number;
  march?: number;
  april?: number;
  secondHalfAvg?: number;
  annualEffort?: number;
  finalExam?: number;
  finalGrade?: number;
  secondRound?: number;
  decisionApplied?: number;
  finalResult?: number;
}

export interface AttendanceRecord {
  studentId: string;
  date: string;
  type: 'absent' | 'excused';
}

export interface Season {
  id: string;
  name: string;
  isActive: boolean;
  managerName?: string;
  subjects: Record<number, Subject[]>;
  sections: Record<number, string[]>;
  sectionAdvisors?: Record<number, Record<string, string>>;
  teachers: Teacher[];
  students: Student[];
  grades: GradeRecord[];
  attendance: AttendanceRecord[];
  holidays: string[];
  minBirthYear?: number;
  maxBirthYear?: number;
}

export type ThemeType = 'classic' | 'nature' | 'creative' | 'midnight';

export interface ThemeSettings {
  primary: string;
  bg: string;
  card: string;
  text: string;
  muted: string;
  border: string;
}

export interface GoogleDriveConfig {
  isConnected: boolean;
  lastSync?: string;
  autoSync: boolean;
  fileName: string;
}

export type UserRole = 'principal' | 'assistant' | 'teacher' | 'student';

export interface User {
  id: string;
  username: string;
  password?: string; // In a real app, this would be hashed
  name: string;
  role: UserRole;
  linkedId?: string; // Teacher ID or Student ID
  permissions?: string[]; // For assistants: ['dashboard', 'attendance', etc.]
}

export interface AppState {
  schoolName: string;
  seasons: Season[];
  graduates: Graduate[];
  activeSeasonId: string | null;
  theme: ThemeType;
  themeConfig?: Record<ThemeType, ThemeSettings>;
  driveConfig?: GoogleDriveConfig;
  users: User[];
  currentUser: User | null;
}

export const GRADE_NAMES: Record<number, string> = {
  1: "الأول",
  2: "الثاني",
  3: "الثالث",
  4: "الرابع",
  5: "الخامس",
  6: "السادس"
};

export const DEFAULT_THEMES: Record<ThemeType, ThemeSettings> = {
  classic: {
    primary: '#1d4ed8',
    bg: '#f8fafc',
    card: '#ffffff',
    text: '#0f172a',
    muted: '#64748b',
    border: '#e2e8f0'
  },
  nature: {
    primary: '#059669',
    bg: '#f0fdf4',
    card: '#ffffff',
    text: '#064e3b',
    muted: '#4b5563',
    border: '#dcfce7'
  },
  creative: {
    primary: '#7c3aed',
    bg: '#faf5ff',
    card: '#ffffff',
    text: '#4c1d95',
    muted: '#6b7280',
    border: '#f3e8ff'
  },
  midnight: {
    primary: '#38bdf8',
    bg: '#0f172a',
    card: '#1e293b',
    text: '#f8fafc',
    muted: '#94a3b8',
    border: '#334155'
  }
};
