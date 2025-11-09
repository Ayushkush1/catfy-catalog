import { NextRequest, NextResponse } from 'next/server'
import { getUser, getUserProfile } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Force Node.js runtime to avoid Edge Runtime issues with Prisma
export const runtime = 'nodejs'

const updateCatalogueSchema = z.object({
  // Basic catalogue info
  name: z.string().min(1, 'Catalogue name is required').max(100).optional(),
  description: z.string().nullable().optional(),
  quote: z.string().nullable().optional(),
  tagline: z.string().nullable().optional(),
  year: z.string().nullable().optional(),
  introImage: z.string().nullable().optional(),
  theme: z.string().nullable().optional(),
  isPublic: z.boolean().nullable().optional(),
  slug: z.string().nullable().optional(),

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
  showPrices: z.boolean().optional(),
  showCategories: z.boolean().optional(),
  allowSearch: z.boolean().optional(),
  showProductCodes: z.boolean().optional(),
  templateId: z.string().optional(),
  template: z.string().optional(), // 🔥 ADD: catalogue.template field

  // Legacy settings object for backward compatibility - accept any structure
  settings: z.any().optional(),
})

interface RouteParams {
  params: {
    id: string
  }
}

// GET - Retrieve specific catalogue
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const profile = await getUserProfile(user.id)
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Continue with normal database query for all users

    // Check if user owns the catalogue or is a team member
    const catalogue = await prisma.catalogue.findFirst({
      where: {
        id: params.id,
        OR: [
          { profileId: profile.id }, // User owns the catalogue
          {
            teamMembers: {
              some: {
                profileId: profile.id,
              },
            },
          }, // User is a team member
        ],
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
        year: catalogue.year,
        introImage: catalogue.introImage,
        theme: catalogue.theme,
        template: catalogue.template,
        isPublic: catalogue.isPublic,
        slug: catalogue.slug,
        version: (catalogue as any).version || 1, // Include version for optimistic locking
        settings: (catalogue.settings as Record<string, any>) || {},
        products: catalogue.products.map(product => ({
          id: product.id,
          name: product.name,
          description: product.description,
          price: Number(product.price), // Convert Decimal to number
          priceDisplay: product.priceDisplay,
          imageUrl:
            product.imageUrl ||
            (product.images && product.images.length > 0
              ? product.images[0]
              : null),
          images: product.images,
          tags: product.tags,
          categoryId: product.categoryId,
          isActive: product.isActive,
          sortOrder: product.sortOrder,
          category: product.category
            ? {
              id: product.category.id,
              name: product.category.name,
              color: product.category.color,
            }
            : null,
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
        profile: {
          id: profile.id,
          fullName: profile.fullName,
          companyName: profile.companyName,
          email: profile.email,
          phone: profile.phone,
          website: profile.website,
          address: profile.address,
          city: profile.city,
          state: profile.state,
          country: profile.country,
          postalCode: profile.postalCode,
          logo: profile.logo,
          tagline: profile.tagline,
          socialLinks: profile.socialLinks,
        },
        productCount: catalogue._count.products,
        categoryCount: catalogue._count.categories,
        createdAt: catalogue.createdAt,
        updatedAt: catalogue.updatedAt,
      },
    })
  } catch (error) {
    console.error('Catalogue retrieval error:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve catalogue' },
      { status: 500 }
    )
  }
}

// PUT - Update catalogue
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const profile = await getUserProfile(user.id)
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Continue with normal database operations for all users

    // Verify catalogue access (ownership or team membership)
    const existingCatalogue = await prisma.catalogue.findFirst({
      where: {
        id: params.id,
        OR: [
          { profileId: profile.id }, // User owns the catalogue
          {
            teamMembers: {
              some: {
                profileId: profile.id,
              },
            },
          }, // User is a team member
        ],
      },
    })

    if (!existingCatalogue) {
      return NextResponse.json(
        { error: 'Catalogue not found or access denied' },
        { status: 404 }
      )
    }

    const body = await request.json()

    console.log('PUT request received for catalogue:', params.id)
    console.log('Request body:', body)

    // Extract version control fields before validation
    const { version: clientVersion, forceUpdate, ...dataToValidate } = body

    console.log('Data to validate (after removing version/forceUpdate):', dataToValidate)

    // Check for version conflicts (optimistic locking)
    const currentVersion = (existingCatalogue as any).version || 1
    const forceUpdateFlag = forceUpdate === true

    if (clientVersion !== undefined && !forceUpdateFlag && clientVersion !== currentVersion) {
      // Version conflict detected
      return NextResponse.json(
        {
          error: 'Version conflict',
          message: 'This catalogue has been modified by another user. Please reload to get the latest version.',
          currentVersion,
          clientVersion,
          updatedAt: existingCatalogue.updatedAt,
        },
        { status: 409 } // 409 Conflict
      )
    }

    let validatedData
    try {
      validatedData = updateCatalogueSchema.parse(dataToValidate)
      console.log('Validated data:', validatedData)
    } catch (validationError) {
      console.error('Validation error details:', validationError)
      if (validationError instanceof z.ZodError) {
        console.error('Validation errors:', JSON.stringify(validationError.errors, null, 2))
      }
      throw validationError
    }
    console.log('Validated data:', validatedData)

    console.log('Existing catalogue settings:', existingCatalogue.settings)

    // Extract flattened fields and reconstruct settings object
    const {
      name,
      description,
      quote,
      tagline,
      year,
      introImage,
      theme,
      isPublic,
      slug,
      // Extract flattened fields
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
      template,
      settings: legacySettings,
      ...rest
    } = validatedData

    // Reconstruct settings object, merging with existing settings
    const existingSettings = (existingCatalogue.settings as any) || {}

    // Build new settings object from flat fields (if provided) or legacy settings object
    const newSettingsFromFlat = {
      ...(showPrices !== undefined && { showPrices }),
      ...(showCategories !== undefined && { showCategories }),
      ...(allowSearch !== undefined && { allowSearch }),
      ...(showProductCodes !== undefined && { showProductCodes }),
      ...(templateId !== undefined && { templateId }),

      // Company Information
      ...((companyName !== undefined || companyDescription !== undefined) && {
        companyInfo: {
          ...existingSettings.companyInfo,
          ...(companyName !== undefined && { companyName }),
          ...(companyDescription !== undefined && { companyDescription }),
        },
      }),

      // Media & Assets
      ...((logoUrl !== undefined || coverImageUrl !== undefined) && {
        mediaAssets: {
          ...existingSettings.mediaAssets,
          ...(logoUrl !== undefined && { logoUrl }),
          ...(coverImageUrl !== undefined && { coverImageUrl }),
        },
      }),

      // Contact Details
      ...((email !== undefined ||
        phone !== undefined ||
        website !== undefined ||
        address !== undefined ||
        contactImage !== undefined ||
        contactQuote !== undefined ||
        contactQuoteBy !== undefined ||
        city !== undefined ||
        state !== undefined ||
        country !== undefined ||
        fullName !== undefined) && {
        contactDetails: {
          ...existingSettings.contactDetails,
          ...(email !== undefined && { email }),
          ...(phone !== undefined && { phone }),
          ...(website !== undefined && { website }),
          ...(address !== undefined && { address }),
          ...(contactImage !== undefined && { contactImage }),
          ...(contactQuote !== undefined && { contactQuote }),
          ...(contactQuoteBy !== undefined && { contactQuoteBy }),
          ...(city !== undefined && { city }),
          ...(state !== undefined && { state }),
          ...(country !== undefined && { country }),
          ...(fullName !== undefined && { fullName }),
        },
      }),

      // Contact Page Description
      ...(contactDescription !== undefined && { contactDescription }),

      // Social Media
      ...((facebook !== undefined ||
        twitter !== undefined ||
        instagram !== undefined ||
        linkedin !== undefined) && {
        socialMedia: {
          ...existingSettings.socialMedia,
          ...(facebook !== undefined && { facebook }),
          ...(twitter !== undefined && { twitter }),
          ...(instagram !== undefined && { instagram }),
          ...(linkedin !== undefined && { linkedin }),
        },
      }),
    }

    // Merge with existing settings and legacy settings object
    const updatedSettings = {
      ...existingSettings,
      ...newSettingsFromFlat,
      ...(legacySettings && legacySettings),
    }

    console.log('Updated settings to save:', updatedSettings)

    // Extract only the basic catalogue fields for database update
    const dbFields = {
      ...(name !== undefined && { name }),
      ...(description !== undefined && { description }),
      ...(quote !== undefined && { quote }),
      ...(tagline !== undefined && { tagline }),
      ...(year !== undefined && { year }),
      ...(introImage !== undefined && { introImage }),
      ...(theme !== undefined && { theme }),
      ...(isPublic !== undefined && { isPublic }),
      ...(slug !== undefined && { slug }),
      ...(template !== undefined && { template }), // 🔥 ADD: Update catalogue.template field
    }

    const updatedCatalogue = (await prisma.catalogue.update({
      where: { id: params.id },
      data: {
        ...dbFields,
        settings: updatedSettings,
        version: currentVersion + 1, // Increment version for optimistic locking
        updatedAt: new Date(),
      } as any,
      include: {
        _count: {
          select: {
            products: true,
            categories: true,
          },
        },
      },
    })) as any

    console.log('Catalogue updated successfully:', updatedCatalogue.id)
    console.log('Final settings saved:', updatedCatalogue.settings)

    // Record analytics
    await prisma.analytics.create({
      data: {
        profileId: profile.id,
        catalogueId: updatedCatalogue.id,
        event: 'PAGE_VIEW',
        metadata: {
          action: 'catalogue_updated',
          updatedFields: Object.keys(validatedData),
        },
      },
    })

    return NextResponse.json({
      success: true,
      catalogue: {
        id: updatedCatalogue.id,
        name: updatedCatalogue.name,
        description: updatedCatalogue.description,
        quote: updatedCatalogue.quote,
        tagline: updatedCatalogue.tagline,
        introImage: updatedCatalogue.introImage,
        theme: updatedCatalogue.theme,
        isPublic: updatedCatalogue.isPublic,
        settings: updatedCatalogue.settings,
        version: updatedCatalogue.version, // Include version in response
        productCount: updatedCatalogue._count.products,
        categoryCount: updatedCatalogue._count.categories,
        createdAt: updatedCatalogue.createdAt,
        updatedAt: updatedCatalogue.updatedAt,
      },
    })
  } catch (error) {
    console.error('Catalogue update error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    const message =
      error instanceof Error ? error.message : 'Failed to update catalogue'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// PATCH - Update catalogue (same as PUT for compatibility)
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  return PUT(request, { params })
}

// DELETE - Delete catalogue
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const profile = await getUserProfile(user.id)
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Verify catalogue ownership
    const catalogue = await prisma.catalogue.findFirst({
      where: {
        id: params.id,
        profileId: profile.id,
      },
      include: {
        products: true,
        categories: true,
      },
    })

    if (!catalogue) {
      return NextResponse.json(
        { error: 'Catalogue not found or access denied' },
        { status: 404 }
      )
    }

    // Delete catalogue and related data (cascade)
    await prisma.$transaction(async tx => {
      // Delete products first (due to foreign key constraints)
      await tx.product.deleteMany({
        where: { catalogueId: params.id },
      })

      // Delete categories
      await tx.category.deleteMany({
        where: { catalogueId: params.id },
      })

      // Delete analytics
      await tx.analytics.deleteMany({
        where: { catalogueId: params.id },
      })

      // Delete exports
      await tx.export.deleteMany({
        where: { catalogueId: params.id },
      })

      // Finally delete the catalogue
      await tx.catalogue.delete({
        where: { id: params.id },
      })
    })

    return NextResponse.json({
      success: true,
      message: 'Catalogue deleted successfully',
    })
  } catch (error) {
    console.error('Catalogue deletion error:', error)

    const message =
      error instanceof Error ? error.message : 'Failed to delete catalogue'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
