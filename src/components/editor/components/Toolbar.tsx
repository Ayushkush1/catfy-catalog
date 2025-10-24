'use client'

import React, { useEffect, useState } from 'react'
import {
  Save,
  Download,
  Upload,
  Undo,
  Redo,
  ZoomIn,
  ZoomOut,
  Maximize,
  RotateCcw,
  Eye,
  EyeOff,
  Monitor,
  Tablet,
  Smartphone,
  Layers,
  FileText,
  Image,
  FileDown,
  Code,
  ArrowLeft,
  Share2,
  ChevronDown,
} from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/components/auth-provider'
import { isClientAdmin } from '@/lib/client-auth'

interface ToolbarProps {
  onSave: () => void
  onExport: (type: 'pdf' | 'png' | 'json' | 'html') => void
  onImport?: () => void
  onUndo: () => void
  onRedo: () => void
  canUndo: boolean
  canRedo: boolean
  zoom: number
  onZoomIn: () => void
  onZoomOut: () => void
  onFitToScreen: () => void
  onResetZoom: () => void
  deviceMode: 'desktop' | 'tablet' | 'mobile'
  onDeviceModeChange: (mode: 'desktop' | 'tablet' | 'mobile') => void
  previewMode: boolean
  onPreviewModeToggle: () => void
  onShowLeftSidebar: () => void
  showLeftSidebar: boolean
  onShowLayers: () => void
  showLayers: boolean
  onShowInspector: () => void
  showInspector: boolean
  onTogglePagesTab?: () => void
  showPagesTab?: boolean
  backButton?: {
    href: string
    catalogueName: string
  }
}

export const Toolbar: React.FC<ToolbarProps> = ({
  onSave,
  onExport,
  onImport,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  zoom,
  onZoomIn,
  onZoomOut,
  onFitToScreen,
  onResetZoom,
  deviceMode,
  onDeviceModeChange,
  previewMode,
  onPreviewModeToggle,
  onShowLeftSidebar,
  showLeftSidebar,
  onShowLayers,
  showLayers,
  onShowInspector,
  showInspector,
  onTogglePagesTab,
  showPagesTab = true,
  backButton,
}) => {
  const [showExportMenu, setShowExportMenu] = React.useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const { user } = useAuth()

  // Check if current user is admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (user) {
        const adminStatus = await isClientAdmin()
        setIsAdmin(adminStatus)
      } else {
        setIsAdmin(false)
      }
    }

    checkAdminStatus()
  }, [user])

  const exportOptions = [
    {
      type: 'pdf' as const,
      label: 'Export as PDF',
      icon: <FileText className="h-4 w-4" />,
    },
    {
      type: 'png' as const,
      label: 'Export as PNG',
      icon: <Image className="h-4 w-4" />,
    },
    {
      type: 'json' as const,
      label: 'Export as JSON',
      icon: <FileDown className="h-4 w-4" />,
    },
    {
      type: 'html' as const,
      label: 'Export as HTML',
      icon: <Code className="h-4 w-4" />,
    },
  ]

  const deviceModes = [
    {
      mode: 'desktop' as const,
      label: 'Desktop',
      icon: <Monitor className="h-4 w-4" />,
    },
    {
      mode: 'tablet' as const,
      label: 'Tablet',
      icon: <Tablet className="h-4 w-4" />,
    },
    {
      mode: 'mobile' as const,
      label: 'Mobile',
      icon: <Smartphone className="h-4 w-4" />,
    },
  ]

  return (
    <div className="flex h-12 items-center justify-between border-b border-gray-200 bg-white/95 px-4 shadow-sm backdrop-blur sm:px-6">
      {/* Left Section - File Actions */}
      <div className="flex items-center gap-2">
        {/* Back */}
        <button
          onClick={() => typeof window !== 'undefined' && window.history.back()}
          className="flex items-center rounded-md px-2.5 py-1.5 text-sm text-gray-700 transition-colors hover:bg-gray-100 hover:text-gray-900"
          title="Back"
          aria-label="Back"
        >
          <ArrowLeft className="mr-1.5 h-4 w-4" />
          <span className="hidden sm:inline">Back</span>
        </button>

        {/* Back to Templates Button - Only visible for admin users */}
        {isAdmin && (
          <Link
            href="/themes"
            className="flex items-center rounded-md px-2.5 py-1.5 text-sm text-gray-700 transition-colors hover:bg-gray-100 hover:text-gray-900"
            title="Back to Templates"
            aria-label="Back to Templates"
          >
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            <span className="hidden md:inline">Back to Templates</span>
          </Link>
        )}

        {backButton && (
          <>
            <div className="mx-2 h-6 w-px bg-gray-300"></div>
            <Link
              href={backButton.href}
              className="flex items-center rounded-md p-1.5 text-gray-700 transition-colors hover:bg-gray-100 hover:text-gray-900"
              title="Back to Edit"
              aria-label="Back to Edit"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <span className="ml-1 text-sm font-medium text-gray-900">
              {backButton.catalogueName}
            </span>
          </>
        )}

        {/* Editing status */}
        {!previewMode && (
          <span className="ml-2 rounded-md bg-gradient-to-r from-[#2D1B69]/10 to-[#6366F1]/10 px-2 py-1 text-xs font-medium text-[#2D1B69]">
            Editing
          </span>
        )}

        {/* Resize (stub) */}
        <div className="relative ml-2">
          <button
            className="flex items-center rounded-md bg-gray-100 px-2.5 py-1.5 text-sm text-gray-700 transition-colors hover:bg-gray-200"
            title="Resize"
            aria-label="Resize"
          >
            <span className="hidden sm:inline">Resize</span>
            <ChevronDown className="ml-1 h-4 w-4" />
          </button>
        </div>
        {/* Keep export/import to center/right for cleaner left group */}
      </div>

      {/* Center Section - History & Zoom */}
      <div className="flex items-center gap-2">
        {/* History Controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className="rounded-md p-1.5 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-50"
            title="Undo"
            aria-label="Undo"
          >
            <Undo className="h-4 w-4" />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className="rounded-md p-1.5 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-50"
            title="Redo"
            aria-label="Redo"
          >
            <Redo className="h-4 w-4" />
          </button>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-1 border-l border-gray-200 pl-2">
          <button
            onClick={onZoomOut}
            className="rounded-md p-1.5 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
            title="Zoom Out"
            aria-label="Zoom Out"
          >
            <ZoomOut className="h-4 w-4" />
          </button>

          <div className="min-w-[50px] rounded-md bg-gray-100 px-2 py-0.5 text-center text-xs font-medium text-gray-700">
            {Math.round(zoom * 100)}%
          </div>

          <button
            onClick={onZoomIn}
            className="rounded-md p-1.5 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
            title="Zoom In"
            aria-label="Zoom In"
          >
            <ZoomIn className="h-4 w-4" />
          </button>

          <button
            onClick={onFitToScreen}
            className="rounded-md p-1.5 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
            title="Fit to Screen"
            aria-label="Fit to Screen"
          >
            <Maximize className="h-4 w-4" />
          </button>

          <button
            onClick={onResetZoom}
            className="rounded-md p-1.5 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
            title="Reset Zoom"
            aria-label="Reset Zoom"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>

        {/* Export / Import moved next to center group for quick access */}
        <div className="relative border-l border-gray-200 pl-2">
          <button
            onClick={() => setShowExportMenu(!showExportMenu)}
            className="flex items-center rounded-md bg-gray-100 px-2.5 py-1.5 text-sm text-gray-700 transition-colors hover:bg-gray-200"
            aria-haspopup="menu"
            aria-expanded={showExportMenu}
          >
            <Download className="mr-1.5 h-4 w-4" />
            <span className="hidden sm:inline">Export</span>
          </button>

          {showExportMenu && (
            <div className="absolute left-0 top-full z-50 mt-1 w-52 rounded-md border border-gray-200 bg-white shadow-lg">
              {exportOptions.map(option => (
                <button
                  key={option.type}
                  onClick={() => {
                    onExport(option.type)
                    setShowExportMenu(false)
                  }}
                  className="flex w-full items-center px-3 py-2 text-left text-sm text-gray-700 first:rounded-t-md last:rounded-b-md hover:bg-gray-50"
                >
                  {option.icon}
                  <span className="ml-2">{option.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={onImport}
          disabled={!onImport}
          className="flex items-center rounded-md bg-gray-100 px-2.5 py-1.5 text-sm text-gray-700 transition-colors hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Upload className="mr-1.5 h-4 w-4" />
          <span className="hidden sm:inline">Import</span>
        </button>
      </div>

      {/* Right Section - View Controls */}
      <div className="flex items-center gap-2">
        {/* Device Mode Switcher */}
        <div className="hidden items-center rounded-md bg-gray-100 p-0.5 lg:flex">
          {deviceModes.map(device => (
            <button
              key={device.mode}
              onClick={() => onDeviceModeChange(device.mode)}
              className={`rounded-md p-1.5 transition-colors ${
                deviceMode === device.mode
                  ? 'bg-white text-[#2D1B69] shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              title={device.label}
              aria-label={device.label}
            >
              {device.icon}
            </button>
          ))}
        </div>

        {/* Preview Mode Toggle */}
        <button
          onClick={onPreviewModeToggle}
          className={`flex items-center rounded-md px-2 py-1 text-sm transition-colors ${
            previewMode
              ? 'bg-green-100 text-green-700 hover:bg-green-200'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
          aria-label={previewMode ? 'Exit preview' : 'Enter preview'}
        >
          {previewMode ? (
            <EyeOff className="mr-1.5 h-4 w-4" />
          ) : (
            <Eye className="mr-1.5 h-4 w-4" />
          )}
          <span className="hidden sm:inline">
            {previewMode ? 'Edit' : 'Preview'}
          </span>
        </button>

        {/* Save & Share moved to right group for consistency with design */}
        <button
          onClick={onSave}
          className="flex items-center rounded-md bg-gradient-to-r from-[#2D1B69] to-[#6366F1] px-3 py-1.5 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:from-[#1E1338] hover:to-[#4F46E5]"
          aria-label="Save"
        >
          <Save className="mr-1.5 h-4 w-4" />
          <span className="hidden sm:inline">Save</span>
        </button>

        <button
          onClick={() => {
            /* placeholder share action */
          }}
          className="flex items-center rounded-md bg-purple-600 px-3 py-1.5 text-sm text-white shadow-sm transition-colors hover:bg-purple-700"
          aria-label="Share"
        >
          <Share2 className="mr-1.5 h-4 w-4" />
          <span className="hidden sm:inline">Share</span>
        </button>

        {/* Left Sidebar Toggle (Pages/Components) */}
        <button
          onClick={onShowLeftSidebar}
          className={`flex items-center rounded-md px-2 py-1 text-sm transition-colors ${
            showLeftSidebar
              ? 'bg-gradient-to-r from-[#2D1B69]/10 to-[#6366F1]/10 text-[#2D1B69] hover:from-[#2D1B69]/20 hover:to-[#6366F1]/20'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
          aria-label="Toggle Pages"
        >
          <FileText className="mr-1.5 h-4 w-4" />
          <span className="hidden sm:inline">Pages</span>
        </button>

        {/* Layers Toggle */}
        <button
          onClick={onShowLayers}
          className={`flex items-center rounded-md px-2 py-1 text-sm transition-colors ${
            showLayers
              ? 'bg-gradient-to-r from-[#2D1B69]/10 to-[#6366F1]/10 text-[#2D1B69] hover:from-[#2D1B69]/20 hover:to-[#6366F1]/20'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
          aria-label="Toggle Layers"
        >
          <Layers className="mr-1.5 h-4 w-4" />
          <span className="hidden sm:inline">Layers</span>
        </button>

        {/* Inspector Toggle */}
        <button
          onClick={onShowInspector}
          className={`flex items-center rounded-md px-2 py-1 text-sm transition-colors ${
            showInspector
              ? 'bg-gradient-to-r from-[#2D1B69]/10 to-[#6366F1]/10 text-[#2D1B69] hover:from-[#2D1B69]/20 hover:to-[#6366F1]/20'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
          aria-label="Toggle Style Inspector"
        >
          <Code className="mr-1.5 h-4 w-4" />
          <span className="hidden sm:inline">Style</span>
        </button>
      </div>
    </div>
  )
}
