"use client";

import Link from "next/link";
import { useAuth } from "./AuthProvider";

export function Protected({ children }: { children: React.ReactNode }) {
  const { configured, loading, user } = useAuth();

  if (!configured) {
    return (
      <div className="rounded-lg border border-line bg-panel p-5 shadow-soft">
        <h2 className="text-lg font-semibold text-ink">需要配置 Supabase</h2>
        <p className="mt-2 text-sm text-muted">
          请根据 `.env.example` 创建 `.env.local`，填入 `NEXT_PUBLIC_SUPABASE_URL` 和 `NEXT_PUBLIC_SUPABASE_ANON_KEY`。
        </p>
      </div>
    );
  }

  if (loading) {
    return <div className="rounded-lg border border-line bg-panel p-5 text-sm text-muted">正在读取登录状态...</div>;
  }

  if (!user) {
    return (
      <div className="rounded-lg border border-line bg-panel p-5 shadow-soft">
        <h2 className="text-lg font-semibold text-ink">请先登录</h2>
        <p className="mt-2 text-sm text-muted">登录后才能查看和保存你的学习数据。</p>
        <Link className="mt-4 inline-flex rounded-md bg-accent px-4 py-2 text-sm font-medium text-white" href="/login">
          去登录
        </Link>
      </div>
    );
  }

  return <>{children}</>;
}
