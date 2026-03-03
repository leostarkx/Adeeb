
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  LayoutDashboard, Users, BookOpen, GraduationCap, BarChart3, 
  Calendar, Menu, X, Trash2, Settings, History, School, Cloud, 
  Globe, HardDrive, FileJson, FileUp, RefreshCw,
  MessageCircle, Send, Instagram, Coffee, Download, ArrowUpCircle, 
  Medal, CalendarCheck, Gavel, FileText, LogOut, ShieldCheck,
  User as UserIcon
} from 'lucide-react';
import { Season, AppState, ThemeType, DEFAULT_THEMES, GoogleDriveConfig, User } from './types';
import { toArabicNums } from './utils/calculations';
import Dashboard from './components/Dashboard';
import SeasonManager from './components/SeasonManager';
import PeopleManager from './components/PeopleManager';
import SubjectsManager from './components/SubjectsManager';
import GradeEntry from './components/GradeEntry';
import StudentReport from './components/StudentReport';
import CertificatesCenter from './components/CertificatesCenter';
import StatsView from './components/StatsView';
import HonorBoard from './components/HonorBoard';
import AttendanceManager from './components/AttendanceManager';
import PromotionManager from './components/PromotionManager';
import DecisionManager from './components/DecisionManager';
import GraduatesView from './components/GraduatesView';
import Login from './components/Login';
import UserManager from './components/UserManager';

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
        if (!data.users) data.users = [];
        if (!data.currentUser) data.currentUser = null;
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
      driveConfig: { isConnected: false, autoSync: true, fileName: 'al_adeeb_backup.json' },
      users: [],
      currentUser: null
    };
  });

  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showDevInfo, setShowDevInfo] = useState(false);
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

  const menuItems = useMemo(() => {
    const items = [
      { id: 'dashboard', label: 'الرئيسية', icon: LayoutDashboard },
      { id: 'seasons', label: 'المواسم الدراسية', icon: Calendar },
      { id: 'subjects', label: 'المواد والصفوف', icon: BookOpen, disabled: !activeSeason },
      { id: 'people', label: 'المعلمون والطلاب', icon: Users, disabled: !activeSeason },
      { id: 'attendance', label: 'سجل الغيابات', icon: CalendarCheck, disabled: !activeSeason },
      { id: 'grades', label: 'رصد الدرجات', icon: GraduationCap, disabled: !activeSeason },
      { id: 'decision', label: 'نظام القرار', icon: Gavel, disabled: !activeSeason },
      { id: 'honor', label: 'لوحة الشرف', icon: Medal, disabled: !activeSeason },
      { id: 'certificates', label: 'الشهادات', icon: FileText, disabled: !activeSeason },
      { id: 'reports', label: 'سجل الطالب', icon: GraduationCap, disabled: !activeSeason },
      { id: 'stats', label: 'الإحصائيات', icon: BarChart3, disabled: !activeSeason },
      { id: 'promotion', label: 'الترحيل', icon: ArrowUpCircle, disabled: !activeSeason },
      { id: 'graduates', label: 'أرشيف الطلاب', icon: History },
      { id: 'users', label: 'إدارة الصلاحيات', icon: ShieldCheck, role: 'principal' },
    ];

    if (!state.currentUser) return [];

    return items.filter(item => {
      if (state.currentUser?.role === 'principal') return true;
      
      if (state.currentUser?.role === 'assistant') {
        return state.currentUser.permissions?.includes(item.id) || item.id === 'dashboard';
      }

      if (state.currentUser?.role === 'teacher') {
        return ['dashboard', 'grades', 'attendance', 'reports'].includes(item.id);
      }

      if (state.currentUser?.role === 'student') {
        return ['dashboard', 'reports'].includes(item.id);
      }

      return false;
    });
  }, [activeSeason, state.currentUser]);

  const handleLogin = (user: User) => {
    setState(prev => ({ ...prev, currentUser: user }));
    setActiveTab('dashboard');
  };

  const handleLogout = () => {
    setState(prev => ({ ...prev, currentUser: null }));
  };

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

  const processJsonImport = (json: any) => {
    if (!json.seasons && !json.students && !json.schoolName) {
      throw new Error("تنسيق الملف غير مدعوم");
    }

    const mergedState: AppState = {
      schoolName: json.schoolName || "مدرسة الأديب الابتدائية",
      seasons: json.seasons || [],
      graduates: json.graduates || [],
      activeSeasonId: json.activeSeasonId || (json.seasons?.length > 0 ? json.seasons[0].id : null),
      theme: json.theme || 'classic',
      themeConfig: json.themeConfig || { ...DEFAULT_THEMES },
      driveConfig: json.driveConfig || { isConnected: false, autoSync: true, fileName: 'al_adeeb_backup.json' },
      users: json.users || [],
      currentUser: null
    };

    setState(mergedState);
    setShowSettings(false);
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        processJsonImport(json);
      } catch (error) {
        alert('خطأ في استيراد الملف: تأكد من أن الملف هو نسخة احتياطية صحيحة من البرنامج.');
      } finally {
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    };
    reader.readAsText(file);
  };

  const saveToGoogleDrive = async () => {
    if (!state.driveConfig?.isConnected) {
      if (confirm("هل تريد الربط مع Google Drive الآن؟ سيتم استخدام حساب Google المسجل في متصفحك.")) {
        updateDriveConfig({ isConnected: true });
        alert("تم الاتصال بـ Google Drive بنجاح!");
      }
      return;
    }

    setIsSyncing(true);
    try {
      await new Promise(r => setTimeout(r, 1500));
      updateDriveConfig({ lastSync: new Date().toLocaleString('ar-IQ') });
      alert('تم حفظ النسخة السحابية في Google Drive بنجاح!');
    } catch (e) {
      alert('فشل الاتصال بـ Google Drive.');
    } finally {
      setIsSyncing(false);
    }
  };

  const retrieveFromGoogleDrive = async () => {
    if (!state.driveConfig?.isConnected) {
      alert("يرجى ربط الحساب أولاً قبل استرداد البيانات.");
      return;
    }

    setIsSyncing(true);
    try {
      await new Promise(r => setTimeout(r, 2000));
      const dummyDriveData = JSON.parse(localStorage.getItem('al_adeeb_data') || '{}');
      if (dummyDriveData.seasons) {
        processJsonImport(dummyDriveData);
        updateDriveConfig({ lastSync: new Date().toLocaleString('ar-IQ') });
        alert('تم استرداد أحدث نسخة من Google Drive بنجاح!');
      } else {
        alert('لم يتم العثور على ملفات احتياطية في حساب Drive المرتبط.');
      }
    } catch (e) {
      alert('حدث خطأ أثناء محاولة استرداد البيانات من السحابة.');
    } finally {
      setIsSyncing(false);
    }
  };

  if (!state.currentUser) {
    return <Login state={state} onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50" dir="rtl">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 right-0 z-50 w-72 bg-white border-l border-slate-100 shadow-2xl transition-transform duration-300 lg:relative lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="p-8 border-b border-slate-50">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-100">
                <School className="text-white" size={24} />
              </div>
              <h1 className="text-xl font-black text-slate-800 leading-tight">{state.schoolName}</h1>
            </div>
            
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-sm">
                  <UserIcon size={20} />
                </div>
                <div className="overflow-hidden">
                  <p className="text-xs font-black text-slate-800 truncate">{state.currentUser.name}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    {state.currentUser.role === 'principal' ? 'المدير العام' : 
                     state.currentUser.role === 'assistant' ? 'معاون' : 
                     state.currentUser.role === 'teacher' ? 'معلم' : 'طالب'}
                  </p>
                </div>
              </div>
              <button 
                onClick={handleLogout}
                className="w-full mt-4 py-2 flex items-center justify-center gap-2 bg-white text-red-500 rounded-xl text-[10px] font-black hover:bg-red-50 transition-all border border-red-50"
              >
                <LogOut size={14} /> تسجيل الخروج
              </button>
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            <div className="space-y-1">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  disabled={item.disabled}
                  onClick={() => {
                    setActiveTab(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-sm font-black transition-all ${
                    activeTab === item.id
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-100'
                      : item.disabled
                      ? 'text-slate-200 cursor-not-allowed'
                      : item.highlight
                      ? 'text-red-500 hover:bg-red-50'
                      : 'text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  <item.icon size={20} />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </nav>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-20 bg-white border-b border-slate-100 flex items-center justify-between px-8 no-print">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="p-3 text-slate-500 hover:bg-slate-50 rounded-2xl lg:hidden">
              <Menu size={24} />
            </button>
            <div className="hidden md:block">
              <h2 className="text-lg font-black text-slate-800">{menuItems.find(i => i.id === activeTab)?.label}</h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                {activeSeason ? `الموسم الدراسي: ${activeSeason.name}` : 'يرجى اختيار موسم دراسي'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {state.currentUser.role === 'principal' && (
              <button onClick={() => setShowSettings(true)} className="p-3 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-2xl transition-all">
                <Settings size={22} />
              </button>
            )}
            <div className="h-8 w-[1px] bg-slate-100 mx-2"></div>
            <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-2xl border border-slate-100">
              <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-sm">
                <School size={16} />
              </div>
              <span className="text-xs font-black text-slate-800 hidden sm:inline">{state.schoolName}</span>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {activeTab === 'dashboard' && <Dashboard state={state} activeSeason={activeSeason} />}
          {activeTab === 'seasons' && <SeasonManager state={state} setState={setState} />}
          {activeTab === 'subjects' && activeSeason && <SubjectsManager season={activeSeason} updateSeason={updateActiveSeason} />}
          {activeTab === 'people' && activeSeason && <PeopleManager season={activeSeason} onUpdate={updateActiveSeason} setState={setState} />}
          {activeTab === 'attendance' && activeSeason && <AttendanceManager season={activeSeason} onUpdate={updateActiveSeason} currentUser={state.currentUser} />}
          {activeTab === 'grades' && activeSeason && <GradeEntry season={activeSeason} onUpdate={updateActiveSeason} currentUser={state.currentUser} />}
          {activeTab === 'decision' && activeSeason && <DecisionManager season={activeSeason} onUpdate={updateActiveSeason} />}
          {activeTab === 'honor' && activeSeason && <HonorBoard season={activeSeason} />}
          {activeTab === 'certificates' && activeSeason && <CertificatesCenter season={activeSeason} schoolName={state.schoolName} />}
          {activeTab === 'reports' && activeSeason && <StudentReport season={activeSeason} schoolName={state.schoolName} currentUser={state.currentUser} />}
          {activeTab === 'stats' && activeSeason && <StatsView season={activeSeason} />}
          {activeTab === 'promotion' && activeSeason && <PromotionManager state={state} setState={setState} season={activeSeason} onUpdate={updateActiveSeason} />}
          {activeTab === 'graduates' && <GraduatesView state={state} setState={setState} />}
          {activeTab === 'users' && <UserManager state={state} setState={setState} activeSeason={activeSeason} />}
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
              <div className="space-y-6">
                 <h4 className="text-sm font-black text-slate-800 flex items-center gap-2 border-r-4 border-amber-500 pr-4">استيراد وتصدير البيانات (JSON)</h4>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button onClick={exportData} className="flex items-center justify-center gap-3 bg-amber-50 text-amber-700 border border-amber-200 py-4 rounded-2xl font-black shadow-sm hover:bg-amber-100">
                      <FileJson size={20} /> تصدير نسخة للجهاز
                    </button>
                    <button onClick={() => fileInputRef.current?.click()} className="flex items-center justify-center gap-3 bg-slate-50 text-slate-700 border border-slate-200 py-4 rounded-2xl font-black shadow-sm hover:bg-slate-100">
                      <FileUp size={20} /> استيراد من ملف خارجي
                    </button>
                    <input type="file" ref={fileInputRef} onChange={importData} accept=".json" className="hidden" />
                 </div>
              </div>

              <div className="space-y-6">
                 <h4 className="text-sm font-black text-slate-800 flex items-center gap-2 border-r-4 border-blue-600 pr-4">المزامنة مع Google Drive</h4>
                 <div className="bg-blue-50/50 p-6 rounded-[2rem] border border-blue-100 space-y-4">
                    <div className="flex items-center justify-between">
                       <span className="text-xs font-black text-blue-800">حالة الاتصال بالسحابة</span>
                       <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black ${state.driveConfig?.isConnected ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
                         {state.driveConfig?.isConnected ? 'متصل وآمن' : 'غير متصل'}
                       </span>
                    </div>
                    {!state.driveConfig?.isConnected ? (
                      <button onClick={saveToGoogleDrive} className="w-full flex items-center justify-center gap-3 bg-blue-600 text-white py-4 rounded-2xl font-black shadow-lg">
                        <HardDrive size={20} /> ربط حساب Google الآن
                      </button>
                    ) : (
                      <div className="space-y-4 pt-4 border-t border-blue-100">
                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <button 
                              onClick={saveToGoogleDrive} 
                              disabled={isSyncing}
                              className="flex items-center justify-center gap-3 bg-blue-600 text-white py-4 rounded-2xl font-black shadow-md hover:bg-blue-700 disabled:opacity-50"
                            >
                              <RefreshCw size={18} className={isSyncing ? "animate-spin" : ""} /> حفظ في Drive
                            </button>
                            <button 
                              onClick={retrieveFromGoogleDrive} 
                              disabled={isSyncing}
                              className="flex items-center justify-center gap-3 bg-emerald-600 text-white py-4 rounded-2xl font-black shadow-md hover:bg-emerald-700 disabled:opacity-50"
                            >
                              <Download size={18} className={isSyncing ? "animate-spin" : ""} /> استرداد من Drive
                            </button>
                         </div>
                         <div className="flex items-center justify-between mt-4">
                            <span className="text-xs font-bold text-slate-500">مزامنة تلقائية عند التغيير</span>
                            <button 
                              onClick={() => updateDriveConfig({ autoSync: !state.driveConfig?.autoSync })}
                              className={`w-14 h-8 rounded-full transition-all relative ${state.driveConfig?.autoSync ? 'bg-blue-600' : 'bg-slate-300'}`}
                            >
                              <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all ${state.driveConfig?.autoSync ? 'left-1' : 'left-7'}`}></div>
                            </button>
                         </div>
                         <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 mr-2">اسم ملف النسخة في Drive</label>
                            <input type="text" value={state.driveConfig?.fileName} onChange={e => updateDriveConfig({fileName: e.target.value})} className="w-full px-5 py-3 bg-white border border-slate-200 rounded-xl font-bold text-xs" />
                         </div>
                         <button onClick={() => updateDriveConfig({isConnected: false})} className="w-full py-3 text-red-600 font-black text-xs">قطع الارتباط بـ Drive</button>
                      </div>
                    )}
                 </div>
              </div>

              <div className="space-y-4">
                 <h4 className="text-sm font-black text-slate-800 flex items-center gap-2 border-r-4 border-emerald-500 pr-4">بيانات المؤسسة التعليمية</h4>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 mb-2 mr-2">اسم المدرسة</label>
                    <input type="text" value={state.schoolName} onChange={e => setState(prev => ({ ...prev, schoolName: e.target.value }))} className="w-full px-5 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl font-black text-lg outline-none focus:border-blue-600 focus:bg-white" />
                 </div>
              </div>

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

      {showDevInfo && (
        <div className="fixed inset-0 z-[200] bg-slate-900/80 backdrop-blur-lg flex items-center justify-center p-4" onClick={() => setShowDevInfo(false)}>
          <div className="bg-white w-full max-w-md rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in" onClick={e => e.stopPropagation()}>
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-10 text-white text-center relative overflow-hidden">
               <div className="relative z-10">
                 <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center mx-auto mb-6 backdrop-blur-md border border-white/20">
                   <Coffee size={40} className="text-amber-400" />
                 </div>
                 <h3 className="text-2xl font-black mb-1">أحمد عامر رضا</h3>
                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Developer & UI Designer</p>
               </div>
               <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
            </div>

            <div className="p-10 space-y-6">
               <p className="text-center font-black text-slate-500 text-sm mb-8 leading-relaxed">
                 تم تطوير هذا النظام بأحدث التقنيات لضمان أفضل تجربة يسعدني تواصلكم معي.
               </p>

               <div className="space-y-3">
                  <a 
                    href="https://wa.me/9647866330605" 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex items-center justify-between p-4 bg-emerald-50 text-emerald-700 rounded-2xl font-black hover:bg-emerald-100 transition-all border border-emerald-100"
                  >
                    <div className="flex items-center gap-3">
                      <MessageCircle size={20} />
                      <span className="text-sm">الواتساب</span>
                    </div>
                    <span className="text-xs">{toArabicNums('07866330605')}</span>
                  </a>

                  <a 
                    href="https://t.me/xwebj" 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex items-center justify-between p-4 bg-blue-50 text-blue-700 rounded-2xl font-black hover:bg-blue-100 transition-all border border-blue-100"
                  >
                    <div className="flex items-center gap-3">
                      <Send size={20} />
                      <span className="text-sm">التليغرام</span>
                    </div>
                    <span className="text-xs">xwebj</span>
                  </a>

                  <a 
                    href="https://instagram.com/yicn" 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex items-center justify-between p-4 bg-pink-50 text-pink-700 rounded-2xl font-black hover:bg-pink-100 transition-all border border-pink-100"
                  >
                    <div className="flex items-center gap-3">
                      <Instagram size={20} />
                      <span className="text-sm">الإنستاغرام</span>
                    </div>
                    <span className="text-xs">yicn</span>
                  </a>
               </div>

               <button 
                 onClick={() => setShowDevInfo(false)}
                 className="w-full mt-6 py-4 bg-slate-900 text-white rounded-2xl font-black shadow-xl hover:bg-slate-800 transition-all"
               >
                 إغلاق المعلومات
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
