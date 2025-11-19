'use client'

import { Poppins } from 'next/font/google'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  BarChart3,
  TrendingUp,
  Users,
  Eye,
  DollarSign,
  ArrowUp,
  ArrowDown,
  ArrowRight,
  FolderOpen,
  LayoutTemplate,
  Paintbrush,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { getAllTemplates } from '@/templates'
import { getAllThemes } from '@/themes'
import { toast } from 'sonner'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
})

export default function AnalyticsPage() {
  const router = useRouter()
  const [analyticsData, setAnalyticsData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const CACHE_KEY = 'catfy:analyticsData'
    const CACHE_TTL = 1000 * 60 * 5 // 5 minutes

    const fetchAnalytics = async () => {
      try {
        // Try cache first (stale-while-revalidate)
        try {
          const raw = sessionStorage.getItem(CACHE_KEY)
          if (raw) {
            const parsed = JSON.parse(raw)
            if (parsed?._ts && Date.now() - parsed._ts < CACHE_TTL) {
              setAnalyticsData(parsed.data)
              setLoading(false)
                // revalidate in background
                ; (async () => {
                  try {
                    const response = await fetch('/api/analytics')
                    if (response.ok) {
                      const fresh = await response.json()
                      setAnalyticsData(fresh)
                      try {
                        sessionStorage.setItem(
                          CACHE_KEY,
                          JSON.stringify({ _ts: Date.now(), data: fresh })
                        )
                      } catch (e) { }
                    }
                  } catch (e) { }
                })()
              return
            }
          }
        } catch (e) {
          // ignore cache errors
        }

        const response = await fetch('/api/analytics')
        if (response.ok) {
          const data = await response.json()
          setAnalyticsData(data)
          try {
            sessionStorage.setItem(
              CACHE_KEY,
              JSON.stringify({ _ts: Date.now(), data })
            )
          } catch (e) { }
        }
      } catch (error) {
        console.error('Error fetching analytics:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()

    // Add custom animations
    const style = document.createElement('style')
    style.textContent = `
      @keyframes float {
        0%, 100% { transform: translateY(0px) rotate(0deg); }
        50% { transform: translateY(-5px) rotate(2deg); }
      }

      @keyframes shimmer {
        0% { background-position: -200% 0; }
        100% { background-position: 200% 0; }
      }

      @keyframes pulseGlow {
        0%, 100% { box-shadow: 0 0 10px rgba(99, 102, 241, 0.2); }
        50% { box-shadow: 0 0 20px rgba(99, 102, 241, 0.4), 0 0 30px rgba(147, 51, 234, 0.2); }
      }

      .animate-float {
        animation: float 6s ease-in-out infinite;
      }

      .animate-shimmer {
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
        background-size: 200% 100%;
        animation: shimmer 4s infinite;
      }

      .animate-pulse-glow {
        animation: pulseGlow 3s ease-in-out infinite;
      }
    `
    document.head.appendChild(style)

    return () => {
      if (document.head.contains(style)) {
        document.head.removeChild(style)
      }
    }
  }, [])

  const stats = analyticsData
    ? [
      {
        title: 'Total Catalogues',
        value: analyticsData.overview?.totalCatalogues?.toString() || '0',
        change: `${(analyticsData.growth?.catalogueGrowth ?? 0) >= 0 ? '+' : ''}${analyticsData.growth?.catalogueGrowth ?? 0}%`,
        trend:
          (analyticsData.growth?.catalogueGrowth ?? 0) >= 0 ? 'up' : 'down',
        icon: FolderOpen,
        color: 'from-purple-500 to-pink-500',
        subtitle: `${analyticsData.overview?.publishedCatalogues ?? 0} published`,
      },

      {
        title: 'Public Views',
        value: analyticsData.overview?.totalViews?.toString() || '0',
        change: 'Total views',
        trend: 'up',
        icon: Eye,
        color: 'from-blue-500 to-cyan-500',
        subtitle: 'From public URLs',
      },
      {
        title: 'Templates Used',
        value: analyticsData.overview?.userTemplates?.toString() || '0',
        change: `${analyticsData.overview?.availableTemplates ?? 0} available`,
        trend: 'up',
        icon: Paintbrush,
        color: 'from-orange-500 to-red-500',
        subtitle: 'Custom templates',
      },
    ]
    : []

  const workspaceProgress = analyticsData?.overview
    ? Math.min(
      Math.round(
        ((analyticsData.overview.publishedCatalogues ?? 0) /
          (analyticsData.overview.totalCatalogues ?? 1)) *
        100
      ),
      100
    )
    : 0

  // catalogue visibility counts
  const _totalCatalogues = analyticsData?.overview?.totalCatalogues ?? 0
  const _publicCount = (analyticsData?.catalogues ?? []).filter(
    (c: any) => c?.isPublic
  ).length
  const _privateCount = Math.max(0, _totalCatalogues - _publicCount)
  const _percentPublic =
    _totalCatalogues > 0
      ? Math.round((_publicCount / _totalCatalogues) * 100)
      : 0
  if (loading) {
    return (
      <div
        className={`${poppins.className} relative flex min-h-screen overflow-hidden bg-gradient-to-br from-blue-50 via-pink-50 to-blue-50`}
      >
        <div className="relative z-10 ml-28 flex-1">
          <div className="">
            <DashboardHeader
              title="Analytics Overview"
              subtitle="Track your performance metrics and insights"
            />
          </div>
          <div className="container px-5">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-6 rounded-3xl border border-white/20 bg-white/60 px-6 py-4 shadow-lg backdrop-blur">
                <div className="flex items-center gap-3">
                  <span className="animate-pulse rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 px-4 py-2 text-sm font-bold text-white shadow-md">
                    ...
                  </span>
                  <span className="text-sm font-semibold text-gray-700">
                    New Catalogues
                  </span>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => router.push('/dashboard')}
                  className="rounded-2xl border border-indigo-200/50 bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 shadow-md transition-all duration-300 hover:scale-105 hover:shadow-lg"
                >
                  Manage catalogues
                </Button>
              </div>
              <div className="ml-6 text-right">
                <span className="text-sm font-semibold text-gray-600">
                  Workspace progress
                </span>
                <div className="mt-3 w-48 rounded-full bg-white/60 shadow-inner">
                  <div className="h-3 animate-pulse rounded-full bg-gradient-to-r from-indigo-400 to-purple-600 shadow-sm" />
                </div>
              </div>
            </div>
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="space-y-6 lg:col-span-2">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                  {[...Array(3)].map((_, i) => (
                    <Card
                      key={i}
                      className="group relative overflow-hidden rounded-3xl border-0 bg-white/60 shadow-lg backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
                    >
                      <div className="absolute right-0 top-0 h-20 w-20 -translate-y-8 translate-x-8 transform opacity-10">
                        <div
                          className={`h-full w-full rounded-full bg-gradient-to-br from-purple-500 to-pink-500`}
                        />
                      </div>
                      <CardContent className="relative p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="mb-2 text-sm font-semibold text-gray-600">
                              Loading...
                            </p>
                            <h3 className="mb-3 text-3xl font-extrabold text-gray-900">
                              ...
                            </h3>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-500">
                                vs last month
                              </span>
                            </div>
                          </div>
                          <div
                            className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-gray-400 to-gray-500 shadow-lg`}
                          >
                            <div className="h-6 w-6 rounded bg-white/50" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!analyticsData) {
    return (
      <div
        className={`${poppins.className} relative flex min-h-screen overflow-hidden bg-gradient-to-br from-blue-50 via-pink-50 to-blue-50`}
      >
        <div className="relative z-10 ml-28 flex-1">
          <div className="container py-6">
            <div className="text-center">
              <p className="text-gray-600">Failed to load analytics data</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`${poppins.className} relative flex min-h-screen overflow-hidden bg-gradient-to-br from-blue-50 via-pink-50 to-blue-50 pb-10`}
    >
      <div className="relative z-10 ml-28 flex-1">
        <div className="">
          <DashboardHeader
            title="Analytics Overview"
            subtitle="Track your performance metrics and insights"
          />
        </div>

        {/* Top pill: New Items / Manage */}
        <div className="container px-5">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-6 rounded-3xl border border-white/20 bg-white/60 px-6 py-4 shadow-lg backdrop-blur">
              <div className="flex items-center gap-3">
                <span className="rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 px-4 py-2 text-sm font-bold text-white shadow-md">
                  {Math.max(
                    0,
                    (analyticsData.overview?.totalCatalogues ?? 0) - 1
                  )}
                </span>
                <span className="text-sm font-semibold text-gray-700">
                  New Catalogues
                </span>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => router.push('/dashboard')}
                className="rounded-2xl border border-indigo-200/50 bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 shadow-md transition-all duration-300 hover:scale-105 hover:shadow-lg"
              >
                Manage catalogues
              </Button>
            </div>
            <div className="ml-6 text-right">
              <span className="text-sm font-semibold text-gray-600">
                Workspace progress
              </span>
              <div className="mt-3 w-48 rounded-full bg-white/60 shadow-md">
                <div
                  className="h-3 rounded-full bg-gradient-to-r from-indigo-400 to-purple-600 shadow-md"
                  style={{ width: `${workspaceProgress}%` }}
                />
              </div>
            </div>
          </div>

          {/* Main content two-column like the reference UI */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Left column */}
            <div className="space-y-6 lg:col-span-2">
              {/* Stats Grid (4 items) */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {stats.map(stat => {
                  const Icon = stat.icon
                  return (
                    <Card
                      key={stat.title}
                      className="group relative overflow-hidden rounded-3xl border-0 bg-white/60 shadow-lg backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
                    >
                      <div className="absolute right-0 top-0 h-20 w-20 -translate-y-8 translate-x-8 transform opacity-10">
                        <div
                          className={`h-full w-full rounded-full bg-gradient-to-br ${stat.color}`}
                        />
                      </div>
                      <CardContent className="relative p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="mb-2 text-sm font-semibold text-gray-600">
                              {stat.title}
                            </p>
                            <h3 className="mb-3 text-3xl font-extrabold text-gray-900">
                              {stat.value}
                            </h3>
                            <div className="flex items-center gap-1 whitespace-nowrap">
                              {stat.trend === 'up' ? (
                                <ArrowUp className="h-3 w-3 text-emerald-600" />
                              ) : (
                                <ArrowDown className="h-3 w-3 text-rose-600" />
                              )}
                              <span
                                className={`text-xs font-medium ${stat.trend === 'up' ? 'text-emerald-600' : 'text-rose-600'}`}
                              >
                                {stat.change}
                              </span>
                              <span className="text-xs text-gray-500">
                                vs last month
                              </span>
                            </div>
                          </div>
                          <div
                            className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${stat.color} shadow-lg transition-transform duration-300 group-hover:scale-110`}
                          >
                            <Icon className="h-6 w-6 text-white" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>

              {/* Catalogue Summary */}
              <Card className="relative overflow-hidden rounded-3xl border-0 bg-white/60 shadow-lg backdrop-blur">
                <div className="absolute right-0 top-0 h-32 w-32 -translate-y-16 translate-x-16 transform opacity-10">
                  <div className="h-full w-full rounded-full bg-gradient-to-br from-purple-400 to-indigo-600" />
                </div>
                <CardHeader className="relative pb-4">
                  <CardTitle className="flex items-center justify-between text-lg font-semibold text-gray-900">
                    <span>Catalogue Summary</span>
                    <span className="rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 px-3 py-1 text-xs font-semibold text-white">
                      Today
                    </span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative">
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {/* Pie-like circle */}
                    <div className="flex items-center gap-6">
                      <div className="relative h-24 w-24">
                        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-100 to-indigo-100" />
                        <svg className="absolute inset-0 h-full w-full -rotate-90">
                          <circle
                            cx="48"
                            cy="48"
                            r="40"
                            stroke="#E5E7EB"
                            strokeWidth="8"
                            fill="none"
                          />
                          <circle
                            cx="48"
                            cy="48"
                            r="40"
                            stroke="url(#gradient)"
                            strokeWidth="8"
                            fill="none"
                            strokeDasharray={`${2 * Math.PI * 40}`}
                            strokeDashoffset={`${2 * Math.PI * 40 * (1 - ((analyticsData.overview?.totalCatalogues ?? 0) > 0 ? (analyticsData.overview?.publishedCatalogues ?? 0) / (analyticsData.overview?.totalCatalogues ?? 1) : 0))}`}
                            strokeLinecap="round"
                          />
                        </svg>
                        <defs>
                          <linearGradient
                            id="gradient"
                            x1="0%"
                            y1="0%"
                            x2="100%"
                            y2="100%"
                          >
                            <stop offset="0%" stopColor="#A78BFA" />
                            <stop offset="100%" stopColor="#6366F1" />
                          </linearGradient>
                        </defs>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-600">
                          Created
                        </p>
                        <h4 className="text-2xl font-bold text-gray-900">
                          {analyticsData.overview?.totalCatalogues ?? 0}
                        </h4>
                        <p className="text-xs text-gray-500">
                          Total catalogues in your workspace
                        </p>
                      </div>
                    </div>

                    {/* Show public/private distribution for created catalogues */}
                    <div className="space-y-4">
                      <div>
                        <div className="mb-2 flex justify-between text-sm">
                          <span className="font-medium text-gray-600">
                            Public
                          </span>
                          <span className="font-bold text-gray-900">
                            {_publicCount}
                          </span>
                        </div>
                        <div className="h-3 rounded-full bg-gray-200/60">
                          <div
                            className="h-3 rounded-full bg-gradient-to-r from-indigo-400 to-purple-600 shadow-sm"
                            style={{ width: `${_percentPublic}%` }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="mb-2 flex justify-between text-sm">
                          <span className="font-medium text-gray-600">
                            Private
                          </span>
                          <span className="font-bold text-gray-900">
                            {_privateCount}
                          </span>
                        </div>
                        <div className="h-3 rounded-full bg-gray-200/60">
                          <div
                            className="h-3 rounded-full bg-gradient-to-r from-gray-300 to-gray-400 shadow-sm"
                            style={{ width: `${100 - _percentPublic}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Customer Map → Activity Overview */}
              <Card className="relative overflow-hidden rounded-3xl border-0 bg-white/60 shadow-lg backdrop-blur">
                <div className="absolute right-0 top-0 h-24 w-24 -translate-y-12 translate-x-12 transform opacity-10">
                  <div className="h-full w-full rounded-full bg-gradient-to-br from-indigo-400 to-purple-600" />
                </div>
                <CardHeader className="relative">
                  <CardTitle className="pb-0 text-lg font-semibold text-gray-900">
                    Workspace Activity
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative">
                  <div className="h-56 rounded-2xl">
                    <div className="h-full w-full rounded-xl bg-gradient-to-br from-white/80 to-indigo-50/60 p-6 shadow-inner">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-gray-600">
                            Total Exports
                          </span>
                          <span className="text-lg font-bold text-indigo-700">
                            {analyticsData.overview?.totalExports ?? 0}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-gray-600">
                            Completed
                          </span>
                          <span className="text-lg font-bold text-green-600">
                            {analyticsData.overview?.completedExports ?? 0}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-gray-600">
                            Success Rate
                          </span>
                          <span className="text-lg font-bold text-blue-600">
                            {(analyticsData.overview?.totalExports ?? 0) > 0
                              ? Math.round(
                                ((analyticsData.overview?.completedExports ??
                                  0) /
                                  (analyticsData.overview?.totalExports ??
                                    1)) *
                                100
                              )
                              : 0}
                            %
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-gray-600">
                            Pending
                          </span>
                          <span className="text-lg font-bold text-orange-600">
                            {analyticsData.overview?.pendingExports ?? 0}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right column */}
            <div className="space-y-6">
              {/* Revenue-like big card */}
              <Card className="relative overflow-hidden rounded-3xl border-0 bg-white/60 shadow-lg backdrop-blur">
                <div className="absolute right-0 top-0 h-20 w-20 -translate-y-10 translate-x-10 transform opacity-10">
                  <div className="h-full w-full rounded-full bg-gradient-to-br from-purple-400 to-indigo-600" />
                </div>
                <CardContent className="relative p-6">
                  <div className="mb-6 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-600">
                        Total Projects
                      </p>
                      <h3 className="text-4xl font-bold text-gray-900">
                        {analyticsData.overview?.totalCatalogues ?? 0}
                      </h3>
                    </div>
                    <div className="rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 px-4 py-2 text-white shadow-lg">
                      <span className="text-sm font-semibold">Today</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="group rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 p-4 text-center transition-all duration-300 hover:scale-105 hover:shadow-lg">
                      <p className="mb-1 text-xs font-semibold text-indigo-600">
                        Templates
                      </p>
                      <p className="text-2xl font-bold text-indigo-700">
                        {analyticsData.overview?.userTemplates ?? 0}
                      </p>
                    </div>
                    <div className="group rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 p-4 text-center transition-all duration-300 hover:scale-105 hover:shadow-lg">
                      <p className="mb-1 text-xs font-semibold text-purple-600">
                        Themes
                      </p>
                      <p className="text-2xl font-bold text-purple-700">
                        {Object.keys(analyticsData.themes ?? {}).length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Bar chart placeholder */}
              <Card className="relative overflow-hidden rounded-3xl border-0 bg-white/60 shadow-lg backdrop-blur">
                <div className="absolute right-0 top-0 h-16 w-16 -translate-y-8 translate-x-8 transform opacity-10">
                  <div className="h-full w-full rounded-full bg-gradient-to-br from-purple-400 to-indigo-600" />
                </div>
                <CardHeader className="relative">
                  <CardTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900">
                    <BarChart3 className="h-5 w-5 text-purple-600" />
                    Performance Trends
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative">
                  <div className="h-64 rounded-2xl p-6">
                    <div className="flex h-full items-end justify-between gap-2">
                      {analyticsData.dailyActivity
                        ?.slice(-7)
                        .map((day: any, i: number) => {
                          const maxActivity = Math.max(
                            ...(analyticsData.dailyActivity?.map(
                              (d: any) => d.activity
                            ) ?? [0])
                          )
                          const height =
                            maxActivity > 0
                              ? (day.activity / maxActivity) * 100
                              : 0
                          return (
                            <div
                              key={i}
                              className="group flex w-8 items-end justify-center"
                            >
                              <div
                                className="w-6 rounded-t-xl bg-gradient-to-t from-indigo-400 to-purple-600 shadow-sm transition-all duration-300 hover:scale-110 hover:from-purple-500 hover:to-indigo-700"
                                style={{ height: `${height}%` }}
                              />
                            </div>
                          )
                        })}
                    </div>
                    <div className="mt-4 flex justify-between text-xs text-gray-500">
                      {analyticsData.dailyActivity
                        ?.slice(-7)
                        .map((day: any, i: number) => (
                          <span key={i}>
                            {new Date(day.date).toLocaleDateString('en-US', {
                              weekday: 'short',
                            })}
                          </span>
                        ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
