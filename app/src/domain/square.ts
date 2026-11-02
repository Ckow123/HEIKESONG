/** 广场四类构想：本阶段仅类别元数据与入口，不创建完整社区内容。 */
export type SquareCategoryKey = 'laoren' | 'ceping_map' | 'tucao' | 'qiuzhu'

export interface SquareCategory {
  key: SquareCategoryKey
  label: string
  description: string
  status: 'planned'
}

export const SQUARE_CATEGORIES: SquareCategory[] = [
  { key: 'laoren', label: '捞人', description: '寻找校园里的有缘人，仅支持当事人自愿认领', status: 'planned' },
  { key: 'ceping_map', label: '测评地图', description: '校园周边地点体验分享：食堂、自习室、运动场', status: 'planned' },
  { key: 'tucao', label: '吐槽', description: '分享校园生活中的小烦恼与大感受', status: 'planned' },
  { key: 'qiuzhu', label: '求助帖', description: '学习、生活与校园事务，一起出主意、找经验', status: 'planned' },
]
