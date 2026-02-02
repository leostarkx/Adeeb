
import React, { useMemo, useState } from 'react';
import { Season, GRADE_NAMES, GradeRecord, Subject } from '../types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  Cell, PieChart, Pie, Legend, AreaChart, Area, LineChart, Line, ComposedChart
} from 'recharts';
import { 
  GraduationCap, BookOpen, Users, 
  TrendingUp, AlertCircle, Calendar, 
  Briefcase, Award, ClipboardCheck, ChevronLeft,
  BarChart3, PieChart as PieIcon, Activity, Target,
  ChevronDown, Filter
} from 'lucide-react';

interface Props {
  season: Season;
}

const StatsView: React.FC<Props> = ({ season }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'subjects' | 'monthly'>('overview');
  const [selectedGrade, setSelectedGrade] = useState<number>(5); // الافتراضي 5 للتحليل الشهري
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');

  // 1. حسابات الطلاب العامة
  const studentStats = useMemo(() => {
    const total = season.students.length;
    const active = season.students.filter(s => s.status === 'active' || !s.status).length;
    const dismissed = season.students.filter(s => s.status === 'dismissed').length;
    return { total, active, dismissed };
  }, [season.students]);

  // 2. تحليل مستويات الطلاب (الهرم الدراسي)
  const levelDistribution = useMemo(() => {
    const grades = season.grades.filter(g => g.finalResult !== undefined);
    const levels = [
      { name: 'امتياز (90-100)', range: [90, 100], count: 0, color: '#059669' },
      { name: 'جيد جداً (80-89)', range: [80, 89], count: 0, color: '#10b981' },
      { name: 'جيد (70-79)', range: [70, 79], count: 0, color: '#3b82f6' },
      { name: 'متوسط (60-69)', range: [60, 69], count: 0, color: '#f59e0b' },
      { name: 'مقبول (50-59)', range: [50, 59], count: 0, color: '#6366f1' },
      { name: 'راسب (تحت 50)', range: [0, 49], count: 0, color: '#ef4444' },
    ];

    grades.forEach(g => {
      const val = g.finalResult || 0;
      // تصحيح النطاق للصفوف الأولية (تحويل من 10 إلى 100 لغرض الإحصاء)
      const normalized = val <= 10 ? val * 10 : val;
      const level = levels.find(l => normalized >= l.range[0] && normalized <= l.range[1]);
      if (level) level.count++;
    });

    return levels.filter(l => l.count > 0);
  }, [season.grades]);

  // 3. مقارنة الصفوف الستة
  const gradeComparison = useMemo(() => {
    return [1, 2, 3, 4, 5, 6].map(g => {
      const studentsInGrade = season.students.filter(s => s.grade === g && s.status !== 'dismissed');
      const gradeResults = season.grades.filter(gr => studentsInGrade.some(s => s.id === gr.studentId));
      const passMark = g <= 4 ? 5 : 50;
      
      const totalEntries = gradeResults.length;
      const passCount = gradeResults.filter(gr => (gr.finalResult ?? 0) >= passMark).length;
      
      return {
        name: GRADE_NAMES[g],
        'نسبة النجاح': totalEntries > 0 ? Math.round((passCount / totalEntries) * 100) : 0,
        'المتوسط العام': totalEntries > 0 ? Math.round(gradeResults.reduce((a, b) => a + (b.finalResult || 0), 0) / totalEntries) : 0,
        'الطلاب': studentsInGrade.length
      };
    });
  }, [season]);

  // 4. التحليل الشهري للمادة المختارة
  const monthlyAnalysis = useMemo(() => {
    if (!selectedSubjectId) return [];
    
    const months: (keyof GradeRecord)[] = ['october', 'november', 'december', 'february', 'march', 'april'];
    const monthNames = ['تشرين 1', 'تشرين 2', 'كانون 1', 'شباط', 'آذار', 'نيسان'];
    
    return months.map((month, idx) => {
      const monthlyGrades = season.grades.filter(g => g.subjectId === selectedSubjectId && g[month] !== undefined);
      const total = monthlyGrades.length;
      const passCount = monthlyGrades.filter(g => (Number(g[month]) || 0) >= 50).length;
      const avg = total > 0 ? Math.round(monthlyGrades.reduce((a, b) => a + (Number(b[month]) || 0), 0) / total) : 0;

      return {
        name: monthNames[idx],
        'نسبة النجاح': total > 0 ? Math.round((passCount / total) * 100) : 0,
        'متوسط الدرجة': avg
      };
    });
  }, [season.grades, selectedSubjectId]);

  return (
    <div className="space-y-10 pb-32 animate-in fade-in">
      
      {/* تبويبات الإحصائيات الذكية */}
      <div className="flex bg-white p-2 rounded-[2rem] shadow-sm w-fit border border-slate-100 mx-auto no-print">
        <button onClick={() => setActiveTab('overview')} className={`px-8 py-4 rounded-2xl font-black flex items-center gap-2 transition-all ${activeTab === 'overview' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}>
          <BarChart3 size={20} /> نظرة عامة
        </button>
        <button onClick={() => setActiveTab('subjects')} className={`px-8 py-4 rounded-2xl font-black flex items-center gap-2 transition-all ${activeTab === 'subjects' ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}>
          <Target size={20} /> كفاءة المواد
        </button>
        <button onClick={() => setActiveTab('monthly')} className={`px-8 py-4 rounded-2xl font-black flex items-center gap-2 transition-all ${activeTab === 'monthly' ? 'bg-amber-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}>
          <Activity size={20} /> التحليل الشهري
        </button>
      </div>

      {activeTab === 'overview' && (
        <>
          {/* البطاقات السريعة */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl"><Users size={24} /></div>
                <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">نشط الآن</span>
              </div>
              <p className="text-[10px] font-black text-slate-400 mb-1">إجمالي طلاب المدرسة</p>
              <h4 className="text-4xl font-black text-slate-800">{studentStats.total} <span className="text-sm font-bold text-slate-300">تلميذ</span></h4>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div className="p-4 bg-purple-50 text-purple-600 rounded-2xl"><GraduationCap size={24} /></div>
                <span className="text-[10px] font-black text-purple-600 bg-purple-50 px-3 py-1 rounded-full">كادر الأديب</span>
              </div>
              <p className="text-[10px] font-black text-slate-400 mb-1">الهيئة التعليمية</p>
              <h4 className="text-4xl font-black text-slate-800">{season.teachers.length} <span className="text-sm font-bold text-slate-300">معلم</span></h4>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div className="p-4 bg-amber-50 text-amber-600 rounded-2xl"><ClipboardCheck size={24} /></div>
                <span className="text-[10px] font-black text-amber-600 bg-amber-50 px-3 py-1 rounded-full">تحديث يومي</span>
              </div>
              <p className="text-[10px] font-black text-slate-400 mb-1">سجل الغيابات الكلي</p>
              <h4 className="text-4xl font-black text-slate-800">{season.attendance.filter(a => a.type === 'absent').length} <span className="text-sm font-bold text-slate-300">يوم</span></h4>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl"><Award size={24} /></div>
                <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">نسبة عامة</span>
              </div>
              <p className="text-[10px] font-black text-slate-400 mb-1">متوسط النجاح العام</p>
              <h4 className="text-4xl font-black text-slate-800">{gradeComparison.reduce((a, b) => a + b['نسبة النجاح'], 0) / 6 | 0}%</h4>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* هرم مستويات الطلاب */}
            <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm">
              <h3 className="text-xl font-black text-slate-800 flex items-center gap-3 mb-8">
                <PieIcon className="text-emerald-500" /> هرم التميز العلمي
              </h3>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={levelDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={100}
                      outerRadius={140}
                      paddingAngle={5}
                      dataKey="count"
                      stroke="none"
                    >
                      {levelDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ borderRadius: '25px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }}
                    />
                    <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '10px', fontWeight: '900' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* مقارنة الصفوف */}
            <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm">
              <h3 className="text-xl font-black text-slate-800 flex items-center gap-3 mb-8">
                <BarChart3 className="text-blue-500" /> مقارنة الأداء بين الصفوف
              </h3>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={gradeComparison}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fontWeight: 'bold' }} />
                    <YAxis unit="%" tick={{ fontSize: 10, fontWeight: 'bold' }} />
                    <Tooltip contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                    <Legend />
                    <Bar dataKey="نسبة النجاح" fill="#3b82f6" radius={[10, 10, 0, 0]} barSize={40} />
                    <Bar dataKey="المتوسط العام" fill="#8b5cf6" radius={[10, 10, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === 'subjects' && (
        <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm animate-in slide-in-bottom">
          <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
            <div>
              <h3 className="text-2xl font-black text-slate-800">تحليل كفاءة المواد الدراسية</h3>
              <p className="text-sm text-slate-400 font-bold">نسبة النجاح لكل مادة حسب الصف المختار</p>
            </div>
            <div className="flex gap-2 p-1.5 bg-slate-50 rounded-2xl overflow-x-auto max-w-full">
              {[1, 2, 3, 4, 5, 6].map(g => (
                <button key={g} onClick={() => setSelectedGrade(g)} className={`px-5 py-2 rounded-xl font-black text-xs transition-all whitespace-nowrap ${selectedGrade === g ? 'bg-white text-purple-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
                  الصف {GRADE_NAMES[g]}
                </button>
              ))}
            </div>
          </div>

          <div className="h-[500px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={gradeComparison[selectedGrade - 1] ? (season.subjects[selectedGrade] || []).map(sub => {
                const subGrades = season.grades.filter(g => g.subjectId === sub.id);
                const passMark = selectedGrade <= 4 ? 5 : 50;
                const passes = subGrades.filter(g => (g.finalResult ?? 0) >= passMark).length;
                return {
                  name: sub.name,
                  'نسبة النجاح': subGrades.length > 0 ? Math.round((passes / subGrades.length) * 100) : 0,
                  'المتوسط العام': subGrades.length > 0 ? Math.round(subGrades.reduce((a, b) => a + (b.finalResult || 0), 0) / subGrades.length * (selectedGrade <= 4 ? 10 : 1)) : 0
                };
              }) : []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fontWeight: 'bold' }} />
                <YAxis unit="%" tick={{ fontSize: 10, fontWeight: 'bold' }} />
                <Tooltip contentStyle={{ borderRadius: '20px', border: 'none' }} />
                <Legend />
                <Bar dataKey="نسبة النجاح" fill="#8b5cf6" radius={[15, 15, 0, 0]} barSize={50} />
                <Line type="monotone" dataKey="المتوسط العام" stroke="#f59e0b" strokeWidth={4} dot={{ r: 6, fill: '#f59e0b', strokeWidth: 2, stroke: '#fff' }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {activeTab === 'monthly' && (
        <div className="space-y-8 animate-in slide-in-bottom">
          <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm">
            <div className="flex flex-col md:flex-row gap-8 mb-10 items-end">
               <div className="flex-1 space-y-3">
                 <label className="text-[10px] font-black text-slate-400 mr-4">1. اختر الصف (5-6 فقط)</label>
                 <div className="flex gap-2">
                   {[5, 6].map(g => (
                     <button key={g} onClick={() => {setSelectedGrade(g); setSelectedSubjectId('');}} className={`flex-1 py-4 rounded-2xl font-black transition-all ${selectedGrade === g ? 'bg-amber-500 text-white' : 'bg-slate-50 text-slate-400'}`}>
                       {GRADE_NAMES[g]}
                     </button>
                   ))}
                 </div>
               </div>
               <div className="flex-1 space-y-3">
                 <label className="text-[10px] font-black text-slate-400 mr-4">2. اختر المادة للتحليل الشهري</label>
                 <div className="relative">
                   <select 
                    value={selectedSubjectId} 
                    onChange={e => setSelectedSubjectId(e.target.value)}
                    className="w-full p-4 bg-slate-50 border-2 border-slate-50 rounded-2xl font-black text-slate-800 outline-none focus:border-amber-500 appearance-none"
                   >
                     <option value="">-- اختر المادة --</option>
                     {(season.subjects[selectedGrade] || []).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                   </select>
                   <ChevronDown className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                 </div>
               </div>
            </div>

            {selectedSubjectId ? (
              <div className="h-[500px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyAnalysis}>
                    <defs>
                      <linearGradient id="colorMonth" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" tick={{ fontSize: 12, fontWeight: 'bold' }} />
                    <YAxis unit="%" tick={{ fontSize: 12, fontWeight: 'bold' }} />
                    <Tooltip contentStyle={{ borderRadius: '25px', border: 'none' }} />
                    <Legend />
                    <Area type="monotone" dataKey="نسبة النجاح" stroke="#f59e0b" strokeWidth={5} fillOpacity={1} fill="url(#colorMonth)" />
                    <Area type="monotone" dataKey="متوسط الدرجة" stroke="#3b82f6" strokeWidth={5} fillOpacity={0} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="py-32 text-center text-slate-300">
                <Filter size={80} className="mx-auto opacity-10 mb-6" />
                <p className="text-2xl font-black italic">يرجى اختيار مادة لعرض تسلسل النجاح الشهري</p>
              </div>
            )}
          </div>

          {/* تنبيهات الذكاء الإداري */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <div className="bg-red-50 border-2 border-red-100 p-8 rounded-[3rem] flex items-center gap-6">
                <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center animate-pulse"><AlertCircle size={32} /></div>
                <div>
                  <h4 className="font-black text-red-800">أقل نسبة نجاح مسجلة</h4>
                  <p className="text-sm font-bold text-red-600 italic">مادة: {(monthlyAnalysis.sort((a,b) => a['نسبة النجاح'] - b['نسبة النجاح'])[0]?.name) || '---'}</p>
                </div>
             </div>
             <div className="bg-emerald-50 border-2 border-emerald-100 p-8 rounded-[3rem] flex items-center gap-6">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center shadow-sm"><Award size={32} /></div>
                <div>
                  <h4 className="font-black text-emerald-800">أعلى أداء طلابي</h4>
                  <p className="text-sm font-bold text-emerald-600 italic">مادة: {(monthlyAnalysis.sort((a,b) => b['متوسط الدرجة'] - a['متوسط الدرجة'])[0]?.name) || '---'}</p>
                </div>
             </div>
          </div>
        </div>
      )}

      {/* تذييل بسيط للإحصائيات */}
      <div className="text-center text-slate-300 font-bold text-[10px] mt-10">
        جميع الإحصائيات مستخرجة بناءً على البيانات المرصودة في مدرسة الأديب لموسم {season.name}
      </div>
    </div>
  );
};

export default StatsView;
