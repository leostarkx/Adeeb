import React, { useState } from 'react';
import { User, UserRole, AppState, Season } from '../types';
import { 
  UserPlus, Shield, User as UserIcon, Trash2, 
  Key, ShieldCheck, ShieldAlert, GraduationCap, Users 
} from 'lucide-react';

import { toArabicNums } from '../utils/calculations';

interface Props {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
  activeSeason: Season | undefined;
}

const UserManager: React.FC<Props> = ({ state, setState, activeSeason }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newUser, setNewUser] = useState<Partial<User>>({
    role: 'assistant',
    permissions: []
  });

  const addUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.username || !newUser.password || !newUser.name || !newUser.role) return;

    const user: User = {
      id: Date.now().toString(),
      username: newUser.username,
      password: newUser.password,
      name: newUser.name,
      role: newUser.role as UserRole,
      linkedId: newUser.linkedId,
      permissions: newUser.permissions || []
    };

    setState(prev => ({
      ...prev,
      users: [...(prev.users || []), user]
    }));

    setNewUser({ role: 'assistant', permissions: [] });
    setShowAddForm(false);
  };

  const deleteUser = (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا المستخدم؟')) {
      setState(prev => ({
        ...prev,
        users: prev.users.filter(u => u.id !== id)
      }));
    }
  };

  const togglePermission = (user: User, permission: string) => {
    const updatedPermissions = user.permissions?.includes(permission)
      ? user.permissions.filter(p => p !== permission)
      : [...(user.permissions || []), permission];

    setState(prev => ({
      ...prev,
      users: prev.users.map(u => u.id === user.id ? { ...u, permissions: updatedPermissions } : u)
    }));
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'principal': return <ShieldCheck className="text-blue-600" />;
      case 'assistant': return <Shield className="text-amber-600" />;
      case 'teacher': return <Users className="text-emerald-600" />;
      case 'student': return <GraduationCap className="text-purple-600" />;
    }
  };

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case 'principal': return 'مدير';
      case 'assistant': return 'معاون';
      case 'teacher': return 'معلم';
      case 'student': return 'طالب';
    }
  };

  const availablePermissions = [
    { id: 'dashboard', label: 'الرئيسية' },
    { id: 'seasons', label: 'المواسم' },
    { id: 'subjects', label: 'المواد' },
    { id: 'people', label: 'المعلمون والطلاب' },
    { id: 'attendance', label: 'الغيابات' },
    { id: 'grades', label: 'الدرجات' },
    { id: 'decision', label: 'القرار' },
    { id: 'honor', label: 'لوحة الشرف' },
    { id: 'certificates', label: 'الشهادات' },
    { id: 'reports', label: 'سجل الطالب' },
    { id: 'stats', label: 'الإحصائيات' },
    { id: 'promotion', label: 'الترحيل' },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in pb-20">
      <div className="bg-white p-10 rounded-[4rem] shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-10">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-blue-600 text-white rounded-3xl shadow-lg">
              <ShieldCheck size={28} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-800">إدارة المستخدمين والصلاحيات</h2>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">إدارة حسابات الدخول وتحديد الأدوار</p>
            </div>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-sm hover:bg-slate-800 transition-all shadow-xl shadow-slate-100"
          >
            <UserPlus size={20} /> إضافة مستخدم جديد
          </button>
        </div>

        {showAddForm && (
          <form onSubmit={addUser} className="bg-slate-50 p-8 rounded-[3rem] border-2 border-slate-100 mb-10 space-y-6 animate-in slide-in-from-top-4 duration-300">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 mr-2 uppercase tracking-widest">الاسم الكامل</label>
                <input
                  type="text"
                  value={newUser.name || ''}
                  onChange={e => setNewUser({ ...newUser, name: e.target.value })}
                  className="w-full p-4 bg-white border-2 border-white rounded-2xl font-black outline-none focus:border-blue-600 transition-all"
                  placeholder="أدخل الاسم الكامل"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 mr-2 uppercase tracking-widest">اسم المستخدم</label>
                <input
                  type="text"
                  value={newUser.username || ''}
                  onChange={e => setNewUser({ ...newUser, username: e.target.value })}
                  className="w-full p-4 bg-white border-2 border-white rounded-2xl font-black outline-none focus:border-blue-600 transition-all"
                  placeholder="أدخل اسم المستخدم"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 mr-2 uppercase tracking-widest">كلمة المرور</label>
                <input
                  type="password"
                  value={newUser.password || ''}
                  onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                  className="w-full p-4 bg-white border-2 border-white rounded-2xl font-black outline-none focus:border-blue-600 transition-all"
                  placeholder="أدخل كلمة المرور"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 mr-2 uppercase tracking-widest">الدور (الرتبة)</label>
                <select
                  value={newUser.role}
                  onChange={e => setNewUser({ ...newUser, role: e.target.value as UserRole, linkedId: undefined })}
                  className="w-full p-4 bg-white border-2 border-white rounded-2xl font-black outline-none focus:border-blue-600 transition-all"
                >
                  <option value="principal">مدير</option>
                  <option value="assistant">معاون</option>
                  <option value="teacher">معلم</option>
                  <option value="student">طالب</option>
                </select>
              </div>
            </div>

            {newUser.role === 'teacher' && activeSeason && (
              <div className="space-y-2 animate-in fade-in">
                <label className="text-[10px] font-black text-slate-400 mr-2 uppercase tracking-widest">ربط مع معلم من القائمة</label>
                <select
                  value={newUser.linkedId || ''}
                  onChange={e => setNewUser({ ...newUser, linkedId: e.target.value })}
                  className="w-full p-4 bg-white border-2 border-white rounded-2xl font-black outline-none focus:border-blue-600 transition-all"
                  required
                >
                  <option value="">-- اختر المعلم --</option>
                  {(activeSeason.teachers || []).map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
            )}

            {newUser.role === 'student' && activeSeason && (
              <div className="space-y-2 animate-in fade-in">
                <label className="text-[10px] font-black text-slate-400 mr-2 uppercase tracking-widest">ربط مع طالب من القائمة</label>
                <select
                  value={newUser.linkedId || ''}
                  onChange={e => setNewUser({ ...newUser, linkedId: e.target.value })}
                  className="w-full p-4 bg-white border-2 border-white rounded-2xl font-black outline-none focus:border-blue-600 transition-all"
                  required
                >
                  <option value="">-- اختر الطالب --</option>
                  {(activeSeason.students || []).map(s => (
                    <option key={s.id} value={s.id}>{s.name} (الصف {toArabicNums(s.grade)})</option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-8 py-4 bg-white text-slate-500 rounded-2xl font-black text-sm hover:bg-slate-100 transition-all"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="px-12 py-4 bg-blue-600 text-white rounded-2xl font-black text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
              >
                حفظ المستخدم
              </button>
            </div>
          </form>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {state.users?.map(user => (
            <div key={user.id} className="bg-white border-2 border-slate-50 rounded-[2.5rem] p-8 hover:border-blue-100 transition-all group relative">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                  {getRoleIcon(user.role)}
                </div>
                <div>
                  <h3 className="font-black text-slate-800 leading-tight">{user.name}</h3>
                  <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">@{user.username} | {getRoleLabel(user.role)}</p>
                </div>
              </div>

              {user.role === 'assistant' && (
                <div className="space-y-4 mb-6">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 pb-2">صلاحيات المعاون</p>
                  <div className="flex flex-wrap gap-2">
                    {availablePermissions.map(perm => (
                      <button
                        key={perm.id}
                        onClick={() => togglePermission(user, perm.id)}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-black transition-all ${
                          user.permissions?.includes(perm.id)
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                        }`}
                      >
                        {perm.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {user.role === 'teacher' && user.linkedId && (
                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 mb-6">
                  <p className="text-[10px] font-black text-emerald-700 leading-tight">مرتبط بسجل المعلم:</p>
                  <p className="text-xs font-bold text-emerald-800 mt-1">
                    {(activeSeason?.teachers || []).find(t => t.id === user.linkedId)?.name || 'غير موجود'}
                  </p>
                </div>
              )}

              {user.role === 'student' && user.linkedId && (
                <div className="p-4 bg-purple-50 rounded-2xl border border-purple-100 mb-6">
                  <p className="text-[10px] font-black text-purple-700 leading-tight">مرتبط بسجل الطالب:</p>
                  <p className="text-xs font-bold text-purple-800 mt-1">
                    {(activeSeason?.students || []).find(s => s.id === user.linkedId)?.name || 'غير موجود'}
                  </p>
                </div>
              )}

              <div className="flex justify-between items-center mt-6 pt-6 border-t border-slate-50">
                <div className="flex items-center gap-2 text-slate-300">
                  <Key size={14} />
                  <span className="text-[10px] font-bold">كلمة المرور: {user.password}</span>
                </div>
                <button
                  onClick={() => deleteUser(user.id)}
                  className="p-3 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                  title="حذف المستخدم"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
          {(!state.users || state.users.length === 0) && (
            <div className="col-span-full py-20 text-center bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
              <ShieldAlert size={48} className="mx-auto text-slate-200 mb-4" />
              <p className="text-slate-400 font-black">لا يوجد مستخدمين مضافين حالياً</p>
              <p className="text-[10px] text-slate-300 mt-2">استخدم حساب المدير الافتراضي (admin/admin) للبدء</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserManager;
