"use client"

import { cn } from "@/lib/utils"

export interface Segment {
  label: string
  value: number
  /** CSS 색상 값 (예: "var(--chart-1)") */
  color: string
}

/** SVG 도넛 차트 + 범례 */
export function DonutChart({
  segments,
  centerLabel,
  centerValue,
}: {
  segments: Segment[]
  centerLabel?: string
  centerValue?: string | number
}) {
  const total = segments.reduce((sum, s) => sum + s.value, 0)
  const radius = 56
  const circumference = 2 * Math.PI * radius
  let offset = 0

  return (
    <div className="flex items-center gap-5">
      <div className="relative size-36 shrink-0">
        <svg viewBox="0 0 140 140" className="size-full -rotate-90">
          <circle
            cx="70"
            cy="70"
            r={radius}
            fill="none"
            stroke="var(--muted)"
            strokeWidth="16"
          />
          {total > 0 &&
            segments.map((s) => {
              if (s.value === 0) return null
              const length = (s.value / total) * circumference
              const dash = `${length} ${circumference - length}`
              const el = (
                <circle
                  key={s.label}
                  cx="70"
                  cy="70"
                  r={radius}
                  fill="none"
                  stroke={s.color}
                  strokeWidth="16"
                  strokeDasharray={dash}
                  strokeDashoffset={-offset}
                />
              )
              offset += length
              return el
            })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-semibold">{centerValue ?? total}</span>
          {centerLabel ? (
            <span className="text-xs text-muted-foreground">{centerLabel}</span>
          ) : null}
        </div>
      </div>

      <ul className="flex min-w-0 flex-1 flex-col gap-1.5">
        {segments.map((s) => (
          <li key={s.label} className="flex items-center gap-2 text-sm">
            <span
              className="size-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: s.color }}
            />
            <span className="truncate text-muted-foreground">{s.label}</span>
            <span className="ml-auto font-medium tabular-nums">{s.value}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

/** 수직 막대 차트 (주간 추세 등) */
export function BarChart({
  data,
  className,
}: {
  data: { label: string; value: number }[]
  className?: string
}) {
  const max = Math.max(1, ...data.map((d) => d.value))

  return (
    <div className={cn("flex items-end gap-2", className)}>
      {data.map((d, i) => (
        <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
          <div className="flex h-28 w-full items-end">
            <div
              className="w-full rounded-md bg-primary/80 transition-all"
              style={{ height: `${Math.max((d.value / max) * 100, d.value > 0 ? 8 : 2)}%` }}
              title={`${d.value}`}
            />
          </div>
          <span className="text-xs text-muted-foreground">{d.label}</span>
          <span className="text-xs font-medium tabular-nums">{d.value}</span>
        </div>
      ))}
    </div>
  )
}

/** 가로 진행 막대 */
export function ProgressBar({
  value,
  className,
}: {
  /** 0–100 */
  value: number
  className?: string
}) {
  return (
    <div className={cn("h-2 w-full overflow-hidden rounded-full bg-muted", className)}>
      <div
        className="h-full rounded-full bg-primary transition-all"
        style={{ width: `${Math.min(Math.max(value, 0), 100)}%` }}
      />
    </div>
  )
}
