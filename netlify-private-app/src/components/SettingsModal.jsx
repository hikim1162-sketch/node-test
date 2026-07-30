import { useEffect, useRef, useState } from "react";
import { loadUserSettings, SIDEBAR_MENU_OPTIONS, updateLearningSetting } from "../settings/settingsStorage.js";

function ToggleRow({ section, settingKey, label, description, checked, onChange }) {
  const inputId = `setting-${section}-${settingKey}`;
  const descriptionId = description ? `${inputId}-description` : undefined;
  return (
    <label className="settings-row settings-toggle-row" htmlFor={inputId}>
      <span><b>{label}</b>{description ? <small id={descriptionId}>{description}</small> : null}</span>
      <span className="settings-switch">
        <input id={inputId} type="checkbox" checked={checked} aria-describedby={descriptionId} onChange={event => onChange(section, settingKey, event.target.checked)} />
        <i aria-hidden="true" />
      </span>
    </label>
  );
}

function SettingsSection({ title, description, children }) {
  return <fieldset className="settings-section"><legend>{title}</legend><p>{description}</p>{children}</fieldset>;
}

export default function SettingsModal({ open, onClose }) {
  const [settings, setSettings] = useState(loadUserSettings);
  const [saved, setSaved] = useState(false);
  const feedbackTimer = useRef(null);
  const closeButtonRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    setSettings(loadUserSettings());
    closeButtonRef.current?.focus();
    const closeOnEscape = event => event.key === "Escape" && onClose();
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [open, onClose]);

  useEffect(() => () => window.clearTimeout(feedbackTimer.current), []);

  if (!open) return null;

  function updateSetting(section, key, value) {
    setSettings(current => updateLearningSetting(current, section, key, value));
    setSaved(true);
    window.clearTimeout(feedbackTimer.current);
    feedbackTimer.current = window.setTimeout(() => setSaved(false), 1800);
  }

  function updateMenuVisibility(menuId, visible) {
    const hiddenMenuIds = visible
      ? settings.navigation.hiddenMenuIds.filter(id => id !== menuId)
      : [...new Set([...settings.navigation.hiddenMenuIds, menuId])];
    updateSetting("navigation", "hiddenMenuIds", hiddenMenuIds);
  }

  return (
    <div className="settings-modal-backdrop" role="presentation" onMouseDown={event => event.target === event.currentTarget && onClose()}>
      <section className="settings-modal" role="dialog" aria-modal="true" aria-labelledby="settings-title">
        <header>
          <div><span>SETTINGS</span><h2 id="settings-title">설정</h2></div>
          <span className={`settings-save-status ${saved ? "visible" : ""}`} role="status" aria-live="polite">{saved ? "설정이 저장되었습니다." : ""}</span>
          <button ref={closeButtonRef} type="button" onClick={onClose} aria-label="설정 닫기">×</button>
        </header>
        <form className="settings-form" onSubmit={event => event.preventDefault()}>
          <SettingsSection title="알림 설정" description="학습 리마인더와 진도 알림을 관리합니다.">
            <div className="settings-linked-group">
              <ToggleRow section="notifications" settingKey="dailyReminderEnabled" label="매일 학습 알림" description="정해진 시간에 오늘의 학습을 알려드립니다." checked={settings.notifications.dailyReminderEnabled} onChange={updateSetting} />
              <label className={`settings-row settings-time-row ${settings.notifications.dailyReminderEnabled ? "" : "disabled"}`} htmlFor="setting-notifications-dailyReminderTime">
                <span><b>알림 시간</b><small id="setting-notification-time-description">매일 학습 알림을 받을 시간</small></span>
                <input id="setting-notifications-dailyReminderTime" type="time" value={settings.notifications.dailyReminderTime} aria-describedby="setting-notification-time-description" disabled={!settings.notifications.dailyReminderEnabled} onChange={event => updateSetting("notifications", "dailyReminderTime", event.target.value)} />
              </label>
            </div>
            <ToggleRow section="notifications" settingKey="reviewRemindersEnabled" label="복습 알림" description="오답과 저장한 항목의 복습 시점을 알려드립니다." checked={settings.notifications.reviewRemindersEnabled} onChange={updateSetting} />
            <ToggleRow section="notifications" settingKey="streakRemindersEnabled" label="연속 학습 알림" description="연속 학습 기록이 끊기기 전에 알려드립니다." checked={settings.notifications.streakRemindersEnabled} onChange={updateSetting} />
            <ToggleRow section="notifications" settingKey="weeklyReportEnabled" label="주간 리포트" description="매주 학습량과 성취도를 요약해서 알려드립니다." checked={settings.notifications.weeklyReportEnabled} onChange={updateSetting} />
          </SettingsSection>
          <SettingsSection title="학습 화면 설정" description="학습 중 영어 콘텐츠가 표시되는 방식을 선택합니다.">
            <div className="settings-row settings-display-row">
              <span><b>표시 모드</b><small>영어와 한국어를 함께 볼지 선택하세요.</small></span>
              <div className="settings-segmented" role="radiogroup" aria-label="학습 표시 모드">
                <label><input type="radio" name="displayMode" value="english_only" checked={settings.display.mode === "english_only"} onChange={event => updateSetting("display", "mode", event.target.value)} /><span>전체 영어</span></label>
                <label><input type="radio" name="displayMode" value="english_korean" checked={settings.display.mode === "english_korean"} onChange={event => updateSetting("display", "mode", event.target.value)} /><span>영어 + 한국어</span></label>
              </div>
            </div>
            <div className="settings-subgroup" role="group" aria-labelledby="additional-display-options">
              <h3 id="additional-display-options">추가 표시 옵션</h3>
              <ToggleRow section="display" settingKey="autoShowExampleTranslation" label="예문 해석 자동 표시" description="예문 아래에 한국어 해석을 바로 표시합니다." checked={settings.display.autoShowExampleTranslation} onChange={updateSetting} />
              <ToggleRow section="display" settingKey="showPartOfSpeech" label="품사 표시" description="단어 카드에 품사를 표시합니다." checked={settings.display.showPartOfSpeech} onChange={updateSetting} />
              <ToggleRow section="display" settingKey="showPronunciationSymbols" label="발음 기호 표시" description="단어와 함께 발음 기호를 표시합니다." checked={settings.display.showPronunciationSymbols} onChange={updateSetting} />
              <ToggleRow section="display" settingKey="showLearningModeSwitch" label="Silent / Speaking 모드 표시" description="상단의 Silent / Speaking 전환 버튼을 표시합니다." checked={settings.display.showLearningModeSwitch} onChange={updateSetting} />
            </div>
          </SettingsSection>
          <SettingsSection title="좌측 메뉴 설정" description="현재 필요한 학습 메뉴만 좌측 사이드바에 표시합니다. 숨겨도 학습 데이터와 기록은 유지됩니다.">
            <div className="settings-subgroup settings-menu-group" role="group" aria-labelledby="sidebar-menu-options">
              <h3 id="sidebar-menu-options">일반모드 메뉴 표시</h3>
              {SIDEBAR_MENU_OPTIONS.map(item => (
                <ToggleRow
                  key={item.id}
                  section="navigation"
                  settingKey={`menu-${item.id}`}
                  label={item.label}
                  description={item.description}
                  checked={!settings.navigation.hiddenMenuIds.includes(item.id)}
                  onChange={(_section, _key, visible) => updateMenuVisibility(item.id, visible)}
                />
              ))}
            </div>
          </SettingsSection>
        </form>
      </section>
    </div>
  );
}
