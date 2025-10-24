'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Search,
  Filter,
  Grid,
  List,
  Phone,
  Mail,
  Globe,
  ExternalLink,
  AlertTriangle,
  Heart,
  Share2,
  Download,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
} from 'lucide-react'
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
import { toast } from 'sonner'
import Image from 'next/image'
import Link from 'next/link'

interface Catalogue {
  id: string
  name: string
  description: string | null
  theme: string
  isPublic: boolean
  settings: {
    showPrices: boolean
    showCategories: boolean
    allowSearch: boolean
    showProductCodes: boolean
    companyInfo?: {
      companyName: string
      companyDescription: string
    }
    mediaAssets?: {
      logoUrl: string
      coverImageUrl: string
    }
    contactDetails?: {
      email: string
      phone: string
      website: string
    }
    socialMedia?: {
      facebook: string
      twitter: string
      instagram: string
      linkedin: string
    }
    contactInfo: {
      email: string
      phone: string
      website: string
    }
  }
  createdAt: string
  updatedAt: string
  categories: Category[]
  products: Product[]
  profile: {
    fullName: string
    companyName: string | null
  }
}

interface Category {
  id: string
  name: string
  description: string | null
  sortOrder: number
}

interface Product {
  id: string
  name: string
  description: string | null
  price: number | null
  sku: string | null
  images: string[]
  categoryId: string | null
  category: Category | null
  isActive: boolean
  sortOrder: number
}

export default function PublicCataloguePage() {
  const [catalogue, setCatalogue] = useState<Catalogue | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showShareDialog, setShowShareDialog] = useState(false)
  const [favorites, setFavorites] = useState<Set<string>>(new Set())

  const params = useParams()
  const catalogueId = params.id as string

  useEffect(() => {
    if (catalogueId) {
      loadCatalogue()
    }
  }, [catalogueId])

  useEffect(() => {
    // Load favorites from localStorage
    const savedFavorites = localStorage.getItem(
      `catalogue-${catalogueId}-favorites`
    )
    if (savedFavorites) {
      setFavorites(new Set(JSON.parse(savedFavorites)))
    }
  }, [catalogueId])

  const loadCatalogue = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/catalogues/${catalogueId}/public`)

      if (response.ok) {
        const data = await response.json()
        setCatalogue(data.catalogue)

        // Track view analytics
        fetch(`/api/catalogues/${catalogueId}/analytics`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            type: 'view',
            metadata: {
              userAgent: navigator.userAgent,
              referrer: document.referrer,
            },
          }),
        }).catch(() => { }) // Silent fail for analytics
      } else if (response.status === 404) {
        setError('Catalogue not found or is private')
      } else {
        setError('Failed to load catalogue')
      }
    } catch (err) {
      setError('Failed to load catalogue')
      console.error('Load error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const toggleFavorite = (productId: string) => {
    const newFavorites = new Set(favorites)
    if (newFavorites.has(productId)) {
      newFavorites.delete(productId)
    } else {
      newFavorites.add(productId)
    }
    setFavorites(newFavorites)
    localStorage.setItem(
      `catalogue-${catalogueId}-favorites`,
      JSON.stringify(Array.from(newFavorites))
    )
  }

  const shareProduct = (product: Product) => {
    const shareUrl = `${window.location.origin}/catalogue/${catalogueId}/public?product=${product.id}`
    navigator.clipboard.writeText(shareUrl)
    toast.success('Product link copied to clipboard!')
  }

  const shareCatalogue = () => {
    const shareUrl = window.location.href
    navigator.clipboard.writeText(shareUrl)
    toast.success('Catalogue link copied to clipboard!')
  }

  const contactSeller = (method: 'email' | 'phone' | 'website') => {
    if (!catalogue) return

    const contactDetails =
      catalogue.settings.contactDetails || catalogue.settings.contactInfo

    switch (method) {
      case 'email':
        if (contactDetails.email) {
          window.location.href = `mailto:${contactDetails.email}?subject=Inquiry about ${catalogue.name}`
        }
        break
      case 'phone':
        if (contactDetails.phone) {
          window.location.href = `tel:${contactDetails.phone}`
        }
        break
      case 'website':
        if (contactDetails.website) {
          window.open(contactDetails.website, '_blank', 'noopener,noreferrer')
        }
        break
    }
  }

  const filteredProducts =
    catalogue?.products.filter(product => {
      if (!product.isActive) return false

      const matchesSearch =
        !searchQuery ||
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        product.sku?.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesCategory =
        selectedCategory === 'all' ||
        (selectedCategory === 'uncategorized' && !product.categoryId) ||
        product.categoryId === selectedCategory

      return matchesSearch && matchesCategory
    }) || []

  const getThemeClasses = (theme: string) => {
    switch (theme) {
      case 'modern':
        return 'bg-gradient-to-br from-blue-50 to-indigo-100'
      case 'classic':
        return 'bg-gradient-to-br from-amber-50 to-orange-100'
      case 'minimal':
        return 'bg-gray-50'
      case 'bold':
        return 'bg-gradient-to-br from-purple-50 to-pink-100'
      case 'elegant':
        return 'bg-gradient-to-br from-slate-50 to-gray-100'
      case 'tech':
        return 'bg-gradient-to-br from-cyan-50 to-blue-100'
      default:
        return 'bg-white'
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="space-y-6">
            <Skeleton className="mx-auto h-8 w-64" />
            <Skeleton className="h-32 w-full" />
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-64" />
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !catalogue) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <AlertTriangle className="mx-auto mb-4 h-12 w-12 text-gray-400" />
          <h1 className="mb-2 text-2xl font-bold text-gray-900">
            {error || 'Catalogue not found'}
          </h1>
          <p className="mb-4 text-gray-600">
            The catalogue you&apos;re looking for doesn&apos;t exist or is not
            publicly available.
          </p>
          <Button asChild>
            <Link href="/">Go to Homepage</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen ${getThemeClasses(catalogue.theme)}`}>
      {/* Header */}
      <div className="sticky top-0 z-10 border-b bg-white/80 shadow-sm backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/" className="text-xl font-bold text-gray-900">
                CATFY
              </Link>
              <div className="hidden text-sm text-gray-500 md:block">
                Viewing: {catalogue.name}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={shareCatalogue}>
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </Button>

              <Button asChild>
                <Link href="/auth/signup">Create Your Catalogue</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Catalogue Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="mb-4 text-4xl font-bold text-gray-900">
            {catalogue.name}
          </h1>

          {catalogue.description && (
            <p className="mx-auto mb-6 max-w-2xl text-lg text-gray-600">
              {catalogue.description}
            </p>
          )}

          <div className="text-sm text-gray-500">
            by {catalogue.profile.companyName || catalogue.profile.fullName}
          </div>
        </div>

        {/* Company Info */}
        {(catalogue.settings.companyInfo?.companyName ||
          catalogue.settings.companyInfo?.companyDescription) && (
            <Card className="mb-8">
              <CardContent className="p-6">
                <h3 className="mb-4 font-semibold">Company Information</h3>
                {catalogue.settings.companyInfo?.companyName && (
                  <h4 className="mb-2 text-lg font-medium">
                    {catalogue.settings.companyInfo.companyName}
                  </h4>
                )}
                {catalogue.settings.companyInfo?.companyDescription && (
                  <p className="text-gray-600">
                    {catalogue.settings.companyInfo.companyDescription}
                  </p>
                )}
              </CardContent>
            </Card>
          )}

        {/* Media & Assets */}
        {(catalogue.settings.mediaAssets?.logoUrl ||
          catalogue.settings.mediaAssets?.coverImageUrl) && (
            <Card className="mb-8">
              <CardContent className="p-6">
                <h3 className="mb-4 font-semibold">Media & Assets</h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {catalogue.settings.mediaAssets?.logoUrl && (
                    <div>
                      <h4 className="mb-2 text-sm font-medium">Logo</h4>
                      <Image
                        src={catalogue.settings.mediaAssets.logoUrl}
                        alt="Company Logo"
                        width={100}
                        height={100}
                        className="rounded border"
                      />
                    </div>
                  )}
                  {catalogue.settings.mediaAssets?.coverImageUrl && (
                    <div>
                      <h4 className="mb-2 text-sm font-medium">Cover Image</h4>
                      <Image
                        src={catalogue.settings.mediaAssets.coverImageUrl}
                        alt="Cover Image"
                        width={200}
                        height={100}
                        className="rounded border"
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

        {/* Contact Details */}
        {(catalogue.settings.contactDetails?.email ||
          catalogue.settings.contactDetails?.phone ||
          catalogue.settings.contactDetails?.website ||
          catalogue.settings.contactInfo.email ||
          catalogue.settings.contactInfo.phone ||
          catalogue.settings.contactInfo.website) && (
            <Card className="mb-8">
              <CardContent className="p-6">
                <h3 className="mb-4 font-semibold">Contact Information</h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  {(catalogue.settings.contactDetails?.email ||
                    catalogue.settings.contactInfo.email) && (
                      <Button
                        variant="outline"
                        className="justify-start"
                        onClick={() => contactSeller('email')}
                      >
                        <Mail className="mr-2 h-4 w-4" />
                        Send Email
                      </Button>
                    )}

                  {(catalogue.settings.contactDetails?.phone ||
                    catalogue.settings.contactInfo.phone) && (
                      <Button
                        variant="outline"
                        className="justify-start"
                        onClick={() => contactSeller('phone')}
                      >
                        <Phone className="mr-2 h-4 w-4" />
                        Call Now
                      </Button>
                    )}

                  {(catalogue.settings.contactDetails?.website ||
                    catalogue.settings.contactInfo.website) && (
                      <Button
                        variant="outline"
                        className="justify-start"
                        onClick={() => contactSeller('website')}
                      >
                        <Globe className="mr-2 h-4 w-4" />
                        Visit Website
                        <ExternalLink className="ml-2 h-3 w-3" />
                      </Button>
                    )}
                </div>
              </CardContent>
            </Card>
          )}

        {/* Social Media */}
        {(catalogue.settings.socialMedia?.facebook ||
          catalogue.settings.socialMedia?.twitter ||
          catalogue.settings.socialMedia?.instagram ||
          catalogue.settings.socialMedia?.linkedin) && (
            <Card className="mb-8">
              <CardContent className="p-6">
                <h3 className="mb-4 font-semibold">Social Media</h3>
                <div className="flex gap-4">
                  {catalogue.settings.socialMedia?.facebook && (
                    <a
                      href={catalogue.settings.socialMedia.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 transition-colors hover:text-blue-800"
                    >
                      <Facebook className="h-6 w-6" />
                    </a>
                  )}

                  {catalogue.settings.socialMedia?.twitter && (
                    <a
                      href={catalogue.settings.socialMedia.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 transition-colors hover:text-blue-600"
                    >
                      <Twitter className="h-6 w-6" />
                    </a>
                  )}

                  {catalogue.settings.socialMedia?.instagram && (
                    <a
                      href={catalogue.settings.socialMedia.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-pink-600 transition-colors hover:text-pink-800"
                    >
                      <Instagram className="h-6 w-6" />
                    </a>
                  )}

                  {catalogue.settings.socialMedia?.linkedin && (
                    <a
                      href={catalogue.settings.socialMedia.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-700 transition-colors hover:text-blue-900"
                    >
                      <Linkedin className="h-6 w-6" />
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

        {/* Filters and Search */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row">
          {catalogue.settings.allowSearch && (
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          )}

          {catalogue.settings.showCategories &&
            catalogue.categories.length > 0 && (
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger className="w-full md:w-48">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {catalogue.categories.map(category => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                  <SelectItem value="uncategorized">Uncategorized</SelectItem>
                </SelectContent>
              </Select>
            )}

          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Products */}
        {filteredProducts.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="mb-4 text-gray-400">
                {searchQuery || selectedCategory !== 'all' ? (
                  <Search className="mx-auto h-12 w-12" />
                ) : (
                  <div className="mx-auto h-12 w-12 rounded bg-gray-200" />
                )}
              </div>
              <h3 className="mb-2 text-lg font-semibold text-gray-900">
                {searchQuery || selectedCategory !== 'all'
                  ? 'No products found'
                  : 'No products available'}
              </h3>
              <p className="text-gray-600">
                {searchQuery || selectedCategory !== 'all'
                  ? 'Try adjusting your search or filter criteria'
                  : "This catalogue doesn't have any products yet"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                : 'space-y-4'
            }
          >
            {filteredProducts.map(product => (
              <Card
                key={product.id}
                className={`group transition-shadow hover:shadow-lg ${viewMode === 'list' ? 'flex' : ''}`}
              >
                {product.images && product.images.length > 0 && (
                  <div
                    className={
                      viewMode === 'list'
                        ? 'w-32 flex-shrink-0'
                        : 'relative aspect-square'
                    }
                  >
                    <Image
                      src={product.images[0]}
                      alt={product.name}
                      width={viewMode === 'list' ? 128 : 300}
                      height={viewMode === 'list' ? 128 : 300}
                      className="h-full w-full rounded-t-lg object-cover"
                    />

                    {/* Overlay actions */}
                    <div className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100">
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant={
                            favorites.has(product.id) ? 'default' : 'secondary'
                          }
                          className="h-8 w-8 p-0"
                          onClick={() => toggleFavorite(product.id)}
                        >
                          <Heart
                            className={`h-4 w-4 ${favorites.has(product.id) ? 'fill-current' : ''}`}
                          />
                        </Button>

                        <Button
                          size="sm"
                          variant="secondary"
                          className="h-8 w-8 p-0"
                          onClick={() => shareProduct(product)}
                        >
                          <Share2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                <div className={viewMode === 'list' ? 'flex-1' : ''}>
                  <CardHeader className={viewMode === 'list' ? 'pb-2' : ''}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg transition-colors group-hover:text-blue-600">
                          {product.name}
                        </CardTitle>
                        {product.description && (
                          <CardDescription className="mt-1 line-clamp-2">
                            {product.description}
                          </CardDescription>
                        )}
                      </div>

                      {(!product.images || product.images.length === 0) && (
                        <div className="ml-2 flex gap-1">
                          <Button
                            size="sm"
                            variant={
                              favorites.has(product.id) ? 'default' : 'ghost'
                            }
                            className="h-8 w-8 p-0"
                            onClick={() => toggleFavorite(product.id)}
                          >
                            <Heart
                              className={`h-4 w-4 ${favorites.has(product.id) ? 'fill-current' : ''}`}
                            />
                          </Button>

                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0"
                            onClick={() => shareProduct(product)}
                          >
                            <Share2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className={viewMode === 'list' ? 'pt-0' : ''}>
                    <div className="space-y-2">
                      {catalogue.settings.showPrices && product.price && (
                        <div className="text-lg font-semibold text-green-600">
                          $
                          {typeof product.price === 'number'
                            ? product.price.toFixed(2)
                            : Number(product.price).toFixed(2)}
                        </div>
                      )}

                      {catalogue.settings.showProductCodes && product.sku && (
                        <div className="text-sm text-gray-600">
                          SKU: {product.sku}
                        </div>
                      )}

                      {catalogue.settings.showCategories &&
                        product.category && (
                          <Badge variant="outline">
                            {product.category.name}
                          </Badge>
                        )}
                    </div>
                  </CardContent>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <Card className="mx-auto max-w-md">
            <CardContent className="p-6">
              <h3 className="mb-2 text-lg font-semibold">
                Create Your Own Catalogue
              </h3>
              <p className="mb-4 text-gray-600">
                Build beautiful product catalogues like this one in minutes
              </p>
              <Button asChild className="w-full">
                <Link href="/auth/signup">Get Started Free</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="mt-16 border-t pt-8 text-center text-sm text-gray-500">
          <p>
            Powered by{' '}
            <Link href="/" className="text-blue-600 hover:underline">
              CATFY
            </Link>{' '}
            - Create beautiful catalogues in minutes
          </p>
        </div>
      </div>
    </div>
  )
}
