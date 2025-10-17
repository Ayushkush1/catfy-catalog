'use client';

import React, { useState } from 'react';
import { useEditor } from '@craftjs/core';
import { Plus } from 'lucide-react';
import { TemplateManagerProps } from './types';
import { UnifiedTemplateSelector } from '@/components/ui/unified-template-selector';
import { TemplateManager as UnifiedTemplateManager } from '@/lib/template-manager';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export const TemplateManager: React.FC<TemplateManagerProps> = ({
  onLoadTemplate,
  onSaveTemplate,
  currentData
}) => {
  const { query } = useEditor();
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveForm, setSaveForm] = useState({
    name: '',
    description: '',
    category: 'custom',
    tags: ''
  });

  const templateManager = UnifiedTemplateManager.getInstance();

  // Handle saving current design as template
  const handleSaveTemplate = () => {
    if (!saveForm.name.trim()) return;

    const templateData = {
      id: `custom-${Date.now()}`,
      name: saveForm.name,
      description: saveForm.description,
      category: saveForm.category as any,
      tags: saveForm.tags.split(',').map(tag => tag.trim()).filter(Boolean),
      data: query.serialize(),
      isPremium: false,
      isCustom: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Save to localStorage for custom templates
    const customTemplates = JSON.parse(localStorage.getItem('craft-templates') || '[]');
    customTemplates.push(templateData);
    localStorage.setItem('craft-templates', JSON.stringify(customTemplates));
    
    setShowSaveDialog(false);
    setSaveForm({ name: '', description: '', category: 'custom', tags: '' });
    
    if (onSaveTemplate) {
      onSaveTemplate(saveForm.name, saveForm.description, saveForm.category, templateData.tags);
    }
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Templates</h2>
          <button
            onClick={() => setShowSaveDialog(true)}
            className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
          >
            <Plus className="w-4 h-4" />
            Save Current
          </button>
        </div>
      </div>

      {/* Unified Template Selector */}
      <div className="flex-1 overflow-hidden">
        <UnifiedTemplateSelector
          context={{
            type: 'edit',
            onTemplateSelected: (templateId, templateData) => {
              // Convert TemplateConfig to Template format
              const templateConfig = templateManager.getTemplateById(templateId);
              if (templateConfig) {
                const template = {
                  id: templateConfig.id,
                  name: templateConfig.name,
                  description: templateConfig.description,
                  category: templateConfig.category,
                  thumbnail: templateConfig.previewImage,
                  data: templateData,
                  tags: templateConfig.tags || [],
                  isCustom: false,
                  createdAt: templateConfig.createdAt || new Date(),
                  updatedAt: templateConfig.updatedAt || new Date()
                };
                onLoadTemplate(template);
              }
            },
            onError: (error) => {
              console.error('Template selection error:', error);
              alert('Failed to select template: ' + error);
            }
          }}
          onTemplateSelect={(templateId) => {
            // Handle direct template selection
            const templateConfig = templateManager.getTemplateById(templateId);
            if (templateConfig) {
              const template = {
                id: templateConfig.id,
                name: templateConfig.name,
                description: templateConfig.description,
                category: templateConfig.category,
                thumbnail: templateConfig.previewImage,
                data: '', // Will be loaded by the template renderer
                tags: templateConfig.tags || [],
                isCustom: false,
                createdAt: templateConfig.createdAt || new Date(),
                updatedAt: templateConfig.updatedAt || new Date()
              };
              onLoadTemplate(template);
            }
          }}
          showPreview={true}
          className="h-full"
        />
      </div>

      {/* Save Template Dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Save Template</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Template Name *
              </label>
              <Input
                value={saveForm.name}
                onChange={(e) => setSaveForm({ ...saveForm, name: e.target.value })}
                placeholder="Enter template name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <Textarea
                value={saveForm.description}
                onChange={(e) => setSaveForm({ ...saveForm, description: e.target.value })}
                placeholder="Describe your template"
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <Select value={saveForm.category} onValueChange={(value) => setSaveForm({ ...saveForm, category: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="custom">Custom</SelectItem>
                  <SelectItem value="modern">Modern</SelectItem>
                  <SelectItem value="classic">Classic</SelectItem>
                  <SelectItem value="minimal">Minimal</SelectItem>
                  <SelectItem value="creative">Creative</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tags (comma-separated)
              </label>
              <Input
                value={saveForm.tags}
                onChange={(e) => setSaveForm({ ...saveForm, tags: e.target.value })}
                placeholder="e.g., modern, responsive, business"
              />
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <Button
              variant="outline"
              onClick={() => setShowSaveDialog(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveTemplate}
              disabled={!saveForm.name.trim()}
              className="flex-1"
            >
              Save Template
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};