
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
  decisionApplied?: number; // الدرجة المضافة بقرار (مثلاً 3 درجات لتصبح 50)
  finalResult?: number;
}

export interface AttendanceRecord {
  studentId: string;
  date: string; // ISO format YYYY-MM-DD
  type: 'absent' | 'excused'; // غائب أو مجاز
}

export interface Season {
  id: string;
  name: string;
  isActive: boolean;
  managerName?: string;
  subjects: Record<number, Subject[]>;
  sections: Record<number, string[]>;
  sectionAdvisors?: Record<number, Record<string, string>>; // gradeId -> { sectionName: teacherId }
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

export interface AppState {
  seasons: Season[];
  activeSeasonId: string | null;
  theme: ThemeType;
  themeConfig?: Record<ThemeType, ThemeSettings>;
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
    primary: '#2563eb', // Royal Blue
    bg: '#f8fafc',
    card: '#ffffff',
    text: '#1e293b',
    muted: '#64748b',
    border: '#e2e8f0'
  },
  nature: {
    primary: '#10b981', // Emerald Green
    bg: '#f0fdf4',
    card: '#ffffff',
    text: '#064e3b',
    muted: '#6b7280',
    border: '#dcfce7'
  },
  creative: {
    primary: '#8b5cf6', // Electric Violet
    bg: '#faf5ff',
    card: '#ffffff',
    text: '#4c1d95',
    muted: '#7c3aed',
    border: '#f3e8ff'
  },
  midnight: {
    primary: '#60a5fa', // Light Blue Accent
    bg: '#020617', // Rich Navy Black
    card: '#0f172a', // Slate 900
    text: '#f1f5f9',
    muted: '#94a3b8',
    border: '#1e293b'
  }
};
