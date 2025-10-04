'use client';

import React, { useState } from 'react';
import { Plus, Copy, Trash2, ChevronLeft, ChevronRight, MoreVertical, Eye } from 'lucide-react';

export interface Page {
  id: string;
  name: string;
  thumbnail?: string;
  data: string; // JSON serialized data
  createdAt: Date;
  updatedAt: Date;
}

interface PageNavigatorProps {
  pages: Page[];
  currentPageId: string;
  onPageSelect: (pageId: string) => void;
  onPageAdd: () => void;
  onPageDuplicate: (pageId: string) => void;
  onPageDelete: (pageId: string) => void;
  onPageRename: (pageId: string, newName: string) => void;
  onPageReorder: (fromIndex: number, toIndex: number) => void;
  className?: string;
}

export const PageNavigator: React.FC<PageNavigatorProps> = ({
  pages,
  currentPageId,
  onPageSelect,
  onPageAdd,
  onPageDuplicate,
  onPageDelete,
  onPageRename,
  onPageReorder,
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [editingPageId, setEditingPageId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [draggedPageId, setDraggedPageId] = useState<string | null>(null);
  const [dropTargetIndex, setDropTargetIndex] = useState<number | null>(null);

  const handlePageRename = (pageId: string, currentName: string) => {
    setEditingPageId(pageId);
    setEditingName(currentName);
  };

  const handleRenameSubmit = () => {
    if (editingPageId && editingName.trim()) {
      onPageRename(editingPageId, editingName.trim());
    }
    setEditingPageId(null);
    setEditingName('');
  };

  const handleRenameCancel = () => {
    setEditingPageId(null);
    setEditingName('');
  };

  const handleDragStart = (e: React.DragEvent, pageId: string) => {
    setDraggedPageId(pageId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDropTargetIndex(index);
  };

  const handleDragLeave = () => {
    setDropTargetIndex(null);
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedPageId) {
      const sourceIndex = pages.findIndex(page => page.id === draggedPageId);
      if (sourceIndex !== -1 && sourceIndex !== targetIndex) {
        onPageReorder(sourceIndex, targetIndex);
      }
    }
    setDraggedPageId(null);
    setDropTargetIndex(null);
  };

  const generateThumbnail = (pageData: string): string => {
    // In a real implementation, you would generate a thumbnail from the page data
    // For now, return a placeholder
    return `data:image/svg+xml;base64,${btoa(`
      <svg width="120" height="80" xmlns="http://www.w3.org/2000/svg">
        <rect width="120" height="80" fill="#f3f4f6"/>
        <text x="60" y="40" text-anchor="middle" fill="#6b7280" font-size="12">Page</text>
      </svg>
    `)}`;
  };

  return (
    <div className={`bg-white border-r border-gray-200 flex flex-col max-h-[100vh] ${className}`}>
      {/* Header */}
      <div className="p-3 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center space-x-2">
          <h3 className={`font-medium text-sm ${isExpanded ? 'block' : 'hidden'}`}>
            Pages ({pages.length})
          </h3>
        </div>
        
        {isExpanded && (
          <button
            onClick={onPageAdd}
            className="p-1 hover:bg-gray-100 rounded text-blue-600"
            title="Add new page"
          >
            <Plus size={16} />
          </button>
        )}
      </div>

      {/* Pages List */}
      {isExpanded && (
        <div className="flex-1 overflow-y-auto min-h-0">
          <div className="p-2 space-y-2">
            {pages.map((page, index) => (
              <div
                key={page.id}
                className={`relative group ${
                  dropTargetIndex === index ? 'border-t-2 border-blue-500' : ''
                }`}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, index)}
              >
                <div
                  draggable
                  onDragStart={(e) => handleDragStart(e, page.id)}
                  className={`
                    p-2 rounded-lg border-2 cursor-pointer transition-all
                    ${currentPageId === page.id 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }
                    ${draggedPageId === page.id ? 'opacity-50' : ''}
                  `}
                  onClick={() => onPageSelect(page.id)}
                >
                  {/* Thumbnail */}
                  <div className="w-full h-16 bg-gray-100 rounded mb-2 overflow-hidden">
                    <img
                      src={page.thumbnail || generateThumbnail(page.data)}
                      alt={`${page.name} thumbnail`}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Page Name */}
                  <div className="flex items-center justify-between">
                    {editingPageId === page.id ? (
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        onBlur={handleRenameSubmit}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleRenameSubmit();
                          if (e.key === 'Escape') handleRenameCancel();
                        }}
                        className="flex-1 px-1 py-0.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        autoFocus
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <span
                        className="flex-1 text-xs font-medium text-gray-700 truncate"
                        onDoubleClick={() => handlePageRename(page.id, page.name)}
                      >
                        {page.name}
                      </span>
                    )}

                    {/* Page Actions */}
                    <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          // Preview page functionality
                        }}
                        className="p-1 hover:bg-gray-200 rounded"
                        title="Preview page"
                      >
                        <Eye size={12} />
                      </button>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onPageDuplicate(page.id);
                        }}
                        className="p-1 hover:bg-gray-200 rounded"
                        title="Duplicate page"
                      >
                        <Copy size={12} />
                      </button>
                      
                      {pages.length > 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm(`Are you sure you want to delete "${page.name}"?`)) {
                              onPageDelete(page.id);
                            }
                          }}
                          className="p-1 hover:bg-red-100 text-red-600 rounded"
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
                      <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                    )}
                    Updated {page.updatedAt.toISOString().split('T')[0]}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      

      {/* Quick Actions */}
      {isExpanded && (
        <div className="p-3 border-t border-gray-200">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Page {pages.findIndex(p => p.id === currentPageId) + 1} of {pages.length}</span>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  const currentIndex = pages.findIndex(p => p.id === currentPageId);
                  if (currentIndex > 0) {
                    onPageSelect(pages[currentIndex - 1].id);
                  }
                }}
                disabled={pages.findIndex(p => p.id === currentPageId) === 0}
                className="p-1 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                title="Previous page"
              >
                <ChevronLeft size={14} />
              </button>
              
              <button
                onClick={() => {
                  const currentIndex = pages.findIndex(p => p.id === currentPageId);
                  if (currentIndex < pages.length - 1) {
                    onPageSelect(pages[currentIndex + 1].id);
                  }
                }}
                disabled={pages.findIndex(p => p.id === currentPageId) === pages.length - 1}
                className="p-1 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                title="Next page"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};