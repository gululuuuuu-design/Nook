'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import UploadForm from '@/app/components/UploadForm'
import LinkForm from '@/app/components/LinkForm'

export default function SaveInspiration() {
  const [inspirations, setInspirations] = useState<any[]>([])

  // 加载已保存的灵感
  useEffect(() => {
    fetchInspirations()
  }, [])

  const fetchInspirations = async () => {
    try {
      const { data, error } = await supabase
        .from('inspirations')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setInspirations(data || [])
    } catch (err) {
      console.error('读取灵感失败：', err)
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black p-8">
      <div className="max-w-6xl mx-auto">
        {/* 标题 */}
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">
          保存灵感
        </h1>

        {/* 两列布局：左边表单，右边预览 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* 左列：上传和链接表单 */}
          <div className="space-y-6">
            <UploadForm onSuccess={fetchInspirations} />
            <LinkForm onSuccess={fetchInspirations} />
          </div>

          {/* 右列：使用说明 */}
          <div className="hidden lg:block">
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-8 space-y-4">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                💡 使用提示
              </h3>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                <li>✓ 上传本地图片到灵感库</li>
                <li>✓ 粘贴网址自动抓取封面和标题</li>
                <li>✓ 支持所有常见图片格式</li>
                <li>✓ 灵感会自动保存并即时显示</li>
              </ul>
            </div>
          </div>
        </div>

        {/* 已保存的灵感网格 */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            已保存的灵感 ({inspirations.length})
          </h2>

          {inspirations.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400">
                还没有保存任何灵感，试试上面的表单吧！
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {inspirations.map((inspiration) => (
                <div
                  key={inspiration.id}
                  className="rounded-lg overflow-hidden shadow-sm hover:shadow-md transition duration-200 bg-white dark:bg-gray-900"
                >
                  <img
                    src={inspiration.image_url}
                    alt={inspiration.title || '灵感图片'}
                    className="w-full h-40 object-cover"
                  />
                  <div className="p-3">
                    <p className="text-sm text-gray-800 dark:text-gray-200 truncate">
                      {inspiration.title || '无标题'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
