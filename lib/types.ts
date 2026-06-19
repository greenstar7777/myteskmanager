export type Status = "backlog" | "todo" | "in_progress" | "done"

export type Priority = "low" | "medium" | "high" | "urgent"

/** Eisenhower 매트릭스 분류에 쓰이는 두 축 */
export interface Eisenhower {
  /** 긴급도 */
  urgent: boolean
  /** 중요도 */
  important: boolean
}

export interface Task {
  id: string
  title: string
  description: string
  status: Status
  priority: Priority
  /** ISO 날짜 문자열 (YYYY-MM-DD). 없으면 마감일 미지정 */
  dueDate: string | null
  /** 프로젝트/카테고리 이름 */
  project: string
  tags: string[]
  /** 예상 소요 시간(시간 단위) */
  estimate: number
  eisenhower: Eisenhower
  /** 칸반 컬럼 내 정렬 순서 */
  order: number
  createdAt: string
  /** done 상태가 된 시각 (ISO). 미완료면 null */
  completedAt: string | null
}

export const STATUSES: { id: Status; label: string }[] = [
  { id: "backlog", label: "백로그" },
  { id: "todo", label: "할 일" },
  { id: "in_progress", label: "진행 중" },
  { id: "done", label: "완료" },
]

export const PRIORITIES: {
  id: Priority
  label: string
  /** Tailwind 색상 토큰용 클래스 */
  className: string
}[] = [
  { id: "urgent", label: "긴급", className: "bg-destructive/15 text-destructive" },
  { id: "high", label: "높음", className: "bg-chart-1/20 text-foreground" },
  { id: "medium", label: "보통", className: "bg-chart-3/20 text-foreground" },
  { id: "low", label: "낮음", className: "bg-muted text-muted-foreground" },
]

export function statusLabel(status: Status) {
  return STATUSES.find((s) => s.id === status)?.label ?? status
}

export function priorityMeta(priority: Priority) {
  return PRIORITIES.find((p) => p.id === priority) ?? PRIORITIES[2]
}
