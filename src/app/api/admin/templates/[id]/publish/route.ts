import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  await requireAdmin()

  const { id } = params

  try {
    if (!prisma.template) {
      return NextResponse.json({ error: 'Prisma client not updated for Template model. Please run `npx prisma generate`.' }, { status: 500 })
    }

    const updated = await prisma.template.update({
      where: { id },
      data: { status: 'PUBLISHED', publishedAt: new Date() },
      include: { contents: true },
    })

    return NextResponse.json({ template: updated })
  } catch (error) {
    console.error('Admin publish template error:', error)
    return NextResponse.json({ error: 'Failed to publish template' }, { status: 400 })
  }
}