
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
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 to-blue-800 rounded-3xl p-12 text-white shadow-xl">
        <div className="relative z-10">
          <h1 className="text-4xl font-bold mb-4">مدرسة الأديب الابتدائية للبنين</h1>
          <p className="text-blue-100 text-lg max-w-2xl">
            أهلاً بك في نظام إدارة ورصد الدرجات. يمكنك البدء بإدارة المواسم الدراسية أو رصد درجات الطلاب من خلال القائمة الجانبية.
          </p>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-400/20 rounded-full -ml-32 -mb-32 blur-3xl"></div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 transition-all hover:scale-105">
            <div className={`${stat.bg} p-4 rounded-xl`}>
              <stat.icon className={stat.color} size={28} />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-bold">{stat.label}</p>
              <p className="text-2xl font-black text-gray-800">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {!activeSeason && (
        <div className="bg-amber-50 border border-amber-200 p-8 rounded-3xl flex items-center gap-6 text-amber-800 animate-pulse">
          <Calendar className="text-amber-600 shrink-0" size={48} />
          <div>
            <h3 className="font-black text-xl mb-1">تنبيه: لا يوجد موسم دراسي نشط</h3>
            <p className="opacity-80 font-bold">يرجى الانتقال لتبويب "المواسم الدراسية" لتفعيل الموسم الحالي للبدء بالعمل.</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
