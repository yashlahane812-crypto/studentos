import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { motion, AnimatePresence } from 'motion/react';
import {
  Timer,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Sparkles,
  BookOpen,
  CheckCircle2,
  ListTodo,
  TrendingUp,
  Clock
} from 'lucide-react';

export const StudyPlanner: React.FC = () => {
  const {
    tasks,
    subjects,
    addNotification,
    addXP
  } = useApp();

  // Timer states
  const [timeLeft, setTimeLeft] = useState(25 * 60); // default 25 min
  const [isRunning, setIsRunning] = useState(false);
  const [sessionType, setSessionType] = useState<'study' | 'shortBreak' | 'longBreak'>('study');
  const [selectedTaskId, setSelectedTaskId] = useState<string>('general');
  const [customMinutes, setCustomMinutes] = useState(25);

  // Audio ambient tracks states
  const [ambientTrack, setAmbientTrack] = useState<'none' | 'lofi' | 'rain' | 'forest'>('none');
  const [volume, setVolume] = useState(0.5);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Completed blocks tracking (persists in state)
  const [focusLogs, setFocusLogs] = useState<Array<{
    id: string;
    timestamp: string;
    duration: number; // in mins
    taskTitle: string;
    type: string;
  }>>([
    {
      id: 'log_1',
      timestamp: 'Today, 10:15 AM',
      duration: 25,
      taskTitle: 'Database Sharding Concepts',
      type: 'Study session'
    },
    {
      id: 'log_2',
      timestamp: 'Yesterday, 4:30 PM',
      duration: 25,
      taskTitle: 'Algorithms Quick-Review',
      type: 'Study session'
    }
  ]);

  // Audio track source mapping
  const trackUrls = {
    none: '',
    lofi: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', // royalty free stream fallback
    rain: 'https://assets.mixkit.co/music/preview/mixkit-rain-in-the-woods-2442.mp3',
    forest: 'https://assets.mixkit.co/music/preview/mixkit-forest-river-ambience-1219.mp3'
  };

  // Timer interval handling
  useEffect(() => {
    let intervalId: any = null;
    if (isRunning && timeLeft > 0) {
      intervalId = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      handleTimerCompletion();
    }
    return () => clearInterval(intervalId);
  }, [isRunning, timeLeft]);

  // Handle ambient sound playback
  useEffect(() => {
    if (ambientTrack === 'none') {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      return;
    }

    // Stop current track if any
    if (audioRef.current) {
      audioRef.current.pause();
    }

    // Create and play new track
    const audio = new Audio(trackUrls[ambientTrack]);
    audio.loop = true;
    audio.volume = isMuted ? 0 : volume;
    audio.play().catch(err => console.log('Audio playback interaction guard:', err));
    audioRef.current = audio;

    return () => {
      audio.pause();
    };
  }, [ambientTrack]);

  // Handle volume change
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const handleTimerCompletion = () => {
    setIsRunning(false);
    
    // Determine title
    const activeTaskObj = tasks.find(t => t.id === selectedTaskId);
    const taskTitle = activeTaskObj ? activeTaskObj.title : 'General Focused Study';

    if (sessionType === 'study') {
      const earnedXP = 100;
      addXP(earnedXP, `Completed ${customMinutes}m focus session: ${taskTitle}`);
      addNotification('Focus Accomplished!', `Outstanding! You completed your ${customMinutes}-minute focus block. Earned +${earnedXP} XP.`, 'achievement');

      // Log focus block
      const newLog = {
        id: 'log_' + Math.random().toString(36).substr(2, 9),
        timestamp: 'Just now',
        duration: customMinutes,
        taskTitle,
        type: 'Study session'
      };
      setFocusLogs(prev => [newLog, ...prev]);
    } else {
      addNotification('Break Completed', 'Your break has finished. Ready to lock in another study session?', 'reminder');
    }

    // Reset to default study timer
    handleSessionSelect('study', 25);
  };

  const handleSessionSelect = (type: 'study' | 'shortBreak' | 'longBreak', minutes: number) => {
    setSessionType(type);
    setCustomMinutes(minutes);
    setTimeLeft(minutes * 60);
    setIsRunning(false);
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(customMinutes * 60);
  };

  const handleCustomSliderChange = (val: number) => {
    setCustomMinutes(val);
    setTimeLeft(val * 60);
    setIsRunning(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Circular progress calculation
  const totalSeconds = customMinutes * 60;
  const percentage = totalSeconds > 0 ? (timeLeft / totalSeconds) * 100 : 0;
  const strokeDashoffset = 2 * Math.PI * 90 * (1 - percentage / 100);

  return (
    <div className="space-y-6 text-white pb-10 max-w-5xl mx-auto">
      
      {/* Station Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-6 bg-slate-900/40 border border-slate-800/60 rounded-3xl backdrop-blur-xl">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-100 flex items-center">
            <Timer className="h-6 w-6 text-purple-400 mr-2" /> Focus Station
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Activate cognitive deep focus blocks, overlay immersive atmospheric noise layers, and link achievements to course milestones.
          </p>
        </div>

        {/* Action presets */}
        <div className="flex bg-slate-950 border border-slate-800/80 rounded-2xl p-1 mt-4 md:mt-0">
          <button
            onClick={() => handleSessionSelect('study', 25)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              sessionType === 'study' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Study Block (25m)
          </button>
          <button
            onClick={() => handleSessionSelect('shortBreak', 5)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              sessionType === 'shortBreak' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Short Break (5m)
          </button>
          <button
            onClick={() => handleSessionSelect('longBreak', 15)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              sessionType === 'longBreak' ? 'bg-purple-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Long Break (15m)
          </button>
        </div>
      </div>

      {/* Main Core Layout: Left column = Timer Circle, Right Column = Ambient Sounds */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* TIMER CORE UNIT (7 Cols) */}
        <div className="lg:col-span-7 p-8 bg-slate-900/30 border border-slate-800/60 rounded-3xl flex flex-col items-center justify-center space-y-6">
          
          {/* Visual Circle Meter */}
          <div className="relative w-64 h-64 flex items-center justify-center">
            <svg className="w-full h-full rotate-[-90deg]">
              {/* Outer static ring */}
              <circle
                cx="128"
                cy="128"
                r="90"
                className="stroke-slate-950 fill-none"
                strokeWidth="10"
              />
              {/* Active animated stroke */}
              <circle
                cx="128"
                cy="128"
                r="90"
                className="stroke-purple-600 fill-none transition-all duration-300"
                strokeWidth="10"
                strokeDasharray={2 * Math.PI * 90}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
              />
            </svg>

            {/* Centered digits */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl md:text-5xl font-black font-mono tracking-tighter text-slate-100">
                {formatTime(timeLeft)}
              </span>
              <span className="text-[10px] text-slate-500 font-mono tracking-widest uppercase mt-1">
                {sessionType === 'study' ? 'FOCUSING' : 'BREATHING'}
              </span>
            </div>
          </div>

          {/* Quick interactive control bar */}
          <div className="flex items-center space-x-4">
            <button
              onClick={resetTimer}
              className="p-3 bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-2xl text-slate-400 hover:text-slate-100 transition shadow-lg"
              title="Reset timer"
            >
              <RotateCcw className="h-5 w-5" />
            </button>

            <button
              onClick={toggleTimer}
              className={`p-4 rounded-2xl flex items-center justify-center transition shadow-xl ${
                isRunning ? 'bg-rose-600 hover:bg-rose-500 text-white' : 'bg-purple-600 hover:bg-purple-500 text-white'
              }`}
            >
              {isRunning ? (
                <Pause className="h-6 w-6" />
              ) : (
                <Play className="h-6 w-6 fill-current" />
              )}
            </button>
          </div>

          {/* Precision custom minutes setter */}
          <div className="w-full pt-4 border-t border-slate-800/40 space-y-2">
            <div className="flex justify-between items-center text-xs text-slate-400 font-mono">
              <span>PRECISION TIMER ADJUSTER</span>
              <span className="font-bold text-purple-400">{customMinutes} MINUTES</span>
            </div>
            <input
              type="range"
              min="1"
              max="120"
              value={customMinutes}
              onChange={(e) => handleCustomSliderChange(Number(e.target.value))}
              className="w-full accent-purple-500 bg-slate-950 h-1.5 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>

        {/* WORK CONTEXT & FOCUS TOOLS (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* AMBIENT SOUND overlay ENGINE */}
          <div className="p-6 bg-slate-900/30 border border-slate-800/60 rounded-3xl space-y-4 h-full flex flex-col justify-center">
            <div className="flex items-center space-x-2 text-slate-200">
              <Volume2 className="h-4.5 w-4.5 text-purple-400" />
              <h3 className="text-sm font-bold">Ambient Mind-Filters</h3>
            </div>
            <p className="text-xs text-slate-400 leading-normal">
              Layer calming acoustic loops underneath your study session to block out spatial noise.
            </p>

            {/* Sound track selection grids */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setAmbientTrack('none')}
                className={`py-2 px-3 border text-xs font-semibold rounded-xl transition ${
                  ambientTrack === 'none'
                    ? 'border-purple-600/60 bg-purple-600/10 text-purple-300'
                    : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-slate-100'
                }`}
              >
                🔇 Acoustic Silence
              </button>
              <button
                onClick={() => setAmbientTrack('lofi')}
                className={`py-2 px-3 border text-xs font-semibold rounded-xl transition ${
                  ambientTrack === 'lofi'
                    ? 'border-purple-600/60 bg-purple-600/10 text-purple-300'
                    : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-slate-100'
                }`}
              >
                🎹 Retro Lofi Beat
              </button>
              <button
                onClick={() => setAmbientTrack('rain')}
                className={`py-2 px-3 border text-xs font-semibold rounded-xl transition ${
                  ambientTrack === 'rain'
                    ? 'border-purple-600/60 bg-purple-600/10 text-purple-300'
                    : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-slate-100'
                }`}
              >
                🌧 Steady Rainfall
              </button>
              <button
                onClick={() => setAmbientTrack('forest')}
                className={`py-2 px-3 border text-xs font-semibold rounded-xl transition ${
                  ambientTrack === 'forest'
                    ? 'border-purple-600/60 bg-purple-600/10 text-purple-300'
                    : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-slate-100'
                }`}
              >
                🌲 Ancient Forest
              </button>
            </div>

            {/* Volume sliders and mute buttons */}
            {ambientTrack !== 'none' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center space-x-3 pt-3 border-t border-slate-800/40"
              >
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="p-2 bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl transition text-slate-400 hover:text-white"
                >
                  {isMuted ? <VolumeX className="h-4 w-4 text-rose-400" /> : <Volume2 className="h-4 w-4" />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={volume}
                  onChange={(e) => setVolume(Number(e.target.value))}
                  className="flex-1 accent-purple-500 bg-slate-950 h-1 rounded-lg appearance-none cursor-pointer"
                />
                <span className="text-[10px] text-slate-500 font-mono">{Math.round(volume * 100)}%</span>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* FOCUS BLOCK LOGS */}
      <div className="p-6 bg-slate-900/30 border border-slate-800/60 rounded-3xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Clock className="h-4.5 w-4.5 text-purple-400" />
            <h3 className="text-sm font-bold">Focus Accomplishments Log</h3>
          </div>
          <span className="text-[10px] bg-purple-500/10 text-purple-400 px-2 py-0.5 border border-purple-900/40 font-mono font-semibold rounded-lg">
            STREAK PRESERVED
          </span>
        </div>

        <div className="space-y-2.5">
          {focusLogs.map((log) => (
            <div
              key={log.id}
              className="p-3.5 bg-slate-950/50 border border-slate-900 hover:border-slate-850/80 rounded-2xl flex items-center justify-between text-xs transition"
            >
              <div className="flex items-center space-x-3.5">
                <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-bold text-slate-200">{log.taskTitle}</p>
                  <p className="text-[10px] text-slate-500 font-mono mt-0.5">{log.type} • {log.timestamp}</p>
                </div>
              </div>
              
              <div className="text-right">
                <span className="text-xs font-mono font-extrabold text-purple-400">+{log.duration} MINS</span>
                <p className="text-[10px] text-slate-500 font-mono mt-0.5">Focus Credits</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
