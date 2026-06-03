import type { CardModule, ErrorType, EnglishType, ReviewType, Subject, TaskMode, TaskStatus } from "./types";

export const subjects: Record<Subject, string> = {
  math: "数学一",
  english: "英语一",
  politics: "政治",
  professional_887: "专业课 887"
};

export const subjectColors: Record<Subject, string> = {
  math: "bg-math/10 text-math border-math/20",
  english: "bg-english/10 text-english border-english/20",
  politics: "bg-politics/10 text-politics border-politics/20",
  professional_887: "bg-professional/10 text-professional border-professional/20"
};

export const taskStatuses: Record<TaskStatus, string> = {
  todo: "待做",
  doing: "进行中",
  done: "已完成",
  skipped: "跳过"
};

export const taskModes: Record<TaskMode, string> = {
  standard: "标准任务",
  minimum: "保底任务"
};

export const errorTypes: Record<ErrorType, string> = {
  concept: "概念不清",
  formula: "公式遗忘",
  calculation: "计算失误",
  no_idea: "没有思路"
};

export const cardModules: Record<CardModule, string> = {
  semiconductor_physics: "半导体物理",
  semiconductor_process: "半导体工艺",
  electronics: "电子电路基础"
};

export const englishTypes: Record<EnglishType, string> = {
  word: "单词",
  sentence: "长难句"
};

export const reviewTypes: Record<ReviewType, string> = {
  daily: "每日复盘",
  weekly: "每周复盘"
};
