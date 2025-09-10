'use client';

import React from 'react';
import { Catalogue, Profile, Product, Category } from '@prisma/client';
import { StandardizedContent } from '@/lib/content-schema';
import { ColorCustomization } from '../types/ColorCustomization';
import { FontCustomization, SpacingCustomization, AdvancedStyleCustomization } from '@/components/shared/StyleCustomizer';

interface ProductPageProps {
  catalogue: Catalogue & {
    products: (Product & { category: Category | null; imageUrl?: string | null })[]
    categories: Category[]
  };
  profile: Profile;
  themeColors?: any;
  isEditMode?: boolean;
  content: StandardizedContent;
  customColors?: ColorCustomization;
  fontCustomization?: FontCustomization;
  spacingCustomization?: SpacingCustomization;
  advancedStyles?: AdvancedStyleCustomization;
  onProductsReorder?: (productIds: string[]) => void;
  onProductUpdate?: (productId: string, updates: Partial<Product>) => void;
  onContentChange?: (field: string, value: string) => void;
}

export function ProductPage({
  catalogue,
  profile,
  themeColors,
  isEditMode,
  content,
  customColors,
  fontCustomization,
  spacingCustomization,
  advancedStyles,
  onProductsReorder,
  onProductUpdate,
  onContentChange
}: ProductPageProps) {
  const primaryColor = '#d4722a';
  const textColor = '#2c1810';
  const backgroundColor = '#f5f5f0';
  const cardBackgroundColor = '#ffffff';

  // Get featured products (limit to 9 for the 3x3 grid)
  const featuredProducts = catalogue.products.slice(0, 9);

  return (
    <div
      className="relative w-full  overflow-hidden print:break-after-page p-12"
      style={{ backgroundColor }}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-12">
        <div>
          <span
            className="text-sm tracking-[0.3em] uppercase font-light block mb-2"
            style={{
              color: primaryColor,
              fontFamily: fontCustomization?.fontFamily?.description || 'sans-serif'
            }}
          >
            {content.profile.companyName?.toUpperCase() || 'LUXE COLLECTION'}
          </span>
          <h1
            className="text-4xl font-light"
            style={{
              fontFamily: fontCustomization?.fontFamily?.title || 'serif',
              color: textColor
            }}
          >
            Premium Collection
          </h1>
        </div>


      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-3 gap-8 mb-12">
        {featuredProducts.map((product, index) => (
          <div
            key={product.id}
            className="group rounded-lg shadow-md border border-gray-200"
            style={{ backgroundColor: cardBackgroundColor }}
          >
            {/* Product Image */}
            <div className="aspect-square overflow-hidden mb-4 bg-gray-100 relative rounded-t-lg">
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                  <div className="text-center p-4">
                    <div className="w-16 h-20 bg-gradient-to-b from-orange-200 to-orange-300 rounded-lg mx-auto mb-3 relative shadow-md">
                      <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white rounded-full opacity-80"></div>
                      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-center">
                        <div className="text-orange-800 text-xs font-medium">FMCG</div>
                      </div>
                    </div>
                    <div className="text-gray-600 text-xs">Product Image</div>
                  </div>
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="p-4">
              <h3
                className="text-lg font-medium mb-2"
                style={{
                  fontFamily: fontCustomization?.fontFamily?.title || 'serif',
                  color: textColor
                }}
              >
                {product.name}
              </h3>
              <p
                className="text-sm mb-3 line-clamp-2"
                style={{
                  color: '#5a4a3a',
                  fontFamily: fontCustomization?.fontFamily?.description || 'sans-serif'
                }}
              >
                {product.description}
              </p>

            </div>
          </div>
        ))}
      </div>






    </div>
  );
}