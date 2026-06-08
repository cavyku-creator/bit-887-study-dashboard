export const planStartDate = "2026-06-06";
export const foundationEndDate = "2026-08-31";
export const estimatedExamStartDate = "2026-12-19";
export const estimatedExamEndDate = "2026-12-20";
export const estimatedExamNotice = "预计，待教育部/研招网正式公布";
export const targetExamDate = estimatedExamStartDate;

export const officialAdmission = {
  sourceType: "官方确认",
  school: "北京理工大学",
  collegeCode: "213",
  college: "集成电路与电子学院",
  majorCode: "085403",
  major: "集成电路工程",
  studyMode: "全日制",
  directionCode: "00",
  direction: "不区分研究方向",
  plannedEnrollment: 23,
  subjects: [
    "101 思想政治理论",
    "201 英语（一）",
    "301 数学（一）",
    "887 集成电路工程基础"
  ],
  retestNote:
    "官方目录复试要求及相关说明写明：笔试科目为半导体物理、半导体工艺、电子电路基础；面试包含外语口语听力测试、专业基础知识及实践能力。备注：含全日制异地科研联合培养6人。",
  sourceTitle: "北京理工大学研究生院 2026 年硕士学位研究生招生专业目录",
  sourceHref: "https://grd.bit.edu.cn/zsgz/ssyjs/bslc_ss/44281a10b8ec447a852f4cdc73171c81.htm"
};

export const thirdPartyCrossChecks = [
  {
    sourceType: "第三方同步",
    title: "路灯考研 085403 目录同步页",
    href: "https://www.ludengkaoyan.com/school5/qrz/zsml/270042.html",
    value:
      "同步显示 213 集成电路与电子学院、085403 集成电路工程、招生人数23、初试科目101/201/301/887；用于交叉核对，不替代官方附件。"
  },
  {
    sourceType: "第三方整理",
    title: "启航教育 887 大纲整理页",
    href: "https://jixun.iqihang.com/zixun/dagang/zsdg/202249306.html",
    value:
      "页面整理的 887 范围主要为电子技术基础、半导体物理及参考书信息；只作为备考范围参考，不作为官方最终大纲。"
  }
];

export const predictionNotes = [
  {
    sourceType: "预测/待官方发布",
    title: "2027 初试时间",
    value: `页面仅使用 ${estimatedExamStartDate} 至 ${estimatedExamEndDate} 作为预计窗口，必须标注“${estimatedExamNotice}”。`
  },
  {
    sourceType: "预测/待官方发布",
    title: "887 初试细纲",
    value:
      "当前仅以官方专业目录与第三方整理交叉制定计划；若北理工后续发布 887 正式初试大纲，应以新文件替换页面中的参考范围。"
  }
];

export const bitTarget = {
  label: `${officialAdmission.school} ${officialAdmission.majorCode}`,
  title: `${officialAdmission.college} · ${officialAdmission.major}`,
  direction: `${officialAdmission.directionCode} ${officialAdmission.direction}`,
  note:
    "V1 计划以 301 数学（一）、201 英语（一）、887 集成电路工程基础为主线；政治维持低负荷保底，暑期后再系统加量。"
};

export const professional887Scope = [
  {
    title: "电子技术基础",
    status: "初试主抓",
    basis: "第三方 887 整理页列为考试内容；官方目录复试相关说明也出现电子电路基础。",
    focus: ["半导体器件工作区", "放大电路静态/小信号分析", "反馈、频响、运放基础"],
    action: "每天 1 个概念表 + 3 道基础计算，优先训练表达和手算步骤。"
  },
  {
    title: "半导体物理",
    status: "初试主抓",
    basis: "第三方 887 整理页列为考试内容；官方目录复试相关说明也出现半导体物理。",
    focus: ["能带与载流子", "迁移、扩散、复合", "PN 结与接触特性"],
    action: "每个公式写清物理意义、适用条件、单位和常见计算量。"
  },
  {
    title: "半导体工艺",
    status: "复试/背景预埋",
    basis: "官方目录复试相关说明出现半导体工艺；暂未从第三方 887 初试整理页确认其为初试主线。",
    focus: ["氧化、光刻、刻蚀、掺杂", "薄膜与基础流程", "工艺和器件结构对应关系"],
    action: "基础阶段每周 1 次轻量流程图复盘，不挤占电子技术基础和半导体物理时间。"
  }
];

export const kickOffActions = [
  {
    date: "2026-06-06",
    title: "开局校准",
    actions: [
      "确认今日任务只保留 5-7 件硬任务",
      "数学做极限/导数基础题测底，记录错因",
      "887 拆成电子技术基础、半导体物理两条初试主线"
    ]
  },
  {
    date: "2026-06-07",
    title: "第一次闭环",
    actions: [
      "完成 1 个数学小节的概念-例题-基础题闭环",
      "不背单词记录新词和复习量，拆 2 个《句句真研》句子",
      "887 做 6-8 张概念/公式卡，避免堆资料库"
    ]
  }
];

export const foundationPhases = [
  {
    start: "2026-06-06",
    end: "2026-06-30",
    title: "补地基",
    goal: "恢复三科手感，先建立稳定日循环，不追难题。",
    checkpoints: [
      "数学完成极限、导数、一元积分核心例题入口",
      "英语形成词汇统计、语法拆句、阅读精读节奏",
      "887 建立电子技术基础器件表与半导体物理能带/载流子框架"
    ]
  },
  {
    start: "2026-07-01",
    end: "2026-07-31",
    title: "基础一轮",
    goal: "数学主干推进，英语进入阅读精读，887 开始基础计算和简答并行。",
    checkpoints: [
      "数学高数主干过半，线代矩阵/方程组启动",
      "英语每周至少 4 篇阅读精读，错选项必须复盘",
      "887 完成 PN 结、BJT/FET、放大电路基础题"
    ]
  },
  {
    start: "2026-08-01",
    end: "2026-08-31",
    title: "基础收口",
    goal: "把数学和 887 从知识点推进转成题型训练，保持英语阅读连续性。",
    checkpoints: [
      "数学基础题正确率稳定到 70%-80%",
      "英语阅读能解释定位句、干扰项和正确选项依据",
      "887 建成 100-120 张高频概念/公式卡，开始小套题训练"
    ]
  },
  {
    start: "2026-09-01",
    end: "2026-10-31",
    title: "强化转段",
    goal: "进入综合题、真题和限时训练，把知识压成可考场调用的方法。",
    checkpoints: [
      "数学按题型限时训练，错题每周回看",
      "英语真题二刷并启动作文素材",
      "887 以简答表达和计算步骤完整性为核心"
    ]
  }
];

export const dailyRhythm = [
  {
    time: "08:00-09:40",
    title: "数学概念+例题",
    detail: "只推进一个小节，能口述定义、公式适用条件和 2 道例题思路。"
  },
  {
    time: "10:00-11:20",
    title: "数学基础题",
    detail: "10-15 道手算题，错题当天记录错因，不把错误顺延到周末。"
  },
  {
    time: "14:00-14:35",
    title: "英语词汇",
    detail: "不背单词新词 40-60、复习 80-120；正确率低时第二天降新词量。"
  },
  {
    time: "15:00-16:10",
    title: "语法/阅读",
    detail: "《句句真研》拆 2 句，或《阅读的逻辑》精读 1 篇，记录定位和错因。"
  },
  {
    time: "19:30-20:50",
    title: "887 主攻",
    detail: "电子技术基础与半导体物理轮换；工艺只做轻量背景预埋。"
  },
  {
    time: "21:10-21:35",
    title: "复盘",
    detail: "写完成、未完成原因、明天最优先一件事。"
  }
];

export const weeklyCadence = [
  {
    label: "周一/三/五",
    focus: "高数主线 + 半导体物理",
    output: "1 个数学小节、1 组半导体物理卡片、1 次错题回看"
  },
  {
    label: "周二/四",
    focus: "线代/概率预热 + 电子技术基础",
    output: "矩阵/概率基础题、二极管/BJT/FET 或放大电路题"
  },
  {
    label: "周六",
    focus: "小测与补漏",
    output: "数学 45 分钟小测、英语 1 篇阅读限时、887 简答或计算 4 题"
  },
  {
    label: "周日",
    focus: "轻复盘",
    output: "整理错题、清 Anki 积压、调整下周 3 个关键章节"
  }
];

export const auxiliaryTools = [
  {
    name: "本项目任务台",
    kind: "总控",
    use: "每天只留少量硬任务，避免把计划写成愿望清单。",
    workflow: ["首页生成今日计划", "任务页按真实安排删改", "复盘页晚上写完成、未完成、明天优先"]
  },
  {
    name: "不背单词",
    kind: "词汇",
    use: "英语一词汇日循环，和项目里的单词统计页配合。",
    workflow: ["记录新词", "记录复习词", "每周看累计进度和正确率"]
  },
  {
    name: "Anki",
    kind: "间隔重复",
    use: "887 概念、公式物理意义、英语熟词僻义和数学易错条件。",
    workflow: ["每天新增 6-10 张", "卡片只写一个问答点", "周日清理重复卡和低质量卡"]
  },
  {
    name: "专注计时",
    kind: "时间规划",
    use: "用番茄钟/Forest/Toggl 类工具看实际时间分配。",
    workflow: ["每块只做一种任务", "结束时记录产出", "周日看科目时间是否偏科"]
  },
  {
    name: "ChatGPT / OpenAI",
    kind: "AI 助教",
    use: "拆长难句、追问数学错因、把 887 概念改成自测题。",
    workflow: ["先给自己的解法", "要求它指出断点", "把最终错因回填到项目"]
  }
];

export const aiPromptKits = [
  {
    title: "数学错题追问",
    prompt:
      "我在考研数学一这道题卡住了。请先判断我的错因属于概念、公式、计算还是无思路，再用提问方式引导我补齐推理，不要直接给完整答案。"
  },
  {
    title: "英语一长难句拆解",
    prompt:
      "请按主干、从句、修饰成分、指代关系、熟词僻义五步拆解这句考研英语一真题长难句，并给出适合我复述的中文译文。"
  },
  {
    title: "887 概念自测",
    prompt:
      "围绕这个 887 知识点生成 5 个简答题和 3 个基础计算题，题目先给，答案折叠在后面；重点考物理意义、公式适用条件和易混概念。"
  }
];
