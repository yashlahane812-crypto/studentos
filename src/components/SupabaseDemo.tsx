import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { motion, AnimatePresence } from 'motion/react';
import {
  Database,
  Plus,
  Trash2,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Terminal,
  ExternalLink,
  Code2
} from 'lucide-react';

interface TodoItem {
  id: string | number;
  name: string;
  created_at?: string;
}

export const SupabaseDemo: React.FC = () => {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [newTodoName, setNewTodoName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  async function getTodos() {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const { data, error } = await supabase.from('todos').select('*').order('id', { ascending: true });
      if (error) {
        throw error;
      }
      setTodos(data || []);
      setIsSuccess(true);
    } catch (err: any) {
      console.error('Error fetching from Supabase:', err);
      setErrorMsg(err.message || 'Failed to query "todos" table. Please check if the table exists.');
      setIsSuccess(false);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    getTodos();
  }, []);

  const handleAddTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodoName.trim()) return;

    setIsLoading(true);
    setErrorMsg(null);
    try {
      const { error } = await supabase.from('todos').insert([{ name: newTodoName }]);
      if (error) throw error;
      setNewTodoName('');
      getTodos();
    } catch (err: any) {
      console.error('Error inserting to Supabase:', err);
      setErrorMsg(err.message || 'Failed to add item to "todos" table.');
      setIsLoading(false);
    }
  };

  const handleDeleteTodo = async (id: string | number) => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const { error } = await supabase.from('todos').delete().eq('id', id);
      if (error) throw error;
      getTodos();
    } catch (err: any) {
      console.error('Error deleting from Supabase:', err);
      setErrorMsg(err.message || 'Failed to delete item from "todos" table.');
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 text-white pb-10">
      {/* Module Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-6 bg-slate-900/40 border border-slate-800/60 rounded-3xl backdrop-blur-xl">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-100 flex items-center">
            <Database className="h-6 w-6 text-emerald-400 mr-2" /> Supabase client Integration
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Perform live client-side queries, insertions, and real-time operations directly to your Supabase instance.
          </p>
        </div>

        <div className="flex items-center space-x-3 mt-4 md:mt-0">
          <button
            onClick={getTodos}
            className="flex items-center space-x-2 px-4 py-2.5 bg-slate-850 hover:bg-slate-800 border border-slate-800 text-xs font-bold rounded-xl transition cursor-pointer"
          >
            <RefreshCw className={`h-4 w-4 text-slate-400 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Fetch Data</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Live Demo View */}
        <div className="lg:col-span-2 p-6 bg-slate-900/40 border border-slate-800 rounded-3xl flex flex-col space-y-4">
          <h2 className="text-sm font-bold text-slate-300 flex items-center space-x-2">
            <Terminal className="h-4 w-4 text-emerald-400" />
            <span>Supabase 'todos' Table Sandbox</span>
          </h2>

          {errorMsg && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs rounded-xl flex items-start space-x-3">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <div className="space-y-2">
                <p className="font-semibold">{errorMsg}</p>
                <p className="text-[11px] text-rose-400 leading-normal">
                  Make sure you have created a table named <code className="bg-slate-950 px-1 py-0.5 rounded font-mono">todos</code> in your Supabase dashboard with a column named <code className="bg-slate-950 px-1 py-0.5 rounded font-mono">name</code> (text type). Also ensure row-level security (RLS) policies allow read/write access.
                </p>
              </div>
            </div>
          )}

          {isSuccess && (
            <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl flex items-center space-x-2.5">
              <CheckCircle className="h-4.5 w-4.5 shrink-0" />
              <span>Successfully connected to Supabase and fetched records!</span>
            </div>
          )}

          <form onSubmit={handleAddTodo} className="flex space-x-2">
            <input
              type="text"
              required
              placeholder="Enter new item name..."
              value={newTodoName}
              onChange={(e) => setNewTodoName(e.target.value)}
              className="flex-1 bg-slate-950 border border-slate-800 px-4 py-2.5 rounded-xl text-xs focus:outline-none focus:border-emerald-500 text-slate-200"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center space-x-1.5 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-xs font-bold rounded-xl transition cursor-pointer text-slate-950"
            >
              <Plus className="h-4 w-4 stroke-[3]" />
              <span>Insert</span>
            </button>
          </form>

          <div className="border border-slate-800/80 rounded-2xl bg-slate-950/40 p-4 min-h-[200px] flex flex-col">
            <AnimatePresence mode="popLayout">
              {todos.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-500 space-y-1.5">
                  <Database className="h-8 w-8 text-slate-700 animate-pulse" />
                  <p className="text-xs">No records found inside the `todos` table.</p>
                  <p className="text-[10px] text-slate-600 max-w-sm">Use the insert bar above to push a record directly to your Supabase host via the Client SDK.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {todos.map((todo) => (
                    <motion.div
                      key={todo.id}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="p-3 bg-slate-900 border border-slate-800/80 rounded-xl flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center space-x-2.5">
                        <span className="h-2 w-2 rounded-full bg-emerald-500" />
                        <span className="text-slate-200 font-medium">{todo.name}</span>
                        <span className="text-[10px] text-slate-600 font-mono">id: {todo.id}</span>
                      </div>
                      <button
                        onClick={() => handleDeleteTodo(todo.id)}
                        className="text-slate-500 hover:text-rose-400 p-1 rounded hover:bg-slate-800/50 transition cursor-pointer"
                        title="Delete record from Supabase"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Right Col: Setup Reference & Live Code */}
        <div className="space-y-4">
          <div className="p-6 bg-slate-900/40 border border-slate-800 rounded-3xl space-y-4">
            <h3 className="text-sm font-bold text-slate-300 flex items-center space-x-2">
              <Code2 className="h-4 w-4 text-emerald-400" />
              <span>Implementation Blueprint</span>
            </h3>

            <div className="space-y-3.5">
              <div className="text-xs text-slate-400 leading-relaxed">
                We've established a production-ready client configuration to prevent secure credential exposures.
              </div>

              {/* Step 1 */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                  STEP 1: DATABASE SCHEMA
                </span>
                <p className="text-[11px] text-slate-400 font-medium mt-1">
                  Run this SQL in your Supabase SQL Editor:
                </p>
                <pre className="p-3 bg-slate-950 rounded-xl font-mono text-[10px] text-slate-300 overflow-x-auto border border-slate-800">
{`create table todos (
  id bigint primary key generated always as identity,
  name text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);`}
                </pre>
              </div>

              {/* Step 2 */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                  STEP 2: ENABLE READ/WRITE
                </span>
                <p className="text-[11px] text-slate-400 mt-1 leading-normal">
                  In Supabase, either disable row-level security (RLS) on <code className="bg-slate-950 px-1 rounded text-emerald-400">todos</code> or add policies to allow public read & write access so client-side operations succeed!
                </p>
              </div>

              {/* External Link */}
              <a
                href="https://supabase.com/dashboard"
                target="_blank"
                rel="noreferrer"
                className="w-full py-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 hover:border-emerald-500/30 transition text-xs font-bold rounded-2xl flex items-center justify-center space-x-2 cursor-pointer mt-2"
              >
                <span>Go to Supabase Dashboard</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
