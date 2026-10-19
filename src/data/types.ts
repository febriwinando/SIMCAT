export type ExamCategory = 'CPNS' | 'PPPK' | 'POLRI' | 'TNI';

export interface AnswerOption {
  key: 'A' | 'B' | 'C' | 'D' | 'E';
  text: string;
  score: number; // 0 or 5 for standard, 1-5 for TKP/Manajerial
}

export interface Question {
  id: number;
  subtest: string; // 'TWK' | 'TIU' | 'TKP' | 'Manajerial' | 'Sosio-Kultural' | 'Akademik' | 'Psikotes' | etc.
  subtestLabel: string;
  questionText: string;
  codeSnippet?: string;
  image?: string;
  options: AnswerOption[];
  correctAnswer: 'A' | 'B' | 'C' | 'D' | 'E'; // For TKP, highest score option
  explanation: string;
  tipsTrick?: string;
}

export interface SubtestPassingGrade {
  code: string;
  name: string;
  minScore: number;
  maxScore: number;
  description: string;
}

export interface ExamPackage {
  id: string;
  slug: string;
  title: string;
  category: ExamCategory;
  badgeClass: string;
  description: string;
  yearEdition: string;
  durationMinutes: number;
  totalQuestions: number;
  passingGrades: SubtestPassingGrade[];
  rules: string[];
  questions: Question[];
}

export interface UserExamState {
  packageSlug: string;
  answers: Record<number, 'A' | 'B' | 'C' | 'D' | 'E'>;
  doubtful: Record<number, boolean>;
  currentIndex: number;
  timeRemainingSeconds: number;
  isFinished: boolean;
  scoreResult?: ExamReport;
}

export interface SubtestReport {
  code: string;
  name: string;
  score: number;
  minScore: number;
  maxScore: number;
  isPassed: boolean;
  totalAnswered: number;
  totalCorrect: number;
  totalQuestions: number;
}

export interface ExamReport {
  packageSlug: string;
  packageTitle: string;
  category: ExamCategory;
  totalScore: number;
  maxPossibleScore: number;
  isAllPassed: boolean;
  subtestReports: SubtestReport[];
  totalAnswered: number;
  totalUnanswered: number;
  totalDoubtful: number;
  durationTakenSeconds: number;
  completedAt: string;
}
