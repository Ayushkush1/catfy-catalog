import React, { useEffect, useRef, useState } from 'react';
import { useNode, useEditor } from '@craftjs/core';
import { Copy, Trash2, ArrowUp, ArrowDown } from 'lucide-react';

interface InlineQuickActionsProps {
  nodeId: string;
}

interface Position {
  top?: string;
  bottom?: string;
  left?: string;
  right?: string;
}

export const InlineQuickActions: React.FC<InlineQuickActionsProps> = ({ nodeId }) => {
  const { actions, query } = useEditor();
  const buttonsRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<Position>({ top: '-40px', right: '0px' });
  
  const handleDuplicate = () => {
    const node = query.node(nodeId).get();
    if (node) {
      const parentId = node.data.parent;
      if (parentId) {
        const clonedNode = query.node(nodeId).toSerializedNode();
        actions.add(clonedNode as any, parentId);
      }
    }
  };

  const handleDelete = () => {
    actions.delete(nodeId);
  };

  const handleMoveUp = () => {
    const node = query.node(nodeId).get();
    if (node && node.data.parent) {
      const parentNode = query.node(node.data.parent).get();
      const currentIndex = parentNode.data.nodes.indexOf(nodeId);
      
      if (currentIndex > 0) {
        actions.move(nodeId, node.data.parent, currentIndex - 1);
      }
    }
  };

  const handleMoveDown = () => {
    const node = query.node(nodeId).get();
    if (node && node.data.parent) {
      const parentNode = query.node(node.data.parent).get();
      const currentIndex = parentNode.data.nodes.indexOf(nodeId);
      
      if (currentIndex < parentNode.data.nodes.length - 1) {
        actions.move(nodeId, node.data.parent, currentIndex + 1);
      }
    }
  };

  // Smart positioning logic
  const calculateOptimalPosition = () => {
    if (!buttonsRef.current) return;

    const buttonsElement = buttonsRef.current;
    const parentElement = buttonsElement.parentElement;
    
    if (!parentElement) return;

    const parentRect = parentElement.getBoundingClientRect();
    const buttonsRect = buttonsElement.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    const buttonWidth = 140; // Approximate width of buttons container
    const buttonHeight = 40; // Height of buttons container
    const margin = 8; // Margin from edges

    let newPosition: Position = {};

    // Determine vertical position (top or bottom)
    const spaceAbove = parentRect.top;
    const spaceBelow = viewportHeight - parentRect.bottom;
    
    if (spaceAbove >= buttonHeight + margin) {
      // Enough space above
      newPosition.top = `-${buttonHeight + margin}px`;
    } else if (spaceBelow >= buttonHeight + margin) {
      // Not enough space above, but enough below
      newPosition.bottom = `-${buttonHeight + margin}px`;
    } else {
      // Not enough space above or below, position inside
      if (spaceAbove > spaceBelow) {
        newPosition.top = `${margin}px`;
      } else {
        newPosition.bottom = `${margin}px`;
      }
    }

    // Determine horizontal position (left or right)
    const spaceRight = viewportWidth - parentRect.right;
    const spaceLeft = parentRect.left;
    
    if (spaceRight >= buttonWidth + margin) {
      // Enough space on the right
      newPosition.right = '0px';
    } else if (spaceLeft >= buttonWidth + margin) {
      // Not enough space on right, but enough on left
      newPosition.left = '0px';
      delete newPosition.right;
    } else {
      // Not enough space on either side, position inside
      if (spaceRight > spaceLeft) {
        newPosition.right = `${margin}px`;
      } else {
        newPosition.left = `${margin}px`;
        delete newPosition.right;
      }
    }

    setPosition(newPosition);
  };

  // Calculate position on mount and when window resizes
  useEffect(() => {
    calculateOptimalPosition();
    
    const handleResize = () => {
      calculateOptimalPosition();
    };
    
    const handleScroll = () => {
      calculateOptimalPosition();
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll, true);
    
    // Recalculate position after a short delay to ensure DOM is ready
    const timeoutId = setTimeout(calculateOptimalPosition, 100);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll, true);
      clearTimeout(timeoutId);
    };
  }, [nodeId]);

  return (
    <div 
      ref={buttonsRef}
      className="inline-quick-actions"
      style={{
        position: 'absolute',
        ...position,
        display: 'flex',
        gap: '4px',
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        borderRadius: '8px',
        padding: '6px',
        zIndex: 999999,
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        backdropFilter: 'blur(12px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        transition: 'all 0.2s ease-in-out',
        pointerEvents: 'auto',
        userSelect: 'none'
      }}
    >
      <button
        onClick={handleDuplicate}
        className="action-button duplicate"
        title="Duplicate"
        style={{
          background: 'transparent',
          border: 'none',
          color: 'white',
          padding: '6px',
          borderRadius: '4px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s ease',
          fontSize: '14px'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.5)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
        }}
      >
        <Copy size={14} />
      </button>
      
      <button
        onClick={handleDelete}
        className="action-button delete"
        title="Delete"
        style={{
          background: 'transparent',
          border: 'none',
          color: 'white',
          padding: '6px',
          borderRadius: '4px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s ease',
          fontSize: '14px'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.5)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
        }}
      >
        <Trash2 size={14} />
      </button>
      
      <button
        onClick={handleMoveUp}
        className="action-button move-up"
        title="Move Up"
        style={{
          background: 'transparent',
          border: 'none',
          color: 'white',
          padding: '6px',
          borderRadius: '4px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s ease',
          fontSize: '14px'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(34, 197, 94, 0.5)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
        }}
      >
        <ArrowUp size={14} />
      </button>
      
      <button
        onClick={handleMoveDown}
        className="action-button move-down"
        title="Move Down"
        style={{
          background: 'transparent',
          border: 'none',
          color: 'white',
          padding: '6px',
          borderRadius: '4px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.2s ease',
          fontSize: '14px'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'rgba(34, 197, 94, 0.5)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
        }}
      >
        <ArrowDown size={14} />
      </button>
    </div>
  );
};