import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, getUserProfile } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import { z } from 'zod'

export const runtime = 'nodejs'

const createTemplateSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  category: z.string().min(1),
  isPremium: z.boolean().default(false),
  tags: z.array(z.string()).default([]),
  previewImage: z.string().url().optional(),
  pageCount: z.number().optional(),
  compatibleThemes: z.array(z.string()).default([]),
  version: z.string().default('1.0.0'),
  content: z.object({
    type: z.enum(['SINGLE_PAGE_JSON', 'MULTI_PAGE_JSON']),
    data: z.any(),
  }),
})

export async function GET(req: NextRequest) {
  await requireAdmin()

  try {
    // If Prisma isn't generated, guard against missing model
    if (!prisma.template) {
      return NextResponse.json({
        templates: [],
        warning: 'Prisma client not updated for Template model yet.',
      })
    }

    const templates = await prisma.template.findMany({
      include: {
        author: true,
        contents: true,
      },
      orderBy: { updatedAt: 'desc' },
    })

    return NextResponse.json({ templates })
  } catch (error) {
    console.error('Admin GET templates error:', error)
    return NextResponse.json(
      { error: 'Failed to list templates' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  console.log('🚀 [API] POST /api/admin/templates - Request received')

  try {
    console.log('🔍 [API] Checking admin authentication...')
    const user = await requireAdmin()
    console.log(
      '✅ [API] Admin authentication passed:',
      user ? { id: user.id, email: user.email } : 'No user'
    )

    console.log('🔍 [API] Getting user profile...')
    const profile = await getUserProfile()
    console.log(
      '✅ [API] User profile:',
      profile ? { id: profile.id, email: profile.email } : 'No profile'
    )

    if (!profile) {
      console.log('❌ [API] Profile not found')
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    console.log('🔍 [API] Parsing request body...')
    const body = await request.json()
    console.log('🔍 [API] Request body:', JSON.stringify(body, null, 2))

    console.log('🔍 [API] Validating with schema...')
    const parsed = createTemplateSchema.parse(body)
    console.log('✅ [API] Schema validation passed')

    console.log('🔍 [API] Creating template in database...')
    const template = await prisma.template.create({
      data: {
        name: parsed.name,
        description: parsed.description,
        category: parsed.category,
        tags: parsed.tags,
        isPremium: parsed.isPremium,
        author: { connect: { id: profile.id } },
        contents: {
          create: {
            type: parsed.content.type as any,
            data: parsed.content.data as Prisma.InputJsonValue,
          },
        },
      },
      include: {
        author: true,
        contents: true,
      },
    })
    console.log('✅ [API] Template created successfully:', template.id)

    return NextResponse.json(template)
  } catch (error) {
    console.error('❌ [API] Error creating template:', error)
    if (error instanceof z.ZodError) {
      console.error('❌ [API] Validation error details:', error.errors)
      return NextResponse.json(
        { error: 'Invalid data', details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
