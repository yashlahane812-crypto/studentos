import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { motion, AnimatePresence } from 'motion/react';
import {
  CheckSquare,
  Plus,
  Trash,
  Clock,
  Filter,
  Search,
  Sparkles,
  AlertCircle,
  Calendar,
  CheckCircle2,
  ListFilter,
  RefreshCw,
  Hourglass
} from 'lucide-react';

export const ToDo: React.FC = () => {
  const {
    tasks,
    subjects,
    addTask,
    updateTask,
    deleteTask,
    aiRearrangeTasks
  } = useApp();

  const [search, setSearch] = useState('');
  const [filterSubject, setFilterSubject] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [sortBy, setSortBy] = useState<'deadline' | 'priority'>('deadline');
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Task creation form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newSubject, setNewSubject] = useState(subjects[0]?.id || '');
  const [newPriority, setNewPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [newDeadline, setNewDeadline] = useState('');
  const [newEstTime, setNewEstTime] = useState('2 hours');

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newSubject) return;

    addTask({
      title: newTitle,
      subjectId: newSubject,
      priority: newPriority,
      deadline: newDeadline || new Date().toISOString().split('T')[0],
      estimatedTime: newEstTime
    });

    setNewTitle('');
    setShowAddForm(false);
  };

  const handleAiRearrange = async () => {
    setIsAiLoading(true);
    await aiRearrangeTasks();
    setIsAiLoading(false);
  };

  // Filter & Sort Logic
  const filteredTasks = (tasks || [])
    .filter(t => {
      const matchSearch = t.title.toLowerCase().includes(search.toLowerCase());
      const matchSubject = filterSubject === 'all' || t.subjectId === filterSubject;
      const matchPriority = filterPriority === 'all' || t.priority === filterPriority;
      return matchSearch && matchSubject && matchPriority;
    })
    .sort((a, b) => {
      if (sortBy === 'deadline') {
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      } else {
        const priorityWeights = { high: 3, medium: 2, low: 1 };
        return priorityWeights[b.priority] - priorityWeights[a.priority];
      }
    });

  return (
    <div className="space-y-6 text-white pb-10">
      {/* Module Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-6 bg-slate-900/40 border border-slate-800/60 rounded-3xl backdrop-blur-xl">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-100 flex items-center">
            <CheckSquare className="h-6 w-6 text-purple-400 mr-2" /> Smart To-Do List
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Organize tasks, assign subjects, and let Gemini balance your study priority curves.
          </p>
        </div>

        <div className="flex items-center space-x-3 mt-4 md:mt-0">
          <button
            onClick={handleAiRearrange}
            disabled={isAiLoading || (tasks || []).filter(t => t.status !== 'completed').length === 0}
            className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 disabled:opacity-50 text-xs font-bold rounded-xl transition shadow-lg shadow-purple-900/20"
          >
            {isAiLoading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            <span>{isAiLoading ? 'Gemini Optimizing...' : 'AI Smart Rearrange'}</span>
          </button>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center space-x-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-xs font-bold rounded-xl border border-slate-700 transition"
          >
            <Plus className="h-4 w-4" />
            <span>Create Task</span>
          </button>
        </div>
      </div>

      {/* Task Insertion Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.form
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            onSubmit={handleCreateTask}
            className="p-6 bg-slate-900/60 border border-slate-800 rounded-3xl space-y-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-mono uppercase tracking-widest text-slate-400 mb-1.5">Task Description</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Code cluster centroid relaxation algorithm"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-widest text-slate-400 mb-1.5">Associated Subject</label>
                <select
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-purple-500"
                >
                  {subjects.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.code} - {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-widest text-slate-400 mb-1.5">Task Priority</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['low', 'medium', 'high'] as const).map(p => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setNewPriority(p)}
                      className={`py-2 text-xs font-bold rounded-xl border capitalize transition ${
                        newPriority === p
                          ? 'bg-purple-950/40 border-purple-500 text-purple-300'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-widest text-slate-400 mb-1.5">Deadline</label>
                  <input
                    type="date"
                    value={newDeadline}
                    onChange={(e) => setNewDeadline(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono uppercase tracking-widest text-slate-400 mb-1.5">Est. Effort</label>
                  <input
                    type="text"
                    placeholder="e.g. 2 hours"
                    value={newEstTime}
                    onChange={(e) => setNewEstTime(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-purple-500"
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
                Submit Task
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Filters and Search Bar */}
      <div className="p-4 bg-slate-900/30 border border-slate-800/60 rounded-2xl flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-4 items-center">
        {/* Search */}
        <div className="relative w-full md:flex-1">
          <Search className="absolute left-3 top-3.5 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 pl-10 pr-4 py-2.5 rounded-xl text-xs focus:outline-none focus:border-purple-500"
          />
        </div>

        {/* Filter subject */}
        <div className="flex items-center space-x-2 w-full md:w-auto">
          <Filter className="h-4 w-4 text-slate-400 shrink-0" />
          <select
            value={filterSubject}
            onChange={(e) => setFilterSubject(e.target.value)}
            className="bg-slate-950 border border-slate-800 px-3 py-2 rounded-xl text-xs focus:outline-none focus:border-purple-500"
          >
            <option value="all">All Subjects</option>
            {subjects.map(s => (
              <option key={s.id} value={s.id}>{s.code}</option>
            ))}
          </select>
        </div>

        {/* Filter priority */}
        <div className="flex items-center space-x-2 w-full md:w-auto">
          <ListFilter className="h-4 w-4 text-slate-400 shrink-0" />
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="bg-slate-950 border border-slate-800 px-3 py-2 rounded-xl text-xs focus:outline-none focus:border-purple-500"
          >
            <option value="all">All Priorities</option>
            <option value="high">High Only</option>
            <option value="medium">Medium Only</option>
            <option value="low">Low Only</option>
          </select>
        </div>

        {/* Sorting options */}
        <div className="flex items-center space-x-2 w-full md:w-auto">
          <button
            onClick={() => setSortBy(sortBy === 'deadline' ? 'priority' : 'deadline')}
            className="w-full md:w-auto text-xs px-3 py-2 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl transition"
          >
            Sort: <span className="text-purple-400 capitalize font-bold">{sortBy}</span>
          </button>
        </div>
      </div>

      {/* Task List Grid */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="p-12 text-center bg-slate-900/10 border border-slate-800 border-dashed rounded-3xl">
            <AlertCircle className="h-8 w-8 text-slate-600 mx-auto mb-2" />
            <h4 className="font-bold text-slate-300">No matching tasks found</h4>
            <p className="text-xs text-slate-500 mt-1">Get ahead of your workload by adding your first milestone.</p>
          </div>
        ) : (
          filteredTasks.map((t) => {
            const subject = subjects.find(s => s.id === t.subjectId);
            const isCompleted = t.status === 'completed';

            return (
              <div
                key={t.id}
                className={`p-4 bg-slate-900/30 hover:bg-slate-900/50 border rounded-2xl transition flex flex-col md:flex-row md:items-center justify-between gap-3 ${
                  isCompleted ? 'border-slate-800/40 opacity-60' : 'border-slate-800/80'
                }`}
              >
                {/* Left Section: Checkbox + Title */}
                <div className="flex items-start space-x-3.5">
                  <button
                    onClick={() => updateTask(t.id, { status: isCompleted ? 'todo' : 'completed' })}
                    className="mt-1 shrink-0"
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="h-5 w-5 text-purple-500" />
                    ) : (
                      <div className="h-5 w-5 rounded-md border-2 border-slate-700 hover:border-purple-500 transition" />
                    )}
                  </button>

                  <div>
                    <h3 className={`text-sm font-bold ${isCompleted ? 'line-through text-slate-500' : 'text-slate-100'}`}>
                      {t.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      {subject && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 text-slate-300">
                          {subject.code}
                        </span>
                      )}
                      
                      {/* Priority Badge */}
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        t.priority === 'high'
                          ? 'bg-rose-950/40 border border-rose-900/50 text-rose-300'
                          : t.priority === 'medium'
                          ? 'bg-amber-950/40 border border-amber-900/50 text-amber-300'
                          : 'bg-slate-950 border border-slate-800 text-slate-400'
                      }`}>
                        {t.priority}
                      </span>

                      {/* Est Duration */}
                      <span className="text-[10px] text-slate-500 flex items-center font-mono">
                        <Clock className="h-3 w-3 mr-1" /> Est: {t.estimatedTime}
                      </span>

                      {/* Best study time (Gemini suggestion) */}
                      {t.bestStudyTime && (
                        <span className="text-[10px] text-purple-400 bg-purple-950/30 px-2 py-0.5 rounded-md border border-purple-900/30 flex items-center font-mono">
                          <Hourglass className="h-3 w-3 mr-1" /> Best: {t.bestStudyTime}
                        </span>
                      )}
                    </div>

                    {/* Gemini Explanation Detail (Dynamic Grounding) */}
                    {t.aiPriorityReason && !isCompleted && (
                      <div className="mt-2.5 bg-purple-950/10 border border-purple-900/20 p-2.5 rounded-xl text-[11px] text-purple-300/90 leading-relaxed max-w-xl">
                        <span className="font-bold flex items-center mb-0.5">
                          <Sparkles className="h-3.5 w-3.5 mr-1 text-purple-400" /> AI Scheduler Insight
                        </span>
                        {t.aiPriorityReason}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Section: Deadline + Delete button */}
                <div className="flex items-center justify-between md:justify-end space-x-4 pl-8 md:pl-0">
                  <div className="text-right shrink-0">
                    <p className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">Deadline</p>
                    <p className="text-xs text-slate-300 font-mono font-bold flex items-center mt-0.5">
                      <Calendar className="h-3 w-3 mr-1 text-purple-400" /> {t.deadline}
                    </p>
                  </div>

                  <button
                    onClick={() => deleteTask(t.id)}
                    className="p-2 bg-slate-900 hover:bg-rose-950/40 text-slate-500 hover:text-rose-400 rounded-xl transition border border-slate-800 hover:border-rose-900/50"
                    aria-label="Delete Task"
                  >
                    <Trash className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
