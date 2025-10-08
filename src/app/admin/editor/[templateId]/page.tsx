'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Save, Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'
import { CraftJSEditor, CraftJSEditorRef } from '@/components/editor/CraftJSEditor'

interface Template {
  id: string
  name: string
  description?: string
  category?: string
  isPremium?: boolean
  tags?: string[]
  previewImage?: string
  pageCount?: number
  compatibleThemes?: string[]
  contentType: 'SINGLE_PAGE_JSON' | 'MULTI_PAGE_JSON'
  jsonData: string
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
}

export default function AdminEditorPage() {
  const router = useRouter()
  const params = useParams()
  const templateId = params.templateId as string

  const [template, setTemplate] = useState<Template | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editorData, setEditorData] = useState('')
  const [isPreviewMode, setIsPreviewMode] = useState(false)
  const [currentEditorData, setCurrentEditorData] = useState('')
  const editorRef = useRef<CraftJSEditorRef>(null)

  // Load template data
  useEffect(() => {
    const loadTemplate = async () => {
      try {
        const response = await fetch(`/api/admin/templates/${templateId}`)
        if (!response.ok) {
          throw new Error('Failed to load template')
        }
        const data = await response.json()
        const template = data.template
        
        // Get the latest content from the contents array
        const latestContent = template.contents && template.contents.length > 0 
          ? template.contents[template.contents.length - 1] 
          : null
        
        console.log('Template loaded:', {
          templateId: template.id,
          contentsCount: template.contents?.length || 0,
          latestContent: latestContent ? { id: latestContent.id, type: latestContent.type } : null
        })
        
        // Convert content data to JSON string for the editor
        const editorData = latestContent 
          ? JSON.stringify(latestContent.data, null, 2)
          : JSON.stringify({
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
            }, null, 2)
        
        setTemplate({
          ...template,
          contentType: latestContent?.type || 'SINGLE_PAGE_JSON',
          jsonData: editorData
        })
        setEditorData(editorData)
      } catch (error) {
        console.error('Failed to load template:', error)
        toast.error('Failed to load template')
        router.push('/admin/templates')
      } finally {
        setLoading(false)
      }
    }

    if (templateId) {
      loadTemplate()
    }
  }, [templateId, router])

  // Save template
  const handleSave = async () => {
    if (!template) {
      toast.error('Template not loaded')
      return
    }

    // Get current data directly from the editor
    const currentData = editorRef.current?.getCurrentData()
    if (!currentData) {
      toast.error('No editor data to save')
      return
    }

    setSaving(true)
    try {
      const response = await fetch(`/api/admin/templates/${template.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: template.name,
          description: template.description,
          category: template.category,
          tags: template.tags,
          content: {
            type: template.contentType || 'SINGLE_PAGE_JSON',
            data: JSON.parse(currentData)
          }
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error('Failed to save template')
      }

      const result = await response.json()
      toast.success('Template saved successfully!')
    } catch (error) {
      console.error('Error saving template:', error)
      toast.error('Failed to save template')
    } finally {
      setSaving(false)
    }
  }

  // Go back to templates list
  const handleBack = () => {
    const hasUnsavedChanges = editorData && editorData !== template?.jsonData
    if (hasUnsavedChanges) {
      if (window.confirm('You have unsaved changes. Are you sure you want to leave?')) {
        router.push('/admin?tab=templates')
      }
    } else {
      router.push('/admin?tab=templates')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading template...</p>
        </div>
      </div>
    )
  }

  if (!template) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Template not found</p>
          <Button onClick={() => router.push('/admin?tab=templates')}>
            Back to Templates
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
     

      {/* Editor */}
      <div className="flex-1 overflow-hidden h-full">
        <CraftJSEditor
          ref={editorRef}
          initialData={editorData}
          onSave={setCurrentEditorData}
          initialPreviewMode={isPreviewMode}
        />
      </div>
    </div>
  )
}