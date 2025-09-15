'use client';

import React, { useEffect, useState } from 'react';
import { Catalogue, Profile, Product, Category } from '@prisma/client';
import { StandardizedContent } from '@/lib/content-schema';
import { ColorCustomization } from '../types/ColorCustomization';
import { FontCustomization, SpacingCustomization, AdvancedStyleCustomization } from '@/components/shared/StyleCustomizer';
// Removed arrayMove import - no longer using drag-and-drop functionality

interface ProductCategoryPageProps {
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

export function ProductCategoryPage({
  catalogue,
  profile,
  themeColors,
  isEditMode,
  content,
  onProductsReorder,
  onProductUpdate,
  onContentChange,
  customColors,
  fontCustomization,
  spacingCustomization,
  advancedStyles
}: ProductCategoryPageProps) {
  const [localProducts, setLocalProducts] = useState(catalogue.products || [])
  // Remove inline editing - content is managed centrally in StyleCustomizer

  useEffect(() => {
    setLocalProducts(catalogue.products || [])
  }, [catalogue.products])

  // Removed inline editing handlers - content is managed centrally
  const primaryColor = themeColors?.primary || '#000000';
  const secondaryColor = themeColors?.secondary || '#666666';
  const backgroundColor = themeColors?.background || '#ffffff';
  const textColor = themeColors?.text || '#000000';

  const category = catalogue.categories[0]; // Using first category for demo
  const products = localProducts || []

  // Removed sortable and static product item components - using ProductSplitView for single product display

  // Component to render individual product in split-screen layout with alternating sides
  const ProductSplitView = ({ product, index, isReversed, isLast }: { product: any; index: number; isReversed: boolean; isLast: boolean }) => {
    const imageSection = (
      <div className="w-1/2 realive overflow-hidden">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-orange-200 via-pink-200 to-blue-200 flex items-center justify-center relative">
            {/* Hanging Rod */}
            <div className="absolute top-16 left-8 right-8 h-2 bg-gray-600 rounded-full shadow-lg" />

            {/* Hanging Clothes */}
            <div className="flex justify-center space-x-8 mt-16">
              {[1, 2, 3, 4, 5].map((item) => (
                <div key={item} className="relative">
                  {/* Hanger */}
                  <div className="w-8 h-6 relative mx-auto mb-2">
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1 h-2 bg-gray-600" />
                    <div className="absolute top-2 left-0 w-full h-1 bg-gray-600 rounded-full" />
                    <div className="absolute top-1 left-0 w-1 h-2 bg-gray-600 transform rotate-12" />
                    <div className="absolute top-1 right-0 w-1 h-2 bg-gray-600 transform -rotate-12" />
                  </div>

                  {/* Clothing Item */}
                  <div
                    className={`w-16 h-24 rounded-lg shadow-md ${item === 1 ? 'bg-orange-300' :
                      item === 2 ? 'bg-pink-300' :
                        item === 3 ? 'bg-blue-300' :
                          item === 4 ? 'bg-green-300' : 'bg-purple-300'
                      } opacity-80`}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );

    const detailsSection = (

      <div className="w-1/2 relative bg-gray-900 text-white flex flex-col justify-center px-16 py-32">

        {/* <div className="flex flex-wrap gap-2 absolute top-4 right-4">
          {product.tags.map((tag: string) => (
            <span
              key={tag}
              className="
                inline-flex items-center
                px-2 py-0.5
                bg-white/10 backdrop-blur-sm
                text-white/80 text-[11px] 
                rounded
                shadow-sm
              "
            >
              {tag}
            </span>
          ))}
        </div> */}

        {/* Product Name */}
        <h1 className="text-4xl md:text-5xl font-light pt-12 mb-4 tracking-wide">
          {product.name || 'PRODUCT NAME'}
        </h1>

        {/* Category */}
        <p className="text-lg text-gray-400 mb-8 uppercase tracking-widest">
          {product.category?.name || 'UNCATEGORIZED'}
        </p>



        {/* Decorative Line */}
        <div className="w-16 h-[1px] bg-gray-300 mb-8" />

        {/* Description */}
        <div className="space-y-4 mb-12 text-gray-300 leading-relaxed">
          <p>
            {product.description || 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.'}
          </p>

        </div>

        {/* Decorative Line */}
        <div className="w-16 h-px bg-gray-600 mb-8" />

        <div className='flex justify-between pt-52'>
          {/* Collection Label */}
          <div className="mb-8">
            <p className="text-sm text-gray-500 uppercase tracking-widest mb-2">
              EXCLUSIVE COLLECTION
            </p>
          </div>

          {/* Price */}
          {(product.priceDisplay === 'show' && product.price) ||
            (product.priceDisplay === 'contact') ||
            (!product.priceDisplay && product.price) ? (
            <div className="text-right">
              <p className="text-3xl font-light">
                {product.priceDisplay === 'show' && product.price ?
                  `₹${product.price.toLocaleString()}`
                  : product.priceDisplay === 'contact' ?
                    'Contact for Price'
                    : product.price ?
                      `₹${product.price.toLocaleString()}`
                      : '₹2,450'}
              </p>
            </div>
          ) : null}
        </div>
      </div>
    );

    return (
      <div className={`w-full h-screen flex ${!isLast ? 'print:break-after-page' : ''}`} style={{ minHeight: '100vh' }}>
        {isReversed ? (
          <>
            {detailsSection}
            {imageSection}
          </>
        ) : (
          <>
            {imageSection}
            {detailsSection}
          </>
        )}
      </div>
    );
  };

  // All products displayed vertically - no pagination needed

  return (
    <div className="w-full overflow-hidden">
      {localProducts.map((product, index) => (
        <ProductSplitView
          key={product.id}
          product={product}
          index={index}
          isReversed={index % 2 === 1}
          isLast={index === localProducts.length - 1}
        />
      ))}
    </div>
  );
}