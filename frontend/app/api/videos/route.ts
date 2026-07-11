// app/api/videos/route.ts
import { NextResponse } from 'next/server'

const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID || ''
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY || ''
const AIRTABLE_TABLE = 'Videos'

const AIRTABLE_URL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE}`

export interface VideoRecord {
  id: string
  fields: {
    'Video ID': string
    'YouTube URL': string
    'Title EN': string
    'Title CN': string
    Channel: string
    Thumbnail?: string[]
    Duration: number
    Level: 'L1' | 'L2' | 'L2+' | 'L3'
    Theme: string
    Tags: string[]
    Status: '待审核' | '已上线' | '已下线'
    'Created At': string
    Notes?: string
  }
}

/**
 * GET /api/videos
 * 从 Airtable 拉取视频列表
 *
 * 查询参数:
 *   - level: 按级别过滤 (L1, L2, L2+, L3)
 *   - theme: 按主题过滤
 *   - status: 按状态过滤
 *   - search: 搜索标题 (EN 或 CN)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const level = searchParams.get('level')
    const theme = searchParams.get('theme')
    const status = searchParams.get('status')
    const search = searchParams.get('search')

    // 构建 Airtable 过滤条件
    const conditions: string[] = ['{Status} = "已上线"']

    if (level) {
      conditions.push(`{Level} = "${level}"`)
    }
    if (theme) {
      conditions.push(`FIND("${theme}", {Theme})`)
    }
    if (status) {
      conditions.push(`{Status} = "${status}"`)
    }
    if (search) {
      conditions.push(
        `OR(FIND("${search}", {Title EN}), FIND("${search}", {Title CN}))`
      )
    }

    const filterByFormula = 'AND(' + conditions.join(', ') + ')'

    // 调用 Airtable API
    const response = await fetch(
      `${AIRTABLE_URL}?filterByFormula=${encodeURIComponent(filterByFormula)}`,
      {
        headers: {
          Authorization: `Bearer ${AIRTABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        next: { revalidate: 300 },
      }
    )

    if (!response.ok) {
      const error = await response.json()
      return NextResponse.json(
        { error: error.message || 'Airtable API error' },
        { status: response.status }
      )
    }

    const data = await response.json()

    // 转换为前端友好的格式
    const videos = (data.records as VideoRecord[]).map((record) => ({
      id: record.id,
      videoId: record.fields['Video ID'],
      youtubeUrl: record.fields['YouTube URL'],
      titleEn: record.fields['Title EN'],
      titleCn: record.fields['Title CN'],
      channel: record.fields.Channel,
      thumbnail: record.fields.Thumbnail
        ? `https://img.youtube.com/vi/${extractYoutubeId(record.fields['YouTube URL'])}/maxresdefault.jpg`
        : null,
      duration: record.fields.Duration,
      level: record.fields.Level,
      theme: record.fields.Theme,
      tags: record.fields.Tags || [],
      status: record.fields.Status,
      createdAt: record.fields['Created At'],
      notes: record.fields.Notes || '',
    }))

    return NextResponse.json({
      success: true,
      count: videos.length,
      data: videos,
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// 工具函数：从 YouTube URL 提取视频 ID
function extractYoutubeId(url: string): string {
  const match = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s?]+)/
  )
  return match ? match[1] : ''
}
