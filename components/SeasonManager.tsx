
import React, { useState } from 'react';
import { AppState, Season } from '../types';
import { Plus, Check, Trash2, Calendar, Pencil, X } from 'lucide-react';

interface Props {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
}

const SeasonManager: React.FC<Props> = ({ state, setState }) => {
  const [newName, setNewName] = useState('');
  const [editingSeasonId, setEditingSeasonId] = useState<string | null>(null);
  const [editSeasonName, setEditSeasonName] = useState('');

  const addSeason = () => {
    if (!newName.trim()) return;
    const newSeason: Season = {
      id: Date.now().toString(),
      name: newName,
      isActive: false,
      subjects: { 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] },
      sections: { 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] },
      teachers: [],
      students: [],
      grades: []
    };
    setState(prev => ({
      ...prev,
      seasons: [...prev.seasons, newSeason],
      activeSeasonId: prev.activeSeasonId || newSeason.id
    }));
    setNewName('');
  };

  const deleteSeason = (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الموسم الدراسي نهائياً؟')) return;
    setState(prev => ({
      ...prev,
      seasons: prev.seasons.filter(s => s.id !== id),
      activeSeasonId: prev.activeSeasonId === id ? null : prev.activeSeasonId
    }));
  };

  const activateSeason = (id: string) => {
    setState(prev => ({
      ...prev,
      activeSeasonId: id
    }));
  };

  const startEditSeason = (season: Season) => {
    setEditingSeasonId(season.id);
    setEditSeasonName(season.name);
  };

  const saveEditSeason = () => {
    if (!editSeasonName.trim()) return;
    setState(prev => ({
      ...prev,
      seasons: prev.seasons.map(s => s.id === editingSeasonId ? { ...s, name: editSeasonName } : s)
    }));
    setEditingSeasonId(null);
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm space-y-8">
      <div className="flex gap-4 items-end no-print">
        <div className="flex-1">
          <label className="block text-sm font-black text-gray-700 mb-2">اسم الموسم الدراسي الجديد</label>
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="مثال: 2024-2025"
            className="w-full px-5 py-3 border border-gray-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500"
          />
        </div>
        <button
          type="button"
          onClick={addSeason}
          className="flex items-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg h-[52px]"
        >
          <Plus size={20} /> إضافة موسم
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {state.seasons.map(season => (
          <div 
            key={season.id} 
            className={`p-6 rounded-3xl border-2 transition-all relative group ${
              state.activeSeasonId === season.id 
                ? 'border-blue-500 bg-blue-50/30' 
                : 'border-gray-100 hover:border-blue-200'
            }`}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="bg-white p-3 rounded-2xl shadow-sm">
                <Calendar className="text-blue-600" size={24} />
              </div>
              <div className="flex gap-1 no-print">
                <button type="button" title="تفعيل" onClick={() => activateSeason(season.id)} className={`p-2 rounded-xl transition-all ${state.activeSeasonId === season.id ? 'text-emerald-600 bg-emerald-100' : 'text-gray-300 hover:bg-blue-50 hover:text-blue-600'}`}><Check size={20} className="pointer-events-none" /></button>
                <button type="button" title="تعديل" onClick={() => startEditSeason(season)} className="p-2 text-gray-300 hover:bg-gray-50 hover:text-blue-600 rounded-xl"><Pencil size={20} className="pointer-events-none" /></button>
                <button type="button" title="حذف" onClick={() => deleteSeason(season.id)} className="p-2 text-gray-300 hover:bg-red-50 hover:text-red-600 rounded-xl"><Trash2 size={20} className="pointer-events-none" /></button>
              </div>
            </div>

            {editingSeasonId === season.id ? (
              <div className="flex gap-2 mt-2">
                <input value={editSeasonName} onChange={e => setEditSeasonName(e.target.value)} className="flex-1 p-2 border rounded-xl outline-none" autoFocus />
                <button type="button" onClick={saveEditSeason} className="bg-blue-600 text-white p-2 rounded-xl"><Check size={20} /></button>
                <button type="button" onClick={() => setEditingSeasonId(null)} className="bg-gray-100 text-gray-500 p-2 rounded-xl"><X size={20} /></button>
              </div>
            ) : (
              <>
                <h3 className="text-xl font-black text-gray-800">{season.name}</h3>
                <p className="text-sm text-gray-400 font-bold mt-2">الطلاب: {season.students.length} | المعلمون: {season.teachers.length}</p>
                {state.activeSeasonId === season.id && (
                  <span className="absolute top-4 left-4 bg-emerald-500 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase">نشط</span>
                )}
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SeasonManager;
