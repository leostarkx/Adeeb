
import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  GraduationCap, 
  BarChart3, 
  Save, 
  Upload, 
  Calendar,
  Coffee,
  Menu,
  X,
  Trash2
} from 'lucide-react';
import { Season, AppState, GRADE_NAMES } from './types';
import Dashboard from './components/Dashboard';
import SeasonManager from './components/SeasonManager';
import PeopleManager from './components/PeopleManager';
import SubjectsManager from './components/SubjectsManager';
import GradeEntry from './components/GradeEntry';
import StudentReport from './components/StudentReport';
import StatsView from './components/StatsView';
import DeleteCenter from './components/DeleteCenter';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem('al_adeeb_data');
    return saved ? JSON.parse(saved) : { seasons: [], activeSeasonId: null };
  });

  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    localStorage.setItem('al_adeeb_data', JSON.stringify(state));
  }, [state]);

  const activeSeason = useMemo(() => 
    state.seasons.find(s => s.id === state.activeSeasonId), 
    [state.seasons, state.activeSeasonId]
  );

  const updateActiveSeason = (updates: Partial<Season>) => {
    if (!state.activeSeasonId) return;
    setState(prev => ({
      ...prev,
      seasons: prev.seasons.map(s => s.id === prev.activeSeasonId ? { ...s, ...updates } : s)
    }));
  };

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `سجل_الأديب_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        setState(data);
        alert('تم استيراد البيانات بنجاح');
      } catch (err) {
        alert('خطأ في استيراد الملف');
      }
    };
    reader.readAsText(file);
  };

  const menuItems = [
    { id: 'dashboard', label: 'الرئيسية', icon: LayoutDashboard },
    { id: 'seasons', label: 'المواسم الدراسية', icon: Calendar },
    { id: 'subjects', label: 'المواد والصفوف', icon: BookOpen, disabled: !activeSeason },
    { id: 'people', label: 'المعلمون والطلاب', icon: Users, disabled: !activeSeason },
    { id: 'grades', label: 'رصد الدرجات', icon: GraduationCap, disabled: !activeSeason },
    { id: 'reports', label: 'سجل الطالب', icon: GraduationCap, disabled: !activeSeason },
    { id: 'stats', label: 'الإحصائيات', icon: BarChart3, disabled: !activeSeason },
    { id: 'delete-center', label: 'مركز الحذف القاطع', icon: Trash2, highlight: true },
  ];

  return (
    <div className="flex min-h-screen bg-[#fcfdfe] text-slate-900 overflow-x-hidden">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 right-0 z-50 w-72 bg-white shadow-2xl transition-transform duration-300 transform lg:relative lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="p-8 border-b border-gray-50">
             <div className="bg-blue-600 w-12 h-12 rounded-2xl flex items-center justify-center text-white mb-4 shadow-xl shadow-blue-100">
               <BookOpen size={24} />
             </div>
             <h1 className="text-2xl font-black text-slate-800 tracking-tight">مدرسة الأديب</h1>
             <p className="text-[10px] font-black text-blue-500 mt-1 uppercase tracking-widest">النظام المتكامل لإدارة الدرجات</p>
          </div>

          <nav className="flex-1 p-6 space-y-2 overflow-y-auto custom-scrollbar">
            {menuItems.map(item => (
              <button
                key={item.id}
                onClick={() => !item.disabled && setActiveTab(item.id)}
                disabled={item.disabled}
                className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-bold transition-all ${
                  activeTab === item.id 
                    ? item.highlight ? 'bg-red-600 text-white shadow-xl scale-105' : 'bg-blue-600 text-white shadow-xl scale-105'
                    : item.disabled 
                      ? 'opacity-20 grayscale cursor-not-allowed' 
                      : item.highlight ? 'text-red-500 hover:bg-red-50' : 'text-slate-400 hover:bg-gray-50 hover:text-slate-600'
                }`}
              >
                <item.icon size={22} className={activeTab === item.id ? '' : (item.highlight ? 'text-red-500' : '')} />
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="p-6 border-t border-gray-50 space-y-3">
            <button onClick={handleExport} className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-2xl bg-emerald-50 text-emerald-600 font-bold hover:bg-emerald-100 transition-all border border-emerald-100">
              <Save size={18} /> حفظ نسخة
            </button>
            <label className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-2xl bg-amber-50 text-amber-600 font-bold hover:bg-amber-100 transition-all border border-amber-100 cursor-pointer">
              <Upload size={18} /> استيراد بيانات
              <input type="file" className="hidden" onChange={handleImport} accept=".json" />
            </label>
          </div>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto custom-scrollbar">
        <header className="sticky top-0 z-40 bg-[#fcfdfe]/80 backdrop-blur-xl border-b border-gray-50 px-8 py-6 flex justify-between items-center no-print text-right">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="lg:hidden p-2 text-slate-400 hover:text-blue-600">
               {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <div>
              <h2 className="text-xl font-black text-slate-800">{menuItems.find(i => i.id === activeTab)?.label}</h2>
              {activeSeason && <span className="text-xs font-bold text-gray-400">الموسم الدراسي الحالي: {activeSeason.name}</span>}
            </div>
          </div>
          {activeTab !== 'delete-center' && (
            <button 
              onClick={() => setActiveTab('delete-center')} 
              className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl font-black text-xs hover:bg-red-100 transition-all"
            >
              <Trash2 size={16} /> مركز الحذف
            </button>
          )}
        </header>

        <main className="p-8 max-w-[1600px] mx-auto w-full flex-1">
          {activeTab === 'dashboard' && <Dashboard state={state} setState={setState} />}
          {activeTab === 'seasons' && <SeasonManager state={state} setState={setState} />}
          {activeTab === 'delete-center' && <DeleteCenter state={state} setState={setState} />}
          {activeSeason && (
            <>
              {activeTab === 'subjects' && <SubjectsManager season={activeSeason} onUpdate={updateActiveSeason} />}
              {activeTab === 'people' && <PeopleManager season={activeSeason} onUpdate={updateActiveSeason} />}
              {activeTab === 'grades' && <GradeEntry season={activeSeason} onUpdate={updateActiveSeason} />}
              {activeTab === 'reports' && <StudentReport season={activeSeason} />}
              {activeTab === 'stats' && <StatsView season={activeSeason} />}
            </>
          )}
        </main>
      </div>

      {/* Watermark */}
      <div className="fixed bottom-6 left-6 z-50 flex items-center gap-3 bg-white/90 backdrop-blur px-5 py-3 rounded-2xl shadow-2xl border border-gray-100 no-print transition-all hover:scale-105 group">
        <div className="w-8 h-8 bg-amber-100 text-amber-600 rounded-lg flex items-center justify-center group-hover:rotate-12 transition-transform">
          <Coffee size={18} />
        </div>
        <div className="text-right leading-none">
          <p className="text-[10px] text-gray-400 font-bold mb-1">تطوير وبرمجة</p>
          <p className="text-xs font-black text-slate-800">أحمد عامر رضا علي</p>
        </div>
      </div>
    </div>
  );
};

export default App;
