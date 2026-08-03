import type { CardProps } from "../../types/card";
import { ChoiceOptions } from "./ChoiceOptions";
import { AudioButton } from "./AudioButton";

export function SentenceAssistedCard({ card, session, onAnswer }: CardProps) {
  const answered = session.phase !== "prompt";
  const prompt = card.sampleSentence.en.replace(new RegExp(`\\b${card.word}\\b`, "i"), "____");
  return <article data-card-type="sentence-assisted">
    <p>{prompt}</p><AudioButton text={card.sampleSentence.en} />
    <ChoiceOptions options={card.options ?? [{ value: card.word }]} selected={session.selectedAnswer} disabled={answered} onSelect={onAnswer} />
    {answered && <p role="status">{session.correct ? "맞았어요!" : `정답은 ${card.word}예요.`}</p>}
  </article>;
}
