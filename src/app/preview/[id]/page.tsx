'use client'
import { useState, useEffect } from 'react'
import { notFound } from 'next/navigation'
import dynamic from 'next/dynamic'
import { templateRegistry } from '@/lib/template-registry'
import { Spinner } from '@/components/ui/spinner'

// Dynamically import GrapesJSTemplate to avoid SSR issues
const GrapesJSTemplate = dynamic(
  () => import('@/components/catalog-templates/grapesjs-template/GrapesJSTemplate'),
  { 
    ssr: false,
    loading: () => <div className="flex items-center justify-center h-screen"><Spinner size="lg" /></div>
  }
)

interface PreviewPageProps {
  params: {
    id: string
  }
}

export default function PreviewPage({ params }: PreviewPageProps) {
  const { id } = params
  const [catalogue, setCatalogue] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchCatalogue() {
      try {
        const response = await fetch(`/api/catalogues/${id}`)
        if (!response.ok) {
          throw new Error('Failed to fetch catalogue')
        }
        const data = await response.json()
        setCatalogue(data)
      } catch (err) {
        setError('Failed to load catalogue')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchCatalogue()
  }, [id])

  if (loading) {
    return <div className="flex items-center justify-center h-screen"><Spinner size="lg" /></div>
  }

  if (error || !catalogue) {
    return <div className="flex items-center justify-center h-screen">Failed to load catalogue</div>
  }

  // Use the GrapesJS template for rendering
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* A4 sized preview container */}
        <div className="flex justify-center">
          <div 
            className="bg-white shadow-lg"
            style={{
              width: '794px',
              minHeight: '1123px',
              maxWidth: '100%'
            }}
          >
            <div style={{ width: '100%', height: '100%' }}>
              <GrapesJSTemplate 
                content={catalogue.content || {}}
                theme={catalogue.theme || {}}
                isEditMode={false}
                onContentUpdate={() => {}}
                templateId="grapesjs-template"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}