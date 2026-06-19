import type { Priority, Status, Task } from "@/lib/types"

/** 자정 기준 오늘 Date */
function today(): Date {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

export function parseDue(dueDate: string | null): Date | null {
  if (!dueDate) return null
  const d = new Date(dueDate + "T00:00:00")
  return Number.isNaN(d.getTime()) ? null : d
}

/** 마감일까지 남은 일수. 음수면 지남. 마감 없으면 null */
export function daysUntil(dueDate: string | null): number | null {
  const due = parseDue(dueDate)
  if (!due) return null
  const diff = due.getTime() - today().getTime()
  return Math.round(diff / 86_400_000)
}

export function isOverdue(task: Task): boolean {
  if (task.status === "done") return false
  const d = daysUntil(task.dueDate)
  return d !== null && d < 0
}

export function isDueSoon(task: Task): boolean {
  if (task.status === "done") return false
  const d = daysUntil(task.dueDate)
  return d !== null && d >= 0 && d <= 2
}

export interface DashboardStats {
  total: number
  done: number
  active: number
  overdue: number
  dueSoon: number
  completionRate: number
  byStatus: Record<Status, number>
  byPriority: Record<Priority, number>
  /** 최근 7일 일별 완료 수 (오래된 → 최신) */
  weeklyCompletion: { label: string; date: string; count: number }[]
  /** 다가오는 마감 작업 (미완료, 마감일 오름차순) */
  upcoming: Task[]
  /** 프로젝트별 진행률 */
  projects: { name: string; total: number; done: number; rate: number }[]
}

const WEEKDAY = ["일", "월", "화", "수", "목", "금", "토"]

export function computeStats(tasks: Task[]): DashboardStats {
  const byStatus: Record<Status, number> = {
    backlog: 0,
    todo: 0,
    in_progress: 0,
    done: 0,
  }
  const byPriority: Record<Priority, number> = {
    low: 0,
    medium: 0,
    high: 0,
    urgent: 0,
  }

  for (const t of tasks) {
    byStatus[t.status]++
    byPriority[t.priority]++
  }

  const total = tasks.length
  const done = byStatus.done
  const active = total - done
  const overdue = tasks.filter(isOverdue).length
  const dueSoon = tasks.filter(isDueSoon).length
  const completionRate = total === 0 ? 0 : Math.round((done / total) * 100)

  // 최근 7일 완료 추세
  const base = today()
  const weeklyCompletion = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(base)
    d.setDate(base.getDate() - (6 - i))
    const key = d.toISOString().slice(0, 10)
    const count = tasks.filter(
      (t) => t.completedAt && t.completedAt.slice(0, 10) === key
    ).length
    return { label: WEEKDAY[d.getDay()], date: key, count }
  })

  const upcoming = tasks
    .filter((t) => t.status !== "done" && t.dueDate)
    .sort((a, b) => (a.dueDate! < b.dueDate! ? -1 : 1))
    .slice(0, 6)

  // 프로젝트별 진행률
  const projMap = new Map<string, { total: number; done: number }>()
  for (const t of tasks) {
    const name = t.project || "기타"
    const entry = projMap.get(name) ?? { total: 0, done: 0 }
    entry.total++
    if (t.status === "done") entry.done++
    projMap.set(name, entry)
  }
  const projects = [...projMap.entries()]
    .map(([name, v]) => ({
      name,
      total: v.total,
      done: v.done,
      rate: v.total === 0 ? 0 : Math.round((v.done / v.total) * 100),
    }))
    .sort((a, b) => b.total - a.total)

  return {
    total,
    done,
    active,
    overdue,
    dueSoon,
    completionRate,
    byStatus,
    byPriority,
    weeklyCompletion,
    upcoming,
    projects,
  }
}

/** 마감일 표시용 라벨 (예: "오늘", "내일", "3일 지남") */
export function dueLabel(dueDate: string | null): string | null {
  const d = daysUntil(dueDate)
  if (d === null) return null
  if (d === 0) return "오늘"
  if (d === 1) return "내일"
  if (d === -1) return "어제"
  if (d < 0) return `${-d}일 지남`
  return `${d}일 후`
}
