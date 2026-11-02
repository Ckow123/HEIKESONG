import type { DemoState } from '../state'
import { createInitialState } from '../state'
import type { DataAdapter } from './memoryAdapter'

const STORAGE_KEY = 'tongpin-campus-v1'

/**
 * localStorage 实现（用户已确认的第一阶段方案）：
 * 刷新/重开浏览器后状态保留；仅当前浏览器上下文有效，
 * 不是跨设备联机，运行说明中必须如实标注。
 */
export const storageAdapter: DataAdapter = {
  load: () => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (raw) return JSON.parse(raw) as DemoState
    } catch {
      // 存储不可用或数据损坏时回落到初始样例
    }
    return createInitialState()
  },
  save: (state) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      // 存储失败时保持内存态，不阻断演示
    }
  },
  reset: () => {
    try {
      window.localStorage.removeItem(STORAGE_KEY)
    } catch {
      // ignore
    }
    return createInitialState()
  },
}
