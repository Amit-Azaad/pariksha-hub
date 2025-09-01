import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useFetcher } from '@remix-run/react';
import type { Quiz, Question, QuizAttempt, QuestionAttempt } from '../../lib/types';

interface QuizPlayerProps {
  quiz: Quiz;
  attempt: QuizAttempt;
  onComplete: (results: any) => void;
}

interface QuestionWithTranslation extends Omit<Question, 'translations'> {
  translations: Array<{
    language: string;
    questionText: string;
    explanation: string | null;
    optionA: string;
    optionB: string;
    optionC: string;
    optionD: string;
    correctOptionKey: string;
  }>;
}

export default function QuizPlayer({ quiz, attempt, onComplete }: QuizPlayerProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [timeSpent, setTimeSpent] = useState<Record<number, number>>({});
  const [timeRemaining, setTimeRemaining] = useState(quiz.timeLimit ? quiz.timeLimit * 60 : null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [reviewMode, setReviewMode] = useState(false);
  const [markedForReview, setMarkedForReview] = useState<Set<number>>(new Set());
  const [showQuestionNavigator, setShowQuestionNavigator] = useState(false);
  const [showAbortConfirmation, setShowAbortConfirmation] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  
  const questionStartTime = useRef<number>(Date.now());
  const fetcher = useFetcher();
  const timerRef = useRef<NodeJS.Timeout>();

  // Timer effect
  useEffect(() => {
    if (timeRemaining !== null && timeRemaining > 0 && !isCompleted) {
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev && prev <= 1) {
            // Time's up - auto-submit
            // Don't call handleCompleteQuiz here to avoid infinite loop
            // Just set time to 0 and let the effect cleanup handle it
            return 0;
          }
          return prev ? prev - 1 : null;
        });
      }, 1000);

      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }
  }, [timeRemaining, isCompleted]);

  // Track time spent on current question
  useEffect(() => {
    const startTime = Date.now();
    questionStartTime.current = startTime;

    return () => {
      const timeSpentOnQuestion = Math.floor((Date.now() - startTime) / 1000);
      setTimeSpent(prev => ({
        ...prev,
        [currentQuestionIndex]: timeSpentOnQuestion
      }));
    };
  }, [currentQuestionIndex]);

  const currentQuestion = quiz.questions[currentQuestionIndex]?.question as QuestionWithTranslation;
  // Get English translation by default, fallback to first available
  const currentTranslation = currentQuestion?.translations.find(t => t.language === 'en') || currentQuestion?.translations[0];
  const totalQuestions = quiz.questions.length;
  const answeredQuestions = Object.keys(answers).length;

  const handleAnswerSelect = (option: string) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestionIndex]: option
    }));
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleMarkForReview = () => {
    setMarkedForReview(prev => {
      const newSet = new Set(prev);
      if (newSet.has(currentQuestionIndex)) {
        newSet.delete(currentQuestionIndex);
      } else {
        newSet.add(currentQuestionIndex);
      }
      return newSet;
    });
  };

  const handleCompleteQuiz = useCallback(async () => {
    if (isCompleted) return;

    // Check if any answers exist
    if (Object.keys(answers).length === 0) {
      alert('Please answer at least one question before completing the quiz.');
      return;
    }

    setIsCompleted(true);
    if (timerRef.current) clearInterval(timerRef.current);

    try {
      console.log('QuizPlayer: Submitting answers:', answers);
      
      // Submit all answers using fetch instead of fetcher.submit
      const promises = Object.entries(answers).map(async ([questionIndex, selectedOption]) => {
        const questionId = quiz.questions[parseInt(questionIndex)].questionId;
        const timeSpentOnQuestion = timeSpent[parseInt(questionIndex)] || 0;
        
        console.log(`QuizPlayer: Submitting answer for question ${questionIndex}:`, {
          questionId,
          selectedOption,
          timeSpent: timeSpentOnQuestion
        });
        
        const formData = new FormData();
        formData.append('questionId', questionId.toString());
        formData.append('selectedOption', selectedOption);
        formData.append('timeSpent', timeSpentOnQuestion.toString());
        
        const response = await fetch(`/api/quiz-attempts/${attempt.id}/answer`, {
          method: 'PUT',
          body: formData
        });
        
        if (!response.ok) {
          throw new Error(`Failed to submit answer: ${response.status}`);
        }
        
        const result = await response.json();
        console.log(`QuizPlayer: Answer ${questionIndex} submitted successfully:`, result);
        return result;
      });

      console.log('QuizPlayer: Waiting for all answers to be submitted...');
      await Promise.all(promises);
      console.log('QuizPlayer: All answers submitted successfully');

      // Complete the quiz attempt
      const totalTimeTaken = Math.floor((Date.now() - new Date(attempt.startedAt).getTime()) / 1000);
      
      const completeFormData = new FormData();
      completeFormData.append('attemptId', attempt.id.toString());
      completeFormData.append('timeTaken', totalTimeTaken.toString());
      
      const completeResponse = await fetch(`/api/quiz-attempts/${attempt.id}/complete`, {
        method: 'POST',
        body: completeFormData
      });
      
      if (!completeResponse.ok) {
        throw new Error(`Failed to complete quiz: ${completeResponse.status}`);
      }
      
      const completeData = await completeResponse.json();
      
      // Call the onComplete callback with the results
      if (onComplete) {
        console.log('QuizPlayer: Calling onComplete with data:', completeData);
        
        // Ensure the completion data is properly formatted
        const formattedResults = {
          ...completeData,
          attempt: {
            ...completeData.attempt,
            startedAt: new Date(completeData.attempt.startedAt),
            completedAt: completeData.attempt.completedAt ? new Date(completeData.attempt.completedAt) : null,
            createdAt: new Date(completeData.attempt.createdAt),
            updatedAt: new Date(completeData.attempt.updatedAt)
          }
        };
        
        console.log('QuizPlayer: Formatted results:', formattedResults);
        onComplete(formattedResults);
        console.log('QuizPlayer: onComplete called successfully');
      } else {
        console.error('QuizPlayer: onComplete callback is not defined!');
      }
      
    } catch (error) {
      console.error('Error completing quiz:', error);
      // Reset completion state on error
      setIsCompleted(false);
      alert('Error completing quiz. Please try again.');
    }
  }, [isCompleted, answers, timeSpent, attempt.id, attempt.startedAt, quiz.questions, onComplete]);

  // Handle time's up separately to avoid infinite loop
  useEffect(() => {
    if (timeRemaining === 0 && !isCompleted) {
      // Time's up - auto-submit
      handleCompleteQuiz();
    }
  }, [timeRemaining, isCompleted, handleCompleteQuiz]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!currentQuestion || !currentTranslation) {
    return <div>Loading question...</div>;
  }

  if (isCompleted) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-accent-primary)] mx-auto mb-4"></div>
        <p className="text-lg text-[var(--color-text-secondary)]">Submitting your quiz...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Compact Quiz Header */}
      <div className="bg-[var(--color-bg-surface)] rounded-lg shadow-sm border border-[var(--color-border)] p-3 sm:p-4 mb-4">
        <div className="flex items-center justify-between">
          {/* Left side: Time Label and Value */}
          <div className="flex items-center space-x-2 sm:space-x-4 min-w-0">
            {/* Time Label */}
            <span className="text-sm sm:text-base text-[var(--color-text-secondary)] font-medium whitespace-nowrap">
              Time:
            </span>
            
            {/* Time Value */}
            {timeRemaining !== null && (
              <div className="text-sm sm:text-base font-mono text-[var(--color-accent-error)] font-bold">
                {formatTime(timeRemaining)}
              </div>
            )}
          </div>
          
          {/* Right side: Abort Quiz and Question Navigator Buttons */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Abort Quiz Button */}
            <button
              onClick={() => setShowAbortConfirmation(true)}
              className="p-2 rounded-lg bg-[var(--color-accent-error)] hover:bg-[var(--color-accent-error)]/80 text-[var(--color-text-inverse)] transition-colors flex-shrink-0"
              title="Abort Quiz"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            {/* Question Navigator Button */}
            <button
              onClick={() => setShowQuestionNavigator(true)}
              className="p-2 rounded-lg bg-[var(--color-accent-primary)] hover:bg-[var(--color-accent-primary)]/80 text-[var(--color-text-inverse)] transition-colors flex-shrink-0"
              title="Question Navigator"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Question and Options Container */}
      <div className="bg-[var(--color-bg-surface)] rounded-lg shadow-sm border border-[var(--color-border)] p-4 sm:p-6 mb-4">
        <div className="mb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mb-3">
            <span className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-[var(--color-accent-primary)]/10 text-[var(--color-accent-primary)] border border-[var(--color-accent-primary)]/20">
              {currentQuestion.category}
            </span>
            <span className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-[var(--color-bg-muted)] text-[var(--color-text-secondary)] border border-[var(--color-border)]">
              {currentQuestion.difficulty}
            </span>
          </div>
          
          {/* Question in English */}
          <h2 className="text-base sm:text-lg lg:text-xl font-semibold text-[var(--color-text-primary)] mb-3 leading-relaxed break-words">
            {currentTranslation.questionText}
          </h2>
          
          {/* Question in Hindi (if available) */}
          {(() => {
            const hindiTranslation = currentQuestion.translations.find(t => t.language === 'hi');
            if (hindiTranslation && hindiTranslation.questionText !== currentTranslation.questionText) {
              return (
                <div className="mb-3 p-2 sm:p-3 bg-[var(--color-bg-muted)] rounded-lg border-l-4 border-[var(--color-accent-primary)]">
                  <h3 className="text-sm sm:text-base lg:text-lg font-medium text-[var(--color-text-secondary)] leading-relaxed break-words">
                    {hindiTranslation.questionText}
                  </h3>
                </div>
              );
            }
            return null;
          })()}
        </div>

        {/* Options */}
        <div className="space-y-2 sm:space-y-3">
          {['A', 'B', 'C', 'D'].map((option) => {
            const optionText = currentTranslation[`option${option}` as keyof typeof currentTranslation] as string;
            const isSelected = answers[currentQuestionIndex] === option;
            
            return (
              <label
                key={option}
                className={`flex items-start p-3 sm:p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  isSelected
                    ? 'border-[var(--color-accent-primary)] bg-[var(--color-accent-primary)]/10'
                    : 'border-[var(--color-border)] hover:border-[var(--color-accent-primary)]/50'
                }`}
              >
                <input
                  type="radio"
                  name={`question-${currentQuestionIndex}`}
                  value={option}
                  checked={isSelected}
                  onChange={() => handleAnswerSelect(option)}
                  className="sr-only"
                />
                <span className={`flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 border-2 rounded-full mr-3 mt-0.5 flex items-center justify-center ${
                  isSelected
                    ? 'border-[var(--color-accent-primary)] bg-[var(--color-accent-primary)]'
                    : 'border-[var(--color-border)]'
                }`}>
                  {isSelected && (
                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-white rounded-full"></div>
                  )}
                </span>
                <span className={`text-sm sm:text-base leading-relaxed break-words flex-1 ${
                  isSelected ? 'text-[var(--color-accent-primary)]' : 'text-[var(--color-text-primary)]'
                }`}>{optionText}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Fixed Navigation Bar - Always Visible */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-600 p-3 z-50 shadow-lg mb-16 sm:mb-0">
        <div className="max-w-4xl mx-auto">
          {/* Navigation Controls - Optimized Layout */}
          <div className="grid grid-cols-3 gap-3">
            {/* Previous Button - Left */}
            <button
              onClick={handlePreviousQuestion}
              disabled={currentQuestionIndex === 0}
              className="px-3 py-2.5 bg-gray-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors text-sm font-medium"
            >
              Previous
            </button>

            {/* Mark for Review Button - Center */}
            <button
              onClick={handleMarkForReview}
              className={`px-3 py-2.5 rounded-lg border-2 transition-colors text-sm font-medium ${
                markedForReview.has(currentQuestionIndex)
                  ? 'border-yellow-500 bg-yellow-500/10 text-yellow-500'
                  : 'border-gray-500 text-gray-300 hover:border-blue-500/50'
              }`}
            >
              {markedForReview.has(currentQuestionIndex) ? 'Marked' : 'Review'}
            </button>

            {/* Next/Complete Button - Right */}
            {currentQuestionIndex === totalQuestions - 1 ? (
              <button
                onClick={handleCompleteQuiz}
                className="px-3 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
              >
                Complete
              </button>
            ) : (
              <button
                onClick={handleNextQuestion}
                className="px-3 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                Next
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Spacer to prevent content from being hidden behind fixed navigation */}
      <div className="h-20 sm:h-24"></div>



      {/* Question Navigator Modal */}
      {showQuestionNavigator && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-2 sm:p-4 z-50">
          <div className="bg-[var(--color-bg-surface)] rounded-lg shadow-xl border border-[var(--color-border)] w-full max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-3 sm:p-4 border-b border-[var(--color-border)]">
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-[var(--color-text-primary)]">
                  Question Navigator
                </h3>
                <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                  Question {currentQuestionIndex + 1} of {totalQuestions} • {answeredQuestions} answered
                </p>
              </div>
              <button
                onClick={() => setShowQuestionNavigator(false)}
                className="p-2 rounded-lg hover:bg-[var(--color-bg-muted)] transition-colors"
              >
                <svg className="w-5 h-5 text-[var(--color-text-secondary)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-3 sm:p-4 overflow-y-auto max-h-[calc(95vh-120px)] sm:max-h-[calc(90vh-120px)]">
              {/* Question Grid with Pagination */}
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-1.5 sm:gap-2 mb-4">
                {(() => {
                  const questionsPerPage = 50;
                  const startIndex = (currentPage - 1) * questionsPerPage;
                  const endIndex = Math.min(startIndex + questionsPerPage, totalQuestions);
                  const currentQuestions = Array.from({ length: endIndex - startIndex }, (_, i) => startIndex + i);
                  
                  return currentQuestions.map((index) => {
                    const isAnswered = answers[index] !== undefined;
                    const isMarked = markedForReview.has(index);
                    const isCurrent = index === currentQuestionIndex;
                    
                    return (
                      <button
                        key={index}
                        onClick={() => {
                          setCurrentQuestionIndex(index);
                          setShowQuestionNavigator(false);
                        }}
                        className={`w-10 h-10 rounded-lg border-2 text-sm font-medium transition-all ${
                          isCurrent
                            ? 'border-[var(--color-accent-primary)] bg-[var(--color-accent-primary)] text-[var(--color-text-inverse)]'
                            : isAnswered
                            ? 'border-[var(--color-accent-success)] bg-[var(--color-accent-success)]/10 text-[var(--color-accent-success)]'
                            : isMarked
                            ? 'border-[var(--color-accent-warning)] bg-[var(--color-accent-warning)]/10 text-[var(--color-accent-warning)]'
                            : 'border-[var(--color-border)] bg-[var(--color-bg-muted)] text-[var(--color-text-secondary)] hover:border-[var(--color-accent-primary)]/50'
                        }`}
                      >
                        {index + 1}
                      </button>
                    );
                  });
                })()}
              </div>

              {/* Pagination */}
              {(() => {
                const questionsPerPage = 50;
                const totalPages = Math.ceil(totalQuestions / questionsPerPage);
                
                if (totalPages <= 1) return null;
                
                return (
                  <div className="flex items-center justify-center space-x-1 sm:space-x-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="px-2 sm:px-3 py-2 rounded-lg border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-muted)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    
                    <div className="flex items-center space-x-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`px-2 sm:px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                              pageNum === currentPage
                                ? 'bg-[var(--color-accent-primary)] text-[var(--color-text-inverse)]'
                                : 'border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-muted)]'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>
                    
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="px-2 sm:px-3 py-2 rounded-lg border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-muted)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                );
              })()}

              {/* Legend */}
              <div className="mt-4 flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-xs sm:text-sm text-[var(--color-text-secondary)]">
                <div className="flex items-center space-x-1 sm:space-x-2">
                  <div className="w-3 h-3 sm:w-4 sm:h-4 bg-[var(--color-accent-primary)] border-2 border-[var(--color-accent-primary)] rounded"></div>
                  <span>Current</span>
                </div>
                <div className="flex items-center space-x-1 sm:space-x-2">
                  <div className="w-3 h-3 sm:w-4 sm:h-4 bg-[var(--color-accent-success)]/10 border-2 border-[var(--color-accent-success)] rounded"></div>
                  <span>Answered</span>
                </div>
                <div className="flex items-center space-x-1 sm:space-x-2">
                  <div className="w-3 h-3 sm:w-4 sm:h-4 bg-[var(--color-accent-warning)]/10 border-2 border-[var(--color-accent-warning)] rounded"></div>
                  <span>Marked</span>
                </div>
                <div className="flex items-center space-x-1 sm:space-x-2">
                  <div className="w-3 h-3 sm:w-4 sm:h-4 bg-[var(--color-bg-muted)] border-2 border-[var(--color-border)] rounded"></div>
                  <span>Unanswered</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Abort Quiz Confirmation Modal */}
      {showAbortConfirmation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--color-bg-surface)] rounded-lg shadow-lg border border-[var(--color-border)] max-w-md w-full p-6">
            <div className="text-center">
              {/* Warning Icon */}
              <div className="mx-auto flex items-center justify-center w-16 h-16 bg-[var(--color-accent-error)]/10 rounded-full mb-4">
                <svg className="w-8 h-8 text-[var(--color-accent-error)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              
              {/* Title */}
              <h3 className="text-lg font-semibold text-[var(--color-text-primary)] mb-2">
                Abort Quiz?
              </h3>
              
              {/* Message */}
              <p className="text-[var(--color-text-secondary)] mb-6">
                Are you sure you want to abort this quiz? Your progress will be lost and you'll return to the quiz list.
              </p>
              
              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setShowAbortConfirmation(false)}
                  className="flex-1 px-4 py-2 border-2 border-[var(--color-border)] text-[var(--color-text-secondary)] rounded-lg hover:border-[var(--color-accent-primary)]/50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowAbortConfirmation(false);
                    window.location.href = '/quiz';
                  }}
                  className="flex-1 px-4 py-2 bg-[var(--color-accent-error)] text-[var(--color-text-inverse)] rounded-lg hover:bg-[var(--color-accent-error)]/80 transition-colors"
                >
                  Abort Quiz
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
