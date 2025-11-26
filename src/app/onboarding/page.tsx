'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  X,
  ArrowRight,
  ArrowLeft,
  Check,
  User,
  Building,
  Sparkles,
  Zap,
  Shield,
  Globe,
  Users,
  Heart,
  Star,
} from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

export default function OnboardingPage() {
  const router = useRouter()
  const [profile, setProfile] = useState<any | null>(null)
  const [user, setUser] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const supabase = createClient()
  const accountType = profile?.accountType || 'BUSINESS'
  const isBusinessAccount = accountType === 'BUSINESS'
  const steps = [
    { id: 1, title: 'Welcome' },
    { id: 2, title: 'How It Works' },
    { id: 3, title: 'Business Features' },
  ]

  // Get user and profile on mount
  useEffect(() => {
    let mounted = true

    const getUserAndProfile = async () => {
      setLoading(true)
      try {
        const {
          data: { user: supUser },
        } = await supabase.auth.getUser()

        if (supUser) {
          if (!mounted) return
          setUser(supUser)

          // Fetch user profile to get account type
          try {
            const response = await fetch('/api/auth/profile')
            if (response.ok) {
              const data = await response.json()
              if (!mounted) return
              setProfile(data.profile || null)
            }
          } catch (error) {
            console.error('Failed to fetch profile:', error)
          }
        } else {
          router.push('/auth/login')
        }
      } catch (err) {
        console.error('getUserAndProfile error', err)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    getUserAndProfile()

    return () => {
      mounted = false
    }
  }, [supabase, router])

  const nextStep = () =>
    setCurrentStep(prev => Math.min(prev + 1, steps.length))
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1))

  const completeOnboarding = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ onboardingCompleted: true }),
      })

      if (!response.ok) {
        throw new Error('Failed to update profile')
      }

      // update local profile state
      setProfile((prev: any) => ({
        ...(prev || {}),
        onboardingCompleted: true,
      }))
      toast.success('Onboarding completed')
      router.push('/dashboard')
    } catch (err) {
      console.error('completeOnboarding error', err)
      toast.error('Could not complete onboarding')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-blue-100 via-purple-50 to-blue-100 p-6">
      {/* Starfield effect */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {[...Array(100)].map((_, i) => (
          <div
            key={i}
            className="absolute h-1 w-1 rounded-full bg-white opacity-90"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `twinkle ${2 + Math.random() * 3}s infinite ${Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      <style jsx>{`
        @keyframes twinkle {
          0%,
          100% {
            opacity: 0.3;
          }
          50% {
            opacity: 1;
          }
        }
      `}</style>

      {/* Close button */}
      <button className="absolute right-6 top-6 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-lg transition-colors hover:bg-gray-50">
        <X className="h-5 w-5 text-gray-600" />
      </button>

      {/* Main card */}
      <div className="relative z-10 w-full max-w-2xl">
        <div className="rounded-3xl bg-white p-8 shadow-2xl md:p-8">
          {/* Step indicators */}
          <div className="mb-8 flex items-center justify-center gap-2">
            {steps.map((step, idx) => (
              <div
                key={step.id}
                className={`h-2 rounded-full transition-all duration-300 ${
                  idx + 1 === currentStep
                    ? 'w-8 bg-gradient-to-br from-[#6366F1] to-[#2D1B69]'
                    : idx + 1 < currentStep
                      ? 'w-2 bg-blue-300'
                      : 'w-2 bg-gray-300'
                }`}
              />
            ))}
          </div>

          {/* Content */}
          <div className="flex items-center justify-center">
            {currentStep === 1 && (
              <div className="flex h-[380px] w-full flex-col justify-center text-center">
                <h1 className="text-4xl font-bold leading-tight text-gray-900">
                  Welcome to CATFY
                </h1>

                <p className="mx-auto mb-6 max-w-xl text-base text-gray-600">
                  {isBusinessAccount
                    ? 'Create stunning, AI-powered business catalogues in minutes'
                    : 'Create beautiful, AI-powered personal catalogues effortlessly'}
                </p>

                {/* Visual Catalogue Builder Preview */}
                <div className="relative mx-auto max-w-lg">
                  {/* Mock Catalogue Page */}
                  <div className="rounded-2xl border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-purple-50 p-6 shadow-lg">
                    {/* Header */}
                    <div className="mb-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600"></div>
                        <div className="h-3 w-24 rounded bg-gray-300"></div>
                      </div>
                      <div className="flex gap-1">
                        <div className="h-2 w-2 rounded-full bg-gray-300"></div>
                        <div className="h-2 w-2 rounded-full bg-gray-300"></div>
                        <div className="h-2 w-2 rounded-full bg-gray-300"></div>
                      </div>
                    </div>

                    {/* Product Grid */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-xl bg-white p-3 shadow-sm">
                        <div className="mb-2 h-6 w-28 rounded-lg bg-gradient-to-br from-pink-200 to-orange-200"></div>
                        <div className="mb-1 h-2 w-full rounded bg-gray-200"></div>
                        <div className="h-2 w-3/4 rounded bg-gray-200"></div>
                      </div>
                      <div className="rounded-xl bg-white p-3 shadow-sm">
                        <div className="mb-2 h-6 w-20 rounded-lg bg-gradient-to-br from-green-200 to-blue-200"></div>
                        <div className="mb-1 h-2 w-full rounded bg-gray-200"></div>
                        <div className="h-2 w-3/4 rounded bg-gray-200"></div>
                      </div>
                      <div className="rounded-xl bg-white p-3 shadow-sm">
                        <div className="mb-2 h-6 w-20 rounded-lg bg-gradient-to-br from-purple-200 to-pink-200"></div>
                        <div className="mb-1 h-2 w-full rounded bg-gray-200"></div>
                        <div className="h-2 w-3/4 rounded bg-gray-200"></div>
                      </div>
                      <div className="rounded-xl bg-white p-3 shadow-sm">
                        <div className="mb-2 h-6 w-20 rounded-lg bg-gradient-to-br from-yellow-200 to-orange-200"></div>
                        <div className="mb-1 h-2 w-full rounded bg-gray-200"></div>
                        <div className="h-2 w-3/4 rounded bg-gray-200"></div>
                      </div>
                    </div>
                  </div>

                  {/* AI Badge */}
                  <div className="absolute -right-3 -top-3 flex items-center gap-1 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 px-3 py-1.5 text-xs font-semibold text-white shadow-lg">
                    <Sparkles className="h-3 w-3" />
                    AI Powered
                  </div>

                  {/* Export Badge */}
                  <div className="absolute -bottom-3 -left-3 rounded-full bg-gradient-to-r from-blue-500 to-cyan-600 px-3 py-1.5 text-xs font-semibold text-white shadow-lg">
                    📄 Export to PDF
                  </div>
                </div>

                <p className="mx-auto mt-6 max-w-md text-sm text-gray-500">
                  {isBusinessAccount
                    ? 'Professional catalogues with AI descriptions, team collaboration, and instant PDF export'
                    : 'Beautiful catalogues with AI descriptions, custom themes, and easy PDF sharing'}
                </p>
              </div>
            )}

            {currentStep === 2 && (
              <div className="flex h-[380px] w-full flex-col justify-center text-center">
                <h1 className="text-4xl font-bold text-gray-900">
                  How It Works
                </h1>
                <p className="mb-8 text-base text-gray-600">
                  {isBusinessAccount
                    ? 'Simple 4-step process optimized for business workflows'
                    : 'Easy 4-step process designed for personal use'}
                </p>

                {/* Visual Workflow */}
                <div className="relative mx-auto max-w-3xl">
                  <div className="grid grid-cols-4 gap-3">
                    {/* Step 1: Choose Theme */}
                    <div className="relative">
                      <div className="flex h-52 flex-col items-center justify-center rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 p-4 shadow-md">
                        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 font-bold text-white shadow-lg">
                          1
                        </div>
                        {/* Theme Selector Visual */}
                        <div className="w-full space-y-2 px-2">
                          <div className="h-3 rounded bg-gradient-to-r from-pink-400 to-purple-400"></div>
                          <div className="h-3 rounded bg-gradient-to-r from-blue-400 to-cyan-400"></div>
                          <div className="h-3 rounded bg-gradient-to-r from-green-400 to-emerald-400"></div>
                          <div className="h-3 rounded bg-gradient-to-r from-orange-400 to-yellow-400"></div>
                        </div>
                        <p className="mt-4 text-xs font-semibold text-gray-700">
                          Choose Theme
                        </p>
                      </div>
                    </div>

                    {/* Step 2: Add Products */}
                    <div className="relative">
                      <div className="flex h-52 flex-col items-center justify-center rounded-xl bg-gradient-to-br from-green-100 to-green-200 p-4 shadow-md">
                        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-green-600 font-bold text-white shadow-lg">
                          2
                        </div>
                        {/* Product Upload Visual */}
                        <div className="grid w-full grid-cols-2 gap-2 px-2">
                          <div className="h-10 rounded-lg bg-gradient-to-br from-orange-300 to-pink-300"></div>
                          <div className="h-10 rounded-lg bg-gradient-to-br from-blue-300 to-purple-300"></div>
                          <div className="h-10 rounded-lg bg-gradient-to-br from-yellow-300 to-orange-300"></div>
                          <div className="h-10 rounded-lg bg-gradient-to-br from-green-300 to-teal-300"></div>
                        </div>
                        <p className="mt-4 text-xs font-semibold text-gray-700">
                          Add Items
                        </p>
                      </div>
                    </div>

                    {/* Step 3: AI & Customize */}
                    <div className="relative">
                      <div className="flex h-52 flex-col items-center justify-center rounded-xl bg-gradient-to-br from-purple-100 to-purple-200 p-4 shadow-md">
                        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-purple-600 font-bold text-white shadow-lg">
                          3
                        </div>
                        {/* AI Customization Visual */}
                        <Sparkles className="mb-2 h-10 w-10 text-purple-500" />
                        <div className="w-full space-y-2 px-2">
                          <div className="h-2 w-full rounded bg-purple-300"></div>
                          <div className="mx-auto h-2 w-4/5 rounded bg-purple-300"></div>
                          <div className="mx-auto h-2 w-3/4 rounded bg-purple-300"></div>
                        </div>
                        <p className="mt-4 text-xs font-semibold text-gray-700">
                          AI Enhance
                        </p>
                      </div>
                    </div>

                    {/* Step 4: Export */}
                    <div className="relative">
                      <div className="flex h-52 flex-col items-center justify-center rounded-xl bg-gradient-to-br from-orange-100 to-orange-200 p-4 shadow-md">
                        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-orange-600 font-bold text-white shadow-lg">
                          4
                        </div>
                        {/* Export Visual */}
                        <div className="mb-3 text-5xl">📄</div>
                        <div className="flex gap-1.5">
                          <div className="h-2 w-2 rounded-full bg-orange-400"></div>
                          <div className="h-2 w-2 rounded-full bg-orange-400"></div>
                          <div className="h-2 w-2 rounded-full bg-orange-400"></div>
                        </div>
                        <p className="mt-4 text-xs font-semibold text-gray-700">
                          Export PDF
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Connecting Line */}
                  <div className="absolute left-0 right-0 top-[4.75rem] -z-10 h-0.5 bg-gradient-to-r from-blue-300 via-purple-300 to-orange-300"></div>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="flex h-[380px] w-full flex-col justify-center text-center">
                <h1 className="text-4xl font-bold text-gray-900">
                  {isBusinessAccount
                    ? 'Business Features'
                    : 'Personal Features'}
                </h1>
                <p className="mb-6 text-base text-gray-600">
                  {isBusinessAccount
                    ? 'Powerful business tools to enhance your workflow'
                    : 'Perfect tools for organizing your personal collections'}
                </p>

                {/* Visual Feature Showcase */}
                <div className="mx-auto grid max-w-2xl grid-cols-2 gap-4">
                  {isBusinessAccount ? (
                    <>
                      {/* AI Descriptions Feature */}
                      <div className="rounded-2xl border border-purple-100 bg-gradient-to-br from-purple-50 to-pink-50 p-4 shadow-md">
                        {/* Visual: AI writing text */}
                        <div className="mb-2 h-[100px] rounded-lg bg-white p-2.5">
                          <div className="mb-2 flex items-start gap-2">
                            <div className="h-10 w-10 flex-shrink-0 rounded bg-gradient-to-br from-blue-300 to-purple-300"></div>
                            <div className="flex-1 space-y-1.5">
                              <div className="h-1.5 w-full rounded bg-purple-200"></div>
                              <div className="h-1.5 w-4/5 rounded bg-purple-200"></div>
                              <div className="h-1.5 w-3/4 rounded bg-purple-200"></div>
                              <div className="h-1.5 w-full rounded bg-purple-200"></div>
                            </div>
                          </div>
                          <div className="absolute ml-1 mt-1 rounded-full bg-purple-500 px-1.5 py-0.5 text-[10px] text-white">
                            ✨ AI
                          </div>
                        </div>
                        <p className="text-xs font-semibold text-gray-700">
                          Enterprise AI
                        </p>
                      </div>

                      {/* Team Collaboration Feature */}
                      <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-cyan-50 p-4 shadow-md">
                        {/* Visual: Team avatars */}
                        <div className="mb-2 flex h-[100px] items-center justify-center rounded-lg bg-white p-2.5">
                          <div className="flex -space-x-2">
                            <div className="h-9 w-9 rounded-full border-2 border-white bg-gradient-to-br from-blue-400 to-blue-500"></div>
                            <div className="h-9 w-9 rounded-full border-2 border-white bg-gradient-to-br from-green-400 to-green-500"></div>
                            <div className="h-9 w-9 rounded-full border-2 border-white bg-gradient-to-br from-purple-400 to-purple-500"></div>
                            <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-gradient-to-br from-orange-400 to-orange-500 text-xs font-bold text-white">
                              +5
                            </div>
                          </div>
                        </div>
                        <p className="text-xs font-semibold text-gray-700">
                          Team Collab
                        </p>
                      </div>

                      {/* Branding Feature */}
                      <div className="rounded-2xl border border-orange-100 bg-gradient-to-br from-orange-50 to-yellow-50 p-4 shadow-md">
                        {/* Visual: Brand customization */}
                        <div className="mb-2 h-[100px] rounded-lg bg-white p-2.5">
                          <div className="mb-2 flex items-center justify-center gap-1.5">
                            <div className="h-7 w-7 rounded bg-gradient-to-br from-orange-400 to-yellow-400"></div>
                            <div className="h-1.5 w-14 rounded bg-gray-200"></div>
                          </div>
                          <div className="mt-2 grid grid-cols-3 gap-2">
                            <div className="h-5 rounded bg-orange-200"></div>
                            <div className="h-5 rounded bg-yellow-200"></div>
                            <div className="h-5 rounded bg-red-200"></div>
                          </div>
                          <div className="mt-2 flex gap-1">
                            <div className="h-1 flex-1 rounded bg-gray-200"></div>
                            <div className="h-1 flex-1 rounded bg-gray-200"></div>
                          </div>
                        </div>
                        <p className="text-xs font-semibold text-gray-700">
                          Brand Styling
                        </p>
                      </div>

                      {/* Export Feature */}
                      <div className="rounded-2xl border border-green-100 bg-gradient-to-br from-green-50 to-emerald-50 p-4 shadow-md">
                        {/* Visual: PDF export */}
                        <div className="mb-2 flex h-[100px] flex-col items-center justify-center rounded-lg bg-white p-2.5">
                          <div className="mb-1 text-4xl">📄</div>
                          <div className="mt-1 flex items-center justify-center gap-1">
                            <div className="h-1.5 w-1.5 rounded-full bg-green-400"></div>
                            <div className="h-1.5 w-1.5 rounded-full bg-green-400"></div>
                            <div className="h-1.5 w-1.5 rounded-full bg-green-400"></div>
                          </div>
                          <p className="mt-1 text-[10px] text-gray-500">
                            Export Ready
                          </p>
                        </div>
                        <p className="text-xs font-semibold text-gray-700">
                          PDF Export
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Personal AI Feature */}
                      <div className="rounded-2xl border border-green-100 bg-gradient-to-br from-green-50 to-emerald-50 p-4 shadow-md">
                        <div className="mb-2 h-[100px] rounded-lg bg-white p-2.5">
                          <div className="mb-2 flex items-start gap-2">
                            <div className="h-10 w-10 flex-shrink-0 rounded bg-gradient-to-br from-pink-300 to-purple-300"></div>
                            <div className="flex-1 space-y-1.5">
                              <div className="h-1.5 w-full rounded bg-green-200"></div>
                              <div className="h-1.5 w-4/5 rounded bg-green-200"></div>
                              <div className="h-1.5 w-3/4 rounded bg-green-200"></div>
                              <div className="h-1.5 w-full rounded bg-green-200"></div>
                            </div>
                          </div>
                        </div>
                        <p className="text-xs font-semibold text-gray-700">
                          AI Descriptions
                        </p>
                      </div>

                      {/* Easy Organization */}
                      <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50 p-4 shadow-md">
                        <div className="mb-2 h-[100px] rounded-lg bg-white p-2.5">
                          <div className="grid grid-cols-2 gap-2">
                            <div className="h-9 rounded bg-gradient-to-br from-pink-200 to-orange-200"></div>
                            <div className="h-9 rounded bg-gradient-to-br from-blue-200 to-cyan-200"></div>
                            <div className="h-9 rounded bg-gradient-to-br from-purple-200 to-pink-200"></div>
                            <div className="h-9 rounded bg-gradient-to-br from-green-200 to-emerald-200"></div>
                          </div>
                        </div>
                        <p className="text-xs font-semibold text-gray-700">
                          Organization
                        </p>
                      </div>

                      {/* Themes */}
                      <div className="rounded-2xl border border-purple-100 bg-gradient-to-br from-purple-50 to-pink-50 p-4 shadow-md">
                        <div className="mb-2 flex h-[100px] flex-col justify-center space-y-2 rounded-lg bg-white p-2.5">
                          <div className="h-2.5 rounded bg-gradient-to-r from-pink-300 to-purple-300"></div>
                          <div className="h-2.5 rounded bg-gradient-to-r from-blue-300 to-cyan-300"></div>
                          <div className="h-2.5 rounded bg-gradient-to-r from-green-300 to-emerald-300"></div>
                          <div className="h-2.5 rounded bg-gradient-to-r from-orange-300 to-yellow-300"></div>
                        </div>
                        <p className="text-xs font-semibold text-gray-700">
                          Beautiful Themes
                        </p>
                      </div>

                      {/* Sharing */}
                      <div className="rounded-2xl border border-orange-100 bg-gradient-to-br from-orange-50 to-yellow-50 p-4 shadow-md">
                        <div className="mb-2 flex h-[100px] flex-col items-center justify-center rounded-lg bg-white p-2.5">
                          <div className="mb-1 text-4xl">📤</div>
                          <div className="mt-1 flex items-center justify-center gap-1">
                            <div className="h-1.5 w-1.5 rounded-full bg-orange-400"></div>
                            <div className="h-1.5 w-1.5 rounded-full bg-orange-400"></div>
                            <div className="h-1.5 w-1.5 rounded-full bg-orange-400"></div>
                          </div>
                          <p className="mt-1 text-[10px] text-gray-500">
                            Share Easy
                          </p>
                        </div>
                        <p className="text-xs font-semibold text-gray-700">
                          Easy Sharing
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="mt-8 flex items-center justify-between border-t border-gray-100 pt-6">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className="flex items-center gap-2 px-5 py-2.5 font-medium text-gray-700 transition-colors hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>

            {currentStep < steps.length ? (
              <button
                onClick={nextStep}
                className="flex items-center gap-2 rounded-full bg-gradient-to-br from-[#6366F1] to-[#2D1B69] px-6 py-2.5 font-medium text-white transition-all hover:shadow-lg"
              >
                Next
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={completeOnboarding}
                disabled={saving}
                className="rounded-full bg-gradient-to-br from-[#6366F1] to-[#2D1B69] px-6 py-2.5 font-medium text-white transition-all hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Complete Setup'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
