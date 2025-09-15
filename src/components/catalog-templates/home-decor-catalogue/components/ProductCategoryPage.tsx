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
    // Get first 5 products for display, with fallback sample products
    const sampleProducts = [
        {
            id: 'sample-1',
            name: 'Helios Sculptural Vase',
            description: 'Hand-crafted ceramic with organic, undulating forms inspired by coastal landscapes.',
            price: null,
            priceDisplay: 'Contact for Price',
            category: null,
            imageUrl: null,
            images: []
        },
        {
            id: 'sample-2',
            name: 'Artisan Hand-Knotted Rug',
            description: '100% New Zealand wool in a contemporary geometric pattern, hand-stitched by master artisans.',
            price: 85000,
            priceDisplay: 'show',
            currency: '₹',
            category: null,
            imageUrl: null,
            images: []
        },
        {
            id: 'sample-3',
            name: 'Abstract Wall Art',
            description: 'Original acrylic on canvas with textured brushwork, framed in sustainably-sourced oak.',
            price: 32000,
            priceDisplay: 'show',
            currency: '₹',
            category: null,
            imageUrl: null,
            images: []
        },
        {
            id: 'sample-4',
            name: 'Sculptural Table Lamp',
            description: 'Mouth-blown glass base with a custom linen shade, creating a soft diffused glow.',
            price: 28000,
            priceDisplay: 'show',
            currency: '₹',
            category: null,
            imageUrl: null,
            images: []
        },
        {
            id: 'sample-5',
            name: 'Brass Candle Holder',
            description: 'Solid brass construction with a hand-applied patina finish, designed to create ambient warmth.',
            price: 15000,
            priceDisplay: 'show',
            currency: '₹',
            category: null,
            imageUrl: null,
            images: []
        }
    ];

    // Use real products if available, otherwise use sample products
    const displayProducts = catalogue.products.length > 0
        ? catalogue.products.slice(0, 5)
        : sampleProducts.slice(0, 5);

    // Helper function to get product image
    const getProductImage = (product: any) => {
        if (product.imageUrl) return product.imageUrl;
        if (product.images && Array.isArray(product.images) && product.images.length > 0) {
            return product.images[0];
        }
        return null;
    };

    // Helper function to get product price
    const getProductPrice = (product: any) => {
        const isRealProduct = 'images' in product && Array.isArray(product.images);

        if (isRealProduct) {
            if (product.priceDisplay === 'show' && product.price) {
                return `${product.currency || '₹'}${product.price.toLocaleString()}`;
            } else if (product.priceDisplay === 'contact') {
                return 'Contact for Price';
            } else if (!product.priceDisplay && product.price) {
                return `${product.currency || '₹'}${product.price.toLocaleString()}`;
            }
        } else {
            // Sample product
            if (product.price) {
                return `${product.currency || '₹'}${product.price.toLocaleString()}`;
            } else {
                return product.priceDisplay || 'Contact for Price';
            }
        }
        return null;
    };

    return (
        <div className="relative w-full h-screen overflow-hidden print:h-screen print:break-after-page bg-[#eaddd455]">
           

            {/* Main content */}
            <div className="relative z-10 h-full p-6">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1
                        className="text-5xl font-bold text-gray-800 mb-2"
                        style={{
                            fontFamily: fontCustomization?.fontFamily?.description || "'Playfair Display', serif",
                            fontSize: fontCustomization?.fontSize?.description || '1.95rem'
                        }}
                    >
                        Every Object a Story
                    </h1>
                </div>

                {/* Products grid matching the exact image layout */}
                <div className="h-4/5 space-y-6">
                    {/* Top row with featured vase and rug */}
                    <div className="flex gap-6 h-1/2">
                        {/* Large featured product - Helios Sculptural Vase */}
                        <div className="w-5/12 bg-white rounded-lg overflow-hidden border border-gray-200 shadow-lg">
                            <div className="h-3/5 bg-gradient-to-br from-gray-50 to-gray-100 relative flex items-center justify-center">
                                {getProductImage(displayProducts[0]) ? (
                                    <img
                                        src={getProductImage(displayProducts[0])}
                                        alt={displayProducts[0].name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="relative w-24 h-40 flex items-center justify-center">
                                        {/* Vase illustration */}
                                        <div className="w-16 h-32 bg-white rounded-full shadow-lg relative">
                                            <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-green-600 rounded-full" />
                                            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1 h-6 bg-green-700" />
                                            <div className="absolute top-1 right-2 w-3 h-4 bg-green-600 rounded-full" />
                                            <div className="absolute top-3 right-1 w-2 h-3 bg-green-700 rounded-full" />
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="h-2/5 p-3 bg-white">
                                <h3
                                    className="text-base font-semibold text-gray-800 mb-1"
                                    style={{
                                        fontFamily: fontCustomization?.fontFamily?.description || "'Playfair Display', serif"
                                    }}
                                >
                                    {displayProducts[0].name}
                                </h3>
                                <p
                                    className="text-xs text-gray-600 leading-relaxed mb-1"
                                    style={{
                                        fontFamily: fontCustomization?.fontFamily?.description || "'Inter', sans-serif"
                                    }}
                                >
                                    {displayProducts[0].description?.substring(0, 80) || 'Hand-crafted ceramic with organic, undulating forms inspired by coastal landscapes.'}
                                </p>
                                {getProductPrice(displayProducts[0]) && (
                                    <p
                                        className="text-sm font-semibold text-gray-800"
                                        style={{
                                            fontFamily: fontCustomization?.fontFamily?.description || "'Inter', sans-serif",
                                            color: customColors?.primary || '#d4a574'
                                        }}
                                    >
                                        {getProductPrice(displayProducts[0])}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Artisan Hand-Knotted Rug */}
                        <div className="w-7/12 bg-white rounded-lg overflow-hidden border border-gray-200 shadow-lg">
                            <div className="h-3/5 bg-gradient-to-br from-amber-50 to-amber-100 relative flex items-center justify-center">
                                {getProductImage(displayProducts[1]) ? (
                                    <img
                                        src={getProductImage(displayProducts[1])}
                                        alt={displayProducts[1].name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="relative w-48 h-32 bg-gradient-to-br from-amber-200 to-amber-300 rounded-lg overflow-hidden">
                                        {/* Rug pattern */}
                                        <div className="absolute inset-2 border border-amber-400 rounded">
                                            <div className="absolute inset-2 border border-amber-500 rounded">
                                                <div className="w-full h-full bg-gradient-to-br from-amber-300 to-amber-400 rounded relative">
                                                    <div className="absolute top-2 left-2 w-4 h-4 border-2 border-amber-600 rounded" />
                                                    <div className="absolute top-2 right-2 w-4 h-4 border-2 border-amber-600 rounded" />
                                                    <div className="absolute bottom-2 left-2 w-4 h-4 border-2 border-amber-600 rounded" />
                                                    <div className="absolute bottom-2 right-2 w-4 h-4 border-2 border-amber-600 rounded" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="h-2/5 p-3 bg-white">
                                <h3
                                    className="text-base font-semibold text-gray-800 mb-1"
                                    style={{
                                        fontFamily: fontCustomization?.fontFamily?.description || "'Playfair Display', serif"
                                    }}
                                >
                                    {displayProducts[1].name}
                                </h3>
                                <p
                                    className="text-xs text-gray-600 mb-1"
                                    style={{
                                        fontFamily: fontCustomization?.fontFamily?.description || "'Inter', sans-serif"
                                    }}
                                >
                                    {displayProducts[1].description?.substring(0, 80) || '100% New Zealand wool in a contemporary geometric pattern, hand-stitched by master artisans.'}
                                </p>
                                {getProductPrice(displayProducts[1]) && (
                                    <p
                                        className="text-sm font-semibold text-gray-800"
                                        style={{
                                            fontFamily: fontCustomization?.fontFamily?.description || "'Inter', sans-serif",
                                            color: customColors?.primary || '#d4a574'
                                        }}
                                    >
                                        {getProductPrice(displayProducts[1])}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Bottom row with 3 smaller products */}
                    <div className="flex gap-4 h-1/2">
                        {/* Abstract Wall Art */}
                        {displayProducts[2] && (
                            <div className="w-1/3 bg-white rounded-lg overflow-hidden border border-gray-200 shadow-lg">
                                <div className="h-2/3 bg-gradient-to-br from-slate-100 to-slate-200 relative flex items-center justify-center">
                                    {getProductImage(displayProducts[2]) ? (
                                        <img
                                            src={getProductImage(displayProducts[2])}
                                            alt={displayProducts[2].name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex flex-wrap gap-1 w-16 h-20">
                                            <div className="w-6 h-8 bg-gradient-to-t from-orange-400 to-orange-300 rounded-sm" />
                                            <div className="w-4 h-6 bg-gradient-to-t from-blue-400 to-blue-300 rounded-sm" />
                                            <div className="w-8 h-10 bg-gradient-to-t from-gray-400 to-gray-300 rounded-sm" />
                                            <div className="w-3 h-4 bg-gradient-to-t from-pink-400 to-pink-300 rounded-sm" />
                                            <div className="w-5 h-7 bg-gradient-to-t from-green-400 to-green-300 rounded-sm" />
                                            <div className="w-4 h-5 bg-gradient-to-t from-purple-400 to-purple-300 rounded-sm" />
                                        </div>
                                    )}
                                </div>
                                <div className="h-1/3 p-2 bg-white">
                                    <h3
                                        className="text-sm font-semibold text-gray-800 mb-1"
                                        style={{
                                            fontFamily: fontCustomization?.fontFamily?.description || "'Playfair Display', serif"
                                        }}
                                    >
                                        {displayProducts[2].name}
                                    </h3>
                                    <p
                                        className="text-xs text-gray-600 mb-1 leading-tight"
                                        style={{
                                            fontFamily: fontCustomization?.fontFamily?.description || "'Inter', sans-serif"
                                        }}
                                    >
                                        {displayProducts[2].description?.substring(0, 30) || 'Original acrylic on canvas...'}
                                    </p>
                                    {getProductPrice(displayProducts[2]) && (
                                        <p
                                            className="text-xs font-semibold"
                                            style={{
                                                fontFamily: fontCustomization?.fontFamily?.description || "'Inter', sans-serif",
                                                color: customColors?.primary || '#d4a574'
                                            }}
                                        >
                                            {getProductPrice(displayProducts[2])}
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Sculptural Table Lamp */}
                        {displayProducts[3] && (
                            <div className="w-1/3 bg-white rounded-lg overflow-hidden border border-gray-200 shadow-lg">
                                <div className="h-2/3 bg-gradient-to-br from-teal-50 to-teal-100 relative flex items-center justify-center">
                                    {getProductImage(displayProducts[3]) ? (
                                        <img
                                            src={getProductImage(displayProducts[3])}
                                            alt={displayProducts[3].name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="relative">
                                            {/* Pendant lamp */}
                                            <div className="w-1 h-8 bg-gray-400 mx-auto" />
                                            <div className="w-16 h-10 bg-gradient-to-b from-gray-100 to-gray-200 rounded-full border border-gray-300 shadow-lg" />
                                        </div>
                                    )}
                                </div>
                                <div className="h-1/3 p-2 bg-white">
                                    <h3
                                        className="text-sm font-semibold text-gray-800 mb-1"
                                        style={{
                                            fontFamily: fontCustomization?.fontFamily?.description || "'Playfair Display', serif"
                                        }}
                                    >
                                        {displayProducts[3].name}
                                    </h3>
                                    <p
                                        className="text-xs text-gray-600 mb-1 leading-tight"
                                        style={{
                                            fontFamily: fontCustomization?.fontFamily?.description || "'Inter', sans-serif"
                                        }}
                                    >
                                        {displayProducts[3].description?.substring(0, 30) || 'Mouth-blown glass base...'}
                                    </p>
                                    {getProductPrice(displayProducts[3]) && (
                                        <p
                                            className="text-xs font-semibold"
                                            style={{
                                                fontFamily: fontCustomization?.fontFamily?.description || "'Inter', sans-serif",
                                                color: customColors?.primary || '#d4a574'
                                            }}
                                        >
                                            {getProductPrice(displayProducts[3])}
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Brass Candle Holder */}
                        {displayProducts[4] && (
                            <div className="w-1/3 bg-white rounded-lg overflow-hidden border border-gray-200 shadow-lg">
                                <div className="h-2/3 bg-gradient-to-br from-yellow-50 to-yellow-100 relative flex items-center justify-center">
                                    {getProductImage(displayProducts[4]) ? (
                                        <img
                                            src={getProductImage(displayProducts[4])}
                                            alt={displayProducts[4].name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex items-center space-x-2">
                                            {/* Candles and holders */}
                                            <div className="w-3 h-8 bg-gradient-to-t from-amber-600 to-amber-400 rounded-sm" />
                                            <div className="w-4 h-6 bg-gradient-to-t from-stone-600 to-stone-400 rounded-sm" />
                                            <div className="w-3 h-10 bg-gradient-to-t from-gray-600 to-gray-400 rounded-sm" />
                                            <div className="w-4 h-7 bg-gradient-to-t from-green-600 to-green-400 rounded-sm" />
                                            <div className="w-3 h-5 bg-gradient-to-t from-blue-600 to-blue-400 rounded-sm" />
                                        </div>
                                    )}
                                </div>
                                <div className="h-1/3 p-2 bg-white">
                                    <h3
                                        className="text-sm font-semibold text-gray-800 mb-1"
                                        style={{
                                            fontFamily: fontCustomization?.fontFamily?.description || "'Playfair Display', serif"
                                        }}
                                    >
                                        {displayProducts[4].name}
                                    </h3>
                                    <p
                                        className="text-xs text-gray-600 mb-1 leading-tight"
                                        style={{
                                            fontFamily: fontCustomization?.fontFamily?.description || "'Inter', sans-serif"
                                        }}
                                    >
                                        {displayProducts[4].description?.substring(0, 30) || 'Solid brass construction...'}
                                    </p>
                                    {getProductPrice(displayProducts[4]) && (
                                        <p
                                            className="text-xs font-semibold"
                                            style={{
                                                fontFamily: fontCustomization?.fontFamily?.description || "'Inter', sans-serif",
                                                color: customColors?.primary || '#d4a574'
                                            }}
                                        >
                                            {getProductPrice(displayProducts[4])}
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>




            </div>
        </div>
    );
}