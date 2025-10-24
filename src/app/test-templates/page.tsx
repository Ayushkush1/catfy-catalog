'use client'

import { useEffect, useState } from 'react'
import { getAllTemplates, getTemplateById } from '@/templates'
import { templateManager } from '@/lib/template-manager'

export default function TestTemplatesPage() {
  const [templates, setTemplates] = useState<any[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [logs, setLogs] = useState<string[]>([])

  const addLog = (message: string) => {
    console.log(message)
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  useEffect(() => {
    try {
      addLog('🔍 Testing template loading...')

      // Test getAllTemplates
      const allTemplates = getAllTemplates()
      addLog(`📊 Found ${allTemplates.length} templates`)
      setTemplates(allTemplates)

      // Test template manager
      const availableTemplates = templateManager.getAvailableTemplates('free')
      addLog(
        `🎯 Template manager found ${availableTemplates.length} available templates`
      )

      // Test individual template loading
      if (allTemplates.length > 0) {
        const firstTemplate = allTemplates[0]
        addLog(`🔍 Testing first template: ${firstTemplate.id}`)

        const templateById = getTemplateById(firstTemplate.id)
        if (templateById) {
          addLog(`✅ Successfully loaded template by ID: ${templateById.name}`)
          setSelectedTemplate(templateById)

          // Test template data preparation
          const preparedData = templateManager.prepareTemplateData(
            firstTemplate.id
          )
          if (preparedData.success) {
            addLog(`✅ Template data prepared successfully`)
          } else {
            addLog(`❌ Failed to prepare template data: ${preparedData.error}`)
          }
        } else {
          addLog(`❌ Failed to load template by ID`)
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      addLog(`❌ Error during template testing: ${errorMessage}`)
      setError(errorMessage)
    }
  }, [])

  return (
    <div className="mx-auto max-w-4xl p-8">
      <h1 className="mb-6 text-2xl font-bold">Template Loading Test</h1>

      {error && (
        <div className="mb-4 rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700">
          <strong>Error:</strong> {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Logs */}
        <div>
          <h2 className="mb-3 text-lg font-semibold">Debug Logs</h2>
          <div className="h-64 overflow-y-auto rounded-lg bg-gray-100 p-4">
            {logs.map((log, index) => (
              <div key={index} className="mb-1 font-mono text-sm">
                {log}
              </div>
            ))}
          </div>
        </div>

        {/* Templates List */}
        <div>
          <h2 className="mb-3 text-lg font-semibold">
            Available Templates ({templates.length})
          </h2>
          <div className="h-64 overflow-y-auto rounded-lg bg-gray-100 p-4">
            {templates.map((template, index) => (
              <div key={index} className="mb-2 rounded border bg-white p-2">
                <div className="font-medium">{template.name}</div>
                <div className="text-sm text-gray-600">ID: {template.id}</div>
                <div className="text-sm text-gray-600">
                  Category: {template.category}
                </div>
                <div className="text-sm text-gray-600">
                  Editor Template:{' '}
                  {template.customProperties?.isEditorTemplate ? 'Yes' : 'No'}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Selected Template Details */}
      {selectedTemplate && (
        <div className="mt-6">
          <h2 className="mb-3 text-lg font-semibold">
            Selected Template Details
          </h2>
          <div className="rounded-lg bg-gray-100 p-4">
            <pre className="overflow-x-auto text-sm">
              {JSON.stringify(selectedTemplate, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  )
}
