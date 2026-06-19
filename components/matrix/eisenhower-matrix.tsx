"use client"

import * as React from "react"

import type { Task } from "@/lib/types"
import { useTasks } from "@/lib/tasks-context"
import { cn } from "@/lib/utils"
import { TaskCard } from "@/components/task-card"

interface Quadrant {
  key: string
  title: string
  action: string
  urgent: boolean
  important: boolean
  className: string
  dot: string
}

const QUADRANTS: Quadrant[] = [
  {
    key: "do",
    title: "지금 하기",
    action: "긴급 · 중요",
    urgent: true,
    important: true,
    className: "border-destructive/30 bg-destructive/5",
    dot: "bg-destructive",
  },
  {
    key: "schedule",
    title: "계획하기",
    action: "중요 · 비긴급",
    urgent: false,
    important: true,
    className: "border-chart-1/30 bg-chart-1/5",
    dot: "bg-chart-1",
  },
  {
    key: "delegate",
    title: "빠르게 처리",
    action: "긴급 · 비중요",
    urgent: true,
    important: false,
    className: "border-chart-3/30 bg-chart-3/5",
    dot: "bg-chart-3",
  },
  {
    key: "eliminate",
    title: "줄이기 / 제거",
    action: "비긴급 · 비중요",
    urgent: false,
    important: false,
    className: "border-border bg-muted/30",
    dot: "bg-muted-foreground/50",
  },
]

export function EisenhowerMatrix() {
  const { tasks, updateTask } = useTasks()
  const [draggingId, setDraggingId] = React.useState<string | null>(null)
  const [overKey, setOverKey] = React.useState<string | null>(null)

  // 완료되지 않은 작업만 매트릭스에 표시
  const active = React.useMemo(
    () => tasks.filter((t) => t.status !== "done"),
    [tasks]
  )

  function tasksFor(q: Quadrant): Task[] {
    return active.filter(
      (t) =>
        t.eisenhower.urgent === q.urgent &&
        t.eisenhower.important === q.important
    )
  }

  function handleDrop(q: Quadrant) {
    if (!draggingId) return
    updateTask(draggingId, {
      eisenhower: { urgent: q.urgent, important: q.important },
    })
    setDraggingId(null)
    setOverKey(null)
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {QUADRANTS.map((q) => {
        const items = tasksFor(q)
        return (
          <div
            key={q.key}
            onDragOver={(e) => {
              e.preventDefault()
              setOverKey(q.key)
            }}
            onDragLeave={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                setOverKey((k) => (k === q.key ? null : k))
              }
            }}
            onDrop={() => handleDrop(q)}
            className={cn(
              "flex min-h-52 flex-col rounded-xl border p-3 transition-colors",
              q.className,
              overKey === q.key && "ring-2 ring-ring/50"
            )}
          >
            <div className="mb-3 flex items-center gap-2">
              <span className={cn("size-2.5 rounded-full", q.dot)} />
              <span className="text-sm font-semibold">{q.title}</span>
              <span className="text-xs text-muted-foreground">{q.action}</span>
              <span className="ml-auto text-xs text-muted-foreground">
                {items.length}
              </span>
            </div>
            <div className="flex flex-1 flex-col gap-2">
              {items.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  draggable
                  onDragStart={() => setDraggingId(task.id)}
                  onDragEnd={() => {
                    setDraggingId(null)
                    setOverKey(null)
                  }}
                />
              ))}
              {items.length === 0 ? (
                <p className="flex flex-1 items-center justify-center py-4 text-center text-xs text-muted-foreground">
                  여기로 작업을 끌어다 놓으세요
                </p>
              ) : null}
            </div>
          </div>
        )
      })}
    </div>
  )
}
