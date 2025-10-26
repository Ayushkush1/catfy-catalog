'use client'

import { Button } from '@/components/ui/button'
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
import { useNode, UserComponent } from '@craftjs/core'
import * as LucideIcons from 'lucide-react'
import React from 'react'
import { BlockWrapper } from '../components/BlockWrapper'

export interface IconBlockProps {
  icon?: string
  size?: number
  color?: string
  backgroundColor?: string
  borderRadius?: number
  padding?: number
  marginTop?: number
  marginBottom?: number
  marginLeft?: number
  marginRight?: number
  alignment?: 'left' | 'center' | 'right'
  rotation?: number
  opacity?: number
  href?: string
  target?: '_blank' | '_self'
  className?: string
}

// Popular icons list
const POPULAR_ICONS = [
  'Heart',
  'Star',
  'Home',
  'User',
  'Mail',
  'Phone',
  'MapPin',
  'Calendar',
  'Clock',
  'Search',
  'Settings',
  'Menu',
  'X',
  'Check',
  'ChevronRight',
  'ChevronLeft',
  'ChevronUp',
  'ChevronDown',
  'ArrowRight',
  'ArrowLeft',
  'ArrowUp',
  'ArrowDown',
  'Plus',
  'Minus',
  'Edit',
  'Trash2',
  'Download',
  'Upload',
  'Share',
  'Copy',
  'Eye',
  'EyeOff',
  'Lock',
  'Unlock',
  'Shield',
  'AlertCircle',
  'CheckCircle',
  'XCircle',
  'Info',
  'HelpCircle',
  'Zap',
  'Flame',
  'Sun',
  'Moon',
  'Cloud',
  'Umbrella',
  'Car',
  'Plane',
  'Ship',
  'Camera',
  'Image',
  'Video',
  'Music',
  'Headphones',
  'Mic',
  'Volume2',
  'VolumeX',
  'Play',
  'Pause',
  'Square',
  'SkipBack',
  'SkipForward',
  'Repeat',
  'Shuffle',
  'Wifi',
  'WifiOff',
  'Bluetooth',
  'Battery',
  'BatteryLow',
  'Signal',
  'Smartphone',
  'Laptop',
  'Monitor',
  'Printer',
  'Globe',
  'Link',
  'ExternalLink',
  'Bookmark',
  'Tag',
  'Flag',
  'Gift',
  'Award',
  'Trophy',
  'Target',
  'Compass',
  'Map',
  'Navigation',
  'Anchor',
]

export const IconBlock: UserComponent<IconBlockProps> = ({
  icon = 'Star',
  size = 24,
  color = '#000000',
  backgroundColor = 'transparent',
  borderRadius = 0,
  padding = 0,
  marginTop = 0,
  marginBottom = 0,
  marginLeft = 0,
  marginRight = 0,
  alignment = 'center',
  rotation = 0,
  opacity = 1,
  href = '',
  target = '_self',
  className = '',
}) => {
  const {
    connectors: { connect, drag },
    selected,
    actions: { setProp },
  } = useNode(state => ({
    selected: state.events.selected,
  }))

  // Get the icon component
  const IconComponent = (LucideIcons as any)[icon] || LucideIcons.Star

  const containerStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent:
      alignment === 'left'
        ? 'flex-start'
        : alignment === 'right'
          ? 'flex-end'
          : 'center',
    margin: `${marginTop}px ${marginRight}px ${marginBottom}px ${marginLeft}px`,
    width: '100%',
  }

  // Wrapper style for background, padding, and border radius
  const iconWrapperStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: backgroundColor === 'transparent' ? 'transparent' : backgroundColor,
    borderRadius: `${borderRadius}px`,
    padding: `${padding}px`,
    transform: `rotate(${rotation}deg)`,
    opacity: opacity || 1,
    cursor: href ? 'pointer' : 'default',
    transition: 'all 0.2s ease',
    lineHeight: 0,
  }

  // Icon style - only color and size
  const iconStyle: React.CSSProperties = {
    color: color || '#000000',
    width: `${size}px`,
    height: `${size}px`,
    strokeWidth: 2,
  }

  const renderIcon = () => (
    <div style={iconWrapperStyle}>
      <IconComponent style={iconStyle} size={size} />
    </div>
  )

  const content = href ? (
    <a
      href={href}
      target={target}
      rel={target === '_blank' ? 'noopener noreferrer' : undefined}
    >
      {renderIcon()}
    </a>
  ) : (
    renderIcon()
  )

  return (
    <BlockWrapper>
      <div
        ref={ref => {
          if (ref) {
            connect(drag(ref))
          }
        }}
        className={`icon-block ${className}`}
        style={containerStyle}
      >
        {content}
      </div>
    </BlockWrapper>
  )
}

export const IconBlockSettings: React.FC = () => {
  const {
    actions: { setProp },
    props,
  } = useNode(node => ({
    props: node.data.props as IconBlockProps,
  }))

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="icon-select">Icon</Label>
        <Select
          value={props.icon}
          onValueChange={(value: string) =>
            setProp((props: IconBlockProps) => (props.icon = value))
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="max-h-60 overflow-y-auto">
            {POPULAR_ICONS.map(iconName => {
              const IconComponent = (LucideIcons as any)[iconName]
              return (
                <SelectItem key={iconName} value={iconName}>
                  <div className="flex items-center space-x-2">
                    <IconComponent size={16} />
                    <span>{iconName}</span>
                  </div>
                </SelectItem>
              )
            })}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="icon-color">Color</Label>
        <Input
          type="color"
          value={props.color || '#000000'}
          onChange={e =>
            setProp((props: IconBlockProps) => {
              props.color = e.target.value
            })
          }
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="icon-background">Background Color</Label>
        <div className="space-y-2">
          <Input
            type="color"
            value={
              !props.backgroundColor || props.backgroundColor === 'transparent'
                ? '#ffffff'
                : props.backgroundColor
            }
            onChange={e =>
              setProp(
                (props: IconBlockProps) => {
                  props.backgroundColor = e.target.value
                }
              )
            }
            className="mt-1"
            disabled={props.backgroundColor === 'transparent'}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setProp(
                (props: IconBlockProps) => {
                  props.backgroundColor = 'transparent'
                }
              )
            }
            className="w-full"
          >
            {props.backgroundColor === 'transparent' ? 'Transparent (Active)' : 'Make Transparent'}
          </Button>
        </div>
      </div>

      <div>
        <Label htmlFor="icon-alignment">Alignment</Label>
        <Select
          value={props.alignment}
          onValueChange={(value: string) =>
            setProp(
              (props: IconBlockProps) =>
                (props.alignment = value as IconBlockProps['alignment'])
            )
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="left">Left</SelectItem>
            <SelectItem value="center">Center</SelectItem>
            <SelectItem value="right">Right</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="border-radius">
          Border Radius: {props.borderRadius || 0}px
        </Label>
        <Slider
          value={[props.borderRadius || 0]}
          onValueChange={([value]) =>
            setProp((props: IconBlockProps) => {
              props.borderRadius = value
            })
          }
          max={50}
          min={0}
          step={1}
          className="mt-2"
        />
      </div>

      <div>
        <Label htmlFor="icon-padding">Padding: {props.padding || 0}px</Label>
        <Slider
          value={[props.padding || 0]}
          onValueChange={([value]) =>
            setProp((props: IconBlockProps) => {
              props.padding = value
            })
          }
          max={50}
          min={0}
          step={1}
          className="mt-2"
        />
      </div>

      <div>
        <Label htmlFor="icon-rotation">Rotation: {props.rotation || 0}°</Label>
        <Slider
          value={[props.rotation || 0]}
          onValueChange={([value]) =>
            setProp((props: IconBlockProps) => {
              props.rotation = value
            })
          }
          max={360}
          min={0}
          step={1}
          className="mt-2"
        />
      </div>

      <div>
        <Label htmlFor="icon-opacity">
          Opacity: {Math.round((props.opacity || 1) * 100)}%
        </Label>
        <Slider
          value={[(props.opacity || 1) * 100]}
          onValueChange={([value]) =>
            setProp((props: IconBlockProps) => {
              props.opacity = value / 100
            })
          }
          max={100}
          min={0}
          step={1}
          className="mt-2"
        />
      </div>

      <div>
        <Label htmlFor="icon-href">Link URL (optional)</Label>
        <Input
          value={props.href}
          onChange={e =>
            setProp((props: IconBlockProps) => (props.href = e.target.value))
          }
          placeholder="https://example.com"
          className="mt-1"
        />
      </div>

      {props.href && (
        <div>
          <Label htmlFor="icon-target">Link Target</Label>
          <Select
            value={props.target}
            onValueChange={(value: string) =>
              setProp(
                (props: IconBlockProps) =>
                  (props.target = value as IconBlockProps['target'])
              )
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="_self">Same Window</SelectItem>
              <SelectItem value="_blank">New Window</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label htmlFor="margin-top">Margin Top: {props.marginTop || 0}px</Label>
          <Slider
            value={[props.marginTop || 0]}
            onValueChange={([value]) =>
              setProp((props: IconBlockProps) => {
                props.marginTop = value
              })
            }
            max={100}
            min={0}
            step={1}
            className="mt-2"
          />
        </div>
        <div>
          <Label htmlFor="margin-bottom">
            Margin Bottom: {props.marginBottom || 0}px
          </Label>
          <Slider
            value={[props.marginBottom || 0]}
            onValueChange={([value]) =>
              setProp((props: IconBlockProps) => {
                props.marginBottom = value
              })
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
;(IconBlock as any).craft = {
  props: {
    icon: 'Star',
    size: 24,
    color: '#000000',
    backgroundColor: 'transparent',
    borderRadius: 0,
    padding: 0,
    marginTop: 0,
    marginBottom: 0,
    marginLeft: 0,
    marginRight: 0,
    alignment: 'center',
    rotation: 0,
    opacity: 1,
    href: '',
    target: '_self',
  },
  related: {
    settings: IconBlockSettings,
  },
}
