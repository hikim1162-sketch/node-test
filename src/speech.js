const preferredUsVoiceNames = [
  "Microsoft Aria Online (Natural) - English (United States)",
  "Microsoft Jenny Online (Natural) - English (United States)",
  "Google US English",
  "Samantha",
];

const activeUtterances = new Set();

function reportSpeechError(message, error, onError) {
  console.error(`[speech] ${message}`, error || "");
  if (typeof onError === "function") onError(message, error);
}

function findUsEnglishVoice(synth) {
  const voices = synth.getVoices?.() || [];
  const usVoices = voices.filter(voice => /^en[-_]US$/i.test(voice.lang));
  return preferredUsVoiceNames
    .map(name => usVoices.find(voice => voice.name === name))
    .find(Boolean)
    || usVoices.find(voice => /natural|online/i.test(voice.name))
    || usVoices[0]
    || voices.find(voice => /^en/i.test(voice.lang))
    || null;
}

export function speakUsEnglish(text, options = {}) {
  const value = String(text || "").trim();
  const { rate = 0.9, repeat = 1, onError } = options;

  if (!value) {
    console.warn("[speech] 발음할 영어 텍스트가 비어 있습니다.");
    return false;
  }
  if (typeof window === "undefined"
    || !window.speechSynthesis
    || typeof window.SpeechSynthesisUtterance !== "function") {
    reportSpeechError("이 브라우저에서는 음성 재생을 지원하지 않습니다.", null, onError);
    return false;
  }

  const synth = window.speechSynthesis;
  try {
    if (synth.speaking || synth.pending || activeUtterances.size) synth.cancel();
    activeUtterances.clear();
    if (synth.paused) synth.resume();

    const voice = findUsEnglishVoice(synth);
    const count = Math.max(1, Math.min(10, Math.trunc(Number(repeat)) || 1));
    for (let index = 0; index < count; index += 1) {
      const utterance = new window.SpeechSynthesisUtterance(value);
      utterance.lang = "en-US";
      utterance.rate = Number.isFinite(Number(rate)) ? Number(rate) : 0.9;
      utterance.pitch = 1;
      if (voice) utterance.voice = voice;

      const release = () => activeUtterances.delete(utterance);
      utterance.onend = release;
      utterance.onerror = event => {
        release();
        if (event.error !== "canceled" && event.error !== "interrupted") {
          reportSpeechError(`"${value}" 음성 재생에 실패했습니다.`, event.error, onError);
        }
      };
      activeUtterances.add(utterance);

      // Keep this call in the original click task so mobile browsers recognize
      // it as a user-initiated playback request.
      synth.speak(utterance);
    }
    return true;
  } catch (error) {
    activeUtterances.clear();
    reportSpeechError(`"${value}" 음성 재생을 시작하지 못했습니다.`, error, onError);
    return false;
  }
}
