'use client';

import React from 'react';
import { Catalogue, Profile } from '@prisma/client';
import { StandardizedContent } from '@/lib/content-schema';
import { ColorCustomization } from '../types/ColorCustomization';
import { FontCustomization, SpacingCustomization, AdvancedStyleCustomization } from '@/components/shared/StyleCustomizer';

interface CoverPageProps {
    catalogue: Catalogue;
    profile: Profile;
    themeColors?: any;
    isEditMode?: boolean;
    content: StandardizedContent;
    customColors?: ColorCustomization;
    fontCustomization?: FontCustomization;
    spacingCustomization?: SpacingCustomization;
    advancedStyles?: AdvancedStyleCustomization;
    onContentChange?: (field: string, value: string) => void;
}

export function CoverPage({
    catalogue,
    profile,
    themeColors,
    isEditMode,
    content,
    customColors,
    fontCustomization,
    spacingCustomization,
    advancedStyles,
    onContentChange
}: CoverPageProps) {
    // Ensure settings is parsed and has the correct shape
    const settings = typeof catalogue.settings === 'string'
        ? JSON.parse(catalogue.settings)
        : catalogue.settings;

    return (
        <div className="relative w-full h-screen overflow-hidden print:h-screen print:break-after-page bg-neutral-900">
            {/* Dark textured background */}
            <div
                className="absolute inset-0 bg-gradient-to-br from-neutral-800 via-neutral-900 to-black"
                style={{
                    backgroundImage: `
            radial-gradient(circle at 25% 25%, rgba(255,255,255,0.02) 0%, transparent 50%),
            radial-gradient(circle at 75% 75%, rgba(255,255,255,0.01) 0%, transparent 50%),
            linear-gradient(135deg, rgba(139,115,85,0.05) 0%, transparent 50%)
          `
                }}
            />

            {/* Top brand indicator */}
            <div className="absolute top-8 left-8 z-10">
                <span
                    className="text-neutral-400 text-sm tracking-[0.3em] uppercase font-light"
                    style={{
                        fontFamily: fontCustomization?.fontFamily?.description || 'Arial, sans-serif'
                    }}
                >
                    ELEGANCE
                </span>
            </div>

            {/* Top right year */}
            <div className="absolute top-8 right-8 z-10">
                <span
                    className="text-neutral-400 text-sm tracking-[0.3em] uppercase font-light"
                    style={{
                        fontFamily: fontCustomization?.fontFamily?.description || 'Arial, sans-serif'
                    }}
                >
                    2025 COLLECTION
                </span>
            </div>

            {/* Main content area */}
            <div className="relative z-10 flex items-center justify-between h-full px-16">

                {/* Left side - Text content */}
                <div className="w-1/2 space-y-8">
                    {/* Decorative border frame */}
                    <div className="border border-neutral-600 p-16 max-w-md">
                        <div className="space-y-8">
                            <h1
                                className="text-white text-6xl font-bold tracking-widest"
                                style={{
                                    fontFamily: fontCustomization?.fontFamily?.title || 'serif',
                                    fontSize: fontCustomization?.fontSize?.title ? `${fontCustomization.fontSize.title * 2}px` : 'inherit',
                                    letterSpacing: '0.2em',
                                    lineHeight: '1.2',
                                    ...(advancedStyles && Object.fromEntries(
                                        Object.entries(advancedStyles).filter(([key]) =>
                                            [
                                                'color', 'background', 'backgroundColor', 'border', 'borderColor', 'borderRadius', 'boxShadow', 'margin', 'padding', 'letterSpacing', 'wordSpacing', 'lineHeight', 'fontWeight', 'fontStyle', 'textTransform', 'textDecoration', 'opacity', 'textAlign'
                                            ].includes(key)
                                        )
                                    ))
                                }}
                            >
                                {content.catalogue.name?.toUpperCase() || 'FURNITURE'}
                            </h1>

                            <div className="space-y-4">
                                <h2
                                    className="text-white text-4xl font-bold tracking-[0.3em]"
                                    style={{
                                        fontFamily: fontCustomization?.fontFamily?.title || 'serif',
                                        letterSpacing: '0.3em'
                                    }}
                                >
                                    CATALOG
                                </h2>

                                <p
                                    className="text-neutral-300 text-sm leading-relaxed"
                                    style={{
                                        fontFamily: fontCustomization?.fontFamily?.description || 'Arial, sans-serif'
                                    }}
                                >
                                    {content.catalogue.description || 'Curated designs that transform spaces into expressions of elegance and comfort.'}
                                </p>
                            </div>

                            {/* Call to action button */}
                            <div className="pt-6">
                                <button
                                    className="flex items-center space-x-3 text-white text-sm tracking-[0.2em] uppercase group"
                                    style={{
                                        fontFamily: fontCustomization?.fontFamily?.description || 'Arial, sans-serif'
                                    }}
                                >
                                    <span>EXPLORE COLLECTION</span>
                                    <svg
                                        className="w-4 h-4 transition-transform group-hover:translate-x-1"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right side - Product showcase */}
                <div className="w-1/2 flex justify-end">
                    <div className="relative">
                        {/* Main product image container */}
                        <div className="relative">
                            <div
                                className="w-96 h-96 bg-gradient-to-br from-orange-500 to-orange-600 rounded-sm"
                                style={{
                                    background: 'linear-gradient(135deg, #D97706 0%, #EA580C 100%)'
                                }}
                            >
                                {/* Furniture silhouette or product image */}
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="text-white opacity-20 text-8xl">🪑</div>
                                </div>
                            </div>

                            {/* "NEW ARRIVALS" badge */}
                            <div className="absolute -bottom-6 -right-6 bg-yellow-500 text-black px-6 py-2 font-bold text-sm tracking-wider">
                                NEW ARRIVALS
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom branding */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10 flex items-center space-x-8">
                <div className="text-neutral-500 text-xs tracking-[0.3em] uppercase">
                    PREMIUM QUALITY • SUSTAINABLE MATERIALS • TIMELESS DESIGN
                </div>
            </div>

            {/* Bottom right website */}
            <div className="absolute bottom-8 right-8 z-10">
                <span
                    className="text-neutral-400 text-sm tracking-[0.2em] uppercase"
                    style={{
                        fontFamily: fontCustomization?.fontFamily?.description || 'Arial, sans-serif'
                    }}
                >
                    {content.profile.website || 'WWW.ELEGANCEFURNITURE.COM'}
                </span>
            </div>
        </div>
    );
}