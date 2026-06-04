import type { Task } from "./types";

export type TaskTemplate = Pick<Task, "subject" | "title" | "material" | "chapter" | "estimated_minutes" | "mode" | "status">;

export const englishBookPlanTemplates: TaskTemplate[] = [
  {
    subject: "english",
    title: "田静句句真研：长难句2句",
    material: "田静《句句真研》",
    chapter: "长难句精析",
    estimated_minutes: 35,
    mode: "standard",
    status: "todo"
  },
  {
    subject: "english",
    title: "唐迟阅读的逻辑：方法点+阅读1篇",
    material: "唐迟《阅读的逻辑》",
    chapter: "阅读方法与真题拆解",
    estimated_minutes: 55,
    mode: "standard",
    status: "todo"
  }
];

export const defaultTaskTemplates: TaskTemplate[] = [
  {
    subject: "math",
    title: "张宇基础30讲：极限与连续",
    material: "张宇基础30讲",
    chapter: "极限与连续",
    estimated_minutes: 75,
    mode: "standard",
    status: "todo"
  },
  {
    subject: "math",
    title: "张宇1000题：对应基础题10道",
    material: "张宇1000题",
    chapter: "极限与连续",
    estimated_minutes: 60,
    mode: "minimum",
    status: "todo"
  },
  {
    subject: "english",
    title: "单词100个",
    material: "词汇",
    chapter: "每日词汇",
    estimated_minutes: 35,
    mode: "minimum",
    status: "todo"
  },
  ...englishBookPlanTemplates,
  {
    subject: "politics",
    title: "马原基础框架20分钟",
    material: "马原",
    chapter: "基础框架",
    estimated_minutes: 20,
    mode: "minimum",
    status: "todo"
  },
  {
    subject: "professional_887",
    title: "PN结形成机制",
    material: "半导体物理",
    chapter: "PN结",
    estimated_minutes: 45,
    mode: "standard",
    status: "todo"
  },
  {
    subject: "professional_887",
    title: "MOSFET工作区",
    material: "半导体器件",
    chapter: "MOSFET",
    estimated_minutes: 45,
    mode: "standard",
    status: "todo"
  },
  {
    subject: "professional_887",
    title: "共射放大电路静态工作点",
    material: "电子电路基础",
    chapter: "放大电路",
    estimated_minutes: 50,
    mode: "minimum",
    status: "todo"
  }
];
