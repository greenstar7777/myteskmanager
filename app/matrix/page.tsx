import { EisenhowerMatrix } from "@/components/matrix/eisenhower-matrix"

export default function MatrixPage() {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        아이젠하워 매트릭스 — 긴급도와 중요도에 따라 작업을 분류해 무엇에 먼저
        집중할지 결정하세요. 카드를 끌어다 분면을 바꿀 수 있습니다.
      </p>
      <EisenhowerMatrix />
    </div>
  )
}
