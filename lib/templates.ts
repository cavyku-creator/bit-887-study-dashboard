import type { Task } from "./types";

export type TaskTemplate = Pick<Task, "subject" | "title" | "material" | "chapter" | "estimated_minutes" | "mode" | "status">;

export const englishBookPlanTemplates: TaskTemplate[] = [
  {
    subject: "english",
    title: "田静句句真研：长难句拆解2句",
    material: "田静《句句真研》",
    chapter: "语法主干与修饰关系",
    estimated_minutes: 35,
    mode: "standard",
    status: "todo"
  },
  {
    subject: "english",
    title: "唐迟阅读的逻辑：真题阅读1篇精读",
    material: "唐迟《阅读的逻辑》",
    chapter: "定位、错因与选项陷阱",
    estimated_minutes: 55,
    mode: "standard",
    status: "todo"
  }
];

export const defaultTaskTemplates: TaskTemplate[] = [
  {
    subject: "math",
    title: "数学一基础：高数概念+例题1小节",
    material: "张宇基础30讲",
    chapter: "极限/导数/积分轮换",
    estimated_minutes: 90,
    mode: "standard",
    status: "todo"
  },
  {
    subject: "math",
    title: "数学一手算：基础题10-15道",
    material: "张宇1000题",
    chapter: "当天小节对应题",
    estimated_minutes: 60,
    mode: "minimum",
    status: "todo"
  },
  {
    subject: "english",
    title: "不背单词：新词40-60+复习80-120",
    material: "不背单词",
    chapter: "英语一词汇循环",
    estimated_minutes: 35,
    mode: "minimum",
    status: "todo"
  },
  {
    subject: "english",
    title: "英语一：句句真研2句或阅读1篇精读",
    material: "田静《句句真研》/唐迟《阅读的逻辑》",
    chapter: "语法主干、定位与选项错因",
    estimated_minutes: 55,
    mode: "standard",
    status: "todo"
  },
  {
    subject: "politics",
    title: "政治保底：马原概念轻扫15分钟",
    material: "马原",
    chapter: "暑期前低负荷维护",
    estimated_minutes: 15,
    mode: "minimum",
    status: "todo"
  },
  {
    subject: "professional_887",
    title: "887半导体物理：能带/载流子概念闭环",
    material: "刘恩科《半导体物理学》",
    chapter: "电子状态、本征与杂质半导体",
    estimated_minutes: 55,
    mode: "standard",
    status: "todo"
  },
  {
    subject: "professional_887",
    title: "887电子技术基础：二极管/BJT/FET工作区表",
    material: "康华光《电子技术基础-模拟部分》",
    chapter: "半导体器件与放大电路入口",
    estimated_minutes: 55,
    mode: "standard",
    status: "todo"
  },
  {
    subject: "professional_887",
    title: "887基础计算：PN结或放大电路3题",
    material: "887基础题",
    chapter: "简答40% + 计算60%训练",
    estimated_minutes: 45,
    mode: "standard",
    status: "todo"
  },
  {
    subject: "professional_887",
    title: "887 Anki：概念/公式卡8张",
    material: "Anki",
    chapter: "物理意义与适用条件",
    estimated_minutes: 25,
    mode: "minimum",
    status: "todo"
  }
];
