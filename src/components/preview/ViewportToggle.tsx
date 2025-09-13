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
    width: '100%',
    maxWidth: '1200px',
    icon: Monitor,
   
    scale: 1
  },
  tablet: {
    width: '768px',
    maxWidth: '768px',
    icon: Tablet,
   
    scale: 0.8
  },
  mobile: {
    width: '375px',
    maxWidth: '375px',
    icon: Smartphone,
    
    scale: 0.6
  }
}

export function ViewportToggle({ currentMode, onModeChange, className = '' }: ViewportToggleProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <div className={`fixed top-4 right-4 z-50 bg-white/95  border border-gray-200 rounded-lg  p-2 ${className}`}>
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
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <IconComponent className="h-4 w-4 mr-1" />
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
      transition: 'all 0.3s ease-in-out'
    } as React.CSSProperties,
    wrapper: {
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: mode === 'desktop' ? 'flex-start' : 'center',
      padding: mode === 'desktop' ? '2rem' : '1rem',
      background: mode === 'desktop' ? 'transparent' : '#f8fafc'
    } as React.CSSProperties
  }
}

export { VIEWPORT_CONFIGS }