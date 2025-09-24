import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface RouteParams {
  params: {
    id: string
  }
}

// GET - Retrieve catalogue for preview (public access)
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    // Get catalogue with all related data for preview
    const catalogue = await prisma.catalogue.findFirst({
      where: {
        id: params.id,
        // For preview, we allow access to any catalogue (public or private)
        // This is because the preview URL itself acts as a form of access control
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
          include: {
            _count: {
              select: {
                products: true,
              },
            },
          },
          orderBy: {
            sortOrder: 'asc',
          },
        },
        profile: {
          select: {
            id: true,
            fullName: true,
            firstName: true,
            lastName: true,
            companyName: true,
            email: true,
            phone: true,
            website: true,
            address: true,
            city: true,
            state: true,
            country: true,
            postalCode: true,
            logo: true,
            tagline: true,
            socialLinks: true,
          },
        },
        _count: {
          select: {
            products: true,
            categories: true,
          },
        },
      },
    })

    if (!catalogue) {
      return NextResponse.json(
        { error: 'Catalogue not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      catalogue: {
        id: catalogue.id,
        name: catalogue.name,
        description: catalogue.description,
        quote: catalogue.quote,
        tagline: catalogue.tagline,
        introImage: catalogue.introImage,
        theme: catalogue.theme,
        isPublic: catalogue.isPublic,
        settings: catalogue.settings as Record<string, any> || {},
        templateId: catalogue.templateId, // Include templateId for preview
        products: catalogue.products.map(product => ({
          id: product.id,
          name: product.name,
          description: product.description,
          price: Number(product.price), // Convert Decimal to number
          priceDisplay: product.priceDisplay,
          imageUrl: product.imageUrl || (product.images && product.images.length > 0 ? product.images[0] : null),
          images: product.images,
          tags: product.tags,
          categoryId: product.categoryId,
          isActive: product.isActive,
          sortOrder: product.sortOrder,
          category: product.category ? {
            id: product.category.id,
            name: product.category.name,
            color: product.category.color,
          } : null,
          createdAt: product.createdAt,
          updatedAt: product.updatedAt,
        })),
        categories: catalogue.categories.map(category => ({
          id: category.id,
          name: category.name,
          description: category.description,
          color: category.color,
          sortOrder: category.sortOrder,
          _count: {
            products: category._count.products,
          },
          createdAt: category.createdAt,
          updatedAt: category.updatedAt,
        })),
        profile: catalogue.profile,
        productCount: catalogue._count.products,
        categoryCount: catalogue._count.categories,
        createdAt: catalogue.createdAt,
        updatedAt: catalogue.updatedAt,
      },
    })
  } catch (error) {
    console.error('Catalogue preview retrieval error:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve catalogue for preview' },
      { status: 500 }
    )
  }
}