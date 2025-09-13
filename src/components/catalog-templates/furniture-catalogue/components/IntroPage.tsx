'use client';

import React from 'react';
import { Catalogue, Profile } from '@prisma/client';
import { StandardizedContent } from '@/lib/content-schema';
import { ColorCustomization } from '../types/ColorCustomization';
import { FontCustomization, SpacingCustomization, AdvancedStyleCustomization } from '@/components/shared/StyleCustomizer';

interface IntroPageProps {
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

export function IntroPage({
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
}: IntroPageProps) {

    return (
        <div className="relative w-full h-screen overflow-hidden print:h-screen print:break-after-page bg-neutral-50">

            {/* Main content container */}
            <div className="flex h-full">

                {/* Left side - Living room showcase */}
                <div className="w-1/2 relative">
                    {/* Living room image background */}
                    <div className="absolute inset-0">
                        <div
                            className="w-full h-full bg-gradient-to-br from-neutral-100 to-neutral-200 flex items-center justify-center"
                            style={{
                                backgroundImage: `
                  linear-gradient(135deg, rgba(139,115,85,0.1) 0%, transparent 50%),
                  radial-gradient(circle at 30% 70%, rgba(212,165,116,0.1) 0%, transparent 50%)
                `
                            }}
                        >
                            {/* Modern living room scene */}
                            <div className="relative w-full h-full p-12 flex items-center justify-center">
                                {/* Furniture arrangement mockup */}
                                <div className="relative">
                                    {/* Orange sofa representation */}
                                    <div className="w-64 h-32 bg-orange-500 rounded-lg shadow-lg transform -rotate-1 relative">
                                        {/* Sofa pillows */}
                                        <div className="absolute top-2 left-4 w-12 h-8 bg-orange-400 rounded"></div>
                                        <div className="absolute top-2 right-4 w-12 h-8 bg-orange-600 rounded"></div>
                                    </div>

                                    {/* Coffee table */}
                                    <div className="absolute -bottom-8 left-16 w-32 h-4 bg-amber-800 rounded-full shadow-md"></div>

                                    {/* Side elements */}
                                    <div className="absolute -left-16 top-8 w-8 h-24 bg-green-600 rounded-full opacity-60"></div> {/* Plant */}
                                    <div className="absolute -right-20 -top-4 w-16 h-16 bg-amber-600 rounded-full opacity-40"></div> {/* Decorative */}

                                    {/* Rug pattern */}
                                    <div className="absolute -bottom-16 -left-12 w-80 h-20 bg-gradient-to-r from-neutral-300 to-neutral-400 rounded-lg opacity-30 transform rotate-1">
                                        <div className="absolute inset-2 border border-neutral-500 opacity-50"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right side - Content */}
                <div className="w-1/2 bg-white p-16 flex flex-col justify-center">

                    {/* Main heading */}
                    <div className="mb-12">
                        <h1
                            className="text-5xl font-bold text-neutral-800 leading-tight mb-4"
                            style={{
                                fontFamily: fontCustomization?.fontFamily?.title || 'serif',
                                fontSize: fontCustomization?.fontSize?.title ? `${fontCustomization.fontSize.title * 1.5}px` : 'inherit',
                                ...(advancedStyles && Object.fromEntries(
                                    Object.entries(advancedStyles).filter(([key]) =>
                                        [
                                            'color', 'background', 'backgroundColor', 'border', 'borderColor', 'borderRadius', 'boxShadow', 'margin', 'padding', 'letterSpacing', 'wordSpacing', 'lineHeight', 'fontWeight', 'fontStyle', 'textTransform', 'textDecoration', 'opacity', 'textAlign'
                                        ].includes(key)
                                    )
                                ))
                            }}
                        >
                            The Details Speak Volumes
                        </h1>

                        {/* Decorative underline */}
                        <div className="w-16 h-1 bg-orange-500 mt-4"></div>
                    </div>

                    {/* Craftsmanship features grid */}
                    <div className="grid grid-cols-3 gap-8 mb-12">

                        {/* Precision Joinery */}
                        <div className="text-center">
                            <div className="w-20 h-20 bg-amber-100 rounded-lg mb-4 mx-auto flex items-center justify-center">
                                <div
                                    className="w-12 h-12 bg-gradient-to-br from-amber-600 to-amber-800 rounded"
                                    style={{
                                        backgroundImage: `
                      repeating-linear-gradient(
                        45deg,
                        rgba(255,255,255,0.1) 0px,
                        rgba(255,255,255,0.1) 2px,
                        transparent 2px,
                        transparent 4px
                      )
                    `
                                    }}
                                ></div>
                            </div>
                            <h3
                                className="text-orange-600 text-sm font-semibold mb-2"
                                style={{
                                    fontFamily: fontCustomization?.fontFamily?.description || 'Arial, sans-serif'
                                }}
                            >
                                Precision Joinery
                            </h3>
                        </div>

                        {/* Hand-Stitched Leather */}
                        <div className="text-center">
                            <div className="w-20 h-20 bg-orange-100 rounded-lg mb-4 mx-auto flex items-center justify-center">
                                <div
                                    className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-700 rounded-lg"
                                    style={{
                                        backgroundImage: `
                      repeating-linear-gradient(
                        90deg,
                        rgba(255,255,255,0.2) 0px,
                        rgba(255,255,255,0.2) 1px,
                        transparent 1px,
                        transparent 3px
                      ),
                      repeating-linear-gradient(
                        0deg,
                        rgba(255,255,255,0.1) 0px,
                        rgba(255,255,255,0.1) 1px,
                        transparent 1px,
                        transparent 6px
                      )
                    `
                                    }}
                                ></div>
                            </div>
                            <h3
                                className="text-orange-600 text-sm font-semibold mb-2"
                                style={{
                                    fontFamily: fontCustomization?.fontFamily?.description || 'Arial, sans-serif'
                                }}
                            >
                                Hand-Stitched Leather
                            </h3>
                        </div>

                        {/* Artisanal Finishing */}
                        <div className="text-center">
                            <div className="w-20 h-20 bg-amber-100 rounded-lg mb-4 mx-auto flex items-center justify-center">
                                <div
                                    className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full"
                                    style={{
                                        backgroundImage: `
                      radial-gradient(circle at 30% 30%, rgba(255,255,255,0.3) 0%, transparent 50%),
                      radial-gradient(circle at 70% 70%, rgba(0,0,0,0.1) 0%, transparent 50%)
                    `
                                    }}
                                ></div>
                            </div>
                            <h3
                                className="text-orange-600 text-sm font-semibold mb-2"
                                style={{
                                    fontFamily: fontCustomization?.fontFamily?.description || 'Arial, sans-serif'
                                }}
                            >
                                Artisanal Finishing
                            </h3>
                        </div>

                    </div>

                    {/* Description text */}
                    <div className="mb-12">
                        <p
                            className="text-neutral-600 leading-relaxed text-base"
                            style={{
                                fontFamily: fontCustomization?.fontFamily?.description || 'Arial, sans-serif'
                            }}
                        >
                            Our furniture is crafted with an unwavering commitment to excellence. Each piece
                            represents countless hours of skilled artisanship, from selecting the finest
                            materials to applying time-honored techniques that ensure both beauty and
                            longevity. What distinguishes our collection is the meticulous attention to every detail.
                        </p>
                    </div>

                    {/* Bottom branding */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-xs font-bold">C</span>
                            </div>
                            <span
                                className="text-neutral-400 text-sm"
                                style={{
                                    fontFamily: fontCustomization?.fontFamily?.description || 'Arial, sans-serif'
                                }}
                            >
                                Craftsmanship Since 1923
                            </span>
                        </div>
                    </div>

                </div>

            </div>

        </div>
    );
}