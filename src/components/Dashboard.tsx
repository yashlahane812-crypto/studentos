import React, { useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { motion } from 'motion/react';
import {
  Flame,
  Calendar,
  Sparkles,
  CheckSquare,
  AlertTriangle,
  GraduationCap,
  Play,
  Plus,
  HelpCircle,
  FileText,
  Clock,
  ChevronRight,
  TrendingUp,
  Award
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
  Cell
} from 'recharts';

export const Dashboard: React.FC = () => {
  const {
    user,
    tasks,
    assignments,
    attendance,
    subjects,
    setActiveTab,
    aiDashboardSuggestion,
    aiSuggestionLoading,
    getDashboardSuggestions,
    addNotification,
    addTask,
    createNewChat
  } = useApp();

  // Load recommendations on mount
  useEffect(() => {
    getDashboardSuggestions();
  }, []);

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  // Calculate metrics
  const pendingTasks = (tasks || []).filter(t => t.status !== 'completed');
  const highPriorityTasksCount = pendingTasks.filter(t => t.priority === 'high').length;
  const assignmentsDueSoon = (assignments || []).filter(a => a.status !== 'submitted');
  
  // Calculate average attendance
  const validAttendance = (attendance || []).filter(at => at.total > 0);
  const avgAttendance = validAttendance.length > 0
    ? (validAttendance.reduce((acc, curr) => acc + (curr.attended / curr.total), 0) / validAttendance.length) * 100
    : 85;

  // Study hours mock data for the week
  const studyHoursData = [
    { day: 'Mon', hours: 4.5, focus: 85 },
    { day: 'Tue', hours: 6.0, focus: 90 },
    { day: 'Wed', hours: 3.2, focus: 75 },
    { day: 'Thu', hours: 5.8, focus: 92 },
    { day: 'Fri', hours: 7.2, focus: 88 },
    { day: 'Sat', hours: 2.0, focus: 80 },
    { day: 'Sun', hours: 4.0, focus: 85 }
  ];

  // Quick Action Handler wrappers
  const handleQuickTask = () => {
    const title = prompt('Enter a task title:');
    if (title && subjects.length > 0) {
      addTask({
        title,
        subjectId: subjects[0].id,
        priority: 'medium',
        deadline: new Date(Date.now() + 3600000 * 24 * 2).toISOString().split('T')[0],
        estimatedTime: '1.5h'
      });
    } else {
      alert('Create courses first, or specify a valid title.');
    }
  };

  const handleQuickDoubt = () => {
    const chatID = createNewChat();
    setActiveTab('doubt-solver');
  };

  return (
    <div className="space-y-6 text-white pb-10">
      {/* Top Greeting Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-8 bg-gradient-to-br from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-2xl relative overflow-hidden shadow-xl backdrop-blur-xl">
        <div className="absolute top-0 right-0 h-40 w-40 bg-blue-500/15 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 left-0 h-32 w-32 bg-cyan-500/10 rounded-full blur-3xl -z-10" />
        
        <div>
          <span className="text-[10px] text-blue-300 font-bold tracking-widest font-mono uppercase bg-blue-500/20 px-2.5 py-1 rounded border border-blue-400/30">
            {today}
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight mt-3 text-slate-100 flex items-center">
            Welcome back, {user?.name.split(' ')[0]} <span className="animate-bounce ml-2">👋</span>
          </h2>
          <p className="text-xs md:text-sm text-slate-300 mt-1.5 max-w-lg leading-relaxed">
            Ready to crush your goals today? Your AI Assistant has analyzed your schedules and prioritized your workspace.
          </p>
        </div>

        {/* Study Streak Display */}
        <div className="flex items-center space-x-4 mt-4 md:mt-0 bg-[#09090B] border border-slate-800 p-3.5 px-5 rounded-xl">
          <div className="bg-orange-500/10 p-2 rounded-lg border border-orange-500/20">
            <Flame className="h-5 w-5 text-orange-400 animate-pulse" />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 font-mono uppercase tracking-tight">Study Streak</p>
            <p className="text-lg font-bold text-orange-400">{user?.streak} 🔥 +2 days</p>
          </div>
        </div>
      </div>

      {/* Grid of Key Performance Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Pending Tasks */}
        <div
          onClick={() => setActiveTab('todo')}
          className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between hover:bg-slate-900/80 cursor-pointer transition group relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 h-16 w-16 bg-blue-500/5 rounded-full blur-xl group-hover:bg-blue-500/10" />
          <span className="text-xs text-slate-500 font-medium uppercase tracking-tight">Todo List</span>
          <div className="flex items-end justify-between mt-3">
            <span className="text-3xl font-bold text-blue-400">{pendingTasks.length}</span>
            <div className="text-[10px] text-rose-400 mb-1 font-semibold">{highPriorityTasksCount} urgent</div>
          </div>
        </div>

        {/* Card 2: Assignments Due */}
        <div
          onClick={() => setActiveTab('assignments')}
          className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between hover:bg-slate-900/80 cursor-pointer transition group relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 h-16 w-16 bg-purple-500/5 rounded-full blur-xl group-hover:bg-purple-500/10" />
          <span className="text-xs text-slate-500 font-medium uppercase tracking-tight">Assignments</span>
          <div className="flex items-end justify-between mt-3">
            <span className="text-3xl font-bold text-purple-400">{assignmentsDueSoon.length}</span>
            <div className="text-[10px] text-slate-500 mb-1">Due soon</div>
          </div>
        </div>

        {/* Card 3: Attendance tracker average */}
        <div
          onClick={() => setActiveTab('attendance')}
          className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between hover:bg-slate-900/80 cursor-pointer transition group relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 h-16 w-16 bg-cyan-500/5 rounded-full blur-xl group-hover:bg-cyan-500/10" />
          <span className="text-xs text-slate-500 font-medium uppercase tracking-tight">Attendance</span>
          <div className="flex items-end justify-between mt-3">
            <span className="text-3xl font-bold text-cyan-400">{avgAttendance.toFixed(1)}%</span>
            <div className={`text-[10px] mb-1 font-semibold ${avgAttendance >= 75 ? 'text-cyan-400' : 'text-rose-400'}`}>
              {avgAttendance >= 75 ? 'Secure' : 'Low'}
            </div>
          </div>
        </div>

        {/* Card 4: Hours Studied */}
        <div
          onClick={() => setActiveTab('analytics')}
          className="bg-slate-900/50 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between hover:bg-slate-900/80 cursor-pointer transition group relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 h-16 w-16 bg-blue-500/5 rounded-full blur-xl group-hover:bg-blue-500/10" />
          <span className="text-xs text-slate-500 font-medium uppercase tracking-tight">Hours Studied</span>
          <div className="flex items-end justify-between mt-3">
            <span className="text-3xl font-bold text-blue-400">32.7</span>
            <div className="text-[10px] text-slate-500 mb-1">this week</div>
          </div>
        </div>
      </div>

      {/* Dynamic AI Suggestion Box */}
      <div className="p-6 bg-gradient-to-br from-blue-600/10 to-cyan-500/10 border border-blue-500/20 rounded-2xl relative overflow-hidden shadow-2xl backdrop-blur-xl">
        <div className="absolute top-0 right-0 h-32 w-32 bg-blue-500/10 rounded-full blur-2xl" />
        <div className="flex items-center space-x-2 text-blue-400 font-semibold text-xs uppercase tracking-wider font-mono">
          <Sparkles className="h-4 w-4 text-blue-400 animate-spin" />
          <span>Gemini Academic Advisor Recommendation</span>
        </div>

        {aiSuggestionLoading ? (
          <div className="mt-4 space-y-2.5 animate-pulse">
            <div className="h-4 w-full bg-slate-800/80 rounded-md" />
            <div className="h-4 w-5/6 bg-slate-800/80 rounded-md" />
            <div className="h-4 w-4/5 bg-slate-800/80 rounded-md" />
          </div>
        ) : (
          <p className="mt-3 text-slate-200 leading-relaxed text-sm">
            {aiDashboardSuggestion}
          </p>
        )}

        <div className="mt-4 flex items-center justify-between">
          <button
            onClick={getDashboardSuggestions}
            className="text-xs text-blue-400 hover:text-blue-300 underline font-mono flex items-center transition"
          >
            Re-analyze Workspace Status
          </button>
          <span className="text-[10px] text-slate-500 font-mono">Powered by gemini-3.5-flash</span>
        </div>
      </div>

      {/* Main Core Section: Charts and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Study Analytics Chart */}
        <div className="lg:col-span-2 p-6 bg-slate-900/40 border border-slate-800 rounded-2xl flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-sm font-semibold">Weekly Study Activity</h3>
              <p className="text-xs text-slate-500">Focus time across all subjects</p>
            </div>
            <div className="flex items-center space-x-4 text-xs font-mono">
              <div className="flex items-center">
                <span className="h-2 w-2 rounded-full bg-blue-500 mr-1.5" />
                <span className="text-slate-400">Hours</span>
              </div>
              <div className="flex items-center">
                <span className="h-2 w-2 rounded-full bg-cyan-400 mr-1.5" />
                <span className="text-slate-400">Focus Index</span>
              </div>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={studyHoursData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorFocus" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#09090b', borderColor: '#1e293b', borderRadius: '12px' }}
                  labelStyle={{ color: '#94a3b8', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="hours" stroke="#3b82f6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorHours)" />
                <Area type="monotone" dataKey="focus" stroke="#22d3ee" strokeWidth={1.5} strokeDasharray="4 4" fillOpacity={1} fill="url(#colorFocus)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Col: Streak Milestones & Leaderboard */}
        <div className="space-y-4">
          {/* Leaderboard/Gamification Sneak-peek */}
          <div className="p-5 bg-slate-900/40 border border-slate-800 rounded-2xl flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-500/15 rounded-xl text-blue-400 border border-blue-500/20">
                <Award className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] font-mono uppercase tracking-wider text-slate-500">Global Rank</p>
                <p className="text-xs font-bold text-slate-300">#4 in Stanford CS Track</p>
              </div>
            </div>
            <span className="text-[10px] font-bold font-mono text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded border border-blue-500/20">
              TOP 5%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
