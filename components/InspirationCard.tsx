'use client'

import { useState } from 'react'
import { supabase } from '../lib/supabase'
import TagFields from './TagFields'
import { TagValues } from '../lib/tags'

// 灵感的数据结构（和数据库表字段对应）
export interface Inspiration {
  id: string
  image_url: string
  title: string | null
  source_url: string | null
  created_at: string
  colors: string[] | null
  styles: string[] | null
  projects: string[] | null
}

// 单张灵感卡片
// - 图片可点击跳转原链接（如果有）
// - 底部显示标签 + 一个"编辑标签"按钮
// - 点编辑按钮弹出小窗口，改完保存到数据库
interface InspirationCardProps {
  inspiration: Inspiration
  onUpdated: (updated: Inspiration) => void  // 保存后通知父组件刷新
}

export default function InspirationCard({ inspiration, onUpdated }: InspirationCardProps) {
  const [editing, setEditing] = useState(false)   // 是否正在编辑标签
  const [saving, setSaving] = useState(false)      // 保存中
  const [error, setError] = useState('')

  // 编辑弹窗里的标签值（打开时用当前灵感的标签初始化）
  const [tags, setTags] = useState<TagValues>({
    colors: inspiration.colors || [],
    styles: inspiration.styles || [],
    projects: inspiration.projects || [],
  })

  // 合并三类标签，用于卡片上统一显示
  const allTags = [
    ...(inspiration.colors || []),
    ...(inspiration.styles || []),
    ...(inspiration.projects || []),
  ]

  // 打开编辑弹窗：把当前标签填进去
  const openEditor = () => {
    setTags({
      colors: inspiration.colors || [],
      styles: inspiration.styles || [],
      projects: inspiration.projects || [],
    })
    setError('')
    setEditing(true)
  }

  // 保存标签到数据库
  const saveTags = async () => {
    setSaving(true)
    setError('')
    try {
      const { error } = await supabase
        .from('inspirations')
        .update({
          colors: tags.colors,
          styles: tags.styles,
          projects: tags.projects,
        })
        .eq('id', inspiration.id)  // 只更新这一条

      if (error) throw error

      // 通知父组件：这条灵感的标签更新了
      onUpdated({ ...inspiration, ...tags })
      setEditing(false)
    } catch (err) {
      const msg = (err as { message?: string })?.message || JSON.stringify(err)
      setError(`保存失败：${msg}`)
    } finally {
      setSaving(false)
    }
  }

  // 图片部分：有来源链接就包一层可点击的 <a>
  const image = (
    <img
      src={inspiration.image_url}
      alt={inspiration.title || '灵感'}
      className="w-full h-auto block"
    />
  )

  return (
    <>
      <div className="mb-4 break-inside-avoid overflow-hidden rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow">
        {inspiration.source_url ? (
          <a href={inspiration.source_url} target="_blank" rel="noopener noreferrer">
            {image}
          </a>
        ) : (
          image
        )}

        <div className="p-3">
          {inspiration.title && (
            <p className="text-sm text-gray-800">{inspiration.title}</p>
          )}

          {/* 标签小圆片 */}
          {allTags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {allTags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* 编辑标签按钮 */}
          <button
            type="button"
            onClick={openEditor}
            className="mt-2 text-xs text-gray-400 hover:text-blue-600 transition-colors"
          >
            🏷 编辑标签
          </button>
        </div>
      </div>

      {/* 编辑弹窗 */}
      {editing && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setEditing(false)}  // 点背景关闭
        >
          <div
            className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}  // 点弹窗内部不关闭
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">编辑标签</h3>

            <TagFields value={tags} onChange={setTags} />

            {error && <p className="text-sm text-red-600 mt-3">{error}</p>}

            {/* 保存 / 取消 */}
            <div className="flex gap-2 mt-6">
              <button
                type="button"
                onClick={saveTags}
                disabled={saving}
                className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md
                  hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
              >
                {saving ? '保存中...' : '保存'}
              </button>
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-md
                  hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
