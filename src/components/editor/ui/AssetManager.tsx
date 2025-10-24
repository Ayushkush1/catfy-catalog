'use client'

import React, { useState, useRef, useCallback } from 'react'
import {
  Upload,
  Search,
  Grid,
  List,
  Trash2,
  Download,
  Copy,
  Eye,
  Filter,
  FolderPlus,
  Image as ImageIcon,
} from 'lucide-react'

export interface Asset {
  id: string
  name: string
  url: string
  type: 'image' | 'video' | 'document'
  size: number
  dimensions?: { width: number; height: number }
  createdAt: Date
  tags: string[]
  folder?: string
}

interface AssetManagerProps {
  assets: Asset[]
  onAssetUpload: (files: FileList) => Promise<Asset[]>
  onAssetDelete: (assetId: string) => void
  onAssetSelect: (asset: Asset) => void
  onAssetInsert: (asset: Asset) => void
  isOpen: boolean
  onClose: () => void
  className?: string
}

export const AssetManager: React.FC<AssetManagerProps> = ({
  assets,
  onAssetUpload,
  onAssetDelete,
  onAssetSelect,
  onAssetInsert,
  isOpen,
  onClose,
  className = '',
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedAssets, setSelectedAssets] = useState<string[]>([])
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [filterType, setFilterType] = useState<
    'all' | 'image' | 'video' | 'document'
  >('all')
  const [selectedFolder, setSelectedFolder] = useState<string>('all')
  const [isDragging, setIsDragging] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<{
    [key: string]: number
  }>({})

  const fileInputRef = useRef<HTMLInputElement>(null)
  const dropZoneRef = useRef<HTMLDivElement>(null)

  // Filter assets based on search, type, and folder
  const filteredAssets = assets.filter(asset => {
    const matchesSearch =
      asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.tags.some(tag =>
        tag.toLowerCase().includes(searchTerm.toLowerCase())
      )
    const matchesType = filterType === 'all' || asset.type === filterType
    const matchesFolder =
      selectedFolder === 'all' || asset.folder === selectedFolder

    return matchesSearch && matchesType && matchesFolder
  })

  // Get unique folders
  const folders = [
    'all',
    ...Array.from(new Set(assets.map(asset => asset.folder).filter(Boolean))),
  ]

  const handleFileSelect = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      await handleUpload(files)
    }
  }

  const handleUpload = async (files: FileList) => {
    try {
      const uploadedAssets = await onAssetUpload(files)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (error) {
      console.error('Upload failed:', error)
    }
  }

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.currentTarget === dropZoneRef.current) {
      setIsDragging(false)
    }
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      await handleUpload(files)
    }
  }, [])

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const handleAssetClick = (asset: Asset, event: React.MouseEvent) => {
    if (event.ctrlKey || event.metaKey) {
      // Multi-select
      setSelectedAssets(prev =>
        prev.includes(asset.id)
          ? prev.filter(id => id !== asset.id)
          : [...prev, asset.id]
      )
    } else {
      setSelectedAssets([asset.id])
      onAssetSelect(asset)
    }
  }

  const handleAssetDoubleClick = (asset: Asset) => {
    onAssetInsert(asset)
  }

  const copyAssetUrl = (asset: Asset) => {
    navigator.clipboard.writeText(asset.url)
    // You could show a toast notification here
  }

  if (!isOpen) return null

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 ${className}`}
    >
      <div className="flex h-5/6 w-full max-w-6xl flex-col rounded-lg bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 p-4">
          <h2 className="text-lg font-semibold">Asset Manager</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 hover:bg-gray-100"
          >
            ×
          </button>
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between border-b border-gray-200 p-4">
          <div className="flex items-center space-x-4">
            {/* Upload Button */}
            <button
              onClick={handleFileSelect}
              className="flex items-center space-x-2 rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              <Upload size={16} />
              <span>Upload</span>
            </button>

            {/* Search */}
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 transform text-gray-400"
                size={16}
              />
              <input
                type="text"
                placeholder="Search assets..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-[#2D1B69]"
              />
            </div>

            {/* Filters */}
            <select
              value={filterType}
              onChange={e => setFilterType(e.target.value as any)}
              className="rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#2D1B69]"
            >
              <option value="all">All Types</option>
              <option value="image">Images</option>
              <option value="video">Videos</option>
              <option value="document">Documents</option>
            </select>

            <select
              value={selectedFolder}
              onChange={e => setSelectedFolder(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#2D1B69]"
            >
              {folders.map(folder => (
                <option key={folder} value={folder}>
                  {folder === 'all' ? 'All Folders' : folder}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2">
            {/* View Mode Toggle */}
            <div className="flex rounded-lg border border-gray-300">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
              >
                <Grid size={16} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
              >
                <List size={16} />
              </button>
            </div>

            {/* Selected Count */}
            {selectedAssets.length > 0 && (
              <span className="text-sm text-gray-600">
                {selectedAssets.length} selected
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-1">
          {/* Main Content */}
          <div className="flex-1 p-4">
            {/* Drop Zone */}
            <div
              ref={dropZoneRef}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className={`
                relative h-full
                ${isDragging ? 'border-2 border-dashed border-blue-500 bg-blue-50' : ''}
              `}
            >
              {isDragging && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-blue-50 bg-opacity-90">
                  <div className="text-center">
                    <Upload size={48} className="mx-auto mb-4 text-blue-500" />
                    <p className="text-lg font-medium text-blue-700">
                      Drop files here to upload
                    </p>
                  </div>
                </div>
              )}

              {/* Assets Grid/List */}
              {filteredAssets.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-gray-500">
                  <ImageIcon size={64} className="mb-4" />
                  <p className="mb-2 text-lg font-medium">No assets found</p>
                  <p className="text-sm">Upload some files to get started</p>
                </div>
              ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                  {filteredAssets.map(asset => (
                    <div
                      key={asset.id}
                      className={`
                        group relative cursor-pointer overflow-hidden rounded-lg border-2 bg-white transition-all
                        ${
                          selectedAssets.includes(asset.id)
                            ? 'border-blue-500 ring-2 ring-blue-200'
                            : 'border-gray-200 hover:border-gray-300'
                        }
                      `}
                      onClick={e => handleAssetClick(asset, e)}
                      onDoubleClick={() => handleAssetDoubleClick(asset)}
                    >
                      {/* Asset Preview */}
                      <div className="flex aspect-square items-center justify-center bg-gray-100">
                        {asset.type === 'image' ? (
                          <img
                            src={asset.url}
                            alt={asset.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="text-gray-400">
                            {asset.type === 'video' ? '🎥' : '📄'}
                          </div>
                        )}
                      </div>

                      {/* Asset Info */}
                      <div className="p-2">
                        <p
                          className="truncate text-xs font-medium text-gray-700"
                          title={asset.name}
                        >
                          {asset.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatFileSize(asset.size)}
                        </p>
                      </div>

                      {/* Actions Overlay */}
                      <div className="absolute inset-0 flex items-center justify-center space-x-2 bg-black bg-opacity-50 opacity-0 transition-opacity group-hover:opacity-100">
                        <button
                          onClick={e => {
                            e.stopPropagation()
                            onAssetInsert(asset)
                          }}
                          className="rounded-full bg-white p-2 hover:bg-gray-100"
                          title="Insert"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={e => {
                            e.stopPropagation()
                            copyAssetUrl(asset)
                          }}
                          className="rounded-full bg-white p-2 hover:bg-gray-100"
                          title="Copy URL"
                        >
                          <Copy size={16} />
                        </button>
                        <button
                          onClick={e => {
                            e.stopPropagation()
                            onAssetDelete(asset.id)
                          }}
                          className="rounded-full bg-white p-2 text-red-600 hover:bg-gray-100"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredAssets.map(asset => (
                    <div
                      key={asset.id}
                      className={`
                        flex cursor-pointer items-center space-x-4 rounded-lg border p-3 transition-all
                        ${
                          selectedAssets.includes(asset.id)
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }
                      `}
                      onClick={e => handleAssetClick(asset, e)}
                      onDoubleClick={() => handleAssetDoubleClick(asset)}
                    >
                      {/* Thumbnail */}
                      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded bg-gray-100">
                        {asset.type === 'image' ? (
                          <img
                            src={asset.url}
                            alt={asset.name}
                            className="h-full w-full rounded object-cover"
                          />
                        ) : (
                          <div className="text-gray-400">
                            {asset.type === 'video' ? '🎥' : '📄'}
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-gray-900">
                          {asset.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatFileSize(asset.size)} •{' '}
                          {asset.createdAt.toISOString().split('T')[0]}
                        </p>
                        {asset.dimensions && (
                          <p className="text-xs text-gray-400">
                            {asset.dimensions.width} × {asset.dimensions.height}
                          </p>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={e => {
                            e.stopPropagation()
                            onAssetInsert(asset)
                          }}
                          className="rounded p-2 hover:bg-gray-200"
                          title="Insert"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={e => {
                            e.stopPropagation()
                            copyAssetUrl(asset)
                          }}
                          className="rounded p-2 hover:bg-gray-200"
                          title="Copy URL"
                        >
                          <Copy size={16} />
                        </button>
                        <button
                          onClick={e => {
                            e.stopPropagation()
                            onAssetDelete(asset.id)
                          }}
                          className="rounded p-2 text-red-600 hover:bg-red-100"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-gray-200 p-4">
          <div className="text-sm text-gray-600">
            {filteredAssets.length} of {assets.length} assets
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="rounded-lg border border-gray-300 px-4 py-2 hover:bg-gray-50"
            >
              Cancel
            </button>
            {selectedAssets.length === 1 && (
              <button
                onClick={() => {
                  const asset = assets.find(a => a.id === selectedAssets[0])
                  if (asset) {
                    onAssetInsert(asset)
                    onClose()
                  }
                }}
                className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
              >
                Insert Selected
              </button>
            )}
          </div>
        </div>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,video/*,.pdf,.doc,.docx"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>
    </div>
  )
}
