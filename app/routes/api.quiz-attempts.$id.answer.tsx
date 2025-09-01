import { json } from "@remix-run/node";
import type { ActionFunctionArgs } from "@remix-run/node";
import { prisma } from "../lib/prisma.server";

// PUT /api/quiz-attempts/:id/answer - Submit answer to question
export async function action({ request, params }: ActionFunctionArgs) {
  if (request.method !== "PUT") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  const attemptId = parseInt(params.id || "0");
  
  if (!attemptId) {
    return json({ error: "Invalid attempt ID" }, { status: 400 });
  }

  try {
    const formData = await request.formData();
    const questionId = parseInt(formData.get("questionId") as string);
    const selectedOption = formData.get("selectedOption") as string;
    const timeSpent = parseInt((formData.get("timeSpent") as string) || "0");

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

    // Create question attempt
    const questionAttempt = await prisma.questionAttempt.create({
      data: {
        quizAttemptId: attemptId,
        questionId,
        selectedOption,
        isCorrect,
        timeSpent,
        answeredAt: new Date()
      }
    });

    return json({ success: true, questionAttempt, message: "Answer submitted successfully" });
  } catch (error) {
    console.error("Error submitting answer:", error);
    return json({ success: false, error: "Failed to submit answer" }, { status: 500 });
  }
}
