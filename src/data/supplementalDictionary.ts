import type { LookupEntry } from "../services/dictionaryService";

export type SupplementalEntry = Omit<LookupEntry, "source">;

export const supplementalDictionary: Record<string, SupplementalEntry> = {
  earphones: {
    word: "earphones",
    partOfSpeech: "n.",
    meaning: "耳机，入耳式耳机",
    contextMeaning: "In this shopping scene, earphones means a pair of small headphones used for listening.",
    collocation: "a pair of earphones; wireless earphones; the left/right side of the earphones",
    example: "I would like to return these earphones because the left side stopped working.",
    level: "大学及以上"
  },
  earphone: {
    word: "earphone",
    partOfSpeech: "n.",
    meaning: "耳机的一只；耳塞式耳机",
    contextMeaning: "One earphone is one side of a pair of earphones.",
    collocation: "one earphone; a broken earphone; an earphone case",
    example: "One earphone stopped working after only two days.",
    level: "大学及以上"
  },
  reusable: {
    word: "reusable",
    partOfSpeech: "adj.",
    meaning: "可重复使用的",
    contextMeaning: "In an environmental topic, reusable describes something that can be used many times.",
    collocation: "reusable bottles; reusable bags; reusable materials",
    example: "Reusable bottles can reduce waste on campus.",
    level: "高中进阶"
  },
  independently: {
    word: "independently",
    partOfSpeech: "adv.",
    meaning: "独立地，自主地",
    contextMeaning: "In the AI tools topic, independently means students think by themselves.",
    collocation: "think independently; work independently; learn independently",
    example: "Students still need to think independently before accepting an answer.",
    level: "高中核心"
  },
  accepting: {
    word: "accepting",
    partOfSpeech: "v-ing",
    meaning: "接受，采纳",
    contextMeaning: "Here accepting means taking an answer as correct or useful.",
    collocation: "before accepting an answer; accepting advice; accepting responsibility",
    example: "Check the reason before accepting an answer.",
    level: "高中核心"
  },
  explanations: {
    word: "explanations",
    partOfSpeech: "n.",
    meaning: "解释，说明",
    contextMeaning: "Explanations are reasons or details that make an idea clear.",
    collocation: "quick explanations; clear explanations; grammar explanations",
    example: "AI tools can provide quick explanations.",
    level: "高中核心"
  },
  transport: {
    word: "transport",
    partOfSpeech: "n./v.",
    meaning: "交通；运输",
    contextMeaning: "In a green lifestyle topic, public transport means buses, subways, and trains.",
    collocation: "public transport; transport system; transport goods",
    example: "Public transport can reduce the number of cars on the road.",
    level: "高中核心"
  },
  exploration: {
    word: "exploration",
    partOfSpeech: "n.",
    meaning: "探索，探测",
    contextMeaning: "Space exploration means learning more about space through science and technology.",
    collocation: "space exploration; scientific exploration; cultural exploration",
    example: "Space exploration can make students curious about science.",
    level: "高中进阶"
  },
  discovery: {
    word: "discovery",
    partOfSpeech: "n.",
    meaning: "发现",
    contextMeaning: "Discovery means finding something new or understanding something for the first time.",
    collocation: "real discovery; scientific discovery; make a discovery",
    example: "The news connects knowledge with real discovery.",
    level: "高中核心"
  },
  uncertain: {
    word: "uncertain",
    partOfSpeech: "adj.",
    meaning: "不确定的",
    contextMeaning: "Uncertain describes a result that is not clear yet.",
    collocation: "uncertain result; feel uncertain; remain uncertain",
    example: "Even when the result seems uncertain, the team keeps trying.",
    level: "高中核心"
  },
  festival: {
    word: "festival",
    partOfSpeech: "n.",
    meaning: "节日",
    contextMeaning: "Festival means a special day or period for celebration or tradition.",
    collocation: "Dragon Boat Festival; Spring Festival; festival culture",
    example: "During the Dragon Boat Festival, people race dragon boats together.",
    level: "基础"
  }
};
