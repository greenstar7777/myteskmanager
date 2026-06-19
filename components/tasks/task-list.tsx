"use client"

import * as React from "react"
import { Check, Inbox, Search } from "lucide-react"

import type { Priority, Status, Task } from "@/lib/types"
import { PRIORITIES, STATUSES, priorityMeta, statusLabel } from "@/lib/types"
import { useTasks } from "@/lib/tasks-context"
import { cn } from "@/lib/utils"
import { dueLabel, daysUntil } from "@/lib/stats"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useTaskDialog } from "@/components/task-dialog"

type SortKey = "due" | "priority" | "created"

const PRIORITY_RANK: Record<Priority, number> = {
  urgent: 0,
  high: 1,
  medium: 2,
  low: 3,
}

export function TaskList() {
  const { tasks, updateTask } = useTasks()
  const { openEdit } = useTaskDialog()
  const [query, setQuery] = React.useState("")
  const [status, setStatus] = React.useState<Status | "all">("all")
  const [priority, setPriority] = React.useState<Priority | "all">("all")
  const [sort, setSort] = React.useState<SortKey>("due")

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    const list = tasks.filter((t) => {
      if (status !== "all" && t.status !== status) return false
      if (priority !== "all" && t.priority !== priority) return false
      if (q) {
        const hay = `${t.title} ${t.description} ${t.project} ${t.tags.join(" ")}`
        if (!hay.toLowerCase().includes(q)) return false
      }
      return true
    })
    list.sort((a, b) => {
      if (sort === "priority")
        return PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority]
      if (sort === "created")
        return a.createdAt < b.createdAt ? 1 : -1
      // due: 마감 없는 항목은 뒤로
      if (!a.dueDate && !b.dueDate) return 0
      if (!a.dueDate) return 1
      if (!b.dueDate) return -1
      return a.dueDate < b.dueDate ? -1 : 1
    })
    return list
  }, [tasks, query, status, priority, sort])

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-44 flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="작업 검색…"
            className="pl-8"
          />
        </div>
        <Select
          value={status}
          onChange={(e) => setStatus(e.target.value as Status | "all")}
          className="w-32"
        >
          <option value="all">모든 상태</option>
          {STATUSES.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </Select>
        <Select
          value={priority}
          onChange={(e) => setPriority(e.target.value as Priority | "all")}
          className="w-28"
        >
          <option value="all">모든 우선순위</option>
          {PRIORITIES.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
        </Select>
        <Select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortKey)}
          className="w-32"
        >
          <option value="due">마감일순</option>
          <option value="priority">우선순위순</option>
          <option value="created">최신순</option>
        </Select>
      </div>

      <div className="overflow-hidden rounded-xl border">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-16 text-muted-foreground">
            <Inbox className="size-6" />
            <p className="text-sm">조건에 맞는 작업이 없습니다.</p>
          </div>
        ) : (
          <ul className="divide-y">
            {filtered.map((task) => (
              <TaskRow
                key={task.id}
                task={task}
                onToggle={() =>
                  updateTask(task.id, {
                    status: task.status === "done" ? "todo" : "done",
                  })
                }
                onOpen={() => openEdit(task)}
              />
            ))}
          </ul>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        {filtered.length}개 작업
      </p>
    </div>
  )
}

function TaskRow({
  task,
  onToggle,
  onOpen,
}: {
  task: Task
  onToggle: () => void
  onOpen: () => void
}) {
  const prio = priorityMeta(task.priority)
  const due = dueLabel(task.dueDate)
  const overdue =
    task.status !== "done" &&
    task.dueDate != null &&
    (daysUntil(task.dueDate) ?? 0) < 0
  const done = task.status === "done"

  return (
    <li className="flex items-center gap-3 px-3 py-2.5 hover:bg-muted/40">
      <button
        type="button"
        onClick={onToggle}
        aria-label={done ? "미완료로 표시" : "완료로 표시"}
        className={cn(
          "flex size-5 shrink-0 items-center justify-center rounded-full border transition-colors",
          done
            ? "border-primary bg-primary text-primary-foreground"
            : "border-muted-foreground/40 hover:border-primary"
        )}
      >
        {done ? <Check className="size-3" /> : null}
      </button>

      <button
        type="button"
        onClick={onOpen}
        className="min-w-0 flex-1 text-left"
      >
        <p
          className={cn(
            "truncate text-sm font-medium",
            done && "text-muted-foreground line-through"
          )}
        >
          {task.title}
        </p>
        <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
          <Badge variant="muted" className="text-[10px]">
            {statusLabel(task.status)}
          </Badge>
          {task.project ? (
            <span className="text-xs text-muted-foreground">{task.project}</span>
          ) : null}
        </div>
      </button>

      {due ? (
        <span
          className={cn(
            "hidden shrink-0 text-xs sm:block",
            overdue ? "font-medium text-destructive" : "text-muted-foreground"
          )}
        >
          {due}
        </span>
      ) : null}
      <Badge className={cn(prio.className, "shrink-0")}>{prio.label}</Badge>
    </li>
  )
}
