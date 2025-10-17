import React from 'react'
import IframeEditor from '@/components/editor/IframeEditor'

const template = {
  id: 'prebuilt-001',
  name: 'Simple Product Catalogue',
  engine: 'mustache' as const,
  sharedCss: `
    :root { --text: #111827; --muted: #6B7280; }
    * { box-sizing: border-box; }
    body { margin: 0; font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji"; color: var(--text); }
    .a4 { width: 794px; height: 1123px; padding: 40px; }
    .title { font-size: 36px; font-weight: 700; }
    .subtitle { font-size: 16px; color: var(--muted); }
    .price { font-size: 28px; font-weight: 600; }
    .img { width: 100%; height: 420px; object-fit: cover; border-radius: 8px; border: 1px solid #eee; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
    .section { margin-top: 24px; }
  `,
  pages: [
    {
      id: 'cover',
      name: 'Cover',
      css: `.header { display:flex; justify-content:space-between; align-items:flex-end; }`,
      html: `
        <div class="a4">
          <div class="header">
            <div>
              <div class="title">{{profile.companyName}}</div>
              <div class="subtitle">{{profile.tagline}}</div>
            </div>
            <div class="price">{{product.price}}</div>
          </div>
          <div class="section">
            <img class="img" src="{{product.image}}" alt="Product" />
          </div>
          <div class="section">
            <div class="title">{{product.title}}</div>
            <div class="subtitle">{{product.description}}</div>
          </div>
        </div>
      `
    },
    {
      id: 'details',
      name: 'Details',
      html: `
        <div class="a4">
          <div class="grid">
            <div>
              <div class="title">Details</div>
              <div class="section">
                <div class="subtitle">Product</div>
                <p><strong>Title:</strong> {{product.title}}</p>
                <p><strong>Price:</strong> {{product.price}}</p>
                <p><strong>Description:</strong> {{product.description}}</p>
              </div>
              <div class="section">
                <div class="subtitle">Brand</div>
                <p><strong>Name:</strong> {{profile.companyName}}</p>
                <p><strong>Tagline:</strong> {{profile.tagline}}</p>
              </div>
            </div>
            <div>
              <img class="img" src="{{product.image}}" alt="Product" />
            </div>
          </div>
        </div>
      `
    }
  ]
}

export default function Page() {
  return (
    <div className="h-screen">
      <div className="h-16 border-b flex items-center px-4 justify-between">
        <div className="font-semibold">User Editor · {template.name}</div>
        <div className="text-sm text-gray-500">Engine: {template.engine}</div>
      </div>
      <IframeEditor 
        template={template}
        catalogueId="test-catalogue-id"
        autoSave={true}
        autoSaveInterval={3000}
        onSaveSuccess={() => {
          console.log('Test: Changes saved successfully')
        }}
        onSaveError={(error) => {
          console.error('Test: Failed to save changes:', error)
        }}
      />
    </div>
  )
}