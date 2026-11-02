import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'

import { useData } from '@/data/DataProvider'
import type { PortraitDraft, RelationshipStatus } from '@/domain'
import { containsBannedContent } from '@/shared/lib/contentFilter'
import { Button } from '@/shared/ui/Button'
import { Card } from '@/shared/ui/Card'
import { PageHeader } from '@/shared/ui/PageHeader'
import { Tag } from '@/shared/ui/Tag'

const INTEREST_OPTIONS = ['羽毛球', '编程', '电影', '摄影', '阅读', '自习', '英语交流', '跑步', '音乐', '比赛', '游戏', '徒步']
const INTENT_OPTIONS = ['交朋友', '学习搭子', '英语口语搭子', '活动搭子', '比赛队友', '仅浏览']
const MBTI_OPTIONS = ['INTP', 'INFJ', 'ENFP', 'ENTP', 'INTJ', 'INFP', 'ENFJ', 'ENTJ', 'ISTP', 'ISFP', 'ESTP', 'ESFP', 'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ']
const ZODIAC_OPTIONS = ['水瓶座', '双鱼座', '白羊座', '金牛座', '双子座', '巨蟹座', '狮子座', '处女座', '天秤座', '天蝎座', '射手座', '摩羯座']

/**
 * P11 Portrait 编辑（T3）：
 * 必填 = 昵称 + ≥1 兴趣 + ≥1 社交意图（DEC-002.2）；其余选填；
 * 去预览 = 先保存（默认未公开/保留原公开状态）再进入 P12；预览不等于公开（DEC-002.3）。
 */
export default function PortraitEditPage() {
  const navigate = useNavigate()
  const { myPortrait, savePortrait } = useData()

  const [nickname, setNickname] = useState(myPortrait?.nickname ?? '')
  const [interests, setInterests] = useState<string[]>(myPortrait?.interestTags ?? [])
  const [intents, setIntents] = useState<string[]>(myPortrait?.socialIntents ?? [])
  const [bio, setBio] = useState(myPortrait?.bio ?? '')
  const [mbti, setMbti] = useState(myPortrait?.mbti ?? '')
  const [zodiac, setZodiac] = useState(myPortrait?.zodiac ?? '')
  const [relationship, setRelationship] = useState<RelationshipStatus>(myPortrait?.relationshipStatus ?? 'undisclosed')
  const [errors, setErrors] = useState<string[]>([])

  const toggle = (list: string[], setList: (v: string[]) => void, value: string) => {
    setList(list.includes(value) ? list.filter((x) => x !== value) : [...list, value])
  }

  const buildDraft = (): PortraitDraft => ({
    nickname,
    interestTags: interests,
    socialIntents: intents,
    bio,
    mbti: mbti || undefined,
    zodiac: zodiac || undefined,
    relationshipStatus: relationship,
  })

  const validate = (): boolean => {
    const nextErrors: string[] = []
    if (!nickname.trim()) nextErrors.push('请填写昵称')
    if (interests.length < 1) nextErrors.push('请至少选择 1 个兴趣标签')
    if (intents.length < 1) nextErrors.push('请至少选择 1 项社交意图')
    if (bio.trim() && containsBannedContent(bio)) nextErrors.push('一句话介绍包含不适内容，请修改后再保存（基本内容过滤，有限词表不等于完整审核）')
    setErrors(nextErrors)
    return nextErrors.length === 0
  }

  const onPreview = (e: FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    savePortrait(buildDraft())
    navigate('/me/portrait/preview')
  }

  const onSavePrivate = () => {
    if (!validate()) return
    savePortrait(buildDraft(), { isPublic: false })
    navigate('/me')
  }

  return (
    <div>
      <PageHeader
        title={myPortrait ? '编辑 Portrait' : '创建 Portrait'}
        subtitle="必填：昵称、至少 1 个兴趣标签、至少 1 项社交意图；其余选填。填完后先预览，再决定是否公开。"
        fallback="/me"
      />
      <form onSubmit={onPreview} className="flex flex-col gap-4">
        <Card>
          <label className="mb-1 block text-sm font-bold" htmlFor="nickname">
            昵称 <span className="text-pink">*</span>
          </label>
          <input
            id="nickname"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="同学将看到的名字（请勿使用真实姓名）"
            className="w-full rounded-card border border-ink-sub/20 bg-bg px-3 py-2 text-sm outline-none focus:border-primary"
          />
        </Card>

        <Card>
          <p className="mb-2 text-sm font-bold">
            兴趣标签 <span className="text-pink">*</span>
            <span className="ml-2 text-xs font-normal text-ink-sub">至少 1 个</span>
          </p>
          <div className="flex flex-wrap gap-1.5">
            {INTEREST_OPTIONS.map((t) => (
              <button key={t} type="button" onClick={() => toggle(interests, setInterests, t)}>
                <Tag tone={interests.includes(t) ? 'mint' : 'neutral'}>{t}</Tag>
              </button>
            ))}
          </div>
        </Card>

        <Card>
          <p className="mb-2 text-sm font-bold">
            社交意图 <span className="text-pink">*</span>
            <span className="ml-2 text-xs font-normal text-ink-sub">至少 1 项，与关系状态分开</span>
          </p>
          <div className="flex flex-wrap gap-1.5">
            {INTENT_OPTIONS.map((s) => (
              <button key={s} type="button" onClick={() => toggle(intents, setIntents, s)}>
                <Tag tone={intents.includes(s) ? 'pink' : 'neutral'}>{s}</Tag>
              </button>
            ))}
          </div>
        </Card>

        <Card>
          <label className="mb-1 block text-sm font-bold" htmlFor="bio">
            一句话介绍 <span className="ml-2 text-xs font-normal text-ink-sub">选填</span>
          </label>
          <textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            placeholder="用一两句话介绍你的兴趣、状态或期待"
            className="w-full rounded-card border border-ink-sub/20 bg-bg px-3 py-2 text-sm outline-none focus:border-primary"
          />
          <p className="mt-1 text-[11px] text-ink-sub">保存前经过基本内容过滤（有限词表初筛，不等于完整审核）。</p>
        </Card>

        <Card>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-bold" htmlFor="mbti">
                MBTI <span className="ml-2 text-xs font-normal text-ink-sub">选填，仅辅助表达</span>
              </label>
              <select
                id="mbti"
                value={mbti}
                onChange={(e) => setMbti(e.target.value)}
                className="w-full rounded-card border border-ink-sub/20 bg-bg px-3 py-2 text-sm outline-none focus:border-primary"
              >
                <option value="">不填写</option>
                {MBTI_OPTIONS.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-bold" htmlFor="zodiac">
                星座 <span className="ml-2 text-xs font-normal text-ink-sub">选填，仅辅助表达</span>
              </label>
              <select
                id="zodiac"
                value={zodiac}
                onChange={(e) => setZodiac(e.target.value)}
                className="w-full rounded-card border border-ink-sub/20 bg-bg px-3 py-2 text-sm outline-none focus:border-primary"
              >
                <option value="">不填写</option>
                {ZODIAC_OPTIONS.map((z) => (
                  <option key={z} value={z}>{z}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-3">
            <label className="mb-1 block text-sm font-bold" htmlFor="relationship">
              关系状态 <span className="ml-2 text-xs font-normal text-ink-sub">自愿展示，不做认证；与社交意图分离</span>
            </label>
            <select
              id="relationship"
              value={relationship}
              onChange={(e) => setRelationship(e.target.value as RelationshipStatus)}
              className="w-full rounded-card border border-ink-sub/20 bg-bg px-3 py-2 text-sm outline-none focus:border-primary"
            >
              <option value="undisclosed">不公开</option>
              <option value="in_relationship">有对象</option>
            </select>
          </div>
        </Card>

        {errors.length > 0 ? (
          <Card className="border border-pink/40 bg-pink-soft">
            <ul className="list-inside list-disc text-xs text-pink">
              {errors.map((err) => (
                <li key={err}>{err}</li>
              ))}
            </ul>
          </Card>
        ) : null}

        <div className="flex flex-wrap gap-2">
          <Button type="submit">去预览</Button>
          <Button type="button" variant="outline" onClick={onSavePrivate}>
            仅保存，暂不公开
          </Button>
        </div>
        <p className="text-[11px] leading-relaxed text-ink-sub">
          预览不等于公开（DEC-002.3）；即使选择公开，之后也可以随时撤回（DEC-003.2）。
        </p>
      </form>
    </div>
  )
}
