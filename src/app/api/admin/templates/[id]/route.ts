import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin, getUserProfile } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { Prisma } from '@prisma/client'

export const runtime = 'nodejs'

const updateTemplateSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  category: z.string().min(1).optional(),
  isPremium: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
  previewImage: z.string().url().nullable().optional(),
  pageCount: z.number().nullable().optional(),
  compatibleThemes: z.array(z.string()).optional(),
  version: z.string().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional(),
  content: z
    .object({
      type: z.enum(['SINGLE_PAGE_JSON', 'MULTI_PAGE_JSON']),
      data: z.any(),
    })
    .optional(),
})

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  await requireAdmin()
  const { id } = params

  try {
    if (!prisma.template) {
      return NextResponse.json({ error: 'Prisma client not updated for Template model. Please run `npx prisma generate`.' }, { status: 500 })
    }

    const template = await prisma.template.findUnique({
      where: { id },
      include: { contents: true, author: true },
    })

    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 })
    }

    return NextResponse.json({ template })
  } catch (error) {
    console.error('Admin GET template error:', error)
    return NextResponse.json({ error: 'Failed to fetch template' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await requireAdmin()
  const profile = await getUserProfile(user.id)
  const { id } = params

  try {
    const body = await req.json()
    const parsed = updateTemplateSchema.parse(body)

    if (!prisma.template) {
      return NextResponse.json({ error: 'Prisma client not updated for Template model. Please run `npx prisma generate`.' }, { status: 500 })
    }

    // Build update data
    const updateData: Prisma.TemplateUpdateInput = {
      updatedAt: new Date(),
    }

    if (parsed.name !== undefined) updateData.name = parsed.name
    if (parsed.description !== undefined) updateData.description = parsed.description
    if (parsed.category !== undefined) updateData.category = parsed.category
    if (parsed.isPremium !== undefined) updateData.isPremium = parsed.isPremium
    if (parsed.tags !== undefined) updateData.tags = parsed.tags
    if (parsed.previewImage !== undefined) updateData.previewImage = parsed.previewImage || undefined
    if (parsed.pageCount !== undefined) updateData.pageCount = parsed.pageCount ?? undefined
    if (parsed.compatibleThemes !== undefined) updateData.compatibleThemes = parsed.compatibleThemes.length ? parsed.compatibleThemes : ['*']
    if (parsed.version !== undefined) updateData.version = parsed.version
    if (parsed.status !== undefined) updateData.status = parsed.status
    if (profile?.id) {
      updateData.author = {
        connect: { id: profile.id }
      }
    }

    // If content provided, create a new content entry (versioned)
    if (parsed.content) {
      updateData.contents = {
        create: {
          type: parsed.content.type,
          data: parsed.content.data as Prisma.InputJsonValue,
        },
      }
    }

    const updated = await prisma.template.update({
      where: { id },
      data: updateData,
      include: { contents: true },
    })

    return NextResponse.json({ template: updated })
  } catch (error) {
    console.error('Admin PUT template error:', error)
    const msg = error instanceof Error ? error.message : 'Failed to update template'
    return NextResponse.json({ error: msg }, { status: 400 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  await requireAdmin()
  const { id } = params

  try {
    if (!prisma.template) {
      return NextResponse.json({ error: 'Prisma client not updated for Template model. Please run `npx prisma generate`.' }, { status: 500 })
    }

    // Cascade delete will remove contents via Prisma relation
    await prisma.template.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Admin DELETE template error:', error)
    return NextResponse.json({ error: 'Failed to delete template' }, { status: 400 })
  }
}