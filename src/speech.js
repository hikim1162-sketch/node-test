const preferredUsVoiceNames = [
  "Microsoft Aria Online (Natural) - English (United States)",
  "Microsoft Jenny Online (Natural) - English (United States)",
  "Google US English",
  "Samantha",
];

const activeUtterances = new Set();
let cachedVoices = [];
let initialVoiceCount = null;
const diagnosticEvents = [];
let voicesPromise = null;
let speakSequence = 0;

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

export function canUseSpeech() {
  return typeof window !== "undefined"
    && Boolean(window.speechSynthesis)
    && typeof window.SpeechSynthesisUtterance === "function";
}

export function initSpeechDebug() {
  if (!canUseSpeech()) {
    console.error("[speech] Web Speech API not supported");
    return false;
  }
  refreshVoices("voices-initial");
  if (!voicesPromise) {
    voicesPromise = new Promise(resolve => {
      if (cachedVoices.length) {
        resolve(cachedVoices);
        return;
      }
      let settled = false;
      const finish = event => {
        if (settled) return;
        settled = true;
        resolve(refreshVoices(event));
      };
      const timer = setTimeout(() => finish("voices-timeout"), 1500);
      window.speechSynthesis.addEventListener?.("voiceschanged", () => {
        clearTimeout(timer);
        finish("voiceschanged");
      }, { once: true });
    });
  }
  return true;
}

export async function waitForVoices(timeout = 1500) {
  if (!initSpeechDebug()) return [];
  const voices = refreshVoices("voices-before-wait");
  if (voices.length) return voices;
  return Promise.race([
    voicesPromise,
    new Promise(resolve => setTimeout(() => resolve(refreshVoices("voices-wait-timeout")), timeout)),
  ]);
}

if (canUseSpeech()) initSpeechDebug();

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

function utteranceState() {
  return {
    at: new Date().toISOString(),
    ...synthSnapshot(),
  };
}

function runSpeechAttempt(text, config, seq, timeoutMs = 2500) {
  return new Promise(resolve => {
    const synth = window.speechSynthesis;
    const utterance = new window.SpeechSynthesisUtterance(text);
    if (config.lang) utterance.lang = config.lang;
    if (config.voice) utterance.voice = config.voice;
    if (typeof config.rate === "number") utterance.rate = config.rate;
    if (typeof config.pitch === "number") utterance.pitch = config.pitch;
    if (typeof config.volume === "number") utterance.volume = config.volume;
    const meta = {
      seq,
      text,
      attempt: config.label,
      voiceName: config.voice?.name || null,
      voiceLang: config.voice?.lang || null,
      lang: config.lang || null,
      rate: utterance.rate,
      pitch: utterance.pitch,
      volume: utterance.volume,
    };
    let settled = false;
    const finish = result => {
      if (settled) return;
      settled = true;
      activeUtterances.delete(utterance);
      resolve(result);
    };
    utterance.onstart = () => trace("utterance-start", { ...meta, ...utteranceState() });
    utterance.onpause = () => trace("utterance-pause", { ...meta, ...utteranceState() });
    utterance.onresume = () => trace("utterance-resume", { ...meta, ...utteranceState() });
    utterance.onend = () => {
      trace("utterance-end", { ...meta, ...utteranceState() });
      finish({ ok: true, attempt: config.label });
    };
    utterance.onerror = event => {
      trace("utterance-error", { ...meta, error: event.error, ...utteranceState() });
      finish({ ok: false, attempt: config.label, error: event.error || "unknown" });
    };
    activeUtterances.add(utterance);
    trace("before-speak", { ...meta, ...utteranceState() });
    synth.speak(utterance);
    trace("after-speak", { ...meta, ...utteranceState() });
    setTimeout(() => trace("after-300ms", { ...meta, ...utteranceState() }), 300);
    setTimeout(() => trace("after-1500ms", { ...meta, ...utteranceState() }), 1500);
    setTimeout(() => {
      trace("utterance-timeout", { ...meta, ...utteranceState() });
      finish({ ok: false, attempt: config.label, error: "timeout" });
    }, timeoutMs);
  });
}

export async function speakEnglishDebug(text) {
  const value = String(text || "").trim();
  if (!value) {
    console.warn("[speech] skip empty text");
    return false;
  }
  if (!canUseSpeech()) {
    console.error("[speech] Web Speech API unavailable");
    return false;
  }

  const seq = ++speakSequence;
  const synth = window.speechSynthesis;
  const voices = await waitForVoices(1500);
  const enVoice = findUsEnglishVoice();
  trace("speech-request", {
    seq,
    text: value,
    voiceCount: voices.length,
    enUsVoiceCount: voices.filter(voice => /^en[-_]US$/i.test(voice.lang)).length,
    selectedVoice: enVoice ? { name: enVoice.name, lang: enVoice.lang } : null,
  });

  if (synth.paused) {
    trace("resume-before-speak", { seq });
    synth.resume();
  }
  if (synth.speaking || synth.pending || activeUtterances.size) {
    trace("cancel-before-request", { seq, activeUtteranceCount: activeUtterances.size });
    synth.cancel();
    activeUtterances.clear();
  }

  const attempts = [
    enVoice ? { label: "enVoice+lang", voice: enVoice, lang: "en-US", rate: 0.95, pitch: 1, volume: 1 } : null,
    { label: "lang-only", lang: "en-US", rate: 0.95, pitch: 1, volume: 1 },
    { label: "default", rate: 1, pitch: 1, volume: 1 },
  ].filter(Boolean);

  for (const attempt of attempts) {
    if (seq !== speakSequence) return false;
    trace("attempt-start", { seq, text: value, attempt: attempt.label });
    const result = await runSpeechAttempt(value, attempt, seq);
    if (result.ok) {
      trace("speech-success", { seq, text: value, ...result });
      return true;
    }
    trace("attempt-failed", { seq, text: value, ...result });
    if (synth.speaking || synth.pending || activeUtterances.size) {
      trace("cancel-after-failed-attempt", { seq, attempt: attempt.label });
      synth.cancel();
      activeUtterances.clear();
    }
  }
  console.error("[speech] all attempts failed", { seq, text: value });
  return false;
}

export function getSpeechDebugState() {
  return getSpeechDiagnostics();
}

function stopCurrentPlayback() {
  const synth = typeof window !== "undefined" ? window.speechSynthesis : null;
  if (synth && (synth.speaking || synth.pending || activeUtterances.size)) {
    trace("cancel-before-new-playback", { activeUtteranceCount: activeUtterances.size });
    synth.cancel();
  }
  activeUtterances.clear();
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
    activeUtteranceCount: activeUtterances.size,
    events: diagnosticEvents.slice(),
    ...synthSnapshot(),
  };
}

export function runWebSpeechDiagnostic({ text = "test", voiceMode = "lang-only", timeoutMs = 5000 } = {}) {
  return new Promise(resolve => {
    const startedAt = performance.now();
    const report = {
      text,
      voiceMode,
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
    if (voiceMode !== "none") utterance.lang = "en-US";
    if (voiceMode === "en-us") {
      const voice = findUsEnglishVoice();
      if (voice) {
        utterance.voice = voice;
        report.selectedVoice = { name: voice.name, lang: voice.lang, localService: voice.localService };
      }
    } else if (voiceMode === "default") {
      const voices = refreshVoices("diagnostic-default-voice");
      const voice = voices.find(item => item.default) || voices[0] || null;
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
    testNoVoiceNoLang: options => runWebSpeechDiagnostic({ ...options, voiceMode: "none" }),
    testLangOnly: options => runWebSpeechDiagnostic({ ...options, voiceMode: "lang-only" }),
    testUsVoice: options => runWebSpeechDiagnostic({ ...options, voiceMode: "en-us" }),
    testDefaultVoice: options => runWebSpeechDiagnostic({ ...options, voiceMode: "default" }),
  };
}

function installSpeechDiagnosticPanel() {
  const enabled = import.meta.env.DEV
    || new URLSearchParams(window.location.search).has("speech-diagnostics");
  if (typeof document === "undefined"
    || !enabled
    || document.querySelector("[data-speech-diagnostic-panel]")) return;

  const panel = document.createElement("section");
  panel.dataset.speechDiagnosticPanel = "true";
  panel.style.cssText = "position:fixed;z-index:2147483647;inset:12px;overflow:auto;padding:18px;border:2px solid #236b83;border-radius:14px;background:#fff;color:#172b34;font:14px/1.5 system-ui;box-shadow:0 12px 50px #0005";
  panel.innerHTML = `
    <header style="display:flex;justify-content:space-between;gap:12px;align-items:center">
      <div><b style="font-size:18px">Web Speech 기기 진단</b><p style="margin:4px 0">각 버튼을 한 번씩 누르고 실제 소리가 들렸는지 확인하세요.</p></div>
      <button type="button" data-speech-close style="font-size:20px">×</button>
    </header>
    <div data-speech-tests style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:8px;margin:14px 0">
      <button type="button" data-voice-mode="none">1. voice/lang 미지정</button>
      <button type="button" data-voice-mode="lang-only">2. lang=en-US만</button>
      <button type="button" data-voice-mode="en-us">3. en-US voice 지정</button>
      <button type="button" data-voice-mode="default">4. 기본 voice 지정</button>
    </div>
    <p data-speech-status role="status">테스트 대기 중</p>
    <pre data-speech-output style="padding:12px;overflow:auto;border-radius:8px;background:#eef4f6;white-space:pre-wrap;font-size:11px"></pre>
  `;
  document.body.appendChild(panel);
  panel.querySelector("[data-speech-close]").addEventListener("click", () => panel.remove());
  const status = panel.querySelector("[data-speech-status]");
  const output = panel.querySelector("[data-speech-output]");
  output.textContent = JSON.stringify(getSpeechDiagnostics(), null, 2);
  panel.querySelectorAll("[data-voice-mode]").forEach(button => button.addEventListener("click", async event => {
    const voiceMode = event.currentTarget.dataset.voiceMode;
    status.textContent = `${event.currentTarget.textContent} 실행 중…`;
    const result = await runWebSpeechDiagnostic({ voiceMode });
    status.textContent = `${event.currentTarget.textContent}: ${result.outcome}`;
    output.textContent = JSON.stringify({ result, environment: getSpeechDiagnostics() }, null, 2);
  }));
}

if (typeof document !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", installSpeechDiagnosticPanel, { once: true });
  } else {
    installSpeechDiagnosticPanel();
  }
}
