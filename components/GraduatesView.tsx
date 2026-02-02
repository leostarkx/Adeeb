
import React, { useState, useMemo } from 'react';
import { AppState, Graduate, Season, Student, GRADE_NAMES, GradeRecord } from '../types';
import { 
  History, Search, Filter, Medal, Calendar, Hash, UserCheck, 
  ArrowRight, BookOpen, Clock, FileText, TrendingUp, UserCircle,
  ChevronLeft, Award, UserX
} from 'lucide-react';
import { formatGrade } from '../utils/calculations';

interface Props {
  state: AppState;
}

const GraduatesView: React.FC<Props> = ({ state }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSeasonFilter, setSelectedSeasonFilter] = useState<string>('all');
  const [selectedRegNum, setSelectedRegNum] = useState<string | null>(null);

  // استخراج قائمة المواسم الفريدة التي لديها خريجون
  const graduateSeasons = useMemo(() => {
    const seasons = state.graduates.map(g => g.seasonName);
    return Array.from(new Set(seasons)).sort();
  }, [state.graduates]);

  // البحث في قائمة الخريجين المؤرشفين
  const filteredGraduates = useMemo(() => {
    let list = [...(state.graduates || [])];
    
    if (selectedSeasonFilter !== 'all') {
      list = list.filter(g => g.seasonName === selectedSeasonFilter);
    }
    
    if (searchTerm) {
      list = list.filter(g => 
        g.name.includes(searchTerm) || 
        g.registerNumber?.includes(searchTerm)
      );
    }
    
    return list.sort((a, b) => b.graduationYear.localeCompare(a.graduationYear) || a.name.localeCompare(b.name, 'ar'));
  }, [state.graduates, searchTerm, selectedSeasonFilter]);

  // البحث عن "السيرة الدراسية" عبر كافة المواسم
  const studentAcademicHistory = useMemo(() => {
    if (!selectedRegNum) return null;

    const history: { seasonName: string, studentInfo: Student, grades: any[], attendanceCount: number }[] = [];
    
    state.seasons.forEach(season => {
      const studentInSeason = season.students.find(s => s.registerNumber === selectedRegNum);
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
    return state.graduates.find(g => g.registerNumber === selectedRegNum) || 
           state.seasons.flatMap(s => s.students).find(s => s.registerNumber === selectedRegNum);
  }, [state.graduates, state.seasons, selectedRegNum]);

  if (selectedRegNum && studentAcademicHistory) {
    return (
      <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in pb-20">
        <div className="flex justify-between items-center bg-white p-5 rounded-3xl shadow-sm border border-gray-100 no-print">
          <button onClick={() => setSelectedRegNum(null)} className="flex items-center gap-2 text-slate-600 font-black px-6 py-2 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
            <ArrowRight size={20} /> العودة للسجل العام
          </button>
          <div className="flex items-center gap-3">
             <span className="text-[10px] font-black text-slate-400">رقم القيد المركزي</span>
             <span className="bg-slate-900 text-white px-4 py-1.5 rounded-xl font-black text-sm">{selectedRegNum}</span>
          </div>
        </div>

        {/* كارت المعلومات الشخصية */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-10 rounded-[3.5rem] text-white shadow-2xl relative overflow-hidden">
           <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
              <div className="w-32 h-32 bg-white/10 backdrop-blur-md rounded-[2.5rem] flex items-center justify-center text-5xl font-black border border-white/20">
                {selectedStudentBasic?.name[0]}
              </div>
              <div className="text-center md:text-right flex-1">
                <h2 className="text-4xl font-black mb-2">{selectedStudentBasic?.name}</h2>
                <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-4">
                   <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-2xl border border-white/5">
                      <Hash size={16} className="text-amber-400" />
                      <span className="text-xs font-bold">قيد: {selectedRegNum}</span>
                   </div>
                   <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-2xl border border-white/5">
                      <TrendingUp size={16} className="text-emerald-400" />
                      <span className="text-xs font-bold">المسيرة الدراسية: {studentAcademicHistory.length} مواسم</span>
                   </div>
                </div>
              </div>
           </div>
           <UserCircle size={200} className="absolute -left-10 -bottom-10 text-white/5 rotate-12" />
        </div>

        {/* عرض المواسم الدراسية */}
        <div className="space-y-10">
           {studentAcademicHistory.map((entry, idx) => (
             <div key={idx} className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden animate-in" style={{ animationDelay: `${idx * 0.1}s` }}>
                <div className="bg-slate-50 p-6 flex justify-between items-center border-b">
                   <div className="flex items-center gap-4">
                      <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg">
                        <Calendar size={20} />
                      </div>
                      <div>
                        <h3 className="font-black text-slate-800">الموسم الدراسي {entry.seasonName}</h3>
                        <p className="text-[10px] font-bold text-slate-400">الصف {GRADE_NAMES[entry.studentInfo.grade]} - شعبة {entry.studentInfo.section}</p>
                      </div>
                   </div>
                   <div className="flex gap-3">
                      <div className="flex flex-col items-center px-4 py-1 bg-red-50 text-red-600 rounded-xl border border-red-100">
                         <span className="text-[8px] font-black">أيام الغياب</span>
                         <span className="text-sm font-black">{entry.attendanceCount}</span>
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

           {studentAcademicHistory.length === 0 && (
              <div className="bg-white p-20 rounded-[3rem] text-center border-4 border-dashed border-slate-100">
                 <UserX size={64} className="mx-auto text-slate-200 mb-6" />
                 <p className="text-2xl font-black text-slate-300">لم يتم العثور على سجلات دراسية لهذا القيد في أرشيف المواسم</p>
              </div>
           )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in pb-20">
      <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-12">
          <div className="flex items-center gap-5">
            <div className="p-5 bg-amber-500 text-white rounded-[2rem] shadow-xl shadow-amber-100">
              <History size={40} />
            </div>
            <div>
              <h2 className="text-3xl font-black text-slate-800">سجل الخريجين العام</h2>
              <p className="text-slate-400 font-bold mt-1">أرشيف خريجي مدرسة الأديب والبحث في السيرة الدراسية</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
             <div className="relative flex-1 sm:w-80">
                <Search size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="بحث شامل بالاسم أو رقم القيد..." 
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pr-12 pl-4 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl font-black text-slate-800 outline-none focus:border-amber-500 focus:bg-white transition-all shadow-sm"
                />
             </div>
             <div className="relative sm:w-64">
                <Filter size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <select 
                  value={selectedSeasonFilter} 
                  onChange={e => setSelectedSeasonFilter(e.target.value)}
                  className="w-full pr-12 pl-4 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl font-black text-slate-800 outline-none focus:border-amber-500 appearance-none shadow-sm"
                >
                  <option value="all">كافة المواسم</option>
                  {graduateSeasons.map(s => <option key={s} value={s}>موسم {s}</option>)}
                </select>
             </div>
          </div>
        </div>

        {/* عرض النتائج */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGraduates.length > 0 ? (
            filteredGraduates.map((grad) => (
              <button 
                key={grad.id} 
                onClick={() => setSelectedRegNum(grad.registerNumber || null)}
                className="p-6 bg-white border-2 border-slate-50 rounded-[2.5rem] hover:border-amber-400 transition-all hover:shadow-xl group text-right flex flex-col items-stretch"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-amber-50 text-amber-600 rounded-xl group-hover:bg-amber-500 group-hover:text-white transition-colors">
                    <Medal size={24} />
                  </div>
                  <span className="bg-slate-100 text-slate-500 px-3 py-1 rounded-full text-[10px] font-black group-hover:bg-amber-100 group-hover:text-amber-700">دفعة {grad.graduationYear}</span>
                </div>
                
                <h4 className="text-xl font-black text-slate-800 mb-2 group-hover:text-amber-600 transition-colors">{grad.name}</h4>
                
                <div className="space-y-2 mt-4">
                  <div className="flex items-center gap-3 text-slate-400">
                    <Hash size={14} className="group-hover:text-amber-500" />
                    <span className="text-xs font-bold">رقم القيد: <span className="text-slate-800">{grad.registerNumber || '---'}</span></span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-400">
                    <Calendar size={14} className="group-hover:text-amber-500" />
                    <span className="text-xs font-bold">الموسم: <span className="text-slate-800">{grad.seasonName}</span></span>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-50 flex items-center justify-between">
                   <div className="flex items-center gap-2 text-emerald-600">
                     <UserCheck size={14} />
                     <span className="text-[10px] font-black uppercase tracking-widest">خريج ناجح</span>
                   </div>
                   <div className="text-amber-500 opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-all">
                      <span className="text-[10px] font-black">عرض السيرة</span>
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
      
      <div className="bg-amber-50 border-2 border-amber-100 p-8 rounded-[3rem] flex items-center gap-6">
        <Award size={40} className="text-amber-500 shrink-0" />
        <div>
          <h4 className="font-black text-amber-800">البحث التاريخي المتقدم</h4>
          <p className="text-sm font-bold text-amber-700/80">
            يمكنك الآن النقر على اسم أي متخرج لعرض كامل مسيرته الدراسية (درجاته في كل الصفوف والمواسم) التي قضاها في مدرسة الأديب.
          </p>
        </div>
      </div>
    </div>
  );
};

export default GraduatesView;
