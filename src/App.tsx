import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { ToDo } from './components/ToDo';
import { Notes } from './components/Notes';
import { AIDoubtSolver } from './components/AI_DoubtSolver';
import { StudyPlanner } from './components/StudyPlanner';
import { Timetable } from './components/Timetable';
import { Assignments } from './components/Assignments';
import { Attendance } from './components/Attendance';
import { Flashcards } from './components/Flashcards';
import { Analytics } from './components/Analytics';
import { Settings } from './components/Settings';
import { SupabaseDemo } from './components/SupabaseDemo';
import {
  Sparkles,
  Lock,
  User,
  GraduationCap,
  Mail,
  Award,
  Bell,
  LogOut,
  Info
} from 'lucide-react';

const MainAppContent: React.FC = () => {
  const {
    activeTab,
    notifications,
    user,
    setUser,
    addNotification
  } = useApp();

  // Authentication Mode Toggles
  const [isAuthenticated, setIsAuthenticated] = useState(true); // default true for instantaneous review, login screen is toggleable
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [signupName, setSignupName] = useState('');

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (authMode === 'signup') {
      setUser({
        name: signupName || 'New Student',
        university: 'Stanford University',
        streak: 1,
        xp: 100,
        level: 1
      });
      addNotification('Welcome to StudentOS!', 'Your AI companion workspace is calibrated. Start logging tasks to earn XP.', 'achievement');
    }
    setIsAuthenticated(true);
  };

  const handleDemoBypass = () => {
    setIsAuthenticated(true);
    addNotification('Sandbox Calibrated', 'Logged in using default Stanford University profile values.', 'info');
  };

  const renderActiveModule = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'todo':
        return <ToDo />;
      case 'notes':
        return <Notes />;
      case 'doubt-solver':
        return <AIDoubtSolver />;
      case 'study-planner':
        return <StudyPlanner />;
      case 'timetable':
        return <Timetable />;
      case 'assignments':
        return <Assignments />;
      case 'attendance':
        return <Attendance />;
      case 'flashcards':
        return <Flashcards />;
      case 'analytics':
        return <Analytics />;
      case 'settings':
        return <Settings />;
      case 'supabase-demo':
        return <SupabaseDemo />;
      default:
        return <Dashboard />;
    }
  };

  // 1. AUTHENTICATION LANDING SCREEN
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#09090B] text-white flex flex-col justify-center items-center p-4 font-sans relative overflow-hidden">
        {/* Aesthetic Glowing Orbs */}
        <div className="absolute top-1/4 left-1/4 h-96 w-96 bg-blue-600/10 rounded-full blur-3xl -z-10 animate-pulse" />
        <div className="absolute bottom-1/3 right-1/4 h-80 w-80 bg-cyan-600/10 rounded-full blur-3xl -z-10" />

        <div className="w-full max-w-md bg-[#0C0C0E]/40 border border-slate-800 rounded-3xl p-8 backdrop-blur-2xl shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="h-12 w-12 bg-gradient-to-tr from-blue-600 to-cyan-400 rounded-2xl flex items-center justify-center mx-auto shadow-lg text-lg font-black">
              S
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-100 mt-2">StudentOS</h1>
            <p className="text-xs text-slate-400 font-mono uppercase tracking-widest">Your AI Academic Companion</p>
          </div>

          <form onSubmit={handleAuthSubmit} className="space-y-4">
            {authMode === 'signup' && (
              <div className="space-y-1">
                <label className="block text-[10px] uppercase font-mono tracking-wider text-slate-500">Student Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-3.5 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Alice Smith"
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 pl-10 pr-4 py-3 rounded-2xl text-xs md:text-sm focus:outline-none focus:border-purple-500 text-slate-300"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="block text-[10px] uppercase font-mono tracking-wider text-slate-500">Academic Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3.5 h-4 w-4 text-slate-500" />
                <input
                  type="email"
                  required
                  placeholder="name@university.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 pl-10 pr-4 py-3 rounded-2xl text-xs md:text-sm focus:outline-none focus:border-purple-500 text-slate-300"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] uppercase font-mono tracking-wider text-slate-500">Security Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 h-4 w-4 text-slate-500" />
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 pl-10 pr-4 py-3 rounded-2xl text-xs md:text-sm focus:outline-none focus:border-purple-500 text-slate-300"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-xs font-bold rounded-2xl transition shadow-lg mt-2 uppercase tracking-wider"
            >
              {authMode === 'login' ? 'Authenticate Session' : 'Provision Academic OS'}
            </button>
          </form>

          {/* Toggle Login/Signup or Sandbox Mode */}
          <div className="space-y-4 pt-2 border-t border-slate-800/60">
            <div className="flex justify-between items-center text-xs">
              <button
                onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
                className="text-slate-400 hover:text-white transition"
              >
                {authMode === 'login' ? "Don't have an account? Sign up" : 'Already have an account? Log in'}
              </button>
            </div>

            <button
              onClick={handleDemoBypass}
              className="w-full py-2.5 bg-slate-850 hover:bg-slate-800 border border-slate-800 rounded-2xl text-xs font-bold transition flex items-center justify-center space-x-1.5"
            >
              <Sparkles className="h-4 w-4 text-purple-400" />
              <span>Bypass & Demo Sandbox</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. MAIN APPLICATION DESKTOP WORKSPACE
  return (
    <div className="min-h-screen bg-[#0C0C0E] flex font-sans relative overflow-x-hidden selection:bg-blue-600/30">
      
      {/* Toast Notification Stream banners */}
      <div className="fixed top-6 right-6 z-50 flex flex-col space-y-2">
        {notifications.map((notif) => (
          <div
            key={notif.id}
            className={`p-3.5 px-4 bg-slate-900 border text-xs font-semibold rounded-2xl shadow-2xl flex items-start space-x-3 max-w-sm ${
              notif.type === 'achievement'
                ? 'border-amber-500 text-amber-200'
                : 'border-purple-500/50 text-purple-200'
            }`}
          >
            {notif.type === 'achievement' ? (
              <Award className="h-5 w-5 text-amber-500 shrink-0 mt-0.5 animate-bounce" />
            ) : (
              <Bell className="h-5 w-5 text-purple-400 shrink-0 mt-0.5" />
            )}
            <div>
              <p className="font-bold">{notif.title}</p>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-normal">{notif.message}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Shared Sidebar Component */}
      <Sidebar onLogout={() => setIsAuthenticated(false)} />

      {/* Main viewport Container */}
      <main className="flex-1 p-4 md:p-8 ml-0 md:ml-64 max-w-7xl mx-auto overflow-hidden">
        {renderActiveModule()}
      </main>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
