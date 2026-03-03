
import React, { useState, useMemo } from 'react';
import { Season, Student, GradeRecord, GRADE_NAMES } from '../types';
import { calculateGrades, toArabicNums } from '../utils/calculations';
import { Gavel, Star, AlertCircle, CheckCircle2, Info, Users, ArrowRightCircle } from 'lucide-react';

interface Props {
  season: Season;
  onUpdate: (updates: Partial<Season>) => void;
}

interface DecisionCandidate {
  student: Student;
  failingSubjects: {
    subjectId: string;
    subjectName: string;
    currentGrade: number;
    needed: number;
  }[];
  totalNeeded: number;
}

const DecisionManager: React.FC<Props> = ({ season, onUpdate }) => {
  const [decisionAmount, setDecisionAmount] = useState<5 | 10>(5);
  const [activeGrade, setActiveGrade] = useState<5 | 6>(5);

  // حساب المرشحين للقرار
  const candidates = useMemo(() => {
    const students = (season.students || []).filter(s => s.grade === activeGrade && s.status !== 'dismissed');
    const result: DecisionCandidate[] = [];

    students.forEach(student => {
      const studentGrades = (season.grades || []).filter(g => g.studentId === student.id);
      const subjects = season.subjects?.[activeGrade] || [];
      
      const failing: DecisionCandidate['failingSubjects'] = [];
      let totalNeeded = 0;

      subjects.forEach(sub => {
        const record = studentGrades.find(g => g.subjectId === sub.id);
        const grade = record?.finalResult ?? 0;
        
        if (grade < 50) {
          const needed = 50 - grade;
          failing.push({
            subjectId: sub.id,
            subjectName: sub.name,
            currentGrade: grade,
            needed
          });
          totalNeeded += needed;
        }
      });

      // إذا كانت الدرجات المطلوبة تكفيها الـ 5 أو 10 درجات
      if (totalNeeded > 0 && totalNeeded <= decisionAmount) {
        result.push({
          student,
          failingSubjects: failing.sort((a, b) => b.currentGrade - a.currentGrade), // الأقرب للنجاح أولاً
          totalNeeded
        });
      }
    });

    return result;
  }, [season, activeGrade, decisionAmount]);

  const applyDecision = (candidate: DecisionCandidate) => {
    if (!confirm(`هل أنت متأكد من تطبيق قرار الـ ${decisionAmount} درجات للتلميذ ${candidate.student.name}؟`)) return;

    let newGrades = [...season.grades];
    let remainingDecision = decisionAmount;

    // توزيع الدرجات (الأقرب للنجاح يأخذ أولاً كما طلبت)
    candidate.failingSubjects.forEach(sub => {
      const needed = 50 - sub.currentGrade;
      if (remainingDecision >= needed) {
        const existingIndex = newGrades.findIndex(g => g.studentId === candidate.student.id && g.subjectId === sub.subjectId);
        
        if (existingIndex > -1) {
          newGrades[existingIndex] = calculateGrades({
            ...newGrades[existingIndex],
            decisionApplied: needed
          }, false) as GradeRecord;
          remainingDecision -= needed;
        }
      }
    });

    onUpdate({ grades: newGrades });
    alert('تم تطبيق القرار بنجاح. سيظهر التلميذ الآن ناجحاً في سجلاته.');
  };

  const removeDecision = (studentId: string) => {
    if (!confirm('هل تريد إلغاء درجات القرار لهذا التلميذ؟')) return;
    
    const newGrades = season.grades.map(g => {
      if (g.studentId === studentId && g.decisionApplied !== undefined) {
        const { decisionApplied, ...rest } = g;
        return calculateGrades(rest, false) as GradeRecord;
      }
      return g;
    });

    onUpdate({ grades: newGrades });
  };

  const alreadyDetermined = useMemo(() => {
    return (season.students || []).filter(s => {
      if (s.grade !== activeGrade) return false;
      return (season.grades || []).some(g => g.studentId === s.id && g.decisionApplied !== undefined);
    });
  }, [season, activeGrade]);

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in pb-20">
      {/* رأس القسم */}
      <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex items-center gap-5">
           <div className="p-5 bg-blue-600 text-white rounded-[2rem] shadow-xl shadow-blue-100">
             <Gavel size={40} />
           </div>
           <div>
             <h2 className="text-3xl font-black text-slate-800">مركز القرار الإداري</h2>
             <p className="text-slate-400 font-bold mt-1">نظام تطبيق قرارات النجاح (5 و 10 درجات)</p>
           </div>
        </div>

        <div className="flex bg-slate-50 p-2 rounded-[2rem] border-2 border-slate-100">
           <button 
             onClick={() => setDecisionAmount(5)}
             className={`px-8 py-3 rounded-2xl font-black transition-all ${decisionAmount === 5 ? 'bg-white text-blue-600 shadow-md scale-105' : 'text-slate-400 hover:text-slate-600'}`}
           >
             قرار الـ {toArabicNums(5)} درجات
           </button>
           <button 
             onClick={() => setDecisionAmount(10)}
             className={`px-8 py-3 rounded-2xl font-black transition-all ${decisionAmount === 10 ? 'bg-white text-blue-600 shadow-md scale-105' : 'text-slate-400 hover:text-slate-600'}`}
           >
             قرار الـ {toArabicNums(10)} درجات
           </button>
        </div>
      </div>

      <div className="flex gap-4">
        {[5, 6].map(g => (
          <button 
            key={g} 
            onClick={() => setActiveGrade(g as any)}
            className={`flex-1 py-5 rounded-[2rem] font-black text-xl transition-all border-4 ${
              activeGrade === g 
                ? 'bg-slate-900 text-white border-slate-900 shadow-xl' 
                : 'bg-white text-slate-400 border-slate-50 hover:border-slate-100'
            }`}
          >
            الصف {GRADE_NAMES[g]} الابتدائي
          </button>
        ))}
      </div>

      {/* تنبيهات النظام */}
      <div className="bg-blue-50 border-2 border-blue-100 p-6 rounded-[2.5rem] flex items-start gap-5 text-blue-800">
        <Info size={32} className="shrink-0 mt-1" />
        <div>
           <h4 className="font-black text-xl mb-1">تعليمات النظام الذكي</h4>
           <p className="text-sm font-bold opacity-80 leading-relaxed">
             يقوم النظام آلياً بفرز التلاميذ الذين يحتاجون إلى (درجات مساعدة) لتغيير نتيجتهم من (مكمل/راسب) إلى (ناجح).
             التوزيع يتم حسب الأولوية للمواد ذات الدرجة الأعلى لتقليل عدد درجات القرار المستخدمة.
           </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* قائمة المرشحين */}
        <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm">
          <h3 className="text-xl font-black text-slate-800 mb-8 flex items-center gap-3">
             <Users className="text-blue-600" /> مرشحو النجاح بقرار ({toArabicNums(candidates.length)})
          </h3>

          <div className="space-y-6">
            {candidates.length === 0 ? (
              <div className="py-20 text-center text-slate-300 italic">لا يوجد تلاميذ مرشحون حالياً...</div>
            ) : candidates.map(c => (
              <div key={c.student.id} className="p-6 bg-slate-50 rounded-[2rem] border-2 border-white shadow-sm hover:border-blue-200 transition-all group">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h4 className="font-black text-slate-800 text-lg">{c.student.name}</h4>
                    <p className="text-xs font-bold text-slate-400">شعبة: {c.student.section} | مكمل بـ {toArabicNums(c.failingSubjects.length)} مواد</p>
                  </div>
                  <div className="bg-blue-600 text-white px-4 py-1.5 rounded-full text-xs font-black">يحتاج {toArabicNums(c.totalNeeded)} درجات</div>
                </div>

                <div className="space-y-3 mb-8">
                  {c.failingSubjects.map(sub => (
                    <div key={sub.subjectId} className="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-100">
                       <span className="text-xs font-black text-slate-600">{sub.subjectName}</span>
                       <div className="flex items-center gap-3">
                         <span className="text-xs font-bold text-red-500 line-through">{toArabicNums(sub.currentGrade)}</span>
                         <ArrowRightCircle size={14} className="text-blue-400" />
                         <span className="text-sm font-black text-emerald-600">{toArabicNums(50)}</span>
                       </div>
                    </div>
                  ))}
                </div>

                <button 
                  onClick={() => applyDecision(c)}
                  className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black shadow-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-3"
                >
                  <Star size={18} /> تطبيق قرار الـ {toArabicNums(decisionAmount)} درجات
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* قائمة المطبق عليهم القرار */}
        <div className="bg-white p-8 rounded-[3rem] border border-gray-100 shadow-sm">
           <h3 className="text-xl font-black text-slate-800 mb-8 flex items-center gap-3">
             <CheckCircle2 className="text-emerald-600" /> الذين شملهم القرار ({toArabicNums(alreadyDetermined.length)})
           </h3>

           <div className="space-y-4">
             {alreadyDetermined.length === 0 ? (
               <div className="py-20 text-center text-slate-300 italic">لم يتم تطبيق القرار على أي تلميذ بعد</div>
             ) : alreadyDetermined.map(s => {
               const decGrades = season.grades.filter(g => g.studentId === s.id && g.decisionApplied !== undefined);
               const totalDec = decGrades.reduce((acc, g) => acc + (g.decisionApplied || 0), 0);
               return (
                 <div key={s.id} className="p-5 border-2 border-emerald-50 rounded-[2rem] flex items-center justify-between group hover:bg-emerald-50/30 transition-all">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center font-black">
                         {s.name[0]}
                       </div>
                       <div>
                         <p className="font-black text-slate-800">{s.name}</p>
                         <p className="text-[10px] font-bold text-emerald-600 uppercase">تمت إضافة {toArabicNums(totalDec)} درجات قرار</p>
                       </div>
                    </div>
                    <button 
                      onClick={() => removeDecision(s.id)}
                      className="p-3 bg-red-50 text-red-400 rounded-xl opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600 hover:text-white"
                    >
                      إلغاء
                    </button>
                 </div>
               );
             })}
           </div>

           <div className="mt-12 p-8 bg-amber-50 border-2 border-dashed border-amber-200 rounded-[2.5rem] flex items-center gap-5">
              <AlertCircle className="text-amber-600 shrink-0" size={32} />
              <p className="text-xs font-bold text-amber-800 leading-relaxed">
                ملاحظة: درجات القرار تظهر في النتائج النهائية فقط (بعد الدور الأول أو الثاني) لتغيير النتيجة النهائية للتلميذ.
              </p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default DecisionManager;
