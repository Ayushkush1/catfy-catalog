'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ArrowRight, ArrowLeft, Check, FileText, Palette } from 'lucide-react'
import { TemplateSelector } from './template-selector'
import { ThemeSelector } from './theme-selector'
import { TemplateConfig } from '@/lib/template-registry'
import { ThemeConfig } from '@/lib/theme-registry'
import { getTemplateById } from '@/templates'
import { getThemeById } from '@/lib/theme-registry'
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
  onSelectionComplete?: (templateId: string, themeId: string) => void
  initialTemplateId?: string
  initialThemeId?: string
  showPreview?: boolean
  className?: string
}

type WorkflowStep = 'template' | 'theme' | 'complete'

export function TemplateThemeWorkflow({
  userProfile,
  onSelectionComplete,
  initialTemplateId,
  initialThemeId,
  showPreview = true,
  className
}: TemplateThemeWorkflowProps) {
  const [currentStep, setCurrentStep] = useState<WorkflowStep>('template')
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | undefined>(initialTemplateId)
  const [selectedThemeId, setSelectedThemeId] = useState<string | undefined>(initialThemeId)
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateConfig | null>(null)
  const [selectedTheme, setSelectedTheme] = useState<ThemeConfig | null>(null)

  useEffect(() => {
    if (selectedTemplateId) {
      const template = getTemplateById(selectedTemplateId)
      setSelectedTemplate(template || null)
      
      // Auto-advance to theme selection if template is selected
      if (currentStep === 'template') {
        setCurrentStep('theme')
      }
    }
  }, [selectedTemplateId, currentStep])

  useEffect(() => {
    if (selectedThemeId) {
      const theme = getThemeById(selectedThemeId)
      setSelectedTheme(theme || null)
      
      // Auto-advance to complete if both are selected
      if (selectedTemplateId && currentStep === 'theme') {
        setCurrentStep('complete')
      }
    }
  }, [selectedThemeId, selectedTemplateId, currentStep])

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplateId(templateId)
    // Reset theme selection when template changes
    if (selectedTemplateId !== templateId) {
      setSelectedThemeId(undefined)
      setSelectedTheme(null)
    }
  }

  const handleThemeSelect = (themeId: string) => {
    setSelectedThemeId(themeId)
  }

  const handleComplete = () => {
    if (selectedTemplateId && selectedThemeId && onSelectionComplete) {
      onSelectionComplete(selectedTemplateId, selectedThemeId)
    }
  }

  const handleBackToTemplate = () => {
    setCurrentStep('template')
  }

  const handleBackToTheme = () => {
    setCurrentStep('theme')
  }

  const getStepNumber = (step: WorkflowStep) => {
    switch (step) {
      case 'template': return 1
      case 'theme': return 2
      case 'complete': return 3
      default: return 1
    }
  }

  const isStepCompleted = (step: WorkflowStep) => {
    switch (step) {
      case 'template': return !!selectedTemplateId
      case 'theme': return !!selectedThemeId
      case 'complete': return !!selectedTemplateId && !!selectedThemeId
      default: return false
    }
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Progress Steps */}
      <div className="flex items-center justify-center space-x-4">
        {(['template', 'theme', 'complete'] as WorkflowStep[]).map((step, index) => {
          const stepNumber = getStepNumber(step)
          const isActive = currentStep === step
          const isCompleted = isStepCompleted(step)
          const isAccessible = step === 'template' || (step === 'theme' && selectedTemplateId) || (step === 'complete' && selectedTemplateId && selectedThemeId)
          
          return (
            <React.Fragment key={step}>
              <div className="flex items-center space-x-2">
                <div
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors',
                    isCompleted
                      ? 'bg-green-500 text-white'
                      : isActive
                      ? 'bg-blue-500 text-white'
                      : isAccessible
                      ? 'bg-gray-200 text-gray-600 hover:bg-gray-300 cursor-pointer'
                      : 'bg-gray-100 text-gray-400'
                  )}
                  onClick={() => isAccessible && setCurrentStep(step)}
                >
                  {isCompleted ? <Check className="w-4 h-4" /> : stepNumber}
                </div>
                <span
                  className={cn(
                    'text-sm font-medium capitalize',
                    isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'
                  )}
                >
                  {step === 'complete' ? 'Review' : step}
                </span>
              </div>
              {index < 2 && (
                <ArrowRight className="w-4 h-4 text-gray-400" />
              )}
            </React.Fragment>
          )
        })}
      </div>

      {/* Step Content */}
      <div className="min-h-[600px]">
        {currentStep === 'template' && (
          <div className="space-y-6">
            <div className="text-center">
              <FileText className="w-12 h-12 text-blue-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Choose Your Template
              </h2>
              <p className="text-gray-600">
                Select a template that best fits your catalog needs
              </p>
            </div>
            
            <TemplateSelector
              selectedTemplateId={selectedTemplateId}
              onTemplateSelect={handleTemplateSelect}
              showPreview={showPreview}
            />
          </div>
        )}

        {currentStep === 'theme' && (
          <div className="space-y-6">
            <div className="text-center">
              <Palette className="w-12 h-12 text-blue-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Choose Your Theme
              </h2>
              <p className="text-gray-600">
                Select a theme that matches your brand colors and style
              </p>
              
              {selectedTemplate && (
                <div className="mt-4">
                  <Badge variant="outline" className="text-sm">
                    Template: {selectedTemplate.name}
                  </Badge>
                </div>
              )}
            </div>
            
            <ThemeSelector
              selectedThemeId={selectedThemeId}
              selectedTemplateId={selectedTemplateId}
              onThemeSelect={handleThemeSelect}
              showPreview={showPreview}
            />
            
            <div className="flex justify-center">
              <Button
                variant="outline"
                onClick={handleBackToTemplate}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Templates
              </Button>
            </div>
          </div>
        )}

        {currentStep === 'complete' && (
          <div className="space-y-6">
            <div className="text-center">
              <Check className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Review Your Selection
              </h2>
              <p className="text-gray-600">
                Confirm your template and theme selection
              </p>
            </div>
            
            <div className="max-w-4xl mx-auto">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Template Summary */}
                {selectedTemplate && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        Selected Template
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h3 className="font-semibold text-lg">{selectedTemplate.name}</h3>
                        <p className="text-gray-600 text-sm">{selectedTemplate.description}</p>
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline">{selectedTemplate.category}</Badge>
                        <Badge variant="outline">{selectedTemplate.pageCount} pages</Badge>
                        {selectedTemplate.isPremium && (
                          <Badge variant="secondary">Premium</Badge>
                        )}
                      </div>
                      
                      {selectedTemplate.features && selectedTemplate.features.length > 0 && (
                        <div>
                          <div className="text-sm font-medium text-gray-700 mb-2">Features:</div>
                          <div className="flex flex-wrap gap-1">
                            {selectedTemplate.features.slice(0, 4).map((feature, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {feature}
                              </Badge>
                            ))}
                            {selectedTemplate.features.length > 4 && (
                              <Badge variant="secondary" className="text-xs">
                                +{selectedTemplate.features.length - 4} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
                
                {/* Theme Summary */}
                {selectedTheme && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Palette className="w-5 h-5" />
                        Selected Theme
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h3 className="font-semibold text-lg">{selectedTheme.name}</h3>
                        <p className="text-gray-600 text-sm">{selectedTheme.description}</p>
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline">{selectedTheme.category}</Badge>
                        {selectedTheme.author && (
                          <Badge variant="outline">by {selectedTheme.author}</Badge>
                        )}
                      </div>
                      
                      {/* Color Preview */}
                      <div>
                        <div className="text-sm font-medium text-gray-700 mb-2">Color Palette:</div>
                        <div className="flex gap-2">
                          <div 
                            className="w-8 h-8 rounded border"
                            style={{ backgroundColor: selectedTheme.colors.primary }}
                            title="Primary"
                          />
                          <div 
                            className="w-8 h-8 rounded border"
                            style={{ backgroundColor: selectedTheme.colors.secondary }}
                            title="Secondary"
                          />
                          {selectedTheme.colors.accent && (
                            <div 
                              className="w-8 h-8 rounded border"
                              style={{ backgroundColor: selectedTheme.colors.accent }}
                              title="Accent"
                            />
                          )}
                          <div 
                            className="w-8 h-8 rounded border"
                            style={{ backgroundColor: selectedTheme.colors.background }}
                            title="Background"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex justify-center gap-4">
              <Button
                variant="outline"
                onClick={handleBackToTheme}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Themes
              </Button>
              
              <Button
                onClick={handleComplete}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                disabled={!selectedTemplateId || !selectedThemeId}
              >
                <Check className="w-4 h-4" />
                Confirm Selection
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default TemplateThemeWorkflow