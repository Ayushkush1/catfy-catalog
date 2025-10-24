'use client'

import React from 'react'
import { useNode, Element } from '@craftjs/core'

export interface ContainerBlockProps {
  flexDirection: 'row' | 'column' | 'row-reverse' | 'column-reverse'
  justifyContent:
    | 'flex-start'
    | 'flex-end'
    | 'center'
    | 'space-between'
    | 'space-around'
    | 'space-evenly'
  alignItems: 'flex-start' | 'flex-end' | 'center' | 'stretch' | 'baseline'
  flexWrap: 'nowrap' | 'wrap' | 'wrap-reverse'
  gap: number
  width: string | number
  height: string | number
  minHeight: number
  maxWidth: string | number
  padding: {
    top: number
    right: number
    bottom: number
    left: number
  }
  margin: {
    top: number
    right: number
    bottom: number
    left: number
  }
  backgroundColor: string
  backgroundImage: string
  backgroundSize: 'auto' | 'cover' | 'contain'
  backgroundPosition: string
  backgroundRepeat: 'repeat' | 'no-repeat' | 'repeat-x' | 'repeat-y'
  border: {
    width: number
    style: 'solid' | 'dashed' | 'dotted' | 'none'
    color: string
  }
  borderRadius: number
  shadow: {
    enabled: boolean
    x: number
    y: number
    blur: number
    spread: number
    color: string
  }
  overflow: 'visible' | 'hidden' | 'scroll' | 'auto'
  position: 'static' | 'relative' | 'absolute' | 'fixed' | 'sticky'
  zIndex: number
  opacity: number
  transform: {
    rotate: number
    scaleX: number
    scaleY: number
    translateX: number
    translateY: number
  }
  responsive: {
    desktop: Partial<ContainerBlockProps>
    tablet: Partial<ContainerBlockProps>
    mobile: Partial<ContainerBlockProps>
  }
}

const defaultProps: ContainerBlockProps = {
  flexDirection: 'column',
  justifyContent: 'flex-start',
  alignItems: 'stretch',
  flexWrap: 'nowrap',
  gap: 16,
  width: '100%',
  height: 'auto',
  minHeight: 100,
  maxWidth: 'none',
  padding: { top: 20, right: 20, bottom: 20, left: 20 },
  margin: { top: 0, right: 0, bottom: 0, left: 0 },
  backgroundColor: 'transparent',
  backgroundImage: '',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
  border: { width: 0, style: 'solid', color: '#e5e7eb' },
  borderRadius: 0,
  shadow: { enabled: false, x: 0, y: 0, blur: 0, spread: 0, color: '#000000' },
  overflow: 'visible',
  position: 'static',
  zIndex: 0,
  opacity: 1,
  transform: { rotate: 0, scaleX: 1, scaleY: 1, translateX: 0, translateY: 0 },
  responsive: { desktop: {}, tablet: {}, mobile: {} },
}

export const ContainerBlock: React.FC<
  Partial<ContainerBlockProps> & { children?: React.ReactNode }
> = props => {
  const {
    connectors: { connect, drag },
    selected,
    isHover,
    hasChildren,
    childNodes,
  } = useNode(state => ({
    selected: state.events.selected,
    isHover: state.events.hovered,
    hasChildren: Object.keys(state.data.nodes).length > 0,
    childNodes: state.data.nodes,
  }))

  // Debug logging (only when there are children)
  if (hasChildren || Object.keys(childNodes).length > 0) {
    console.log('🏗️ ContainerBlock render:', {
      hasChildren,
      childNodesCount: Object.keys(childNodes).length,
      childNodeIds: Object.keys(childNodes),
    })
  }

  const finalProps = { ...defaultProps, ...props }

  const {
    flexDirection,
    justifyContent,
    alignItems,
    flexWrap,
    gap,
    width,
    height,
    minHeight,
    maxWidth,
    padding,
    margin,
    backgroundColor,
    backgroundImage,
    backgroundSize,
    backgroundPosition,
    backgroundRepeat,
    border,
    borderRadius,
    shadow,
    overflow,
    position,
    zIndex,
    opacity,
    transform,
    children,
  } = finalProps

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection,
    justifyContent,
    alignItems,
    flexWrap,
    gap: `${gap}px`,
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
    minHeight: `${minHeight}px`,
    maxWidth: typeof maxWidth === 'number' ? `${maxWidth}px` : maxWidth,
    padding: `${padding.top}px ${padding.right}px ${padding.bottom}px ${padding.left}px`,
    margin: `${margin.top}px ${margin.right}px ${margin.bottom}px ${margin.left}px`,
    backgroundColor,
    backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'none',
    backgroundSize,
    backgroundPosition,
    backgroundRepeat,
    border:
      border.width > 0
        ? `${border.width}px ${border.style} ${border.color}`
        : 'none',
    borderRadius: `${borderRadius}px`,
    boxShadow: shadow.enabled
      ? `${shadow.x}px ${shadow.y}px ${shadow.blur}px ${shadow.spread}px ${shadow.color}`
      : 'none',
    overflow,
    position,
    zIndex,
    opacity,
    transform: `
      rotate(${transform.rotate}deg)
      scaleX(${transform.scaleX})
      scaleY(${transform.scaleY})
      translateX(${transform.translateX}px)
      translateY(${transform.translateY}px)
    `.trim(),
    transition: 'all 0.2s ease-in-out',
    cursor: 'default',
  }

  // Add selection and hover styles
  if (selected) {
    containerStyle.outline = '2px solid #3b82f6'
    containerStyle.outlineOffset = '2px'
  } else if (isHover) {
    containerStyle.outline = '2px dashed #3b82f6'
    containerStyle.outlineOffset = '2px'
  }

  return (
    <div
      ref={ref => {
        if (ref) {
          connect(drag(ref))
        }
      }}
      className="container-block"
      style={containerStyle}
    >
      {hasChildren ? (
        children
      ) : (
        <div
          style={{
            padding: '40px 20px',
            textAlign: 'center',
            color: '#6b7280',
            fontSize: '16px',
            border: '3px dashed #d1d5db',
            borderRadius: '8px',
            minHeight: '120px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f9fafb',
            transition: 'all 0.2s ease',
          }}
        >
          <div>
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>📦</div>
            <div style={{ fontWeight: '500', marginBottom: '4px' }}>
              Drop components here
            </div>
            <div style={{ fontSize: '14px', color: '#9ca3af' }}>
              Drag blocks from the toolbox to start building
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Settings component for the ContainerBlock
export const ContainerBlockSettings: React.FC = () => {
  const {
    actions: { setProp },
    props,
  } = useNode(node => ({
    props: node.data.props as ContainerBlockProps,
  }))

  return (
    <div className="space-y-4">
      {/* Layout */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-900">Layout</h4>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs text-gray-600">
              Direction
            </label>
            <select
              value={props.flexDirection}
              onChange={e =>
                setProp((props: ContainerBlockProps) => {
                  props.flexDirection = e.target.value as any
                })
              }
              className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
            >
              <option value="row">Row</option>
              <option value="column">Column</option>
              <option value="row-reverse">Row Reverse</option>
              <option value="column-reverse">Column Reverse</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs text-gray-600">Wrap</label>
            <select
              value={props.flexWrap}
              onChange={e =>
                setProp((props: ContainerBlockProps) => {
                  props.flexWrap = e.target.value as any
                })
              }
              className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
            >
              <option value="nowrap">No Wrap</option>
              <option value="wrap">Wrap</option>
              <option value="wrap-reverse">Wrap Reverse</option>
            </select>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs text-gray-600">
            Justify Content
          </label>
          <select
            value={props.justifyContent}
            onChange={e =>
              setProp((props: ContainerBlockProps) => {
                props.justifyContent = e.target.value as any
              })
            }
            className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
          >
            <option value="flex-start">Start</option>
            <option value="flex-end">End</option>
            <option value="center">Center</option>
            <option value="space-between">Space Between</option>
            <option value="space-around">Space Around</option>
            <option value="space-evenly">Space Evenly</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs text-gray-600">
            Align Items
          </label>
          <select
            value={props.alignItems}
            onChange={e =>
              setProp((props: ContainerBlockProps) => {
                props.alignItems = e.target.value as any
              })
            }
            className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
          >
            <option value="flex-start">Start</option>
            <option value="flex-end">End</option>
            <option value="center">Center</option>
            <option value="stretch">Stretch</option>
            <option value="baseline">Baseline</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs text-gray-600">Gap</label>
          <input
            type="number"
            value={props.gap}
            onChange={e =>
              setProp((props: ContainerBlockProps) => {
                props.gap = parseInt(e.target.value) || 0
              })
            }
            className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
          />
        </div>
      </div>

      {/* Dimensions */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-900">Dimensions</h4>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs text-gray-600">Width</label>
            <input
              type="text"
              value={props.width}
              onChange={e =>
                setProp((props: ContainerBlockProps) => {
                  props.width = e.target.value
                })
              }
              placeholder="100%, 400px, auto"
              className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs text-gray-600">Height</label>
            <input
              type="text"
              value={props.height}
              onChange={e =>
                setProp((props: ContainerBlockProps) => {
                  props.height = e.target.value
                })
              }
              placeholder="auto, 300px"
              className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs text-gray-600">Min Height</label>
          <input
            type="number"
            value={props.minHeight}
            onChange={e =>
              setProp((props: ContainerBlockProps) => {
                props.minHeight = parseInt(e.target.value) || 0
              })
            }
            className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
          />
        </div>
      </div>

      {/* Spacing */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-900">Spacing</h4>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs text-gray-600">Padding</label>
            <div className="grid grid-cols-2 gap-1">
              <input
                type="number"
                placeholder="Top"
                value={props.padding.top}
                onChange={e =>
                  setProp((props: ContainerBlockProps) => {
                    props.padding.top = parseInt(e.target.value) || 0
                  })
                }
                className="rounded border border-gray-300 px-1 py-1 text-xs"
              />
              <input
                type="number"
                placeholder="Right"
                value={props.padding.right}
                onChange={e =>
                  setProp((props: ContainerBlockProps) => {
                    props.padding.right = parseInt(e.target.value) || 0
                  })
                }
                className="rounded border border-gray-300 px-1 py-1 text-xs"
              />
              <input
                type="number"
                placeholder="Bottom"
                value={props.padding.bottom}
                onChange={e =>
                  setProp((props: ContainerBlockProps) => {
                    props.padding.bottom = parseInt(e.target.value) || 0
                  })
                }
                className="rounded border border-gray-300 px-1 py-1 text-xs"
              />
              <input
                type="number"
                placeholder="Left"
                value={props.padding.left}
                onChange={e =>
                  setProp((props: ContainerBlockProps) => {
                    props.padding.left = parseInt(e.target.value) || 0
                  })
                }
                className="rounded border border-gray-300 px-1 py-1 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs text-gray-600">Margin</label>
            <div className="grid grid-cols-2 gap-1">
              <input
                type="number"
                placeholder="Top"
                value={props.margin.top}
                onChange={e =>
                  setProp((props: ContainerBlockProps) => {
                    props.margin.top = parseInt(e.target.value) || 0
                  })
                }
                className="rounded border border-gray-300 px-1 py-1 text-xs"
              />
              <input
                type="number"
                placeholder="Right"
                value={props.margin.right}
                onChange={e =>
                  setProp((props: ContainerBlockProps) => {
                    props.margin.right = parseInt(e.target.value) || 0
                  })
                }
                className="rounded border border-gray-300 px-1 py-1 text-xs"
              />
              <input
                type="number"
                placeholder="Bottom"
                value={props.margin.bottom}
                onChange={e =>
                  setProp((props: ContainerBlockProps) => {
                    props.margin.bottom = parseInt(e.target.value) || 0
                  })
                }
                className="rounded border border-gray-300 px-1 py-1 text-xs"
              />
              <input
                type="number"
                placeholder="Left"
                value={props.margin.left}
                onChange={e =>
                  setProp((props: ContainerBlockProps) => {
                    props.margin.left = parseInt(e.target.value) || 0
                  })
                }
                className="rounded border border-gray-300 px-1 py-1 text-xs"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Background */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-900">Background</h4>

        <div>
          <label className="mb-1 block text-xs text-gray-600">
            Background Color
          </label>
          <input
            type="color"
            value={
              props.backgroundColor === 'transparent'
                ? '#ffffff'
                : props.backgroundColor
            }
            onChange={e =>
              setProp((props: ContainerBlockProps) => {
                props.backgroundColor = e.target.value
              })
            }
            className="h-8 w-full rounded border border-gray-300"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs text-gray-600">
            Background Image URL
          </label>
          <input
            type="url"
            value={props.backgroundImage}
            onChange={e =>
              setProp((props: ContainerBlockProps) => {
                props.backgroundImage = e.target.value
              })
            }
            placeholder="https://example.com/image.jpg"
            className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
          />
        </div>

        {props.backgroundImage && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs text-gray-600">
                Background Size
              </label>
              <select
                value={props.backgroundSize}
                onChange={e =>
                  setProp((props: ContainerBlockProps) => {
                    props.backgroundSize = e.target.value as any
                  })
                }
                className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
              >
                <option value="cover">Cover</option>
                <option value="contain">Contain</option>
                <option value="auto">Auto</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs text-gray-600">
                Background Repeat
              </label>
              <select
                value={props.backgroundRepeat}
                onChange={e =>
                  setProp((props: ContainerBlockProps) => {
                    props.backgroundRepeat = e.target.value as any
                  })
                }
                className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
              >
                <option value="no-repeat">No Repeat</option>
                <option value="repeat">Repeat</option>
                <option value="repeat-x">Repeat X</option>
                <option value="repeat-y">Repeat Y</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Border & Shadow */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-900">Border & Shadow</h4>

        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="mb-1 block text-xs text-gray-600">
              Border Width
            </label>
            <input
              type="number"
              value={props.border.width}
              onChange={e =>
                setProp((props: ContainerBlockProps) => {
                  props.border.width = parseInt(e.target.value) || 0
                })
              }
              className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs text-gray-600">
              Border Style
            </label>
            <select
              value={props.border.style}
              onChange={e =>
                setProp((props: ContainerBlockProps) => {
                  props.border.style = e.target.value as any
                })
              }
              className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
            >
              <option value="solid">Solid</option>
              <option value="dashed">Dashed</option>
              <option value="dotted">Dotted</option>
              <option value="none">None</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs text-gray-600">
              Border Color
            </label>
            <input
              type="color"
              value={props.border.color}
              onChange={e =>
                setProp((props: ContainerBlockProps) => {
                  props.border.color = e.target.value
                })
              }
              className="h-8 w-full rounded border border-gray-300"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-xs text-gray-600">
            Border Radius
          </label>
          <input
            type="number"
            value={props.borderRadius}
            onChange={e =>
              setProp((props: ContainerBlockProps) => {
                props.borderRadius = parseInt(e.target.value) || 0
              })
            }
            className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
          />
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={props.shadow.enabled}
            onChange={e =>
              setProp((props: ContainerBlockProps) => {
                props.shadow.enabled = e.target.checked
              })
            }
            className="rounded"
          />
          <label className="text-xs text-gray-600">Enable shadow</label>
        </div>

        {props.shadow.enabled && (
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              placeholder="X offset"
              value={props.shadow.x}
              onChange={e =>
                setProp((props: ContainerBlockProps) => {
                  props.shadow.x = parseInt(e.target.value) || 0
                })
              }
              className="rounded border border-gray-300 px-2 py-1 text-sm"
            />
            <input
              type="number"
              placeholder="Y offset"
              value={props.shadow.y}
              onChange={e =>
                setProp((props: ContainerBlockProps) => {
                  props.shadow.y = parseInt(e.target.value) || 0
                })
              }
              className="rounded border border-gray-300 px-2 py-1 text-sm"
            />
            <input
              type="number"
              placeholder="Blur"
              value={props.shadow.blur}
              onChange={e =>
                setProp((props: ContainerBlockProps) => {
                  props.shadow.blur = parseInt(e.target.value) || 0
                })
              }
              className="rounded border border-gray-300 px-2 py-1 text-sm"
            />
            <input
              type="color"
              value={props.shadow.color}
              onChange={e =>
                setProp((props: ContainerBlockProps) => {
                  props.shadow.color = e.target.value
                })
              }
              className="h-8 w-full rounded border border-gray-300"
            />
          </div>
        )}
      </div>
    </div>
  )
}

// Craft.js configuration
;(ContainerBlock as any).craft = {
  props: defaultProps,
  related: {
    settings: ContainerBlockSettings,
  },
  displayName: 'Container',
  isCanvas: true,
}
