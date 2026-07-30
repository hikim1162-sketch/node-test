import { profileStorage } from "../profiles/profileStorage.js";

export const USER_SETTINGS_STORAGE_KEY = "value_time_user_settings_v1";

export const SIDEBAR_MENU_OPTIONS = Object.freeze([
  { id: "upgrade", label: "표현 업그레이드", description: "표현을 더 자연스럽고 정확하게 바꾸는 학습" },
  { id: "synonyms", label: "유의어 공부", description: "30일 유의어 어휘와 테스트" },
  { id: "words", label: "단어장", description: "오늘의 단어와 예문 학습" },
  { id: "sentence", label: "매일 1문장", description: "오늘 바로 쓰는 표현 패턴 학습" },
  { id: "news", label: "영어 뉴스", description: "뉴스 기사 읽기와 표현 학습" },
  { id: "ted", label: "TED 학습", description: "강연 맥락과 메시지 이해" },
  { id: "test", label: "Daily Test", description: "오늘 학습한 내용 점검" },
  { id: "quiz", label: "매일 토익 풀기", description: "토익 문제 풀이" },
  { id: "journal", label: "나만의 학습장", description: "저장한 단어와 문장 복습" },
  { id: "calendar", label: "학습 캘린더", description: "날짜별 학습 기록 확인" },
  { id: "blog", label: "최애 블로그", description: "저장한 블로그 콘텐츠 학습" },
]);

const SIDEBAR_MENU_IDS = new Set(SIDEBAR_MENU_OPTIONS.map(item => item.id));

/**
 * @typedef {"english_only" | "english_korean"} DisplayMode
 * @typedef {{
 *   notifications: {
 *     dailyReminderEnabled: boolean,
 *     dailyReminderTime: string,
 *     reviewRemindersEnabled: boolean,
 *     streakRemindersEnabled: boolean,
 *     weeklyReportEnabled: boolean
 *   },
 *   display: {
 *     mode: DisplayMode,
 *     autoShowExampleTranslation: boolean,
 *     showPartOfSpeech: boolean,
 *     showPronunciationSymbols: boolean,
 *     showLearningModeSwitch: boolean
 *   },
 *   navigation: {
 *     hiddenMenuIds: string[]
 *   }
 * }} LearningSettings
 */

/** @type {Readonly<LearningSettings>} */
export const DEFAULT_LEARNING_SETTINGS = Object.freeze({
  notifications: Object.freeze({
    dailyReminderEnabled: true,
    dailyReminderTime: "20:00",
    reviewRemindersEnabled: true,
    streakRemindersEnabled: true,
    weeklyReportEnabled: true,
  }),
  display: Object.freeze({
    mode: "english_korean",
    autoShowExampleTranslation: true,
    showPartOfSpeech: true,
    showPronunciationSymbols: true,
    showLearningModeSwitch: true,
  }),
  navigation: Object.freeze({
    hiddenMenuIds: Object.freeze([]),
  }),
});

function booleanOrDefault(value, fallback) {
  return typeof value === "boolean" ? value : fallback;
}

function validReminderTime(value) {
  return typeof value === "string" && /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(value);
}

function legacySettingsShape(value) {
  if (!value || typeof value !== "object" || value.notifications || value.display || value.navigation) return value;
  return {
    notifications: {
      dailyReminderEnabled: value.notificationDailyReminder,
      dailyReminderTime: value.notificationTime,
      reviewRemindersEnabled: value.notificationReview,
      streakRemindersEnabled: value.notificationStreak,
      weeklyReportEnabled: value.notificationWeeklyReport,
    },
    display: {
      mode: value.displayMode === "english-only" ? "english_only" : value.displayMode === "english-korean" ? "english_korean" : value.displayMode,
      autoShowExampleTranslation: value.displayExampleTranslation,
      showPartOfSpeech: value.displayPartOfSpeech,
      showPronunciationSymbols: value.displayPronunciation,
      showLearningModeSwitch: value.showLearningModeSwitch,
    },
    navigation: {
      hiddenMenuIds: value.hiddenMenuIds,
    },
  };
}

/** @param {unknown} value @returns {LearningSettings} */
export function normalizeLearningSettings(value) {
  const source = legacySettingsShape(value);
  const notifications = source?.notifications && typeof source.notifications === "object" ? source.notifications : {};
  const display = source?.display && typeof source.display === "object" ? source.display : {};
  const navigation = source?.navigation && typeof source.navigation === "object" ? source.navigation : {};
  return {
    notifications: {
      dailyReminderEnabled: booleanOrDefault(notifications.dailyReminderEnabled, DEFAULT_LEARNING_SETTINGS.notifications.dailyReminderEnabled),
      dailyReminderTime: validReminderTime(notifications.dailyReminderTime) ? notifications.dailyReminderTime : DEFAULT_LEARNING_SETTINGS.notifications.dailyReminderTime,
      reviewRemindersEnabled: booleanOrDefault(notifications.reviewRemindersEnabled, DEFAULT_LEARNING_SETTINGS.notifications.reviewRemindersEnabled),
      streakRemindersEnabled: booleanOrDefault(notifications.streakRemindersEnabled, DEFAULT_LEARNING_SETTINGS.notifications.streakRemindersEnabled),
      weeklyReportEnabled: booleanOrDefault(notifications.weeklyReportEnabled, DEFAULT_LEARNING_SETTINGS.notifications.weeklyReportEnabled),
    },
    display: {
      mode: display.mode === "english_only" ? "english_only" : "english_korean",
      autoShowExampleTranslation: booleanOrDefault(display.autoShowExampleTranslation, DEFAULT_LEARNING_SETTINGS.display.autoShowExampleTranslation),
      showPartOfSpeech: booleanOrDefault(display.showPartOfSpeech, DEFAULT_LEARNING_SETTINGS.display.showPartOfSpeech),
      showPronunciationSymbols: booleanOrDefault(display.showPronunciationSymbols, DEFAULT_LEARNING_SETTINGS.display.showPronunciationSymbols),
      showLearningModeSwitch: booleanOrDefault(display.showLearningModeSwitch, DEFAULT_LEARNING_SETTINGS.display.showLearningModeSwitch),
    },
    navigation: {
      hiddenMenuIds: Array.isArray(navigation.hiddenMenuIds)
        ? [...new Set(navigation.hiddenMenuIds.filter(id => SIDEBAR_MENU_IDS.has(id)))]
        : [],
    },
  };
}

/** @returns {LearningSettings} */
export function loadUserSettings() {
  let saved = null;
  try {
    saved = JSON.parse(profileStorage.getItem(USER_SETTINGS_STORAGE_KEY) || "null");
  } catch {
    saved = null;
  }
  const normalized = normalizeLearningSettings(saved);
  if (saved && JSON.stringify(saved) !== JSON.stringify(normalized)) {
    profileStorage.setItem(USER_SETTINGS_STORAGE_KEY, JSON.stringify(normalized));
  }
  return normalized;
}

/** @param {LearningSettings} settings */
export function applyStudyDisplayPreferences(settings) {
  document.documentElement.dataset.studyDisplay = settings.display.mode;
  document.documentElement.dataset.showExampleTranslation = String(settings.display.autoShowExampleTranslation);
  document.documentElement.dataset.showPartOfSpeech = String(settings.display.showPartOfSpeech);
  document.documentElement.dataset.showPronunciation = String(settings.display.showPronunciationSymbols);
}

/** @param {LearningSettings} settings */
export function saveUserSettings(settings) {
  const normalized = normalizeLearningSettings(settings);
  profileStorage.setItem(USER_SETTINGS_STORAGE_KEY, JSON.stringify(normalized));
  applyStudyDisplayPreferences(normalized);
  window.dispatchEvent(new CustomEvent("valuetime:settings-changed", { detail: normalized }));
  return normalized;
}

/** @param {LearningSettings} settings @param {"notifications" | "display" | "navigation"} section @param {string} key @param {unknown} value */
export function updateLearningSetting(settings, section, key, value) {
  return saveUserSettings({
    ...settings,
    [section]: { ...settings[section], [key]: value },
  });
}
