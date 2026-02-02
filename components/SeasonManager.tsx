
import React, { useState } from 'react';
import { AppState, Season } from '../types';
import { Plus, Check, Trash2, Calendar, Pencil, X, UserCog, Baby, ShieldAlert, Copy, Edit2 } from 'lucide-react';

interface Props {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
}

const SeasonManager: React.FC<Props> = ({ state, setState }) => {
  const [newName, setNewName] = useState('');
  const [newManager, setNewManager] = useState('');
  const [minYear, setMinYear] = useState<number>(new Date().getFullYear() - 6);
  const [maxYear, setMaxYear] = useState<number>(new Date().getFullYear() - 12);
  
  // Edit State
  const [editingSeasonId, setEditingSeasonId] = useState<string | null>(null);

  const addSeason = () => {
    if (!newName.trim()) return;
    
    if (editingSeasonId) {
      setState(prev => ({
        ...prev,
        seasons: prev.seasons.map(s => s.id === editingSeasonId ? {
          ...s, name: newName, managerName: newManager, minBirthYear: minYear, maxBirthYear: maxYear
        } : s)
      }));
      setEditingSeasonId(null);
    } else {
      const newSeason: Season = {
        id: Date.now().toString(),
        name: newName,
        managerName: newManager,
        isActive: false,
        subjects: { 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] },
        sections: { 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] },
        teachers: [],
        students: [],
        grades: [],
        attendance: [],
        holidays: [],
        minBirthYear: minYear,
        maxBirthYear: maxYear
      };
      setState(prev => ({
        ...prev,
        seasons: [...prev.seasons, newSeason],
        activeSeasonId: prev.activeSeasonId || newSeason.id
      }));
    }
    
    setNewName('');
    setNewManager('');
  };

  const startEdit = (season: Season) => {
    setEditingSeasonId(season.id);
    setNewName(season.name);
    setNewManager(season.managerName || '');
    setMinYear(season.minBirthYear || new Date().getFullYear() - 6);
    setMaxYear(season.maxBirthYear || new Date().getFullYear() - 12);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const duplicateSeason = (sourceSeason: Season) => {
    const name = prompt('أدخل اسم الموسم الجديد (مثلاً: ' + (parseInt(sourceSeason.name) + 1 || '') + '):', sourceSeason.name + ' - نسخة');
    if (!name) return;

    const newSeason: Season = {
      ...JSON.parse(JSON.stringify(sourceSeason)),
      id: Date.now().toString(),
      name: name,
      isActive: false,
      students: [],
      grades: [],
      attendance: [],
      holidays: []
    };

    setState(prev => ({
      ...prev,
      seasons: [...prev.seasons, newSeason]
    }));
    alert('تم تكرار هيكل الموسم بنجاح.');
  };

  const deleteSeason = (id: string) => {
    if (!confirm('حذف الموسم نهائياً؟ سيتم مسح كافة سجلات الطلاب والدرجات لهذا الموسم!')) return;
    setState(prev => ({
      ...prev,
      seasons: prev.seasons.filter(s => s.id !== id),
      activeSeasonId: prev.activeSeasonId === id ? null : prev.activeSeasonId
    }));
  };

  const activateSeason = (id: string) => {
    setState(prev => ({ ...prev, activeSeasonId: id }));
  };

  return (
    <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-gray-100 space-y-12">
      <div className="bg-slate-50 p-10 rounded-[3rem] space-y-8">
        <h3 className="text-2xl font-black flex items-center gap-3">
          {editingSeasonId ? <Edit2 className="text-blue-600" /> : <Calendar className="text-blue-600" />} 
          {editingSeasonId ? 'تعديل بيانات الموسم المختار' : 'إنشاء موسم دراسي جديد'}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <input type="text" value={newName} onChange={e => setNewName(e.target.value)} placeholder="اسم الموسم (مثلاً: 2024-2025)" className="px-6 py-4 border-2 border-white rounded-2xl bg-white font-bold outline-none focus:border-blue-600 text-black shadow-sm" />
          <input type="text" value={newManager} onChange={e => setNewManager(e.target.value)} placeholder="اسم مدير مدرسة الأديب..." className="px-6 py-4 border-2 border-white rounded-2xl bg-white font-bold outline-none focus:border-blue-600 text-black shadow-sm" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-white rounded-3xl">
           <div className="flex flex-col"><label className="text-[10px] font-black text-slate-400 mb-2">أصغر تولد مسموح (تدقيق عمري)</label><input type="number" value={minYear} onChange={e => setMinYear(parseInt(e.target.value))} className="px-4 py-3 border rounded-xl font-bold text-blue-600" /></div>
           <div className="flex flex-col"><label className="text-[10px] font-black text-slate-400 mb-2">أكبر تولد مسموح (تدقيق عمري)</label><input type="number" value={maxYear} onChange={e => setMaxYear(parseInt(e.target.value))} className="px-4 py-3 border rounded-xl font-bold text-red-600" /></div>
        </div>
        <div className="flex gap-4">
          <button onClick={addSeason} className="flex-1 bg-blue-600 text-white py-5 rounded-2xl font-black shadow-xl hover:bg-blue-700 transition-all">{editingSeasonId ? 'حفظ التغييرات' : 'إضافة الموسم'}</button>
          {editingSeasonId && <button onClick={() => setEditingSeasonId(null)} className="px-10 bg-slate-200 text-slate-500 rounded-2xl font-black">إلغاء</button>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {state.seasons.map(season => (
          <div key={season.id} className={`p-8 rounded-[3rem] border-2 transition-all relative group ${state.activeSeasonId === season.id ? 'border-blue-500 bg-blue-50/20' : 'border-slate-50 hover:border-slate-200'}`}>
            <div className="flex justify-between items-start">
              <div>
                <h4 className="text-xl font-black text-slate-800">{season.name}</h4>
                <p className="text-xs text-slate-400 font-bold mb-4">المدير: {season.managerName || 'لم يحدد'}</p>
              </div>
              {state.activeSeasonId === season.id && <div className="bg-blue-600 text-white p-1.5 rounded-lg text-[8px] font-black">نشط</div>}
            </div>
            
            <div className="grid grid-cols-2 gap-2 mt-4">
              <div className="bg-white/50 p-2 rounded-xl text-center">
                <p className="text-[8px] text-slate-400 font-black">طلاب</p>
                <p className="text-sm font-black text-slate-700">{season.students?.length || 0}</p>
              </div>
              <div className="bg-white/50 p-2 rounded-xl text-center">
                <p className="text-[8px] text-slate-400 font-black">معلمون</p>
                <p className="text-sm font-black text-slate-700">{season.teachers?.length || 0}</p>
              </div>
            </div>

            <div className="flex justify-between items-center mt-8 gap-2">
              <button 
                onClick={() => activateSeason(season.id)} 
                className={`flex-1 px-4 py-3 rounded-xl text-xs font-black transition-all ${state.activeSeasonId === season.id ? 'bg-blue-600 text-white cursor-default' : 'bg-slate-100 text-slate-500 hover:bg-blue-50 hover:text-blue-600'}`}
              >
                تفعيل
              </button>
              <button 
                onClick={() => startEdit(season)} 
                title="تعديل بيانات الموسم"
                className="p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all"
              >
                <Edit2 size={18} />
              </button>
              <button 
                onClick={() => duplicateSeason(season)} 
                title="تكرار الهيكل"
                className="p-3 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-600 hover:text-white transition-all"
              >
                <Copy size={18} />
              </button>
              <button 
                onClick={() => deleteSeason(season.id)} 
                className="p-3 bg-red-50 text-red-400 rounded-xl hover:bg-red-600 hover:text-white transition-all"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SeasonManager;
