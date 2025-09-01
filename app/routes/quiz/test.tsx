import type { MetaFunction, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";

export const meta: MetaFunction = () => [{ title: "Quiz Test | Pariksha Hub" }];

export async function loader({ request }: LoaderFunctionArgs) {
  return json({ 
    message: "Quiz test route working",
    timestamp: new Date().toISOString(),
    url: request.url
  });
}

export default function QuizTestPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Quiz Test Route</h1>
      <p className="text-gray-600">This is a test route to verify the quiz routing is working.</p>
      <div className="mt-4 p-4 bg-white rounded-lg border">
        <h2 className="text-lg font-semibold mb-2">Route Information</h2>
        <p><strong>Path:</strong> /quiz/test</p>
        <p><strong>Status:</strong> Working ✅</p>
      </div>
    </div>
  );
}
