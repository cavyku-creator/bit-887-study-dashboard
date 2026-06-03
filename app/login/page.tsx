"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogIn, UserPlus } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import { Card, Field, PageHeader, buttonClass, ghostButtonClass, inputClass } from "@/components/ui";
import { getSupabaseClient } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const { configured, user, signOut } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(mode: "login" | "signup") {
    const supabase = getSupabaseClient();
    if (!supabase) {
      setMessage("Supabase 环境变量未配置。");
      return;
    }

    setBusy(true);
    setMessage(null);
    const result =
      mode === "login"
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password });

    setBusy(false);
    if (result.error) {
      setMessage(result.error.message);
      return;
    }

    if (mode === "signup" && !result.data.session) {
      setMessage("注册成功。若项目开启邮箱确认，请先到邮箱中点击确认链接。");
      return;
    }

    router.push("/");
  }

  return (
    <div className="max-w-xl">
      <PageHeader title="登录" description="使用 Supabase 邮箱账号保存你的学习数据。" />
      <Card>
        {!configured ? (
          <p className="text-sm text-muted">请先创建 `.env.local` 并填写 Supabase URL 和 Anon Key。</p>
        ) : user ? (
          <div className="space-y-4">
            <p className="text-sm text-muted">当前已登录：{user.email}</p>
            <button className={ghostButtonClass} onClick={signOut} type="button">
              退出登录
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <Field label="邮箱">
              <input className={inputClass} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" type="email" value={email} />
            </Field>
            <Field label="密码">
              <input className={inputClass} onChange={(event) => setPassword(event.target.value)} placeholder="至少 6 位" type="password" value={password} />
            </Field>
            {message ? <p className="rounded-md border border-line bg-paper p-3 text-sm text-muted">{message}</p> : null}
            <div className="flex flex-wrap gap-3">
              <button className={buttonClass} disabled={busy} onClick={() => submit("login")} type="button">
                <LogIn className="h-4 w-4" />
                登录
              </button>
              <button className={ghostButtonClass} disabled={busy} onClick={() => submit("signup")} type="button">
                <UserPlus className="h-4 w-4" />
                注册
              </button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
