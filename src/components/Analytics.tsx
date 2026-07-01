import React from 'react';
import { useApp } from '../context/AppContext';
import { motion } from 'motion/react';
import {
  TrendingUp,
  Clock,
  CheckCircle,
  Award,
  BookOpen,
  Calendar,
  Layers,
  HelpCircle,
  Activity,
  Heart
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  LineChart,
  Line
} from 'recharts';

export const Analytics: React.FC = () => {
  const {
    tasks,
    assignments,
    attendance,
    subjects,
    user
  } = useApp();

  // Metrics calculators
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const pendingTasks = tasks.filter(t => t.status !== 'completed').length;
  const totalTasks = tasks.length;
  const taskCompletionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 80;

  const validAttendance = attendance.filter(at => at.total > 0);
  const avgAttendance = validAttendance.length > 0
    ? (validAttendance.reduce((acc, curr) => acc + (curr.attended / curr.total), 0) / validAttendance.length) * 100
    : 85;

  // Study Hours density mock over 7 days
  const performanceTrends = [
    { name: 'Mon', focusTime: 240, qualityIndex: 88, subjectsCovered: 3 },
    { name: 'Tue', focusTime: 360, qualityIndex: 90, subjectsCovered: 4 },
    { name: 'Wed', focusTime: 180, qualityIndex: 72, subjectsCovered: 2 },
    { name: 'Thu', focusTime: 320, qualityIndex: 94, subjectsCovered: 4 },
    { name: 'Fri', focusTime: 420, qualityIndex: 86, subjectsCovered: 5 },
    { name: 'Sat', focusTime: 120, qualityIndex: 80, subjectsCovered: 1 },
    { name: 'Sun', focusTime: 200, qualityIndex: 85, subjectsCovered: 2 }
  ];

  // Subject performance breakdown
  const subjectBreakdown = attendance.map(at => {
    const s = subjects.find(sub => sub.id === at.subjectId);
    const pct = at.total > 0 ? (at.attended / at.total) * 100 : 80;
    return {
      name: s ? s.code : 'Core',
      attendancePct: pct,
      tasksCreated: tasks.filter(t => t.subjectId === at.subjectId).length,
      assignmentsCreated: assignments.filter(a => a.subjectId === at.subjectId).length
    };
  });

  return (
    <div className="space-y-6 text-white pb-10">
      
      {/* Module Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-6 bg-slate-900/40 border border-slate-800/60 rounded-3xl backdrop-blur-xl">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-100 flex items-center">
            <Activity className="h-6 w-6 text-purple-400 mr-2" /> Academic Analytics
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Audit study sessions, analyze class attendance densities, and track syllabus milestone coverages.
          </p>
        </div>
      </div>

      {/* Bento Stats Summary row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stat 1 */}
        <div className="p-5 bg-slate-900/40 border border-slate-800/80 rounded-2xl">
          <p className="text-[10px] font-mono uppercase tracking-widest text-slate-500">Cumulative Focus</p>
          <p className="text-2xl font-extrabold mt-2">1,840 mins</p>
          <p className="text-[11px] text-slate-400 mt-1">Study session duration this week</p>
        </div>

        {/* Stat 2 */}
        <div className="p-5 bg-slate-900/40 border border-slate-800/80 rounded-2xl">
          <p className="text-[10px] font-mono uppercase tracking-widest text-slate-500">Task Completion Rate</p>
          <p className="text-2xl font-extrabold mt-2 text-purple-400">{taskCompletionRate.toFixed(1)}%</p>
          <p className="text-[11px] text-slate-400 mt-1">{completedTasks} of {totalTasks} milestones completed</p>
        </div>

        {/* Stat 3 */}
        <div className="p-5 bg-slate-900/40 border border-slate-800/80 rounded-2xl">
          <p className="text-[10px] font-mono uppercase tracking-widest text-slate-500">Average Attendance</p>
          <p className="text-2xl font-extrabold mt-2 text-emerald-400">{avgAttendance.toFixed(1)}%</p>
          <p className="text-[11px] text-slate-400 mt-1">Course attendance across terms</p>
        </div>

        {/* Stat 4 */}
        <div className="p-5 bg-slate-900/40 border border-slate-800/80 rounded-2xl">
          <p className="text-[10px] font-mono uppercase tracking-widest text-slate-500">Global Rank XP</p>
          <p className="text-2xl font-extrabold mt-2 text-amber-400">{user?.xp} XP</p>
          <p className="text-[11px] text-slate-400 mt-1">Academic Gamification Rank Level {user?.level}</p>
        </div>
      </div>

      {/* MAIN CHART BENTO GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart A: Weekly Focus Quality */}
        <div className="p-6 bg-slate-900/30 border border-slate-800/60 rounded-3xl">
          <div className="mb-4">
            <h3 className="text-sm font-bold">Study Sessions Duration Density (Mins)</h3>
            <p className="text-xs text-slate-500 font-mono">Daily aggregate Pomodoro intervals</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={performanceTrends}>
                <defs>
                  <linearGradient id="gradFocus" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#475569" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#475569" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b', borderRadius: '12px' }}
                />
                <Area type="monotone" dataKey="focusTime" stroke="#a855f7" strokeWidth={2.5} fillOpacity={1} fill="url(#gradFocus)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart B: Attendance & Workload comparison */}
        <div className="p-6 bg-slate-900/30 border border-slate-800/60 rounded-3xl">
          <div className="mb-4">
            <h3 className="text-sm font-bold">Course Workload & Attendance Rate Breakdown</h3>
            <p className="text-xs text-slate-500 font-mono">Comparing lecture status across classes</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={subjectBreakdown}>
                <XAxis dataKey="name" stroke="#475569" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#475569" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b', borderRadius: '12px' }}
                />
                <Bar dataKey="attendancePct" fill="#10b981" radius={[8, 8, 0, 0]}>
                  {subjectBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.attendancePct < 75 ? '#ef4444' : '#10b981'} />
                  ))}
                </Bar>
                <Bar dataKey="tasksCreated" fill="#6366f1" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
