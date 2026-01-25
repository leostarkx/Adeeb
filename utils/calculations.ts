
import { GradeRecord } from '../types';

export const calculateGrades = (record: Partial<GradeRecord>): Partial<GradeRecord> => {
  const updated = { ...record };

  // وظيفة مساعدة للتقريب لأقرب عدد صحيح
  const round = (val?: number) => val !== undefined ? Math.round(val) : undefined;

  // معدل النصف الأول (بدون تقريب للحفاظ على الدقة في المراحل الوسيطة)
  const firstHalfMonths = [updated.october, updated.november, updated.december].filter(v => v !== undefined && v !== null);
  if (firstHalfMonths.length > 0) {
    updated.firstHalfAvg = firstHalfMonths.reduce((a, b) => (a || 0) + (b || 0), 0)! / firstHalfMonths.length;
  }

  // معدل النصف الثاني
  const secondHalfMonths = [updated.february, updated.march, updated.april].filter(v => v !== undefined && v !== null);
  if (secondHalfMonths.length > 0) {
    updated.secondHalfAvg = secondHalfMonths.reduce((a, b) => (a || 0) + (b || 0), 0)! / secondHalfMonths.length;
  }

  // السعي السنوي (يُقرب عادة في السجلات)
  if (updated.firstHalfAvg !== undefined && updated.midYearExam !== undefined && updated.secondHalfAvg !== undefined) {
    updated.annualEffort = round((updated.firstHalfAvg + updated.midYearExam + updated.secondHalfAvg) / 3);
  }

  // حساب الدرجة النهائية والنتيجة
  if (updated.annualEffort !== undefined) {
    // الدرجة النهائية (للدور الأول)
    if (updated.finalExam !== undefined) {
      updated.finalGrade = round((updated.annualEffort + updated.finalExam) / 2);
    }

    // إذا وجد دور ثاني، تحسب النتيجة بناءً عليه
    if (updated.secondRound !== undefined) {
      // النتيجة النهائية = (السعي السنوي + درجة الدور الثاني) / 2
      updated.finalResult = round((updated.annualEffort + updated.secondRound) / 2);
    } else {
      // إذا لم يوجد دور ثاني، النتيجة هي درجة الدور الأول
      updated.finalResult = updated.finalGrade;
    }
  }

  return updated;
};

// تنسيق العرض: إظهار الرقم بدون مراتب عشرية إذا كان عدداً صحيحاً
export const formatGrade = (val?: number) => (val !== undefined ? Math.round(val).toString() : '-');
