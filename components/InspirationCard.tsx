'use client'

// 单张灵感卡片
// 显示封面图 + 标题；如果有来源链接，点击整张卡片能跳转到原网页

// 灵感的数据结构（和数据库表字段对应）
export interface Inspiration {
  id: string
  image_url: string
  title: string | null
  source_url: string | null
  created_at: string
}

export default function InspirationCard({ inspiration }: { inspiration: Inspiration }) {
  // 卡片主体内容（图片 + 标题）
  const content = (
    <div className="mb-4 break-inside-avoid overflow-hidden rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow">
      {/* 封面图：w-full 让它填满列宽，h-auto 保持原比例（这就是瀑布流高低错落的关键） */}
      <img
        src={inspiration.image_url}
        alt={inspiration.title || '灵感'}
        className="w-full h-auto block"
      />
      {/* 标题（如果有） */}
      {inspiration.title && (
        <div className="p-3">
          <p className="text-sm text-gray-800">{inspiration.title}</p>
        </div>
      )}
    </div>
  )

  // 有来源链接 -> 用 <a> 包起来，点击新标签页打开原网页
  if (inspiration.source_url) {
    return (
      <a
        href={inspiration.source_url}
        target="_blank"
        rel="noopener noreferrer"
      >
        {content}
      </a>
    )
  }

  // 没有来源链接（上传的图片）-> 只显示，不可点击
  return content
}
