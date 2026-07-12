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

    // 一次性获取所有词汇卡和视频记录
    const [vocabResp, videosResp] = await Promise.all([
      fetch(
        `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Vocabulary`,
        {
          headers: {
            Authorization: `Bearer ${AIRTABLE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          next: { revalidate: 300 },
        }
      ),
      fetch(
        `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Videos?filterByFormula={Status}="已上线"`,
        {
          headers: {
            Authorization: `Bearer ${AIRTABLE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          next: { revalidate: 300 },
        }
      ),
    ])

    if (!vocabResp.ok || !videosResp.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch data' },
        { status: vocabResp.status || videosResp.status }
      )
    }

    const vocabData = await vocabResp.json()
    const videosData = await videosResp.json()

    // 建立 videoId -> recordId 映射
    const videoMap: Record<string, string> = {}
    for (const rec of videosData.records) {
      const vid = rec.fields['Video ID']
      videoMap[String(vid)] = rec.id
    }

    const targetRecordId = videoMap[videoId]
    if (!targetRecordId) {
      return NextResponse.json({
        success: true,
        count: 0,
        data: [],
      })
    }

    // 过滤出匹配该视频的词汇卡
    const cards = (vocabData.records as any[])
      .filter((record) => {
        const videoRel = record.fields['Video']
        if (!Array.isArray(videoRel)) return false
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
