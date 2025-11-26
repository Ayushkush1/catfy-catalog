'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { X, ArrowRight, ArrowLeft, Check, User, Building, Sparkles, Zap, Shield, Globe, Users, Heart, Star } from 'lucide-react'
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

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, steps.length))
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
      setProfile((prev: any) => ({ ...(prev || {}), onboardingCompleted: true }))
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
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-50 to-blue-100 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Starfield effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(100)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full opacity-90"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `twinkle ${2 + Math.random() * 3}s infinite ${Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      <style jsx>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
      `}</style>

      {/* Close button */}
      <button className="absolute top-6 right-6 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors z-10">
        <X className="w-5 h-5 text-gray-600" />
      </button>

      {/* Main card */}
      <div className="w-full max-w-2xl relative z-10">
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-8">
          {/* Step indicators */}
          <div className="flex justify-center items-center gap-2 mb-8">
            {steps.map((step, idx) => (
              <div
                key={step.id}
                className={`h-2 rounded-full transition-all duration-300 ${idx + 1 === currentStep
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
              <div className="text-center w-full h-[380px] flex flex-col justify-center">
                <h1 className="text-4xl font-bold text-gray-900 leading-tight">
                  Welcome to CATFY
                </h1>

                <p className="text-base text-gray-600 max-w-xl mx-auto mb-6">
                  {isBusinessAccount
                    ? 'Create stunning, AI-powered business catalogues in minutes'
                    : 'Create beautiful, AI-powered personal catalogues effortlessly'}
                </p>

                {/* Visual Catalogue Builder Preview */}
                <div className="relative max-w-lg mx-auto">
                  {/* Mock Catalogue Page */}
                  <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6 shadow-lg border-2 border-blue-200">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg"></div>
                        <div className="h-3 w-24 bg-gray-300 rounded"></div>
                      </div>
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                        <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                        <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                      </div>
                    </div>

                    {/* Product Grid */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-white rounded-xl p-3 shadow-sm">
                        <div className="w-28 h-6 bg-gradient-to-br from-pink-200 to-orange-200 rounded-lg mb-2"></div>
                        <div className="h-2 w-full bg-gray-200 rounded mb-1"></div>
                        <div className="h-2 w-3/4 bg-gray-200 rounded"></div>
                      </div>
                      <div className="bg-white rounded-xl p-3 shadow-sm">
                        <div className="w-20 h-6 bg-gradient-to-br from-green-200 to-blue-200 rounded-lg mb-2"></div>
                        <div className="h-2 w-full bg-gray-200 rounded mb-1"></div>
                        <div className="h-2 w-3/4 bg-gray-200 rounded"></div>
                      </div>
                      <div className="bg-white rounded-xl p-3 shadow-sm">
                        <div className="w-20 h-6 bg-gradient-to-br from-purple-200 to-pink-200 rounded-lg mb-2"></div>
                        <div className="h-2 w-full bg-gray-200 rounded mb-1"></div>
                        <div className="h-2 w-3/4 bg-gray-200 rounded"></div>
                      </div>
                      <div className="bg-white rounded-xl p-3 shadow-sm">
                        <div className="w-20 h-6 bg-gradient-to-br from-yellow-200 to-orange-200 rounded-lg mb-2"></div>
                        <div className="h-2 w-full bg-gray-200 rounded mb-1"></div>
                        <div className="h-2 w-3/4 bg-gray-200 rounded"></div>
                      </div>
                    </div>
                  </div>

                  {/* AI Badge */}
                  <div className="absolute -top-3 -right-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    AI Powered
                  </div>

                  {/* Export Badge */}
                  <div className="absolute -bottom-3 -left-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg">
                    📄 Export to PDF
                  </div>
                </div>

                <p className="text-sm text-gray-500 mt-6 max-w-md mx-auto">
                  {isBusinessAccount
                    ? 'Professional catalogues with AI descriptions, team collaboration, and instant PDF export'
                    : 'Beautiful catalogues with AI descriptions, custom themes, and easy PDF sharing'}
                </p>
              </div>
            )}

            {currentStep === 2 && (
              <div className="text-center w-full h-[380px] flex flex-col justify-center">
                <h1 className="text-4xl font-bold text-gray-900">
                  How It Works
                </h1>
                <p className="text-base text-gray-600 mb-8">
                  {isBusinessAccount
                    ? 'Simple 4-step process optimized for business workflows'
                    : 'Easy 4-step process designed for personal use'}
                </p>

                {/* Visual Workflow */}
                <div className="relative max-w-3xl mx-auto">
                  <div className="grid grid-cols-4 gap-3">
                    {/* Step 1: Choose Theme */}
                    <div className="relative">
                      <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl p-4 h-52 flex flex-col items-center justify-center shadow-md">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold mb-3 shadow-lg">
                          1
                        </div>
                        {/* Theme Selector Visual */}
                        <div className="space-y-2 w-full px-2">
                          <div className="h-3 bg-gradient-to-r from-pink-400 to-purple-400 rounded"></div>
                          <div className="h-3 bg-gradient-to-r from-blue-400 to-cyan-400 rounded"></div>
                          <div className="h-3 bg-gradient-to-r from-green-400 to-emerald-400 rounded"></div>
                          <div className="h-3 bg-gradient-to-r from-orange-400 to-yellow-400 rounded"></div>
                        </div>
                        <p className="text-xs font-semibold text-gray-700 mt-4">Choose Theme</p>
                      </div>
                    </div>

                    {/* Step 2: Add Products */}
                    <div className="relative">
                      <div className="bg-gradient-to-br from-green-100 to-green-200 rounded-xl p-4 h-52 flex flex-col items-center justify-center shadow-md">
                        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white font-bold mb-3 shadow-lg">
                          2
                        </div>
                        {/* Product Upload Visual */}
                        <div className="grid grid-cols-2 gap-2 w-full px-2">
                          <div className="h-10 bg-gradient-to-br from-orange-300 to-pink-300 rounded-lg"></div>
                          <div className="h-10 bg-gradient-to-br from-blue-300 to-purple-300 rounded-lg"></div>
                          <div className="h-10 bg-gradient-to-br from-yellow-300 to-orange-300 rounded-lg"></div>
                          <div className="h-10 bg-gradient-to-br from-green-300 to-teal-300 rounded-lg"></div>
                        </div>
                        <p className="text-xs font-semibold text-gray-700 mt-4">Add Items</p>
                      </div>

                    </div>

                    {/* Step 3: AI & Customize */}
                    <div className="relative">
                      <div className="bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl p-4 h-52 flex flex-col items-center justify-center shadow-md">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold mb-3 shadow-lg">
                          3
                        </div>
                        {/* AI Customization Visual */}
                        <Sparkles className="w-10 h-10 text-purple-500 mb-2" />
                        <div className="space-y-2 w-full px-2">
                          <div className="h-2 bg-purple-300 rounded w-full"></div>
                          <div className="h-2 bg-purple-300 rounded w-4/5 mx-auto"></div>
                          <div className="h-2 bg-purple-300 rounded w-3/4 mx-auto"></div>
                        </div>
                        <p className="text-xs font-semibold text-gray-700 mt-4">AI Enhance</p>
                      </div>

                    </div>

                    {/* Step 4: Export */}
                    <div className="relative">
                      <div className="bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl p-4 h-52 flex flex-col items-center justify-center shadow-md">
                        <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center text-white font-bold mb-3 shadow-lg">
                          4
                        </div>
                        {/* Export Visual */}
                        <div className="text-5xl mb-3">📄</div>
                        <div className="flex gap-1.5">
                          <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                          <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                          <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                        </div>
                        <p className="text-xs font-semibold text-gray-700 mt-4">Export PDF</p>
                      </div>
                    </div>
                  </div>

                  {/* Connecting Line */}
                  <div className="absolute top-[4.75rem] left-0 right-0 h-0.5 bg-gradient-to-r from-blue-300 via-purple-300 to-orange-300 -z-10"></div>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="text-center w-full h-[380px] flex flex-col justify-center">
                <h1 className="text-4xl font-bold text-gray-900">
                  {isBusinessAccount ? 'Business Features' : 'Personal Features'}
                </h1>
                <p className="text-base text-gray-600 mb-6">
                  {isBusinessAccount
                    ? 'Powerful business tools to enhance your workflow'
                    : 'Perfect tools for organizing your personal collections'}
                </p>

                {/* Visual Feature Showcase */}
                <div className="max-w-2xl mx-auto grid grid-cols-2 gap-4">
                  {isBusinessAccount ? (
                    <>
                      {/* AI Descriptions Feature */}
                      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-4 border border-purple-100 shadow-md">

                        {/* Visual: AI writing text */}
                        <div className="bg-white rounded-lg p-2.5 mb-2 h-[100px]">
                          <div className="flex items-start gap-2 mb-2">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-300 to-purple-300 rounded flex-shrink-0"></div>
                            <div className="flex-1 space-y-1.5">
                              <div className="h-1.5 bg-purple-200 rounded w-full"></div>
                              <div className="h-1.5 bg-purple-200 rounded w-4/5"></div>
                              <div className="h-1.5 bg-purple-200 rounded w-3/4"></div>
                              <div className="h-1.5 bg-purple-200 rounded w-full"></div>
                            </div>
                          </div>
                          <div className="absolute mt-1 ml-1 bg-purple-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                            ✨ AI
                          </div>
                        </div>
                        <p className="text-xs font-semibold text-gray-700">Enterprise AI</p>
                      </div>

                      {/* Team Collaboration Feature */}
                      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-4 border border-blue-100 shadow-md">

                        {/* Visual: Team avatars */}
                        <div className="bg-white rounded-lg p-2.5 mb-2 h-[100px] flex items-center justify-center">
                          <div className="flex -space-x-2">
                            <div className="w-9 h-9 bg-gradient-to-br from-blue-400 to-blue-500 rounded-full border-2 border-white"></div>
                            <div className="w-9 h-9 bg-gradient-to-br from-green-400 to-green-500 rounded-full border-2 border-white"></div>
                            <div className="w-9 h-9 bg-gradient-to-br from-purple-400 to-purple-500 rounded-full border-2 border-white"></div>
                            <div className="w-9 h-9 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold">
                              +5
                            </div>
                          </div>
                        </div>
                        <p className="text-xs font-semibold text-gray-700">Team Collab</p>
                      </div>

                      {/* Branding Feature */}
                      <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-2xl p-4 border border-orange-100 shadow-md">

                        {/* Visual: Brand customization */}
                        <div className="bg-white rounded-lg p-2.5 mb-2 h-[100px]">
                          <div className="flex items-center justify-center gap-1.5 mb-2">
                            <div className="w-7 h-7 bg-gradient-to-br from-orange-400 to-yellow-400 rounded"></div>
                            <div className="h-1.5 bg-gray-200 rounded w-14"></div>
                          </div>
                          <div className="grid grid-cols-3 gap-2 mt-2">
                            <div className="h-5 bg-orange-200 rounded"></div>
                            <div className="h-5 bg-yellow-200 rounded"></div>
                            <div className="h-5 bg-red-200 rounded"></div>
                          </div>
                          <div className="flex gap-1 mt-2">
                            <div className="h-1 bg-gray-200 rounded flex-1"></div>
                            <div className="h-1 bg-gray-200 rounded flex-1"></div>
                          </div>
                        </div>
                        <p className="text-xs font-semibold text-gray-700">Brand Styling</p>
                      </div>

                      {/* Export Feature */}
                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-4 border border-green-100 shadow-md">

                        {/* Visual: PDF export */}
                        <div className="bg-white rounded-lg p-2.5 mb-2 h-[100px] flex flex-col items-center justify-center">
                          <div className="text-4xl mb-1">📄</div>
                          <div className="flex items-center gap-1 justify-center mt-1">
                            <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                            <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                            <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                          </div>
                          <p className="text-[10px] text-gray-500 mt-1">Export Ready</p>
                        </div>
                        <p className="text-xs font-semibold text-gray-700">PDF Export</p>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Personal AI Feature */}
                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-4 border border-green-100 shadow-md">

                        <div className="bg-white rounded-lg p-2.5 mb-2 h-[100px]">
                          <div className="flex items-start gap-2 mb-2">
                            <div className="w-10 h-10 bg-gradient-to-br from-pink-300 to-purple-300 rounded flex-shrink-0"></div>
                            <div className="flex-1 space-y-1.5">
                              <div className="h-1.5 bg-green-200 rounded w-full"></div>
                              <div className="h-1.5 bg-green-200 rounded w-4/5"></div>
                              <div className="h-1.5 bg-green-200 rounded w-3/4"></div>
                              <div className="h-1.5 bg-green-200 rounded w-full"></div>
                            </div>
                          </div>
                        </div>
                        <p className="text-xs font-semibold text-gray-700">AI Descriptions</p>
                      </div>

                      {/* Easy Organization */}
                      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-4 border border-blue-100 shadow-md">

                        <div className="bg-white rounded-lg p-2.5 mb-2 h-[100px]">
                          <div className="grid grid-cols-2 gap-2">
                            <div className="h-9 bg-gradient-to-br from-pink-200 to-orange-200 rounded"></div>
                            <div className="h-9 bg-gradient-to-br from-blue-200 to-cyan-200 rounded"></div>
                            <div className="h-9 bg-gradient-to-br from-purple-200 to-pink-200 rounded"></div>
                            <div className="h-9 bg-gradient-to-br from-green-200 to-emerald-200 rounded"></div>
                          </div>
                        </div>
                        <p className="text-xs font-semibold text-gray-700">Organization</p>
                      </div>

                      {/* Themes */}
                      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-4 border border-purple-100 shadow-md">

                        <div className="bg-white rounded-lg p-2.5 mb-2 h-[100px] space-y-2 flex flex-col justify-center">
                          <div className="h-2.5 bg-gradient-to-r from-pink-300 to-purple-300 rounded"></div>
                          <div className="h-2.5 bg-gradient-to-r from-blue-300 to-cyan-300 rounded"></div>
                          <div className="h-2.5 bg-gradient-to-r from-green-300 to-emerald-300 rounded"></div>
                          <div className="h-2.5 bg-gradient-to-r from-orange-300 to-yellow-300 rounded"></div>
                        </div>
                        <p className="text-xs font-semibold text-gray-700">Beautiful Themes</p>
                      </div>

                      {/* Sharing */}
                      <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-2xl p-4 border border-orange-100 shadow-md">

                        <div className="bg-white rounded-lg p-2.5 mb-2 h-[100px] flex flex-col items-center justify-center">
                          <div className="text-4xl mb-1">📤</div>
                          <div className="flex items-center gap-1 justify-center mt-1">
                            <div className="w-1.5 h-1.5 bg-orange-400 rounded-full"></div>
                            <div className="w-1.5 h-1.5 bg-orange-400 rounded-full"></div>
                            <div className="w-1.5 h-1.5 bg-orange-400 rounded-full"></div>
                          </div>
                          <p className="text-[10px] text-gray-500 mt-1">Share Easy</p>
                        </div>
                        <p className="text-xs font-semibold text-gray-700">Easy Sharing</p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-100">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className="flex items-center gap-2 px-5 py-2.5 text-gray-700 hover:text-gray-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>

            {currentStep < steps.length ? (
              <button
                onClick={nextStep}
                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-br from-[#6366F1] to-[#2D1B69] text-white rounded-full hover:shadow-lg transition-all font-medium"
              >
                Next
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={completeOnboarding}
                disabled={saving}
                className="px-6 py-2.5 bg-gradient-to-br from-[#6366F1] to-[#2D1B69] text-white rounded-full hover:shadow-lg transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
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