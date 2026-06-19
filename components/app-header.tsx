"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Plus } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useTaskDialog } from "@/components/task-dialog"

const PAGE_TITLES: Record<string, string> = {
  "/": "대시보드",
  "/board": "칸반 보드",
  "/matrix": "우선순위 매트릭스",
  "/tasks": "작업 목록",
}

const MOBILE_NAV = [
  { href: "/", label: "대시보드" },
  { href: "/board", label: "보드" },
  { href: "/matrix", label: "매트릭스" },
  { href: "/tasks", label: "목록" },
]

export function AppHeader() {
  const pathname = usePathname()
  const { openNew } = useTaskDialog()
  const title = PAGE_TITLES[pathname] ?? "FlowDesk"

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b bg-background/80 px-4 backdrop-blur md:px-6">
      <h1 className="text-base font-semibold md:text-lg">{title}</h1>

      {/* 모바일 네비게이션 */}
      <nav className="flex gap-1 overflow-x-auto md:hidden">
        {MOBILE_NAV.map((item) => {
          const active =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-md px-2 py-1 text-xs font-medium whitespace-nowrap",
                active
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground"
              )}
            >
              {item.label}
            </Link>
          )
        })}
      </nav>

      <Button className="ml-auto" onClick={() => openNew()}>
        <Plus />
        새 작업
      </Button>
    </header>
  )
}
