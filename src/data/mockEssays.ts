import type { EssayLesson } from "../types/learning";

export const essayLessons: EssayLesson[] = [
  {
    id: "e-technology-learning",
    type: "议论文",
    title: "Technology and Learning",
    paragraphs: [
      "Technology is changing the way students learn, but it should be used with clear purpose.",
      "Online videos and learning apps can make difficult ideas easier to understand. For example, students can watch an experiment again if they miss an important step in class.",
      "However, technology can also distract students when they use it without a plan. A phone that helps with vocabulary practice can quickly become a source of short videos and games.",
      "Therefore, students should treat technology as a tool, not as a replacement for thinking. When they set goals before using it, technology can truly support their learning."
    ],
    structure: ["提出观点", "正面论据", "反面提醒", "总结建议"],
    keywords: ["technology", "purpose", "understand", "distract", "tool", "thinking"],
    logic: ["but 引出限制", "For example 举例", "However 转折", "Therefore 总结建议"],
    questions: [
      "作者对 technology 的态度是什么？",
      "第三段为什么提到 phone？",
      "最后一段中 tool 和 replacement 的区别是什么？"
    ],
    writingTask:
      "模仿这篇文章结构，写一篇 80 词左右短文：Reading and Learning。"
  }
];
