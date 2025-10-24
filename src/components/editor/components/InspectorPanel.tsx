'use client'

import React, { useState } from 'react'
import { useEditor, useNode } from '@craftjs/core'
import {
  Settings,
  Palette,
  Type,
  Layout,
  Image as ImageIcon,
  Link,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Trash2,
  Move,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { NumberInput } from './NumberInput'

// Import property panels - simplified for now

interface InspectorPanelProps {
  isCollapsed?: boolean
  onToggle?: () => void
}

export const InspectorPanel: React.FC<InspectorPanelProps> = ({
  isCollapsed = false,
  onToggle,
}) => {
  const { selected, actions } = useEditor(state => ({
    selected: state.events.selected,
  }))

  const [activeTab, setActiveTab] = useState<'content' | 'style'>('content')

  const selectedNodeId = selected.size > 0 ? Array.from(selected)[0] : null

  // Auto-expand inspector when an element is selected
  React.useEffect(() => {
    if (selectedNodeId && isCollapsed && onToggle) {
      onToggle() // Expand the inspector
    }
  }, [selectedNodeId, isCollapsed, onToggle])

  // Auto-switch to style tab when an element is selected
  React.useEffect(() => {
    if (selectedNodeId) {
      setActiveTab('style') // Switch to style tab when element is selected
    }
  }, [selectedNodeId])

  const tabs = [
    {
      id: 'content' as const,
      label: 'Content',
      icon: <Settings className="h-4 w-4" />,
    },
    {
      id: 'style' as const,
      label: 'Style',
      icon: <Palette className="h-4 w-4" />,
    },
  ]

  const SelectedNodeSettings = () => {
    if (!selectedNodeId) {
      return (
        <div className="mt-10 flex flex-1 items-center justify-center text-gray-500">
          <div className="text-center">
            <Settings className="mx-auto mb-4 h-12 w-12 text-gray-300" />
            <p className="text-sm">Select an element to edit its properties</p>
          </div>
        </div>
      )
    }

    return <NodeInspector nodeId={selectedNodeId} activeTab={activeTab} />
  }

  return (
    <div
      className={`relative flex h-full flex-col rounded-xl bg-white ${isCollapsed ? 'w-0' : 'w-full'} transition-all duration-200`}
    >
      <div className="absolute -left-6 top-14 z-10">
        <button
          onClick={() => {
            // Clear selected element when collapsing the inspector
            if (!isCollapsed) {
              actions.clearEvents()
            }
            onToggle?.()
          }}
          className="flex h-8 w-6 items-center justify-center rounded-l-md border-b border-l  border-t  bg-white transition-colors hover:bg-gray-50"
          title={isCollapsed ? 'Expand Inspector' : 'Collapse Inspector'}
        >
          {isCollapsed ? (
            <ChevronLeft className="h-3 w-3 text-gray-600" />
          ) : (
            <ChevronRight className="h-3 w-3 text-gray-600" />
          )}
        </button>
      </div>

      {/* Show guide message when collapsed */}
      {isCollapsed && (
        <div className="pointer-events-none absolute -left-48 top-16 z-10 rounded-md bg-gray-800 px-3 py-2 text-xs text-white opacity-0 shadow-lg transition-opacity duration-200 hover:opacity-100">
          Click to expand inspector or select an element to edit its properties
          <div className="absolute right-0 top-1/2 h-0 w-0 -translate-y-1/2 translate-x-full transform border-b-2 border-l-4 border-t-2 border-b-transparent border-l-gray-800 border-t-transparent"></div>
        </div>
      )}

      {/* Tabs and Content - Only show when not collapsed */}
      {!isCollapsed && (
        <>
          {/* Tabs */}
          {selectedNodeId && (
            <div className="flex-shrink-0 border-b border-gray-200">
              <div className="flex">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`m-1 flex flex-1 items-center justify-center rounded-xl px-2 py-3 text-xs font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'border-b-2 border-[#2D1B69] bg-gradient-to-r from-[#2D1B69]/10 to-[#6366F1]/10 text-[#2D1B69]'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    {tab.icon}
                    <span className="ml-1 hidden sm:inline">{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Content */}
          <div className="min-h-0 flex-1 overflow-y-auto">
            <SelectedNodeSettings />
          </div>
        </>
      )}
    </div>
  )
}

const NodeBreadcrumb: React.FC<{ nodeId: string }> = ({ nodeId }) => {
  const { query } = useEditor()

  const getBreadcrumb = (nodeId: string): string[] => {
    const node = query.node(nodeId).get()
    if (!node) return []

    const breadcrumb = [
      node.data.displayName ||
        (typeof node.data.type === 'string'
          ? node.data.type
          : node.data.type.name || 'Component'),
    ]

    if (node.data.parent) {
      return [...getBreadcrumb(node.data.parent), ...breadcrumb]
    }

    return breadcrumb
  }

  const breadcrumb = getBreadcrumb(nodeId)

  return (
    <div className="flex items-center space-x-1 text-xs">
      {breadcrumb.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && <span className="text-gray-400">/</span>}
          <span
            className={
              index === breadcrumb.length - 1 ? 'font-medium' : 'text-gray-500'
            }
          >
            {item}
          </span>
        </React.Fragment>
      ))}
    </div>
  )
}

const NodeInspector: React.FC<{ nodeId: string; activeTab: string }> = ({
  nodeId,
  activeTab,
}) => {
  const { query, actions } = useEditor()
  const node = query.node(nodeId).get()

  if (!node) return null

  const nodeType =
    typeof node.data.type === 'string' ? node.data.type : node.data.type.name
  const props = node.data.props || {}

  const setProp = (callback: (props: any) => void) => {
    actions.setProp(nodeId, callback)
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'content':
        return <ContentPanelWrapper nodeId={nodeId} nodeType={nodeType} />
      case 'style':
        return <StylePanelWrapper nodeId={nodeId} nodeType={nodeType} />
      default:
        return null
    }
  }

  return <div>{renderTabContent()}</div>
}

// Content Panel Wrapper Component
const ContentPanelWrapper: React.FC<{ nodeId: string; nodeType: string }> = ({
  nodeId,
  nodeType,
}) => {
  const { actions, query } = useEditor(state => ({
    node: state.nodes[nodeId],
  }))

  const node = query.node(nodeId).get()
  const props = node.data.props

  const setProp = (callback: (props: any) => void) => {
    actions.setProp(nodeId, callback)
  }

  return <ContentPanel nodeType={nodeType} props={props} setProp={setProp} />
}

// Style Panel Wrapper Component
const StylePanelWrapper: React.FC<{ nodeId: string; nodeType: string }> = ({
  nodeId,
  nodeType,
}) => {
  const { actions, query } = useEditor(state => ({
    node: state.nodes[nodeId],
  }))

  const node = query.node(nodeId).get()
  const props = node.data.props

  const setProp = (callback: (props: any) => void) => {
    actions.setProp(nodeId, callback)
  }

  return <StylePanel nodeType={nodeType} props={props} setProp={setProp} />
}

// Content Panel Component
const ContentPanel: React.FC<{
  nodeType: string
  props: any
  setProp: (callback: (props: any) => void) => void
}> = ({ nodeType, props, setProp }) => {
  const renderContentControls = () => {
    switch (nodeType) {
      case 'TextBlock':
      case 'Text':
        return (
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">
                Text Content
              </label>
              <textarea
                value={props.text || 'Edit this text'}
                onChange={e =>
                  setProp((props: any) => {
                    props.text = e.target.value
                  })
                }
                className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#2D1B69]"
                rows={3}
                placeholder="Enter your text here..."
              />
            </div>
          </div>
        )

      case 'HeadingBlock':
      case 'Heading':
        return (
          <div className="space-y-3 rounded bg-gray-100 p-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">
                Heading Text
              </label>
              <input
                type="text"
                value={props.text || 'Heading Text'}
                onChange={e =>
                  setProp((props: any) => {
                    props.text = e.target.value
                  })
                }
                className="w-full rounded border bg-white px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#2D1B69]"
                placeholder="Enter heading text..."
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">
                Heading Level
              </label>
              <select
                value={props.level || 1}
                onChange={e =>
                  setProp((props: any) => {
                    props.level = parseInt(e.target.value)
                  })
                }
                className="w-full rounded border bg-white px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#2D1B69]"
              >
                <option value={1}>H1</option>
                <option value={2}>H2</option>
                <option value={3}>H3</option>
                <option value={4}>H4</option>
                <option value={5}>H5</option>
                <option value={6}>H6</option>
              </select>
            </div>
          </div>
        )

      case 'ImageBlock':
      case 'Image':
        return (
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">
                Image URL
              </label>
              <input
                type="url"
                value={props.src || ''}
                onChange={e =>
                  setProp((props: any) => {
                    props.src = e.target.value
                  })
                }
                className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#2D1B69]"
                placeholder="https://example.com/image.jpg"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">
                Alt Text
              </label>
              <input
                type="text"
                value={props.alt || ''}
                onChange={e =>
                  setProp((props: any) => {
                    props.alt = e.target.value
                  })
                }
                className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#2D1B69]"
                placeholder="Describe the image..."
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700">
                  Width
                </label>
                <NumberInput
                  value={props.width || 200}
                  onChange={value =>
                    setProp((props: any) => {
                      props.width = value
                    })
                  }
                  min={1}
                  step={1}
                  className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#2D1B69]"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-700">
                  Height
                </label>
                <NumberInput
                  value={props.height || 150}
                  onChange={value =>
                    setProp((props: any) => {
                      props.height = value
                    })
                  }
                  min={1}
                  step={1}
                  className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#2D1B69]"
                />
              </div>
            </div>
          </div>
        )

      case 'ButtonBlock':
      case 'Button':
        return (
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">
                Button Text
              </label>
              <input
                type="text"
                value={props.text || 'Click me'}
                onChange={e =>
                  setProp((props: any) => {
                    props.text = e.target.value
                  })
                }
                className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#2D1B69]"
                placeholder="Enter button text..."
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">
                Link URL
              </label>
              <input
                type="url"
                value={props.href || ''}
                onChange={e =>
                  setProp((props: any) => {
                    props.href = e.target.value
                  })
                }
                className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#2D1B69]"
                placeholder="https://example.com"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">
                Button Type
              </label>
              <select
                value={props.variant || 'primary'}
                onChange={e =>
                  setProp((props: any) => {
                    props.variant = e.target.value
                  })
                }
                className="w-full rounded border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#2D1B69]"
              >
                <option value="primary">Primary</option>
                <option value="secondary">Secondary</option>
                <option value="outline">Outline</option>
                <option value="ghost">Ghost</option>
              </select>
            </div>
          </div>
        )

      default:
        return (
          <div className="p-3 text-center text-gray-500">
            <Type className="mx-auto mb-2 h-6 w-6" />
            <p className="text-xs">
              No content options available for this element
            </p>
          </div>
        )
    }
  }

  return <div className="p-2">{renderContentControls()}</div>
}

// Style Panel Component
const StylePanel: React.FC<{
  nodeType: string
  props: any
  setProp: (callback: (props: any) => void) => void
}> = ({ nodeType, props, setProp }) => {
  // Initialize default values for nested objects
  // Handle cases where margin/padding might be numbers instead of objects
  const margin =
    typeof props.margin === 'object' && props.margin !== null
      ? props.margin
      : { top: 0, right: 0, bottom: 0, left: 0 }
  const padding =
    typeof props.padding === 'object' && props.padding !== null
      ? props.padding
      : { top: 0, right: 0, bottom: 0, left: 0 }
  const border = props.border || { width: 0, style: 'solid', color: '#000000' }

  return (
    <div className="space-y-4 p-2">
      {/* Typography (for text elements) */}
      {(nodeType === 'TextBlock' ||
        nodeType === 'Text' ||
        nodeType === 'HeadingBlock' ||
        nodeType === 'Heading' ||
        nodeType === 'ButtonBlock' ||
        nodeType === 'Button') && (
        <div className="space-y-3 rounded-md bg-gray-100 p-3">
          <h4 className="mb-2 text-xs font-medium text-gray-800">Typography</h4>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="mb-1 block text-[10px] text-gray-600">
                Font Size
              </label>
              <NumberInput
                value={props.fontSize || 16}
                onChange={value =>
                  setProp((props: any) => {
                    props.fontSize = value
                  })
                }
                min={8}
                max={72}
                step={1}
                className="w-full rounded border border-gray-300 px-2 py-1 text-xs"
              />
            </div>

            <div>
              <label className="mb-1 block text-[10px] text-gray-600">
                Font Weight
              </label>
              <select
                value={props.fontWeight || 'normal'}
                onChange={e =>
                  setProp((props: any) => {
                    props.fontWeight = e.target.value
                  })
                }
                className="w-full rounded border border-gray-300 px-2 py-1 text-xs"
              >
                <option value="normal">Normal</option>
                <option value="bold">Bold</option>
                <option value="100">100</option>
                <option value="200">200</option>
                <option value="300">300</option>
                <option value="400">400</option>
                <option value="500">500</option>
                <option value="600">600</option>
                <option value="700">700</option>
                <option value="800">800</option>
                <option value="900">900</option>
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-[10px] text-gray-600">
              Text Color
            </label>
            <input
              type="color"
              value={props.color || '#000000'}
              onChange={e =>
                setProp((props: any) => {
                  props.color = e.target.value
                })
              }
              className="h-6 w-full rounded border border-gray-300"
            />
          </div>

          <div>
            <label className="mb-1 block text-[10px] text-gray-600">
              Text Align
            </label>
            <select
              value={props.textAlign || 'left'}
              onChange={e =>
                setProp((props: any) => {
                  props.textAlign = e.target.value
                })
              }
              className="w-full rounded border border-gray-300 px-2 py-1 text-xs"
            >
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
              <option value="justify">Justify</option>
            </select>
          </div>
        </div>
      )}

      {/* Base Styles */}
      <div className="space-y-3 rounded-md bg-gray-100 p-3">
        <h4 className="mb-2 text-xs font-medium text-gray-800">
          Dimensions & Position
        </h4>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="mb-1 block text-[10px] text-gray-600">
              Width
            </label>
            <input
              type="text"
              value={props.width || 'auto'}
              onChange={e =>
                setProp((props: any) => {
                  props.width = e.target.value
                })
              }
              className="w-full rounded border border-gray-300 px-2 py-1 text-xs"
              placeholder="auto, 100px, 50%"
            />
          </div>

          <div>
            <label className="mb-1 block text-[10px] text-gray-600">
              Height
            </label>
            <input
              type="text"
              value={props.height || 'auto'}
              onChange={e =>
                setProp((props: any) => {
                  props.height = e.target.value
                })
              }
              className="w-full rounded border border-gray-300 px-2 py-1 text-xs"
              placeholder="auto, 100px, 50%"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="mb-1 block text-[10px] text-gray-600">
              Min Width
            </label>
            <input
              type="text"
              value={props.minWidth || ''}
              onChange={e =>
                setProp((props: any) => {
                  props.minWidth = e.target.value
                })
              }
              className="w-full rounded border border-gray-300 px-2 py-1 text-xs"
              placeholder="0, 100px, 50%"
            />
          </div>

          <div>
            <label className="mb-1 block text-[10px] text-gray-600">
              Min Height
            </label>
            <input
              type="text"
              value={props.minHeight || ''}
              onChange={e =>
                setProp((props: any) => {
                  props.minHeight = e.target.value
                })
              }
              className="w-full rounded border border-gray-300 px-2 py-1 text-xs"
              placeholder="0, 100px, 50%"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="mb-1 block text-[10px] text-gray-600">
              Max Width
            </label>
            <input
              type="text"
              value={props.maxWidth || ''}
              onChange={e =>
                setProp((props: any) => {
                  props.maxWidth = e.target.value
                })
              }
              className="w-full rounded border border-gray-300 px-2 py-1 text-xs"
              placeholder="none, 100px, 50%"
            />
          </div>

          <div>
            <label className="mb-1 block text-[10px] text-gray-600">
              Max Height
            </label>
            <input
              type="text"
              value={props.maxHeight || ''}
              onChange={e =>
                setProp((props: any) => {
                  props.maxHeight = e.target.value
                })
              }
              className="w-full rounded border border-gray-300 px-2 py-1 text-xs"
              placeholder="none, 100px, 50%"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-[10px] text-gray-600">
            Display
          </label>
          <select
            value={props.display || 'block'}
            onChange={e =>
              setProp((props: any) => {
                props.display = e.target.value
              })
            }
            className="w-full rounded border border-gray-300 px-2 py-1 text-xs"
          >
            <option value="block">Block</option>
            <option value="inline">Inline</option>
            <option value="inline-block">Inline Block</option>
            <option value="flex">Flex</option>
            <option value="inline-flex">Inline Flex</option>
            <option value="grid">Grid</option>
            <option value="inline-grid">Inline Grid</option>
            <option value="none">None</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-[10px] text-gray-600">
            Position
          </label>
          <select
            value={props.position || 'static'}
            onChange={e =>
              setProp((props: any) => {
                props.position = e.target.value
              })
            }
            className="w-full rounded border border-gray-300 px-2 py-1 text-xs"
          >
            <option value="static">Static</option>
            <option value="relative">Relative</option>
            <option value="absolute">Absolute</option>
            <option value="fixed">Fixed</option>
            <option value="sticky">Sticky</option>
          </select>
        </div>

        {(props.position === 'absolute' ||
          props.position === 'fixed' ||
          props.position === 'relative' ||
          props.position === 'sticky') && (
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="mb-1 block text-[10px] text-gray-600">
                Top
              </label>
              <input
                type="text"
                value={props.top || ''}
                onChange={e =>
                  setProp((props: any) => {
                    props.top = e.target.value
                  })
                }
                className="w-full rounded border border-gray-300 px-2 py-1 text-xs"
                placeholder="auto, 10px, 50%"
              />
            </div>

            <div>
              <label className="mb-1 block text-[10px] text-gray-600">
                Right
              </label>
              <input
                type="text"
                value={props.right || ''}
                onChange={e =>
                  setProp((props: any) => {
                    props.right = e.target.value
                  })
                }
                className="w-full rounded border border-gray-300 px-2 py-1 text-xs"
                placeholder="auto, 10px, 50%"
              />
            </div>

            <div>
              <label className="mb-1 block text-[10px] text-gray-600">
                Bottom
              </label>
              <input
                type="text"
                value={props.bottom || ''}
                onChange={e =>
                  setProp((props: any) => {
                    props.bottom = e.target.value
                  })
                }
                className="w-full rounded border border-gray-300 px-2 py-1 text-xs"
                placeholder="auto, 10px, 50%"
              />
            </div>

            <div>
              <label className="mb-1 block text-[10px] text-gray-600">
                Left
              </label>
              <input
                type="text"
                value={props.left || ''}
                onChange={e =>
                  setProp((props: any) => {
                    props.left = e.target.value
                  })
                }
                className="w-full rounded border border-gray-300 px-2 py-1 text-xs"
                placeholder="auto, 10px, 50%"
              />
            </div>
          </div>
        )}

        <div>
          <label className="mb-1 block text-[10px] text-gray-600">
            Z-Index
          </label>
          <NumberInput
            value={props.zIndex || 0}
            onChange={value =>
              setProp((props: any) => {
                props.zIndex = value
              })
            }
            step={1}
            className="w-full rounded border border-gray-300 px-2 py-1 text-xs"
            placeholder="0"
          />
        </div>

        <div>
          <label className="mb-1 block text-[10px] text-gray-600">
            Overflow
          </label>
          <select
            value={props.overflow || 'visible'}
            onChange={e =>
              setProp((props: any) => {
                props.overflow = e.target.value
              })
            }
            className="w-full rounded border border-gray-300 px-2 py-1 text-xs"
          >
            <option value="visible">Visible</option>
            <option value="hidden">Hidden</option>
            <option value="scroll">Scroll</option>
            <option value="auto">Auto</option>
          </select>
        </div>
      </div>

      {/* Background & Border */}
      <div className="space-y-3 rounded-md bg-gray-100 p-3">
        <h4 className="mb-2 text-xs font-medium text-gray-800">
          Background & Border
        </h4>

        <div>
          <label className="mb-1 block text-[10px] text-gray-600">
            Background Color
          </label>
          <input
            type="color"
            value={props.backgroundColor || '#ffffff'}
            onChange={e =>
              setProp((props: any) => {
                props.backgroundColor = e.target.value
              })
            }
            className="h-6 w-full rounded border border-gray-300"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="mb-1 block text-[10px] text-gray-600">
              Border Width
            </label>
            <NumberInput
              value={border.width}
              onChange={value =>
                setProp((props: any) => {
                  if (!props.border)
                    props.border = {
                      width: 0,
                      style: 'solid',
                      color: '#000000',
                    }
                  props.border.width = value
                })
              }
              min={0}
              step={1}
              className="w-full rounded border border-gray-300 px-2 py-1 text-xs"
            />
          </div>

          <div>
            <label className="mb-1 block text-[10px] text-gray-600">
              Border Radius
            </label>
            <NumberInput
              value={props.borderRadius || 0}
              onChange={value =>
                setProp((props: any) => {
                  props.borderRadius = value
                })
              }
              min={0}
              step={1}
              className="w-full rounded border border-gray-300 px-2 py-1 text-xs"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-[10px] text-gray-600">
            Border Color
          </label>
          <input
            type="color"
            value={border.color}
            onChange={e =>
              setProp((props: any) => {
                if (!props.border)
                  props.border = { width: 0, style: 'solid', color: '#000000' }
                props.border.color = e.target.value
              })
            }
            className="h-6 w-full rounded border border-gray-300"
          />
        </div>

        <div>
          <label className="mb-1 block text-[10px] text-gray-600">
            Border Style
          </label>
          <select
            value={border.style}
            onChange={e =>
              setProp((props: any) => {
                if (!props.border)
                  props.border = { width: 0, style: 'solid', color: '#000000' }
                props.border.style = e.target.value
              })
            }
            className="w-full rounded border border-gray-300 px-2 py-1 text-xs"
          >
            <option value="solid">Solid</option>
            <option value="dashed">Dashed</option>
            <option value="dotted">Dotted</option>
            <option value="none">None</option>
          </select>
        </div>
      </div>

      {/* Spacing */}
      <div className="space-y-4 rounded-md bg-gray-100 p-3">
        <h4 className="pb-2 text-xs font-medium text-gray-800">Spacing</h4>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-[10px] text-gray-600">
              Margin
            </label>
            <div className="grid grid-cols-2 gap-1">
              <NumberInput
                value={margin.top}
                onChange={value =>
                  setProp((props: any) => {
                    if (!props.margin || typeof props.margin !== 'object')
                      props.margin = { top: 0, right: 0, bottom: 0, left: 0 }
                    props.margin.top = value
                  })
                }
                step={1}
                placeholder="Top"
                className="rounded border border-gray-300 px-1 py-1 text-xs"
              />
              <NumberInput
                value={margin.right}
                onChange={value =>
                  setProp((props: any) => {
                    if (!props.margin || typeof props.margin !== 'object')
                      props.margin = { top: 0, right: 0, bottom: 0, left: 0 }
                    props.margin.right = value
                  })
                }
                step={1}
                placeholder="Right"
                className="rounded border border-gray-300 px-1 py-1 text-xs"
              />
              <NumberInput
                value={margin.bottom}
                onChange={value =>
                  setProp((props: any) => {
                    if (!props.margin || typeof props.margin !== 'object')
                      props.margin = { top: 0, right: 0, bottom: 0, left: 0 }
                    props.margin.bottom = value
                  })
                }
                step={1}
                placeholder="Bottom"
                className="rounded border border-gray-300 px-1 py-1 text-xs"
              />
              <NumberInput
                value={margin.left}
                onChange={value =>
                  setProp((props: any) => {
                    if (!props.margin || typeof props.margin !== 'object')
                      props.margin = { top: 0, right: 0, bottom: 0, left: 0 }
                    props.margin.left = value
                  })
                }
                step={1}
                placeholder="Left"
                className="rounded border border-gray-300 px-1 py-1 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-[10px] text-gray-600">
              Padding
            </label>
            <div className="grid grid-cols-2 gap-1">
              <NumberInput
                value={padding.top}
                onChange={value =>
                  setProp((props: any) => {
                    if (!props.padding || typeof props.padding !== 'object')
                      props.padding = { top: 0, right: 0, bottom: 0, left: 0 }
                    props.padding.top = value
                  })
                }
                step={1}
                placeholder="Top"
                className="rounded border border-gray-300 px-1 py-1 text-xs"
              />
              <NumberInput
                value={padding.right}
                onChange={value =>
                  setProp((props: any) => {
                    if (!props.padding || typeof props.padding !== 'object')
                      props.padding = { top: 0, right: 0, bottom: 0, left: 0 }
                    props.padding.right = value
                  })
                }
                step={1}
                placeholder="Right"
                className="rounded border border-gray-300 px-1 py-1 text-xs"
              />
              <NumberInput
                value={padding.bottom}
                onChange={value =>
                  setProp((props: any) => {
                    if (!props.padding || typeof props.padding !== 'object')
                      props.padding = { top: 0, right: 0, bottom: 0, left: 0 }
                    props.padding.bottom = value
                  })
                }
                step={1}
                placeholder="Bottom"
                className="rounded border border-gray-300 px-1 py-1 text-xs"
              />
              <NumberInput
                value={padding.left}
                onChange={value =>
                  setProp((props: any) => {
                    if (!props.padding || typeof props.padding !== 'object')
                      props.padding = { top: 0, right: 0, bottom: 0, left: 0 }
                    props.padding.left = value
                  })
                }
                step={1}
                placeholder="Left"
                className="rounded border border-gray-300 px-1 py-1 text-xs"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Flexbox Layout Controls */}
      {(props.display === 'flex' || props.display === 'inline-flex') && (
        <div className="space-y-3 rounded-md bg-gray-100 p-3">
          <h4 className="pb-1 text-xs font-medium text-gray-800">
            Flexbox Layout
          </h4>

          {/* Quick Layout Presets */}
          <div>
            <label className="mb-1 block text-[10px] text-gray-600">
              Quick Layouts
            </label>
            <div className="grid grid-cols-2 gap-1">
              <button
                onClick={() =>
                  setProp((props: any) => {
                    props.flexDirection = 'row'
                    props.justifyContent = 'flex-start'
                    props.alignItems = 'stretch'
                  })
                }
                className="rounded border border-gray-300 px-2 py-1 text-xs hover:bg-gray-50"
              >
                Horizontal Row
              </button>
              <button
                onClick={() =>
                  setProp((props: any) => {
                    props.flexDirection = 'column'
                    props.justifyContent = 'flex-start'
                    props.alignItems = 'stretch'
                  })
                }
                className="rounded border border-gray-300 px-2 py-1 text-xs hover:bg-gray-50"
              >
                Vertical Column
              </button>
              <button
                onClick={() =>
                  setProp((props: any) => {
                    props.flexDirection = 'row'
                    props.justifyContent = 'center'
                    props.alignItems = 'center'
                  })
                }
                className="rounded border border-gray-300 px-2 py-1 text-xs hover:bg-gray-50"
              >
                Center Both
              </button>
              <button
                onClick={() =>
                  setProp((props: any) => {
                    props.flexDirection = 'row'
                    props.justifyContent = 'space-between'
                    props.alignItems = 'center'
                  })
                }
                className="rounded border border-gray-300 px-2 py-1 text-xs hover:bg-gray-50"
              >
                Space Between
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="mb-1 block text-[10px] text-gray-600">
                Direction
              </label>
              <select
                value={props.flexDirection || 'row'}
                onChange={e =>
                  setProp((props: any) => {
                    props.flexDirection = e.target.value
                  })
                }
                className="w-full rounded border border-gray-300 px-2 py-1 text-xs"
              >
                <option value="row">Row</option>
                <option value="row-reverse">Row Reverse</option>
                <option value="column">Column</option>
                <option value="column-reverse">Column Reverse</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-[10px] text-gray-600">
                Wrap
              </label>
              <select
                value={props.flexWrap || 'nowrap'}
                onChange={e =>
                  setProp((props: any) => {
                    props.flexWrap = e.target.value
                  })
                }
                className="w-full rounded border border-gray-300 px-2 py-1 text-xs"
              >
                <option value="nowrap">No Wrap</option>
                <option value="wrap">Wrap</option>
                <option value="wrap-reverse">Wrap Reverse</option>
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-[10px] text-gray-600">
              Justify Content
            </label>
            <select
              value={props.justifyContent || 'flex-start'}
              onChange={e =>
                setProp((props: any) => {
                  props.justifyContent = e.target.value
                })
              }
              className="w-full rounded border border-gray-300 px-2 py-1 text-xs"
            >
              <option value="flex-start">Flex Start</option>
              <option value="flex-end">Flex End</option>
              <option value="center">Center</option>
              <option value="space-between">Space Between</option>
              <option value="space-around">Space Around</option>
              <option value="space-evenly">Space Evenly</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-[10px] text-gray-600">
              Align Items
            </label>
            <select
              value={props.alignItems || 'stretch'}
              onChange={e =>
                setProp((props: any) => {
                  props.alignItems = e.target.value
                })
              }
              className="w-full rounded border border-gray-300 px-2 py-1 text-xs"
            >
              <option value="stretch">Stretch</option>
              <option value="flex-start">Flex Start</option>
              <option value="flex-end">Flex End</option>
              <option value="center">Center</option>
              <option value="baseline">Baseline</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-[10px] text-gray-600">
              Align Content
            </label>
            <select
              value={props.alignContent || 'stretch'}
              onChange={e =>
                setProp((props: any) => {
                  props.alignContent = e.target.value
                })
              }
              className="w-full rounded border border-gray-300 px-2 py-1 text-xs"
            >
              <option value="stretch">Stretch</option>
              <option value="flex-start">Flex Start</option>
              <option value="flex-end">Flex End</option>
              <option value="center">Center</option>
              <option value="space-between">Space Between</option>
              <option value="space-around">Space Around</option>
            </select>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="mb-1 block text-[10px] text-gray-600">
                Gap
              </label>
              <input
                type="text"
                value={props.gap || ''}
                onChange={e =>
                  setProp((props: any) => {
                    props.gap = e.target.value
                  })
                }
                className="w-full rounded border border-gray-300 px-2 py-1 text-xs"
                placeholder="0, 10px, 1rem"
              />
            </div>

            <div>
              <label className="mb-1 block text-[10px] text-gray-600">
                Row Gap
              </label>
              <input
                type="text"
                value={props.rowGap || ''}
                onChange={e =>
                  setProp((props: any) => {
                    props.rowGap = e.target.value
                  })
                }
                className="w-full rounded border border-gray-300 px-2 py-1 text-xs"
                placeholder="0, 10px, 1rem"
              />
            </div>

            <div>
              <label className="mb-1 block text-[10px] text-gray-600">
                Column Gap
              </label>
              <input
                type="text"
                value={props.columnGap || ''}
                onChange={e =>
                  setProp((props: any) => {
                    props.columnGap = e.target.value
                  })
                }
                className="w-full rounded border border-gray-300 px-2 py-1 text-xs"
                placeholder="0, 10px, 1rem"
              />
            </div>
          </div>

          {/* Flex Item Properties */}
          <div className="border-t border-gray-100 pt-2">
            <h5 className="mb-2 text-[10px] font-medium text-gray-700">
              Flex Item Properties
            </h5>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="mb-1 block text-[10px] text-gray-600">
                  Flex Grow
                </label>
                <NumberInput
                  value={props.flexGrow || 0}
                  onChange={value =>
                    setProp((props: any) => {
                      props.flexGrow = value
                    })
                  }
                  min={0}
                  step={1}
                  className="w-full rounded border border-gray-300 px-2 py-1 text-xs"
                />
              </div>

              <div>
                <label className="mb-1 block text-[10px] text-gray-600">
                  Flex Shrink
                </label>
                <NumberInput
                  value={props.flexShrink || 1}
                  onChange={value =>
                    setProp((props: any) => {
                      props.flexShrink = value
                    })
                  }
                  min={0}
                  step={1}
                  className="w-full rounded border border-gray-300 px-2 py-1 text-xs"
                />
              </div>

              <div>
                <label className="mb-1 block text-[10px] text-gray-600">
                  Flex Basis
                </label>
                <input
                  type="text"
                  value={props.flexBasis || 'auto'}
                  onChange={e =>
                    setProp((props: any) => {
                      props.flexBasis = e.target.value
                    })
                  }
                  className="w-full rounded border border-gray-300 px-2 py-1 text-xs"
                  placeholder="auto, 100px, 50%"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 mt-2 block text-[10px] text-gray-600">
                Align Self
              </label>
              <select
                value={props.alignSelf || 'auto'}
                onChange={e =>
                  setProp((props: any) => {
                    props.alignSelf = e.target.value
                  })
                }
                className="w-full rounded border border-gray-300 px-2 py-1 text-xs"
              >
                <option value="auto">Auto</option>
                <option value="flex-start">Flex Start</option>
                <option value="flex-end">Flex End</option>
                <option value="center">Center</option>
                <option value="baseline">Baseline</option>
                <option value="stretch">Stretch</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Grid Layout Controls */}
      {(props.display === 'grid' || props.display === 'inline-grid') && (
        <div className="space-y-3 rounded-md bg-gray-100 p-3">
          <h4 className="pb-1 text-xs font-medium text-gray-800">
            Grid Layout
          </h4>

          {/* Quick Grid Presets */}
          <div>
            <label className="mb-1 block text-[10px] text-gray-600">
              Quick Grid Layouts
            </label>
            <div className="grid grid-cols-2 gap-1">
              <button
                onClick={() =>
                  setProp((props: any) => {
                    props.gridTemplateColumns = '1fr 1fr'
                    props.gridTemplateRows = 'auto'
                    props.gap = '1rem'
                  })
                }
                className="rounded border border-gray-300 px-2 py-1 text-xs hover:bg-gray-50"
              >
                2 Columns
              </button>
              <button
                onClick={() =>
                  setProp((props: any) => {
                    props.gridTemplateColumns = '1fr 1fr 1fr'
                    props.gridTemplateRows = 'auto'
                    props.gap = '1rem'
                  })
                }
                className="rounded border border-gray-300 px-2 py-1 text-xs hover:bg-gray-50"
              >
                3 Columns
              </button>
              <button
                onClick={() =>
                  setProp((props: any) => {
                    props.gridTemplateColumns = '1fr 1fr 1fr 1fr'
                    props.gridTemplateRows = 'auto'
                    props.gap = '1rem'
                  })
                }
                className="rounded border border-gray-300 px-2 py-1 text-xs hover:bg-gray-50"
              >
                4 Columns
              </button>
              <button
                onClick={() =>
                  setProp((props: any) => {
                    props.gridTemplateColumns = '200px 1fr'
                    props.gridTemplateRows = 'auto'
                    props.gap = '1rem'
                  })
                }
                className="rounded border border-gray-300 px-2 py-1 text-xs hover:bg-gray-50"
              >
                Sidebar + Main
              </button>
              <button
                onClick={() =>
                  setProp((props: any) => {
                    props.gridTemplateColumns = '1fr'
                    props.gridTemplateRows = 'auto auto auto'
                    props.gap = '1rem'
                  })
                }
                className="rounded border border-gray-300 px-2 py-1 text-xs hover:bg-gray-50"
              >
                3 Rows
              </button>
              <button
                onClick={() =>
                  setProp((props: any) => {
                    props.gridTemplateColumns =
                      'repeat(auto-fit, minmax(250px, 1fr))'
                    props.gridTemplateRows = 'auto'
                    props.gap = '1rem'
                  })
                }
                className="rounded border border-gray-300 px-2 py-1 text-xs hover:bg-gray-50"
              >
                Responsive Cards
              </button>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-[10px] text-gray-600">
              Grid Template Columns
            </label>
            <input
              type="text"
              value={props.gridTemplateColumns || ''}
              onChange={e =>
                setProp((props: any) => {
                  props.gridTemplateColumns = e.target.value
                })
              }
              className="w-full rounded border border-gray-300 px-2 py-1 text-xs"
              placeholder="1fr 1fr, repeat(3, 1fr), 200px auto 1fr"
            />
          </div>

          <div>
            <label className="mb-1 block text-[10px] text-gray-600">
              Grid Template Rows
            </label>
            <input
              type="text"
              value={props.gridTemplateRows || ''}
              onChange={e =>
                setProp((props: any) => {
                  props.gridTemplateRows = e.target.value
                })
              }
              className="w-full rounded border border-gray-300 px-2 py-1 text-xs"
              placeholder="auto, 100px 200px, repeat(2, 1fr)"
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="mb-1 block text-[10px] text-gray-600">
                Gap
              </label>
              <input
                type="text"
                value={props.gap || ''}
                onChange={e =>
                  setProp((props: any) => {
                    props.gap = e.target.value
                  })
                }
                className="w-full rounded border border-gray-300 px-2 py-1 text-xs"
                placeholder="10px, 1rem"
              />
            </div>

            <div>
              <label className="mb-1 block text-[10px] text-gray-600">
                Row Gap
              </label>
              <input
                type="text"
                value={props.rowGap || ''}
                onChange={e =>
                  setProp((props: any) => {
                    props.rowGap = e.target.value
                  })
                }
                className="w-full rounded border border-gray-300 px-2 py-1 text-xs"
                placeholder="10px, 1rem"
              />
            </div>

            <div>
              <label className="mb-1 block text-[10px] text-gray-600">
                Column Gap
              </label>
              <input
                type="text"
                value={props.columnGap || ''}
                onChange={e =>
                  setProp((props: any) => {
                    props.columnGap = e.target.value
                  })
                }
                className="w-full rounded border border-gray-300 px-2 py-1 text-xs"
                placeholder="10px, 1rem"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="mb-1 block text-[10px] text-gray-600">
                Justify Items
              </label>
              <select
                value={props.justifyItems || 'stretch'}
                onChange={e =>
                  setProp((props: any) => {
                    props.justifyItems = e.target.value
                  })
                }
                className="w-full rounded border border-gray-300 px-2 py-1 text-xs"
              >
                <option value="stretch">Stretch</option>
                <option value="start">Start</option>
                <option value="end">End</option>
                <option value="center">Center</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-[10px] text-gray-600">
                Align Items
              </label>
              <select
                value={props.alignItems || 'stretch'}
                onChange={e =>
                  setProp((props: any) => {
                    props.alignItems = e.target.value
                  })
                }
                className="w-full rounded border border-gray-300 px-2 py-1 text-xs"
              >
                <option value="stretch">Stretch</option>
                <option value="start">Start</option>
                <option value="end">End</option>
                <option value="center">Center</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="mb-1 block text-[10px] text-gray-600">
                Justify Content
              </label>
              <select
                value={props.justifyContent || 'stretch'}
                onChange={e =>
                  setProp((props: any) => {
                    props.justifyContent = e.target.value
                  })
                }
                className="w-full rounded border border-gray-300 px-2 py-1 text-xs"
              >
                <option value="stretch">Stretch</option>
                <option value="start">Start</option>
                <option value="end">End</option>
                <option value="center">Center</option>
                <option value="space-between">Space Between</option>
                <option value="space-around">Space Around</option>
                <option value="space-evenly">Space Evenly</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-[10px] text-gray-600">
                Align Content
              </label>
              <select
                value={props.alignContent || 'stretch'}
                onChange={e =>
                  setProp((props: any) => {
                    props.alignContent = e.target.value
                  })
                }
                className="w-full rounded border border-gray-300 px-2 py-1 text-xs"
              >
                <option value="stretch">Stretch</option>
                <option value="start">Start</option>
                <option value="end">End</option>
                <option value="center">Center</option>
                <option value="space-between">Space Between</option>
                <option value="space-around">Space Around</option>
                <option value="space-evenly">Space Evenly</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const NodeQuickActions: React.FC<{ nodeId: string }> = ({ nodeId }) => {
  const { actions, query } = useEditor()
  const node = query.node(nodeId).get()

  if (!node) return null

  const handleDelete = () => {
    actions.delete(nodeId)
  }

  const handleDuplicate = () => {
    const parentId = node.data.parent
    if (parentId) {
      const clonedNode = query.node(nodeId).toSerializedNode()
      actions.add(clonedNode as any, parentId)
    }
  }

  const handleMoveUp = () => {
    const parentId = node.data.parent
    if (parentId) {
      const parent = query.node(parentId).get()
      const siblings = parent.data.nodes || []
      const currentIndex = siblings.indexOf(nodeId)

      if (currentIndex > 0) {
        const newSiblings = [...siblings]
        ;[newSiblings[currentIndex], newSiblings[currentIndex - 1]] = [
          newSiblings[currentIndex - 1],
          newSiblings[currentIndex],
        ]

        actions.setProp(parentId, (props: any) => {
          props.nodes = newSiblings
        })
      }
    }
  }

  const handleMoveDown = () => {
    const parentId = node.data.parent
    if (parentId) {
      const parent = query.node(parentId).get()
      const siblings = parent.data.nodes || []
      const currentIndex = siblings.indexOf(nodeId)

      if (currentIndex < siblings.length - 1) {
        const newSiblings = [...siblings]
        ;[newSiblings[currentIndex], newSiblings[currentIndex + 1]] = [
          newSiblings[currentIndex + 1],
          newSiblings[currentIndex],
        ]

        actions.setProp(parentId, (props: any) => {
          props.nodes = newSiblings
        })
      }
    }
  }

  return (
    <div className="space-y-3">
      <div className="mb-2 text-sm font-medium text-gray-900">
        Quick Actions
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={handleDuplicate}
          className="flex items-center justify-center rounded-md bg-gray-100 px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-200"
        >
          <Settings className="mr-1 h-4 w-4" />
          Duplicate
        </button>

        <button
          onClick={handleDelete}
          className="flex items-center justify-center rounded-md bg-red-100 px-3 py-2 text-sm text-red-700 transition-colors hover:bg-red-200"
        >
          <Trash2 className="mr-1 h-4 w-4" />
          Delete
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={handleMoveUp}
          className="flex items-center justify-center rounded-md bg-gray-100 px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-200"
        >
          ↑ Move Up
        </button>

        <button
          onClick={handleMoveDown}
          className="flex items-center justify-center rounded-md bg-gray-100 px-3 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-200"
        >
          ↓ Move Down
        </button>
      </div>

      <div className="border-t border-gray-200 pt-2">
        <div className="text-xs text-gray-500">
          Node ID: {nodeId.slice(0, 8)}...
        </div>
      </div>
    </div>
  )
}
