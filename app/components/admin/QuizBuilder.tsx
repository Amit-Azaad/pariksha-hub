import React, { useState, useEffect } from 'react';
import { useFetcher } from '@remix-run/react';

interface Question {
  id: number;
  questionType: string;
  category: string;
  difficulty: string;
  translations: Array<{
    language: string;
    questionText: string;
    optionA: string;
    optionB: string;
    optionC: string;
    optionD: string;
  }>;
  tags: Array<{ tag: string }>;
}

interface QuizBuilderProps {
  onQuizCreated?: (quizId: number) => void;
  onCancel?: () => void;
}

export default function QuizBuilder({ onQuizCreated, onCancel }: QuizBuilderProps) {
  const [quizData, setQuizData] = useState({
    title: '',
    description: '',
    type: 'practice',
    timeLimit: 30,
    isActive: true,
    isPublic: true
  });
  
  const [selectedQuestions, setSelectedQuestions] = useState<Array<{ questionId: number; order: number; points: number }>>([]);
  const [availableQuestions, setAvailableQuestions] = useState<Question[]>([]);
  const [filters, setFilters] = useState({
    category: '',
    difficulty: '',
    search: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  
  const fetcher = useFetcher();

  // Load available questions
  useEffect(() => {
    loadQuestions();
  }, [filters, currentPage]);

  const loadQuestions = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        ...(filters.category && { category: filters.category }),
        ...(filters.difficulty && { difficulty: filters.difficulty }),
        ...(filters.search && { search: filters.search })
      });

      const response = await fetch(`/api/questions?${params}`);
      const data = await response.json();
      
      if (data.questions) {
        setAvailableQuestions(data.questions);
        setTotalQuestions(data.pagination.total);
      }
    } catch (error) {
      console.error('Failed to load questions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuestionToggle = (questionId: number) => {
    setSelectedQuestions(prev => {
      const existing = prev.find(q => q.questionId === questionId);
      if (existing) {
        return prev.filter(q => q.questionId !== questionId);
      } else {
        return [...prev, { questionId, order: prev.length + 1, points: 1 }];
      }
    });
  };

  const updateQuestionOrder = (questionId: number, newOrder: number) => {
    setSelectedQuestions(prev => 
      prev.map(q => 
        q.questionId === questionId 
          ? { ...q, order: newOrder }
          : q
      ).sort((a, b) => a.order - b.order)
    );
  };

  const updateQuestionPoints = (questionId: number, points: number) => {
    setSelectedQuestions(prev => 
      prev.map(q => 
        q.questionId === questionId 
          ? { ...q, points: Math.max(1, points) }
          : q
      )
    );
  };

  const handleSubmit = () => {
    if (!quizData.title.trim()) {
      alert('Please enter a quiz title');
      return;
    }

    if (selectedQuestions.length === 0) {
      alert('Please select at least one question');
      return;
    }

    const formData = new FormData();
    formData.append('title', quizData.title);
    formData.append('description', quizData.description);
    formData.append('type', quizData.type);
    formData.append('timeLimit', quizData.timeLimit.toString());
    formData.append('isActive', quizData.isActive.toString());
    formData.append('isPublic', quizData.isPublic.toString());
    
    // Join all question IDs into a single comma-separated string
    const questionIdsString = selectedQuestions.map(q => q.questionId.toString()).join(',');
    formData.append('questionIds', questionIdsString);

    fetcher.submit(formData, {
      method: 'POST',
      action: '/api/quizzes'
    });
  };

  // Handle quiz creation response
  useEffect(() => {
    if (fetcher.state === 'idle' && fetcher.data) {
      if (fetcher.data.error) {
        alert(`Failed to create quiz: ${fetcher.data.error}`);
      } else if (fetcher.data.quiz) {
        alert('Quiz created successfully!');
        onQuizCreated?.(fetcher.data.quiz.id);
      }
    }
  }, [fetcher.state, fetcher.data, onQuizCreated]);

  const isQuestionSelected = (questionId: number) => 
    selectedQuestions.some(q => q.questionId === questionId);

  const getSelectedQuestionData = (questionId: number) => 
    selectedQuestions.find(q => q.questionId === questionId);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Create New Quiz
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Configure quiz settings and select questions from the question bank.
        </p>
      </div>

      {/* Quiz Configuration */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Quiz Title *
          </label>
          <input
            type="text"
            value={quizData.title}
            onChange={(e) => setQuizData(prev => ({ ...prev, title: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="Enter quiz title"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Quiz Type
          </label>
          <select
            value={quizData.type}
            onChange={(e) => setQuizData(prev => ({ ...prev, type: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="practice">Practice</option>
            <option value="mock">Mock Test</option>
            <option value="assessment">Assessment</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Time Limit (minutes)
          </label>
          <input
            type="number"
            min="1"
            value={quizData.timeLimit}
            onChange={(e) => setQuizData(prev => ({ ...prev, timeLimit: parseInt(e.target.value) || 30 }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Description
          </label>
          <input
            type="text"
            value={quizData.description}
            onChange={(e) => setQuizData(prev => ({ ...prev, description: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="Quiz description (optional)"
          />
        </div>
      </div>

      {/* Quiz Settings */}
      <div className="flex space-x-4 mb-6">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={quizData.isActive}
            onChange={(e) => setQuizData(prev => ({ ...prev, isActive: e.target.checked }))}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Active</span>
        </label>

        <label className="flex items-center">
          <input
            type="checkbox"
            checked={quizData.isPublic}
            onChange={(e) => setQuizData(prev => ({ ...prev, isPublic: e.target.checked }))}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">Public</span>
        </label>
      </div>

      {/* Question Selection */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-md font-medium text-gray-900 dark:text-white">
            Select Questions ({selectedQuestions.length} selected)
          </h4>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Total: {totalQuestions}
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <input
            type="text"
            placeholder="Search questions..."
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
          
          <select
            value={filters.category}
            onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">All Categories</option>
            <option value="mathematics">Mathematics</option>
            <option value="science">Science</option>
            <option value="history">History</option>
            <option value="geography">Geography</option>
          </select>

          <select
            value={filters.difficulty}
            onChange={(e) => setFilters(prev => ({ ...prev, difficulty: e.target.value }))}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">All Difficulties</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>

        {/* Questions List */}
        <div className="max-h-96 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg">
          {isLoading ? (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              Loading questions...
            </div>
          ) : availableQuestions.length === 0 ? (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              No questions found matching your criteria.
            </div>
          ) : (
            availableQuestions.map((question) => {
              const isSelected = isQuestionSelected(question.id);
              const selectedData = getSelectedQuestionData(question.id);
              
              return (
                <div
                  key={question.id}
                  className={`p-4 border-b border-gray-200 dark:border-gray-700 ${
                    isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleQuestionToggle(question.id)}
                      className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                          {question.category}
                        </span>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          question.difficulty === 'easy' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                          question.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                          'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                        }`}>
                          {question.difficulty}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-900 dark:text-white mb-2">
                        {question.translations[0]?.questionText || 'No question text available'}
                      </p>
                      
                      {isSelected && (
                        <div className="flex items-center space-x-4 text-sm">
                          <div>
                            <label className="text-gray-600 dark:text-gray-400">Order:</label>
                            <input
                              type="number"
                              min="1"
                              value={selectedData?.order || 1}
                              onChange={(e) => updateQuestionOrder(question.id, parseInt(e.target.value) || 1)}
                              className="ml-2 w-16 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            />
                          </div>
                          <div>
                            <label className="text-gray-600 dark:text-gray-400">Points:</label>
                            <input
                              type="number"
                              min="1"
                              value={selectedData?.points || 1}
                              onChange={(e) => updateQuestionPoints(question.id, parseInt(e.target.value) || 1)}
                              className="ml-2 w-16 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Pagination */}
        {totalQuestions > 20 && (
          <div className="mt-4 flex justify-center">
            <div className="flex space-x-2">
              {Array.from({ length: Math.ceil(totalQuestions / 20) }, (_, i) => i + 1).map(pageNum => (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`px-3 py-1 text-sm rounded ${
                    pageNum === currentPage
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  {pageNum}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-end space-x-3">
        {onCancel && (
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Cancel
          </button>
        )}
        
        <button
          onClick={handleSubmit}
          disabled={!quizData.title.trim() || selectedQuestions.length === 0 || fetcher.state === 'submitting'}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {fetcher.state === 'submitting' ? 'Creating Quiz...' : 'Create Quiz'}
        </button>
      </div>
    </div>
  );
}
