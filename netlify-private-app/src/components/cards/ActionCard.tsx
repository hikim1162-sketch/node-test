import type { CardProps } from "../../types/card";
import { CardAnswer } from "./CardAnswer";
import { ChoiceOptions } from "./ChoiceOptions";

export function ActionCard({ card, session, onAnswer, onReveal, onComplete }: CardProps) {
  const answered = session.phase !== "prompt";
  if (["revealed", "completed"].includes(session.phase)) return <CardAnswer card={card} onComplete={onComplete} />;
  return <article data-card-type="action">
    {card.imageUrl && <img src={card.imageUrl} alt={answered ? card.imageAlt : "한 가지 행동을 보여주는 그림"} />}
    <h2>아이는 무엇을 하고 있나요?</h2>
    <ChoiceOptions options={card.options ?? []} selected={session.selectedAnswer} disabled={answered} onSelect={onAnswer} />
    {answered && <p role="status">{session.correct ? "맞았어요!" : `정답은 ${card.word}예요.`} <button type="button" onClick={onReveal}>설명 보기</button></p>}
  </article>;
}
