import { NextRequest, NextResponse } from 'next/server'
import { getTemplateById, getAllTemplates } from '@/templates'

export async function GET(
  request: NextRequest,
  { params }: { params: { templateId: string } }
) {
  try {
    const { templateId } = params

    // Handle special case for 'default' template
    if (templateId === 'default') {
      const allTemplates = getAllTemplates()
      const defaultTemplate = allTemplates.find(t => t.id === 'modern-4page') || allTemplates[0]
      
      if (!defaultTemplate) {
        return NextResponse.json(
          { error: 'No templates available' },
          { status: 404 }
        )
      }

      return NextResponse.json({
        template: defaultTemplate
      })
    }

    // Get specific template by ID
    const template = getTemplateById(templateId)

    if (!template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      template
    })
  } catch (error) {
    console.error('Template API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { templateId: string } }
) {
  try {
    const { templateId } = params
    const body = await request.json()

    // For now, just return success as template updates would be handled
    // by the template registry system
    return NextResponse.json({
      success: true,
      templateId,
      data: body
    })
  } catch (error) {
    console.error('Template update API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}