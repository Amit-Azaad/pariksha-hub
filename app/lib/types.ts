// Language Types
export type Language = 'en' | 'hi';

// Authentication and User Types
export interface User {
  id: number;
  email: string;
  name: string | null;
  googleId: string | null;
  avatar: string | null;
  role: UserRole;
  isEmailVerified: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  preferredLanguage?: Language;
}

// Use Prisma's generated enum instead of custom one
export type UserRole = 'USER' | 'ADMIN';

export interface GoogleOAuthProfile {
  id: string;
  email: string;
  name: string;
  picture: string;
  verified_email: boolean;
}

// Quiz System Types
export interface Question {
  id: number;
  questionType: string;
  category: string | null;
  difficulty: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  translations: QuestionTranslation[];
  tags: QuestionTag[];
}

// Helper type for questions with specific language translation
export interface QuestionWithTranslation {
  id: number;
  questionType: string;
  category: string | null;
  difficulty: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  translation: QuestionTranslation;
  tags: QuestionTag[];
}

export interface QuestionTranslation {
  id: number;
  questionId: number;
  language: string;
  questionText: string;
  explanation: string | null;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOptionKey: string;
}

export interface QuestionTag {
  id: number;
  questionId: number;
  tag: string;
}

export interface Quiz {
  id: number;
  title: string;
  description: string | null;
  type: string | null;
  category: string | null;
  timeLimit: number | null;
  isActive: boolean;
  isPublic: boolean;
  createdBy: number | null;
  createdAt: Date;
  updatedAt: Date;
  questions: QuizQuestion[];
  creator?: User;
}

export interface QuizQuestion {
  id: number;
  quizId: number;
  questionId: number;
  order: number;
  points: number;
  question?: Question;
}

export interface QuizAttempt {
  id: number;
  quizId: number;
  userId: number | null;
  guestId: string | null;
  score: number | null;
  totalPoints: number;
  timeTaken: number | null;
  startedAt: Date;
  completedAt: Date | null;
  isCompleted: boolean;
  user?: User;
  questionAttempts: QuestionAttempt[];
}

export interface QuestionAttempt {
  id: number;
  quizAttemptId: number;
  questionId: number;
  selectedOption: string | null;
  isCorrect: boolean | null;
  timeSpent: number | null;
  answeredAt: Date;
}

// Guest User Types
export interface GuestUser {
  id: string;
  createdAt: Date;
  lastActivity: Date;
}

export interface GuestProgress {
  quizId: number;
  answers: Record<number, string>; // questionId -> selectedOption
  timeSpent: Record<number, number>; // questionId -> timeSpent
  startedAt: Date;
  lastActivity: Date;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// CSV Upload Types
export interface CSVQuestionData {
  questionType: string;
  category: string;
  difficulty: string;
  tags: string;
  questionText_en: string;
  questionText_hi: string;
  explanation_en: string;
  explanation_hi: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOptionKey: string;
}

export interface CSVUploadResult {
  success: boolean;
  totalRows: number;
  successfulRows: number;
  failedRows: number;
  errors: Array<{
    row: number;
    error: string;
    data: CSVQuestionData;
  }>;
}
