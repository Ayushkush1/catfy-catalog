'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

interface TemplateCreationDialogProps {
  isOpen: boolean
  onClose: () => void
  onTemplateCreated: (templateId: string) => void
}

export default function TemplateCreationDialog({ isOpen, onClose, onTemplateCreated }: TemplateCreationDialogProps) {
  const router = useRouter()
  
  // Form state
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [isPremium, setIsPremium] = useState(false)
  const [tags, setTags] = useState('')
  const [previewImage, setPreviewImage] = useState('')
  const [pageCount, setPageCount] = useState(1)
  const [compatibleThemes, setCompatibleThemes] = useState('*')
  const [contentType, setContentType] = useState<'SINGLE_PAGE_JSON' | 'MULTI_PAGE_JSON'>('SINGLE_PAGE_JSON')
  const [submitting, setSubmitting] = useState(false)

  // Handle form submission
  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error('Template name is required')
      return
    }

    if (!category) {
      toast.error('Template category is required')
      return
    }

    setSubmitting(true)
    try {
      // Create template with basic details and empty editor data
      const requestBody: any = {
        name: name.trim(),
        description: description.trim(),
        category,
        isPremium,
        tags: tags.split(',').map(tag => tag.trim()).filter(Boolean),
        pageCount: typeof pageCount === 'number' ? pageCount : 1,
        compatibleThemes: compatibleThemes.split(',').map(theme => theme.trim()).filter(Boolean),
        content: {
          type: contentType,
          data: {
            ROOT: {
              type: { resolvedName: 'Container' },
              isCanvas: true,
              props: {},
              displayName: 'Container',
              custom: {},
              hidden: false,
              nodes: [],
              linkedNodes: {}
            }
          }
        }
      }

      // Only include previewImage if it's not empty
      if (previewImage.trim()) {
        requestBody.previewImage = previewImage.trim()
      }

      const response = await fetch('/api/admin/templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      })

      if (!response.ok) {
        throw new Error('Failed to create template')
      }

      const result = await response.json()
      const templateId = result.id
      
      toast.success('Template created successfully! Redirecting to editor...')
      onClose()
      
      // Redirect to the editor page
      router.push(`/admin/editor/${templateId}`)
      
      // Notify parent component
      onTemplateCreated(templateId)
      
    } catch (error) {
      console.error('Failed to create template:', error)
      toast.error('Failed to create template. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  // Handle dialog close
  const handleClose = () => {
    onClose()
  }

  // Reset form when dialog opens
  React.useEffect(() => {
    if (isOpen) {
      // Reset form for new template
      setName('')
      setDescription('')
      setCategory('')
      setIsPremium(false)
      setTags('')
      setPreviewImage('')
      setPageCount(1)
      setCompatibleThemes('*')
      setContentType('SINGLE_PAGE_JSON')
    }
  }, [isOpen])

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Template</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Template Name *
            </label>
            <Input
              placeholder="Enter template name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <Textarea
              placeholder="Describe your template"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category *
            </label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                 <SelectItem value="business">Business</SelectItem>
                 <SelectItem value="personal">Personal</SelectItem>
                 <SelectItem value="education">Education</SelectItem>
                 <SelectItem value="creative">Creative</SelectItem>
                 <SelectItem value="marketing">Marketing</SelectItem>
                 <SelectItem value="catalog">Catalog</SelectItem>
               </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <input
              id="premium"
              type="checkbox"
              checked={isPremium}
              onChange={(e) => setIsPremium(e.target.checked)}
              className="rounded border-gray-300"
            />
            <label htmlFor="premium" className="text-sm font-medium text-gray-700">
              Premium Template
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags
            </label>
            <Input
              placeholder="Enter tags (comma separated)"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full"
            />
            {tags && (
              <div className="flex flex-wrap gap-1 mt-2">
                {tags.split(',').map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {tag.trim()}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preview Image URL
            </label>
            <Input
              placeholder="https://example.com/preview.jpg"
              value={previewImage}
              onChange={(e) => setPreviewImage(e.target.value)}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Page Count
            </label>
            <Input
              type="number"
              min="1"
              placeholder="1"
              value={pageCount}
              onChange={(e) => setPageCount(e.target.value ? parseInt(e.target.value) : '')}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Compatible Themes
            </label>
            <Input
              placeholder="* (all themes) or theme1, theme2"
              value={compatibleThemes}
              onChange={(e) => setCompatibleThemes(e.target.value)}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content Type
            </label>
            <Select value={contentType} onValueChange={(v) => setContentType(v as any)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select content type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SINGLE_PAGE_JSON">Single Page</SelectItem>
                <SelectItem value="MULTI_PAGE_JSON">Multi Page</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4">
          <Button variant="outline" onClick={handleClose} disabled={submitting}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={submitting || !name.trim()}
            className="min-w-[100px]"
          >
            {submitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Creating...
              </>
            ) : (
              'Create Template'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}