import { createClient } from '@supabase/supabase-js'

// 从环境变量读取 Supabase 配置
// NEXT_PUBLIC_ 前缀让这些变量可以在浏览器端使用
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// 创建 Supabase 客户端实例，用于数据库操作和文件存储
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
