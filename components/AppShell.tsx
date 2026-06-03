"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarCheck,
  CheckSquare,
  GraduationCap,
  Home,
  LayoutDashboard,
  LogOut,
  NotebookPen
} from "lucide-react";
import { useAuth } from "./AuthProvider";

const navItems = [
  { href: "/", label: "今日进度", icon: Home },
  { href: "/tasks", label: "计划任务", icon: CheckSquare },
  { href: "/camp", label: "集训营作业", icon: GraduationCap },
  { href: "/review", label: "复盘", icon: NotebookPen },
  { href: "/dashboard", label: "进度总览", icon: LayoutDashboard }
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-paper text-ink">
      <header className="sticky top-0 z-20 border-b border-line bg-paper/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <CalendarCheck className="h-5 w-5 text-accent" />
            <span>BIT 887 Study Dashboard</span>
          </Link>
          <div className="flex items-center gap-3 text-sm">
            {user ? <span className="hidden max-w-44 truncate text-muted sm:block">{user.email}</span> : null}
            {user ? (
              <button
                className="inline-flex items-center gap-1 rounded-md border border-line bg-panel px-3 py-2 text-sm hover:border-accent"
                onClick={signOut}
                type="button"
              >
                <LogOut className="h-4 w-4" />
                退出
              </button>
            ) : (
              <Link className="rounded-md bg-accent px-3 py-2 text-sm font-medium text-white" href="/login">
                登录
              </Link>
            )}
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-5 px-4 py-5 md:grid-cols-[220px_1fr]">
        <nav className="md:sticky md:top-20 md:self-start">
          <div className="flex gap-2 overflow-x-auto pb-2 md:flex-col md:overflow-visible md:pb-0">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link
                  className={`flex shrink-0 items-center gap-2 rounded-md border px-3 py-2 text-sm transition ${
                    active ? "border-accent bg-accent text-white" : "border-line bg-panel text-muted hover:border-accent hover:text-ink"
                  }`}
                  href={item.href}
                  key={item.href}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>

        <main>{children}</main>
      </div>
    </div>
  );
}
