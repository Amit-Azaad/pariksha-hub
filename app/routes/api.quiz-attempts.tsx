import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { prisma } from "../lib/prisma.server";

// GET /api/quiz-attempts/:id - Get attempt details
export async function loader({ request, params }: LoaderFunctionArgs) {
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
      return json({ success: false, error: "Quiz not found or inactive" }, { status: 404 });
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

    return json({ success: true, attempt, message: "Quiz attempt started successfully" });
  } catch (error) {
    console.error("Error starting quiz attempt:", error);
    return json({ success: false, error: "Failed to start quiz attempt" }, { status: 500 });
  }
}

// Note: Answer submission and quiz completion are now handled by separate routes:
// - PUT /api/quiz-attempts/:id/answer - for submitting answers
// - POST /api/quiz-attempts/:id/complete - for completing quizzes
