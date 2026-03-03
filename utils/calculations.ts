
import { GradeRecord } from '../types';

export const numberToArabicWords = (num: number): string => {
  if (num === 0) return 'صفر';
  
  const units = ['', 'واحد', 'اثنان', 'ثلاثة', 'أربعة', 'خمسة', 'ستة', 'سبعة', 'ثمانية', 'تسعة'];
  const teens = ['عشرة', 'أحد عشر', 'اثنا عشر', 'ثلاثة عشر', 'أربعة عشر', 'خمسة عشر', 'ستة عشر', 'سبعة عشر', 'ثمانية عشر', 'تسعة عشر'];
  const tens = ['', '', 'عشرون', 'ثلاثون', 'أربعون', 'خمسون', 'ستون', 'سبعون', 'ثمانون', 'تسعون'];
  const hundreds = ['', 'مئة', 'مئتان', 'ثلاثمئة', 'أرعمئة', 'خمسمئة', 'ستمئة', 'سبعمئة', 'ثمنمئة', 'تسعمئة'];

  let words = '';

  if (num >= 100) {
    words += hundreds[Math.floor(num / 100)] + ' ';
    num %= 100;
  }

  if (num > 0) {
    if (words !== '') words += 'و ';
    if (num < 10) words += units[num];
    else if (num < 20) words += teens[num - 10];
    else {
      const unit = num % 10;
      const ten = Math.floor(num / 10);
      if (unit === 0) words += tens[ten];
      else words += units[unit] + ' و' + tens[ten];
    }
  }

  return words.trim();
};

export const calculateGrades = (record: Partial<GradeRecord>, isPrimary: boolean): Partial<GradeRecord> => {
  const updated = { ...record };
  const round = (val?: number) => val !== undefined ? Math.round(val) : undefined;

  // إذا كان الطالب في الصفوف 1-4، الدرجة هي نفسها المدخلة ولا توجد معادلات فصلية
  if (isPrimary) {
    return updated;
  }

  // لطلاب الصف 5-6، نطبق معادلات السعي السنوي
  const firstHalfMonths = [updated.october, updated.november, updated.december].filter(v => v !== undefined && v !== null);
  if (firstHalfMonths.length > 0) {
    updated.firstHalfAvg = firstHalfMonths.reduce((a, b) => (a || 0) + (b || 0), 0)! / firstHalfMonths.length;
  }

  const secondHalfMonths = [updated.february, updated.march, updated.april].filter(v => v !== undefined && v !== null);
  if (secondHalfMonths.length > 0) {
    updated.secondHalfAvg = secondHalfMonths.reduce((a, b) => (a || 0) + (b || 0), 0)! / secondHalfMonths.length;
  }

  if (updated.firstHalfAvg !== undefined && updated.midYearExam !== undefined && updated.secondHalfAvg !== undefined) {
    updated.annualEffort = round((updated.firstHalfAvg + updated.midYearExam + updated.secondHalfAvg) / 3);
  }

  if (updated.annualEffort !== undefined) {
    if (updated.finalExam !== undefined) {
      updated.finalGrade = round((updated.annualEffort + updated.finalExam) / 2);
    }
    
    // الدور الثاني يحل محل الامتحان النهائي في الحساب
    let baseResult = updated.finalGrade;
    if (updated.secondRound !== undefined) {
      baseResult = round((updated.annualEffort + updated.secondRound) / 2);
    }

    // تطبيق درجة القرار إذا وجدت
    if (baseResult !== undefined && updated.decisionApplied !== undefined) {
      updated.finalResult = baseResult + updated.decisionApplied;
    } else {
      updated.finalResult = baseResult;
    }
  }

  return updated;
};

export const toArabicNums = (num: number | string | undefined | null): string => {
  if (num === undefined || num === null) return '';
  const str = num.toString();
  return str.replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[parseInt(d)]);
};

export const formatGrade = (val?: number) => {
  if (val === undefined || val === null || isNaN(val)) return '-';
  return toArabicNums(Math.round(val));
};

export const getPrimaryResult = (grades: (number | undefined)[], isPrimary: boolean) => {
  const validGrades = grades.filter(g => g !== undefined && g !== null) as number[];
  if (validGrades.length === 0) return { status: 'غير مكتمل', failedCount: 0 };
  
  const passMark = isPrimary ? 5 : 50;
  const failedCount = validGrades.filter(g => g < passMark).length;
  
  if (failedCount >= 3) return { status: 'راسب', failedCount };
  if (failedCount > 0) return { status: 'مكمل', failedCount };
  return { status: 'ناجح', failedCount: 0 };
};
