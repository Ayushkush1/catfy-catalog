'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Header } from '@/components/Header'
import { TemplateThemeWorkflow } from '@/components/ui/template-theme-workflow'
import { Skeleton } from '@/components/ui/skeleton'

interface UserProfile {
  id: string
  fullName: string
  email: string
  subscriptionPlan: 'free' | 'monthly' | 'yearly'
  subscriptionStatus: 'active' | 'inactive' | 'cancelled'
}

export default function ThemesPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/auth/login')
        return
      }

      const response = await fetch('/api/auth/profile')
      if (response.ok) {
        const data = await response.json()
        setProfile(data.profile)
      }
    } catch (error) {
      console.error('Failed to load profile:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelectionComplete = (templateId: string, themeId: string) => {
    // Store selections in localStorage for use in catalogue creation
    localStorage.setItem('selectedTemplate', templateId)
    localStorage.setItem('selectedTheme', themeId)
    router.push('/catalogue/new')
  }

  if (isLoading) {
    return (
      <>
        <Header title="Create Catalog" />
        <div className="min-h-screen bg-gray-50">
          <div className="container mx-auto py-8 px-4">
            <div className="space-y-6">
              <Skeleton className="h-8 w-64" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="h-80" />
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
      <Header title="Create Catalog" />
      <div className="min-h-screen bg-gray-50">
        <TemplateThemeWorkflow 
          userProfile={profile}
          onSelectionComplete={handleSelectionComplete}
        />
      </div>
    </>
  )
}