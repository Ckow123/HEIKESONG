import type {
  Activity,
  Conversation,
  DemoIdentity,
  Enrollment,
  InteractionAccess,
  Invitation,
  Portrait,
} from '@/domain'

/**
 * 合成演示数据。全部人物、活动、邀请均为虚构样例，
 * 不包含真实照片、联系方式或现实师生身份。
 *
 * B1 / P0-01（Gate B 决策 1，Owner 已批准）：固定合成 fixtures 允许
 * 根据明确的原始种子建立独立可信 publicSnapshot；旧 localStorage 中
 * 无快照的公开资料不享受此待遇（不得伪造历史快照），由投影层暂停展示。
 */

/** 为公开的种子 Portrait 建立与原始种子一致的可信公开快照 */
function withSeedSnapshot(p: Portrait): Portrait {
  if (!p.isPublic) return p
  return {
    ...p,
    publicSnapshot: {
      portraitId: p.id,
      nickname: p.nickname,
      interestTags: [...p.interestTags],
      socialIntents: [...p.socialIntents],
      bio: p.bio,
      mbti: p.mbti,
      zodiac: p.zodiac,
      relationshipStatus: p.relationshipStatus,
    },
  }
}

/** 当前演示身份（"我"）：初始未创建 Portrait，符合 DEC-002「先浏览」。 */
export const CURRENT_USER: DemoIdentity = {
  id: 'me',
  displayName: '我（演示身份）',
  isDemoContext: true,
}

export const DEMO_IDENTITIES: DemoIdentity[] = [
  CURRENT_USER,
  { id: 'u-lin', displayName: '林间风', isDemoContext: true },
  { id: 'u-you', displayName: '阿柚', isDemoContext: true },
  { id: 'u-xia', displayName: '夏一川', isDemoContext: true },
  { id: 'u-bo', displayName: '薄荷', isDemoContext: true },
  { id: 'u-xing', displayName: '星野', isDemoContext: true },
  { id: 'u-yun', displayName: '云栖', isDemoContext: true },
  { id: 'u-qian', displayName: '千屿', isDemoContext: true },
  { id: 'u-yizhou', displayName: '一舟', isDemoContext: true },
  { id: 'u-jiang', displayName: '江屿', isDemoContext: true },
  { id: 'u-muzi', displayName: '木子', isDemoContext: true },
  { id: 'u-wanfeng', displayName: '晚风', isDemoContext: true },
  { id: 'u-zhiwan', displayName: '知晚', isDemoContext: true },
  { id: 'u-luming', displayName: '鹿鸣', isDemoContext: true },
  { id: 'u-yuyuan', displayName: '芋圆', isDemoContext: true },
  { id: 'u-qingye', displayName: '青野', isDemoContext: true },
  { id: 'u-zhizi', displayName: '栀子', isDemoContext: true },
]

const t = (s: string) => s

export const DEMO_PORTRAITS: Portrait[] = ([
  {
    id: 'p-lin',
    ownerId: 'u-lin',
    nickname: '林间风',
    interestTags: ['羽毛球', '编程', '电影', '摄影'],
    socialIntents: ['交朋友', '活动搭子'],
    bio: '喜欢在代码、球场和电影院之间切换，也喜欢和有想法的人一起探索更多可能。',
    mbti: 'INTP',
    zodiac: '水瓶座',
    relationshipStatus: 'in_relationship',
    isPublic: true,
    updatedAt: t('2026-11-01T10:00:00+08:00'),
  },
  {
    id: 'p-you',
    ownerId: 'u-you',
    nickname: '阿柚',
    interestTags: ['阅读', '心理学', '自习', '播客'],
    socialIntents: ['学习搭子', '交朋友'],
    bio: '喜欢心理学、阅读和一起自习的氛围，也想认识更多真诚、有想法的朋友。',
    mbti: 'INFJ',
    zodiac: '天秤座',
    isPublic: true,
    updatedAt: t('2026-11-01T10:05:00+08:00'),
  },
  {
    id: 'p-xia',
    ownerId: 'u-xia',
    nickname: '夏一川',
    interestTags: ['英语交流', '辩论', '旅行'],
    socialIntents: ['英语口语搭子', '比赛队友'],
    bio: '英语爱好者，喜欢交流和分享不同文化，也在找比赛组队和项目合作的小伙伴。',
    mbti: 'ENFP',
    zodiac: '双子座',
    isPublic: true,
    updatedAt: t('2026-11-01T10:10:00+08:00'),
  },
  {
    id: 'p-bo',
    ownerId: 'u-bo',
    nickname: '薄荷',
    interestTags: ['跑步', '美食'],
    socialIntents: ['活动搭子'],
    isPublic: true,
    updatedAt: t('2026-11-01T10:15:00+08:00'),
  },
  {
    id: 'p-xing',
    ownerId: 'u-xing',
    nickname: '星野',
    interestTags: ['电影', '音乐'],
    socialIntents: ['交朋友'],
    isPublic: true,
    updatedAt: t('2026-11-01T10:20:00+08:00'),
  },
  {
    id: 'p-yun',
    ownerId: 'u-yun',
    nickname: '云栖',
    interestTags: ['羽毛球', '徒步'],
    socialIntents: ['活动搭子'],
    isPublic: true,
    updatedAt: t('2026-11-01T10:25:00+08:00'),
  },
  {
    id: 'p-qian',
    ownerId: 'u-qian',
    nickname: '千屿',
    interestTags: ['篮球', '游戏'],
    socialIntents: ['交朋友', '活动搭子'],
    isPublic: true,
    updatedAt: t('2026-11-01T10:30:00+08:00'),
  },
  {
    id: 'p-jiang',
    ownerId: 'u-jiang',
    nickname: '江屿',
    interestTags: ['科研', 'AI', '论文'],
    socialIntents: ['学习搭子', '比赛队友'],
    bio: '医学院影像方向在读，对 AI 辅助诊断很感兴趣，想找一起做项目的伙伴。',
    mbti: 'INTJ',
    zodiac: '摩羯座',
    isPublic: true,
    updatedAt: t('2026-11-01T10:32:00+08:00'),
  },
  {
    id: 'p-muzi',
    ownerId: 'u-muzi',
    nickname: '木子',
    interestTags: ['绘画', '设计', '手账'],
    socialIntents: ['交朋友'],
    bio: '课余时间画水彩和做手账，想认识同样喜欢记录生活的朋友。',
    mbti: 'INFP',
    zodiac: '双鱼座',
    isPublic: true,
    updatedAt: t('2026-11-01T10:33:00+08:00'),
  },
  {
    id: 'p-wanfeng',
    ownerId: 'u-wanfeng',
    nickname: '晚风',
    interestTags: ['写作', '电影', '影评'],
    socialIntents: ['交朋友'],
    bio: '写点短篇和影评，相信文字和影像都能让人互相理解。',
    isPublic: true,
    updatedAt: t('2026-11-01T10:34:00+08:00'),
  },
  {
    // 情境四：撤回公开后仍有互动（报名保留）的合成用户
    id: 'p-yizhou',
    ownerId: 'u-yizhou',
    nickname: '一舟',
    interestTags: ['比赛', '开发'],
    socialIntents: ['比赛队友'],
    bio: '在准备校内黑客松，想找对 AI 和校园服务方向感兴趣的队友。',
    isPublic: false,
    updatedAt: t('2026-11-01T10:35:00+08:00'),
  },
  {
    id: 'p-zhiwan',
    ownerId: 'u-zhiwan',
    nickname: '知晚',
    interestTags: ['自习', '备考', '咖啡'],
    socialIntents: ['学习搭子'],
    bio: '期末常驻图书馆，相信一起自习比独自硬撑更高效。',
    isPublic: true,
    updatedAt: t('2026-11-01T10:36:00+08:00'),
  },
  {
    id: 'p-luming',
    ownerId: 'u-luming',
    nickname: '鹿鸣',
    interestTags: ['播客', '阅读', '心理学'],
    socialIntents: ['交朋友', '学习搭子'],
    bio: '通勤路上听播客，周末泡书店，最近在读社会心理学。',
    mbti: 'INFJ',
    zodiac: '巨蟹座',
    isPublic: true,
    updatedAt: t('2026-11-01T10:37:00+08:00'),
  },
  {
    id: 'p-yuyuan',
    ownerId: 'u-yuyuan',
    nickname: '芋圆',
    interestTags: ['摄影', '旅行', '徒步'],
    socialIntents: ['活动搭子', '交朋友'],
    bio: '喜欢背着相机到处走，拍校园和旅行中的风景。',
    mbti: 'ENFP',
    zodiac: '射手座',
    isPublic: true,
    updatedAt: t('2026-11-01T10:38:00+08:00'),
  },
  {
    id: 'p-qingye',
    ownerId: 'u-qingye',
    nickname: '青野',
    interestTags: ['英语交流', '演讲', '辩论'],
    socialIntents: ['英语口语搭子', '比赛队友'],
    bio: '在准备英语演讲比赛，想找一起练口语和打磨稿子的搭档。',
    isPublic: true,
    updatedAt: t('2026-11-01T10:39:00+08:00'),
  },
  {
    id: 'p-zhizi',
    ownerId: 'u-zhizi',
    nickname: '栀子',
    interestTags: ['音乐', '唱歌', '吉他'],
    socialIntents: ['交朋友', '活动搭子'],
    bio: '吉他社成员，喜欢弹唱和现场音乐，想找一起排练的小伙伴。',
    isPublic: true,
    updatedAt: t('2026-11-01T10:40:00+08:00'),
  },
] as Portrait[]).map(withSeedSnapshot)

export const DEMO_ACTIVITIES: Activity[] = [
  {
    id: 'a-badminton',
    title: '羽毛球 · 校园约球局',
    description: '周末一起打羽毛球！欢迎不同水平的同学，一起运动、放松、认识新朋友。',
    interestCategory: '运动',
    timeText: '3月9日（周六）14:00 – 16:00',
    locationText: '东区体育馆 · 羽毛球馆',
    organizerId: 'u-you',
    capacityText: '8 / 12 人',
  },
  {
    id: 'a-study',
    title: '图书馆自习 · 一起高效学习',
    description: '期末冲刺！寻找自习搭子，一起制定计划、互相监督、专注高效。',
    interestCategory: '学习',
    timeText: '3月10日（周日）19:00 – 22:00',
    locationText: '中心图书馆 · 3层自习区',
    organizerId: 'u-lin',
    capacityText: '6 / 10 人',
  },
  {
    id: 'a-english',
    title: '英语交流 · English Chat',
    description: '每周一次的英语交流角！围绕校园生活、电影、旅行等轻松话题，练口语、交朋友。',
    interestCategory: '语言',
    timeText: '3月11日（周一）18:30 – 20:00',
    locationText: '学活中心 · 交流室 B',
    organizerId: 'u-xia',
    capacityText: '12 / 20 人',
  },
  {
    id: 'a-hackathon',
    title: '比赛组队 · 校园程序设计赛',
    description: '校内比赛来了！寻找对 AI、校园服务等方向感兴趣的队友，一起参赛。',
    interestCategory: '比赛',
    timeText: '3月15日（周五）13:00 – 18:00',
    locationText: '信息楼 · 402 讨论室',
    organizerId: 'u-qian',
    capacityText: '4 / 6 人',
  },
]

/** 邀请样例：一条待处理（发给"我"）、一条已接受（开启会话）。 */
export const DEMO_INVITATIONS: Invitation[] = [
  {
    id: 'inv-1',
    fromId: 'u-xia',
    toId: 'me',
    status: 'pending',
    greetingText: '你好！看到你也喜欢英语交流，想认识一下，一起练口语～',
    basicSnapshot: {
      portraitId: 'p-xia',
      nickname: '夏一川',
      interestTags: ['英语交流', '辩论', '旅行'],
      socialIntents: ['英语口语搭子', '比赛队友'],
    },
    createdAt: t('2026-11-01T11:00:00+08:00'),
  },
  {
    id: 'inv-2',
    fromId: 'u-lin',
    toId: 'me',
    status: 'accepted',
    conversationId: 'conv-1',
    greetingText: '你好！喜欢你的兴趣标签，想认识一下～',
    basicSnapshot: {
      portraitId: 'p-lin',
      nickname: '林间风',
      interestTags: ['羽毛球', '编程', '电影', '摄影'],
      socialIntents: ['交朋友', '活动搭子'],
    },
    createdAt: t('2026-10-30T09:00:00+08:00'),
  },
]

export const DEMO_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv-1',
    invitationId: 'inv-2',
    participantIds: ['u-lin', 'me'],
    demoMessages: [
      { senderId: 'u-lin', text: '上次提到的那本书我也想看看～', sentAt: t('2026-11-01T09:00:00+08:00') },
      { senderId: 'me', text: '好呀，周末羽毛球局你也来吗？', sentAt: t('2026-11-01T09:05:00+08:00') },
    ],
  },
]

/** 已有报名样例：一舟（已撤回公开）报名仍保留，组织者千屿可查看其基础 Portrait。 */
export const DEMO_ENROLLMENTS: Enrollment[] = [
  {
    id: 'enr-1',
    activityId: 'a-hackathon',
    enrolleeId: 'u-yizhou',
    organizerId: 'u-qian',
    status: 'pending',
    basicSnapshot: {
      portraitId: 'p-yizhou',
      nickname: '一舟',
      interestTags: ['比赛', '开发'],
      socialIntents: ['比赛队友'],
    },
    createdAt: t('2026-11-01T12:00:00+08:00'),
  },
]

export const DEMO_INTERACTION_ACCESS: InteractionAccess[] = [
  { id: 'ia-1', portraitId: 'p-yizhou', viewerId: 'u-qian', source: { kind: 'enrollment', refId: 'enr-1' } },
  { id: 'ia-2', portraitId: 'p-xia', viewerId: 'me', source: { kind: 'invitation', refId: 'inv-1' } },
  { id: 'ia-3', portraitId: 'p-lin', viewerId: 'me', source: { kind: 'conversation', refId: 'conv-1' } },
]
