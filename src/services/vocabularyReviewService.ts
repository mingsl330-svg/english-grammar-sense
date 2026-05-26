import type { LearningVersion, UnknownWordRecord } from "../types/learning";

export interface ReviewExample {
  sentence: string;
  focus: string;
  explanation: string;
}

export interface ReviewSentenceResult {
  passed: boolean;
  issues: string[];
  notes?: string[];
  correctedSentence: string;
  explanation: string;
}

interface ReviewEntry {
  correctedSentence: string;
  examples: ReviewExample[];
}

const makeEntry = (correctedSentence: string, examples: Array<[string, string, string]>): ReviewEntry => ({
  correctedSentence,
  examples: examples.map(([sentence, focus, explanation]) => ({ sentence, focus, explanation }))
});

const reviewBank: Record<string, ReviewEntry> = {
  submit: makeEntry("I submitted my homework late because I had a family responsibility.", [
    [
      "I submitted my homework before the deadline.",
      "verb · past simple",
      "Submit means hand in work formally, often to a teacher or a system."
    ],
    [
      "Please submit your application by Friday.",
      "verb · imperative",
      "Use submit when a form, essay, or application is officially sent in."
    ],
    [
      "She is submitting her science project online tonight.",
      "verb · present continuous",
      "Is submitting shows the action is happening around now."
    ]
  ]),
  submitted: makeEntry("I submitted my homework late because I had a family responsibility.", [
    [
      "I submitted my homework before the deadline.",
      "verb · past simple",
      "Submitted describes a completed hand-in action."
    ],
    [
      "The student submitted a careful report after the experiment.",
      "verb · object pattern",
      "Submit usually takes an object: submit homework, a report, or an application."
    ],
    [
      "If I submit the essay tonight, the teacher can read it tomorrow.",
      "verb · condition",
      "Submit can also appear in an if-clause when you talk about a plan."
    ]
  ]),
  homework: makeEntry("I finished my homework before dinner and checked it again.", [
    [
      "I finished my homework before dinner.",
      "noun · school task",
      "Homework names work a teacher asks students to do after class."
    ],
    [
      "Too much homework can make students feel tired.",
      "noun · subject",
      "Homework can be the subject of a sentence when discussing school life."
    ],
    [
      "She forgot her math homework yesterday.",
      "noun · object",
      "Use homework after a possessive word such as my, his, or her."
    ]
  ]),
  late: makeEntry("I was late for class because the bus arrived slowly.", [
    [
      "I was late for class this morning.",
      "adjective · be late for",
      "Late describes someone arriving after the expected time."
    ],
    [
      "She stayed up late to finish her presentation.",
      "adverb · stay up late",
      "Late can describe when an action happens."
    ],
    [
      "A late reply may sound impolite in an important email.",
      "adjective · before a noun",
      "Late can describe a reply, bus, homework, or payment."
    ]
  ]),
  younger: makeEntry("My younger sister often asks me to help her with homework.", [
    [
      "My younger brother is in Grade Seven.",
      "adjective · family relation",
      "Younger compares age inside a family or group."
    ],
    [
      "When I was younger, I was afraid of speaking English.",
      "comparative adjective · past time",
      "Was younger refers to an earlier age."
    ],
    [
      "Older students can help younger students solve problems.",
      "comparative pair",
      "Older and younger are often used together to compare people."
    ]
  ]),
  debate: {
    correctedSentence: "Students can debate whether AI tools should be used for homework.",
    examples: [
      {
        sentence: "Students debate whether phones should be allowed in class.",
        focus: "verb · present simple",
        explanation: "Use debate as an action verb when people discuss different opinions."
      },
      {
        sentence: "Our class debated the advantages of online learning yesterday.",
        focus: "verb · past simple",
        explanation: "Use debated for a completed discussion in the past."
      },
      {
        sentence: "The debate about school uniforms helped us see both sides.",
        focus: "noun · a debate about ...",
        explanation: "Use a debate as a countable noun for a formal discussion."
      }
    ]
  },
  online: makeEntry("Online learning gives students more flexibility, but it also requires self-control.", [
    [
      "Online learning gives students more choices about time.",
      "adjective · before a noun",
      "Online describes something done through the internet."
    ],
    [
      "I registered online for the volunteer activity.",
      "adverb · after a verb",
      "Online can also describe how an action is done."
    ],
    [
      "The online discussion became more active after the teacher asked a question.",
      "adjective · school context",
      "Online can describe a class, meeting, test, or discussion."
    ]
  ]),
  offer: makeEntry("This course offers useful practice for spoken English.", [
    [
      "This course offers useful practice for spoken English.",
      "verb · present simple",
      "Offer means provide something useful or possible."
    ],
    [
      "The teacher offered extra help after class.",
      "verb · past simple",
      "Offered describes help or a chance given in the past."
    ],
    [
      "The school will offer more art courses next term.",
      "verb · future",
      "Will offer is useful when talking about a future plan."
    ]
  ]),
  offers: makeEntry("Online learning offers more flexibility than a fixed classroom schedule.", [
    [
      "Online learning offers more flexibility.",
      "verb · third person singular",
      "Offers agrees with a singular subject such as online learning."
    ],
    [
      "The library offers a quiet place to study.",
      "verb · place provides",
      "A place or program can offer a service or benefit."
    ],
    [
      "This experience offers students a chance to speak in public.",
      "verb · offer sb sth",
      "Offer can connect a person with a chance or benefit."
    ]
  ]),
  although: {
    correctedSentence: "Although the task was difficult, I finished it on time.",
    examples: [
      {
        sentence: "Although English is difficult, I still try to speak it every day.",
        focus: "concession · present habit",
        explanation: "Although introduces a problem, and the main clause shows the real action."
      },
      {
        sentence: "Although I was nervous, I answered the question clearly.",
        focus: "concession · past event",
        explanation: "Use was and answered to describe one past situation."
      },
      {
        sentence: "Although the article looks long, it becomes easier after we find the main idea.",
        focus: "concession · reading logic",
        explanation: "The sentence admits difficulty first, then gives a helpful result."
      }
    ]
  },
  because: {
    correctedSentence: "I reviewed the sentence again because I missed the main idea.",
    examples: [
      {
        sentence: "I take notes because they help me remember key ideas.",
        focus: "reason · present simple",
        explanation: "Because gives the real reason for the action before it."
      },
      {
        sentence: "She stayed after class because she wanted to ask a question.",
        focus: "reason · past simple",
        explanation: "Both stayed and wanted describe a past reason."
      },
      {
        sentence: "I will practice this pattern because it is useful in writing.",
        focus: "reason · future plan",
        explanation: "Use will for the plan, then because for the reason."
      }
    ]
  },
  hope: makeEntry("I hope to study abroad after I become more independent.", [
    [
      "I hope to study abroad one day.",
      "verb · hope to do",
      "Hope to do expresses a future goal that matters to the speaker."
    ],
    [
      "She hoped that her speech would encourage other students.",
      "verb · hoped that",
      "Hoped that introduces a full idea after the verb."
    ],
    [
      "There is still hope when we keep trying.",
      "noun · abstract idea",
      "Hope can also be a noun meaning a positive expectation."
    ]
  ]),
  abroad: makeEntry("Many students study abroad to experience a different education system.", [
    [
      "Many students study abroad after high school.",
      "adverb · study abroad",
      "Abroad means in another country, often after verbs like study, live, or travel."
    ],
    [
      "My cousin lived abroad for two years.",
      "adverb · past simple",
      "Lived abroad describes staying in another country in the past."
    ],
    [
      "Going abroad can help people understand different cultures.",
      "phrase · going abroad",
      "Going abroad works as a noun phrase at the start of a sentence."
    ]
  ]),
  improve: {
    correctedSentence: "Daily reading can improve my English step by step.",
    examples: [
      {
        sentence: "Daily reading can improve my English step by step.",
        focus: "verb · modal can",
        explanation: "Can improve means something has the power to make a skill better."
      },
      {
        sentence: "My pronunciation improved after I practiced aloud for two weeks.",
        focus: "verb · past simple",
        explanation: "Improved shows that the change already happened."
      },
      {
        sentence: "I am improving my writing by using longer and clearer sentences.",
        focus: "verb · present continuous",
        explanation: "Am improving shows a change happening now."
      }
    ]
  },
  smartphone: makeEntry("Smartphones can help students find information quickly.", [
    [
      "Smartphones can help students find information quickly.",
      "noun · plural subject",
      "Smartphones names the devices and can be the subject of an opinion sentence."
    ],
    [
      "A smartphone is useful when students need a dictionary.",
      "noun · singular subject",
      "Use a smartphone for one device."
    ],
    [
      "Some students used smartphones to record the science experiment.",
      "noun · object",
      "Smartphones can be tools for a real classroom task."
    ]
  ]),
  smartphones: makeEntry("Smartphones can help students find information quickly.", [
    [
      "Smartphones can help students find information quickly.",
      "noun · plural subject",
      "Use the plural form when discussing phones in general."
    ],
    [
      "Although smartphones are convenient, they may distract students.",
      "noun · although pattern",
      "This follows the original balanced-opinion sentence pattern."
    ],
    [
      "The school limited smartphones during exams last year.",
      "noun · object",
      "Smartphones can be the object when a rule controls their use."
    ]
  ]),
  distract: makeEntry("Noise can distract students from careful reading.", [
    [
      "Noise can distract students from careful reading.",
      "verb · distract sb from sth",
      "Distract means take someone's attention away from what matters."
    ],
    [
      "The message distracted me during the online lesson.",
      "verb · past simple",
      "Distracted describes a completed interruption."
    ],
    [
      "Students should turn off apps that distract them.",
      "verb · relative clause",
      "That distract them explains which apps are a problem."
    ]
  ]),
  study: makeEntry("Regular study helps students feel more prepared for exams.", [
    [
      "Regular study helps students feel more prepared for exams.",
      "noun · study as a habit",
      "Study can be a noun when it means learning activity."
    ],
    [
      "I study English for twenty minutes every morning.",
      "verb · present simple",
      "Study is a verb when it describes the action of learning."
    ],
    [
      "She studied the article carefully before answering.",
      "verb · past simple",
      "Studied can mean read or examined something carefully."
    ]
  ]),
  studies: makeEntry("Smartphones may distract students from their studies.", [
    [
      "Smartphones may distract students from their studies.",
      "noun · school work",
      "Studies means school learning or academic work."
    ],
    [
      "He studies English every morning before school.",
      "verb · third person singular",
      "Studies can also be the verb form after he or she."
    ],
    [
      "Her studies became more effective after she made a plan.",
      "noun · plural",
      "Her studies refers to her learning as a whole."
    ]
  ]),
  flexibility: {
    correctedSentence: "Online learning gives students more flexibility, but it also requires self-control.",
    examples: [
      {
        sentence: "Online learning gives students more flexibility.",
        focus: "noun · gives flexibility",
        explanation: "Flexibility means having more choices about time, place, or method."
      },
      {
        sentence: "The new timetable gave us more flexibility last term.",
        focus: "noun · past simple",
        explanation: "Gave flexibility describes a benefit that happened in the past."
      },
      {
        sentence: "Students need flexibility when they balance study and family duties.",
        focus: "noun · need flexibility",
        explanation: "Need flexibility is useful when talking about a real learning situation."
      }
    ]
  },
  require: makeEntry("Long-term progress requires consistent effort.", [
    [
      "Long-term progress requires consistent effort.",
      "verb · third person singular",
      "Requires means needs something in order to happen."
    ],
    [
      "The task required careful reading yesterday.",
      "verb · past simple",
      "Required describes what was needed in a past task."
    ],
    [
      "This project will require teamwork and patience.",
      "verb · future",
      "Will require connects a future task with what it will need."
    ]
  ]),
  requires: makeEntry("Online learning requires students to manage their time carefully.", [
    [
      "Online learning requires students to manage their time carefully.",
      "verb · require sb to do",
      "This pattern means a situation makes someone need to do something."
    ],
    [
      "A clear speech requires examples and a strong ending.",
      "verb · need",
      "Requires can connect a task with the things it needs."
    ],
    [
      "The new rule requires every student to arrive on time.",
      "verb · rule context",
      "Rules often require people to do something."
    ]
  ]),
  manage: {
    correctedSentence: "I need to manage my time carefully before the exam.",
    examples: [
      {
        sentence: "I need to manage my time carefully before the exam.",
        focus: "verb · need to manage",
        explanation: "Manage means control or organize something in a practical way."
      },
      {
        sentence: "She managed her study plan well last week.",
        focus: "verb · past simple",
        explanation: "Managed shows that she controlled the plan successfully in the past."
      },
      {
        sentence: "Good students can manage pressure without giving up.",
        focus: "verb · can manage",
        explanation: "Can manage means being able to deal with a difficult situation."
      }
    ]
  },
  recycle: makeEntry("Students who recycle paper regularly help protect the environment.", [
    [
      "Students who recycle paper regularly help protect the environment.",
      "verb · relative clause",
      "Recycle means use old materials again instead of throwing them away."
    ],
    [
      "Our class recycled plastic bottles after the sports meeting.",
      "verb · past simple",
      "Recycled describes an environmental action completed in the past."
    ],
    [
      "The school encourages students to recycle paper and cans.",
      "verb · to recycle",
      "To recycle can follow verbs like encourage, ask, or need."
    ]
  ]),
  regularly: makeEntry("Students who read regularly are more likely to build vocabulary.", [
    [
      "Students who read regularly are more likely to build vocabulary.",
      "adverb · habit",
      "Regularly means something happens again and again as a habit."
    ],
    [
      "She reviewed her notes regularly last month.",
      "adverb · past habit",
      "Regularly can describe repeated action in the past."
    ],
    [
      "If I practice regularly, my pronunciation will improve.",
      "adverb · condition",
      "Regularly often appears with practice, exercise, or review."
    ]
  ]),
  develop: makeEntry("Reading widely can develop a stronger sense of language.", [
    [
      "Reading widely can develop a stronger sense of language.",
      "verb · can develop",
      "Develop means build or grow an ability over time."
    ],
    [
      "She developed better study habits last semester.",
      "verb · past simple",
      "Developed describes a skill or habit that grew in the past."
    ],
    [
      "Students need time to develop confidence in speaking.",
      "verb · develop confidence",
      "Develop is often used with confidence, habits, skills, or responsibility."
    ]
  ]),
  stronger: makeEntry("Regular reading gives students a stronger sense of sentence logic.", [
    [
      "Regular reading gives students a stronger sense of sentence logic.",
      "comparative adjective",
      "Stronger compares one level with another and means more powerful or better built."
    ],
    [
      "Her argument became stronger after she added an example.",
      "comparative adjective · change",
      "Became stronger shows improvement in quality."
    ],
    [
      "A stronger reason can make an opinion more convincing.",
      "adjective · before a noun",
      "Stronger can describe a reason, body, ability, or relationship."
    ]
  ]),
  responsibility: {
    correctedSentence: "Teamwork helps students develop a stronger sense of responsibility.",
    examples: [
      {
        sentence: "Teamwork helps students develop a stronger sense of responsibility.",
        focus: "noun phrase · sense of responsibility",
        explanation: "A sense of responsibility means understanding what you should do."
      },
      {
        sentence: "He showed responsibility when he finished the group task on time.",
        focus: "noun · showed responsibility",
        explanation: "Showed responsibility describes responsible behavior in the past."
      },
      {
        sentence: "I will take responsibility for my mistakes and correct them.",
        focus: "noun phrase · take responsibility",
        explanation: "Take responsibility means accept that you should deal with a problem."
      }
    ]
  },
  through: makeEntry("Through daily practice, I became more confident in speaking English.", [
    [
      "Through daily practice, I became more confident in speaking English.",
      "preposition · method",
      "Through can show the method or process that leads to a result."
    ],
    [
      "She learned about local culture through volunteer work.",
      "preposition · experience",
      "Through often connects experience with what someone learns."
    ],
    [
      "The writer shows the character's feelings through small details.",
      "preposition · writing",
      "Through can explain how an effect is created."
    ]
  ]),
  daily: makeEntry("Daily practice helped me become more confident.", [
    [
      "Daily practice helped me become more confident.",
      "adjective · before a noun",
      "Daily describes something that happens every day."
    ],
    [
      "I review new words daily to remember them better.",
      "adverb · frequency",
      "Daily can also describe how often an action happens."
    ],
    [
      "A daily routine makes long-term learning easier.",
      "adjective · habit",
      "Daily is useful when talking about study habits."
    ]
  ]),
  gradually: {
    correctedSentence: "I gradually became more confident when I spoke English aloud.",
    examples: [
      {
        sentence: "I gradually became more confident when speaking English.",
        focus: "adverb · slow change",
        explanation: "Gradually describes a change that happens little by little."
      },
      {
        sentence: "My reading speed gradually improved last semester.",
        focus: "adverb · past change",
        explanation: "Put gradually before the verb or before improved to show slow progress."
      },
      {
        sentence: "If I practice every day, I will gradually understand longer sentences.",
        focus: "adverb · future progress",
        explanation: "Will gradually understand describes progress that is expected later."
      }
    ]
  },
  confident: {
    correctedSentence: "I feel more confident when I can explain my answer clearly.",
    examples: [
      {
        sentence: "I feel more confident when I speak English with a partner.",
        focus: "adjective · feel confident",
        explanation: "Feel confident describes a learner's state or feeling."
      },
      {
        sentence: "She became confident after several successful presentations.",
        focus: "adjective · became confident",
        explanation: "Became confident shows a change from less confident to more confident."
      },
      {
        sentence: "A confident answer usually has a clear reason.",
        focus: "adjective · before a noun",
        explanation: "Confident can describe a person, voice, answer, or attitude."
      }
    ]
  },
  others: makeEntry("Speaking in front of others made me nervous at first.", [
    [
      "Speaking in front of others made me nervous at first.",
      "pronoun · other people",
      "Others means other people, not things."
    ],
    [
      "We should listen to others before making a decision.",
      "pronoun · object",
      "Others can be the object when you mean other people."
    ],
    [
      "Some students learn quickly, while others need more time.",
      "pronoun · contrast",
      "Others is often used to compare two groups of people."
    ]
  ]),
  believe: makeEntry("I believe my communication skills will help the team.", [
    [
      "I believe my communication skills will help the team.",
      "verb · believe that idea",
      "Believe introduces an opinion or judgment."
    ],
    [
      "She believed that practice could improve her pronunciation.",
      "verb · past simple",
      "Believed that introduces a full idea in the past."
    ],
    [
      "Many people believe in the value of teamwork.",
      "verb phrase · believe in",
      "Believe in means trust the importance or truth of something."
    ]
  ]),
  patience: makeEntry("Patience helps volunteers listen carefully to visitors.", [
    [
      "Patience helps volunteers listen carefully to visitors.",
      "noun · personal quality",
      "Patience means the ability to stay calm and wait or listen."
    ],
    [
      "The teacher showed patience when a student made the same mistake again.",
      "noun · showed patience",
      "Showed patience describes calm behavior in a difficult moment."
    ],
    [
      "Learning a language requires patience and regular practice.",
      "noun · requires patience",
      "Patience often appears with learning, teaching, and long-term effort."
    ]
  ]),
  communication: makeEntry("Good communication helps a team solve problems faster.", [
    [
      "Good communication helps a team solve problems faster.",
      "noun · skill",
      "Communication means sharing ideas clearly with other people."
    ],
    [
      "Poor communication caused confusion during the group project.",
      "noun · cause",
      "Communication can be good, poor, clear, or effective."
    ],
    [
      "I improved my communication skills by asking better questions.",
      "noun phrase · communication skills",
      "Communication skills is a common phrase in applications and interviews."
    ]
  ]),
  enable: {
    correctedSentence: "Clear examples enable students to use new words naturally.",
    examples: [
      {
        sentence: "Clear examples enable students to use new words naturally.",
        focus: "verb · enable sb to do",
        explanation: "Enable means make it possible for someone to do something."
      },
      {
        sentence: "The app enabled me to review mistakes after class.",
        focus: "verb · past simple",
        explanation: "Enabled describes something that made an action possible in the past."
      },
      {
        sentence: "Better notes will enable me to prepare for the exam faster.",
        focus: "verb · future with will",
        explanation: "Will enable connects a future tool or action with a useful result."
      }
    ]
  },
  effectively: makeEntry("Clear examples help students solve problems effectively.", [
    [
      "Clear examples help students solve problems effectively.",
      "adverb · result",
      "Effectively means in a way that works well and produces a result."
    ],
    [
      "She communicated effectively during the interview.",
      "adverb · past action",
      "Effectively often follows verbs like communicate, learn, work, or solve."
    ],
    [
      "To use time effectively, students need a realistic plan.",
      "adverb · infinitive phrase",
      "Use time effectively is a natural study expression."
    ]
  ]),
  effective: {
    correctedSentence: "This method is effective because it helps me remember words in context.",
    examples: [
      {
        sentence: "This method is effective because it helps me remember words in context.",
        focus: "adjective · be effective",
        explanation: "Effective means useful because it produces a real result."
      },
      {
        sentence: "The teacher used an effective example to explain the grammar point.",
        focus: "adjective · before a noun",
        explanation: "Effective can describe a method, example, plan, or solution."
      },
      {
        sentence: "Regular review will be more effective than last-minute memorizing.",
        focus: "adjective · future comparison",
        explanation: "More effective compares two ways of learning."
      }
    ]
  },
  allow: makeEntry("Enough sleep allows the brain to organize new information.", [
    [
      "Enough sleep allows the brain to organize new information.",
      "verb · allow sth to do",
      "Allow means make it possible for someone or something to do something."
    ],
    [
      "The teacher allowed us to discuss the question in pairs.",
      "verb · past simple",
      "Allowed often means gave permission."
    ],
    [
      "A flexible schedule will allow students to review difficult lessons.",
      "verb · future result",
      "Will allow connects a future condition with a possible action."
    ]
  ]),
  allows: makeEntry("Enough sleep allows the brain to organize new information.", [
    [
      "Enough sleep allows the brain to organize new information.",
      "verb · third person singular",
      "Allows agrees with a singular subject such as sleep."
    ],
    [
      "This app allows students to check words without leaving the sentence.",
      "verb · allows sb to do",
      "Allows someone to do something is a common functional pattern."
    ],
    [
      "Regular practice allows ideas to become more natural.",
      "verb · abstract subject",
      "An action or habit can allow a useful result to happen."
    ]
  ]),
  brain: makeEntry("The brain organizes new information during sleep.", [
    [
      "The brain organizes new information during sleep.",
      "noun · body organ",
      "Brain names the organ connected with thinking, memory, and learning."
    ],
    [
      "A tired brain finds it harder to focus.",
      "noun · adjective before noun",
      "Brain can be described as tired, active, young, or healthy."
    ],
    [
      "Exercise can help the brain work more efficiently.",
      "noun · object",
      "The brain can be the object when something affects thinking."
    ]
  ]),
  organize: makeEntry("I organize my notes after class so that I can review them easily.", [
    [
      "I organize my notes after class so that I can review them easily.",
      "verb · arrange",
      "Organize means put things or ideas into a clear order."
    ],
    [
      "The monitor organized a class meeting yesterday.",
      "verb · arrange an event",
      "Organized can also mean planned an activity."
    ],
    [
      "Students should organize information before writing a summary.",
      "verb · academic skill",
      "Organize information is a useful phrase for reading and writing."
    ]
  ]),
  information: makeEntry("Students need reliable information before they make a decision.", [
    [
      "Students need reliable information before they make a decision.",
      "uncountable noun",
      "Information means facts or details; it is usually not used with a or an."
    ],
    [
      "The article provided useful information about sleep.",
      "noun · provided information",
      "Provide information is a common reading and writing phrase."
    ],
    [
      "Too much information can make a passage difficult to follow.",
      "noun · subject",
      "Information can be the subject when discussing reading difficulty."
    ]
  ]),
  perspective: {
    correctedSentence: "This article gives me a new perspective on online learning.",
    examples: [
      {
        sentence: "This article gives me a new perspective on online learning.",
        focus: "noun · perspective on",
        explanation: "Perspective means a way of seeing or thinking about something."
      },
      {
        sentence: "The debate changed my perspective on school uniforms.",
        focus: "noun · past change",
        explanation: "Changed my perspective means it made me think in a new way."
      },
      {
        sentence: "We should listen to different perspectives before making a decision.",
        focus: "plural noun",
        explanation: "Perspectives can mean different opinions or viewpoints."
      }
    ]
  },
  recent: makeEntry("A recent study shows that teenagers need enough sleep.", [
    [
      "A recent study shows that teenagers need enough sleep.",
      "adjective · before a noun",
      "Recent means happening not long ago."
    ],
    [
      "Recent changes in technology have affected students' study habits.",
      "adjective · plural noun",
      "Recent can describe changes, studies, news, or events."
    ],
    [
      "In recent years, more students have used online learning tools.",
      "phrase · in recent years",
      "In recent years is useful for essays about social changes."
    ]
  ]),
  teenagers: makeEntry("Teenagers who sleep less than seven hours may feel stressed.", [
    [
      "Teenagers who sleep less than seven hours may feel stressed.",
      "noun · people",
      "Teenagers means people aged roughly thirteen to nineteen."
    ],
    [
      "Many teenagers use smartphones to search for information.",
      "noun · general group",
      "Many teenagers is useful when discussing a social or school issue."
    ],
    [
      "The program helped teenagers develop better reading habits.",
      "noun · object",
      "Teenagers can be the object when a program or rule affects them."
    ]
  ]),
  likely: makeEntry("Students who sleep well are more likely to stay focused.", [
    [
      "Students who sleep well are more likely to stay focused.",
      "adjective phrase · be likely to",
      "Be likely to means something will probably happen."
    ],
    [
      "It is likely that the meeting will end early.",
      "adjective · it is likely that",
      "It is likely that introduces a probable situation."
    ],
    [
      "Careless readers are less likely to notice the key word.",
      "comparative phrase",
      "Less likely means something will probably happen less often."
    ]
  ]),
  stressed: makeEntry("Teenagers may feel stressed when they sleep too little.", [
    [
      "Teenagers may feel stressed when they sleep too little.",
      "adjective · feel stressed",
      "Stressed describes a person feeling pressure or worry."
    ],
    [
      "She felt stressed before the final exam.",
      "adjective · past feeling",
      "Felt stressed describes an emotional state in the past."
    ],
    [
      "A stressed student needs rest and a clear plan.",
      "adjective · before a noun",
      "Stressed can describe a student, worker, parent, or group."
    ]
  ]),
  stand: makeEntry("She stood by the window and watched the rain.", [
    [
      "She stood by the window and watched the rain.",
      "verb · past simple",
      "Stood is the past form of stand and describes where someone was."
    ],
    [
      "I stand near the door when the classroom is crowded.",
      "verb · present simple",
      "Stand means stay on your feet in a place."
    ],
    [
      "Standing by the gate, he waited for his friend quietly.",
      "participle · scene description",
      "Standing can introduce a scene while the main action continues."
    ]
  ]),
  stood: makeEntry("She stood by the window and watched the rain.", [
    [
      "She stood by the window, watching the rain.",
      "verb · past simple",
      "Stood gives the main position in the scene."
    ],
    [
      "He stood at the front of the classroom and began his speech.",
      "verb · story action",
      "Stood often sets up a scene before another action."
    ],
    [
      "They stood in silence after hearing the news.",
      "verb · state",
      "Stood can describe a quiet state, not only a movement."
    ]
  ]),
  watch: makeEntry("She watched the rain fall quietly over the empty street.", [
    [
      "She watched the rain fall quietly over the empty street.",
      "verb · watch sb/sth do",
      "Watch can be followed by an object and a bare verb."
    ],
    [
      "I watched a short video about climate change yesterday.",
      "verb · past simple",
      "Watched can describe viewing a video, game, or scene."
    ],
    [
      "Watching the speaker carefully helped me understand the message.",
      "gerund · subject",
      "Watching can act like a noun at the start of a sentence."
    ]
  ]),
  watching: makeEntry("Standing by the window, she was watching the rain.", [
    [
      "She stood by the window, watching the rain.",
      "participle · accompanying action",
      "Watching adds what she was doing while she stood there."
    ],
    [
      "I was watching the debate when the teacher asked a question.",
      "verb · past continuous",
      "Was watching shows an action in progress in the past."
    ],
    [
      "Watching others speak English can help me learn natural expressions.",
      "gerund · subject",
      "Watching can be the subject when the action itself is the topic."
    ]
  ]),
  quietly: makeEntry("The rain fell quietly over the empty street.", [
    [
      "The rain fell quietly over the empty street.",
      "adverb · manner",
      "Quietly describes how something happens."
    ],
    [
      "She answered quietly because she was nervous.",
      "adverb · after a verb",
      "Quietly often follows an action verb."
    ],
    [
      "The students worked quietly while the teacher checked their essays.",
      "adverb · classroom scene",
      "Quietly can create a calm scene in writing."
    ]
  ]),
  empty: makeEntry("The empty street made the scene feel lonely.", [
    [
      "The empty street made the scene feel lonely.",
      "adjective · before a noun",
      "Empty means there is nothing or nobody inside or there."
    ],
    [
      "The classroom was empty after the final bell.",
      "adjective · be empty",
      "Be empty describes a place with no people or objects."
    ],
    [
      "He looked at the empty seat and felt worried.",
      "adjective · story detail",
      "Empty can add emotion to a scene."
    ]
  ]),
  broaden: makeEntry("Reading different opinions can broaden students' perspective.", [
    [
      "Reading different opinions can broaden students' perspective.",
      "verb · can broaden",
      "Broaden means make knowledge, experience, or understanding wider."
    ],
    [
      "The exchange program broadened her view of the world.",
      "verb · past simple",
      "Broadened describes a change that already happened."
    ],
    [
      "Travel may broaden our understanding of different cultures.",
      "verb · may broaden",
      "Broaden often appears with perspective, view, knowledge, or understanding."
    ]
  ]),
  strengthen: makeEntry("Regular speaking practice can strengthen my ability to express ideas.", [
    [
      "Regular speaking practice can strengthen my ability to express ideas.",
      "verb · can strengthen",
      "Strengthen means make something stronger."
    ],
    [
      "The examples strengthened his argument in the debate.",
      "verb · past simple",
      "Strengthened can describe making an argument more convincing."
    ],
    [
      "Group work will strengthen communication between classmates.",
      "verb · future",
      "Strengthen can describe improving a skill, relationship, or argument."
    ]
  ]),
  accurately: makeEntry("Students need to express ideas accurately in formal writing.", [
    [
      "Students need to express ideas accurately in formal writing.",
      "adverb · manner",
      "Accurately means correctly and precisely."
    ],
    [
      "She answered the grammar question accurately.",
      "adverb · after a verb",
      "Accurately shows the answer matched the facts or rules."
    ],
    [
      "To summarize accurately, readers must find the main idea first.",
      "adverb · infinitive phrase",
      "Summarize accurately is useful in reading tasks."
    ]
  ]),
  responsible: makeEntry("A responsible student checks the task before submitting it.", [
    [
      "A responsible student checks the task before submitting it.",
      "adjective · before a noun",
      "Responsible describes someone who takes duties seriously."
    ],
    [
      "She was responsible for organizing the group discussion.",
      "adjective phrase · responsible for",
      "Be responsible for means have a duty to handle something."
    ],
    [
      "Using AI responsibly is important for students.",
      "adverb form · responsibly",
      "Responsibly is the adverb form and describes how an action is done."
    ]
  ]),
  consistent: {
    correctedSentence: "Consistent practice helps me make steady progress in English.",
    examples: [
      {
        sentence: "Consistent practice helps me make steady progress in English.",
        focus: "adjective · before a noun",
        explanation: "Consistent means regular and not easily stopped."
      },
      {
        sentence: "Her answers were consistent with the main idea of the passage.",
        focus: "adjective · be consistent with",
        explanation: "Be consistent with means match or agree with something."
      },
      {
        sentence: "I will keep a consistent study routine this month.",
        focus: "adjective · future plan",
        explanation: "A consistent routine is a regular habit that continues over time."
      }
    ]
  },
  careful: makeEntry("Careful judgment helps students choose reliable information.", [
    [
      "Careful judgment helps students choose reliable information.",
      "adjective · before a noun",
      "Careful means paying attention and avoiding mistakes."
    ],
    [
      "Be careful when you answer a question with two similar choices.",
      "adjective · be careful",
      "Be careful is used as advice or warning."
    ],
    [
      "She made a careful plan before the speech.",
      "adjective · planning",
      "Careful can describe a plan, reader, answer, or decision."
    ]
  ]),
  judgment: makeEntry("Good judgment helps students decide when to use online tools.", [
    [
      "Good judgment helps students decide when to use online tools.",
      "noun · ability to decide",
      "Judgment means the ability to make sensible decisions."
    ],
    [
      "His judgment was better after he heard both sides of the debate.",
      "noun · be better",
      "Judgment can improve when someone gets more information."
    ],
    [
      "We should not make a judgment before understanding the facts.",
      "noun phrase · make a judgment",
      "Make a judgment means form an opinion or decision."
    ]
  ]),
  effort: makeEntry("Consistent effort is more useful than last-minute memorizing.", [
    [
      "Consistent effort is more useful than last-minute memorizing.",
      "noun · hard work",
      "Effort means the energy and work you put into something."
    ],
    [
      "She made a great effort to improve her writing.",
      "noun phrase · make an effort",
      "Make an effort means try hard."
    ],
    [
      "Without effort, a good plan will not lead to progress.",
      "noun · condition",
      "Effort often appears in sentences about learning and progress."
    ]
  ]),
  attitude: makeEntry("A responsible attitude helps students keep learning after mistakes.", [
    [
      "A responsible attitude helps students keep learning after mistakes.",
      "noun · way of thinking",
      "Attitude means how someone thinks or feels about something."
    ],
    [
      "Her attitude changed after she saw her progress.",
      "noun · past change",
      "Attitude can change when experience changes someone's thinking."
    ],
    [
      "Students with a positive attitude are more willing to speak English.",
      "noun phrase · positive attitude",
      "Positive attitude is a common phrase in school and writing topics."
    ]
  ]),
  situation: makeEntry("The situation requires careful judgment and a responsible attitude.", [
    [
      "The situation requires careful judgment and a responsible attitude.",
      "noun · current condition",
      "Situation means the facts or conditions around an event."
    ],
    [
      "In this situation, students should ask for help early.",
      "phrase · in this situation",
      "In this situation is useful when giving advice."
    ],
    [
      "The situation became worse because nobody explained the problem clearly.",
      "noun · became worse",
      "A situation can become better, worse, easier, or more difficult."
    ]
  ]),
  experience: makeEntry("This experience can broaden students' perspective.", [
    [
      "This experience can broaden students' perspective.",
      "noun · event that teaches",
      "Experience means something you go through and learn from."
    ],
    [
      "I experienced a different way of learning during the online course.",
      "verb · past simple",
      "Experience can also be a verb meaning go through something."
    ],
    [
      "Volunteer experience helped her communicate with different people.",
      "noun phrase · volunteer experience",
      "Experience often describes practice gained from real activities."
    ]
  ]),
  ability: makeEntry("Practice can strengthen my ability to express ideas accurately.", [
    [
      "Practice can strengthen my ability to express ideas accurately.",
      "noun · ability to do",
      "Ability means the power or skill to do something."
    ],
    [
      "Her ability improved after months of reading aloud.",
      "noun · subject",
      "Ability can improve, grow, or become stronger."
    ],
    [
      "Students need the ability to understand long sentences.",
      "noun phrase · ability to",
      "Ability to do something is a common academic pattern."
    ]
  ]),
  decision: makeEntry("I made a careful decision after comparing both choices.", [
    [
      "I made a careful decision after comparing both choices.",
      "noun · make a decision",
      "Make a decision means choose after thinking; it is natural in study, life, and discussion contexts."
    ],
    [
      "Her decision changed the group's plan yesterday.",
      "noun · subject",
      "Decision can be the subject when the choice itself causes a result."
    ],
    [
      "Students should explain their decision with a clear reason.",
      "noun · explain one's decision",
      "Explain a decision is useful when answering why someone chose something."
    ]
  ]),
  campus: makeEntry("Our campus becomes quiet after the last class.", [
    [
      "Our campus becomes quiet after the last class.",
      "noun · place",
      "Campus means the school or college area, so it naturally appears with places, buildings, and student life."
    ],
    [
      "The school cleaned the campus before the festival last week.",
      "noun · object",
      "Campus can be the object when people clean, visit, improve, or protect a school area."
    ],
    [
      "Students will plant more trees on campus next spring.",
      "phrase · on campus",
      "On campus is a common phrase meaning inside the school or college area."
    ]
  ]),
  foundation: makeEntry("A strong foundation helps students understand harder grammar later.", [
    [
      "A strong foundation helps students understand harder grammar later.",
      "noun · strong foundation",
      "Foundation means the basic support that later learning depends on."
    ],
    [
      "She built a better foundation by reading simple sentences every day.",
      "noun · build a foundation",
      "Build a foundation is a natural phrase for developing basic ability over time."
    ],
    [
      "Without a clear foundation in sentence structure, long passages become difficult.",
      "noun phrase · foundation in",
      "Foundation in something means basic knowledge in that area."
    ]
  ]),
  provide: makeEntry("The passage provides a clear reason for the change.", [
    ["The passage provides a clear reason for the change.", "reading · provide a reason", "Provide often appears when a passage gives reasons or information."],
    ["AI tools can provide quick explanations, but students still need to think independently.", "hot topic · provide explanations", "This fits technology-and-learning writing."],
    ["The school provided students with a quiet room for reading last term.", "grammar · provide sb with sth", "Provide sb with sth is useful in school-life writing."]
  ]),
  accepting: makeEntry("Students should think carefully before accepting an answer.", [
    ["Students should think carefully before accepting an answer.", "grammar · before doing", "Before accepting shows an action after careful thinking."],
    ["Accepting advice does not mean giving up your own judgment.", "gerund · subject", "Accepting can act as the subject of a sentence."],
    ["After accepting the teacher's suggestion, she revised her paragraph again.", "grammar · after doing", "After accepting connects one action with the next step."]
  ]),
  accept: makeEntry("Students should not accept an answer without checking the reason.", [
    ["Students should not accept an answer without checking the reason.", "technology topic · critical thinking", "Accept is useful in information-quality discussions."],
    ["She accepted the advice and rewrote the ending yesterday.", "verb · past simple", "Accepted describes a completed decision to take advice."],
    ["It is wise to accept help when the task is truly difficult.", "grammar · it is ... to", "This gives a judgment and a practical action."]
  ]),
  connect: makeEntry("Good examples connect personal experience with a larger idea.", [
    ["Good examples connect personal experience with a larger idea.", "writing · connect A with B", "Connect A with B helps examples support an opinion."],
    ["The story connected the character's choice with his sense of responsibility.", "reading · past simple", "Connected shows how two ideas are linked in a passage."],
    ["Students should connect the topic with real life before writing.", "writing strategy · before doing", "This fits Gaokao writing preparation."]
  ]),
  connects: makeEntry("The news connects school knowledge with real discovery.", [
    ["The news connects school knowledge with real discovery.", "reading · connect A with B", "Connects links classroom learning and real life."],
    ["A good topic sentence connects the example with the main idea.", "paragraph logic · topic sentence", "This fits paragraph-structure training."],
    ["This experience connects what I learned with what I can do for others.", "writing · reflection", "This is useful in application and reflection writing."]
  ]),
  lead: makeEntry("Small changes can lead to better learning habits.", [
    ["Small changes can lead to better learning habits.", "cause-result · lead to", "Lead to means cause a result."],
    ["The discussion led to a new plan for the class project.", "verb · past led to", "Led to is the past form and often introduces a result."],
    ["A clear question can lead readers to the main idea of a passage.", "reading · guide readers", "Lead can also mean guide someone toward an idea."]
  ]),
  seemed: makeEntry("The article seemed difficult until I found the main idea.", [
    ["The article seemed difficult until I found the main idea.", "linking verb · seemed + adjective", "Seemed describes how something appeared at first."],
    ["The small door seemed to lead to a world she had never seen before.", "story reading · seemed to do", "Seemed to do is common in narrative reading."],
    ["At first, the solution seemed impossible, but the team kept trying.", "contrast · but", "This connects appearance with later action."]
  ]),
  return: makeEntry("I would like to return these earphones because they stopped working.", [
    ["I would like to return these earphones because they stopped working.", "life writing · polite request", "Return is natural in a service or problem-solving situation."],
    ["She returned the book to the library before the deadline.", "verb · return sth to", "Return sth to a place means give it back."],
    ["When writing a complaint, students should explain why they want to return the product.", "application writing · why-clause", "This fits practical writing tasks."]
  ]),
  notice: makeEntry("Careful readers notice how the second sentence supports the first.", [
    ["Careful readers notice how the second sentence supports the first.", "reading · notice how", "Notice how introduces a reading focus."],
    ["I noticed the writer's attitude after reading the final paragraph.", "verb · past simple", "Noticed describes understanding a detail in a passage."],
    ["Students should notice the connector before choosing an answer.", "exam strategy · before doing", "This fits reading-comprehension strategy."]
  ]),
  train: makeEntry("Short videos may train students to expect quick information.", [
    ["Short videos may train students to expect quick information.", "hot topic · train sb to do", "Train can mean gradually make someone develop a habit."],
    ["The reading task trained us to find evidence before answering.", "verb · past simple", "Trained describes a skill developed through practice."],
    ["To train our attention, we should read longer texts regularly.", "purpose · to do", "This fits advice writing about study habits."]
  ]),
  discover: makeEntry("Students can discover useful ideas when they read with questions.", [
    ["Students can discover useful ideas when they read with questions.", "reading · discover ideas", "Discover means find something new or meaningful through reading or experience."],
    ["The character discovered the truth after comparing small details.", "story reading · past simple", "Discovered is common in narrative passages."],
    ["To discover the writer's purpose, readers should notice repeated details.", "exam strategy · to do", "This sentence connects discover with reading purpose."]
  ]),
  discovery: makeEntry("Real discovery can make school knowledge more meaningful.", [
    ["Real discovery can make school knowledge more meaningful.", "science topic · real discovery", "Discovery is often used in science news and learning motivation passages."],
    ["The discovery changed how people understood the natural world.", "reading · subject", "Discovery can be the subject that causes a change."],
    ["Students may mention a discovery when writing about curiosity and learning.", "writing · mention sth when doing", "This fits science or personal-growth writing."]
  ]),
  communicate: makeEntry("Volunteers need to communicate with visitors politely.", [
    ["Volunteers need to communicate with visitors politely.", "application writing · communicate with", "Communicate with someone is useful in volunteer application writing."],
    ["She communicated clearly during the interview yesterday.", "verb · past simple", "Communicated describes a completed speaking situation."],
    ["To communicate effectively, students should give examples instead of empty words.", "purpose · to do", "This fits speech and application writing."]
  ]),
  explain: makeEntry("Students should explain their opinion with a clear example.", [
    ["Students should explain their opinion with a clear example.", "writing · explain with evidence", "Explain is tied to reasons and evidence in exam writing."],
    ["The article explained why teenagers need enough sleep.", "reading · why-clause", "Explained why introduces cause analysis in a passage."],
    ["To explain the sentence, readers should first find the main verb.", "grammar strategy · to do", "This connects explain with sentence analysis."]
  ]),
  fail: makeEntry("People make progress not because they never fail, but because they learn from failure.", [
    ["People make progress not because they never fail, but because they learn from failure.", "speech · not because ... but because ...", "Fail is often used in inspirational passages about growth."],
    ["He failed to finish the task on time, but he did not give up.", "verb · fail to do", "Fail to do means not succeed in doing something."],
    ["If students fail once, they should correct the mistake and try again.", "advice · if-clause", "This sentence fits growth and learning topics."]
  ]),
  race: makeEntry("People race dragon boats during the Dragon Boat Festival.", [
    ["People race dragon boats during the Dragon Boat Festival.", "culture topic · race dragon boats", "Race can be a verb in cultural descriptions of dragon boat activities."],
    ["The teams raced across the river while people cheered on the bank.", "story/culture · past simple", "Raced describes a completed action in a vivid scene."],
    ["A dragon boat race shows the value of teamwork and shared memory.", "noun · race", "Race can also be a noun for a competition."]
  ])
};

const subjectPattern =
  /\b(i|you|he|she|it|we|they|my|your|his|her|our|their|the|a|an|students?|teachers?|people|this|that|someone|everyone|classmates?|friends?|parents?|schools?|teachers?|learning|reading|writing|practice|technology|smartphones?|homework|sleep|teamwork|experience|examples?|answers?|ideas?|debate)\b/i;
const finiteVerbPattern =
  /\b(am|is|are|was|were|be|been|being|do|does|did|have|has|had|can|could|will|would|should|may|might|must|need|needs|needed|want|wants|wanted|try|tries|tried|help|helps|helped|make|makes|made|use|uses|used|learn|learns|learned|improve|improves|improved|debate|debates|debated|show|shows|showed|give|gives|gave|take|takes|took|become|becomes|became|allow|allows|allowed|enable|enables|enabled|require|requires|required|manage|manages|managed|submit|submits|submitted|offer|offers|offered|recycle|recycles|recycled|develop|develops|developed|believe|believes|believed|organize|organizes|organized|stand|stands|stood|watch|watches|watched|broaden|broadens|broadened|strengthen|strengthens|strengthened|communicate|communicates|communicated|feel|feels|felt|work|works|worked|answer|answers|answered|write|writes|wrote|read|reads|explain|explains|explained|understand|understands|understood|discuss|discusses|discussed|choose|chooses|chose|chosen|check|checks|checked|solve|solves|solved|keep|keeps|kept|focus|focuses|focused|express|expresses|expressed|remember|remembers|remembered|support|supports|supported|agree|agrees|agreed|think|thinks|thought|say|says|said)\b/i;
const genericVerbPattern = /\b[a-z]{3,}(?:s|ed)\b/i;

const normalize = (value: string) => value.trim().toLowerCase();

const simplePast = (verb: string) => {
  if (irregularForms[verb]?.includes("submitted")) return "submitted";
  if (irregularForms[verb]?.includes("led")) return "led";
  if (verb.endsWith("e")) return `${verb}d`;
  if (verb.endsWith("y")) return `${verb.slice(0, -1)}ied`;
  return `${verb}ed`;
};

const irregularForms: Record<string, string[]> = {
  submit: ["submitted", "submitting"],
  stand: ["stood", "standing"],
  study: ["studies", "studied", "studying"],
  responsible: ["responsibly"],
  effective: ["effectively"],
  accurate: ["accurately"],
  communication: ["communicate", "communicates", "communicated", "communicating"],
  experience: ["experienced", "experiencing"],
  ability: ["abilities"],
  empty: ["emptier", "emptiest"],
  strong: ["stronger", "strongest"],
  stressed: ["stress", "stresses", "stressed"],
  lead: ["led", "leading"]
};

const acceptedForms = (word: string) => {
  const base = normalize(word);
  const forms = new Set([base, `${base}s`, `${base}ed`, `${base}ing`]);
  irregularForms[base]?.forEach((form) => forms.add(form));
  if (base.endsWith("y")) forms.add(`${base.slice(0, -1)}ies`);
  if (base.endsWith("e")) {
    forms.add(`${base.slice(0, -1)}ing`);
    forms.add(`${base}d`);
  }
  return forms;
};

const containsTargetWord = (sentence: string, words: string[]) => {
  const forms = new Set(words.flatMap((word) => [...acceptedForms(word)]));
  const tokens = sentence.toLowerCase().match(/[a-z']+/g) ?? [];
  return tokens.some((token) => forms.has(token));
};

const contentWords = (sentence: string) =>
  new Set(
    (sentence.toLowerCase().match(/[a-z']+/g) ?? []).filter(
      (token) =>
        token.length > 2 &&
        !["the", "and", "for", "that", "with", "this", "from", "into", "when", "while", "because"].includes(token)
    )
  );

const similarity = (left: string, right: string) => {
  const a = contentWords(left);
  const b = contentWords(right);
  if (a.size === 0 || b.size === 0) return 0;
  const overlap = [...a].filter((token) => b.has(token)).length;
  return overlap / Math.max(a.size, b.size);
};

const isCopiedFromProvidedExamples = (answer: string, word: UnknownWordRecord, reviewEntry: ReviewEntry) => {
  const providedSentences = [
    word.sourceSentence,
    reviewEntry.correctedSentence,
    ...reviewEntry.examples.map((example) => example.sentence)
  ].filter(Boolean);
  const normalizedAnswer = answer.trim().toLowerCase().replace(/\s+/g, " ");
  return providedSentences.some((sentence) => {
    const normalizedSentence = sentence.trim().toLowerCase().replace(/\s+/g, " ");
    return normalizedAnswer === normalizedSentence || similarity(answer, sentence) >= 0.86;
  });
};

const indexFor = (value: string, length: number) =>
  [...value].reduce((total, char) => total + char.charCodeAt(0), 0) % length;

const pickThree = <T,>(target: string, items: T[]) => {
  const start = indexFor(target, items.length);
  return [items[start], items[(start + 1) % items.length], items[(start + 2) % items.length]];
};

const juniorEntries: Record<string, ReviewEntry> = {
  borrow: makeEntry("Can I borrow your pencil?", [
    ["Can I borrow your pencil?", "request · Can I ...?", "Borrow means use something and give it back."],
    ["I borrowed a book from the library yesterday.", "past · borrowed", "Borrowed tells what someone used in the past."],
    ["Please borrow my ruler if you need it.", "offer · borrow my ...", "This is a simple way to offer help."]
  ]),
  pencil: makeEntry("I write with a pencil in class.", [
    ["I write with a pencil in class.", "tool · with a pencil", "Pencil is a school thing used for writing."],
    ["This pencil is on my desk.", "be sentence · this pencil", "This sentence tells where one pencil is."],
    ["I need a pencil for the English test.", "need · school item", "Need a pencil is a real classroom phrase."]
  ]),
  minute: makeEntry("Wait a minute, please.", [
    ["Wait a minute, please.", "time · a minute", "A minute is a short time."],
    ["I read the sentence for one minute.", "time phrase · for", "For one minute tells how long."],
    ["The class starts in five minutes.", "future time · in", "In five minutes means after five minutes."]
  ]),
  time: makeEntry("What time does the class start?", [
    ["What time does the class start?", "question · What time", "Use What time to ask about clock time."],
    ["I have time to read after dinner.", "noun · have time", "Have time means there is time to do something."],
    ["This time, I answered carefully.", "phrase · this time", "This time means on this try."]
  ]),
  class: makeEntry("Our English class starts at nine.", [
    ["Our English class starts at nine.", "school · class starts", "Class means a lesson or a group of students."],
    ["I listened carefully in class yesterday.", "place phrase · in class", "In class means during the lesson."],
    ["The class is reading a short story.", "group · the class", "The class can mean all the students."]
  ]),
  start: makeEntry("The movie starts at seven.", [
    ["The movie starts at seven.", "verb · starts at", "Start means begin."],
    ["Our lesson started after the bell.", "past · started", "Started tells when something began in the past."],
    ["I will start my homework after dinner.", "future · will start", "Will start talks about a future action."]
  ]),
  noodles: makeEntry("I would like some noodles.", [
    ["I would like some noodles.", "food · would like", "Noodles is food and usually uses the plural form."],
    ["These noodles are hot.", "be sentence · noodles are", "Use are with plural noodles."],
    ["I ate noodles for lunch yesterday.", "past · ate noodles", "This is a simple past food sentence."]
  ]),
  hungry: makeEntry("I am hungry after school.", [
    ["I am hungry after school.", "feeling · be hungry", "Hungry means wanting food."],
    ["She was hungry before lunch.", "past · was hungry", "Was hungry describes a past feeling."],
    ["If I am hungry, I eat some bread.", "if · simple habit", "This connects a feeling with an action."]
  ]),
  find: makeEntry("I can't find my English book.", [
    ["I can't find my English book.", "problem · can't find", "Find means see where something is."],
    ["I found my bag under the desk.", "past · found", "Found is the past form of find."],
    ["Can you help me find my ruler?", "help · find", "This is a real request for help."]
  ]),
  book: makeEntry("This book is interesting.", [
    ["This book is interesting.", "be sentence · this book", "Book is a common school object."],
    ["I read a book before bed.", "verb object · read a book", "Read a book is a useful daily phrase."],
    ["My book was in my schoolbag.", "past · was", "This tells where the book was."]
  ]),
  visit: makeEntry("I visit my grandparents on Sunday.", [
    ["I visit my grandparents on Sunday.", "habit · visit someone", "Visit means go to see someone."],
    ["We visited a museum yesterday.", "past · visited", "Visited tells where someone went in the past."],
    ["I am going to visit my friend this weekend.", "future · going to", "Going to visit talks about a plan."]
  ]),
  grandparents: makeEntry("My grandparents live near my school.", [
    ["My grandparents live near my school.", "family · plural subject", "Grandparents means grandfather and grandmother."],
    ["I called my grandparents last night.", "past · called", "This is a simple family-life sentence."],
    ["We will visit our grandparents this weekend.", "future · will visit", "This talks about a family plan."]
  ]),
  weekend: makeEntry("I play football on the weekend.", [
    ["I play football on the weekend.", "time · on the weekend", "Weekend means Saturday and Sunday."],
    ["Last weekend, I visited my grandparents.", "past time · last weekend", "Last weekend talks about the past."],
    ["This weekend, I am going to read a story.", "future plan · this weekend", "This weekend talks about a plan."]
  ]),
  drawing: makeEntry("I like drawing after class.", [
    ["I like drawing after class.", "hobby · like doing", "Drawing can be a hobby."],
    ["Drawing helps me relax.", "subject · drawing helps", "Drawing can be the subject of a sentence."],
    ["She was drawing a flower yesterday.", "past continuous · was drawing", "Was drawing shows an action in the past."]
  ]),
  relax: makeEntry("Music helps me relax.", [
    ["Music helps me relax.", "help · help me do", "Relax means feel calm."],
    ["I relaxed at home after school.", "past · relaxed", "Relaxed tells what happened in the past."],
    ["I want to relax for ten minutes.", "want to · relax", "Want to relax is a simple need."]
  ]),
  football: makeEntry("I play football with my friends.", [
    ["I play football with my friends.", "sport · play football", "Play football is a common sport phrase."],
    ["We played football yesterday.", "past · played", "Played tells a past activity."],
    ["Football makes me happy.", "subject · football makes", "Football can be the subject of a sentence."]
  ]),
  yesterday: makeEntry("I played football yesterday.", [
    ["I played football yesterday.", "past time · yesterday", "Yesterday means the day before today."],
    ["Yesterday, I read an English story.", "past · comma after time", "Use past tense with yesterday."],
    ["She was tired yesterday.", "be past · was", "Was describes a past state."]
  ]),
  should: makeEntry("We should listen carefully in class.", [
    ["We should listen carefully in class.", "advice · should do", "Should gives advice."],
    ["You should read the question first.", "exam habit · should", "This is useful before answering."],
    ["Students should not copy examples.", "negative · should not", "Should not gives advice about what not to do."]
  ]),
  carefully: makeEntry("Please read the question carefully.", [
    ["Please read the question carefully.", "adverb · how to read", "Carefully tells how someone reads."],
    ["She listened carefully in class.", "past · listened carefully", "This describes a past classroom action."],
    ["If I write carefully, I make fewer mistakes.", "if · habit", "This connects careful action with a result."]
  ]),
  friend: makeEntry("A good friend helps you.", [
    ["A good friend helps you.", "person · friend helps", "Friend means someone you like and trust."],
    ["I met my friend after school.", "past · met", "This is a simple daily-life sentence."],
    ["My friend and I read together.", "compound subject", "This talks about two people doing something."]
  ]),
  afraid: makeEntry("I am afraid of the dark.", [
    ["I am afraid of the dark.", "feeling · afraid of", "Afraid means scared."],
    ["She was afraid before the speech.", "past · was afraid", "This describes a past feeling."],
    ["Do not be afraid to ask questions.", "advice · afraid to", "Afraid to do means scared to do something."]
  ]),
  practice: makeEntry("I practice English every day.", [
    ["I practice English every day.", "habit · practice English", "Practice means do something again to improve."],
    ["She practiced reading yesterday.", "past · practiced", "This tells a past learning action."],
    ["More practice can help me speak better.", "noun · practice", "Practice can also be a noun."]
  ]),
  question: makeEntry("Please read the question first.", [
    ["Please read the question first.", "test · read the question", "Question means something you need to answer."],
    ["I asked a question after class.", "noun object · ask a question", "Ask a question is a common classroom phrase."],
    ["This question is not difficult.", "be sentence · this question", "This gives a simple judgment."]
  ]),
  answer: makeEntry("I know the answer.", [
    ["I know the answer.", "noun · the answer", "Answer means the response to a question."],
    ["She answered the question clearly.", "verb · answered", "Answer can also be a verb."],
    ["Can you answer this question?", "question · can answer", "This asks about ability."]
  ]),
  door: makeEntry("Please open the door.", [
    ["Please open the door.", "object · the door", "Door is something you open or close."],
    ["The door was open yesterday.", "past · was open", "This describes the door in the past."],
    ["I saw a cat near the door.", "place · near the door", "Near the door tells where something is."]
  ]),
  quiet: makeEntry("The room is quiet.", [
    ["The room is quiet.", "adjective · be quiet", "Quiet means not noisy."],
    ["She kept quiet during the story.", "phrase · keep quiet", "Keep quiet means stay silent."],
    ["A quiet place helps me read.", "adjective before noun", "Quiet can describe a place."]
  ]),
  english: makeEntry("English helps me talk with more people.", [
    ["English helps me talk with more people.", "subject · English helps", "English is the language or school subject."],
    ["I read English words every morning.", "noun adjective · English words", "English can describe words, books, or lessons."],
    ["My English is getting better.", "school subject · my English", "My English means my English ability."]
  ]),
  would: makeEntry("I would like some water.", [
    ["I would like some water.", "polite · would like", "Would like is a polite way to say want."],
    ["Would you like to join us?", "question · would you like", "Use this to invite someone politely."],
    ["I would help her if I had time.", "if · would", "Would can talk about an imagined action."]
  ]),
  going: makeEntry("I am going to visit my friend.", [
    ["I am going to visit my friend.", "future · be going to", "Be going to talks about a plan."],
    ["She is going to read after dinner.", "future · plan", "This tells what she plans to do."],
    ["We are going to the library now.", "movement · going to", "Going to can also mean moving to a place."]
  ]),
  help: makeEntry("Can you help me?", [
    ["Can you help me?", "request · help me", "Help means make something easier for another person."],
    ["My friend helped me yesterday.", "past · helped", "Helped tells a past action."],
    ["Reading helps me learn new words.", "subject · helps me", "A thing or activity can help someone learn."]
  ]),
  helps: makeEntry("Reading helps me learn new words.", [
    ["Reading helps me learn new words.", "third person · helps", "Use helps after one thing, such as reading."],
    ["My mother helps me with homework.", "help with", "Help with means give support for a task."],
    ["This picture helps me understand the story.", "help understand", "Help can be followed by another verb."]
  ]),
  played: makeEntry("We played football yesterday.", [
    ["We played football yesterday.", "past · played football", "Played tells an activity in the past."],
    ["I played with my friends after school.", "past · played with", "Played with tells who joined the activity."],
    ["She played the piano at home.", "past · played the piano", "Play can be used with sports and instruments."]
  ]),
  friends: makeEntry("I play with my friends after school.", [
    ["I play with my friends after school.", "people · my friends", "Friends are people you like and trust."],
    ["My friends helped me yesterday.", "plural subject", "Use friends when there is more than one friend."],
    ["I can talk to my friends in English.", "talk to", "Talk to friends is a real communication sentence."]
  ]),
  listen: makeEntry("Please listen carefully.", [
    ["Please listen carefully.", "request · listen", "Listen means use your ears and pay attention."],
    ["I listened to the teacher in class.", "past · listened to", "Listen to someone is the natural phrase."],
    ["Students should listen before they answer.", "advice · should listen", "This is useful in class and tests."]
  ]),
  ai: makeEntry("AI can check my spelling.", [
    ["AI can check my spelling.", "technology · can check", "AI means artificial intelligence."],
    ["I used AI to find one mistake.", "past · used AI", "This talks about a past tool use."],
    ["AI is useful, but I still need to think.", "contrast · but", "This gives a simple balanced idea."]
  ]),
  check: makeEntry("Please check your answer.", [
    ["Please check your answer.", "request · check", "Check means look again to find mistakes."],
    ["I checked my spelling yesterday.", "past · checked", "Checked tells a past action."],
    ["We should check the question first.", "advice · should check", "This is a useful test habit."]
  ]),
  spelling: makeEntry("My spelling is improving.", [
    ["My spelling is improving.", "skill · spelling", "Spelling means writing words with the right letters."],
    ["Please check your spelling.", "object · check spelling", "Check spelling is a common writing phrase."],
    ["I made a spelling mistake yesterday.", "noun phrase", "A spelling mistake means a word was written incorrectly."]
  ]),
  myself: makeEntry("I can do it myself.", [
    ["I can do it myself.", "reflexive · myself", "Myself means I do it, not another person."],
    ["I checked the answer myself.", "past · myself", "This shows who did the action."],
    ["I want to make the card myself.", "want to", "Myself can show independence."]
  ]),
  stay: makeEntry("Please stay here for a minute.", [
    ["Please stay here for a minute.", "request · stay here", "Stay means remain in one place."],
    ["I stayed at home yesterday.", "past · stayed", "Stayed tells where someone was in the past."],
    ["My friend stays with me after school.", "third person · stays", "Stays agrees with my friend."]
  ]),
  stays: makeEntry("My friend stays with me after school.", [
    ["My friend stays with me after school.", "third person · stays", "Use stays after he, she, it, or one person."],
    ["The boy stayed quiet in class.", "past · stayed", "Stayed can connect with an adjective."],
    ["Please stay with your group.", "request · stay with", "Stay with means remain together."]
  ]),
  learn: makeEntry("I learn English every day.", [
    ["I learn English every day.", "habit · learn English", "Learn means get knowledge or skill."],
    ["I learned a new word yesterday.", "past · learned", "Learned tells what happened in the past."],
    ["Stories help me learn better.", "help · learn", "Learn can follow help."]
  ]),
  better: makeEntry("I can read better now.", [
    ["I can read better now.", "adverb · read better", "Better means in a better way or at a higher level."],
    ["This book is better than that one.", "comparison · better than", "Better than compares two things."],
    ["Practice helps me write better.", "result · write better", "This is a simple learning sentence."]
  ]),
  every: makeEntry("I read English every day.", [
    ["I read English every day.", "time · every day", "Every day means each day."],
    ["Every student has a book.", "determiner · every student", "Every means all in a group, one by one."],
    ["I practice every morning.", "time · every morning", "Every can go before a time word."]
  ]),
  during: makeEntry("I listened carefully during class.", [
    ["I listened carefully during class.", "time · during class", "During means in the time of something."],
    ["We visited grandparents during the holiday.", "time · during the holiday", "During goes before a noun phrase."],
    ["Please keep quiet during the story.", "request · during", "This is a real classroom instruction."]
  ]),
  before: makeEntry("Read the question before you answer.", [
    ["Read the question before you answer.", "order · before", "Before shows which action comes first."],
    ["I washed my hands before lunch.", "daily life · before", "This tells a real daily order."],
    ["Before class, I checked my book.", "time phrase", "Before can start a sentence."]
  ]),
  little: makeEntry("A little boy opened the door.", [
    ["A little boy opened the door.", "adjective · little boy", "Little can mean small or young."],
    ["I need a little water.", "amount · a little", "A little means a small amount."],
    ["The cat is little but brave.", "be sentence", "Little can describe size."]
  ]),
  open: makeEntry("Please open the door.", [
    ["Please open the door.", "request · open", "Open means make something not closed."],
    ["I opened my book in class.", "past · opened", "Opened tells a past action."],
    ["The shop is open now.", "adjective · be open", "Open can also describe a place or thing."]
  ]),
  opened: makeEntry("A little boy opened the door.", [
    ["A little boy opened the door.", "past · opened", "Opened tells a completed action."],
    ["I opened my English book.", "past · opened my book", "This is a simple school sentence."],
    ["She opened the box carefully.", "past · carefully", "This shows how she did the action."]
  ]),
  see: makeEntry("I can see the door.", [
    ["I can see the door.", "can · see", "See means use your eyes."],
    ["I saw my friend yesterday.", "past · saw", "Saw is the past form of see."],
    ["Can you see the word on the board?", "question · can see", "This is a real classroom question."]
  ]),
  saw: makeEntry("I saw my friend yesterday.", [
    ["I saw my friend yesterday.", "past · saw", "Saw is the past form of see."],
    ["We saw a little cat near the door.", "past · saw", "This describes a simple story scene."],
    ["I saw the answer after I read again.", "reading · saw the answer", "Saw can mean noticed or understood."]
  ])
};

const juniorReviewEntry = (word: UnknownWordRecord) => {
  const target = normalize(word.normalized || word.word);
  const singular = target.endsWith("s") ? target.slice(0, -1) : target;
  return juniorEntries[target] ?? juniorEntries[singular];
};

const juniorFallbackEntry = (word: UnknownWordRecord): ReviewEntry => {
  const target = normalize(word.normalized || word.word);
  const hint = `${word.partOfSpeech ?? ""} ${word.meaning}`.toLowerCase();
  const isVerb = /\b(verb|动词|vt|vi)\b|v\.|vt\.|vi\./i.test(hint);
  const isAdjective = /\b(adj|adjective|形容词)\b|adj\.|\ba\./i.test(hint);
  const isAdverb = target.endsWith("ly") || /\b(adv|副词)\b|adv\./i.test(hint);

  if (isVerb) {
    const past = simplePast(target);
    return makeEntry(`I can ${target} it in class.`, [
      [`I can ${target} it in class.`, "simple · can do", "This is a short school sentence."],
      [`I ${past} it yesterday.`, "past · yesterday", "This uses the word in the past."],
      [`Please ${target} it with me.`, "request · please", "This is a simple request."]
    ]);
  }

  if (isAdjective) {
    return makeEntry(`This is a ${target} story.`, [
      [`This is a ${target} story.`, "simple · adjective before noun", "The word describes a story."],
      [`I feel ${target} today.`, "feeling · feel", "Feel plus adjective tells how someone feels."],
      [`The classroom was ${target} yesterday.`, "past · was", "This uses the word in a past sentence."]
    ]);
  }

  if (isAdverb) {
    return makeEntry(`I read ${target} in class.`, [
      [`I read ${target} in class.`, "simple · how", "The word tells how I read."],
      [`She answered ${target} yesterday.`, "past · answered", "This uses the word with a past action."],
      [`Please write ${target}.`, "request · please", "This is a simple classroom instruction."]
    ]);
  }

  return makeEntry(`This ${target} is useful at school.`, [
    [`This ${target} is useful at school.`, "simple · this is", "This connects the word with school life."],
    [`I saw a ${target} yesterday.`, "past · saw", "This uses the word in a simple past sentence."],
    [`I can talk about the ${target} in English.`, "can · talk about", "This is a simple imitation sentence."]
  ]);
};

const highSchoolExamEntries: Record<string, ReviewEntry> = {
  decision: makeEntry("I made a careful decision after comparing both choices.", [
    [
      "Before making a decision, students should compare the reasons on both sides.",
      "reading logic · compare reasons",
      "Decision is tested in passages about choices, reasons, and consequences."
    ],
    [
      "The decision to join the volunteer activity helped Li Hua become more confident.",
      "writing · the decision to do",
      "The decision to do something is useful in Gaokao narrative or application writing."
    ],
    [
      "A clear decision is more convincing when it is supported by evidence.",
      "argument · supported by evidence",
      "This sentence connects an opinion with evidence, a common writing requirement."
    ]
  ]),
  decisions: makeEntry("Small daily decisions can gradually reduce waste on campus.", [
    [
      "Small daily decisions can gradually reduce waste on campus.",
      "topic writing · daily choices",
      "Decisions often appears in social-topic writing about habits and responsibility."
    ],
    [
      "The article explains how teenagers make decisions when they face pressure.",
      "reading · make decisions",
      "Make decisions is a core collocation in reading passages about growth."
    ],
    [
      "Students should make decisions after considering both benefits and risks.",
      "argument · after doing",
      "This sentence fits opinion writing that requires balanced thinking."
    ]
  ]),
  campus: makeEntry("Students will plant more trees on campus next spring.", [
    [
      "Students will plant more trees on campus next spring.",
      "school topic · on campus",
      "On campus is a natural phrase for school activities and environment topics."
    ],
    [
      "The new reading corner on campus encourages students to spend more time with books.",
      "reading/writing · campus facility",
      "Campus is often used with school facilities and student life."
    ],
    [
      "When describing campus life, students should give specific details instead of general praise.",
      "writing strategy · campus life",
      "Campus life is a common topic in school introductions and application writing."
    ]
  ]),
  foundation: makeEntry("A strong foundation helps students understand harder grammar later.", [
    [
      "A strong foundation helps students understand harder grammar later.",
      "learning logic · strong foundation",
      "Foundation means the basic support that later learning depends on."
    ],
    [
      "She built a better foundation by reading simple sentences every day.",
      "writing · build a foundation",
      "Build a foundation is a natural phrase for describing long-term progress."
    ],
    [
      "Without a clear foundation in sentence structure, long passages become difficult.",
      "grammar/reading · foundation in",
      "Foundation in something means basic knowledge in that area."
    ]
  ]),
  judgment: makeEntry("Good judgment helps students choose reliable information online.", [
    [
      "Good judgment helps students choose reliable information online.",
      "technology topic · reliable information",
      "Judgment is often tested in passages about choices and digital information."
    ],
    [
      "The writer's judgment was shaped by his experience as a volunteer.",
      "reading · be shaped by",
      "This sentence uses judgment as an abstract noun affected by experience."
    ],
    [
      "In an opinion essay, students need judgment rather than simple agreement.",
      "writing · rather than",
      "Rather than is useful for showing contrast in argument writing."
    ]
  ]),
  attitude: makeEntry("A responsible attitude is more useful than a perfect plan.", [
    [
      "A responsible attitude is more useful than a perfect plan.",
      "argument · comparison",
      "Attitude is common in reading questions about a writer's view or a person's response."
    ],
    [
      "His attitude toward failure changed after he learned from his mistakes.",
      "reading · attitude toward",
      "Attitude toward something is a core collocation in comprehension tasks."
    ],
    [
      "Students should show a positive attitude when facing a difficult task.",
      "writing · show an attitude",
      "Show an attitude is useful for describing behavior in applications and speeches."
    ]
  ]),
  technology: makeEntry("Technology can support learning, but it should not replace thinking.", [
    [
      "Technology can support learning, but it should not replace thinking.",
      "hot topic · balanced view",
      "Technology topics in exams often ask students to balance benefits and risks."
    ],
    [
      "The passage shows how technology changes the way people communicate.",
      "reading · how-clause",
      "This sentence fits reading passages about social change."
    ],
    [
      "When using technology, students should keep a clear learning purpose.",
      "writing · when doing",
      "When doing is a useful structure for advice in practical writing."
    ]
  ]),
  earphones: makeEntry("These earphones stopped working after only two days.", [
    [
      "These earphones stopped working after only two days.",
      "life scenario · product problem",
      "Earphones belongs to a real service or return-request situation."
    ],
    [
      "I would like to return these earphones because the left side has no sound.",
      "application · polite request",
      "This sentence uses the word in a practical problem-and-request pattern."
    ],
    [
      "The earphones were useful during online lessons, but they broke too soon.",
      "contrast · but",
      "This example connects usefulness with a problem, a common daily-life writing move."
    ]
  ]),
  weather: makeEntry("Extreme weather reminds schools to make clearer safety plans.", [
    [
      "Extreme weather reminds schools to make clearer safety plans.",
      "social topic · safety plans",
      "Weather is often used in passages about environment, safety, and public response."
    ],
    [
      "Because the weather changed suddenly, the outdoor activity was put off.",
      "grammar · because-clause",
      "This uses weather as the cause in a complete cause-result sentence."
    ],
    [
      "Students should check the weather before planning a school trip.",
      "life writing · before doing",
      "This sentence fits practical writing about arrangements."
    ]
  ]),
  waste: makeEntry("Small daily choices can reduce waste on campus.", [
    [
      "Small daily choices can reduce waste on campus.",
      "environment topic · reduce waste",
      "Reduce waste is a core expression in environmental writing."
    ],
    [
      "The article explains why food waste has become a serious problem.",
      "reading · why-clause",
      "Waste can appear in reading passages about causes and social problems."
    ],
    [
      "To avoid waste, students can reuse bottles and print on both sides of paper.",
      "writing · to do purpose",
      "To avoid waste gives a clear purpose before practical suggestions."
    ]
  ]),
  festival: makeEntry("The festival helps young people understand traditional culture.", [
    [
      "The festival helps young people understand traditional culture.",
      "culture topic · traditional culture",
      "Festival is often tested in culture-introduction and application writing."
    ],
    [
      "During the festival, families share stories that carry cultural memory.",
      "grammar · during",
      "During the festival is a useful time phrase for cultural descriptions."
    ],
    [
      "If foreign students visit during the festival, I will introduce its meaning to them.",
      "writing · if-clause",
      "This sentence fits invitation or cultural-exchange writing."
    ]
  ]),
  memory: makeEntry("Shared memory can connect people with their culture.", [
    [
      "Shared memory can connect people with their culture.",
      "culture topic · shared memory",
      "Memory can mean collective experience, not only personal remembering."
    ],
    [
      "The story brought back a warm memory of my first English speech.",
      "narrative · a memory of",
      "A memory of something is useful in personal storytelling."
    ],
    [
      "Good sleep helps the brain turn new information into long-term memory.",
      "science reading · long-term memory",
      "Memory is common in science passages about learning and sleep."
    ]
  ]),
  value: makeEntry("The activity shows the value of teamwork.", [
    [
      "The activity shows the value of teamwork.",
      "culture/writing · the value of",
      "The value of something is a high-frequency abstract noun phrase."
    ],
    [
      "Readers can understand the writer's values from his choices.",
      "reading · writer's values",
      "Values often appear in reading questions about character and theme."
    ],
    [
      "We should value chances to communicate with people from different cultures.",
      "verb · should value",
      "Value can also be a verb meaning think something is important."
    ]
  ]),
  explanation: makeEntry("A clear explanation helps readers follow the writer's logic.", [
    [
      "A clear explanation helps readers follow the writer's logic.",
      "reading · follow logic",
      "Explanation is linked with clarity and reasoning in reading tasks."
    ],
    [
      "The teacher's explanation made the grammar rule easier to use.",
      "grammar · make sth easier",
      "This sentence shows how an explanation changes learning results."
    ],
    [
      "In a reply letter, students should give an explanation instead of only saying sorry.",
      "writing · instead of",
      "This fits practical writing where a reason must be included."
    ]
  ]),
  explanations: makeEntry("Quick explanations can help, but students still need independent thinking.", [
    [
      "Quick explanations can help, but students still need independent thinking.",
      "technology topic · balanced view",
      "This example fits AI-learning discussions in current-topic writing."
    ],
    [
      "The passage gives two explanations for the change in teenagers' habits.",
      "reading · explanation for",
      "Explanation for something is common in cause-analysis passages."
    ],
    [
      "Students should compare different explanations before accepting an answer.",
      "logic · before doing",
      "This sentence connects explanations with judgment, not passive copying."
    ]
  ])
};

const highSchoolExamEntry = (word: UnknownWordRecord) => {
  const target = normalize(word.normalized || word.word);
  const singular = target.endsWith("s") ? target.slice(0, -1) : target;
  return highSchoolExamEntries[target] ?? highSchoolExamEntries[singular];
};

const includesAny = (value: string, keywords: string[]) =>
  keywords.some((keyword) => value.includes(keyword));

const fallbackEntry = (word: UnknownWordRecord): ReviewEntry => {
  const target = normalize(word.normalized || word.word);
  const posHint = `${word.partOfSpeech ?? ""} ${word.meaning}`;
  const semanticHint = `${target} ${word.word} ${word.meaning} ${word.sourceSentence}`.toLowerCase();
  const isAdverb = target.endsWith("ly") || /\b(adv|副词)\b|adv\./i.test(posHint);
  const isAdjective = /\b(adj|adjective|形容词)\b|adj\.|\ba\./i.test(posHint);
  const isVerb = /\b(verb|动词|vt|vi)\b|v\.|vt\.|vi\./i.test(posHint);
  const isNoun = /\b(noun|名词)\b|n\./i.test(posHint);
  const isConnector = /^(although|because|while|when|if|before|after|during|without|through|until|unless|since|as)$/i.test(target);
  const isPrepositionLike = /^(during|without|through)$/i.test(target);

  if (isPrepositionLike) {
    if (target === "during") {
      return makeEntry("I found the key word during the reading task.", [
        ["I found the key word during the reading task.", "preposition · time", "During goes before a noun phrase and means while something is happening."],
        ["She took notes during the lecture yesterday.", "preposition · past event", "This example uses during with a completed classroom event."],
        ["Students should stay focused during long exams.", "preposition · exam context", "During can connect a time period with what people should do in it."]
      ]);
    }
    if (target === "without") {
      return makeEntry("Without enough context, the sentence may be hard to understand.", [
        ["Without enough context, the sentence may be hard to understand.", "preposition · missing condition", "Without introduces something that is missing."],
        ["She answered without checking the key word yesterday.", "preposition · past action", "Without can be followed by an -ing action."],
        ["Students cannot write naturally without real examples.", "preposition · learning condition", "This example shows a condition needed for natural writing."]
      ]);
    }
    return makeEntry("Through daily practice, I understood longer sentences more easily.", [
      ["Through daily practice, I understood longer sentences more easily.", "preposition · method", "Through shows the method or process that creates a result."],
      ["She learned teamwork through the volunteer activity last week.", "preposition · experience", "This example connects a past experience with what someone learned."],
      ["Students can build confidence through regular speaking practice.", "preposition · long-term process", "Through is useful for describing how a skill grows."]
    ]);
  }

  if (isConnector) {
    return makeEntry(`I reviewed the sentence again ${target} I wanted to understand the main idea clearly.`, [
      [
        `I checked the question ${target} I wrote my answer.`,
        "connector · action order",
        "This example uses the word to connect two real actions in a learning situation."
      ],
      [
        `She changed her plan ${target} the teacher gave new advice yesterday.`,
        "connector · past situation",
        "This example places the connector inside a completed past event."
      ],
      [
        `Students can read more smoothly ${target} they notice how ideas are connected.`,
        "connector · reading logic",
        "This example shows how the connector helps explain logic between ideas."
      ]
    ]);
  }

  if (isAdverb) {
    if (includesAny(semanticHint, ["independent", "accurate", "effective", "careful", "polite", "clear", "responsible", "独立", "准确", "有效", "礼貌"])) {
      return makeEntry(`Students should use the word ${target} when they explain their ideas in writing.`, [
        [
          `Students should think ${target} before accepting an online answer.`,
          "hot topic · independent judgment",
          "This sentence fits current-issue writing about AI tools and learning habits."
        ],
        [
          `She explained her opinion ${target} in the class debate yesterday.`,
          "speaking · past action",
          "This uses the adverb with a completed communication event."
        ],
        [
          `If students write ${target}, their arguments will become easier to follow.`,
          "writing · if-clause",
          "This connects the adverb with a writing result, a common exam direction."
        ]
      ]);
    }
    const examples = pickThree(target, [
      [
        `She answered the question ${target} during the discussion.`,
        "adverb · speaking action",
        "The adverb describes how a real speaking action is done."
      ],
      [
        `The group worked ${target} when the deadline was near last week.`,
        "adverb · past context",
        "This example uses the adverb with a completed group action."
      ],
      [
        `If students explain their ideas ${target}, their meaning becomes clearer.`,
        "adverb · condition",
        "The if-clause shows how the manner affects the result."
      ],
      [
        `The teacher listened ${target} before giving advice.`,
        "adverb · before doing",
        "This shows the adverb modifying a careful classroom action."
      ],
      [
        `Students will review the passage ${target} before the test.`,
        "adverb · future review",
        "This uses the adverb with a future learning plan."
      ]
    ] as Array<[string, string, string]>);
    return makeEntry(examples[0][0], examples);
  }

  if (isAdjective) {
    if (includesAny(semanticHint, ["curious", "confident", "responsible", "uncertain", "safe", "common", "useful", "extreme", "stressed", "好奇", "自信", "负责", "安全", "常见", "有用"])) {
      return makeEntry(`A ${target} attitude can change how students face a difficult task.`, [
        [
          `A ${target} attitude can change how students face a difficult task.`,
          "character/theme · adjective before noun",
          "This fits reading questions about character, attitude, and theme."
        ],
        [
          `The speaker became more ${target} after practicing in front of the class.`,
          "narrative · became",
          "Became plus adjective describes personal growth in a story."
        ],
        [
          `It is ${target} for teenagers to ask for help when they meet real problems.`,
          "argument · it is ... for sb to do",
          "This sentence fits opinion writing with a clear judgment."
        ]
      ]);
    }
    const examples = pickThree(target, [
      [
        `A ${target} answer can make the speaker's idea clearer.`,
        "adjective · before a noun",
        "The adjective describes a useful noun in a real communication task."
      ],
      [
        `The situation became ${target} after the teacher explained the rule yesterday.`,
        "adjective · became",
        "Became shows a change in state in a past situation."
      ],
      [
        `It will be ${target} for students to check the sentence pattern before writing.`,
        "adjective · it is ... to",
        "This pattern is useful for giving a judgment about a future action."
      ],
      [
        `The writer gave a ${target} reason in the second paragraph.`,
        "adjective · writing context",
        "This example uses the adjective to describe a reason in reading or writing."
      ],
      [
        `Students may feel more ${target} after they practice the pattern several times.`,
        "adjective · feel",
        "Feel plus adjective describes a learner's state."
      ]
    ] as Array<[string, string, string]>);
    return makeEntry(examples[0][0], examples);
  }

  if (isVerb) {
    const past = simplePast(target);
    if (includesAny(semanticHint, ["provide", "accept", "connect", "discover", "communicate", "return", "lead", "seem", "fail", "race", "broaden", "strengthen", "notice", "train", "explain", "表达", "提供", "接受", "连接", "发现", "交流"])) {
      return makeEntry(`This example helps students ${target} the word in a real exam-style context.`, [
        [
          `The passage may ${target} a clear reason for the writer's opinion.`,
          "reading · passage function",
          "This places the verb in a reading-comprehension sentence about purpose and logic."
        ],
        [
          `The activity ${past} students' understanding of teamwork yesterday.`,
          "school event · past simple",
          "This uses the past form in a completed school or activity context."
        ],
        [
          `To ${target} ideas naturally, students need examples from real situations.`,
          "writing · to do purpose",
          "This turns the verb into a writing goal instead of a word-drill sentence."
        ]
      ]);
    }
    const examples = pickThree(target, [
      [
        `Students can ${target} the problem before they choose an answer.`,
        "verb · modal can",
        "Can plus a base verb shows a possible action in a learning task."
      ],
      [
        `The group ${past} a similar problem after class yesterday.`,
        "verb · past action",
        "This uses the verb in a completed school situation."
      ],
      [
        `To ${target} well, students need a clear purpose and enough context.`,
        "verb · infinitive",
        "The infinitive phrase turns the action into a learning goal."
      ],
      [
        `This activity will help students ${target} their ideas more naturally.`,
        "verb · future support",
        "Will help someone do something is useful for plans and learning goals."
      ],
      [
        `The teacher asked us to ${target} one example from the passage.`,
        "verb · ask sb to do",
        "Ask someone to do something gives the verb a real classroom purpose."
      ]
    ] as Array<[string, string, string]>);
    return makeEntry(examples[0][0], examples);
  }

  if (isNoun) {
    if (includesAny(semanticHint, ["school", "campus", "class", "event", "festival", "文化", "学校", "校园", "活动", "节日"])) {
      return makeEntry(`The ${target} gives students a chance to connect English with real life.`, [
        [
          `The ${target} gives students a chance to connect English with real life.`,
          "school/culture topic · chance to do",
          "This sentence fits school-life or culture-introduction writing."
        ],
        [
          `During the ${target}, students learned how to describe details in English.`,
          "grammar · during",
          "During plus noun phrase is useful for describing activities or events."
        ],
        [
          `If I introduce the ${target} to foreign friends, I should explain its meaning clearly.`,
          "application writing · if-clause",
          "This sentence fits cultural exchange or school introduction tasks."
        ]
      ]);
    }

    if (includesAny(semanticHint, ["technology", "tool", "online", "phone", "earphone", "ai", "app", "internet", "device", "科技", "工具", "网络"])) {
      return makeEntry(`The ${target} can support learning if students use it wisely.`, [
        [
          `The ${target} can support learning if students use it wisely.`,
          "technology topic · if-clause",
          "This gives a balanced view, which is common in current-topic writing."
        ],
        [
          `The article discusses whether the ${target} makes students more independent.`,
          "reading · whether-clause",
          "Whether introduces a question or debate in reading passages."
        ],
        [
          `When using the ${target}, students should keep their own thinking active.`,
          "writing · when doing",
          "This gives practical advice without depending on the tool blindly."
        ]
      ]);
    }

    if (includesAny(semanticHint, ["environment", "weather", "waste", "transport", "reusable", "bottle", "safe", "plan", "环境", "天气", "浪费", "交通", "安全", "计划"])) {
      return makeEntry(`The ${target} shows why small choices can lead to larger social changes.`, [
        [
          `The ${target} shows why small choices can lead to larger social changes.`,
          "social issue · cause and result",
          "This sentence fits reading passages about environment, safety, or public action."
        ],
        [
          `Because of the ${target}, the school made a clearer plan last week.`,
          "grammar · because of",
          "Because of plus noun phrase gives a clear cause."
        ],
        [
          `Students can mention the ${target} when writing about responsibility in daily life.`,
          "writing · mention sth when doing",
          "This connects the noun with a common Gaokao writing theme."
        ]
      ]);
    }

    if (includesAny(semanticHint, ["idea", "reason", "result", "answer", "question", "text", "passage", "paragraph", "information", "context", "logic", "观点", "原因", "结果", "答案", "问题", "文章", "信息", "逻辑"])) {
      return makeEntry(`The ${target} helps readers follow the writer's logic more clearly.`, [
        [
          `The ${target} helps readers follow the writer's logic more clearly.`,
          "reading · writer's logic",
          "This sentence fits reading-comprehension questions about structure and meaning."
        ],
        [
          `The writer used the ${target} to support his main opinion.`,
          "argument · support an opinion",
          "This connects the noun with evidence, a core writing and reading skill."
        ],
        [
          `If students miss the ${target}, they may misunderstand the whole paragraph.`,
          "grammar · if-clause",
          "This shows why the noun matters in paragraph understanding."
        ]
      ]);
    }

    const examples = pickThree(target, [
      [
        `The ${target} helped students understand the passage better.`,
        "noun · subject",
        "The noun is used as a real thing or idea that affects understanding."
      ],
      [
        `The teacher explained the ${target} with a simple example yesterday.`,
        "noun · object",
        "The noun receives the action in a completed past classroom event."
      ],
      [
        `Students connected the ${target} with a real example before writing.`,
        "noun · connect A with B",
        "This pattern asks learners to link the noun with a concrete example."
      ],
      [
        `A clear ${target} can make the paragraph easier to follow.`,
        "noun phrase · with adjective",
        "This example uses the noun inside a meaningful noun phrase."
      ],
      [
        `The article mentioned the ${target} in the first paragraph.`,
        "noun · reading context",
        "Mentioned the noun places it naturally inside a reading task."
      ]
    ] as Array<[string, string, string]>);
    return makeEntry(examples[0][0], examples);
  }

  return makeEntry(`This sentence uses "${word.word}" to add a real detail to the situation.`, [
    [
      `I noticed "${word.word}" when I read the sentence for the first time.`,
      "fallback · reading moment",
      "This keeps the word inside a real reading experience, not a sentence-making instruction."
    ],
    [
      `The teacher used "${word.word}" in a different example yesterday.`,
      "fallback · past classroom use",
      "This shows a completed classroom use without copying the original sentence."
    ],
    [
      `If I meet "${word.word}" again, I will check how it works in the sentence.`,
      "fallback · future review",
      "This uses a future review situation and asks the learner to notice function in context."
    ]
  ]);
};

export const getVocabularyReviewEntry = (
  word: UnknownWordRecord,
  learningVersion: LearningVersion = "high_school"
): ReviewEntry => {
  const key = normalize(word.normalized || word.word);
  if (learningVersion === "primary_junior") {
    return juniorReviewEntry(word) ?? juniorFallbackEntry(word);
  }
  return highSchoolExamEntry(word) ?? reviewBank[key] ?? fallbackEntry(word);
};

export const evaluateReviewSentence = (
  word: UnknownWordRecord,
  rawAnswer: string,
  learningVersion: LearningVersion = "high_school"
): ReviewSentenceResult => {
  const answer = rawAnswer.trim();
  const issues: string[] = [];
  const notes: string[] = [];
  const reviewEntry = getVocabularyReviewEntry(word, learningVersion);

  if (!answer) issues.push("No sentence was written.");
  if (answer && !containsTargetWord(answer, [word.normalized, word.word])) {
    issues.push(`The sentence does not use "${word.word}" or a clear form of it.`);
  }
  if (answer && isCopiedFromProvidedExamples(answer, word, reviewEntry)) {
    issues.push("Do not copy the provided examples. Write a new sentence with your own meaning.");
  }

  const tokenCount = answer.match(/[a-z']+/gi)?.length ?? 0;
  if (answer && tokenCount < 6) issues.push("The sentence is too short to show real usage.");
  if (answer && !/[.!?]$/.test(answer)) notes.push("Add final punctuation in formal writing.");
  if (answer && !/^[A-Z"']/.test(answer)) notes.push("Start with a capital letter in formal writing.");
  if (answer && !subjectPattern.test(answer)) issues.push("The sentence needs a clear subject.");
  if (answer && !finiteVerbPattern.test(answer) && !genericVerbPattern.test(answer)) {
    issues.push("The sentence needs a clear finite verb.");
  }
  if (/\bi am agree\b/i.test(answer)) issues.push('Use "I agree", not "I am agree".');
  if (/^because\b/i.test(answer) && !/,/.test(answer)) {
    issues.push("A because-clause alone is usually not a complete answer here.");
  }

  const passed = issues.length === 0;
  return {
    passed,
    issues,
    notes,
    correctedSentence: passed ? answer : reviewEntry.correctedSentence,
    explanation: passed
      ? `This sentence answers the review goal: it uses "${word.word}" inside a complete, natural sentence.`
      : `The goal is not just to remember the meaning of "${word.word}", but to use it in a complete sentence with a clear idea.`
  };
};
