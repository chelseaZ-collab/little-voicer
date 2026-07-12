// app/api/vocabulary/route.ts
import { NextResponse } from 'next/server'

const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID || ''
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY || ''

/**
 * GET /api/vocabulary?videoId=1
 * 根据 Video ID 获取对应的词汇卡片
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

    // 获取所有词汇卡
    const response = await fetch(
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Vocabulary`,
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
        { error: 'Failed to fetch vocabulary' },
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
      videoMap[rec.id] = rec.id // 也存 recordId -> recordId
    }

    // 找出匹配的 videoId 对应的 recordId
    const targetRecordId = videoMap[videoId] || videoMap[String(videoId)]

    // 过滤出匹配该视频的词汇卡
    const cards = allRecords
      .filter((record) => {
        const videoRel = record.fields['Video']
        if (!videoRel) return false
        // Video 字段是一个数组，包含 recordId
        return videoRel.includes(targetRecordId)
      })
      .map((record) => ({
        cardId: record.fields['Card ID'],
        word: record.fields.Word,
        phonetic: record.fields.Phonetic || '',
        meaningCn: record.fields['Meaning CN'] || '',
        exampleEn: record.fields['Example Sentence EN'] || '',
        exampleCn: record.fields['Example Sentence CN'] || '',
      }))

    return NextResponse.json({
      success: true,
      count: cards.length,
      data: cards,
    })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
