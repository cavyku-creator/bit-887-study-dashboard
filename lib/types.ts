export type Subject = "math" | "english" | "politics" | "professional_887";
export type TaskStatus = "todo" | "doing" | "done" | "skipped";
export type TaskMode = "standard" | "minimum";
export type ErrorType = "concept" | "formula" | "calculation" | "no_idea";
export type CardModule = "semiconductor_physics" | "semiconductor_process" | "electronics";
export type EnglishType = "word" | "sentence";
export type ReviewType = "daily" | "weekly";

export type Profile = {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  display_name: string | null;
};

export type Task = {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  subject: Subject;
  title: string;
  material: string | null;
  chapter: string | null;
  estimated_minutes: number;
  date: string;
  status: TaskStatus;
  mode: TaskMode;
};

export type MathError = {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  source: string | null;
  chapter: string;
  problem_no: string | null;
  error_type: ErrorType;
  note: string | null;
  next_review_date: string | null;
  mastered: boolean;
};

export type KnowledgeCard = {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  module: CardModule;
  front: string;
  back: string;
  difficulty: number;
  next_review_date: string | null;
  mastered: boolean;
};

export type EnglishItem = {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  type: EnglishType;
  content: string;
  explanation: string | null;
  example: string | null;
  mistake_reason: string | null;
  review_count: number;
};

export type EnglishDailyStat = {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  date: string;
  app_name: string;
  new_words: number;
  reviewed_words: number;
  study_minutes: number;
  accuracy: number | null;
  note: string | null;
};

export type CampLog = {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  date: string;
  course: string;
  teacher_progress: string | null;
  understanding: number;
  homework: string | null;
  unclear_points: string[] | null;
  tomorrow_priority: string | null;
};

export type Review = {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  date: string;
  type: ReviewType;
  completed: string | null;
  unfinished: string | null;
  reason: string | null;
  tomorrow_priority: string | null;
  weekly_problem: string | null;
  next_adjustment: string | null;
};

export type StudySession = {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  subject: Subject;
  started_at: string;
  ended_at: string | null;
  minutes: number;
  note: string | null;
};

export type TableName =
  | "tasks"
  | "math_errors"
  | "knowledge_cards"
  | "english_items"
  | "english_daily_stats"
  | "camp_logs"
  | "reviews"
  | "study_sessions";

export type RowByTable = {
  tasks: Task;
  math_errors: MathError;
  knowledge_cards: KnowledgeCard;
  english_items: EnglishItem;
  english_daily_stats: EnglishDailyStat;
  camp_logs: CampLog;
  reviews: Review;
  study_sessions: StudySession;
};
