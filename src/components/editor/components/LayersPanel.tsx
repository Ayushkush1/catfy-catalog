'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useEditor } from '@craftjs/core';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
  UniqueIdentifier,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import {
  CSS,
} from '@dnd-kit/utilities';
import {
  ChevronRight,
  ChevronDown,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Trash2,
  Type,
  Image,
  Square,
  Grid3X3,
  Layers,
  Star,
  Video,
  MessageSquare,
  Shapes,
  GripVertical
} from 'lucide-react';

interface LayersPanelProps {
  className?: string;
}

interface LayerNode {
  id: string;
  displayName: string;
  type: string;
  children: LayerNode[];
  isVisible: boolean;
  isLocked: boolean;
  depth: number;
  parentId?: string;
}

interface LayerState {
  isVisible: boolean;
  isLocked: boolean;
}

interface DraggedItem {
  id: string;
  displayName: string;
  type: string;
}

export const LayersPanel: React.FC<LayersPanelProps> = ({ className }) => {
  const { query, actions, selected } = useEditor((state) => ({
    selected: state.events.selected
  }));

  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [layerStates, setLayerStates] = useState<Map<string, LayerState>>(new Map());
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const [draggedItem, setDraggedItem] = useState<DraggedItem | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Get icon for different node types
  const getNodeIcon = (nodeType: string) => {
    switch (nodeType) {
      case 'TextBlock':
      case 'Text':
        return <Type className="w-4 h-4" />;
      case 'HeadingBlock':
      case 'Heading':
        return <Type className="w-4 h-4" />;
      case 'ButtonBlock':
      case 'Button':
        return <MessageSquare className="w-4 h-4" />;
      case 'ImageBlock':
      case 'Image':
        return <Image className="w-4 h-4" />;
      case 'VideoBlock':
      case 'Video':
        return <Video className="w-4 h-4" />;
      case 'ContainerBlock':
      case 'Container':
        return <Square className="w-4 h-4" />;
      case 'GridBlock':
      case 'Grid':
        return <Grid3X3 className="w-4 h-4" />;
      case 'FlexboxBlock':
      case 'Flexbox':
        return <Layers className="w-4 h-4" />;
      case 'IconBlock':
      case 'Icon':
        return <Star className="w-4 h-4" />;
      case 'DividerBlock':
      case 'Divider':
        return <Shapes className="w-4 h-4" />;
      case 'SpacerBlock':
      case 'Spacer':
        return <Shapes className="w-4 h-4" />;
      default:
        return <Square className="w-4 h-4" />;
    }
  };

  // Build hierarchical tree from CraftJS nodes
  const buildLayerTree = (): LayerNode[] => {
    const nodes = query.getNodes();
    const rootNodes: LayerNode[] = [];
    const nodeMap = new Map<string, LayerNode>();
    const allNodeIds = new Set<string>();

    // First pass: create all nodes
    Object.entries(nodes).forEach(([nodeId, node]) => {
      // Safely access resolvedName with proper null checks
      const nodeType = (node as any).type;
      const resolvedName = nodeType?.resolvedName || nodeType?.name || 'Unknown';
      
      const displayName = node.data?.custom?.displayName || 
                         node.data?.displayName || 
                         node.data?.name ||
                         resolvedName || 
                         'Element';

      // Get layer state or use defaults
      const layerState = layerStates.get(nodeId) || { isVisible: true, isLocked: false };

      const layerNode: LayerNode = {
        id: nodeId,
        displayName,
        type: resolvedName,
        children: [],
        isVisible: layerState.isVisible,
        isLocked: layerState.isLocked,
        depth: 0,
        parentId: node.data.parent || undefined
      };

      nodeMap.set(nodeId, layerNode);
      allNodeIds.add(nodeId);
    });

    // Second pass: build hierarchy
    Object.entries(nodes).forEach(([nodeId, node]) => {
      const layerNode = nodeMap.get(nodeId);
      if (!layerNode) return;

      if (node.data.parent) {
        const parentNode = nodeMap.get(node.data.parent);
        if (parentNode) {
          layerNode.depth = parentNode.depth + 1;
          parentNode.children.push(layerNode);
        }
      } else {
        // Root node
        rootNodes.push(layerNode);
      }
    });

    // Initialize expanded state for all nodes with children (expanded by default)
    if (!isInitialized) {
      const newExpandedNodes = new Set<string>();
      const addExpandedNodes = (nodes: LayerNode[]) => {
        nodes.forEach(node => {
          if (node.children.length > 0) {
            newExpandedNodes.add(node.id);
            addExpandedNodes(node.children);
          }
        });
      };
      addExpandedNodes(rootNodes);
      setExpandedNodes(newExpandedNodes);
      setIsInitialized(true);
    }

    return rootNodes;
  };

  const toggleExpanded = (nodeId: string) => {
    setExpandedNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  };

  const selectNode = (nodeId: string) => {
    if (!getLayerState(nodeId).isLocked) {
      actions.selectNode(nodeId);
    }
  };

  const deleteNode = (nodeId: string) => {
    if (!getLayerState(nodeId).isLocked) {
      actions.delete(nodeId);
    }
  };

  const getLayerState = (nodeId: string): LayerState => {
    return layerStates.get(nodeId) || { isVisible: true, isLocked: false };
  };

  const updateLayerState = (nodeId: string, updates: Partial<LayerState>) => {
    setLayerStates(prev => {
      const newMap = new Map(prev);
      const currentState = newMap.get(nodeId) || { isVisible: true, isLocked: false };
      newMap.set(nodeId, { ...currentState, ...updates });
      return newMap;
    });
  };

  const toggleVisibility = (nodeId: string) => {
    const currentState = getLayerState(nodeId);
    const newVisibility = !currentState.isVisible;
    
    // Update local state
    updateLayerState(nodeId, { isVisible: newVisibility });
    
    // Update CraftJS node hidden property to actually hide in canvas
    actions.setProp(nodeId, (props: any) => {
      props.hidden = !newVisibility;
    });
  };

  const toggleLock = (nodeId: string) => {
    const currentState = getLayerState(nodeId);
    updateLayerState(nodeId, { isLocked: !currentState.isLocked });
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id);
    
    // Find the dragged item
    const findNode = (nodes: LayerNode[]): LayerNode | null => {
      for (const node of nodes) {
        if (node.id === active.id) return node;
        const found = findNode(node.children);
        if (found) return found;
      }
      return null;
    };
    
    const draggedNode = findNode(buildLayerTree());
    if (draggedNode) {
      setDraggedItem({
        id: draggedNode.id,
        displayName: draggedNode.displayName,
        type: draggedNode.type
      });
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id) {
      setActiveId(null);
      setDraggedItem(null);
      return;
    }

    // Handle reordering and parent-child relationships
    const activeNodeId = active.id as string;
    const overNodeId = over.id as string;
    
    try {
      // Get the nodes to determine the correct parent and index
      const nodes = query.getNodes();
      const overNode = nodes[overNodeId];
      
      if (overNode) {
        // Move the node to be a child of the over node at the end
        const childrenCount = overNode.data.nodes ? overNode.data.nodes.length : 0;
        actions.move(activeNodeId, overNodeId, childrenCount);
      }
      
      // Force re-render to show immediate visual updates
      setTimeout(() => {
        setActiveId(null);
        setDraggedItem(null);
      }, 0);
    } catch (error) {
      console.warn('Failed to move node:', error);
      setActiveId(null);
      setDraggedItem(null);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    // This can be used for visual feedback during drag operations
  };

  // Sortable Layer Node Component
  const SortableLayerNode: React.FC<{ node: LayerNode }> = ({ node }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ 
      id: node.id,
      disabled: node.isLocked
    });

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
    };

    return (
      <div ref={setNodeRef} style={style} {...attributes}>
        {renderLayerNodeContent(node, listeners, isDragging)}
      </div>
    );
  };

  const renderLayerNodeContent = (node: LayerNode, listeners?: any, isDragging?: boolean): React.ReactNode => {
    const isSelected = selected.has(node.id);
    const isExpanded = expandedNodes.has(node.id);
    const hasChildren = node.children.length > 0;
    const layerState = getLayerState(node.id);

    return (
      <div key={node.id} className="select-none">
        {/* Node Row */}
        <div
          className={`
            flex items-center py-1.5 px-2 transition-all duration-200 cursor-pointer group relative
            ${isSelected 
              ? 'bg-blue-50 border-l-2 border-blue-500 shadow-sm' 
              : 'hover:bg-gray-50 border-l-2 border-transparent'
            }
            ${layerState.isLocked ? 'opacity-75' : ''}
            ${!layerState.isVisible ? 'opacity-50' : ''}
            ${isDragging ? 'shadow-lg ring-2 ring-blue-300' : ''}
          `}
          style={{ paddingLeft: `${8 + node.depth * 16}px` }}
          onClick={() => selectNode(node.id)}
        >
          {/* Drag Handle */}
          <div 
            {...listeners}
            className={`
              w-3 h-3 flex items-center justify-center mr-1.5 cursor-grab active:cursor-grabbing
              opacity-0 group-hover:opacity-100 transition-opacity
              ${node.isLocked ? 'cursor-not-allowed opacity-30' : ''}
            `}
          >
            <GripVertical className="w-2.5 h-2.5 text-gray-400" />
          </div>

          {/* Expand/Collapse Button */}
          <div className="w-4 h-4 flex items-center justify-center mr-1.5">
            {hasChildren ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleExpanded(node.id);
                }}
                className="p-0.5 hover:bg-gray-200 rounded-sm transition-colors"
              >
                {isExpanded ? (
                  <ChevronDown className="w-2.5 h-2.5 text-gray-600" />
                ) : (
                  <ChevronRight className="w-2.5 h-2.5 text-gray-600" />
                )}
              </button>
            ) : null}
          </div>

          {/* Node Icon */}
          <div className={`text-gray-600 mr-2 ${layerState.isLocked ? 'text-gray-400' : ''}`}>
            {getNodeIcon(node.type)}
          </div>

          {/* Node Name */}
          <div className={`
            flex-1 text-xs font-medium truncate
            ${isSelected ? 'text-blue-900' : 'text-gray-800'}
            ${layerState.isLocked ? 'text-gray-500' : ''}
          `}>
            {node.displayName}
          </div>

          {/* Status Indicators */}
          <div className="flex items-center space-x-0.5 mr-1.5">
            {layerState.isLocked && (
              <Lock className="w-2.5 h-2.5 text-amber-500" />
            )}
            {!layerState.isVisible && (
              <EyeOff className="w-2.5 h-2.5 text-gray-400" />
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleVisibility(node.id);
              }}
              className="p-1 hover:bg-gray-200 rounded-md transition-colors"
              title={layerState.isVisible ? 'Hide layer' : 'Show layer'}
            >
              {layerState.isVisible ? (
                <Eye className="w-3 h-3 text-gray-600" />
              ) : (
                <EyeOff className="w-3 h-3 text-gray-400" />
              )}
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleLock(node.id);
              }}
              className="p-1 hover:bg-gray-200 rounded-md transition-colors"
              title={layerState.isLocked ? 'Unlock layer' : 'Lock layer'}
            >
              {layerState.isLocked ? (
                <Lock className="w-3 h-3 text-amber-600" />
              ) : (
                <Unlock className="w-3 h-3 text-gray-600" />
              )}
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                deleteNode(node.id);
              }}
              className="p-1 hover:bg-red-100 rounded-md transition-colors"
              title="Delete layer"
              disabled={layerState.isLocked}
            >
              <Trash2 className={`w-3 h-3 ${layerState.isLocked ? 'text-gray-300' : 'text-red-500'}`} />
            </button>
          </div>
        </div>

        {/* Children */}
        {hasChildren && isExpanded && (
          <div className="transition-all duration-200">
            {node.children.map(child => (
              <SortableLayerNode key={child.id} node={child} />
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderLayerNode = (node: LayerNode): React.ReactNode => {
    return <SortableLayerNode key={node.id} node={node} />;
  };

  const layerTree = buildLayerTree();
  const allNodeIds = layerTree.flatMap(node => getAllNodeIds(node));

  // Helper function to get all node IDs recursively
  function getAllNodeIds(node: LayerNode): string[] {
    return [node.id, ...node.children.flatMap(child => getAllNodeIds(child))];
  }

  return (
    <div className={`h-full flex flex-col bg-white border-r border-gray-200 ${className || ''}`}>
      {/* Header */}
      <div className="px-3 py-2 border-b border-gray-200 bg-gray-50">
        <h3 className="text-xs font-semibold text-gray-800 flex items-center">
          <Layers className="w-3 h-3 mr-1.5 text-gray-600" />
          Layers
        </h3>
      </div>

      {/* Layers Tree */}
      <div className="flex-1 overflow-y-auto">
        {layerTree.length > 0 ? (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragOver={handleDragOver}
          >
            <SortableContext items={allNodeIds} strategy={verticalListSortingStrategy}>
              <div className="py-1">
                {layerTree.map(node => renderLayerNode(node))}
              </div>
            </SortableContext>
            
            <DragOverlay>
              {activeId && draggedItem ? (
                <div className="bg-white shadow-lg rounded-md border border-gray-300 px-2 py-1.5 flex items-center space-x-1.5">
                  <div className="text-gray-600">
                    {React.cloneElement(getNodeIcon(draggedItem.type), { className: 'w-3 h-3' })}
                  </div>
                  <span className="text-xs font-medium text-gray-800">
                    {draggedItem.displayName}
                  </span>
                </div>
              ) : null}
            </DragOverlay>
          </DndContext>
        ) : (
          <div className="flex items-center justify-center h-32 text-gray-500">
            <div className="text-center">
              <Layers className="w-8 h-8 mx-auto mb-2 text-gray-300" />
              <p className="text-xs font-medium text-gray-600">No layers found</p>
              <p className="text-xs text-gray-400 mt-0.5">Add elements to see them here</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};