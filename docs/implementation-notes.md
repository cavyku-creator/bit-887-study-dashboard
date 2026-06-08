# Implementation Notes

## 本地开发

1. 安装依赖：

```bash
npm install
```

2. 创建本地环境变量：

```bash
cp .env.example .env.local
```

3. 在 `.env.local` 中填写：

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

4. 启动开发服务器：

```bash
npm run dev
```

5. 提交前检查：

```bash
npm run lint
npm run typecheck
npm run build
```

## Supabase 迁移

当前项目使用浏览器端 Supabase anon key 访问，并依赖 Row Level Security 限制用户只能读写自己的数据。

迁移文件位于 `supabase/migrations`。新增表包括：

- `weekly_tasks`：每周任务计划层。
- `weekly_task_task_links`：周任务与日任务的关联表。
- `material_sources`：资料源索引、OCR 文本和附件元数据。
- `knowledge_items`：结构化知识项与 Markdown 笔记。
- `knowledge_item_sources`：知识项与资料源的多对多关系。

本地 Supabase 可使用：

```bash
supabase start
supabase db reset
```

远端项目需要通过 Supabase CLI 或 Dashboard 执行迁移。执行前请确认 `public.set_updated_at()` 已由初始迁移创建。

## Storage 私有 Bucket

迁移会创建 `study-materials-private` 私有 bucket，并限制对象路径第一段必须是当前用户 id。页面当前不强依赖上传能力；Storage 未配置或上传失败时，资料源登记、OCR 文本粘贴和知识项整理仍可使用。

不要把图片 base64 存入数据库。截图、PDF 等附件只应保存到私有 bucket，并在 `material_sources.storage_bucket` 和 `material_sources.storage_path` 中保存元数据。

## OCR 模式

当前 OCR 是手工粘贴回退模式，没有接入联网 OCR 服务。推荐流程是：

- 手工登记资料源。
- 粘贴外部 OCR 或自己转录的文本。
- 人工校对。
- 从文本中整理摘要、标签和知识项。

不要自动抓取、登录、解析付费课程网站，也不要公开付费课程截图。

## Vercel 部署

在 Vercel 导入仓库后配置环境变量：

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

当前实现不需要 `SUPABASE_SERVICE_ROLE_KEY`。如果后续新增服务端导出、OCR 或签名上传，service role key 只能在服务端 route handler 中读取，不能暴露给浏览器。

Preview 环境建议连接 Supabase 测试项目，用于验证迁移、RLS、表单写入和 Markdown 导出。Production 环境连接正式 Supabase 项目，迁移执行后再发布。

## Markdown 导出

887 知识项导出采用前端 Blob 下载，不经过 API route，不需要 service role key。导出文件名为：

```text
bit887_materials_export_YYYY-MM-DD.md
```

导出内容包括资料源索引、知识项正文、标签、最近资料来源和导出日期。
