'use client'

import { useState, useEffect } from 'react'
import { X, ArrowRight, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface OnboardingStep {
  step: number
  title: string
  description: string
  highlight?: string
  action: string
}

const steps: OnboardingStep[] = [
  {
    step: 1,
    title: "Welcome to CatFy!",
    description: "Your all-in-one creative tools platform. Let's get you started with a quick tour.",
    action: "Start Tour"
  },
  {
    step: 2,
    title: "Explore Our Tools",
    description: "We offer multiple creative tools. Each tool has its own dashboard and features.",
    highlight: "tool-cards",
    action: "Next"
  },
  {
    step: 3,
    title: "Create Your First Project",
    description: "Click on any tool card to open its dashboard and start creating amazing content!",
    highlight: "first-tool-card",
    action: "Get Started"
  }
]

export function OnboardingGuide() {
  const [isOpen, setIsOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(true)

  useEffect(() => {
    // Check if user has seen onboarding
    const seen = localStorage.getItem('catfy_onboarding_seen')
    if (!seen) {
      setHasSeenOnboarding(false)
      setIsOpen(true)
    }
  }, [])

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleComplete()
    }
  }

  const handleSkip = () => {
    handleComplete()
  }

  const handleComplete = () => {
    localStorage.setItem('catfy_onboarding_seen', 'true')
    setIsOpen(false)
    setHasSeenOnboarding(true)
  }

  if (!isOpen || hasSeenOnboarding) return null

  const step = steps[currentStep]

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" />

      {/* Onboarding Card */}
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md">
        <Card className="relative overflow-hidden rounded-2xl border-0 shadow-2xl">
          {/* Header Gradient */}
          <div className="relative h-32 bg-gradient-to-r from-[#2D1B69] to-[#6366F1] p-6">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.2)_0%,transparent_60%)]" />
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-2 top-2 h-8 w-8 rounded-full p-0 text-white hover:bg-white/20"
              onClick={handleSkip}
            >
              <X className="h-4 w-4" />
            </Button>
            <div className="relative flex items-center gap-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div className="text-white">
                <div className="text-xs opacity-90">Step {step.step} of {steps.length}</div>
                <div className="text-lg font-bold">{step.title}</div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <p className="text-gray-700 mb-6 leading-relaxed">
              {step.description}
            </p>

            {/* Progress Indicators */}
            <div className="flex gap-2 mb-6">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${index <= currentStep
                      ? 'bg-gradient-to-r from-[#2D1B69] to-[#6366F1]'
                      : 'bg-gray-200'
                    }`}
                />
              ))}
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleSkip}
                className="flex-1"
              >
                Skip Tour
              </Button>
              <Button
                onClick={handleNext}
                className="flex-1 bg-gradient-to-r from-[#2D1B69] to-[#6366F1] text-white"
              >
                {step.action}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </>
  )
}

export function RestartOnboardingButton() {
  const handleRestart = () => {
    localStorage.removeItem('catfy_onboarding_seen')
    window.location.reload()
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleRestart}
      className="text-xs"
    >
      <Sparkles className="mr-2 h-3 w-3" />
      Restart Tour
    </Button>
  )
}
