export type GrammarModule = {
  id: string;
  title: string;
  summary: string;
  keyPoints: string[];
  examples: string[];
  commonMistakes: string[];
};

export const grammarModules: GrammarModule[] = [
  {
    id: "sentence-patterns",
    title: "句子成分与基本句型",
    summary: "先识别主干，再看修饰。考研长难句阅读中，主谓宾、主系表和双宾/复合宾语是拆句入口。",
    keyPoints: ["主语和谓语决定句子骨架", "定语、状语、同位语多承担信息补充", "五种基本句型可覆盖大多数简单句"],
    examples: ["The policy changed the market quickly.", "What matters most is consistent practice."],
    commonMistakes: ["把介词短语误判成谓语", "看到长主语从句后找不到真正谓语", "忽略插入语导致主干断裂"]
  },
  {
    id: "tense-voice",
    title: "动词时态与语态",
    summary: "时态看动作发生的时间和状态，语态看动作承受者是否被放到主语位置。",
    keyPoints: ["完成时强调到某时点的影响或结果", "进行时强调动作正在持续", "被动语态常用于客观叙述和学术表达"],
    examples: ["The device has been tested under different conditions.", "Researchers are developing a more efficient method."],
    commonMistakes: ["只按中文时间词套时态", "忽略被动语态后的施动者省略", "把完成时和一般过去时混用"]
  },
  {
    id: "non-finite",
    title: "非谓语动词",
    summary: "非谓语不单独作谓语，重点判断它和逻辑主语之间是主动、被动还是目的关系。",
    keyPoints: ["to do 常表示目的、将来或具体动作", "doing 常表示主动或进行", "done 常表示被动或完成"],
    examples: ["Designed for low power, the chip works reliably.", "To reduce noise, engineers changed the layout."],
    commonMistakes: ["把非谓语当作句子谓语", "不判断逻辑主语就选择形式", "忽略独立主格结构"]
  },
  {
    id: "noun-clauses",
    title: "名词性从句",
    summary: "名词性从句在句中相当于名词，可作主语、宾语、表语或同位语。",
    keyPoints: ["that 引导陈述内容，通常不作成分", "whether/if 表示是否", "what 等连接代词在从句中承担成分"],
    examples: ["What the data shows is important.", "The question is whether the model can generalize."],
    commonMistakes: ["漏掉主语从句后的主句谓语", "混淆 that 和 what", "同位语从句和定语从句界限不清"]
  },
  {
    id: "relative-clauses",
    title: "定语从句",
    summary: "定语从句修饰名词或整句话，核心是找到先行词并判断关系词在从句中的成分。",
    keyPoints: ["关系代词可作主语、宾语、定语", "关系副词常对应时间、地点、原因", "非限制性定语从句补充说明，逗号不可忽略"],
    examples: ["The method that we used reduced error.", "This result, which surprised many readers, changed the debate."],
    commonMistakes: ["找错先行词", "把 where 用在不表示地点含义的名词后", "忽视非限制性定语从句的补充性质"]
  },
  {
    id: "adverbial-clauses",
    title: "状语从句",
    summary: "状语从句说明时间、原因、条件、让步、目的、结果、方式或比较，是理解逻辑关系的关键。",
    keyPoints: ["although/though 表让步", "because/since/as 表原因但语气不同", "if/unless/provided that 表条件"],
    examples: ["Although the sample was small, the trend was clear.", "If demand rises, production will expand."],
    commonMistakes: ["只翻译连接词，不判断句间逻辑", "把 since 一律理解为自从", "忽略让步后主句的转折重点"]
  },
  {
    id: "subjunctive",
    title: "虚拟语气",
    summary: "虚拟语气表达假设、愿望、建议或与事实相反的情况，常通过谓语形式后移体现。",
    keyPoints: ["与现在事实相反常用过去式", "与过去事实相反常用 had done", "suggest 等表示建议时从句可用 should do"],
    examples: ["If the assumption were true, the result would change.", "The report suggested that the test be repeated."],
    commonMistakes: ["看到 if 就机械使用虚拟", "忽略省略 if 的倒装形式", "把建议类虚拟和普通陈述混淆"]
  },
  {
    id: "special-structures",
    title: "倒装、强调、省略、否定、比较、主谓一致",
    summary: "这些结构通常不改变核心信息，但会改变句子重心、语序和比较对象，需要单独标记。",
    keyPoints: ["否定词置首常触发部分倒装", "强调句型结构是 it is/was ... that/who ...", "比较结构要确认比较对象平行"],
    examples: ["Only then did researchers notice the error.", "It was the interface that caused the delay."],
    commonMistakes: ["把强调句中的 that 误判为从句引导词", "比较对象前后不一致", "就近原则和语法一致原则混淆"]
  }
];
