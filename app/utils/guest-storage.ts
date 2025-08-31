import type { GuestProgress } from "../lib/types";

const GUEST_ID_KEY = "pariksha_guest_id";
const GUEST_PROGRESS_KEY = "pariksha_guest_progress";

// Generate or retrieve guest ID
export function getOrCreateGuestId(): string {
  let guestId = localStorage.getItem(GUEST_ID_KEY);
  
  if (!guestId) {
    guestId = `guest_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    localStorage.setItem(GUEST_ID_KEY, guestId);
  }
  
  return guestId;
}

// Save guest progress to localStorage
export function saveGuestProgress(quizId: number, progress: Partial<GuestProgress>): void {
  const guestId = getOrCreateGuestId();
  const key = `${GUEST_PROGRESS_KEY}_${guestId}_${quizId}`;
  
  const existingProgress = getGuestProgress(quizId);
  const updatedProgress = {
    ...existingProgress,
    ...progress,
    lastActivity: new Date(),
  };
  
  localStorage.setItem(key, JSON.stringify(updatedProgress));
}

// Get guest progress from localStorage
export function getGuestProgress(quizId: number): GuestProgress | null {
  const guestId = getOrCreateGuestId();
  const key = `${GUEST_PROGRESS_KEY}_${guestId}_${quizId}`;
  
  const stored = localStorage.getItem(key);
  if (!stored) return null;
  
  try {
    const progress = JSON.parse(stored);
    return {
      ...progress,
      startedAt: new Date(progress.startedAt),
      lastActivity: new Date(progress.lastActivity),
    };
  } catch {
    return null;
  }
}

// Update guest quiz answers
export function updateGuestAnswers(quizId: number, questionId: number, answer: string): void {
  const progress = getGuestProgress(quizId);
  if (!progress) return;
  
  const updatedProgress = {
    ...progress,
    answers: {
      ...progress.answers,
      [questionId]: answer,
    },
  };
  
  saveGuestProgress(quizId, updatedProgress);
}

// Update guest time spent on question
export function updateGuestTimeSpent(quizId: number, questionId: number, timeSpent: number): void {
  const progress = getGuestProgress(quizId);
  if (!progress) return;
  
  const updatedProgress = {
    ...progress,
    timeSpent: {
      ...progress.timeSpent,
      [questionId]: timeSpent,
    },
  };
  
  saveGuestProgress(quizId, updatedProgress);
}

// Clear guest progress for a specific quiz
export function clearGuestProgress(quizId: number): void {
  const guestId = getOrCreateGuestId();
  const key = `${GUEST_PROGRESS_KEY}_${guestId}_${quizId}`;
  localStorage.removeItem(key);
}

// Get all guest progress for a user
export function getAllGuestProgress(): Record<number, GuestProgress> {
  const guestId = getOrCreateGuestId();
  const allProgress: Record<number, GuestProgress> = {};
  
  // Iterate through localStorage to find all progress for this guest
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(`${GUEST_PROGRESS_KEY}_${guestId}_`)) {
      const quizId = parseInt(key.split('_').pop() || '0');
      const progress = getGuestProgress(quizId);
      if (progress) {
        allProgress[quizId] = progress;
      }
    }
  }
  
  return allProgress;
}

// Clear all guest data (useful when user logs in)
export function clearAllGuestData(): void {
  const guestId = getOrCreateGuestId();
  
  // Remove guest ID
  localStorage.removeItem(GUEST_ID_KEY);
  
  // Remove all progress for this guest
  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(`${GUEST_PROGRESS_KEY}_${guestId}_`)) {
      keysToRemove.push(key);
    }
  }
  
  keysToRemove.forEach(key => localStorage.removeItem(key));
}

// Check if guest has progress for a quiz
export function hasGuestProgress(quizId: number): boolean {
  return getGuestProgress(quizId) !== null;
}

// Get guest progress summary
export function getGuestProgressSummary(): {
  totalQuizzes: number;
  totalQuestions: number;
  lastActivity: Date | null;
} {
  const allProgress = getAllGuestProgress();
  const totalQuizzes = Object.keys(allProgress).length;
  
  let totalQuestions = 0;
  let lastActivity: Date | null = null;
  
  Object.values(allProgress).forEach(progress => {
    totalQuestions += Object.keys(progress.answers).length;
    if (!lastActivity || progress.lastActivity > lastActivity) {
      lastActivity = progress.lastActivity;
    }
  });
  
  return {
    totalQuizzes,
    totalQuestions,
    lastActivity,
  };
}
