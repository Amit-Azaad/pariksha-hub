import { prisma } from "./prisma.server";
import type { User } from "./types";

export interface QuizStartData {
  quizId: number;
  userId?: number;
  guestId?: string;
}

export interface AnswerSubmission {
  attemptId: number;
  questionId: number;
  selectedOption: string;
  timeSpent: number;
}

export interface QuizCompletion {
  attemptId: number;
  score: number;
  timeTaken: number;
}

// Start a new quiz attempt
export async function startQuizAttempt(data: QuizStartData) {
  try {
    // Verify quiz exists and is active
    const quiz = await prisma.quiz.findUnique({
      where: { id: data.quizId, isActive: true },
      include: {
        questions: {
          include: {
            question: true
          },
          orderBy: { order: "asc" }
        }
      }
    });

    if (!quiz) {
      throw new Error("Quiz not found or inactive");
    }

    // Calculate total points
    const totalPoints = quiz.questions.reduce((sum, qq) => sum + qq.points, 0);

    // Create the attempt
    const attempt = await prisma.quizAttempt.create({
      data: {
        quizId: data.quizId,
        userId: data.userId || null,
        guestId: data.guestId || null,
        totalPoints,
        startedAt: new Date()
      },
      include: {
        quiz: {
          include: {
            questions: {
              include: {
                question: {
                  include: {
                    translations: true,
                    tags: true
                  }
                }
              },
              orderBy: { order: "asc" }
            }
          }
        }
      }
    });

    return { success: true, attempt };
  } catch (error) {
    console.error("Error starting quiz attempt:", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

// Submit an answer to a question
export async function submitAnswer(data: AnswerSubmission) {
  try {
    // Get the question to check if answer is correct
    const question = await prisma.question.findUnique({
      where: { id: data.questionId },
      include: {
        translations: {
          where: { language: "en" }
        }
      }
    });

    if (!question) {
      throw new Error("Question not found");
    }

    const isCorrect = question.translations[0]?.correctOptionKey === data.selectedOption;

    // Create question attempt
    const questionAttempt = await prisma.questionAttempt.create({
      data: {
        quizAttemptId: data.attemptId,
        questionId: data.questionId,
        selectedOption: data.selectedOption,
        isCorrect,
        timeSpent: data.timeSpent,
        answeredAt: new Date()
      }
    });

    return { success: true, questionAttempt };
  } catch (error) {
    console.error("Error submitting answer:", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

// Complete a quiz attempt
export async function completeQuizAttempt(data: QuizCompletion) {
  try {
    const attempt = await prisma.quizAttempt.findUnique({
      where: { id: data.attemptId },
      include: {
        questionAttempts: true
      }
    });

    if (!attempt) {
      throw new Error("Attempt not found");
    }

    if (attempt.isCompleted) {
      throw new Error("Attempt already completed");
    }

    // Calculate score
    const correctAnswers = attempt.questionAttempts.filter(qa => qa.isCorrect).length;
    const score = Math.round((correctAnswers / attempt.questionAttempts.length) * attempt.totalPoints);

    // Update attempt
    const updatedAttempt = await prisma.quizAttempt.update({
      where: { id: data.attemptId },
      data: {
        score,
        timeTaken: data.timeTaken,
        completedAt: new Date(),
        isCompleted: true
      },
      include: {
        quiz: {
          include: {
            questions: {
              include: {
                question: {
                  include: {
                    translations: true,
                    tags: true
                  }
                }
              }
            }
          }
        },
        questionAttempts: {
          include: {
            question: {
              include: {
                translations: true,
                tags: true
              }
            }
          }
        }
      }
    });

    const results = {
      score,
      totalPoints: attempt.totalPoints,
      percentage: Math.round((score / attempt.totalPoints) * 100),
      timeTaken: data.timeTaken,
      correctAnswers,
      totalQuestions: attempt.questionAttempts.length
    };

    return { success: true, attempt: updatedAttempt, results };
  } catch (error) {
    console.error("Error completing quiz attempt:", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

// Get quiz attempt details
export async function getQuizAttempt(attemptId: number) {
  try {
    const attempt = await prisma.quizAttempt.findUnique({
      where: { id: attemptId },
      include: {
        quiz: {
          include: {
            questions: {
              include: {
                question: {
                  include: {
                    translations: true,
                    tags: true
                  }
                }
              },
              orderBy: { order: "asc" }
            }
          }
        },
        questionAttempts: {
          include: {
            question: {
              include: {
                translations: true,
                tags: true
              }
            }
          },
          orderBy: { answeredAt: "asc" }
        }
      }
    });

    if (!attempt) {
      throw new Error("Attempt not found");
    }

    return { success: true, attempt };
  } catch (error) {
    console.error("Error fetching quiz attempt:", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

// Get available quizzes
export async function getAvailableQuizzes(filters?: {
  type?: string;
  category?: string;
  difficulty?: string;
  page?: number;
  limit?: number;
}) {
  try {
    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const offset = (page - 1) * limit;

    const where: any = { isActive: true, isPublic: true };
    
    if (filters?.type) where.type = filters.type;
    if (filters?.category) where.category = filters.category;

    const [quizzes, total] = await Promise.all([
      prisma.quiz.findMany({
        where,
        include: {
          creator: {
            select: { name: true, email: true }
          },
          _count: {
            select: { questions: true, attempts: true }
          }
        },
        skip: offset,
        take: limit,
        orderBy: { createdAt: "desc" }
      }),
      prisma.quiz.count({ where })
    ]);

    return {
      success: true,
      quizzes,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    console.error("Error fetching quizzes:", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

// Merge guest progress with user account
export async function mergeGuestProgress(guestId: string, user: User) {
  try {
    // Find all guest attempts
    const guestAttempts = await prisma.quizAttempt.findMany({
      where: { guestId, userId: null },
      include: {
        questionAttempts: true
      }
    });

    if (guestAttempts.length === 0) {
      return { success: true, message: "No guest progress to merge" };
    }

    // Update all guest attempts to link to the user
    const updatedAttempts = await Promise.all(
      guestAttempts.map(attempt =>
        prisma.quizAttempt.update({
          where: { id: attempt.id },
          data: { userId: user.id, guestId: null }
        })
      )
    );

    return {
      success: true,
      message: `Merged ${updatedAttempts.length} quiz attempts`,
      attempts: updatedAttempts
    };
  } catch (error) {
    console.error("Error merging guest progress:", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}
