import { json } from "@remix-run/node";
import type { ActionFunctionArgs } from "@remix-run/node";
import { prisma } from "../lib/prisma.server";

// POST /api/quiz-attempts/:id/complete - Complete quiz attempt
export async function action({ request, params }: ActionFunctionArgs) {
  if (request.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

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
    const correctAnswers = attempt.questionAttempts.filter((qa: any) => qa.isCorrect).length;
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
      success: true,
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
    return json({ success: false, error: "Failed to complete quiz" }, { status: 500 });
  }
}
