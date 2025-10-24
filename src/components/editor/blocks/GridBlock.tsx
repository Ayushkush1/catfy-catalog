'use client'

import React from 'react'
import { useNode, UserComponent, Element } from '@craftjs/core'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ContainerBlock } from './ContainerBlock'

export interface GridBlockProps {
  columns?: number
  rows?: number
  gap?: number
  columnGap?: number
  rowGap?: number
  gridTemplateColumns?: string
  gridTemplateRows?: string
  gridTemplateAreas?: string
  justifyItems?: 'start' | 'end' | 'center' | 'stretch'
  alignItems?: 'start' | 'end' | 'center' | 'stretch'
  justifyContent?:
    | 'start'
    | 'end'
    | 'center'
    | 'stretch'
    | 'space-around'
    | 'space-between'
    | 'space-evenly'
  alignContent?:
    | 'start'
    | 'end'
    | 'center'
    | 'stretch'
    | 'space-around'
    | 'space-between'
    | 'space-evenly'
  width?: string
  height?: string
  minHeight?: string
  maxHeight?: string
  padding?: number
  marginTop?: number
  marginBottom?: number
  marginLeft?: number
  marginRight?: number
  backgroundColor?: string
  borderRadius?: number
  border?: string
  borderWidth?: number
  borderColor?: string
  borderStyle?:
    | 'solid'
    | 'dashed'
    | 'dotted'
    | 'double'
    | 'groove'
    | 'ridge'
    | 'inset'
    | 'outset'
  boxShadow?: string
  className?: string
}

export const GridBlock: UserComponent<GridBlockProps> = ({
  columns = 2,
  rows = 2,
  gap = 16,
  columnGap,
  rowGap,
  gridTemplateColumns = '',
  gridTemplateRows = '',
  gridTemplateAreas = '',
  justifyItems = 'stretch',
  alignItems = 'stretch',
  justifyContent = 'start',
  alignContent = 'start',
  width = '100%',
  height = 'auto',
  minHeight = '',
  maxHeight = '',
  padding = 16,
  marginTop = 0,
  marginBottom = 0,
  marginLeft = 0,
  marginRight = 0,
  backgroundColor = 'transparent',
  borderRadius = 0,
  border = '',
  borderWidth = 0,
  borderColor = '#e5e7eb',
  borderStyle = 'solid',
  boxShadow = '',
  className = '',
}) => {
  const {
    connectors: { connect, drag },
    selected,
    actions: { setProp },
  } = useNode(state => ({
    selected: state.events.selected,
  }))

  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: gridTemplateColumns || `repeat(${columns}, 1fr)`,
    gridTemplateRows:
      gridTemplateRows || (rows > 0 ? `repeat(${rows}, auto)` : 'auto'),
    gridTemplateAreas: gridTemplateAreas || undefined,
    gap:
      columnGap !== undefined || rowGap !== undefined
        ? `${rowGap || gap}px ${columnGap || gap}px`
        : `${gap}px`,
    justifyItems,
    alignItems,
    justifyContent,
    alignContent,
    width,
    height,
    minHeight: minHeight || undefined,
    maxHeight: maxHeight || undefined,
    padding: `${padding}px`,
    margin: `${marginTop}px ${marginRight}px ${marginBottom}px ${marginLeft}px`,
    backgroundColor:
      backgroundColor === 'transparent' ? undefined : backgroundColor,
    borderRadius: borderRadius ? `${borderRadius}px` : undefined,
    border:
      border ||
      (borderWidth > 0
        ? `${borderWidth}px ${borderStyle} ${borderColor}`
        : undefined),
    boxShadow: boxShadow || undefined,
  }

  // Generate grid items based on columns and rows
  const totalItems = columns * rows
  const gridItems = Array.from({ length: totalItems }, (_, index) => (
    <Element
      key={index}
      id={`grid-item-${index}`}
      is={ContainerBlock}
      canvas
      custom={{
        displayName: `Grid Item ${index + 1}`,
      }}
      minHeight={60}
      padding={{ top: 8, right: 8, bottom: 8, left: 8 }}
      backgroundColor="#f9fafb"
      border={{ width: 1, style: 'dashed', color: '#d1d5db' }}
    />
  ))

  return (
    <div
      ref={ref => {
        if (ref) {
          connect(drag(ref))
        }
      }}
      className={`grid-block ${selected ? 'ring-2 ring-[#2D1B69]' : ''} ${className}`}
      style={gridStyle}
    >
      {gridItems}
    </div>
  )
}

export const GridBlockSettings: React.FC = () => {
  const {
    actions: { setProp },
    props,
  } = useNode(node => ({
    props: node.data.props as GridBlockProps,
  }))

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label htmlFor="grid-columns">Columns: {props.columns}</Label>
          <Slider
            value={[props.columns || 2]}
            onValueChange={([value]) =>
              setProp((props: GridBlockProps) => (props.columns = value))
            }
            max={12}
            min={1}
            step={1}
            className="mt-2"
          />
        </div>
        <div>
          <Label htmlFor="grid-rows">Rows: {props.rows}</Label>
          <Slider
            value={[props.rows || 2]}
            onValueChange={([value]) =>
              setProp((props: GridBlockProps) => (props.rows = value))
            }
            max={12}
            min={1}
            step={1}
            className="mt-2"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="grid-gap">Gap: {props.gap}px</Label>
        <Slider
          value={[props.gap || 16]}
          onValueChange={([value]) =>
            setProp((props: GridBlockProps) => (props.gap = value))
          }
          max={100}
          min={0}
          step={1}
          className="mt-2"
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label htmlFor="column-gap">
            Column Gap: {props.columnGap || 'Auto'}px
          </Label>
          <Slider
            value={[props.columnGap || props.gap || 16]}
            onValueChange={([value]) =>
              setProp((props: GridBlockProps) => (props.columnGap = value))
            }
            max={100}
            min={0}
            step={1}
            className="mt-2"
          />
        </div>
        <div>
          <Label htmlFor="row-gap">Row Gap: {props.rowGap || 'Auto'}px</Label>
          <Slider
            value={[props.rowGap || props.gap || 16]}
            onValueChange={([value]) =>
              setProp((props: GridBlockProps) => (props.rowGap = value))
            }
            max={100}
            min={0}
            step={1}
            className="mt-2"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="grid-template-columns">
          Grid Template Columns (CSS)
        </Label>
        <Input
          value={props.gridTemplateColumns}
          onChange={e =>
            setProp(
              (props: GridBlockProps) =>
                (props.gridTemplateColumns = e.target.value)
            )
          }
          placeholder="e.g., 1fr 2fr 1fr, 200px auto 1fr"
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="grid-template-rows">Grid Template Rows (CSS)</Label>
        <Input
          value={props.gridTemplateRows}
          onChange={e =>
            setProp(
              (props: GridBlockProps) =>
                (props.gridTemplateRows = e.target.value)
            )
          }
          placeholder="e.g., auto 1fr auto, 100px 200px"
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="grid-template-areas">Grid Template Areas</Label>
        <Textarea
          value={props.gridTemplateAreas}
          onChange={e =>
            setProp(
              (props: GridBlockProps) =>
                (props.gridTemplateAreas = e.target.value)
            )
          }
          placeholder={`"header header header"\n"sidebar main main"\n"footer footer footer"`}
          className="mt-1"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label htmlFor="justify-items">Justify Items</Label>
          <Select
            value={props.justifyItems}
            onValueChange={value =>
              setProp(
                (props: GridBlockProps) =>
                  (props.justifyItems = value as GridBlockProps['justifyItems'])
              )
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="start">Start</SelectItem>
              <SelectItem value="end">End</SelectItem>
              <SelectItem value="center">Center</SelectItem>
              <SelectItem value="stretch">Stretch</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="align-items">Align Items</Label>
          <Select
            value={props.alignItems}
            onValueChange={value =>
              setProp(
                (props: GridBlockProps) =>
                  (props.alignItems = value as GridBlockProps['alignItems'])
              )
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="start">Start</SelectItem>
              <SelectItem value="end">End</SelectItem>
              <SelectItem value="center">Center</SelectItem>
              <SelectItem value="stretch">Stretch</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label htmlFor="justify-content">Justify Content</Label>
          <Select
            value={props.justifyContent}
            onValueChange={value =>
              setProp(
                (props: GridBlockProps) =>
                  (props.justifyContent =
                    value as GridBlockProps['justifyContent'])
              )
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="start">Start</SelectItem>
              <SelectItem value="end">End</SelectItem>
              <SelectItem value="center">Center</SelectItem>
              <SelectItem value="stretch">Stretch</SelectItem>
              <SelectItem value="space-around">Space Around</SelectItem>
              <SelectItem value="space-between">Space Between</SelectItem>
              <SelectItem value="space-evenly">Space Evenly</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="align-content">Align Content</Label>
          <Select
            value={props.alignContent}
            onValueChange={value =>
              setProp(
                (props: GridBlockProps) =>
                  (props.alignContent = value as GridBlockProps['alignContent'])
              )
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="start">Start</SelectItem>
              <SelectItem value="end">End</SelectItem>
              <SelectItem value="center">Center</SelectItem>
              <SelectItem value="stretch">Stretch</SelectItem>
              <SelectItem value="space-around">Space Around</SelectItem>
              <SelectItem value="space-between">Space Between</SelectItem>
              <SelectItem value="space-evenly">Space Evenly</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="grid-width">Width</Label>
        <Input
          value={props.width}
          onChange={e =>
            setProp((props: GridBlockProps) => (props.width = e.target.value))
          }
          placeholder="100%, 500px, auto"
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="grid-height">Height</Label>
        <Input
          value={props.height}
          onChange={e =>
            setProp((props: GridBlockProps) => (props.height = e.target.value))
          }
          placeholder="auto, 300px, 100vh"
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="grid-padding">Padding: {props.padding}px</Label>
        <Slider
          value={[props.padding || 16]}
          onValueChange={([value]) =>
            setProp((props: GridBlockProps) => (props.padding = value))
          }
          max={100}
          min={0}
          step={1}
          className="mt-2"
        />
      </div>

      <div>
        <Label htmlFor="grid-background">Background Color</Label>
        <Input
          type="color"
          value={
            props.backgroundColor === 'transparent'
              ? '#ffffff'
              : props.backgroundColor
          }
          onChange={e =>
            setProp(
              (props: GridBlockProps) =>
                (props.backgroundColor = e.target.value)
            )
          }
          className="mt-1"
        />
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            setProp(
              (props: GridBlockProps) => (props.backgroundColor = 'transparent')
            )
          }
          className="mt-2 w-full"
        >
          Make Transparent
        </Button>
      </div>

      <div>
        <Label htmlFor="border-radius">
          Border Radius: {props.borderRadius}px
        </Label>
        <Slider
          value={[props.borderRadius || 0]}
          onValueChange={([value]) =>
            setProp((props: GridBlockProps) => (props.borderRadius = value))
          }
          max={50}
          min={0}
          step={1}
          className="mt-2"
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label htmlFor="margin-top">Margin Top: {props.marginTop}px</Label>
          <Slider
            value={[props.marginTop || 0]}
            onValueChange={([value]) =>
              setProp((props: GridBlockProps) => (props.marginTop = value))
            }
            max={100}
            min={0}
            step={1}
            className="mt-2"
          />
        </div>
        <div>
          <Label htmlFor="margin-bottom">
            Margin Bottom: {props.marginBottom}px
          </Label>
          <Slider
            value={[props.marginBottom || 0]}
            onValueChange={([value]) =>
              setProp((props: GridBlockProps) => (props.marginBottom = value))
            }
            max={100}
            min={0}
            step={1}
            className="mt-2"
          />
        </div>
      </div>
    </div>
  )
}
;(GridBlock as any).craft = {
  props: {
    columns: 2,
    rows: 2,
    gap: 16,
    justifyItems: 'stretch',
    alignItems: 'stretch',
    justifyContent: 'start',
    alignContent: 'start',
    width: '100%',
    height: 'auto',
    padding: 16,
    marginTop: 0,
    marginBottom: 0,
    marginLeft: 0,
    marginRight: 0,
    backgroundColor: 'transparent',
    borderRadius: 0,
    borderWidth: 0,
    borderColor: '#e5e7eb',
    borderStyle: 'solid',
  },
  related: {
    settings: GridBlockSettings,
  },
}
