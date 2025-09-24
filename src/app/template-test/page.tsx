'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { ModernGrapesJSTemplate } from '@/components/catalog-templates/modern-grapesjs/ModernGrapesJSTemplate';

// Sample data for testing
const sampleContent = {
  catalogue: {
    id: 'sample-catalogue',
    name: 'Sample Catalogue',
    description: 'This is a sample catalogue for testing GrapesJS integration',
    settings: {}
  },
  products: [
    {
      id: 'product-1',
      name: 'Premium Skincare Serum',
      description: 'Advanced formula with natural ingredients',
      price: 49.99,
      images: ['/sample-images/product1.jpg'],
      sku: 'SKU001',
      tags: ['skincare', 'premium'],
      currency: 'USD',
      priceDisplay: '$49.99',
      category: {
        id: 'cat-1',
        name: 'Skincare',
        description: 'Premium skincare products',
        color: '#f9a8d4'
      }
    },
    {
      id: 'product-2',
      name: 'Hydrating Face Mask',
      description: 'Deep hydration for all skin types',
      price: 29.99,
      images: ['/sample-images/product2.jpg'],
      sku: 'SKU002',
      tags: ['skincare', 'hydration'],
      currency: 'USD',
      priceDisplay: '$29.99',
      category: {
        id: 'cat-1',
        name: 'Skincare',
        description: 'Premium skincare products',
        color: '#f9a8d4'
      }
    }
  ],
  categories: [
    {
      id: 'cat-1',
      name: 'Skincare',
      description: 'Premium skincare products',
      color: '#f9a8d4'
    }
  ],
  profile: {
    id: 'profile-1',
    companyName: 'Luxe Beauty',
    fullName: 'John Smith',
    email: 'contact@luxebeauty.com',
    phone: '+1 (555) 123-4567',
    website: 'www.luxebeauty.com',
    address: '123 Beauty Lane, New York, NY 10001',
    logo: '/sample-images/logo.png',
    tagline: 'Luxury Skincare for Everyone',
    socialLinks: {
      instagram: 'luxebeauty',
      facebook: 'luxebeautyofficial',
      twitter: 'luxebeauty'
    }
  }
};

// Sample theme for testing
const sampleTheme = {
  id: 'default-theme',
  name: 'Default Theme',
  colors: {
    primary: '#3b82f6',
    secondary: '#10b981',
    accent: '#8b5cf6'
  }
};

export default function TemplateTestPage() {
  const [isEditMode, setIsEditMode] = useState(false);

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">GrapesJS Template Test</h1>
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={() => setIsEditMode(!isEditMode)}
        >
          {isEditMode ? 'View Preview' : 'Edit Template'}
        </button>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <ModernGrapesJSTemplate 
          content={sampleContent} 
          theme={sampleTheme} 
          isEditMode={isEditMode} 
        />
      </div>
    </div>
  );
}