import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Settings as SettingsIcon,
  User,
  GraduationCap,
  Bell,
  Trash2,
  CheckCircle,
  HelpCircle,
  Sliders,
  ShieldAlert,
  Globe
} from 'lucide-react';

export const Settings: React.FC = () => {
  const {
    user,
    setUser,
    subjects,
    setSubjects,
    addNotification
  } = useApp();

  const [name, setName] = useState(user?.name || 'Alice Smith');
  const [university, setUniversity] = useState(user?.university || 'Stanford University');
  const [gpa, setGpa] = useState(3.92);
  const [pushNotes, setPushNotes] = useState(true);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setUser({
      name,
      university,
      streak: user?.streak || 5,
      xp: user?.xp || 240,
      level: user?.level || 2
    });
    addNotification('Profile Saved', 'Academic metadata saved successfully.', 'info');
    alert('Settings updated successfully!');
  };

  const handleClearCache = () => {
    if (confirm('Are you sure you want to restore default StudentOS cache configurations? This clears local storage.')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6 text-white pb-10 max-w-3xl mx-auto">
      
      {/* Module Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-6 bg-slate-900/40 border border-slate-800/60 rounded-3xl backdrop-blur-xl">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-100 flex items-center">
            <SettingsIcon className="h-6 w-6 text-purple-400 mr-2" /> Global Preferences
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Configure academic profiles, establish warning thresholds, and clean local storage databases.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        
        {/* Card 1: User metadata */}
        <form onSubmit={handleSave} className="p-6 bg-slate-900/30 border border-slate-800/60 rounded-3xl space-y-4">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-widest font-mono flex items-center">
            <User className="h-4.5 w-4.5 text-purple-400 mr-2" /> Academic Profile Identity
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] uppercase font-mono tracking-wider text-slate-500 mb-1">Full Student Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 px-3 py-2.5 rounded-xl text-xs focus:outline-none focus:border-purple-500 text-slate-300"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-mono tracking-wider text-slate-500 mb-1">Target University Track</label>
              <input
                type="text"
                required
                value={university}
                onChange={(e) => setUniversity(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 px-3 py-2.5 rounded-xl text-xs focus:outline-none focus:border-purple-500 text-slate-300"
              />
            </div>

            <div>
              <label className="block text-[10px] uppercase font-mono tracking-wider text-slate-500 mb-1">Target Cumulative GPA</label>
              <input
                type="number"
                step="0.01"
                min="0.0"
                max="4.0"
                value={gpa}
                onChange={(e) => setGpa(parseFloat(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 px-3 py-2.5 rounded-xl text-xs focus:outline-none focus:border-purple-500 text-slate-300"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2 border-t border-slate-800/40">
            <button
              type="submit"
              className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 text-xs font-bold rounded-xl transition shadow-lg"
            >
              Save Profile Identity
            </button>
          </div>
        </form>

        {/* Card 2: Alerts Config */}
        <div className="p-6 bg-slate-900/30 border border-slate-800/60 rounded-3xl space-y-4">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-widest font-mono flex items-center">
            <Bell className="h-4.5 w-4.5 text-purple-400 mr-2" /> Push Notifications & Sound Toggles
          </h3>

          <div className="flex items-center justify-between p-3.5 bg-slate-950/60 border border-slate-800 rounded-2xl">
            <div>
              <p className="text-xs font-bold text-slate-200">System Notification Alerts</p>
              <p className="text-[10px] text-slate-500">Notify me on study schedule countdowns and quiz payouts.</p>
            </div>
            <button
              onClick={() => setPushNotes(!pushNotes)}
              className={`h-6 w-11 rounded-full relative transition-colors duration-200 ${
                pushNotes ? 'bg-purple-600' : 'bg-slate-800 border border-slate-700'
              }`}
            >
              <span className={`h-4 w-4 bg-white rounded-full absolute top-1 transition-transform duration-200 ${
                pushNotes ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
          </div>
        </div>

        {/* Card 3: Cache and Security */}
        <div className="p-6 bg-slate-900/30 border border-slate-800/60 rounded-3xl space-y-4">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-widest font-mono flex items-center">
            <ShieldAlert className="h-4.5 w-4.5 text-rose-400 mr-2" /> Storage & System Cleaning
          </h3>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-3.5 bg-rose-950/10 border border-rose-900/20 rounded-2xl">
            <div>
              <p className="text-xs font-bold text-rose-300">Wipe Local Workspace Database Cache</p>
              <p className="text-[10px] text-slate-400 mt-0.5 leading-relaxed">
                Clears all custom class notes, timetable calendars, and study streaks logged into client-side stores.
              </p>
            </div>
            <button
              onClick={handleClearCache}
              className="py-2 px-4 bg-rose-600 hover:bg-rose-500 text-xs font-bold rounded-xl transition flex items-center space-x-1 shrink-0 text-white"
            >
              <Trash2 className="h-4 w-4" />
              <span>Reset StudentOS</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
