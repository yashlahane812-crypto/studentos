import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import { requireAuth, AuthRequest } from './src/middleware/auth.ts';
import * as dbQueries from './src/db/queries.ts';

dotenv.config();

const app = express();
const PORT = 3000;

// Increase payload limit for base64 image uploads in AI Doubt Solver
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Initialize Google Gen AI lazily to avoid crashing on boot if the key is missing
let aiInstance: GoogleGenAI | null = null;
const ai = {
  get models() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not defined. Please add it to your environment variables or Settings panel.');
    }
    if (!aiInstance) {
      aiInstance = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
    }
    return aiInstance.models;
  }
};

// A simple API health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', serverTime: new Date().toISOString() });
});

// ==================================================
// 1. AI DASHBOARD ADVISOR
// ==================================================
app.post('/api/ai/suggest-dashboard', async (req, res) => {
  try {
    const { tasks, assignments, streak, xp } = req.body;
    
    const prompt = `You are the executive AI Academic Coach of StudentOS.
Here is the student's status:
- Active Study Streak: ${streak} days
- Student Gamified Level XP: ${xp} XP
- Active Tasks pending:
${tasks || 'No current tasks.'}
- Assignments pending:
${assignments || 'No pending assignments.'}

Provide a short, extremely focused, highly motivational, and practical suggestion (max 3 sentences) for what the student should focus on next or how they should schedule their morning/evening based on their workloads. Speak directly to the student. Do not use generic introductions. No markdown formatting except standard bold.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        temperature: 0.7,
      }
    });

    res.json({ suggestion: response.text?.trim() });
  } catch (error: any) {
    console.error('Error in /api/ai/suggest-dashboard:', error);
    res.status(500).json({ error: 'Failed to generate suggestions', details: error.message });
  }
});

// ==================================================
// 2. AI SMART TO-DO REARRANGER & TIMINGS
// ==================================================
app.post('/api/ai/rearrange-tasks', async (req, res) => {
  try {
    const { tasks, courses } = req.body;
    
    const prompt = `You are the StudentOS Scheduler Agent. 
Take the following active academic tasks and subjects, and automatically optimize their priority ordering, suggest the best study hour windows, and provide a clear, one-sentence logical academic reason for the priority.

Subjects:
${JSON.stringify(courses)}

Tasks:
${JSON.stringify(tasks)}

Optimize the tasks. You must return your response in strict JSON array format matching this structure:
[
  {
    "id": "original_task_id",
    "priority": "high" | "medium" | "low",
    "bestStudyTime": "e.g., 9:00 AM - 11:30 AM",
    "aiPriorityReason": "Academic priority logic based on deadlines and subject complexity."
  }
]
Return ONLY a valid JSON array. Do not include markdown wraps or anything other than pure JSON.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              priority: { type: Type.STRING },
              bestStudyTime: { type: Type.STRING },
              aiPriorityReason: { type: Type.STRING }
            },
            required: ['id', 'priority', 'bestStudyTime', 'aiPriorityReason']
          }
        }
      }
    });

    const text = response.text?.trim() || '[]';
    res.json({ rearrangedTasks: JSON.parse(text) });
  } catch (error: any) {
    console.error('Error in /api/ai/rearrange-tasks:', error);
    res.status(500).json({ error: 'Failed to rearrange schedule', details: error.message });
  }
});

// ==================================================
// 2B. AI FLASHCARDS FROM TOPIC GENERATOR
// ==================================================
app.post('/api/ai/generate-flashcards-topic', async (req, res) => {
  try {
    const { topic } = req.body;
    if (!topic) {
      return res.status(400).json({ error: 'Topic is required' });
    }

    const prompt = `Generate exactly 6 premium conceptual flashcards on the following academic topic: "${topic}".
Include core terms, definitions, key formulas, or important facts.
Respond with a single JSON object containing a "cards" array. Each card MUST have "front" (the question or term) and "back" (the answer, formula, or definition).`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            cards: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  front: { type: Type.STRING },
                  back: { type: Type.STRING }
                },
                required: ['front', 'back']
              }
            }
          },
          required: ['cards']
        }
      }
    });

    const text = response.text?.trim() || '{"cards":[]}';
    res.json(JSON.parse(text));
  } catch (error: any) {
    console.error('Error generating flashcards for topic:', error);
    res.status(500).json({ error: 'Failed to generate flashcards from topic', details: error.message });
  }
});

// ==================================================
// 3. AI NOTES FEATURE GENERATOR (Summary, MCQs, Flashcards)
// ==================================================
app.post('/api/ai/process-note', async (req, res) => {
  try {
    const { noteTitle, noteContent, type } = req.body;

    let systemPrompt = '';
    let responseSchema: any = null;

    if (type === 'summary') {
      systemPrompt = `You are an expert academic summarizer. Summarize the following lecture note titled "${noteTitle}". Create a high-level concise paragraphs summary, and generate exactly 5 key high-impact key points. Respond in JSON.`;
      responseSchema = {
        type: Type.OBJECT,
        properties: {
          summary: { type: Type.STRING },
          keyPoints: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        },
        required: ['summary', 'keyPoints']
      };
    } else if (type === 'flashcards') {
      systemPrompt = `Generate a set of exactly 4-6 high-quality question-and-answer study flashcards from the note text below. Target core conceptual understandings, equations, or definitions. Respond in JSON.`;
      responseSchema = {
        type: Type.OBJECT,
        properties: {
          flashcards: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING },
                answer: { type: Type.STRING }
              },
              required: ['question', 'answer']
            }
          }
        },
        required: ['flashcards']
      };
    } else if (type === 'quiz') {
      systemPrompt = `Generate a rigorous academic quiz of exactly 3 questions based on the notes content. Create a mix of MCQs, True-False, and Short Answer questions. Include standard choices for MCQs, the exact correct string answer, and a concise explanation. Respond in JSON.`;
      responseSchema = {
        type: Type.OBJECT,
        properties: {
          quiz: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                type: { type: Type.STRING, description: "Must be 'mcq', 'true-false', or 'short'" },
                question: { type: Type.STRING },
                options: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "List of options if type is 'mcq', otherwise empty array"
                },
                correctAnswer: { type: Type.STRING },
                explanation: { type: Type.STRING }
              },
              required: ['type', 'question', 'correctAnswer', 'explanation']
            }
          }
        },
        required: ['quiz']
      };
    } else if (type === 'explain' || type === 'simplify') {
      systemPrompt = `You are a legendary professor. Take the content of the note and provide a ${type === 'explain' ? 'detailed, comprehensive explanation' : 'simplified, ELI5 explanation with analogies'} of the core concepts in high-impact markdown format.`;
      // We will output markdown text directly for explain/simplify
    }

    if (type === 'explain' || type === 'simplify') {
      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: `Lecture Note Title: ${noteTitle}\nNote Content:\n${noteContent}\n\n${systemPrompt}`,
        config: {
          temperature: 0.6,
        }
      });
      res.json({ explanation: response.text?.trim() });
    } else {
      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: `Lecture Note Title: ${noteTitle}\nNote Content:\n${noteContent}\n\n${systemPrompt}`,
        config: {
          responseMimeType: 'application/json',
          responseSchema,
          temperature: 0.5,
        }
      });
      const text = response.text?.trim() || '{}';
      res.json(JSON.parse(text));
    }
  } catch (error: any) {
    console.error('Error in /api/ai/process-note:', error);
    res.status(500).json({ error: 'Failed to process notes features', details: error.message });
  }
});

// ==================================================
// 4. AI STUDY PLANNER GENERATOR
// ==================================================
app.post('/api/ai/generate-studyplan', async (req, res) => {
  try {
    const { subjects, examDates, difficulty, dailyHours } = req.body;

    const prompt = `You are the StudentOS Curriculum Architect. 
Design a complete, highly structured 7-day study planner for a student preparing for examinations in:
Subjects to cover: ${JSON.stringify(subjects)}
Exam Schedules: ${JSON.stringify(examDates)}
User Preferred Difficulty Mode: ${difficulty}
Daily available study time allocation: ${dailyHours} hours

Generate a daily routine for each day of the week (Monday through Sunday). For each day, outline specific revision goals, subject priorities, and the recommended number of 25-minute Pomodoro focus blocks to use.

Respond in strict JSON format matching this schema:
[
  {
    "day": "Monday",
    "goals": ["Goal 1", "Goal 2"],
    "pomodoros": 4
  }
]`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              day: { type: Type.STRING },
              goals: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
              pomodoros: { type: Type.INTEGER }
            },
            required: ['day', 'goals', 'pomodoros']
          }
        },
        temperature: 0.6,
      }
    });

    const text = response.text?.trim() || '[]';
    res.json({ plan: JSON.parse(text) });
  } catch (error: any) {
    console.error('Error in /api/ai/generate-studyplan:', error);
    res.status(500).json({ error: 'Failed to construct study plan', details: error.message });
  }
});

// ==================================================
// 5. AI RESUME BUILDER & ATS GRADE ANALYSIS
// ==================================================
app.post('/api/ai/evaluate-resume', async (req, res) => {
  try {
    const { resume } = req.body;

    const prompt = `You are a Professional Tech Recruiter and ATS parsing algorithm.
Review this student resume data for a CS/Engineering position and provide a harsh, constructive critique, a calibrated ATS Match score (0 to 100), and exactly 4 actionable suggestions to raise their hireability score.

Resume Data:
${JSON.stringify(resume)}

Respond in strict JSON format matching this schema:
{
  "score": 85,
  "feedback": "Overall strong, but projects lack statistical achievements or metrics.",
  "suggestions": [
    "Quantify your experience. Instead of 'assisted in building', use 'Designed React UI dashboard used by 120+ active engineers, reducing page load latency by 25%'.",
    "Add more specific libraries to skills, e.g., Tailwind CSS, Express, Jest, PyTorch.",
    "Remove unneeded personal headers and replace with a direct GitHub/LinkedIn URL."
  ]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.INTEGER },
            feedback: { type: Type.STRING },
            suggestions: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ['score', 'feedback', 'suggestions']
        },
        temperature: 0.5,
      }
    });

    const text = response.text?.trim() || '{}';
    res.json({ evaluation: JSON.parse(text) });
  } catch (error: any) {
    console.error('Error in /api/ai/evaluate-resume:', error);
    res.status(500).json({ error: 'Failed to evaluate resume', details: error.message });
  }
});

// ==================================================
// 6. AI DOUBT SOLVER (Multimodal text, image, and note upload)
// ==================================================
app.post('/api/ai/doubt-solve', async (req, res) => {
  try {
    const { prompt, history, image, pdfName, pdfBase64 } = req.body;

    // Compile historical chat into standard format
    const contents: any[] = [];
    
    if (history && Array.isArray(history)) {
      history.slice(-10).forEach((h: any) => {
        contents.push({
          role: h.role === 'user' ? 'user' : 'model',
          parts: [{ text: h.text }]
        });
      });
    }

    // Add current query parts
    const currentParts: any[] = [];
    
    if (image) {
      // Decode image base64
      const base64Data = image.split(',')[1] || image;
      const mimeType = image.split(';')[0]?.split(':')[1] || 'image/png';
      
      currentParts.push({
        inlineData: {
          data: base64Data,
          mimeType: mimeType
        }
      });
    }

    if (pdfBase64) {
      // Decode pdf base64
      const base64Data = pdfBase64.split(',')[1] || pdfBase64;
      currentParts.push({
        inlineData: {
          data: base64Data,
          mimeType: 'application/pdf'
        }
      });
    }

    let finalPrompt = '';
    if (pdfName) {
      finalPrompt += `[Source Material Grounding: ${pdfName}]\n`;
    }
    finalPrompt += prompt;
    
    currentParts.push({ text: finalPrompt });

    // Append current turn
    contents.push({
      role: 'user',
      parts: currentParts
    });

    const systemInstruction = `You are "Socrates-OS", the world's most supportive, brilliant academic tutor built into StudentOS. 
- You provide comprehensive, clean, beautifully structured step-by-step solutions.
- If solving a math problem, write clear steps.
- If writing computer science code, provide complete functional scripts, comments, explain time complexity, and use Markdown syntax highlighting.
- Be encouraging, and reference uploaded diagrams or sheets if present.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: contents,
      config: {
        systemInstruction,
        temperature: 0.7,
      }
    });

    res.json({ answer: response.text });
  } catch (error: any) {
    console.error('Error in /api/ai/doubt-solve:', error);
    res.status(500).json({ error: 'Error processing doubt solver request', details: error.message });
  }
});

// ==================================================
// 7. TOPIC FLASHCARD GENERATOR
// ==================================================
app.post('/api/ai/generate-flashcards-topic', async (req, res) => {
  try {
    const { topic } = req.body;
    
    const systemPrompt = `Generate a set of exactly 5 high-quality conceptual study flashcards (question and answer) for the academic topic: "${topic}". Respond in JSON with cards array of front/back objects.`;
    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        cards: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              front: { type: Type.STRING },
              back: { type: Type.STRING }
            },
            required: ['front', 'back']
          }
        }
      },
      required: ['cards']
    };

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: systemPrompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema,
        temperature: 0.6,
      }
    });

    const text = response.text?.trim() || '{}';
    res.json(JSON.parse(text));
  } catch (error: any) {
    console.error('Error in /api/ai/generate-flashcards-topic:', error);
    res.status(500).json({ error: 'Failed to generate topic flashcards', details: error.message });
  }
});

// ==================================================
// SUPABASE / POSTGRES DATABASE SYNCHRONIZATION ENDPOINTS (FIREBASE AUTH SECURED)
// ==================================================

// 1. User Profile Sync
app.post('/api/user/sync', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { email, name, picture } = req.user;
    const profile = await dbQueries.getOrCreateUser(req.user.uid, email || '', name || '', picture || '');
    res.json(profile);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/user/profile', requireAuth, async (req: AuthRequest, res) => {
  try {
    const profile = await dbQueries.getUserProfile(req.user.uid);
    if (!profile) {
      return res.status(404).json({ error: 'User profile not found.' });
    }
    res.json(profile);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/user/profile/update', requireAuth, async (req: AuthRequest, res) => {
  try {
    const profile = await dbQueries.updateUserProfile(req.user.uid, req.body);
    res.json(profile);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 2. Subjects CRUD
app.get('/api/subjects', requireAuth, async (req: AuthRequest, res) => {
  try {
    const list = await dbQueries.getSubjects(req.user.uid);
    res.json(list);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/subjects', requireAuth, async (req: AuthRequest, res) => {
  try {
    const item = await dbQueries.createSubject(req.user.uid, req.body);
    res.json(item);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/subjects/:id', requireAuth, async (req: AuthRequest, res) => {
  try {
    await dbQueries.deleteSubject(req.user.uid, req.params.id);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 3. Notes CRUD
app.get('/api/notes', requireAuth, async (req: AuthRequest, res) => {
  try {
    const list = await dbQueries.getNotes(req.user.uid);
    res.json(list);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/notes', requireAuth, async (req: AuthRequest, res) => {
  try {
    const item = await dbQueries.createNote(req.user.uid, req.body);
    res.json(item);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/notes/:id', requireAuth, async (req: AuthRequest, res) => {
  try {
    await dbQueries.deleteNote(req.user.uid, req.params.id);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 4. Tasks CRUD
app.get('/api/tasks', requireAuth, async (req: AuthRequest, res) => {
  try {
    const list = await dbQueries.getTasks(req.user.uid);
    res.json(list);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/tasks', requireAuth, async (req: AuthRequest, res) => {
  try {
    const item = await dbQueries.createTask(req.user.uid, req.body);
    res.json(item);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/tasks/:id', requireAuth, async (req: AuthRequest, res) => {
  try {
    await dbQueries.deleteTask(req.user.uid, req.params.id);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 5. Doubt Chats
app.get('/api/doubt-chats', requireAuth, async (req: AuthRequest, res) => {
  try {
    const list = await dbQueries.getDoubtChats(req.user.uid);
    res.json(list);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/doubt-chats', requireAuth, async (req: AuthRequest, res) => {
  try {
    const item = await dbQueries.createDoubtChat(req.user.uid, req.body);
    res.json(item);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 6. Flashcard Decks
app.get('/api/flashcards', requireAuth, async (req: AuthRequest, res) => {
  try {
    const list = await dbQueries.getFlashcardDecks(req.user.uid);
    res.json(list);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/flashcards', requireAuth, async (req: AuthRequest, res) => {
  try {
    const item = await dbQueries.createFlashcardDeck(req.user.uid, req.body);
    res.json(item);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// 7. Quizzes
app.get('/api/quizzes', requireAuth, async (req: AuthRequest, res) => {
  try {
    const list = await dbQueries.getQuizzes(req.user.uid);
    res.json(list);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/quizzes', requireAuth, async (req: AuthRequest, res) => {
  try {
    const item = await dbQueries.createQuiz(req.user.uid, req.body);
    res.json(item);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ==================================================
// SERVING & MIDDLEWARE CONFIG (DEVELOPMENT VS PRODUCTION)
// ==================================================
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[StudentOS Backend] Server booted successfully on host 0.0.0.0 port ${PORT}`);
  });
}

startServer();
