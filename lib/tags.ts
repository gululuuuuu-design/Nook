import { supabase } from './supabase'

// 三个标签类别：字段名 + 中文显示名
export const TAG_CATEGORIES = [
  { key: 'colors', label: '颜色' },
  { key: 'styles', label: '风格' },
  { key: 'projects', label: '项目' },
] as const

export type TagCategoryKey = 'colors' | 'styles' | 'projects'

// 一条灵感的三类标签
export interface TagValues {
  colors: string[]
  styles: string[]
  projects: string[]
}

// 空标签（新灵感的初始值）
export const EMPTY_TAGS: TagValues = { colors: [], styles: [], projects: [] }

// 从所有灵感里收集每一类"用过的标签"（去重），用于输入时的智能提示
export async function fetchTagSuggestions(): Promise<TagValues> {
  const { data, error } = await supabase
    .from('inspirations')
    .select('colors, styles, projects')

  // 出错或没数据时，返回三个空数组
  if (error || !data) return { colors: [], styles: [], projects: [] }

  // 用 Set 自动去重
  const colorSet = new Set<string>()
  const styleSet = new Set<string>()
  const projectSet = new Set<string>()

  for (const row of data) {
    const r = row as TagValues
    if (Array.isArray(r.colors)) r.colors.forEach((t) => t && colorSet.add(t))
    if (Array.isArray(r.styles)) r.styles.forEach((t) => t && styleSet.add(t))
    if (Array.isArray(r.projects)) r.projects.forEach((t) => t && projectSet.add(t))
  }

  return {
    colors: Array.from(colorSet),
    styles: Array.from(styleSet),
    projects: Array.from(projectSet),
  }
}
