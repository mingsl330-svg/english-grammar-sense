import type { StageAssessment } from "../types/learning";

export const stageAssessments: StageAssessment[] = [
  {
    id: "stage-1-context-expression",
    stageId: "1",
    title: "Stage 1 场景表达考核",
    description:
      "这不是选择题测试。你需要在真实场景里写出句子、批注句子、说明语意逻辑，并完成一次迁移表达。",
    createdAt: new Date().toISOString(),
    targetGoals: [
      {
        id: "goal-vocab-context",
        description: "能在真实语境中使用基础和高中常用词",
        knowledgePoints: ["gradually", "improve", "because"],
        skillType: "vocabulary"
      },
      {
        id: "goal-pattern-because-although",
        description: "能用原因和让步结构表达完整想法",
        knowledgePoints: ["because 引导原因", "although 表达让步", "still 表达坚持"],
        skillType: "sentence_pattern"
      },
      {
        id: "goal-annotation",
        description: "能批注句子主干、逻辑关系和表达功能",
        knowledgePoints: ["句子主干", "逻辑关系", "语意功能"],
        skillType: "annotation"
      },
      {
        id: "goal-writing-transfer",
        description: "能把学过的表达迁移到新的校园或生活场景",
        knowledgePoints: ["场景化回应", "自然表达", "写作完整度"],
        skillType: "writing"
      }
    ],
    tasks: [
      {
        id: "task-gradually",
        type: "word_in_context_writing",
        scenario: "你想告诉英语老师：你的英语不是突然变好的，而是慢慢提高的。",
        prompt: "请用 gradually 写一句英文，表达这个意思。",
        targetKnowledgePoints: ["gradually", "improve"],
        expectedSkills: ["语境词汇使用", "短句表达", "变化过程表达"]
      },
      {
        id: "task-although-because",
        type: "sentence_pattern_writing",
        scenario: "你在英语社团分享学习感受，想表达：虽然英语对你来说很难，但你仍然想学好它，因为它能帮你看到更大的世界。",
        prompt: "请用英文写出这个意思。可以使用 Although ..., I still ... because ...",
        targetKnowledgePoints: ["although", "still", "because"],
        expectedSkills: ["让步表达", "原因表达", "复合句完整性"]
      },
      {
        id: "task-structure-annotation",
        type: "sentence_annotation",
        scenario: "你正在读一篇关于英语写作提升的文章。",
        inputText:
          "Although many students find English grammar difficult, they can gradually improve their writing by learning how sentences are built.",
        prompt:
          "请批注：1. 主句 2. although 引导的部分 3. by learning... 表示什么 4. gradually 修饰哪个动作 5. 整句话的中文逻辑。",
        targetKnowledgePoints: ["句子主干", "although", "by doing", "gradually"],
        expectedSkills: ["结构批注", "语意批注", "逻辑解释"]
      },
      {
        id: "task-meaning-annotation",
        type: "meaning_annotation",
        scenario: "你要准备一段关于手机进校园的英文演讲。",
        inputText:
          "Although smartphones can help students find information quickly, they may also distract students from their studies.",
        prompt:
          "请批注这句话的语意功能：前半句承认什么？后半句担心什么？整体是在表达什么立场？",
        targetKnowledgePoints: ["although", "may", "distract sb from sth", "平衡观点"],
        expectedSkills: ["语意逻辑", "观点功能", "表达意图识别"]
      },
      {
        id: "task-scenario-response",
        type: "scenario_response",
        scenario: "你正在回复外国同学：Why do you want to join the reading club?",
        prompt:
          "请写 2-3 句英文回应。要求：说明你想加入的原因，并至少使用一个你学过的表达结构。",
        targetKnowledgePoints: ["because", "want to do", "表达原因"],
        expectedSkills: ["场景回应", "自然表达", "写作完整度"]
      }
    ]
  }
];
