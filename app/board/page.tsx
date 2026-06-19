import { KanbanBoard } from "@/components/board/kanban-board"

export default function BoardPage() {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        작업을 끌어다 놓아 상태를 바꾸세요. 카드를 클릭하면 편집할 수 있습니다.
      </p>
      <KanbanBoard />
    </div>
  )
}
