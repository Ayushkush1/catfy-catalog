'use client';

import React from 'react';
import dynamic from 'next/dynamic';

// Import GrapesJS editor with dynamic import to avoid SSR issues
const GrapesJSEditor = dynamic(
  () => import('@/components/editor/GrapesJSEditor'),
  { ssr: false }
);

export default function EditorTestPage() {
  const handleSave = (content: string) => {
    console.log('Saved content:', content);
    // In production, this would save to your database
  };

  return (
    <div className="editor-test-page">
      <h1 className="sr-only">GrapesJS Editor Test</h1>
      <GrapesJSEditor onSave={handleSave} />
    </div>
  );
}