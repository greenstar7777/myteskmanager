"use client"

import * as React from "react"

import { TasksProvider } from "@/lib/tasks-context"
import { TaskDialogProvider } from "@/components/task-dialog"
import { AppSidebar } from "@/components/app-sidebar"
import { AppHeader } from "@/components/app-header"

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <TasksProvider>
      <TaskDialogProvider>
        <div className="flex min-h-svh">
          <AppSidebar />
          <div className="flex min-w-0 flex-1 flex-col">
            <AppHeader />
            <main className="flex-1 p-4 md:p-6">{children}</main>
          </div>
        </div>
      </TaskDialogProvider>
    </TasksProvider>
  )
}
