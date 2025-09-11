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

  // Split products into pages of 3 products each
  const productsPerPage = 3;
  const totalProducts = catalogue.products.length;
  const totalPages = Math.ceil(totalProducts / productsPerPage);

  // Create pages array
  const productPages = [];
  for (let i = 0; i < totalPages; i++) {
    const startIndex = i * productsPerPage;
    const endIndex = startIndex + productsPerPage;
    productPages.push(catalogue.products.slice(startIndex, endIndex));
  }

  return (
    <>
      {productPages.map((pageProducts, pageIndex) => (
        <div
          key={`product-page-${pageIndex}`}
          className="relative w-full min-h-screen overflow-hidden print:h-screen print:break-after-page p-12 flex flex-col"
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
                Premium Collection {totalPages > 1 ? `- Page ${pageIndex + 1}` : ''}
              </h1>
            </div>

            {/* Page indicator */}
            {totalPages > 1 && (
              <div className="text-right">
                <span
                  className="text-sm tracking-wider"
                  style={{
                    color: primaryColor,
                    fontFamily: fontCustomization?.fontFamily?.description || 'sans-serif'
                  }}
                >
                  {pageIndex + 1} of {totalPages}
                </span>
              </div>
            )}
          </div>

          {/* Products Grid - Single row of 3 products */}
          <div className="grid grid-cols-3 gap-8 flex-1">
            {pageProducts.map((product, index) => (
              <div
                key={product.id}
                className="group rounded-lg shadow-md border border-gray-200 h-fit"
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
                <div className="p-6">
                  <h3
                    className="text-xl font-medium mb-3"
                    style={{
                      fontFamily: fontCustomization?.fontFamily?.title || 'serif',
                      color: textColor
                    }}
                  >
                    {product.name}
                  </h3>
                  <p
                    className="text-sm mb-4 line-clamp-3"
                    style={{
                      color: '#5a4a3a',
                      fontFamily: fontCustomization?.fontFamily?.description || 'sans-serif'
                    }}
                  >
                    {product.description}
                  </p>

                  {/* Product category if available */}
                  {product.category && (
                    <span
                      className="inline-block px-3 py-1 text-xs font-medium rounded-full"
                      style={{
                        backgroundColor: `${primaryColor}20`,
                        color: primaryColor,
                        fontFamily: fontCustomization?.fontFamily?.description || 'sans-serif'
                      }}
                    >
                      {product.category.name}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Page footer with navigation hint
          {totalPages > 1 && (
            <div className="mt-8 flex justify-center">
              <div className="flex items-center space-x-2">
                {Array.from({ length: totalPages }, (_, i) => (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-full ${i === pageIndex ? 'opacity-100' : 'opacity-30'
                      }`}
                    style={{ backgroundColor: primaryColor }}
                  />
                ))}
              </div>
            </div>
          )} */}
        </div>
      ))}
    </>
  );
}