'use client';

import React from 'react';
import { Catalogue, Profile } from '@prisma/client';
import { StandardizedContent } from '@/lib/content-schema';
import { ColorCustomization } from '../types/ColorCustomization';
import { FontCustomization, SpacingCustomization, AdvancedStyleCustomization } from '@/components/shared/StyleCustomizer';
import { ArrowBigRight, ArrowRightIcon } from 'lucide-react';

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
            {/* Dark textured wall background matching the image */}
            <div
                className="absolute inset-0"
                style={{
                    background: `
            radial-gradient(circle at 20% 30%, rgba(45,45,45,0.3) 0%, transparent 40%),
            radial-gradient(circle at 80% 70%, rgba(35,35,35,0.4) 0%, transparent 40%),
            linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 50%, #0f0f0f 100%),
            repeating-linear-gradient(
              45deg,
              rgba(255,255,255,0.005) 0px,
              rgba(255,255,255,0.005) 1px,
              transparent 1px,
              transparent 3px
            ),
            repeating-linear-gradient(
              -45deg,
              rgba(0,0,0,0.1) 0px,
              rgba(0,0,0,0.1) 1px,
              transparent 1px,
              transparent 4px
            )
          `,
                    backgroundSize: '100% 100%, 100% 100%, 100% 100%, 20px 20px, 25px 25px'
                }}
            />

            {/* Top brand indicator */}
            <div className="absolute top-6 left-8 z-10">
                <span
                    className="text-neutral-400 text-xs tracking-[0.25em] uppercase font-light"
                    style={{
                        fontFamily: fontCustomization?.fontFamily?.description || 'Arial, sans-serif'
                    }}
                >
                    {content.profile?.companyName || profile.companyName || (catalogue?.settings as any)?.companyInfo?.companyName || 'AURUM'}
                </span>
            </div>

            {/* Top right year */}
            <div className="absolute top-6 right-8 z-10">
                <span
                    className="text-neutral-400 text-xs tracking-[0.25em] uppercase font-light"
                    style={{
                        fontFamily: fontCustomization?.fontFamily?.description || 'Arial, sans-serif'
                    }}
                >
                    {content.catalogue?.year ? `Catalogue ${content.catalogue.year}` : 'Catalogue 2025'}

                </span>
            </div>

            {/* Main content area */}
            <div className="relative z-10 flex items-center justify-between h-full px-20">

                {/* Left side - Text content */}
                <div className="w-1/2 space-y-6">
                    {/* Decorative border frame */}
                    <div className="border border-neutral-600 p-12 max-w-sm">
                        <div className="space-y-6">
                            <h1
                                className="text-white text-4xl font-bold tracking-widest"
                                style={{
                                    fontFamily: fontCustomization?.fontFamily?.title || 'serif',
                                    fontSize: fontCustomization?.fontSize?.title ? `${fontCustomization.fontSize.title * 1.5}px` : 'inherit',
                                    letterSpacing: '0.15em',
                                    lineHeight: '1.1',
                                    ...(advancedStyles && Object.fromEntries(
                                        Object.entries(advancedStyles).filter(([key]) =>
                                            [
                                                'color', 'background', 'backgroundColor', 'border', 'borderColor', 'borderRadius', 'boxShadow', 'margin', 'padding', 'letterSpacing', 'wordSpacing', 'lineHeight', 'fontWeight', 'fontStyle', 'textTransform', 'textDecoration', 'opacity', 'textAlign'
                                            ].includes(key)
                                        )
                                    ))
                                }}
                            >
                                {content.catalogue.name?.toUpperCase() || 'CRAFTED'}
                            </h1>

                            <div className="space-y-3">
                                <h2
                                    className="text-white text-2xl font-bold tracking-[0.25em]"
                                    style={{
                                        fontFamily: fontCustomization?.fontFamily?.title || 'serif',
                                        letterSpacing: '0.25em'
                                    }}
                                >
                                    CATALOG
                                </h2>

                                <p
                                    className="text-neutral-300 text-xs leading-relaxed"
                                    style={{
                                        fontFamily: fontCustomization?.fontFamily?.description || 'Arial, sans-serif'
                                    }}
                                >
                                    {content.catalogue.description || 'Curated designs that transform spaces into expressions of elegance and comfort.'}
                                </p>
                            </div>

                            {/* Call to action button */}
                            <div className="pt-4">
                                <button
                                    className="flex items-center space-x-2 text-white text-xs tracking-[0.15em] uppercase group"
                                    style={{
                                        fontFamily: fontCustomization?.fontFamily?.description || 'Arial, sans-serif'
                                    }}
                                >
                                    <span>EXPLORE COLLECTION</span>
                                    <ArrowRightIcon className='w-4 h-4' />
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
                            {/* Main product image container */}
                            <div className="w-80 h-80 rounded-sm">
                                <img
                                    src={settings.mediaAssets.coverImageUrl}
                                    alt="Product Detail"
                                    className="w-full h-full object-cover object-center rounded-sm"
                                    style={{
                                        filter: 'brightness(1.1) contrast(1.1) saturate(1.1)',
                                        transform: 'scale(1.0)'
                                    }}
                                />
                            </div>

                            {/* "NEW ARRIVALS" badge */}
                            <div className="absolute -bottom-4 -right-4 bg-yellow-500 text-black px-5 py-3 font-bold text-xs tracking-wider">
                                NEW ARRIVALS
                            </div>
                        </div>
                    </div>
                </div>
            </div>



            {/* Bottom branding */}
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-10 flex items-center space-x-6">
                <div className="text-neutral-500 text-xs tracking-[0.2em] uppercase">
                    PREMIUM QUALITY • SUSTAINABLE MATERIALS • TIMELESS DESIGN
                </div>
            </div>


        </div>
    );
}