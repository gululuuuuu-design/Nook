'use client'

import { useState } from 'react'
import { supabase } from '../lib/supabase'

// 图片上传表单组件
// 功能：选择本地图片 -> 上传到 Supabase Storage -> 保存记录到数据库
export default function UploadForm() {
  // 状态管理
  const [file, setFile] = useState<File | null>(null)        // 选中的文件
  const [preview, setPreview] = useState<string | null>(null) // 预览图 URL
  const [title, setTitle] = useState('')                      // 标题输入
  const [uploading, setUploading] = useState(false)           // 上传中状态
  const [message, setMessage] = useState('')                   // 提示消息

  // 处理文件选择
  // 当用户选择图片时，生成本地预览
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      // URL.createObjectURL 创建一个临时 URL 用于预览
      // 这个 URL 只在本地有效，不会上传到服务器
      setPreview(URL.createObjectURL(selectedFile))
    }
  }

  // 处理表单提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()  // 阻止默认表单提交行为
    if (!file) return

    setUploading(true)
    setMessage('')

    try {
      // 第一步：上传图片到 Supabase Storage
      // 生成唯一文件名：时间戳 + 原文件名，避免重名覆盖
      const fileName = `${Date.now()}-${file.name}`

      const { error: uploadError } = await supabase.storage
        .from('inspirations')  // bucket 名称
        .upload(fileName, file)

      if (uploadError) throw uploadError

      // 第二步：获取上传后的公开 URL
      const { data: urlData } = supabase.storage
        .from('inspirations')
        .getPublicUrl(fileName)

      // 第三步：保存记录到数据库
      const { error: dbError } = await supabase
        .from('inspirations')  // 表名
        .insert({
          image_url: urlData.publicUrl,
          title: title || null,  // 标题可选
          source_url: null        // 上传的图片没有来源链接
        })

      if (dbError) throw dbError

      // 成功后清空表单
      setMessage('上传成功！')
      setFile(null)
      setPreview(null)
      setTitle('')
    } catch (error) {
      console.error('上传失败:', error)
      // 显示真实的错误信息，方便排查问题
      const errorMsg = error instanceof Error ? error.message : String(error)
      setMessage(`上传失败：${errorMsg}`)
    } finally {
      setUploading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* 文件选择区域 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          选择图片
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100"
        />
      </div>

      {/* 图片预览 */}
      {preview && (
        <div className="mt-4">
          <img
            src={preview}
            alt="预览"
            className="max-w-xs rounded-lg shadow-md"
          />
        </div>
      )}

      {/* 标题输入（可选） */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          标题（可选）
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="给这个灵感起个名字"
          className="w-full px-3 py-2 border border-gray-300 rounded-md
            focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* 提交按钮 */}
      <button
        type="submit"
        disabled={!file || uploading}
        className="w-full py-2 px-4 bg-blue-600 text-white rounded-md
          hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed
          transition-colors"
      >
        {uploading ? '上传中...' : '保存灵感'}
      </button>

      {/* 状态消息 */}
      {message && (
        <p className={`text-sm ${message.includes('成功') ? 'text-green-600' : 'text-red-600'}`}>
          {message}
        </p>
      )}
    </form>
  )
}
