
import React, { useState } from 'react';
import { AppState, GRADE_NAMES } from '../types';
import { Trash2, Users, GraduationCap, Calendar, BookOpen, Layers, AlertTriangle, CheckCircle2, ArrowRight } from 'lucide-react';

interface Props {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
}

const DeleteCenter: React.FC<Props> = ({ state, setState }) => {
  const [category, setCategory] = useState<'student' | 'teacher' | 'season' | 'subject' | 'section' | null>(null);
  const [selectedGrade, setSelectedGrade] = useState<number>(1);
  const [targetId, setTargetId] = useState<string>('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

  const activeSeason = state.seasons.find(s => s.id === state.activeSeasonId);

  // دالة الحذف القاطع
  const performFinalDelete = () => {
    if (!targetId) return;

    // إنشاء نسخة جديدة تماماً من البيانات (Deep Copy) لتجنب أي مشاكل مرجعية
    const newState = JSON.parse(JSON.stringify(state)) as AppState;

    if (category === 'season') {
      // حذف موسم كامل
      newState.seasons = newState.seasons.filter(s => s.id !== targetId);
      if (newState.activeSeasonId === targetId) {
        newState.activeSeasonId = newState.seasons.length > 0 ? newState.seasons[0].id : null;
      }
    } else {
      // حذف داخل الموسم النشط
      const seasonIndex = newState.seasons.findIndex(s => s.id === state.activeSeasonId);
      if (seasonIndex !== -1) {
        const targetSeason = newState.seasons[seasonIndex];

        if (category === 'student') {
          targetSeason.students = targetSeason.students.filter(st => st.id !== targetId);
          targetSeason.grades = targetSeason.grades.filter(g => g.studentId !== targetId);
        } 
        else if (category === 'teacher') {
          targetSeason.teachers = targetSeason.teachers.filter(t => t.id !== targetId);
        } 
        else if (category === 'subject') {
          targetSeason.subjects[selectedGrade] = (targetSeason.subjects[selectedGrade] || []).filter(sub => sub.id !== targetId);
          targetSeason.grades = targetSeason.grades.filter(g => g.subjectId !== targetId);
        } 
        else if (category === 'section') {
          targetSeason.sections[selectedGrade] = (targetSeason.sections[selectedGrade] || []).filter(sec => sec !== targetId);
          // تحرير الطلاب من هذه الشعبة
          targetSeason.students = targetSeason.students.map(st => 
            (st.grade === selectedGrade && st.section === targetId) ? { ...st, section: '' } : st
          );
        }
      }
    }

    // تحديث الحالة النهائية
    setState(newState);
    
    // إعادة تعيين الواجهة
    setTargetId('');
    setIsConfirming(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 animate-in fade-in">
      {/* التنبيه العلوي */}
      <div className="bg-white border-r-8 border-red-600 p-8 rounded-3xl shadow-xl flex items-center gap-6">
        <div className="bg-red-50 p-4 rounded-2xl text-red-600">
          <AlertTriangle size={48} />
        </div>
        <div>
          <h2 className="text-3xl font-black text-slate-800">مركز الحذف القاطع</h2>
          <p className="text-slate-500 font-bold mt-1">هنا يمكنك حذف أي اسم أو فئة بشكل نهائي ومضمون 100%.</p>
        </div>
      </div>

      {/* الخطوة 1: اختيار الفئة */}
      <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
        <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-3">
           <span className="w-8 h-8 bg-slate-800 text-white rounded-lg flex items-center justify-center text-sm">1</span>
           ما الذي تريد حذفه؟
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { id: 'season', label: 'موسم دراسي', icon: Calendar, color: 'text-blue-600' },
            { id: 'teacher', label: 'معلم/مدرس', icon: GraduationCap, color: 'text-purple-600', needSeason: true },
            { id: 'student', label: 'طالب', icon: Users, color: 'text-emerald-600', needSeason: true },
            { id: 'subject', label: 'مادة دراسية', icon: BookOpen, color: 'text-amber-600', needSeason: true },
            { id: 'section', label: 'شعبة', icon: Layers, color: 'text-orange-600', needSeason: true },
          ].map((item) => (
            <button
              key={item.id}
              disabled={item.needSeason && !activeSeason}
              onClick={() => { setCategory(item.id as any); setTargetId(''); setIsConfirming(false); }}
              className={`flex flex-col items-center p-6 rounded-3xl border-2 transition-all ${
                category === item.id 
                  ? 'border-red-600 bg-red-50 shadow-inner scale-105' 
                  : 'border-gray-50 hover:border-gray-200 bg-white'
              } ${item.needSeason && !activeSeason ? 'opacity-20 grayscale' : 'active:scale-95'}`}
            >
              <item.icon className={category === item.id ? 'text-red-600' : item.color} size={32} />
              <span className="font-black mt-3 text-sm">{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* الخطوة 2: اختيار الاسم */}
      {category && (
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 animate-in">
          <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-3">
             <span className="w-8 h-8 bg-slate-800 text-white rounded-lg flex items-center justify-center text-sm">2</span>
             حدد الاسم المطلوب حذفه
          </h3>

          <div className="space-y-6">
            {(category === 'student' || category === 'subject' || category === 'section') && (
              <div className="bg-slate-50 p-4 rounded-2xl flex flex-wrap gap-2">
                {[1,2,3,4,5,6].map(g => (
                  <button
                    key={g}
                    onClick={() => { setSelectedGrade(g); setTargetId(''); setIsConfirming(false); }}
                    className={`flex-1 py-3 rounded-xl font-black text-xs transition-all ${selectedGrade === g ? 'bg-slate-800 text-white' : 'bg-white text-slate-400'}`}
                  >
                    {GRADE_NAMES[g]}
                  </button>
                ))}
              </div>
            )}

            <select
              value={targetId}
              onChange={(e) => { setTargetId(e.target.value); setIsConfirming(false); }}
              className="w-full p-6 border-2 border-slate-100 rounded-3xl font-black text-xl bg-slate-50 outline-none focus:border-red-500 appearance-none"
            >
              <option value="">-- اضغط هنا لاختيار الاسم --</option>
              {category === 'season' && state.seasons.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              {category === 'teacher' && activeSeason?.teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              {category === 'student' && activeSeason?.students.filter(s => s.grade === selectedGrade).map(s => <option key={s.id} value={s.id}>{s.name} (شعبة {s.section})</option>)}
              {category === 'subject' && (activeSeason?.subjects[selectedGrade] || []).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              {category === 'section' && (activeSeason?.sections[selectedGrade] || []).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {/* الخطوة 3: زر الحذف النهائي */}
          {targetId && (
            <div className="mt-8 p-8 border-2 border-dashed border-red-200 rounded-3xl bg-red-50/30 text-center animate-in">
              {!isConfirming ? (
                <button
                  onClick={() => setIsConfirming(true)}
                  className="bg-red-600 text-white px-12 py-5 rounded-full font-black text-xl hover:bg-red-700 shadow-xl shadow-red-100 flex items-center gap-3 mx-auto"
                >
                  <Trash2 size={24} />
                  احذف الآن
                </button>
              ) : (
                <div className="space-y-4">
                  <p className="text-red-600 font-black text-xl">هل أنت متأكد فعلاً؟ لا يمكن التراجع!</p>
                  <div className="flex justify-center gap-4">
                    <button
                      onClick={performFinalDelete}
                      className="bg-red-700 text-white px-10 py-4 rounded-2xl font-black hover:bg-red-900 shadow-xl"
                    >
                      نعم، احذف نهائياً
                    </button>
                    <button
                      onClick={() => setIsConfirming(false)}
                      className="bg-slate-200 text-slate-600 px-10 py-4 rounded-2xl font-black hover:bg-slate-300"
                    >
                      إلغاء
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* إشعار النجاح */}
      {showSuccess && (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 bg-emerald-600 text-white px-12 py-6 rounded-3xl shadow-2xl flex items-center gap-4 animate-bounce z-[100]">
          <CheckCircle2 size={32} />
          <span className="font-black text-2xl">تم الحذف بنجاح تام!</span>
        </div>
      )}

      {!category && (
        <div className="text-center py-24 bg-slate-50/50 rounded-[4rem] border-4 border-dashed border-slate-100">
           <Trash2 size={80} className="mx-auto text-slate-200 mb-6" />
           <p className="text-slate-400 font-black text-2xl">بانتظار اختيارك لفئة الحذف...</p>
        </div>
      )}
    </div>
  );
};

export default DeleteCenter;
