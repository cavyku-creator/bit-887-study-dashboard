export type Subject = "math" | "english" | "politics" | "professional_887";
export type KnowledgeSubject = "english" | "professional_887" | "general";
export type TaskStatus = "todo" | "doing" | "done" | "skipped";
export type TaskMode = "standard" | "minimum";
export type ErrorType = "concept" | "formula" | "calculation" | "no_idea";
export type CardModule = "semiconductor_physics" | "semiconductor_process" | "electronics";
export type EnglishType = "word" | "sentence";
export type ReviewType = "daily" | "weekly";
export type WeeklyTaskSourceType = "manual" | "auto";
export type MaterialSourceKind = "manual" | "screenshot" | "pdf" | "ocr_text" | "url" | "note";
export type OcrStatus = "pending" | "done" | "failed" | "not_needed";
export type CopyrightScope = "private_notes_only" | "personal_copy" | "unknown";
export type KnowledgeReviewState = "new" | "learning" | "stable" | "needs_revision";
export type CheckInStatus = "done" | "partial" | "missed";
export type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue };

export type Profile = {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  display_name: string | null;
  study_preferences: Record<string, JsonValue>;
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
  target_new_words: number | null;
  target_reviewed_words: number | null;
  check_in_status: CheckInStatus;
};

export type WeeklyTask = {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  week_start_date: string;
  subject: Subject;
  title: string;
  description: string | null;
  source_type: WeeklyTaskSourceType;
  phase_code: string;
  status: TaskStatus;
  priority: number;
  estimated_minutes: number;
  planned_sessions: number;
  due_date: string | null;
  generated_batch_id: string | null;
  metadata: Record<string, JsonValue>;
};

export type WeeklyTaskTaskLink = {
  weekly_task_id: string;
  task_id: string;
  user_id: string;
  created_at: string;
};

export type MaterialSource = {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  source_kind: MaterialSourceKind;
  subject: KnowledgeSubject;
  title: string;
  source_label: string | null;
  source_url: string | null;
  storage_bucket: string | null;
  storage_path: string | null;
  file_mime_type: string | null;
  file_size_bytes: number | null;
  ocr_status: OcrStatus;
  ocr_text: string | null;
  copyright_scope: CopyrightScope;
  is_private: boolean;
  metadata: Record<string, JsonValue>;
};

export type KnowledgeItem = {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  subject: KnowledgeSubject;
  module: string;
  topic: string | null;
  title: string;
  slug: string | null;
  summary: string | null;
  content_md: string;
  tags: string[];
  difficulty: number;
  review_state: KnowledgeReviewState;
  latest_source_id: string | null;
  metadata: Record<string, JsonValue>;
};

export type KnowledgeItemSource = {
  knowledge_item_id: string;
  material_source_id: string;
  user_id: string;
  created_at: string;
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
  | "profiles"
  | "tasks"
  | "math_errors"
  | "knowledge_cards"
  | "english_items"
  | "english_daily_stats"
  | "camp_logs"
  | "reviews"
  | "study_sessions"
  | "weekly_tasks"
  | "weekly_task_task_links"
  | "material_sources"
  | "knowledge_items"
  | "knowledge_item_sources";

export type RowByTable = {
  profiles: Profile;
  tasks: Task;
  math_errors: MathError;
  knowledge_cards: KnowledgeCard;
  english_items: EnglishItem;
  english_daily_stats: EnglishDailyStat;
  camp_logs: CampLog;
  reviews: Review;
  study_sessions: StudySession;
  weekly_tasks: WeeklyTask;
  weekly_task_task_links: WeeklyTaskTaskLink;
  material_sources: MaterialSource;
  knowledge_items: KnowledgeItem;
  knowledge_item_sources: KnowledgeItemSource;
};
