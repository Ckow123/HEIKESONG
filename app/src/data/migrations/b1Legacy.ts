import type { DemoState } from '../state'

/**
 * B1 / P0-04 遗留数据迁移（Owner 已批准，Gate B 决策 3）：
 * - 迁移前由 storageAdapter 备份原始 localStorage（BACKUP_KEY，只写一次，不覆盖）；
 * - 仅当重复 ID 组内每条记录 owner 唯一可判、且所有引用归属可唯一解析时，
 *   才做确定性重 ID（`p-<ownerId>`）并同步修正引用；
 * - 存在歧义时不合并、不删除、不猜测：原样保留，并写入冲突记录（CONFLICTS_KEY），
 *   由界面提示人工恢复。
 */

export interface MigrationConflict {
  kind: 'duplicate_portrait_id'
  portraitId: string
  ownerIds: string[]
  reason: string
}

export const B1_BACKUP_KEY = 'tongpin-campus-v1-backup-b1'
const CONFLICTS_KEY = 'tongpin-campus-v1-conflicts'

export function readMigrationConflicts(): MigrationConflict[] {
  try {
    const raw = window.localStorage.getItem(CONFLICTS_KEY)
    return raw ? (JSON.parse(raw) as MigrationConflict[]) : []
  } catch {
    return []
  }
}

export function writeMigrationConflicts(conflicts: MigrationConflict[]): void {
  try {
    if (conflicts.length === 0) window.localStorage.removeItem(CONFLICTS_KEY)
    else window.localStorage.setItem(CONFLICTS_KEY, JSON.stringify(conflicts))
  } catch {
    // 存储不可用时静默跳过，不阻断演示
  }
}

export function clearMigrationArtifacts(): void {
  try {
    window.localStorage.removeItem(CONFLICTS_KEY)
  } catch {
    // ignore
  }
}

/** 为指定 owner 生成唯一稳定 Portrait ID；与既有他人记录冲突时追加确定性后缀 */
export function allocatePortraitId(state: DemoState, ownerId: string): string {
  const base = `p-${ownerId}`
  const takenByOther = state.portraits.some((p) => p.id === base && p.ownerId !== ownerId)
  if (!takenByOther) return base
  let n = 2
  while (state.portraits.some((p) => p.id === `${base}-${n}`)) n += 1
  return `${base}-${n}`
}

interface ReIdPlan {
  oldId: string
  ownerId: string
  newId: string
}

/**
 * 检测并确定性修复重复 Portrait ID。
 * 返回迁移后状态、冲突记录与是否有改动。歧义组不做任何改动。
 */
export function migrateDuplicatePortraitIds(state: DemoState): {
  state: DemoState
  conflicts: MigrationConflict[]
  changed: boolean
} {
  const byId = new Map<string, typeof state.portraits>()
  for (const p of state.portraits) {
    const list = byId.get(p.id) ?? []
    list.push(p)
    byId.set(p.id, list)
  }

  const conflicts: MigrationConflict[] = []
  const plans: ReIdPlan[] = []
  let changed = false

  for (const [id, group] of byId) {
    if (group.length <= 1) continue

    const ownerIds = group.map((p) => p.ownerId)
    const ownersValid = ownerIds.every((o) => typeof o === 'string' && o.trim().length > 0)
    const ownersUnique = new Set(ownerIds).size === ownerIds.length
    // 同一 owner 不得另有第二份 Portrait（否则归属歧义）
    const ownerCounts = new Map<string, number>()
    for (const p of state.portraits) ownerCounts.set(p.ownerId, (ownerCounts.get(p.ownerId) ?? 0) + 1)
    const ownersSingle = ownerIds.every((o) => ownerCounts.get(o) === 1)

    if (!ownersValid || !ownersUnique || !ownersSingle) {
      conflicts.push({
        kind: 'duplicate_portrait_id',
        portraitId: id,
        ownerIds,
        reason: 'owner 缺失、重复或同一 owner 持有多份记录，归属存在歧义，未自动迁移',
      })
      continue
    }

    // 引用归属解析：所有指向旧 id 的引用必须能唯一解析到组内某个 owner
    const groupOwners = new Set(ownerIds)
    const resolveRefOwners = (s: DemoState, oldId: string): { ok: boolean; map: Map<number, string> } => {
      const map = new Map<number, string>() // refIndex-encoded key → ownerId
      const ownerOfInvitation = (refId: string) => s.invitations.find((i) => i.id === refId)?.fromId
      const ownerOfEnrollment = (refId: string) => s.enrollments.find((e) => e.id === refId)?.enrolleeId
      const ownerOfConversation = (refId: string) => {
        const conv = s.conversations.find((c) => c.id === refId)
        return conv ? ownerOfInvitation(conv.invitationId) : undefined
      }
      s.interactionAccess.forEach((a, idx) => {
        if (a.portraitId !== oldId) return
        const owner =
          a.source.kind === 'invitation'
            ? ownerOfInvitation(a.source.refId)
            : a.source.kind === 'enrollment'
              ? ownerOfEnrollment(a.source.refId)
              : ownerOfConversation(a.source.refId)
        map.set(idx, owner ?? '')
      })
      return { ok: [...map.values()].every((o) => groupOwners.has(o)), map }
    }

    const accessResolution = resolveRefOwners(state, id)
    const invRefOk = state.invitations.every(
      (i) => i.basicSnapshot?.portraitId !== id || groupOwners.has(i.fromId),
    )
    const enrRefOk = state.enrollments.every(
      (e) => e.basicSnapshot?.portraitId !== id || groupOwners.has(e.enrolleeId),
    )

    if (!accessResolution.ok || !invRefOk || !enrRefOk) {
      conflicts.push({
        kind: 'duplicate_portrait_id',
        portraitId: id,
        ownerIds,
        reason: '存在无法唯一解析归属的引用（互动授权 / 邀请 / 报名快照），未自动迁移',
      })
      continue
    }

    // 确定性重 ID：按 (updatedAt, ownerId) 排序，首条保留原 id，其余分配 p-<ownerId>
    const sorted = [...group].sort((a, b) =>
      a.updatedAt === b.updatedAt ? a.ownerId.localeCompare(b.ownerId) : a.updatedAt.localeCompare(b.updatedAt),
    )
    const assigned = new Set(state.portraits.map((p) => p.id))
    sorted.forEach((p, idx) => {
      if (idx === 0) return // 保留原 id
      let newId = `p-${p.ownerId}`
      if (assigned.has(newId) && newId !== id) {
        let n = 2
        while (assigned.has(`${newId}-${n}`)) n += 1
        newId = `${newId}-${n}`
      }
      assigned.add(newId)
      plans.push({ oldId: id, ownerId: p.ownerId, newId })
    })
    changed = true
  }

  if (plans.length === 0) return { state, conflicts, changed }

  const newIdOf = (oldId: string, ownerId: string) =>
    plans.find((pl) => pl.oldId === oldId && pl.ownerId === ownerId)?.newId ?? oldId

  const next: DemoState = {
    ...state,
    portraits: state.portraits.map((p) => {
      const plan = plans.find((pl) => pl.oldId === p.id && pl.ownerId === p.ownerId)
      return plan ? { ...p, id: plan.newId } : p
    }),
    interactionAccess: state.interactionAccess.map((a) => {
      const portrait = state.portraits.find((p) => p.id === a.portraitId)
      if (!portrait) return a
      // 解析该授权指向的 owner（与上方 resolveRefOwners 同规则）
      const owner =
        a.source.kind === 'invitation'
          ? state.invitations.find((i) => i.id === a.source.refId)?.fromId
          : a.source.kind === 'enrollment'
            ? state.enrollments.find((e) => e.id === a.source.refId)?.enrolleeId
            : (() => {
                const conv = state.conversations.find((c) => c.id === a.source.refId)
                return conv ? state.invitations.find((i) => i.id === conv.invitationId)?.fromId : undefined
              })()
      return owner ? { ...a, portraitId: newIdOf(a.portraitId, owner) } : a
    }),
    invitations: state.invitations.map((i) =>
      i.basicSnapshot ? { ...i, basicSnapshot: { ...i.basicSnapshot, portraitId: newIdOf(i.basicSnapshot.portraitId, i.fromId) } } : i,
    ),
    enrollments: state.enrollments.map((e) =>
      e.basicSnapshot ? { ...e, basicSnapshot: { ...e.basicSnapshot, portraitId: newIdOf(e.basicSnapshot.portraitId, e.enrolleeId) } } : e,
    ),
  }

  return { state: next, conflicts, changed }
}
