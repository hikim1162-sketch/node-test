import type { CardProps } from "../../types/card";
import { CardAnswer } from "./CardAnswer";
import { ChoiceOptions } from "./ChoiceOptions";

export function EmotionCard({ card, session, onAnswer, onReveal, onComplete }: CardProps) {
  const answered = session.phase !== "prompt";
  if (["revealed", "completed"].includes(session.phase)) return <CardAnswer card={card} onComplete={onComplete} />;
  const prompt = card.sampleSentence.en.replace(new RegExp(`\\b${card.word}\\b`, "i"), "____");
  return <article data-card-type="emotion">
    {card.imageUrl && <img src={card.imageUrl} alt={answered ? card.imageAlt : "아이의 기분을 보여주는 상황 그림"} />}
    <h2>{prompt}</h2>
    <ChoiceOptions options={card.options ?? []} selected={session.selectedAnswer} disabled={answered} onSelect={onAnswer} />
    {answered && <p role="status">{session.correct ? "맞았어요!" : `정답은 ${card.word}예요.`} <button type="button" onClick={onReveal}>설명 보기</button></p>}
  </article>;
}
