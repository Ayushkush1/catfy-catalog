'use client'

import { useState } from 'react'
import { FileText } from 'lucide-react'
import { UnifiedTemplateSelector } from './unified-template-selector'
import { TemplateSelectionContext } from '@/lib/template-manager'
import { cn } from '@/lib/utils'

interface UserProfile {
  id: string
  fullName: string
  email: string
  subscriptionPlan: 'free' | 'monthly' | 'yearly'
  subscriptionStatus: 'active' | 'inactive' | 'cancelled'
}

interface TemplateThemeWorkflowProps {
  userProfile?: UserProfile | null
  onSelectionComplete: (templateId: string) => void
  initialTemplateId?: string
  showPreview?: boolean
  className?: string
  context?: 'wizard' | 'edit'
  catalogueId?: string
}

export function TemplateThemeWorkflow({
  userProfile,
  onSelectionComplete,
  initialTemplateId,
  showPreview = true,
  className,
  context = 'wizard',
  catalogueId
}: TemplateThemeWorkflowProps) {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | undefined>(initialTemplateId)

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplateId(templateId)
    // Immediately call the completion callback
    if (onSelectionComplete) {
      onSelectionComplete(templateId)
    }
  }

  const selectionContext: TemplateSelectionContext = {
    type: context,
    catalogueId,
    onTemplateSelected: (templateId: string, templateData: string) => {
      console.log(`✅ Template selected in ${context} context:`, templateId)
      handleTemplateSelect(templateId)
    },
    onError: (error: string) => {
      console.error(`❌ Template selection error in ${context} context:`, error)
      // You could add toast notification here
    }
  }

  return (
    <div className={cn('w-full max-w-6xl mx-auto', className)}>
      <div className="space-y-6">
        <div className="text-start">
          <h2 className="text-xl font-bold text-gray-900">
            Choose Your Template
          </h2>
          <p className="text-gray-600 text-sm">
            Select a template that best fits your catalog needs
          </p>
        </div>
        
        <UnifiedTemplateSelector
          context={selectionContext}
          userProfile={userProfile}
          selectedTemplateId={selectedTemplateId}
          onTemplateSelect={handleTemplateSelect}
          showPreview={showPreview}
        />
      </div>
    </div>
  )
}

export default TemplateThemeWorkflow