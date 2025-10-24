import { useState, useCallback, useRef, useEffect } from 'react'

// Core data structure for element hierarchy and positioning
export interface ElementNode {
  id: string
  parent?: string
  children?: string[]
  position?: { x: number; y: number }
  element?: string // tag name for reference
  zIndex?: number
}

// Message types from iframe
export interface DragDropMessage {
  type: 'ELEMENT_MOVED' | 'ELEMENT_REPARENTED' | 'DRAG_START' | 'DRAG_END'
  id: string
  position?: { x: number; y: number }
  newParentId?: string
  oldParentId?: string
}

export interface UseDragAndDropInIframeProps {
  iframeRef: React.RefObject<HTMLIFrameElement>
  onHierarchyChange?: (nodes: Record<string, ElementNode>) => void
  onPositionChange?: (id: string, position: { x: number; y: number }) => void
}

export function useDragAndDropInIframe({
  iframeRef,
  onHierarchyChange,
  onPositionChange,
}: UseDragAndDropInIframeProps) {
  // In-memory layout structure
  const [elementNodes, setElementNodes] = useState<Record<string, ElementNode>>(
    {}
  )
  const [isDragging, setIsDragging] = useState(false)
  const [draggedElementId, setDraggedElementId] = useState<string | null>(null)

  // Track if drag script is injected
  const scriptInjectedRef = useRef(false)

  // Initialize element nodes from iframe DOM
  const initializeElements = useCallback(() => {
    const iframe = iframeRef.current
    if (!iframe?.contentDocument) {
      console.log('❌ Cannot initialize elements - iframe not ready')
      return
    }

    console.log('🔍 Initializing elements from iframe DOM...')
    const doc = iframe.contentDocument
    const editableElements = doc.querySelectorAll('[data-id]')
    console.log(`📦 Found ${editableElements.length} elements with data-id`)
    const nodes: Record<string, ElementNode> = {}

    editableElements.forEach(el => {
      const id = el.getAttribute('data-id')
      if (!id) return

      const parentEl = el.parentElement?.closest('[data-id]')
      const parentId = parentEl?.getAttribute('data-id') || undefined

      // Get current position if element has transform
      const style = window.getComputedStyle(el as Element)
      const transform = style.transform
      let position = { x: 0, y: 0 }

      if (transform && transform !== 'none') {
        const match = transform.match(/translate\(([^,]+),\s*([^)]+)\)/)
        if (match) {
          position.x = parseFloat(match[1]) || 0
          position.y = parseFloat(match[2]) || 0
        }
      }

      nodes[id] = {
        id,
        parent: parentId,
        children: [],
        position,
        element: el.tagName.toLowerCase(),
        zIndex: parseInt(style.zIndex) || 0,
      }
    })

    // Build children arrays
    Object.values(nodes).forEach(node => {
      if (node.parent && nodes[node.parent]) {
        if (!nodes[node.parent].children) {
          nodes[node.parent].children = []
        }
        nodes[node.parent].children!.push(node.id)
      }
    })

    setElementNodes(nodes)
    onHierarchyChange?.(nodes)
  }, [iframeRef, onHierarchyChange])

  // Handle messages from iframe
  const handleMessage = useCallback(
    (event: MessageEvent) => {
      if (event.source !== iframeRef.current?.contentWindow) return

      const message = event.data as DragDropMessage

      switch (message.type) {
        case 'DRAG_START':
          setIsDragging(true)
          setDraggedElementId(message.id)
          break

        case 'DRAG_END':
          setIsDragging(false)
          setDraggedElementId(null)
          break

        case 'ELEMENT_MOVED':
          if (message.position) {
            setElementNodes(prev => ({
              ...prev,
              [message.id]: {
                ...prev[message.id],
                position: message.position!,
              },
            }))
            onPositionChange?.(message.id, message.position)
          }
          break

        case 'ELEMENT_REPARENTED':
          if (message.newParentId !== undefined) {
            setElementNodes(prev => {
              const updated = { ...prev }
              const element = updated[message.id]

              if (!element) return prev

              // Remove from old parent's children
              if (element.parent && updated[element.parent]?.children) {
                updated[element.parent].children = updated[
                  element.parent
                ].children!.filter(childId => childId !== message.id)
              }

              // Add to new parent's children
              if (message.newParentId && updated[message.newParentId]) {
                if (!updated[message.newParentId].children) {
                  updated[message.newParentId].children = []
                }
                updated[message.newParentId].children!.push(message.id)
              }

              // Update element's parent
              updated[message.id] = {
                ...element,
                parent: message.newParentId || undefined,
              }

              onHierarchyChange?.(updated)
              return updated
            })
          }
          break
      }
    },
    [iframeRef, onHierarchyChange, onPositionChange]
  )

  // Inject drag and drop script into iframe
  const injectDragScript = useCallback(() => {
    const iframe = iframeRef.current
    if (!iframe?.contentWindow || scriptInjectedRef.current) return

    console.log('🎯 Injecting drag script into iframe...')

    try {
      // Import interact.js from CDN and inject our script
      const script = `
        // Load interact.js if not already loaded
        if (typeof interact === 'undefined') {
          const script = document.createElement('script');
          script.src = 'https://cdn.jsdelivr.net/npm/interactjs@1.10.17/dist/interact.min.js';
          script.onload = initDragAndDrop;
          document.head.appendChild(script);
        } else {
          initDragAndDrop();
        }

        function initDragAndDrop() {
          if (window.dragDropInitialized) return;
          window.dragDropInitialized = true;

          console.log('🚀 Initializing drag and drop in iframe...');

          // Add base styles for dragging
          const style = document.createElement('style');
          style.textContent = \`
            [data-id] {
              position: relative;
              transition: transform 0.1s ease;
              cursor: move;
            }
            [data-id]:hover {
              outline: 2px solid rgba(59, 130, 246, 0.3);
              outline-offset: 1px;
            }
            .dragging {
              z-index: 9999 !important;
              opacity: 0.8;
              transform-origin: center;
              cursor: grabbing !important;
              box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2) !important;
            }
            .drop-hover {
              background-color: rgba(59, 130, 246, 0.1) !important;
              border: 2px dashed #3b82f6 !important;
              outline: none !important;
            }
            .drag-guide {
              position: fixed;
              background: #3b82f6;
              z-index: 9998;
              pointer-events: none;
              box-shadow: 0 0 4px rgba(59, 130, 246, 0.5);
            }
            .drag-guide.horizontal {
              height: 1px;
              left: 0;
              right: 0;
            }
            .drag-guide.vertical {
              width: 1px;
              top: 0;
              bottom: 0;
            }
            .drag-handle {
              position: absolute;
              top: -8px;
              right: -8px;
              width: 20px;
              height: 20px;
              background: #3b82f6;
              border: 2px solid white;
              border-radius: 50%;
              cursor: grab;
              opacity: 0;
              transition: opacity 0.2s ease;
              z-index: 10;
            }
            [data-id]:hover .drag-handle {
              opacity: 1;
            }
            .drag-handle:hover {
              background: #2563eb;
              transform: scale(1.1);
            }
          \`;
          document.head.appendChild(style);

          let draggedElement = null;
          let originalParent = null;
          let guidelines = [];

          // Make all elements with data-id draggable and droppable
          const elements = document.querySelectorAll('[data-id]');
          console.log(\`📦 Found \${elements.length} elements with data-id:\`, elements);
          
          elements.forEach((element, index) => {
            console.log(\`🏷️ Element \${index + 1}:\`, element.tagName, element.dataset.id);
            
            // Initialize position data
            if (!element.dataset.x) element.dataset.x = '0';
            if (!element.dataset.y) element.dataset.y = '0';
            
            // Add drag handle for better UX
            const handle = document.createElement('div');
            handle.className = 'drag-handle';
            handle.title = 'Drag to move';
            handle.innerHTML = '⋮⋮';
            element.style.position = 'relative'; // Ensure element can contain the handle
            element.appendChild(handle);
            
            console.log(\`✅ Added drag handle to element \${element.dataset.id}\`);
            
            // Make handle the drag trigger
            handle.addEventListener('mousedown', (e) => {
              e.stopPropagation();
              console.log('🖱️ Drag handle clicked for:', element.dataset.id);
            });
          });

          // Setup interact.js
          console.log('🎮 Setting up interact.js...');
          
          interact('[data-id]')
            .draggable({
              // Use drag handle as the trigger
              allowFrom: '.drag-handle, [data-id]',
              ignoreFrom: 'input, textarea, [contenteditable]',
              listeners: {
                start(event) {
                  console.log('🚀 DRAG START:', event.target.dataset.id);
                  draggedElement = event.target;
                  originalParent = draggedElement.parentElement;
                  
                  draggedElement.classList.add('dragging');
                  
                  // Notify parent
                  window.parent.postMessage({
                    type: 'DRAG_START',
                    id: draggedElement.dataset.id
                  }, '*');
                },
                
                move(event) {
                  const target = event.target;
                  const x = (parseFloat(target.dataset.x) || 0) + event.dx;
                  const y = (parseFloat(target.dataset.y) || 0) + event.dy;

                  // Snap to grid (10px)
                  const snappedX = Math.round(x / 10) * 10;
                  const snappedY = Math.round(y / 10) * 10;

                  target.dataset.x = snappedX;
                  target.dataset.y = snappedY;
                  target.style.transform = \`translate(\${snappedX}px, \${snappedY}px)\`;

                  // Show alignment guidelines
                  showGuidelines(target, snappedX, snappedY);
                },
                
                end(event) {
                  const target = event.target;
                  target.classList.remove('dragging');
                  hideGuidelines();
                  
                  // Notify parent of position change
                  window.parent.postMessage({
                    type: 'ELEMENT_MOVED',
                    id: target.dataset.id,
                    position: {
                      x: parseFloat(target.dataset.x) || 0,
                      y: parseFloat(target.dataset.y) || 0
                    }
                  }, '*');

                  window.parent.postMessage({
                    type: 'DRAG_END',
                    id: target.dataset.id
                  }, '*');
                  
                  draggedElement = null;
                }
              }
            })
            .dropzone({
              accept: '[data-id]',
              overlap: 0.25,
              
              listeners: {
                dragenter(event) {
                  if (event.relatedTarget === event.target) return;
                  event.target.classList.add('drop-hover');
                },
                
                dragleave(event) {
                  event.target.classList.remove('drop-hover');
                },
                
                drop(event) {
                  const dropzone = event.target;
                  const draggable = event.relatedTarget;
                  
                  dropzone.classList.remove('drop-hover');
                  
                  if (draggable === dropzone || dropzone.contains(draggable)) {
                    return; // Prevent dropping on self or children
                  }
                  
                  // Store old parent
                  const oldParentId = originalParent?.dataset?.id;
                  
                  // Reparent in DOM
                  dropzone.appendChild(draggable);
                  
                  // Reset position relative to new parent
                  draggable.dataset.x = '0';
                  draggable.dataset.y = '0';
                  draggable.style.transform = 'translate(0px, 0px)';
                  
                  // Notify parent
                  window.parent.postMessage({
                    type: 'ELEMENT_REPARENTED',
                    id: draggable.dataset.id,
                    newParentId: dropzone.dataset.id,
                    oldParentId: oldParentId
                  }, '*');
                }
              }
            });

          // Alignment guidelines
          function showGuidelines(draggedEl, x, y) {
            hideGuidelines();
            
            const draggedRect = draggedEl.getBoundingClientRect();
            const draggedCenter = {
              x: draggedRect.left + draggedRect.width / 2,
              y: draggedRect.top + draggedRect.height / 2
            };

            const otherElements = document.querySelectorAll('[data-id]:not(.dragging)');
            
            otherElements.forEach(el => {
              const rect = el.getBoundingClientRect();
              const center = {
                x: rect.left + rect.width / 2,
                y: rect.top + rect.height / 2
              };

              const tolerance = 8; // Increased tolerance for easier alignment

              // Vertical alignment (center-to-center)
              if (Math.abs(draggedCenter.x - center.x) < tolerance) {
                const guide = document.createElement('div');
                guide.className = 'drag-guide vertical';
                guide.style.left = center.x + 'px';
                guide.style.top = Math.min(draggedRect.top, rect.top) + 'px';
                guide.style.height = Math.abs(draggedRect.bottom - rect.top) + 'px';
                guidelines.push(guide);
                document.body.appendChild(guide);
              }

              // Horizontal alignment (center-to-center)
              if (Math.abs(draggedCenter.y - center.y) < tolerance) {
                const guide = document.createElement('div');
                guide.className = 'drag-guide horizontal';
                guide.style.top = center.y + 'px';
                guide.style.left = Math.min(draggedRect.left, rect.left) + 'px';
                guide.style.width = Math.abs(draggedRect.right - rect.left) + 'px';
                guidelines.push(guide);
                document.body.appendChild(guide);
              }

              // Edge alignments
              // Left edges
              if (Math.abs(draggedRect.left - rect.left) < tolerance) {
                const guide = document.createElement('div');
                guide.className = 'drag-guide vertical';
                guide.style.left = rect.left + 'px';
                guide.style.top = Math.min(draggedRect.top, rect.top) + 'px';
                guide.style.height = Math.abs(draggedRect.bottom - rect.top) + 'px';
                guidelines.push(guide);
                document.body.appendChild(guide);
              }

              // Top edges
              if (Math.abs(draggedRect.top - rect.top) < tolerance) {
                const guide = document.createElement('div');
                guide.className = 'drag-guide horizontal';
                guide.style.top = rect.top + 'px';
                guide.style.left = Math.min(draggedRect.left, rect.left) + 'px';
                guide.style.width = Math.abs(draggedRect.right - rect.left) + 'px';
                guidelines.push(guide);
                document.body.appendChild(guide);
              }
            });
          }

          function hideGuidelines() {
            guidelines.forEach(guide => {
              if (guide.parentNode) {
                guide.parentNode.removeChild(guide);
              }
            });
            guidelines = [];
          }
        }
      `

      ;(iframe.contentWindow as any).eval(script)
      scriptInjectedRef.current = true
      console.log('✅ Drag script injected successfully')
    } catch (error) {
      console.error('❌ Failed to inject drag script:', error)
      scriptInjectedRef.current = false
    }
  }, [iframeRef])

  // Setup message listener
  useEffect(() => {
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [handleMessage])

  // Utility functions
  const getElementById = useCallback(
    (id: string) => {
      return elementNodes[id]
    },
    [elementNodes]
  )

  const getElementChildren = useCallback(
    (id: string) => {
      return (
        elementNodes[id]?.children
          ?.map(childId => elementNodes[childId])
          .filter(Boolean) || []
      )
    },
    [elementNodes]
  )

  const updateElementPosition = useCallback(
    (id: string, position: { x: number; y: number }) => {
      const iframe = iframeRef.current
      if (!iframe?.contentDocument) return

      const element = iframe.contentDocument.querySelector(
        `[data-id="${id}"]`
      ) as HTMLElement
      if (element) {
        element.dataset.x = position.x.toString()
        element.dataset.y = position.y.toString()
        element.style.transform = `translate(${position.x}px, ${position.y}px)`
      }

      setElementNodes(prev => ({
        ...prev,
        [id]: {
          ...prev[id],
          position,
        },
      }))
    },
    [iframeRef]
  )

  const reparentElement = useCallback(
    (elementId: string, newParentId: string) => {
      const iframe = iframeRef.current
      if (!iframe?.contentDocument) return

      const element = iframe.contentDocument.querySelector(
        `[data-id="${elementId}"]`
      )
      const newParent = iframe.contentDocument.querySelector(
        `[data-id="${newParentId}"]`
      )

      if (element && newParent) {
        newParent.appendChild(element)

        // Reset position
        const htmlElement = element as HTMLElement
        htmlElement.dataset.x = '0'
        htmlElement.dataset.y = '0'
        htmlElement.style.transform = 'translate(0px, 0px)'
      }
    },
    [iframeRef]
  )

  // Force initialization - useful for debugging
  const forceInitialize = useCallback(() => {
    console.log('🔧 Force initializing drag and drop...')
    scriptInjectedRef.current = false // Reset injection flag
    setTimeout(() => {
      injectDragScript()
      setTimeout(() => {
        initializeElements()
      }, 500)
    }, 100)
  }, [injectDragScript, initializeElements])

  return {
    elementNodes,
    isDragging,
    draggedElementId,
    initializeElements,
    injectDragScript,
    forceInitialize,
    getElementById,
    getElementChildren,
    updateElementPosition,
    reparentElement,
  }
}
