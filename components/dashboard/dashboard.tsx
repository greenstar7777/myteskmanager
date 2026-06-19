"use client"

import * as React from "react"
import Link from "next/link"
import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  ListChecks,
  TrendingUp,
} from "lucide-react"

import { PRIORITIES, priorityMeta } from "@/lib/types"
import { useTasks } from "@/lib/tasks-context"
import { computeStats, dueLabel, daysUntil } from "@/lib/stats"
import { cn } from "@/lib/utils"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  BarChart,
  DonutChart,
  ProgressBar,
  type Segment,
} from "@/components/dashboard/charts"
import { useTaskDialog } from "@/components/task-dialog"

const STATUS_COLORS: Record<string, string> = {
  backlog: "var(--muted-foreground)",
  todo: "var(--chart-2)",
  in_progress: "var(--chart-1)",
  done: "var(--primary)",
}

export function Dashboard() {
  const { tasks, hydrated } = useTasks()
  const { openEdit } = useTaskDialog()

  const stats = React.useMemo(() => computeStats(tasks), [tasks])

  // 하이드레이션 전에는 SSR 시드 기준으로 렌더되므로 로딩 표시로 깜빡임 방지
  if (!hydrated) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
        불러오는 중…
      </div>
    )
  }

  const statusSegments: Segment[] = [
    { label: "백로그", value: stats.byStatus.backlog, color: STATUS_COLORS.backlog },
    { label: "할 일", value: stats.byStatus.todo, color: STATUS_COLORS.todo },
    {
      label: "진행 중",
      value: stats.byStatus.in_progress,
      color: STATUS_COLORS.in_progress,
    },
    { label: "완료", value: stats.byStatus.done, color: STATUS_COLORS.done },
  ]

  const priorityData = PRIORITIES.map((p) => ({
    label: p.label,
    value: stats.byPriority[p.id],
  }))

  return (
    <div className="flex flex-col gap-4">
      {/* KPI 카드 */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          icon={<ListChecks className="size-4" />}
          label="전체 작업"
          value={stats.total}
          hint={`진행 중 ${stats.active}개`}
        />
        <StatCard
          icon={<CheckCircle2 className="size-4" />}
          label="완료율"
          value={`${stats.completionRate}%`}
          hint={`${stats.done}개 완료`}
          accent="text-primary"
        />
        <StatCard
          icon={<AlertTriangle className="size-4" />}
          label="기한 초과"
          value={stats.overdue}
          hint={stats.overdue > 0 ? "확인이 필요해요" : "없음"}
          accent={stats.overdue > 0 ? "text-destructive" : undefined}
        />
        <StatCard
          icon={<CalendarClock className="size-4" />}
          label="마감 임박"
          value={stats.dueSoon}
          hint="2일 이내"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* 상태 분포 도넛 */}
        <Card>
          <CardHeader>
            <CardTitle>상태 분포</CardTitle>
          </CardHeader>
          <CardContent>
            <DonutChart
              segments={statusSegments}
              centerLabel="전체"
              centerValue={stats.total}
            />
          </CardContent>
        </Card>

        {/* 주간 완료 추세 */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-1.5">
              <TrendingUp className="size-4 text-muted-foreground" />
              최근 7일 완료 추세
            </CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart
              data={stats.weeklyCompletion.map((d) => ({
                label: d.label,
                value: d.count,
              }))}
            />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* 우선순위 분포 */}
        <Card>
          <CardHeader>
            <CardTitle>우선순위 분포</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {priorityData.map((p, i) => {
              const meta = PRIORITIES[i]
              const pct =
                stats.total === 0 ? 0 : (p.value / stats.total) * 100
              return (
                <div key={p.label} className="flex flex-col gap-1">
                  <div className="flex items-center justify-between text-sm">
                    <Badge className={priorityMeta(meta.id).className}>
                      {p.label}
                    </Badge>
                    <span className="text-muted-foreground tabular-nums">
                      {p.value}
                    </span>
                  </div>
                  <ProgressBar value={pct} />
                </div>
              )
            })}
          </CardContent>
        </Card>

        {/* 프로젝트별 진행률 */}
        <Card>
          <CardHeader>
            <CardTitle>프로젝트별 진행률</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {stats.projects.length === 0 ? (
              <p className="text-sm text-muted-foreground">프로젝트가 없습니다.</p>
            ) : (
              stats.projects.map((proj) => (
                <div key={proj.name} className="flex flex-col gap-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="truncate font-medium">{proj.name}</span>
                    <span className="text-muted-foreground tabular-nums">
                      {proj.done}/{proj.total} · {proj.rate}%
                    </span>
                  </div>
                  <ProgressBar value={proj.rate} />
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* 다가오는 마감 */}
        <Card>
          <CardHeader>
            <CardTitle>다가오는 마감</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.upcoming.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                예정된 마감이 없습니다.
              </p>
            ) : (
              <ul className="flex flex-col gap-1">
                {stats.upcoming.map((task) => {
                  const overdue = (daysUntil(task.dueDate) ?? 0) < 0
                  return (
                    <li key={task.id}>
                      <button
                        type="button"
                        onClick={() => openEdit(task)}
                        className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm hover:bg-muted/50"
                      >
                        <span
                          className={cn(
                            "size-2 shrink-0 rounded-full",
                            overdue ? "bg-destructive" : "bg-chart-1"
                          )}
                        />
                        <span className="min-w-0 flex-1 truncate">
                          {task.title}
                        </span>
                        <span
                          className={cn(
                            "shrink-0 text-xs",
                            overdue
                              ? "font-medium text-destructive"
                              : "text-muted-foreground"
                          )}
                        >
                          {dueLabel(task.dueDate)}
                        </span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
            <Link
              href="/tasks"
              className="mt-3 block text-xs font-medium text-primary hover:underline"
            >
              모든 작업 보기 →
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function StatCard({
  icon,
  label,
  value,
  hint,
  accent,
}: {
  icon: React.ReactNode
  label: string
  value: string | number
  hint?: string
  accent?: string
}) {
  return (
    <Card className="gap-2">
      <CardContent className="flex flex-col gap-1">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          {icon}
          {label}
        </div>
        <div className={cn("text-2xl font-semibold tabular-nums", accent)}>
          {value}
        </div>
        {hint ? (
          <div className="text-xs text-muted-foreground">{hint}</div>
        ) : null}
      </CardContent>
    </Card>
  )
}
