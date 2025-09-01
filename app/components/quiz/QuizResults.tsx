import React, { useState } from 'react';
import { Link } from '@remix-run/react';
import type { QuizAttempt, QuestionAttempt, Question, QuestionTranslation } from '../../lib/types';

// Extended interface for quiz attempt with quiz data
interface QuizAttemptWithQuiz extends QuizAttempt {
  quiz?: {
    id: number;
    title: string;
    questions: Array<{
      id: number;
      questionId: number;
      question: Question;
    }>;
  };
}

interface QuizResultsProps {
  attempt: QuizAttemptWithQuiz;
  onRetake?: () => void;
}

type TabType = 'results' | 'breakdown' | 'insights';

export default function QuizResults({ attempt, onRetake }: QuizResultsProps) {
  const [activeTab, setActiveTab] = useState<TabType>('results');
  
  console.log('QuizResults: Received attempt:', attempt);
  console.log('QuizResults: questionAttempts:', attempt?.questionAttempts);
  
  // Check if attempt exists and has data
  if (!attempt) {
    console.log('QuizResults: No attempt data received');
    return (
      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        <div className="bg-[var(--color-bg-surface)] rounded-lg shadow-sm border border-[var(--color-border)] p-6 sm:p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-accent-primary)] mx-auto mb-4"></div>
          <p className="text-lg text-[var(--color-text-secondary)]">Loading results...</p>
        </div>
      </div>
    );
  }

  // Check if question attempts exist
  if (!attempt.questionAttempts || attempt.questionAttempts.length === 0) {
    console.log('QuizResults: No question attempts found - showing no answers message');
    return (
      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        <div className="bg-[var(--color-bg-surface)] rounded-lg shadow-sm border border-[var(--color-border)] p-6 sm:p-8 text-center">
          <div className="text-6xl mb-4">🤔</div>
          <h1 className="text-3xl font-bold text-[var(--color-text-primary)] mb-2">No Answers Submitted</h1>
          <p className="text-[var(--color-text-secondary)] mb-6">It looks like no questions were answered before completing the quiz.</p>
          
          <div className="bg-[var(--color-accent-warning)]/10 border border-[var(--color-accent-warning)]/30 rounded-lg p-4 mb-6">
            <p className="text-[var(--color-accent-warning)] text-sm">
              <strong>Note:</strong> You need to answer at least one question to see your results.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
            {onRetake && (
              <button
                onClick={onRetake}
                className="px-6 py-3 bg-[var(--color-accent-primary)] text-[var(--color-text-inverse)] rounded-lg hover:bg-[var(--color-accent-primary)]/80 transition-colors"
              >
                Try Again
              </button>
            )}
            
            <Link
              to="/quiz"
              className="px-6 py-3 border-2 border-[var(--color-border)] text-[var(--color-text-secondary)] rounded-lg hover:border-[var(--color-accent-primary)]/50 transition-colors"
            >
              Back to Quizzes
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const percentage = attempt.score && attempt.totalPoints 
    ? Math.round((attempt.score / attempt.totalPoints) * 100) 
    : 0;
  
  const correctAnswers = attempt.questionAttempts.filter(qa => qa.isCorrect).length;
  const totalQuestions = attempt.questionAttempts.length;
  const wrongAnswers = attempt.questionAttempts.filter(qa => !qa.isCorrect);
  
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-[var(--color-accent-success)]';
    if (score >= 60) return 'text-[var(--color-accent-warning)]';
    return 'text-[var(--color-accent-error)]';
  };

  const getScoreEmoji = (score: number) => {
    if (score >= 90) return '🎉';
    if (score >= 80) return '🎯';
    if (score >= 70) return '👍';
    if (score >= 60) return '😊';
    if (score >= 50) return '😐';
    return '😔';
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'results':
        return (
          <div className="bg-[var(--color-bg-surface)] rounded-lg shadow-sm border border-[var(--color-border)] p-4 sm:p-6 text-center">
            <div className="text-4xl sm:text-6xl mb-4">{getScoreEmoji(percentage)}</div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[var(--color-text-primary)] mb-2">Quiz Completed!</h1>
            <p className="text-sm sm:text-base text-[var(--color-text-secondary)] mb-4 sm:mb-6">Here's how you performed</p>
            
            {/* Score Display - Mobile Optimized */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-4 sm:mb-6">
              <div className="text-center">
                <div className={`text-2xl sm:text-3xl lg:text-4xl font-bold ${getScoreColor(percentage)}`}>
                  {percentage}%
                </div>
                <div className="text-xs sm:text-sm text-[var(--color-text-secondary)]">Score</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[var(--color-accent-primary)]">
                  {attempt.score || 0}
                </div>
                <div className="text-xs sm:text-sm text-[var(--color-text-secondary)]">Points</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[var(--color-accent-success)]">
                  {correctAnswers}
                </div>
                <div className="text-xs sm:text-sm text-[var(--color-text-secondary)]">Correct</div>
              </div>
            </div>

            {/* Performance Summary - Mobile Optimized */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div className="bg-[var(--color-bg-muted)] rounded-lg p-3 sm:p-4">
                <div className="text-lg sm:text-xl lg:text-2xl font-bold text-[var(--color-text-primary)]">{totalQuestions}</div>
                <div className="text-xs sm:text-sm text-[var(--color-text-secondary)]">Total Questions</div>
              </div>
              
              <div className="bg-[var(--color-bg-muted)] rounded-lg p-3 sm:p-4">
                <div className="text-lg sm:text-xl lg:text-2xl font-bold text-[var(--color-text-primary)]">
                  {attempt.timeTaken ? formatTime(attempt.timeTaken) : 'N/A'}
                </div>
                <div className="text-xs sm:text-sm text-[var(--color-text-secondary)]">Time Taken</div>
              </div>
              
              <div className="bg-[var(--color-bg-muted)] rounded-lg p-3 sm:p-4">
                <div className="text-lg sm:text-xl lg:text-2xl font-bold text-[var(--color-text-primary)]">
                  {attempt.timeTaken && totalQuestions 
                    ? formatTime(Math.floor(attempt.timeTaken / totalQuestions))
                    : 'N/A'
                  }
                </div>
                <div className="text-xs sm:text-sm text-[var(--color-text-secondary)]">Avg. per Question</div>
              </div>
            </div>

            {/* Action Buttons - Mobile Optimized */}
            <div className="flex flex-col space-y-3">
              <Link
                to="/quiz"
                className="px-4 sm:px-6 py-3 bg-[var(--color-accent-primary)] text-[var(--color-text-inverse)] rounded-lg hover:bg-[var(--color-accent-primary)]/80 transition-colors text-sm sm:text-base"
              >
                Take Another Quiz
              </Link>
              
              {onRetake && (
                <button
                  onClick={onRetake}
                  className="px-4 sm:px-6 py-3 bg-[var(--color-text-secondary)] text-[var(--color-text-inverse)] rounded-lg hover:bg-[var(--color-text-secondary)]/80 transition-colors text-sm sm:text-base"
                >
                  Retake This Quiz
                </button>
              )}
              
              <Link
                to="/"
                className="px-4 sm:px-6 py-3 border-2 border-[var(--color-border)] text-[var(--color-text-secondary)] rounded-lg hover:border-[var(--color-accent-primary)]/50 transition-colors text-sm sm:text-base"
              >
                Back to Home
              </Link>
            </div>
          </div>
        );

      case 'breakdown':
        return (
          <div className="bg-[var(--color-bg-surface)] rounded-lg shadow-sm border border-[var(--color-border)] p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold text-[var(--color-text-primary)] mb-4">Question Breakdown</h2>
            
            <div className="space-y-3 sm:space-y-4">
              {attempt.questionAttempts.map((questionAttempt, index) => {
                // Find the question details from the attempt
                const question = attempt.quiz?.questions?.find(q => q.questionId === questionAttempt.questionId)?.question;
                const englishTranslation = question?.translations?.find((t: QuestionTranslation) => t.language === 'en');
                const hindiTranslation = question?.translations?.find((t: QuestionTranslation) => t.language === 'hi');
                
                return (
                  <div
                    key={questionAttempt.id}
                    className={`p-3 sm:p-4 rounded-lg border-2 ${
                      questionAttempt.isCorrect
                        ? 'border-[var(--color-accent-success)]/30 bg-[var(--color-accent-success)]/10'
                        : 'border-[var(--color-accent-error)]/30 bg-[var(--color-accent-error)]/10'
                    }`}
                  >
                    <div className="space-y-3">
                      {/* Question Header */}
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-[var(--color-text-secondary)]">
                          Question {index + 1}
                        </span>
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            questionAttempt.isCorrect
                              ? 'bg-[var(--color-accent-success)]/20 text-[var(--color-accent-success)] border border-[var(--color-accent-success)]/30'
                              : 'bg-[var(--color-accent-error)]/20 text-[var(--color-accent-error)] border border-[var(--color-accent-error)]/30'
                          }`}
                        >
                          {questionAttempt.isCorrect ? 'Correct' : 'Incorrect'}
                        </span>
                      </div>
                      
                      {/* Question Text in English */}
                      {englishTranslation && (
                        <div className="text-sm text-[var(--color-text-primary)] font-medium leading-relaxed">
                          {englishTranslation.questionText}
                        </div>
                      )}
                      
                      {/* Question Text in Hindi */}
                      {hindiTranslation && hindiTranslation.questionText !== englishTranslation?.questionText && (
                        <div className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                          {hindiTranslation.questionText}
                        </div>
                      )}
                      
                      {/* Options */}
                      {englishTranslation && (
                        <div className="space-y-2">
                          <div className="text-xs text-[var(--color-text-secondary)] font-medium">Options:</div>
                          {['A', 'B', 'C', 'D'].map((option) => {
                            const optionText = englishTranslation[`option${option}` as keyof typeof englishTranslation] as string;
                            const isCorrect = option === englishTranslation.correctOptionKey;
                            const isSelected = questionAttempt.selectedOption === option;
                            
                            return (
                              <div
                                key={option}
                                className={`p-2 rounded text-sm ${
                                  isCorrect
                                    ? 'bg-[var(--color-accent-success)]/20 text-[var(--color-accent-success)] border border-[var(--color-accent-success)]/30'
                                    : isSelected
                                    ? 'bg-[var(--color-accent-error)]/20 text-[var(--color-accent-error)] border border-[var(--color-accent-error)]/30'
                                    : 'bg-[var(--color-bg-muted)] text-[var(--color-text-secondary)]'
                                }`}
                              >
                                <span className="font-medium">{option})</span> {optionText}
                                {isCorrect && <span className="ml-2">✅</span>}
                                {isSelected && !isCorrect && <span className="ml-2">❌</span>}
                              </div>
                            );
                          })}
                        </div>
                      )}
                      
                      {/* Explanation - For ALL questions */}
                      {englishTranslation?.explanation && (
                        <div className="mt-3 p-3 bg-[var(--color-bg-muted)] rounded-lg">
                          <div className="text-xs text-[var(--color-text-secondary)] font-medium mb-1">Explanation:</div>
                          <div className="text-sm text-[var(--color-text-primary)] leading-relaxed">
                            {englishTranslation.explanation}
                          </div>
                          {/* Hindi explanation if available */}
                          {hindiTranslation?.explanation && hindiTranslation.explanation !== englishTranslation.explanation && (
                            <div className="text-sm text-[var(--color-text-secondary)] mt-2 leading-relaxed">
                              {hindiTranslation.explanation}
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* Time spent and selected answer */}
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs text-[var(--color-text-secondary)]">
                        <div>
                          Your Answer: <strong className="text-[var(--color-text-primary)]">{questionAttempt.selectedOption || 'Not answered'}</strong>
                        </div>
                        <div>Time: {questionAttempt.timeSpent ? formatTime(questionAttempt.timeSpent) : '0:00'}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );

      case 'insights':
        return (
          <div className="bg-[var(--color-bg-surface)] rounded-lg shadow-sm border border-[var(--color-border)] p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-semibold text-[var(--color-text-primary)] mb-4">Performance Insights</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <h3 className="font-medium text-[var(--color-text-primary)] mb-3">Strengths</h3>
                <ul className="space-y-2 text-sm text-[var(--color-text-secondary)]">
                  {percentage >= 80 && (
                    <li className="flex items-center">
                      <span className="text-[var(--color-accent-success)] mr-2">✓</span>
                      Excellent overall performance
                    </li>
                  )}
                  {percentage >= 70 && (
                    <li className="flex items-center">
                      <span className="text-[var(--color-accent-success)] mr-2">✓</span>
                      Good understanding of the material
                    </li>
                  )}
                  {correctAnswers > totalQuestions * 0.6 && (
                    <li className="flex items-center">
                      <span className="text-[var(--color-accent-success)] mr-2">✓</span>
                      Strong knowledge retention
                    </li>
                  )}
                  {wrongAnswers.length === 0 && (
                    <li className="flex items-center">
                      <span className="text-[var(--color-accent-success)] mr-2">✓</span>
                      Perfect score - outstanding work!
                    </li>
                  )}
                </ul>
              </div>
              
              <div>
                <h3 className="font-medium text-[var(--color-text-primary)] mb-3">Areas for Improvement</h3>
                <ul className="space-y-2 text-sm text-[var(--color-text-secondary)]">
                  {percentage < 80 && (
                    <li className="flex items-center">
                      <span className="text-[var(--color-accent-warning)] mr-2">⚠</span>
                      Review incorrect answers
                    </li>
                  )}
                  {percentage < 70 && (
                    <li className="flex items-center">
                      <span className="text-[var(--color-accent-warning)] mr-2">⚠</span>
                      Focus on weak areas
                    </li>
                  )}
                  {attempt.timeTaken && attempt.timeTaken > (totalQuestions * 60) && (
                    <li className="flex items-center">
                      <span className="text-[var(--color-accent-warning)] mr-2">⚠</span>
                      Work on time management
                    </li>
                  )}
                  {wrongAnswers.length > 0 && (
                    <li className="flex items-center">
                      <span className="text-[var(--color-accent-warning)] mr-2">⚠</span>
                      {wrongAnswers.length} question(s) need review
                    </li>
                  )}
                </ul>
              </div>
            </div>
            
            {/* Additional Insights */}
            <div className="mt-6 p-4 bg-[var(--color-bg-muted)] rounded-lg">
              <h4 className="font-medium text-[var(--color-text-primary)] mb-2">Quick Tips</h4>
              <ul className="space-y-1 text-sm text-[var(--color-text-secondary)]">
                <li>• Review wrong answers to understand your mistakes</li>
                <li>• Focus on topics where you scored lower</li>
                <li>• Practice similar questions to improve</li>
                <li>• Take notes on explanations for future reference</li>
              </ul>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-3 sm:p-4 lg:p-6">
      {/* Tab Navigation - Mobile Optimized */}
      <div className="bg-[var(--color-bg-surface)] rounded-lg shadow-sm border border-[var(--color-border)] p-3 sm:p-4 mb-4 sm:mb-6">
        <div className="flex gap-1 sm:gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('results')}
            className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0 ${
              activeTab === 'results'
                ? 'bg-[var(--color-accent-primary)] text-[var(--color-text-inverse)]'
                : 'bg-[var(--color-bg-muted)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-muted)]/80'
            }`}
          >
            Quiz Results
          </button>
          <button
            onClick={() => setActiveTab('breakdown')}
            className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0 ${
              activeTab === 'breakdown'
                ? 'bg-[var(--color-accent-primary)] text-[var(--color-text-inverse)]'
                : 'bg-[var(--color-bg-muted)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-muted)]/80'
            }`}
          >
            Breakdown {wrongAnswers.length > 0 && `(${wrongAnswers.length})`}
          </button>
          <button
            onClick={() => setActiveTab('insights')}
            className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0 ${
              activeTab === 'insights'
                ? 'bg-[var(--color-accent-primary)] text-[var(--color-text-inverse)]'
                : 'bg-[var(--color-bg-muted)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-muted)]/80'
            }`}
          >
            Insights
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {renderTabContent()}
    </div>
  );
}
