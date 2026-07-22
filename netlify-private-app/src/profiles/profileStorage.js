export const LEARNING_USERS = ["kai", "rachel", "hyuk"];
export const LEARNING_MODES = ["normal", "middle", "suneung"];

const CURRENT_USER_PREFIX = "valuetime_current_user_v1";
const PROFILE_PREFIX = "valuetime_profile_v1";
const MIGRATION_PREFIX = "valuetime_profile_migrated_v1";

function validMode(mode) {
  return LEARNING_MODES.includes(mode) ? mode : "normal";
}

function validUser(user) {
  if (user === "Rachel") return "rachel";
  return LEARNING_USERS.includes(user) ? user : "kai";
}

export function modeFromAudience(audience) {
  return audience === "suneung" ? "suneung" : audience === "middle" ? "middle" : "normal";
}

export function getStoredAudienceMode() {
  const stored = window.localStorage.getItem("value_time_audience_mode_v1") || window.localStorage.getItem("mode");
  return stored === "suneung" ? "suneung" : stored === "middle" ? "middle" : stored === "kids" || stored === "elementary" ? "kids" : "general";
}

export function getCurrentUser(mode) {
  const safeMode = validMode(mode);
  if (safeMode === "middle") return "kai";
  return validUser(window.localStorage.getItem(`${CURRENT_USER_PREFIX}:${safeMode}`));
}

export function setCurrentUser(mode, user) {
  const safeMode = validMode(mode);
  const safeUser = validUser(user);
  window.localStorage.setItem(`${CURRENT_USER_PREFIX}:${safeMode}`, safeUser);
  return safeUser;
}

export function profileKey(mode, user, key) {
  return `${PROFILE_PREFIX}:${validMode(mode)}:${validUser(user)}:${key}`;
}

export function getProfileItem(mode, key, fallbackToLegacy = true) {
  const safeMode = validMode(mode);
  const user = getCurrentUser(safeMode);
  const scopedKey = profileKey(safeMode, user, key);
  const scoped = window.localStorage.getItem(scopedKey);
  if (scoped !== null) return scoped;

  if (user === "rachel") {
    const previousRachelKey = `${PROFILE_PREFIX}:${safeMode}:Rachel:${key}`;
    const previousRachelValue = window.localStorage.getItem(previousRachelKey);
    if (previousRachelValue !== null) {
      window.localStorage.setItem(scopedKey, previousRachelValue);
      return previousRachelValue;
    }
  }

  const migrationKey = `${MIGRATION_PREFIX}:${safeMode}:${key}`;
  const legacy = fallbackToLegacy && safeMode !== "middle" && !window.localStorage.getItem(migrationKey)
    ? window.localStorage.getItem(key)
    : null;
  if (legacy !== null) {
    window.localStorage.setItem(scopedKey, legacy);
    window.localStorage.setItem(migrationKey, user);
    return legacy;
  }
  return null;
}

export function setProfileItem(mode, key, value) {
  const safeMode = validMode(mode);
  window.localStorage.setItem(profileKey(safeMode, getCurrentUser(safeMode), key), String(value));
}

export function removeProfileItem(mode, key) {
  const safeMode = validMode(mode);
  window.localStorage.removeItem(profileKey(safeMode, getCurrentUser(safeMode), key));
}

const GLOBAL_KEYS = new Set([
  "value_time_audience_mode_v1", "mode", "studentName", "value_time_child_name_v1",
  "value_time_theme_v1", "theme", "worthy_life_theme", "value_time_learning_mode_v1",
  "value_time_speaking_speed_v1", "value_time_kids_intro_seen_v1",
]);

function isGlobalKey(key) {
  return GLOBAL_KEYS.has(key) || key.startsWith(CURRENT_USER_PREFIX) || key.startsWith(PROFILE_PREFIX) || key.startsWith(MIGRATION_PREFIX);
}

function activeMode() {
  return modeFromAudience(getStoredAudienceMode());
}

export const profileStorage = {
  getItem(key) {
    return isGlobalKey(key) ? window.localStorage.getItem(key) : getProfileItem(activeMode(), key);
  },
  setItem(key, value) {
    if (isGlobalKey(key)) window.localStorage.setItem(key, String(value));
    else setProfileItem(activeMode(), key, value);
  },
  removeItem(key) {
    if (isGlobalKey(key)) window.localStorage.removeItem(key);
    else removeProfileItem(activeMode(), key);
  },
};
