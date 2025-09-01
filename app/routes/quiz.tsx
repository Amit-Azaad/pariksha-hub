import type { MetaFunction, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import QuizList from "../components/quiz/QuizList";
import { getAvailableQuizzes } from "../lib/quiz.server";

export const meta: MetaFunction = () => [{ title: "Quiz | Pariksha Hub" }];

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const result = await getAvailableQuizzes();
    return json(result);
  } catch (error) {
    console.error("Error loading quizzes:", error);
    return json({ success: false, quizzes: [], error: "Failed to load quizzes" });
  }
}

export default function QuizPage() {
  const data = useLoaderData<typeof loader>();

  return (
    <div className="min-h-screen bg-[var(--color-bg-primary)]">
      <QuizList initialQuizzes={data.success ? data.quizzes : []} />
    </div>
  );
}
