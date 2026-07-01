import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { motion, AnimatePresence } from 'motion/react';
import {
  TrendingUp,
  Plus,
  Minus,
  AlertTriangle,
  CheckCircle,
  FileText,
  HelpCircle,
  Sparkles,
  Award,
  RefreshCw
} from 'lucide-react';

export const Attendance: React.FC = () => {
  const {
    attendance,
    subjects,
    logAttendanceClass
  } = useApp();

  const handleLog = (subjectId: string, type: 'present' | 'absent') => {
    logAttendanceClass(subjectId, type);
  };

  return (
    <div className="space-y-6 text-white pb-10">
      
      {/* Module Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-6 bg-slate-900/40 border border-slate-800/60 rounded-3xl backdrop-blur-xl">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-100 flex items-center">
            <TrendingUp className="h-6 w-6 text-purple-400 mr-2" /> Attendance Tracker
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Log physical class presences, track course minimum targets, and project safe bunks dynamically.
          </p>
        </div>
      </div>

      {/* Grid of attendance rates */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {attendance.map((at) => {
          const subject = subjects.find(s => s.id === at.subjectId);
          if (!subject) return null;

          const pct = at.total > 0 ? (at.attended / at.total) * 100 : 100;
          const isDanger = pct < 75;

          return (
            <div
              key={at.id}
              className="p-5 bg-slate-900/30 border border-slate-800/80 rounded-3xl flex flex-col justify-between space-y-4"
            >
              {/* Header */}
              <div>
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-400">
                    {subject.code}
                  </span>
                  <span className={`text-base font-extrabold font-mono ${isDanger ? 'text-rose-400 animate-pulse' : 'text-emerald-400'}`}>
                    {pct.toFixed(1)}%
                  </span>
                </div>
                <h3 className="text-sm font-extrabold text-slate-200 mt-2.5">{subject.name}</h3>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-mono text-slate-500">
                  <span>Class Log count</span>
                  <span>{at.attended} / {at.total} lectures</span>
                </div>
                <div className="h-2 w-full bg-slate-950 border border-slate-900 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${isDanger ? 'bg-rose-500' : 'bg-emerald-500'}`}
                    style={{ width: `${Math.min(pct, 100)}%` }}
                  />
                </div>
              </div>

              {/* Gemini AI predictive advice */}
              <div className="p-3 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-1">
                <span className="text-[10px] font-mono font-bold text-purple-400 uppercase tracking-widest flex items-center">
                  <Sparkles className="h-3.5 w-3.5 text-purple-400 mr-1" /> Gemini Safe-Bunk Projector
                </span>
                <p className="text-xs text-slate-300 leading-normal font-sans italic">
                  "{at.aiBunkSuggestion}"
                </p>
              </div>

              {/* Attendance quick logger action controllers */}
              <div className="pt-2 border-t border-slate-800/30 grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleLog(at.subjectId, 'present')}
                  className="py-2.5 bg-emerald-950/20 hover:bg-emerald-950/40 border border-emerald-900/30 text-xs font-bold text-emerald-300 rounded-xl transition flex items-center justify-center space-x-1"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Logged Present</span>
                </button>
                <button
                  onClick={() => handleLog(at.subjectId, 'absent')}
                  className="py-2.5 bg-rose-950/20 hover:bg-rose-950/40 border border-rose-900/30 text-xs font-bold text-rose-300 rounded-xl transition flex items-center justify-center space-x-1"
                >
                  <Minus className="h-3.5 w-3.5" />
                  <span>Logged Absent</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
