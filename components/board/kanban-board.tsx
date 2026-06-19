"use client"

import * as React from "react"
import { Plus } from "lucide-react"

import type { Status, Task } from "@/lib/types"
import { STATUSES } from "@/lib/types"
import { useTasks } from "@/lib/tasks-context"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { TaskCard } from "@/components/task-card"
import { useTaskDialog } from "@/components/task-dialog"

const COLUMN_ACCENT: Record<Status, string> = {
  backlog: "bg-muted-foreground/40",
  todo: "bg-chart-2",
  in_progress: "bg-chart-1",
  done: "bg-primary",
}

export function KanbanBoard() {
  const { tasks, moveTask } = useTasks()
  const { openNew } = useTaskDialog()
  const [draggingId, setDraggingId] = React.useState<string | null>(null)
  const [overColumn, setOverColumn] = React.useState<Status | null>(null)

  const byColumn = React.useMemo(() => {
    const map: Record<Status, Task[]> = {
      backlog: [],
      todo: [],
      in_progress: [],
      done: [],
    }
    for (const t of tasks) map[t.status].push(t)
    for (const key of Object.keys(map) as Status[]) {
      map[key].sort((a, b) => a.order - b.order)
    }
    return map
  }, [tasks])

  function handleDrop(status: Status, index: number) {
    if (!draggingId) return
    const column = byColumn[status].filter((t) => t.id !== draggingId)
    const before = column[index - 1]
    const after = column[index]
    let order: number
    if (!before && !after) order = 0
    else if (!before) order = after.order - 1
    else if (!after) order = before.order + 1
    else order = (before.order + after.order) / 2
    moveTask(draggingId, status, order)
    setDraggingId(null)
    setOverColumn(null)
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {STATUSES.map((col) => {
        const items = byColumn[col.id]
        return (
          <div
            key={col.id}
            onDragOver={(e) => {
              e.preventDefault()
              setOverColumn(col.id)
            }}
            onDragLeave={(e) => {
              // 컬럼 밖으로 나갈 때만 해제
              if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                setOverColumn((c) => (c === col.id ? null : c))
              }
            }}
            onDrop={() => handleDrop(col.id, items.filter((t) => t.id !== draggingId).length)}
            className={cn(
              "flex w-72 shrink-0 flex-col rounded-xl border bg-muted/30 transition-colors",
              overColumn === col.id && "border-ring/50 bg-accent/40"
            )}
          >
            <div className="flex items-center gap-2 px-3 py-2.5">
              <span
                className={cn("size-2 rounded-full", COLUMN_ACCENT[col.id])}
              />
              <span className="text-sm font-semibold">{col.label}</span>
              <span className="text-xs text-muted-foreground">
                {items.length}
              </span>
              <Button
                variant="ghost"
                size="icon-xs"
                className="ml-auto"
                onClick={() => openNew({ status: col.id })}
                aria-label={`${col.label}에 작업 추가`}
              >
                <Plus />
              </Button>
            </div>

            <div className="flex min-h-24 flex-1 flex-col gap-2 px-2 pb-2">
              {items.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  draggable
                  onDragStart={() => setDraggingId(task.id)}
                  onDragEnd={() => {
                    setDraggingId(null)
                    setOverColumn(null)
                  }}
                />
              ))}
              {items.length === 0 ? (
                <p className="px-2 py-6 text-center text-xs text-muted-foreground">
                  작업을 끌어다 놓으세요
                </p>
              ) : null}
            </div>
          </div>
        )
      })}
    </div>
  )
}
