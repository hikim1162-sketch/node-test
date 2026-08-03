export type CardType =
  | "noun"
  | "action"
  | "emotion"
  | "attribute"
  | "sentence-assisted";

export type ImageSuitability = "high" | "medium" | "low" | "blocked";
export type CardStatus = "ready" | "needs_image" | "sentence_assisted" | "exclude_from_image_only";
export type CardPhase = "prompt" | "answered" | "revealed" | "completed";

export interface CardOption {
  value: string;
  label?: string;
  imageUrl?: string;
}

export interface VocabularyCard {
  id: string;
  word: string;
  meaningKo: string;
  category: "noun" | "action" | "emotion" | "attribute";
  cardType: CardType;
  imageUrl?: string;
  imageSuitability: ImageSuitability;
  promptType: "image-recall" | "multiple-choice" | "sentence-blank" | "visual-choice";
  imageAlt: string;
  sampleSentence: { en: string; ko: string };
  options?: CardOption[];
  comparisonPair?: CardOption[];
  status: CardStatus;
}

export interface CardSession {
  phase: CardPhase;
  selectedAnswer?: string;
  correct?: boolean;
  hintUsed: boolean;
  attempts: number;
}

export interface CardProps {
  card: VocabularyCard;
  session: CardSession;
  onAnswer: (answer: string) => void;
  onReveal: () => void;
  onHint: () => void;
  onComplete: (result: "known" | "review") => void;
}
