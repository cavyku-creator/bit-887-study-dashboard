import type { Task } from "./types";

type TaskTemplate = Pick<Task, "subject" | "title" | "material" | "chapter" | "estimated_minutes" | "mode" | "status">;

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
  {
    subject: "english",
    title: "长难句2句",
    material: "长难句",
    chapter: "语法分析",
    estimated_minutes: 40,
    mode: "standard",
    status: "todo"
  },
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
