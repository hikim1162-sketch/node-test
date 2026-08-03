import type { CardProps } from "../../types/card";
import { CardAnswer } from "./CardAnswer";
import { ChoiceOptions } from "./ChoiceOptions";

export function AttributeCard({ card, session, onAnswer, onReveal, onComplete }: CardProps) {
  const answered = session.phase !== "prompt";
  if (["revealed", "completed"].includes(session.phase)) return <CardAnswer card={card} onComplete={onComplete} />;
  return <article data-card-type="attribute">
    <h2>Which one is {card.word}?</h2>
    <ChoiceOptions options={card.comparisonPair ?? []} selected={session.selectedAnswer} disabled={answered} onSelect={onAnswer} />
    {answered && <p role="status">{session.correct ? "맞았어요!" : `정답은 ${card.word}예요.`} <button type="button" onClick={onReveal}>설명 보기</button></p>}
  </article>;
}
