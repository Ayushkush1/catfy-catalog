'use client';

import React, { useState, useEffect } from 'react';
import { Catalogue, Profile, Product, Category } from '@prisma/client';
import { StandardizedContent } from '@/lib/content-schema';
import { ColorCustomization } from '../types/ColorCustomization';
import { FontCustomization, SpacingCustomization, AdvancedStyleCustomization } from '@/components/shared/StyleCustomizer';

interface NewCollectionPageProps {
  catalogue: Catalogue & {
    products: Product[];
    categories: Category[];
  };
  profile: Profile;
  themeColors?: any;
  isEditMode?: boolean;
  content: StandardizedContent;
  onProductsReorder?: (productIds: string[]) => void;
  onProductUpdate?: (productId: string, updates: Partial<Product>) => void;
  onContentChange?: (field: string, value: string) => void;
  customColors?: ColorCustomization;
  fontCustomization?: FontCustomization;
  spacingCustomization?: SpacingCustomization;
  advancedStyles?: AdvancedStyleCustomization;
}

export function NewCollectionPage({ 
  catalogue, 
  profile, 
  themeColors, 
  isEditMode, 
  content,
  onContentChange,
  customColors,
  fontCustomization,
  spacingCustomization,
  advancedStyles
}: NewCollectionPageProps) {
  const [editableTitle, setEditableTitle] = useState('New Collection')
  const [editableDescription, setEditableDescription] = useState('Discover our latest products and innovations')

  useEffect(() => {
    // Initialize with content from props if available
    if (content.catalogue.name) {
      setEditableTitle(content.catalogue.name)
    }
    if (content.catalogue.description) {
      setEditableDescription(content.catalogue.description)
    }
  }, [content.catalogue.name, content.catalogue.description])

  const handleTitleChange = (value: string) => {
    setEditableTitle(value)
    onContentChange?.('collectionTitle', value)
  }

  const handleDescriptionChange = (value: string) => {
    setEditableDescription(value)
    onContentChange?.('collectionDescription', value)
  }
  const primaryColor = themeColors?.primary || '#000000';
  const secondaryColor = themeColors?.secondary || '#666666';
  const backgroundColor = themeColors?.background || '#ffffff';
  const textColor = themeColors?.text || '#000000';
  
  // Get featured products (latest or first few products)
  const featuredProducts = catalogue.products.slice(0, 3);

  return (
    <div 
      className="w-full min-h-screen p-8 print:break-after-page"
      style={{ backgroundColor }}
    >
      {/* Header */}
      <div className="mb-12">
        {isEditMode ? (
          <input
            value={editableTitle}
            onChange={(e) => handleTitleChange(e.target.value)}
            className="text-4xl md:text-5xl font-bold mb-6 w-full p-2 border border-gray-300 rounded"
            style={{ color: textColor }}
          />
        ) : (
          <h1 
            className="text-4xl md:text-5xl font-bold mb-6"
            style={{ color: textColor }}
          >
            {editableTitle}
          </h1>
        )}
        
        {isEditMode ? (
          <textarea
            value={editableDescription}
            onChange={(e) => handleDescriptionChange(e.target.value)}
            className="text-lg max-w-3xl leading-relaxed w-full p-2 border border-gray-300 rounded resize-none"
            style={{ color: secondaryColor }}
            rows={2}
          />
        ) : (
          <p 
            className="text-lg max-w-3xl leading-relaxed"
            style={{ color: secondaryColor }}
          >
            {editableDescription}
          </p>
        )}
      </div>

      {/* Featured Products */}
      <div className="space-y-12">
        {featuredProducts.map((product, index) => (
          <div key={product.id} className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Product Image */}
            <div className={`${index % 2 === 1 ? 'lg:order-2' : ''}`}>
              <div className="aspect-[4/3] rounded-lg overflow-hidden">
                {product.imageUrl ? (
                  <img 
                    src={product.imageUrl} 
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div 
                    className="w-full h-full flex items-center justify-center"
                    style={{ backgroundColor: '#f5f5f5' }}
                  >
                    <svg className="w-20 h-20 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
            </div>

            {/* Product Details */}
            <div className={`space-y-6 ${index % 2 === 1 ? 'lg:order-1' : ''}`}>
              <div>
                <h2 
                  className="text-3xl font-bold mb-4"
                  style={{ color: textColor }}
                >
                  {product.name}
                </h2>
                
                {product.description && (
                  <p 
                    className="text-lg leading-relaxed"
                    style={{ color: secondaryColor }}
                  >
                    {product.description}
                  </p>
                )}
              </div>

              {/* Price */}
              <div>
                <span 
                  className="text-2xl font-bold"
                  style={{ color: primaryColor }}
                >
                  ${product.price?.toString() || '0'}
                </span>
              </div>

              {/* Call to Action */}
              <div className="pt-4">
                <button 
                  className="px-6 py-3 rounded-lg font-semibold transition-colors duration-200 hover:opacity-90"
                  style={{ 
                    backgroundColor: primaryColor, 
                    color: backgroundColor 
                  }}
                >
                  Learn More
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer with Page Info */}
      <div className="mt-16 pt-8 border-t border-gray-200 flex justify-between items-center">
        <div>
          <p 
            className="text-sm font-medium"
            style={{ color: secondaryColor }}
          >
            {profile.companyName || profile.fullName || 'Company'}
          </p>
        </div>
        
        <div className="text-right">
          <p 
            className="text-sm"
            style={{ color: secondaryColor }}
          >
            Page 3 of 4
          </p>
        </div>
      </div>
    </div>
  );
}