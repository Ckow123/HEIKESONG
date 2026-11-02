import type { DemoState } from '../state'
import { createInitialState } from '../state'

/**
 * 数据适配层接口：内存与 localStorage 实现保持一致，
 * 未来可替换为真实后端接口（需团队另行决定）。
 */
export interface DataAdapter {
  load(): DemoState
  save(state: DemoState): void
  reset(): DemoState
}

/** 内存实现：刷新即重置（保留作对照与测试用）。 */
export const memoryAdapter: DataAdapter = (() => {
  let state = createInitialState()
  return {
    load: () => state,
    save: (next) => {
      state = next
    },
    reset: () => {
      state = createInitialState()
      return state
    },
  }
})()
