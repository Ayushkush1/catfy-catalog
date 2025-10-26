'use client'

import React from 'react'
import { useNode } from '@craftjs/core'
import ContentEditable from 'react-contenteditable'
import { BlockWrapper } from '../components/BlockWrapper'

export interface HeadingBlockProps {
  text: string
  level: 1 | 2 | 3 | 4 | 5 | 6
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
}

const defaultProps: HeadingBlockProps = {
  text: 'Heading Text',
  level: 1,
  fontSize: 32,
  fontWeight: 'bold',
  fontFamily: 'Inter, sans-serif',
  color: '#000000',
  textAlign: 'left',
  lineHeight: 1.2,
  letterSpacing: 0,
  textDecoration: 'none',
  textTransform: 'none',
  margin: { top: 0, right: 0, bottom: 16, left: 0 },
  padding: { top: 0, right: 0, bottom: 0, left: 0 },
  backgroundColor: 'transparent',
  borderRadius: 0,
  border: { width: 0, style: 'solid', color: '#000000' },
  shadow: { enabled: false, x: 0, y: 0, blur: 0, color: '#000000' },
}

export const HeadingBlock: React.FC<Partial<HeadingBlockProps>> = props => {
  const {
    actions: { setProp },
  } = useNode()

  const finalProps = { ...defaultProps, ...props }

  const {
    text,
    level,
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
  } = finalProps

  const handleTextChange = (evt: any) => {
    setProp((props: HeadingBlockProps) => {
      props.text = evt.target.value
    })
  }

  const headingStyle: React.CSSProperties = {
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
    display: 'block',
    width: '100%',
    wordBreak: 'break-word',
  }

  const renderHeading = () => {
    const commonProps = {
      className: 'heading-block',
      style: headingStyle,
      children: (
        <ContentEditable
          html={text}
          onChange={handleTextChange}
          tagName="span"
          disabled={false}
          style={{
            outline: 'none',
            border: 'none',
            background: 'transparent',
            width: '100%',
            minHeight: 'inherit',
            display: 'inline-block',
          }}
        />
      ),
    }

    switch (level) {
      case 1:
        return <h1 {...commonProps} />
      case 2:
        return <h2 {...commonProps} />
      case 3:
        return <h3 {...commonProps} />
      case 4:
        return <h4 {...commonProps} />
      case 5:
        return <h5 {...commonProps} />
      case 6:
        return <h6 {...commonProps} />
      default:
        return <h1 {...commonProps} />
    }
  }

  return <BlockWrapper>{renderHeading()}</BlockWrapper>
}

// Settings component for the HeadingBlock
export const HeadingBlockSettings: React.FC = () => {
  const {
    actions: { setProp },
    props,
  } = useNode(node => ({
    props: node.data.props as HeadingBlockProps,
  }))

  return (
    <div className="space-y-4">
      {/* Text Content */}
      <div>
        <label htmlFor="heading-text" className="mb-2 block text-sm font-medium text-gray-700">
          Heading Text
        </label>
        <input
          id="heading-text"
          type="text"
          value={props.text}
          onChange={e =>
            setProp((props: HeadingBlockProps) => {
              props.text = e.target.value
            })
          }
          className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#2D1B69]"
        />
      </div>

      {/* Heading Level */}
      <div>
        <label htmlFor="heading-level" className="mb-2 block text-sm font-medium text-gray-700">
          Heading Level
        </label>
        <select
          id="heading-level"
          value={props.level}
          onChange={e =>
            setProp((props: HeadingBlockProps) => {
              props.level = parseInt(e.target.value) as any
              // Auto-adjust font size based on heading level
              const fontSizes = { 1: 32, 2: 28, 3: 24, 4: 20, 5: 18, 6: 16 }
              props.fontSize = fontSizes[props.level]
            })
          }
          className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#2D1B69]"
        >
          <option value={1}>H1</option>
          <option value={2}>H2</option>
          <option value={3}>H3</option>
          <option value={4}>H4</option>
          <option value={5}>H5</option>
          <option value={6}>H6</option>
        </select>
      </div>

      {/* Typography */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-900">Typography</h4>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="heading-font-size" className="mb-1 block text-xs text-gray-600">
              Font Size
            </label>
            <input
              id="heading-font-size"
              type="number"
              value={props.fontSize}
              onChange={e =>
                setProp((props: HeadingBlockProps) => {
                  props.fontSize = parseInt(e.target.value) || 32
                })
              }
              className="w-full rounded border border-gray-300 px-2 py-1 text-sm"
            />
          </div>

          <div>
            <label htmlFor="heading-font-weight" className="mb-1 block text-xs text-gray-600">
              Font Weight
            </label>
            <select
              id="heading-font-weight"
              value={props.fontWeight}
              onChange={e =>
                setProp((props: HeadingBlockProps) => {
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
          <label htmlFor="heading-color" className="mb-1 block text-xs text-gray-600">Color</label>
          <input
            id="heading-color"
            type="color"
            value={props.color}
            onChange={e =>
              setProp((props: HeadingBlockProps) => {
                props.color = e.target.value
              })
            }
            className="h-8 w-full rounded border border-gray-300"
          />
        </div>

        <div>
          <label htmlFor="heading-text-align" className="mb-1 block text-xs text-gray-600">Text Align</label>
          <select
            id="heading-text-align"
            value={props.textAlign}
            onChange={e =>
              setProp((props: HeadingBlockProps) => {
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
                  setProp((props: HeadingBlockProps) => {
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
                  setProp((props: HeadingBlockProps) => {
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
                  setProp((props: HeadingBlockProps) => {
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
                  setProp((props: HeadingBlockProps) => {
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
                  setProp((props: HeadingBlockProps) => {
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
                  setProp((props: HeadingBlockProps) => {
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
                  setProp((props: HeadingBlockProps) => {
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
                  setProp((props: HeadingBlockProps) => {
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
HeadingBlock.craft = {
  props: defaultProps,
  related: {
    settings: HeadingBlockSettings,
  },
  displayName: 'Heading',
}
