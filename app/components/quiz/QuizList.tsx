import React, { useState, useEffect } from 'react';
import { useFetcher, Link } from '@remix-run/react';
import type { Quiz } from '../../lib/types';

interface QuizWithCount extends Quiz {
  _count?: {
    questions: number;
    attempts: number;
  };
}

interface QuizListProps {
  initialQuizzes?: Quiz[];
}

interface QuizFilters {
  type?: string;
  category?: string;
  page: number;
  limit: number;
}

export default function QuizList({ initialQuizzes = [] }: QuizListProps) {
  const [quizzes, setQuizzes] = useState<QuizWithCount[]>(initialQuizzes);
  const [filteredQuizzes, setFilteredQuizzes] = useState<QuizWithCount[]>(initialQuizzes);
  const [filters, setFilters] = useState<QuizFilters>({
    page: 1,
    limit: 20
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: initialQuizzes.length,
    pages: Math.ceil(initialQuizzes.length / 20)
  });
  const [loading, setLoading] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState<QuizWithCount | null>(null);
  const [startingQuiz, setStartingQuiz] = useState(false);
  const [showQuizDetails, setShowQuizDetails] = useState<QuizWithCount | null>(null);
  
  const fetcher = useFetcher();

  // Update quizzes when initialQuizzes prop changes
  useEffect(() => {
    setQuizzes(initialQuizzes);
    setFilteredQuizzes(initialQuizzes);
    setPagination({
      page: 1,
      limit: 20,
      total: initialQuizzes.length,
      pages: Math.ceil(initialQuizzes.length / 20)
    });
    setFilters({ page: 1, limit: 20 });
  }, [initialQuizzes]);

  // Apply filters whenever filters change
  useEffect(() => {
    applyFilters();
  }, [filters.type, filters.category, filters.limit, quizzes]);

  // Reset to page 1 when filters change (but not when page changes)
  useEffect(() => {
    setFilters(prev => ({ ...prev, page: 1 }));
  }, [filters.type, filters.category]);

  const applyFilters = () => {
    let filtered = [...quizzes];
    
    // Filter by type
    if (filters.type) {
      filtered = filtered.filter(quiz => quiz.type === filters.type);
    }
    
    // Filter by category (using quiz category)
    if (filters.category) {
      filtered = filtered.filter(quiz => quiz.category === filters.category);
    }
    
    setFilteredQuizzes(filtered);
    
    // Update pagination
    const total = filtered.length;
    const pages = Math.ceil(total / filters.limit);
    setPagination({
      page: filters.page, // Use current page instead of always resetting to 1
      limit: filters.limit,
      total,
      pages
    });
  };

  // Get paginated quizzes for current page
  const getPaginatedQuizzes = () => {
    const startIndex = (filters.page - 1) * filters.limit;
    const endIndex = startIndex + filters.limit;
    return filteredQuizzes.slice(startIndex, endIndex);
  };

  const handleFilterChange = (key: keyof QuizFilters, value: string | number) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page when filters change
    }));
  };

  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const startQuiz = async (quiz: Quiz) => {
    try {
      const formData = new FormData();
      formData.append('quizId', quiz.id.toString());
      formData.append('guestId', 'guest_' + Date.now()); // Generate a unique guest ID
      
      const response = await fetch('/api/quiz-attempts', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      
      if (data.success) {
        // Redirect to quiz player
        window.location.href = `/quiz-play?quizId=${quiz.id}&attempt=${data.attempt.id}`;
      } else {
        alert('Failed to start quiz: ' + data.error);
      }
    } catch (error) {
      console.error('Error starting quiz:', error);
      alert('Failed to start quiz. Please try again.');
    }
  };

  const handleStartQuiz = async () => {
    if (selectedQuiz) {
      setStartingQuiz(true);
      await startQuiz(selectedQuiz);
      // Don't close modal here - let the redirect handle it
    }
  };

  const getTypeColor = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'daily': return 'bg-green-100 text-green-800';
      case 'weekly': return 'bg-blue-100 text-blue-800';
      case 'monthly': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-accent-primary)]"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--color-text-primary)] mb-2">Available Quizzes</h1>
        <p className="text-[var(--color-text-secondary)]">Test your knowledge with our interactive quizzes</p>
      </div>

      {/* Filters */}
      <div className="bg-[var(--color-bg-surface)] rounded-lg shadow-sm border border-[var(--color-border)] p-6 mb-6">
        <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">Filters</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
              Quiz Type
            </label>
            <select
              value={filters.type || ''}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-primary)] bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]"
            >
              <option value="">All Types</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
              Category
            </label>
            <select
              value={filters.category || ''}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="w-full px-3 py-2 border border-[var(--color-border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-accent-primary)] bg-[var(--color-bg-primary)] text-[var(--color-text-primary)]"
            >
              <option value="">All Categories</option>
              <option value="General Knowledge">General Knowledge</option>
              <option value="Mathematics">Mathematics</option>
              <option value="Science">Science</option>
              <option value="History">History</option>
              <option value="Geography">Geography</option>
              <option value="English">English</option>
            </select>
          </div>
        </div>
      </div>

      {/* Quiz Grid */}
      {filteredQuizzes.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📚</div>
          <h3 className="text-xl font-semibold text-[var(--color-text-primary)] mb-2">No quizzes found</h3>
          <p className="text-[var(--color-text-secondary)] mb-4">Try adjusting your filters or check back later for new quizzes.</p>
          <button
            onClick={() => {
              setFilters({ page: 1, limit: 20 });
              setFilteredQuizzes(quizzes);
              setPagination({
                page: 1,
                limit: 20,
                total: quizzes.length,
                pages: Math.ceil(quizzes.length / 20)
              });
            }}
            className="px-4 py-2 bg-[var(--color-accent-primary)] text-[var(--color-text-inverse)] rounded-lg hover:bg-[var(--color-accent-primary)]/80 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {getPaginatedQuizzes().map((quiz) => (
              <div
                key={quiz.id}
                className="bg-[var(--color-bg-surface)] rounded-lg shadow-sm border border-[var(--color-border)] overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-semibold text-[var(--color-text-primary)] line-clamp-2">
                      {quiz.title}
                    </h3>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {quiz.type && (
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(quiz.type)}`}>
                        {quiz.type.replace('_', ' ')}
                      </span>
                    )}
                    {quiz.category && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {quiz.category}
                      </span>
                    )}
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[var(--color-bg-muted)] text-[var(--color-text-secondary)] border border-[var(--color-border)]">
                      {quiz._count?.questions || 0} questions
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm text-[var(--color-text-secondary)] mb-4">
                    <span>Created by {quiz.creator?.name || 'Admin'}</span>
                    <span>{new Date(quiz.createdAt).toLocaleDateString()}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => {
                        setSelectedQuiz(quiz);
                      }}
                      className="flex-1 mr-2 px-4 py-2 bg-[var(--color-accent-primary)] text-[var(--color-text-inverse)] rounded-lg hover:bg-[var(--color-accent-primary)]/80 transition-colors"
                    >
                      Start Quiz
                    </button>
                    
                    <button
                      onClick={() => setShowQuizDetails(quiz)}
                      className="px-3 py-2 border border-[var(--color-border)] text-[var(--color-text-secondary)] rounded-lg hover:border-[var(--color-accent-primary)]/50 transition-colors"
                    >
                      Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex justify-center">
              <nav className="flex items-center space-x-2">
                <button
                  onClick={() => handlePageChange(filters.page - 1)}
                  disabled={filters.page <= 1}
                  className="px-3 py-2 border border-[var(--color-border)] rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[var(--color-bg-muted)] text-[var(--color-text-secondary)]"
                >
                  Previous
                </button>

                {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-2 border rounded-lg ${
                      page === filters.page
                        ? 'border-[var(--color-accent-primary)] bg-[var(--color-accent-primary)] text-[var(--color-text-inverse)]'
                        : 'border-[var(--color-border)] hover:bg-[var(--color-bg-muted)] text-[var(--color-text-secondary)]'
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  onClick={() => handlePageChange(filters.page + 1)}
                  disabled={filters.page >= pagination.pages}
                  className="px-3 py-2 border border-[var(--color-border)] rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[var(--color-bg-muted)] text-[var(--color-text-secondary)]"
                >
                  Next
                </button>
              </nav>
            </div>
          )}
        </>
      )}

      {/* Quiz Start Modal */}
      {selectedQuiz && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[var(--color-bg-surface)] rounded-lg p-6 max-w-md w-full mx-4 border border-[var(--color-border)]">
            <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">
              Start Quiz: {selectedQuiz.title}
            </h3>
            
            {selectedQuiz.type && (
              <div className="mb-4">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(selectedQuiz.type)}`}>
                  {selectedQuiz.type.charAt(0).toUpperCase() + selectedQuiz.type.slice(1)}
                </span>
              </div>
            )}

            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-[var(--color-text-secondary)]">Questions:</span>
                <span className="font-medium text-[var(--color-text-primary)]">{selectedQuiz._count?.questions || 0}</span>
              </div>
              {selectedQuiz.timeLimit && (
                <div className="flex justify-between">
                  <span className="text-[var(--color-text-secondary)]">Time Limit:</span>
                  <span className="font-medium text-[var(--color-text-primary)]">{selectedQuiz.timeLimit} minutes</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-[var(--color-text-secondary)]">Type:</span>
                <span className="font-medium text-[var(--color-text-primary)] capitalize">{selectedQuiz.type || 'Practice'}</span>
              </div>
              {selectedQuiz.description && (
                <div className="pt-3 border-t border-[var(--color-border)]">
                  <div className="text-[var(--color-text-secondary)] text-sm mb-1">Description:</div>
                  <div className="text-[var(--color-text-primary)] text-sm leading-relaxed">
                    {selectedQuiz.description}
                  </div>
                </div>
              )}
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setSelectedQuiz(null)}
                className="flex-1 px-4 py-2 border border-[var(--color-border)] text-[var(--color-text-secondary)] rounded-lg hover:border-[var(--color-accent-primary)]/50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleStartQuiz}
                disabled={startingQuiz}
                className="flex-1 px-4 py-2 bg-[var(--color-accent-primary)] text-[var(--color-text-inverse)] rounded-lg hover:bg-[var(--color-accent-primary)]/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {startingQuiz ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[var(--color-text-inverse)]"></div>
                ) : (
                  'Start Now'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quiz Details Modal */}
      {showQuizDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-[var(--color-bg-surface)] rounded-lg p-4 sm:p-6 max-w-2xl w-full mx-2 sm:mx-4 border border-[var(--color-border)] max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h3 className="text-lg sm:text-xl font-semibold text-[var(--color-text-primary)]">
                Quiz Details
              </h3>
              <button
                onClick={() => setShowQuizDetails(null)}
                className="p-2 rounded-lg hover:bg-[var(--color-bg-muted)] transition-colors"
              >
                <svg className="w-5 h-5 text-[var(--color-text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4 sm:space-y-6">
              {/* Quiz Title and Type */}
              <div>
                <h4 className="text-base sm:text-lg font-semibold text-[var(--color-text-primary)] mb-2">
                  {showQuizDetails.title}
                </h4>
                {showQuizDetails.type && (
                  <span className={`inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${getTypeColor(showQuizDetails.type)}`}>
                    {showQuizDetails.type.charAt(0).toUpperCase() + showQuizDetails.type.slice(1)}
                  </span>
                )}
              </div>

              {/* Description */}
              {showQuizDetails.description && (
                <div>
                  <h5 className="text-xs sm:text-sm font-medium text-[var(--color-text-secondary)] mb-1 sm:mb-2">Description</h5>
                  <p className="text-sm sm:text-base text-[var(--color-text-primary)] leading-relaxed">
                    {showQuizDetails.description}
                  </p>
                </div>
              )}

              {/* Quiz Information Grid - Compact on Mobile */}
              <div className="grid grid-cols-2 sm:grid-cols-2 gap-2 sm:gap-4">
                <div className="bg-[var(--color-bg-muted)] rounded-lg p-3 sm:p-4">
                  <div className="text-xs sm:text-sm text-[var(--color-text-secondary)] mb-1">Questions</div>
                  <div className="text-lg sm:text-2xl font-bold text-[var(--color-text-primary)]">
                    {showQuizDetails._count?.questions || 0}
                  </div>
                </div>
                
                <div className="bg-[var(--color-bg-muted)] rounded-lg p-3 sm:p-4">
                  <div className="text-xs sm:text-sm text-[var(--color-text-secondary)] mb-1">Time Limit</div>
                  <div className="text-lg sm:text-2xl font-bold text-[var(--color-text-primary)]">
                    {showQuizDetails.timeLimit ? `${showQuizDetails.timeLimit}m` : 'No limit'}
                  </div>
                </div>
                
                <div className="bg-[var(--color-bg-muted)] rounded-lg p-3 sm:p-4">
                  <div className="text-xs sm:text-sm text-[var(--color-text-secondary)] mb-1">Attempts</div>
                  <div className="text-lg sm:text-2xl font-bold text-[var(--color-text-primary)]">
                    {showQuizDetails._count?.attempts || 0}
                  </div>
                </div>
                
                <div className="bg-[var(--color-bg-muted)] rounded-lg p-3 sm:p-4">
                  <div className="text-xs sm:text-sm text-[var(--color-text-secondary)] mb-1">Status</div>
                  <div className="text-lg sm:text-2xl font-bold text-[var(--color-text-primary)]">
                    {showQuizDetails.isActive ? 'Active' : 'Inactive'}
                  </div>
                </div>
              </div>

              {/* Creator Information - Compact */}
              <div className="border-t border-[var(--color-border)] pt-3 sm:pt-4">
                <h5 className="text-xs sm:text-sm font-medium text-[var(--color-text-secondary)] mb-2 sm:mb-3">Created By</h5>
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[var(--color-accent-primary)] rounded-full flex items-center justify-center">
                    <span className="text-[var(--color-text-inverse)] font-medium text-xs sm:text-sm">
                      {(showQuizDetails.creator?.name || 'Admin').charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <div className="text-sm sm:text-base font-medium text-[var(--color-text-primary)]">
                      {showQuizDetails.creator?.name || 'Admin User'}
                    </div>
                    <div className="text-xs sm:text-sm text-[var(--color-text-secondary)]">
                      {showQuizDetails.creator?.email || 'admin@parikshahub.com'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Creation Date - Compact */}
              <div className="border-t border-[var(--color-border)] pt-3 sm:pt-4">
                <h5 className="text-xs sm:text-sm font-medium text-[var(--color-text-secondary)] mb-1 sm:mb-2">Created</h5>
                <div className="text-xs sm:text-sm text-[var(--color-text-primary)]">
                  {new Date(showQuizDetails.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="border-t border-[var(--color-border)] pt-4 sm:pt-6">
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                  <button
                    onClick={() => setShowQuizDetails(null)}
                    className="flex-1 px-4 py-2 border border-[var(--color-border)] text-[var(--color-text-secondary)] rounded-lg hover:border-[var(--color-accent-primary)]/50 transition-colors text-sm sm:text-base"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      setShowQuizDetails(null);
                      setSelectedQuiz(showQuizDetails);
                    }}
                    className="flex-1 px-4 py-2 bg-[var(--color-accent-primary)] text-[var(--color-text-inverse)] rounded-lg hover:bg-[var(--color-accent-primary)]/80 transition-colors text-sm sm:text-base"
                  >
                    Start Quiz
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
