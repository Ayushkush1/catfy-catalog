"use client"

import React, { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Search, Edit, CheckCircle, RefreshCw, Plus, UploadCloud } from 'lucide-react'
import { toast } from 'sonner'
import TemplateCreationDialog from './TemplateEditorDialog'

type AdminTemplateItem = {
  id: string
  name: string
  description?: string | null
  category?: string | null
  isPremium?: boolean | null
  tags?: string[] | null
  previewImage?: string | null
  pageCount?: number | null
  compatibleThemes?: string[] | null
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
  updatedAt: string
  source: 'database' | 'built_in'
}



export default function TemplateManagement() {
  const [items, setItems] = useState<AdminTemplateItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const router = useRouter()

  // Registry imports will be loaded dynamically inside load() to avoid
  // client-side bundling issues between ESM and CommonJS.

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      // Try to load admin templates, but continue gracefully if unavailable
      let dbItems: AdminTemplateItem[] = []
      try {
        const res = await fetch('/api/admin/templates', { 
          cache: 'no-store',
          credentials: 'include'
        })
        if (res.ok) {
          const json = await res.json()
          dbItems = (json.templates || []).map((t: any) => ({
            id: t.id,
            name: t.name,
            description: t.description,
            category: t.category,
            isPremium: t.isPremium,
            tags: t.tags,
            previewImage: t.previewImage,
            pageCount: t.pageCount,
            compatibleThemes: t.compatibleThemes,
            status: t.status,
            updatedAt: t.updatedAt,
            source: 'database',
          }))
          console.log('✅ Database templates loaded:', dbItems.length)
        } else {
          console.warn('⚠️ Admin templates API unavailable:', res.status)
        }
      } catch (apiErr) {
        console.warn('Failed to load admin templates:', apiErr)
      }

      // Load built-in templates directly from PrebuiltTemplates
      let builtIns: AdminTemplateItem[] = []
      try {
        const { PrebuiltTemplates } = await import('@/components/editor/templates/PrebuiltTemplates')
        const dbIds = new Set(dbItems.map(i => i.id))
        
        builtIns = PrebuiltTemplates
          .filter((t: any) => !dbIds.has(t.id))
          .map((t: any) => ({
            id: t.id,
            name: t.name,
            description: t.description,
            category: t.category || 'modern',
            isPremium: false,
            tags: t.tags || [],
            previewImage: t.thumbnail || `/templates/${t.id}-preview.svg`,
            pageCount: t.pageCount || 1,
            compatibleThemes: ['modern-blue', 'classic-warm', 'minimal-mono'],
            status: 'PUBLISHED' as const,
            updatedAt: new Date().toISOString(),
            source: 'built_in' as const,
          }))
        
        console.log('✅ Built-in templates loaded:', builtIns.length)
      } catch (err) {
        console.error('Failed to load built-in templates:', err)
      }

      setItems([...dbItems, ...builtIns])
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const filteredItems = useMemo(() => {
    let list = items
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      list = list.filter(i =>
        i.name.toLowerCase().includes(q) ||
        (i.description || '').toLowerCase().includes(q) ||
        (i.tags || []).some(tag => tag.toLowerCase().includes(q))
      )
    }
    if (categoryFilter !== 'all') {
      list = list.filter(i => (i.category || '') === categoryFilter)
    }
    return list
  }, [items, searchQuery, categoryFilter])

  const openCreate = () => {
    setIsCreateOpen(true)
  }

  const handleTemplateCreated = (templateId: string) => {
    // Reload the templates list
    load()
  }

  const handleTemplateCreate = async (templateData: {
    name: string
    description: string
    category: string
    isPremium: boolean
    tags: string[]
    previewImage: string
    pageCount: number
    compatibleThemes: string[]
    contentType: 'SINGLE_PAGE_JSON' | 'MULTI_PAGE_JSON'
    jsonData: string
  }) => {
    try {
      const response = await fetch('/api/admin/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: templateData.name,
          description: templateData.description || null,
          category: templateData.category || null,
          isPremium: templateData.isPremium,
          tags: templateData.tags.length > 0 ? templateData.tags : null,
          previewImage: templateData.previewImage || null,
          pageCount: templateData.pageCount || null,
          compatibleThemes: templateData.compatibleThemes.length > 0 ? templateData.compatibleThemes : null,
          contentType: templateData.contentType,
          jsonData: templateData.jsonData
        })
      })
      
      if (!response.ok) {
        const errorData = await response.text()
        throw new Error(`Failed to create template: ${errorData}`)
      }
      
      await load()
      toast.success('Template created successfully')
    } catch (error) {
      console.error('Create error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to create template')
      throw error // Re-throw to let the dialog handle it
    }
  }

  const openEdit = (item: AdminTemplateItem) => {
    if (item.source === 'built_in') {
      toast.error('Built-in templates cannot be edited')
      return
    }
    // Redirect to the dedicated editor page
    router.push(`/admin/editor/${item.id}`)
  }





  const publish = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/templates/${id}/publish`, { method: 'POST' })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Publish failed')
      toast.success('Template published')
      await load()
    } catch (e: any) {
      setError(e.message)
      toast.error(e.message)
    }
  }

  const unpublish = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/templates/${id}/unpublish`, { method: 'POST' })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Unpublish failed')
      toast.success('Template unpublished')
      await load()
    } catch (e: any) {
      setError(e.message)
      toast.error(e.message)
    }
  }

  const remove = async (id: string) => {
    try {
      if (!confirm('Delete this template? This cannot be undone.')) return
      const res = await fetch(`/api/admin/templates/${id}`, { method: 'DELETE' })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Delete failed')
      toast.success('Template deleted')
      await load()
    } catch (e: any) {
      setError(e.message)
      toast.error(e.message)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Template Management</h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={load}>
            <RefreshCw className="w-4 h-4 mr-2" /> Refresh
          </Button>
          <Button onClick={openCreate}>
            <Plus className="w-4 h-4 mr-2" /> New Template
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {['all','modern','classic','minimal','creative','industry','specialized','product'].map(c => (
              <SelectItem key={c} value={c}>{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* List */}
      <Card>
        <CardContent>
          {loading ? (
            <div className="py-8 text-center text-gray-500">Loading templates...</div>
          ) : filteredItems.length === 0 ? (
            <div className="py-8 text-center text-gray-500">No templates found</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map(item => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.category || '-'}</TableCell>
                    
                    <TableCell>
                      <Badge variant={item.source === 'built_in' ? 'secondary' : 'outline'}>
                        {item.source === 'built_in' ? 'Built-in' : 'Database'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={item.status === 'PUBLISHED' ? 'default' : 'outline'}>
                        {item.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{new Date(item.updatedAt).toLocaleString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {item.source === 'database' && (
                          <>
                            <Button variant="outline" size="sm" onClick={() => openEdit(item)}>
                              <Edit className="w-4 h-4 mr-1" /> Edit
                            </Button>
                            {item.status !== 'PUBLISHED' ? (
                              <Button size="sm" onClick={() => publish(item.id)}>
                                <UploadCloud className="w-4 h-4 mr-1" /> Publish
                              </Button>
                            ) : (
                              <Button variant="secondary" size="sm" onClick={() => unpublish(item.id)}>
                                <RefreshCw className="w-4 h-4 mr-1" /> Unpublish
                              </Button>
                            )}
                            <Button variant="destructive" size="sm" onClick={() => remove(item.id)}>
                              Delete
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Template Creation Dialog */}
      <TemplateCreationDialog
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onTemplateCreated={handleTemplateCreated}
      />


    </div>
  )
}