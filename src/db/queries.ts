import { db } from './index.ts';
import { users, subjects, notes, tasks, doubtChats, flashcardDecks, quizzes } from './schema.ts';
import { eq, and } from 'drizzle-orm';

// 1. User Queries
export async function getOrCreateUser(uid: string, email: string, name: string, avatar: string) {
  try {
    const result = await db.insert(users)
      .values({
        uid,
        email,
        name,
        avatar,
      })
      .onConflictDoUpdate({
        target: users.uid,
        set: {
          email,
          name,
          avatar,
        },
      })
      .returning();
    return result[0];
  } catch (error) {
    console.error("Database getOrCreateUser failed:", error);
    throw new Error("Failed to register or retrieve user profile.", { cause: error });
  }
}

export async function getUserProfile(uid: string) {
  try {
    const result = await db.select().from(users).where(eq(users.uid, uid));
    return result[0] || null;
  } catch (error) {
    console.error("Database getUserProfile failed:", error);
    throw new Error("Failed to fetch user profile.", { cause: error });
  }
}

export async function updateUserProfile(uid: string, fields: Partial<typeof users.$inferInsert>) {
  try {
    const result = await db.update(users)
      .set({
        ...fields,
      })
      .where(eq(users.uid, uid))
      .returning();
    return result[0];
  } catch (error) {
    console.error("Database updateUserProfile failed:", error);
    throw new Error("Failed to update user profile.", { cause: error });
  }
}

// 2. Subjects Queries
export async function getSubjects(uid: string) {
  try {
    return await db.select().from(subjects).where(eq(subjects.userId, uid));
  } catch (error) {
    console.error("Database getSubjects failed:", error);
    throw new Error("Failed to retrieve subjects.", { cause: error });
  }
}

export async function createSubject(uid: string, data: typeof subjects.$inferInsert) {
  try {
    const result = await db.insert(subjects)
      .values({
        ...data,
        userId: uid,
      })
      .onConflictDoUpdate({
        target: subjects.id,
        set: {
          name: data.name,
          code: data.code,
          color: data.color,
          professor: data.professor,
        },
      })
      .returning();
    return result[0];
  } catch (error) {
    console.error("Database createSubject failed:", error);
    throw new Error("Failed to save subject.", { cause: error });
  }
}

export async function deleteSubject(uid: string, id: string) {
  try {
    await db.delete(subjects).where(and(eq(subjects.id, id), eq(subjects.userId, uid)));
  } catch (error) {
    console.error("Database deleteSubject failed:", error);
    throw new Error("Failed to delete subject.", { cause: error });
  }
}

// 3. Notes Queries
export async function getNotes(uid: string) {
  try {
    return await db.select().from(notes).where(eq(notes.userId, uid));
  } catch (error) {
    console.error("Database getNotes failed:", error);
    throw new Error("Failed to retrieve notes.", { cause: error });
  }
}

export async function createNote(uid: string, data: typeof notes.$inferInsert) {
  try {
    const result = await db.insert(notes)
      .values({
        ...data,
        userId: uid,
      })
      .onConflictDoUpdate({
        target: notes.id,
        set: {
          title: data.title,
          content: data.content,
          subjectId: data.subjectId,
          tagsJson: data.tagsJson,
          isFavorite: data.isFavorite,
          summary: data.summary,
          keyPointsJson: data.keyPointsJson,
          mindmapJson: data.mindmapJson,
          type: data.type,
          updatedAt: new Date(),
        },
      })
      .returning();
    return result[0];
  } catch (error) {
    console.error("Database createNote failed:", error);
    throw new Error("Failed to save note.", { cause: error });
  }
}

export async function deleteNote(uid: string, id: string) {
  try {
    await db.delete(notes).where(and(eq(notes.id, id), eq(notes.userId, uid)));
  } catch (error) {
    console.error("Database deleteNote failed:", error);
    throw new Error("Failed to delete note.", { cause: error });
  }
}

// 4. Tasks Queries
export async function getTasks(uid: string) {
  try {
    return await db.select().from(tasks).where(eq(tasks.userId, uid));
  } catch (error) {
    console.error("Database getTasks failed:", error);
    throw new Error("Failed to retrieve tasks.", { cause: error });
  }
}

export async function createTask(uid: string, data: typeof tasks.$inferInsert) {
  try {
    const result = await db.insert(tasks)
      .values({
        ...data,
        userId: uid,
      })
      .onConflictDoUpdate({
        target: tasks.id,
        set: {
          title: data.title,
          subjectId: data.subjectId,
          status: data.status,
          priority: data.priority,
          deadline: data.deadline,
          estimatedTime: data.estimatedTime,
          bestStudyTime: data.bestStudyTime,
          aiPriorityReason: data.aiPriorityReason,
          completedAt: data.completedAt,
          isRecurring: data.isRecurring,
          recurrenceRule: data.recurrenceRule,
        },
      })
      .returning();
    return result[0];
  } catch (error) {
    console.error("Database createTask failed:", error);
    throw new Error("Failed to save task.", { cause: error });
  }
}

export async function deleteTask(uid: string, id: string) {
  try {
    await db.delete(tasks).where(and(eq(tasks.id, id), eq(tasks.userId, uid)));
  } catch (error) {
    console.error("Database deleteTask failed:", error);
    throw new Error("Failed to delete task.", { cause: error });
  }
}

// 5. Doubt Chats
export async function getDoubtChats(uid: string) {
  try {
    return await db.select().from(doubtChats).where(eq(doubtChats.userId, uid));
  } catch (error) {
    console.error("Database getDoubtChats failed:", error);
    throw new Error("Failed to retrieve doubt chats.", { cause: error });
  }
}

export async function createDoubtChat(uid: string, data: typeof doubtChats.$inferInsert) {
  try {
    const result = await db.insert(doubtChats)
      .values({
        ...data,
        userId: uid,
      })
      .onConflictDoUpdate({
        target: doubtChats.id,
        set: {
          title: data.title,
          messagesJson: data.messagesJson,
        },
      })
      .returning();
    return result[0];
  } catch (error) {
    console.error("Database createDoubtChat failed:", error);
    throw new Error("Failed to save doubt chat.", { cause: error });
  }
}

// 6. Flashcards Queries
export async function getFlashcardDecks(uid: string) {
  try {
    return await db.select().from(flashcardDecks).where(eq(flashcardDecks.userId, uid));
  } catch (error) {
    console.error("Database getFlashcardDecks failed:", error);
    throw new Error("Failed to retrieve flashcard decks.", { cause: error });
  }
}

export async function createFlashcardDeck(uid: string, data: typeof flashcardDecks.$inferInsert) {
  try {
    const result = await db.insert(flashcardDecks)
      .values({
        ...data,
        userId: uid,
      })
      .onConflictDoUpdate({
        target: flashcardDecks.id,
        set: {
          title: data.title,
          subjectId: data.subjectId,
          cardsJson: data.cardsJson,
        },
      })
      .returning();
    return result[0];
  } catch (error) {
    console.error("Database createFlashcardDeck failed:", error);
    throw new Error("Failed to save flashcard deck.", { cause: error });
  }
}

// 7. Quizzes Queries
export async function getQuizzes(uid: string) {
  try {
    return await db.select().from(quizzes).where(eq(quizzes.userId, uid));
  } catch (error) {
    console.error("Database getQuizzes failed:", error);
    throw new Error("Failed to retrieve quizzes.", { cause: error });
  }
}

export async function createQuiz(uid: string, data: typeof quizzes.$inferInsert) {
  try {
    const result = await db.insert(quizzes)
      .values({
        ...data,
        userId: uid,
      })
      .onConflictDoUpdate({
        target: quizzes.id,
        set: {
          title: data.title,
          subjectId: data.subjectId,
          questionsJson: data.questionsJson,
          highScore: data.highScore,
        },
      })
      .returning();
    return result[0];
  } catch (error) {
    console.error("Database createQuiz failed:", error);
    throw new Error("Failed to save quiz.", { cause: error });
  }
}
