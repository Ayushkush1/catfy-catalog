import React from 'react'
import { Move3D, MousePointer, Info } from 'lucide-react'

interface CanvasDragInstructionsProps {
  isDragging: boolean
  elementCount: number
  onForceInit?: () => void
}

export function CanvasDragInstructions({
  isDragging,
  elementCount,
  onForceInit,
}: CanvasDragInstructionsProps) {
  if (isDragging) {
    return (
      <div className="absolute left-1/2 top-4 z-50 flex -translate-x-1/2 transform items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-white shadow-lg">
        <Move3D size={16} className="animate-pulse" />
        <span className="text-sm font-medium">
          Drag to move • Drop on another element to reparent
        </span>
      </div>
    )
  }

  if (elementCount === 0) {
    return (
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transform text-center text-gray-500">
        <Info size={24} className="mx-auto mb-2" />
        <p className="text-sm">Add elements to start dragging</p>
        {onForceInit && (
          <button
            onClick={onForceInit}
            className="mt-2 rounded bg-blue-500 px-3 py-1 text-xs text-white hover:bg-blue-600"
          >
            🔧 Force Init Drag
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="absolute right-4 top-4 max-w-xs rounded-lg border border-gray-200 bg-white/90 p-3 shadow-sm backdrop-blur-sm">
      <div className="mb-2 flex items-center gap-2">
        <MousePointer size={14} className="text-blue-600" />
        <span className="text-xs font-medium text-gray-700">
          Canvas Controls
        </span>
      </div>
      <div className="space-y-1 text-xs text-gray-600">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-blue-600"></div>
          <span>Hover: Blue outline appears</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-blue-600"></div>
          <span>Click: Select element</span>
        </div>
        <div className="flex items-center gap-2">
          <Move3D size={12} className="text-blue-600" />
          <span>Drag blue handle to move</span>
        </div>
      </div>
    </div>
  )
}
