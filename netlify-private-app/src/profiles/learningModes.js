export const LEARNING_MODE_CONFIG = {
  normal: { key: "normal", audience: "general", label: "일반 모드", shortLabel: "일반", eyebrow: "DAILY ENGLISH" },
  middle: { key: "middle", audience: "middle", label: "중등 모드", shortLabel: "중등", eyebrow: "MIDDLE SCHOOL ENGLISH" },
  suneung: { key: "suneung", audience: "suneung", label: "수능 모드", shortLabel: "수능", eyebrow: "DAILY CSAT ROUTINE" },
};

export function getModeConfig(mode) {
  return LEARNING_MODE_CONFIG[mode] || LEARNING_MODE_CONFIG.normal;
}
