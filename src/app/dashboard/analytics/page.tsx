'use client'

import { Sidebar } from '@/components/dashboard/Sidebar'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BarChart3, TrendingUp, Users, Eye, DollarSign, ArrowUp, ArrowDown, ArrowRight, FolderOpen } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

export default function AnalyticsPage() {
  const router = useRouter()
  const [catalogueCount, setCatalogueCount] = useState(0)
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

    fetchCatalogues()
  }, [])

  const stats = [
    {
      title: 'Total Views',
      value: '24,563',
      change: '+12.5%',
      trend: 'up',
      icon: Eye,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      title: 'Active Users',
      value: '1,234',
      change: '+8.2%',
      trend: 'up',
      icon: Users,
      color: 'from-purple-500 to-pink-500'
    },
    {
      title: 'Conversion Rate',
      value: '3.24%',
      change: '-2.1%',
      trend: 'down',
      icon: TrendingUp,
      color: 'from-green-500 to-emerald-500'
    },
    {
      title: 'Revenue',
      value: '$12,543',
      change: '+15.3%',
      trend: 'up',
      icon: DollarSign,
      color: 'from-orange-500 to-red-500'
    }
  ]

  const workspaceProgress = catalogueCount > 0 
    ? Math.min(Math.round((catalogueCount / 100) * 100), 100)
    : 0

  return (
    <div className="flex min-h-screen bg-[#E8EAF6]">
      <Sidebar />
      <div className="ml-32 flex-1">
        <DashboardHeader title="Analytics Overview" subtitle="Track your performance metrics and insights" />

        <div className="p-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
            {stats.map((stat) => {
              const Icon = stat.icon
              return (
                <Card key={stat.title} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-600 mb-2">{stat.title}</p>
                        <h3 className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</h3>
                        <div className="flex items-center gap-1">
                          {stat.trend === 'up' ? (
                            <ArrowUp className="h-4 w-4 text-green-600" />
                          ) : (
                            <ArrowDown className="h-4 w-4 text-red-600" />
                          )}
                          <span className={`text-sm font-semibold ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                            {stat.change}
                          </span>
                          <span className="text-sm text-gray-500 ml-1">vs last month</span>
                        </div>
                      </div>
                      <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg`}>
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Workspace Progress Card */}
          <div className="mb-8">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Workspace Stats</h2>
              <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard')}>
                View Details <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </div>

            <Card className="relative overflow-hidden rounded-3xl border-0 bg-gradient-to-br from-[#6366F1] via-[#7C3AED] to-[#8B5CF6] shadow-2xl">
              <CardContent className="p-8">
                {/* Progress Circle */}
                <div className="relative mx-auto mb-6 h-48 w-48">
                  {/* Background Circle */}
                  <svg className="h-full w-full -rotate-90 transform">
                    <circle
                      cx="96"
                      cy="96"
                      r="80"
                      stroke="rgba(255,255,255,0.2)"
                      strokeWidth="16"
                      fill="none"
                    />
                    {/* Progress Circle */}
                    <circle
                      cx="96"
                      cy="96"
                      r="80"
                      stroke="url(#gradient)"
                      strokeWidth="16"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 80}`}
                      strokeDashoffset={`${2 * Math.PI * 80 * (1 - (catalogueCount / 100))}`}
                      strokeLinecap="round"
                    />
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#10B981" />
                        <stop offset="50%" stopColor="#FBBF24" />
                        <stop offset="100%" stopColor="#10B981" />
                      </linearGradient>
                    </defs>
                  </svg>
                  {/* Center Content */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                      <FolderOpen className="h-6 w-6 text-white" />
                    </div>
                    <p className="text-4xl font-bold text-white">
                      {loading ? '-' : workspaceProgress}%
                    </p>
                  </div>
                </div>

                {/* Amount Info */}
                <div className="text-center">
                  <p className="mb-2 text-sm text-white/80">Workspace Progress</p>
                  <h3 className="mb-1 text-3xl font-bold text-white">
                    {loading ? '...' : catalogueCount}
                  </h3>
                  <p className="text-sm text-white/60">Total projects created</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Chart Placeholder */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-purple-600" />
                Performance Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80 flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg">
                <div className="text-center">
                  <BarChart3 className="h-16 w-16 text-purple-300 mx-auto mb-4" />
                  <p className="text-gray-500">Analytics charts will be displayed here</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
