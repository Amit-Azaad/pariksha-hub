import { prisma } from "./prisma.server";
import type { GuestProgress, QuizAttempt, QuestionAttempt } from "./types";

// Generate unique guest ID
export function generateGuestId(): string {
  return `guest_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

// Save guest quiz progress to database
export async function saveGuestProgress(
  guestId: string,
  quizId: number,
  answers: Record<number, string>,
  timeSpent: Record<number, number>,
  totalPoints: number
): Promise<QuizAttempt> {
  // Create quiz attempt for guest
  const quizAttempt = await prisma.quizAttempt.create({
    data: {
      quizId,
      guestId,
      totalPoints,
      startedAt: new Date(),
      isCompleted: false,
    },
    include: {
      questionAttempts: true,
    },
  });

  // Create question attempts
  const questionAttempts = Object.entries(answers).map(([questionId, selectedOption]) => ({
    quizAttemptId: quizAttempt.id,
    questionId: parseInt(questionId),
    selectedOption,
    timeSpent: timeSpent[parseInt(questionId)] || 0,
    answeredAt: new Date(),
  }));

  await prisma.questionAttempt.createMany({
    data: questionAttempts,
  });

  return quizAttempt;
}

// Get guest quiz progress from database
export async function getGuestProgress(guestId: string, quizId: number): Promise<QuizAttempt | null> {
  return prisma.quizAttempt.findFirst({
    where: {
      guestId,
      quizId,
      isCompleted: false,
    },
    include: {
      questionAttempts: true,
    },
  });
}

// Complete guest quiz attempt
export async function completeGuestQuiz(
  guestId: string,
  quizId: number,
  score: number,
  timeTaken: number
): Promise<void> {
  await prisma.quizAttempt.updateMany({
    where: {
      guestId,
      quizId,
      isCompleted: false,
    },
    data: {
      score,
      timeTaken,
      completedAt: new Date(),
      isCompleted: true,
    },
  });
}

// Merge guest progress with user account
export async function mergeGuestProgress(
  guestId: string,
  userId: number
): Promise<void> {
  // Find all incomplete guest attempts
  const guestAttempts = await prisma.quizAttempt.findMany({
    where: {
      guestId,
      isCompleted: false,
    },
    include: {
      questionAttempts: true,
    },
  });

  for (const attempt of guestAttempts) {
    // Update quiz attempt to link with user
    await prisma.quizAttempt.update({
      where: { id: attempt.id },
      data: {
        userId,
        guestId: null, // Remove guest ID
      },
    });
  }
}

// Clean up old guest data (older than 30 days)
export async function cleanupOldGuestData(): Promise<void> {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // Delete old completed guest attempts
  await prisma.quizAttempt.deleteMany({
    where: {
      guestId: { not: null },
      isCompleted: true,
      startedAt: { lt: thirtyDaysAgo },
    },
  });

  // Delete old incomplete guest attempts (older than 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  await prisma.quizAttempt.deleteMany({
    where: {
      guestId: { not: null },
      isCompleted: false,
      startedAt: { lt: sevenDaysAgo },
    },
  });
}

// Get guest statistics
export async function getGuestStats(guestId: string): Promise<{
  totalQuizzes: number;
  completedQuizzes: number;
  averageScore: number;
}> {
  const attempts = await prisma.quizAttempt.findMany({
    where: { guestId },
    select: {
      isCompleted: true,
      score: true,
      totalPoints: true,
    },
  });

  const totalQuizzes = attempts.length;
  const completedQuizzes = attempts.filter(a => a.isCompleted).length;
  const completedAttempts = attempts.filter(a => a.isCompleted && a.score !== null);
  
  const averageScore = completedAttempts.length > 0
    ? completedAttempts.reduce((sum, a) => sum + (a.score! / a.totalPoints) * 100, 0) / completedAttempts.length
    : 0;

  return {
    totalQuizzes,
    completedQuizzes,
    averageScore: Math.round(averageScore * 100) / 100,
  };
}
