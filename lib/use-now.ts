"use client"

import { useSyncExternalStore } from "react"

/**
 * 현재 시각(epoch ms)을 1초마다 갱신해 반환하는 훅.
 *
 * useSyncExternalStore로 구현해 SSR 하이드레이션 불일치(서버=UTC vs
 * 브라우저=로컬 타임존)와 effect 내 setState(lint) 문제를 모두 피한다.
 * 서버 스냅샷은 0을 반환하므로, 컴포넌트는 0일 때 자리표시자를 렌더하면 된다.
 */

let cached = 0

function subscribe(callback: () => void) {
  const id = setInterval(callback, 1000)
  return () => clearInterval(id)
}

function getSnapshot() {
  const t = Date.now()
  // 같은 '초' 동안에는 동일한 참조를 반환해 불필요한 리렌더를 막는다.
  if (Math.floor(t / 1000) !== Math.floor(cached / 1000)) {
    cached = t
  }
  return cached
}

function getServerSnapshot() {
  return 0
}

export function useNow(): number {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
