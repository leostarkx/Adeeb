
import { GradeRecord } from '../types';

export const calculateGrades = (record: Partial<GradeRecord>): Partial<GradeRecord> => {
  const updated = { ...record };

  // معدل النصف الأول
  const firstHalfMonths = [updated.october, updated.november, updated.december].filter(v => v !== undefined && v !== null);
  if (firstHalfMonths.length > 0) {
    updated.firstHalfAvg = firstHalfMonths.reduce((a, b) => (a || 0) + (b || 0), 0)! / firstHalfMonths.length;
  }

  // معدل النصف الثاني
  const secondHalfMonths = [updated.february, updated.march, updated.april].filter(v => v !== undefined && v !== null);
  if (secondHalfMonths.length > 0) {
    updated.secondHalfAvg = secondHalfMonths.reduce((a, b) => (a || 0) + (b || 0), 0)! / secondHalfMonths.length;
  }

  // السعي السنوي
  if (updated.firstHalfAvg !== undefined && updated.midYearExam !== undefined && updated.secondHalfAvg !== undefined) {
    updated.annualEffort = (updated.firstHalfAvg + updated.midYearExam + updated.secondHalfAvg) / 3;
  }

  // حساب الدرجة النهائية والنتيجة
  if (updated.annualEffort !== undefined) {
    // الدرجة النهائية للدور الأول
    if (updated.finalExam !== undefined) {
      updated.finalGrade = (updated.annualEffort + updated.finalExam) / 2;
    }

    // إذا وجد دور ثاني، تحل درجته محل النهائي في حساب النتيجة الأخيرة
    if (updated.secondRound !== undefined) {
      // النتيجة النهائية = (السعي السنوي + درجة الدور الثاني) / 2
      const secondRoundResult = (updated.annualEffort + updated.secondRound) / 2;
      updated.finalResult = secondRoundResult;
    } else {
      // إذا لم يوجد دور ثاني، النتيجة هي درجة الدور الأول
      updated.finalResult = updated.finalGrade;
    }
  }

  return updated;
};

export const formatGrade = (val?: number) => (val !== undefined ? val.toFixed(1) : '-');
