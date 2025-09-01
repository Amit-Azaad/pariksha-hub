import type { MetaFunction, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useState } from "react";
import { requireAdmin } from "../lib/oauth.server";
import { prisma } from "../lib/prisma.server";
import AdminGuard from "../components/auth/AdminGuard";
import AdminNav from "../components/admin/AdminNav";
import CSVUpload from "../components/admin/CSVUpload";
import QuizBuilder from "../components/admin/QuizBuilder";
import UsersManagement from "../components/admin/UsersManagement";
import Analytics from "../components/admin/Analytics";
import HeroSectionManager from "../components/admin/HeroSectionManager";

export const meta: MetaFunction = () => [
  { title: "Admin Dashboard - Pariksha Hub" },
  { name: "description", content: "Admin dashboard for managing the platform" },
];

export async function loader({ request }: LoaderFunctionArgs) {
  try {
    const user = await requireAdmin(request);
    
    // Get platform statistics
    const [
      totalQuestions,
      totalQuizzes,
      totalUsers,
      totalAttempts,
      recentQuestions,
      recentQuizzes,
      recentAttempts
    ] = await Promise.all([
      prisma.question.count(),
      prisma.quiz.count(),
      prisma.user.count(),
      prisma.quizAttempt.count(),
      prisma.question.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          translations: { where: { language: 'en' } },
          tags: true
        }
      }),
      prisma.quiz.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: { select: { questions: true, attempts: true } }
        }
      }),
      prisma.quizAttempt.findMany({
        take: 5,
        orderBy: { startedAt: 'desc' },
        include: {
          quiz: { select: { title: true } },
          user: { select: { name: true, email: true } }
        }
      })
    ]);

    return json({
      user,
      stats: {
        totalQuestions,
        totalQuizzes,
        totalUsers,
        totalAttempts
      },
      recent: {
        questions: recentQuestions,
        quizzes: recentQuizzes,
        attempts: recentAttempts
      }
    });
    
  } catch (error) {
    console.error("Admin access denied:", error);
    throw new Response("Access Denied", { status: 403 });
  }
}

export default function AdminDashboard() {
  const { user, stats, recent } = useLoaderData<typeof loader>();
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <AdminGuard user={user as any}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Welcome back, {user.name || user.email}
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                  Admin
                </span>
              </div>
            </div>
          </div>
        </header>

        <AdminNav activeTab={activeTab} onTabChange={setActiveTab} />

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {/* Render nested routes */}
          {activeTab === 'dashboard' && (
            <>
              {/* Dashboard content - only show when no nested route is active */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                        Total Questions
                      </dt>
                      <dd className="text-lg font-medium text-gray-900 dark:text-white">
                        {stats.totalQuestions}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                        Total Quizzes
                      </dt>
                      <dd className="text-lg font-medium text-gray-900 dark:text-white">
                        {stats.totalQuizzes}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                        Total Users
                      </dt>
                      <dd className="text-lg font-medium text-gray-900 dark:text-white">
                        {stats.totalUsers}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 overflow-hidden shadow-sm rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-yellow-600 dark:text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                        Total Attempts
                      </dt>
                      <dd className="text-lg font-medium text-gray-900 dark:text-white">
                        {stats.totalAttempts}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Questions */}
            <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Recent Questions
                </h3>
                <div className="space-y-3">
                  {recent.questions.map((question) => (
                    <div key={question.id} className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                          {question.category}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900 dark:text-white truncate">
                          {question.translations[0]?.questionText || 'No text available'}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(question.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Quizzes */}
            <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Recent Quizzes
                </h3>
                <div className="space-y-3">
                  {recent.quizzes.map((quiz) => (
                    <div key={quiz.id} className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                          {quiz.type}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900 dark:text-white truncate">
                          {quiz.title}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {quiz._count.questions} questions • {quiz._count.attempts} attempts
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Attempts */}
            <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                  Recent Attempts
                </h3>
                <div className="space-y-3">
                  {recent.attempts.map((attempt) => (
                    <div key={attempt.id} className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          attempt.isCompleted 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                        }`}>
                          {attempt.isCompleted ? 'Completed' : 'In Progress'}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900 dark:text-white truncate">
                          {attempt.quiz.title}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {attempt.user?.name || attempt.user?.email || 'Guest'} • {new Date(attempt.startedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
            </>
          )}
          {activeTab === 'questions' && <CSVUpload />}
          {activeTab === 'quizzes' && <QuizBuilder />}
          {activeTab === 'users' && <UsersManagement />}
          {activeTab === 'hero-sections' && <HeroSectionManager />}
          {activeTab === 'analytics' && <Analytics />}
        </main>
      </div>
    </AdminGuard>
  );
}
