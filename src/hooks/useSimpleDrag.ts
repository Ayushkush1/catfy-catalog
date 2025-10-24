import { useRef, useCallback } from 'react'

interface SimpleElement {
  id: string
  element: HTMLElement
  x: number
  y: number
}

interface UseSimpleDragProps {
  iframeRef: React.RefObject<HTMLIFrameElement>
  onElementMove?: (id: string, x: number, y: number) => void
}

export function useSimpleDrag({
  iframeRef,
  onElementMove,
}: UseSimpleDragProps) {
  const dragStateRef = useRef<{
    isDragging: boolean
    element: SimpleElement | null
    startX: number
    startY: number
    offsetX: number
    offsetY: number
  }>({
    isDragging: false,
    element: null,
    startX: 0,
    startY: 0,
    offsetX: 0,
    offsetY: 0,
  })

  const startDrag = useCallback(
    (element: HTMLElement, clientX: number, clientY: number) => {
      const doc = iframeRef.current?.contentDocument
      if (!doc || !element) return

      // Get current position
      const currentX = parseInt(element.dataset.x || '0')
      const currentY = parseInt(element.dataset.y || '0')

      // Store drag state
      dragStateRef.current = {
        isDragging: true,
        element: {
          id: element.dataset.id || `element-${Date.now()}`,
          element,
          x: currentX,
          y: currentY,
        },
        startX: clientX,
        startY: clientY,
        offsetX: currentX,
        offsetY: currentY,
      }

      // Set element as dragging
      element.classList.add('dragging')
      element.style.position = 'relative'
      element.style.zIndex = '9999'
      element.style.opacity = '0.8'
      element.style.cursor = 'grabbing'
      element.style.boxShadow = '0 8px 32px rgba(0,0,0,0.2)'

      // Add event listeners to document
      doc.addEventListener('mousemove', handleMouseMove)
      doc.addEventListener('mouseup', handleMouseUp)
      doc.body.style.userSelect = 'none'

      // Prevent text selection during drag
      doc.body.classList.add('dragging-mode')
      const style = doc.createElement('style')
      style.textContent = `
      .dragging-mode * {
        user-select: none !important;
      }
      .dragging {
        transition: none !important;
      }
    `
      doc.head.appendChild(style)
    },
    [iframeRef]
  )

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      const state = dragStateRef.current
      if (!state.isDragging || !state.element) return

      e.preventDefault()

      // Calculate new position with 5px grid snapping
      const deltaX = e.clientX - state.startX
      const deltaY = e.clientY - state.startY
      const newX = Math.round((state.offsetX + deltaX) / 5) * 5
      const newY = Math.round((state.offsetY + deltaY) / 5) * 5

      // Update element position
      state.element.element.style.transform = `translate(${newX}px, ${newY}px)`
      state.element.element.dataset.x = newX.toString()
      state.element.element.dataset.y = newY.toString()

      // Update state
      state.element.x = newX
      state.element.y = newY

      // Callback
      onElementMove?.(state.element.id, newX, newY)
    },
    [onElementMove]
  )

  const handleMouseUp = useCallback(() => {
    const state = dragStateRef.current
    const doc = iframeRef.current?.contentDocument
    if (!doc || !state.element) return

    // Clean up
    state.element.element.classList.remove('dragging')
    state.element.element.style.opacity = ''
    state.element.element.style.cursor = ''
    state.element.element.style.boxShadow = ''

    // Remove event listeners
    doc.removeEventListener('mousemove', handleMouseMove)
    doc.removeEventListener('mouseup', handleMouseUp)
    doc.body.style.userSelect = ''
    doc.body.classList.remove('dragging-mode')

    // Remove styles
    const styles = doc.querySelectorAll('style')
    styles.forEach(style => {
      if (style.textContent?.includes('dragging-mode')) {
        style.remove()
      }
    })

    // Reset state
    dragStateRef.current = {
      isDragging: false,
      element: null,
      startX: 0,
      startY: 0,
      offsetX: 0,
      offsetY: 0,
    }
  }, [iframeRef, handleMouseMove])

  return {
    startDrag,
    isDragging: dragStateRef.current.isDragging,
  }
}
