export type Professional887Topic = {
  title: string;
  stage: "foundation" | "reinforcement" | "review" | "background";
  tags: string[];
  suggestedTaskTitle: string;
  suggestedMinutes: number;
};

export type Professional887Module = {
  title: string;
  description: string;
  sourceNote: string;
  priority: "initial_main" | "secondary" | "background";
  topics: Professional887Topic[];
};

export const professional887Modules: Professional887Module[] = [
  {
    title: "电子技术基础",
    description: "初试主线之一，先建立器件工作区、放大电路和基础分析方法，再逐步进入题型训练。",
    sourceNote: "仅提供可自行补充的学习结构，不写死任何付费课程讲次或详细章节。",
    priority: "initial_main",
    topics: [
      {
        title: "二极管与基础非线性器件",
        stage: "foundation",
        tags: ["二极管", "伏安特性", "工作区"],
        suggestedTaskTitle: "整理二极管伏安特性和典型应用",
        suggestedMinutes: 60
      },
      {
        title: "BJT 与 FET 工作区判断",
        stage: "foundation",
        tags: ["BJT", "FET", "工作区"],
        suggestedTaskTitle: "制作 BJT/FET 工作区判断表",
        suggestedMinutes: 75
      },
      {
        title: "放大电路静态与小信号分析",
        stage: "reinforcement",
        tags: ["放大电路", "小信号", "静态工作点"],
        suggestedTaskTitle: "完成放大电路小信号模型复盘",
        suggestedMinutes: 90
      },
      {
        title: "反馈、频率响应与运放基础",
        stage: "review",
        tags: ["反馈", "频率响应", "运放"],
        suggestedTaskTitle: "梳理反馈类型和运放基础题",
        suggestedMinutes: 75
      }
    ]
  },
  {
    title: "半导体物理",
    description: "初试主线之一，重点沉淀物理图像、公式适用条件和典型计算量。",
    sourceNote: "按公开教材通用知识结构整理，具体讲义和课程内容由用户自行补充。",
    priority: "initial_main",
    topics: [
      {
        title: "能带、本征与杂质半导体",
        stage: "foundation",
        tags: ["能带", "本征半导体", "杂质半导体"],
        suggestedTaskTitle: "整理能带和载流子浓度基础框架",
        suggestedMinutes: 90
      },
      {
        title: "载流子统计、迁移、扩散与复合",
        stage: "foundation",
        tags: ["载流子", "迁移", "扩散", "复合"],
        suggestedTaskTitle: "复盘载流子输运和复合机制",
        suggestedMinutes: 90
      },
      {
        title: "PN 结与结电容",
        stage: "reinforcement",
        tags: ["PN结", "结电容", "击穿"],
        suggestedTaskTitle: "整理 PN 结伏安特性与结电容",
        suggestedMinutes: 90
      },
      {
        title: "接触、表面态与器件物理衔接",
        stage: "review",
        tags: ["接触", "表面态", "器件物理"],
        suggestedTaskTitle: "梳理接触与表面态常考问法",
        suggestedMinutes: 75
      }
    ]
  },
  {
    title: "半导体工艺",
    description: "更偏复试和背景预埋，基础阶段轻量建立流程图和术语索引，不作为初试主线强制推进。",
    sourceNote: "只保留通用工艺结构，避免复制任何付费课程内容或截图。",
    priority: "background",
    topics: [
      {
        title: "氧化、光刻与刻蚀",
        stage: "background",
        tags: ["氧化", "光刻", "刻蚀"],
        suggestedTaskTitle: "画出氧化光刻刻蚀的流程关系",
        suggestedMinutes: 45
      },
      {
        title: "掺杂、扩散与离子注入",
        stage: "background",
        tags: ["掺杂", "扩散", "离子注入"],
        suggestedTaskTitle: "整理掺杂工艺目的和差异",
        suggestedMinutes: 45
      },
      {
        title: "薄膜、互连与工艺集成",
        stage: "background",
        tags: ["薄膜", "互连", "工艺集成"],
        suggestedTaskTitle: "建立薄膜互连和工艺集成索引",
        suggestedMinutes: 45
      }
    ]
  }
];

export const professional887ModuleOptions = ["半导体物理", "电子技术基础", "半导体工艺", "真题整理", "课程笔记", "其他"] as const;

export type Professional887ModuleOption = (typeof professional887ModuleOptions)[number];
