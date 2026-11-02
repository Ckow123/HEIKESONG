import type { PortraitId } from './portrait'

/** 星云投影：从公开资料派生，不保存独立缓存，未公开/已撤回用户不出现。 */
export interface NebulaProjection {
  portraitId: PortraitId
  displayLabel: string
  tags: string[]
  /** 示例坐标（0~100 百分比），仅为演示排布 */
  positionHint?: { x: number; y: number }
}
