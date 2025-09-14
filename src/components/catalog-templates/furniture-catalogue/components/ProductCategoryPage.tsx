'use client';

import React from 'react';
import { Catalogue, Category, Product, Profile } from '@prisma/client';
import { StandardizedContent } from '@/lib/content-schema';
import { ColorCustomization } from '../types/ColorCustomization';
import { FontCustomization, SpacingCustomization, AdvancedStyleCustomization } from '@/components/shared/StyleCustomizer';

interface ProductCategoryPageProps {
    catalogue: Catalogue & {
        products: (Product & { category: Category | null; imageUrl?: string | null })[]
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
    const displayProducts = catalogue.products.length > 0 ? catalogue.products : sampleProducts;

    // Categories from the images
    const categories = ['Living Room', 'Dining', 'Bedroom', 'Office', 'Outdoor'];

    // Split products into pages of 3 products each
    const productsPerPage = 3;
    const totalProducts = displayProducts.length;
    const totalPages = Math.ceil(totalProducts / productsPerPage);

    // Create pages array
    const productPages = [];
    for (let i = 0; i < totalPages; i++) {
        const startIndex = i * productsPerPage;
        const endIndex = startIndex + productsPerPage;
        productPages.push(displayProducts.slice(startIndex, endIndex));
    }

    return (
        <>
            {productPages.map((pageProducts, pageIndex) => (
                <div key={`product-page-${pageIndex}`} className="relative w-full h-screen overflow-hidden print:h-screen print:break-after-page bg-neutral-50">

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
                                    {content.profile?.companyName || profile.companyName || (catalogue?.settings as any)?.companyInfo?.companyName || 'AURUM'}

                                </h1>
                                <p
                                    className="text-neutral-500 text-sm tracking-[0.2em] mt-1"
                                    style={{
                                        fontFamily: fontCustomization?.fontFamily?.description || 'Arial, sans-serif'
                                    }}
                                >
                                    {content.catalogue.description}
                                    {totalPages > 1 ? `- Page ${pageIndex + 1}` : ''}
                                </p>
                            </div>

                            {/* Page indicator */}
                            {totalPages > 1 && (
                                <div className="text-right">
                                    <span
                                        className="text-neutral-400 text-sm tracking-wider"
                                        style={{
                                            fontFamily: fontCustomization?.fontFamily?.description || 'Arial, sans-serif'
                                        }}
                                    >
                                        {pageIndex + 1} of {totalPages}
                                    </span>
                                </div>
                            )}


                        </div>
                    </div>

                    {/* Product grid - Single row of 3 products */}
                    <div className="px-16 py-12 flex-1">
                        <div className="grid grid-cols-3 gap-8 h-full">

                            {pageProducts.map((product, index) => {
                                // Check if it's a real product from database or sample product
                                const isRealProduct = 'images' in product && Array.isArray(product.images);
                                const productName = product.name;
                                const productPrice = isRealProduct
                                    ? (product.priceDisplay || `${product.currency || '$'}${product.price}`)
                                    : (product as any).price;
                                const productImage = isRealProduct
                                    ? (product.imageUrl || (product.images && product.images.length > 0 ? product.images[0] : null))
                                    : null;

                                return (
                                    <div key={product.id} className="bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow h-fit">

                                        {/* Product image */}
                                        <div className="w-full h-64 relative bg-neutral-100">
                                            {productImage ? (
                                                <img
                                                    src={productImage}
                                                    alt={productName}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div
                                                    className="w-full h-full flex items-center justify-center"
                                                    style={{
                                                        backgroundColor: !isRealProduct ? (product as any).color || '#f5f5f5' : '#f5f5f5'
                                                    }}
                                                >
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
                                                {isRealProduct
                                                    ? (product.price ? `₹${product.price.toLocaleString()}` : '₹2,450')
                                                    : productPrice
                                                }
                                            </p>

                                            {/* Specifications */}
                                            <div className="space-y-1 text-sm text-neutral-600">
                                                {!isRealProduct && (
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
                                                                {(product as any).dimensions}
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
                                                                {(product as any).finishes}
                                                            </span>
                                                        </div>
                                                    </>
                                                )}
                                                {isRealProduct && product.description && (
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
                    </div>

                    {/* Footer */}
                    <div className="absolute bottom-0 left-0 right-0 bg-white px-16 py-4  border-b border-neutral-100">
                        <div className="flex justify-between items-center">
                            <span
                                className="text-neutral-400 text-sm"
                                style={{
                                    fontFamily: fontCustomization?.fontFamily?.description || 'Arial, sans-serif'
                                }}
                            >
                                {content.profile?.companyName || profile.companyName || (catalogue?.settings as any)?.companyInfo?.companyName || 'AURUM'}

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
            ))}
        </>
    );
}