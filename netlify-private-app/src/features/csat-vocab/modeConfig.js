export const VOCAB_MODE_CONFIGS = {
  suneung: {
    key: "suneung",
    label: "수능",
    initialSeries: "csat2000",
    seriesKeys: ["basic", "csat2000", "hyper1000"],
    ratingLabels: { known: "암기함", confused: "헷갈림", unknown: "모름" },
  },
  middle: {
    key: "middle",
    label: "중등",
    initialSeries: "basic",
    seriesKeys: ["basic"],
    ratingLabels: { known: "암기함", confused: "헷갈림", unknown: "모름" },
  },
  kids: {
    key: "kids",
    label: "초등",
    initialSeries: "elementary500",
    seriesKeys: ["elementary500", "elementaryA1", "elementaryA2"],
    ratingLabels: { known: "알아요", confused: "헷갈려요", unknown: "몰라요" },
  },
};

export function getVocabModeConfig(mode) {
  if (mode === "kids" || mode === "elementary") return VOCAB_MODE_CONFIGS.kids;
  if (mode === "middle") return VOCAB_MODE_CONFIGS.middle;
  return VOCAB_MODE_CONFIGS.suneung;
}
