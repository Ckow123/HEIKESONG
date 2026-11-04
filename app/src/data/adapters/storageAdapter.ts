import type { DemoState } from '../state'
import { createInitialState } from '../state'
import {
  B1_BACKUP_KEY,
  clearMigrationArtifacts,
  migrateDuplicatePortraitIds,
  writeMigrationConflicts,
} from '../migrations/b1Legacy'
import type { DataAdapter } from './memoryAdapter'

const STORAGE_KEY = 'tongpin-campus-v1'

/**
 * localStorage 实现（用户已确认的第一阶段方案）：
 * 刷新/重开浏览器后状态保留；仅当前浏览器上下文有效，
 * 不是跨设备联机，运行说明中必须如实标注。
 *
 * B1 / P0-04：加载时检测历史重复 Portrait ID。
 * 迁移前先把原始存储原文备份到 B1_BACKUP_KEY（仅首次，不覆盖）；
 * 仅归属唯一可判时做确定性迁移；歧义数据原样保留并写入冲突记录。
 */
export const storageAdapter: DataAdapter = {
  load: () => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as DemoState
        const { state, conflicts, changed } = migrateDuplicatePortraitIds(parsed)
        if (changed) {
          // 迁移前备份原始存储原文（只写一次，保留可审计恢复路径）
          if (!window.localStorage.getItem(B1_BACKUP_KEY)) {
            window.localStorage.setItem(B1_BACKUP_KEY, raw)
          }
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
        }
        writeMigrationConflicts(conflicts)
        return state
      }
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
      clearMigrationArtifacts()
    } catch {
      // ignore
    }
    return createInitialState()
  },
}
