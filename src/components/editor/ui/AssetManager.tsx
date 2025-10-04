'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Upload, Search, Grid, List, Trash2, Download, Copy, Eye, Filter, FolderPlus, Image as ImageIcon } from 'lucide-react';

export interface Asset {
  id: string;
  name: string;
  url: string;
  type: 'image' | 'video' | 'document';
  size: number;
  dimensions?: { width: number; height: number };
  createdAt: Date;
  tags: string[];
  folder?: string;
}

interface AssetManagerProps {
  assets: Asset[];
  onAssetUpload: (files: FileList) => Promise<Asset[]>;
  onAssetDelete: (assetId: string) => void;
  onAssetSelect: (asset: Asset) => void;
  onAssetInsert: (asset: Asset) => void;
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

export const AssetManager: React.FC<AssetManagerProps> = ({
  assets,
  onAssetUpload,
  onAssetDelete,
  onAssetSelect,
  onAssetInsert,
  isOpen,
  onClose,
  className = ''
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterType, setFilterType] = useState<'all' | 'image' | 'video' | 'document'>('all');
  const [selectedFolder, setSelectedFolder] = useState<string>('all');
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  // Filter assets based on search, type, and folder
  const filteredAssets = assets.filter(asset => {
    const matchesSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         asset.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = filterType === 'all' || asset.type === filterType;
    const matchesFolder = selectedFolder === 'all' || asset.folder === selectedFolder;
    
    return matchesSearch && matchesType && matchesFolder;
  });

  // Get unique folders
  const folders = ['all', ...Array.from(new Set(assets.map(asset => asset.folder).filter(Boolean)))];

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await handleUpload(files);
    }
  };

  const handleUpload = async (files: FileList) => {
    try {
      const uploadedAssets = await onAssetUpload(files);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget === dropZoneRef.current) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      await handleUpload(files);
    }
  }, []);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleAssetClick = (asset: Asset, event: React.MouseEvent) => {
    if (event.ctrlKey || event.metaKey) {
      // Multi-select
      setSelectedAssets(prev => 
        prev.includes(asset.id) 
          ? prev.filter(id => id !== asset.id)
          : [...prev, asset.id]
      );
    } else {
      setSelectedAssets([asset.id]);
      onAssetSelect(asset);
    }
  };

  const handleAssetDoubleClick = (asset: Asset) => {
    onAssetInsert(asset);
  };

  const copyAssetUrl = (asset: Asset) => {
    navigator.clipboard.writeText(asset.url);
    // You could show a toast notification here
  };

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${className}`}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-5/6 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Asset Manager</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            ×
          </button>
        </div>

        {/* Toolbar */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Upload Button */}
            <button
              onClick={handleFileSelect}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Upload size={16} />
              <span>Upload</span>
            </button>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search assets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Filters */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              <option value="image">Images</option>
              <option value="video">Videos</option>
              <option value="document">Documents</option>
            </select>

            <select
              value={selectedFolder}
              onChange={(e) => setSelectedFolder(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            <div className="flex border border-gray-300 rounded-lg">
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
        <div className="flex-1 flex">
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
                <div className="absolute inset-0 flex items-center justify-center bg-blue-50 bg-opacity-90 z-10">
                  <div className="text-center">
                    <Upload size={48} className="mx-auto text-blue-500 mb-4" />
                    <p className="text-lg font-medium text-blue-700">Drop files here to upload</p>
                  </div>
                </div>
              )}

              {/* Assets Grid/List */}
              {filteredAssets.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-500">
                  <ImageIcon size={64} className="mb-4" />
                  <p className="text-lg font-medium mb-2">No assets found</p>
                  <p className="text-sm">Upload some files to get started</p>
                </div>
              ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {filteredAssets.map((asset) => (
                    <div
                      key={asset.id}
                      className={`
                        group relative bg-white border-2 rounded-lg overflow-hidden cursor-pointer transition-all
                        ${selectedAssets.includes(asset.id) 
                          ? 'border-blue-500 ring-2 ring-blue-200' 
                          : 'border-gray-200 hover:border-gray-300'
                        }
                      `}
                      onClick={(e) => handleAssetClick(asset, e)}
                      onDoubleClick={() => handleAssetDoubleClick(asset)}
                    >
                      {/* Asset Preview */}
                      <div className="aspect-square bg-gray-100 flex items-center justify-center">
                        {asset.type === 'image' ? (
                          <img
                            src={asset.url}
                            alt={asset.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="text-gray-400">
                            {asset.type === 'video' ? '🎥' : '📄'}
                          </div>
                        )}
                      </div>

                      {/* Asset Info */}
                      <div className="p-2">
                        <p className="text-xs font-medium text-gray-700 truncate" title={asset.name}>
                          {asset.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatFileSize(asset.size)}
                        </p>
                      </div>

                      {/* Actions Overlay */}
                      <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onAssetInsert(asset);
                          }}
                          className="p-2 bg-white rounded-full hover:bg-gray-100"
                          title="Insert"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            copyAssetUrl(asset);
                          }}
                          className="p-2 bg-white rounded-full hover:bg-gray-100"
                          title="Copy URL"
                        >
                          <Copy size={16} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onAssetDelete(asset.id);
                          }}
                          className="p-2 bg-white rounded-full hover:bg-gray-100 text-red-600"
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
                  {filteredAssets.map((asset) => (
                    <div
                      key={asset.id}
                      className={`
                        flex items-center space-x-4 p-3 border rounded-lg cursor-pointer transition-all
                        ${selectedAssets.includes(asset.id) 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }
                      `}
                      onClick={(e) => handleAssetClick(asset, e)}
                      onDoubleClick={() => handleAssetDoubleClick(asset)}
                    >
                      {/* Thumbnail */}
                      <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
                        {asset.type === 'image' ? (
                          <img
                            src={asset.url}
                            alt={asset.name}
                            className="w-full h-full object-cover rounded"
                          />
                        ) : (
                          <div className="text-gray-400">
                            {asset.type === 'video' ? '🎥' : '📄'}
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{asset.name}</p>
                        <p className="text-sm text-gray-500">
                          {formatFileSize(asset.size)} • {asset.createdAt.toISOString().split('T')[0]}
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
                          onClick={(e) => {
                            e.stopPropagation();
                            onAssetInsert(asset);
                          }}
                          className="p-2 hover:bg-gray-200 rounded"
                          title="Insert"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            copyAssetUrl(asset);
                          }}
                          className="p-2 hover:bg-gray-200 rounded"
                          title="Copy URL"
                        >
                          <Copy size={16} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onAssetDelete(asset.id);
                          }}
                          className="p-2 hover:bg-red-100 text-red-600 rounded"
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
        <div className="p-4 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {filteredAssets.length} of {assets.length} assets
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            {selectedAssets.length === 1 && (
              <button
                onClick={() => {
                  const asset = assets.find(a => a.id === selectedAssets[0]);
                  if (asset) {
                    onAssetInsert(asset);
                    onClose();
                  }
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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
  );
};