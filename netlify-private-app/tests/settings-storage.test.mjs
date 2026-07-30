import assert from "node:assert/strict";
import test from "node:test";
import {
  DEFAULT_LEARNING_SETTINGS,
  normalizeLearningSettings,
} from "../src/settings/settingsStorage.js";

test("uses the complete defaults when settings are missing", () => {
  assert.deepEqual(normalizeLearningSettings(null), DEFAULT_LEARNING_SETTINGS);
});

test("normalizes partial and malformed nested settings", () => {
  assert.deepEqual(
    normalizeLearningSettings({
      notifications: {
        dailyReminderEnabled: false,
        dailyReminderTime: "25:90",
      },
      display: {
        mode: "invalid",
        showPartOfSpeech: false,
      },
    }),
    {
      notifications: {
        dailyReminderEnabled: false,
        dailyReminderTime: "20:00",
        reviewRemindersEnabled: true,
        streakRemindersEnabled: true,
        weeklyReportEnabled: true,
      },
      display: {
        mode: "english_korean",
        autoShowExampleTranslation: true,
        showPartOfSpeech: false,
        showPronunciationSymbols: true,
        showLearningModeSwitch: true,
      },
      navigation: {
        hiddenMenuIds: [],
      },
    },
  );
});

test("migrates the previous flat settings shape", () => {
  assert.deepEqual(
    normalizeLearningSettings({
      notificationDailyReminder: false,
      notificationTime: "07:30",
      notificationReview: false,
      notificationStreak: true,
      notificationWeeklyReport: false,
      displayMode: "english-only",
      displayExampleTranslation: false,
      displayPartOfSpeech: false,
      displayPronunciation: false,
    }),
    {
      notifications: {
        dailyReminderEnabled: false,
        dailyReminderTime: "07:30",
        reviewRemindersEnabled: false,
        streakRemindersEnabled: true,
        weeklyReportEnabled: false,
      },
      display: {
        mode: "english_only",
        autoShowExampleTranslation: false,
        showPartOfSpeech: false,
        showPronunciationSymbols: false,
        showLearningModeSwitch: true,
      },
      navigation: {
        hiddenMenuIds: [],
      },
    },
  );
});

test("keeps only supported hidden sidebar menu ids without duplicates", () => {
  const settings = normalizeLearningSettings({
    navigation: {
      hiddenMenuIds: ["upgrade", "upgrade", "unknown", "ted"],
    },
  });
  assert.deepEqual(settings.navigation.hiddenMenuIds, ["upgrade", "ted"]);
});
