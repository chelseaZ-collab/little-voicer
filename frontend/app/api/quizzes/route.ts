// app/api/quizzes/route.ts
import { NextResponse } from 'next/server'

const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID || ''
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY || ''

/**
 * GET /api/quizzes?videoId=1
 * 根据 Video ID 获取对应的互动测验
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

    // 获取所有测验
    const response = await fetch(
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Quizzes`,
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
        { error: 'Failed to fetch quizzes' },
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

    // 过滤出匹配该视频的测验
    const quizzes = allRecords
      .filter((record) => {
        const videoRel = record.fields['Video']
        if (!videoRel) return false
        return videoRel.includes(targetRecordId)
      })
      .map((record) => ({
        quizId: record.fields['Quiz ID'],
        question: record.fields.Question,
        type: record.fields.Type,
        options: record.fields.Options || [],
        correctAnswer: record.fields['Correct Answer'] || '',
        explanation: record.fields.Explanation || '',
        order: record.fields.Order || 0,
      }))
      .sort((a, b) => a.order - b.order)

    return NextResponse.json({
      success: true,
      count: quizzes.length,
      data: quizzes,
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
