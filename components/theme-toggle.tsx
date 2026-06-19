"use client"

import { useTheme } from "next-themes"
import { Monitor, Moon, Sun } from "lucide-react"

import { cn } from "@/lib/utils"

const OPTIONS = [
  { value: "light", label: "라이트", icon: Sun },
  { value: "system", label: "환경 자동", icon: Monitor },
  { value: "dark", label: "다크", icon: Moon },
] as const

/**
 * 라이트 / 시스템 / 다크를 고르는 세그먼트 토글.
 * next-themes는 마운트 전 theme이 undefined이므로 SSR과 첫 렌더가 일치해
 * 하이드레이션 불일치가 발생하지 않는다.
 */
export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <div
      role="group"
      aria-label="테마 선택"
      className="inline-flex items-center gap-0.5 rounded-lg border bg-background p-0.5 dark:bg-input/30"
    >
      {OPTIONS.map((opt) => {
        const Icon = opt.icon
        const active = theme === opt.value
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => setTheme(opt.value)}
            aria-pressed={active}
            title={opt.label}
            className={cn(
              "flex size-7 items-center justify-center rounded-md transition-colors",
              active
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon className="size-4" />
            <span className="sr-only">{opt.label}</span>
          </button>
        )
      })}
    </div>
  )
}
