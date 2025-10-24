'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { isClientAdmin } from '@/lib/client-auth'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Header } from '@/components/Header'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Users,
  FileText,
  DollarSign,
  TrendingUp,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  Ban,
  CheckCircle,
  AlertTriangle,
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  Palette,
  Menu,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import TemplateManagement from '@/components/admin/TemplateManagement'

interface AdminStats {
  totalUsers: number
  totalCatalogues: number
  totalRevenue: number
  monthlyGrowth: number
  activeSubscriptions: number
  freeUsers: number
  paidUsers: number
  totalExports: number
}

interface User {
  id: string
  email: string
  fullName: string
  companyName: string | null
  subscriptionPlan: 'free' | 'monthly' | 'yearly'
  subscriptionStatus: 'active' | 'inactive' | 'cancelled'
  createdAt: string
  lastLoginAt: string | null
  catalogueCount: number
  isActive: boolean
}

interface Catalogue {
  id: string
  name: string
  description: string | null
  isPublic: boolean
  productCount: number
  viewCount: number
  exportCount: number
  createdAt: string
  updatedAt: string
  user: {
    fullName: string
    email: string
  }
}

interface Subscription {
  id: string
  plan: 'monthly' | 'yearly'
  status: 'active' | 'inactive' | 'cancelled'
  amount: number
  createdAt: string
  cancelledAt: string | null
  user: {
    fullName: string
    email: string
  }
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [catalogues, setCatalogues] = useState<Catalogue[]>([])
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTab, setSelectedTab] = useState('overview')
  const [userFilter, setUserFilter] = useState('all')
  const [catalogueFilter, setCatalogueFilter] = useState('all')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  useEffect(() => {
    checkAdminAccess()
  }, [])

  // Handle URL parameter for tab selection
  useEffect(() => {
    const tab = searchParams.get('tab')
    if (
      tab &&
      [
        'overview',
        'users',
        'catalogues',
        'subscriptions',
        'templates',
      ].includes(tab)
    ) {
      setSelectedTab(tab)
    }
  }, [searchParams])

  useEffect(() => {
    if (selectedTab === 'overview') {
      loadStats()
    } else if (selectedTab === 'users') {
      loadUsers()
    } else if (selectedTab === 'catalogues') {
      loadCatalogues()
    } else if (selectedTab === 'subscriptions') {
      loadSubscriptions()
    }
  }, [selectedTab])

  // Custom function to handle tab changes and update URL
  const handleTabChange = (newTab: string) => {
    setSelectedTab(newTab)
    // Update URL without causing a page refresh
    const url = new URL(window.location.href)
    if (newTab === 'overview') {
      // Remove tab parameter for overview (default)
      url.searchParams.delete('tab')
    } else {
      url.searchParams.set('tab', newTab)
    }
    window.history.pushState({}, '', url.toString())
  }

  const checkAdminAccess = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push('/admin/login')
        return
      }

      // Check if user is admin using client-side function
      const adminCheck = await isClientAdmin()

      if (!adminCheck) {
        router.push('/dashboard')
        return
      }
    } catch (error) {
      console.error('Failed to check admin access:', error)
      router.push('/admin/login')
    } finally {
      setIsLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const response = await fetch('/api/admin/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Failed to load stats:', error)
    }
  }

  const loadUsers = async () => {
    try {
      const response = await fetch('/api/admin/users')
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users)
      }
    } catch (error) {
      console.error('Failed to load users:', error)
    }
  }

  const loadCatalogues = async () => {
    try {
      const response = await fetch('/api/admin/catalogues')
      if (response.ok) {
        const data = await response.json()
        setCatalogues(data.catalogues)
      }
    } catch (error) {
      console.error('Failed to load catalogues:', error)
    }
  }

  const loadSubscriptions = async () => {
    try {
      const response = await fetch('/api/admin/subscriptions')
      if (response.ok) {
        const data = await response.json()
        setSubscriptions(data.subscriptions)
      }
    } catch (error) {
      console.error('Failed to load subscriptions:', error)
    }
  }

  const toggleUserStatus = async (userId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: !isActive }),
      })

      if (response.ok) {
        toast.success(
          `User ${!isActive ? 'activated' : 'deactivated'} successfully`
        )
        loadUsers()
      } else {
        throw new Error('Failed to update user status')
      }
    } catch (error) {
      toast.error('Failed to update user status')
    }
  }

  const deleteCatalogue = async (catalogueId: string) => {
    if (
      !confirm(
        'Are you sure you want to delete this catalogue? This action cannot be undone.'
      )
    ) {
      return
    }

    try {
      const response = await fetch(`/api/admin/catalogues/${catalogueId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Catalogue deleted successfully')
        loadCatalogues()
      } else {
        throw new Error('Failed to delete catalogue')
      }
    } catch (error) {
      toast.error('Failed to delete catalogue')
    }
  }

  const exportData = async (type: 'users' | 'catalogues' | 'subscriptions') => {
    try {
      const response = await fetch(`/api/admin/export/${type}`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${type}-export-${new Date().toISOString().split('T')[0]}.csv`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
        toast.success(`${type} data exported successfully`)
      }
    } catch (error) {
      toast.error(`Failed to export ${type} data`)
    }
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch =
      !searchQuery ||
      user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.companyName?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesFilter =
      userFilter === 'all' ||
      (userFilter === 'free' && user.subscriptionPlan === 'free') ||
      (userFilter === 'paid' && user.subscriptionPlan !== 'free') ||
      (userFilter === 'active' && user.isActive) ||
      (userFilter === 'inactive' && !user.isActive)

    return matchesSearch && matchesFilter
  })

  const filteredCatalogues = catalogues.filter(catalogue => {
    const matchesSearch =
      !searchQuery ||
      catalogue.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      catalogue.user.fullName
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      catalogue.user.email.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesFilter =
      catalogueFilter === 'all' ||
      (catalogueFilter === 'public' && catalogue.isPublic) ||
      (catalogueFilter === 'private' && !catalogue.isPublic)

    return matchesSearch && matchesFilter
  })

  if (isLoading) {
    return (
      <>
        <Header title="Admin" />
        <div className="min-h-screen bg-white">
          <div className="container mx-auto px-4 py-8">
            <div className="space-y-6">
              <Skeleton className="h-8 w-64" />
              <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-32" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Header title="Admin" />
      <div className="min-h-screen border-t bg-white">
        <div className="flex min-h-screen bg-gray-50">
          {/* Mobile overlay */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* Sidebar Navigation */}
          <div
            className={`
          fixed inset-y-0 left-0 z-50 min-h-screen w-64 transform border-r border-gray-200 bg-white shadow-sm
          transition-transform duration-300 ease-in-out lg:static lg:transform-none
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
          >
            <div className="p-6">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  Admin Panel
                </h2>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 lg:hidden"
                  aria-label="Close navigation menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <nav
                className="space-y-2"
                role="navigation"
                aria-label="Admin navigation"
              >
                <button
                  onClick={() => handleTabChange('overview')}
                  className={`flex w-full items-center rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200 ${
                    selectedTab === 'overview'
                      ? 'border border-blue-200 bg-blue-50 text-blue-700 shadow-sm'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                  aria-current={selectedTab === 'overview' ? 'page' : undefined}
                  aria-label="Overview dashboard"
                >
                  <BarChart3 className="mr-3 h-5 w-5" />
                  Overview
                  {selectedTab === 'overview' && (
                    <div className="ml-auto h-2 w-2 rounded-full bg-blue-600"></div>
                  )}
                </button>

                <button
                  onClick={() => handleTabChange('users')}
                  className={`flex w-full items-center rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200 ${
                    selectedTab === 'users'
                      ? 'border border-blue-200 bg-blue-50 text-blue-700 shadow-sm'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                  aria-current={selectedTab === 'users' ? 'page' : undefined}
                  aria-label="Users management"
                >
                  <Users className="mr-3 h-5 w-5" />
                  Users
                  {stats && (
                    <span
                      className={`ml-auto rounded-full px-2 py-1 text-xs ${
                        selectedTab === 'users'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {stats.totalUsers}
                    </span>
                  )}
                  {selectedTab === 'users' && (
                    <div className="ml-2 h-2 w-2 rounded-full bg-blue-600"></div>
                  )}
                </button>

                <button
                  onClick={() => handleTabChange('catalogues')}
                  className={`flex w-full items-center rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200 ${
                    selectedTab === 'catalogues'
                      ? 'border border-blue-200 bg-blue-50 text-blue-700 shadow-sm'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                  aria-current={
                    selectedTab === 'catalogues' ? 'page' : undefined
                  }
                  aria-label="Catalogues management"
                >
                  <FileText className="mr-3 h-5 w-5" />
                  Catalogues
                  {stats && (
                    <span
                      className={`ml-auto rounded-full px-2 py-1 text-xs ${
                        selectedTab === 'catalogues'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {stats.totalCatalogues}
                    </span>
                  )}
                  {selectedTab === 'catalogues' && (
                    <div className="ml-2 h-2 w-2 rounded-full bg-blue-600"></div>
                  )}
                </button>

                <button
                  onClick={() => handleTabChange('subscriptions')}
                  className={`flex w-full items-center rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200 ${
                    selectedTab === 'subscriptions'
                      ? 'border border-blue-200 bg-blue-50 text-blue-700 shadow-sm'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                  aria-current={
                    selectedTab === 'subscriptions' ? 'page' : undefined
                  }
                  aria-label="Subscriptions management"
                >
                  <DollarSign className="mr-3 h-5 w-5" />
                  Subscriptions
                  {stats && (
                    <span
                      className={`ml-auto rounded-full px-2 py-1 text-xs ${
                        selectedTab === 'subscriptions'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {stats.activeSubscriptions}
                    </span>
                  )}
                  {selectedTab === 'subscriptions' && (
                    <div className="ml-2 h-2 w-2 rounded-full bg-blue-600"></div>
                  )}
                </button>

                <button
                  onClick={() => handleTabChange('templates')}
                  className={`flex w-full items-center rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200 ${
                    selectedTab === 'templates'
                      ? 'border border-blue-200 bg-blue-50 text-blue-700 shadow-sm'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                  aria-current={
                    selectedTab === 'templates' ? 'page' : undefined
                  }
                  aria-label="Templates management"
                >
                  <Palette className="mr-3 h-5 w-5" />
                  Templates
                  {selectedTab === 'templates' && (
                    <div className="ml-auto h-2 w-2 rounded-full bg-blue-600"></div>
                  )}
                </button>
              </nav>

              {/* Quick Stats Summary */}
              {stats && selectedTab === 'overview' && (
                <div className="mt-8 rounded-lg bg-gray-50 p-2">
                  <h3 className="mb-3 text-sm font-medium text-gray-700">
                    Quick Stats
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Users</span>
                      <span className="font-medium">{stats.totalUsers}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Revenue</span>
                      <span className="font-medium">
                        ${stats.totalRevenue.toFixed(0)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Growth</span>
                      <span className="font-medium text-green-600">
                        +{stats.monthlyGrowth}%
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 overflow-hidden lg:ml-0">
            {/* Mobile header with hamburger menu */}
            <div className="border-b border-gray-200 bg-white p-4 lg:hidden">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                  aria-label="Open navigation menu"
                >
                  <Menu className="h-5 w-5" />
                </button>
                <h1 className="text-lg font-semibold text-gray-900">
                  Admin Dashboard
                </h1>
                <div className="w-9"></div> {/* Spacer for centering */}
              </div>
            </div>

            <Tabs
              value={selectedTab}
              onValueChange={handleTabChange}
              className="h-full"
            >
              <div className="h-full  overflow-y-auto p-4">
                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-6">
                  {stats && (
                    <>
                      {/* Stats Cards */}
                      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                        <Card>
                          <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium text-gray-600">
                                  Total Users
                                </p>
                                <p className="text-2xl font-bold">
                                  {stats.totalUsers}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {stats.freeUsers} free, {stats.paidUsers} paid
                                </p>
                              </div>
                              <Users className="h-8 w-8 text-blue-600" />
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium text-gray-600">
                                  Total Catalogues
                                </p>
                                <p className="text-2xl font-bold">
                                  {stats.totalCatalogues}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {stats.totalExports} total exports
                                </p>
                              </div>
                              <FileText className="h-8 w-8 text-green-600" />
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium text-gray-600">
                                  Total Revenue
                                </p>
                                <p className="text-2xl font-bold">
                                  ${stats.totalRevenue.toFixed(2)}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {stats.activeSubscriptions} active
                                  subscriptions
                                </p>
                              </div>
                              <DollarSign className="h-8 w-8 text-purple-600" />
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium text-gray-600">
                                  Monthly Growth
                                </p>
                                <p className="text-2xl font-bold">
                                  +{stats.monthlyGrowth}%
                                </p>
                                <p className="text-xs text-gray-500">
                                  Compared to last month
                                </p>
                              </div>
                              <TrendingUp className="h-8 w-8 text-orange-600" />
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Quick Actions */}
                      <Card>
                        <CardHeader>
                          <CardTitle>Quick Actions</CardTitle>
                          <CardDescription>
                            Common administrative tasks
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                            <Button
                              onClick={() => exportData('users')}
                              variant="outline"
                            >
                              <Download className="mr-2 h-4 w-4" />
                              Export Users
                            </Button>
                            <Button
                              onClick={() => exportData('catalogues')}
                              variant="outline"
                            >
                              <Download className="mr-2 h-4 w-4" />
                              Export Catalogues
                            </Button>
                            <Button
                              onClick={() => exportData('subscriptions')}
                              variant="outline"
                            >
                              <Download className="mr-2 h-4 w-4" />
                              Export Subscriptions
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </>
                  )}
                </TabsContent>

                {/* Users Tab */}
                <TabsContent value="users" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>Users Management</CardTitle>
                          <CardDescription>
                            Manage user accounts and subscriptions
                          </CardDescription>
                        </div>
                        <Button
                          onClick={() => exportData('users')}
                          variant="outline"
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Export
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {/* Filters */}
                      <div className="mb-6 flex flex-col gap-4 md:flex-row">
                        <div className="relative flex-1">
                          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                          <Input
                            placeholder="Search users..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="pl-10"
                          />
                        </div>

                        <Select
                          value={userFilter}
                          onValueChange={setUserFilter}
                        >
                          <SelectTrigger className="w-full md:w-48">
                            <Filter className="mr-2 h-4 w-4" />
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Users</SelectItem>
                            <SelectItem value="free">Free Plan</SelectItem>
                            <SelectItem value="paid">Paid Plan</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Users Table */}
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>User</TableHead>
                            <TableHead>Plan</TableHead>
                            <TableHead>Catalogues</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Joined</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredUsers.map(user => (
                            <TableRow key={user.id}>
                              <TableCell>
                                <div>
                                  <div className="font-medium">
                                    {user.fullName}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {user.email}
                                  </div>
                                  {user.companyName && (
                                    <div className="text-sm text-gray-500">
                                      {user.companyName}
                                    </div>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant={
                                    user.subscriptionPlan === 'free'
                                      ? 'secondary'
                                      : 'default'
                                  }
                                >
                                  {user.subscriptionPlan === 'free'
                                    ? 'Free'
                                    : user.subscriptionPlan === 'monthly'
                                      ? 'Pro Monthly'
                                      : 'Pro Yearly'}
                                </Badge>
                              </TableCell>
                              <TableCell>{user.catalogueCount}</TableCell>
                              <TableCell>
                                <Badge
                                  variant={
                                    user.isActive ? 'default' : 'destructive'
                                  }
                                >
                                  {user.isActive ? 'Active' : 'Inactive'}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {new Date(user.createdAt).toLocaleDateString()}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                      toggleUserStatus(user.id, user.isActive)
                                    }
                                  >
                                    {user.isActive ? (
                                      <Ban className="h-4 w-4" />
                                    ) : (
                                      <CheckCircle className="h-4 w-4" />
                                    )}
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Catalogues Tab */}
                <TabsContent value="catalogues" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>Catalogues Management</CardTitle>
                          <CardDescription>
                            Monitor and manage user catalogues
                          </CardDescription>
                        </div>
                        <Button
                          onClick={() => exportData('catalogues')}
                          variant="outline"
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Export
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {/* Filters */}
                      <div className="mb-6 flex flex-col gap-4 md:flex-row">
                        <div className="relative flex-1">
                          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
                          <Input
                            placeholder="Search catalogues..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="pl-10"
                          />
                        </div>

                        <Select
                          value={catalogueFilter}
                          onValueChange={setCatalogueFilter}
                        >
                          <SelectTrigger className="w-full md:w-48">
                            <Filter className="mr-2 h-4 w-4" />
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Catalogues</SelectItem>
                            <SelectItem value="public">Public</SelectItem>
                            <SelectItem value="private">Private</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Catalogues Table */}
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Catalogue</TableHead>
                            <TableHead>Owner</TableHead>
                            <TableHead>Products</TableHead>
                            <TableHead>Views</TableHead>
                            <TableHead>Exports</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredCatalogues.map(catalogue => (
                            <TableRow key={catalogue.id}>
                              <TableCell>
                                <div>
                                  <div className="font-medium">
                                    {catalogue.name}
                                  </div>
                                  {catalogue.description && (
                                    <div className="line-clamp-1 text-sm text-gray-500">
                                      {catalogue.description}
                                    </div>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div>
                                  <div className="font-medium">
                                    {catalogue.user.fullName}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {catalogue.user.email}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>{catalogue.productCount}</TableCell>
                              <TableCell>{catalogue.viewCount}</TableCell>
                              <TableCell>{catalogue.exportCount}</TableCell>
                              <TableCell>
                                <Badge
                                  variant={
                                    catalogue.isPublic ? 'default' : 'secondary'
                                  }
                                >
                                  {catalogue.isPublic ? 'Public' : 'Private'}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Button size="sm" variant="outline" asChild>
                                    <Link
                                      href={`/catalogue/${catalogue.id}/preview`}
                                    >
                                      <Eye className="h-4 w-4" />
                                    </Link>
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                      deleteCatalogue(catalogue.id)
                                    }
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Subscriptions Tab */}
                <TabsContent value="subscriptions" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>Subscriptions Management</CardTitle>
                          <CardDescription>
                            Monitor subscription status and revenue
                          </CardDescription>
                        </div>
                        <Button
                          onClick={() => exportData('subscriptions')}
                          variant="outline"
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Export
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>User</TableHead>
                            <TableHead>Plan</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Started</TableHead>
                            <TableHead>Cancelled</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {subscriptions.map(subscription => (
                            <TableRow key={subscription.id}>
                              <TableCell>
                                <div>
                                  <div className="font-medium">
                                    {subscription.user.fullName}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {subscription.user.email}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge>
                                  {subscription.plan === 'monthly'
                                    ? 'Pro Monthly'
                                    : 'Pro Yearly'}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                ${subscription.amount.toFixed(2)}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant={
                                    subscription.status === 'active'
                                      ? 'default'
                                      : subscription.status === 'cancelled'
                                        ? 'destructive'
                                        : 'secondary'
                                  }
                                >
                                  {subscription.status}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {new Date(
                                  subscription.createdAt
                                ).toLocaleDateString()}
                              </TableCell>
                              <TableCell>
                                {subscription.cancelledAt
                                  ? new Date(
                                      subscription.cancelledAt
                                    ).toLocaleDateString()
                                  : '-'}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Templates Tab */}
                <TabsContent value="templates" className="space-y-6">
                  <TemplateManagement />
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>
      </div>
    </>
  )
}
