import React, { useState } from 'react';
import { User, AppState } from '../types';
import { Lock, User as UserIcon, ShieldCheck } from 'lucide-react';
import { toArabicNums } from '../utils/calculations';

interface Props {
  state: AppState;
  onLogin: (user: User) => void;
}

const Login: React.FC<Props> = ({ state, onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if user exists in the database
    const user = state.users.find(u => u.username === username && u.password === password);
    
    if (user) {
      onLogin(user);
      return;
    }

    // Default admin fallback if no admin user is explicitly created in the users list
    const hasAdminInList = state.users.some(u => u.username === 'admin');
    if (!hasAdminInList && username === 'admin' && password === 'admin') {
      const adminUser: User = {
        id: 'admin',
        username: 'admin',
        name: 'المدير العام',
        role: 'principal'
      };
      onLogin(adminUser);
      return;
    }

    setError('اسم المستخدم أو كلمة المرور غير صحيحة');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl p-10 border border-slate-100 animate-in fade-in zoom-in duration-500">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-200">
            <ShieldCheck size={40} className="text-white" />
          </div>
          <h1 className="text-3xl font-black text-slate-800 mb-2">{state.schoolName}</h1>
          <p className="text-slate-400 font-bold">نظام إدارة المؤسسة التعليمية</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 mr-2 uppercase tracking-widest">اسم المستخدم</label>
            <div className="relative">
              <UserIcon className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pr-12 pl-4 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl font-black outline-none focus:border-blue-600 focus:bg-white transition-all"
                placeholder="أدخل اسم المستخدم"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 mr-2 uppercase tracking-widest">كلمة المرور</label>
            <div className="relative">
              <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pr-12 pl-4 py-4 bg-slate-50 border-2 border-slate-50 rounded-2xl font-black outline-none focus:border-blue-600 focus:bg-white transition-all"
                placeholder="أدخل كلمة المرور"
                required
              />
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-50 text-red-600 rounded-xl text-xs font-black text-center border border-red-100">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-blue-100 hover:bg-blue-700 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            تسجيل الدخول
          </button>
        </form>

        <div className="mt-10 text-center">
          <p className="text-[10px] text-slate-300 font-bold uppercase tracking-widest">جميع الحقوق محفوظة © {toArabicNums(new Date().getFullYear())}</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
