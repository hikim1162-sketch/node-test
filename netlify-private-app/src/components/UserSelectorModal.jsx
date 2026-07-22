import { LEARNING_USERS, getCurrentUser, setCurrentUser } from "../profiles/profileStorage.js";
import { getModeConfig } from "../profiles/learningModes.js";

export default function UserSelectorModal({ mode, onClose }) {
  if (!mode) return null;
  const currentUser = getCurrentUser(mode);

  function selectUser(user) {
    setCurrentUser(mode, user);
    window.dispatchEvent(new CustomEvent("valuetime:user-selected", { detail: { mode, user } }));
    onClose();
  }

  return (
    <div className="learner-modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="learner-modal" role="dialog" aria-modal="true" aria-labelledby="learner-modal-title">
        <button className="learner-modal-close" type="button" onClick={onClose} aria-label="닫기">×</button>
        <span>{getModeConfig(mode).label}</span>
        <h2 id="learner-modal-title">학습자 선택</h2>
        <p>선택한 학습자 기준으로 진도와 기록이 저장됩니다.</p>
        <div>
          {LEARNING_USERS.map((user) => (
            <button className={currentUser === user ? "active" : ""} type="button" onClick={() => selectUser(user)} key={user}>
              <i>{user.slice(0, 1).toUpperCase()}</i><b>{user}</b>{currentUser === user ? <em>최근 학습자</em> : null}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
