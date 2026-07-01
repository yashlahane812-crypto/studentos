import { pgTable, text, integer, timestamp, boolean } from 'drizzle-orm/pg-core';

// 1. Users Profile Table (Identified by Firebase Auth UID string)
export const users = pgTable('users', {
  uid: text('uid').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  avatar: text('avatar'),
  university: text('university').default(''),
  major: text('major').default(''),
  year: text('year').default(''),
  streak: integer('streak').default(0),
  xp: integer('xp').default(0),
  badgesJson: text('badges_json').default('[]'),
  createdAt: timestamp('created_at').defaultNow(),
});

// 2. Academic Subjects Table
export const subjects = pgTable('subjects', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.uid).notNull(),
  name: text('name').notNull(),
  code: text('code').notNull(),
  color: text('color').notNull(),
  professor: text('professor').default(''),
  createdAt: timestamp('created_at').defaultNow(),
});

// 3. Lecture Notes Table
export const notes = pgTable('notes', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.uid).notNull(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  subjectId: text('subject_id').notNull(),
  tagsJson: text('tags_json').default('[]'),
  isFavorite: boolean('is_favorite').default(false),
  summary: text('summary'),
  keyPointsJson: text('key_points_json').default('[]'),
  mindmapJson: text('mindmap_json'),
  type: text('type').default('text'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// 4. Tasks Table
export const tasks = pgTable('tasks', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.uid).notNull(),
  title: text('title').notNull(),
  subjectId: text('subject_id').notNull(),
  status: text('status').notNull(), // 'todo' | 'in-progress' | 'completed'
  priority: text('priority').notNull(), // 'low' | 'medium' | 'high'
  deadline: text('deadline').notNull(),
  estimatedTime: text('estimated_time').notNull(),
  bestStudyTime: text('best_study_time'),
  aiPriorityReason: text('ai_priority_reason'),
  completedAt: text('completed_at'),
  isRecurring: boolean('is_recurring').default(false),
  recurrenceRule: text('recurrence_rule'),
  createdAt: timestamp('created_at').defaultNow(),
});

// 5. AI Doubt Solver Chats Table
export const doubtChats = pgTable('doubt_chats', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.uid).notNull(),
  title: text('title').notNull(),
  messagesJson: text('messages_json').notNull(), // Stringified list of Chat Messages
  createdAt: timestamp('created_at').defaultNow(),
});

// 6. Flashcard Decks Table
export const flashcardDecks = pgTable('flashcard_decks', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.uid).notNull(),
  title: text('title').notNull(),
  subjectId: text('subject_id').notNull(),
  cardsJson: text('cards_json').notNull(), // Stringified list of cards
  createdAt: timestamp('created_at').defaultNow(),
});

// 7. Quizzes Table
export const quizzes = pgTable('quizzes', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.uid).notNull(),
  title: text('title').notNull(),
  subjectId: text('subject_id').notNull(),
  questionsJson: text('questions_json').notNull(), // Stringified quiz questions
  highScore: integer('high_score').default(0),
  createdAt: timestamp('created_at').defaultNow(),
});
