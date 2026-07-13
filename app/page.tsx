'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '../lib/supabase'
import InspirationCard, { Inspiration } from '../components/InspirationCard'

// 首页 = 灵感墙
// 从数据库读出所有灵感，用瀑布流形式展示
export default function Home() {
  const [items, setItems] = useState<Inspiration[]>([])  // 所有灵感
  const [loading, setLoading] = useState(true)           // 加载中状态
  const [error, setError] = useState('')                 // 错误信息

  // 页面加载时，去 Supabase 把所有灵感读出来
  useEffect(() => {
    const fetchInspirations = async () => {
      const { data, error } = await supabase
        .from('inspirations')
        .select('*')                              // 读取所有字段
        .order('created_at', { ascending: false }) // 按时间倒序，最新的在最前

      if (error) {
        setError(error.message)
      } else {
        setItems(data || [])
      }
      setLoading(false)
    }

    fetchInspirations()
  }, [])  // 空数组表示只在页面首次加载时运行一次

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* 顶部：标题 + 保存按钮 */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-900">我的灵感</h1>
          <Link
            href="/save-inspiration"
            className="px-4 py-2 bg-blue-600 text-white rounded-md
              hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            + 保存灵感
          </Link>
        </div>

        {/* 加载中 */}
        {loading && (
          <p className="text-center text-gray-500 py-12">加载中...</p>
        )}

        {/* 出错 */}
        {error && (
          <p className="text-center text-red-600 py-12">加载失败：{error}</p>
        )}

        {/* 空状态：还没有灵感 */}
        {!loading && !error && items.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">还没有灵感</p>
            <Link
              href="/save-inspiration"
              className="text-blue-600 hover:underline"
            >
              点这里添加第一个吧
            </Link>
          </div>
        )}

        {/* 瀑布流灵感墙 */}
        {/* columns-2/3/4：手机 2 列、平板 3 列、电脑 4 列，图片自动错落排列 */}
        {!loading && !error && items.length > 0 && (
          <div className="columns-2 md:columns-3 lg:columns-4 gap-4">
            {items.map((item) => (
              <InspirationCard
                key={item.id}
                inspiration={item}
                onUpdated={(updated) =>
                  // 把列表里对应的那条替换成更新后的版本，标签立刻刷新
                  setItems((prev) =>
                    prev.map((it) => (it.id === updated.id ? updated : it))
                  )
                }
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
