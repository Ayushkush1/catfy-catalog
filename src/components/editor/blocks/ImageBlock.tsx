'use client';

import React, { useState, useRef } from 'react';
import { useNode } from '@craftjs/core';
import { BlockWrapper } from '../components/BlockWrapper';

export interface ImageBlockProps {
  src: string;
  alt: string;
  width: number | 'auto' | '100%';
  height: number | 'auto';
  objectFit: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  objectPosition: string;
  borderRadius: number;
  border: {
    width: number;
    style: 'solid' | 'dashed' | 'dotted' | 'none';
    color: string;
  };
  shadow: {
    enabled: boolean;
    x: number;
    y: number;
    blur: number;
    spread: number;
    color: string;
  };
  margin: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  padding: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  opacity: number;
  filter: {
    blur: number;
    brightness: number;
    contrast: number;
    grayscale: number;
    hueRotate: number;
    saturate: number;
    sepia: number;
  };
  link: {
    enabled: boolean;
    href: string;
    target: '_self' | '_blank' | '_parent' | '_top';
  };
  caption: {
    enabled: boolean;
    text: string;
    position: 'top' | 'bottom';
    align: 'left' | 'center' | 'right';
    fontSize: number;
    color: string;
  };
  responsive: {
    desktop: Partial<ImageBlockProps>;
    tablet: Partial<ImageBlockProps>;
    mobile: Partial<ImageBlockProps>;
  };
}

const defaultProps: ImageBlockProps = {
  src: 'https://via.placeholder.com/400x300?text=Click+to+upload+image',
  alt: 'Image',
  width: 400,
  height: 300,
  objectFit: 'cover',
  objectPosition: 'center',
  borderRadius: 0,
  border: { width: 0, style: 'solid', color: '#000000' },
  shadow: { enabled: false, x: 0, y: 0, blur: 0, spread: 0, color: '#000000' },
  margin: { top: 0, right: 0, bottom: 0, left: 0 },
  padding: { top: 0, right: 0, bottom: 0, left: 0 },
  opacity: 1,
  filter: {
    blur: 0,
    brightness: 100,
    contrast: 100,
    grayscale: 0,
    hueRotate: 0,
    saturate: 100,
    sepia: 0
  },
  link: { enabled: false, href: '', target: '_self' },
  caption: {
    enabled: false,
    text: 'Image caption',
    position: 'bottom',
    align: 'center',
    fontSize: 14,
    color: '#666666'
  },
  responsive: { desktop: {}, tablet: {}, mobile: {} }
};

export const ImageBlock: React.FC<Partial<ImageBlockProps>> = (props) => {
  const {
    actions: { setProp }
  } = useNode();

  const finalProps = { ...defaultProps, ...props };
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    src,
    alt,
    width,
    height,
    objectFit,
    objectPosition,
    borderRadius,
    border,
    shadow,
    margin,
    padding,
    opacity,
    filter,
    link,
    caption
  } = finalProps;

  // Debug logging (only when has issues)
  React.useEffect(() => {
    if (!src) {
      console.log('🖼️ ImageBlock render:', {
        src,
        alt,
        width,
        height,
        hasValidSrc: !!src
      });
    }
  }, [src, alt, width, height]);

  const handleImageClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsLoading(true);
      try {
        // Convert file to base64 for demo purposes
        // In a real app, you'd upload to a cloud service
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          setProp((props: ImageBlockProps) => {
            props.src = result;
          });
          setIsLoading(false);
        };
        reader.readAsDataURL(file);
      } catch (error) {
        console.error('Error uploading image:', error);
        setIsLoading(false);
      }
    }
  };

  const containerStyle: React.CSSProperties = {
    margin: `${margin.top}px ${margin.right}px ${margin.bottom}px ${margin.left}px`,
    padding: `${padding.top}px ${padding.right}px ${padding.bottom}px ${padding.left}px`,
    display: 'inline-block',
    position: 'relative'
  };

  const imageStyle: React.CSSProperties = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
    objectFit,
    objectPosition,
    borderRadius: `${borderRadius}px`,
    border: border.width > 0 ? `${border.width}px ${border.style} ${border.color}` : 'none',
    boxShadow: shadow.enabled 
      ? `${shadow.x}px ${shadow.y}px ${shadow.blur}px ${shadow.spread}px ${shadow.color}` 
      : 'none',
    opacity,
    filter: `
      blur(${filter.blur}px)
      brightness(${filter.brightness}%)
      contrast(${filter.contrast}%)
      grayscale(${filter.grayscale}%)
      hue-rotate(${filter.hueRotate}deg)
      saturate(${filter.saturate}%)
      sepia(${filter.sepia}%)
    `.trim(),
    cursor: 'pointer',
    transition: 'all 0.2s ease-in-out'
  };

  const captionStyle: React.CSSProperties = {
    fontSize: `${caption.fontSize}px`,
    color: caption.color,
    textAlign: caption.align,
    margin: caption.position === 'top' ? '0 0 8px 0' : '8px 0 0 0',
    display: 'block'
  };



  const ImageComponent = () => (
    <div style={containerStyle}>
      {caption.enabled && caption.position === 'top' && (
        <div style={captionStyle}>{caption.text}</div>
      )}
      
      <div style={{ position: 'relative', display: 'inline-block' }}>
        <img
          src={src}
          alt={alt}
          style={imageStyle}
          onClick={handleImageClick}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = 'https://via.placeholder.com/400x300?text=Image+not+found';
          }}
        />
        
        {isLoading && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '14px'
            }}
          >
            Uploading...
          </div>
        )}
      </div>
      
      {caption.enabled && caption.position === 'bottom' && (
        <div style={captionStyle}>{caption.text}</div>
      )}
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
    </div>
  );

  return (
    <BlockWrapper>
      <div className="image-block">
        {link.enabled && link.href ? (
          <a href={link.href} target={link.target} style={{ textDecoration: 'none' }}>
            <ImageComponent />
          </a>
        ) : (
          <ImageComponent />
        )}
      </div>
    </BlockWrapper>
  );
};

// Settings component for the ImageBlock
export const ImageBlockSettings: React.FC = () => {
  const {
    actions: { setProp },
    props
  } = useNode((node) => ({
    props: node.data.props as ImageBlockProps
  }));

  return (
    <div className="space-y-4">
      {/* Image Source */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Image URL
        </label>
        <input
          type="url"
          value={props.src}
          onChange={(e) => setProp((props: ImageBlockProps) => {
            props.src = e.target.value;
          })}
          placeholder="https://example.com/image.jpg"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Alt Text */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Alt Text
        </label>
        <input
          type="text"
          value={props.alt}
          onChange={(e) => setProp((props: ImageBlockProps) => {
            props.alt = e.target.value;
          })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Dimensions */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-900">Dimensions</h4>
        
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Width</label>
            <input
              type="number"
              value={typeof props.width === 'number' ? props.width : 400}
              onChange={(e) => setProp((props: ImageBlockProps) => {
                props.width = parseInt(e.target.value) || 400;
              })}
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
            />
          </div>
          
          <div>
            <label className="block text-xs text-gray-600 mb-1">Height</label>
            <input
              type="number"
              value={typeof props.height === 'number' ? props.height : 300}
              onChange={(e) => setProp((props: ImageBlockProps) => {
                props.height = parseInt(e.target.value) || 300;
              })}
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs text-gray-600 mb-1">Object Fit</label>
          <select
            value={props.objectFit}
            onChange={(e) => setProp((props: ImageBlockProps) => {
              props.objectFit = e.target.value as any;
            })}
            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
          >
            <option value="cover">Cover</option>
            <option value="contain">Contain</option>
            <option value="fill">Fill</option>
            <option value="none">None</option>
            <option value="scale-down">Scale Down</option>
          </select>
        </div>
      </div>

      {/* Style */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-900">Style</h4>
        
        <div>
          <label className="block text-xs text-gray-600 mb-1">Border Radius</label>
          <input
            type="number"
            value={props.borderRadius}
            onChange={(e) => setProp((props: ImageBlockProps) => {
              props.borderRadius = parseInt(e.target.value) || 0;
            })}
            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
          />
        </div>

        <div>
          <label className="block text-xs text-gray-600 mb-1">Opacity</label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={props.opacity}
            onChange={(e) => setProp((props: ImageBlockProps) => {
              props.opacity = parseFloat(e.target.value);
            })}
            className="w-full"
          />
          <span className="text-xs text-gray-500">{Math.round(props.opacity * 100)}%</span>
        </div>
      </div>

      {/* Filters */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-900">Filters</h4>
        
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Blur</label>
            <input
              type="range"
              min="0"
              max="10"
              value={props.filter.blur}
              onChange={(e) => setProp((props: ImageBlockProps) => {
                props.filter.blur = parseInt(e.target.value);
              })}
              className="w-full"
            />
            <span className="text-xs text-gray-500">{props.filter.blur}px</span>
          </div>
          
          <div>
            <label className="block text-xs text-gray-600 mb-1">Brightness</label>
            <input
              type="range"
              min="0"
              max="200"
              value={props.filter.brightness}
              onChange={(e) => setProp((props: ImageBlockProps) => {
                props.filter.brightness = parseInt(e.target.value);
              })}
              className="w-full"
            />
            <span className="text-xs text-gray-500">{props.filter.brightness}%</span>
          </div>
          
          <div>
            <label className="block text-xs text-gray-600 mb-1">Contrast</label>
            <input
              type="range"
              min="0"
              max="200"
              value={props.filter.contrast}
              onChange={(e) => setProp((props: ImageBlockProps) => {
                props.filter.contrast = parseInt(e.target.value);
              })}
              className="w-full"
            />
            <span className="text-xs text-gray-500">{props.filter.contrast}%</span>
          </div>
          
          <div>
            <label className="block text-xs text-gray-600 mb-1">Grayscale</label>
            <input
              type="range"
              min="0"
              max="100"
              value={props.filter.grayscale}
              onChange={(e) => setProp((props: ImageBlockProps) => {
                props.filter.grayscale = parseInt(e.target.value);
              })}
              className="w-full"
            />
            <span className="text-xs text-gray-500">{props.filter.grayscale}%</span>
          </div>
        </div>
      </div>

      {/* Caption */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-900">Caption</h4>
        
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={props.caption.enabled}
            onChange={(e) => setProp((props: ImageBlockProps) => {
              props.caption.enabled = e.target.checked;
            })}
            className="rounded"
          />
          <label className="text-xs text-gray-600">Show caption</label>
        </div>

        {props.caption.enabled && (
          <div className="space-y-2">
            <input
              type="text"
              value={props.caption.text}
              onChange={(e) => setProp((props: ImageBlockProps) => {
                props.caption.text = e.target.value;
              })}
              placeholder="Caption text"
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
            />
            
            <div className="grid grid-cols-2 gap-2">
              <select
                value={props.caption.position}
                onChange={(e) => setProp((props: ImageBlockProps) => {
                  props.caption.position = e.target.value as any;
                })}
                className="px-2 py-1 border border-gray-300 rounded text-sm"
              >
                <option value="top">Top</option>
                <option value="bottom">Bottom</option>
              </select>
              
              <select
                value={props.caption.align}
                onChange={(e) => setProp((props: ImageBlockProps) => {
                  props.caption.align = e.target.value as any;
                })}
                className="px-2 py-1 border border-gray-300 rounded text-sm"
              >
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Link */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-900">Link</h4>
        
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={props.link.enabled}
            onChange={(e) => setProp((props: ImageBlockProps) => {
              props.link.enabled = e.target.checked;
            })}
            className="rounded"
          />
          <label className="text-xs text-gray-600">Make image clickable</label>
        </div>

        {props.link.enabled && (
          <div className="space-y-2">
            <input
              type="url"
              value={props.link.href}
              onChange={(e) => setProp((props: ImageBlockProps) => {
                props.link.href = e.target.value;
              })}
              placeholder="https://example.com"
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
            />
            
            <select
              value={props.link.target}
              onChange={(e) => setProp((props: ImageBlockProps) => {
                props.link.target = e.target.value as any;
              })}
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
            >
              <option value="_self">Same window</option>
              <option value="_blank">New window</option>
              <option value="_parent">Parent frame</option>
              <option value="_top">Top frame</option>
            </select>
          </div>
        )}
      </div>
    </div>
  );
};

// Craft.js configuration
(ImageBlock as any).craft = {
  props: defaultProps,
  related: {
    settings: ImageBlockSettings
  },
  displayName: 'Image'
};