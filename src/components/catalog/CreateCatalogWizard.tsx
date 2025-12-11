'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { FileUpload } from '@/components/ui/file-upload'
import {
  ArrowLeft,
  ArrowRight,
  Save,
  Palette,
  Settings,
  Globe,
  Lock,
  AlertTriangle,
  Crown,
  Zap,
  CheckCircle,
  Image,
  Mail,
  Share2,
  Layout,
  FileText,
  ShoppingBag,
  Loader2,
  Monitor,
  Check,
  Sparkles,
  Eye,
  EyeOff,
  Copy,
} from 'lucide-react'
import { toast } from 'sonner'
import { isClientAdmin } from '@/lib/client-auth'
import { useSubscription } from '@/contexts/SubscriptionContext'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import { ThemeSelector } from './ThemeSelector'
import { TemplateThemeWorkflow } from '@/components/ui/template-theme-workflow'
import { UpgradePrompt } from '@/components/UpgradePrompt'
import { useProfileQuery, useCreateCatalogueMutation } from '@/hooks/queries'

interface CatalogueData {
  // Catalogue basic info
  title: string
  id?: string
  name: string
  description: string
  quote: string
  tagline: string
  year: string
  introImage: string
  templateId: string
  theme: string
  isPublic: boolean
  password?: string

  // Consolidated company/profile information
  companyName: string
  companyDescription: string
  fullName: string
  email: string
  phone: string
  website: string
  address: string
  city: string
  state: string
  country: string

  // Media assets
  logoUrl: string
  coverImageUrl: string

  // Contact page specific fields
  contactImage: string
  contactQuote: string
  contactQuoteBy: string
  contactDescription: string

  // Social media
  facebook: string
  twitter: string
  instagram: string
  linkedin: string

  // Template settings
  showPrices: boolean
  showCategories: boolean
  allowSearch: boolean
  showProductCodes: boolean
}

interface UserProfile {
  id: string
  fullName: string
  email: string
  subscriptionPlan: 'free' | 'monthly' | 'yearly'
  subscriptionStatus: 'active' | 'inactive' | 'cancelled'
  subscription: {
    plan: 'FREE' | 'MONTHLY' | 'YEARLY'
    status: 'ACTIVE' | 'CANCELLED' | 'PAST_DUE'
  } | null
}

interface CreateCatalogWizardProps {
  onComplete?: (catalogId: string) => void
}

export function CreateCatalogWizard({ onComplete }: CreateCatalogWizardProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [data, setData] = useState<CatalogueData>({
    // Catalogue basic info
    title: '',
    name: '',
    description: '',
    quote: '',
    tagline: '',
    year: new Date().getFullYear().toString(),
    introImage: '',
    templateId: 'modern-4page',
    theme: 'modern',
    isPublic: false,

    // Consolidated company/profile information
    companyName: '',
    companyDescription: '',
    fullName: '',
    email: '',
    phone: '',
    website: '',
    address: '',
    city: '',
    state: '',
    country: '',

    // Media assets
    logoUrl: '',
    coverImageUrl: '',

    // Contact page specific fields
    contactImage: '',
    contactQuote: '',
    contactQuoteBy: '',
    contactDescription: '',

    // Social media
    facebook: '',
    twitter: '',
    instagram: '',
    linkedin: '',

    // Template settings
    showPrices: true,
    showCategories: true,
    allowSearch: true,
    showProductCodes: false,
  })

  // Use React Query hooks
  const { data: profileData, isLoading } = useProfileQuery()
  const createCatalogueMutation = useCreateCatalogueMutation()
  const profile = profileData?.profile

  const [error, setError] = useState('')
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false)
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const router = useRouter()
  const supabase = createClient()
  const { currentPlan, canCreateCatalogue } = useSubscription()

  // Pre-fill data from profile when loaded
  useEffect(() => {
    if (profile) {
      setData(prev => ({
        ...prev,
        // Company/profile information
        companyName: profile.companyName || '',
        companyDescription: profile.companyDescription || '',
        fullName: profile.fullName || '',
        email: profileData?.user?.email || '',
        phone: profile.phone || '',
        website: profile.website || '',
        address: profile.address || '',
        city: profile.city || '',
        state: profile.state || '',
        country: profile.country || '',

        // Media assets
        logoUrl: profile.logoUrl || '',
        coverImageUrl: profile.coverImageUrl || '',

        // Social media
        facebook: profile.facebook || '',
        twitter: profile.twitter || '',
        instagram: profile.instagram || '',
        linkedin: profile.linkedin || '',
      }))
    }
  }, [profile, profileData])

  const updateData = (field: string, value: any) => {
    setData(prev => ({ ...prev, [field]: value }))
  }

  const validateStep = (step: number) => {
    switch (step) {
      case 1:
        // Template selection is always valid as we have a default
        break
      case 2:
        if (!data.name.trim()) {
          toast.error('Catalogue name is required')
          return false
        }
        break
      case 3:
        // Branding step is optional
        break
      case 4:
        if (!canCreateCatalogue()) {
          setShowUpgradePrompt(true)
          return false
        }
        break
    }
    return true
  }

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4))
    }
  }

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  const saveCatalogue = async () => {
    if (!validateStep(5)) return

    const admin = await isClientAdmin()
    if (!admin && !canCreateCatalogue()) {
      toast.error('You have reached the catalogue limit for your current plan.')
      setShowUpgradePrompt(true)
      return
    }

    try {
      const result = await createCatalogueMutation.mutateAsync(data)
      toast.success('Catalogue created successfully!')
      if (onComplete) {
        onComplete(result.catalogue.id)
      } else {
        router.push(`/catalogue/${result.catalogue.id}/edit`)
      }
    } catch (err: any) {
      if (err.message.includes('limit')) {
        toast.error(
          'You have reached the catalogue limit for your current plan.'
        )
        setShowUpgradePrompt(true)
      } else {
        toast.error(err.message || 'Failed to create catalogue')
      }
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-pink-50 to-blue-50 pl-20">
      {/* Dashboard Header */}
      <DashboardHeader />

      {/* Content */}
      <div className=" mx-auto px-8 pb-8">
        {/* Progress Bar inside content for responsiveness */}
        <div className="max-w-8xl w-full rounded-t-2xl bg-gradient-to-r from-[#6366F1] to-[#2D1B69] px-20 pb-2 pt-6">
          <div className="flex items-center justify-between px-20 pt-4">
            {[
              { step: 1, label: 'Design', icon: Layout },
              { step: 2, label: 'Basic Info', icon: Settings },
              { step: 3, label: 'Branding', icon: Palette },
              { step: 4, label: 'Settings', icon: Globe },
            ].map(({ step, label, icon: Icon }) => (
              <div key={step} className="flex flex-1 flex-col items-center">
                <div
                  className={`relative flex h-10 w-10 items-center justify-center rounded-full transition-all duration-500 ${
                    step < currentStep
                      ? 'scale-110 border-2 border-[#FFFFFF] bg-white text-[#6366F1] shadow-lg'
                      : step === currentStep
                        ? 'scale-110 border-2 border-white bg-gray-200 text-[#2D1B69] shadow-lg ring-4 ring-[#6366F1]/20'
                        : 'border border-gray-500 bg-[#2D1B69] text-white opacity-70'
                  }`}
                >
                  {step < currentStep ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <Icon className="h-4 w-4" />
                  )}
                </div>
                <span
                  className={`mt-2 text-xs font-medium transition-colors duration-300 ${currentStep >= step ? 'text-white' : 'text-white opacity-80'}`}
                >
                  {label}
                </span>
              </div>
            ))}
          </div>
          {/* Progress Line */}
          <div className="relative mx-20 mt-2 h-3 pb-5">
            <div className="absolute left-0 right-0 top-1 h-1 rounded-full bg-[#A2E8DD]/30"></div>
            <div
              className="absolute left-0 top-1 h-1 rounded-full bg-white transition-all duration-700 ease-out"
              style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
            ></div>
          </div>
        </div>
        {/* Enhanced Plan Limit Warning */}
        {!canCreateCatalogue() && (
          <Alert
            variant="destructive"
            className="mb-8 border-red-200 bg-red-50/80 backdrop-blur-sm"
          >
            <AlertTriangle className="h-5 w-5" />
            <AlertDescription className="text-red-800">
              You have reached the catalogue limit for your current plan.
              <button
                onClick={() => setShowUpgradePrompt(true)}
                className="ml-1 font-medium text-red-700 underline hover:no-underline"
              >
                Upgrade your plan
              </button>{' '}
              to create more catalogues.
            </AlertDescription>
          </Alert>
        )}

        {/* Enhanced Step Content */}
        <div className="max-w-8xl">
          {currentStep === 1 && (
            <div className="space-y-6">
              {/* Template Selection Card */}
              <Card className="rounded-b-2xl bg-white/80 px-32 pb-10 pt-4 shadow-lg backdrop-blur-sm transition-all duration-300 hover:shadow-xl">
                <CardContent className="min-h-[600px] p-6">
                  <TemplateThemeWorkflow
                    userProfile={profile}
                    initialTemplateId={data.templateId}
                    onSelectionComplete={templateId => {
                      updateData('templateId', templateId)
                      updateData('settings.templateId', templateId)
                    }}
                    showPreview={true}
                    className="rounded-b-xl"
                  />
                </CardContent>
              </Card>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              {/* Basic Information Card */}
              <Card className="rounded-b-2xl border border-gray-200/60 bg-white/80 px-32 pb-10 pt-4 shadow-lg backdrop-blur-sm transition-all duration-300 hover:shadow-xl">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-[#6366F1] to-[#2D1B69] shadow-lg">
                      <Settings className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl text-[#1A1B41]">
                        Basic Information
                      </CardTitle>
                      <CardDescription className="text-gray-600">
                        Tell us about your catalogue
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label
                        htmlFor="name"
                        className="text-sm font-semibold text-[#1A1B41]"
                      >
                        Catalogue Name *
                      </Label>
                      <Input
                        id="name"
                        value={data.name}
                        onChange={e => updateData('name', e.target.value)}
                        placeholder="My Amazing Catalogue"
                        className="h-11 border-gray-300 transition-all duration-200 focus:border-[#6366F1] focus:ring-[#6366F1]/20"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="year"
                        className="text-sm font-semibold text-[#1A1B41]"
                      >
                        Catalogue Year
                      </Label>
                      <Input
                        id="year"
                        value={data.year}
                        onChange={e => updateData('year', e.target.value)}
                        placeholder="2025"
                        className="h-11 border-gray-300 transition-all duration-200 focus:border-[#6366F1] focus:ring-[#6366F1]/20"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="description"
                      className="text-sm font-semibold text-[#1A1B41]"
                    >
                      Description
                    </Label>
                    <Textarea
                      id="description"
                      value={data.description}
                      onChange={e => updateData('description', e.target.value)}
                      placeholder="Brief description of your catalogue..."
                      rows={3}
                      className="resize-none border-gray-300 transition-all duration-200 focus:border-[#6366F1] focus:ring-[#6366F1]/20"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="xs"
                      className="w-fit border-blue-400/20 text-xs text-blue-600"
                      disabled={
                        isGeneratingDescription || !(data.name || data.title)
                      }
                      onClick={async () => {
                        const catalogueName = (
                          data.name ||
                          data.title ||
                          ''
                        ).trim()
                        if (!catalogueName) {
                          toast.error('Please enter a catalogue name first')
                          return
                        }

                        setIsGeneratingDescription(true)

                        try {
                          const response = await fetch('/api/ai/description', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                              productName: catalogueName,
                            }),
                          })

                          if (!response.ok) {
                            throw new Error(
                              `Failed to generate description: ${response.status}`
                            )
                          }

                          const result = await response.json()
                          if (result.success && result.description) {
                            updateData('description', result.description)
                            toast.success(
                              'AI description generated successfully!'
                            )
                          } else {
                            throw new Error(
                              result.error || 'Failed to generate description'
                            )
                          }
                        } catch (err) {
                          toast.error(
                            err instanceof Error
                              ? err.message
                              : 'Failed to generate description'
                          )
                        } finally {
                          setIsGeneratingDescription(false)
                        }
                      }}
                    >
                      {isGeneratingDescription ? (
                        <>
                          <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-1 h-3 w-3" /> AI Generate
                        </>
                      )}
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label
                        htmlFor="tagline"
                        className="text-sm font-semibold text-[#1A1B41]"
                      >
                        Tagline
                      </Label>
                      <Input
                        id="tagline"
                        value={data.tagline}
                        onChange={e => updateData('tagline', e.target.value)}
                        placeholder="Quality products for everyone"
                        className="h-11 border-gray-300 transition-all duration-200 focus:border-[#6366F1] focus:ring-[#6366F1]/20"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="quote"
                        className="text-sm font-semibold text-[#1A1B41]"
                      >
                        Inspirational Quote
                      </Label>
                      <Input
                        id="quote"
                        value={data.quote}
                        onChange={e => updateData('quote', e.target.value)}
                        placeholder="Quality is not an act, it is a habit"
                        className="h-11 border-gray-300 transition-all duration-200 focus:border-[#6366F1] focus:ring-[#6366F1]/20"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              {/* Company & Branding */}
              <Card className="rounded-b-2xl border border-gray-200/60 bg-white/80 px-32 pb-10 pt-4 shadow-lg backdrop-blur-sm transition-all duration-300 hover:shadow-xl">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-[#6366F1] to-[#2D1B69] shadow-lg">
                      <Palette className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl text-[#1A1B41]">
                        Company & Branding
                      </CardTitle>
                      <CardDescription className="text-gray-600">
                        Company details and brand assets
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Company Information Section */}
                  <div className="space-y-4">
                    <h4 className="border-b border-gray-200 pb-2 text-lg font-semibold text-[#1A1B41]">
                      Company Details
                    </h4>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label
                          htmlFor="companyName"
                          className="text-sm font-semibold text-[#1A1B41]"
                        >
                          Company Name
                        </Label>
                        <Input
                          id="companyName"
                          value={data.companyName || ''}
                          onChange={e =>
                            updateData('companyName', e.target.value)
                          }
                          placeholder="Your Company Ltd."
                          className="h-10 border-gray-300 transition-all duration-200 focus:border-[#6366F1] focus:ring-[#6366F1]/20"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label
                          htmlFor="website"
                          className="text-sm font-semibold text-[#1A1B41]"
                        >
                          Website
                        </Label>
                        <Input
                          id="website"
                          value={data.website || ''}
                          onChange={e => updateData('website', e.target.value)}
                          placeholder="https://yourcompany.com"
                          className="h-10 border-gray-300 transition-all duration-200 focus:border-[#6366F1] focus:ring-[#6366F1]/20"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="companyDescription"
                        className="text-sm font-semibold text-[#1A1B41]"
                      >
                        Company Description
                      </Label>
                      <Textarea
                        id="companyDescription"
                        value={data.companyDescription || ''}
                        onChange={e =>
                          updateData('companyDescription', e.target.value)
                        }
                        placeholder="Tell customers about your company..."
                        rows={2}
                        className="resize-none border-gray-300 transition-all duration-200 focus:border-[#6366F1] focus:ring-[#6366F1]/20"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="xs"
                        className="w-fit border-blue-400/20 text-xs text-blue-600"
                        disabled={isGeneratingDescription || !data.companyName}
                        onClick={async () => {
                          const companyName = data.companyName?.trim()
                          if (!companyName) {
                            toast.error('Please enter a company name first')
                            return
                          }

                          setIsGeneratingDescription(true)

                          try {
                            const response = await fetch(
                              '/api/ai/description',
                              {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                  productName: companyName,
                                  category: 'Company',
                                }),
                              }
                            )

                            if (!response.ok) {
                              throw new Error(
                                `Failed to generate description: ${response.status}`
                              )
                            }

                            const result = await response.json()
                            if (result.success && result.description) {
                              updateData(
                                'companyDescription',
                                result.description
                              )
                              toast.success(
                                'AI description generated successfully!'
                              )
                            } else {
                              throw new Error(
                                result.error || 'Failed to generate description'
                              )
                            }
                          } catch (err) {
                            toast.error(
                              err instanceof Error
                                ? err.message
                                : 'Failed to generate description'
                            )
                          } finally {
                            setIsGeneratingDescription(false)
                          }
                        }}
                      >
                        {isGeneratingDescription ? (
                          <>
                            <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Sparkles className="mr-1 h-3 w-3" /> AI Generate
                          </>
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Brand Assets Section */}
                  <div className="space-y-4">
                    <h4 className="border-b border-gray-200 pb-2 text-lg font-semibold text-[#1A1B41]">
                      Brand Assets
                    </h4>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                      {/* Logo */}
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-[#1A1B41]">
                          Company Logo
                        </Label>
                        {!data.logoUrl ? (
                          <div className="cursor-pointer rounded-lg border-2 border-dashed border-gray-300 p-4 transition-colors hover:border-[#6366F1]">
                            <FileUpload
                              uploadType="catalogue"
                              catalogueId={data.id || 'temp'}
                              autoUpload={true}
                              onUpload={results => {
                                if (results.length > 0) {
                                  updateData('logoUrl', results[0].url)
                                }
                              }}
                              maxFiles={1}
                              accept={[
                                'image/jpeg',
                                'image/jpg',
                                'image/png',
                                'image/webp',
                              ]}
                              className="w-full"
                            />
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <img
                              src={data.logoUrl}
                              alt="Logo"
                              className="h-20 w-full rounded-lg border object-cover"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => updateData('logoUrl', '')}
                              className="w-full"
                            >
                              Change Logo
                            </Button>
                          </div>
                        )}
                      </div>

                      {/* Cover Image */}
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-[#1A1B41]">
                          Cover Image
                        </Label>
                        {!data.coverImageUrl ? (
                          <div className="cursor-pointer rounded-lg border-2 border-dashed border-gray-300 p-4 transition-colors hover:border-[#6366F1]">
                            <FileUpload
                              uploadType="catalogue"
                              catalogueId={data.id || 'temp'}
                              autoUpload={true}
                              onUpload={results => {
                                if (results.length > 0) {
                                  updateData('coverImageUrl', results[0].url)
                                }
                              }}
                              maxFiles={1}
                              accept={[
                                'image/jpeg',
                                'image/jpg',
                                'image/png',
                                'image/webp',
                              ]}
                              className="w-full"
                            />
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <img
                              src={data.coverImageUrl}
                              alt="Cover"
                              className="h-20 w-full rounded-lg border object-cover"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => updateData('coverImageUrl', '')}
                              className="w-full"
                            >
                              Change Cover
                            </Button>
                          </div>
                        )}
                      </div>

                      {/* Intro Image */}
                      <div className="space-y-2">
                        <Label className="text-sm font-semibold text-[#1A1B41]">
                          Intro Image
                        </Label>
                        {!data.introImage ? (
                          <div className="cursor-pointer rounded-lg border-2 border-dashed border-gray-300 p-4 transition-colors hover:border-[#6366F1]">
                            <FileUpload
                              uploadType="catalogue"
                              catalogueId={data.id || 'temp'}
                              autoUpload={true}
                              onUpload={results => {
                                if (results.length > 0) {
                                  updateData('introImage', results[0].url)
                                }
                              }}
                              maxFiles={1}
                              accept={[
                                'image/jpeg',
                                'image/jpg',
                                'image/png',
                                'image/webp',
                              ]}
                              className="w-full"
                            />
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <img
                              src={data.introImage}
                              alt="Intro"
                              className="h-20 w-full rounded-lg border object-cover"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => updateData('introImage', '')}
                              className="w-full"
                            >
                              Change Intro
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Contact & Social */}
              <Card className="rounded-2xl border border-gray-200/60 bg-white/80 px-32 pb-10 pt-4 shadow-lg backdrop-blur-sm transition-all duration-300 hover:shadow-xl">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-[#6366F1] to-[#2D1B69] shadow-lg">
                      <Mail className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl text-[#1A1B41]">
                        Contact & Social
                      </CardTitle>
                      <CardDescription className="text-gray-600">
                        Contact information and social media profiles
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Contact Details Section */}
                  <div className="space-y-4">
                    <h4 className="border-b border-gray-200 pb-2 text-lg font-semibold text-[#1A1B41]">
                      Contact Details
                    </h4>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label
                          htmlFor="email"
                          className="text-sm font-semibold text-[#1A1B41]"
                        >
                          Email
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          value={data.email || ''}
                          onChange={e => updateData('email', e.target.value)}
                          placeholder="hello@company.com"
                          className="h-9 border-gray-300 focus:border-[#6366F1] focus:ring-[#6366F1]/20"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label
                          htmlFor="phone"
                          className="text-sm font-semibold text-[#1A1B41]"
                        >
                          Phone
                        </Label>
                        <Input
                          id="phone"
                          value={data.phone || ''}
                          onChange={e => updateData('phone', e.target.value)}
                          placeholder="+1 (555) 123-4567"
                          className="h-9 border-gray-300 focus:border-[#6366F1] focus:ring-[#6366F1]/20"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="address"
                        className="text-sm font-semibold text-[#1A1B41]"
                      >
                        Address
                      </Label>
                      <Textarea
                        id="address"
                        value={data.address || ''}
                        onChange={e => updateData('address', e.target.value)}
                        placeholder="123 Main St, City, State"
                        rows={2}
                        className="resize-none border-gray-300 focus:border-[#6366F1] focus:ring-[#6366F1]/20"
                      />
                    </div>
                  </div>

                  {/* Social Media Section */}
                  <div className="space-y-4">
                    <h4 className="border-b border-gray-200 pb-2 text-lg font-semibold text-[#1A1B41]">
                      Social Media
                    </h4>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label
                          htmlFor="facebook"
                          className="text-sm font-semibold text-[#1A1B41]"
                        >
                          Facebook
                        </Label>
                        <Input
                          id="facebook"
                          value={data.facebook || ''}
                          onChange={e => updateData('facebook', e.target.value)}
                          placeholder="facebook.com/yourpage"
                          className="h-9 border-gray-300 focus:border-[#6366F1] focus:ring-[#6366F1]/20"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label
                          htmlFor="twitter"
                          className="text-sm font-semibold text-[#1A1B41]"
                        >
                          Twitter
                        </Label>
                        <Input
                          id="twitter"
                          value={data.twitter || ''}
                          onChange={e => updateData('twitter', e.target.value)}
                          placeholder="twitter.com/yourhandle"
                          className="h-9 border-gray-300 focus:border-[#6366F1] focus:ring-[#6366F1]/20"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label
                          htmlFor="instagram"
                          className="text-sm font-semibold text-[#1A1B41]"
                        >
                          Instagram
                        </Label>
                        <Input
                          id="instagram"
                          value={data.instagram || ''}
                          onChange={e =>
                            updateData('instagram', e.target.value)
                          }
                          placeholder="instagram.com/yourhandle"
                          className="h-9 border-gray-300 focus:border-[#6366F1] focus:ring-[#6366F1]/20"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label
                          htmlFor="linkedin"
                          className="text-sm font-semibold text-[#1A1B41]"
                        >
                          LinkedIn
                        </Label>
                        <Input
                          id="linkedin"
                          value={data.linkedin || ''}
                          onChange={e => updateData('linkedin', e.target.value)}
                          placeholder="linkedin.com/company/yourcompany"
                          className="h-9 border-gray-300 focus:border-[#6366F1] focus:ring-[#6366F1]/20"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Contact Page Details */}
              <Card className="rounded-2xl border border-gray-200/60 bg-white/80 px-32 pb-10 pt-4 shadow-lg backdrop-blur-sm transition-all duration-300 hover:shadow-xl">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-[#6366F1] to-[#2D1B69] shadow-lg">
                      <FileText className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl text-[#1A1B41]">
                        Contact Page Content
                      </CardTitle>
                      <CardDescription className="text-gray-600">
                        Additional content for your contact page
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label
                        htmlFor="contactDescription"
                        className="text-sm font-semibold text-[#1A1B41]"
                      >
                        Page Description
                      </Label>
                      <Textarea
                        id="contactDescription"
                        value={data.contactDescription || ''}
                        onChange={e =>
                          updateData('contactDescription', e.target.value)
                        }
                        placeholder="Welcome message or description..."
                        rows={2}
                        className="resize-none border-gray-300 focus:border-[#6366F1] focus:ring-[#6366F1]/20"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="contactQuote"
                        className="text-sm font-semibold text-[#1A1B41]"
                      >
                        Quote
                      </Label>
                      <Textarea
                        id="contactQuote"
                        value={data.contactQuote || ''}
                        onChange={e =>
                          updateData('contactQuote', e.target.value)
                        }
                        placeholder="An inspiring quote..."
                        rows={2}
                        className="resize-none border-gray-300 focus:border-[#6366F1] focus:ring-[#6366F1]/20"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label
                        htmlFor="contactQuoteBy"
                        className="text-sm font-semibold text-[#1A1B41]"
                      >
                        Quote Attribution
                      </Label>
                      <Input
                        id="contactQuoteBy"
                        value={data.contactQuoteBy || ''}
                        onChange={e =>
                          updateData('contactQuoteBy', e.target.value)
                        }
                        placeholder="- Author Name"
                        className="h-9 border-gray-300 focus:border-[#6366F1] focus:ring-[#6366F1]/20"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-semibold text-[#1A1B41]">
                        Contact Image
                      </Label>
                      {!data.contactImage ? (
                        <div className="cursor-pointer rounded-lg border-2 border-dashed border-gray-300 p-3 transition-colors hover:border-[#6366F1]">
                          <FileUpload
                            uploadType="catalogue"
                            catalogueId={data.id || 'temp'}
                            autoUpload={true}
                            onUpload={results => {
                              if (results.length > 0) {
                                updateData('contactImage', results[0].url)
                              }
                            }}
                            maxFiles={1}
                            accept={[
                              'image/jpeg',
                              'image/jpg',
                              'image/png',
                              'image/webp',
                            ]}
                            className="w-full"
                          />
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <img
                            src={data.contactImage}
                            alt="Contact"
                            className="h-16 w-full rounded-lg border object-cover"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => updateData('contactImage', '')}
                            className="w-full"
                          >
                            Change
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-6">
              {/* Settings & Visibility */}
              <Card className="rounded-b-2xl border border-gray-200/60 bg-white/80 px-32 pb-10 pt-4 shadow-lg backdrop-blur-sm transition-all duration-300 hover:shadow-xl">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-[#6366F1] to-[#2D1B69] shadow-lg">
                      <Globe className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl text-[#1A1B41]">
                        Settings & Visibility
                      </CardTitle>
                      <CardDescription className="text-gray-600">
                        Configure display options and access control
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Display Settings Section */}
                  <div className="space-y-4">
                    <h4 className="border-b border-gray-200 pb-2 text-lg font-semibold text-[#1A1B41]">
                      Display Settings
                    </h4>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="flex items-center justify-between rounded-lg border border-gray-200 p-3 transition-colors hover:border-[#6366F1]/30">
                        <div className="space-y-1">
                          <Label className="text-sm font-semibold text-[#1A1B41]">
                            Show Prices
                          </Label>
                          <p className="text-xs text-gray-600">
                            Display product prices
                          </p>
                        </div>
                        <Switch
                          checked={data.showPrices}
                          onCheckedChange={checked =>
                            updateData('showPrices', checked)
                          }
                          className="data-[state=checked]:bg-[#6366F1]"
                        />
                      </div>

                      <div className="flex items-center justify-between rounded-lg border border-gray-200 p-3 transition-colors hover:border-[#6366F1]/30">
                        <div className="space-y-1">
                          <Label className="text-sm font-semibold text-[#1A1B41]">
                            Show Categories
                          </Label>
                          <p className="text-xs text-gray-600">
                            Group products by categories
                          </p>
                        </div>
                        <Switch
                          checked={data.showCategories}
                          onCheckedChange={checked =>
                            updateData('showCategories', checked)
                          }
                          className="data-[state=checked]:bg-[#6366F1]"
                        />
                      </div>

                      <div className="flex items-center justify-between rounded-lg border border-gray-200 p-3 transition-colors hover:border-[#6366F1]/30">
                        <div className="space-y-1">
                          <Label className="text-sm font-semibold text-[#1A1B41]">
                            Allow Search
                          </Label>
                          <p className="text-xs text-gray-600">
                            Enable search functionality
                          </p>
                        </div>
                        <Switch
                          checked={data.allowSearch}
                          onCheckedChange={checked =>
                            updateData('allowSearch', checked)
                          }
                          className="data-[state=checked]:bg-[#6366F1]"
                        />
                      </div>

                      <div className="flex items-center justify-between rounded-lg border border-gray-200 p-3 transition-colors hover:border-[#6366F1]/30">
                        <div className="space-y-1">
                          <Label className="text-sm font-semibold text-[#1A1B41]">
                            Show Product Codes
                          </Label>
                          <p className="text-xs text-gray-600">
                            Display SKU or product codes
                          </p>
                        </div>
                        <Switch
                          checked={data.showProductCodes}
                          onCheckedChange={checked =>
                            updateData('showProductCodes', checked)
                          }
                          className="data-[state=checked]:bg-[#6366F1]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Visibility Settings Section */}
                  <div className="space-y-4">
                    <h4 className="border-b border-gray-200 pb-2 text-lg font-semibold text-[#1A1B41]">
                      Visibility & Access
                    </h4>
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div
                        className={`cursor-pointer rounded-xl border-2 p-4 transition-all duration-200 ${
                          !data.isPublic
                            ? 'border-[#6366F1] bg-[#6366F1]/5 shadow-lg'
                            : 'border-gray-200 hover:border-[#6366F1]/50 hover:shadow-md'
                        }`}
                        onClick={() => updateData('isPublic', false)}
                      >
                        <div className="flex items-center gap-3">
                          <Lock className="h-6 w-6 text-[#6366F1]" />
                          <div>
                            <h4 className="font-semibold text-[#1A1B41]">
                              Private
                            </h4>
                            <p className="text-sm text-gray-600">
                              Only you can access
                            </p>
                          </div>
                        </div>
                        {!data.isPublic && (
                          <div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#6366F1] shadow-lg">
                            <Check className="h-3 w-3 text-white" />
                          </div>
                        )}
                      </div>

                      <div
                        className={`cursor-pointer rounded-xl border-2 p-4 transition-all duration-200 ${
                          data.isPublic
                            ? 'border-[#6366F1] bg-[#6366F1]/5 shadow-lg'
                            : 'border-gray-200 hover:border-[#6366F1]/50 hover:shadow-md'
                        }`}
                        onClick={() => updateData('isPublic', true)}
                      >
                        <div className="flex items-center gap-3">
                          <Globe className="h-6 w-6 text-[#6366F1]" />
                          <div>
                            <h4 className="font-semibold text-[#1A1B41]">
                              Public
                            </h4>
                            <p className="text-sm text-gray-600">
                              Anyone with link can view
                            </p>
                          </div>
                        </div>
                        {data.isPublic && (
                          <div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#6366F1] shadow-lg">
                            <Check className="h-3 w-3 text-white" />
                          </div>
                        )}
                      </div>
                    </div>

                    {!data.isPublic && (
                      <div className="space-y-2 rounded-lg border border-gray-200 bg-gray-50 p-4">
                        <Label className="text-sm font-semibold text-[#1A1B41]">
                          Access Password
                        </Label>
                        <div className="relative flex gap-2">
                          <div className="relative flex-1">
                            <Input
                              type={showPassword ? 'text' : 'password'}
                              value={data.password || ''}
                              onChange={e =>
                                updateData('password', e.target.value)
                              }
                              placeholder="Set a password for private access"
                              className="h-10 border-gray-300 pr-10 focus:border-[#6366F1] focus:ring-[#6366F1]/20"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-10 w-10 p-0 hover:bg-transparent"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? (
                                <EyeOff className="h-4 w-4 text-gray-500" />
                              ) : (
                                <Eye className="h-4 w-4 text-gray-500" />
                              )}
                            </Button>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-10 px-3"
                            onClick={() => {
                              if (data.password) {
                                navigator.clipboard.writeText(data.password)
                                toast.success('Password copied to clipboard!')
                              } else {
                                toast.error('Please set a password first')
                              }
                            }}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                        <p className="text-xs text-gray-500">
                          Visitors will need this password to view your
                          catalogue
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="mx-auto mt-12 max-w-3xl">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="text-md rounded-xl border-2 border-gray-300 px-8 py-4 shadow-lg transition-all duration-300 hover:border-[#779CAB] hover:shadow-xl"
            >
              <ArrowLeft className="mr-2 h-5 w-5" />
              Previous
            </Button>

            {currentStep < 4 ? (
              <Button
                onClick={nextStep}
                className="text-md rounded-xl bg-gradient-to-r from-[#6366F1] to-[#2D1B69] px-8 py-4 text-white shadow-lg transition-all duration-300 hover:from-[#2D1B69] hover:to-[#6366F1] hover:shadow-xl"
              >
                Next
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={saveCatalogue}
                disabled={createCatalogueMutation.isPending}
                className="text-md rounded-xl bg-gradient-to-r from-[#6366F1] to-[#2D1B69] px-8 py-4 font-medium text-white shadow-lg transition-all duration-300 hover:shadow-xl disabled:opacity-50"
              >
                {createCatalogueMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-5 w-5" />
                    Add Product
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Upgrade Prompt Modal */}
      <UpgradePrompt
        isOpen={showUpgradePrompt}
        onClose={() => setShowUpgradePrompt(false)}
        feature="catalogue creation"
        currentPlan={currentPlan}
      />
    </div>
  )
}
