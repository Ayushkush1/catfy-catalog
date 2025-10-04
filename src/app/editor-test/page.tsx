'use client'

import React from 'react'
import { CraftJSEditor } from '@/components/editor/CraftJSEditor'

// Minimal initial canvas state (single page)
const initialEditorData = JSON.stringify({
  ROOT: {
    type: { resolvedName: 'ContainerBlock' },
    isCanvas: true,
    props: {},
    displayName: 'Container',
    custom: {},
    hidden: false,
    nodes: [],
    linkedNodes: {},
    parent: null
  }
})

export default function EditorTestPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="h-screen">
        <CraftJSEditor
          initialData={initialEditorData}
          initialPreviewMode={false}
          className="h-full"
        />
      </div>
    </div>
  )
}