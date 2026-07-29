export const synonymStudyCategories = {
  adjective: ["degree", "emotion", "quality", "size", "appearance", "personality", "difficulty", "temperature-status"],
  verb: ["communication", "thinking", "academic", "daily-actions", "change-movement"],
  noun: ["abstract", "feeling", "school-exam"],
  adverb: ["degree", "frequency", "manner"],
};

export const synonymExpansionPlan = {
  adjective: { target: 220, groups: { degree: 40, emotion: 40, quality: 35, size: 20, appearance: 20, personality: 25, difficulty: 20, "temperature-status": 20 } },
  verb: { target: 140, groups: { communication: 25, thinking: 25, academic: 35, "daily-actions": 30, "change-movement": 25 } },
  noun: { target: 80, groups: { abstract: 35, feeling: 20, "school-exam": 25 } },
  adverb: { target: 60, groups: { degree: 25, frequency: 15, manner: 20 } },
};

export const synonymExpansionTotal = Object.values(synonymExpansionPlan).reduce((sum, category) => sum + category.target, 0);
