import type { CardProps } from "../../types/card";
import { CardAnswer } from "./CardAnswer";
import { HintBar } from "./HintBar";

export function NounCard(props: CardProps) {
  const revealed = ["revealed", "completed"].includes(props.session.phase);
  return <article data-card-type="noun">
    <HintBar category={props.card.category} visible={props.session.hintUsed} onShow={props.onHint} />
    <img src={props.card.imageUrl} alt={revealed ? props.card.imageAlt : "영어 단어를 맞히기 위한 그림"} />
    {revealed ? <CardAnswer card={props.card} onComplete={props.onComplete} /> : <button type="button" onClick={props.onReveal}>정답 확인</button>}
  </article>;
}
