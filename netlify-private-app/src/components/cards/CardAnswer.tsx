import type { CardProps } from "../../types/card";
import { AudioButton } from "./AudioButton";

export function CardAnswer({ card, onComplete }: Pick<CardProps, "card" | "onComplete">) {
  return <section aria-live="polite">
    <h2>{card.word}</h2><strong>{card.meaningKo}</strong>
    <AudioButton text={card.word} />
    <p>{card.sampleSentence.en}</p><small>{card.sampleSentence.ko}</small>
    <div><button type="button" onClick={() => onComplete("known")}>알겠어요</button><button type="button" onClick={() => onComplete("review")}>다시 볼래요</button></div>
  </section>;
}
