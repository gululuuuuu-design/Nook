'use client'

import { useState } from 'react'
import { supabase } from '../lib/supabase'
import TagFields from './TagFields'
import { TagValues, EMPTY_TAGS } from '../lib/tags'

// 链接预览数据结构
interface LinkPreview {
  title: string
  image: string
  url: string
}

// 链接预览表单组件
// 功能：粘贴链接 -> 调用 Microlink API 抓取封面 -> 打标签 -> 保存到数据库
export default function LinkForm() {
  const [url, setUrl] = useState('')                          // 输入的链接
  const [preview, setPreview] = useState<LinkPreview | null>(null)  // 预览数据
  const [loading, setLoading] = useState(false)               // 加载状态
  const [saving, setSaving] = useState(false)                 // 保存状态
  const [message, setMessage] = useState('')                  // 提示消息
  const [tags, setTags] = useState<TagValues>(EMPTY_TAGS)     // 三类标签

  // 获取链接预览
  // 使用 Microlink API（免费）抓取网页的标题和封面图
  const fetchPreview = async () => {
    if (!url) return

    setLoading(true)
    setMessage('')
    setPreview(null)

    try {
      // Microlink 是一个免费的链接预览 API
      // 它会自动抓取网页的标题、描述、封面图等元数据
      const response = await fetch(
        `https://api.microlink.io?url=${encodeURIComponent(url)}`
      )
      const data = await response.json()

      if (data.status === 'success' && data.data) {
        // 有些网站（如 Pinterest）抓不到封面图，此时允许没有图片也能保存
        setPreview({
          title: data.data.title || '无标题',
          image: data.data.image?.url || data.data.logo?.url || '',
          url: url
        })
      } else {
        // 显示 Microlink 返回的具体原因
        const reason = data.message || data.status || '未知原因'
        setMessage(`无法获取链接预览（${reason}）。这个网站可能不允许抓取，可改用"上传图片"。`)
      }
    } catch (error) {
      console.error('获取预览失败:', error)
      setMessage('获取预览失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  // 保存灵感到数据库
  const saveInspiration = async () => {
    if (!preview) return

    setSaving(true)
    setMessage('')

    try {
      const { error } = await supabase
        .from('inspirations')
        .insert({
          image_url: preview.image,    // 抓取到的封面图
          title: preview.title,         // 抓取到的标题
          source_url: preview.url,      // 原始链接
          colors: tags.colors,          // 颜色标签
          styles: tags.styles,          // 风格标签
          projects: tags.projects       // 项目标签
        })

      if (error) throw error

      setMessage('保存成功！')
      setUrl('')
      setPreview(null)
      setTags(EMPTY_TAGS)               // 清空标签
    } catch (error) {
      console.error('保存失败:', error)
      // Supabase 的错误是个对象，优先取它的 message 字段
      const errorMsg =
        (error as { message?: string })?.message || JSON.stringify(error)
      setMessage(`保存失败：${errorMsg}`)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* 链接输入区域 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          粘贴链接
        </label>
        <div className="flex gap-2">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com/design-inspiration"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md
              focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={fetchPreview}
            disabled={!url || loading}
            className="px-4 py-2 bg-gray-600 text-white rounded-md
              hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed
              transition-colors"
          >
            {loading ? '获取中...' : '预览'}
          </button>
        </div>
      </div>

      {/* 预览卡片 */}
      {preview && (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          {/* 封面图 */}
          {preview.image && (
            <img
              src={preview.image}
              alt={preview.title}
              className="w-full h-48 object-cover"
            />
          )}
          {/* 标题和链接 */}
          <div className="p-4">
            <h3 className="font-medium text-gray-900">{preview.title}</h3>
            <p className="text-sm text-gray-500 truncate mt-1">{preview.url}</p>
          </div>
        </div>
      )}

      {/* 打标签（预览出来后才显示） */}
      {preview && <TagFields value={tags} onChange={setTags} />}

      {/* 保存按钮 */}
      {preview && (
        <button
          onClick={saveInspiration}
          disabled={saving}
          className="w-full py-2 px-4 bg-blue-600 text-white rounded-md
            hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed
            transition-colors"
        >
          {saving ? '保存中...' : '保存这个灵感'}
        </button>
      )}

      {/* 状态消息 */}
      {message && (
        <p className={`text-sm ${message.includes('成功') ? 'text-green-600' : 'text-red-600'}`}>
          {message}
        </p>
      )}
    </div>
  )
}
