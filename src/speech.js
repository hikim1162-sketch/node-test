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
const diagnosticSubscribers = new Set();
let voicesPromise = null;
let speakSequence = 0;
let lastRequest = {
  mode: null,
  word: null,
  seq: null,
  requestedAt: null,
  attempt: null,
  lastEvent: null,
  error: null,
  result: null,
};

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
  if (detail.seq === lastRequest.seq || event === "speech-request") {
    lastRequest = {
      ...lastRequest,
      mode: detail.mode ?? lastRequest.mode,
      word: detail.text ?? lastRequest.word,
      seq: detail.seq ?? lastRequest.seq,
      attempt: detail.attempt ?? lastRequest.attempt,
      lastEvent: event,
      error: detail.error ?? (event === "speech-request" ? null : lastRequest.error),
      result: event === "speech-success"
        ? "success"
        : event === "speech-failed" ? "failed" : lastRequest.result,
    };
  }
  console.debug("[speech]", record);
  diagnosticSubscribers.forEach(listener => listener());
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

function runSpeechAttempt(text, config, seq, mode, timeoutMs = 2500) {
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
      mode,
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
    const timers = [];
    const finish = result => {
      if (settled) return;
      settled = true;
      timers.forEach(timer => clearTimeout(timer));
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
    timers.push(setTimeout(() => trace("after-300ms", { ...meta, ...utteranceState() }), 300));
    timers.push(setTimeout(() => trace("after-1500ms", { ...meta, ...utteranceState() }), 1500));
    timers.push(setTimeout(() => {
      if (settled) return;
      trace("utterance-timeout", { ...meta, ...utteranceState() });
      finish({ ok: false, attempt: config.label, error: "timeout" });
    }, timeoutMs));
  });
}

function runAudioAttempt(text, seq, mode, timeoutMs = 5000) {
  return new Promise(resolve => {
    const audio = new Audio(
      `/api/tts?text=${encodeURIComponent(text)}`,
    );
    const meta = { seq, mode, text, attempt: "network-audio" };
    let settled = false;
    let timer;
    const finish = result => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve(result);
    };
    audio.preload = "auto";
    audio.onplaying = () => {
      trace("audio-playing", meta);
      finish({ ok: true, attempt: "network-audio" });
    };
    audio.onended = () => {
      trace("audio-ended", meta);
      if (activeAudio === audio) activeAudio = null;
    };
    audio.onerror = () => {
      const error = audio.error?.message || `media-error-${audio.error?.code || "unknown"}`;
      trace("audio-error", { ...meta, error });
      if (activeAudio === audio) activeAudio = null;
      finish({ ok: false, attempt: "network-audio", error });
    };
    activeAudio = audio;
    trace("audio-before-play", meta);
    const playPromise = audio.play();
    trace("audio-after-play", meta);
    playPromise?.catch(error => {
      trace("audio-play-rejected", { ...meta, error: error?.name || error?.message || "play-rejected" });
      if (activeAudio === audio) activeAudio = null;
      finish({
        ok: false,
        attempt: "network-audio",
        error: error?.name || error?.message || "play-rejected",
      });
    });
    timer = setTimeout(() => {
      trace("audio-timeout", meta);
      if (activeAudio === audio) activeAudio = null;
      finish({ ok: false, attempt: "network-audio", error: "timeout" });
    }, timeoutMs);
  });
}

export async function speakEnglishDebug(text, context = {}) {
  const value = String(text || "").trim();
  if (!value) {
    console.warn("[speech] skip empty text");
    return false;
  }
  if (typeof window === "undefined" || typeof window.Audio !== "function") {
    console.error("[speech] Audio playback unavailable");
    return false;
  }

  const seq = ++speakSequence;
  const mode = context.mode || "unknown";
  lastRequest = {
    mode,
    word: value,
    seq,
    requestedAt: new Date().toISOString(),
    attempt: null,
    lastEvent: "request-created",
    error: null,
    result: null,
  };
  diagnosticSubscribers.forEach(listener => listener());
  if (activeAudio) {
    activeAudio.pause();
    activeAudio.currentTime = 0;
    activeAudio = null;
  }
  const audioResult = await runAudioAttempt(value, seq, mode);
  if (audioResult.ok) {
    trace("speech-success", { seq, mode, text: value, ...audioResult });
    return true;
  }
  trace("attempt-failed", { seq, mode, text: value, ...audioResult });
  if (!canUseSpeech()) {
    trace("speech-failed", { seq, mode, text: value, error: "web-speech-unavailable" });
    return false;
  }

  const synth = window.speechSynthesis;
  // Mobile browsers may only start speech while the original click gesture is
  // still active. Do not await voiceschanged (or any timer) before the first
  // speak() call. A voice can be selected for later fallback attempts.
  const voices = refreshVoices("voices-at-request");
  const enVoice = findUsEnglishVoice();
  trace("speech-request", {
    seq,
    mode,
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
    // The system default is the most portable option and begins synchronously
    // inside the user's click. Pronunciation quality is secondary to audible
    // playback; language/voice-specific attempts remain as fallbacks.
    { label: "default-immediate", rate: 1, pitch: 1, volume: 1 },
    { label: "lang-only", lang: "en-US", rate: 1, pitch: 1, volume: 1 },
    enVoice ? { label: "enVoice+lang", voice: enVoice, lang: "en-US", rate: 1, pitch: 1, volume: 1 } : null,
  ].filter(Boolean);

  for (const attempt of attempts) {
    if (seq !== speakSequence) return false;
    trace("attempt-start", { seq, mode, text: value, attempt: attempt.label });
    const result = await runSpeechAttempt(value, attempt, seq, mode);
    if (result.ok) {
      trace("speech-success", { seq, mode, text: value, ...result });
      return true;
    }
    trace("attempt-failed", { seq, mode, text: value, ...result });
    if (synth.speaking || synth.pending || activeUtterances.size) {
      trace("cancel-after-failed-attempt", { seq, attempt: attempt.label });
      synth.cancel();
      activeUtterances.clear();
    }
  }
  trace("speech-failed", { seq, mode, text: value, error: lastRequest.error || "all-attempts-failed" });
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
    lastRequest: { ...lastRequest },
    recentEvents: diagnosticEvents.slice(-20),
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
  const enabled = new URLSearchParams(window.location.search).get("speech-diagnostics") === "1";
  if (typeof document === "undefined"
    || !enabled
    || document.querySelector("[data-speech-diagnostic-panel]")) return;

  const panel = document.createElement("section");
  panel.dataset.speechDiagnosticPanel = "true";
  panel.style.cssText = "position:fixed;z-index:2147483647;inset:8px;overflow:auto;padding:16px;border:2px solid #236b83;border-radius:14px;background:#fff;color:#172b34;font:13px/1.45 system-ui;box-shadow:0 12px 50px #0005";
  panel.innerHTML = `
    <header style="display:flex;justify-content:space-between;gap:12px;align-items:center">
      <div><b style="font-size:18px">Web Speech 휴대폰 진단</b><p style="margin:4px 0">버튼과 실제 단어장 스피커를 누른 뒤 이 화면을 캡처하세요.</p></div>
      <button type="button" data-speech-close style="min-width:52px;min-height:40px;font-size:12px">접기</button>
    </header>
    <div style="padding:9px;border-radius:8px;background:#eef4f6"><b>Build</b> <span data-speech-build></span></div>
    <div data-speech-tests style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:7px;margin:12px 0">
      <button type="button" data-speech-test="test" style="min-height:46px">Test: "test"</button>
      <button type="button" data-speech-test="apple" style="min-height:46px">Test: "apple"</button>
      <button type="button" data-speech-test="안녕" style="min-height:46px">Test: "안녕"</button>
    </div>
    <p data-speech-status role="status" style="padding:9px;border-radius:8px;background:#fff5cc;font-weight:700">테스트 대기 중</p>
    <div data-speech-summary></div>
    <h3 style="margin:16px 0 7px">최근 로그 20개</h3>
    <div data-speech-log style="overflow:auto"></div>
  `;
  document.body.appendChild(panel);
  const launcher = document.createElement("button");
  launcher.type = "button";
  launcher.dataset.speechDiagnosticLauncher = "true";
  launcher.textContent = "음성 진단";
  launcher.style.cssText = "position:fixed;z-index:2147483646;right:10px;bottom:10px;display:none;min-width:82px;min-height:44px;border:0;border-radius:999px;background:#236b83;color:#fff;font:700 13px system-ui;box-shadow:0 5px 18px #0004";
  document.body.appendChild(launcher);
  panel.querySelector("[data-speech-build]").textContent =
    new URLSearchParams(window.location.search).get("build") || "query build 값 없음";
  const status = panel.querySelector("[data-speech-status]");
  const summary = panel.querySelector("[data-speech-summary]");
  const log = panel.querySelector("[data-speech-log]");
  const value = input => input === null || input === undefined || input === "" ? "—" : String(input);
  const render = () => {
    const state = getSpeechDiagnostics();
    const request = state.lastRequest;
    summary.innerHTML = `
      <div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:7px">
        ${[
          ["supported", state.webSpeechSupported],
          ["voiceCount", state.voiceCount],
          ["en-US voice", state.enUsVoiceCount > 0],
          ["speaking", state.speaking],
          ["pending", state.pending],
          ["paused", state.paused],
        ].map(([label, item]) => `<div style="padding:8px;border:1px solid #d5e1e5;border-radius:8px"><b>${label}</b><br>${value(item)}</div>`).join("")}
      </div>
      <h3 style="margin:16px 0 7px">마지막 요청</h3>
      <div style="padding:10px;border:1px solid #d5e1e5;border-radius:8px">
        mode: <b>${value(request.mode)}</b><br>
        word: <b>${value(request.word)}</b><br>
        request seq: <b>${value(request.seq)}</b><br>
        실행 시각: <b>${value(request.requestedAt)}</b><br>
        마지막 시도 단계: <b>${value(request.attempt)}</b><br>
        마지막 이벤트: <b>${value(request.lastEvent)}</b><br>
        마지막 error: <b>${value(request.error)}</b><br>
        최종 결과: <b>${value(request.result)}</b>
      </div>
      <p style="margin:8px 0 0;color:#50656d">fallback: enVoice+lang → lang-only → default</p>
    `;
    const rows = state.recentEvents.slice().reverse().map(item => `
      <tr>
        <td style="padding:5px;border-bottom:1px solid #dce6e9;white-space:nowrap">${new Date(item.at).toLocaleTimeString()}</td>
        <td style="padding:5px;border-bottom:1px solid #dce6e9">${value(item.event)}</td>
        <td style="padding:5px;border-bottom:1px solid #dce6e9">${value(item.text)}</td>
        <td style="padding:5px;border-bottom:1px solid #dce6e9">${value(item.attempt)}</td>
        <td style="padding:5px;border-bottom:1px solid #dce6e9">${value(item.error)}</td>
      </tr>
    `).join("");
    log.innerHTML = `<table style="width:100%;border-collapse:collapse;font-size:11px"><thead><tr><th>시간</th><th>이벤트</th><th>단어</th><th>단계</th><th>error</th></tr></thead><tbody>${rows || "<tr><td colspan='5'>로그 없음</td></tr>"}</tbody></table>`;
    status.textContent = request.result
      ? `${request.word}: ${request.result}`
      : request.word ? `${request.word}: ${request.lastEvent}` : "테스트 대기 중";
  };
  diagnosticSubscribers.add(render);
  render();
  panel.querySelector("[data-speech-close]").addEventListener("click", () => {
    panel.style.display = "none";
    launcher.style.display = "block";
  });
  launcher.addEventListener("click", () => {
    launcher.style.display = "none";
    panel.style.display = "block";
    render();
  });
  panel.querySelectorAll("[data-speech-test]").forEach(button => button.addEventListener("click", event => {
    const text = event.currentTarget.dataset.speechTest;
    speakEnglishDebug(text, { mode: "diagnostic-test" });
  }));
}

if (typeof document !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", installSpeechDiagnosticPanel, { once: true });
  } else {
    installSpeechDiagnosticPanel();
  }
}
