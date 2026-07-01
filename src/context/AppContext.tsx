import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UserProfile,
  Subject,
  Task,
  Note,
  Assignment,
  AttendanceSubject,
  TimetableEvent,
  FlashcardDeck,
  Quiz,
  DoubtChat,
  StudyPlan,
  ResumeData
} from '../types';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleAuthProvider } from '../lib/firebase.ts';

interface AppContextType {
  // Auth
  user: UserProfile | null;
  isLoadingAuth: boolean;
  login: (email: string, pass: string) => Promise<boolean>;
  signup: (name: string, email: string, pass: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (profile: Partial<UserProfile>) => void;
  loginWithGoogle?: () => Promise<void>;
  token?: string | null;

  // General State
  activeTab: string;
  setActiveTab: (tab: string) => void;
  subjects: Subject[];
  addSubject: (subj: Omit<Subject, 'id'>) => void;

  // Tasks
  tasks: Task[];
  addTask: (task: Omit<Task, 'id' | 'status'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  reorderTasks: (tasks: Task[]) => void;
  aiRearrangeTasks: () => Promise<void>;

  // Notes
  notes: Note[];
  addNote: (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt' | 'isFavorite'>) => Note;
  updateNote: (id: string, updates: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  generateAINoteFeatures: (id: string, type: 'summary' | 'flashcards' | 'quiz' | 'explain' | 'simplify') => Promise<void>;

  // Doubts (AI Chat)
  chats: DoubtChat[];
  activeChatId: string | null;
  setActiveChatId: (id: string | null) => void;
  createNewChat: (title?: string) => string;
  sendMessageToChat: (chatId: string, text: string, image?: string, pdfName?: string, pdfBase64?: string) => Promise<void>;
  deleteChat: (id: string) => void;

  // Study Planner
  studyPlans: StudyPlan[];
  activeStudyPlan: StudyPlan | null;
  generateAIStudyPlan: (subjects: string[], examDates: Record<string, string>, difficulty: string, hours: number) => Promise<void>;

  // Timetable
  timetable: TimetableEvent[];
  addTimetableEvent: (event: Omit<TimetableEvent, 'id'>) => void;
  deleteTimetableEvent: (id: string) => void;

  // Assignments
  assignments: Assignment[];
  addAssignment: (asg: Omit<Assignment, 'id' | 'aiCompletionProbability' | 'aiLateRisk' | 'aiSuggestedSchedule'>) => void;
  updateAssignment: (id: string, updates: Partial<Assignment>) => void;
  deleteAssignment: (id: string) => void;

  // Attendance
  attendance: AttendanceSubject[];
  recordAttendance: (subjectId: string, attended: boolean) => void;
  updateAttendanceTarget: (subjectId: string, target: number) => void;

  // Flashcards
  flashcardDecks: FlashcardDeck[];
  addFlashcardDeck: (deck: Omit<FlashcardDeck, 'id'>) => void;
  generateFlashcardsForTopic: (topic: string) => Promise<boolean>;
  updateFlashcardDifficulty: (deckId: string, cardId: string, difficulty: 'easy' | 'medium' | 'hard') => void;
  toggleFlashcardFavorite: (deckId: string, cardId: string) => void;
  flashcards: {
    id: string;
    deckId: string;
    question: string;
    answer: string;
    difficulty: 'easy' | 'medium' | 'hard';
    isStarred: boolean;
  }[];
  updateFlashcard: (cardId: string, updates: Partial<{ difficulty: 'easy' | 'medium' | 'hard'; isStarred: boolean }>) => void;

  // Quiz
  quizzes: Quiz[];
  recordQuizScore: (quizId: string, score: number) => void;

  // Resume Data & AI Suggestions
  resumeData: ResumeData;
  updateResumeData: (data: Partial<ResumeData>) => void;
  resumeAIEvaluation: { score: number; feedback: string; suggestions: string[] } | null;
  evaluateResumeAI: () => Promise<void>;

  // Gamification & XP Actions
  addXP: (amount: number, reason: string) => void;
  notifications: { id: string; title: string; message: string; type: 'achievement' | 'reminder' | 'warning'; read: boolean; date: string }[];
  addNotification: (title: string, message: string, type: 'achievement' | 'reminder' | 'warning') => void;
  clearNotification: (id: string) => void;

  // Global search
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  triggerGlobalSearch: () => { tasks: Task[]; notes: Note[]; chats: DoubtChat[]; assignments: Assignment[] };

  // AI suggestions
  aiDashboardSuggestion: string;
  aiSuggestionLoading: boolean;
  getDashboardSuggestions: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Core Mock Data
const MOCK_SUBJECTS: Subject[] = [
  { id: 's1', name: 'Advanced Algorithms', code: 'CS-401', color: 'blue', professor: 'Dr. Evelyn Carter' },
  { id: 's2', name: 'Machine Learning', code: 'AI-403', color: 'purple', professor: 'Prof. Alan Turing' },
  { id: 's3', name: 'User Experience Design', code: 'UX-201', color: 'cyan', professor: 'Maria Stern' },
  { id: 's4', name: 'Distributed Systems', code: 'CS-415', color: 'emerald', professor: 'Dr. James Leslie' }
];

const MOCK_PROFILE: UserProfile = {
  id: 'u1',
  name: 'Alex Rivera',
  email: 'alex.rivera@university.edu',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=256',
  university: 'Stanford University',
  major: 'Computer Science (AI Track)',
  year: 'Junior Year',
  streak: 8,
  xp: 1450,
  badges: [
    { id: 'b1', name: 'First Milestone', description: 'Enrolled in StudentOS and set up the profile', icon: 'Sparkles', unlockedAt: new Date().toLocaleDateString() },
    { id: 'b2', name: 'Consistency King', description: 'Maintained a study streak of 7 days', icon: 'Flame', unlockedAt: new Date().toLocaleDateString() },
    { id: 'b3', name: 'Doubt Destroyer', description: 'Solved your first doubt using the AI Solver', icon: 'BrainCircuit', unlockedAt: new Date().toLocaleDateString() }
  ]
};

const MOCK_TASKS: Task[] = [
  { id: 't1', title: 'Implement Bellman-Ford optimization homework', subjectId: 's1', status: 'todo', priority: 'high', deadline: '2026-07-02', estimatedTime: '3h', bestStudyTime: '8:00 PM - 11:00 PM', aiPriorityReason: 'Dynamic Programming project deadline in 3 days. High weightage assignment.' },
  { id: 't2', title: 'Prepare ML Midterm Revision Cards', subjectId: 's2', status: 'in-progress', priority: 'medium', deadline: '2026-07-05', estimatedTime: '2h', bestStudyTime: '4:00 PM - 6:00 PM', aiPriorityReason: 'Active recall study technique advised 4 days prior to exam.' },
  { id: 't3', title: 'Complete UX prototype wireframes', subjectId: 's3', status: 'todo', priority: 'low', deadline: '2026-07-08', estimatedTime: '1.5h', bestStudyTime: '10:00 AM - 11:30 AM', aiPriorityReason: 'Design iteration task. Best scheduled during peak creative hours.' },
  { id: 't4', title: 'Read DynamoDB original research paper', subjectId: 's4', status: 'completed', priority: 'medium', deadline: '2026-06-28', estimatedTime: '2.5h', completedAt: '2026-06-28' }
];

const MOCK_NOTES: Note[] = [
  {
    id: 'n1',
    title: 'Supervised Learning vs Unsupervised Learning',
    subjectId: 's2',
    tags: ['Machine Learning', 'AI Fundamentals', 'MidtermPrep'],
    isFavorite: true,
    createdAt: '2026-06-25T14:30:00.000Z',
    updatedAt: '2026-06-25T14:30:00.000Z',
    type: 'text',
    content: `Supervised Learning deals with labeled datasets. The model learns from input-output pairs. Examples include: Linear Regression, Logistic Regression, Support Vector Machines (SVM), and Neural Networks. Applications range from email spam detection to house price prediction.

Unsupervised Learning deals with unlabeled datasets. The algorithms must identify hidden structures or clusters in the inputs on their own. Examples include: K-Means Clustering, Hierarchical Clustering, Principal Component Analysis (PCA), and Apriori. Applications include market segmentation and anomaly detection.

Key difference: Supervised has a guiding metric (loss/error against targets), whereas Unsupervised aims to capture underlying probability densities or grouping structures without ground truth feedback.`,
    summary: 'A direct comparison of Machine Learning paradigms based on whether training data has human labels. Supervised systems use labeled input-output pairs to fit prediction mappings, whereas unsupervised learning algorithms autonomously map latent clustering and dimensional patterns within raw data.',
    keyPoints: [
      'Supervised Learning requires labeled training pairs and utilizes error minimization (loss functions).',
      'Unsupervised Learning processes unlabeled inputs and aims to discover core underlying structures.',
      'Supervised examples: SVM, Neural Networks, Decision Trees, Regressions.',
      'Unsupervised examples: K-Means Clustering, PCA, Association Rule Mining.',
      'Key application differences: Predictive regression/classification vs. exploratory market segmentation/clustering.'
    ],
    flashcards: [
      { question: 'What is the main requirement of Supervised Learning?', answer: 'Labeled training data (input-output pairs).' },
      { question: 'Name two unsupervised learning algorithms.', answer: 'K-Means Clustering and Principal Component Analysis (PCA).' },
      { question: 'What does a loss function do in supervised learning?', answer: 'Measures the difference between model predictions and the correct labels.' }
    ],
    importantQuestions: [
      'Explain how semi-supervised learning fits between supervised and unsupervised methodologies.',
      'Analyze the impact of mislabeled target vectors in a classic classification task.'
    ]
  },
  {
    id: 'n2',
    title: 'Bellman-Ford Algorithm Essentials',
    subjectId: 's1',
    tags: ['Algorithms', 'Graphs', 'Dynamic Programming'],
    isFavorite: false,
    createdAt: '2026-06-26T10:15:00.000Z',
    updatedAt: '2026-06-26T10:15:00.000Z',
    type: 'pdf',
    content: `Bellman-Ford computes single-source shortest paths in a weighted directed graph, even with negative edge weights. Unlike Dijkstra's algorithm, which fails on negative edge cycles, Bellman-Ford runs in O(V * E) time complexity. 
The algorithm relaxes all edges V-1 times.
If we can relax an edge on the Vth iteration, it indicates the presence of a negative weight cycle reachable from the source. This is a critical property utilized in currency arbitrage detection.`,
    summary: 'Overview of the Bellman-Ford single-source shortest path algorithm. Highlights its superiority over Dijkstra when dealing with negative edge weights, its O(V*E) time complexity, and its ability to detect negative-weight cycles.',
    keyPoints: [
      'Computes shortest paths from a single source to all vertices.',
      'Supports negative edge weights (Dijkstra fails here).',
      'Relaxation is executed exactly V-1 times.',
      'Detects negative-weight cycles on the V-th pass.',
      'Time complexity is O(V * E).'
    ]
  }
];

const MOCK_ASSIGNMENTS: Assignment[] = [
  { id: 'a1', title: 'ML Clustering & PCA Project', subjectId: 's2', dueDate: '2026-07-06', status: 'pending', priority: 'high', professor: 'Prof. Alan Turing', marks: 'Pending Review', aiCompletionProbability: 88, aiLateRisk: false, aiSuggestedSchedule: 'Complete cluster modeling on Wednesday, draft conclusions on Friday.' },
  { id: 'a2', title: 'Figma Interactive Case Study', subjectId: 's3', dueDate: '2026-07-12', status: 'pending', priority: 'medium', professor: 'Maria Stern', aiCompletionProbability: 95, aiLateRisk: false, aiSuggestedSchedule: 'Conduct user research interviews on Monday, design final components on Wednesday.' },
  { id: 'a3', title: 'Distributed Mutual Exclusion Lab', subjectId: 's4', dueDate: '2026-06-29', status: 'submitted', priority: 'high', professor: 'Dr. James Leslie', marks: '98/100', aiCompletionProbability: 100 }
];

const MOCK_ATTENDANCE: AttendanceSubject[] = [
  { id: 'at1', subjectId: 's1', attended: 18, total: 20, targetPercent: 75 },
  { id: 'at2', subjectId: 's2', attended: 13, total: 18, targetPercent: 75 }, // 72.2% -> Alert!
  { id: 'at3', subjectId: 's3', attended: 15, total: 15, targetPercent: 75 },
  { id: 'at4', subjectId: 's4', attended: 17, total: 20, targetPercent: 75 }
];

const MOCK_TIMETABLE: TimetableEvent[] = [
  // Days: 1 = Monday, 2 = Tuesday, 3 = Wednesday, 4 = Thursday, 5 = Friday
  { id: 'tt1', subjectId: 's1', day: 1, startTime: '09:00', endTime: '10:30', room: 'Hall B' },
  { id: 'tt2', subjectId: 's3', day: 1, startTime: '11:00', endTime: '12:30', room: 'Design Studio 1' },
  { id: 'tt3', subjectId: 's2', day: 2, startTime: '13:30', endTime: '15:00', room: 'AI Lab 3' },
  { id: 'tt4', subjectId: 's4', day: 3, startTime: '09:00', endTime: '10:30', room: 'Hall A' },
  { id: 'tt5', subjectId: 's1', day: 3, startTime: '11:00', endTime: '12:30', room: 'Hall B' },
  { id: 'tt6', subjectId: 's2', day: 4, startTime: '13:30', endTime: '15:00', room: 'AI Lab 3' },
  { id: 'tt7', subjectId: 's4', day: 5, startTime: '10:00', endTime: '11:30', room: 'Hall C' }
];

const MOCK_FLASHCARD_DECKS: FlashcardDeck[] = [
  {
    id: 'fd1',
    title: 'Algorithms Quick-Review',
    subjectId: 's1',
    cards: [
      { id: 'fc1', front: 'What is the master theorem formula?', back: 'T(n) = aT(n/b) + f(n). It solves recurrences of divide-and-conquer systems.', difficulty: 'medium', isFavorite: true },
      { id: 'fc2', front: 'Time complexity of Floyd-Warshall algorithm?', back: 'O(V^3) - Computes all-pairs shortest paths on graphs.', difficulty: 'easy', isFavorite: false },
      { id: 'fc3', front: 'What makes Kruskal’s greedy approach optimal?', back: 'It works on matroids, adding minimum weight edges that do not form a cycle.', difficulty: 'hard', isFavorite: false }
    ]
  },
  {
    id: 'fd2',
    title: 'Machine Learning Terminology',
    subjectId: 's2',
    cards: [
      { id: 'fc4', front: 'Explain L1 vs L2 regularization.', back: 'L1 (Lasso) adds absolute weights sum, producing sparse coefficients. L2 (Ridge) adds squared weights sum, driving weights close to zero but not exactly.', difficulty: 'medium', isFavorite: true },
      { id: 'fc5', front: 'What is the curse of dimensionality?', back: 'As feature dimensions expand, sample space volume increases exponentially, making data points extremely sparse and distance metrics less informative.', difficulty: 'hard', isFavorite: false }
    ]
  }
];

const MOCK_QUIZZES: Quiz[] = [
  {
    id: 'q1',
    title: 'Deep Learning & Neural Networks Quiz',
    subjectId: 's2',
    questions: [
      {
        id: 'qq1',
        type: 'mcq',
        question: 'Which activation function suffers most from the vanishing gradient problem in deep feedforward networks?',
        options: ['ReLU', 'Leaky ReLU', 'Sigmoid', 'GELU'],
        correctAnswer: 'Sigmoid',
        explanation: 'The derivative of the Sigmoid function caps out at 0.25. As gradients flow backwards through multiple layers, multiplying these small fractions continuously causes the gradient to vanish rapidly.'
      },
      {
        id: 'qq2',
        type: 'true-false',
        question: 'Stochastic Gradient Descent (SGD) with momentum helps escape local minima and saddle points.',
        correctAnswer: 'True',
        explanation: 'Momentum accumulates velocity along stable gradient descent directions, assisting the optimization process in overcoming localized hills, flat valleys, and narrow saddle boundaries.'
      },
      {
        id: 'qq3',
        type: 'short',
        question: 'What is the term for a Neural Network layer that randomly shuts down neurons during training to prevent overfitting?',
        correctAnswer: 'Dropout',
        explanation: 'Dropout layers randomly set activation signals to 0 with a user-defined probability parameter during training steps, preventing co-adaptation of weight relationships.'
      }
    ],
    highScore: 100
  }
];

const MOCK_CHATS: DoubtChat[] = [
  {
    id: 'c1',
    title: 'Dijkstra vs Bellman-Ford Cycle Question',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    messages: [
      { sender: 'user', content: 'Why does Dijkstra’s algorithm fail on negative edge weights? Can you explain with a simple example?', timestamp: new Date(Date.now() - 3600000 * 2).toLocaleTimeString() },
      {
        sender: 'ai',
        content: `Dijkstra’s algorithm works on a **greedy assumption**: once a vertex is marked "visited", its shortest path from the source is assumed to be finalized and will not be re-evaluated. 

### Why this fails with negative weights:

Consider a simple graph:
- Source node **A**
- Nodes **B** and **C**
- Edges:
  - \`A -> B\` with weight **2**
  - \`A -> C\` with weight **5**
  - \`B -> C\` with weight **-4**

Let's trace **Dijkstra** from **A**:
1. Initial distances: \`A=0\`, \`B=∞\`, \`C=∞\`.
2. Extract minimum unvisited node: **A** (distance 0).
3. Relax A's neighbors:
   - Distance to **B** becomes \`0 + 2 = 2\`.
   - Distance to **C** becomes \`0 + 5 = 5\`.
4. Visited set is now \`{A}\`.
5. Extract minimum unvisited node: **B** (distance 2).
6. Relax B's neighbors:
   - Distance to **C** becomes \`2 + (-4) = -2\`.
7. Visited set is now \`{A, B}\`.
8. Extract minimum unvisited node: **C** (distance -2). Since C has no outgoing edges, Dijkstra terminates.

**The catch:** If C had an edge to another node, or if we had a more complex layout, Dijkstra would *never* update nodes that were relaxed prior to updating C, because their paths were marked complete. Dijkstra relies on path costs strictly increasing. When weights can be negative, an initially longer path can end up being cheaper, breaking the greedy invariant.

**Solution:** **Bellman-Ford** relaxes all edges \`V-1\` times, ensuring any positive or negative path propagation is accounted for correctly, and runs in \`O(V*E)\` time instead of \`O((V+E) log V)\`.`,
        timestamp: new Date(Date.now() - 3600000 * 2 + 5000).toLocaleTimeString()
      }
    ]
  }
];

const DEFAULT_RESUME: ResumeData = {
  education: [
    { institution: 'Stanford University', degree: 'B.S. in Computer Science', year: '2023 - 2027', gpa: '3.92 / 4.0' }
  ],
  skills: ['TypeScript', 'React', 'Node.js', 'Python', 'PyTorch', 'Data Structures', 'Git', 'SQL'],
  projects: [
    { title: 'StudentOS Academic Suite', description: 'Built an all-in-one academic planner using React, Express and Google Gemini API, processing summaries and automated timetables.', technologies: 'React, Node, Express, Google Gen AI', link: 'https://student-os.dev' }
  ],
  experience: [
    { role: 'Software Engineering Intern', company: 'Tech Innovation Labs', duration: 'Summer 2025', description: 'Assisted in building real-time collaboration dashboards using React and Node.js. Optimized SQL query performance by 25%.' }
  ],
  achievements: [
    '1st Place Winner - Stanford Hackathon (2025)',
    'Academic Honors List (2024)'
  ]
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Auth State
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('student_os_user');
    return saved ? JSON.parse(saved) : MOCK_PROFILE;
  });
  const [isLoadingAuth, setIsLoadingAuth] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  // Active Screen
  const [activeTab, setActiveTab] = useState('dashboard');

  // Subjects
  const [subjects, setSubjects] = useState<Subject[]>(() => {
    const saved = localStorage.getItem('student_os_subjects');
    return saved ? JSON.parse(saved) : MOCK_SUBJECTS;
  });

  // Tasks
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('student_os_tasks');
    return saved ? JSON.parse(saved) : MOCK_TASKS;
  });

  // Notes
  const [notes, setNotes] = useState<Note[]>(() => {
    const saved = localStorage.getItem('student_os_notes');
    return saved ? JSON.parse(saved) : MOCK_NOTES;
  });

  // Assignments
  const [assignments, setAssignments] = useState<Assignment[]>(() => {
    const saved = localStorage.getItem('student_os_assignments');
    return saved ? JSON.parse(saved) : MOCK_ASSIGNMENTS;
  });

  // Attendance
  const [attendance, setAttendance] = useState<AttendanceSubject[]>(() => {
    const saved = localStorage.getItem('student_os_attendance');
    return saved ? JSON.parse(saved) : MOCK_ATTENDANCE;
  });

  // Timetable
  const [timetable, setTimetable] = useState<TimetableEvent[]>(() => {
    const saved = localStorage.getItem('student_os_timetable');
    return saved ? JSON.parse(saved) : MOCK_TIMETABLE;
  });

  // Flashcards
  const [flashcardDecks, setFlashcardDecks] = useState<FlashcardDeck[]>(() => {
    const saved = localStorage.getItem('student_os_flashcard_decks');
    return saved ? JSON.parse(saved) : MOCK_FLASHCARD_DECKS;
  });

  // Quizzes
  const [quizzes, setQuizzes] = useState<Quiz[]>(() => {
    const saved = localStorage.getItem('student_os_quizzes');
    return saved ? JSON.parse(saved) : MOCK_QUIZZES;
  });

  // Chats (Doubts solver)
  const [chats, setChats] = useState<DoubtChat[]>(() => {
    const saved = localStorage.getItem('student_os_chats');
    return saved ? JSON.parse(saved) : MOCK_CHATS;
  });
  const [activeChatId, setActiveChatId] = useState<string | null>(chats.length > 0 ? chats[0].id : null);

  // Study Plans
  const [studyPlans, setStudyPlans] = useState<StudyPlan[]>(() => {
    const saved = localStorage.getItem('student_os_study_plans');
    return saved ? JSON.parse(saved) : [];
  });
  const [activeStudyPlan, setActiveStudyPlan] = useState<StudyPlan | null>(() => {
    const saved = localStorage.getItem('student_os_active_study_plan');
    return saved ? JSON.parse(saved) : null;
  });

  // Resume & AI suggestions
  const [resumeData, setResumeData] = useState<ResumeData>(() => {
    const saved = localStorage.getItem('student_os_resume_data');
    return saved ? JSON.parse(saved) : DEFAULT_RESUME;
  });
  const [resumeAIEvaluation, setResumeAIEvaluation] = useState<{ score: number; feedback: string; suggestions: string[] } | null>(null);

  // Notifications
  const [notifications, setNotifications] = useState<{ id: string; title: string; message: string; type: 'achievement' | 'reminder' | 'warning'; read: boolean; date: string }[]>(() => {
    const saved = localStorage.getItem('student_os_notifications');
    return saved ? JSON.parse(saved) : [
      { id: 'n_init', title: 'Welcome to StudentOS!', message: 'Get started by exploring the To-Do list and trying out the AI Doubt Solver.', type: 'reminder', read: false, date: new Date().toLocaleDateString() }
    ];
  });

  // Search
  const [searchQuery, setSearchQuery] = useState('');

  // AI Suggestions Card
  const [aiDashboardSuggestion, setAiDashboardSuggestion] = useState<string>(
    'Organize your priorities! Your assignments for Machine Learning and User Experience Design are due in less than a week. It is highly recommended to complete wireframes in the morning and reserve evening slots for machine learning PCA coding.'
  );
  const [aiSuggestionLoading, setAiSuggestionLoading] = useState(false);

  // Sync state from Cloud SQL when Firebase Auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setIsLoadingAuth(true);
        try {
          const idToken = await firebaseUser.getIdToken();
          setToken(idToken);

          // Sync user info to database
          const syncRes = await fetch('/api/user/sync', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${idToken}`
            }
          });

          if (syncRes.ok) {
            const dbUser = await syncRes.json();
            setUser({
              id: dbUser.uid,
              name: dbUser.name || firebaseUser.displayName || 'Student',
              email: dbUser.email || firebaseUser.email || '',
              avatar: dbUser.avatar || firebaseUser.photoURL || '',
              university: dbUser.university || '',
              major: dbUser.major || '',
              year: dbUser.year || '',
              streak: dbUser.streak || 0,
              xp: dbUser.xp || 0,
              badges: JSON.parse(dbUser.badgesJson || '[]'),
            });

            // Fetch subjects, notes, tasks, doubt chats, flashcard decks, and quizzes from Cloud SQL
            const [subjRes, notesRes, tasksRes, chatsRes, flashcardRes, quizRes] = await Promise.all([
              fetch('/api/subjects', { headers: { 'Authorization': `Bearer ${idToken}` } }),
              fetch('/api/notes', { headers: { 'Authorization': `Bearer ${idToken}` } }),
              fetch('/api/tasks', { headers: { 'Authorization': `Bearer ${idToken}` } }),
              fetch('/api/doubt-chats', { headers: { 'Authorization': `Bearer ${idToken}` } }),
              fetch('/api/flashcards', { headers: { 'Authorization': `Bearer ${idToken}` } }),
              fetch('/api/quizzes', { headers: { 'Authorization': `Bearer ${idToken}` } }),
            ]);

            if (subjRes.ok) {
              const dbSubjs = await subjRes.json();
              if (dbSubjs.length > 0) setSubjects(dbSubjs);
            }
            if (notesRes.ok) {
              const dbNotes = await notesRes.json();
              const mappedNotes = dbNotes.map((n: any) => ({
                id: n.id,
                title: n.title,
                content: n.content,
                subjectId: n.subjectId,
                tags: JSON.parse(n.tagsJson || '[]'),
                isFavorite: n.isFavorite,
                summary: n.summary,
                keyPoints: JSON.parse(n.keyPointsJson || '[]'),
                mindmapJson: n.mindmapJson,
                type: n.type,
                createdAt: n.createdAt,
                updatedAt: n.updatedAt,
              }));
              if (mappedNotes.length > 0) setNotes(mappedNotes);
            }
            if (tasksRes.ok) {
              const dbTasks = await tasksRes.json();
              const mappedTasks = dbTasks.map((t: any) => ({
                id: t.id,
                title: t.title,
                subjectId: t.subjectId,
                status: t.status,
                priority: t.priority,
                deadline: t.deadline,
                estimatedTime: t.estimatedTime,
                bestStudyTime: t.bestStudyTime,
                aiPriorityReason: t.aiPriorityReason,
                completedAt: t.completedAt,
                isRecurring: t.isRecurring,
                recurrenceRule: t.recurrenceRule,
              }));
              if (mappedTasks.length > 0) setTasks(mappedTasks);
            }
            if (chatsRes.ok) {
              const dbChats = await chatsRes.json();
              const mappedChats = dbChats.map((c: any) => ({
                id: c.id,
                title: c.title,
                messages: JSON.parse(c.messagesJson || '[]'),
                createdAt: c.createdAt,
              }));
              if (mappedChats.length > 0) setChats(mappedChats);
            }
            if (flashcardRes.ok) {
              const dbDecks = await flashcardRes.json();
              const mappedDecks = dbDecks.map((d: any) => ({
                id: d.id,
                title: d.title,
                subjectId: d.subjectId,
                cards: JSON.parse(d.cardsJson || '[]'),
              }));
              if (mappedDecks.length > 0) setFlashcardDecks(mappedDecks);
            }
            if (quizRes.ok) {
              const dbQuizzes = await quizRes.json();
              const mappedQuizzes = dbQuizzes.map((q: any) => ({
                id: q.id,
                title: q.title,
                subjectId: q.subjectId,
                questions: JSON.parse(q.questionsJson || '[]'),
                highScore: q.highScore,
              }));
              if (mappedQuizzes.length > 0) setQuizzes(mappedQuizzes);
            }

            addNotification('Database Synced', 'All study notes and data are live from Supabase!', 'achievement');
          }
        } catch (e) {
          console.error("Failed to sync client with Cloud SQL:", e);
        } finally {
          setIsLoadingAuth(false);
        }
      } else {
        setToken(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // Sync to local storage on changes
  useEffect(() => { localStorage.setItem('student_os_user', JSON.stringify(user)); }, [user]);
  useEffect(() => { localStorage.setItem('student_os_subjects', JSON.stringify(subjects)); }, [subjects]);
  useEffect(() => { localStorage.setItem('student_os_tasks', JSON.stringify(tasks)); }, [tasks]);
  useEffect(() => { localStorage.setItem('student_os_notes', JSON.stringify(notes)); }, [notes]);
  useEffect(() => { localStorage.setItem('student_os_assignments', JSON.stringify(assignments)); }, [assignments]);
  useEffect(() => { localStorage.setItem('student_os_attendance', JSON.stringify(attendance)); }, [attendance]);
  useEffect(() => { localStorage.setItem('student_os_timetable', JSON.stringify(timetable)); }, [timetable]);
  useEffect(() => { localStorage.setItem('student_os_flashcard_decks', JSON.stringify(flashcardDecks)); }, [flashcardDecks]);
  useEffect(() => { localStorage.setItem('student_os_quizzes', JSON.stringify(quizzes)); }, [quizzes]);
  useEffect(() => { localStorage.setItem('student_os_chats', JSON.stringify(chats)); }, [chats]);
  useEffect(() => { localStorage.setItem('student_os_study_plans', JSON.stringify(studyPlans)); }, [studyPlans]);
  useEffect(() => { localStorage.setItem('student_os_active_study_plan', JSON.stringify(activeStudyPlan)); }, [activeStudyPlan]);
  useEffect(() => { localStorage.setItem('student_os_resume_data', JSON.stringify(resumeData)); }, [resumeData]);
  useEffect(() => { localStorage.setItem('student_os_notifications', JSON.stringify(notifications)); }, [notifications]);

  // Check Attendance warnings on load/changes
  useEffect(() => {
    attendance.forEach(subj => {
      const subjectDetail = subjects.find(s => s.id === subj.subjectId);
      if (!subjectDetail) return;
      const rate = subj.total > 0 ? (subj.attended / subj.total) * 100 : 100;
      if (rate < 75) {
        // Trigger a notification if not already present
        const hasWarning = notifications.some(n => n.type === 'warning' && n.message.includes(subjectDetail.name));
        if (!hasWarning) {
          addNotification(
            'Attendance Alert!',
            `Your attendance in ${subjectDetail.name} has fallen to ${rate.toFixed(1)}% (below target 75%). Safe leaves exhausted!`,
            'warning'
          );
        }
      }
    });
  }, [attendance, subjects]);

  // Auth Operations
  const loginWithGoogle = async () => {
    setIsLoadingAuth(true);
    try {
      await signInWithPopup(auth, googleAuthProvider);
    } catch (error: any) {
      console.error("Google popup login failed:", error);
      addNotification('Login Failed', error.message, 'warning');
    } finally {
      setIsLoadingAuth(false);
    }
  };

  const login = async (email: string, pass: string) => {
    setIsLoadingAuth(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    setUser({
      ...MOCK_PROFILE,
      name: email.split('@')[0].toUpperCase(),
      email: email,
      xp: 0,
      streak: 1,
      badges: []
    });
    setIsLoadingAuth(false);
    addNotification('Login Successful', `Welcome back, ${email.split('@')[0]}!`, 'reminder');
    return true;
  };

  const signup = async (name: string, email: string, pass: string) => {
    setIsLoadingAuth(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    setUser({
      id: 'u_' + Math.random().toString(36).substr(2, 9),
      name: name,
      email: email,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=256',
      university: 'State University',
      major: 'Unassigned Major',
      year: 'Freshman',
      streak: 1,
      xp: 100,
      badges: [
        { id: 'b_welcome', name: 'Fresh Start', description: 'Successfully registered on StudentOS', icon: 'Sparkles', unlockedAt: new Date().toLocaleDateString() }
      ]
    });
    setIsLoadingAuth(false);
    addNotification('Welcome to StudentOS', `Hey ${name}, your workspace is ready!`, 'achievement');
    return true;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('student_os_user');
    signOut(auth).catch(e => console.error("Firebase SignOut failed:", e));
  };

  const updateProfile = (updates: Partial<UserProfile>) => {
    if (user) {
      const updated = { ...user, ...updates };
      setUser(updated);

      if (token) {
        fetch('/api/user/profile/update', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            university: updated.university,
            major: updated.major,
            year: updated.year,
            streak: updated.streak,
            xp: updated.xp,
            badgesJson: JSON.stringify(updated.badges || []),
          })
        }).catch(e => console.error("Cloud SQL sync failed for updateProfile:", e));
      }
    }
  };

  // Gamification Support
  const addXP = (amount: number, reason: string) => {
    if (!user) return;
    const newXP = user.xp + amount;
    const nextLevelMilestones = [500, 1000, 2000, 4000, 7000, 10000];
    
    // Check if new badge should be unlocked
    let newBadges = [...user.badges];
    let triggeredAchievement = false;

    if (newXP >= 2000 && !user.badges.some(b => b.id === 'badge_gold_member')) {
      const gBadge = {
        id: 'badge_gold_member',
        name: 'Savant Student',
        description: 'Earned a lifetime cumulative 2000+ XP on StudentOS.',
        icon: 'Crown',
        unlockedAt: new Date().toLocaleDateString()
      };
      newBadges.push(gBadge);
      triggeredAchievement = true;
      addNotification('Achievement Unlocked!', 'You earned the Savant Student Badge!', 'achievement');
    }

    setUser(prev => prev ? {
      ...prev,
      xp: newXP,
      badges: newBadges
    } : null);

    if (triggeredAchievement) {
      import('canvas-confetti').then((confetti) => {
        confetti.default({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
      });
    }
  };

  const addNotification = (title: string, message: string, type: 'achievement' | 'reminder' | 'warning') => {
    const newId = 'notif_' + Math.random().toString(36).substr(2, 9);
    setNotifications(prev => [
      {
        id: newId,
        title,
        message,
        type,
        read: false,
        date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      },
      ...prev
    ]);

    // Auto-remove notification after exactly 5 seconds
    setTimeout(() => {
      clearNotification(newId);
    }, 5000);
  };

  const clearNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // Subject Operations
  const addSubject = (subj: Omit<Subject, 'id'>) => {
    const newId = 's_' + Math.random().toString(36).substr(2, 9);
    const newSubj = { ...subj, id: newId };
    setSubjects(prev => [...prev, newSubj]);
    
    // Also create initial empty attendance tracking
    const newAttendance: AttendanceSubject = {
      id: 'at_' + Math.random().toString(36).substr(2, 9),
      subjectId: newId,
      attended: 0,
      total: 0,
      targetPercent: 75
    };
    setAttendance(prev => [...prev, newAttendance]);
    addXP(50, 'Added a new course');

    if (token) {
      fetch('/api/subjects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newSubj)
      }).catch(e => console.error("Cloud SQL sync failed for addSubject:", e));
    }
  };

  // Tasks Operations
  const addTask = (task: Omit<Task, 'id' | 'status'>) => {
    const newId = 't_' + Math.random().toString(36).substr(2, 9);
    const newTask: Task = {
      ...task,
      id: newId,
      status: 'todo'
    };
    setTasks(prev => [newTask, ...prev]);
    addXP(20, 'Created task: ' + task.title);

    if (token) {
      fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newTask)
      }).catch(e => console.error("Cloud SQL sync failed for addTask:", e));
    }
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks(prev => {
      const list = prev.map(t => {
        if (t.id === id) {
          const updated = { ...t, ...updates };
          if (updates.status === 'completed' && t.status !== 'completed') {
            updated.completedAt = new Date().toISOString();
            addXP(40, 'Completed task: ' + t.title);
            // Check if streak should increase
            if (user) {
              setUser(u => u ? { ...u, streak: u.streak + 1 } : null);
            }
          }
          return updated;
        }
        return t;
      });

      const updatedTaskObj = list.find(t => t.id === id);
      if (updatedTaskObj && token) {
        fetch('/api/tasks', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(updatedTaskObj)
        }).catch(e => console.error("Cloud SQL sync failed for updateTask:", e));
      }

      return list;
    });
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));

    if (token) {
      fetch(`/api/tasks/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }).catch(e => console.error("Cloud SQL sync failed for deleteTask:", e));
    }
  };

  const reorderTasks = (newTasks: Task[]) => {
    setTasks(newTasks);
  };

  // Notes Operations
  const addNote = (note: Omit<Note, 'id' | 'createdAt' | 'updatedAt' | 'isFavorite'>) => {
    const newId = 'n_' + Math.random().toString(36).substr(2, 9);
    const newNote: Note = {
      ...note,
      id: newId,
      isFavorite: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setNotes(prev => [newNote, ...prev]);
    addXP(30, 'Drafted course note: ' + note.title);

    if (token) {
      fetch('/api/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          id: newNote.id,
          title: newNote.title,
          content: newNote.content,
          subjectId: newNote.subjectId,
          tagsJson: JSON.stringify(newNote.tags || []),
          isFavorite: newNote.isFavorite,
          summary: newNote.summary || '',
          keyPointsJson: JSON.stringify(newNote.keyPoints || []),
          mindmapJson: newNote.mindmapJson || '',
          type: newNote.type || 'standard'
        })
      }).catch(e => console.error("Cloud SQL sync failed for addNote:", e));
    }
    return newNote;
  };

  const updateNote = (id: string, updates: Partial<Note>) => {
    setNotes(prev => {
      const list = prev.map(n => n.id === id ? { ...n, ...updates, updatedAt: new Date().toISOString() } : n);
      const noteObj = list.find(n => n.id === id);

      if (noteObj && token) {
        fetch('/api/notes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            id: noteObj.id,
            title: noteObj.title,
            content: noteObj.content,
            subjectId: noteObj.subjectId,
            tagsJson: JSON.stringify(noteObj.tags || []),
            isFavorite: noteObj.isFavorite,
            summary: noteObj.summary || '',
            keyPointsJson: JSON.stringify(noteObj.keyPoints || []),
            mindmapJson: noteObj.mindmapJson || '',
            type: noteObj.type || 'standard'
          })
        }).catch(e => console.error("Cloud SQL sync failed for updateNote:", e));
      }

      return list;
    });
  };

  const deleteNote = (id: string) => {
    setNotes(prev => prev.filter(n => n.id !== id));

    if (token) {
      fetch(`/api/notes/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }).catch(e => console.error("Cloud SQL sync failed for deleteNote:", e));
    }
  };

  // Chats Operations (Doubt solver)
  const createNewChat = (title?: string, initialMessage?: string, pdfName?: string) => {
    const newId = 'c_' + Math.random().toString(36).substr(2, 9);
    const newChat: DoubtChat = {
      id: newId,
      title: title || 'New Doubt Solving Session',
      createdAt: new Date().toISOString(),
      messages: [
        {
          sender: 'ai',
          content: initialMessage || "Hello! I am your AI Academic Solver. Ask me any question, write computer science code, paste equations, or upload notes. I can provide step-by-step solutions immediately.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          ...(pdfName ? { pdfName } : {})
        }
      ]
    };
    setChats(prev => [newChat, ...prev]);
    setActiveChatId(newId);
    return newId;
  };

  const deleteChat = (id: string) => {
    setChats(prev => prev.filter(c => c.id !== id));
    if (activeChatId === id) {
      const remaining = chats.filter(c => c.id !== id);
      setActiveChatId(remaining.length > 0 ? remaining[0].id : null);
    }
  };

  // Timetable Operations
  const addTimetableEvent = (event: Omit<TimetableEvent, 'id'>) => {
    const newEvent: TimetableEvent = {
      ...event,
      id: 'tt_' + Math.random().toString(36).substr(2, 9)
    };
    setTimetable(prev => [...prev, newEvent]);
    addXP(15, 'Scheduled class slot');
  };

  const deleteTimetableEvent = (id: string) => {
    setTimetable(prev => prev.filter(e => e.id !== id));
  };

  // Assignments Operations
  const addAssignment = (asg: Omit<Assignment, 'id' | 'aiCompletionProbability' | 'aiLateRisk' | 'aiSuggestedSchedule'>) => {
    // Generate AI predictions
    const prob = Math.floor(Math.random() * 40) + 60; // 60 - 100
    const risk = prob < 75;
    const newAsg: Assignment = {
      ...asg,
      id: 'a_' + Math.random().toString(36).substr(2, 9),
      aiCompletionProbability: prob,
      aiLateRisk: risk,
      aiSuggestedSchedule: 'Review references on day 1. Draft outline on day 3. Submit 24 hours prior to deadline.'
    };
    setAssignments(prev => [newAsg, ...prev]);
    addXP(30, 'Registered assignment tracker: ' + asg.title);
  };

  const updateAssignment = (id: string, updates: Partial<Assignment>) => {
    setAssignments(prev => prev.map(a => {
      if (a.id === id) {
        const updated = { ...a, ...updates };
        if (updates.status === 'submitted' && a.status !== 'submitted') {
          addXP(100, 'Submitted assignment: ' + a.title);
        }
        return updated;
      }
      return a;
    }));
  };

  const deleteAssignment = (id: string) => {
    setAssignments(prev => prev.filter(a => a.id !== id));
  };

  // Attendance Tracker
  const recordAttendance = (subjectId: string, attended: boolean) => {
    setAttendance(prev => prev.map(at => {
      if (at.subjectId === subjectId) {
        return {
          ...at,
          attended: at.attended + (attended ? 1 : 0),
          total: at.total + 1
        };
      }
      return at;
    }));
    addXP(10, 'Logged class attendance status');
  };

  const updateAttendanceTarget = (subjectId: string, target: number) => {
    setAttendance(prev => prev.map(at => at.subjectId === subjectId ? { ...at, targetPercent: target } : at));
  };

  // Flashcards Deck CRUD
  const addFlashcardDeck = (deck: Omit<FlashcardDeck, 'id'>) => {
    const newDeck: FlashcardDeck = {
      ...deck,
      id: 'fd_' + Math.random().toString(36).substr(2, 9)
    };
    setFlashcardDecks(prev => [...prev, newDeck]);
    addXP(40, 'Built Flashcard Deck: ' + deck.title);
  };

  const generateFlashcardsForTopic = async (topic: string): Promise<boolean> => {
    addNotification('AI Flashcards', `Contacting Gemini to build cards for "${topic}"...`, 'reminder');
    try {
      const response = await fetch('/api/ai/generate-flashcards-topic', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ topic }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || errData.details || 'Failed to generate flashcards from backend');
      }

      const data = await response.json();
      if (data && Array.isArray(data.cards)) {
        const newDeckCards = data.cards.map((c: any) => ({
          id: 'fc_' + Math.random().toString(36).substr(2, 9),
          front: c.front || 'Question',
          back: c.back || 'Answer',
          difficulty: 'medium' as const,
          isFavorite: false,
        }));

        addFlashcardDeck({
          title: topic,
          subjectId: subjects[0]?.id || 's1',
          cards: newDeckCards,
        });

        addNotification('Deck Ready!', `Successfully compiled ${newDeckCards.length} flashcards on "${topic}"!`, 'achievement');
        return true;
      }
      return false;
    } catch (error: any) {
      console.error('Error in generateFlashcardsForTopic:', error);
      addNotification('AI Error', error.message || 'Could not connect to Gemini service. Please verify your API Key.', 'warning');
      return false;
    }
  };

  const updateFlashcardDifficulty = (deckId: string, cardId: string, difficulty: 'easy' | 'medium' | 'hard') => {
    setFlashcardDecks(prev => prev.map(deck => {
      if (deck.id === deckId) {
        return {
          ...deck,
          cards: deck.cards.map(c => c.id === cardId ? { ...c, difficulty } : c)
        };
      }
      return deck;
    }));
  };

  const toggleFlashcardFavorite = (deckId: string, cardId: string) => {
    setFlashcardDecks(prev => prev.map(deck => {
      if (deck.id === deckId) {
        return {
          ...deck,
          cards: deck.cards.map(c => c.id === cardId ? { ...c, isFavorite: !c.isFavorite } : c)
        };
      }
      return deck;
    }));
  };

  const flashcards = (flashcardDecks || []).flatMap(deck => 
    (deck.cards || []).map(c => ({
      id: c.id,
      deckId: deck.id,
      question: c.front,
      answer: c.back,
      difficulty: c.difficulty,
      isStarred: c.isFavorite,
      front: c.front,
      back: c.back,
      isFavorite: c.isFavorite
    }))
  );

  const updateFlashcard = (cardId: string, updates: Partial<{ difficulty: 'easy' | 'medium' | 'hard'; isStarred: boolean }>) => {
    setFlashcardDecks(prev => (prev || []).map(deck => {
      const hasCard = (deck.cards || []).some(c => c.id === cardId);
      if (hasCard) {
        return {
          ...deck,
          cards: (deck.cards || []).map(c => {
            if (c.id === cardId) {
              return {
                ...c,
                ...(updates.difficulty !== undefined ? { difficulty: updates.difficulty } : {}),
                ...(updates.isStarred !== undefined ? { isFavorite: updates.isStarred } : {})
              };
            }
            return c;
          })
        };
      }
      return deck;
    }));
  };

  // Quiz Scores
  const recordQuizScore = (quizId: string, score: number) => {
    setQuizzes(prev => prev.map(q => {
      if (q.id === quizId) {
        const topScore = Math.max(q.highScore || 0, score);
        addXP(score * 5, `Scored ${score}% on Quiz: ${q.title}`);
        return { ...q, highScore: topScore };
      }
      return q;
    }));
    addNotification('Quiz Completed!', `Completed ${quizzes.find(q => q.id === quizId)?.title} with score ${score}%!`, 'achievement');
  };

  // Resume Builder Data
  const updateResumeData = (updates: Partial<ResumeData>) => {
    setResumeData(prev => ({ ...prev, ...updates }));
  };

  // Global Multi-Model Search Indexer
  const setSearchQueryAndFilter = (q: string) => {
    setSearchQuery(q);
  };

  const triggerGlobalSearch = () => {
    const q = searchQuery.toLowerCase();
    if (!q.trim()) return { tasks: [], notes: [], chats: [], assignments: [] };
    
    const matchedTasks = tasks.filter(t => t.title.toLowerCase().includes(q));
    const matchedNotes = notes.filter(n => n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q));
    const matchedChats = chats.filter(c => c.title.toLowerCase().includes(q) || c.messages.some(m => m.content.toLowerCase().includes(q)));
    const matchedAssignments = assignments.filter(a => a.title.toLowerCase().includes(q));

    return {
      tasks: matchedTasks,
      notes: matchedNotes,
      chats: matchedChats,
      assignments: matchedAssignments
    };
  };

  // ==========================================
  // SERVER SIDE AI SERVICE ENDPOINT AGENTS
  // ==========================================

  // 1. Dashboard AI suggestion queryer
  const getDashboardSuggestions = async () => {
    setAiSuggestionLoading(true);
    try {
      const activeTasksStr = tasks.filter(t => t.status !== 'completed').map(t => `- [${t.priority.toUpperCase()}] ${t.title} (Deadline: ${t.deadline})`).join('\n');
      const assignmentsStr = assignments.filter(a => a.status !== 'submitted').map(a => `- ${a.title} due on ${a.dueDate}`).join('\n');
      
      const response = await fetch('/api/ai/suggest-dashboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tasks: activeTasksStr,
          assignments: assignmentsStr,
          streak: user?.streak || 0,
          xp: user?.xp || 0
        })
      });

      if (!response.ok) throw new Error('Failed to query dashboard advisor');
      const data = await response.json();
      if (data.suggestion) {
        setAiDashboardSuggestion(data.suggestion);
        addNotification('AI Tip Updated', 'StudentOS AI has rearranged your recommendations based on workload pressure.', 'reminder');
      }
    } catch (err) {
      console.error('Error fetching AI suggestions:', err);
    } finally {
      setAiSuggestionLoading(false);
    }
  };

  // 2. Gemini-driven Task Schedule Rearranger
  const aiRearrangeTasks = async () => {
    try {
      addNotification('AI Reordering Schedule', 'StudentOS is reorganizing your active items...', 'reminder');
      const activeTasks = tasks.filter(t => t.status !== 'completed');
      if (activeTasks.length === 0) return;

      const response = await fetch('/api/ai/rearrange-tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tasks: activeTasks, courses: subjects })
      });

      if (!response.ok) throw new Error('Failed schedule rearrangement');
      const data = await response.json();
      
      if (data.rearrangedTasks && Array.isArray(data.rearrangedTasks)) {
        // Map back IDs and update values
        const rearrangedMap = new Map(data.rearrangedTasks.map((rt: any) => [rt.id, rt]));
        
        setTasks(prev => {
          const updated = prev.map(t => {
            const rt = rearrangedMap.get(t.id) as any;
            if (rt) {
              return {
                ...t,
                priority: rt.priority || t.priority,
                bestStudyTime: rt.bestStudyTime || 'Suggested: Evening',
                aiPriorityReason: rt.aiPriorityReason || 'Optimized for deadline urgency.'
              };
            }
            return t;
          });
          return updated;
        });
        
        addXP(60, 'AI Timetable Optimization complete');
        addNotification('Schedule Optimized!', 'Google Gemini successfully re-allocated task priority levels.', 'achievement');
      }
    } catch (err) {
      console.error('Error in task re-ordering:', err);
    }
  };

  // 3. Doubt Solving Conversational Agent
  const sendMessageToChat = async (chatId: string, text: string, image?: string, pdfName?: string, pdfBase64?: string) => {
    // Add User Message First
    const userMsg = {
      sender: 'user' as const,
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      image,
      pdfName
    };

    setChats(prev => prev.map(c => {
      if (c.id === chatId) {
        return { ...c, messages: [...c.messages, userMsg] };
      }
      return c;
    }));

    // Add immediate empty AI pending message to show loading state
    const loadingAiMsg = {
      sender: 'ai' as const,
      content: 'Thinking...',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChats(prev => prev.map(c => {
      if (c.id === chatId) {
        return { ...c, messages: [...c.messages, loadingAiMsg] };
      }
      return c;
    }));

    try {
      const chatObj = chats.find(c => c.id === chatId);
      const chatHistory = chatObj ? chatObj.messages.map(m => ({
        role: m.sender === 'user' ? 'user' : 'model',
        text: m.content
      })) : [];

      const response = await fetch('/api/ai/doubt-solve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: text,
          history: chatHistory,
          image,
          pdfName,
          pdfBase64
        })
      });

      if (!response.ok) throw new Error('Doubt solver error');
      const data = await response.json();
      
      setChats(prev => prev.map(c => {
        if (c.id === chatId) {
          // Remove the "Thinking..." loader and set real answer
          const updatedMsgs = c.messages.filter(m => m.content !== 'Thinking...');
          return {
            ...c,
            title: c.title === 'New Doubt Solving Session' ? text.substring(0, 32) + '...' : c.title,
            messages: [...updatedMsgs, {
              sender: 'ai',
              content: data.answer || 'Apologies, I was unable to compile the explanation. Please retry.',
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }]
          };
        }
        return c;
      }));
      addXP(15, 'Solved doubt with AI Solver');
    } catch (err) {
      console.error(err);
      setChats(prev => prev.map(c => {
        if (c.id === chatId) {
          const updatedMsgs = c.messages.filter(m => m.content !== 'Thinking...');
          return {
            ...c,
            messages: [...updatedMsgs, {
              sender: 'ai',
              content: 'Failed to connect to the doubt solver service. Please verify your connection or Gemini API key setting.',
              timestamp: new Date().toLocaleTimeString()
            }]
          };
        }
        return c;
      }));
    }
  };

  // 4. Note Summaries, Flashcards & Quiz Generator
  const generateAINoteFeatures = async (id: string, type: 'summary' | 'flashcards' | 'quiz' | 'explain' | 'simplify') => {
    addNotification('AI Notes Extraction', 'Gemini is processing your request. Please wait...', 'reminder');
    const note = notes.find(n => n.id === id);
    if (!note) return;

    try {
      const response = await fetch('/api/ai/process-note', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          noteTitle: note.title,
          noteContent: note.content,
          type
        })
      });

      if (!response.ok) throw new Error('Note extraction failed');
      const data = await response.json();

      if (type === 'summary') {
        updateNote(id, {
          summary: data.summary,
          keyPoints: data.keyPoints || []
        });
        addXP(30, 'Generated Note Summary');
      } else if (type === 'flashcards' && data.flashcards) {
        const newDeck: FlashcardDeck = {
          id: 'fd_' + Math.random().toString(36).substr(2, 9),
          title: `Flashcards from "${note.title}"`,
          subjectId: note.subjectId,
          cards: data.flashcards.map((fc: any, i: number) => ({
            id: 'fc_ai_' + i + '_' + Math.random().toString(36).substr(2, 5),
            front: fc.question,
            back: fc.answer,
            difficulty: 'medium',
            isFavorite: false
          }))
        };
        setFlashcardDecks(prev => [newDeck, ...prev]);
        addXP(50, 'AI flashcards compile complete');
        addNotification('Deck Generated!', `Generated ${newDeck.cards.length} cards from "${note.title}".`, 'achievement');
      } else if (type === 'quiz' && data.quiz) {
        const newQuiz: Quiz = {
          id: 'q_' + Math.random().toString(36).substr(2, 9),
          title: `AI MCQ Quiz: ${note.title}`,
          subjectId: note.subjectId,
          questions: data.quiz.map((q: any, i: number) => ({
            id: 'qq_ai_' + i + '_' + Math.random().toString(36).substr(2, 5),
            type: q.type || 'mcq',
            question: q.question,
            options: q.options,
            correctAnswer: q.correctAnswer,
            explanation: q.explanation
          }))
        };
        setQuizzes(prev => [newQuiz, ...prev]);
        addXP(50, 'AI quiz compiled successfully');
        addNotification('Quiz Generated!', `Custom quiz for "${note.title}" is ready. Try it now under the Quiz tab.`, 'achievement');
      } else if (type === 'explain' || type === 'simplify') {
        updateNote(id, {
          content: note.content + `\n\n---\n### AI ${type === 'explain' ? 'Detailed Explanation' : 'Simplified Concept'}\n` + (data.explanation || data.content)
        });
        addXP(25, 'Expanded concept explanation');
      }
    } catch (err) {
      console.error(err);
      addNotification('AI Error', 'Unable to complete note analysis at this moment.', 'warning');
    }
  };

  // 5. Intelligent Study Timetable Generator
  const generateAIStudyPlan = async (selectedSubjects: string[], examDates: Record<string, string>, difficulty: string, hours: number) => {
    addNotification('Study Planner', 'Gemini is drafting a customized revision calendar for you...', 'reminder');
    try {
      const response = await fetch('/api/ai/generate-studyplan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subjects: selectedSubjects, examDates, difficulty, dailyHours: hours })
      });

      if (!response.ok) throw new Error('AI Planner failed');
      const data = await response.json();

      if (data.plan) {
        const newPlan: StudyPlan = {
          id: 'sp_' + Math.random().toString(36).substr(2, 9),
          title: `${difficulty.toUpperCase()} Study Plan (${hours}h/day)`,
          startDate: new Date().toISOString().split('T')[0],
          endDate: new Date(Date.now() + 3600000 * 24 * 7).toISOString().split('T')[0],
          dailyHours: hours,
          timetable: data.plan
        };
        setStudyPlans(prev => [newPlan, ...prev]);
        setActiveStudyPlan(newPlan);
        addXP(80, 'Created a study timetable with Gemini');
        addNotification('Study Plan Active!', 'Successfully customized your Pomodoro and goals timetable!', 'achievement');
      }
    } catch (err) {
      console.error(err);
      addNotification('AI Planner Error', 'Failed to generate timetable slots.', 'warning');
    }
  };

  // 6. Resume Analyzer Agent
  const evaluateResumeAI = async () => {
    addNotification('ATS Reviewer', 'Gemini is assessing your achievements and structure...', 'reminder');
    try {
      const response = await fetch('/api/ai/evaluate-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resume: resumeData })
      });

      if (!response.ok) throw new Error('Resume review failed');
      const data = await response.json();

      if (data.evaluation) {
        setResumeAIEvaluation({
          score: data.evaluation.score || 70,
          feedback: data.evaluation.feedback || 'Excellent starting base. Needs action verbs.',
          suggestions: data.evaluation.suggestions || []
        });
        addXP(60, 'ATS Resume evaluation complete');
        addNotification('Resume Score Ready', `ATS Grade evaluated: ${data.evaluation.score}%!`, 'achievement');
      }
    } catch (err) {
      console.error(err);
      addNotification('Evaluation Error', 'Could not access ATS Evaluator.', 'warning');
    }
  };

  return (
    <AppContext.Provider value={{
      user,
      isLoadingAuth,
      login,
      signup,
      logout,
      updateProfile,
      loginWithGoogle,
      token,
      activeTab,
      setActiveTab,
      subjects,
      addSubject,
      tasks,
      addTask,
      updateTask,
      deleteTask,
      reorderTasks,
      aiRearrangeTasks,
      notes,
      addNote,
      updateNote,
      deleteNote,
      generateAINoteFeatures,
      chats,
      activeChatId,
      setActiveChatId,
      createNewChat,
      sendMessageToChat,
      deleteChat,
      studyPlans,
      activeStudyPlan,
      generateAIStudyPlan,
      timetable,
      addTimetableEvent,
      deleteTimetableEvent,
      assignments,
      addAssignment,
      updateAssignment,
      deleteAssignment,
      attendance,
      recordAttendance,
      updateAttendanceTarget,
      flashcardDecks,
      addFlashcardDeck,
      generateFlashcardsForTopic,
      updateFlashcardDifficulty,
      toggleFlashcardFavorite,
      flashcards,
      updateFlashcard,
      quizzes,
      recordQuizScore,
      resumeData,
      updateResumeData,
      resumeAIEvaluation,
      evaluateResumeAI,
      addXP,
      notifications,
      addNotification,
      clearNotification,
      searchQuery,
      setSearchQuery: setSearchQueryAndFilter,
      triggerGlobalSearch,
      aiDashboardSuggestion,
      aiSuggestionLoading,
      getDashboardSuggestions
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used inside an AppProvider');
  return context;
};
