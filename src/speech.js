const preferredUsVoiceNames = [
  "Microsoft Aria Online (Natural) - English (United States)",
  "Microsoft Jenny Online (Natural) - English (United States)",
  "Google US English",
  "Samantha",
];

const activeUtterances = new Set();
let activeAudio = null;
let cachedVoices = [];
let initialVoiceCount = null;
const diagnosticEvents = [];

function synthSnapshot() {
  const synth = typeof window !== "undefined" ? window.speechSynthesis : null;
  return {
    speaking: Boolean(synth?.speaking),
    pending: Boolean(synth?.pending),
    paused: Boolean(synth?.paused),
  };
}

function trace(event, detail = {}) {
  const record = {
    event,
    at: new Date().toISOString(),
    ...detail,
    ...synthSnapshot(),
  };
  diagnosticEvents.push(record);
  if (diagnosticEvents.length > 200) diagnosticEvents.shift();
  console.debug("[speech]", record);
}

function refreshVoices(event = "voices-read") {
  if (typeof window === "undefined" || !window.speechSynthesis) return [];
  cachedVoices = window.speechSynthesis.getVoices?.() || [];
  if (initialVoiceCount === null) initialVoiceCount = cachedVoices.length;
  trace(event, {
    initialVoiceCount,
    voiceCount: cachedVoices.length,
    enUsVoiceCount: cachedVoices.filter(voice => /^en[-_]US$/i.test(voice.lang)).length,
  });
  return cachedVoices;
}

if (typeof window !== "undefined" && window.speechSynthesis) {
  refreshVoices("voices-initial");
  window.speechSynthesis.addEventListener?.("voiceschanged", () => refreshVoices("voiceschanged"));
}

function reportSpeechError(message, error, onError) {
  console.error(`[speech] ${message}`, error || "");
  if (typeof onError === "function") onError(message, error);
}

function findUsEnglishVoice() {
  const voices = refreshVoices("voices-at-click");
  const usVoices = voices.filter(voice => /^en[-_]US$/i.test(voice.lang));
  return preferredUsVoiceNames
    .map(name => usVoices.find(voice => voice.name === name))
    .find(Boolean)
    || usVoices.find(voice => /natural|online/i.test(voice.name))
    || usVoices[0]
    || voices.find(voice => /^en/i.test(voice.lang))
    || null;
}

function stopCurrentPlayback() {
  if (activeAudio) {
    activeAudio.pause();
    activeAudio.removeAttribute("src");
    activeAudio.load();
    activeAudio = null;
  }
  const synth = typeof window !== "undefined" ? window.speechSynthesis : null;
  if (synth && (synth.speaking || synth.pending || activeUtterances.size)) synth.cancel();
  activeUtterances.clear();
}

function speakWithWebSpeech(value, { rate, repeat, onError }) {
  const synth = window.speechSynthesis;
  try {
    if (synth.paused) synth.resume();
    const voice = findUsEnglishVoice();
    const voiceName = voice?.name || null;
    const count = Math.max(1, Math.min(10, Math.trunc(Number(repeat)) || 1));

    for (let index = 0; index < count; index += 1) {
      const utterance = new window.SpeechSynthesisUtterance(value);
      utterance.lang = "en-US";
      utterance.rate = Number.isFinite(Number(rate)) ? Number(rate) : 0.9;
      utterance.pitch = 1;
      if (voice) utterance.voice = voice;

      const detail = { text: value, voiceName, lang: utterance.lang };
      const release = () => activeUtterances.delete(utterance);
      utterance.onstart = () => trace("utterance-start", detail);
      utterance.onend = () => {
        trace("utterance-end", detail);
        release();
      };
      utterance.onpause = () => trace("utterance-pause", detail);
      utterance.onresume = () => trace("utterance-resume", detail);
      utterance.onerror = event => {
        trace("utterance-error", { ...detail, error: event.error });
        release();
        if (event.error !== "canceled" && event.error !== "interrupted") {
          reportSpeechError(`"${value}" 음성 재생에 실패했습니다.`, event.error, onError);
        }
      };
      activeUtterances.add(utterance);
      synth.speak(utterance);
      trace("utterance-queued", detail);
    }
    return true;
  } catch (error) {
    activeUtterances.clear();
    reportSpeechError(`"${value}" 음성 재생을 시작하지 못했습니다.`, error, onError);
    return false;
  }
}

function playDictionaryAudio(value, options) {
  const audio = new window.Audio();
  const detail = { text: value, source: "NAVER pronunciation MP3" };
  audio.preload = "auto";
  audio.src = `/api/naver-dictionary?word=${encodeURIComponent(value.toLowerCase())}&audio=1`;
  audio.onloadstart = () => trace("audio-loadstart", detail);
  audio.onplaying = () => trace("audio-playing", { ...detail, currentTime: audio.currentTime, readyState: audio.readyState });
  audio.onended = () => {
    trace("audio-ended", { ...detail, duration: audio.duration });
    if (activeAudio === audio) activeAudio = null;
  };
  audio.onpause = () => trace("audio-pause", { ...detail, currentTime: audio.currentTime });
  audio.onerror = () => {
    const error = audio.error;
    trace("audio-error", { ...detail, code: error?.code, message: error?.message });
    if (activeAudio !== audio) return;
    activeAudio = null;
    speakWithWebSpeech(value, options);
  };
  activeAudio = audio;

  // This stays in the original click task, preserving mobile playback permission.
  const playPromise = audio.play();
  playPromise?.then(() => trace("audio-play-promise-resolved", { ...detail, readyState: audio.readyState }))
    .catch(error => {
      trace("audio-play-promise-rejected", { ...detail, error: error?.name, message: error?.message });
      if (activeAudio !== audio) return;
      activeAudio = null;
      speakWithWebSpeech(value, options);
    });
  return true;
}

export function speakUsEnglish(text, options = {}) {
  const value = String(text || "").trim();
  const { rate = 0.9, repeat = 1, onError } = options;

  if (!value) {
    console.warn("[speech] 발음할 영어 텍스트가 비어 있습니다.");
    return false;
  }
  if (typeof window === "undefined") {
    reportSpeechError("브라우저 밖에서는 음성을 재생할 수 없습니다.", null, onError);
    return false;
  }

  stopCurrentPlayback();
  trace("request", { text: value });

  if (typeof window.Audio === "function" && /^[a-z][a-z'-]{0,48}$/i.test(value)) {
    return playDictionaryAudio(value, { rate, repeat, onError });
  }
  if (window.speechSynthesis && typeof window.SpeechSynthesisUtterance === "function") {
    return speakWithWebSpeech(value, { rate, repeat, onError });
  }
  reportSpeechError("이 브라우저에서는 음성 재생을 지원하지 않습니다.", null, onError);
  return false;
}

export function getSpeechDiagnostics() {
  return {
    userAgent: typeof navigator !== "undefined" ? navigator.userAgent : null,
    platform: typeof navigator !== "undefined" ? navigator.platform : null,
    visibilityState: typeof document !== "undefined" ? document.visibilityState : null,
    secureContext: typeof window !== "undefined" ? window.isSecureContext : null,
    webSpeechSupported: typeof window !== "undefined"
      && Boolean(window.speechSynthesis)
      && typeof window.SpeechSynthesisUtterance === "function",
    htmlAudioSupported: typeof window !== "undefined" && typeof window.Audio === "function",
    initialVoiceCount,
    voiceCount: cachedVoices.length,
    enUsVoiceCount: cachedVoices.filter(voice => /^en[-_]US$/i.test(voice.lang)).length,
    voices: cachedVoices.map(voice => ({ name: voice.name, lang: voice.lang, localService: voice.localService })),
    activeAudio: activeAudio ? {
      src: activeAudio.currentSrc || activeAudio.src,
      currentTime: activeAudio.currentTime,
      duration: activeAudio.duration,
      paused: activeAudio.paused,
      readyState: activeAudio.readyState,
    } : null,
    activeUtteranceCount: activeUtterances.size,
    events: diagnosticEvents.slice(),
    ...synthSnapshot(),
  };
}

export function runWebSpeechDiagnostic({ text = "test", useUsVoice = false, timeoutMs = 5000 } = {}) {
  return new Promise(resolve => {
    const startedAt = performance.now();
    const report = {
      text,
      useUsVoice,
      voicesAtClick: refreshVoices("diagnostic-voices-at-click").map(voice => ({
        name: voice.name,
        lang: voice.lang,
        localService: voice.localService,
      })),
      selectedVoice: null,
      events: [],
      stateBefore: synthSnapshot(),
      stateAfterSpeak: null,
      stateAtFinish: null,
    };
    const finish = outcome => {
      if (report.outcome) return;
      report.outcome = outcome;
      report.elapsedMs = Math.round(performance.now() - startedAt);
      report.stateAtFinish = synthSnapshot();
      resolve(report);
    };

    if (typeof window === "undefined"
      || !window.speechSynthesis
      || typeof window.SpeechSynthesisUtterance !== "function") {
      finish("unsupported");
      return;
    }

    stopCurrentPlayback();
    const synth = window.speechSynthesis;
    const utterance = new window.SpeechSynthesisUtterance(String(text || "test"));
    utterance.lang = "en-US";
    if (useUsVoice) {
      const voice = findUsEnglishVoice();
      if (voice) {
        utterance.voice = voice;
        report.selectedVoice = { name: voice.name, lang: voice.lang, localService: voice.localService };
      }
    }
    const capture = (event, error = null) => {
      report.events.push({
        event,
        error,
        atMs: Math.round(performance.now() - startedAt),
        ...synthSnapshot(),
      });
    };
    utterance.onstart = () => capture("start");
    utterance.onpause = () => capture("pause");
    utterance.onresume = () => capture("resume");
    utterance.onerror = event => {
      capture("error", event.error);
      finish(`error:${event.error}`);
    };
    utterance.onend = () => {
      capture("end");
      finish("ended");
    };
    synth.speak(utterance);
    report.stateAfterSpeak = synthSnapshot();
    setTimeout(() => finish("timeout:no-end-event"), Math.max(1000, Number(timeoutMs) || 5000));
  });
}

if (typeof window !== "undefined") {
  window.valueTimeSpeechDiagnostics = {
    getReport: getSpeechDiagnostics,
    testDefaultVoice: options => runWebSpeechDiagnostic({ ...options, useUsVoice: false }),
    testUsVoice: options => runWebSpeechDiagnostic({ ...options, useUsVoice: true }),
  };
}
