'use client'

import React from 'react'
import { useEditor } from '@craftjs/core'
import {
  ChevronRight,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Layers,
  FileText,
} from 'lucide-react'

interface StatusBarProps {
  currentPageName: string
  totalPages: number
  currentPageIndex: number
  zoomLevel: number
  deviceMode: 'desktop' | 'tablet' | 'mobile'
  isPreviewMode: boolean
  onPreviewToggle: () => void
  onLayersToggle: () => void
  showLayers: boolean
  onPagesToggle: () => void
  showPagesTab: boolean
  className?: string
}

export const StatusBar: React.FC<StatusBarProps> = ({
  currentPageName,
  totalPages,
  currentPageIndex,
  zoomLevel,
  deviceMode,
  isPreviewMode,
  onPreviewToggle,
  onLayersToggle,
  showLayers,
  onPagesToggle,
  showPagesTab,
  className = '',
}) => {
  const { selected, actions, query } = useEditor(state => ({
    selected: state.events.selected,
  }))

  // Generate breadcrumb path
  const getBreadcrumbPath = () => {
    if (!selected || selected.size === 0) {
      return [{ id: 'canvas', name: 'Canvas', type: 'canvas' }]
    }

    const selectedNodeId = Array.from(selected)[0]
    const path = []
    let currentNodeId: string | null = selectedNodeId

    while (currentNodeId) {
      const node = query.node(currentNodeId).get()
      if (node) {
        const displayName =
          node.data.custom?.displayName ||
          node.data.displayName ||
          node.data.name ||
          'Element'

        path.unshift({
          id: currentNodeId,
          name: displayName,
          type: node.data.displayName || 'Element',
          isLocked: node.data.custom?.locked || false,
        })

        currentNodeId = node.data.parent || null
      } else {
        break
      }
    }

    // Add canvas as root if not already present
    if (path.length === 0 || path[0].type !== 'canvas') {
      path.unshift({ id: 'canvas', name: 'Canvas', type: 'canvas' })
    }

    return path
  }

  const breadcrumbPath = getBreadcrumbPath()

  const handleBreadcrumbClick = (nodeId: string) => {
    if (nodeId !== 'canvas') {
      actions.selectNode(nodeId)
    } else {
      actions.clearEvents()
    }
  }

  const getDeviceIcon = () => {
    switch (deviceMode) {
      case 'desktop':
        return '🖥️'
      case 'tablet':
        return '📱'
      case 'mobile':
        return '📱'
      default:
        return '🖥️'
    }
  }

  const formatZoom = (zoom: number) => {
    return `${Math.round(zoom * 100)}%`
  }

  return (
    <div
      className={`py- flex items-center justify-between border-t border-gray-200 bg-white px-4 text-sm ${className}`}
    >
      {/* Left Section - Pages Toggle & Breadcrumb */}
      <div className="flex min-w-0 flex-1 items-center space-x-2">
        {/* Pages Toggle Button */}
        <button
          onClick={onPagesToggle}
          className={`
            flex items-center space-x-1 rounded px-2 py-1 transition-colors
            ${
              showPagesTab
                ? 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                : 'text-gray-600 hover:bg-gray-100'
            }
          `}
          title={showPagesTab ? 'Hide Pages' : 'Show Pages'}
        >
          <FileText size={12} />
          <span className="text-xs">Pages</span>
        </button>

        <span className="text-gray-400">•</span>
        <span className="font-medium text-gray-500">Path:</span>
        <nav className="flex min-w-0 items-center space-x-1">
          {breadcrumbPath.map((item, index) => (
            <React.Fragment key={item.id}>
              {index > 0 && (
                <ChevronRight
                  size={14}
                  className="flex-shrink-0 text-gray-400"
                />
              )}
              <button
                onClick={() => handleBreadcrumbClick(item.id)}
                className={`
                  flex items-center space-x-1 rounded px-2 py-1 transition-colors hover:bg-gray-100
                  ${
                    index === breadcrumbPath.length - 1
                      ? 'font-medium text-blue-600'
                      : 'text-gray-600 hover:text-gray-800'
                  }
                  max-w-32 truncate
                `}
                title={item.name}
              >
                <span className="truncate">{item.name}</span>
                {item.isLocked && (
                  <Lock size={12} className="flex-shrink-0 text-gray-400" />
                )}
              </button>
            </React.Fragment>
          ))}
        </nav>
      </div>

      {/* Center Section - Page Info */}
      <div className="flex items-center space-x-4 text-gray-600">
        <span>
          Page {currentPageIndex + 1} of {totalPages}
        </span>
        <span className="text-gray-400">•</span>
        <span className="font-medium">{currentPageName}</span>
      </div>

      {/* Right Section - Status Info */}
      <div className="flex items-center space-x-4 text-gray-600">
        {/* Device Mode */}
        <div className="flex items-center space-x-1">
          <span>{getDeviceIcon()}</span>
          <span className="capitalize">{deviceMode}</span>
        </div>
      </div>
    </div>
  )
}
