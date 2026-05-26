import type { ParagraphLesson } from "../types/learning";

export const paragraphLessons: ParagraphLesson[] = [
  {
    id: "p-learning-habits",
    level: "中级",
    topic: "学习习惯",
    sentences: [
      "Good study habits are more important than long study hours.",
      "Some students sit at their desks for a whole evening, but they do not have a clear goal.",
      "As a result, they may feel tired without learning much.",
      "Students who review key points and ask questions usually make better progress.",
      "Therefore, learning wisely is often more useful than simply learning longer."
    ],
    topicSentenceIndex: 0,
    logicMarks: ["主题", "转折", "结果", "例证", "总结"],
    pronounReferences: ["they = some students", "learning wisely = review key points and ask questions"],
    summary: "好的学习习惯比单纯延长学习时间更重要。",
    imitationExpressions: ["more important than", "As a result", "make better progress", "Therefore"]
  }
];
