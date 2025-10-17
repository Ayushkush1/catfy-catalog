'use client';

import React from 'react';
import { useNode } from '@craftjs/core';
import { BlockWrapper } from '../components/BlockWrapper';

export interface ButtonBlockProps {
  text: string;
  href: string;
  target: '_self' | '_blank' | '_parent' | '_top';
  variant: 'primary' | 'secondary' | 'outline' | 'ghost' | 'link';
  size: 'sm' | 'md' | 'lg' | 'xl';
  fontSize: number;
  fontWeight: 'normal' | 'bold' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
  fontFamily: string;
  color: string;
  backgroundColor: string;
  borderColor: string;
  borderWidth: number;
  borderRadius: number;
  padding: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  margin: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  width: 'auto' | 'full' | 'fit';
  textAlign: 'left' | 'center' | 'right';
  shadow: {
    enabled: boolean;
    x: number;
    y: number;
    blur: number;
    color: string;
  };
  hoverEffect: {
    enabled: boolean;
    backgroundColor: string;
    color: string;
    transform: 'none' | 'scale' | 'translateY';
    transformValue: number;
  };
  icon: {
    enabled: boolean;
    name: string;
    position: 'left' | 'right';
    size: number;
  };
  animation: {
    type: 'none' | 'fadeIn' | 'slideIn' | 'bounce' | 'pulse';
    duration: number;
    delay: number;
  };
}

const defaultProps: ButtonBlockProps = {
  text: 'Click me',
  href: '#',
  target: '_self',
  variant: 'primary',
  size: 'md',
  fontSize: 16,
  fontWeight: '500',
  fontFamily: 'Inter, sans-serif',
  color: '#ffffff',
  backgroundColor: '#3b82f6',
  borderColor: '#3b82f6',
  borderWidth: 1,
  borderRadius: 6,
  padding: { top: 12, right: 24, bottom: 12, left: 24 },
  margin: { top: 0, right: 0, bottom: 0, left: 0 },
  width: 'auto',
  textAlign: 'center',
  shadow: { enabled: false, x: 0, y: 0, blur: 0, color: '#000000' },
  hoverEffect: {
    enabled: true,
    backgroundColor: '#2563eb',
    color: '#ffffff',
    transform: 'none',
    transformValue: 0
  },
  icon: { enabled: false, name: '', position: 'left', size: 16 },
  animation: { type: 'none', duration: 300, delay: 0 }
};

export const ButtonBlock: React.FC<Partial<ButtonBlockProps>> = (props) => {
  const {
    actions: { setProp }
  } = useNode();

  const finalProps = { ...defaultProps, ...props };

  const {
    text,
    href,
    target,
    variant,
    size,
    fontSize,
    fontWeight,
    fontFamily,
    color,
    backgroundColor,
    borderColor,
    borderWidth,
    borderRadius,
    padding,
    margin,
    width,
    textAlign,
    shadow,
    hoverEffect,
    icon,
    animation
  } = finalProps;

  const buttonStyle: React.CSSProperties = {
    fontSize: `${fontSize}px`,
    fontWeight,
    fontFamily,
    color,
    backgroundColor,
    border: `${borderWidth}px solid ${borderColor}`,
    borderRadius: `${borderRadius}px`,
    padding: `${padding.top}px ${padding.right}px ${padding.bottom}px ${padding.left}px`,
    margin: `${margin.top}px ${margin.right}px ${margin.bottom}px ${margin.left}px`,
    width: width === 'full' ? '100%' : width === 'fit' ? 'fit-content' : 'auto',
    textAlign,
    boxShadow: shadow.enabled ? `${shadow.x}px ${shadow.y}px ${shadow.blur}px ${shadow.color}` : 'none',
    cursor: 'pointer',
    textDecoration: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: icon.enabled ? '8px' : '0',
    transition: 'all 0.2s ease-in-out',
    outline: 'none',
    userSelect: 'none'
  };



  // Size presets
  const sizePresets = {
    sm: { fontSize: 14, padding: { top: 8, right: 16, bottom: 8, left: 16 } },
    md: { fontSize: 16, padding: { top: 12, right: 24, bottom: 12, left: 24 } },
    lg: { fontSize: 18, padding: { top: 16, right: 32, bottom: 16, left: 32 } },
    xl: { fontSize: 20, padding: { top: 20, right: 40, bottom: 20, left: 40 } }
  };

  // Apply size preset if using preset sizes
  if (sizePresets[size]) {
    const preset = sizePresets[size];
    buttonStyle.fontSize = `${preset.fontSize}px`;
    buttonStyle.padding = `${preset.padding.top}px ${preset.padding.right}px ${preset.padding.bottom}px ${preset.padding.left}px`;
  }

  // Variant styles
  const variantStyles = {
    primary: {
      backgroundColor: '#3b82f6',
      color: '#ffffff',
      borderColor: '#3b82f6'
    },
    secondary: {
      backgroundColor: '#6b7280',
      color: '#ffffff',
      borderColor: '#6b7280'
    },
    outline: {
      backgroundColor: 'transparent',
      color: '#3b82f6',
      borderColor: '#3b82f6'
    },
    ghost: {
      backgroundColor: 'transparent',
      color: '#3b82f6',
      borderColor: 'transparent'
    },
    link: {
      backgroundColor: 'transparent',
      color: '#3b82f6',
      borderColor: 'transparent',
      textDecoration: 'underline'
    }
  };

  // Apply variant styles if using preset variants
  if (variantStyles[variant]) {
    const variantStyle = variantStyles[variant];
    Object.assign(buttonStyle, variantStyle);
  }

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (href && href !== '#') {
      window.open(href, target);
    }
  };

  const handleTextEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newText = prompt('Edit button text:', text);
    if (newText !== null) {
      setProp((props: ButtonBlockProps) => {
        props.text = newText;
      });
    }
  };

  return (
    <BlockWrapper>
      <button
        className={`button-block ${animation.type !== 'none' ? `animate-${animation.type}` : ''}`}
        style={buttonStyle}
        onClick={handleClick}
        onDoubleClick={handleTextEdit}
        onMouseEnter={(e) => {
          if (hoverEffect.enabled) {
            const target = e.target as HTMLElement;
            target.style.backgroundColor = hoverEffect.backgroundColor;
            target.style.color = hoverEffect.color;
            if (hoverEffect.transform === 'scale') {
              target.style.transform = `scale(${1 + hoverEffect.transformValue / 100})`;
            } else if (hoverEffect.transform === 'translateY') {
              target.style.transform = `translateY(-${hoverEffect.transformValue}px)`;
            }
          }
        }}
        onMouseLeave={(e) => {
          if (hoverEffect.enabled) {
            const target = e.target as HTMLElement;
            target.style.backgroundColor = backgroundColor;
            target.style.color = color;
            target.style.transform = 'none';
          }
        }}
      >
        {icon.enabled && icon.position === 'left' && (
          <span style={{ fontSize: `${icon.size}px` }}>
            {/* Icon placeholder - you can integrate with an icon library */}
            ⭐
          </span>
        )}
        {text}
        {icon.enabled && icon.position === 'right' && (
          <span style={{ fontSize: `${icon.size}px` }}>
            {/* Icon placeholder - you can integrate with an icon library */}
            ⭐
          </span>
        )}
      </button>
    </BlockWrapper>
  );
};

// Settings component for the ButtonBlock
export const ButtonBlockSettings: React.FC = () => {
  const {
    actions: { setProp },
    props
  } = useNode((node) => ({
    props: node.data.props as ButtonBlockProps
  }));

  return (
    <div className="space-y-4">
      {/* Button Content */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Button Text
        </label>
        <input
          type="text"
          value={props.text}
          onChange={(e) => setProp((props: ButtonBlockProps) => {
            props.text = e.target.value;
          })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2D1B69]"
        />
      </div>

      {/* Link */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Link URL
        </label>
        <input
          type="url"
          value={props.href}
          onChange={(e) => setProp((props: ButtonBlockProps) => {
            props.href = e.target.value;
          })}
          placeholder="https://example.com"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2D1B69]"
        />
      </div>

      {/* Target */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Link Target
        </label>
        <select
          value={props.target}
          onChange={(e) => setProp((props: ButtonBlockProps) => {
            props.target = e.target.value as any;
          })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2D1B69]"
        >
          <option value="_self">Same window</option>
          <option value="_blank">New window</option>
          <option value="_parent">Parent frame</option>
          <option value="_top">Top frame</option>
        </select>
      </div>

      {/* Style */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-900">Style</h4>
        
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Variant</label>
            <select
              value={props.variant}
              onChange={(e) => setProp((props: ButtonBlockProps) => {
                props.variant = e.target.value as any;
              })}
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
            >
              <option value="primary">Primary</option>
              <option value="secondary">Secondary</option>
              <option value="outline">Outline</option>
              <option value="ghost">Ghost</option>
              <option value="link">Link</option>
            </select>
          </div>
          
          <div>
            <label className="block text-xs text-gray-600 mb-1">Size</label>
            <select
              value={props.size}
              onChange={(e) => setProp((props: ButtonBlockProps) => {
                props.size = e.target.value as any;
              })}
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
            >
              <option value="sm">Small</option>
              <option value="md">Medium</option>
              <option value="lg">Large</option>
              <option value="xl">Extra Large</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Background Color</label>
            <input
              type="color"
              value={props.backgroundColor}
              onChange={(e) => setProp((props: ButtonBlockProps) => {
                props.backgroundColor = e.target.value;
              })}
              className="w-full h-8 border border-gray-300 rounded"
            />
          </div>
          
          <div>
            <label className="block text-xs text-gray-600 mb-1">Text Color</label>
            <input
              type="color"
              value={props.color}
              onChange={(e) => setProp((props: ButtonBlockProps) => {
                props.color = e.target.value;
              })}
              className="w-full h-8 border border-gray-300 rounded"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs text-gray-600 mb-1">Border Radius</label>
          <input
            type="number"
            value={props.borderRadius}
            onChange={(e) => setProp((props: ButtonBlockProps) => {
              props.borderRadius = parseInt(e.target.value) || 0;
            })}
            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
          />
        </div>

        <div>
          <label className="block text-xs text-gray-600 mb-1">Width</label>
          <select
            value={props.width}
            onChange={(e) => setProp((props: ButtonBlockProps) => {
              props.width = e.target.value as any;
            })}
            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
          >
            <option value="auto">Auto</option>
            <option value="full">Full Width</option>
            <option value="fit">Fit Content</option>
          </select>
        </div>
      </div>

      {/* Hover Effects */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-900">Hover Effects</h4>
        
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={props.hoverEffect.enabled}
            onChange={(e) => setProp((props: ButtonBlockProps) => {
              props.hoverEffect.enabled = e.target.checked;
            })}
            className="rounded"
          />
          <label className="text-xs text-gray-600">Enable hover effects</label>
        </div>

        {props.hoverEffect.enabled && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Hover Background</label>
              <input
                type="color"
                value={props.hoverEffect.backgroundColor}
                onChange={(e) => setProp((props: ButtonBlockProps) => {
                  props.hoverEffect.backgroundColor = e.target.value;
                })}
                className="w-full h-8 border border-gray-300 rounded"
              />
            </div>
            
            <div>
              <label className="block text-xs text-gray-600 mb-1">Hover Text Color</label>
              <input
                type="color"
                value={props.hoverEffect.color}
                onChange={(e) => setProp((props: ButtonBlockProps) => {
                  props.hoverEffect.color = e.target.value;
                })}
                className="w-full h-8 border border-gray-300 rounded"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Craft.js configuration
(ButtonBlock as any).craft = {
  props: defaultProps,
  related: {
    settings: ButtonBlockSettings
  },
  displayName: 'Button'
};