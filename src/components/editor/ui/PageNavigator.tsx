'use client'

import React, { useState, useEffect } from 'react'
import {
  Plus,
  Copy,
  Trash2,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Eye,
} from 'lucide-react'
import { PagePreview } from './PagePreview'

export interface Page {
  id: string
  name: string
  thumbnail?: string
  data: string // JSON serialized data
  createdAt: Date
  updatedAt: Date
}

interface PageNavigatorProps {
  pages: Page[]
  currentPageId: string
  currentPageData?: string // Current page data for real-time thumbnail updates
  onPageSelect: (pageId: string) => void
  onPageAdd: () => void
  onPageDuplicate: (pageId: string) => void
  onPageDelete: (pageId: string) => void
  onPageRename: (pageId: string, newName: string) => void
  onPageReorder: (fromIndex: number, toIndex: number) => void
  className?: string
}

export const PageNavigator: React.FC<PageNavigatorProps> = ({
  pages,
  currentPageId,
  currentPageData,
  onPageSelect,
  onPageAdd,
  onPageDuplicate,
  onPageDelete,
  onPageRename,
  onPageReorder,
  className = '',
}) => {
  const [isExpanded, setIsExpanded] = useState(true)
  const [editingPageId, setEditingPageId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')
  const [draggedPageId, setDraggedPageId] = useState<string | null>(null)
  const [dropTargetIndex, setDropTargetIndex] = useState<number | null>(null)

  const handlePageRename = (pageId: string, currentName: string) => {
    setEditingPageId(pageId)
    setEditingName(currentName)
  }

  const handleRenameSubmit = () => {
    if (editingPageId && editingName.trim()) {
      onPageRename(editingPageId, editingName.trim())
    }
    setEditingPageId(null)
    setEditingName('')
  }

  const handleRenameCancel = () => {
    setEditingPageId(null)
    setEditingName('')
  }

  const handleDragStart = (e: React.DragEvent, pageId: string) => {
    setDraggedPageId(pageId)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDropTargetIndex(index)
  }

  const handleDragLeave = () => {
    setDropTargetIndex(null)
  }

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault()
    if (draggedPageId) {
      const sourceIndex = pages.findIndex(page => page.id === draggedPageId)
      if (sourceIndex !== -1 && sourceIndex !== targetIndex) {
        onPageReorder(sourceIndex, targetIndex)
      }
    }
    setDraggedPageId(null)
    setDropTargetIndex(null)
  }

  // State to store generated thumbnails
  const [thumbnailCache, setThumbnailCache] = useState<Record<string, string>>(
    {}
  )

  const handleThumbnailGenerated = (pageId: string, dataUrl: string) => {
    setThumbnailCache(prev => ({
      ...prev,
      [pageId]: dataUrl,
    }))
  }

  // Update current page thumbnail when data changes
  useEffect(() => {
    if (currentPageData && currentPageId) {
      // Clear the current page thumbnail to trigger regeneration
      setThumbnailCache(prev => {
        const newCache = { ...prev }
        delete newCache[currentPageId]
        return newCache
      })
    }
  }, [currentPageData, currentPageId])

  return (
    <div
      className={`flex max-h-[100vh] flex-col border-r border-gray-200 bg-white ${className}`}
    >
      {/* Header */}
      <div className="flex flex-shrink-0 items-center justify-between border-b border-gray-200 p-3">
        <div className="flex items-center space-x-2">
          <h3
            className={`text-sm font-medium ${isExpanded ? 'block' : 'hidden'}`}
          >
            Pages ({pages.length})
          </h3>
        </div>

        {isExpanded && (
          <button
            onClick={() => onPageAdd()}
            className="rounded p-1 text-blue-600 hover:bg-gray-100"
            title="Add new page"
          >
            <Plus size={16} />
          </button>
        )}
      </div>

      {/* Pages List */}
      {isExpanded && (
        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="space-y-2 p-2">
            {pages.map((page, index) => (
              <div
                key={page.id}
                className={`group relative ${
                  dropTargetIndex === index ? 'border-t-2 border-blue-500' : ''
                }`}
                onDragOver={e => handleDragOver(e, index)}
                onDragLeave={handleDragLeave}
                onDrop={e => handleDrop(e, index)}
              >
                <div
                  draggable
                  onDragStart={e => handleDragStart(e, page.id)}
                  className={`
                    cursor-pointer rounded-lg border-2 p-2 transition-all
                    ${
                      currentPageId === page.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }
                    ${draggedPageId === page.id ? 'opacity-50' : ''}
                  `}
                  onClick={() => onPageSelect(page.id)}
                >
                  {/* Thumbnail */}
                  <div className="relative mb-2 h-32 w-full overflow-hidden rounded bg-gray-100">
                    {thumbnailCache[page.id] ? (
                      <img
                        src={thumbnailCache[page.id]}
                        alt={`${page.name} thumbnail`}
                        className="h-full w-full bg-white object-contain"
                      />
                    ) : (
                      <div className="pointer-events-none absolute inset-0 opacity-0">
                        <PagePreview
                          pageData={
                            page.id === currentPageId && currentPageData
                              ? currentPageData
                              : page.data
                          }
                          width={240}
                          height={120}
                          onPreviewGenerated={dataUrl =>
                            handleThumbnailGenerated(page.id, dataUrl)
                          }
                        />
                      </div>
                    )}
                    {!thumbnailCache[page.id] && (
                      <div className="flex h-full w-full items-center justify-center bg-gray-100">
                        <div className="text-xs text-gray-500">Loading...</div>
                      </div>
                    )}
                  </div>

                  {/* Page Name */}
                  <div className="flex items-center justify-between">
                    {editingPageId === page.id ? (
                      <input
                        type="text"
                        value={editingName}
                        onChange={e => setEditingName(e.target.value)}
                        onBlur={handleRenameSubmit}
                        onKeyDown={e => {
                          if (e.key === 'Enter') handleRenameSubmit()
                          if (e.key === 'Escape') handleRenameCancel()
                        }}
                        className="flex-1 rounded border border-gray-300 px-1 py-0.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#2D1B69]"
                        autoFocus
                        onClick={e => e.stopPropagation()}
                      />
                    ) : (
                      <span
                        className="flex-1 truncate text-xs font-medium text-gray-700"
                        onDoubleClick={() =>
                          handlePageRename(page.id, page.name)
                        }
                      >
                        {page.name}
                      </span>
                    )}

                    {/* Page Actions */}
                    <div className="flex items-center space-x-1 opacity-0 transition-opacity group-hover:opacity-100">
                      <button
                        onClick={e => {
                          e.stopPropagation()
                          // Preview page functionality
                        }}
                        className="rounded p-1 hover:bg-gray-200"
                        title="Preview page"
                      >
                        <Eye size={12} />
                      </button>

                      <button
                        onClick={e => {
                          e.stopPropagation()
                          onPageDuplicate(page.id)
                        }}
                        className="rounded p-1 hover:bg-gray-200"
                        title="Duplicate page"
                      >
                        <Copy size={12} />
                      </button>

                      {pages.length > 1 && (
                        <button
                          onClick={e => {
                            e.stopPropagation()
                            if (
                              confirm(
                                `Are you sure you want to delete "${page.name}"?`
                              )
                            ) {
                              onPageDelete(page.id)
                            }
                          }}
                          className="rounded p-1 text-red-600 hover:bg-red-100"
                          title="Delete page"
                        >
                          <Trash2 size={12} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Page Info */}
                  <div className="mt-1 text-xs text-gray-500">
                    {currentPageId === page.id && (
                      <span className="mr-1 inline-block h-2 w-2 rounded-full bg-green-500"></span>
                    )}
                    Updated{' '}
                    {page.updatedAt instanceof Date
                      ? page.updatedAt.toISOString().split('T')[0]
                      : new Date(page.updatedAt).toISOString().split('T')[0]}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      {isExpanded && (
        <div className="border-t border-gray-200 p-3">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>
              Page {pages.findIndex(p => p.id === currentPageId) + 1} of{' '}
              {pages.length}
            </span>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  const currentIndex = pages.findIndex(
                    p => p.id === currentPageId
                  )
                  if (currentIndex > 0) {
                    onPageSelect(pages[currentIndex - 1].id)
                  }
                }}
                disabled={pages.findIndex(p => p.id === currentPageId) === 0}
                className="rounded p-1 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                title="Previous page"
              >
                <ChevronLeft size={14} />
              </button>

              <button
                onClick={() => {
                  const currentIndex = pages.findIndex(
                    p => p.id === currentPageId
                  )
                  if (currentIndex < pages.length - 1) {
                    onPageSelect(pages[currentIndex + 1].id)
                  }
                }}
                disabled={
                  pages.findIndex(p => p.id === currentPageId) ===
                  pages.length - 1
                }
                className="rounded p-1 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                title="Next page"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
