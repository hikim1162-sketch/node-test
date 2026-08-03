export function AudioButton({ text }: { text: string }) {
  const speak = () => {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 0.85;
    window.speechSynthesis.speak(utterance);
  };
  return <button type="button" onClick={speak} aria-label={`${text} 발음 듣기`}>듣기</button>;
}
