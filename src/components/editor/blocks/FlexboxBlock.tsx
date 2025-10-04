'use client';

import React from 'react';
import { useNode, UserComponent, Element } from '@craftjs/core';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { ContainerBlock } from './ContainerBlock';

export interface FlexboxBlockProps {
  direction?: 'row' | 'row-reverse' | 'column' | 'column-reverse';
  wrap?: 'nowrap' | 'wrap' | 'wrap-reverse';
  justifyContent?: 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around' | 'space-evenly';
  alignItems?: 'stretch' | 'flex-start' | 'flex-end' | 'center' | 'baseline';
  alignContent?: 'stretch' | 'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around';
  gap?: number;
  rowGap?: number;
  columnGap?: number;
  width?: string;
  height?: string;
  minHeight?: string;
  maxHeight?: string;
  padding?: number;
  marginTop?: number;
  marginBottom?: number;
  marginLeft?: number;
  marginRight?: number;
  backgroundColor?: string;
  borderRadius?: number;
  border?: string;
  borderWidth?: number;
  borderColor?: string;
  borderStyle?: 'solid' | 'dashed' | 'dotted' | 'double' | 'groove' | 'ridge' | 'inset' | 'outset';
  boxShadow?: string;
  itemCount?: number;
  className?: string;
}

export const FlexboxBlock: UserComponent<FlexboxBlockProps> = ({
  direction = 'row',
  wrap = 'nowrap',
  justifyContent = 'flex-start',
  alignItems = 'stretch',
  alignContent = 'stretch',
  gap = 16,
  rowGap,
  columnGap,
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
  itemCount = 3,
  className = ''
}) => {
  const {
    connectors: { connect, drag },
    selected,
    actions: { setProp }
  } = useNode((state) => ({
    selected: state.events.selected,
  }));

  const flexStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: direction,
    flexWrap: wrap,
    justifyContent,
    alignItems,
    alignContent,
    gap: rowGap !== undefined || columnGap !== undefined ? 
         `${rowGap || gap}px ${columnGap || gap}px` : `${gap}px`,
    width,
    height,
    minHeight: minHeight || undefined,
    maxHeight: maxHeight || undefined,
    padding: `${padding}px`,
    margin: `${marginTop}px ${marginRight}px ${marginBottom}px ${marginLeft}px`,
    backgroundColor: backgroundColor === 'transparent' ? undefined : backgroundColor,
    borderRadius: borderRadius ? `${borderRadius}px` : undefined,
    border: border || (borderWidth > 0 ? `${borderWidth}px ${borderStyle} ${borderColor}` : undefined),
    boxShadow: boxShadow || undefined,
  };

  // Generate flex items based on itemCount
  const flexItems = Array.from({ length: itemCount }, (_, index) => (
    <Element
      key={index}
      id={`flex-item-${index}`}
      is={ContainerBlock}
      canvas
      custom={{
        displayName: `Flex Item ${index + 1}`,
      }}
    />
  ));

  return (
    <div
      ref={(ref) => {
        if (ref) {
          connect(drag(ref));
        }
      }}
      className={`flexbox-block ${selected ? 'ring-2 ring-blue-500' : ''} ${className}`}
      style={flexStyle}
    >
      {flexItems}
    </div>
  );
};

export const FlexboxBlockSettings: React.FC = () => {
  const {
    actions: { setProp },
    props
  } = useNode((node) => ({
    props: node.data.props as FlexboxBlockProps,
  }));

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="flex-direction">Flex Direction</Label>
        <Select
          value={props.direction}
          onValueChange={(value: string) =>
            setProp((props: FlexboxBlockProps) => (props.direction = value as FlexboxBlockProps['direction']))
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="row">Row</SelectItem>
            <SelectItem value="row-reverse">Row Reverse</SelectItem>
            <SelectItem value="column">Column</SelectItem>
            <SelectItem value="column-reverse">Column Reverse</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="flex-wrap">Flex Wrap</Label>
        <Select
          value={props.wrap}
          onValueChange={(value: string) =>
            setProp((props: FlexboxBlockProps) => (props.wrap = value as FlexboxBlockProps['wrap']))
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="nowrap">No Wrap</SelectItem>
            <SelectItem value="wrap">Wrap</SelectItem>
            <SelectItem value="wrap-reverse">Wrap Reverse</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="justify-content">Justify Content</Label>
        <Select
          value={props.justifyContent}
          onValueChange={(value: string) =>
            setProp((props: FlexboxBlockProps) => (props.justifyContent = value as FlexboxBlockProps['justifyContent']))
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="flex-start">Flex Start</SelectItem>
            <SelectItem value="flex-end">Flex End</SelectItem>
            <SelectItem value="center">Center</SelectItem>
            <SelectItem value="space-between">Space Between</SelectItem>
            <SelectItem value="space-around">Space Around</SelectItem>
            <SelectItem value="space-evenly">Space Evenly</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="align-items">Align Items</Label>
        <Select
          value={props.alignItems}
          onValueChange={(value: string) =>
            setProp((props: FlexboxBlockProps) => (props.alignItems = value as FlexboxBlockProps['alignItems']))
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="stretch">Stretch</SelectItem>
            <SelectItem value="flex-start">Flex Start</SelectItem>
            <SelectItem value="flex-end">Flex End</SelectItem>
            <SelectItem value="center">Center</SelectItem>
            <SelectItem value="baseline">Baseline</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="align-content">Align Content</Label>
        <Select
          value={props.alignContent}
          onValueChange={(value: string) =>
            setProp((props: FlexboxBlockProps) => (props.alignContent = value as FlexboxBlockProps['alignContent']))
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="stretch">Stretch</SelectItem>
            <SelectItem value="flex-start">Flex Start</SelectItem>
            <SelectItem value="flex-end">Flex End</SelectItem>
            <SelectItem value="center">Center</SelectItem>
            <SelectItem value="space-between">Space Between</SelectItem>
            <SelectItem value="space-around">Space Around</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="item-count">Number of Items: {props.itemCount}</Label>
        <Slider
          value={[props.itemCount || 3]}
          onValueChange={([value]) =>
            setProp((props: FlexboxBlockProps) => (props.itemCount = value))
          }
          max={12}
          min={1}
          step={1}
          className="mt-2"
        />
      </div>

      <div>
        <Label htmlFor="flex-gap">Gap: {props.gap}px</Label>
        <Slider
          value={[props.gap || 16]}
          onValueChange={([value]) =>
            setProp((props: FlexboxBlockProps) => (props.gap = value))
          }
          max={100}
          min={0}
          step={1}
          className="mt-2"
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label htmlFor="row-gap">Row Gap: {props.rowGap || 'Auto'}px</Label>
          <Slider
            value={[props.rowGap || props.gap || 16]}
            onValueChange={([value]) =>
              setProp((props: FlexboxBlockProps) => (props.rowGap = value))
            }
            max={100}
            min={0}
            step={1}
            className="mt-2"
          />
        </div>
        <div>
          <Label htmlFor="column-gap">Column Gap: {props.columnGap || 'Auto'}px</Label>
          <Slider
            value={[props.columnGap || props.gap || 16]}
            onValueChange={([value]) =>
              setProp((props: FlexboxBlockProps) => (props.columnGap = value))
            }
            max={100}
            min={0}
            step={1}
            className="mt-2"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="flex-width">Width</Label>
        <Input
          value={props.width}
          onChange={(e) =>
            setProp((props: FlexboxBlockProps) => (props.width = e.target.value))
          }
          placeholder="100%, 500px, auto"
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="flex-height">Height</Label>
        <Input
          value={props.height}
          onChange={(e) =>
            setProp((props: FlexboxBlockProps) => (props.height = e.target.value))
          }
          placeholder="auto, 300px, 100vh"
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="flex-padding">Padding: {props.padding}px</Label>
        <Slider
          value={[props.padding || 16]}
          onValueChange={([value]) =>
            setProp((props: FlexboxBlockProps) => (props.padding = value))
          }
          max={100}
          min={0}
          step={1}
          className="mt-2"
        />
      </div>

      <div>
        <Label htmlFor="flex-background">Background Color</Label>
        <Input
          type="color"
          value={props.backgroundColor === 'transparent' ? '#ffffff' : props.backgroundColor}
          onChange={(e) =>
            setProp((props: FlexboxBlockProps) => (props.backgroundColor = e.target.value))
          }
          className="mt-1"
        />
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            setProp((props: FlexboxBlockProps) => (props.backgroundColor = 'transparent'))
          }
          className="mt-2 w-full"
        >
          Make Transparent
        </Button>
      </div>

      <div>
        <Label htmlFor="border-radius">Border Radius: {props.borderRadius}px</Label>
        <Slider
          value={[props.borderRadius || 0]}
          onValueChange={([value]) =>
            setProp((props: FlexboxBlockProps) => (props.borderRadius = value))
          }
          max={50}
          min={0}
          step={1}
          className="mt-2"
        />
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div>
          <Label htmlFor="border-width">Border Width: {props.borderWidth}px</Label>
          <Slider
            value={[props.borderWidth || 0]}
            onValueChange={([value]) =>
              setProp((props: FlexboxBlockProps) => (props.borderWidth = value))
            }
            max={10}
            min={0}
            step={1}
            className="mt-2"
          />
        </div>
        <div>
          <Label htmlFor="border-style">Border Style</Label>
          <Select
            value={props.borderStyle}
            onValueChange={(value: string) =>
              setProp((props: FlexboxBlockProps) => (props.borderStyle = value as FlexboxBlockProps['borderStyle']))
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="solid">Solid</SelectItem>
              <SelectItem value="dashed">Dashed</SelectItem>
              <SelectItem value="dotted">Dotted</SelectItem>
              <SelectItem value="double">Double</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="border-color">Border Color</Label>
          <Input
            type="color"
            value={props.borderColor}
            onChange={(e) =>
              setProp((props: FlexboxBlockProps) => (props.borderColor = e.target.value))
            }
            className="mt-1"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label htmlFor="margin-top">Margin Top: {props.marginTop}px</Label>
          <Slider
            value={[props.marginTop || 0]}
            onValueChange={([value]) =>
              setProp((props: FlexboxBlockProps) => (props.marginTop = value))
            }
            max={100}
            min={0}
            step={1}
            className="mt-2"
          />
        </div>
        <div>
          <Label htmlFor="margin-bottom">Margin Bottom: {props.marginBottom}px</Label>
          <Slider
            value={[props.marginBottom || 0]}
            onValueChange={([value]) =>
              setProp((props: FlexboxBlockProps) => (props.marginBottom = value))
            }
            max={100}
            min={0}
            step={1}
            className="mt-2"
          />
        </div>
      </div>
    </div>
  );
};

(FlexboxBlock as any).craft = {
  props: {
    direction: 'row',
    wrap: 'nowrap',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    alignContent: 'stretch',
    gap: 16,
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
    itemCount: 3,
  },
  related: {
    settings: FlexboxBlockSettings,
  },
};