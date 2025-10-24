'use client'

import React from 'react'
import { useNode, UserComponent } from '@craftjs/core'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export interface SpacerBlockProps {
  height?: number
  width?: number
  unit?: 'px' | 'rem' | 'em' | '%' | 'vh' | 'vw'
  backgroundColor?: string
  showBackground?: boolean
  className?: string
}

export const SpacerBlock: UserComponent<SpacerBlockProps> = ({
  height = 40,
  width = 100,
  unit = 'px',
  backgroundColor = 'transparent',
  showBackground = false,
  className = '',
}) => {
  const {
    connectors: { connect, drag },
    selected,
    actions: { setProp },
  } = useNode(state => ({
    selected: state.events.selected,
  }))

  const spacerStyle: React.CSSProperties = {
    height: unit === '%' || unit === 'vh' ? `${height}${unit}` : `${height}px`,
    width: unit === '%' || unit === 'vw' ? `${width}${unit}` : `${width}px`,
    backgroundColor: showBackground ? backgroundColor : 'transparent',
    minHeight: '10px',
    minWidth: '10px',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }

  return (
    <div
      ref={ref => {
        if (ref) {
          connect(drag(ref))
        }
      }}
      className={`spacer-block ${selected ? 'ring-2 ring-blue-500' : ''} ${className}`}
      style={spacerStyle}
    >
      {selected && (
        <div className="absolute inset-0 flex items-center justify-center border border-dashed border-blue-300 bg-blue-50 bg-opacity-50 text-xs font-medium text-blue-600">
          Spacer ({height}
          {unit === 'px' ? 'px' : unit})
        </div>
      )}
    </div>
  )
}

export const SpacerBlockSettings: React.FC = () => {
  const {
    actions: { setProp },
    props,
  } = useNode(node => ({
    props: node.data.props as SpacerBlockProps,
  }))

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="spacer-height">
          Height: {props.height}
          {props.unit}
        </Label>
        <Slider
          value={[props.height || 40]}
          onValueChange={([value]) =>
            setProp((props: SpacerBlockProps) => (props.height = value))
          }
          max={props.unit === 'vh' ? 100 : props.unit === '%' ? 100 : 500}
          min={1}
          step={1}
          className="mt-2"
        />
      </div>

      <div>
        <Label htmlFor="spacer-width">
          Width: {props.width}
          {props.unit}
        </Label>
        <Slider
          value={[props.width || 100]}
          onValueChange={([value]) =>
            setProp((props: SpacerBlockProps) => (props.width = value))
          }
          max={props.unit === 'vw' ? 100 : props.unit === '%' ? 100 : 500}
          min={1}
          step={1}
          className="mt-2"
        />
      </div>

      <div>
        <Label htmlFor="spacer-unit">Unit</Label>
        <Select
          value={props.unit}
          onValueChange={(value: string) =>
            setProp(
              (props: SpacerBlockProps) =>
                (props.unit = value as SpacerBlockProps['unit'])
            )
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="px">Pixels (px)</SelectItem>
            <SelectItem value="rem">Root Em (rem)</SelectItem>
            <SelectItem value="em">Em (em)</SelectItem>
            <SelectItem value="%">Percentage (%)</SelectItem>
            <SelectItem value="vh">Viewport Height (vh)</SelectItem>
            <SelectItem value="vw">Viewport Width (vw)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="show-background"
          checked={props.showBackground}
          onChange={e =>
            setProp(
              (props: SpacerBlockProps) =>
                (props.showBackground = e.target.checked)
            )
          }
          className="rounded"
        />
        <Label htmlFor="show-background">Show Background</Label>
      </div>

      {props.showBackground && (
        <div>
          <Label htmlFor="spacer-background">Background Color</Label>
          <input
            type="color"
            value={props.backgroundColor}
            onChange={e =>
              setProp(
                (props: SpacerBlockProps) =>
                  (props.backgroundColor = e.target.value)
              )
            }
            className="mt-1 h-10 w-full rounded border"
          />
        </div>
      )}
    </div>
  )
}
;(SpacerBlock as any).craft = {
  props: {
    height: 40,
    width: 100,
    unit: 'px',
    backgroundColor: 'transparent',
    showBackground: false,
  },
  related: {
    settings: SpacerBlockSettings,
  },
}
