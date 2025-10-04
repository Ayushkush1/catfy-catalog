import React from 'react';
import { useNode, useEditor } from '@craftjs/core';
import { Copy, Trash2, ArrowUp, ArrowDown } from 'lucide-react';

interface InlineQuickActionsProps {
  nodeId: string;
}

export const InlineQuickActions: React.FC<InlineQuickActionsProps> = ({ nodeId }) => {
  const { actions, query } = useEditor();
  
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

  return (
    <div 
      className="inline-quick-actions"
      style={{
        position: 'absolute',
        top: '-40px',
        right: '0px',
        display: 'flex',
        gap: '4px',
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        borderRadius: '8px',
        padding: '4px',
        zIndex: 1000,
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        backdropFilter: 'blur(8px)',
        border: '1px solid rgba(255, 255, 255, 0.1)'
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