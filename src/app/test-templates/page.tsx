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
      addLog(`🎯 Template manager found ${availableTemplates.length} available templates`)
      
      // Test individual template loading
      if (allTemplates.length > 0) {
        const firstTemplate = allTemplates[0]
        addLog(`🔍 Testing first template: ${firstTemplate.id}`)
        
        const templateById = getTemplateById(firstTemplate.id)
        if (templateById) {
          addLog(`✅ Successfully loaded template by ID: ${templateById.name}`)
          setSelectedTemplate(templateById)
          
          // Test template data preparation
          const preparedData = templateManager.prepareTemplateData(firstTemplate.id)
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
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Template Loading Test</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <strong>Error:</strong> {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Logs */}
        <div>
          <h2 className="text-lg font-semibold mb-3">Debug Logs</h2>
          <div className="bg-gray-100 p-4 rounded-lg h-64 overflow-y-auto">
            {logs.map((log, index) => (
              <div key={index} className="text-sm font-mono mb-1">
                {log}
              </div>
            ))}
          </div>
        </div>
        
        {/* Templates List */}
        <div>
          <h2 className="text-lg font-semibold mb-3">Available Templates ({templates.length})</h2>
          <div className="bg-gray-100 p-4 rounded-lg h-64 overflow-y-auto">
            {templates.map((template, index) => (
              <div key={index} className="mb-2 p-2 bg-white rounded border">
                <div className="font-medium">{template.name}</div>
                <div className="text-sm text-gray-600">ID: {template.id}</div>
                <div className="text-sm text-gray-600">Category: {template.category}</div>
                <div className="text-sm text-gray-600">
                  Editor Template: {template.customProperties?.isEditorTemplate ? 'Yes' : 'No'}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Selected Template Details */}
      {selectedTemplate && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-3">Selected Template Details</h2>
          <div className="bg-gray-100 p-4 rounded-lg">
            <pre className="text-sm overflow-x-auto">
              {JSON.stringify(selectedTemplate, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  )
}