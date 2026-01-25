
import React, { useMemo } from 'react';
import { Season } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';
import { GraduationCap, BookOpen, UserCheck } from 'lucide-react';

interface Props {
  season: Season;
}

const StatsView: React.FC<Props> = ({ season }) => {
  const gradeStats = useMemo(() => {
    return [1, 2, 3, 4, 5, 6].map(g => {
      const gradeStudents = season.students.filter(s => s.grade === g);
      const gradeGrades = season.grades.filter(gr => 
        gradeStudents.some(s => s.id === gr.studentId)
      );
      
      const successCount = gradeGrades.filter(gr => (gr.finalResult ?? 0) >= 50).length;
      const totalPossible = gradeGrades.length;
      const successRate = totalPossible > 0 ? (successCount / totalPossible) * 100 : 0;

      return {
        name: `الصف ${g}`,
        الطلاب: gradeStudents.length,
        'نسبة النجاح': Math.round(successRate),
      };
    });
  }, [season]);

  const overallStats = useMemo(() => {
    const totalGrades = season.grades.length;
    if (totalGrades === 0) return [];
    
    const passed = season.grades.filter(g => (g.finalResult ?? 0) >= 50).length;
    const failed = totalGrades - passed;

    return [
      { name: 'ناجح', value: passed, color: '#10b981' },
      { name: 'راسب', value: failed, color: '#ef4444' }
    ];
  }, [season.grades]);

  const teacherStats = useMemo(() => {
    return season.teachers.map(t => ({
      name: t.name,
      المهام: t.assignments.length,
      assignments: t.assignments
    })).sort((a, b) => b.المهام - a.المهام);
  }, [season.teachers]);

  return (
    <div className="space-y-8 pb-12">
      {/* Grade Success & Result Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Success Rates by Grade */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-xl font-bold mb-8 text-gray-800 flex items-center gap-2">
            <UserCheck className="text-blue-500" size={24} />
            نسبة النجاح حسب الصف (%)
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={gradeStats}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis unit="%" />
                <Tooltip />
                <Bar dataKey="نسبة النجاح" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Overall Pass/Fail Ratio */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-xl font-bold mb-8 text-gray-800">التوزيع العام للنتائج</h3>
          <div className="h-[300px] flex items-center justify-center">
            {overallStats.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={overallStats}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {overallStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-400">لا توجد درجات مرصودة حالياً</p>
            )}
          </div>
        </div>
      </div>

      {/* Teacher Statistics Section */}
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="text-xl font-bold mb-8 text-gray-800 flex items-center gap-2">
          <GraduationCap className="text-purple-500" size={24} />
          إحصائيات المعلمين والمهام
        </h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Chart Column */}
          <div className="lg:col-span-2">
            <div className="h-[350px]">
              {teacherStats.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={teacherStats} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={100} />
                    <Tooltip />
                    <Bar dataKey="المهام" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center border-2 border-dashed border-gray-100 rounded-xl text-gray-400">
                  لا توجد بيانات معلمين لعرضها
                </div>
              )}
            </div>
          </div>

          {/* Teacher Summary Grid */}
          <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2">
            {teacherStats.map((t, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-purple-50/50 border border-purple-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold text-xs">
                    {t.name[0]}
                  </div>
                  <span className="font-bold text-gray-700 text-sm">{t.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-purple-400">عدد المهام:</span>
                  <span className="bg-purple-600 text-white px-2 py-0.5 rounded-lg text-xs font-bold">{t.المهام}</span>
                </div>
              </div>
            ))}
            {teacherStats.length === 0 && (
              <p className="text-center text-gray-400 py-10">لم يتم إضافة معلمين بعد</p>
            )}
          </div>
        </div>
      </div>

      {/* Summary Table for Students */}
      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="text-xl font-bold mb-6 text-gray-800 flex items-center gap-2">
          <BookOpen className="text-amber-500" size={24} />
          تفاصيل أعداد الطلاب لكل صف
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {gradeStats.map(g => (
            <div key={g.name} className="p-4 rounded-xl bg-gray-50 border border-gray-100 text-center hover:bg-white hover:shadow-md transition-all">
              <p className="text-sm text-gray-500 mb-1">{g.name}</p>
              <p className="text-2xl font-bold text-gray-800">{g.الطلاب}</p>
              <p className="text-xs text-blue-600 mt-1">طالب مسجل</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StatsView;
