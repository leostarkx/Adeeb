
import React, { useState, useMemo, useRef } from 'react';
import { Season, Student, GRADE_NAMES } from '../types';
import { formatGrade } from '../utils/calculations';
import { Search, Printer, User, GraduationCap, LayoutGrid, SearchCode, ArrowRight, UserCircle2, Landmark } from 'lucide-react';

interface Props {
  season: Season;
}

const StudentReport: React.FC<Props> = ({ season }) => {
  const [selectionMode, setSelectionMode] = useState<'search' | 'browse' | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGrade, setSelectedGrade] = useState<number | null>(null);
  const [selectedSection, setSelectedSection] = useState<string>('');
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  const searchResults = useMemo(() => {
    if (searchTerm.length < 2) return [];
    return season.students.filter(s => s.name.includes(searchTerm));
  }, [season.students, searchTerm]);

  const browseResults = useMemo(() => {
    if (!selectedGrade || !selectedSection) return [];
    return season.students.filter(s => s.grade === selectedGrade && s.section === selectedSection);
  }, [season.students, selectedGrade, selectedSection]);

  const student = useMemo(() => 
    season.students.find(s => s.id === selectedStudentId),
    [season.students, selectedStudentId]
  );

  const studentGrades = useMemo(() => {
    if (!student) return [];
    const subjects = season.subjects[student.grade] || [];
    return subjects.map(sub => {
      const grade = season.grades.find(g => g.studentId === student.id && g.subjectId === sub.id);
      return { subject: sub.name, ...grade };
    });
  }, [season.grades, season.subjects, student]);

  const handlePrint = () => { window.print(); };

  const resetSelection = () => {
    setSelectedStudentId(null);
    setSearchTerm('');
    setSelectedGrade(null);
    setSelectedSection('');
  };

  if (selectedStudentId && student) {
    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="flex justify-between items-center bg-white p-5 rounded-3xl shadow-sm border border-gray-100 no-print">
          <button 
            onClick={resetSelection}
            className="flex items-center gap-2 text-slate-500 hover:text-blue-600 font-bold transition-colors"
          >
            <ArrowRight size={20} /> اختيار طالب آخر
          </button>
          <div className="flex items-center gap-4">
            <h3 className="font-black text-gray-700 hidden md:block italic">معاينة السجل الورقي: {student.name}</h3>
            <button onClick={handlePrint} className="flex items-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-2xl font-black hover:bg-blue-700 transition-all shadow-lg active:scale-95">
              <Printer size={20} /> طباعة السجل
            </button>
          </div>
        </div>

        <div ref={printRef} className="bg-white p-12 rounded-[2rem] shadow-sm border border-gray-100 print:shadow-none print:border-none print:p-0 print:m-0 w-full overflow-hidden">
          {/* ترويسة رسمية للطباعة فقط */}
          <div className="hidden print:flex justify-between items-start mb-8 text-[12px] font-black leading-relaxed">
            <div className="text-right">
              <p>جمهورية العراق</p>
              <p>وزارة التربية</p>
              <p>مديرية تربية الرصافة الأولى</p>
              <p>مدرسة الأديب الابتدائية للبنين</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 border-2 border-slate-900 rounded-full flex items-center justify-center mx-auto mb-2">
                 <Landmark size={32} />
              </div>
              <p className="text-lg">سجل الدرجات النهائي</p>
              <p>للموسم الدراسي {season.name}</p>
            </div>
            <div className="text-left">
              <p>رقم التلميذ: {student.id.slice(-6)}</p>
              <p>تاريخ الطبع: {new Date().toLocaleDateString('ar-IQ')}</p>
              <p>الصف: {GRADE_NAMES[student.grade]}</p>
              <p>الشعبة: {student.section}</p>
            </div>
          </div>

          {/* ترويسة العرض في البرنامج */}
          <div className="flex justify-between items-center mb-10 border-b-2 border-slate-50 pb-10 print:hidden">
            <div className="text-right">
               <h1 className="text-3xl font-black text-blue-900 mb-2">مدرسة الأديب الابتدائية للبنين</h1>
               <p className="text-gray-400 font-bold text-sm italic">سجل الدرجات النهائي - الموسم الدراسي {season.name}</p>
            </div>
            <div className="w-24 h-24 bg-blue-600 rounded-[2rem] flex items-center justify-center text-white font-black text-4xl shadow-2xl rotate-3">
              {student.name[0]}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10 bg-slate-50 p-8 rounded-[2rem] print:bg-white print:border print:mb-6 print:p-4">
             <div><p className="text-[10px] font-black text-blue-400 mb-1 uppercase tracking-widest print:text-slate-900">اسم التلميذ</p><p className="font-black text-slate-800 text-lg print:text-base">{student.name}</p></div>
             <div><p className="text-[10px] font-black text-blue-400 mb-1 uppercase tracking-widest print:text-slate-900">الصف الدراسي</p><p className="font-black text-slate-800 text-lg print:text-base">الصف {GRADE_NAMES[student.grade]}</p></div>
             <div><p className="text-[10px] font-black text-blue-400 mb-1 uppercase tracking-widest print:text-slate-900">الشعبة</p><p className="font-black text-slate-800 text-lg print:text-base">شعبة {student.section}</p></div>
             <div className="print:hidden"><p className="text-[10px] font-black text-blue-400 mb-1 uppercase tracking-widest">تاريخ الاستخراج</p><p className="font-black text-slate-800 text-lg">{new Date().toLocaleDateString('ar-IQ')}</p></div>
             <div className="hidden print:block"><p className="text-[10px] font-black text-slate-900 mb-1">الموسم الدراسي</p><p className="font-black text-slate-800 text-base">{season.name}</p></div>
          </div>

          <div className="overflow-x-auto rounded-[1.5rem] border border-slate-200 print:rounded-none">
            <table className="w-full text-center border-collapse text-[10px] print:text-[10px]">
              <thead>
                <tr className="bg-slate-800 text-white print:bg-white print:text-slate-900 print:border-b-2 print:border-slate-900 h-44">
                  <th className="px-4 py-4 text-right min-w-[140px] border-l border-slate-700 print:border-l-slate-900">المادة الدراسية</th>
                  
                  {/* العناوين العمودية الاحترافية */}
                  {[
                    { label: 'تشرين الأول', bg: 'bg-slate-700' },
                    { label: 'تشرين الثاني', bg: 'bg-slate-700' },
                    { label: 'كانون الأول', bg: 'bg-slate-700' },
                    { label: 'معدل الفصل الأول', bg: 'bg-blue-600', bold: true },
                    { label: 'إمتحان نصف السنة', bg: 'bg-amber-600', bold: true },
                    { label: 'شهر شباط', bg: 'bg-emerald-700' },
                    { label: 'شهر آذار', bg: 'bg-emerald-700' },
                    { label: 'شهر نيسان', bg: 'bg-emerald-700' },
                    { label: 'معدل الفصل الثاني', bg: 'bg-emerald-600', bold: true },
                    { label: 'السعي السنوي', bg: 'bg-purple-600', bold: true },
                    { label: 'الإمتحان النهائي', bg: 'bg-red-600' },
                    { label: 'الدرجة النهائية', bg: 'bg-indigo-600', bold: true },
                    { label: 'الدور الثاني', bg: 'bg-orange-600' },
                    { label: 'النتيجة النهائية', bg: 'bg-blue-900', bold: true }
                  ].map((header, i) => (
                    <th key={i} className={`px-1 py-4 align-middle border-l border-slate-700 print:border-l-slate-900 ${header.bg} print:bg-white`}>
                      <div className={`whitespace-nowrap px-1 [writing-mode:vertical-rl] rotate-180 mx-auto ${header.bold ? 'font-black' : 'font-medium'}`}>
                        {header.label}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 print:divide-slate-900">
                {studentGrades.map((g, idx) => (
                  <tr key={idx} className="hover:bg-blue-50/50 transition-colors print:hover:bg-transparent">
                    <td className="px-4 py-3 font-black text-right text-slate-800 bg-slate-50 border-l border-slate-100 print:bg-transparent print:border-l-slate-900">{g.subject}</td>
                    <td className="px-1 py-3 border-l border-slate-50 print:border-l-slate-900">{formatGrade(g.october)}</td>
                    <td className="px-1 py-3 border-l border-slate-50 print:border-l-slate-900">{formatGrade(g.november)}</td>
                    <td className="px-1 py-3 border-l border-slate-50 print:border-l-slate-900">{formatGrade(g.december)}</td>
                    <td className="px-2 py-3 border-l border-slate-50 font-bold text-blue-700 bg-blue-50/30 print:bg-transparent print:border-l-slate-900">{formatGrade(g.firstHalfAvg)}</td>
                    <td className="px-2 py-3 border-l border-slate-50 font-bold text-amber-700 bg-amber-50/30 print:bg-transparent print:border-l-slate-900">{formatGrade(g.midYearExam)}</td>
                    <td className="px-1 py-3 border-l border-slate-50 print:border-l-slate-900">{formatGrade(g.february)}</td>
                    <td className="px-1 py-3 border-l border-slate-50 print:border-l-slate-900">{formatGrade(g.march)}</td>
                    <td className="px-1 py-3 border-l border-slate-50 print:border-l-slate-900">{formatGrade(g.april)}</td>
                    <td className="px-2 py-3 border-l border-slate-50 font-bold text-emerald-700 bg-emerald-50/30 print:bg-transparent print:border-l-slate-900">{formatGrade(g.secondHalfAvg)}</td>
                    <td className="px-2 py-3 border-l border-slate-50 font-black text-purple-700 bg-purple-50/30 print:bg-transparent print:border-l-slate-900">{formatGrade(g.annualEffort)}</td>
                    <td className="px-2 py-3 border-l border-slate-50 font-bold text-red-700 print:border-l-slate-900">{formatGrade(g.finalExam)}</td>
                    <td className="px-2 py-3 border-l border-slate-50 font-black text-indigo-700 bg-indigo-50/30 print:bg-transparent print:border-l-slate-900">{formatGrade(g.finalGrade)}</td>
                    <td className="px-2 py-3 border-l border-slate-50 font-bold text-orange-700 print:border-l-slate-900">{formatGrade(g.secondRound)}</td>
                    <td className={`px-3 py-3 font-black text-sm print:text-xs ${
                      (g.finalResult ?? 0) >= 50 ? 'text-blue-700 bg-blue-50 print:bg-transparent print:text-slate-900' : 'text-red-700 bg-red-50 print:bg-transparent print:text-slate-900'
                    }`}>
                      {formatGrade(g.finalResult)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-16 grid grid-cols-3 gap-12 text-center">
            <div className="pt-4 border-t border-dashed border-slate-300 print:border-slate-900">
               <p className="text-xs font-black text-slate-800">ختم المدرسة الرسمي</p>
               <div className="h-20"></div>
            </div>
            <div className="pt-4 border-t border-dashed border-slate-300 print:border-slate-900">
               <p className="text-xs font-black text-slate-800">توقيع مدير المدرسة</p>
               <div className="h-20"></div>
               <p className="text-[10px] font-bold mt-2">..........................................</p>
            </div>
            <div className="pt-4 border-t border-dashed border-slate-300 print:border-slate-900">
               <p className="text-xs font-black text-slate-800">توقيع المعلم المختص</p>
               <div className="h-20"></div>
               <p className="text-[10px] font-bold mt-2">..........................................</p>
            </div>
          </div>

          <div className="mt-12 text-center text-[10px] text-slate-400 font-bold hidden print:block border-t pt-4">
             تم استخراج هذا السجل بواسطة نظام مدرسة الأديب الإلكتروني - السجل رقم ({student.id.slice(-4)})
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in pb-20">
      <div className="text-center py-10">
        <div className="w-20 h-20 bg-blue-600 rounded-[2rem] flex items-center justify-center text-white mx-auto mb-6 shadow-xl">
          <User size={40} />
        </div>
        <h2 className="text-3xl font-black text-slate-800">سجل درجات الطالب</h2>
        <p className="text-slate-400 font-bold mt-2 text-lg">يرجى تحديد الطريقة المناسبة للوصول إلى اسم الطالب</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className={`p-8 rounded-[3rem] border-4 transition-all bg-white shadow-sm ${selectionMode === 'search' ? 'border-blue-600 shadow-xl' : 'border-slate-50 hover:border-blue-100'}`}>
          <button 
            onClick={() => { setSelectionMode('search'); resetSelection(); }}
            className="w-full flex flex-col items-center text-center"
          >
            <div className="p-5 bg-blue-50 rounded-2xl text-blue-600 mb-4">
              <SearchCode size={32} />
            </div>
            <h3 className="text-xl font-black text-slate-800">بحث سريع بالاسم</h3>
            <p className="text-slate-400 font-bold mt-2">اكتب جزءاً من اسم الطالب للبحث عنه</p>
          </button>

          {selectionMode === 'search' && (
            <div className="mt-8 space-y-4 animate-in">
              <input 
                type="text" 
                autoFocus
                placeholder="اكتب هنا (مثلاً: أحمد علي)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-5 border-2 border-blue-100 rounded-3xl font-black text-lg outline-none focus:border-blue-600 bg-blue-50/20"
              />
              <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar">
                {searchResults.map(s => (
                  <button
                    key={s.id}
                    onClick={() => setSelectedStudentId(s.id)}
                    className="w-full flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl hover:bg-blue-600 hover:text-white transition-all font-black"
                  >
                    <span>{s.name}</span>
                    <span className="text-xs opacity-60">الصف {GRADE_NAMES[s.grade]} - {s.section}</span>
                  </button>
                ))}
                {searchTerm.length >= 2 && searchResults.length === 0 && (
                  <p className="text-center text-red-400 font-bold py-4">لا توجد نتائج مطابقة</p>
                )}
                {searchTerm.length > 0 && searchTerm.length < 2 && (
                  <p className="text-center text-slate-300 font-bold py-4 italic">أدخل حرفين على الأقل...</p>
                )}
              </div>
            </div>
          )}
        </div>

        <div className={`p-8 rounded-[3rem] border-4 transition-all bg-white shadow-sm ${selectionMode === 'browse' ? 'border-emerald-600 shadow-xl' : 'border-slate-50 hover:border-emerald-100'}`}>
          <button 
            onClick={() => { setSelectionMode('browse'); resetSelection(); }}
            className="w-full flex flex-col items-center text-center"
          >
            <div className="p-5 bg-emerald-50 rounded-2xl text-emerald-600 mb-4">
              <LayoutGrid size={32} />
            </div>
            <h3 className="text-xl font-black text-slate-800">تصفح حسب الصفوف</h3>
            <p className="text-slate-400 font-bold mt-2">اختر الصف والشعبة لعرض أسماء الطلاب</p>
          </button>

          {selectionMode === 'browse' && (
            <div className="mt-8 space-y-6 animate-in">
              <div className="grid grid-cols-3 gap-2">
                {[1,2,3,4,5,6].map(g => (
                  <button
                    key={g}
                    onClick={() => { setSelectedGrade(g); setSelectedSection(''); }}
                    className={`py-3 rounded-2xl font-black text-xs transition-all ${selectedGrade === g ? 'bg-emerald-600 text-white' : 'bg-slate-50 text-slate-400'}`}
                  >
                    {GRADE_NAMES[g]}
                  </button>
                ))}
              </div>

              {selectedGrade && (
                <div className="grid grid-cols-2 gap-2 animate-in">
                  {(season.sections?.[selectedGrade] || []).map(sec => (
                    <button
                      key={sec}
                      onClick={() => setSelectedSection(sec)}
                      className={`py-3 rounded-2xl font-black text-xs border-2 transition-all ${selectedSection === sec ? 'border-emerald-600 bg-emerald-50 text-emerald-600' : 'border-slate-50 text-slate-400'}`}
                    >
                      شعبة {sec}
                    </button>
                  ))}
                </div>
              )}

              {selectedSection && (
                <div className="space-y-2 max-h-[250px] overflow-y-auto custom-scrollbar animate-in">
                  {browseResults.map(s => (
                    <button
                      key={s.id}
                      onClick={() => setSelectedStudentId(s.id)}
                      className="w-full flex items-center gap-3 p-4 bg-white border border-slate-100 rounded-2xl hover:bg-emerald-600 hover:text-white transition-all font-black text-sm"
                    >
                      <UserCircle2 size={18} className="opacity-40" />
                      <span>{s.name}</span>
                    </button>
                  ))}
                  {browseResults.length === 0 && (
                    <p className="text-center text-slate-300 font-bold py-4 italic">لا يوجد طلاب في هذه الشعبة</p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentReport;
