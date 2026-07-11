// app/api/quizzes/route.ts
import { NextResponse } from 'next/server'

const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID || ''
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY || ''

/**
 * GET /api/quizzes
 * 根据 Video ID 获取对应的互动测验
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
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Quizzes?filterByFormula=${encodeURIComponent(filterByFormula)}`,
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

    const quizzes = (data.records as any[])
      .map((record) => ({
        quizId: record.fields['Quiz ID'],
        question: record.fields.Question,
        type: record.fields.Type, // 选择题 / 判断题 / 听力填空
        options: record.fields.Options || [],
        correctAnswer: record.fields['Correct Answer'] || '',
        explanation: record.fields.Explanation || '',
        order: record.fields.Order || 0,
      }))
      .sort((a, b) => a.order - b.order) // 按顺序排列

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
