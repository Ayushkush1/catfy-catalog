'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
  Loader2
} from 'lucide-react'
import { toast } from 'sonner'
import { useSubscription } from '@/contexts/SubscriptionContext'
import { UpgradePrompt } from '@/components/UpgradePrompt'
import { ThemeSelector } from './ThemeSelector'
import { TemplateThemeWorkflow } from '@/components/ui/template-theme-workflow'

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

  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false)

  const router = useRouter()
  const supabase = createClient()
  const { currentPlan, canCreateCatalogue } = useSubscription()

  useEffect(() => {
    loadUserData()
  }, [])

  const loadUserData = async () => {
    try {
      setIsLoading(true)

      // Load user profile
      const profileResponse = await fetch('/api/auth/profile')
      if (profileResponse.ok) {
        const profileData = await profileResponse.json()
        setProfile(profileData.profile)

        // Pre-fill data from profile
        setData(prev => ({
          ...prev,
          // Company/profile information
          companyName: profileData.profile?.companyName || '',
          companyDescription: profileData.profile?.companyDescription || '',
          fullName: profileData.profile?.fullName || '',
          email: profileData.user?.email || '',
          phone: profileData.profile?.phone || '',
          website: profileData.profile?.website || '',
          address: profileData.profile?.address || '',
          city: profileData.profile?.city || '',
          state: profileData.profile?.state || '',
          country: profileData.profile?.country || '',
          
          // Media assets
          logoUrl: profileData.profile?.logoUrl || '',
          coverImageUrl: profileData.profile?.coverImageUrl || '',
          
          // Social media
          facebook: profileData.profile?.facebook || '',
          twitter: profileData.profile?.twitter || '',
          instagram: profileData.profile?.instagram || '',
          linkedin: profileData.profile?.linkedin || '',
        }))
      }
    } catch (err) {
      setError('Failed to load user data')
      console.error('Load error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const updateData = (field: string, value: any) => {
    setData(prev => ({ ...prev, [field]: value }))
  }

  const validateStep = (step: number) => {
    switch (step) {
      case 1:
        if (!data.name.trim()) {
          setError('Catalogue name is required')
          return false
        }
        break
      case 2:
        // Template selection is always valid as we have a default
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
    setError('')
    return true
  }

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4))
    }
  }

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1))
    setError('')
  }

  const saveCatalogue = async () => {
    if (!validateStep(5)) return

    setSaving(true)
    setError('')

    try {
      const response = await fetch('/api/catalogues', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        const result = await response.json()
        toast.success('Catalogue created successfully!')
        if (onComplete) {
          onComplete(result.catalogue.id)
        } else {
          router.push(`/catalogue/${result.catalogue.id}/edit`)
        }
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create catalogue')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create catalogue')
    } finally {
      setSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Compact Header - Dashboard Style */}
      <div className="bg-gradient-to-r from-[#301F70] to-[#1A1B41] shadow-lg">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-xl font-semibold text-white">
                  Create New Catalogue
                </h1>
                <p className="text-sm text-white/80">
                  Step {currentStep} of 4
                </p>
              </div>
            </div>

            {profile?.subscription && (
              <div className="flex items-center gap-3">
                <Badge variant="secondary"
                  className="bg-white/20 text-white border-white/30 text-xs">
                  {profile.subscription.plan === 'FREE' ? (
                    <><Zap className="mr-1 h-3 w-3" /> Free</>
                  ) : (
                    <><Crown className="mr-1 h-3 w-3" /> {profile.subscription.plan}</>
                  )}
                </Badge>
              </div>
            )}
          </div>

          {/* Compact Progress Bar */}
          <div className="flex items-center justify-center mt-4 space-x-3">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-medium transition-all duration-300 ${step < currentStep
                  ? 'bg-white text-[#301F70] shadow-sm'
                  : step === currentStep
                    ? 'bg-white text-[#1A1B41] shadow-md ring-2 ring-white/30'
                    : 'bg-white/20 text-white/60'
                  }`}>
                  {step < currentStep ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <span>{step}</span>
                  )}
                </div>
                {step < 4 && (
                  <div className={`w-12 h-1 mx-2 rounded-full transition-all duration-300 ${step < currentStep
                    ? 'bg-white/60'
                    : 'bg-white/20'
                    }`} />
                )}
              </div>
            ))}
          </div>

          {/* Compact Step Labels */}
          <div className="flex justify-center mt-3 space-x-14">
            {[
              { step: 1, label: 'Plan' },
              { step: 2, label: 'Design' },
              { step: 3, label: 'Branding' },
              { step: 4, label: 'Settings' }
            ].map(({ step, label }) => (
              <div key={step} className="text-center">
                <span className={`text-xs transition-all duration-300 ${currentStep >= step
                  ? 'text-white font-medium'
                  : 'text-white/60'
                  }`}>
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 py-8">
        {/* Enhanced Plan Limit Warning */}
        {!canCreateCatalogue() && (
          <Alert variant="destructive" className="mb-8 border-red-200 bg-red-50/80 backdrop-blur-sm">
            <AlertTriangle className="h-5 w-5" />
            <AlertDescription className="text-red-800">
              You have reached the catalogue limit for your current plan.
              <button
                onClick={() => setShowUpgradePrompt(true)}
                className="underline ml-1 hover:no-underline font-medium text-red-700"
              >
                Upgrade your plan
              </button> to create more catalogues.
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive" className="mb-8 border-red-200 bg-red-50/80 backdrop-blur-sm">
            <AlertTriangle className="h-5 w-5" />
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        {/* Enhanced Step Content */}
        <div className="max-w-4xl mx-auto">
          {currentStep === 1 && (
            <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-[#301F70]/5 to-[#1A1B41]/5 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-[#301F70] to-[#1A1B41] rounded-xl flex items-center justify-center">
                    <Settings className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl text-[#1A1B41]">Basic Information</CardTitle>
                    <CardDescription className="text-gray-600 text-lg">
                      Let's start with the essential details for your catalogue
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-8 p-8">
                <div className="space-y-3">
                  <Label htmlFor="name" className="text-base font-medium text-[#1A1B41]">
                    Catalogue Name *
                  </Label>
                  <Input
                    id="name"
                    value={data.name}
                    onChange={(e) => updateData('name', e.target.value)}
                    placeholder="Enter a compelling catalogue name"
                    className="h-12 border-gray-200 focus:border-[#301F70] focus:ring-[#301F70]/20 text-lg"
                    required
                  />
                  <p className="text-sm text-gray-500">This will be the main title of your catalogue</p>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="description" className="text-base font-medium text-[#1A1B41]">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    value={data.description}
                    onChange={(e) => updateData('description', e.target.value)}
                    placeholder="Describe your catalogue and what products it contains..."
                    rows={4}
                    className="border-gray-200 focus:border-[#301F70] focus:ring-[#301F70]/20 text-base"
                  />
                  <p className="text-sm text-gray-500">Help customers understand what they'll find in your catalogue</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label htmlFor="tagline" className="text-base font-medium text-[#1A1B41]">
                      Tagline
                    </Label>
                    <Input
                      id="tagline"
                      value={data.tagline}
                      onChange={(e) => updateData('tagline', e.target.value)}
                      placeholder="Your catchy tagline..."
                      className="h-12 border-gray-200 focus:border-[#301F70] focus:ring-[#301F70]/20"
                    />
                    <p className="text-sm text-gray-500">A memorable phrase for your brand</p>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="year" className="text-base font-medium text-[#1A1B41]">
                      Catalogue Year
                    </Label>
                    <Input
                      id="year"
                      value={data.year}
                      onChange={(e) => updateData('year', e.target.value)}
                      placeholder="2024"
                      className="h-12 border-gray-200 focus:border-[#301F70] focus:ring-[#301F70]/20"
                    />
                    <p className="text-sm text-gray-500">Year for this catalogue edition</p>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="quote" className="text-base font-medium text-[#1A1B41]">
                      Quote
                    </Label>
                    <Textarea
                      id="quote"
                      value={data.quote}
                      onChange={(e) => updateData('quote', e.target.value)}
                      placeholder="An inspiring quote..."
                      rows={3}
                      className="border-gray-200 focus:border-[#301F70] focus:ring-[#301F70]/20"
                    />
                    <p className="text-sm text-gray-500">Optional inspirational message</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {currentStep === 2 && (
            <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-[#301F70]/5 to-[#1A1B41]/5 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-[#301F70] to-[#1A1B41] rounded-xl flex items-center justify-center">
                    <Layout className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg text-[#1A1B41]">Choose Template</CardTitle>
                    <CardDescription className="text-gray-600 text-sm">
                      Select a template layout that best showcases your products
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="bg-gradient-to-r from-[#779CAB]/10 to-[#A2E8DD]/10 rounded-xl p-4 mb-4">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle className="h-4 w-4 text-[#779CAB]" />
                    <span className="font-medium text-sm text-[#1A1B41]">Template Selection</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Each template is professionally designed to highlight different types of products and business styles.
                  </p>
                </div>
                <TemplateThemeWorkflow
                  userProfile={profile}
                  initialTemplateId={data.templateId}
                  onSelectionComplete={(templateId) => {
                    updateData('templateId', templateId)
                    updateData('settings.templateId', templateId)
                  }}
                  showPreview={true}
                  className="mt-4"
                />
              </CardContent>
            </Card>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              {/* Company Information */}
              <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-[#301F70]/5 to-[#1A1B41]/5 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-[#301F70] to-[#1A1B41] rounded-xl flex items-center justify-center">
                      <Settings className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg text-[#1A1B41]">Company Information</CardTitle>
                      <CardDescription className="text-gray-600 text-sm">
                        Add your company details to personalize your catalogue
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-5 space-y-4">
                  <div>
                    <Label htmlFor="companyName" className="text-sm font-medium text-[#1A1B41] mb-2 block">Company Name</Label>
                    <Input
                      id="companyName"
                      value={data.companyName || ''}
                      onChange={(e) => updateData('companyName', e.target.value)}
                      placeholder="Enter your company name"
                      className="h-10 text-sm border-2 border-gray-200 focus:border-[#779CAB] rounded-lg"
                    />
                  </div>

                  <div>
                    <Label htmlFor="companyDescription" className="text-sm font-medium text-[#1A1B41] mb-2 block">Company Description</Label>
                    <Textarea
                      id="companyDescription"
                      value={data.companyDescription || ''}
                      onChange={(e) => updateData('companyDescription', e.target.value)}
                      placeholder="Describe your company and what you do"
                      rows={3}
                      className="text-sm border-2 border-gray-200 focus:border-[#779CAB] rounded-lg resize-none"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Media & Assets */}
              <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-[#301F70]/5 to-[#1A1B41]/5 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-[#301F70] to-[#1A1B41] rounded-xl flex items-center justify-center">
                      <Image className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg text-[#1A1B41]">Media & Assets</CardTitle>
                      <CardDescription className="text-gray-600 text-sm">
                        Upload your logo and cover image to brand your catalogue
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-5 space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-[#1A1B41] mb-2 block">Company Logo</Label>
                    {!data.logoUrl ? (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-3 hover:border-[#779CAB] transition-colors">
                        <FileUpload
                          uploadType="catalogue"
                          catalogueId={data.id || 'temp'}
                          onUpload={(results) => {
                            if (results.length > 0) {
                              updateData('logoUrl', results[0].url)
                            }
                          }}
                          maxFiles={1}
                          accept={['image/jpeg', 'image/jpg', 'image/png', 'image/webp']}
                          className="w-full"
                        />
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <img
                          src={data.logoUrl}
                          alt="Logo preview"
                          className="w-20 h-20 object-cover rounded-lg border-2 border-gray-200 shadow-sm"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => updateData('logoUrl', '')}
                          className="text-xs border-2 hover:border-[#779CAB] hover:text-[#779CAB]"
                        >
                          Change Logo
                        </Button>
                      </div>
                    )}
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-[#1A1B41] mb-2 block">Cover Image</Label>
                    {!data.coverImageUrl ? (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-3 hover:border-[#779CAB] transition-colors">
                        <FileUpload
                          uploadType="catalogue"
                          catalogueId={data.id || 'temp'}
                          onUpload={(results) => {
                            if (results.length > 0) {
                              updateData('coverImageUrl', results[0].url)
                            }
                          }}
                          maxFiles={1}
                          accept={['image/jpeg', 'image/jpg', 'image/png', 'image/webp']}
                          className="w-full"
                        />
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <img
                          src={data.coverImageUrl}
                          alt="Cover image preview"
                          className="w-32 h-20 object-cover rounded-lg border-2 border-gray-200 shadow-sm"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => updateData('coverImageUrl', '')}
                          className="text-xs border-2 hover:border-[#779CAB] hover:text-[#779CAB]"
                        >
                          Change Cover Image
                        </Button>
                      </div>
                    )}
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-[#1A1B41] mb-2 block">Intro Image</Label>
                    {!data.introImage ? (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-3 hover:border-[#779CAB] transition-colors">
                        <FileUpload
                          uploadType="catalogue"
                          catalogueId={data.id || 'temp'}
                          onUpload={(results) => {
                            if (results.length > 0) {
                              updateData('introImage', results[0].url)
                            }
                          }}
                          maxFiles={1}
                          accept={['image/jpeg', 'image/jpg', 'image/png', 'image/webp']}
                          className="w-full"
                        />
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <img
                          src={data.introImage}
                          alt="Intro image preview"
                          className="w-32 h-20 object-cover rounded-lg border-2 border-gray-200 shadow-sm"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => updateData('introImage', '')}
                          className="text-xs border-2 hover:border-[#779CAB] hover:text-[#779CAB]"
                        >
                          Change Intro Image
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Contact Details */}
              <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-[#301F70]/5 to-[#1A1B41]/5 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-[#301F70] to-[#1A1B41] rounded-xl flex items-center justify-center">
                      <Mail className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg text-[#1A1B41]">Contact Details</CardTitle>
                      <CardDescription className="text-gray-600 text-sm">
                        Add your contact information to help customers reach you
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-5 space-y-4">
                  <div>
                    <Label htmlFor="email" className="text-sm font-medium text-[#1A1B41] mb-2 block">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={data.email || ''}
                      onChange={(e) => updateData('email', e.target.value)}
                      placeholder="contact@company.com"
                      className="h-10 text-sm border-2 border-gray-200 focus:border-[#779CAB] rounded-lg"
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone" className="text-sm font-medium text-[#1A1B41] mb-2 block">Phone</Label>
                    <Input
                      id="phone"
                      value={data.phone || ''}
                      onChange={(e) => updateData('phone', e.target.value)}
                      placeholder="+1 (555) 123-4567"
                      className="h-10 text-sm border-2 border-gray-200 focus:border-[#779CAB] rounded-lg"
                    />
                  </div>

                  <div>
                    <Label htmlFor="website" className="text-sm font-medium text-[#1A1B41] mb-2 block">Website</Label>
                    <Input
                      id="website"
                      value={data.website || ''}
                      onChange={(e) => updateData('website', e.target.value)}
                      placeholder="https://www.company.com"
                      className="h-10 text-sm border-2 border-gray-200 focus:border-[#779CAB] rounded-lg"
                    />
                  </div>

                  <div>
                    <Label htmlFor="address" className="text-sm font-medium text-[#1A1B41] mb-2 block">Address</Label>
                    <Textarea
                      id="address"
                      value={data.address || ''}
                      onChange={(e) => updateData('address', e.target.value)}
                      placeholder="123 Main Street, City, State, ZIP"
                      rows={3}
                      className="text-sm border-2 border-gray-200 focus:border-[#779CAB] rounded-lg"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Social Media */}
              <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-[#301F70]/5 to-[#1A1B41]/5 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-[#301F70] to-[#1A1B41] rounded-xl flex items-center justify-center">
                      <Share2 className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg text-[#1A1B41]">Social Media</CardTitle>
                      <CardDescription className="text-gray-600 text-sm">
                        Connect your social media profiles (optional)
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-5 space-y-4">
                  <div>
                    <Label htmlFor="facebook" className="text-sm font-medium text-[#1A1B41] mb-2 block">Facebook</Label>
                    <Input
                      id="facebook"
                      value={data.facebook || ''}
                      onChange={(e) => updateData('facebook', e.target.value)}
                      placeholder="https://facebook.com/yourpage"
                      className="h-10 text-sm border-2 border-gray-200 focus:border-[#779CAB] rounded-lg"
                    />
                  </div>

                  <div>
                    <Label htmlFor="twitter" className="text-sm font-medium text-[#1A1B41] mb-2 block">Twitter</Label>
                    <Input
                      id="twitter"
                      value={data.twitter || ''}
                      onChange={(e) => updateData('twitter', e.target.value)}
                      placeholder="https://twitter.com/yourhandle"
                      className="h-10 text-sm border-2 border-gray-200 focus:border-[#779CAB] rounded-lg"
                    />
                  </div>

                  <div>
                    <Label htmlFor="instagram" className="text-sm font-medium text-[#1A1B41] mb-2 block">Instagram</Label>
                    <Input
                      id="instagram"
                      value={data.instagram || ''}
                      onChange={(e) => updateData('instagram', e.target.value)}
                      placeholder="https://instagram.com/yourhandle"
                      className="h-10 text-sm border-2 border-gray-200 focus:border-[#779CAB] rounded-lg"
                    />
                  </div>

                  <div>
                    <Label htmlFor="linkedin" className="text-sm font-medium text-[#1A1B41] mb-2 block">LinkedIn</Label>
                    <Input
                      id="linkedin"
                      value={data.linkedin || ''}
                      onChange={(e) => updateData('linkedin', e.target.value)}
                      placeholder="https://linkedin.com/company/yourcompany"
                      className="h-10 text-sm border-2 border-gray-200 focus:border-[#779CAB] rounded-lg"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Contact Page Details */}
              <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-[#301F70]/5 to-[#1A1B41]/5 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-[#301F70] to-[#1A1B41] rounded-xl flex items-center justify-center">
                      <FileText className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg text-[#1A1B41]">Contact Page Details</CardTitle>
                      <CardDescription className="text-gray-600 text-sm">
                        Additional content for your contact page
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-5 space-y-4">
                  <div>
                    <Label htmlFor="contactDescription" className="text-sm font-medium text-[#1A1B41] mb-2 block">Contact Page Description</Label>
                    <Textarea
                      id="contactDescription"
                      value={data.contactDescription || ''}
                      onChange={(e) => updateData('contactDescription', e.target.value)}
                      placeholder="Describe your contact page or add a welcome message..."
                      rows={3}
                      className="text-sm border-2 border-gray-200 focus:border-[#779CAB] rounded-lg"
                    />
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-[#1A1B41] mb-2 block">Contact Image</Label>
                    {!data.contactImage ? (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-3 hover:border-[#779CAB] transition-colors">
                        <FileUpload
                          uploadType="catalogue"
                          catalogueId={data.id || 'temp'}
                          onUpload={(results) => {
                            if (results.length > 0) {
                              updateData('contactImage', results[0].url)
                            }
                          }}
                          maxFiles={1}
                          accept={['image/jpeg', 'image/jpg', 'image/png', 'image/webp']}
                          className="w-full"
                        />
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <img
                          src={data.contactImage}
                          alt="Contact image preview"
                          className="w-32 h-20 object-cover rounded-lg border-2 border-gray-200 shadow-sm"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => updateData('contactImage', '')}
                          className="text-xs border-2 hover:border-[#779CAB] hover:text-[#779CAB]"
                        >
                          Change Contact Image
                        </Button>
                      </div>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="contactQuote" className="text-sm font-medium text-[#1A1B41] mb-2 block">Contact Quote</Label>
                    <Textarea
                      id="contactQuote"
                      value={data.contactQuote || ''}
                      onChange={(e) => updateData('contactQuote', e.target.value)}
                      placeholder="A quote or message for your contact page..."
                      rows={3}
                      className="text-sm border-2 border-gray-200 focus:border-[#779CAB] rounded-lg"
                    />
                  </div>

                  <div>
                    <Label htmlFor="contactQuoteBy" className="text-sm font-medium text-[#1A1B41] mb-2 block">Quote Attribution</Label>
                    <Input
                      id="contactQuoteBy"
                      value={data.contactQuoteBy || ''}
                      onChange={(e) => updateData('contactQuoteBy', e.target.value)}
                      placeholder="- Author Name"
                      className="h-10 text-sm border-2 border-gray-200 focus:border-[#779CAB] rounded-lg"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-6">
              {/* Display Settings */}
              <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-[#301F70]/5 to-[#1A1B41]/5 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-[#301F70] to-[#1A1B41] rounded-xl flex items-center justify-center">
                      <Settings className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg text-[#1A1B41]">Display Settings</CardTitle>
                      <CardDescription className="text-gray-600 text-sm">
                        Configure how your catalogue will be displayed
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-5 space-y-4">
                  <div className="flex items-center justify-between bg-gray-50/50 rounded-lg p-3">
                    <div>
                      <Label className="text-sm font-medium text-[#1A1B41]">Show Prices</Label>
                      <p className="text-xs text-gray-600 mt-1">Display product prices in the catalogue</p>
                    </div>
                    <Switch
                      checked={data.showPrices}
                      onCheckedChange={(checked) => updateData('showPrices', checked)}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Show Categories</Label>
                      <p className="text-sm text-gray-600">Group products by categories</p>
                    </div>
                    <Switch
                      checked={data.showCategories}
                      onCheckedChange={(checked) => updateData('showCategories', checked)}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Allow Search</Label>
                      <p className="text-sm text-gray-600">Enable search functionality</p>
                    </div>
                    <Switch
                      checked={data.allowSearch}
                      onCheckedChange={(checked) => updateData('allowSearch', checked)}
                    />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Show Product Codes</Label>
                      <p className="text-sm text-gray-600">Display SKU or product codes</p>
                    </div>
                    <Switch
                      checked={data.showProductCodes}
                      onCheckedChange={(checked) => updateData('showProductCodes', checked)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Visibility Settings */}
              <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-t-lg">
                  <CardTitle className="text-xl text-gray-800">Visibility</CardTitle>
                  <CardDescription className="text-gray-600">
                    Control who can access your catalogue
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${!data.isPublic
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                        }`}
                      onClick={() => updateData('isPublic', false)}
                    >
                      <div className="flex items-center gap-3">
                        <Lock className="h-5 w-5 text-gray-600" />
                        <div>
                          <h4 className="font-medium">Private</h4>
                          <p className="text-sm text-gray-600">Only you can access</p>
                        </div>
                      </div>
                    </div>

                    <div
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${data.isPublic
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                        }`}
                      onClick={() => updateData('isPublic', true)}
                    >
                      <div className="flex items-center gap-3">
                        <Globe className="h-5 w-5 text-gray-600" />
                        <div>
                          <h4 className="font-medium">Public</h4>
                          <p className="text-sm text-gray-600">Anyone with link can view</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="max-w-3xl mx-auto mt-12">
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="px-8 py-4 text-lg font-medium border-2 border-gray-300 hover:border-[#779CAB] hover:text-[#779CAB] shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl"
            >
              <ArrowLeft className="mr-2 h-5 w-5" />
              Previous
            </Button>

            {currentStep < 4 ? (
              <Button
                onClick={nextStep}
                className="px-8 py-4 text-lg font-medium bg-gradient-to-r from-[#301F70] to-[#1A1B41] hover:from-[#1A1B41] hover:to-[#301F70] text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl"
              >
                Next
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            ) : (
              <Button
                onClick={saveCatalogue}
                disabled={isSaving}
                className="px-8 py-4 text-lg font-medium bg-gradient-to-r from-[#779CAB] to-[#A2E8DD] hover:from-[#A2E8DD] hover:to-[#779CAB] text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-5 w-5" />
                    Create Catalogue
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