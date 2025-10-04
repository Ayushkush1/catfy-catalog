'use client';

import React, { useState } from 'react';
import { useEditor, useNode } from '@craftjs/core';
import {
  Settings,
  Palette,
  Code,
  Type,
  Layout,
  Image as ImageIcon,
  Link,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Trash2,
  Move,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

// Import property panels - simplified for now

interface InspectorPanelProps {
  isCollapsed?: boolean;
  onToggle?: () => void;
}

export const InspectorPanel: React.FC<InspectorPanelProps> = ({ 
  isCollapsed = false, 
  onToggle 
}) => {
  const { selected, actions } = useEditor((state) => ({
    selected: state.events.selected
  }));

  const [activeTab, setActiveTab] = useState<'content' | 'style' | 'advanced'>('content');

  const selectedNodeId = selected.size > 0 ? Array.from(selected)[0] : null;

  // Auto-expand inspector when an element is selected
  React.useEffect(() => {
    if (selectedNodeId && isCollapsed && onToggle) {
      onToggle(); // Expand the inspector
    }
  }, [selectedNodeId, isCollapsed, onToggle]);

  const tabs = [
    { id: 'content' as const, label: 'Content', icon: <Settings className="w-4 h-4" /> },
    { id: 'style' as const, label: 'Style', icon: <Palette className="w-4 h-4" /> },
    { id: 'advanced' as const, label: 'Advanced', icon: <Code className="w-4 h-4" /> }
  ];

  const SelectedNodeSettings = () => {
    if (!selectedNodeId) {
      return (
        <div className="flex-1 flex items-center justify-center text-gray-500">
          <div className="text-center">
            <Settings className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-sm">Select an element to edit its properties</p>
          </div>
        </div>
      );
    }

    return (
      <NodeInspector nodeId={selectedNodeId} activeTab={activeTab} />
    );
  };

  return (
    <div className={`relative h-full flex flex-col bg-white ${isCollapsed ? 'w-0' : 'w-full'} transition-all duration-200`}>
      <div className="absolute top-0 -left-4 z-10">
        <button
          onClick={onToggle}
          className="py-1 bg-white transition-colors border-l border-gray-200 rounded-r rounded-full"
          title={isCollapsed ? "Expand Inspector" : "Collapse Inspector"}
        >
          {isCollapsed ? (
            <ChevronLeft className="w-4 h-4  text-gray-600" />
          ) : (
            <ChevronRight className="w-4 h-4 ml-1 text-gray-600" />
          )}
        </button>
      </div>

      {/* Tabs and Content - Only show when not collapsed */}
      {!isCollapsed && (
        <>
          {/* Tabs */}
          {selectedNodeId && (
            <div className="border-b border-gray-200 flex-shrink-0">
              <div className="flex">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 flex items-center justify-center px-2 py-3 text-xs font-medium transition-colors ${activeTab === tab.id
                        ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                  >
                    {tab.icon}
                    <span className="ml-1 hidden sm:inline">{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Content */}
          <div className="flex-1 overflow-y-auto min-h-0">
            <SelectedNodeSettings />
          </div>
        </>
      )}
    </div>
  );
};

const NodeBreadcrumb: React.FC<{ nodeId: string }> = ({ nodeId }) => {
  const { query } = useEditor();

  const getBreadcrumb = (nodeId: string): string[] => {
    const node = query.node(nodeId).get();
    if (!node) return [];

    const breadcrumb = [node.data.displayName || (typeof node.data.type === 'string' ? node.data.type : node.data.type.name || 'Component')];

    if (node.data.parent) {
      return [...getBreadcrumb(node.data.parent), ...breadcrumb];
    }

    return breadcrumb;
  };

  const breadcrumb = getBreadcrumb(nodeId);

  return (
    <div className="flex items-center space-x-1 text-xs">
      {breadcrumb.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && <span className="text-gray-400">/</span>}
          <span className={index === breadcrumb.length - 1 ? 'font-medium' : 'text-gray-500'}>
            {item}
          </span>
        </React.Fragment>
      ))}
    </div>
  );
};

const NodeInspector: React.FC<{ nodeId: string; activeTab: string }> = ({ nodeId, activeTab }) => {
  const { query, actions } = useEditor();
  const node = query.node(nodeId).get();

  if (!node) return null;

  const nodeType = typeof node.data.type === 'string' ? node.data.type : node.data.type.name;
  const props = node.data.props || {};

  const setProp = (callback: (props: any) => void) => {
    actions.setProp(nodeId, callback);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'content':
        return <ContentPanelWrapper nodeId={nodeId} nodeType={nodeType} />;
      case 'style':
        return <StylePanelWrapper nodeId={nodeId} nodeType={nodeType} />;
      case 'advanced':
        return <AdvancedPanel nodeType={nodeType} props={props} setProp={setProp} />;
      default:
        return null;
    }
  };

  return (
    <div>
      {renderTabContent()}
    </div>
  );
};

// Content Panel Wrapper Component
const ContentPanelWrapper: React.FC<{ nodeId: string; nodeType: string }> = ({ nodeId, nodeType }) => {
  const { actions, query } = useEditor((state) => ({
    node: state.nodes[nodeId]
  }));

  const node = query.node(nodeId).get();
  const props = node.data.props;

  const setProp = (callback: (props: any) => void) => {
    actions.setProp(nodeId, callback);
  };

  return <ContentPanel nodeType={nodeType} props={props} setProp={setProp} />;
};

// Style Panel Wrapper Component
const StylePanelWrapper: React.FC<{ nodeId: string; nodeType: string }> = ({ nodeId, nodeType }) => {
  const { actions, query } = useEditor((state) => ({
    node: state.nodes[nodeId]
  }));

  const node = query.node(nodeId).get();
  const props = node.data.props;

  const setProp = (callback: (props: any) => void) => {
    actions.setProp(nodeId, callback);
  };

  return <StylePanel nodeType={nodeType} props={props} setProp={setProp} />;
};

// Content Panel Component
const ContentPanel: React.FC<{ nodeType: string; props: any; setProp: (callback: (props: any) => void) => void }> = ({ nodeType, props, setProp }) => {
  const renderContentControls = () => {
    switch (nodeType) {
      case 'TextBlock':
      case 'Text':
        return (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Text Content
              </label>
              <textarea
                value={props.text || 'Edit this text'}
                onChange={(e) => setProp((props: any) => {
                  props.text = e.target.value;
                })}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                rows={3}
                placeholder="Enter your text here..."
              />
            </div>
          </div>
        );

      case 'HeadingBlock':
      case 'Heading':
        return (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Heading Text
              </label>
              <input
                type="text"
                value={props.text || 'Heading Text'}
                onChange={(e) => setProp((props: any) => {
                  props.text = e.target.value;
                })}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Enter heading text..."
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Heading Level
              </label>
              <select
                value={props.level || 1}
                onChange={(e) => setProp((props: any) => {
                  props.level = parseInt(e.target.value);
                })}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value={1}>H1</option>
                <option value={2}>H2</option>
                <option value={3}>H3</option>
                <option value={4}>H4</option>
                <option value={5}>H5</option>
                <option value={6}>H6</option>
              </select>
            </div>
          </div>
        );

      case 'ImageBlock':
      case 'Image':
        return (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Image URL
              </label>
              <input
                type="url"
                value={props.src || ''}
                onChange={(e) => setProp((props: any) => {
                  props.src = e.target.value;
                })}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="https://example.com/image.jpg"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Alt Text
              </label>
              <input
                type="text"
                value={props.alt || ''}
                onChange={(e) => setProp((props: any) => {
                  props.alt = e.target.value;
                })}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Describe the image..."
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Width
                </label>
                <input
                  type="number"
                  value={props.width || 200}
                  onChange={(e) => setProp((props: any) => {
                    props.width = parseInt(e.target.value) || 200;
                  })}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  min="1"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Height
                </label>
                <input
                  type="number"
                  value={props.height || 150}
                  onChange={(e) => setProp((props: any) => {
                    props.height = parseInt(e.target.value) || 150;
                  })}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  min="1"
                />
              </div>
            </div>
          </div>
        );

      case 'ButtonBlock':
      case 'Button':
        return (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Button Text
              </label>
              <input
                type="text"
                value={props.text || 'Click me'}
                onChange={(e) => setProp((props: any) => {
                  props.text = e.target.value;
                })}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Enter button text..."
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Link URL
              </label>
              <input
                type="url"
                value={props.href || ''}
                onChange={(e) => setProp((props: any) => {
                  props.href = e.target.value;
                })}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="https://example.com"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Button Type
              </label>
              <select
                value={props.variant || 'primary'}
                onChange={(e) => setProp((props: any) => {
                  props.variant = e.target.value;
                })}
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="primary">Primary</option>
                <option value="secondary">Secondary</option>
                <option value="outline">Outline</option>
                <option value="ghost">Ghost</option>
              </select>
            </div>
          </div>
        );

      default:
        return (
          <div className="p-3 text-center text-gray-500">
            <Type className="w-6 h-6 mx-auto mb-2" />
            <p className="text-xs">No content options available for this element</p>
          </div>
        );
    }
  };

  return (
    <div className="p-2">

      {renderContentControls()}
    </div>
  );
};

// Style Panel Component
const StylePanel: React.FC<{ nodeType: string; props: any; setProp: (callback: (props: any) => void) => void }> = ({ nodeType, props, setProp }) => {
  // Initialize default values for nested objects
  const margin = props.margin || { top: 0, right: 0, bottom: 0, left: 0 };
  const padding = props.padding || { top: 0, right: 0, bottom: 0, left: 0 };
  const border = props.border || { width: 0, style: 'solid', color: '#000000' };

  return (
    <div className="p-2 space-y-4">
      {/* Typography (for text elements) */}
      {(nodeType === 'TextBlock' || nodeType === 'Text' || nodeType === 'HeadingBlock' || nodeType === 'Heading' || nodeType === 'ButtonBlock' || nodeType === 'Button') && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-900 border-b border-gray-200 pb-1">Typography</h4>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Font Size</label>
              <input
                type="number"
                value={props.fontSize || 16}
                onChange={(e) => setProp((props: any) => {
                  props.fontSize = parseInt(e.target.value) || 16;
                })}
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                min="8"
                max="72"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-600 mb-1">Font Weight</label>
              <select
                value={props.fontWeight || 'normal'}
                onChange={(e) => setProp((props: any) => {
                  props.fontWeight = e.target.value;
                })}
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
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
            <label className="block text-xs text-gray-600 mb-1">Text Color</label>
            <input
              type="color"
              value={props.color || '#000000'}
              onChange={(e) => setProp((props: any) => {
                props.color = e.target.value;
              })}
              className="w-full h-8 border border-gray-300 rounded"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-1">Text Align</label>
            <select
              value={props.textAlign || 'left'}
              onChange={(e) => setProp((props: any) => {
                props.textAlign = e.target.value;
              })}
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
            >
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
              <option value="justify">Justify</option>
            </select>
          </div>
        </div>
      )}

      {/* Base Styles */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-900 border-b border-gray-200 pb-1">Dimensions & Position</h4>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Width</label>
            <input
              type="text"
              value={props.width || 'auto'}
              onChange={(e) => setProp((props: any) => {
                props.width = e.target.value;
              })}
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
              placeholder="auto, 100px, 50%"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-1">Height</label>
            <input
              type="text"
              value={props.height || 'auto'}
              onChange={(e) => setProp((props: any) => {
                props.height = e.target.value;
              })}
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
              placeholder="auto, 100px, 50%"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Min Width</label>
            <input
              type="text"
              value={props.minWidth || ''}
              onChange={(e) => setProp((props: any) => {
                props.minWidth = e.target.value;
              })}
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
              placeholder="0, 100px, 50%"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-1">Min Height</label>
            <input
              type="text"
              value={props.minHeight || ''}
              onChange={(e) => setProp((props: any) => {
                props.minHeight = e.target.value;
              })}
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
              placeholder="0, 100px, 50%"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Max Width</label>
            <input
              type="text"
              value={props.maxWidth || ''}
              onChange={(e) => setProp((props: any) => {
                props.maxWidth = e.target.value;
              })}
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
              placeholder="none, 100px, 50%"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-1">Max Height</label>
            <input
              type="text"
              value={props.maxHeight || ''}
              onChange={(e) => setProp((props: any) => {
                props.maxHeight = e.target.value;
              })}
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
              placeholder="none, 100px, 50%"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs text-gray-600 mb-1">Display</label>
          <select
            value={props.display || 'block'}
            onChange={(e) => setProp((props: any) => {
              props.display = e.target.value;
            })}
            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
          >
            <option value="block">Block</option>
            <option value="inline">Inline</option>
            <option value="inline-block">Inline Block</option>
            <option value="flex">Flex</option>
            <option value="inline-flex">Inline Flex</option>
            <option value="grid">Grid</option>
            <option value="inline-grid">Inline Grid</option>
            <option value="none">None</option>
          </select>
        </div>

        <div>
          <label className="block text-xs text-gray-600 mb-1">Position</label>
          <select
            value={props.position || 'static'}
            onChange={(e) => setProp((props: any) => {
              props.position = e.target.value;
            })}
            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
          >
            <option value="static">Static</option>
            <option value="relative">Relative</option>
            <option value="absolute">Absolute</option>
            <option value="fixed">Fixed</option>
            <option value="sticky">Sticky</option>
          </select>
        </div>

        {(props.position === 'absolute' || props.position === 'fixed' || props.position === 'relative' || props.position === 'sticky') && (
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Top</label>
              <input
                type="text"
                value={props.top || ''}
                onChange={(e) => setProp((props: any) => {
                  props.top = e.target.value;
                })}
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                placeholder="auto, 10px, 50%"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-600 mb-1">Right</label>
              <input
                type="text"
                value={props.right || ''}
                onChange={(e) => setProp((props: any) => {
                  props.right = e.target.value;
                })}
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                placeholder="auto, 10px, 50%"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-600 mb-1">Bottom</label>
              <input
                type="text"
                value={props.bottom || ''}
                onChange={(e) => setProp((props: any) => {
                  props.bottom = e.target.value;
                })}
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                placeholder="auto, 10px, 50%"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-600 mb-1">Left</label>
              <input
                type="text"
                value={props.left || ''}
                onChange={(e) => setProp((props: any) => {
                  props.left = e.target.value;
                })}
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                placeholder="auto, 10px, 50%"
              />
            </div>
          </div>
        )}

        <div>
          <label className="block text-xs text-gray-600 mb-1">Z-Index</label>
          <input
            type="number"
            value={props.zIndex || ''}
            onChange={(e) => setProp((props: any) => {
              props.zIndex = e.target.value;
            })}
            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
            placeholder="auto"
          />
        </div>

        <div>
          <label className="block text-xs text-gray-600 mb-1">Overflow</label>
          <select
            value={props.overflow || 'visible'}
            onChange={(e) => setProp((props: any) => {
              props.overflow = e.target.value;
            })}
            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
          >
            <option value="visible">Visible</option>
            <option value="hidden">Hidden</option>
            <option value="scroll">Scroll</option>
            <option value="auto">Auto</option>
          </select>
        </div>
      </div>

      {/* Background & Border */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-900 border-b border-gray-200 pb-1">Background & Border</h4>

        <div>
          <label className="block text-xs text-gray-600 mb-1">Background Color</label>
          <input
            type="color"
            value={props.backgroundColor || '#ffffff'}
            onChange={(e) => setProp((props: any) => {
              props.backgroundColor = e.target.value;
            })}
            className="w-full h-8 border border-gray-300 rounded"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Border Width</label>
            <input
              type="number"
              value={border.width}
              onChange={(e) => setProp((props: any) => {
                if (!props.border) props.border = { width: 0, style: 'solid', color: '#000000' };
                props.border.width = parseInt(e.target.value) || 0;
              })}
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
              min="0"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-1">Border Radius</label>
            <input
              type="number"
              value={props.borderRadius || 0}
              onChange={(e) => setProp((props: any) => {
                props.borderRadius = parseInt(e.target.value) || 0;
              })}
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
              min="0"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs text-gray-600 mb-1">Border Color</label>
          <input
            type="color"
            value={border.color}
            onChange={(e) => setProp((props: any) => {
              if (!props.border) props.border = { width: 0, style: 'solid', color: '#000000' };
              props.border.color = e.target.value;
            })}
            className="w-full h-8 border border-gray-300 rounded"
          />
        </div>

        <div>
          <label className="block text-xs text-gray-600 mb-1">Border Style</label>
          <select
            value={border.style}
            onChange={(e) => setProp((props: any) => {
              if (!props.border) props.border = { width: 0, style: 'solid', color: '#000000' };
              props.border.style = e.target.value;
            })}
            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
          >
            <option value="solid">Solid</option>
            <option value="dashed">Dashed</option>
            <option value="dotted">Dotted</option>
            <option value="none">None</option>
          </select>
        </div>
      </div>

      {/* Spacing */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-gray-900 border-b border-gray-200 pb-2">Spacing</h4>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Margin</label>
            <div className="grid grid-cols-2 gap-1">
              <input
                type="number"
                placeholder="Top"
                value={margin.top}
                onChange={(e) => setProp((props: any) => {
                  if (!props.margin) props.margin = { top: 0, right: 0, bottom: 0, left: 0 };
                  props.margin.top = parseInt(e.target.value) || 0;
                })}
                className="px-1 py-1 border border-gray-300 rounded text-xs"
              />
              <input
                type="number"
                placeholder="Right"
                value={margin.right}
                onChange={(e) => setProp((props: any) => {
                  if (!props.margin) props.margin = { top: 0, right: 0, bottom: 0, left: 0 };
                  props.margin.right = parseInt(e.target.value) || 0;
                })}
                className="px-1 py-1 border border-gray-300 rounded text-xs"
              />
              <input
                type="number"
                placeholder="Bottom"
                value={margin.bottom}
                onChange={(e) => setProp((props: any) => {
                  if (!props.margin) props.margin = { top: 0, right: 0, bottom: 0, left: 0 };
                  props.margin.bottom = parseInt(e.target.value) || 0;
                })}
                className="px-1 py-1 border border-gray-300 rounded text-xs"
              />
              <input
                type="number"
                placeholder="Left"
                value={margin.left}
                onChange={(e) => setProp((props: any) => {
                  if (!props.margin) props.margin = { top: 0, right: 0, bottom: 0, left: 0 };
                  props.margin.left = parseInt(e.target.value) || 0;
                })}
                className="px-1 py-1 border border-gray-300 rounded text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-1">Padding</label>
            <div className="grid grid-cols-2 gap-1">
              <input
                type="number"
                placeholder="Top"
                value={padding.top}
                onChange={(e) => setProp((props: any) => {
                  if (!props.padding) props.padding = { top: 0, right: 0, bottom: 0, left: 0 };
                  props.padding.top = parseInt(e.target.value) || 0;
                })}
                className="px-1 py-1 border border-gray-300 rounded text-xs"
              />
              <input
                type="number"
                placeholder="Right"
                value={padding.right}
                onChange={(e) => setProp((props: any) => {
                  if (!props.padding) props.padding = { top: 0, right: 0, bottom: 0, left: 0 };
                  props.padding.right = parseInt(e.target.value) || 0;
                })}
                className="px-1 py-1 border border-gray-300 rounded text-xs"
              />
              <input
                type="number"
                placeholder="Bottom"
                value={padding.bottom}
                onChange={(e) => setProp((props: any) => {
                  if (!props.padding) props.padding = { top: 0, right: 0, bottom: 0, left: 0 };
                  props.padding.bottom = parseInt(e.target.value) || 0;
                })}
                className="px-1 py-1 border border-gray-300 rounded text-xs"
              />
              <input
                type="number"
                placeholder="Left"
                value={padding.left}
                onChange={(e) => setProp((props: any) => {
                  if (!props.padding) props.padding = { top: 0, right: 0, bottom: 0, left: 0 };
                  props.padding.left = parseInt(e.target.value) || 0;
                })}
                className="px-1 py-1 border border-gray-300 rounded text-xs"
              />
            </div>
          </div>
        </div>
      </div>


      {/* Flexbox Layout Controls */}
      {(props.display === 'flex' || props.display === 'inline-flex') && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-900 border-b border-gray-200 pb-1">Flexbox Layout</h4>

          {/* Quick Layout Presets */}
          <div>
            <label className="block text-xs text-gray-600 mb-1">Quick Layouts</label>
            <div className="grid grid-cols-2 gap-1">
              <button
                onClick={() => setProp((props: any) => {
                  props.flexDirection = 'row';
                  props.justifyContent = 'flex-start';
                  props.alignItems = 'stretch';
                })}
                className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50"
              >
                Horizontal Row
              </button>
              <button
                onClick={() => setProp((props: any) => {
                  props.flexDirection = 'column';
                  props.justifyContent = 'flex-start';
                  props.alignItems = 'stretch';
                })}
                className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50"
              >
                Vertical Column
              </button>
              <button
                onClick={() => setProp((props: any) => {
                  props.flexDirection = 'row';
                  props.justifyContent = 'center';
                  props.alignItems = 'center';
                })}
                className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50"
              >
                Center Both
              </button>
              <button
                onClick={() => setProp((props: any) => {
                  props.flexDirection = 'row';
                  props.justifyContent = 'space-between';
                  props.alignItems = 'center';
                })}
                className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50"
              >
                Space Between
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Direction</label>
              <select
                value={props.flexDirection || 'row'}
                onChange={(e) => setProp((props: any) => {
                  props.flexDirection = e.target.value;
                })}
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
              >
                <option value="row">Row</option>
                <option value="row-reverse">Row Reverse</option>
                <option value="column">Column</option>
                <option value="column-reverse">Column Reverse</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-gray-600 mb-1">Wrap</label>
              <select
                value={props.flexWrap || 'nowrap'}
                onChange={(e) => setProp((props: any) => {
                  props.flexWrap = e.target.value;
                })}
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
              >
                <option value="nowrap">No Wrap</option>
                <option value="wrap">Wrap</option>
                <option value="wrap-reverse">Wrap Reverse</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-1">Justify Content</label>
            <select
              value={props.justifyContent || 'flex-start'}
              onChange={(e) => setProp((props: any) => {
                props.justifyContent = e.target.value;
              })}
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
            >
              <option value="flex-start">Flex Start</option>
              <option value="flex-end">Flex End</option>
              <option value="center">Center</option>
              <option value="space-between">Space Between</option>
              <option value="space-around">Space Around</option>
              <option value="space-evenly">Space Evenly</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-1">Align Items</label>
            <select
              value={props.alignItems || 'stretch'}
              onChange={(e) => setProp((props: any) => {
                props.alignItems = e.target.value;
              })}
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
            >
              <option value="stretch">Stretch</option>
              <option value="flex-start">Flex Start</option>
              <option value="flex-end">Flex End</option>
              <option value="center">Center</option>
              <option value="baseline">Baseline</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-1">Align Content</label>
            <select
              value={props.alignContent || 'stretch'}
              onChange={(e) => setProp((props: any) => {
                props.alignContent = e.target.value;
              })}
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
            >
              <option value="stretch">Stretch</option>
              <option value="flex-start">Flex Start</option>
              <option value="flex-end">Flex End</option>
              <option value="center">Center</option>
              <option value="space-between">Space Between</option>
              <option value="space-around">Space Around</option>
            </select>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Gap</label>
              <input
                type="text"
                value={props.gap || ''}
                onChange={(e) => setProp((props: any) => {
                  props.gap = e.target.value;
                })}
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                placeholder="0, 10px, 1rem"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-600 mb-1">Row Gap</label>
              <input
                type="text"
                value={props.rowGap || ''}
                onChange={(e) => setProp((props: any) => {
                  props.rowGap = e.target.value;
                })}
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                placeholder="0, 10px, 1rem"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-600 mb-1">Column Gap</label>
              <input
                type="text"
                value={props.columnGap || ''}
                onChange={(e) => setProp((props: any) => {
                  props.columnGap = e.target.value;
                })}
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                placeholder="0, 10px, 1rem"
              />
            </div>
          </div>

          {/* Flex Item Properties */}
          <div className="pt-2 border-t border-gray-100">
            <h5 className="text-xs font-medium text-gray-700 mb-2">Flex Item Properties</h5>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Flex Grow</label>
                <input
                  type="number"
                  value={props.flexGrow || 0}
                  onChange={(e) => setProp((props: any) => {
                    props.flexGrow = parseInt(e.target.value) || 0;
                  })}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-600 mb-1">Flex Shrink</label>
                <input
                  type="number"
                  value={props.flexShrink || 1}
                  onChange={(e) => setProp((props: any) => {
                    props.flexShrink = parseInt(e.target.value) || 1;
                  })}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-xs text-gray-600 mb-1">Flex Basis</label>
                <input
                  type="text"
                  value={props.flexBasis || 'auto'}
                  onChange={(e) => setProp((props: any) => {
                    props.flexBasis = e.target.value;
                  })}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                  placeholder="auto, 100px, 50%"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-gray-600 mb-1 mt-2">Align Self</label>
              <select
                value={props.alignSelf || 'auto'}
                onChange={(e) => setProp((props: any) => {
                  props.alignSelf = e.target.value;
                })}
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
              >
                <option value="auto">Auto</option>
                <option value="flex-start">Flex Start</option>
                <option value="flex-end">Flex End</option>
                <option value="center">Center</option>
                <option value="baseline">Baseline</option>
                <option value="stretch">Stretch</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Grid Layout Controls */}
      {(props.display === 'grid' || props.display === 'inline-grid') && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-900 border-b border-gray-200 pb-1">Grid Layout</h4>

          {/* Quick Grid Presets */}
          <div>
            <label className="block text-xs text-gray-600 mb-1">Quick Grid Layouts</label>
            <div className="grid grid-cols-2 gap-1">
              <button
                onClick={() => setProp((props: any) => {
                  props.gridTemplateColumns = '1fr 1fr';
                  props.gridTemplateRows = 'auto';
                  props.gap = '1rem';
                })}
                className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50"
              >
                2 Columns
              </button>
              <button
                onClick={() => setProp((props: any) => {
                  props.gridTemplateColumns = '1fr 1fr 1fr';
                  props.gridTemplateRows = 'auto';
                  props.gap = '1rem';
                })}
                className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50"
              >
                3 Columns
              </button>
              <button
                onClick={() => setProp((props: any) => {
                  props.gridTemplateColumns = '1fr 1fr 1fr 1fr';
                  props.gridTemplateRows = 'auto';
                  props.gap = '1rem';
                })}
                className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50"
              >
                4 Columns
              </button>
              <button
                onClick={() => setProp((props: any) => {
                  props.gridTemplateColumns = '200px 1fr';
                  props.gridTemplateRows = 'auto';
                  props.gap = '1rem';
                })}
                className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50"
              >
                Sidebar + Main
              </button>
              <button
                onClick={() => setProp((props: any) => {
                  props.gridTemplateColumns = '1fr';
                  props.gridTemplateRows = 'auto auto auto';
                  props.gap = '1rem';
                })}
                className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50"
              >
                3 Rows
              </button>
              <button
                onClick={() => setProp((props: any) => {
                  props.gridTemplateColumns = 'repeat(auto-fit, minmax(250px, 1fr))';
                  props.gridTemplateRows = 'auto';
                  props.gap = '1rem';
                })}
                className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50"
              >
                Responsive Cards
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-1">Grid Template Columns</label>
            <input
              type="text"
              value={props.gridTemplateColumns || ''}
              onChange={(e) => setProp((props: any) => {
                props.gridTemplateColumns = e.target.value;
              })}
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
              placeholder="1fr 1fr, repeat(3, 1fr), 200px auto 1fr"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-1">Grid Template Rows</label>
            <input
              type="text"
              value={props.gridTemplateRows || ''}
              onChange={(e) => setProp((props: any) => {
                props.gridTemplateRows = e.target.value;
              })}
              className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
              placeholder="auto, 100px 200px, repeat(2, 1fr)"
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Gap</label>
              <input
                type="text"
                value={props.gap || ''}
                onChange={(e) => setProp((props: any) => {
                  props.gap = e.target.value;
                })}
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                placeholder="10px, 1rem"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-600 mb-1">Row Gap</label>
              <input
                type="text"
                value={props.rowGap || ''}
                onChange={(e) => setProp((props: any) => {
                  props.rowGap = e.target.value;
                })}
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                placeholder="10px, 1rem"
              />
            </div>

            <div>
              <label className="block text-xs text-gray-600 mb-1">Column Gap</label>
              <input
                type="text"
                value={props.columnGap || ''}
                onChange={(e) => setProp((props: any) => {
                  props.columnGap = e.target.value;
                })}
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                placeholder="10px, 1rem"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Justify Items</label>
              <select
                value={props.justifyItems || 'stretch'}
                onChange={(e) => setProp((props: any) => {
                  props.justifyItems = e.target.value;
                })}
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
              >
                <option value="stretch">Stretch</option>
                <option value="start">Start</option>
                <option value="end">End</option>
                <option value="center">Center</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-gray-600 mb-1">Align Items</label>
              <select
                value={props.alignItems || 'stretch'}
                onChange={(e) => setProp((props: any) => {
                  props.alignItems = e.target.value;
                })}
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
              >
                <option value="stretch">Stretch</option>
                <option value="start">Start</option>
                <option value="end">End</option>
                <option value="center">Center</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Justify Content</label>
              <select
                value={props.justifyContent || 'stretch'}
                onChange={(e) => setProp((props: any) => {
                  props.justifyContent = e.target.value;
                })}
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
              >
                <option value="stretch">Stretch</option>
                <option value="start">Start</option>
                <option value="end">End</option>
                <option value="center">Center</option>
                <option value="space-between">Space Between</option>
                <option value="space-around">Space Around</option>
                <option value="space-evenly">Space Evenly</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-gray-600 mb-1">Align Content</label>
              <select
                value={props.alignContent || 'stretch'}
                onChange={(e) => setProp((props: any) => {
                  props.alignContent = e.target.value;
                })}
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
              >
                <option value="stretch">Stretch</option>
                <option value="start">Start</option>
                <option value="end">End</option>
                <option value="center">Center</option>
                <option value="space-between">Space Between</option>
                <option value="space-around">Space Around</option>
                <option value="space-evenly">Space Evenly</option>
              </select>
            </div>
          </div>




        </div>
      )}


    </div>
  );
};

// Advanced Panel Component
const AdvancedPanel: React.FC<{ nodeType: string; props: any; setProp: (callback: (props: any) => void) => void }> = ({ nodeType, props, setProp }) => {
  // Initialize default values for nested objects
  const shadow = props.shadow || { enabled: false, x: 0, y: 0, blur: 0, color: '#fffff' };
  const animation = props.animation || { type: 'none', duration: 300, delay: 0 };

  return (
    <div className="p-3 space-y-6">


      {/* Shadow Effects */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-gray-900 border-b border-gray-200 pb-2">Shadow Effects</h4>

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="shadow-enabled"
            checked={shadow.enabled}
            onChange={(e) => setProp((props: any) => {
              if (!props.shadow) props.shadow = { enabled: false, x: 0, y: 0, blur: 0, color: '#000000' };
              props.shadow.enabled = e.target.checked;
            })}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="shadow-enabled" className="text-sm text-gray-700">
            Enable Shadow
          </label>
        </div>

        {shadow.enabled && (
          <div className="grid grid-cols-2 gap-3 ml-6">
            <div>
              <label className="block text-xs text-gray-600 mb-1">X Offset</label>
              <input
                type="number"
                value={shadow.x}
                onChange={(e) => setProp((props: any) => {
                  if (!props.shadow) props.shadow = { enabled: false, x: 0, y: 0, blur: 0, color: '#000000' };
                  props.shadow.x = parseInt(e.target.value) || 0;
                })}
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Y Offset</label>
              <input
                type="number"
                value={shadow.y}
                onChange={(e) => setProp((props: any) => {
                  if (!props.shadow) props.shadow = { enabled: false, x: 0, y: 0, blur: 0, color: '#000000' };
                  props.shadow.y = parseInt(e.target.value) || 0;
                })}
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Blur</label>
              <input
                type="number"
                value={shadow.blur}
                onChange={(e) => setProp((props: any) => {
                  if (!props.shadow) props.shadow = { enabled: false, x: 0, y: 0, blur: 0, color: '#000000' };
                  props.shadow.blur = parseInt(e.target.value) || 0;
                })}
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                min="0"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Shadow Color</label>
              <input
                type="color"
                value={shadow.color}
                onChange={(e) => setProp((props: any) => {
                  if (!props.shadow) props.shadow = { enabled: false, x: 0, y: 0, blur: 0, color: '#000000' };
                  props.shadow.color = e.target.value;
                })}
                className="w-full h-8 border border-gray-300 rounded"
              />
            </div>
          </div>
        )}
      </div>

      {/* Animation */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-gray-900 border-b border-gray-200 pb-2">Animation</h4>

        <div>
          <label className="block text-xs text-gray-600 mb-1">Animation Type</label>
          <select
            value={animation.type}
            onChange={(e) => setProp((props: any) => {
              if (!props.animation) props.animation = { type: 'none', duration: 300, delay: 0 };
              props.animation.type = e.target.value;
            })}
            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
          >
            <option value="none">None</option>
            <option value="fadeIn">Fade In</option>
            <option value="slideIn">Slide In</option>
            <option value="bounce">Bounce</option>
          </select>
        </div>

        {animation.type !== 'none' && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Duration (ms)</label>
              <input
                type="number"
                value={animation.duration}
                onChange={(e) => setProp((props: any) => {
                  if (!props.animation) props.animation = { type: 'none', duration: 300, delay: 0 };
                  props.animation.duration = parseInt(e.target.value) || 300;
                })}
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                min="100"
                max="3000"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Delay (ms)</label>
              <input
                type="number"
                value={animation.delay}
                onChange={(e) => setProp((props: any) => {
                  if (!props.animation) props.animation = { type: 'none', duration: 300, delay: 0 };
                  props.animation.delay = parseInt(e.target.value) || 0;
                })}
                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                min="0"
                max="5000"
              />
            </div>
          </div>
        )}
      </div>

      {/* Custom CSS */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-gray-900 border-b border-gray-200 pb-2">Custom CSS</h4>

        <div>
          <label className="block text-xs text-gray-600 mb-1">CSS Classes</label>
          <input
            type="text"
            value={props.className || ''}
            onChange={(e) => setProp((props: any) => {
              props.className = e.target.value;
            })}
            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
            placeholder="custom-class another-class"
          />
        </div>

        <div>
          <label className="block text-xs text-gray-600 mb-1">Custom Styles</label>
          <textarea
            value={props.customStyles || ''}
            onChange={(e) => setProp((props: any) => {
              props.customStyles = e.target.value;
            })}
            className="w-full px-2 py-1 border border-gray-300 rounded text-sm resize-none"
            rows={3}
            placeholder="color: red; font-size: 18px;"
          />
        </div>
      </div>


    </div>
  );
};

const NodeQuickActions: React.FC<{ nodeId: string }> = ({ nodeId }) => {
  const { actions, query } = useEditor();
  const node = query.node(nodeId).get();

  if (!node) return null;

  const handleDelete = () => {
    actions.delete(nodeId);
  };

  const handleDuplicate = () => {
    const parentId = node.data.parent;
    if (parentId) {
      const clonedNode = query.node(nodeId).toSerializedNode();
      actions.add(clonedNode as any, parentId);
    }
  };

  const handleMoveUp = () => {
    const parentId = node.data.parent;
    if (parentId) {
      const parent = query.node(parentId).get();
      const siblings = parent.data.nodes || [];
      const currentIndex = siblings.indexOf(nodeId);

      if (currentIndex > 0) {
        const newSiblings = [...siblings];
        [newSiblings[currentIndex], newSiblings[currentIndex - 1]] =
          [newSiblings[currentIndex - 1], newSiblings[currentIndex]];

        actions.setProp(parentId, (props: any) => {
          props.nodes = newSiblings;
        });
      }
    }
  };

  const handleMoveDown = () => {
    const parentId = node.data.parent;
    if (parentId) {
      const parent = query.node(parentId).get();
      const siblings = parent.data.nodes || [];
      const currentIndex = siblings.indexOf(nodeId);

      if (currentIndex < siblings.length - 1) {
        const newSiblings = [...siblings];
        [newSiblings[currentIndex], newSiblings[currentIndex + 1]] =
          [newSiblings[currentIndex + 1], newSiblings[currentIndex]];

        actions.setProp(parentId, (props: any) => {
          props.nodes = newSiblings;
        });
      }
    }
  };

  return (
    <div className="space-y-3">
      <div className="text-sm font-medium text-gray-900 mb-2">Quick Actions</div>

      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={handleDuplicate}
          className="flex items-center justify-center px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm"
        >
          <Settings className="w-4 h-4 mr-1" />
          Duplicate
        </button>

        <button
          onClick={handleDelete}
          className="flex items-center justify-center px-3 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors text-sm"
        >
          <Trash2 className="w-4 h-4 mr-1" />
          Delete
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={handleMoveUp}
          className="flex items-center justify-center px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm"
        >
          ↑ Move Up
        </button>

        <button
          onClick={handleMoveDown}
          className="flex items-center justify-center px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm"
        >
          ↓ Move Down
        </button>
      </div>

      <div className="pt-2 border-t border-gray-200">
        <div className="text-xs text-gray-500">
          Node ID: {nodeId.slice(0, 8)}...
        </div>
      </div>
    </div>
  );
};