"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  KanbanSquare,
  Grid2x2,
  ListTodo,
  CheckCircle2,
} from "lucide-react"

import { cn } from "@/lib/utils"

const NAV = [
  { href: "/", label: "대시보드", icon: LayoutDashboard },
  { href: "/board", label: "칸반 보드", icon: KanbanSquare },
  { href: "/matrix", label: "우선순위 매트릭스", icon: Grid2x2 },
  { href: "/tasks", label: "작업 목록", icon: ListTodo },
]

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r bg-sidebar text-sidebar-foreground md:flex">
      <div className="flex h-14 items-center gap-2 border-b px-4">
        <div className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <CheckCircle2 className="size-4" />
        </div>
        <span className="font-semibold">FlowDesk</span>
      </div>
      <nav className="flex flex-col gap-1 p-2">
        {NAV.map((item) => {
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href)
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
              )}
            >
              <Icon className="size-4 shrink-0" />
              {item.label}
            </Link>
          )
        })}
      </nav>
      <div className="mt-auto p-3 text-xs text-muted-foreground">
        개인 작업 관리 · 로컬 저장
      </div>
    </aside>
  )
}
