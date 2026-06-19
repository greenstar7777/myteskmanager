"use client"

import { Calendar, Clock, GripVertical } from "lucide-react"

import type { Task } from "@/lib/types"
import { priorityMeta } from "@/lib/types"
import { cn } from "@/lib/utils"
import { dueLabel, daysUntil } from "@/lib/stats"
import { Badge } from "@/components/ui/badge"
import { useTaskDialog } from "@/components/task-dialog"

interface TaskCardProps {
  task: Task
  /** 드래그 핸들 표시 여부 (칸반에서 사용) */
  draggable?: boolean
  onDragStart?: (e: React.DragEvent) => void
  onDragEnd?: (e: React.DragEvent) => void
}

export function TaskCard({
  task,
  draggable,
  onDragStart,
  onDragEnd,
}: TaskCardProps) {
  const { openEdit } = useTaskDialog()
  const prio = priorityMeta(task.priority)
  const due = dueLabel(task.dueDate)
  const overdue =
    task.status !== "done" &&
    task.dueDate != null &&
    (daysUntil(task.dueDate) ?? 0) < 0

  return (
    <div
      draggable={draggable}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={() => openEdit(task)}
      className={cn(
        "group cursor-pointer rounded-lg border bg-card p-3 shadow-sm transition-colors hover:border-ring/50",
        draggable && "active:cursor-grabbing"
      )}
    >
      <div className="flex items-start gap-1.5">
        {draggable ? (
          <GripVertical className="mt-0.5 size-4 shrink-0 text-muted-foreground/40 group-hover:text-muted-foreground" />
        ) : null}
        <div className="min-w-0 flex-1">
          <p
            className={cn(
              "text-sm leading-snug font-medium",
              task.status === "done" && "text-muted-foreground line-through"
            )}
          >
            {task.title}
          </p>

          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <Badge className={prio.className}>{prio.label}</Badge>
            {task.project ? (
              <Badge variant="muted">{task.project}</Badge>
            ) : null}
            {task.tags.map((tag) => (
              <Badge key={tag} variant="outline">
                #{tag}
              </Badge>
            ))}
          </div>

          {(due || task.estimate > 0) && (
            <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
              {due ? (
                <span
                  className={cn(
                    "flex items-center gap-1",
                    overdue && "font-medium text-destructive"
                  )}
                >
                  <Calendar className="size-3" />
                  {due}
                </span>
              ) : null}
              {task.estimate > 0 ? (
                <span className="flex items-center gap-1">
                  <Clock className="size-3" />
                  {task.estimate}h
                </span>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
