/** 演示身份：仅用于合成数据演示，不等于真实账号/认证。 */
export type IdentityId = string

export interface DemoIdentity {
  id: IdentityId
  /** 合成显示名，不对应真实师生 */
  displayName: string
  /** 标明演示上下文，避免误认为真实账号体系 */
  isDemoContext: true
}
