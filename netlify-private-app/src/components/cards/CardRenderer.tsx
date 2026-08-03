import type { CardProps, CardType, VocabularyCard } from "../../types/card";
import { ActionCard } from "./ActionCard";
import { AttributeCard } from "./AttributeCard";
import { EmotionCard } from "./EmotionCard";
import { NounCard } from "./NounCard";
import { SentenceAssistedCard } from "./SentenceAssistedCard";

const usableImage = (card: VocabularyCard) => card.status === "ready" && card.imageSuitability === "high" && Boolean(card.imageUrl);
const resolveCardType = (card: VocabularyCard): CardType => {
  if (card.cardType === "noun" && !usableImage(card)) return "sentence-assisted";
  if (card.cardType === "action" && !card.imageUrl) return "sentence-assisted";
  if (card.cardType === "emotion" && !card.options?.length) return "sentence-assisted";
  if (card.cardType === "attribute" && (card.comparisonPair?.length ?? 0) < 2) return "sentence-assisted";
  return card.cardType;
};

export function CardRenderer(props: CardProps) {
  switch (resolveCardType(props.card)) {
    case "noun": return <NounCard {...props} />;
    case "action": return <ActionCard {...props} />;
    case "emotion": return <EmotionCard {...props} />;
    case "attribute": return <AttributeCard {...props} />;
    default: return <SentenceAssistedCard {...props} />;
  }
}
