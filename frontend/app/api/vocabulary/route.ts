// app/api/vocabulary/route.ts
import { NextResponse } from 'next/server'

const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID || ''
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY || ''

/**
 * GET /api/vocabulary?videoId=LV-001
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

    const filterByFormula = `FIND("${videoId}", {Video})`

    const response = await fetch(
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/Vocabulary?filterByFormula=${encodeURIComponent(filterByFormula)}`,
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

    const cards = (data.records as any[]).map((record) => ({
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
