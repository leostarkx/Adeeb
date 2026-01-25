
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
  assignments: TeacherAssignment[];
}

export interface Student {
  id: string;
  name: string;
  grade: number;
  section: string;
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
  finalResult?: number;
}

export interface Season {
  id: string;
  name: string;
  isActive: boolean;
  subjects: Record<number, Subject[]>;
  sections: Record<number, string[]>; // Grade -> List of Section Names
  teachers: Teacher[];
  students: Student[];
  grades: GradeRecord[];
}

export interface AppState {
  seasons: Season[];
  activeSeasonId: string | null;
}

export const GRADE_NAMES: Record<number, string> = {
  1: "الأول",
  2: "الثاني",
  3: "الثالث",
  4: "الرابع",
  5: "الخامس",
  6: "السادس"
};
