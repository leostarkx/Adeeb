
import React, { useState, useMemo } from 'react';
import { Season, Student, GRADE_NAMES, Subject, GradeRecord, AttendanceRecord } from '../types';
import { formatGrade, numberToArabicWords, getPrimaryResult } from '../utils/calculations';
import { 
  Printer, ArrowRight, Search, LayoutGrid, User, ChevronRight, 
  CalendarDays, Medal, UserX, CalendarX, FileText, UserCheck, 
  Clock, Calendar as CalendarIcon, Gavel, Trophy
} from 'lucide-react';

interface Props {
  season: Season;
  schoolName: string;
}

const StudentReport: React.FC<Props> = ({ season, schoolName }) => {
  const [reportType, setReportType] = useState<'individual' | 'class' | 'absences'>('individual');
  const [reportPeriod, setReportPeriod] = useState<'midyear' | 'final'>('midyear');
  const [selectedGrade, setSelectedGrade] = useState<number>(1);
  const [selectedSection, setSelectedSection] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [isViewingClassReport, setIsViewingClassReport] = useState(false);
  
  const searchResults = useMemo(() => {
    if (searchTerm.length < 1) return [];
    return (season.students || []).filter(s => 
      s.name.includes(searchTerm) || 
      s.registerNumber?.includes(searchTerm)
    );
  }, [season.students, searchTerm]);

  const student = useMemo(() => 
    (season.students || []).find(s => s.id === selectedStudentId),
    [season.students, selectedStudentId]
  );

  const isPrimary = student ? student.grade <= 4 : selectedGrade <= 4;

  const currentGradeSubjects = useMemo(() => {
    return season.subjects?.[selectedGrade] || [];
  }, [season.subjects, selectedGrade]);

  const classStudents = useMemo(() => {
    if (reportType !== 'class' || !selectedSection) return [];
    return (season.students || [])
      .filter(s => s.grade === selectedGrade && s.section === selectedSection)
      .sort((a, b) => a.name.localeCompare(b.name, 'ar'));
  }, [season.students, selectedGrade, selectedSection, reportType]);

  const studentAttendanceRecords = useMemo(() => {
    if (!selectedStudentId) return [];
    return (season.attendance || [])
      .filter(a => a.studentId === selectedStudentId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [season.attendance, selectedStudentId]);

  const getStudentGrades = (studentObj: Student) => {
    const subjects = season.subjects?.[studentObj.grade] || [];
    return subjects.map(sub => {
      const grade = (season.grades || []).find(g => g.studentId === studentObj.id && g.subjectId === sub.id);
      return { subject: sub.name, subjectId: sub.id, ...grade };
    });
  };

  const getAdvisorName = (grade: number, section: string) => {
    const teacherId = season.sectionAdvisors?.[grade]?.[section];
    return season.teachers.find(t => t.id === teacherId)?.name || '........................';
  };

  const getArabicDayName = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('ar-IQ', { weekday: 'long' }).format(date);
  };

  const handlePrint = () => { window.print(); };

  if (reportType === 'class' && isViewingClassReport && selectedSection) {
    const stats = { total: 0, passed: 0, failed: 0, makeup: 0, dismissed: 0, dec: 0 };
    const subjects = currentGradeSubjects;

    return (
      <div className="space-y-6 animate-in fade-in pb-20">
        <div className="flex justify-between items-center bg-white p-5 rounded-3xl shadow-sm border border-gray-100 no-print">
          <button onClick={() => setIsViewingClassReport(false)} className="flex items-center gap-2 text-blue-600 font-black px-6 py-2 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors">
            <ArrowRight size={20} /> رجوع للتخصيص
          </button>
          <button onClick={handlePrint} className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-black shadow-lg flex items-center gap-2">
            <Printer size={20} /> طباعة السجل
          </button>
        </div>

        <div className="bg-white p-6 print:p-0 print:shadow-none shadow-xl rounded-[2rem] overflow-x-auto" dir="rtl">
          <div className="flex justify-between items-start mb-4 font-black text-[12px] text-slate-900 min-w-[800px]">
             <div className="text-right space-y-1">
                <p>جمهورية العراق</p>
                <p>{schoolName}</p>
             </div>
             <div className="text-center">
                <p className="text-lg">سجل درجات {isPrimary ? 'الصفوف الأولية' : 'الصفوف العليا'} المجمع</p>
                <p className="">({reportPeriod === 'midyear' ? 'نتائج نصف السنة' : 'النتائج النهائية'})</p>
                <p className="mt-1">العام الدراسي {season.name}</p>
             </div>
             <div className="text-right space-y-1">
                <p>الصف: {GRADE_NAMES[selectedGrade]}</p>
                <p>الشعبة: {selectedSection}</p>
             </div>
          </div>

          <table className="w-full text-center border-collapse border-[1.5px] border-black text-[10px] font-black text-slate-900 min-w-[800px]">
            <thead>
              <tr className="bg-gray-100">
                <th rowSpan={2} className="border border-black w-6">ت</th>
                <th rowSpan={2} className="border border-black min-w-[180px]">اسم التلميذ الرباعي واللقب</th>
                {subjects.map(s => <th key={s.id} rowSpan={2} className="border border-black vertical-text-header py-4 w-8">{s.name}</th>)}
                <th colSpan={2} className="border border-black">المجموع</th>
                <th rowSpan={2} className="border border-black w-16">الحالة</th>
              </tr>
              <tr className="bg-gray-100 text-[8px]">
                <th className="border border-black w-12">رقماً</th>
                <th className="border border-black">كتابةً</th>
              </tr>
            </thead>
            <tbody>
              {classStudents.map((s, idx) => {
                if (s.status === 'dismissed') {
                  stats.dismissed++;
                  return (
                    <tr key={s.id} className="h-8 bg-red-50">
                      <td className="border border-black">{idx + 1}</td>
                      <td className="border border-black text-right pr-2 text-red-700 line-through text-[9px]">{s.name} (مفصول)</td>
                      {subjects.map(sub => <td key={sub.id} className="border border-black">--</td>)}
                      <td className="border border-black">--</td>
                      <td className="border border-black">--</td>
                      <td className="border border-black text-red-600 font-bold">مفصول</td>
                    </tr>
                  );
                }

                stats.total++;
                const studentGrades = getStudentGrades(s);
                const relevantGradesArray = subjects.map(sub => {
                   const gr = studentGrades.find(g => g.subjectId === sub.id);
                   return reportPeriod === 'midyear' ? gr?.midYearExam : gr?.finalResult;
                });
                
                const total = relevantGradesArray.reduce((acc, g) => acc + (g || 0), 0);
                const result = getPrimaryResult(relevantGradesArray, isPrimary);
                
                const hasDecision = studentGrades.some(g => g.decisionApplied !== undefined);
                if (hasDecision) stats.dec++;

                if (result.status === 'ناجح') stats.passed++;
                else if (result.status === 'مكمل') stats.makeup++;
                else if (result.status === 'راسب') stats.failed++;

                return (
                  <tr key={s.id} className="h-10 hover:bg-slate-50">
                    <td className="border border-black">{idx + 1}</td>
                    <td className="border border-black text-right pr-2 text-[10px] whitespace-nowrap">{s.name}</td>
                    {subjects.map(sub => {
                      const gr = studentGrades.find(g => g.subjectId === sub.id);
                      const score = reportPeriod === 'midyear' ? gr?.midYearExam : gr?.finalResult;
                      const passMark = isPrimary ? 5 : 50;
                      return (
                        <td key={sub.id} className={`border border-black font-bold ${(score || 0) < passMark && score !== undefined ? 'text-red-600' : 'text-slate-900'}`}>
                          {formatGrade(score)}
                          {gr?.decisionApplied && <span className="text-[7px] text-blue-600 align-top">*</span>}
                        </td>
                      );
                    })}
                    <td className="border border-black text-blue-800">{total > 0 ? Math.round(total) : ''}</td>
                    <td className="border border-black text-[7px] text-right pr-1 leading-none">{total > 0 ? numberToArabicWords(Math.round(total)) : ''}</td>
                    <td className={`border border-black text-[9px] ${result.status === 'ناجح' ? 'text-emerald-700' : 'text-red-600'}`}>
                      {hasDecision && result.status === 'ناجح' ? 'ناجح بقرار' : result.status}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="mt-8 flex justify-between text-[11px] font-black items-start text-slate-900 min-w-[800px] px-4 pb-12">
            <div className="space-y-1">
              <p>المشتركون: ({stats.total}) | الناجحون: ({stats.passed}) | المكملون: ({stats.makeup}) | الراسبون: ({stats.failed}) | بقرار: ({stats.dec})</p>
              <p>النسبة الكلية: ({stats.total > 0 ? Math.round((stats.passed/stats.total)*100) : 0}%)</p>
            </div>
            <div className="flex gap-24">
               <div className="text-right">
                 <p className="mb-1">مرشد الصف</p>
                 <p className="font-black text-[10px]">{getAdvisorName(selectedGrade, selectedSection)}</p>
                 <div className="h-12"></div>
               </div>
               <div className="text-right">
                 <p className="mb-1">مدير المدرسة</p>
                 <p className="font-black text-sm">{season.managerName || '........................'}</p>
                 <div className="h-12"></div>
               </div>
            </div>
          </div>
        </div>
        <style>{`.vertical-text-header { writing-mode: vertical-rl; transform: rotate(180deg); white-space: nowrap; } @media print { @page { size: A4 landscape; margin: 1cm; } }`}</style>
      </div>
    );
  }

  if (reportType === 'absences' && selectedStudentId && student) {
    const absents = studentAttendanceRecords.filter(a => a.type === 'absent');
    const excused = studentAttendanceRecords.filter(a => a.type === 'excused');

    return (
      <div className="space-y-6 animate-in fade-in pb-20">
        <div className="flex justify-between items-center bg-white p-5 rounded-3xl shadow-sm border border-gray-100 no-print">
          <button onClick={() => setSelectedStudentId(null)} className="flex items-center gap-2 text-slate-600 font-black px-6 py-2 bg-slate-50 rounded-xl hover:bg-blue-100 transition-colors">
            <ArrowRight size={20} /> العودة للبحث
          </button>
          <button onClick={handlePrint} className="bg-red-600 text-white px-8 py-3 rounded-2xl font-black shadow-lg flex items-center gap-2">
            <Printer size={20} /> طباعة سجل الغياب
          </button>
        </div>

        <div className="bg-white p-12 shadow-xl rounded-[3rem] border border-slate-200 print:shadow-none print:border-none mx-auto max-w-[850px]" dir="rtl">
           <div className="flex justify-between items-start mb-10 border-b-2 border-slate-100 pb-8">
             <div className="text-right space-y-1 font-black text-xs text-slate-900">
               <p>جمهورية العراق</p>
               <p>وزارة التربية</p>
               <p>{schoolName}</p>
             </div>
             <div className="text-center">
                <div className="bg-red-50 p-4 rounded-3xl inline-block mb-3 no-print">
                  <CalendarX size={40} className="text-red-600" />
                </div>
                <h1 className="text-2xl font-black text-slate-800">كشف غيابات الطالب الرسمي</h1>
                <p className="text-sm font-bold text-slate-400 mt-1">الموسم الدراسي: {season.name}</p>
             </div>
             <div className="text-left font-black text-xs text-slate-900">
                <p>تاريخ الاستخراج</p>
                <p>{new Date().toLocaleDateString('ar-IQ')}</p>
             </div>
           </div>

           <div className="bg-slate-50 p-8 rounded-[2.5rem] grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10 text-right">
              <div className="col-span-1 md:col-span-2">
                <label className="block text-[10px] font-black text-slate-400 mb-1">اسم التلميذ الرباعي</label>
                <p className="text-xl font-black text-slate-800">{student.name}</p>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 mb-1">الصف والشعبة</label>
                <p className="text-xl font-black text-slate-800">{GRADE_NAMES[student.grade]} / {student.section}</p>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 mb-1">الحالة الحالية</label>
                <span className={`px-4 py-1 rounded-full text-xs font-black ${student.status === 'dismissed' ? 'bg-red-600 text-white' : 'bg-emerald-100 text-emerald-700'}`}>
                  {student.status === 'dismissed' ? 'مفصول' : 'مستمر'}
                </span>
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
              <div className="bg-white border-2 border-red-100 p-6 rounded-3xl flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-red-100 text-red-600 rounded-2xl"><UserX size={24} /></div>
                  <p className="font-black text-slate-700">مجموع أيام الغياب</p>
                </div>
                <p className="text-3xl font-black text-red-600">{absents.length}</p>
              </div>
              <div className="bg-white border-2 border-amber-100 p-6 rounded-3xl flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-amber-100 text-amber-600 rounded-2xl"><Clock size={24} /></div>
                  <p className="font-black text-slate-700">مجموع الإجازات</p>
                </div>
                <p className="text-3xl font-black text-amber-600">{excused.length}</p>
              </div>
           </div>

           <div className="overflow-hidden border-2 border-slate-100 rounded-3xl">
             <table className="w-full text-center font-black text-slate-800">
               <thead>
                 <tr className="bg-slate-100 border-b">
                   <th className="p-4 text-xs">ت</th>
                   <th className="p-4 text-xs text-right">التاريخ واليوم</th>
                   <th className="p-4 text-xs">نوع الغياب</th>
                   <th className="p-4 text-xs text-left">ملاحظات</th>
                 </tr>
               </thead>
               <tbody className="divide-y">
                 {studentAttendanceRecords.length === 0 ? (
                   <tr>
                     <td colSpan={4} className="py-20 text-slate-300 italic">لا يوجد سجلات غياب لهذا الطالب</td>
                   </tr>
                 ) : (
                   studentAttendanceRecords.map((record, idx) => (
                     <tr key={idx} className="hover:bg-slate-50 transition-colors">
                       <td className="p-4 text-sm text-slate-400">{idx + 1}</td>
                       <td className="p-4 text-sm text-right font-bold">
                         <div className="flex items-center gap-2">
                           <CalendarIcon size={14} className="text-slate-300" />
                           {record.date} ({getArabicDayName(record.date)})
                         </div>
                       </td>
                       <td className="p-4">
                         <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black ${record.type === 'absent' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-amber-50 text-amber-600 border border-amber-100'}`}>
                           {record.type === 'absent' ? 'غياب غير مجاز' : 'إجازة رسمية'}
                         </span>
                       </td>
                       <td className="p-4 text-[10px] text-slate-400 text-left italic">
                         {record.type === 'absent' ? 'تجاوز الحد القانوني' : 'بموجب عذر رسمي'}
                       </td>
                     </tr>
                   ))
                 )}
               </tbody>
             </table>
           </div>

           <div className="mt-16 flex justify-around items-end text-slate-900 pb-10">
            <div className="text-right font-black">
              <p className="mb-1 underline decoration-dotted text-xs">مرشد الصف</p>
              <p className="text-lg">{getAdvisorName(student.grade, student.section)}</p>
              <div className="h-12"></div>
            </div>
            <div className="text-right font-black">
              <p className="mb-1 underline decoration-dotted text-xs">مدير المدرسة</p>
              <p className="text-xl">{season.managerName || '........................'}</p>
              <div className="h-12"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (selectedStudentId && student && reportType === 'individual') {
    const isDismissed = student.status === 'dismissed';
    const studentGrades = getStudentGrades(student);
    const totalMidYear = studentGrades.reduce((acc, g) => acc + (g.midYearExam || 0), 0);
    const totalFinal = studentGrades.reduce((acc, g) => acc + (g.finalResult || 0), 0);
    const result = getPrimaryResult(studentGrades.map(g => g.finalResult), isPrimary);
    const hasDecision = studentGrades.some(g => g.decisionApplied !== undefined);
    const totalAbsents = season.attendance.filter(a => a.studentId === student.id && a.type === 'absent').length;

    if (student.grade >= 5) {
      return (
        <div className="space-y-6 animate-in fade-in pb-20 no-print-bg">
          <div className="flex justify-between items-center bg-white p-5 rounded-3xl shadow-sm border border-gray-100 no-print">
            <button onClick={() => setSelectedStudentId(null)} className="flex items-center gap-2 text-blue-600 font-black px-6 py-2 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors">
              <ArrowRight size={20} /> العودة للبحث
            </button>
            <button onClick={handlePrint} className="bg-emerald-600 text-white px-8 py-3 rounded-2xl font-black shadow-lg flex items-center gap-2">
              <Printer size={20} /> طباعة سجل الدرجات
            </button>
          </div>

          <div className="bg-white p-8 print:p-0 print:shadow-none shadow-2xl rounded-[1rem] border-2 border-slate-200 mx-auto max-w-[1200px]" dir="rtl">
            <div className="flex justify-between items-start mb-8 font-black text-[11px] text-slate-900 border-b-2 border-slate-900 pb-4">
               <div className="text-right space-y-1">
                  <p>إدارة</p>
                  <p>{schoolName}</p>
               </div>
               <div className="text-center">
                  <p className="text-xl font-black mb-2">سجل درجات الدروس للصف {GRADE_NAMES[student.grade]}</p>
                  <p className="text-lg">المرحلة الابتدائية</p>
                  <p className="mt-1">للسنة الدراسية {season.name}</p>
               </div>
               <div className="text-right space-y-1">
                  <p>الاسم: <span className="text-sm underline px-2">{student.name}</span></p>
                  <p>الشعبة: <span className="underline px-2">{student.section || '........'}</span></p>
                  <p>التسلسل: <span className="underline px-2">........</span></p>
                  <p>الصف: <span className="underline px-2">{GRADE_NAMES[student.grade]}</span></p>
               </div>
            </div>

            <table className="w-full text-center border-collapse border-2 border-slate-900 text-[10px] font-black text-slate-900 mb-6">
              <thead>
                <tr className="bg-slate-50 h-10">
                  <th rowSpan={2} className="border-2 border-slate-900 min-w-[100px]">الدروس</th>
                  <th colSpan={4} className="border-2 border-slate-900 bg-blue-50/30">النصف الأول</th>
                  <th rowSpan={2} className="border-2 border-slate-900 bg-amber-50/50 min-w-[45px]">نصف السنة</th>
                  <th colSpan={4} className="border-2 border-slate-900 bg-emerald-50/30">النصف الثاني</th>
                  <th rowSpan={2} className="border-2 border-slate-900 bg-purple-50/30 min-w-[45px]">معدل السعي السنوي</th>
                  <th rowSpan={2} className="border-2 border-slate-900 bg-slate-50 min-w-[45px]">الامتحان النهائي</th>
                  <th rowSpan={2} className="border-2 border-slate-900 bg-blue-50/50 min-w-[45px]">الدرجة النهائية</th>
                  <th rowSpan={2} className="border-2 border-slate-900 bg-orange-50 min-w-[45px]">امتحان الدور الثاني</th>
                  <th rowSpan={2} className="border-2 border-slate-900 bg-slate-900 text-white min-w-[45px]">الدرجة الأخيرة</th>
                </tr>
                <tr className="bg-slate-50 h-16 text-[8px]">
                  <th className="border-2 border-slate-900 vertical-text-report py-2 w-6">تشرين الأول</th>
                  <th className="border-2 border-slate-900 vertical-text-report py-2 w-6">تشرين الثاني</th>
                  <th className="border-2 border-slate-900 vertical-text-report py-2 w-6">كانون الأول</th>
                  <th className="border-2 border-slate-900 vertical-text-report py-2 w-6 bg-blue-100/50">معدل النصف الأول</th>
                  <th className="border-2 border-slate-900 vertical-text-report py-2 w-6">شباط</th>
                  <th className="border-2 border-slate-900 vertical-text-report py-2 w-6">آذار</th>
                  <th className="border-2 border-slate-900 vertical-text-report py-2 w-6">نيسان</th>
                  <th className="border-2 border-slate-900 vertical-text-report py-2 w-6 bg-emerald-100/50">معدل النصف الثاني</th>
                </tr>
              </thead>
              <tbody>
                {studentGrades.map((g, idx) => {
                  const passMark = 50;
                  const lastGrade = g.finalResult || 0;
                  return (
                    <tr key={idx} className="h-9 hover:bg-slate-50">
                      <td className="border-2 border-slate-900 text-right pr-3 font-black text-[12px]">{g.subject}</td>
                      <td className="border-2 border-slate-900">{formatGrade(g.october)}</td>
                      <td className="border-2 border-slate-900">{formatGrade(g.november)}</td>
                      <td className="border-2 border-slate-900">{formatGrade(g.december)}</td>
                      <td className="border-2 border-slate-900 bg-blue-50/30">{formatGrade(g.firstHalfAvg)}</td>
                      <td className="border-2 border-slate-900 bg-amber-50/50 font-bold">{formatGrade(g.midYearExam)}</td>
                      <td className="border-2 border-slate-900">{formatGrade(g.february)}</td>
                      <td className="border-2 border-slate-900">{formatGrade(g.march)}</td>
                      <td className="border-2 border-slate-900">{formatGrade(g.april)}</td>
                      <td className="border-2 border-slate-900 bg-emerald-50/30">{formatGrade(g.secondHalfAvg)}</td>
                      <td className="border-2 border-slate-900 bg-purple-50/30 font-bold">{formatGrade(g.annualEffort)}</td>
                      <td className="border-2 border-slate-900">{formatGrade(g.finalExam)}</td>
                      <td className="border-2 border-slate-900 bg-blue-50/50 font-black">{formatGrade(g.finalGrade)}</td>
                      <td className="border-2 border-slate-900 bg-orange-50">{formatGrade(g.secondRound)}</td>
                      <td className={`border-2 border-slate-900 text-[12px] font-black ${lastGrade < passMark ? 'text-red-600' : 'text-slate-900'}`}>
                        {formatGrade(lastGrade)}
                        {g.decisionApplied && <span className="text-[8px] text-blue-600 mr-1">*</span>}
                      </td>
                    </tr>
                  );
                })}
                <tr className="h-10 font-black bg-slate-50">
                  <td className="border-2 border-slate-900 pr-3 text-right">المجموع</td>
                  <td colSpan={13} className="border-2 border-slate-900 text-center text-lg">{Math.round(totalFinal)}</td>
                  <td className="border-2 border-slate-900 text-lg">{Math.round(totalFinal)}</td>
                </tr>
                <tr className="h-10 font-black">
                  <td className="border-2 border-slate-900 pr-3 text-right">السلوك</td>
                  <td colSpan={14} className="border-2 border-slate-900 text-right pr-6">....................................................................................................</td>
                </tr>
                <tr className="h-10 font-black">
                  <td className="border-2 border-slate-900 pr-3 text-right">الدوام</td>
                  <td colSpan={14} className="border-2 border-slate-900 text-right pr-6">
                    غاب التلميذ ( <span className="text-red-600 px-2">{totalAbsents}</span> ) يوماً خلال السنة الدراسية.
                  </td>
                </tr>
              </tbody>
            </table>

            <div className="flex justify-start mt-12 text-slate-900 px-12 pb-32">
               <div className="text-right font-black">
                  <p className="text-base mb-1">مدير المدرسة</p>
                  <p className="text-lg mb-12">{season.managerName || '........................'}</p>
               </div>
            </div>
          </div>
          <style>{`
            .vertical-text-report { writing-mode: vertical-rl; transform: rotate(180deg); white-space: nowrap; line-height: 1; }
            @media print { 
              @page { size: A4 landscape; margin: 0.5cm; }
              body { background: white !important; }
              .no-print-bg { background: white !important; }
            }
          `}</style>
        </div>
      );
    }

    return (
      <div className="space-y-6 animate-in fade-in pb-20">
        <div className="flex justify-between items-center bg-white p-5 rounded-3xl shadow-sm border border-gray-100 no-print">
          <button onClick={() => setSelectedStudentId(null)} className="flex items-center gap-2 text-blue-600 font-black px-6 py-2 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors">
            <ArrowRight size={20} /> العودة للبحث
          </button>
          <button onClick={handlePrint} className="bg-emerald-600 text-white px-8 py-3 rounded-2xl font-black shadow-lg flex items-center gap-2 hover:scale-105 transition-transform">
            <Printer size={20} /> طباعة الشهادة
          </button>
        </div>

        <div className="print:p-0 bg-white p-12 shadow-2xl rounded-[3rem] border-8 border-double border-slate-200 print:border-slate-800 print:shadow-none mx-auto max-w-[900px]" dir="rtl">
          <div className="text-center mb-8">
             <div className="flex justify-between items-center px-4 mb-6 text-slate-900">
               <div className="text-right font-black text-xs leading-relaxed">
                 <p>جمهورية العراق</p>
                 <p>وزارة التربية</p>
                 <p>{schoolName}</p>
               </div>
               <div className="flex flex-col items-center">
                 <Trophy size={60} className="text-amber-500 mb-2 no-print" />
                 <h1 className="text-2xl font-black border-b-4 border-slate-800 pb-2">الشهادة المدرسية</h1>
               </div>
               <div className="text-left font-black text-xs leading-relaxed">
                 <p>السنة الدراسية</p>
                 <p>{season.name}</p>
                 <p>الدور الأول</p>
               </div>
             </div>
             
             <div className={`bg-slate-50 p-6 rounded-3xl border-2 border-slate-100 grid grid-cols-2 md:grid-cols-4 gap-4 text-right mb-8 ${isDismissed ? 'bg-red-50 border-red-100' : ''}`}>
               <div><span className="text-slate-400 font-bold block text-[10px] mb-1">اسم التلميذ</span> <span className={`font-black text-lg ${isDismissed ? 'text-red-700' : 'text-blue-700'}`}>{student.name}</span></div>
               <div><span className="text-slate-400 font-bold block text-[10px] mb-1">الصف</span> <span className="font-black text-lg text-slate-800">{GRADE_NAMES[student.grade]} ({student.section})</span></div>
               <div><span className="text-slate-400 font-bold block text-[10px] mb-1">رقم القيد</span> <span className="font-black text-lg text-slate-800">{student.registerNumber || '---'}</span></div>
               <div><span className="text-slate-400 font-bold block text-[10px] mb-1">الحالة النهائية</span> <span className={`font-black text-lg ${isDismissed ? 'text-red-600' : result.status === 'ناجح' ? 'text-emerald-600' : 'text-red-600'}`}>{isDismissed ? "مفصول غيابات" : (hasDecision && result.status === 'ناجح' ? 'ناجح بقرار' : result.status)}</span></div>
             </div>
          </div>

          {isDismissed ? (
            <div className="py-24 text-center border-4 border-dashed border-red-200 rounded-[2rem] bg-red-50/20">
               <UserX size={80} className="mx-auto text-red-300 mb-6" />
               <h2 className="text-3xl font-black text-red-700 mb-4">يعتبر التلميذ مفصولاً</h2>
               <p className="text-xl font-bold text-red-900">بسبب تجاوزه الحد القانوني للغيابات المسموح بها سنوياً.</p>
            </div>
          ) : (
            <>
              <table className="w-full border-collapse border-4 border-slate-800 text-center font-black text-slate-900">
                <thead>
                  <tr className="bg-slate-100 text-sm">
                    <th className="border-2 border-slate-800 p-3">المواد الدراسية</th>
                    <th className="border-2 border-slate-800 p-3">درجة نصف السنة</th>
                    <th className="border-2 border-slate-800 p-3">الدرجة النهائية</th>
                    <th className="border-2 border-slate-800 p-3">النتيجة</th>
                  </tr>
                </thead>
                <tbody>
                  {studentGrades.map((g, idx) => {
                    const passMark = isPrimary ? 5 : 50;
                    return (
                      <tr key={idx} className="text-lg h-12 hover:bg-slate-50/50">
                        <td className="border-2 border-slate-800 p-2 text-right pr-6 bg-slate-50/50">{g.subject}</td>
                        <td className="border-2 border-slate-800 p-2">{formatGrade(g.midYearExam)}</td>
                        <td className={`border-2 border-slate-800 p-2 font-bold ${(g.finalResult || 0) < passMark ? 'text-red-600' : 'text-blue-800'}`}>
                          {formatGrade(g.finalResult)}
                          {g.decisionApplied && <span className="text-[10px] text-blue-600 align-top mr-1">(قرار)</span>}
                        </td>
                        <td className={`border-2 border-slate-800 p-2 text-[12px] ${(g.finalResult || 0) < passMark ? 'text-red-600' : 'text-emerald-700'}`}>
                          {(g.finalResult || 0) >= passMark ? (g.decisionApplied ? 'ناجح بقرار' : 'ناجح') : 'مكمل'}
                        </td>
                      </tr>
                    );
                  })}
                  <tr className="bg-slate-100 h-14">
                    <td className="border-2 border-slate-800 p-2 text-right pr-6 font-black">المجموع الكلي</td>
                    <td className="border-2 border-slate-800 p-2">{Math.round(totalMidYear) || '-'}</td>
                    <td className="border-2 border-slate-800 p-2 text-blue-900">{Math.round(totalFinal) || '-'}</td>
                    <td className="border-2 border-slate-800 p-2">---</td>
                  </tr>
                </tbody>
              </table>

              <div className="mt-8 p-6 border-2 border-slate-800 rounded-2xl bg-slate-50/30">
                <p className="text-sm font-black underline mb-2">القرار النهائي:</p>
                <p className="font-bold text-slate-800 text-lg leading-relaxed">
                  بناءً على النتائج المذكورة أعلاه، يعتبر التلميذ <span className={result.status === 'ناجح' ? 'text-emerald-700' : 'text-red-600'}>{hasDecision && result.status === 'ناجح' ? 'ناجح بقرار' : result.status}</span> للسنة الدراسية {season.name}.
                </p>
                {hasDecision && <p className="text-xs font-black text-blue-600 mt-2 italic">* شمل التلميذ بقرار سد الفجوة الامتحانية بموجب الصلاحيات المخولة.</p>}
              </div>
            </>
          )}

          <div className="mt-16 flex justify-around items-end text-slate-900 pb-10">
            <div className="text-right font-black">
              <p className="mb-1 underline decoration-dotted text-xs">مرشد الصف</p>
              <p className="text-lg">{getAdvisorName(student.grade, student.section)}</p>
              <div className="h-12"></div>
            </div>
            <div className="text-right font-black">
              <p className="mb-1 underline decoration-dotted text-xs">مدير المدرسة</p>
              <p className="text-xl">{season.managerName || '........................'}</p>
              <div className="h-12"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in pb-20 no-print">
      <div className="bg-white p-10 rounded-[4rem] shadow-sm border border-gray-100 text-center">
        <div className="flex flex-wrap justify-center gap-4 mb-10">
           <button onClick={() => { setReportType('individual'); setIsViewingClassReport(false); setSelectedStudentId(null); }} className={`px-8 py-4 rounded-[2rem] font-black flex items-center gap-2 transition-all ${reportType === 'individual' ? 'bg-blue-600 text-white shadow-xl scale-105' : 'bg-slate-50 text-slate-400'}`}>
             <User size={20} /> شهادة تلميذ
           </button>
           <button onClick={() => { setReportType('class'); setIsViewingClassReport(false); setSelectedStudentId(null); }} className={`px-8 py-4 rounded-[2rem] font-black flex items-center gap-2 transition-all ${reportType === 'class' ? 'bg-blue-600 text-white shadow-xl scale-105' : 'bg-slate-50 text-slate-400'}`}>
             <LayoutGrid size={20} /> السجل المجمع
           </button>
           <button onClick={() => { setReportType('absences'); setIsViewingClassReport(false); setSelectedStudentId(null); }} className={`px-8 py-4 rounded-[2rem] font-black flex items-center gap-2 transition-all ${reportType === 'absences' ? 'bg-red-600 text-white shadow-xl scale-105' : 'bg-slate-50 text-slate-400'}`}>
             <CalendarX size={20} /> سجل غياب التلميذ
           </button>
        </div>

        {(reportType === 'individual' || reportType === 'absences') ? (
          <>
            <h3 className="text-2xl font-black text-slate-800 mb-2">
              {reportType === 'absences' ? 'سجل الغيابات والإجازات الرسمي' : 'استخراج الشهادة المدرسية'}
            </h3>
            <div className="relative mb-10 mt-10">
              <Search className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300" size={24} />
              <input type="text" placeholder="اكتب اسم التلميذ أو رقم القيد للبحث..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pr-16 pl-6 py-6 border-4 border-slate-50 rounded-[2.5rem] outline-none focus:border-blue-600 bg-slate-50 font-black text-xl text-slate-900 text-right" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {searchResults.map(s => (
                <button key={s.id} onClick={() => setSelectedStudentId(s.id)} className={`w-full flex items-center justify-between p-6 border-2 rounded-[2.5rem] transition-all text-right group shadow-sm ${s.status === 'dismissed' ? 'bg-red-50 border-red-100 hover:bg-red-600 hover:text-white' : 'bg-white border-slate-50 hover:bg-blue-600 hover:text-white'} text-slate-900`}>
                  <div className="flex items-center gap-5">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black group-hover:bg-white/20 group-hover:text-white ${s.status === 'dismissed' ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-400'}`}>{s.name[0]}</div>
                    <div className="flex-1">
                      <p className={`font-black text-lg ${s.status === 'dismissed' ? 'line-through opacity-70' : ''}`}>{s.name}</p>
                      <div className="flex gap-2 mt-1">
                        <p className="text-[10px] font-bold opacity-70">الصف {GRADE_NAMES[s.grade]} - {s.section}</p>
                        <p className="text-[10px] font-black text-blue-500 group-hover:text-white">قيد: {s.registerNumber || '---'}</p>
                      </div>
                    </div>
                  </div>
                  <ChevronRight size={20} />
                </button>
              ))}
            </div>
          </>
        ) : (
          <div className="space-y-6">
            <h3 className="text-2xl font-black text-slate-800 mb-6">إعداد السجل المجمع للصف</h3>
            <div className="flex bg-slate-50 p-2 rounded-2xl border-2 border-slate-100 mb-8 max-w-md mx-auto">
              <button onClick={() => setReportPeriod('midyear')} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-black transition-all ${reportPeriod === 'midyear' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-400'}`}>
                <CalendarDays size={20} /> درجات نصف السنة
              </button>
              <button onClick={() => setReportPeriod('final')} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-black transition-all ${reportPeriod === 'final' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400'}`}>
                <Medal size={20} /> الدرجات النهائية
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="space-y-2">
                 <label className="block text-right font-black text-slate-500 mr-4 text-xs">الصف الدراسي</label>
                 <select value={selectedGrade} onChange={e => {setSelectedGrade(parseInt(e.target.value)); setSelectedSection(''); setIsViewingClassReport(false);}} className="w-full p-5 bg-slate-50 border-4 border-slate-50 rounded-3xl font-black text-lg outline-none focus:border-blue-600 text-slate-900">
                    {[1,2,3,4,5,6].map(g => <option key={g} value={g}>الصف {GRADE_NAMES[g]}</option>)}
                 </select>
               </div>
               <div className="space-y-2">
                 <label className="block text-right font-black text-slate-500 mr-4 text-xs">الشعبة</label>
                 <select value={selectedSection} onChange={e => {setSelectedSection(e.target.value); setIsViewingClassReport(false);}} className="w-full p-5 bg-slate-50 border-4 border-slate-50 rounded-3xl font-black text-lg outline-none focus:border-blue-600 text-slate-900">
                    <option value="">اختر الشعبة...</option>
                    {(season.sections?.[selectedGrade] || []).map(s => <option key={s} value={s}>شعبة {s}</option>)}
                 </select>
               </div>
            </div>
            {selectedSection && (
              <div className="mt-10 p-10 bg-blue-50 border-2 border-blue-100 rounded-[3rem] animate-in zoom-in text-center">
                 <p className="font-black text-blue-700 text-xl mb-6 flex items-center justify-center gap-2">
                    <UserCheck className="text-blue-600" /> تم العثور على {classStudents.length} تلميذ
                 </p>
                 <button onClick={() => setIsViewingClassReport(true)} className="bg-blue-600 text-white px-12 py-5 rounded-[2rem] font-black shadow-xl hover:bg-blue-700 hover:scale-105 transition-all flex items-center gap-2 mx-auto">
                    <LayoutGrid size={24} /> فتح المعاينة المجمعة
                 </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentReport;
