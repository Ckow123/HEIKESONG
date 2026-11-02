import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'

import { Button } from '@/shared/ui/Button'
import { Card } from '@/shared/ui/Card'
import { PageHeader } from '@/shared/ui/PageHeader'
import { Tag } from '@/shared/ui/Tag'

const INTEREST_OPTIONS = ['羽毛球', '编程', '电影', '摄影', '阅读', '自习', '英语交流', '跑步', '音乐', '比赛', '游戏', '徒步']
const INTENT_OPTIONS = ['交朋友', '学习搭子', '英语口语搭子', '活动搭子', '比赛队友', '仅浏览']

/**
 * P11 Portrait 编辑（T1 骨架）：
 * 表单结构与 DEC-002 必填规则已落位（昵称 + ≥1 兴趣 + ≥1 社交意图）；
 * 保存/公开写入在 T3/T4 接入数据层，本阶段校验通过后可进入 P12 预览。
 */
export default function PortraitEditPage() {
  const navigate = useNavigate()
  const [nickname, setNickname] = useState('')
  const [interests, setInterests] = useState<string[]>([])
  const [intents, setIntents] = useState<string[]>([])
  const [bio, setBio] = useState('')
  const [errors, setErrors] = useState<string[]>([])

  const toggle = (list: string[], setList: (v: string[]) => void, value: string) => {
    setList(list.includes(value) ? list.filter((x) => x !== value) : [...list, value])
  }

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    const nextErrors: string[] = []
    if (!nickname.trim()) nextErrors.push('请填写昵称')
    if (interests.length < 1) nextErrors.push('请至少选择 1 个兴趣标签')
    if (intents.length < 1) nextErrors.push('请至少选择 1 项社交意图')
    setErrors(nextErrors)
    if (nextErrors.length === 0) {
      // 预览不等于公开（DEC-002.3）；T3/T4 接入保存与公开确认
      navigate('/me/portrait/preview', { state: { draft: { nickname, interests, intents, bio } } })
    }
  }

  return (
    <div>
      <PageHeader
        title="创建 / 编辑 Portrait"
        subtitle="必填：昵称、至少 1 个兴趣标签、至少 1 项社交意图；其余选填。填完后先预览，再决定是否公开。"
        fallback="/me"
      />
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
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
            placeholder="用一两句话介绍你的兴趣、状态或期待（发布前将经过基本内容过滤）"
            className="w-full rounded-card border border-ink-sub/20 bg-bg px-3 py-2 text-sm outline-none focus:border-primary"
          />
          <p className="mt-1 text-[11px] text-ink-sub">MBTI、星座、关系状态等选填项将在 T3 加入。</p>
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

        <div className="flex gap-2">
          <Button type="submit">去预览</Button>
          <Button type="button" variant="outline" disabled title="T3 接入：保存为未公开草稿">
            仅保存，暂不公开（T3）
          </Button>
        </div>
        <p className="text-[11px] leading-relaxed text-ink-sub">
          预览不等于公开（DEC-002.3）；即使选择公开，之后也可以随时撤回（DEC-003.2）。
        </p>
      </form>
    </div>
  )
}
