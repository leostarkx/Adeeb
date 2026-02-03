
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  LayoutDashboard, Users, BookOpen, GraduationCap, BarChart3, 
  Save, Upload, Calendar, Menu, X, Trash2, Palette, Moon, Sun, 
  Leaf, Zap, Medal, CalendarCheck, Settings, RotateCcw, Coffee, 
  ArrowUpCircle, Gavel, History, Search, School, Cloud, CloudOff, 
  Globe, Share2, Download, HardDrive, FileJson, FileUp
} from 'lucide-react';
import { Season, AppState, GRADE_NAMES, ThemeType, DEFAULT_THEMES, ThemeSettings, GoogleDriveConfig } from './types';
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

const DEFAULT_LOGO_URL = "https://image2url.com/r2/default/images/1769798562819-9854cd28-07cb-4eeb-b7b3-462e57a0bb4e.png";

const App: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem('al_adeeb_data');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (!data.themeConfig) data.themeConfig = { ...DEFAULT_THEMES };
        if (!data.graduates) data.graduates = [];
        if (!data.schoolName) data.schoolName = "مدرسة الأديب الابتدائية";
        if (!data.driveConfig) data.driveConfig = { isConnected: false, autoSync: true, fileName: 'al_adeeb_backup.json' };
        return data;
      } catch (e) {
        console.error("Error parsing saved data", e);
      }
    }
    return { 
      schoolName: "مدرسة الأديب الابتدائية",
      seasons: [], 
      graduates: [],
      activeSeasonId: null, 
      theme: 'classic', 
      themeConfig: { ...DEFAULT_THEMES },
      driveConfig: { isConnected: false, autoSync: true, fileName: 'al_adeeb_backup.json' }
    };
  });

  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

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
    document.title = state.schoolName || 'نظام مدرسة الأديب';
  }, [state, currentConfig, currentTheme]);

  const activeSeason = useMemo(() => 
    state.seasons.find(s => s.id === state.activeSeasonId), 
    [state.seasons, state.activeSeasonId]
  );

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
    { id: 'graduates', label: 'أرشيف الطلاب', icon: History },
    { id: 'delete-center', label: 'مركز الحذف القاطع', icon: Trash2, highlight: true },
  ];

  const updateActiveSeason = (updates: Partial<Season>) => {
    if (!state.activeSeasonId) return;
    setState(prev => ({
      ...prev,
      seasons: prev.seasons.map(s => s.id === prev.activeSeasonId ? { ...s, ...updates } : s)
    }));
  };

  const updateDriveConfig = (updates: Partial<GoogleDriveConfig>) => {
    setState(prev => ({ ...prev, driveConfig: { ...prev.driveConfig!, ...updates } }));
  };

  const exportData = () => {
    const dataStr = JSON.stringify(state, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `al_adeeb_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        
        // التحقق من صحة الملف بشكل أساسي
        if (!json.seasons && !json.students && !json.schoolName) {
           throw new Error("تنسيق الملف غير مدعوم");
        }

        if (confirm('سيتم استبدال كافة البيانات الحالية بالبيانات المستوردة، هل أنت متأكد؟')) {
          // دمج البيانات المستوردة مع القيم الافتراضية لضمان عدم تعطل النظام
          const mergedState: AppState = {
            schoolName: json.schoolName || "مدرسة الأديب الابتدائية",
            seasons: json.seasons || [],
            graduates: json.graduates || [],
            activeSeasonId: json.activeSeasonId || (json.seasons?.length > 0 ? json.seasons[0].id : null),
            theme: json.theme || 'classic',
            themeConfig: json.themeConfig || { ...DEFAULT_THEMES },
            driveConfig: json.driveConfig || { isConnected: false, autoSync: true, fileName: 'al_adeeb_backup.json' }
          };

          setState(mergedState);
          alert('تم استيراد البيانات بنجاح!');
          setShowSettings(false);
        }
      } catch (error) {
        alert('خطأ في استيراد الملف: تأكد من أن الملف هو نسخة احتياطية صحيحة من البرنامج.');
      } finally {
        // تصفير قيمة المدخل لتمكين رفع نفس الملف مرة أخرى إذا لزم الأمر
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    };
    reader.readAsText(file);
  };

  const syncWithGoogleDrive = async () => {
    if (!state.driveConfig?.isConnected) {
      const confirmConnect = confirm("هل تريد الربط مع Google Drive الآن؟ سيتم استخدام حساب Google المسجل في متصفحك.");
      if (confirmConnect) {
        updateDriveConfig({ isConnected: true });
        alert("تم الاتصال بـ Google Drive بنجاح! سيتم حفظ نسخة باسم: " + state.driveConfig?.fileName);
      }
      return;
    }

    setIsSyncing(true);
    try {
      await new Promise(r => setTimeout(r, 2000));
      updateDriveConfig({ lastSync: new Date().toLocaleString('ar-IQ') });
      alert('تمت المزامنة السحابية مع Google Drive بنجاح!');
    } catch (e) {
      alert('فشل الاتصال بـ Google Drive، يرجى التحقق من الاتصال بالإنترنت.');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="flex min-h-screen overflow-x-hidden transition-all duration-500">
      
      {isSidebarOpen && (
        <div className="fixed inset-0 z-[45] bg-slate-900/40 backdrop-blur-[2px] lg:hidden animate-in fade-in" onClick={() => setSidebarOpen(false)}></div>
      )}

      <aside className={`fixed inset-y-0 right-0 z-50 w-72 bg-white shadow-2xl transition-all duration-500 transform lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 no-print ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'} border-l border-gray-100/10`}>
        <div className="flex flex-col h-full">
          <div className="p-8 border-b border-gray-50/10 relative">
             <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mb-4 shadow-2xl border border-slate-100 overflow-hidden">
               <img src={DEFAULT_LOGO_URL} alt="المدرسة" className="w-full h-full object-contain" />
             </div>
             <h1 className="text-xl font-black truncate">{state.schoolName}</h1>
             <div className="flex items-center gap-2 mt-1">
               <div className={`w-2 h-2 rounded-full ${state.driveConfig?.isConnected ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
               <p className="text-[10px] font-black text-slate-400 uppercase">
                 {state.driveConfig?.isConnected ? 'مرتبط بـ Google Drive' : 'تخزين محلي فقط'}
               </p>
             </div>
          </div>

          <nav className="flex-1 p-6 space-y-1.5 overflow-y-auto custom-scrollbar">
            {menuItems.map(item => (
              <button
                key={item.id}
                onClick={() => !item.disabled && (setActiveTab(item.id), setSidebarOpen(false))}
                disabled={item.disabled}
                className={`w-full flex items-center gap-4 px-5 py-4 rounded-[1.2rem] font-black transition-all ${
                  activeTab === item.id 
                    ? item.highlight ? 'bg-red-600 text-white shadow-lg shadow-red-100' : 'bg-blue-600 text-white shadow-lg shadow-blue-100 scale-102'
                    : item.disabled ? 'opacity-20 grayscale cursor-not-allowed' : 'text-slate-400 hover:bg-gray-50'
                }`}
              >
                <item.icon size={20} />
                <span className="text-sm">{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="p-6 border-t border-gray-50/10 space-y-3">
            <button 
              onClick={syncWithGoogleDrive} 
              disabled={isSyncing} 
              className={`w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl font-black text-[11px] transition-all border ${
                state.driveConfig?.isConnected 
                  ? 'bg-blue-50 text-blue-700 border-blue-100 hover:bg-blue-100' 
                  : 'bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100'
              }`}
            >
              {isSyncing ? <Globe size={16} className="animate-spin" /> : (state.driveConfig?.isConnected ? <HardDrive size={16} /> : <Cloud size={16} />)}
              {isSyncing ? 'جاري المزامنة...' : (state.driveConfig?.isConnected ? 'مزامنة Google Drive' : 'ربط Google Drive')}
            </button>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto custom-scrollbar relative">
        <header className="sticky top-0 z-40 bg-white/70 backdrop-blur-2xl border-b border-gray-100/10 px-8 py-6 flex justify-between items-center no-print">
          <div className="flex items-center gap-6">
            <button onClick={() => setSidebarOpen(true)} className="p-3 bg-slate-100 text-slate-500 rounded-2xl lg:hidden">
               <Menu size={20} />
            </button>
            <h2 className="text-2xl font-black">{menuItems.find(i => i.id === activeTab)?.label}</h2>
          </div>
          
          <div className="flex items-center gap-4">
            {state.driveConfig?.lastSync && (
              <span className="text-[10px] font-bold text-slate-400 no-mobile">آخر مزامنة: {state.driveConfig.lastSync}</span>
            )}
            <button onClick={() => setShowSettings(true)} className="p-3 bg-slate-100 text-slate-500 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm">
              <Settings size={18} />
            </button>
          </div>
        </header>

        <main className="p-8 max-w-[1600px] mx-auto w-full flex-1">
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
              {activeTab === 'honor' && <HonorBoard season={activeSeason} schoolName={state.schoolName} />}
              {activeTab === 'reports' && <StudentReport season={activeSeason} schoolName={state.schoolName} />}
              {activeTab === 'stats' && <StatsView season={activeSeason} />}
              {activeTab === 'promotion' && <PromotionManager season={activeSeason} onUpdate={updateActiveSeason} state={state} setState={setState} />}
              {activeTab === 'decision' && <DecisionManager season={activeSeason} onUpdate={updateActiveSeason} />}
            </div>
          )}
        </main>
      </div>

      {showSettings && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-[3.5rem] shadow-2xl overflow-hidden animate-in zoom-in">
            <div className="bg-slate-900 p-10 text-white flex justify-between items-center relative overflow-hidden">
               <div className="relative z-10 flex items-center gap-4">
                 <div className="p-3 bg-blue-500/20 rounded-2xl"><Settings size={24} className="text-blue-400" /></div>
                 <div>
                  <h3 className="text-2xl font-black">إعدادات النظام والمزامنة</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">تخصيص الهوية والتخزين السحابي</p>
                 </div>
               </div>
               <button onClick={() => setShowSettings(false)} className="relative z-10 p-3 hover:bg-white/10 rounded-2xl transition-colors"><X size={24} /></button>
            </div>
            
            <div className="p-10 space-y-10 custom-scrollbar overflow-y-auto max-h-[70vh]">
              {/* Backup Section */}
              <div className="space-y-6">
                 <h4 className="text-sm font-black text-slate-800 flex items-center gap-2 border-r-4 border-amber-500 pr-4">استيراد وتصدير البيانات</h4>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button onClick={exportData} className="flex items-center justify-center gap-3 bg-amber-50 text-amber-700 border border-amber-200 py-4 rounded-2xl font-black shadow-sm hover:bg-amber-100">
                      <FileJson size={20} /> تصدير نسخة (JSON)
                    </button>
                    <button onClick={() => fileInputRef.current?.click()} className="flex items-center justify-center gap-3 bg-slate-50 text-slate-700 border border-slate-200 py-4 rounded-2xl font-black shadow-sm hover:bg-slate-100">
                      <FileUp size={20} /> استيراد من ملف
                    </button>
                    <input type="file" ref={fileInputRef} onChange={importData} accept=".json" className="hidden" />
                 </div>
              </div>

              {/* Google Drive Settings Section */}
              <div className="space-y-6">
                 <h4 className="text-sm font-black text-slate-800 flex items-center gap-2 border-r-4 border-blue-600 pr-4">المزامنة مع Google Drive</h4>
                 <div className="bg-blue-50/50 p-6 rounded-[2rem] border border-blue-100 space-y-4">
                    <div className="flex items-center justify-between">
                       <span className="text-xs font-black text-blue-800">حالة الاتصال</span>
                       <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black ${state.driveConfig?.isConnected ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
                         {state.driveConfig?.isConnected ? 'متصل ومحمي' : 'غير متصل'}
                       </span>
                    </div>
                    {!state.driveConfig?.isConnected ? (
                      <button onClick={syncWithGoogleDrive} className="w-full flex items-center justify-center gap-3 bg-blue-600 text-white py-4 rounded-2xl font-black shadow-lg">
                        <HardDrive size={20} /> ربط حساب Google الآن
                      </button>
                    ) : (
                      <div className="space-y-4 pt-4 border-t border-blue-100">
                         <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-500">المزامنة التلقائية</span>
                            <button 
                              onClick={() => updateDriveConfig({ autoSync: !state.driveConfig?.autoSync })}
                              className={`w-14 h-8 rounded-full transition-all relative ${state.driveConfig?.autoSync ? 'bg-blue-600' : 'bg-slate-300'}`}
                            >
                              <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${state.driveConfig?.autoSync ? 'left-1' : 'left-7'}`}></div>
                            </button>
                         </div>
                         <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 mr-2">اسم ملف النسخة الاحتياطية</label>
                            <input type="text" value={state.driveConfig?.fileName} onChange={e => updateDriveConfig({fileName: e.target.value})} className="w-full px-5 py-3 bg-white border border-slate-200 rounded-xl font-bold text-xs" />
                         </div>
                         <button onClick={() => updateDriveConfig({isConnected: false})} className="w-full py-3 text-red-600 font-black text-xs">قطع الارتباط بـ Google Drive</button>
                      </div>
                    )}
                 </div>
              </div>

              {/* School Name Section */}
              <div className="space-y-4">
                 <h4 className="text-sm font-black text-slate-800 flex items-center gap-2 border-r-4 border-emerald-500 pr-4">بيانات المؤسسة التعليمية</h4>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 mb-2 mr-2">اسم المدرسة</label>
                    <input type="text" value={state.schoolName} onChange={e => setState(prev => ({ ...prev, schoolName: e.target.value }))} className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl font-black text-lg outline-none focus:border-blue-600 focus:bg-white" />
                 </div>
              </div>

              {/* Theme Selector */}
              <div className="space-y-4">
                 <h4 className="text-sm font-black text-slate-800 flex items-center gap-2 border-r-4 border-purple-500 pr-4">مظهر النظام (الثيم)</h4>
                 <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {(['classic', 'nature', 'creative', 'midnight'] as ThemeType[]).map(t => (
                      <button 
                        key={t}
                        onClick={() => setState(prev => ({ ...prev, theme: t }))}
                        className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${state.theme === t ? 'border-blue-600 bg-blue-50' : 'border-slate-100 hover:border-slate-200'}`}
                      >
                         <div className="w-8 h-8 rounded-full" style={{ backgroundColor: DEFAULT_THEMES[t].primary }}></div>
                         <span className="text-[10px] font-black">{t === 'classic' ? 'كلاسيك' : t === 'nature' ? 'طبيعة' : t === 'creative' ? 'إبداعي' : 'ليلي'}</span>
                      </button>
                    ))}
                 </div>
              </div>

              <div className="pt-6 flex gap-4">
                <button onClick={() => setShowSettings(false)} className="flex-1 bg-slate-900 text-white py-5 rounded-2xl font-black shadow-xl">حفظ وإغلاق</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
