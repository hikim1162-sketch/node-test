import { useState } from "react";
import type { CardSession, VocabularyCard } from "../../types/card";
import { CardRenderer } from "./CardRenderer";

export function CardContainer({ card, onFinished }: { card: VocabularyCard; onFinished?: (result: "known" | "review") => void }) {
  const [session, setSession] = useState<CardSession>({ phase:"prompt", hintUsed:false, attempts:0 });
  return <CardRenderer card={card} session={session}
    onAnswer={(answer) => setSession((old) => ({ ...old, phase:"answered", selectedAnswer:answer, correct:answer === card.word, attempts:old.attempts + 1 }))}
    onReveal={() => setSession((old) => ({ ...old, phase:"revealed" }))}
    onHint={() => setSession((old) => ({ ...old, hintUsed:true }))}
    onComplete={(result) => { setSession((old) => ({ ...old, phase:"completed" })); onFinished?.(result); }} />;
}
