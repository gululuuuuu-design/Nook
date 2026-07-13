'use client'

import { useState } from 'react'
import Link from 'next/link'
import UploadForm from '../../components/UploadForm'
import LinkForm from '../../components/LinkForm'

// 保存灵感页面
// 提供两种保存方式：上传图片 或 粘贴链接
export default function SaveInspirationPage() {
  // 当前选中的标签页：'upload' 或 'link'
  const [activeTab, setActiveTab] = useState<'upload' | 'link'>('upload')

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-md mx-auto px-4">
        {/* 页面标题 */}
        <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          保存灵感
        </h1>

        {/* 标签切换 */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab('upload')}
            className={`flex-1 py-3 text-sm font-medium transition-colors
              ${activeTab === 'upload'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
              }`}
          >
            上传图片
          </button>
          <button
            onClick={() => setActiveTab('link')}
            className={`flex-1 py-3 text-sm font-medium transition-colors
              ${activeTab === 'link'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
              }`}
          >
            粘贴链接
          </button>
        </div>

        {/* 表单内容 */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          {activeTab === 'upload' ? <UploadForm /> : <LinkForm />}
        </div>

        {/* 返回首页链接 */}
        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            返回首页
          </Link>
        </div>
      </div>
    </div>
  )
}
