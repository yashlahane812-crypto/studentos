import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard,
  Timer,
  CheckSquare,
  MessageSquare,
  FileText,
  FolderGit,
  CheckCircle,
  Calendar,
  Layers,
  BarChart3,
  Settings,
  LogOut,
  Flame,
  Menu,
  X,
  Bell,
  Sparkles,
  Trophy,
  Clock,
  Database
} from 'lucide-react';

interface SidebarProps {
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onLogout }) => {
  const { user, activeTab, setActiveTab, notifications, clearNotification, loginWithGoogle, token } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);

  const menuItems = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'todo', name: 'To Do', icon: CheckSquare },
    { id: 'notes', name: 'Notes', icon: FileText },
    { id: 'doubt-solver', name: 'AI Doubt Solver', icon: MessageSquare },
    { id: 'study-planner', name: 'Study Timer', icon: Clock },
    { id: 'timetable', name: 'Timetable', icon: Calendar },
    { id: 'assignments', name: 'Assignments', icon: FolderGit },
    { id: 'attendance', name: 'Attendance', icon: CheckCircle },
    { id: 'flashcards', name: 'Flashcards', icon: Layers },
    { id: 'analytics', name: 'Analytics', icon: BarChart3 },
    { id: 'settings', name: 'Settings', icon: Settings },
    { id: 'supabase-demo', name: 'Supabase Client', icon: Database },
  ];

  const unreadNotifs = notifications.filter(n => !n.read);

  // Compute Level
  const currentXP = user?.xp || 0;
  const level = Math.floor(Math.sqrt(currentXP / 100)) + 1;
  const xpForNextLevel = Math.pow(level, 2) * 100;
  const xpForPrevLevel = Math.pow(level - 1, 2) * 100;
  const progressPercent = Math.min(100, Math.max(0, ((currentXP - xpForPrevLevel) / (xpForNextLevel - xpForPrevLevel)) * 100));

  return (
    <>
      {/* Mobile Header Nav */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-[#09090B] border-b border-slate-800 text-white z-50 sticky top-0">
        <div className="flex items-center space-x-2">
          <div className="bg-gradient-to-tr from-blue-600 to-cyan-400 p-1.5 rounded-lg shadow-lg shadow-blue-500/20">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <span className="font-bold tracking-tight text-lg text-slate-100">
            Student<span className="text-blue-500">OS</span>
          </span>
        </div>
        <div className="flex items-center space-x-3">
          {/* Notifications Button */}
          <div className="relative">
            <button
              onClick={() => setShowNotifDropdown(!showNotifDropdown)}
              className="p-1.5 rounded-lg hover:bg-slate-800 transition relative"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5 text-slate-300" />
              {unreadNotifs.length > 0 && (
                <span className="absolute top-1 right-1 h-2 w-2 bg-blue-500 rounded-full animate-pulse" />
              )}
            </button>
          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-1.5 rounded-lg hover:bg-slate-800 transition"
            aria-label="Menu"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Sidebar Overlay for Mobile */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar Container */}
      <div
        className={`fixed inset-y-0 left-0 w-64 bg-[#09090B] border-r border-slate-800 flex flex-col z-50 md:sticky md:top-0 h-screen transition-transform duration-300 transform ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0`}
      >
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800 hidden md:flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-tr from-blue-600 to-cyan-400 w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20 text-lg">
              S
            </div>
            <div>
              <span className="font-bold tracking-tight text-xl text-slate-100">
                Student<span className="text-blue-500">OS</span>
              </span>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">AI Academics</p>
            </div>
          </div>

          {/* Header Notifications Dropdown Toggle */}
          <div className="relative">
            <button
              onClick={() => setShowNotifDropdown(!showNotifDropdown)}
              className="p-2 rounded-xl bg-[#0C0C0E] hover:bg-slate-800/80 text-slate-400 hover:text-white transition relative border border-slate-800"
            >
              <Bell className="h-4 w-4" />
              {unreadNotifs.length > 0 && (
                <span className="absolute top-1 right-1 h-2 w-2 bg-blue-500 rounded-full animate-bounce" />
              )}
            </button>
          </div>
        </div>

        {/* User Card & Level (Gamified) */}
        {user && (
          <div className="px-4 py-4 border-b border-slate-800 bg-[#0C0C0E]/40">
            <div className="flex items-center space-x-3 mb-2">
              <img
                src={user.avatar}
                alt={user.name}
                className="h-10 w-10 rounded-xl object-cover border-2 border-slate-800"
                referrerPolicy="no-referrer"
              />
              <div className="overflow-hidden">
                <h4 className="text-sm font-medium text-slate-200 truncate">{user.name}</h4>
                <div className="flex items-center text-[11px] text-slate-400 font-mono">
                  <Flame className="h-3.5 w-3.5 text-orange-500 mr-1 animate-pulse" />
                  <span>Streak: {user.streak} days</span>
                </div>
              </div>
            </div>

            {/* Level Progress */}
            <div className="space-y-1">
              <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono">
                <span className="text-blue-400 font-bold flex items-center">
                  <Trophy className="h-3 w-3 mr-1 text-blue-400" /> Lvl {level}
                </span>
                <span>{user.xp} / {xpForNextLevel} XP</span>
              </div>
              <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Database Sync Status */}
            <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs font-mono">
              {token ? (
                <div className="flex items-center space-x-2 text-emerald-400 font-semibold w-full bg-emerald-500/5 border border-emerald-500/10 py-1.5 px-3 rounded-lg">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span>Supabase Synced</span>
                </div>
              ) : (
                <button
                  onClick={loginWithGoogle}
                  className="w-full flex items-center justify-center space-x-2 py-1.5 px-3 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 hover:border-emerald-500/30 transition text-center cursor-pointer"
                >
                  <Database className="h-3.5 w-3.5" />
                  <span>Connect Supabase</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Main Navigation Links */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1 scrollbar-thin scrollbar-thumb-slate-800">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isSelected = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center px-3 py-2 rounded-xl text-sm font-medium transition duration-200 relative group border ${
                  isSelected
                    ? 'text-blue-400 bg-blue-500/10 border-blue-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border-transparent'
                }`}
              >
                <Icon className={`h-4 w-4 mr-3 transition ${isSelected ? 'text-blue-400' : 'text-slate-400 group-hover:text-slate-300'}`} />
                <span>{item.name}</span>
                {!isSelected && (
                  <span className="absolute right-3 opacity-0 group-hover:opacity-100 transition text-[10px] text-slate-500 font-mono">
                    →
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-800 bg-[#09090B] sticky bottom-0">
          <button
            onClick={onLogout}
            className="w-full flex items-center px-4 py-2 rounded-xl text-sm font-medium text-rose-400 hover:bg-rose-950/20 hover:text-rose-300 transition duration-200"
          >
            <LogOut className="h-4 w-4 mr-3" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Persistent Notification Dropdown Portal */}
      <AnimatePresence>
        {showNotifDropdown && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowNotifDropdown(false)} />
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 15, scale: 0.95 }}
              className="fixed top-16 md:top-5 md:left-72 right-4 md:right-auto w-80 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden text-white p-4"
            >
              <div className="flex justify-between items-center pb-2 border-b border-slate-800 mb-2">
                <span className="font-semibold text-sm flex items-center">
                  <Bell className="h-4 w-4 text-purple-400 mr-2" /> Notifications ({notifications.length})
                </span>
                {notifications.length > 0 && (
                  <button
                    onClick={() => clearNotification(notifications[0].id)}
                    className="text-[10px] text-slate-400 hover:text-white underline font-mono"
                  >
                    Clear Last
                  </button>
                )}
              </div>
              <div className="max-h-60 overflow-y-auto space-y-2.5 pr-1">
                {notifications.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-4">No new notifications</p>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`p-2.5 rounded-xl border text-xs relative group ${
                        n.type === 'achievement'
                          ? 'bg-purple-950/20 border-purple-900/50 text-purple-200'
                          : n.type === 'warning'
                          ? 'bg-rose-950/20 border-rose-900/50 text-rose-200'
                          : 'bg-slate-900 border-slate-800 text-slate-300'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <p className="font-bold">{n.title}</p>
                        <span className="text-[9px] text-slate-500 font-mono">{n.date}</span>
                      </div>
                      <p className="mt-1 text-slate-400 leading-normal">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
