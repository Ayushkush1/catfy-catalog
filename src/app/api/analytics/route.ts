import { NextRequest, NextResponse } from 'next/server'
import { getUser, getUserProfile } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// Force Node.js runtime to avoid Edge Runtime issues with Prisma
export const runtime = 'nodejs'

// GET - Get analytics data for the current user
export async function GET(request: NextRequest) {
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

    // Get date range from query params (default to last 30 days)
    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '30')
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // Get catalogue statistics
    const catalogues = await prisma.catalogue.findMany({
      where: {
        profileId: profile.id,
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

    const totalCatalogues = catalogues.length
    const publishedCatalogues = catalogues.filter(
      c => c.status === 'PUBLISHED'
    ).length
    const draftCatalogues = catalogues.filter(c => c.status === 'DRAFT').length
    const archivedCatalogues = catalogues.filter(
      c => c.status === 'ARCHIVED'
    ).length

    const totalProducts = catalogues.reduce(
      (sum, cat) => sum + cat._count.products,
      0
    )
    const totalCategories = catalogues.reduce(
      (sum, cat) => sum + cat._count.categories,
      0
    )

    // Calculate total views from public catalogues
    const totalViews = catalogues.reduce(
      (sum, cat) => sum + (cat.viewCount || 0),
      0
    )

    // Get analytics events
    const analytics = await prisma.analytics.findMany({
      where: {
        profileId: profile.id,
        createdAt: {
          gte: startDate,
        },
      },
    })

    // Calculate event counts
    const eventCounts = analytics.reduce(
      (acc, event) => {
        acc[event.event] = (acc[event.event] || 0) + 1
        return acc
      },
      {} as Record<string, number>
    )

    // Get export statistics
    const exports = await prisma.export.findMany({
      where: {
        profileId: profile.id,
        createdAt: {
          gte: startDate,
        },
      },
    })

    const totalExports = exports.length
    const completedExports = exports.filter(
      e => e.status === 'COMPLETED'
    ).length
    const pendingExports = exports.filter(e => e.status === 'PENDING').length
    const failedExports = exports.filter(e => e.status === 'FAILED').length

    // Get theme analytics
    const themeUsage = await prisma.themeAnalytics.findMany({
      where: {
        profileId: profile.id,
        selectedAt: {
          gte: startDate,
        },
      },
      select: {
        themeName: true,
      },
    })

    const themeCounts = themeUsage.reduce(
      (acc, theme) => {
        acc[theme.themeName] = (acc[theme.themeName] || 0) + 1
        return acc
      },
      {} as Record<string, number>
    )

    // Get subscription data
    const subscription = await prisma.subscription.findFirst({
      where: {
        profileId: profile.id,
        status: {
          in: ['ACTIVE', 'TRIALING'],
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // Calculate growth metrics (compare with previous period)
    const previousPeriodStart = new Date()
    previousPeriodStart.setDate(previousPeriodStart.getDate() - days * 2)
    const previousPeriodEnd = startDate

    const previousAnalytics = await prisma.analytics.findMany({
      where: {
        profileId: profile.id,
        createdAt: {
          gte: previousPeriodStart,
          lt: previousPeriodEnd,
        },
      },
    })

    const previousEventCounts = previousAnalytics.reduce(
      (acc, event) => {
        acc[event.event] = (acc[event.event] || 0) + 1
        return acc
      },
      {} as Record<string, number>
    )

    // Calculate growth percentages
    const calculateGrowth = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0
      return Math.round(((current - previous) / previous) * 100)
    }

    const catalogueGrowth = calculateGrowth(
      eventCounts.CATALOGUE_CREATED || 0,
      previousEventCounts.CATALOGUE_CREATED || 0
    )

    const exportGrowth = calculateGrowth(
      eventCounts.EXPORT_GENERATED || 0,
      previousEventCounts.EXPORT_GENERATED || 0
    )

    // Get daily activity for the last 7 days
    const dailyActivity = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dayStart = new Date(date)
      dayStart.setHours(0, 0, 0, 0)
      const dayEnd = new Date(date)
      dayEnd.setHours(23, 59, 59, 999)

      const dayEvents = analytics.filter(
        event => event.createdAt >= dayStart && event.createdAt <= dayEnd
      ).length

      dailyActivity.push({
        date: date.toISOString().split('T')[0],
        activity: dayEvents,
      })
    }

    // Get templates data
    const templates = await prisma.template.findMany({
      where: {
        OR: [{ authorId: profile.id }, { status: 'PUBLISHED' }],
      },
    })

    const userTemplates = templates.filter(
      t => t.authorId === profile.id
    ).length
    const availableTemplates = templates.length

    // Build a small catalogue list to surface public URLs for the frontend
    const catalogueList = catalogues.map(c => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      isPublic: c.isPublic,
      customDomain: c.customDomain || null,
      createdAt: c.createdAt,
    }))

    return NextResponse.json({
      overview: {
        totalCatalogues,
        publishedCatalogues,
        draftCatalogues,
        archivedCatalogues,
        totalProducts,
        totalCategories,
        totalViews,
        totalExports,
        completedExports,
        pendingExports,
        failedExports,
        userTemplates,
        availableTemplates,
      },
      // small catalogue list for frontend (id, name, slug, isPublic, customDomain)
      catalogues: catalogueList,
      growth: {
        catalogueGrowth,
        exportGrowth,
      },
      events: eventCounts,
      themes: themeCounts,
      dailyActivity,
      subscription: subscription
        ? {
            plan: subscription.plan,
            status: subscription.status,
            billingCycle: subscription.billingCycle,
            currentPeriodEnd: subscription.currentPeriodEnd,
          }
        : null,
    })
  } catch (error) {
    console.error('Analytics error:', error)
    return NextResponse.json(
      { error: 'Failed to retrieve analytics' },
      { status: 500 }
    )
  }
}
