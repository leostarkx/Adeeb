
import React, { useState, useMemo } from 'react';
import { Season, Student, Teacher, GRADE_NAMES } from '../types';
import { 
  Plus, 
  Trash2, 
  GraduationCap, 
  Users, 
  UserPlus, 
  Search, 
  LayoutGrid,
  Info,
  ChevronLeft,
  ArrowLeft,
  UserCircle2
} from 'lucide-react';

interface Props {
  season: Season;
  onUpdate: (updates: Partial<Season>) => void;
}

const PeopleManager: React.FC<Props> = ({ season, onUpdate }) => {
  const [activeSubTab, setActiveSubTab] = useState<'students' | 'teachers'>('students');
  const [selectedGrade, setSelectedGrade] = useState<number | null>(null);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [studentSearch, setStudentSearch] = useState('');
  
  // حالات إضافة طالب
  const [studentName, setStudentName] = useState('');
  const [studentGrade, setStudentGrade] = useState<number>(1);
  const [studentSection, setStudentSection] = useState<string>('');

  // حالات إضافة معلم
  const [teacherName, setTeacherName] = useState('');
  const [selectedTeacherId, setSelectedTeacherId] = useState<string | null>(null);
  const [assignGrade, setAssignGrade] = useState<number>(1);
  const [assignSection, setAssignSection] = useState<string>('');
  const [assignSubject, setAssignSubject] = useState<string>('');

  // حساب إحصائيات الطلاب
  const stats = useMemo(() => {
    const gradeCounts: Record<number, number> = {};
    const sectionCounts: Record<string, number> = {}; // "grade-section" -> count
    
    [1, 2, 3, 4, 5, 6].forEach(g => {
      const gradeStudents = season.students.filter(s => s.grade === g);
      gradeCounts[g] = gradeStudents.length;
      
      (season.sections[g] || []).forEach(sec => {
        sectionCounts[`${g}-${sec}`] = gradeStudents.filter(s => s.section === sec).length;
      });
    });
    
    return { gradeCounts, sectionCounts };
  }, [season.students, season.sections]);

  // الطلاب المعروضون بناءً على الفلاتر
  const displayedStudents = useMemo(() => {
    let list = season.students;
    if (selectedGrade) list = list.filter(s => s.grade === selectedGrade);
    if (selectedSection) list = list.filter(s => s.section === selectedSection);
    if (studentSearch) list = list.filter(s => s.name.includes(studentSearch));
    return list.sort((a, b) => a.name.localeCompare(b.name, 'ar'));
  }, [season.students, selectedGrade, selectedSection, studentSearch]);

  const addStudent = () => {
    if (!studentName.trim() || !studentSection) {
      alert('يرجى كتابة الاسم واختيار الشعبة');
      return;
    }
    const newStudent: Student = { 
      id: Date.now().toString(), 
      name: studentName, 
      grade: studentGrade, 
      section: studentSection 
    };
    onUpdate({ students: [...(season.students || []), newStudent] });
    setStudentName('');
  };

  const addTeacher = () => {
    if (!teacherName.trim()) return;
    const newTeacher: Teacher = { id: Date.now().toString(), name: teacherName, assignments: [] };
    onUpdate({ teachers: [...(season.teachers || []), newTeacher] });
    setTeacherName('');
  };

  const addAssignment = (tId: string) => {
    if (!assignGrade || !assignSection || !assignSubject) return;
    onUpdate({
      teachers: season.teachers.map(t => 
        t.id === tId ? { ...t, assignments: [...(t.assignments || []), { gradeId: assignGrade, sectionName: assignSection, subjectId: assignSubject }] } : t
      )
    });
  };

  const resetFilters = () => {
    setSelectedGrade(null);
    setSelectedSection(null);
    setStudentSearch('');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* اختيار التبويب */}
      <div className="flex bg-white p-2 rounded-3xl shadow-sm w-fit border border-gray-100 no-print mx-auto">
        <button 
          onClick={() => setActiveSubTab('students')} 
          className={`px-10 py-4 rounded-2xl font-black transition-all flex items-center gap-3 ${activeSubTab === 'students' ? 'bg-blue-600 text-white shadow-xl scale-105' : 'text-slate-400 hover:bg-gray-50'}`}
        >
          <Users size={22} /> شؤون الطلاب
        </button>
        <button 
          onClick={() => setActiveSubTab('teachers')} 
          className={`px-10 py-4 rounded-2xl font-black transition-all flex items-center gap-3 ${activeSubTab === 'teachers' ? 'bg-blue-600 text-white shadow-xl scale-105' : 'text-slate-400 hover:bg-gray-50'}`}
        >
          <GraduationCap size={22} /> الهيئة التعليمية
        </button>
      </div>

      {activeSubTab === 'students' ? (
        <div className="space-y-8">
          {/* قسم الإضافة السريعة */}
          <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-gray-100">
            <h3 className="text-xl font-black mb-8 text-slate-800 flex items-center gap-3">
               <div className="p-2 bg-blue-50 text-blue-600 rounded-xl"><UserPlus size={24} /></div>
               تسجيل تلميذ جديد
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 mr-2">اسم التلميذ الكامل</label>
                <input 
                  type="text" 
                  value={studentName} 
                  onChange={e => setStudentName(e.target.value)} 
                  className="w-full px-6 py-4 border-2 border-slate-50 rounded-2xl outline-none focus:border-blue-600 bg-slate-50/50 font-bold" 
                  placeholder="مثال: محمد علي حسن..." 
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 mr-2">الصف الدراسي</label>
                <select 
                  value={studentGrade} 
                  onChange={e => {setStudentGrade(parseInt(e.target.value)); setStudentSection('');}} 
                  className="w-full px-6 py-4 border-2 border-slate-50 rounded-2xl bg-slate-50/50 font-bold outline-none focus:border-blue-600"
                >
                  {[1,2,3,4,5,6].map(g => <option key={g} value={g}>الصف {GRADE_NAMES[g]}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 mr-2">الشعبة</label>
                <select 
                  value={studentSection} 
                  onChange={e => setStudentSection(e.target.value)} 
                  className="w-full px-6 py-4 border-2 border-slate-50 rounded-2xl bg-slate-50/50 font-bold outline-none focus:border-blue-600"
                >
                  <option value="">اختر الشعبة...</option>
                  {(season.sections?.[studentGrade] || []).map(s => <option key={s} value={s}>شعبة {s}</option>)}
                </select>
              </div>
              <button 
                onClick={addStudent} 
                className="bg-blue-600 text-white py-4 rounded-2xl font-black hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all flex items-center justify-center gap-2"
              >
                <Plus size={20} /> تسجيل التلميذ
              </button>
            </div>
          </div>

          {/* لوحة التحكم في القوائم */}
          <div className="bg-white p-10 rounded-[4rem] shadow-sm border border-gray-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
               <div>
                 <h3 className="text-2xl font-black text-slate-800">إدارة القوائم المدرسية</h3>
                 <p className="text-slate-400 font-bold text-sm mt-1">اختر الصف ثم الشعبة لعرض التلاميذ وتعديل بياناتهم</p>
               </div>
               
               {selectedGrade && (
                 <button 
                   onClick={resetFilters}
                   className="flex items-center gap-2 text-blue-600 font-black text-sm bg-blue-50 px-6 py-3 rounded-2xl hover:bg-blue-100 transition-all"
                 >
                   <ArrowLeft size={18} /> العودة لاختيار الصف
                 </button>
               )}
            </div>

            {/* عرض الصفوف أولاً */}
            {!selectedGrade ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 animate-in">
                {[1, 2, 3, 4, 5, 6].map(g => (
                  <button
                    key={g}
                    onClick={() => setSelectedGrade(g)}
                    className="p-8 rounded-[3rem] border-4 border-slate-50 hover:border-blue-600 hover:bg-blue-50/30 transition-all group flex flex-col items-center text-center bg-white"
                  >
                    <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white mb-6 shadow-xl group-hover:rotate-12 transition-transform">
                      <LayoutGrid size={32} />
                    </div>
                    <span className="text-xl font-black text-slate-800">الصف {GRADE_NAMES[g]}</span>
                    <span className="text-sm font-bold text-slate-400 mt-2">إجمالي الطلاب: {stats.gradeCounts[g]}</span>
                  </button>
                ))}
              </div>
            ) : (
              /* إذا تم اختيار صف، نعرض الشعب */
              <div className="space-y-10 animate-in slide-in-from-right duration-300">
                <div className="flex flex-wrap gap-4 items-center justify-center">
                  {(season.sections[selectedGrade] || []).map(sec => (
                    <button
                      key={sec}
                      onClick={() => setSelectedSection(selectedSection === sec ? null : sec)}
                      className={`px-10 py-5 rounded-[2.5rem] border-4 transition-all flex flex-col items-center gap-2 ${
                        selectedSection === sec 
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-700 shadow-xl scale-105' 
                          : 'border-slate-50 bg-white text-slate-400 hover:border-emerald-100 hover:text-emerald-500'
                      }`}
                    >
                      <span className="text-2xl font-black">شعبة {sec}</span>
                      <span className="text-xs font-bold opacity-60">{stats.sectionCounts[`${selectedGrade}-${sec}`] || 0} تلميذ</span>
                    </button>
                  ))}
                  {(season.sections[selectedGrade] || []).length === 0 && (
                    <p className="text-slate-400 font-bold text-center py-10 italic">لا توجد شعب معرفة لهذا الصف، يرجى إضافتها من "المواد والصفوف"</p>
                  )}
                </div>

                {/* عرض القائمة عند اختيار شعبة */}
                {selectedSection && (
                  <div className="space-y-6 animate-in fade-in duration-500">
                    <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-slate-50 p-6 rounded-[2.5rem]">
                      <h4 className="font-black text-slate-700 flex items-center gap-3">
                        <Users size={20} className="text-emerald-600" />
                        تلاميذ الصف {GRADE_NAMES[selectedGrade]} (شعبة {selectedSection})
                      </h4>
                      <div className="relative w-full md:w-80">
                         <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                         <input 
                           type="text" 
                           value={studentSearch}
                           onChange={(e) => setStudentSearch(e.target.value)}
                           placeholder="بحث داخل الشعبة..."
                           className="w-full pr-12 pl-4 py-3 border-2 border-white rounded-2xl outline-none focus:border-emerald-600 bg-white font-bold text-sm shadow-sm"
                         />
                      </div>
                    </div>

                    <div className="overflow-x-auto rounded-[2rem] border border-slate-100">
                      <table className="w-full text-right">
                        <thead>
                          <tr className="bg-slate-800 text-white">
                            <th className="px-8 py-5 font-black text-sm">اسم التلميذ</th>
                            <th className="px-8 py-5 text-center font-black text-sm no-print">خيارات</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {displayedStudents.map(s => (
                            <tr key={s.id} className="hover:bg-slate-50 transition-colors group">
                              <td className="px-8 py-5 flex items-center gap-4">
                                <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 group-hover:bg-emerald-100 group-hover:text-emerald-600 transition-colors">
                                  <UserCircle2 size={24} />
                                </div>
                                <span className="font-black text-slate-700">{s.name}</span>
                              </td>
                              <td className="px-8 py-5 no-print text-center">
                                <button 
                                  onClick={() => {
                                    if(confirm(`هل تريد حذف التلميذ ${s.name} نهائياً؟`)) {
                                      onUpdate({ 
                                        students: season.students.filter(st => st.id !== s.id),
                                        grades: (season.grades || []).filter(g => g.studentId !== s.id)
                                      });
                                    }
                                  }} 
                                  className="p-3 text-red-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                                >
                                  <Trash2 size={18} />
                                </button>
                              </td>
                            </tr>
                          ))}
                          {displayedStudents.length === 0 && (
                            <tr>
                              <td colSpan={2} className="py-20 text-center">
                                <p className="text-slate-300 font-black text-xl italic">لا يوجد نتائج لعرضها</p>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* واجهة المعلمين */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4 space-y-4 no-print">
            <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm">
              <h3 className="font-black mb-6 text-slate-800 flex items-center gap-2">إضافة معلم جديد</h3>
              <div className="flex flex-col gap-4">
                <input 
                  type="text" 
                  value={teacherName} 
                  onChange={e => setTeacherName(e.target.value)} 
                  placeholder="اسم المعلم..." 
                  className="w-full px-6 py-4 border-2 border-slate-50 rounded-2xl outline-none focus:border-blue-600 bg-slate-50/50 font-bold" 
                />
                <button onClick={addTeacher} className="w-full bg-blue-600 text-white py-4 rounded-2xl shadow-lg active:scale-95 transition-all font-black flex items-center justify-center gap-2">
                  <Plus size={20} /> إضافة المعلم
                </button>
              </div>
            </div>
            <div className="space-y-3">
              {(season.teachers || []).map(t => (
                <div key={t.id} className={`flex items-center justify-between p-2 rounded-2xl border-2 transition-all ${selectedTeacherId === t.id ? 'bg-blue-600 text-white border-blue-600 shadow-xl scale-105' : 'bg-white border-slate-50 hover:border-slate-100 shadow-sm'}`}>
                  <button onClick={() => setSelectedTeacherId(t.id)} className="flex-1 text-right font-black py-4 px-4 truncate outline-none">{t.name}</button>
                  <div className="px-2">
                    <button 
                      onClick={() => {
                        if(confirm('حذف المعلم؟')) {
                          onUpdate({ teachers: season.teachers.filter(tea => tea.id !== t.id) });
                          if (selectedTeacherId === t.id) setSelectedTeacherId(null);
                        }
                      }} 
                      className={`p-2.5 rounded-xl transition-all ${selectedTeacherId === t.id ? 'bg-blue-700 text-white' : 'bg-red-50 text-red-400 hover:bg-red-100'}`}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="lg:col-span-8">
            {selectedTeacherId ? (
              <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm min-h-[500px]">
                {(() => {
                  const teacher = season.teachers.find(t => t.id === selectedTeacherId);
                  if (!teacher) return null;
                  return (
                    <div className="space-y-8">
                      <div className="border-b border-slate-50 pb-6">
                         <h2 className="text-2xl font-black text-slate-800">مهام المعلم: {teacher.name}</h2>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50/50 p-8 rounded-[2.5rem] no-print">
                        <div className="space-y-2">
                          <label className="text-xs font-black text-slate-400 mr-2">الصف</label>
                          <select value={assignGrade} onChange={e => {setAssignGrade(parseInt(e.target.value)); setAssignSection(''); setAssignSubject('');}} className="w-full p-4 border-2 border-white rounded-2xl bg-white font-black outline-none shadow-sm">
                            {[1,2,3,4,5,6].map(g => <option key={g} value={g}>{GRADE_NAMES[g]}</option>)}
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-black text-slate-400 mr-2">الشعبة</label>
                          <select value={assignSection} onChange={e => setAssignSection(e.target.value)} className="w-full p-4 border-2 border-white rounded-2xl bg-white font-black outline-none shadow-sm">
                            <option value="">اختر...</option>
                            {(season.sections?.[assignGrade] || []).map(s => <option key={s} value={s}>شعبة {s}</option>)}
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-black text-slate-400 mr-2">المادة</label>
                          <select value={assignSubject} onChange={e => setAssignSubject(e.target.value)} className="w-full p-4 border-2 border-white rounded-2xl bg-white font-black outline-none shadow-sm">
                            <option value="">اختر...</option>
                            {(season.subjects?.[assignGrade] || []).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                          </select>
                        </div>
                        <button onClick={() => addAssignment(teacher.id)} className="md:col-span-3 bg-blue-600 text-white py-5 rounded-2xl font-black shadow-xl active:scale-95 transition-all">إسناد المهمة</button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {(teacher.assignments || []).map((ass, idx) => {
                          const sub = season.subjects[ass.gradeId]?.find(s => s.id === ass.subjectId);
                          return (
                            <div key={idx} className="p-6 border-2 border-slate-50 rounded-3xl flex justify-between items-center bg-white shadow-sm hover:border-blue-100 transition-all">
                              <div>
                                <p className="font-black text-slate-800 text-lg">{sub?.name || 'مادة غير معروفة'}</p>
                                <p className="text-xs text-slate-400 font-bold mt-1">الصف {GRADE_NAMES[ass.gradeId]} - شعبة {ass.sectionName}</p>
                              </div>
                              <button onClick={() => onUpdate({ teachers: season.teachers.map(t => t.id === teacher.id ? { ...t, assignments: t.assignments.filter((_, i) => i !== idx) } : t) })} className="text-red-300 hover:text-red-600 p-3 hover:bg-red-50 rounded-xl transition-all">
                                <Trash2 size={20} />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}
              </div>
            ) : (
              <div className="h-full min-h-[500px] flex flex-col items-center justify-center bg-slate-50 border-4 border-dashed border-slate-100 rounded-[4rem] text-slate-300 p-10">
                <GraduationCap size={100} className="opacity-10 mb-6" />
                <p className="font-black text-2xl">اختر معلماً لإدارة مهامه</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PeopleManager;
