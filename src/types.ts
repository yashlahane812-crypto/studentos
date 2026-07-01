/**
 * StudentOS - Shared Types
 */

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  university: string;
  major: string;
  year: string;
  streak: number;
  xp: number;
  badges: Badge[];
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: string;
}

export type Priority = 'low' | 'medium' | 'high';
export type TaskStatus = 'todo' | 'in-progress' | 'completed';

export interface Task {
  id: string;
  title: string;
  subjectId: string;
  status: TaskStatus;
  priority: Priority;
  deadline: string;
  estimatedTime: string; // e.g. "2 hours"
  bestStudyTime?: string; // Gemini suggested
  aiPriorityReason?: string; // Gemini explanation
  completedAt?: string;
  isRecurring?: boolean;
  recurrenceRule?: string; // e.g., "daily", "weekly"
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  color: string; // Tailwind bg class or hex
  professor?: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  subjectId: string;
  tags: string[];
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
  summary?: string;
  keyPoints?: string[];
  mindmapJson?: string; // Stringified JSON structure
  flashcards?: { question: string; answer: string }[];
  importantQuestions?: string[];
  type?: 'pdf' | 'docx' | 'image' | 'voice' | 'text';
}

export interface Assignment {
  id: string;
  title: string;
  subjectId: string;
  dueDate: string;
  status: 'pending' | 'submitted' | 'graded';
  priority: Priority;
  professor: string;
  marks?: string; // e.g. "A", "95/100"
  attachments?: string[];
  aiCompletionProbability?: number; // percentage
  aiLateRisk?: boolean;
  aiSuggestedSchedule?: string;
}

export interface AttendanceSubject {
  id: string;
  subjectId: string;
  attended: number;
  total: number;
  targetPercent: number; // usually 75
}

export interface TimetableEvent {
  id: string;
  subjectId: string;
  day: number; // 0-6 (Sunday to Saturday)
  startTime: string; // "09:00"
  endTime: string; // "10:30"
  room: string;
}

export interface FlashcardDeck {
  id: string;
  title: string;
  subjectId: string;
  cards: {
    id: string;
    front: string;
    back: string;
    difficulty: 'easy' | 'medium' | 'hard';
    isFavorite: boolean;
  }[];
}

export interface Quiz {
  id: string;
  title: string;
  subjectId: string;
  questions: {
    id: string;
    type: 'mcq' | 'true-false' | 'short';
    question: string;
    options?: string[]; // for mcq
    correctAnswer: string;
    explanation?: string;
  }[];
  highScore?: number;
}

export interface DoubtChat {
  id: string;
  title: string;
  createdAt: string;
  messages: {
    sender: 'user' | 'ai';
    content: string;
    timestamp: string;
    image?: string; // base64 payload if uploaded
    pdfName?: string; // PDF source if grounded
  }[];
}

export interface StudyPlan {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  dailyHours: number;
  timetable: {
    day: string;
    goals: string[];
    pomodoros: number;
  }[];
}

export interface ResumeData {
  education: { institution: string; degree: string; year: string; gpa?: string }[];
  skills: string[];
  projects: { title: string; description: string; technologies: string; link?: string }[];
  experience: { role: string; company: string; duration: string; description: string }[];
  achievements: string[];
}
