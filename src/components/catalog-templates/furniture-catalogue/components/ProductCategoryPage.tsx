'use client';

import React from 'react';
import { Catalogue, Category, Product, Profile } from '@prisma/client';
import { StandardizedContent } from '@/lib/content-schema';
import { ColorCustomization } from '../types/ColorCustomization';
import { FontCustomization, SpacingCustomization, AdvancedStyleCustomization } from '@/components/shared/StyleCustomizer';

interface ProductCategoryPageProps {
    catalogue: Catalogue & {
        products: (Product & { category: Category | null })[]
        categories: Category[]
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

    // Sample furniture products with proper categorization
    const sampleProducts = [
        {
            id: '1',
            name: 'Langley Armchair',
            price: '$1,895',
            dimensions: 'W30" × D30" × H32"',
            finishes: 'Oak, Walnut, Mahogany',
            category: 'Living Room',
            color: '#D2B48C'
        },
        {
            id: '2',
            name: 'Vienna Dining Table',
            price: '$3,450',
            dimensions: 'L72" × W42" × H30"',
            finishes: 'Oak, Cherry, Birch',
            category: 'Dining',
            color: '#8B4513'
        },
        {
            id: '3',
            name: 'Montauk Lounge Chair',
            price: '$2,375',
            dimensions: 'W32" × D32" × H30"',
            finishes: 'Natural Steel, Charcoal',
            category: 'Bedroom',
            color: '#696969'
        },
        {
            id: '4',
            name: 'Kensington Cabinet',
            price: '$4,195',
            dimensions: 'W54" × D18" × H72"',
            finishes: 'Oak, Maple, Walnut',
            category: 'Office',
            color: '#A0522D'
        },
        {
            id: '5',
            name: 'Chelsea Coffee Table',
            price: '$1,650',
            dimensions: 'L48" × W28" × H18"',
            finishes: 'Mahogany, Walnut, Birch',
            category: 'Outdoor',
            color: '#8B7355'
        },
        {
            id: '6',
            name: 'Hudson Sideboard',
            price: '$3,895',
            dimensions: 'W85" × D20" × H32"',
            finishes: 'Oak, Ebony, Rosewood',
            category: 'Living Room',
            color: '#654321'
        }
    ];

    // Use real products if available, otherwise use sample products
    const displayProducts = content.products.length > 0 ? content.products : sampleProducts;

    // Categories from the images
    const categories = ['Living Room', 'Dining', 'Bedroom', 'Office', 'Outdoor'];

    return (
        <div className="relative w-full h-screen overflow-hidden print:h-screen print:break-after-page bg-neutral-50">

            {/* Header */}
            <div className="bg-white px-16 py-8 border-b border-neutral-200">
                <div className="flex items-center justify-between">
                    {/* Company name/logo */}
                    <div>
                        <h1
                            className="text-3xl font-bold text-neutral-800 tracking-wider"
                            style={{
                                fontFamily: fontCustomization?.fontFamily?.title || 'serif',
                                fontSize: fontCustomization?.fontSize?.title ? `${fontCustomization.fontSize.title}px` : 'inherit'
                            }}
                        >
                            {content.profile.companyName?.toUpperCase() || 'MAISON'}
                        </h1>
                        <p
                            className="text-neutral-500 text-sm tracking-[0.2em] mt-1"
                            style={{
                                fontFamily: fontCustomization?.fontFamily?.description || 'Arial, sans-serif'
                            }}
                        >
                            Curated Living Collections
                        </p>
                    </div>

                    {/* Navigation */}
                    <nav className="flex space-x-8">
                        {categories.map((category, index) => (
                            <button
                                key={category}
                                className={`text-sm tracking-wider uppercase transition-colors ${index === 0 ? 'text-neutral-800 border-b border-neutral-800 pb-1' : 'text-neutral-500 hover:text-neutral-800'
                                    }`}
                                style={{
                                    fontFamily: fontCustomization?.fontFamily?.description || 'Arial, sans-serif'
                                }}
                            >
                                {category}
                            </button>
                        ))}
                    </nav>
                </div>
            </div>

            {/* Product grid */}
            <div className="px-16 py-12 overflow-y-auto" style={{ height: 'calc(100vh - 120px)' }}>
                <div className="grid grid-cols-3 gap-8">

                    {displayProducts.slice(0, 6).map((product, index) => {
                        const isProduct = 'images' in product;
                        const productName = isProduct ? product.name : product.name;
                        const productPrice = isProduct ? product.priceDisplay || `${product.currency || '$'}${product.price}` : product.price;
                        const productImage = isProduct ? product.images?.[0] : null;

                        return (
                            <div key={product.id} className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">

                                {/* Product image */}
                                <div
                                    className="w-full h-64 relative"
                                    style={{
                                        backgroundColor: !isProduct ? product.color : '#f5f5f5'
                                    }}
                                >
                                    {productImage ? (
                                        <img
                                            src={productImage}
                                            alt={productName}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            {/* Furniture icon representation */}
                                            <div className="text-white text-4xl opacity-60">
                                                {index % 3 === 0 ? '🪑' : index % 3 === 1 ? '🛏️' : '🪞'}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Product details */}
                                <div className="p-6">
                                    <h3
                                        className="text-lg font-semibold text-neutral-800 mb-2"
                                        style={{
                                            fontFamily: fontCustomization?.fontFamily?.title || 'serif'
                                        }}
                                    >
                                        {productName}
                                    </h3>

                                    <p
                                        className="text-orange-600 text-xl font-bold mb-3"
                                        style={{
                                            fontFamily: fontCustomization?.fontFamily?.description || 'Arial, sans-serif'
                                        }}
                                    >
                                        {productPrice}
                                    </p>

                                    {/* Specifications */}
                                    <div className="space-y-1 text-sm text-neutral-600">
                                        {!isProduct && (
                                            <>
                                                <div className="flex justify-between">
                                                    <span
                                                        style={{
                                                            fontFamily: fontCustomization?.fontFamily?.description || 'Arial, sans-serif'
                                                        }}
                                                    >
                                                        Dimensions:
                                                    </span>
                                                    <span
                                                        className="font-medium"
                                                        style={{
                                                            fontFamily: fontCustomization?.fontFamily?.description || 'Arial, sans-serif'
                                                        }}
                                                    >
                                                        {product.dimensions}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span
                                                        style={{
                                                            fontFamily: fontCustomization?.fontFamily?.description || 'Arial, sans-serif'
                                                        }}
                                                    >
                                                        Finishes:
                                                    </span>
                                                    <span
                                                        className="font-medium"
                                                        style={{
                                                            fontFamily: fontCustomization?.fontFamily?.description || 'Arial, sans-serif'
                                                        }}
                                                    >
                                                        {product.finishes}
                                                    </span>
                                                </div>
                                            </>
                                        )}
                                        {isProduct && product.description && (
                                            <p
                                                className="text-neutral-600 text-sm"
                                                style={{
                                                    fontFamily: fontCustomization?.fontFamily?.description || 'Arial, sans-serif'
                                                }}
                                            >
                                                {product.description}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                </div>

                {/* Pagination */}
                <div className="flex justify-center mt-12 space-x-4">
                    {[1, 2, 3, 4, 5].map((page, index) => (
                        <button
                            key={page}
                            className={`w-8 h-8 rounded-full text-sm font-medium transition-colors ${index === 0
                                    ? 'bg-neutral-800 text-white'
                                    : 'bg-neutral-200 text-neutral-600 hover:bg-neutral-300'
                                }`}
                            style={{
                                fontFamily: fontCustomization?.fontFamily?.description || 'Arial, sans-serif'
                            }}
                        >
                            {page}
                        </button>
                    ))}
                </div>
            </div>

            {/* Footer */}
            <div className="absolute bottom-0 left-0 right-0 bg-white px-16 py-4 border-t border-neutral-200">
                <div className="flex justify-between items-center">
                    <span
                        className="text-neutral-400 text-sm"
                        style={{
                            fontFamily: fontCustomization?.fontFamily?.description || 'Arial, sans-serif'
                        }}
                    >
                        {content.profile.companyName || 'MAISON'}
                    </span>
                    <span
                        className="text-neutral-400 text-sm"
                        style={{
                            fontFamily: fontCustomization?.fontFamily?.description || 'Arial, sans-serif'
                        }}
                    >
                        © 2025 All rights reserved
                    </span>
                </div>
            </div>

        </div>
    );
}