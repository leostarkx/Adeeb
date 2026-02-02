
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
  Menu,
  X,
  Trash2,
  Palette,
  Moon,
  Sun,
  Leaf,
  Zap,
  Medal,
  CalendarCheck,
  Settings,
  RotateCcw,
  Coffee,
  ArrowUpCircle,
  Gavel,
  History
} from 'lucide-react';
import { Season, AppState, GRADE_NAMES, ThemeType, DEFAULT_THEMES, ThemeSettings } from './types';
import Dashboard from './components/Dashboard';
import SeasonManager from './components/SeasonManager';
import PeopleManager from './components/PeopleManager';
import SubjectsManager from './components/SubjectsManager';
import GradeEntry from './components/GradeEntry';
import StudentReport from './components/StudentReport';
import StatsView from './components/StatsView';
import DeleteCenter from './components/DeleteCenter';
import HonorBoard from './components/HonorBoard';
import AttendanceManager from './components/AttendanceManager';
import PromotionManager from './components/PromotionManager';
import DecisionManager from './components/DecisionManager';
import GraduatesView from './components/GraduatesView';

const LOGO_URL = "https://image2url.com/r2/default/images/1769798562819-9854cd28-07cb-4eeb-b7b3-462e57a0bb4e.png";

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem('al_adeeb_data');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (!data.themeConfig) data.themeConfig = { ...DEFAULT_THEMES };
        if (!data.graduates) data.graduates = [];
        Object.keys(DEFAULT_THEMES).forEach(key => {
          if (!data.themeConfig[key]) {
            data.themeConfig[key] = { ...DEFAULT_THEMES[key as ThemeType] };
          }
        });
        if (!data.theme) data.theme = 'classic';
        return data;
      } catch (e) {
        console.error("Error parsing saved data", e);
      }
    }
    return { 
      seasons: [], 
      graduates: [],
      activeSeasonId: null, 
      theme: 'classic', 
      themeConfig: { ...DEFAULT_THEMES } 
    };
  });

  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [showThemeSettings, setShowThemeSettings] = useState(false);

  const currentTheme = state.theme || 'classic';
  const currentConfig = useMemo(() => {
    return state.themeConfig?.[currentTheme] || DEFAULT_THEMES[currentTheme] || DEFAULT_THEMES.classic;
  }, [state.themeConfig, currentTheme]);

  useEffect(() => {
    const config = currentConfig;
    const root = document.documentElement;
    root.style.setProperty('--primary', config.primary);
    root.style.setProperty('--bg-main', config.bg);
    root.style.setProperty('--card-bg', config.card);
    root.style.setProperty('--text-main', config.text);
    root.style.setProperty('--text-muted', config.muted);
    root.style.setProperty('--border-color', config.border);
    root.setAttribute('data-theme', currentTheme);
    localStorage.setItem('al_adeeb_data', JSON.stringify(state));
  }, [state, currentConfig, currentTheme]);

  const navigateTo = (tabId: string) => {
    setActiveTab(tabId);
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  };

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

  const setTheme = (theme: ThemeType) => {
    setState(prev => ({ ...prev, theme }));
  };

  const updateThemeColors = (updates: Partial<ThemeSettings>) => {
    const themeToUpdate = state.theme || 'classic';
    setState(prev => ({
      ...prev,
      themeConfig: {
        ...(prev.themeConfig || DEFAULT_THEMES),
        [themeToUpdate]: {
          ...(prev.themeConfig?.[themeToUpdate] || DEFAULT_THEMES[themeToUpdate] || DEFAULT_THEMES.classic),
          ...updates
        }
      }
    }));
  };

  const resetCurrentTheme = () => {
    const themeToReset = state.theme || 'classic';
    setState(prev => ({
      ...prev,
      themeConfig: {
        ...(prev.themeConfig || DEFAULT_THEMES),
        [themeToReset]: { ...DEFAULT_THEMES[themeToReset] }
      }
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
        if (!data.themeConfig) data.themeConfig = { ...DEFAULT_THEMES };
        if (!data.graduates) data.graduates = [];
        setState(data);
        alert('تم استيراد البيانات بنجاح');
      } catch (err) {
        alert('خطأ في استيراد الملف، يرجى التأكد من صحة الملف المرفق');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const menuItems = [
    { id: 'dashboard', label: 'الرئيسية', icon: LayoutDashboard },
    { id: 'seasons', label: 'المواسم الدراسية', icon: Calendar },
    { id: 'subjects', label: 'المواد والصفوف', icon: BookOpen, disabled: !activeSeason },
    { id: 'people', label: 'المعلمون والطلاب', icon: Users, disabled: !activeSeason },
    { id: 'attendance', label: 'سجل الغيابات', icon: CalendarCheck, disabled: !activeSeason },
    { id: 'grades', label: 'رصد الدرجات', icon: GraduationCap, disabled: !activeSeason },
    { id: 'decision', label: 'نظام القرار', icon: Gavel, disabled: !activeSeason },
    { id: 'honor', label: 'لوحة الشرف', icon: Medal, disabled: !activeSeason },
    { id: 'reports', label: 'سجل الطالب', icon: GraduationCap, disabled: !activeSeason },
    { id: 'stats', label: 'الإحصائيات', icon: BarChart3, disabled: !activeSeason },
    { id: 'promotion', label: 'الترحيل', icon: ArrowUpCircle, disabled: !activeSeason },
    { id: 'graduates', label: 'سجل الخريجين', icon: History },
    { id: 'delete-center', label: 'مركز الحذف القاطع', icon: Trash2, highlight: true },
  ];

  const themeOptions: { id: ThemeType; label: string; icon: any; color: string }[] = [
    { id: 'classic', label: 'كلاسيك', icon: Zap, color: 'bg-blue-600' },
    { id: 'nature', label: 'طبيعة', icon: Leaf, color: 'bg-emerald-600' },
    { id: 'creative', label: 'إبداعي', icon: Palette, color: 'bg-purple-600' },
    { id: 'midnight', label: 'ليلي', icon: Moon, color: 'bg-slate-900' },
  ];

  return (
    <div className="flex min-h-screen text-slate-900 overflow-x-hidden transition-colors duration-500">
      
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-[45] bg-slate-900/40 backdrop-blur-[2px] lg:hidden animate-in fade-in"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      <aside className={`fixed inset-y-0 right-0 z-50 w-72 bg-white shadow-2xl transition-all duration-500 transform lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 no-print ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'} border-l border-gray-100/10`}>
        <div className="flex flex-col h-full">
          <div className="p-8 border-b border-gray-50/10 relative">
             <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mb-4 shadow-2xl border border-slate-100 overflow-hidden group transition-transform hover:rotate-6">
               <img src={LOGO_URL} alt="مدرسة الأديب" className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500" />
             </div>
             <h1 className="text-2xl font-black text-slate-800 tracking-tight">مدرسة الأديب</h1>
             <p className="text-[10px] font-black text-blue-500 mt-1 uppercase tracking-widest opacity-80">نظام الإدارة المتكامل</p>
             
             <button onClick={() => setSidebarOpen(false)} className="lg:hidden absolute top-8 left-8 p-2 text-slate-300 hover:text-red-500">
               <X size={24} />
             </button>
          </div>

          <nav className="flex-1 p-6 space-y-1.5 overflow-y-auto custom-scrollbar">
            {menuItems.map(item => (
              <button
                key={item.id}
                onClick={() => !item.disabled && navigateTo(item.id)}
                disabled={item.disabled}
                className={`w-full flex items-center gap-4 px-5 py-4 rounded-[1.2rem] font-black transition-all duration-300 ${
                  activeTab === item.id 
                    ? item.highlight ? 'bg-red-600 text-white shadow-xl shadow-red-200' : 'bg-blue-600 text-white shadow-xl shadow-blue-200 scale-102'
                    : item.disabled 
                      ? 'opacity-10 grayscale cursor-not-allowed' 
                      : item.highlight ? 'text-red-500 hover:bg-red-50' : 'text-slate-400 hover:bg-gray-50 hover:text-slate-600'
                }`}
              >
                <item.icon size={20} className={activeTab === item.id ? 'animate-pulse' : (item.highlight ? 'text-red-500' : '')} />
                <span className="text-sm">{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="px-6 py-4 border-t border-gray-50/10">
            <div className="flex justify-between items-center mb-3 px-2">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">مظهر النظام</p>
              <button onClick={() => setShowThemeSettings(!showThemeSettings)} className="text-slate-400 hover:text-blue-600 transition-colors">
                <Settings size={14} />
              </button>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {themeOptions.map(t => (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  title={t.label}
                  className={`p-3 rounded-xl flex items-center justify-center transition-all duration-300 ${
                    state.theme === t.id ? 'ring-2 ring-offset-2 ring-blue-400 scale-105 shadow-md' : 'opacity-40 hover:opacity-100'
                  } ${t.color} text-white`}
                >
                  <t.icon size={16} />
                </button>
              ))}
            </div>
          </div>

          <div className="p-6 border-t border-gray-50/10 space-y-2">
            <button onClick={handleExport} className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-emerald-50/50 text-emerald-600 font-black text-[10px] hover:bg-emerald-100 transition-all border border-emerald-100">
              <Save size={14} /> حفظ نسخة
            </button>
            <label className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-blue-50/50 text-blue-600 font-black text-[10px] hover:bg-blue-100 transition-all border border-blue-100 cursor-pointer">
              <Upload size={14} /> استيراد
              <input type="file" accept=".json" onChange={handleImport} className="hidden" />
            </label>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto custom-scrollbar print:h-auto print:overflow-visible relative">
        <header className="sticky top-0 z-40 bg-white/70 backdrop-blur-2xl border-b border-gray-100/10 px-4 lg:px-8 py-4 lg:py-6 flex justify-between items-center no-print transition-all duration-500">
          <div className="flex items-center gap-4 lg:gap-6">
            <button 
              onClick={() => setSidebarOpen(!isSidebarOpen)} 
              className="p-3 bg-slate-100 text-slate-500 rounded-2xl hover:bg-blue-50 hover:text-blue-600 transition-all shadow-sm"
              title="القائمة"
            >
               <Menu size={20} />
            </button>
            <div>
              <h2 className="text-xl lg:text-2xl font-black text-slate-800 tracking-tight leading-none">
                {menuItems.find(i => i.id === activeTab)?.label}
              </h2>
              {activeSeason && (
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></div>
                  <span className="text-[9px] lg:text-[10px] font-black text-gray-400">الموسم: {activeSeason.name}</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col text-left mr-4">
              <span className="text-[10px] font-black text-slate-400 uppercase">مرحبا بك</span>
              <span className="text-xs font-black text-slate-800">أستاذ مدرسة الأديب</span>
            </div>
            <button onClick={() => setShowThemeSettings(true)} className="p-3 bg-slate-100/50 text-slate-500 rounded-xl hover:bg-blue-600 hover:text-white transition-all duration-300">
              <Palette size={18} />
            </button>
          </div>
        </header>

        <main className="p-4 lg:p-8 max-w-[1600px] mx-auto w-full flex-1 print:p-0 print:max-w-none">
          {activeTab === 'dashboard' && <Dashboard state={state} setState={setState} />}
          {activeTab === 'seasons' && <SeasonManager state={state} setState={setState} />}
          {activeTab === 'delete-center' && <DeleteCenter state={state} setState={setState} />}
          {activeTab === 'graduates' && <GraduatesView state={state} />}
          {activeSeason && (
            <div className="animate-in">
              {activeTab === 'subjects' && <SubjectsManager season={activeSeason} onUpdate={updateActiveSeason} />}
              {activeTab === 'people' && <PeopleManager season={activeSeason} onUpdate={updateActiveSeason} />}
              {activeTab === 'attendance' && <AttendanceManager season={activeSeason} onUpdate={updateActiveSeason} />}
              {activeTab === 'grades' && <GradeEntry season={activeSeason} onUpdate={updateActiveSeason} />}
              {activeTab === 'honor' && <HonorBoard season={activeSeason} />}
              {activeTab === 'reports' && <StudentReport season={activeSeason} />}
              {activeTab === 'stats' && <StatsView season={activeSeason} />}
              {activeTab === 'promotion' && <PromotionManager season={activeSeason} onUpdate={updateActiveSeason} state={state} setState={setState} />}
              {activeTab === 'decision' && <DecisionManager season={activeSeason} onUpdate={updateActiveSeason} />}
            </div>
          )}
        </main>
      </div>

      {showThemeSettings && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] lg:rounded-[3.5rem] shadow-2xl overflow-hidden animate-in zoom-in border border-white/20">
            <div className="bg-slate-900 p-6 lg:p-10 text-white flex justify-between items-center relative overflow-hidden">
               <div className="relative z-10 flex items-center gap-4">
                 <div className="p-3 bg-blue-500/20 rounded-2xl"><Palette size={24} className="text-blue-400" /></div>
                 <div>
                  <h3 className="text-xl lg:text-2xl font-black">ألوان النظام</h3>
                  <p className="text-[10px] text-slate-400 font-bold">تخصيص الواجهة</p>
                 </div>
               </div>
               <button onClick={() => setShowThemeSettings(false)} className="relative z-10 p-3 hover:bg-white/10 rounded-2xl transition-colors">
                 <X size={24} />
               </button>
            </div>
            
            <div className="p-6 lg:p-10 space-y-8">
              <div className="grid grid-cols-2 gap-4 lg:gap-8">
                {[
                  { key: 'primary', label: 'اللون الأساسي' },
                  { key: 'bg', label: 'لون الخلفية' },
                  { key: 'card', label: 'لون البطاقات' },
                  { key: 'text', label: 'لون النصوص' }
                ].map((item) => (
                  <div key={item.key} className="space-y-2">
                    <label className="block text-[10px] font-black text-slate-400 mr-2 text-right">{item.label}</label>
                    <input 
                      type="color" 
                      value={(currentConfig as any)[item.key]} 
                      onChange={e => updateThemeColors({[item.key]: e.target.value})} 
                      className="w-full h-12 rounded-xl cursor-pointer border-none shadow-inner bg-slate-50" 
                    />
                  </div>
                ))}
              </div>

              <div className="pt-4 flex gap-4">
                <button onClick={resetCurrentTheme} className="flex-1 flex items-center justify-center gap-2 bg-slate-100 text-slate-600 py-4 rounded-2xl font-black hover:bg-slate-200 transition-all border border-slate-200 text-xs">
                  <RotateCcw size={16} /> افتراضي
                </button>
                <button onClick={() => setShowThemeSettings(false)} className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-black shadow-xl shadow-blue-200 hover:scale-105 transition-all text-xs">
                  حفظ
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="fixed bottom-4 left-4 lg:bottom-8 lg:left-8 z-40 flex items-center gap-3 bg-white/90 backdrop-blur-xl px-4 py-3 rounded-[1.5rem] shadow-xl border border-gray-100 no-print transition-all hover:scale-105 group cursor-default">
        <div className="w-10 h-10 lg:w-12 lg:h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform shadow-inner">
          <Coffee size={20} />
        </div>
        <div className="text-right leading-none">
          <p className="text-[8px] lg:text-[10px] text-gray-400 font-black mb-1 uppercase">بكل فخر من قبل</p>
          <p className="text-xs lg:text-sm font-black text-slate-800 tracking-tight">أحمد عامر رضا علي</p>
        </div>
      </div>
    </div>
  );
};

export default App;
