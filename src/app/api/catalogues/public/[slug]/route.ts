import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params

    // Fetch public catalogue by slug
    const catalogue = await prisma.catalogue.findFirst({
      where: {
        slug: slug,
        isPublic: true,
      },
      include: {
        products: {
          include: {
            category: true,
          },
          orderBy: {
            sortOrder: 'asc',
          },
        },
        categories: {
          orderBy: {
            name: 'asc',
          },
        },
        profile: {
          select: {
            fullName: true,
            companyName: true,
            logo: true,
          },
        },
      },
    })

    if (!catalogue) {
      return NextResponse.json(
        { error: 'Catalogue not found or not public' },
        { status: 404 }
      )
    }

    // Increment view count
    await prisma.catalogue.update({
      where: { id: catalogue.id },
      data: {
        viewCount: {
          increment: 1,
        },
      },
    })

    return NextResponse.json(catalogue)
  } catch (error) {
    console.error('Error fetching public catalogue:', error)
    return NextResponse.json(
      { error: 'Failed to fetch catalogue' },
      { status: 500 }
    )
  }
}
