# BIT 887 Study Dashboard v1.0 交付说明

## 1. 项目概述

BIT 887 Study Dashboard 是一个面向考研 085403 集成电路工程备考的个人学习总控台。它把日任务、每周任务、英语词汇打卡、数学错题、专业课 887 知识沉淀、资料源整理和阶段复盘放在同一个受登录保护的工作流中。

目标用户是正在备考北京理工大学 085403 集成电路工程、需要同时推进数学一、英语一、政治和 887 专业课的个人学习者。

当前版本：v1.0。

技术栈：

- Next.js App Router
- TypeScript
- TailwindCSS
- Supabase
- Vercel

## 2. 已完成功能

### 2.1 原有基础模块

- 首页学习进度：展示今日任务完成率、下一件事、关键日期倒计时和四科进度。
- 起步计划：基于静态阶段计划展示目标院校、阶段安排、日节奏和工具建议。
- 日任务：支持任务新增、编辑、删除、按日期和科目筛选、状态切换。
- 数学错题：支持错题记录、复习日期、掌握状态和错因分类。
- 英语一：保留英语入口，并升级为词汇打卡和书目计划中心。
- 专业课 887 概览：保留今日 887 任务、下一项任务、基础轮打法和模块提醒。
- 集训营作业：记录课程进度、作业、理解程度和明日优先级。
- 复盘：支持每日和每周复盘记录。
- 进度总览：汇总任务、学习时长和科目进度。
- 登录保护：所有需要保存学习数据的页面均使用 Supabase 登录保护。

### 2.2 每周任务系统

每周任务系统用于承接阶段计划，把较粗的周目标拆成可执行任务，再按需要转换为日任务。

已完成能力：

- 自动生成周任务。
- 手工新增周任务。
- 编辑周任务。
- 删除周任务。
- 按科目筛选。
- 按优先级排序。
- 转换为日任务。
- 写入周任务与日任务关联。

涉及页面和数据表：

- `/weekly`
- `weekly_tasks`
- `weekly_task_task_links`
- `tasks`

`weekly_tasks` 是周计划层，`tasks` 是日执行层。用户可以先在 `/weekly` 中生成或维护周任务，再把具体周任务转成当天的 `tasks` 记录。

### 2.3 英语词汇打卡增强

英语页继续基于 `english_daily_stats`，未新建重复词汇打卡表。

已完成能力：

- 新词记录。
- 复习记录。
- 学习时长记录。
- 正确率记录。
- 连续打卡天数。
- 本周新词和复习统计。
- 本月新词和复习统计。
- 近 7 天轻量柱状图。
- 近 30 天趋势线。
- 今日目标完成提示。
- 连续打卡和趋势成就反馈。
- 优先读取 `profiles.study_preferences.vocab_total_target`，保留 `7941` 作为 fallback。

涉及页面和数据表：

- `/english`
- `english_daily_stats`
- `profiles.study_preferences`

### 2.4 英语语法参考页

英语语法参考页采用静态内容驱动，不增加数据库读写压力。

已完成能力：

- 静态内容驱动。
- 搜索输入框。
- 左侧目录。
- 锚点跳转。
- 基础语法模块框架。

涉及页面和数据文件：

- `/english/grammar`
- `data/grammar.ts`

当前包含的基础模块：

- 句子成分与基本句型
- 动词时态与语态
- 非谓语动词
- 名词性从句
- 定语从句
- 状语从句
- 虚拟语气
- 倒装、强调、省略、否定、比较、主谓一致

### 2.5 专业课 887 知识项系统

887 知识项系统用于把专业课资料沉淀为可复习、可导出的 Markdown 笔记。

已完成能力：

- 新增知识项。
- 编辑知识项。
- 删除知识项。
- 标签记录。
- 难度记录。
- 复习状态记录。
- Markdown 正文记录。
- 最新资料来源展示。
- 从知识项加入本周任务。

涉及页面和数据表：

- `/887/notes`
- `knowledge_items`
- `weekly_tasks`

### 2.6 专业课 887 资料源系统

887 资料源系统用于登记资料来源、粘贴 OCR 文本或手工摘录，再人工整理成知识项。

已完成能力：

- 手工登记资料源。
- OCR 文本粘贴。
- 资料来源说明。
- OCR 状态展示。
- 私有资料标记。
- 从资料源生成知识项。
- Storage 未配置时仍可使用手工模式。
- OCR 未配置时仍可使用手工粘贴模式。

涉及页面和数据表：

- `/887/materials`
- `material_sources`
- `knowledge_items`
- `knowledge_item_sources`

### 2.7 Markdown 导出

Markdown 导出采用前端 Blob 下载，不依赖 API route，也不需要 service role key。

已完成能力：

- 在 `/887/notes` 提供导出按钮。
- 导出资料源索引。
- 导出知识项正文。
- 导出标签和最近资料来源。
- 导出日期写入文件内容。

文件名格式：

- `bit887_materials_export_YYYY-MM-DD.md`

真实验收结果：

- 已验证按钮点击无控制台错误。
- Chrome 自动化没有捕获到 download 事件，作为非阻塞说明记录。

## 3. 数据库变更

新增 migration：

- `20260609000100_add_weekly_tasks.sql`
  - 扩展 `profiles.study_preferences`。
  - 新增 `weekly_tasks`。
  - 新增 `weekly_task_task_links`。
  - 增加索引、updated_at trigger、RLS policy 和 authenticated grants。
- `20260609000200_add_material_sources_and_knowledge_items.sql`
  - 新增 `material_sources`。
  - 新增 `knowledge_items`。
  - 新增 `knowledge_item_sources`。
  - 创建私有 Storage bucket `study-materials-private`。
  - 增加索引、updated_at trigger、RLS policy 和 authenticated grants。
- `20260609000300_extend_english_daily_stats.sql`
  - 扩展 `english_daily_stats` 的目标字段和打卡状态字段。
  - 新增 `english_daily_stats_user_date_app_unique` 唯一索引。

远端执行状态：

- 三份 migration 已在远端 Supabase 项目 `oyiarfkfojtixnqtjepn` 执行成功。
- Supabase SQL Editor 返回 `Success. No rows returned`。
- 执行后本地应用不再出现缺表错误。

## 4. 新增和改动文件清单

页面：

- `app/page.tsx`
- `app/layout.tsx`
- `app/plan/page.tsx`
- `app/weekly/page.tsx`
- `app/english/page.tsx`
- `app/english/grammar/page.tsx`
- `app/887/page.tsx`
- `app/887/notes/page.tsx`
- `app/887/materials/page.tsx`

组件：

- `components/AppShell.tsx`
- `components/MetricCard.tsx`
- `components/SectionTabs.tsx`
- `components/charts/MiniBarChart.tsx`
- `components/charts/SparklineChart.tsx`
- `components/weekly/WeeklyTaskCard.tsx`
- `components/weekly/WeeklyTaskEditor.tsx`
- `components/notes/KnowledgeItemCard.tsx`
- `components/notes/KnowledgeItemEditor.tsx`
- `components/materials/MaterialSourceCard.tsx`
- `components/materials/MaterialSourceEditor.tsx`
- `components/materials/OcrReviewPanel.tsx`

Hooks：

- `lib/use-table.ts`
- `lib/use-weekly-tasks.ts`
- `lib/use-vocabulary-stats.ts`
- `lib/use-knowledge-items.ts`
- `lib/use-material-sources.ts`

工具函数：

- `lib/date.ts`
- `lib/stats.ts`
- `lib/weekly-generator.ts`
- `lib/templates.ts`

数据文件：

- `lib/plan.ts`
- `data/grammar.ts`
- `data/professional-887-outline.ts`

文档：

- `PROJECT_SPEC.md`
- `PROJECT_RELEASE_v1.0.md`
- `docs/implementation-notes.md`

Migrations：

- `supabase/migrations/20260609000100_add_weekly_tasks.sql`
- `supabase/migrations/20260609000200_add_material_sources_and_knowledge_items.sql`
- `supabase/migrations/20260609000300_extend_english_daily_stats.sql`

## 5. 环境变量

必需环境变量：

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

可选环境变量：

- `SUPABASE_SERVICE_ROLE_KEY`

当前 v1.0 不需要 `SUPABASE_SERVICE_ROLE_KEY`。只有未来接入服务端 OCR、服务端导出或服务端 Storage 签名时才考虑添加。`SUPABASE_SERVICE_ROLE_KEY` 只能在服务端读取，不得暴露到浏览器，也不得以 `NEXT_PUBLIC_` 前缀命名。

## 6. 本地开发步骤

仓库已包含 `.env.example`。本地开发步骤：

```bash
npm install
cp .env.example .env.local
supabase start
supabase db reset
npm run dev
```

在 `.env.local` 中填写：

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

如果本机未安装 Supabase CLI，可以先使用远端 Supabase 项目和 Dashboard SQL Editor 执行 migrations。

## 7. 构建与验收命令

本次最终检查命令：

```bash
npm run lint
npm run typecheck
npm run build
```

本次结果：

- `npm run lint`: 通过
- `npm run typecheck`: 通过
- `npm run build`: 通过

构建期间仍有一个本机可选依赖 warning：

- `@next/swc-darwin-arm64` 未安装，Next 使用 fallback 后构建成功。
- 该 warning 不阻塞上线。

## 8. Supabase 部署步骤

1. 创建 Supabase 项目。
2. 配置 Auth 邮箱登录。
3. 执行 `supabase/migrations` 中的 migrations。
4. 检查 RLS policy 是否启用，并确认 authenticated 用户只能读写自己的数据。
5. 可选创建私有 bucket `study-materials-private`。当前 migration 已包含 bucket 创建语句。
6. 确认 Storage 未配置或附件上传不可用时，资料源登记、OCR 文本粘贴和知识项整理仍可使用。

本次远端项目 `oyiarfkfojtixnqtjepn` 已执行 v1.0 新增 migrations，并通过登录态真实验收。

## 9. Vercel 部署步骤

1. 在 Vercel 导入 GitHub 仓库。
2. 配置环境变量：
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. 使用 Preview 部署验证登录、RLS、周任务、英语打卡、887 知识项和资料源流程。
4. Preview 验收通过后再推 Production。
5. 仓库中仍保留 `netlify.toml`，它是历史或遗留部署配置，不影响 Vercel 部署。

## 10. 上线前人工验收清单

基础验收：

- 登录：已通过。
- 未登录保护：已通过。
- 空数据页面：已验证可正常显示。
- RLS 隔离：核心写入均通过 authenticated anon client 和 RLS 模型执行，需在多账号场景继续抽检。

每周任务：

- `/weekly` 自动生成：已实现，建议 Preview 环境再点按确认一次。
- `/weekly` 手工新增：已实现。
- `/weekly` 转日任务：已实现。
- `/weekly` 能看到从 887 知识项加入的周任务：已通过。

英语：

- `/english` 打卡保存：已实现。
- `/english` 统计变化：已实现。
- `/english/grammar` 搜索和目录：已实现。

887：

- `/887` 概览统计：已实现。
- `/887/notes` 新增、编辑、删除：新增和删除已通过，编辑建议 Preview 环境继续抽检。
- `/887/notes` 加入本周任务：已通过。
- `/887/materials` 新增资料源：已通过。
- `/887/materials` 粘贴 OCR 文本：已通过。
- 从资料源生成知识项：已通过。
- Markdown 导出：按钮点击无控制台错误；Chrome 自动化没有捕获到 download 事件。

真实验收记录：

- 已在 Supabase Dashboard 对 `.env.local` 指向的项目 `oyiarfkfojtixnqtjepn` 执行三份新增 migration。
- Supabase SQL Editor 返回 `Success. No rows returned`。
- 本地应用不再出现缺表错误。
- 使用测试账号登录本地应用：通过。
- 登录态页面访问：通过。
- `/887/materials` 手工登记资料源：通过。
- 手工 OCR 文本保存随资料源创建：通过。
- 从资料源生成知识项：通过。
- `/887/notes` 知识项展示、最近资料来源展示：通过。
- 从知识项加入本周 887 周任务：通过。
- `/weekly` 能看到生成的 887 周任务：通过。
- 测试数据已清理：删除了本次创建的测试周任务、知识项、资料源各 1 条。
- `lib/use-table.ts` 的 Supabase 缺表错误已改成更友好的迁移提示。
- 本地 dev server 已停止，3000 端口无残留监听。

## 11. 已知限制

- 当前未接入真实 OCR 服务。
- 当前附件上传不是主流程。
- 当前不抓取付费课程网站。
- 当前不公开展示付费课程截图。
- 当前 Markdown 导出为前端导出。
- Chrome 自动化未捕获 download 事件，但按钮点击无控制台错误。
- 未来如果做附件上传，必须使用私有 bucket，不能把图片 base64 存入数据库。
- 当前 `knowledge_item_sources` 多对多关系表已存在，但 UI 主流程主要使用 `latest_source_id`。
- 当前 dashboard 仍有进一步范围查询优化空间。

## 12. 后续优化建议

- `/dashboard` 范围查询优化，避免统计页读取过多历史数据。
- `knowledge_item_sources` 多对多 UI 补全。
- 可选私有附件上传，并保持失败时不阻塞手工整理流程。
- OCR 服务接入，接入前保持手工粘贴回退。
- 学习时间分析中心。
- 错题系统增强。
- 887 章节进度系统。
- 智能任务编排。

## 13. 上线结论

当前状态：

- migration 已执行。
- 登录态真实验收核心流程通过。
- `npm run lint`、`npm run typecheck`、`npm run build` 全部通过。
- 阻塞问题已清除。

READY FOR PRODUCTION DEPLOYMENT
