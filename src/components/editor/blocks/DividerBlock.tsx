'use client';

import React from 'react';
import { useNode, UserComponent } from '@craftjs/core';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';

export interface DividerBlockProps {
  style?: 'solid' | 'dashed' | 'dotted' | 'double' | 'groove' | 'ridge' | 'inset' | 'outset';
  thickness?: number;
  color?: string;
  width?: string;
  alignment?: 'left' | 'center' | 'right';
  marginTop?: number;
  marginBottom?: number;
  marginLeft?: number;
  marginRight?: number;
  opacity?: number;
  className?: string;
}

export const DividerBlock: UserComponent<DividerBlockProps> = ({
  style = 'solid',
  thickness = 1,
  color = '#e5e7eb',
  width = '100%',
  alignment = 'center',
  marginTop = 16,
  marginBottom = 16,
  marginLeft = 0,
  marginRight = 0,
  opacity = 1,
  className = ''
}) => {
  const {
    connectors: { connect, drag },
    selected,
    actions: { setProp }
  } = useNode((state) => ({
    selected: state.events.selected,
  }));

  const dividerStyle: React.CSSProperties = {
    borderTop: `${thickness}px ${style} ${color}`,
    width,
    margin: `${marginTop}px ${marginRight}px ${marginBottom}px ${marginLeft}px`,
    opacity,
    alignSelf: alignment === 'left' ? 'flex-start' : 
               alignment === 'right' ? 'flex-end' : 'center',
  };

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: alignment === 'left' ? 'flex-start' : 
                   alignment === 'right' ? 'flex-end' : 'center',
    width: '100%',
  };

  return (
    <div
      ref={(ref) => {
        if (ref) {
          connect(drag(ref));
        }
      }}
      className={`divider-block ${selected ? 'ring-2 ring-blue-500' : ''} ${className}`}
      style={containerStyle}
    >
      <hr style={dividerStyle} />
    </div>
  );
};

export const DividerBlockSettings: React.FC = () => {
  const {
    actions: { setProp },
    props
  } = useNode((node) => ({
    props: node.data.props as DividerBlockProps,
  }));

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="divider-style">Style</Label>
        <Select
          value={props.style}
          onValueChange={(value: string) =>
            setProp((props: DividerBlockProps) => (props.style = value as DividerBlockProps['style']))
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
            <SelectItem value="groove">Groove</SelectItem>
            <SelectItem value="ridge">Ridge</SelectItem>
            <SelectItem value="inset">Inset</SelectItem>
            <SelectItem value="outset">Outset</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="divider-thickness">Thickness: {props.thickness}px</Label>
        <Slider
          value={[props.thickness || 1]}
          onValueChange={([value]) =>
            setProp((props: DividerBlockProps) => (props.thickness = value))
          }
          max={10}
          min={1}
          step={1}
          className="mt-2"
        />
      </div>

      <div>
        <Label htmlFor="divider-color">Color</Label>
        <Input
          type="color"
          value={props.color}
          onChange={(e) =>
            setProp((props: DividerBlockProps) => (props.color = e.target.value))
          }
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="divider-width">Width</Label>
        <Input
          value={props.width}
          onChange={(e) =>
            setProp((props: DividerBlockProps) => (props.width = e.target.value))
          }
          placeholder="100%, 200px, etc."
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="divider-alignment">Alignment</Label>
        <Select
          value={props.alignment}
          onValueChange={(value: string) =>
            setProp((props: DividerBlockProps) => (props.alignment = value as DividerBlockProps['alignment']))
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
        <Label htmlFor="divider-opacity">Opacity: {Math.round((props.opacity || 1) * 100)}%</Label>
        <Slider
          value={[(props.opacity || 1) * 100]}
          onValueChange={([value]) =>
            setProp((props: DividerBlockProps) => (props.opacity = value / 100))
          }
          max={100}
          min={0}
          step={1}
          className="mt-2"
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label htmlFor="margin-top">Margin Top: {props.marginTop}px</Label>
          <Slider
            value={[props.marginTop || 16]}
            onValueChange={([value]) =>
              setProp((props: DividerBlockProps) => (props.marginTop = value))
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
            value={[props.marginBottom || 16]}
            onValueChange={([value]) =>
              setProp((props: DividerBlockProps) => (props.marginBottom = value))
            }
            max={100}
            min={0}
            step={1}
            className="mt-2"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label htmlFor="margin-left">Margin Left: {props.marginLeft}px</Label>
          <Slider
            value={[props.marginLeft || 0]}
            onValueChange={([value]) =>
              setProp((props: DividerBlockProps) => (props.marginLeft = value))
            }
            max={100}
            min={0}
            step={1}
            className="mt-2"
          />
        </div>
        <div>
          <Label htmlFor="margin-right">Margin Right: {props.marginRight}px</Label>
          <Slider
            value={[props.marginRight || 0]}
            onValueChange={([value]) =>
              setProp((props: DividerBlockProps) => (props.marginRight = value))
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

(DividerBlock as any).craft = {
  props: {
    style: 'solid',
    thickness: 1,
    color: '#e5e7eb',
    width: '100%',
    alignment: 'center',
    marginTop: 16,
    marginBottom: 16,
    marginLeft: 0,
    marginRight: 0,
    opacity: 1,
  },
  related: {
    settings: DividerBlockSettings,
  },
};