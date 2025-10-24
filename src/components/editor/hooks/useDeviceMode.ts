'use client'

import { useState, useCallback, useEffect } from 'react'

export type DeviceMode = 'desktop' | 'tablet' | 'mobile'

export interface DeviceConfig {
  name: string
  width: number
  height: number
  icon: string
  breakpoint: string
}

export interface UseDeviceModeOptions {
  initialMode?: DeviceMode
  onModeChange?: (mode: DeviceMode) => void
  customDevices?: Record<string, DeviceConfig>
}

// A4 dimensions in pixels (210mm x 297mm at 96 DPI)
const A4_WIDTH_PX = 794 // 210mm * 96 DPI / 25.4
const A4_HEIGHT_PX = 1123 // 297mm * 96 DPI / 25.4

const DEFAULT_DEVICES: Record<DeviceMode, DeviceConfig> = {
  desktop: {
    name: 'Desktop',
    width: A4_WIDTH_PX,
    height: A4_HEIGHT_PX,
    icon: '🖥️',
    breakpoint: 'lg',
  },
  tablet: {
    name: 'Tablet',
    width: A4_WIDTH_PX,
    height: A4_HEIGHT_PX,
    icon: '📱',
    breakpoint: 'md',
  },
  mobile: {
    name: 'Mobile',
    width: A4_WIDTH_PX,
    height: A4_HEIGHT_PX,
    icon: '📱',
    breakpoint: 'sm',
  },
}

export const useDeviceMode = (options: UseDeviceModeOptions = {}) => {
  const { initialMode = 'desktop', onModeChange, customDevices = {} } = options

  const [currentMode, setCurrentMode] = useState<DeviceMode>(initialMode)
  const [isTransitioning, setIsTransitioning] = useState(false)

  // Merge default devices with custom devices
  const devices = { ...DEFAULT_DEVICES, ...customDevices }

  // Get current device config
  const currentDevice = devices[currentMode]

  // Switch device mode
  const switchMode = useCallback(
    async (mode: DeviceMode) => {
      if (mode === currentMode || isTransitioning) return

      setIsTransitioning(true)

      // Add a small delay for smooth transition
      await new Promise(resolve => setTimeout(resolve, 150))

      setCurrentMode(mode)
      onModeChange?.(mode)

      setIsTransitioning(false)
    },
    [currentMode, isTransitioning, onModeChange]
  )

  // Cycle through device modes
  const cycleMode = useCallback(() => {
    const modes: DeviceMode[] = ['desktop', 'tablet', 'mobile']
    const currentIndex = modes.indexOf(currentMode)
    const nextIndex = (currentIndex + 1) % modes.length
    switchMode(modes[nextIndex])
  }, [currentMode, switchMode])

  // Get canvas dimensions for current device
  const getCanvasDimensions = useCallback(() => {
    const device = devices[currentMode]
    return {
      width: device.width,
      height: device.height,
      maxWidth: currentMode === 'desktop' ? '100%' : `${device.width}px`,
      aspectRatio: device.width / device.height,
    }
  }, [currentMode, devices])

  // Get responsive classes for current mode
  const getResponsiveClasses = useCallback(() => {
    const device = devices[currentMode]
    const baseClasses = 'transition-all duration-300 ease-in-out'

    switch (currentMode) {
      case 'mobile':
        return `${baseClasses} max-w-sm mx-auto`
      case 'tablet':
        return `${baseClasses} max-w-md mx-auto`
      case 'desktop':
      default:
        return `${baseClasses} w-full`
    }
  }, [currentMode, devices])

  // Get container style for current device
  const getContainerStyle = useCallback(() => {
    const dimensions = getCanvasDimensions()

    return {
      width: currentMode === 'desktop' ? '100%' : `${dimensions.width}px`,
      maxWidth: dimensions.maxWidth,
      minHeight: currentMode === 'desktop' ? 'auto' : `${dimensions.height}px`,
      margin: currentMode === 'desktop' ? '0' : '0 auto',
      transition: 'all 0.3s ease-in-out',
      border: currentMode !== 'desktop' ? '1px solid #e5e7eb' : 'none',
      borderRadius: currentMode !== 'desktop' ? '8px' : '0',
      boxShadow:
        currentMode !== 'desktop'
          ? '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          : 'none',
    }
  }, [currentMode, getCanvasDimensions])

  // Check if current mode matches a breakpoint
  const matchesBreakpoint = useCallback(
    (breakpoint: string) => {
      const device = devices[currentMode]
      return device.breakpoint === breakpoint
    },
    [currentMode, devices]
  )

  // Get all available modes
  const availableModes = Object.keys(devices) as DeviceMode[]

  // Keyboard shortcuts
  const handleKeyboardShortcuts = useCallback(
    (event: KeyboardEvent) => {
      if (event.altKey) {
        switch (event.key) {
          case '1':
            event.preventDefault()
            switchMode('desktop')
            break
          case '2':
            event.preventDefault()
            switchMode('tablet')
            break
          case '3':
            event.preventDefault()
            switchMode('mobile')
            break
          case 'd':
            event.preventDefault()
            cycleMode()
            break
        }
      }
    },
    [switchMode, cycleMode]
  )

  // Setup keyboard shortcuts
  useEffect(() => {
    document.addEventListener('keydown', handleKeyboardShortcuts)
    return () => {
      document.removeEventListener('keydown', handleKeyboardShortcuts)
    }
  }, [handleKeyboardShortcuts])

  // Auto-detect device mode based on window size
  const autoDetectMode = useCallback(() => {
    if (typeof window === 'undefined') return

    const width = window.innerWidth

    if (width >= 1024) {
      switchMode('desktop')
    } else if (width >= 768) {
      switchMode('tablet')
    } else {
      switchMode('mobile')
    }
  }, [switchMode])

  // Get device-specific CSS media query
  const getMediaQuery = useCallback(
    (mode: DeviceMode) => {
      const device = devices[mode]

      switch (mode) {
        case 'mobile':
          return `(max-width: ${device.width}px)`
        case 'tablet':
          return `(min-width: ${device.width + 1}px) and (max-width: 1023px)`
        case 'desktop':
        default:
          return `(min-width: 1024px)`
      }
    },
    [devices]
  )

  // Check if device supports touch
  const isTouchDevice = currentMode === 'mobile' || currentMode === 'tablet'

  // Get orientation for mobile/tablet
  const getOrientation = useCallback(() => {
    const device = devices[currentMode]
    return device.width > device.height ? 'landscape' : 'portrait'
  }, [currentMode, devices])

  // Rotate device (for mobile/tablet)
  const rotateDevice = useCallback(() => {
    if (currentMode === 'desktop') return

    const device = devices[currentMode]
    const rotatedDevice = {
      ...device,
      width: device.height,
      height: device.width,
    }

    // Update the device config temporarily
    devices[currentMode] = rotatedDevice

    // Trigger a re-render by switching mode
    setCurrentMode(prev => prev)
  }, [currentMode, devices])

  return {
    // State
    currentMode,
    currentDevice,
    isTransitioning,
    availableModes,
    isTouchDevice,

    // Actions
    switchMode,
    cycleMode,
    autoDetectMode,
    rotateDevice,

    // Utilities
    getCanvasDimensions,
    getResponsiveClasses,
    getContainerStyle,
    getMediaQuery,
    getOrientation,
    matchesBreakpoint,

    // Device configs
    devices,
  }
}
