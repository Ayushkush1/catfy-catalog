'use client'

import { useAuth } from '@/components/auth-provider'
import { isClientAdmin } from '@/lib/client-auth'
import {
  ArrowLeft,
  ChevronDown,
  Download,
  Eye,
  EyeOff,
  FileText,
  Maximize,
  Monitor,
  Redo,
  Save,
  Share2,
  Smartphone,
  Tablet,
  Undo,
  Upload,
  ZoomIn,
  ZoomOut,
} from 'lucide-react'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import { ProfileDropdown } from './ProfileDropdown'

interface CanvaToolbarProps {
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
  backButton?: {
    href: string
    catalogueName: string
  }
  templateName?: string
}

export const CanvaToolbar: React.FC<CanvaToolbarProps> = ({
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
  backButton,
  templateName,
}) => {
  const [showResizeMenu, setShowResizeMenu] = useState(false)
  const [showShareMenu, setShowShareMenu] = useState(false)
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
      label: 'Download as PDF',
      icon: <FileText className="h-4 w-4" />,
    },
    {
      type: 'png' as const,
      label: 'Download as PNG',
      icon: <Download className="h-4 w-4" />,
    },
    {
      type: 'json' as const,
      label: 'Export as JSON',
      icon: <FileText className="h-4 w-4" />,
    },
    {
      type: 'html' as const,
      label: 'Export as HTML',
      icon: <FileText className="h-4 w-4" />,
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
    <div className="flex h-14 items-center justify-between border-b border-gray-200 bg-white px-4">
      {/* Left Section - Back Button and Navigation */}
      <div className="flex items-center space-x-3">
        {/* Back Button */}
        {isAdmin ? (
          <Link
            href="/admin?tab=templates"
            className="flex items-center rounded-md px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gradient-to-r hover:from-[#2D1B69]/10 hover:to-[#6366F1]/10 hover:text-gray-900"
            title="Back to Admin Templates"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Link>
        ) : backButton ? (
          <Link
            href={backButton.href}
            className="flex items-center rounded-md px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gradient-to-r hover:from-[#2D1B69]/10 hover:to-[#6366F1]/10 hover:text-gray-900"
            title="Back"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Link>
        ) : null}

        {/* Resize Menu */}
        <div className="relative">
          <button
            onClick={() => setShowResizeMenu(!showResizeMenu)}
            className="flex items-center rounded-md px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gradient-to-r hover:from-[#2D1B69]/10 hover:to-[#6366F1]/10 hover:text-gray-900"
            aria-expanded={showResizeMenu}
          >
            Resize
            <ChevronDown className="ml-1 h-4 w-4" />
          </button>

          {showResizeMenu && (
            <div className="absolute left-0 top-full z-50 mt-1 w-48 rounded-lg border border-gray-200 bg-white shadow-lg">
              {deviceModes.map(device => (
                <button
                  key={device.mode}
                  onClick={() => {
                    onDeviceModeChange(device.mode)
                    setShowResizeMenu(false)
                  }}
                  className={`flex w-full items-center px-4 py-3 text-left text-sm transition-colors first:rounded-t-lg last:rounded-b-lg ${
                    deviceMode === device.mode
                      ? 'bg-gradient-to-r from-[#2D1B69]/10 to-[#6366F1]/10 text-[#2D1B69]'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {device.icon}
                  <span className="ml-3">{device.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Editing Toggle */}
        <button
          onClick={onPreviewModeToggle}
          className={`flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors ${
            previewMode
              ? 'bg-green-100 text-green-700 hover:bg-green-200'
              : 'bg-gradient-to-r from-[#2D1B69]/10 to-[#6366F1]/10 text-[#2D1B69] hover:from-[#2D1B69]/20 hover:to-[#6366F1]/20'
          }`}
        >
          {previewMode ? (
            <Eye className="mr-2 h-4 w-4" />
          ) : (
            <EyeOff className="mr-2 h-4 w-4" />
          )}
          {previewMode ? 'Present' : 'Editing'}
        </button>
      </div>

      {/* Center Section - History & Zoom */}
      <div className="flex items-center space-x-2">
        {/* History Controls */}
        <div className="flex items-center space-x-1">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className="rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-50"
            title="Undo"
          >
            <Undo className="h-4 w-4" />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className="rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-50"
            title="Redo"
          >
            <Redo className="h-4 w-4" />
          </button>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center space-x-1 border-l border-gray-200 pl-3">
          <button
            onClick={onZoomOut}
            className="rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
            title="Zoom Out"
          >
            <ZoomOut className="h-4 w-4" />
          </button>

          <div className="min-w-[60px] rounded-md bg-gray-100 px-3 py-1 text-center text-sm font-medium text-gray-700">
            {Math.round(zoom * 100)}%
          </div>

          <button
            onClick={onZoomIn}
            className="rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
            title="Zoom In"
          >
            <ZoomIn className="h-4 w-4" />
          </button>

          <button
            onClick={onFitToScreen}
            className="rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
            title="Fit to Screen"
          >
            <Maximize className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Right Section - Template Name, Save, Share and Profile */}
      <div className="flex items-center space-x-3">
        {/* Template Name (for admin) or Catalogue Name (for users) */}
        {templateName && (
          <div className="rounded-lg bg-gray-50 px-3 py-2 text-sm font-medium text-gray-700">
            {templateName}
          </div>
        )}
        {!templateName && backButton?.catalogueName && (
          <div className="rounded-lg bg-gray-50 px-3 py-2 text-sm font-medium text-gray-700">
            {backButton.catalogueName}
          </div>
        )}

        {/* Save Button */}
        <button
          onClick={onSave}
          className="flex items-center rounded-md px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gradient-to-r hover:from-[#2D1B69]/10 hover:to-[#6366F1]/10 hover:text-gray-900"
        >
          <Save className="mr-2 h-4 w-4" />
          Save
        </button>

        {/* Share Menu with Export Options */}
        <div className="relative">
          <button
            onClick={() => setShowShareMenu(!showShareMenu)}
            className="flex items-center rounded-md bg-gradient-to-r from-[#2D1B69] to-[#6366F1] px-4 py-2 text-sm font-medium text-white transition-colors hover:from-[#1E1338] hover:to-[#4F46E5]"
            aria-expanded={showShareMenu}
          >
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </button>

          {showShareMenu && (
            <div className="absolute right-0 top-full z-50 mt-1 w-48 rounded-lg border border-gray-200 bg-white shadow-lg">
              <button
                onClick={() => {
                  onSave()
                  setShowShareMenu(false)
                }}
                className="flex w-full items-center px-4 py-3 text-left text-sm text-gray-700 first:rounded-t-lg hover:bg-gray-50"
              >
                <Save className="mr-3 h-4 w-4" />
                Save & Share
              </button>

              <div className="my-1 border-t border-gray-100"></div>

              {exportOptions.map(option => (
                <button
                  key={option.type}
                  onClick={() => {
                    onExport(option.type)
                    setShowShareMenu(false)
                  }}
                  className="flex w-full items-center px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50"
                >
                  {option.icon}
                  <span className="ml-3">{option.label}</span>
                </button>
              ))}

              {onImport && (
                <>
                  <div className="my-1 border-t border-gray-100"></div>
                  <button
                    onClick={() => {
                      onImport()
                      setShowShareMenu(false)
                    }}
                    className="flex w-full items-center px-4 py-3 text-left text-sm text-gray-700 last:rounded-b-lg hover:bg-gray-50"
                  >
                    <Upload className="mr-3 h-4 w-4" />
                    Import
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Profile */}
        <ProfileDropdown />
      </div>
    </div>
  )
}
