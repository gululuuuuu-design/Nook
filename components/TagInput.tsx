'use client'

import { useState } from 'react'

// 单个类别的标签输入框
// - 打字 + 回车：添加一个标签
// - 已选标签显示成小圆片，点 ✕ 删除
// - 下面列出"用过的标签"（智能提示），点一下就添加
interface TagInputProps {
  label: string                     // 类别名，如"颜色"
  tags: string[]                    // 当前已选的标签
  suggestions: string[]             // 历史用过的标签（提示用）
  onChange: (tags: string[]) => void // 标签变化时通知父组件
}

export default function TagInput({ label, tags, suggestions, onChange }: TagInputProps) {
  const [input, setInput] = useState('')

  // 添加一个标签（去掉首尾空格；已存在就不重复加）
  const addTag = (tag: string) => {
    const t = tag.trim()
    if (!t) return
    if (!tags.includes(t)) {
      onChange([...tags, t])
    }
    setInput('')
  }

  // 删除一个标签
  const removeTag = (tag: string) => {
    onChange(tags.filter((t) => t !== tag))
  }

  // 按回车时添加当前输入的标签
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()  // 防止触发表单提交
      addTag(input)
    }
  }

  // 智能提示：还没被选中的历史标签；有输入时按输入内容筛选
  const keyword = input.trim().toLowerCase()
  const filtered = suggestions
    .filter((s) => !tags.includes(s))
    .filter((s) => keyword === '' || s.toLowerCase().includes(keyword))
    .slice(0, 12)  // 最多显示 12 个，避免太长

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>

      {/* 已选标签（蓝色小圆片） */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="hover:text-blue-900"
              >
                ✕
              </button>
            </span>
          ))}
        </div>
      )}

      {/* 输入框 */}
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={`输入${label}标签后按回车`}
        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm
          focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {/* 智能提示：历史标签，点一下就添加 */}
      {filtered.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {filtered.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => addTag(s)}
              className="px-2 py-1 border border-gray-300 text-gray-600 rounded-full text-xs
                hover:bg-gray-100 transition-colors"
            >
              + {s}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
