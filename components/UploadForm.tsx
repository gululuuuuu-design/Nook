'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

// 图片上传表单组件
// 功能：选择本地图片 / 粘贴图片(Ctrl+V) -> 上传到 Supabase Storage -> 保存记录到数据库
export default function UploadForm() {
  // 状态管理
  const [file, setFile] = useState<File | null>(null)        // 选中的文件
  const [preview, setPreview] = useState<string | null>(null) // 预览图 URL
  const [title, setTitle] = useState('')                      // 标题输入
  const [uploading, setUploading] = useState(false)           // 上传中状态
  const [message, setMessage] = useState('')                   // 提示消息

  // 统一处理"选好一张图"这件事：记住文件 + 生成本地预览
  // 选文件上传 和 粘贴上传 都调用它，逻辑只写一份
  const selectFile = (selectedFile: File) => {
    setFile(selectedFile)
    // URL.createObjectURL 创建一个临时 URL 用于预览
    // 这个 URL 只在本地有效，不会上传到服务器
    setPreview(URL.createObjectURL(selectedFile))
    setMessage('')
  }

  // 处理文件选择（点"选择图片"按钮时）
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      selectFile(selectedFile)
    }
  }

  // 监听整个页面的"粘贴"动作（Ctrl+V）
  // 只要剪贴板里有图片，就自动拿来当作要上传的图
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items
      if (!items) return

      // 遍历剪贴板内容，找出第一张图片
      for (const item of items) {
        if (item.type.startsWith('image/')) {
          const pastedFile = item.getAsFile()
          if (pastedFile) {
            selectFile(pastedFile)
          }
          break
        }
      }
    }

    // 挂上监听；组件卸载时记得移除，避免重复监听
    document.addEventListener('paste', handlePaste)
    return () => document.removeEventListener('paste', handlePaste)
  }, [])

  // 处理表单提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()  // 阻止默认表单提交行为
    if (!file) return

    setUploading(true)
    setMessage('')

    try {
      // 第一步：上传图片到 Supabase Storage
      // 注意：文件名不能含中文/空格等特殊字符，否则会报 "Invalid key"
      // 所以这里丢弃原文件名，只保留扩展名（如 .png），前面用时间戳+随机字符保证唯一
      const ext = file.name.split('.').pop() || 'png'
      const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

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
      // Supabase 的错误是个对象，优先取它的 message 字段
      const errorMsg =
        (error as { message?: string })?.message || JSON.stringify(error)
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
        {/* 粘贴提示：告诉用户也可以直接 Ctrl+V */}
        <p className="mt-2 text-xs text-gray-400">
          或直接按 Ctrl+V 粘贴复制好的图片
        </p>
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
