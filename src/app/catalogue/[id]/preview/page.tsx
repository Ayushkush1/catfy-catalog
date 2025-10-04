'use client'

import { CraftJSEditor } from '@/components/editor/CraftJSEditor'
import { Button } from '@/components/ui/button'
import { Catalogue as PrismaCatalogue } from '@prisma/client'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

export default function CataloguePreviewPage() {
  const [catalogue, setCatalogue] = useState<PrismaCatalogue | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const params = useParams()
  const catalogueId = params.id as string

  const loadCatalogue = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch(`/api/catalogues/${catalogueId}`)

      if (response.ok) {
        const data = await response.json()
        setCatalogue(data.catalogue)
      } else if (response.status === 404) {
        setError('Catalogue not found')
      } else {
        setError('Failed to load catalogue')
      }
    } catch (err) {
      setError('Failed to load catalogue')
      console.error('Load error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCatalogueUpdate = async (catalogueId: string, updates: Partial<PrismaCatalogue>) => {
    try {
      const response = await fetch(`/api/catalogues/${catalogueId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      })

      if (!response.ok) {
        throw new Error('Failed to update catalogue')
      }

      const responseData = await response.json()
      const updatedCatalogue = responseData.catalogue || responseData

      setCatalogue(prev => {
        if (!prev) return null
        return {
          ...prev,
          ...updatedCatalogue,
          settings: {
            ...(prev.settings as object || {}),
            ...(updatedCatalogue.settings as object || {})
          }
        }
      })
    } catch (error) {
      console.error('Error updating catalogue:', error)
    }
  }

  useEffect(() => {
    if (catalogueId) {
      loadCatalogue()
    }
  }, [catalogueId])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading catalogue...</p>
        </div>
      </div>
    )
  }

  if (error || !catalogue) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error || 'Catalogue not found'}</p>
          <Button asChild>
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      

      {/* CraftJS Editor */}
      <div className="h-screen">
        {(() => {
          let editorData: string | undefined = undefined;
          
          try {
            // Handle the double JSON stringification issue
            const rawEditorData = (catalogue?.settings as any)?.editorData;
            const isMultiPage = (catalogue?.settings as any)?.isMultiPage;
            const pageCount = (catalogue?.settings as any)?.pageCount || 1;
            
            console.log('🔍 Preview Page Debug:', {
              catalogueExists: !!catalogue,
              catalogueId: catalogue?.id,
              settingsExists: !!(catalogue?.settings),
              rawEditorDataExists: !!rawEditorData,
              rawEditorDataType: typeof rawEditorData,
              rawEditorDataLength: rawEditorData?.length,
              rawEditorDataPreview: rawEditorData?.substring(0, 200),
              isMultiPage,
              pageCount
            });
            
            if (rawEditorData) {
              if (typeof rawEditorData === 'string') {
                // Try to parse it - it might be double-stringified
                try {
                  const parsed = JSON.parse(rawEditorData);
                  
                  // Check if this is multi-page data (array of pages)
                  if (isMultiPage && Array.isArray(parsed)) {
                    console.log('📄 Multi-page catalog detected with', parsed.length, 'pages');
                    editorData = rawEditorData; // Keep the multi-page structure
                  } else if (typeof parsed === 'object' && parsed.ROOT) {
                    // It's a single-page template data object
                    editorData = rawEditorData;
                  } else if (typeof parsed === 'string') {
                    // It was double-stringified, use the parsed string
                    editorData = parsed;
                  } else {
                    // It's some other format, stringify the parsed object
                    editorData = JSON.stringify(parsed);
                  }
                } catch (parseError) {
                  console.error('❌ Failed to parse editorData:', parseError);
                  editorData = undefined;
                }
              } else if (typeof rawEditorData === 'object') {
                // It's already an object, stringify it
                editorData = JSON.stringify(rawEditorData);
              }
            }
            
            console.log('✅ Processed editorData:', {
              finalEditorDataExists: !!editorData,
              finalEditorDataType: typeof editorData,
              finalEditorDataLength: editorData?.length,
              finalEditorDataPreview: editorData?.substring(0, 200),
              isMultiPageCatalog: isMultiPage,
              expectedPageCount: pageCount
            });
            
          } catch (error) {
            console.error('❌ Error processing editorData:', error);
            editorData = undefined;
          }
          
          return (
            <CraftJSEditor
              initialData={editorData}
              initialPreviewMode={true}
              backButton={{
                href: `/catalogue/${catalogue.id}/edit`,
                catalogueName: catalogue.name || "Untitled Catalogue"
              }}
              onSave={(data) => {
                if (catalogue?.id) {
                  handleCatalogueUpdate(catalogue.id, {
                    settings: {
                      ...(catalogue.settings as object || {}),
                      editorData: data
                    } as any
                  })
                  toast.success('Editor content saved successfully')
                }
              }}
              className="h-full"
            />
          );
        })()}
      </div>
    </div>
  )
}