// app/api/interpreting-tasks/route.ts
import { NextResponse } from 'next/server'

const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID || ''
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY || ''

/**
 * GET /api/interpreting-tasks?videoId=1
 * 根据 Video ID 获取对应的口译练习任务
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

    // 获取所有口译任务
    const response = await fetch(
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Interpreting%20Tasks`,
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
    const allRecords = data.records as any[]

    // 先获取所有视频的 videoId 到 recordId 的映射
    const videosResp = await fetch(
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Videos?filterByFormula={Status}="已上线"`,
      {
        headers: {
          Authorization: `Bearer ${AIRTABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        next: { revalidate: 300 },
      }
    )
    const videosData = await videosResp.json()
    const videoMap: Record<string, any> = {}
    for (const rec of videosData.records) {
      const vid = rec.fields['Video ID']
      videoMap[String(vid)] = rec.id
      videoMap[rec.id] = rec.id
    }

    // 找出匹配的 videoId 对应的 recordId
    const targetRecordId = videoMap[videoId] || videoMap[String(videoId)]

    // 过滤出匹配该视频的口译任务
    const tasks = allRecords
      .filter((record) => {
        const videoRel = record.fields['Video']
        if (!videoRel) return false
        return videoRel.includes(targetRecordId)
      })
      .map((record) => ({
        taskId: record.fields['Task ID'],
        sourceTextEn: record.fields['Source Text EN'] || '',
        targetTextCn: record.fields['Target Text CN'] || '',
        difficulty: record.fields.Difficulty,
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
