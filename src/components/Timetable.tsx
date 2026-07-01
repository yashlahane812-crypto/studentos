import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { motion, AnimatePresence } from 'motion/react';
import {
  Calendar,
  Plus,
  Trash,
  Clock,
  MapPin,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Sparkles
} from 'lucide-react';

export const Timetable: React.FC = () => {
  const {
    timetable,
    subjects,
    addTimetableEvent,
    deleteTimetableEvent,
    addNotification
  } = useApp();

  const [showAddForm, setShowAddForm] = useState(false);
  const [newSubject, setNewSubject] = useState(subjects[0]?.id || '');
  const [newDay, setNewDay] = useState(1); // Monday
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:30');
  const [newRoom, setNewRoom] = useState('Lecture Hall 1');

  // Conflict Detection
  const [conflictWarning, setConflictWarning] = useState<string | null>(null);

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject) return;

    // Detect overlap conflict
    const hasConflict = timetable.some(event => {
      if (event.day === newDay) {
        // Simple string range compare
        return (
          (startTime >= event.startTime && startTime < event.endTime) ||
          (endTime > event.startTime && endTime <= event.endTime) ||
          (startTime <= event.startTime && endTime >= event.endTime)
        );
      }
      return false;
    });

    if (hasConflict) {
      setConflictWarning('Schedule overlap detected with another class. Save anyway?');
      return;
    }

    saveEvent();
  };

  const saveEvent = () => {
    addTimetableEvent({
      subjectId: newSubject,
      day: newDay,
      startTime,
      endTime,
      room: newRoom
    });

    setConflictWarning(null);
    setShowAddForm(false);
  };

  const handleSyncGoogle = () => {
    addNotification(
      'Google Calendar Synced',
      'StudentOS timetable classes successfully exported to Google Calendar.',
      'achievement'
    );
    alert('Google Calendar Sync completed successfully! In a real deployment, this queries OAuth access tokens and pushes calendars to GCP services.');
  };

  return (
    <div className="space-y-6 text-white pb-10">
      
      {/* Module Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-6 bg-slate-900/40 border border-slate-800/60 rounded-3xl backdrop-blur-xl">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-100 flex items-center">
            <Calendar className="h-6 w-6 text-purple-400 mr-2" /> Class Timetable
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Map lecture halls, detect timing conflicts, and synchronize with external Google calendars.
          </p>
        </div>

        <div className="flex items-center space-x-3 mt-4 md:mt-0">
          <button
            onClick={handleSyncGoogle}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-xs font-bold rounded-xl border border-slate-700 transition flex items-center space-x-1.5"
          >
            <Sparkles className="h-4 w-4 text-purple-400" />
            <span>Sync Google Calendar</span>
          </button>
          
          <button
            onClick={() => {
              setConflictWarning(null);
              setShowAddForm(!showAddForm);
            }}
            className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-xs font-bold rounded-xl transition flex items-center space-x-1"
          >
            <Plus className="h-4 w-4" />
            <span>Schedule Slot</span>
          </button>
        </div>
      </div>

      {/* Timetable Insertion Drawer */}
      <AnimatePresence>
        {showAddForm && (
          <motion.form
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            onSubmit={handleCreateEvent}
            className="p-6 bg-slate-900/60 border border-slate-800 rounded-3xl space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono uppercase tracking-widest text-slate-400 mb-1.5">Lecture Course</label>
                <select
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 px-3 py-2.5 rounded-xl text-xs focus:outline-none focus:border-purple-500"
                >
                  {subjects.map(s => (
                    <option key={s.id} value={s.id}>{s.code} - {s.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-widest text-slate-400 mb-1.5">Weekday Day</label>
                <select
                  value={newDay}
                  onChange={(e) => setNewDay(parseInt(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 px-3 py-2.5 rounded-xl text-xs focus:outline-none focus:border-purple-500"
                >
                  <option value={1}>Monday</option>
                  <option value={2}>Tuesday</option>
                  <option value={3}>Wednesday</option>
                  <option value={4}>Thursday</option>
                  <option value={5}>Friday</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-widest text-slate-400 mb-1.5">Starts At</label>
                  <input
                    type="time"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 px-3 py-2 rounded-xl text-xs focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase tracking-widest text-slate-400 mb-1.5">Ends At</label>
                  <input
                    type="time"
                    required
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 px-3 py-2 rounded-xl text-xs focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-widest text-slate-400 mb-1.5">Room Location</label>
                <input
                  type="text"
                  placeholder="e.g. Science Auditorium 2"
                  value={newRoom}
                  onChange={(e) => setNewRoom(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 px-3 py-2.5 rounded-xl text-xs focus:outline-none focus:border-purple-500"
                />
              </div>
            </div>

            {/* Conflict Overlapping Warning */}
            {conflictWarning && (
              <div className="p-3 bg-rose-950/20 border border-rose-900/50 rounded-xl flex items-center justify-between text-xs text-rose-300">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-4.5 w-4.5 text-rose-400" />
                  <span>{conflictWarning}</span>
                </div>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => setConflictWarning(null)}
                    className="px-2 py-1 bg-slate-900 border border-slate-800 rounded font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={saveEvent}
                    className="px-2 py-1 bg-rose-600 rounded font-bold"
                  >
                    Force Save
                  </button>
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold bg-purple-600 hover:bg-purple-500 rounded-xl transition"
              >
                Schedule Class
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Grid view of Calendar (Monday to Friday columns) */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {[1, 2, 3, 4, 5].map((dayNum) => {
          const dayEvents = timetable
            .filter(e => e.day === dayNum)
            .sort((a, b) => a.startTime.localeCompare(b.startTime));

          return (
            <div key={dayNum} className="p-4 bg-slate-900/20 border border-slate-800/50 rounded-3xl flex flex-col space-y-3 min-h-[350px]">
              <h3 className="text-xs font-extrabold uppercase tracking-widest font-mono text-purple-400 border-b border-slate-800/60 pb-2 text-center">
                {days[dayNum]}
              </h3>

              {dayEvents.length === 0 ? (
                <div className="my-auto text-center text-[10px] text-slate-600 font-mono">
                  No classes scheduled
                </div>
              ) : (
                dayEvents.map((event) => {
                  const subject = subjects.find(s => s.id === event.subjectId);
                  return (
                    <div
                      key={event.id}
                      className="p-3.5 bg-slate-950/60 border border-slate-800 hover:border-purple-500/30 rounded-2xl relative group transition flex flex-col space-y-1.5"
                    >
                      <button
                        onClick={() => deleteTimetableEvent(event.id)}
                        className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-rose-400 transition"
                      >
                        <Trash className="h-3 w-3" />
                      </button>

                      <div className="pr-4">
                        <span className="text-[9px] font-mono font-bold bg-slate-900 text-purple-400 border border-purple-900/30 px-1.5 py-0.5 rounded uppercase">
                          {subject ? subject.code : 'LECTURE'}
                        </span>
                        <h4 className="text-xs font-bold text-slate-200 mt-1.5 leading-tight">{subject ? subject.name : 'Unknown Lecture'}</h4>
                      </div>

                      <div className="flex items-center text-[10px] text-slate-500 space-x-1 font-mono">
                        <Clock className="h-3.5 w-3.5" />
                        <span>{event.startTime} - {event.endTime}</span>
                      </div>

                      <div className="flex items-center text-[10px] text-slate-500 space-x-1 font-mono">
                        <MapPin className="h-3.5 w-3.5 text-purple-500/80" />
                        <span className="truncate">{event.room}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
