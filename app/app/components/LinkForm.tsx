'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

interface LinkFormProps {
  onSuccess: () => void
}

interface PreviewData {
  title?: string
  image?: string
  description?: string
}

export default function LinkForm({ onSuccess }: LinkFormProps) {
  const [url, setUrl] = useState('')
  const [preview, setPreview] = useState<PreviewData | null>(null)
  const [loading, setLoading] = useState(false)
  const [previewing, setPreviewing] = useState(false)
  const [title, setTitle] = useState('')

  // 调用 Microlink API 获取预览
  const handlePreview = async () => {
    if (!url.trim()) {
      alert('请输入链接地址')
      return
    }

    setPreviewing(true)
    try {
      const response = await fetch(
        `https://api.microlink.io/?url=${encodeURIComponent(url)}`
      )
      const data = await response.json()

      if (data.data) {
        setPreview({
          title: data.data.title || '无标题',
          image: data.data.image?.url,
          description: data.data.description,
        })
        setTitle(data.data.title || '')
      } else {
        alert('无法获取预览，请检查链接是否正确')
        setPreview(null)
      }
    } catch (err) {
      console.error('预览失败：', err)
      alert('预览失败，请稍后重试')
      setPreview(null)
    } finally {
      setPreviewing(false)
    }
  }

  const handleSave = async () => {
    if (!preview?.image && !preview?.title) {
      alert('请先获取预览或上传封面')
      return
    }

    if (!title.trim()) {
      alert('请输入标题')
      return
    }

    setLoading(true)

    try {
      // 保存到数据库
      const { error } = await supabase.from('inspirations').insert([
        {
          image_url: preview.image || '',
          title: title.trim(),
          source_url: url.trim(),
        },
      ])

      if (error) throw error

      alert('灵感保存成功！')
      setUrl('')
      setPreview(null)
      setTitle('')
      onSuccess()
    } catch (err) {
      console.error('保存失败：', err)
      alert('保存失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        🔗 粘贴链接
      </h3>

      {/* URL 输入 */}
      <div className="flex gap-2">
        <input
          type="url"
          placeholder="粘贴网址..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          disabled={previewing || loading}
          className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 disabled:opacity-50"
        />
        <button
          onClick={handlePreview}
          disabled={!url.trim() || previewing || loading}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 disabled:opacity-50 transition"
        >
          {previewing ? '获取中...' : '预览'}
        </button>
      </div>

      {/* 预览结果 */}
      {preview && (
        <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
          {preview.image && (
            <img
              src={preview.image}
              alt="预览"
              className="w-full h-40 object-cover"
            />
          )}
          <div className="p-4">
            <input
              type="text"
              placeholder="标题"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={loading}
              className="w-full text-sm font-semibold text-gray-900 dark:text-white bg-transparent border-b border-gray-300 dark:border-gray-700 pb-2 mb-2 disabled:opacity-50"
            />
            {preview.description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                {preview.description}
              </p>
            )}
          </div>
        </div>
      )}

      {/* 按钮 */}
      <div className="flex gap-3">
        <button
          onClick={handleSave}
          disabled={!preview || !title.trim() || loading}
          className="flex-1 px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg font-medium hover:opacity-90 disabled:opacity-50 transition"
        >
          {loading ? '保存中...' : '保存灵感'}
        </button>
        <button
          onClick={() => {
            setUrl('')
            setPreview(null)
            setTitle('')
          }}
          disabled={loading || !preview}
          className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-900 disabled:opacity-50 transition"
        >
          清除
        </button>
      </div>
    </div>
  )
}
