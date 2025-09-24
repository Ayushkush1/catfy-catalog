'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { templateSelectionManager } from '@/lib/template-management';
import { useRouter } from 'next/navigation';

interface TemplateSelectorProps {
  catalogueId: string;
  onTemplateSelect?: (templateId: string) => void;
}

// Sample template data - in a real implementation, this would come from the API
const SAMPLE_TEMPLATES = [
  {
    id: 'modern-grapesjs',
    name: 'Modern GrapesJS Template',
    description: 'A fully customizable template with drag-and-drop editing',
    previewImage: '/templates/modern-grapesjs-preview.svg',
    isPremium: false
  },
  {
    id: 'skincare-catalogue',
    name: 'Skin Care Catalogue',
    description: 'A modern template designed for skincare brands',
    previewImage: '/templates/skincare-catalogue-preview.svg',
    isPremium: false
  },
  {
    id: 'fashion-catalogue',
    name: 'Fashion Catalogue',
    description: 'Elegant layouts for fashion brands',
    previewImage: '/templates/fashion-catalogue-preview.svg',
    isPremium: false
  }
];

export function GrapesJSTemplateSelector({ catalogueId, onTemplateSelect }: TemplateSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const router = useRouter();

  // Load the current template selection on mount
  useEffect(() => {
    const selection = templateSelectionManager.getTemplateForCatalogue(catalogueId);
    if (selection) {
      setSelectedTemplate(selection.templateId);
    }
  }, [catalogueId]);

  // Handle template selection
  const handleSelectTemplate = (templateId: string) => {
    setSelectedTemplate(templateId);
    templateSelectionManager.setTemplateForCatalogue(catalogueId, templateId);
    
    if (onTemplateSelect) {
      onTemplateSelect(templateId);
    }
    
    setIsOpen(false);
  };

  // Handle edit with GrapesJS button click
  const handleEditWithGrapesJS = () => {
    if (!selectedTemplate) {
      setIsOpen(true);
      return;
    }
    
    // Navigate to the GrapesJS editor page with the catalogue and template IDs
    router.push(`/editor/${catalogueId}?template=${selectedTemplate}`);
  };

  return (
    <>
      <Button 
        onClick={handleEditWithGrapesJS}
        className="bg-blue-600 hover:bg-blue-700 text-white"
      >
        {selectedTemplate ? 'Edit with GrapesJS' : 'Select Template & Edit'}
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Select a Template</DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            {SAMPLE_TEMPLATES.map((template) => (
              <Card 
                key={template.id}
                className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                  selectedTemplate === template.id ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => handleSelectTemplate(template.id)}
              >
                <div className="aspect-video bg-gray-100 mb-3 overflow-hidden">
                  <img 
                    src={template.previewImage} 
                    alt={template.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="font-semibold text-lg">{template.name}</h3>
                <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                {template.isPremium && (
                  <span className="inline-block mt-2 px-2 py-1 bg-amber-100 text-amber-800 text-xs rounded-full">
                    Premium
                  </span>
                )}
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}