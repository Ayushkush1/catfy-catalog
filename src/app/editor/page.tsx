'use client';

import React from 'react';
import { CraftJSEditor } from '@/components/editor/CraftJSEditor';

export default function EditorPage() {
  const handleSave = (data: string) => {
    console.log('Saving editor data:', data);
    // Here you would typically save to your backend/database
    localStorage.setItem('craft-editor-data', data);
  };

  const getInitialData = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('craft-editor-data') || undefined;
    }
    return undefined;
  };

  return (
    <div className="w-full h-screen">
      <CraftJSEditor
        initialData={getInitialData()}
        onSave={handleSave}
        className="w-full h-full"
      />
    </div>
  );
}