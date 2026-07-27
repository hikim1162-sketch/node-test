const preferredUsVoiceNames = [
  "Microsoft Aria Online (Natural) - English (United States)",
  "Microsoft Jenny Online (Natural) - English (United States)",
  "Google US English",
  "Samantha",
];

let activeUtterance = null;

function findUsEnglishVoice() {
  const voices = window.speechSynthesis?.getVoices?.() || [];
  const usVoices = voices.filter((voice) => /^en[-_]US$/i.test(voice.lang));
  return preferredUsVoiceNames
    .map((name) => usVoices.find((voice) => voice.name === name))
    .find(Boolean)
    || usVoices.find((voice) => /natural|online/i.test(voice.name))
    || usVoices[0]
    || voices.find((voice) => /^en/i.test(voice.lang))
    || null;
}

export function speakUsEnglish(text) {
  const value = String(text || "").trim();
  if (!value || !("speechSynthesis" in window)) return false;
  const synth = window.speechSynthesis;
  synth.cancel();
  synth.resume();
  const utterance = new SpeechSynthesisUtterance(value);
  utterance.lang = "en-US";
  utterance.rate = 0.9;
  utterance.pitch = 1;
  const voice = findUsEnglishVoice();
  if (voice) utterance.voice = voice;
  utterance.onend = () => {
    if (activeUtterance === utterance) activeUtterance = null;
  };
  utterance.onerror = () => {
    if (activeUtterance === utterance) activeUtterance = null;
  };
  activeUtterance = utterance;
  synth.speak(utterance);
  return true;
}
