'use client';

import React, { useEffect, useState } from 'react';
import { CraftJSEditor } from '@/components/editor/CraftJSEditor';
import { toast } from 'sonner';

const EDITOR_CATALOGUE_NAME = 'Standalone Editor';

export default function EditorPage() {
  const [catalogueId, setCatalogueId] = useState<string | null>(null);
  const [initialData, setInitialData] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize or find the editor catalogue
  useEffect(() => {
    const initializeEditorCatalogue = async () => {
      try {
        // First, try to find existing editor catalogue
        const response = await fetch('/api/catalogues');
        const catalogues = await response.json();
        
        let editorCatalogue = catalogues.find((cat: any) => cat.name === EDITOR_CATALOGUE_NAME);
        
        if (!editorCatalogue) {
          // Create a new catalogue for the standalone editor
          const createResponse = await fetch('/api/catalogues', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              name: EDITOR_CATALOGUE_NAME,
              description: 'Default catalogue for standalone editor',
              theme: 'modern',
              isPublic: false,
              settings: {
                editorData: undefined
              }
            })
          });
          
          if (!createResponse.ok) {
            throw new Error('Failed to create editor catalogue');
          }
          
          editorCatalogue = await createResponse.json();
        }
        
        setCatalogueId(editorCatalogue.id);
        
        // Load existing editor data if available
        if (editorCatalogue.settings?.editorData) {
          setInitialData(editorCatalogue.settings.editorData);
        } else {
          // Fallback to localStorage for migration
          if (typeof window !== 'undefined') {
            const localData = localStorage.getItem('craft-editor-data');
            if (localData) {
              setInitialData(localData);
              // Save to backend and clear localStorage
              await handleSave(localData);
              localStorage.removeItem('craft-editor-data');
            }
          }
        }
      } catch (error) {
        console.error('Error initializing editor catalogue:', error);
        toast.error('Failed to initialize editor. Using local storage as fallback.');
        // Fallback to localStorage
        if (typeof window !== 'undefined') {
          setInitialData(localStorage.getItem('craft-editor-data') || undefined);
        }
      } finally {
        setIsLoading(false);
      }
    };

    initializeEditorCatalogue();
  }, []);

  const handleSave = async (data: string) => {
    console.log('Saving editor data:', data);
    
    if (!catalogueId) {
      console.warn('No catalogue ID available, saving to localStorage as fallback');
      localStorage.setItem('craft-editor-data', data);
      toast.error('Save failed. Data saved locally as backup.');
      return;
    }

    try {
      const response = await fetch(`/api/catalogues/${catalogueId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          settings: {
            editorData: data
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to save editor data');
      }

      toast.success('Editor data saved successfully!');
    } catch (error) {
      console.error('Error saving editor data:', error);
      toast.error('Failed to save editor data. Saving locally as backup.');
      // Fallback to localStorage
      localStorage.setItem('craft-editor-data', data);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading editor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen">
      <CraftJSEditor
        initialData={initialData}
        onSave={handleSave}
        className="w-full h-full"
      />
    </div>
  );
}