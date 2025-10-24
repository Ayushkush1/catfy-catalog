import React from 'react'
import { useNode } from '@craftjs/core'
import { InlineQuickActions } from './InlineQuickActions'

interface BlockWrapperProps {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
}

export const BlockWrapper: React.FC<BlockWrapperProps> = ({
  children,
  className = '',
  style = {},
}) => {
  const {
    connectors: { connect, drag },
    selected,
    id,
  } = useNode(state => ({
    selected: state.events.selected,
  }))

  return (
    <div
      ref={ref => {
        if (ref) {
          connect(drag(ref))
        }
      }}
      className={className}
      style={{
        ...style,
        outline: selected ? '2px solid #3b82f6' : 'none',
        outlineOffset: '2px',
        position: 'relative',
        display: 'inline-block',
        minWidth: 'fit-content',
      }}
    >
      {children}
      {selected && <InlineQuickActions nodeId={id} />}
    </div>
  )
}
