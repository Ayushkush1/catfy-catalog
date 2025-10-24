import React, { useState } from 'react'
import { useNode } from '@craftjs/core'
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
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Plus, X, ChevronUp, ChevronDown, ChevronRight } from 'lucide-react'

export interface AccordionItem {
  id: string
  title: string
  content: string
  isOpen?: boolean
}

export interface AccordionBlockProps {
  items: AccordionItem[]
  allowMultiple?: boolean
  variant?: 'default' | 'bordered' | 'separated' | 'flush'
  size?: 'sm' | 'md' | 'lg'
  backgroundColor?: string
  borderColor?: string
  borderRadius?: number
  padding?: number
  margin?: number
  width?: string
  headerBackgroundColor?: string
  headerTextColor?: string
  contentBackgroundColor?: string
  contentTextColor?: string
  iconColor?: string
  spacing?: number
  animationDuration?: number
}

export const AccordionBlock: React.FC<AccordionBlockProps> = ({
  items = [
    {
      id: '1',
      title: 'Accordion Item 1',
      content: 'Content for accordion item 1',
      isOpen: false,
    },
    {
      id: '2',
      title: 'Accordion Item 2',
      content: 'Content for accordion item 2',
      isOpen: false,
    },
  ],
  allowMultiple = false,
  variant = 'default',
  size = 'md',
  backgroundColor = '#ffffff',
  borderColor = '#e2e8f0',
  borderRadius = 8,
  padding = 0,
  margin = 0,
  width = '100%',
  headerBackgroundColor = '#f8fafc',
  headerTextColor = '#1e293b',
  contentBackgroundColor = '#ffffff',
  contentTextColor = '#475569',
  iconColor = '#64748b',
  spacing = 0,
  animationDuration = 200,
}) => {
  const {
    connectors: { connect, drag },
  } = useNode()
  const [openItems, setOpenItems] = useState<Set<string>>(
    new Set(items.filter(item => item.isOpen).map(item => item.id))
  )

  const toggleItem = (itemId: string) => {
    setOpenItems(prev => {
      const newOpenItems = new Set(prev)

      if (newOpenItems.has(itemId)) {
        newOpenItems.delete(itemId)
      } else {
        if (!allowMultiple) {
          newOpenItems.clear()
        }
        newOpenItems.add(itemId)
      }

      return newOpenItems
    })
  }

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  }

  const headerPadding = {
    sm: '12px 16px',
    md: '16px 20px',
    lg: '20px 24px',
  }

  const contentPadding = {
    sm: '12px 16px',
    md: '16px 20px',
    lg: '20px 24px',
  }

  const containerStyles = {
    backgroundColor,
    borderRadius: variant !== 'flush' ? `${borderRadius}px` : '0',
    padding: `${padding}px`,
    margin: `${margin}px`,
    width,
    border: variant === 'bordered' ? `1px solid ${borderColor}` : 'none',
  }

  const getItemStyles = (index: number) => {
    const isLast = index === items.length - 1
    const baseStyles = {
      marginBottom: variant === 'separated' && !isLast ? `${spacing}px` : '0',
      border: variant === 'separated' ? `1px solid ${borderColor}` : 'none',
      borderRadius: variant === 'separated' ? `${borderRadius}px` : '0',
      borderBottom:
        variant === 'default' && !isLast ? `1px solid ${borderColor}` : 'none',
    }

    return baseStyles
  }

  const getHeaderStyles = (isOpen: boolean) => ({
    backgroundColor: headerBackgroundColor,
    color: headerTextColor,
    padding: headerPadding[size],
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    transition: `all ${animationDuration}ms ease`,
    borderTopLeftRadius: variant === 'separated' ? `${borderRadius}px` : '0',
    borderTopRightRadius: variant === 'separated' ? `${borderRadius}px` : '0',
    borderBottomLeftRadius:
      variant === 'separated' && !isOpen ? `${borderRadius}px` : '0',
    borderBottomRightRadius:
      variant === 'separated' && !isOpen ? `${borderRadius}px` : '0',
  })

  const getContentStyles = (isOpen: boolean) => ({
    backgroundColor: contentBackgroundColor,
    color: contentTextColor,
    padding: isOpen ? contentPadding[size] : '0 20px',
    maxHeight: isOpen ? '1000px' : '0',
    overflow: 'hidden',
    transition: `all ${animationDuration}ms ease`,
    borderBottomLeftRadius: variant === 'separated' ? `${borderRadius}px` : '0',
    borderBottomRightRadius:
      variant === 'separated' ? `${borderRadius}px` : '0',
  })

  return (
    <div
      ref={ref => {
        if (ref) {
          connect(drag(ref))
        }
      }}
      style={containerStyles}
      className="accordion-block"
    >
      {items.map((item, index) => {
        const isOpen = openItems.has(item.id)

        return (
          <div key={item.id} style={getItemStyles(index)}>
            <div
              style={getHeaderStyles(isOpen)}
              onClick={() => toggleItem(item.id)}
              className={`${sizeClasses[size]} select-none font-medium hover:opacity-80`}
            >
              <span>{item.title}</span>
              <ChevronRight
                style={{
                  color: iconColor,
                  transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)',
                  transition: `transform ${animationDuration}ms ease`,
                }}
                className="h-4 w-4 flex-shrink-0"
              />
            </div>

            <div style={getContentStyles(isOpen)}>
              <div className={`${sizeClasses[size]} whitespace-pre-wrap`}>
                {item.content}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export const AccordionBlockSettings: React.FC = () => {
  const {
    actions: { setProp },
    props,
  } = useNode(node => ({
    props: node.data.props as AccordionBlockProps,
  }))

  const addItem = () => {
    const newItem: AccordionItem = {
      id: Date.now().toString(),
      title: `Accordion Item ${props.items.length + 1}`,
      content: `Content for accordion item ${props.items.length + 1}`,
      isOpen: false,
    }
    setProp((props: AccordionBlockProps) => {
      props.items.push(newItem)
    })
  }

  const removeItem = (itemId: string) => {
    if (props.items.length > 1) {
      setProp((props: AccordionBlockProps) => {
        props.items = props.items.filter(item => item.id !== itemId)
      })
    }
  }

  const updateItem = (
    itemId: string,
    field: 'title' | 'content',
    value: string
  ) => {
    setProp((props: AccordionBlockProps) => {
      const item = props.items.find(i => i.id === itemId)
      if (item) {
        item[field] = value
      }
    })
  }

  const moveItem = (itemId: string, direction: 'up' | 'down') => {
    setProp((props: AccordionBlockProps) => {
      const currentIndex = props.items.findIndex(item => item.id === itemId)
      const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1

      if (newIndex >= 0 && newIndex < props.items.length) {
        const [movedItem] = props.items.splice(currentIndex, 1)
        props.items.splice(newIndex, 0, movedItem)
      }
    })
  }

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-sm font-medium">Accordion Items</Label>
        <div className="mt-2 space-y-2">
          {props.items.map((item, index) => (
            <div key={item.id} className="space-y-2 rounded-lg border p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Item {index + 1}</span>
                <div className="flex items-center gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => moveItem(item.id, 'up')}
                    disabled={index === 0}
                  >
                    <ChevronUp className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => moveItem(item.id, 'down')}
                    disabled={index === props.items.length - 1}
                  >
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeItem(item.id)}
                    disabled={props.items.length <= 1}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              <div>
                <Label className="text-xs">Title</Label>
                <Input
                  value={item.title}
                  onChange={e => updateItem(item.id, 'title', e.target.value)}
                  placeholder="Accordion item title"
                />
              </div>

              <div>
                <Label className="text-xs">Content</Label>
                <Textarea
                  value={item.content}
                  onChange={e => updateItem(item.id, 'content', e.target.value)}
                  placeholder="Accordion item content"
                  rows={3}
                />
              </div>
            </div>
          ))}

          <Button
            onClick={addItem}
            variant="outline"
            size="sm"
            className="w-full"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Item
          </Button>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          checked={props.allowMultiple}
          onCheckedChange={checked =>
            setProp(
              (props: AccordionBlockProps) => (props.allowMultiple = checked)
            )
          }
        />
        <Label className="text-sm">Allow Multiple Open</Label>
      </div>

      <div>
        <Label className="text-sm font-medium">Variant</Label>
        <Select
          value={props.variant}
          onValueChange={value =>
            setProp(
              (props: AccordionBlockProps) => (props.variant = value as any)
            )
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="default">Default</SelectItem>
            <SelectItem value="bordered">Bordered</SelectItem>
            <SelectItem value="separated">Separated</SelectItem>
            <SelectItem value="flush">Flush</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="text-sm font-medium">Size</Label>
        <Select
          value={props.size}
          onValueChange={value =>
            setProp((props: AccordionBlockProps) => (props.size = value as any))
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="sm">Small</SelectItem>
            <SelectItem value="md">Medium</SelectItem>
            <SelectItem value="lg">Large</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="text-sm font-medium">
          Border Radius: {props.borderRadius}px
        </Label>
        <Slider
          value={[props.borderRadius || 0]}
          onValueChange={([value]) =>
            setProp(
              (props: AccordionBlockProps) => (props.borderRadius = value)
            )
          }
          max={50}
          step={1}
        />
      </div>

      <div>
        <Label className="text-sm font-medium">
          Padding: {props.padding}px
        </Label>
        <Slider
          value={[props.padding || 0]}
          onValueChange={([value]) =>
            setProp((props: AccordionBlockProps) => (props.padding = value))
          }
          max={100}
          step={1}
        />
      </div>

      <div>
        <Label className="text-sm font-medium">
          Spacing: {props.spacing}px
        </Label>
        <Slider
          value={[props.spacing || 0]}
          onValueChange={([value]) =>
            setProp((props: AccordionBlockProps) => (props.spacing = value))
          }
          max={50}
          step={1}
        />
      </div>

      <div>
        <Label className="text-sm font-medium">
          Animation Duration: {props.animationDuration}ms
        </Label>
        <Slider
          value={[props.animationDuration || 0]}
          onValueChange={([value]) =>
            setProp(
              (props: AccordionBlockProps) => (props.animationDuration = value)
            )
          }
          min={100}
          max={1000}
          step={50}
        />
      </div>

      <div>
        <Label className="text-sm font-medium">Background Color</Label>
        <Input
          type="color"
          value={props.backgroundColor}
          onChange={e =>
            setProp(
              (props: AccordionBlockProps) =>
                (props.backgroundColor = e.target.value)
            )
          }
        />
      </div>

      <div>
        <Label className="text-sm font-medium">Border Color</Label>
        <Input
          type="color"
          value={props.borderColor}
          onChange={e =>
            setProp(
              (props: AccordionBlockProps) =>
                (props.borderColor = e.target.value)
            )
          }
        />
      </div>

      <div>
        <Label className="text-sm font-medium">Header Background</Label>
        <Input
          type="color"
          value={props.headerBackgroundColor}
          onChange={e =>
            setProp(
              (props: AccordionBlockProps) =>
                (props.headerBackgroundColor = e.target.value)
            )
          }
        />
      </div>

      <div>
        <Label className="text-sm font-medium">Header Text Color</Label>
        <Input
          type="color"
          value={props.headerTextColor}
          onChange={e =>
            setProp(
              (props: AccordionBlockProps) =>
                (props.headerTextColor = e.target.value)
            )
          }
        />
      </div>

      <div>
        <Label className="text-sm font-medium">Content Background</Label>
        <Input
          type="color"
          value={props.contentBackgroundColor}
          onChange={e =>
            setProp(
              (props: AccordionBlockProps) =>
                (props.contentBackgroundColor = e.target.value)
            )
          }
        />
      </div>

      <div>
        <Label className="text-sm font-medium">Content Text Color</Label>
        <Input
          type="color"
          value={props.contentTextColor}
          onChange={e =>
            setProp(
              (props: AccordionBlockProps) =>
                (props.contentTextColor = e.target.value)
            )
          }
        />
      </div>

      <div>
        <Label className="text-sm font-medium">Icon Color</Label>
        <Input
          type="color"
          value={props.iconColor}
          onChange={e =>
            setProp(
              (props: AccordionBlockProps) => (props.iconColor = e.target.value)
            )
          }
        />
      </div>

      <div>
        <Label className="text-sm font-medium">Width</Label>
        <Input
          value={props.width}
          onChange={e =>
            setProp(
              (props: AccordionBlockProps) => (props.width = e.target.value)
            )
          }
          placeholder="e.g., 100%, 500px, auto"
        />
      </div>
    </div>
  )
}
;(AccordionBlock as any).craft = {
  props: {
    items: [
      {
        id: '1',
        title: 'Accordion Item 1',
        content: 'Content for accordion item 1',
        isOpen: false,
      },
      {
        id: '2',
        title: 'Accordion Item 2',
        content: 'Content for accordion item 2',
        isOpen: false,
      },
    ],
    allowMultiple: false,
    variant: 'default',
    size: 'md',
    backgroundColor: '#ffffff',
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 0,
    margin: 0,
    width: '100%',
    headerBackgroundColor: '#f8fafc',
    headerTextColor: '#1e293b',
    contentBackgroundColor: '#ffffff',
    contentTextColor: '#475569',
    iconColor: '#64748b',
    spacing: 0,
    animationDuration: 200,
  },
  related: {
    settings: AccordionBlockSettings,
  },
}
