import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { requireUser } from "../lib/oauth.server";

// GET /api/quiz-attempts/:id - Get attempt details
export async function loader({ request, params }: LoaderFunctionArgs) {
  const { prisma } = await import("../lib/prisma.server");
  const attemptId = parseInt(params.id || "0");
  
  if (!attemptId) {
    return json({ error: "Invalid attempt ID" }, { status: 400 });
  }

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
                    translations: {
                      where: { language: "en" }
                    }
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
                translations: {
                  where: { language: "en" }
                }
              }
            }
          },
          orderBy: { answeredAt: "asc" }
        }
      }
    });

    if (!attempt) {
      return json({ error: "Attempt not found" }, { status: 404 });
    }

    return json({ attempt });
  } catch (error) {
    console.error("Error fetching attempt:", error);
    return json({ error: "Failed to fetch attempt" }, { status: 500 });
  }
}

// POST /api/quiz-attempts - Start new quiz attempt
export async function action({ request }: ActionFunctionArgs) {
  const { prisma } = await import("../lib/prisma.server");
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const formData = await request.formData();
    const quizId = parseInt(formData.get("quizId") as string);
    const guestId = formData.get("guestId") as string;
    
    // Check if quiz exists and is active
    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId, isActive: true },
      include: {
        questions: {
          include: {
            question: true
          }
        }
      }
    });

    if (!quiz) {
      return json({ error: "Quiz not found or inactive" }, { status: 404 });
    }

    // Calculate total points
    const totalPoints = quiz.questions.reduce((sum, qq) => sum + qq.points, 0);

    // Create attempt
    const attempt = await prisma.quizAttempt.create({
      data: {
        quizId,
        userId: guestId ? null : undefined, // Will be set if user is authenticated
        guestId: guestId || null,
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
                    translations: {
                      where: { language: "en" }
                    }
                  }
                }
              },
              orderBy: { order: "asc" }
            }
          }
        }
      }
    });

    return json({ attempt, message: "Quiz attempt started successfully" });
  } catch (error) {
    console.error("Error starting quiz attempt:", error);
    return json({ error: "Failed to start quiz attempt" }, { status: 500 });
  }
}

// PUT /api/quiz-attempts/:id/answer - Submit answer to question
export async function put({ request, params }: ActionFunctionArgs) {
  const attemptId = parseInt(params.id || "0");
  
  if (!attemptId) {
    return json({ error: "Invalid attempt ID" }, { status: 400 });
  }

  try {
    const formData = await request.formData();
    const questionId = parseInt(formData.get("questionId") as string);
    const selectedOption = formData.get("selectedOption") as string;
    const timeSpent = parseInt(formData.get("timeSpent") || "0");

    // Get the question to check if answer is correct
    const question = await prisma.question.findUnique({
      where: { id: questionId },
      include: {
        translations: {
          where: { language: "en" }
        }
      }
    });

    if (!question) {
      return json({ error: "Question not found" }, { status: 404 });
    }

    const isCorrect = question.translations[0]?.correctOptionKey === selectedOption;

    // Create or update question attempt
    const questionAttempt = await prisma.questionAttempt.upsert({
      where: {
        quizAttemptId_questionId: {
          quizAttemptId: attemptId,
          questionId
        }
      },
      update: {
        selectedOption,
        isCorrect,
        timeSpent,
        answeredAt: new Date()
      },
      create: {
        quizAttemptId: attemptId,
        questionId,
        selectedOption,
        isCorrect,
        timeSpent,
        answeredAt: new Date()
      }
    });

    return json({ questionAttempt, message: "Answer submitted successfully" });
  } catch (error) {
    console.error("Error submitting answer:", error);
    return json({ error: "Failed to submit answer" }, { status: 500 });
  }
}

// POST /api/quiz-attempts/:id/complete - Complete quiz attempt
export async function post({ request, params }: ActionFunctionArgs) {
  const attemptId = parseInt(params.id || "0");
  
  if (!attemptId) {
    return json({ error: "Invalid attempt ID" }, { status: 400 });
  }

  try {
    const attempt = await prisma.quizAttempt.findUnique({
      where: { id: attemptId },
      include: {
        questionAttempts: true
      }
    });

    if (!attempt) {
      return json({ error: "Attempt not found" }, { status: 404 });
    }

    // Calculate score
    const correctAnswers = attempt.questionAttempts.filter(qa => qa.isCorrect).length;
    const score = Math.round((correctAnswers / attempt.questionAttempts.length) * attempt.totalPoints);

    // Calculate time taken
    const timeTaken = Math.floor((Date.now() - attempt.startedAt.getTime()) / 1000);

    // Update attempt
    const updatedAttempt = await prisma.quizAttempt.update({
      where: { id: attemptId },
      data: {
        score,
        timeTaken,
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
                    translations: {
                      where: { language: "en" }
                    }
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
                translations: {
                  where: { language: "en" }
                }
              }
            }
          }
        }
      }
    });

    return json({ 
      attempt: updatedAttempt, 
      message: "Quiz completed successfully",
      results: {
        score,
        totalPoints: attempt.totalPoints,
        percentage: Math.round((score / attempt.totalPoints) * 100),
        timeTaken,
        correctAnswers,
        totalQuestions: attempt.questionAttempts.length
      }
    });
  } catch (error) {
    console.error("Error completing quiz:", error);
    return json({ error: "Failed to complete quiz" }, { status: 500 });
  }
}
