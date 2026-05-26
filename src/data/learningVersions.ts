import type { LearningVersion } from "../types/learning";

export interface LearningVersionConfig {
  id: LearningVersion;
  label: string;
  shortLabel: string;
  missionTitle: string;
  missionDescription: string;
  sceneTarget: number;
  wordTarget: number;
  vocabularyReviewTrigger: number;
  inputHint: string;
  challengeHint: string;
}

export const learningVersionConfigs: Record<LearningVersion, LearningVersionConfig> = {
  high_school: {
    id: "high_school",
    label: "高中版",
    shortLabel: "高中",
    missionTitle: "Complete 10 scenes and activate at least 10 new words",
    missionDescription: "高中英语场景句式、长句理解和表达训练",
    sceneTarget: 10,
    wordTarget: 10,
    vocabularyReviewTrigger: 10,
    inputHint: "English input · no full translation · high-school words count as new words",
    challengeHint:
      "Ten scenes are done, but fewer than 10 new words were activated. The system will add denser scenes within the high-school-to-pre-college range."
  },
  primary_junior: {
    id: "primary_junior",
    label: "小学-初三版",
    shortLabel: "小初",
    missionTitle: "Complete 8 scenes and activate at least 6 useful words",
    missionDescription: "小学到初三英语场景对话、基础句型和自然表达训练",
    sceneTarget: 8,
    wordTarget: 6,
    vocabularyReviewTrigger: 6,
    inputHint: "English input · no full translation · useful words count as new words",
    challengeHint:
      "The first round is done, but not enough useful words were activated. The system will add slightly richer junior-level scenes."
  }
};

export const getLearningVersionConfig = (version: LearningVersion) => learningVersionConfigs[version];
