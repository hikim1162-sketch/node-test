export type LearningMode = "suneung" | "middle" | "kids";
export type WordStatusValue = "known" | "confused" | "unknown";
export type QuestionType = "word-to-meaning" | "meaning-to-word" | "image-to-word" | "sentence-blank";

export interface VocabWord {
  id: string;
  mode: LearningMode;
  course: string;
  day: number;
  order: number;
  word: string;
  meaningKo: string;
  pronunciation: string;
  exampleEn: string;
  exampleKo: string;
  audioUrl?: string | null;
  imageUrl?: string | null;
  level?: string;
  topic?: string;
}

export interface CourseDefinition {
  key: string;
  mode: LearningMode;
  label: string;
  description: string;
  daySize: number;
  totalDays: number;
  questionTypes: QuestionType[];
  words: VocabWord[];
}

export interface WordStatus {
  status: WordStatusValue;
  mode: LearningMode;
  course: string;
  day: number;
  date: string;
  updatedAt: string;
}

export interface WrongRecord {
  wordId: string;
  mode: LearningMode;
  course: string;
  day: number;
  source: "test" | "quick-study";
  count: number;
  lastWrongAt: string;
  resolvedAt: string | null;
  reviewedAt?: string | null;
}

export interface TestRecord {
  mode: LearningMode;
  series: string;
  day: number;
  date: string;
  score: number;
  total: number;
  completed: boolean;
}

export interface ProgressState {
  statuses: Record<string, WordStatus>;
  wrong: Record<string, WrongRecord>;
  tests: TestRecord[];
  savedWords: string[];
  completedDays: Record<string, { series: string; day: number; completedAt: string | null }>;
  masteredWords: Record<string, { source: "known" | "review"; masteredAt: string | null }>;
}

export interface VocabQuestion {
  id: string;
  word: VocabWord;
  direction: QuestionType;
  prompt: string;
  label: string;
  imageUrl: string | null;
  choices: string[];
  answerIndex: number;
}
