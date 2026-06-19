"use client"

import { useNow } from "@/lib/use-now"

const DATE_FMT = new Intl.DateTimeFormat("ko-KR", {
  month: "long",
  day: "numeric",
  weekday: "short",
})

const TIME_FMT = new Intl.DateTimeFormat("ko-KR", {
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
})

/** 사이드바 실시간 시계 */
export function Clock() {
  const now = useNow()
  const ready = now !== 0
  const date = ready ? new Date(now) : null

  return (
    <div className="rounded-lg border bg-background/60 px-3 py-2.5 dark:bg-input/20">
      <div
        suppressHydrationWarning
        className="font-mono text-xl font-semibold tracking-tight tabular-nums"
      >
        {date ? TIME_FMT.format(date) : "--:--:--"}
      </div>
      <div
        suppressHydrationWarning
        className="mt-0.5 text-xs text-muted-foreground"
      >
        {date ? DATE_FMT.format(date) : " "}
      </div>
    </div>
  )
}
