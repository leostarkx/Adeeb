

import React, { useState, useMemo } from 'react';
import { AppState, Graduate, Season, Student, GRADE_NAMES, GradeRecord } from '../types';
import { 
  History, Search, Filter, Medal, Calendar, Hash, UserCheck, 
  ArrowRight, BookOpen, Clock, FileText, TrendingUp, UserCircle,
  ChevronLeft, Award, UserX, Briefcase, Info
} from 'lucide-react';
import { formatGrade, toArabicNums } from '../utils/calculations';

interface Props {
  state: AppState;
}

const GraduatesView: React.FC<Props> = ({ state }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSeasonFilter, setSelectedSeasonFilter] = useState<string>('');
  const [selectedRegNum, setSelectedRegNum] = useState<string | null>(null);

  // تجميع قائمة فريدة لكافة الطلاب الذين مروا على المدرسة عبر كافة المواسم
  const allArchivedStudents = useMemo(() => {
    const studentsMap = new Map<string, { 
      name: string, 
      registerNumber: string, 
      lastSeason: string, 
      status?: string,
      isGraduate: boolean,
      originalId: string
    }>();

    // 1. إضافة الطلاب من المواسم الدراسية
    state.seasons.forEach(season => {
      (season.students || []).forEach(s => {
        // نستخدم رقم القيد كمفتاح أساسي للربط، وإذا لم يوجد نستخدم الـ ID لضمان عدم ضياع أي طالب
        const key = s.registerNumber || s.id;
        const existing = studentsMap.get(key);
        
        // نحدث المعلومات إذا كان هذا الموسم أحدث أو إذا لم يكن الطالب موجوداً
        if (!existing || (season.name > existing.lastSeason)) {
          studentsMap.set(key, {
            name: s.name || '',
            registerNumber: s.registerNumber || '',
            lastSeason: season.name,
            status: s.status,
            isGraduate: false,
            originalId: s.id
          });
        }
      });
    });

    // 2. دمج معلومات الخريجين الرسميين
    state.graduates.forEach(g => {
      const key = g.registerNumber || g.id;
      const existing = studentsMap.get(key);
      if (!existing) {
        studentsMap.set(key, {
          name: g.name || '',
          registerNumber: g.registerNumber || '',
          lastSeason: g.seasonName,
          status: 'graduate',
          isGraduate: true,
          originalId: g.id
        });
      } else {
        studentsMap.set(key, { ...existing, isGraduate: true });
      }
    });

    return Array.from(studentsMap.values());
  }, [state.seasons, state.graduates]);

  // Explicitly type the seasons array as string[] to fix the localeCompare error on unknown type
  const archiveSeasons = useMemo(() => {
    const seasons = Array.from(new Set(allArchivedStudents.map(s => s.lastSeason))) as string[];
    return seasons.sort((a, b) => b.localeCompare(a));
  }, [allArchivedStudents]);

  const filteredArchivedList = useMemo(() => {
    if (!selectedSeasonFilter) return [];
    
    let list = [...allArchivedStudents];
    
    // التصفية حسب الموسم
    if (selectedSeasonFilter !== 'all') {
      list = list.filter(s => s.lastSeason === selectedSeasonFilter);
    }
    
    // محرك البحث المطور
    if (searchTerm.trim()) {
      const term = searchTerm.trim().toLowerCase();
      list = list.filter(s => 
        (s.name && s.name.toLowerCase().includes(term)) || 
        (s.registerNumber && s.registerNumber.toLowerCase().includes(term))
      );
    }
    
    return list.sort((a, b) => a.name.localeCompare(b.name, 'ar'));
  }, [allArchivedStudents, searchTerm, selectedSeasonFilter]);

  // البحث عن "السيرة الدراسية" عبر كافة المواسم
  const studentAcademicHistory = useMemo(() => {
    if (!selectedRegNum) return null;

    const history: { seasonName: string, studentInfo: Student, grades: any[], attendanceCount: number }[] = [];
    
    state.seasons.forEach(season => {
      // نبحث عن الطالب برقم القيد أو بالـ ID الأصلي
      const studentInSeason = (season.students || []).find(s => 
        (s.registerNumber && s.registerNumber === selectedRegNum) || 
        (s.id === selectedRegNum)
      );

      if (studentInSeason) {
        const studentGrades = (season.grades || []).filter(g => g.studentId === studentInSeason.id);
        const attendance = (season.attendance || []).filter(a => a.studentId === studentInSeason.id && a.type === 'absent').length;
        
        history.push({
          seasonName: season.name,
          studentInfo: studentInSeason,
          grades: studentGrades.map(g => ({
            ...g,
            subjectName: season.subjects[studentInSeason.grade]?.find(sub => sub.id === g.subjectId)?.name || 'مادة غير معرفة'
          })),
          attendanceCount: attendance
        });
      }
    });

    return history.sort((a, b) => a.seasonName.localeCompare(b.seasonName));
  }, [state.seasons, selectedRegNum]);

  const selectedStudentBasic = useMemo(() => {
    return allArchivedStudents.find(s => (s.registerNumber === selectedRegNum) || (s.originalId === selectedRegNum));
  }, [allArchivedStudents, selectedRegNum]);

  if (selectedRegNum && studentAcademicHistory) {
    return (
      <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in pb-20">
        <div className="flex justify-between items-center bg-white p-5 rounded-3xl shadow-sm border border-gray-100 no-print">
          <button onClick={() => setSelectedRegNum(null)} className="flex items-center gap-2 text-slate-600 font-black px-6 py-2 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
            <ArrowRight size={20} /> العودة للأرشيف العام
          </button>
          <div className="flex items-center gap-3">
             <span className="text-[10px] font-black text-slate-400">المعرف الدراسي</span>
             <span className="bg-slate-900 text-white px-4 py-1.5 rounded-xl font-black text-sm">{toArabicNums(selectedRegNum || '')}</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-10 rounded-[3.5rem] text-white shadow-2xl relative overflow-hidden">
           <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
              <div className="w-32 h-32 bg-white/10 backdrop-blur-md rounded-[2.5rem] flex items-center justify-center text-5xl font-black border border-white/20">
                {selectedStudentBasic?.name ? selectedStudentBasic.name[0] : '?'}
              </div>
              <div className="text-center md:text-right flex-1">
                <h2 className="text-4xl font-black mb-2">{selectedStudentBasic?.name}</h2>
                <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-4">
                   <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-2xl border border-white/5">
                      <Hash size={16} className="text-amber-400" />
                      <span className="text-xs font-bold">قيد: {toArabicNums(selectedStudentBasic?.registerNumber || '') || 'غير مسجل'}</span>
                   </div>
                   <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-2xl border border-white/5">
                      <TrendingUp size={16} className="text-emerald-400" />
                      <span className="text-xs font-bold">المسيرة في المدرسة: {toArabicNums(studentAcademicHistory.length)} مواسم</span>
                   </div>
                   <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-2xl border border-white/5">
                      <UserCheck size={16} className="text-blue-400" />
                      <span className="text-xs font-bold">آخر حالة: {selectedStudentBasic?.isGraduate ? 'خريج' : (selectedStudentBasic?.status === 'dismissed' ? 'مفصول' : 'طالب سابق/مستمر')}</span>
                   </div>
                </div>
              </div>
           </div>
           <UserCircle size={200} className="absolute -left-10 -bottom-10 text-white/5 rotate-12" />
        </div>

        <div className="space-y-10">
           {studentAcademicHistory.map((entry, idx) => (
             <div key={idx} className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden animate-in" style={{ animationDelay: `${idx * 0.1}s` }}>
                <div className="bg-slate-50 p-6 flex justify-between items-center border-b">
                   <div className="flex items-center gap-4">
                      <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg">
                        <Calendar size={20} />
                      </div>
                      <div>
                        <h3 className="font-black text-slate-800">الموسم الدراسي {toArabicNums(entry.seasonName)}</h3>
                        <p className="text-[10px] font-bold text-slate-400">الصف {GRADE_NAMES[entry.studentInfo.grade]} - شعبة {entry.studentInfo.section}</p>
                      </div>
                   </div>
                   <div className="flex gap-3">
                      <div className="flex flex-col items-center px-4 py-1 bg-red-50 text-red-600 rounded-xl border border-red-100">
                         <span className="text-[8px] font-black">أيام الغياب</span>
                         <span className="text-sm font-black">{toArabicNums(entry.attendanceCount)}</span>
                      </div>
                      <div className="flex flex-col items-center px-4 py-1 bg-slate-100 text-slate-600 rounded-xl border border-slate-200">
                         <span className="text-[8px] font-black">حالة التلميذ</span>
                         <span className="text-[10px] font-black">{entry.studentInfo.status === 'dismissed' ? 'مفصول' : 'نشط'}</span>
                      </div>
                   </div>
                </div>

                <div className="p-8">
                   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {entry.grades.length > 0 ? entry.grades.map((g, gIdx) => (
                        <div key={gIdx} className="p-4 bg-slate-50/50 border border-slate-100 rounded-2xl flex justify-between items-center group hover:bg-white hover:border-blue-200 transition-all">
                           <div className="flex items-center gap-3">
                              <BookOpen size={14} className="text-blue-400" />
                              <span className="text-xs font-black text-slate-700">{g.subjectName}</span>
                           </div>
                           <div className="flex items-center gap-2">
                              <span className={`text-lg font-black ${(g.finalResult || 0) < (entry.studentInfo.grade <= 4 ? 5 : 50) ? 'text-red-500' : 'text-blue-700'}`}>
                                {formatGrade(g.finalResult)}
                              </span>
                              {g.decisionApplied && <span className="text-[8px] text-amber-600 font-black">بقرار</span>}
                           </div>
                        </div>
                      )) : (
                        <div className="col-span-full py-6 text-center text-slate-300 italic text-sm">لا يوجد درجات مرصودة لهذا التلميذ في هذا الموسم</div>
                      )}
                   </div>
                </div>
             </div>
           ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in pb-20">
      <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-12">
          <div className="flex items-center gap-5">
            <div className="p-5 bg-slate-800 text-white rounded-[2rem] shadow-xl shadow-slate-100">
              <History size={40} />
            </div>
            <div>
              <h2 className="text-3xl font-black text-slate-800">أرشيف طلاب مدرسة الأديب</h2>
              <p className="text-slate-400 font-bold mt-1">البحث في السيرة الدراسية لكافة الطلاب (مستمرين، خريجين، مفصولين)</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
             <div className="relative flex-1 sm:w-80">
                <Search size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="ابحث بالاسم أو القيد..." 
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pr-12 pl-4 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl font-black text-slate-800 outline-none focus:border-slate-800 focus:bg-white transition-all shadow-sm"
                />
             </div>
             <div className="relative sm:w-64">
                <Filter size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <select 
                  value={selectedSeasonFilter} 
                  onChange={e => setSelectedSeasonFilter(e.target.value)}
                  className="w-full pr-12 pl-4 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl font-black text-slate-800 outline-none focus:border-slate-800 appearance-none shadow-sm"
                >
                  <option value="" disabled>-- اختر الموسم للعرض --</option>
                  <option value="all">كافة المواسم</option>
                  {archiveSeasons.map(s => <option key={s} value={s}>موسم {toArabicNums(s)}</option>)}
                </select>
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {!selectedSeasonFilter ? (
             <div className="col-span-full py-24 text-center">
                <Filter size={80} className="mx-auto text-slate-100 mb-6" />
                <p className="text-2xl font-black text-slate-300 italic">يرجى اختيار موسم دراسي أو "كافة المواسم" لعرض الأرشيف</p>
             </div>
          ) : filteredArchivedList.length > 0 ? (
            filteredArchivedList.map((student) => (
              <button 
                key={student.registerNumber || student.originalId} 
                onClick={() => setSelectedRegNum(student.registerNumber || student.originalId)}
                className="p-6 bg-white border-2 border-slate-50 rounded-[2.5rem] hover:border-slate-400 transition-all hover:shadow-xl group text-right flex flex-col items-stretch"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-xl group-hover:bg-slate-800 group-hover:text-white transition-colors ${student.isGraduate ? 'bg-amber-50 text-amber-600' : (student.status === 'dismissed' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600')}`}>
                    {student.isGraduate ? <Medal size={24} /> : (student.status === 'dismissed' ? <UserX size={24} /> : <UserCircle size={24} />)}
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black ${student.isGraduate ? 'bg-amber-100 text-amber-700' : (student.status === 'dismissed' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-500')}`}>
                    {student.isGraduate ? 'خريج ناجح' : (student.status === 'dismissed' ? 'مفصول' : 'سجل دراسي')}
                  </span>
                </div>
                
                <h4 className="text-xl font-black text-slate-800 mb-2 group-hover:text-slate-900 transition-colors">{student.name}</h4>
                
                <div className="space-y-2 mt-4">
                  <div className="flex items-center gap-3 text-slate-400">
                    <Hash size={14} className="group-hover:text-slate-800" />
                    <span className="text-xs font-bold">القيد: <span className="text-slate-800">{toArabicNums(student.registerNumber || '') || '---'}</span></span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-400">
                    <Calendar size={14} className="group-hover:text-slate-800" />
                    <span className="text-xs font-bold">آخر موسم: <span className="text-slate-800">{toArabicNums(student.lastSeason)}</span></span>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-50 flex items-center justify-between">
                   <div className="flex items-center gap-2 text-slate-500">
                     <FileText size={14} />
                     <span className="text-[10px] font-black uppercase tracking-widest">معاينة السيرة الكاملة</span>
                   </div>
                   <div className="text-slate-800 opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-all">
                      <ChevronLeft size={16} />
                   </div>
                </div>
              </button>
            ))
          ) : (
            <div className="col-span-full py-24 text-center">
               <History size={80} className="mx-auto text-slate-100 mb-6" />
               <p className="text-2xl font-black text-slate-300 italic">لا يوجد نتائج تطابق بحثك في الأرشيف</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GraduatesView;
