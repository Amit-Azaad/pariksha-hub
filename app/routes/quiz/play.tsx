import type { MetaFunction, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData, useSearchParams } from "@remix-run/react";
import { useEffect, useState } from "react";
import QuizPlayer from "../../components/quiz/QuizPlayer";
import QuizResults from "../../components/quiz/QuizResults";
import { getQuizAttempt, startQuizAttempt } from "../../lib/quiz.server";
import { prisma } from "../../lib/prisma.server";
import type { QuizAttempt, Quiz } from "../../lib/types";

export const meta: MetaFunction = () => [{ title: "Quiz | Pariksha Hub" }];

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const attemptId = url.searchParams.get("attempt");
  const quizId = url.searchParams.get("quizId");
  
  if (!attemptId || !quizId) {
    return redirect("/quiz");
  }

  try {
    // For debugging, let's use the API route instead
    const result = await getQuizAttempt(parseInt(attemptId));
    
    if (!result.success) {
      console.error("getQuizAttempt failed:", result.error);
      throw new Error(result.error);
    }

    console.log("getQuizAttempt succeeded:", result.attempt);
    return json({ attempt: result.attempt });
  } catch (error) {
    console.error("Error loading quiz attempt:", error);
    return redirect("/quiz");
  }
}

export default function QuizPlayPage() {
  const data = useLoaderData<typeof loader>();
  const [searchParams] = useSearchParams();
  const [showResults, setShowResults] = useState(false);

  // Transform the JSON data back to proper types
  const attempt = data.attempt ? {
    ...data.attempt,
    startedAt: new Date(data.attempt.startedAt),
    completedAt: data.attempt.completedAt ? new Date(data.attempt.completedAt) : null,
    createdAt: new Date(data.attempt.createdAt),
    updatedAt: new Date(data.attempt.updatedAt),
    quiz: {
      ...data.attempt.quiz,
      createdAt: new Date(data.attempt.quiz.createdAt),
      updatedAt: new Date(data.attempt.quiz.updatedAt)
    }
  } as any : null;

  // Check if quiz is completed
  useEffect(() => {
    if (attempt?.isCompleted) {
      setShowResults(true);
    }
  }, [attempt?.isCompleted]);

  const handleQuizComplete = (results: any) => {
    setShowResults(true);
  };

  const handleRetake = () => {
    setShowResults(false);
    // Reset the attempt or create a new one
    window.location.reload();
  };

  if (!attempt) {
    return <div>Loading...</div>;
  }

  if (showResults) {
    return <QuizResults attempt={attempt} onRetake={handleRetake} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <QuizPlayer 
        quiz={attempt.quiz}
        attempt={attempt}
        onComplete={handleQuizComplete}
      />
    </div>
  );
}
