'use client';

import React, { useEffect, useState } from 'react';
import { Catalogue, Profile, Product, Category } from '@prisma/client';
import { StandardizedContent } from '@/lib/content-schema';
import { ColorCustomization } from '../types/ColorCustomization';
import { FontCustomization, SpacingCustomization, AdvancedStyleCustomization } from '@/components/shared/StyleCustomizer';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

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

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Disable drag and drop during scrolling for better performance
  const [isScrolling, setIsScrolling] = useState(false)
  const scrollTimeoutRef = React.useRef<NodeJS.Timeout>()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolling(true)
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }
      scrollTimeoutRef.current = setTimeout(() => {
        setIsScrolling(false)
      }, 150)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }
    }
  }, [])

  useEffect(() => {
    setLocalProducts(catalogue.products || [])
  }, [catalogue.products])

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (active.id !== over?.id) {
      const oldIndex = localProducts.findIndex((product) => product.id === active.id)
      const newIndex = localProducts.findIndex((product) => product.id === over?.id)

      const newProducts = arrayMove(localProducts, oldIndex, newIndex)
      setLocalProducts(newProducts)

      if (onProductsReorder) {
        onProductsReorder(newProducts.map(p => p.id))
      }
    }
  }

  // Removed inline editing handlers - content is managed centrally
  const primaryColor = themeColors?.primary || '#000000';
  const secondaryColor = themeColors?.secondary || '#666666';
  const backgroundColor = themeColors?.background || '#ffffff';
  const textColor = themeColors?.text || '#000000';

  const category = catalogue.categories[0]; // Using first category for demo
  const products = localProducts || []

  // Sortable Product Item Component
  const SortableProductItem = ({ product, index }: { product: Product; index: number }) => {
    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({ id: product.id })

    const style = {
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
    }

    return (
      <div 
        ref={setNodeRef} 
        style={style} 
        {...attributes} 
        {...(isEditMode ? listeners : {})}
        className={`group ${isEditMode ? 'cursor-move' : ''}`}
      >
        {/* Product Image */}
        <div className="aspect-square mb-4 overflow-hidden rounded-lg">
          {product.imageUrl ? (
            <img 
              src={product.imageUrl} 
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div 
              className="w-full h-full flex items-center justify-center"
              style={{ backgroundColor: '#f5f5f5' }}
            >
              <svg className="w-16 h-16 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
              </svg>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-2">
          <h3 
            className="text-lg font-semibold"
            style={{ color: textColor }}
          >
            {product.name}
          </h3>
          
          {product.description && (
            <p 
              className="text-sm"
              style={{ color: secondaryColor }}
            >
              {product.description}
            </p>
          )}
          
          <div className="flex justify-between items-center">
            <span 
              className="text-xl font-bold"
              style={{ color: primaryColor }}
            >
              ${product.price?.toString() || '0'}
            </span>
            
            <span 
              className="text-sm font-medium"
              style={{ color: secondaryColor }}
            >
              #{String(index + 1).padStart(2, '0')}
            </span>
          </div>
        </div>
      </div>
    )
  }

  // Static Product Item Component (used during scrolling)
  const StaticProductItem = ({ product, index, textColor, secondaryColor, primaryColor }: { 
    product: Product, 
    index: number,
    textColor: string,
    secondaryColor: string,
    primaryColor: string
  }) => {
    return (
      <div className="group">
        {/* Product Image */}
        <div className="aspect-square mb-4 overflow-hidden rounded-lg">
          {product.imageUrl ? (
            <img 
              src={product.imageUrl} 
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div 
              className="w-full h-full flex items-center justify-center"
              style={{ backgroundColor: '#f5f5f5' }}
            >
              <svg className="w-16 h-16 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
              </svg>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-2">
          <h3 
            className="text-lg font-semibold"
            style={{ color: textColor }}
          >
            {product.name}
          </h3>
          
          {product.description && (
            <p 
              className="text-sm"
              style={{ color: secondaryColor }}
            >
              {product.description}
            </p>
          )}
          
          <div className="flex justify-between items-center">
            <span 
              className="text-xl font-bold"
              style={{ color: primaryColor }}
            >
              ${product.price?.toString() || '0'}
            </span>
            
            <span 
              className="text-sm font-medium"
              style={{ color: secondaryColor }}
            >
              #{String(index + 1).padStart(2, '0')}
            </span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div 
      className="w-full min-h-screen p-8 print:break-after-page"
      style={{ 
        backgroundColor,
        transform: 'translateZ(0)', // Enable hardware acceleration
        willChange: 'scroll-position' // Optimize for scrolling
      }}
    >
      {/* Header */}
      <div className="mb-12">
        <h1 
          className="text-4xl md:text-5xl font-bold mb-4"
          style={{ color: textColor }}
        >
          {catalogue.categories[0]?.name || 'Product Category'}
        </h1>
        
        {catalogue.categories[0]?.description && (
          <p 
            className="text-lg max-w-2xl"
            style={{ color: secondaryColor }}
          >
            {catalogue.categories[0].description}
          </p>
        )}
      </div>

      {/* Products Grid */}
      {isEditMode && !isScrolling ? (
        <DndContext 
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext 
            items={products.slice(0, 6).map(p => p.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {products?.slice(0, 6).map((product, index) => (
                <SortableProductItem 
                  key={product.id} 
                  product={product} 
                  index={index}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products?.slice(0, 6).map((product, index) => (
            <StaticProductItem 
              key={product.id} 
              product={product} 
              index={index}
              textColor={textColor}
              secondaryColor={secondaryColor}
              primaryColor={primaryColor}
            />
          ))}
        </div>
      )}

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
            Page 2 of 4
          </p>
        </div>
      </div>
    </div>
  );
}