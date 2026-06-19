"use client"

import * as React from "react"

import type { Status, Task } from "@/lib/types"
import { seedTasks } from "@/lib/seed"

const STORAGE_KEY = "myapp.tasks.v1"

/** 새 작업 생성 시 채워야 하는 필드 (자동 생성 필드 제외) */
export type TaskDraft = Omit<Task, "id" | "order" | "createdAt" | "completedAt">

/**
 * localStorage를 단일 진실 공급원으로 쓰는 외부 스토어.
 * useSyncExternalStore로 구독하여 SSR 하이드레이션 불일치와
 * effect 내 setState(lint react-hooks/set-state-in-effect)를 모두 피한다.
 */
interface Snapshot {
  tasks: Task[]
  hydrated: boolean
}

const serverSnapshot: Snapshot = { tasks: seedTasks, hydrated: false }
let snapshot: Snapshot = serverSnapshot
let initialized = false
const listeners = new Set<() => void>()

function genId(): string {
  return `t-${Math.random().toString(36).slice(2, 10)}-${Date.now().toString(36)}`
}

function loadFromStorage(): Task[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return seedTasks
    const parsed = JSON.parse(raw) as Task[]
    return Array.isArray(parsed) ? parsed : seedTasks
  } catch {
    return seedTasks
  }
}

function persist() {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot.tasks))
  } catch {
    // 저장 실패(용량 초과 등)는 무시
  }
}

function emit() {
  for (const l of listeners) l()
}

/** 클라이언트에서 최초 1회 localStorage 로드 */
function ensureInit() {
  if (initialized || typeof window === "undefined") return
  initialized = true
  snapshot = { tasks: loadFromStorage(), hydrated: true }
}

function setTasks(updater: (prev: Task[]) => Task[]) {
  snapshot = { tasks: updater(snapshot.tasks), hydrated: true }
  persist()
  emit()
}

function subscribe(listener: () => void) {
  ensureInit()
  listeners.add(listener)
  // 다른 탭에서의 변경 동기화
  function onStorage(e: StorageEvent) {
    if (e.key !== STORAGE_KEY) return
    snapshot = { tasks: loadFromStorage(), hydrated: true }
    emit()
  }
  window.addEventListener("storage", onStorage)
  return () => {
    listeners.delete(listener)
    window.removeEventListener("storage", onStorage)
  }
}

function getSnapshot(): Snapshot {
  ensureInit()
  return snapshot
}

function getServerSnapshot(): Snapshot {
  return serverSnapshot
}

// --- 변경 연산 ---

function addTask(draft: TaskDraft) {
  setTasks((prev) => {
    const sameColumn = prev.filter((t) => t.status === draft.status)
    const order =
      sameColumn.length === 0
        ? 0
        : Math.max(...sameColumn.map((t) => t.order)) + 1
    const task: Task = {
      ...draft,
      id: genId(),
      order,
      createdAt: new Date().toISOString(),
      completedAt: draft.status === "done" ? new Date().toISOString() : null,
    }
    return [...prev, task]
  })
}

function updateTask(id: string, patch: Partial<Task>) {
  setTasks((prev) =>
    prev.map((t) => {
      if (t.id !== id) return t
      const next = { ...t, ...patch }
      if (patch.status && patch.status !== t.status) {
        next.completedAt =
          patch.status === "done" ? new Date().toISOString() : null
      }
      return next
    })
  )
}

function deleteTask(id: string) {
  setTasks((prev) => prev.filter((t) => t.id !== id))
}

function moveTask(id: string, status: Status, order: number) {
  setTasks((prev) =>
    prev.map((t) => {
      if (t.id !== id) return t
      const next = { ...t, status, order }
      if (status !== t.status) {
        next.completedAt = status === "done" ? new Date().toISOString() : null
      }
      return next
    })
  )
}

function resetSeed() {
  setTasks(() => seedTasks)
}

/** Provider는 의미상 경계만 제공 (스토어는 모듈 레벨) */
export function TasksProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

export function useTasks() {
  const snap = React.useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  )

  return React.useMemo(
    () => ({
      tasks: snap.tasks,
      hydrated: snap.hydrated,
      addTask,
      updateTask,
      deleteTask,
      moveTask,
      resetSeed,
    }),
    [snap]
  )
}
