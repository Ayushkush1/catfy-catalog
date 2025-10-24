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
import { Plus, X, ChevronUp, ChevronDown } from 'lucide-react'

export interface Tab {
  id: string
  label: string
  content: string
}

export interface TabsBlockProps {
  tabs: Tab[]
  activeTab?: string
  variant?: 'default' | 'pills' | 'underline' | 'bordered'
  size?: 'sm' | 'md' | 'lg'
  orientation?: 'horizontal' | 'vertical'
  tabsPosition?: 'start' | 'center' | 'end'
  backgroundColor?: string
  borderColor?: string
  borderRadius?: number
  padding?: number
  margin?: number
  width?: string
  height?: string
  activeTabColor?: string
  inactiveTabColor?: string
  contentBackgroundColor?: string
  contentPadding?: number
  tabSpacing?: number
}

export const TabsBlock: React.FC<TabsBlockProps> = ({
  tabs = [
    { id: '1', label: 'Tab 1', content: 'Content for tab 1' },
    { id: '2', label: 'Tab 2', content: 'Content for tab 2' },
  ],
  activeTab,
  variant = 'default',
  size = 'md',
  orientation = 'horizontal',
  tabsPosition = 'start',
  backgroundColor = '#ffffff',
  borderColor = '#e2e8f0',
  borderRadius = 8,
  padding = 16,
  margin = 0,
  width = '100%',
  height = 'auto',
  activeTabColor = '#3b82f6',
  inactiveTabColor = '#64748b',
  contentBackgroundColor = '#ffffff',
  contentPadding = 16,
  tabSpacing = 4,
}) => {
  const {
    connectors: { connect, drag },
  } = useNode()
  const [currentActiveTab, setCurrentActiveTab] = useState(
    activeTab || tabs[0]?.id || ''
  )

  const sizeClasses = {
    sm: 'text-sm px-3 py-1.5',
    md: 'text-base px-4 py-2',
    lg: 'text-lg px-6 py-3',
  }

  const getTabStyles = (isActive: boolean) => {
    const baseStyles = {
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      borderRadius: variant === 'pills' ? `${borderRadius}px` : '0',
      color: isActive ? activeTabColor : inactiveTabColor,
      backgroundColor:
        isActive && variant === 'pills' ? `${activeTabColor}20` : 'transparent',
      borderBottom:
        variant === 'underline' && isActive
          ? `2px solid ${activeTabColor}`
          : 'none',
      border: variant === 'bordered' ? `1px solid ${borderColor}` : 'none',
      marginRight: orientation === 'horizontal' ? `${tabSpacing}px` : '0',
      marginBottom: orientation === 'vertical' ? `${tabSpacing}px` : '0',
    }

    return baseStyles
  }

  const containerStyles = {
    backgroundColor,
    borderRadius: `${borderRadius}px`,
    padding: `${padding}px`,
    margin: `${margin}px`,
    width,
    height,
    border: `1px solid ${borderColor}`,
    display: 'flex',
    flexDirection:
      orientation === 'vertical' ? 'row' : ('column' as 'row' | 'column'),
  }

  const tabsContainerStyles = {
    display: 'flex',
    flexDirection:
      orientation === 'horizontal' ? 'row' : ('column' as 'row' | 'column'),
    justifyContent: tabsPosition,
    borderBottom:
      variant === 'default' && orientation === 'horizontal'
        ? `1px solid ${borderColor}`
        : 'none',
    borderRight:
      variant === 'default' && orientation === 'vertical'
        ? `1px solid ${borderColor}`
        : 'none',
    marginBottom: orientation === 'horizontal' ? '16px' : '0',
    marginRight: orientation === 'vertical' ? '16px' : '0',
    minWidth: orientation === 'vertical' ? '200px' : 'auto',
  }

  const contentStyles = {
    backgroundColor: contentBackgroundColor,
    padding: `${contentPadding}px`,
    borderRadius: `${borderRadius}px`,
    flex: 1,
    minHeight: '100px',
  }

  const activeTabContent =
    tabs.find(tab => tab.id === currentActiveTab)?.content || ''

  return (
    <div
      ref={ref => {
        if (ref) {
          connect(drag(ref))
        }
      }}
      style={containerStyles}
      className="tabs-block"
    >
      <div style={tabsContainerStyles}>
        {tabs.map(tab => (
          <div
            key={tab.id}
            style={getTabStyles(tab.id === currentActiveTab)}
            className={`${sizeClasses[size]} select-none`}
            onClick={() => setCurrentActiveTab(tab.id)}
          >
            {tab.label}
          </div>
        ))}
      </div>

      <div style={contentStyles}>
        <div className="whitespace-pre-wrap">{activeTabContent}</div>
      </div>
    </div>
  )
}

export const TabsBlockSettings: React.FC = () => {
  const {
    actions: { setProp },
    props,
  } = useNode(node => ({
    props: node.data.props as TabsBlockProps,
  }))

  const addTab = () => {
    const newTab: Tab = {
      id: Date.now().toString(),
      label: `Tab ${props.tabs.length + 1}`,
      content: `Content for tab ${props.tabs.length + 1}`,
    }
    setProp((props: TabsBlockProps) => {
      props.tabs.push(newTab)
    })
  }

  const removeTab = (tabId: string) => {
    if (props.tabs.length > 1) {
      setProp((props: TabsBlockProps) => {
        props.tabs = props.tabs.filter(tab => tab.id !== tabId)
        if (props.activeTab === tabId) {
          props.activeTab = props.tabs[0]?.id
        }
      })
    }
  }

  const updateTab = (
    tabId: string,
    field: 'label' | 'content',
    value: string
  ) => {
    setProp((props: TabsBlockProps) => {
      const tab = props.tabs.find(t => t.id === tabId)
      if (tab) {
        tab[field] = value
      }
    })
  }

  const moveTab = (tabId: string, direction: 'up' | 'down') => {
    setProp((props: TabsBlockProps) => {
      const currentIndex = props.tabs.findIndex(tab => tab.id === tabId)
      const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1

      if (newIndex >= 0 && newIndex < props.tabs.length) {
        const [movedTab] = props.tabs.splice(currentIndex, 1)
        props.tabs.splice(newIndex, 0, movedTab)
      }
    })
  }

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-sm font-medium">Tabs</Label>
        <div className="mt-2 space-y-2">
          {props.tabs.map((tab, index) => (
            <div key={tab.id} className="space-y-2 rounded-lg border p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Tab {index + 1}</span>
                <div className="flex items-center gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => moveTab(tab.id, 'up')}
                    disabled={index === 0}
                  >
                    <ChevronUp className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => moveTab(tab.id, 'down')}
                    disabled={index === props.tabs.length - 1}
                  >
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeTab(tab.id)}
                    disabled={props.tabs.length <= 1}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              <div>
                <Label className="text-xs">Label</Label>
                <Input
                  value={tab.label}
                  onChange={e => updateTab(tab.id, 'label', e.target.value)}
                  placeholder="Tab label"
                />
              </div>

              <div>
                <Label className="text-xs">Content</Label>
                <Textarea
                  value={tab.content}
                  onChange={e => updateTab(tab.id, 'content', e.target.value)}
                  placeholder="Tab content"
                  rows={3}
                />
              </div>
            </div>
          ))}

          <Button
            onClick={addTab}
            variant="outline"
            size="sm"
            className="w-full"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Tab
          </Button>
        </div>
      </div>

      <div>
        <Label className="text-sm font-medium">Variant</Label>
        <Select
          value={props.variant}
          onValueChange={value =>
            setProp((props: TabsBlockProps) => (props.variant = value as any))
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="default">Default</SelectItem>
            <SelectItem value="pills">Pills</SelectItem>
            <SelectItem value="underline">Underline</SelectItem>
            <SelectItem value="bordered">Bordered</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="text-sm font-medium">Size</Label>
        <Select
          value={props.size}
          onValueChange={value =>
            setProp((props: TabsBlockProps) => (props.size = value as any))
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
        <Label className="text-sm font-medium">Orientation</Label>
        <Select
          value={props.orientation}
          onValueChange={value =>
            setProp(
              (props: TabsBlockProps) => (props.orientation = value as any)
            )
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="horizontal">Horizontal</SelectItem>
            <SelectItem value="vertical">Vertical</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="text-sm font-medium">Tabs Position</Label>
        <Select
          value={props.tabsPosition}
          onValueChange={value =>
            setProp(
              (props: TabsBlockProps) => (props.tabsPosition = value as any)
            )
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="start">Start</SelectItem>
            <SelectItem value="center">Center</SelectItem>
            <SelectItem value="end">End</SelectItem>
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
            setProp((props: TabsBlockProps) => (props.borderRadius = value))
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
            setProp((props: TabsBlockProps) => (props.padding = value))
          }
          max={100}
          step={1}
        />
      </div>

      <div>
        <Label className="text-sm font-medium">
          Content Padding: {props.contentPadding}px
        </Label>
        <Slider
          value={[props.contentPadding || 0]}
          onValueChange={([value]) =>
            setProp((props: TabsBlockProps) => (props.contentPadding = value))
          }
          max={100}
          step={1}
        />
      </div>

      <div>
        <Label className="text-sm font-medium">
          Tab Spacing: {props.tabSpacing}px
        </Label>
        <Slider
          value={[props.tabSpacing || 0]}
          onValueChange={([value]) =>
            setProp((props: TabsBlockProps) => (props.tabSpacing = value))
          }
          max={20}
          step={1}
        />
      </div>

      <div>
        <Label className="text-sm font-medium">Background Color</Label>
        <Input
          type="color"
          value={props.backgroundColor}
          onChange={e =>
            setProp(
              (props: TabsBlockProps) =>
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
              (props: TabsBlockProps) => (props.borderColor = e.target.value)
            )
          }
        />
      </div>

      <div>
        <Label className="text-sm font-medium">Active Tab Color</Label>
        <Input
          type="color"
          value={props.activeTabColor}
          onChange={e =>
            setProp(
              (props: TabsBlockProps) => (props.activeTabColor = e.target.value)
            )
          }
        />
      </div>

      <div>
        <Label className="text-sm font-medium">Inactive Tab Color</Label>
        <Input
          type="color"
          value={props.inactiveTabColor}
          onChange={e =>
            setProp(
              (props: TabsBlockProps) =>
                (props.inactiveTabColor = e.target.value)
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
              (props: TabsBlockProps) =>
                (props.contentBackgroundColor = e.target.value)
            )
          }
        />
      </div>

      <div>
        <Label className="text-sm font-medium">Width</Label>
        <Input
          value={props.width}
          onChange={e =>
            setProp((props: TabsBlockProps) => (props.width = e.target.value))
          }
          placeholder="e.g., 100%, 500px, auto"
        />
      </div>

      <div>
        <Label className="text-sm font-medium">Height</Label>
        <Input
          value={props.height}
          onChange={e =>
            setProp((props: TabsBlockProps) => (props.height = e.target.value))
          }
          placeholder="e.g., auto, 300px, 100vh"
        />
      </div>
    </div>
  )
}
;(TabsBlock as any).craft = {
  props: {
    tabs: [
      { id: '1', label: 'Tab 1', content: 'Content for tab 1' },
      { id: '2', label: 'Tab 2', content: 'Content for tab 2' },
    ],
    variant: 'default',
    size: 'md',
    orientation: 'horizontal',
    tabsPosition: 'start',
    backgroundColor: '#ffffff',
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 16,
    margin: 0,
    width: '100%',
    height: 'auto',
    activeTabColor: '#3b82f6',
    inactiveTabColor: '#64748b',
    contentBackgroundColor: '#ffffff',
    contentPadding: 16,
    tabSpacing: 4,
  },
  related: {
    settings: TabsBlockSettings,
  },
}
