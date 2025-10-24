import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Template, TemplateContent } from '@prisma/client'

export const runtime = 'nodejs'

type TemplateWithContents = Template & {
  contents: TemplateContent[]
}

function adaptToTemplateConfig(t: TemplateWithContents) {
  const latestContent = (t.contents || [])[0]
  const isMulti = latestContent?.type === 'MULTI_PAGE_JSON'

  return {
    id: t.id,
    name: t.name,
    description: t.description || '',
    category: t.category || 'modern',
    isPremium: !!t.isPremium,
    version: t.version || '1.0.0',
    previewImage: t.previewImage || null,
    features: [],
    tags: Array.isArray(t.tags) ? t.tags : [],
    pageCount:
      t.pageCount ??
      (isMulti && Array.isArray(latestContent?.data)
        ? latestContent.data.length
        : 1),
    supportedFields: {
      products: [
        'name',
        'description',
        'price',
        'images',
        'sku',
        'tags',
        'currency',
        'priceDisplay',
      ],
      categories: ['name', 'description', 'color'],
      profile: [
        'companyName',
        'logo',
        'email',
        'phone',
        'website',
        'address',
        'description',
        'tagline',
        'socialLinks',
      ],
    },
    compatibleThemes:
      Array.isArray(t.compatibleThemes) && t.compatibleThemes.length
        ? t.compatibleThemes
        : ['*'],
    requiredThemeFeatures: [],
    customProperties: {
      isEditorTemplate: true,
      ...(isMulti
        ? {
            isMultiPageTemplate: true,
            multiPageData: latestContent?.data || [],
          }
        : { editorData: latestContent?.data || {} }),
    },
    createdAt: t.createdAt,
    updatedAt: t.updatedAt,
  }
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params
  try {
    if (!prisma.template) {
      return NextResponse.json(
        { error: 'Templates not available' },
        { status: 404 }
      )
    }

    const t = await prisma.template.findUnique({
      where: { id },
      include: { contents: { orderBy: { createdAt: 'desc' } } },
    })

    if (!t || t.status !== 'PUBLISHED') {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 })
    }

    return NextResponse.json({ template: adaptToTemplateConfig(t) })
  } catch (error) {
    console.error('Public GET template by id error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch template' },
      { status: 500 }
    )
  }
}
