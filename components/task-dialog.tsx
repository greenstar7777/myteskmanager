"use client"

import * as React from "react"
import { Trash2 } from "lucide-react"

import type { Priority, Status, Task } from "@/lib/types"
import { PRIORITIES, STATUSES } from "@/lib/types"
import { useTasks, type TaskDraft } from "@/lib/tasks-context"
import { Modal } from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

interface DialogState {
  /** 편집 대상 작업. null이면 새 작업 생성 */
  task: Task | null
  /** 새 작업의 초기 상태(컬럼) 지정용 */
  defaults?: Partial<TaskDraft>
}

interface TaskDialogContextValue {
  openNew: (defaults?: Partial<TaskDraft>) => void
  openEdit: (task: Task) => void
}

const TaskDialogContext = React.createContext<TaskDialogContextValue | null>(
  null
)

export function useTaskDialog() {
  const ctx = React.useContext(TaskDialogContext)
  if (!ctx) throw new Error("useTaskDialog must be used within TaskDialogProvider")
  return ctx
}

function emptyDraft(defaults?: Partial<TaskDraft>): TaskDraft {
  return {
    title: "",
    description: "",
    status: "todo",
    priority: "medium",
    dueDate: null,
    project: "",
    tags: [],
    estimate: 1,
    eisenhower: { urgent: false, important: false },
    ...defaults,
  }
}

export function TaskDialogProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<DialogState | null>(null)

  const openNew = React.useCallback((defaults?: Partial<TaskDraft>) => {
    setState({ task: null, defaults })
  }, [])
  const openEdit = React.useCallback((task: Task) => {
    setState({ task })
  }, [])

  const value = React.useMemo(() => ({ openNew, openEdit }), [openNew, openEdit])

  return (
    <TaskDialogContext value={value}>
      {children}
      {state ? (
        <TaskForm state={state} onClose={() => setState(null)} />
      ) : null}
    </TaskDialogContext>
  )
}

function TaskForm({
  state,
  onClose,
}: {
  state: DialogState
  onClose: () => void
}) {
  const { addTask, updateTask, deleteTask } = useTasks()
  const editing = state.task

  const [form, setForm] = React.useState<TaskDraft>(() =>
    editing
      ? {
          title: editing.title,
          description: editing.description,
          status: editing.status,
          priority: editing.priority,
          dueDate: editing.dueDate,
          project: editing.project,
          tags: editing.tags,
          estimate: editing.estimate,
          eisenhower: editing.eisenhower,
        }
      : emptyDraft(state.defaults)
  )
  const [tagsText, setTagsText] = React.useState(editing?.tags.join(", ") ?? "")

  function set<K extends keyof TaskDraft>(key: K, val: TaskDraft[K]) {
    setForm((f) => ({ ...f, [key]: val }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title.trim()) return
    const tags = tagsText
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean)
    const payload: TaskDraft = { ...form, title: form.title.trim(), tags }
    if (editing) {
      updateTask(editing.id, payload)
    } else {
      addTask(payload)
    }
    onClose()
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={editing ? "작업 편집" : "새 작업"}
      description="제목은 필수이며 나머지는 선택 사항입니다."
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <Label htmlFor="title">제목 *</Label>
          <Input
            id="title"
            autoFocus
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            placeholder="무엇을 해야 하나요?"
            required
          />
        </div>

        <div className="flex flex-col gap-1">
          <Label htmlFor="desc">설명</Label>
          <Textarea
            id="desc"
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            placeholder="세부 내용, 메모 등"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <Label htmlFor="status">상태</Label>
            <Select
              id="status"
              value={form.status}
              onChange={(e) => set("status", e.target.value as Status)}
            >
              {STATUSES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </Select>
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="priority">우선순위</Label>
            <Select
              id="priority"
              value={form.priority}
              onChange={(e) => set("priority", e.target.value as Priority)}
            >
              {PRIORITIES.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <Label htmlFor="due">마감일</Label>
            <Input
              id="due"
              type="date"
              value={form.dueDate ?? ""}
              onChange={(e) => set("dueDate", e.target.value || null)}
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="estimate">예상 시간(시간)</Label>
            <Input
              id="estimate"
              type="number"
              min={0}
              step={0.5}
              value={form.estimate}
              onChange={(e) => set("estimate", Number(e.target.value) || 0)}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <Label htmlFor="project">프로젝트</Label>
            <Input
              id="project"
              value={form.project}
              onChange={(e) => set("project", e.target.value)}
              placeholder="예: 성장, 행정"
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="tags">태그 (쉼표로 구분)</Label>
            <Input
              id="tags"
              value={tagsText}
              onChange={(e) => setTagsText(e.target.value)}
              placeholder="개발, 루틴"
            />
          </div>
        </div>

        <fieldset className="rounded-lg border p-3">
          <legend className="px-1 text-xs font-medium text-muted-foreground">
            아이젠하워 분류
          </legend>
          <div className="flex gap-5">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                className="size-4 accent-primary"
                checked={form.eisenhower.urgent}
                onChange={(e) =>
                  set("eisenhower", {
                    ...form.eisenhower,
                    urgent: e.target.checked,
                  })
                }
              />
              긴급함
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                className="size-4 accent-primary"
                checked={form.eisenhower.important}
                onChange={(e) =>
                  set("eisenhower", {
                    ...form.eisenhower,
                    important: e.target.checked,
                  })
                }
              />
              중요함
            </label>
          </div>
        </fieldset>

        <div className="mt-1 flex items-center justify-between">
          {editing ? (
            <Button
              type="button"
              variant="destructive"
              onClick={() => {
                deleteTask(editing.id)
                onClose()
              }}
            >
              <Trash2 />
              삭제
            </Button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              취소
            </Button>
            <Button type="submit">{editing ? "저장" : "추가"}</Button>
          </div>
        </div>
      </form>
    </Modal>
  )
}
