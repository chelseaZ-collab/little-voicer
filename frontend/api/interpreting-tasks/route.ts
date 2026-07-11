// app/api/interpreting-tasks/route.ts
import { NextResponse } from 'next/server'

const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID || ''
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY || ''

/**
 * GET /api/interpreting-tasks
 * 根据 Video ID 获取对应的口译练习任务
 *
 * 查询参数:
 *   - videoId: 视频 ID (如 LV-001)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const videoId = searchParams.get('videoId')

    if (!videoId) {
      return NextResponse.json(
        { error: 'Missing videoId parameter' },
        { status: 400 }
      )
    }

    const filterByFormula = `FIND("${videoId}", {Video})`

    const response = await fetch(
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Interpreting%20Tasks?filterByFormula=${encodeURIComponent(filterByFormula)}`,
      {
        headers: {
          Authorization: `Bearer ${AIRTABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        next: { revalidate: 300 },
      }
    )

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch interpreting tasks' },
        { status: response.status }
      )
    }

    const data = await response.json()

    const tasks = (data.records as any[]).map((record) => ({
      taskId: record.fields['Task ID'],
      sourceTextEn: record.fields['Source Text EN'] || '',
      targetTextCn: record.fields['Target Text CN'] || '',
      difficulty: record.fields.Difficulty, // L1 跟读 / L2 复述 / L3 交传
      scenario: record.fields.Scenario || '',
      timeLimit: record.fields['Time Limit'] || 0,
    }))

    return NextResponse.json({
      success: true,
      count: tasks.length,
      data: tasks,
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
