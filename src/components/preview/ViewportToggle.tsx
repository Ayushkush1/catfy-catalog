'use client'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Monitor, Smartphone, Tablet } from 'lucide-react'

export type ViewportMode = 'desktop' | 'tablet' | 'mobile'

interface ViewportToggleProps {
  currentMode: ViewportMode
  onModeChange: (mode: ViewportMode) => void
  className?: string
}

const VIEWPORT_CONFIGS = {
  desktop: {
    width: '210mm', // A4 width
    maxWidth: '210mm',
    icon: Monitor,
    scale: 1,
  },
  tablet: {
    width: '210mm', // Keep A4 width for consistency
    maxWidth: '210mm',
    icon: Tablet,
    scale: 0.8,
  },
  mobile: {
    width: '210mm', // Keep A4 width for consistency
    maxWidth: '210mm',
    icon: Smartphone,
    scale: 0.6,
  },
}

export function ViewportToggle({
  currentMode,
  onModeChange,
  className = '',
}: ViewportToggleProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <div
      className={`fixed right-4 top-4 z-50 rounded-lg  border border-gray-200 bg-white/95  p-2 ${className}`}
    >
      <div className="flex items-center gap-1">
        {Object.entries(VIEWPORT_CONFIGS).map(([mode, config]) => {
          const IconComponent = config.icon
          const isActive = currentMode === mode

          return (
            <Button
              key={mode}
              variant={isActive ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onModeChange(mode as ViewportMode)}
              className={`h-8 px-3 ${
                isActive
                  ? 'bg-[#301F70]'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <IconComponent className="mr-1 h-4 w-4" />
            </Button>
          )
        })}
      </div>
    </div>
  )
}

export function getViewportStyles(mode: ViewportMode) {
  const config = VIEWPORT_CONFIGS[mode]

  return {
    container: {
      width: config.width,
      maxWidth: config.maxWidth,
      transform: `scale(${config.scale})`,
      transformOrigin: 'top center',
      margin: '0 auto',
      transition: 'all 0.3s ease-in-out',
      minHeight: '297mm', // A4 height
      backgroundColor: '#ffffff',
    } as React.CSSProperties,
    wrapper: {
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'flex-start',
      padding: '2rem',
      background: '#f8fafc',
    } as React.CSSProperties,
  }
}

export { VIEWPORT_CONFIGS }
