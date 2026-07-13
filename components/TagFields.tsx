'use client'

import { useEffect, useState } from 'react'
import TagInput from './TagInput'
import { fetchTagSuggestions, TagValues } from '../lib/tags'

// 三类标签（颜色/风格/项目）的组合编辑器
// 自己负责去数据库取"用过的标签"做智能提示；把当前标签值交给父组件管理
interface TagFieldsProps {
  value: TagValues
  onChange: (value: TagValues) => void
}

export default function TagFields({ value, onChange }: TagFieldsProps) {
  // 三类的历史标签（智能提示用）
  const [suggestions, setSuggestions] = useState<TagValues>({
    colors: [],
    styles: [],
    projects: [],
  })

  // 组件加载时，去数据库取一次历史标签
  useEffect(() => {
    fetchTagSuggestions().then(setSuggestions)
  }, [])

  return (
    <div className="space-y-4">
      <TagInput
        label="颜色"
        tags={value.colors}
        suggestions={suggestions.colors}
        onChange={(colors) => onChange({ ...value, colors })}
      />
      <TagInput
        label="风格"
        tags={value.styles}
        suggestions={suggestions.styles}
        onChange={(styles) => onChange({ ...value, styles })}
      />
      <TagInput
        label="项目"
        tags={value.projects}
        suggestions={suggestions.projects}
        onChange={(projects) => onChange({ ...value, projects })}
      />
    </div>
  )
}
