'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Check, Crown, X } from 'lucide-react'
import { SubscriptionPlan } from '@prisma/client'
import { PLAN_FEATURES, formatPrice } from '@/lib/subscription'
import { useRouter } from 'next/navigation'

interface UpgradePromptProps {
  isOpen: boolean
  onClose: () => void
  currentPlan: SubscriptionPlan
  feature: string
  title?: string
  description?: string
}

export function UpgradePrompt({
  isOpen,
  onClose,
  currentPlan,
  feature,
  title,
  description,
}: UpgradePromptProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  // Determine the next plan to upgrade to
  const getNextPlan = (current: SubscriptionPlan): SubscriptionPlan => {
    switch (current) {
      case SubscriptionPlan.FREE:
        return SubscriptionPlan.STANDARD
      case SubscriptionPlan.STANDARD:
        return SubscriptionPlan.PROFESSIONAL
      case SubscriptionPlan.PROFESSIONAL:
        return SubscriptionPlan.BUSINESS
      default:
        return SubscriptionPlan.BUSINESS
    }
  }

  const nextPlan = getNextPlan(currentPlan)
  const nextPlanFeatures = PLAN_FEATURES[nextPlan]
  const currentPlanFeatures = PLAN_FEATURES[currentPlan]

  const handleUpgrade = async () => {
    setIsLoading(true)
    try {
      // Redirect to pricing page or initiate upgrade flow
      router.push('/pricing')
    } catch (error) {
      console.error('Error initiating upgrade:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getComparisonFeatures = () => {
    const features = [
      {
        name: 'Catalogues',
        current:
          currentPlanFeatures.maxCatalogues === -1
            ? 'Unlimited'
            : currentPlanFeatures.maxCatalogues,
        next:
          nextPlanFeatures.maxCatalogues === -1
            ? 'Unlimited'
            : nextPlanFeatures.maxCatalogues,
      },
      {
        name: 'Categories per catalogue',
        current:
          currentPlanFeatures.maxCategories === -1
            ? 'Unlimited'
            : currentPlanFeatures.maxCategories,
        next:
          nextPlanFeatures.maxCategories === -1
            ? 'Unlimited'
            : nextPlanFeatures.maxCategories,
      },
      {
        name: 'Products per catalogue',
        current:
          currentPlanFeatures.maxProductsPerCatalogue === -1
            ? 'Unlimited'
            : currentPlanFeatures.maxProductsPerCatalogue,
        next:
          nextPlanFeatures.maxProductsPerCatalogue === -1
            ? 'Unlimited'
            : nextPlanFeatures.maxProductsPerCatalogue,
      },
      {
        name: 'Monthly exports',
        current:
          currentPlanFeatures.maxExportsPerMonth === -1
            ? 'Unlimited'
            : currentPlanFeatures.maxExportsPerMonth,
        next:
          nextPlanFeatures.maxExportsPerMonth === -1
            ? 'Unlimited'
            : nextPlanFeatures.maxExportsPerMonth,
      },
      {
        name: 'Storage',
        current:
          currentPlanFeatures.maxStorageGB === -1
            ? 'Unlimited'
            : `${currentPlanFeatures.maxStorageGB}GB`,
        next:
          nextPlanFeatures.maxStorageGB === -1
            ? 'Unlimited'
            : `${nextPlanFeatures.maxStorageGB}GB`,
      },
    ]

    return features
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="overflow-hidden border-0 bg-gradient-to-br from-slate-50 via-white to-blue-50/30 p-0 sm:max-w-[500px]">
        <div className="absolute right-0 top-0 -z-10 h-64 w-64 rounded-full bg-gradient-to-br from-blue-500/10 to-purple-500/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 -z-10 h-48 w-48 rounded-full bg-gradient-to-tr from-yellow-500/10 to-orange-500/10 blur-3xl" />

        <DialogHeader className="space-y-2 p-5 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="rounded-lg bg-gradient-to-br from-yellow-400 to-yellow-600 p-1.5 shadow-lg shadow-yellow-500/30">
              <Crown className="h-4 w-4 text-white" />
            </div>
            <DialogTitle className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-lg font-semibold text-transparent">
              {title || `Upgrade to ${nextPlanFeatures.name}`}
            </DialogTitle>
          </div>
          <DialogDescription className="text-sm leading-relaxed text-gray-600">
            {description ||
              `You've reached the limit for ${feature}. Upgrade to ${nextPlanFeatures.name} to continue.`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 px-5">
          {/* Current vs Next Plan Comparison */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="space-y-2">
              <div className="rounded-xl border border-gray-200/60 bg-white/60 p-3 text-center shadow-sm">
                <h3 className="text-sm font-semibold text-gray-900">
                  {currentPlanFeatures.name}
                </h3>
                <p className="mt-0.5 text-xs font-medium text-gray-500">
                  Current Plan
                </p>
                <div className="mt-2">
                  <span className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-xl font-bold text-transparent">
                    {formatPrice(currentPlanFeatures.monthlyPrice)}
                  </span>
                  <span className="text-xs text-gray-500">/mo</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-[#6366F1] to-[#2D1B69] p-3 text-center shadow-lg shadow-purple-500/25">
                <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent" />
                <div className="relative">
                  <div className="flex items-center justify-center space-x-1.5">
                    <h3 className="text-sm font-semibold text-white">
                      {nextPlanFeatures.name}
                    </h3>
                  </div>
                  <Badge className="mt-0.5 border-0 bg-white/20 px-1.5 py-0 text-xs text-white hover:bg-white/30">
                    Recommended
                  </Badge>
                  <div className="mt-2">
                    <span className="text-xl font-bold text-white">
                      {formatPrice(nextPlanFeatures.monthlyPrice)}
                    </span>
                    <span className="text-xs text-white">/mo</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Feature Comparison */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-gray-900">
              What you&apos;ll get:
            </h4>
            <div className="space-y-1.5 rounded-xl border border-gray-200/60 bg-white/60 p-3">
              {getComparisonFeatures().map((feature, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-1.5 text-xs"
                >
                  <span className="font-medium text-gray-700">
                    {feature.name}
                  </span>
                  <div className="flex items-center space-x-1.5">
                    <span className="rounded-md bg-gray-100 px-1.5 py-0.5 text-xs text-gray-500">
                      {feature.current}
                    </span>
                    <svg
                      className="h-2.5 w-2.5 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                    <span className="rounded-md bg-blue-50 px-1.5 py-0.5 text-xs font-semibold text-blue-600">
                      {feature.next}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="mt-4 border-t border-gray-200/60 bg-gradient-to-r from-gray-50/80 to-slate-50/80 px-5 py-3">
          <div className="flex w-full space-x-2.5">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="h-9 flex-1 rounded-xl border-gray-300 bg-white text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
            >
              Maybe Later
            </Button>
            <Button
              onClick={handleUpgrade}
              disabled={isLoading}
              className="h-9 flex-1 rounded-xl bg-gradient-to-r  from-[#6366F1] to-[#2D1B69] text-sm font-semibold text-white shadow-lg shadow-purple-500/30 transition-all duration-200"
            >
              {isLoading ? 'Loading...' : `Upgrade Now`}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Hook for managing upgrade prompts
export function useUpgradePrompt() {
  const [isOpen, setIsOpen] = useState(false)
  const [promptData, setPromptData] = useState<{
    feature: string
    title?: string
    description?: string
  }>({ feature: '' })

  const showUpgradePrompt = (
    feature: string,
    title?: string,
    description?: string
  ) => {
    setPromptData({ feature, title, description })
    setIsOpen(true)
  }

  const hideUpgradePrompt = () => {
    setIsOpen(false)
  }

  return {
    isOpen,
    promptData,
    showUpgradePrompt,
    hideUpgradePrompt,
  }
}
