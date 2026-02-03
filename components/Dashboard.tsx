
import React from 'react';
import { AppState } from '../types';
import { Users, GraduationCap, Calendar, BookOpen } from 'lucide-react';

interface Props {
  state: AppState;
  setState: React.Dispatch<React.SetStateAction<AppState>>;
}

const Dashboard: React.FC<Props> = ({ state }) => {
  const activeSeason = state.seasons.find(s => s.id === state.activeSeasonId);

  const stats = [
    { label: 'المواسم الدراسية', value: state.seasons.length, icon: Calendar, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'الطلاب المسجلين', value: activeSeason?.students.length || 0, icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'المعلمون', value: activeSeason?.teachers.length || 0, icon: GraduationCap, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'المواد الدراسية', value: activeSeason ? Object.values(activeSeason.subjects).flat().length : 0, icon: BookOpen, color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Welcome Hero */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-blue-800 rounded-[3rem] p-12 text-white shadow-xl">
        <div className="relative z-10">
          <h1 className="text-4xl font-black mb-4">{state.schoolName}</h1>
          <p className="text-blue-100 text-lg max-w-2xl font-bold">
            أهلاً بك في نظام إدارة ورصد الدرجات المطور. يمكنك البدء بإدارة المواسم الدراسية أو رصد درجات الطلاب من خلال القائمة الجانبية.
          </p>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-400/20 rounded-full -ml-32 -mb-32 blur-3xl"></div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100 flex items-center gap-5 transition-all hover:scale-105 hover:shadow-lg group">
            <div className={`${stat.bg} w-16 h-16 rounded-2xl flex items-center justify-center transition-transform group-hover:rotate-12`}>
              <stat.icon className={stat.color} size={32} />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-black mb-1">{stat.label}</p>
              <p className="text-3xl font-black text-slate-800">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {!activeSeason && (
        <div className="bg-amber-50 border-2 border-amber-200 p-10 rounded-[3rem] flex items-center gap-8 text-amber-800 animate-pulse">
          <div className="w-20 h-20 bg-amber-200/50 rounded-full flex items-center justify-center">
            <Calendar className="text-amber-600" size={40} />
          </div>
          <div>
            <h3 className="font-black text-2xl mb-2">تنبيه: لا يوجد موسم دراسي نشط</h3>
            <p className="opacity-80 font-bold text-lg">يرجى الانتقال لتبويب "المواسم الدراسية" من القائمة الجانبية لتفعيل الموسم الحالي للبدء بالعمل.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
