import React from 'react'
import { ElementNode } from '@/hooks/useDragAndDropInIframe'
import { Move3D, Layers, ChevronRight } from 'lucide-react'

interface DragDropDebugPanelProps {
  elementNodes: Record<string, ElementNode>
  isDragging: boolean
  draggedElementId: string | null
}

export function DragDropDebugPanel({
  elementNodes,
  isDragging,
  draggedElementId,
}: DragDropDebugPanelProps) {
  // Find root elements (elements without parents)
  const rootElements = Object.values(elementNodes).filter(node => !node.parent)

  const renderElementTree = (element: ElementNode, depth = 0) => {
    const children =
      element.children?.map(childId => elementNodes[childId]).filter(Boolean) ||
      []
    const isBeingDragged = draggedElementId === element.id

    return (
      <div key={element.id} className="text-xs">
        <div
          className={`flex items-center gap-2 rounded px-2 py-1 transition-colors ${
            isBeingDragged
              ? 'border border-blue-300 bg-blue-100'
              : 'hover:bg-gray-50'
          }`}
          style={{ marginLeft: depth * 16 }}
        >
          {children.length > 0 && (
            <ChevronRight size={12} className="text-gray-400" />
          )}
          <Layers
            size={12}
            className={isBeingDragged ? 'text-blue-600' : 'text-gray-500'}
          />
          <span
            className={`font-mono ${isBeingDragged ? 'font-medium text-blue-700' : 'text-gray-700'}`}
          >
            {element.id}
          </span>
          {element.position &&
            (element.position.x !== 0 || element.position.y !== 0) && (
              <span className="text-xs text-gray-400">
                ({Math.round(element.position.x)},{' '}
                {Math.round(element.position.y)})
              </span>
            )}
          {isBeingDragged && (
            <Move3D size={10} className="animate-pulse text-blue-600" />
          )}
        </div>
        {children.map(child => renderElementTree(child, depth + 1))}
      </div>
    )
  }

  return (
    <div className="max-h-64 overflow-y-auto rounded-lg border border-gray-200 bg-white p-3">
      <div className="mb-3 flex items-center gap-2 border-b border-gray-100 pb-2">
        <Layers size={14} />
        <span className="text-sm font-medium">Element Hierarchy</span>
        {isDragging && (
          <div className="ml-auto flex items-center gap-1 text-xs text-blue-600">
            <Move3D size={12} className="animate-pulse" />
            Dragging
          </div>
        )}
      </div>

      {rootElements.length === 0 ? (
        <div className="py-4 text-center text-xs text-gray-500">
          No elements detected
        </div>
      ) : (
        <div className="space-y-1">
          {rootElements.map(element => renderElementTree(element))}
        </div>
      )}

      {Object.keys(elementNodes).length > 0 && (
        <div className="mt-3 border-t border-gray-100 pt-2 text-xs text-gray-500">
          Total elements: {Object.keys(elementNodes).length}
        </div>
      )}
    </div>
  )
}
