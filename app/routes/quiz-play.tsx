import type { MetaFunction, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData, useSearchParams } from "@remix-run/react";
import { useEffect, useState, useMemo } from "react";
import QuizPlayer from "../components/quiz/QuizPlayer";
import QuizResults from "../components/quiz/QuizResults";
import { getQuizAttempt, startQuizAttempt } from "../lib/quiz.server";
import { prisma } from "../lib/prisma.server";
import type { QuizAttempt, Quiz } from "../lib/types";

export const meta: MetaFunction = () => [{ title: "Quiz | Pariksha Hub" }];

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const attemptId = url.searchParams.get("attempt");
  const quizId = url.searchParams.get("quizId");
  
  if (!attemptId || !quizId) {
    return redirect("/quiz");
  }

  try {
    const result = await getQuizAttempt(parseInt(attemptId));
    
    if (!result.success) {
      throw new Error(result.error);
    }

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
  const [currentAttempt, setCurrentAttempt] = useState<any>(null);

  // Transform the JSON data back to proper types - use useMemo to prevent recreation
  const attempt = useMemo(() => {
    if (!data.attempt) return null;
    
    return {
      ...data.attempt,
      startedAt: new Date(data.attempt.startedAt),
      completedAt: data.attempt.completedAt ? new Date(data.attempt.completedAt) : null,
      quiz: {
        ...data.attempt.quiz
      }
    } as any;
  }, [data.attempt]);

  // Initialize currentAttempt with the loaded attempt
  useEffect(() => {
    if (attempt) {
      setCurrentAttempt(attempt);
    }
  }, [attempt]);

  // Check if quiz is completed - only run once when component mounts
  useEffect(() => {
    if (attempt?.isCompleted) {
      setShowResults(true);
    }
  }, []); // Empty dependency array - only run once

  const handleQuizComplete = async (results: any) => {
    try {
      console.log('QuizPlay: handleQuizComplete called with results:', results);
      
      // Update the current attempt with the completion results
      if (results && results.attempt) {
        console.log('QuizPlay: Updating currentAttempt with:', results.attempt);
        setCurrentAttempt(results.attempt);
      } else {
        console.error('QuizPlay: No results or attempt data received');
      }
      
      // Force a small delay to ensure state is updated
      await new Promise(resolve => setTimeout(resolve, 100));
      console.log('QuizPlay: Setting showResults to true');
      setShowResults(true);
    } catch (error) {
      console.error('Error handling quiz completion:', error);
    }
  };

  const handleRetake = async () => {
    try {
      // Create a new quiz attempt for the same quiz
      const formData = new FormData();
      formData.append('quizId', attempt.quiz.id.toString());
      formData.append('guestId', 'guest_' + Date.now());
      
      const response = await fetch('/api/quiz-attempts', {
        method: 'POST',
        body: formData
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Redirect to the new quiz attempt
          window.location.href = `/quiz-play?quizId=${attempt.quiz.id}&attempt=${data.attempt.id}`;
        } else {
          throw new Error('Failed to create new attempt');
        }
      } else {
        throw new Error('Failed to create new attempt');
      }
    } catch (error) {
      console.error('Error creating new attempt:', error);
      alert('Failed to start new quiz. Please try again.');
    }
  };

  if (!attempt) {
    return <div>Loading...</div>;
  }

  if (showResults) {
    return <QuizResults attempt={currentAttempt} onRetake={handleRetake} />;
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)]">
      {/* Hide main bottom navigation on quiz page */}
      <style>{`
        /* Hide main bottom navigation on quiz pages */
        nav[role="navigation"] {
          display: none !important;
        }
        /* Alternative selectors for bottom navigation */
        .bottom-nav, .main-nav, [data-testid="bottom-navigation"] {
          display: none !important;
        }
      `}</style>
      
      <QuizPlayer 
        quiz={attempt.quiz}
        attempt={attempt}
        onComplete={handleQuizComplete}
      />
    </div>
  );
}
