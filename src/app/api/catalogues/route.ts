import { NextRequest, NextResponse } from 'next/server'
import { getUser, getUserProfile, isAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { AccountType } from '@prisma/client'
import { z } from 'zod'

// Force Node.js runtime to avoid Edge Runtime issues with Prisma
export const runtime = 'nodejs'

const createCatalogueSchema = z.object({
  // Basic catalogue info
  name: z.string().min(1, 'Catalogue name is required').max(100),
  description: z.string().optional(),
  quote: z.string().optional(),
  tagline: z.string().optional(),
  year: z.string().optional(),
  introImage: z.string().optional(),
  theme: z.string().default('modern'),
  isPublic: z.boolean().default(false),

  // Company/Profile information (flattened)
  companyName: z.string().optional(),
  companyDescription: z.string().optional(),
  fullName: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  website: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),

  // Media assets (flattened)
  logoUrl: z.string().optional(),
  coverImageUrl: z.string().optional(),

  // Contact page fields (flattened)
  contactImage: z.string().optional(),
  contactDescription: z.string().optional(),
  contactQuote: z.string().optional(),
  contactQuoteBy: z.string().optional(),

  // Social media (flattened)
  facebook: z.string().optional(),
  twitter: z.string().optional(),
  instagram: z.string().optional(),
  linkedin: z.string().optional(),

  // Template settings (flattened)
  showPrices: z.boolean().default(true),
  showCategories: z.boolean().default(true),
  allowSearch: z.boolean().default(true),
  showProductCodes: z.boolean().default(false),
  templateId: z.string().optional(),
})

const updateCatalogueSchema = createCatalogueSchema.partial()

// GET - List user's catalogues
export async function GET(request: NextRequest) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    let profile = await getUserProfile(user.id)
    if (!profile) {
      // Create profile automatically if it doesn't exist using upsert
      try {
        profile = await prisma.profile.upsert({
          where: { id: user.id },
          update: {},
          create: {
            id: user.id,
            email: user.email || '',
            accountType: AccountType.INDIVIDUAL, // Default to INDIVIDUAL account
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          include: {
            catalogues: {
              orderBy: { updatedAt: 'desc' },
              take: 5,
            },
            subscriptions: {
              where: { status: 'ACTIVE' },
              orderBy: { createdAt: 'desc' },
              take: 1,
            },
          },
        })
      } catch (error) {
        console.error('Failed to create profile:', error)
        // Fallback: try to find existing profile
        try {
          profile = await prisma.profile.findUnique({
            where: { id: user.id },
            include: {
              catalogues: {
                orderBy: { updatedAt: 'desc' },
                take: 5,
              },
              subscriptions: {
                where: { status: 'ACTIVE' },
                orderBy: { createdAt: 'desc' },
                take: 1,
              },
            },
          })
          if (!profile) {
            return NextResponse.json(
              { error: 'Failed to create or find profile' },
              { status: 500 }
            )
          }
        } catch (fallbackError) {
          console.error('Fallback profile lookup failed:', fallbackError)
          return NextResponse.json(
            { error: 'Failed to create or find profile' },
            { status: 500 }
          )
        }
      }
    }

    // Continue with normal database query for all users

    const { searchParams } = new URL(request.url)
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50)
    const offset = parseInt(searchParams.get('offset') || '0')
    const search = searchParams.get('search')
    const isPublic = searchParams.get('public')

    // Build where clause to include both owned catalogues and team member catalogues
    const baseWhere: any = {
      OR: [
        { profileId: profile.id }, // Catalogues owned by user
        {
          teamMembers: {
            some: {
              profileId: profile.id,
            },
          },
        }, // Catalogues where user is a team member
      ],
    }

    // Add search filters if provided
    if (search) {
      baseWhere.AND = [
        {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
          ],
        },
      ]
    }

    // Add public filter if provided
    if (isPublic !== null) {
      if (baseWhere.AND) {
        baseWhere.AND.push({ isPublic: isPublic === 'true' })
      } else {
        baseWhere.AND = [{ isPublic: isPublic === 'true' }]
      }
    }

    const catalogues = await prisma.catalogue.findMany({
      where: baseWhere,
      include: {
        products: {
          select: {
            id: true,
          },
        },
        categories: {
          select: {
            id: true,
          },
        },
        teamMembers: {
          where: {
            profileId: profile.id,
          },
          select: {
            role: true,
          },
        },
        _count: {
          select: {
            products: true,
            categories: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
      take: limit,
      skip: offset,
    })

    const total = await prisma.catalogue.count({ where: baseWhere })

    return NextResponse.json({
      catalogues: catalogues.map(catalogue => {
        const isOwner = catalogue.profileId === profile.id
        const teamMemberRole =
          catalogue.teamMembers.length > 0
            ? catalogue.teamMembers[0].role
            : null

        return {
          id: catalogue.id,
          name: catalogue.name,
          description: catalogue.description,
          theme: catalogue.theme,
          isPublic: catalogue.isPublic,
          settings: catalogue.settings,
          userRole: isOwner ? 'owner' : teamMemberRole,
          isOwner,
          _count: {
            products: catalogue._count.products,
            categories: catalogue._count.categories,
          },
          createdAt: catalogue.createdAt,
          updatedAt: catalogue.updatedAt,
        }
      }),
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    })
  } catch (error) {
    console.error('Catalogue listing error:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve catalogues' },
      { status: 500 }
    )
  }
}

// POST - Create new catalogue
export async function POST(request: NextRequest) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    let profile = await getUserProfile(user.id)
    if (!profile) {
      // Create profile automatically if it doesn't exist using upsert
      try {
        profile = await prisma.profile.upsert({
          where: { id: user.id },
          update: {},
          create: {
            id: user.id,
            email: user.email || '',
            accountType: AccountType.INDIVIDUAL, // Default to INDIVIDUAL account
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          include: {
            catalogues: {
              orderBy: { updatedAt: 'desc' },
              take: 5,
            },
            subscriptions: {
              where: { status: 'ACTIVE' },
              orderBy: { createdAt: 'desc' },
              take: 1,
            },
          },
        })
      } catch (error) {
        console.error('Failed to create profile:', error)
        // Fallback: try to find existing profile
        try {
          profile = await prisma.profile.findUnique({
            where: { id: user.id },
            include: {
              catalogues: {
                orderBy: { updatedAt: 'desc' },
                take: 5,
              },
              subscriptions: {
                where: { status: 'ACTIVE' },
                orderBy: { createdAt: 'desc' },
                take: 1,
              },
            },
          })
          if (!profile) {
            return NextResponse.json(
              { error: 'Failed to create or find profile' },
              { status: 500 }
            )
          }
        } catch (fallbackError) {
          console.error('Fallback profile lookup failed:', fallbackError)
          return NextResponse.json(
            { error: 'Failed to create or find profile' },
            { status: 500 }
          )
        }
      }
    }

    // Ensure profile exists at this point
    if (!profile) {
      return NextResponse.json(
        { error: 'Failed to create or find profile' },
        { status: 500 }
      )
    }

    const body = await request.json()

    // Continue with normal catalogue creation for all users

    // Check subscription limits
    const activeSubscription = await prisma.subscription.findFirst({
      where: {
        profileId: profile.id,
        status: {
          in: ['ACTIVE', 'TRIALING'],
        },
      },
    })

    const catalogueCount = await prisma.catalogue.count({
      where: { profileId: profile.id },
    })

    // Free tier: 1 catalogue, Paid: unlimited. Admin bypasses limit.
    const admin = await isAdmin()
    if (!admin && !activeSubscription && catalogueCount >= 1) {
      return NextResponse.json(
        { error: 'Upgrade to create more catalogues' },
        { status: 403 }
      )
    }

    const validatedData = createCatalogueSchema.parse(body)

    // Extract basic catalogue fields
    const {
      name,
      description,
      quote,
      tagline,
      year,
      introImage,
      theme,
      isPublic,
      // Extract flattened fields to reconstruct settings object for database
      companyName,
      companyDescription,
      fullName,
      email,
      phone,
      website,
      address,
      city,
      state,
      country,
      logoUrl,
      coverImageUrl,
      contactImage,
      contactDescription,
      contactQuote,
      contactQuoteBy,
      facebook,
      twitter,
      instagram,
      linkedin,
      showPrices,
      showCategories,
      allowSearch,
      showProductCodes,
      templateId,
      ...rest
    } = validatedData

    // Reconstruct settings object for database storage (maintaining backward compatibility)
    const settings = {
      showPrices: showPrices ?? true,
      showCategories: showCategories ?? true,
      allowSearch: allowSearch ?? true,
      showProductCodes: showProductCodes ?? false,
      templateId,
      // Company Information
      companyInfo: {
        companyName,
        companyDescription,
      },
      // Media & Assets
      mediaAssets: {
        logoUrl,
        coverImageUrl,
      },
      // Contact Details
      contactDetails: {
        email,
        phone,
        website,
        address,
        contactImage,
        contactQuote,
        contactQuoteBy,
        city,
        state,
        country,
        fullName,
      },
      // Contact Page Description
      contactDescription,
      // Social Media
      socialMedia: {
        facebook,
        twitter,
        instagram,
        linkedin,
      },
      // IframeEditor settings for HTML templates
      ...(templateId
        ? {
            iframeEditor: {
              templateId,
              engine: 'mustache', // Default engine for HTML templates
              pageCount: 1, // Will be updated when template is loaded
            },
          }
        : {}),
    }

    const catalogue = await prisma.catalogue.create({
      data: {
        name,
        description,
        quote,
        tagline,
        year,
        introImage,
        theme,
        isPublic,
        profileId: profile.id,
        template: templateId, // Save template ID to catalogue.template field
        settings,
      },
      include: {
        _count: {
          select: {
            products: true,
            categories: true,
          },
        },
      },
    })

    // Record analytics
    await prisma.analytics.create({
      data: {
        profileId: profile.id,
        catalogueId: catalogue.id,
        event: 'CATALOGUE_CREATED',
        metadata: {
          theme: catalogue.theme,
          isPublic: catalogue.isPublic,
        },
      },
    })

    // Track theme selection for analytics if theme is specified
    if (catalogue.theme) {
      try {
        await prisma.themeAnalytics.create({
          data: {
            themeId: catalogue.theme,
            themeName: catalogue.theme, // We'll use the theme ID as name for now
            catalogueId: catalogue.id,
            profileId: profile.id,
            selectedAt: new Date(),
          },
        })
      } catch (analyticsError) {
        console.error(
          'Failed to track theme selection during catalogue creation:',
          analyticsError
        )
        // Don't fail the catalogue creation if analytics tracking fails
      }
    }

    return NextResponse.json({
      success: true,
      catalogue: {
        id: catalogue.id,
        name: catalogue.name,
        description: catalogue.description,
        theme: catalogue.theme,
        isPublic: catalogue.isPublic,
        settings: catalogue.settings,
        productCount: catalogue._count.products,
        categoryCount: catalogue._count.categories,
        createdAt: catalogue.createdAt,
        updatedAt: catalogue.updatedAt,
      },
    })
  } catch (error) {
    console.error('Catalogue creation error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    const message =
      error instanceof Error ? error.message : 'Failed to create catalogue'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
