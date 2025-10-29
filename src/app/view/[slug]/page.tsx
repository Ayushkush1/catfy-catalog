'use client'

import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import IframeEditor from '@/components/editor/IframeEditor'
import { toast } from 'sonner'
import { HtmlTemplates, type PrebuiltTemplate } from '@/components/editor/iframe-templates'

interface CatalogueData {
    id: string
    name: string
    description: string | null
    template: string | null
    settings: any
    products: any[]
    categories: any[]
    profile: {
        fullName: string | null
        companyName: string | null
        logo: string | null
    }
}

// Helper function to get template
function getTemplate(templateId: string | null): PrebuiltTemplate {
    if (!templateId) {
        return HtmlTemplates[0]
    }
    const template = HtmlTemplates.find(t => t.id === templateId)
    return template || HtmlTemplates[0]
}

export default function PublicCatalogueView() {
    const params = useParams()
    const slug = params?.slug as string
    const [catalogue, setCatalogue] = useState<CatalogueData | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchCatalogue = async () => {
            try {
                const response = await fetch(`/api/catalogues/public/${slug}`)
                if (!response.ok) {
                    throw new Error('Catalogue not found or not public')
                }
                const data = await response.json()
                setCatalogue(data)
            } catch (error) {
                console.error('Error fetching catalogue:', error)
                toast.error('Failed to load catalogue')
            } finally {
                setLoading(false)
            }
        }

        if (slug) {
            fetchCatalogue()
        }
    }, [slug])

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="text-center">
                    <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-500"></div>
                    <p className="text-gray-600">Loading catalogue...</p>
                </div>
            </div>
        )
    }

    if (!catalogue) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="text-center">
                    <h1 className="mb-2 text-2xl font-bold text-gray-800">Catalogue Not Found</h1>
                    <p className="text-gray-600">This catalogue is not available or has been removed.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="flex h-screen flex-col bg-gray-50">
            {/* Header */}
            <div className="border-b bg-white px-6 py-4 shadow-sm">
                <div className="mx-auto flex max-w-7xl items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">{catalogue.name}</h1>
                        {catalogue.description && (
                            <p className="mt-1 text-sm text-gray-600">{catalogue.description}</p>
                        )}
                        {catalogue.profile.companyName && (
                            <p className="mt-1 text-xs text-gray-500">By {catalogue.profile.companyName}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Content - Full Preview Mode */}
            <div className="flex flex-1 flex-col overflow-hidden">
                <div className="flex-1 overflow-auto bg-gray-100">
                    <IframeEditor
                        template={getTemplate(catalogue.template)}
                        catalogueId={catalogue.id}
                        previewMode={true}
                        autoSave={false}
                    />
                </div>
            </div>
        </div>
    )
}
