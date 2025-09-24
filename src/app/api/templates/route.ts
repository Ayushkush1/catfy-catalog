import { NextRequest, NextResponse } from 'next/server'
import { getAllTemplates, getTemplatesByCategory, getFreeTemplates, getPremiumTemplates } from '@/templates'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const premium = searchParams.get('premium')

    let templates

    if (category) {
      templates = getTemplatesByCategory(category as any)
    } else if (premium === 'true') {
      templates = getPremiumTemplates()
    } else if (premium === 'false') {
      templates = getFreeTemplates()
    } else {
      templates = getAllTemplates()
    }

    return NextResponse.json({
      templates,
      count: templates.length
    })
  } catch (error) {
    console.error('Templates API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}