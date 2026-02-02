
import React, { useState, useMemo } from 'react';
import { Season, AppState, GRADE_NAMES, Student } from '../types';
import { ArrowUpCircle, Info, ChevronRight, CheckCircle2, AlertTriangle, Users, Database, Zap } from 'lucide-react';
import { getPrimaryResult } from '../utils/calculations';

interface Props {
  season: Season;
  onUpdate: (updates: Partial<Season>) => void;
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
}

const PromotionManager: React.FC<Props> = ({ season, onUpdate, state, setState }) => {
  const [targetSeasonId, setTargetSeasonId] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [promotionSummary, setPromotionSummary] = useState<{
    total: number;
    passed: number;
    failed: number;
    graduated: number;
  } | null>(null);

  const targetSeason = useMemo(() => 
    state.seasons.find(s => s.id === targetSeasonId),
    [state.seasons, targetSeasonId]
  );

  // تحليل الطلاب في الموسم الحالي
  const analysis = useMemo(() => {
    const students = season.students || [];
    let passed = 0;
    let failed = 0;
    let graduated = 0;

    const results = students.map(student => {
      if (student.status === 'dismissed') return { id: student.id, status: 'مفصول' };

      const studentGrades = (season.grades || [])
        .filter(g => g.studentId === student.id)
        .map(g => g.finalResult);
      
      const res = getPrimaryResult(studentGrades, student.grade <= 4);
      
      if (res.status === 'ناجح') {
        if (student.grade === 6) graduated++;
        else passed++;
      } else {
        failed++;
      }

      return { id: student.id, status: res.status };
    });

    return { total: students.length, passed, failed, graduated, results };
  }, [season]);

  const handlePromotion = () => {
    if (!targetSeasonId) return;
    if (targetSeasonId === season.id) {
      alert('لا يمكن الترحيل لنفس الموسم!');
      return;
    }

    if (!confirm(`هل أنت متأكد من ترحيل ${analysis.passed} تلميذ ناجح إلى موسم ${targetSeason?.name}؟`)) return;

    setIsProcessing(true);

    // المنطق:
    // 1. جلب الطلاب الناجحين (غير طلاب الصف السادس)
    // 2. ترقية صفهم الدراسي بمقدار 1
    // 3. إضافتهم للموسم الهدف
    
    const newStudentsInTarget: Student[] = [...(targetSeason?.students || [])];
    
    season.students.forEach(student => {
      const studentResult = analysis.results.find(r => r.id === student.id);
      
      if (studentResult?.status === 'ناجح') {
        if (student.grade < 6) {
          // ناجح وينتقل للصف التالي
          const promotedStudent: Student = {
            ...student,
            id: `PROMOTED_${student.id}_${Date.now()}`, // توليد ID جديد للموسم الجديد
            grade: student.grade + 1,
            status: 'active'
          };
          
          // التأكد من عدم تكراره في الموسم الهدف (حسب الاسم أو رقم القيد)
          const isAlreadyThere = newStudentsInTarget.some(s => s.registerNumber === student.registerNumber && s.name === student.name);
          if (!isAlreadyThere) {
            newStudentsInTarget.push(promotedStudent);
          }
        }
      } else if (studentResult?.status === 'راسب' || studentResult?.status === 'مكمل') {
          // اختيارياً: يمكن إضافة منطق لبقاء الراسبين في نفس الصف بالموسم الجديد
          // هنا سنكتفي بترحيل الناجحين فقط حسب طلب المعلم
      }
    });

    // تحديث الحالة العامة
    setState(prev => ({
      ...prev,
      seasons: prev.seasons.map(s => s.id === targetSeasonId ? { ...s, students: newStudentsInTarget } : s)
    }));

    setIsProcessing(false);
    setPromotionSummary({
      total: analysis.total,
      passed: analysis.passed,
      failed: analysis.failed,
      graduated: analysis.graduated
    });
    alert(`تمت عملية الترحيل بنجاح! تم نقل ${analysis.passed} تلميذ إلى الموسم الجديد.`);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in pb-20">
      <div className="bg-white p-12 rounded-[4rem] shadow-sm border border-gray-100">
        <div className="flex flex-col items-center text-center mb-12">
          <div className="w-24 h-24 bg-blue-600 text-white rounded-[2.5rem] flex items-center justify-center mb-6 shadow-xl shadow-blue-100">
            <ArrowUpCircle size={48} />
          </div>
          <h2 className="text-3xl font-black text-slate-800">نظام الترحيل والترقية الذكي</h2>
          <p className="text-slate-400 font-bold mt-2">نقل الطلاب الناجحين آلياً من الموسم الحالي إلى الموسم القادم</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* إحصائيات الموسم الحالي */}
          <div className="bg-slate-50 p-8 rounded-[3rem] border border-slate-100">
            <h3 className="font-black text-slate-800 mb-6 flex items-center gap-2">
              <Database size={18} className="text-blue-600" /> تحليل الموسم الحالي
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm">
                <span className="text-sm font-bold text-slate-500">إجمالي التلاميذ</span>
                <span className="font-black text-slate-800">{analysis.total}</span>
              </div>
              <div className="flex justify-between items-center bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
                <span className="text-sm font-bold text-emerald-600">الناجحون (للترقية)</span>
                <span className="font-black text-emerald-700">{analysis.passed}</span>
              </div>
              <div className="flex justify-between items-center bg-blue-50 p-4 rounded-2xl border border-blue-100">
                <span className="text-sm font-bold text-blue-600">خريجو الصف السادس</span>
                <span className="font-black text-blue-700">{analysis.graduated}</span>
              </div>
              <div className="flex justify-between items-center bg-red-50 p-4 rounded-2xl border border-red-100">
                <span className="text-sm font-bold text-red-600">الراسبون والمكملون</span>
                <span className="font-black text-red-700">{analysis.failed}</span>
              </div>
            </div>
          </div>

          {/* إعدادات الترحيل */}
          <div className="bg-white p-8 rounded-[3rem] border-2 border-blue-100 shadow-sm flex flex-col justify-center">
            <h3 className="font-black text-slate-800 mb-6 flex items-center gap-2">
              <Zap size={18} className="text-amber-500" /> وجهة الترحيل
            </h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 mb-2 mr-2">اختر الموسم الدراسي القادم</label>
                <select 
                  value={targetSeasonId} 
                  onChange={e => setTargetSeasonId(e.target.value)}
                  className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-3xl font-black text-lg outline-none focus:border-blue-600 text-slate-900 appearance-none"
                >
                  <option value="">-- اختر موسم الهدف --</option>
                  {state.seasons.filter(s => s.id !== season.id).map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.students?.length || 0} تلميذ حالياً)</option>
                  ))}
                </select>
              </div>

              {targetSeason && (
                <div className="bg-blue-50 p-4 rounded-2xl text-blue-700 text-xs font-bold flex items-start gap-3">
                  <Info size={18} className="shrink-0" />
                  <p>سيتم نقل التلاميذ الناجحين فقط من الصفوف (1-5) وترقيتهم للصف التالي في موسم "{targetSeason.name}".</p>
                </div>
              )}

              <button 
                disabled={!targetSeasonId || analysis.passed === 0 || isProcessing}
                onClick={handlePromotion}
                className={`w-full py-5 rounded-[2rem] font-black text-xl shadow-xl flex items-center justify-center gap-3 transition-all ${
                  !targetSeasonId || analysis.passed === 0 || isProcessing
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700 hover:scale-[1.02]'
                }`}
              >
                {isProcessing ? 'جاري الترحيل...' : 'بدء عملية الترحيل الآن'}
                <ArrowUpCircle size={24} />
              </button>
            </div>
          </div>
        </div>

        {promotionSummary && (
          <div className="mt-8 bg-emerald-50 border-2 border-emerald-100 p-8 rounded-[3rem] animate-in zoom-in">
            <div className="flex items-center gap-4 mb-4">
              <CheckCircle2 size={32} className="text-emerald-600" />
              <h4 className="text-2xl font-black text-emerald-800">اكتمل الترحيل بنجاح!</h4>
            </div>
            <p className="text-emerald-700 font-bold mb-4">تم ترحيل {promotionSummary.passed} تلميذ بنجاح إلى الموسم المختار.</p>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-2xl text-center">
                <p className="text-[10px] font-black text-slate-400">الناجحون المرحلة</p>
                <p className="text-2xl font-black text-emerald-600">{promotionSummary.passed}</p>
              </div>
              <div className="bg-white p-4 rounded-2xl text-center">
                <p className="text-[10px] font-black text-slate-400">الخريجون (سادس)</p>
                <p className="text-2xl font-black text-blue-600">{promotionSummary.graduated}</p>
              </div>
              <div className="bg-white p-4 rounded-2xl text-center">
                <p className="text-[10px] font-black text-slate-400">الباقون في صفوفهم</p>
                <p className="text-2xl font-black text-red-600">{promotionSummary.failed}</p>
              </div>
            </div>
          </div>
        )}

        <div className="mt-12 p-8 bg-amber-50 border-2 border-dashed border-amber-200 rounded-[3rem] flex items-center gap-6">
          <div className="p-4 bg-white rounded-2xl text-amber-600 shadow-sm"><AlertTriangle size={32} /></div>
          <div className="text-right">
            <h4 className="font-black text-amber-800 text-xl">تنبيهات هامة قبل الترحيل</h4>
            <ul className="text-sm font-bold text-amber-700/80 mt-2 list-disc list-inside space-y-1">
              <li>تأكد من رصد كافة درجات الدور الأول (أو الثاني) قبل البدء.</li>
              <li>الترحيل يعتمد على نتيجة "ناجح" النهائية في سجل الدرجات.</li>
              <li>طلاب الصف السادس الناجحون لا يتم ترحيلهم كونهم غادروا المدرسة الابتدائية.</li>
              <li>يفضل عمل "تكرار للموسم" أولاً لتجهيز الشعب والمواد في السنة الجديدة.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromotionManager;
