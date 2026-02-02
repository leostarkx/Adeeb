
import React, { useState, useMemo } from 'react';
import { Season, AppState, GRADE_NAMES, Student, Graduate } from '../types';
import { ArrowUpCircle, Info, ChevronRight, CheckCircle2, AlertTriangle, Users, Database, Zap, Medal } from 'lucide-react';
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

    if (!confirm(`هل أنت متأكد من ترحيل ${analysis.passed + analysis.failed} تلميذ إلى موسم ${targetSeason?.name}؟ سيتم ترقية الناجحين وبقاء الراسبين في صفوفهم، ونقل طلاب السادس الناجحين لسجل الخريجين.`)) return;

    setIsProcessing(true);

    const newStudentsInTarget: Student[] = [...(targetSeason?.students || [])];
    const newGraduates: Graduate[] = [...(state.graduates || [])];
    
    season.students.forEach(student => {
      const studentResult = analysis.results.find(r => r.id === student.id);
      
      if (studentResult?.status === 'ناجح') {
        if (student.grade < 6) {
          // ناجح وينتقل للصف التالي
          const promotedStudent: Student = {
            ...student,
            id: `PROMOTED_${student.id}_${Date.now()}`,
            grade: student.grade + 1,
            status: 'active'
          };
          
          const isAlreadyThere = newStudentsInTarget.some(s => s.registerNumber === student.registerNumber && s.name === student.name);
          if (!isAlreadyThere) {
            newStudentsInTarget.push(promotedStudent);
          }
        } else if (student.grade === 6) {
          // ناجح في السادس -> ينتقل لسجل الخريجين العام
          const isAlreadyGraduated = newGraduates.some(g => g.registerNumber === student.registerNumber && g.name === student.name && g.seasonName === season.name);
          if (!isAlreadyGraduated) {
            newGraduates.push({
              id: `GRAD_${student.id}_${Date.now()}`,
              name: student.name,
              registerNumber: student.registerNumber,
              seasonName: season.name,
              graduationYear: season.name.split('-')[0] || new Date().getFullYear().toString()
            });
          }
        }
      } else {
          // راسب أو مكمل أو مفصول -> ينتقل لنفس الصف في الموسم الجديد
          const repeatStudent: Student = {
            ...student,
            id: `REPEATED_${student.id}_${Date.now()}`,
            grade: student.grade,
            status: student.status === 'dismissed' ? 'dismissed' : 'active'
          };
          
          const isAlreadyThere = newStudentsInTarget.some(s => s.registerNumber === student.registerNumber && s.name === student.name);
          if (!isAlreadyThere) {
            newStudentsInTarget.push(repeatStudent);
          }
      }
    });

    // تحديث الحالة العامة
    setState(prev => ({
      ...prev,
      graduates: newGraduates,
      seasons: prev.seasons.map(s => s.id === targetSeasonId ? { ...s, students: newStudentsInTarget } : s)
    }));

    setIsProcessing(false);
    setPromotionSummary({
      total: analysis.total,
      passed: analysis.passed,
      failed: analysis.failed,
      graduated: analysis.graduated
    });
    alert(`تمت عملية الترحيل بنجاح! تم نقل الناجحين للمستوى الأعلى، وبقاء الراسبين في صفوفهم، وأرشفة خريجي السادس في سجل الخريجين العام.`);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in pb-20">
      <div className="bg-white p-12 rounded-[4rem] shadow-sm border border-gray-100">
        <div className="flex flex-col items-center text-center mb-12">
          <div className="w-24 h-24 bg-blue-600 text-white rounded-[2.5rem] flex items-center justify-center mb-6 shadow-xl shadow-blue-100">
            <ArrowUpCircle size={48} />
          </div>
          <h2 className="text-3xl font-black text-slate-800">نظام الترحيل والأرشفة الذكي</h2>
          <p className="text-slate-400 font-bold mt-2">نقل الطلاب للموسم القادم (ترقية الناجحين وبقاء الراسبين) وأرشفة الخريجين</p>
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
                <span className="text-sm font-bold text-emerald-600">ناجحون (ترقية للصف التالي)</span>
                <span className="font-black text-emerald-700">{analysis.passed}</span>
              </div>
              <div className="flex justify-between items-center bg-blue-50 p-4 rounded-2xl border border-blue-100">
                <span className="text-sm font-bold text-blue-600">خريجو السادس (للأرشفة)</span>
                <span className="font-black text-blue-700">{analysis.graduated}</span>
              </div>
              <div className="flex justify-between items-center bg-red-50 p-4 rounded-2xl border border-red-100">
                <span className="text-sm font-bold text-red-600">راسبون (بقاؤهم في نفس الصف)</span>
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
                  <div className="space-y-1">
                    <p>• الناجحون (1-5) سيرقون للصف الأعلى في "{targetSeason.name}".</p>
                    <p>• الراسبون سيبقون في نفس صفهم في "{targetSeason.name}".</p>
                    <p>• خريجو السادس سيتم حفظهم في سجل الخريجين العام.</p>
                  </div>
                </div>
              )}

              <button 
                disabled={!targetSeasonId || isProcessing}
                onClick={handlePromotion}
                className={`w-full py-5 rounded-[2rem] font-black text-xl shadow-xl flex items-center justify-center gap-3 transition-all ${
                  !targetSeasonId || isProcessing
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700 hover:scale-[1.02]'
                }`}
              >
                {isProcessing ? 'جاري الترحيل والأرشفة...' : 'بدء الترحيل العام'}
                <ArrowUpCircle size={24} />
              </button>
            </div>
          </div>
        </div>

        <div className="mt-12 p-8 bg-amber-50 border-2 border-dashed border-amber-200 rounded-[3rem] flex items-center gap-6">
          <div className="p-4 bg-white rounded-2xl text-amber-600 shadow-sm"><AlertTriangle size={32} /></div>
          <div className="text-right">
            <h4 className="font-black text-amber-800 text-xl">تنبيهات هامة</h4>
            <ul className="text-sm font-bold text-amber-700/80 mt-2 list-disc list-inside space-y-1">
              <li>الناجحون في الصفوف 1-5 يتم ترقيتهم درجة دراسية واحدة.</li>
              <li>الراسبون والمكملون والمفصولون يتم ترحيلهم لنفس درجتهم الدراسية الحالية.</li>
              <li>خريجو السادس الناجحون يتم أرشفة بياناتهم في "سجل الخريجين العام" خارج نطاق المواسم.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromotionManager;
