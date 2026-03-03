
import React, { useState, useMemo } from 'react';
import { Season, Student, GRADE_NAMES, AttendanceRecord, User as AppUser } from '../types';
import { 
  Calendar, 
  Search, 
  UserX, 
  CheckCircle2, 
  AlertTriangle, 
  CalendarDays, 
  ShieldAlert,
  UserCheck,
  PlaneTakeoff,
  RotateCcw,
  Coffee,
  Flag
} from 'lucide-react';
import { toArabicNums } from '../utils/calculations';

interface Props {
  season: Season;
  onUpdate: (updates: Partial<Season>) => void;
  currentUser: AppUser | null;
}

const AttendanceManager: React.FC<Props> = ({ season, onUpdate, currentUser }) => {
  const isTeacher = currentUser?.role === 'teacher';
  const teacherId = currentUser?.linkedId;

  const teacherAssignments = useMemo(() => {
    if (!isTeacher || !teacherId) return [];
    const teacher = (season.teachers || []).find(t => t.id === teacherId);
    return teacher?.assignments || [];
  }, [isTeacher, teacherId, season.teachers]);

  const [selectedGrade, setSelectedGrade] = useState<number>(() => {
    if (isTeacher && teacherAssignments.length > 0) return teacherAssignments[0].gradeId;
    return 1;
  });

  const [selectedSection, setSelectedSection] = useState<string>(() => {
    if (isTeacher && teacherAssignments.length > 0) return teacherAssignments[0].sectionName;
    return '';
  });

  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [searchTerm, setSearchTerm] = useState('');

  const attendance = season.attendance || [];
  const holidays = season.holidays || [];

  // دالة جلب اسم اليوم بالعربية مع التأكد من تحديثها عند تغيير التاريخ
  const getArabicDayName = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      return new Intl.DateTimeFormat('ar-IQ', { weekday: 'long' }).format(date);
    } catch (e) {
      return 'تاريخ غير صالح';
    }
  };

  const isFriday = useMemo(() => {
    const date = new Date(selectedDate);
    return date.getDay() === 5; // 5 هو الجمعة في JS
  }, [selectedDate]);

  const isOfficialHoliday = useMemo(() => {
    return holidays.includes(selectedDate);
  }, [selectedDate, holidays]);

  const toggleHoliday = () => {
    let newHolidays = [...holidays];
    let newAttendance = [...attendance];

    if (isOfficialHoliday) {
      newHolidays = newHolidays.filter(d => d !== selectedDate);
    } else {
      newHolidays.push(selectedDate);
      // مسح سجلات هذا اليوم إذا أصبح عطلة
      newAttendance = newAttendance.filter(r => r.date !== selectedDate);
    }
    onUpdate({ holidays: newHolidays, attendance: newAttendance });
  };

  const filteredStudents = useMemo(() => {
    return (season.students || []).filter(s => 
      s.grade === selectedGrade && 
      s.section === selectedSection &&
      (searchTerm === '' || s.name.includes(searchTerm) || s.registerNumber?.includes(searchTerm))
    ).sort((a, b) => a.name.localeCompare(b.name, 'ar'));
  }, [season.students, selectedGrade, selectedSection, searchTerm]);

  const getAbsenceCount = (studentId: string) => {
    return attendance.filter(record => record.studentId === studentId && record.type === 'absent').length;
  };

  const getExcusedCount = (studentId: string) => {
    return attendance.filter(record => record.studentId === studentId && record.type === 'excused').length;
  };

  const getAttendanceForDate = (studentId: string, date: string) => {
    return attendance.find(record => record.studentId === studentId && record.date === date);
  };

  const setStatus = (studentId: string, type: 'absent' | 'excused' | 'present') => {
    if (isFriday || isOfficialHoliday) return;

    let newAttendance = [...attendance];
    newAttendance = newAttendance.filter(r => !(r.studentId === studentId && r.date === selectedDate));

    if (type !== 'present') {
      newAttendance.push({ studentId, date: selectedDate, type });
    }

    // تحديث حالة الفصل إذا وصل لـ 51 يوم غياب فعلي (غير المجاز)
    const newAbsentTotal = newAttendance.filter(r => r.studentId === studentId && r.type === 'absent').length;
    let newStudents = [...(season.students || [])];
    const studentIdx = newStudents.findIndex(s => s.id === studentId);
    
    if (studentIdx > -1) {
      if (newAbsentTotal >= 51) {
        newStudents[studentIdx] = { ...newStudents[studentIdx], status: 'dismissed' };
      } else if (newAbsentTotal < 51 && newStudents[studentIdx].status === 'dismissed') {
        newStudents[studentIdx] = { ...newStudents[studentIdx], status: 'active' };
      }
    }

    onUpdate({ 
      attendance: newAttendance,
      students: newStudents
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in pb-20">
      {/* واجهة اختيار التاريخ */}
      <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-gray-100">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-black text-slate-400 mr-2">تاريخ اليوم واليوم</label>
              <button 
                onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
                className="text-[10px] font-black bg-blue-50 text-blue-600 px-3 py-1 rounded-lg hover:bg-blue-100 flex items-center gap-1"
              >
                <RotateCcw size={12} /> العودة لليوم الحالي
              </button>
            </div>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <CalendarDays className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-500" size={24} />
                <input 
                  type="date" 
                  value={selectedDate} 
                  onChange={e => setSelectedDate(e.target.value)}
                  className="w-full pr-14 pl-4 py-5 border-2 border-slate-100 rounded-3xl outline-none font-black text-xl text-slate-900 bg-slate-50 focus:bg-white focus:border-blue-600 transition-all"
                />
              </div>
              <div className={`px-8 py-4 rounded-3xl flex flex-col justify-center items-center shadow-lg min-w-[120px] transition-colors ${isFriday || isOfficialHoliday ? 'bg-red-600' : 'bg-blue-600'} text-white`}>
                <span className="text-[10px] font-bold opacity-80">{isFriday ? 'عطلة جمعة' : 'اليوم'}</span>
                <span className="text-xl font-black">{getArabicDayName(selectedDate)}</span>
              </div>
            </div>

            {!isFriday && (
              <button 
                onClick={toggleHoliday}
                className={`w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-sm transition-all border-2 ${
                  isOfficialHoliday 
                    ? 'bg-red-50 border-red-200 text-red-600' 
                    : 'bg-emerald-50 border-emerald-100 text-emerald-600'
                }`}
              >
                <Flag size={18} />
                {isOfficialHoliday ? 'إلغاء العطلة الرسمية' : 'تحديد كعطلة رسمية (لا يُحسب غياب)'}
              </button>
            )}
          </div>

          <div className="lg:col-span-7 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-black text-slate-400 mb-3 mr-2">{isTeacher ? 'الصفوف المعينة لك' : 'الصف'}</label>
              <div className="flex gap-1 overflow-x-auto pb-2 custom-scrollbar">
                {(isTeacher ? Array.from(new Set(teacherAssignments.map(a => a.gradeId))) : [1, 2, 3, 4, 5, 6] as number[]).map((g: number) => (
                  <button 
                    key={g} 
                    onClick={() => {setSelectedGrade(g); setSelectedSection('');}} 
                    className={`px-4 py-3 rounded-xl font-black text-xs min-w-[60px] transition-all ${selectedGrade === g ? 'bg-slate-800 text-white shadow-lg' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                  >
                    {GRADE_NAMES[g]}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-black text-slate-400 mb-3 mr-2">الشعبة</label>
              <select 
                value={selectedSection} 
                onChange={e => setSelectedSection(e.target.value)} 
                className="w-full px-5 py-4 border-2 border-slate-100 rounded-2xl outline-none font-black text-slate-900 bg-slate-50 focus:bg-white focus:border-blue-600 transition-all"
              >
                <option value="">-- اختر الشعبة --</option>
                {(isTeacher 
                  ? Array.from(new Set(teacherAssignments.filter(a => a.gradeId === selectedGrade).map(a => a.sectionName)))
                  : (season.sections?.[selectedGrade] || [])
                ).map((s: string) => <option key={s} value={s}>شعبة {toArabicNums(s)}</option>)}
              </select>
            </div>
          </div>
        </div>
      </div>

      {(isFriday || isOfficialHoliday) ? (
        <div className="bg-white p-24 rounded-[4rem] shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center">
           <div className="w-32 h-32 bg-red-50 rounded-full flex items-center justify-center mb-8 animate-pulse">
            <Coffee size={64} className="text-red-500" />
           </div>
           <h3 className="text-3xl font-black text-red-600 mb-4">{isFriday ? 'عطلة يوم الجمعة' : 'عطلة رسمية'}</h3>
           <p className="text-xl font-bold text-slate-400 max-w-md">لا يمكن رصد الغياب في أيام العطل لضمان حقوق التلاميذ.</p>
        </div>
      ) : selectedSection ? (
        <div className="bg-white rounded-[3rem] shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-slate-900 p-8 flex flex-col md:flex-row justify-between items-center text-white gap-6">
            <div className="flex items-center gap-4">
               <div className="p-4 bg-white/10 rounded-2xl"><UserCheck className="text-emerald-400" size={28} /></div>
               <div>
                 <h3 className="text-xl font-black">رصد حضور تلميذ</h3>
                 <p className="text-xs text-slate-400 mt-1 font-bold italic">{getArabicDayName(selectedDate)} | {toArabicNums(selectedDate)}</p>
               </div>
            </div>
            <div className="relative w-full md:w-80">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input 
                type="text" 
                placeholder="بحث بالاسم أو رقم القيد..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pr-12 pl-4 py-3 bg-white/5 border border-white/10 rounded-xl font-bold outline-none focus:bg-white text-black text-sm"
              />
            </div>
          </div>

          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredStudents.map(student => {
                const record = getAttendanceForDate(student.id, selectedDate);
                const absentCount = getAbsenceCount(student.id);
                const excusedCount = getExcusedCount(student.id);
                const isDismissed = student.status === 'dismissed';

                return (
                  <div 
                    key={student.id} 
                    className={`relative p-8 rounded-[3rem] border-2 transition-all flex flex-col items-center text-center group ${
                      record?.type === 'absent' ? 'border-red-500 bg-red-50' : 
                      record?.type === 'excused' ? 'border-amber-400 bg-amber-50/50' : 
                      'border-slate-50 hover:border-blue-200'
                    } ${isDismissed ? 'bg-slate-100 opacity-60 grayscale' : ''}`}
                  >
                    <div className="absolute top-6 left-6">
                      {isDismissed ? <ShieldAlert className="text-red-600" size={24} /> :
                       record?.type === 'absent' ? <UserX className="text-red-600" size={24} /> :
                       record?.type === 'excused' ? <PlaneTakeoff className="text-amber-500" size={24} /> :
                       <CheckCircle2 className="text-emerald-500" size={24} />}
                    </div>

                    <div className={`w-20 h-20 rounded-3xl flex items-center justify-center font-black text-3xl mb-4 transition-all ${
                      record?.type === 'absent' ? 'bg-red-600 text-white' : 
                      record?.type === 'excused' ? 'bg-amber-500 text-white' : 
                      'bg-blue-50 text-blue-600'
                    }`}>
                      {student.name[0]}
                    </div>

                    <h4 className="font-black text-xl mb-1 text-slate-800 leading-tight">{student.name}</h4>

                    <div className="flex gap-2 mt-4">
                       <div className="px-3 py-1.5 rounded-xl border border-red-100 bg-red-50 text-red-600 font-black text-[10px]">غائب: {toArabicNums(absentCount)}</div>
                       <div className="px-3 py-1.5 rounded-xl border border-amber-100 bg-amber-50 text-amber-600 font-black text-[10px]">مجاز: {toArabicNums(excusedCount)}</div>
                    </div>

                    <div className="w-full mt-8 grid grid-cols-2 gap-3">
                      <button onClick={() => setStatus(student.id, 'absent')} className={`py-3 rounded-2xl font-black text-xs ${record?.type === 'absent' ? 'bg-red-600 text-white shadow-lg' : 'bg-white text-red-600 border border-red-100 hover:bg-red-50'}`}>غائب</button>
                      <button onClick={() => setStatus(student.id, 'excused')} className={`py-3 rounded-2xl font-black text-xs ${record?.type === 'excused' ? 'bg-amber-500 text-white shadow-lg' : 'bg-white text-amber-500 border border-amber-100 hover:bg-amber-50'}`}>مجاز</button>
                      <button onClick={() => setStatus(student.id, 'present')} className={`col-span-2 py-3 rounded-2xl font-black text-xs ${!record ? 'bg-emerald-600 text-white shadow-lg' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}>حاضر</button>
                    </div>

                    {absentCount >= 51 && !isDismissed && (
                       <p className="mt-4 text-[10px] text-red-600 font-black animate-bounce flex items-center gap-1"><AlertTriangle size={12} /> التلميذ تجاوز الـ {toArabicNums(51)} يوماً</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white p-32 rounded-[4rem] shadow-sm border border-gray-100 flex flex-col items-center justify-center text-slate-300 text-center">
           <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6"><Calendar size={48} className="opacity-20" /></div>
           <p className="text-2xl font-black text-slate-400">اختر الصف والشعبة لعرض سجل الحضور</p>
        </div>
      )}
    </div>
  );
};

export default AttendanceManager;
