import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { motion, AnimatePresence } from 'motion/react';
import {
  FolderGit,
  Plus,
  Trash,
  Clock,
  CheckCircle,
  FileText,
  AlertTriangle,
  Brain,
  Sparkles,
  Award,
  ChevronRight,
  HelpCircle,
  Calendar
} from 'lucide-react';

export const Assignments: React.FC = () => {
  const {
    assignments,
    subjects,
    addAssignment,
    updateAssignment,
    deleteAssignment
  } = useApp();

  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newSubject, setNewSubject] = useState(subjects[0]?.id || '');
  const [newDueDate, setNewDueDate] = useState('');
  const [newPriority, setNewPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [newFaculty, setNewFaculty] = useState('Dr. Alan Turing');
  const [newMarks, setNewMarks] = useState('Pending');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newSubject || !newDueDate) return;

    addAssignment({
      title: newTitle,
      subjectId: newSubject,
      dueDate: newDueDate,
      status: 'pending',
      priority: newPriority,
      professor: newFaculty,
      marks: newMarks || undefined
    });

    setNewTitle('');
    setNewDueDate('');
    setNewMarks('');
    setShowAddForm(false);
  };

  return (
    <div className="space-y-6 text-white pb-10">
      
      {/* Module Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-6 bg-slate-900/40 border border-slate-800/60 rounded-3xl backdrop-blur-xl">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-100 flex items-center">
            <FolderGit className="h-6 w-6 text-purple-400 mr-2" /> Course Assignments
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Track milestones, register attachments, and let Google Gemini predict late risks and completion rates.
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-xs font-bold rounded-xl transition flex items-center space-x-1 mt-4 md:mt-0"
        >
          <Plus className="h-4 w-4" />
          <span>Register Coursework</span>
        </button>
      </div>

      {/* Assignment Insertion Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.form
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            onSubmit={handleSubmit}
            className="p-6 bg-slate-900/60 border border-slate-800 rounded-3xl space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono uppercase tracking-widest text-slate-400 mb-1.5">Assignment Deliverable Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lab 4 Mutual Exclusion Synchronization"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 px-3 py-2.5 rounded-xl text-xs focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-widest text-slate-400 mb-1.5">Subject Track</label>
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
                <label className="block text-xs font-mono uppercase tracking-widest text-slate-400 mb-1.5">Due Date</label>
                <input
                  type="date"
                  required
                  value={newDueDate}
                  onChange={(e) => setNewDueDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 px-3 py-2.5 rounded-xl text-xs focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-widest text-slate-400 mb-1.5">Lead Instructor</label>
                <input
                  type="text"
                  placeholder="e.g. Dr. Alan Turing"
                  value={newFaculty}
                  onChange={(e) => setNewFaculty(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 px-3 py-2.5 rounded-xl text-xs focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-widest text-slate-400 mb-1.5">Priority</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 px-3 py-2.5 rounded-xl text-xs focus:outline-none focus:border-purple-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase tracking-widest text-slate-400 mb-1.5">Target Grade Target</label>
                  <input
                    type="text"
                    placeholder="e.g. A+ or 100/100"
                    value={newMarks}
                    onChange={(e) => setNewMarks(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 px-3 py-2.5 rounded-xl text-xs focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>
            </div>

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
                Save Coursework
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Coursework list table & cards */}
      <div className="space-y-4">
        {assignments.length === 0 ? (
          <div className="p-12 text-center bg-slate-900/10 border border-slate-800 border-dashed rounded-3xl">
            <FolderGit className="h-8 w-8 text-slate-600 mx-auto mb-2" />
            <h4 className="font-bold text-slate-300">No coursework files present</h4>
            <p className="text-xs text-slate-500 mt-1">Select Register Coursework to attach grading files.</p>
          </div>
        ) : (
          assignments.map((asg) => {
            const subject = subjects.find(s => s.id === asg.subjectId);
            const isSubmitted = asg.status === 'submitted';

            return (
              <div
                key={asg.id}
                className={`p-5 bg-slate-900/30 border border-slate-800/80 hover:border-purple-500/10 rounded-3xl transition flex flex-col space-y-4`}
              >
                {/* Header Row */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="flex items-start space-x-3">
                    <button
                      onClick={() => updateAssignment(asg.id, { status: isSubmitted ? 'pending' : 'submitted' })}
                      className="mt-1 shrink-0"
                    >
                      <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center transition ${
                        isSubmitted ? 'bg-purple-600 border-purple-500 text-white' : 'border-slate-700 hover:border-purple-500'
                      }`}>
                        {isSubmitted && <CheckCircle className="h-3 w-3" />}
                      </div>
                    </button>

                    <div>
                      <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                        <h3 className={`text-sm font-extrabold ${isSubmitted ? 'line-through text-slate-500' : 'text-slate-100'}`}>
                          {asg.title}
                        </h3>
                        <span className="text-[10px] bg-slate-950 px-2 py-0.5 border border-slate-800 rounded text-slate-400 font-mono">
                          {subject ? subject.code : 'Grading'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">Professor: {asg.professor} • Target: {asg.marks || 'Pending'}</p>
                    </div>
                  </div>

                  {/* Actions / Meta */}
                  <div className="flex items-center space-x-4 self-end md:self-center">
                    <div className="text-right">
                      <p className="text-[9px] font-mono text-slate-500 uppercase">Due Date</p>
                      <p className="text-xs font-mono font-bold text-slate-300 flex items-center mt-0.5">
                        <Calendar className="h-3.5 w-3.5 mr-1 text-purple-400" /> {asg.dueDate}
                      </p>
                    </div>

                    <button
                      onClick={() => deleteAssignment(asg.id)}
                      className="p-2 bg-slate-950 hover:bg-rose-950/40 text-slate-500 hover:text-rose-400 border border-slate-800 rounded-xl transition"
                    >
                      <Trash className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Gemini AI Predictions row */}
                {!isSubmitted && (asg.aiCompletionProbability !== undefined) && (
                  <div className="p-4 bg-gradient-to-tr from-purple-950/10 to-indigo-950/5 border border-purple-900/20 rounded-2xl grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Predict 1: Completion probability */}
                    <div className="space-y-1 border-r border-slate-800/40 pr-2">
                      <span className="text-[10px] font-mono text-purple-400 uppercase tracking-widest flex items-center font-bold">
                        <Sparkles className="h-3.5 w-3.5 text-purple-400 mr-1 animate-pulse" /> Gemini Submission Odds
                      </span>
                      <p className="text-xl font-extrabold text-purple-300">{asg.aiCompletionProbability}% Success</p>
                      <p className="text-[10px] text-slate-400 leading-normal">Based on your cumulative XP level and consistent Study Streaks.</p>
                    </div>

                    {/* Predict 2: Late submissions prediction */}
                    <div className="space-y-1 border-r border-slate-800/40 pr-2">
                      <span className="text-[10px] font-mono text-purple-400 uppercase tracking-widest flex items-center font-bold">
                        <Brain className="h-3.5 w-3.5 text-purple-400 mr-1" /> Late submission risk
                      </span>
                      <div className="flex items-center space-x-1.5 mt-1">
                        {asg.aiLateRisk ? (
                          <>
                            <AlertTriangle className="h-4.5 w-4.5 text-rose-400 shrink-0" />
                            <span className="text-rose-400 text-sm font-bold">CRITICAL LATE RISK</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-4.5 w-4.5 text-emerald-400 shrink-0" />
                            <span className="text-emerald-400 text-sm font-bold">SAFE MARGIN</span>
                          </>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 leading-normal">Current task concurrency levels are within manageable bounds.</p>
                    </div>

                    {/* Predict 3: Suggested timeline */}
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono text-purple-400 uppercase tracking-widest flex items-center font-bold">
                        <Award className="h-3.5 w-3.5 text-purple-400 mr-1" /> Custom AI Study Schedule
                      </span>
                      <p className="text-xs text-slate-300 leading-normal font-sans italic">
                        "{asg.aiSuggestedSchedule}"
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
