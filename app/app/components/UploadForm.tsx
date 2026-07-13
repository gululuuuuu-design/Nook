'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

interface UploadFormProps {
  onSuccess: () => void
}

export default function UploadForm({ onSuccess }: UploadFormProps) {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [title, setTitle] = useState('')

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    // 检查文件类型
    if (!selectedFile.type.startsWith('image/')) {
      alert('请选择图片文件')
      return
    }

    setFile(selectedFile)

    // 生成预览
    const reader = new FileReader()
    reader.onload = (event) => {
      setPreview(event.target?.result as string)
    }
    reader.readAsDataURL(selectedFile)
  }

  const handleUpload = async () => {
    if (!file) {
      alert('请先选择图片')
      return
    }

    if (!title.trim()) {
      alert('请输入灵感标题')
      return
    }

    setLoading(true)

    try {
      // 1. 上传文件到 Supabase Storage
      const fileName = `${Date.now()}-${file.name}`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('inspirations')
        .upload(fileName, file, { cacheControl: '3600', upsert: false })

      if (uploadError) throw uploadError

      // 2. 获取公开链接
      const { data: publicUrlData } = supabase.storage
        .from('inspirations')
        .getPublicUrl(uploadData.path)

      const imageUrl = publicUrlData.publicUrl

      // 3. 保存到数据库
      const { error: insertError } = await supabase.from('inspirations').insert([
        {
          image_url: imageUrl,
          title: title.trim(),
          source_url: null,
        },
      ])

      if (insertError) throw insertError

      alert('灵感保存成功！')
      setFile(null)
      setPreview(null)
      setTitle('')
      onSuccess()
    } catch (err) {
      console.error('上传失败：', err)
      alert('上传失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
        📤 上传图片
      </h3>

      {/* 预览 */}
      {preview ? (
        <div className="rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-900">
          <img
            src={preview}
            alt="预览"
            className="w-full h-40 object-cover"
          />
        </div>
      ) : (
        <label className="block border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-8 text-center cursor-pointer hover:border-gray-400 dark:hover:border-gray-600 transition">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            disabled={loading}
            className="hidden"
          />
          <p className="text-gray-600 dark:text-gray-400">
            点击或拖拽上传图片
          </p>
        </label>
      )}

      {/* 标题输入 */}
      <input
        type="text"
        placeholder="给这个灵感起个标题..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        disabled={loading}
        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 disabled:opacity-50"
      />

      {/* 按钮 */}
      <div className="flex gap-3">
        <button
          onClick={handleUpload}
          disabled={!file || !title.trim() || loading}
          className="flex-1 px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg font-medium hover:opacity-90 disabled:opacity-50 transition"
        >
          {loading ? '上传中...' : '保存灵感'}
        </button>
        <button
          onClick={() => {
            setFile(null)
            setPreview(null)
            setTitle('')
          }}
          disabled={loading || !file}
          className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-900 disabled:opacity-50 transition"
        >
          取消
        </button>
      </div>
    </div>
  )
}
