import type { Task } from "@/lib/types"

/** 오늘 기준 상대 날짜를 ISO(YYYY-MM-DD)로 반환 */
function dayOffset(days: number): string {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

function isoOffset(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString()
}

/** 최초 실행 시 채워지는 예시 데이터 */
export const seedTasks: Task[] = [
  {
    id: "seed-1",
    title: "분기 목표(OKR) 정리",
    description: "이번 분기 개인 목표를 OKR 형식으로 작성하고 핵심 결과 3개를 정의한다.",
    status: "in_progress",
    priority: "high",
    dueDate: dayOffset(2),
    project: "성장",
    tags: ["계획", "OKR"],
    estimate: 3,
    eisenhower: { urgent: false, important: true },
    order: 0,
    createdAt: isoOffset(-5),
    completedAt: null,
  },
  {
    id: "seed-2",
    title: "세금 신고 서류 제출",
    description: "마감 전에 필요한 서류를 모아 제출한다.",
    status: "todo",
    priority: "urgent",
    dueDate: dayOffset(1),
    project: "행정",
    tags: ["마감"],
    estimate: 2,
    eisenhower: { urgent: true, important: true },
    order: 0,
    createdAt: isoOffset(-3),
    completedAt: null,
  },
  {
    id: "seed-3",
    title: "사이드 프로젝트 리팩터링",
    description: "컴포넌트 구조를 정리하고 테스트를 추가한다.",
    status: "backlog",
    priority: "medium",
    dueDate: dayOffset(10),
    project: "사이드 프로젝트",
    tags: ["개발"],
    estimate: 8,
    eisenhower: { urgent: false, important: true },
    order: 0,
    createdAt: isoOffset(-2),
    completedAt: null,
  },
  {
    id: "seed-4",
    title: "이메일 정리 및 답장",
    description: "받은편지함을 비우고 우선순위 높은 메일에 답장한다.",
    status: "todo",
    priority: "low",
    dueDate: dayOffset(0),
    project: "행정",
    tags: ["루틴"],
    estimate: 1,
    eisenhower: { urgent: true, important: false },
    order: 1,
    createdAt: isoOffset(-1),
    completedAt: null,
  },
  {
    id: "seed-5",
    title: "운동 루틴 설계",
    description: "주 3회 운동 계획을 세운다.",
    status: "done",
    priority: "medium",
    dueDate: dayOffset(-1),
    project: "건강",
    tags: ["습관"],
    estimate: 1,
    eisenhower: { urgent: false, important: true },
    order: 0,
    createdAt: isoOffset(-8),
    completedAt: isoOffset(-1),
  },
  {
    id: "seed-6",
    title: "독서 - '딥 워크' 2장",
    description: "집중력에 관한 챕터를 읽고 메모를 남긴다.",
    status: "done",
    priority: "low",
    dueDate: dayOffset(-3),
    project: "성장",
    tags: ["독서"],
    estimate: 2,
    eisenhower: { urgent: false, important: false },
    order: 1,
    createdAt: isoOffset(-10),
    completedAt: isoOffset(-3),
  },
  {
    id: "seed-7",
    title: "주간 회고 작성",
    description: "이번 주 한 일과 배운 점을 정리한다.",
    status: "todo",
    priority: "medium",
    dueDate: dayOffset(3),
    project: "성장",
    tags: ["회고", "루틴"],
    estimate: 1,
    eisenhower: { urgent: false, important: true },
    order: 2,
    createdAt: isoOffset(-1),
    completedAt: null,
  },
  {
    id: "seed-8",
    title: "친구 생일 선물 준비",
    description: "선물을 고르고 주문한다.",
    status: "backlog",
    priority: "low",
    dueDate: dayOffset(6),
    project: "개인",
    tags: [],
    estimate: 1,
    eisenhower: { urgent: true, important: false },
    order: 1,
    createdAt: isoOffset(-2),
    completedAt: null,
  },
]
