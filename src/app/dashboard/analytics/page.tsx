'use client'

import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BarChart3, TrendingUp, Users, Eye, DollarSign, ArrowUp, ArrowDown, ArrowRight, FolderOpen, LayoutTemplate, Paintbrush } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { getAllTemplates } from '@/templates'
import { getAllThemes } from '@/themes'

export default function AnalyticsPage() {
  const router = useRouter()
  const [catalogueCount, setCatalogueCount] = useState(0)
  const [templatesCount, setTemplatesCount] = useState(0)
  const [themesCount, setThemesCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCatalogues = async () => {
      try {
        const response = await fetch('/api/catalogues')
        if (response.ok) {
          const data = await response.json()
          setCatalogueCount(data.catalogues?.length || 0)
        }
      } catch (error) {
        console.error('Error fetching catalogues:', error)
      } finally {
        setLoading(false)
      }
    }

    // Local counts for templates and themes (registry-based)
    try {
      const templates = getAllTemplates()
      setTemplatesCount(templates.length || 0)
    } catch (e) {
      console.warn('Templates registry not available:', e)
    }

    try {
      const themes = getAllThemes()
      setThemesCount(themes.length || 0)
    } catch (e) {
      console.warn('Themes registry not available:', e)
    }

    fetchCatalogues()
  }, [])

  const stats = [
    {
      title: 'Templates Available',
      value: loading ? '...' : String(templatesCount),
      change: '+2 new',
      trend: 'up',
      icon: LayoutTemplate,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      title: 'Total Catalogues',
      value: loading ? '...' : String(catalogueCount),
      change: '+12%',
      trend: 'up',
      icon: FolderOpen,
      color: 'from-purple-500 to-pink-500'
    },
    {
      title: 'Themes Available',
      value: loading ? '...' : String(themesCount),
      change: '+1 new',
      trend: 'up',
      icon: Paintbrush,
      color: 'from-green-500 to-emerald-500'
    }
  ]

  const workspaceProgress = catalogueCount > 0
    ? Math.min(Math.round((catalogueCount / 100) * 100), 100)
    : 0

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50">
      <div className="ml-24 flex-1">
        <DashboardHeader title="Analytics Overview" subtitle="Track your performance metrics and insights" />

        {/* Top pill: New Items / Manage */}
        <div className="px-8">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-6 rounded-2xl border border-purple-200/50 bg-white px-6 py-4 shadow-md">
              <div className="flex items-center gap-3">
                <span className="rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 px-4 py-2 text-sm font-semibold text-white shadow">
                  {Math.max(0, catalogueCount - 1)}
                </span>
                <span className="text-sm font-medium text-gray-700">New Catalogues</span>
              </div>
              <Button variant="secondary" size="sm" onClick={() => router.push('/dashboard')}
                className="rounded-xl border border-purple-200 bg-white text-gray-700 shadow hover:bg-purple-50">
                Manage catalogues
              </Button>
            </div>
          </div>

          {/* Main content two-column like the reference UI */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Left column */}
            <div className="space-y-6 lg:col-span-2">
              {/* Stats Grid (3 items) */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                {stats.map((stat) => {
                  const Icon = stat.icon
                  return (
                    <Card key={stat.title} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="mb-2 text-sm font-medium text-gray-600">{stat.title}</p>
                            <h3 className="mb-2 text-3xl font-bold text-gray-900">{stat.value}</h3>
                            <div className="flex items-center gap-1">
                              {stat.trend === 'up' ? (
                                <ArrowUp className="h-4 w-4 text-green-600" />
                              ) : (
                                <ArrowDown className="h-4 w-4 text-red-600" />
                              )}
                              <span className={`text-sm font-semibold ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                                {stat.change}
                              </span>
                              <span className="ml-1 text-sm text-gray-500">vs last month</span>
                            </div>
                          </div>
                          <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${stat.color} shadow-lg`}>
                            <Icon className="h-6 w-6 text-white" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>

              {/* Catalogue Summary */}
              <Card className="border-0 shadow-lg">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center justify-between">
                    <span>Catalogue summary</span>
                    <span className="text-sm text-gray-500">Today</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {/* Pie-like circle */}
                    <div className="flex items-center gap-6">
                      <div className="relative h-24 w-24">
                        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-100 to-indigo-100" />
                        <svg className="absolute inset-0 h-full w-full -rotate-90">
                          <circle cx="48" cy="48" r="40" stroke="#E5E7EB" strokeWidth="10" fill="none" />
                          <circle cx="48" cy="48" r="40" stroke="#A78BFA" strokeWidth="10" fill="none" strokeDasharray={`${2 * Math.PI * 40}`} strokeDashoffset={`${2 * Math.PI * 40 * 0.45}`} strokeLinecap="round" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Published</p>
                        <h4 className="text-xl font-bold text-gray-900">{Math.round((catalogueCount || 20) * 0.55)}</h4>
                        <p className="text-xs text-gray-500">~55% of total</p>
                      </div>
                    </div>

                    {/* Horizontal bars */}
                    <div className="space-y-4">
                      <div>
                        <div className="mb-1 flex justify-between text-sm">
                          <span className="text-gray-600">Draft</span>
                          <span className="text-gray-900 font-medium">30%</span>
                        </div>
                        <div className="h-2 rounded-full bg-gray-200">
                          <div className="h-2 w-[30%] rounded-full bg-gradient-to-r from-purple-400 to-indigo-500" />
                        </div>
                      </div>
                      <div>
                        <div className="mb-1 flex justify-between text-sm">
                          <span className="text-gray-600">Published</span>
                          <span className="text-gray-900 font-medium">55%</span>
                        </div>
                        <div className="h-2 rounded-full bg-gray-200">
                          <div className="h-2 w-[55%] rounded-full bg-gradient-to-r from-indigo-400 to-purple-600" />
                        </div>
                      </div>
                      <div>
                        <div className="mb-1 flex justify-between text-sm">
                          <span className="text-gray-600">Archived</span>
                          <span className="text-gray-900 font-medium">15%</span>
                        </div>
                        <div className="h-2 rounded-full bg-gray-200">
                          <div className="h-2 w-[15%] rounded-full bg-gradient-to-r from-pink-400 to-purple-500" />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Customer Map → Activity Overview */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Workspace activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-56 rounded-xl bg-gradient-to-br from-purple-50 to-blue-50 p-4">
                    <div className="h-full w-full rounded-lg bg-white/60">
                      {/* Decorative area-chart style placeholder */}
                      <div className="h-full w-full bg-[radial-gradient(ellipse_at_bottom,_var(--tw-gradient-stops))] from-purple-200 via-indigo-200 to-transparent" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right column */}
            <div className="space-y-6">
              {/* Revenue-like big card */}
              <Card className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Projects</p>
                      <h3 className="text-4xl font-bold text-gray-900">{loading ? '...' : catalogueCount}</h3>
                    </div>
                    <div className="rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 px-3 py-2 text-white">
                      <span className="text-xs">Today</span>
                    </div>
                  </div>
                  <div className="mt-6 grid grid-cols-2 gap-4">
                    <div className="rounded-xl bg-indigo-50 p-4 text-center">
                      <p className="text-xs text-indigo-600">Templates</p>
                      <p className="text-xl font-bold text-indigo-700">{loading ? '...' : templatesCount}</p>
                    </div>
                    <div className="rounded-xl bg-purple-50 p-4 text-center">
                      <p className="text-xs text-purple-600">Themes</p>
                      <p className="text-xl font-bold text-purple-700">{loading ? '...' : themesCount}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Bar chart placeholder */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-purple-600" />
                    Performance Trends
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 rounded-xl bg-gradient-to-br from-purple-50 to-blue-50 p-4">
                    <div className="flex h-full items-end justify-between">
                      {[20, 45, 30, 55, 35, 60].map((h, i) => (
                        <div key={i} className="flex w-8 items-end justify-center">
                          <div className="w-6 rounded-t bg-gradient-to-t from-purple-400 to-indigo-500" style={{ height: `${h}%` }} />
                        </div>
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
