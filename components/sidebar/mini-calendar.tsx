"use client"

import * as React from "react"

import { useNow } from "@/lib/use-now"
import { useTasks } from "@/lib/tasks-context"
import { cn } from "@/lib/utils"

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"]

/** 사이드바 미니 달력 — 오늘 강조 + 마감 있는 날 표시 */
export function MiniCalendar() {
  const now = useNow()
  const { tasks } = useTasks()

  if (now === 0) {
    // 서버/하이드레이션 시점: 자리표시자 (브라우저 타임존 확정 후 렌더)
    return <div className="h-44 rounded-lg border bg-background/60 dark:bg-input/20" />
  }

  const today = new Date(now)
  const year = today.getFullYear()
  const month = today.getMonth()
  const todayDate = today.getDate()

  const startDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  // 이번 달에 마감(미완료)이 있는 날짜 집합
  const dueDays = new Set<number>()
  for (const t of tasks) {
    if (t.status === "done" || !t.dueDate) continue
    const d = new Date(t.dueDate + "T00:00:00")
    if (d.getFullYear() === year && d.getMonth() === month) {
      dueDays.add(d.getDate())
    }
  }

  // 앞쪽 빈 칸 + 날짜 셀
  const cells: (number | null)[] = [
    ...Array.from({ length: startDay }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]

  return (
    <div className="rounded-lg border bg-background/60 p-2.5 dark:bg-input/20">
      <div className="mb-1.5 px-0.5 text-xs font-semibold">
        {year}년 {month + 1}월
      </div>
      <div className="grid grid-cols-7 gap-0.5 text-center">
        {WEEKDAYS.map((w, i) => (
          <div
            key={w}
            className={cn(
              "py-0.5 text-[10px] font-medium",
              i === 0
                ? "text-destructive/70"
                : i === 6
                  ? "text-chart-2"
                  : "text-muted-foreground"
            )}
          >
            {w}
          </div>
        ))}
        {cells.map((day, i) => {
          if (day === null) return <div key={`empty-${i}`} />
          const isToday = day === todayDate
          const hasDue = dueDays.has(day)
          return (
            <div
              key={day}
              className={cn(
                "relative flex h-6 items-center justify-center rounded-md text-[11px] tabular-nums",
                isToday
                  ? "bg-primary font-semibold text-primary-foreground"
                  : "text-foreground"
              )}
            >
              {day}
              {hasDue && !isToday ? (
                <span className="absolute bottom-0.5 size-1 rounded-full bg-chart-1" />
              ) : null}
            </div>
          )
        })}
      </div>
    </div>
  )
}
