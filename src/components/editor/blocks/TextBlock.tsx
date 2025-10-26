'use client'

import { useNode } from '@craftjs/core'
import React from 'react'
import ContentEditable from 'react-contenteditable'
import { BlockWrapper } from '../components/BlockWrapper'

export interface TextBlockProps {
  text: string
  fontSize: number
  fontWeight:
    | 'normal'
    | 'bold'
    | '100'
    | '200'
    | '300'
    | '400'
    | '500'
    | '600'
    | '700'
    | '800'
    | '900'
  fontFamily: string
  color: string
  textAlign: 'left' | 'center' | 'right' | 'justify'
  lineHeight: number
  letterSpacing: number
  textDecoration: 'none' | 'underline' | 'line-through'
  textTransform: 'none' | 'uppercase' | 'lowercase' | 'capitalize'
  margin: {
    top: number
    right: number
    bottom: number
    left: number
  }
  padding: {
    top: number
    right: number
    bottom: number
    left: number
  }
  backgroundColor: string
  borderRadius: number
  border: {
    width: number
    style: 'solid' | 'dashed' | 'dotted' | 'none'
    color: string
  }
  shadow: {
    enabled: boolean
    x: number
    y: number
    blur: number
    color: string
  }
  animation: {
    type: 'none' | 'fadeIn' | 'slideIn' | 'bounce'
    duration: number
    delay: number
  }
  responsive: {
    desktop: Partial<TextBlockProps>
    tablet: Partial<TextBlockProps>
    mobile: Partial<TextBlockProps>
  }
}

const defaultProps: TextBlockProps = {
  text: 'Edit this text',
  fontSize: 16,
  fontWeight: 'normal',
  fontFamily: 'Inter, sans-serif',
  color: '#000000',
  textAlign: 'left',
  lineHeight: 1.5,
  letterSpacing: 0,
  textDecoration: 'none',
  textTransform: 'none',
  margin: { top: 0, right: 0, bottom: 0, left: 0 },
  padding: { top: 8, right: 8, bottom: 8, left: 8 },
  backgroundColor: 'transparent',
  borderRadius: 0,
  border: { width: 0, style: 'solid', color: '#000000' },
  shadow: { enabled: false, x: 0, y: 0, blur: 0, color: '#000000' },
  animation: { type: 'none', duration: 300, delay: 0 },
  responsive: { desktop: {}, tablet: {}, mobile: {} },
}

export const TextBlock: React.FC<Partial<TextBlockProps>> = props => {
  const {
    actions: { setProp },
  } = useNode()

  const finalProps = { ...defaultProps, ...props }

  const {
    text,
    fontSize,
    fontWeight,
    fontFamily,
    color,
    textAlign,
    lineHeight,
    letterSpacing,
    textDecoration,
    textTransform,
    margin,
    padding,
    backgroundColor,
    borderRadius,
    border,
    shadow,
    animation,
  } = finalProps

  const handleTextChange = (evt: any) => {
    setProp((props: TextBlockProps) => {
      props.text = evt.target.value
    })
  }

  const textStyle: React.CSSProperties = {
    fontSize: `${fontSize}px`,
    fontWeight,
    fontFamily,
    color,
    textAlign,
    lineHeight,
    letterSpacing: `${letterSpacing}px`,
    textDecoration,
    textTransform,
    margin: `${margin.top}px ${margin.right}px ${margin.bottom}px ${margin.left}px`,
    padding: `${padding.top}px ${padding.right}px ${padding.bottom}px ${padding.left}px`,
    backgroundColor,
    borderRadius: `${borderRadius}px`,
    border:
      border.width > 0
        ? `${border.width}px ${border.style} ${border.color}`
        : 'none',
    boxShadow: shadow.enabled
      ? `${shadow.x}px ${shadow.y}px ${shadow.blur}px ${shadow.color}`
      : 'none',
    cursor: 'text',
    outline: 'none',
    minHeight: '1em',
    display: 'inline-block',
    width: '100%',
    wordBreak: 'break-word',
    transition:
      animation.type !== 'none'
        ? `all ${animation.duration}ms ease ${animation.delay}ms`
        : 'none',
  }

  return (
    <BlockWrapper
      className={`text-block ${animation.type !== 'none' ? `animate-${animation.type}` : ''}`}
      style={textStyle}
    >
      <ContentEditable
        html={text}
        onChange={handleTextChange}
        tagName="div"
        disabled={false}
        style={{
          outline: 'none',
          border: 'none',
          background: 'transparent',
          width: '100%',
          minHeight: 'inherit',
        }}
      />
    </BlockWrapper>
  )
}

// Settings component for the TextBlock
export const TextBlockSettings: React.FC = () => {
  const {
    actions: { setProp },
    props,
  } = useNode(node => ({
    props: node.data.props as TextBlockProps,
  }))

  return (
    <div className="space-y-4">
      {/* Text Content */}
      <div>
        <label htmlFor="text-content" className="mb-2 block text-sm font-medium text-gray-700">
          Text Content
        </label>
        <textarea
          id="text-content"
          value={props.text}
          onChange={e =>
            setProp((props: TextBlockProps) => {
              props.text = e.target.value
            })
          }
          className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#2D1B69]"
          rows={3}
        />
      </div>

      {/* Typography */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-900">Typography</h4>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="text-font-size" className="mb-1 block text-xs text-gray-600">
              Font Size
            </label>
            <input
              id="text-font-size"
              type="number"
              value={props.fontSize}
              onChange={e =>
                setProp((props: TextBlockProps) => {
                  props.fontSize = parseInt(e.target.value) || 16
                })
              }
              className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
            />
          </div>

          <div>
            <label htmlFor="text-font-weight" className="mb-1 block text-xs text-gray-600">
              Font Weight
            </label>
            <select
              id="text-font-weight"
              value={props.fontWeight}
              onChange={e =>
                setProp((props: TextBlockProps) => {
                  props.fontWeight = e.target.value as any
                })
              }
              className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
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
          <label htmlFor="text-color" className="mb-1 block text-xs text-gray-600">Color</label>
          <input
            id="text-color"
            type="color"
            value={props.color}
            onChange={e =>
              setProp((props: TextBlockProps) => {
                props.color = e.target.value
              })
            }
            className="h-8 w-full rounded border border-gray-300"
          />
        </div>

        <div>
          <label htmlFor="text-align" className="mb-1 block text-xs text-gray-600">Text Align</label>
          <select
            id="text-align"
            value={props.textAlign}
            onChange={e =>
              setProp((props: TextBlockProps) => {
                props.textAlign = e.target.value as any
              })
            }
            className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
          >
            <option value="left">Left</option>
            <option value="center">Center</option>
            <option value="right">Right</option>
            <option value="justify">Justify</option>
          </select>
        </div>
      </div>

      {/* Spacing */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-900">Spacing</h4>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs text-gray-600">Margin</label>
            <div className="grid grid-cols-2 gap-1">
              <input
                aria-label="Margin top"
                type="number"
                placeholder="Top"
                value={props.margin.top}
                onChange={e =>
                  setProp((props: TextBlockProps) => {
                    props.margin.top = parseInt(e.target.value) || 0
                  })
                }
                className="rounded border border-gray-300 px-1 py-1 text-xs"
              />
              <input
                aria-label="Margin right"
                type="number"
                placeholder="Right"
                value={props.margin.right}
                onChange={e =>
                  setProp((props: TextBlockProps) => {
                    props.margin.right = parseInt(e.target.value) || 0
                  })
                }
                className="rounded border border-gray-300 px-1 py-1 text-xs"
              />
              <input
                aria-label="Margin bottom"
                type="number"
                placeholder="Bottom"
                value={props.margin.bottom}
                onChange={e =>
                  setProp((props: TextBlockProps) => {
                    props.margin.bottom = parseInt(e.target.value) || 0
                  })
                }
                className="rounded border border-gray-300 px-1 py-1 text-xs"
              />
              <input
                aria-label="Margin left"
                type="number"
                placeholder="Left"
                value={props.margin.left}
                onChange={e =>
                  setProp((props: TextBlockProps) => {
                    props.margin.left = parseInt(e.target.value) || 0
                  })
                }
                className="rounded border border-gray-300 px-1 py-1 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs text-gray-600">Padding</label>
            <div className="grid grid-cols-2 gap-1">
              <input
                aria-label="Padding top"
                type="number"
                placeholder="Top"
                value={props.padding.top}
                onChange={e =>
                  setProp((props: TextBlockProps) => {
                    props.padding.top = parseInt(e.target.value) || 0
                  })
                }
                className="rounded border border-gray-300 px-1 py-1 text-xs"
              />
              <input
                aria-label="Padding right"
                type="number"
                placeholder="Right"
                value={props.padding.right}
                onChange={e =>
                  setProp((props: TextBlockProps) => {
                    props.padding.right = parseInt(e.target.value) || 0
                  })
                }
                className="rounded border border-gray-300 px-1 py-1 text-xs"
              />
              <input
                aria-label="Padding bottom"
                type="number"
                placeholder="Bottom"
                value={props.padding.bottom}
                onChange={e =>
                  setProp((props: TextBlockProps) => {
                    props.padding.bottom = parseInt(e.target.value) || 0
                  })
                }
                className="rounded border border-gray-300 px-1 py-1 text-xs"
              />
              <input
                aria-label="Padding left"
                type="number"
                placeholder="Left"
                value={props.padding.left}
                onChange={e =>
                  setProp((props: TextBlockProps) => {
                    props.padding.left = parseInt(e.target.value) || 0
                  })
                }
                className="rounded border border-gray-300 px-1 py-1 text-xs"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Craft.js configuration
TextBlock.craft = {
  props: defaultProps,
  related: {
    settings: TextBlockSettings,
  },
  displayName: 'Text',
}
