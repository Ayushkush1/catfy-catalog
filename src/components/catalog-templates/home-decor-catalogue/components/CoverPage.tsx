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
        <div className="relative w-full h-screen overflow-hidden print:h-screen print:break-after-page">
            {/* Cover Image Background */}
            <div className="absolute inset-0 overflow-hidden">
                <img
                    src={settings?.mediaAssets?.coverImageUrl || '/default-cover.jpg'}
                    alt="Catalogue Cover"
                    className="w-full h-full object-cover"
                />
            </div>

            {/* Semi-transparent overlay for text readability */}
            <div className="absolute inset-0 bg-black bg-opacity-20" />

            {/* Main content container */}
            <div className="relative z-10 h-full flex items-center">
                {/* Left side - Hero text */}
                <div className="w-1/2 px-16 space-y-8">
                    <div className="space-y-6">
                        <h1
                            className="text-[7rem] font-light text-white leading-tight tracking-wide"
                            style={{
                                fontFamily: fontCustomization?.fontFamily?.description || "'Playfair Display', serif",
                                fontSize: fontCustomization?.fontSize?.title ? `${fontCustomization.fontSize.title * 2}px` : 'inherit',
                                textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
                            }}
                        >
                            {content.catalogue.name?.toUpperCase() || content.profile.companyName?.toUpperCase() || 'CATALOG'}
                        </h1>

                    </div>

                    {/* Company website at bottom left */}
                    <div className="absolute bottom-10 left-16">
                        <p
                            className="text-gray-500 text-xs tracking-[0.3em] font-light"
                            style={{
                                fontFamily: fontCustomization?.fontFamily?.description || "'Inter', sans-serif"
                            }}
                        >
                                {content.profile?.website || profile.website || 'www.maisonarte.com'}
                        </p>
                    </div>
                </div>

                {/* Right side - Content card overlay matching the exact design */}
                <div className="w-1/2 h-full relative flex items-center justify-center pr-16 mt-60">
                    <div
                        className="bg-white/65 backdrop-blur-md p-8 rounded-sm max-w-sm text-center shadow-2xl"
                       
                    >
                        <div className="space-y-4">

                            <p
                                className="text-gray-600 leading-relaxed text-base"
                                style={{
                                    fontFamily: fontCustomization?.fontFamily?.description || "'Inter', sans-serif"
                                }}
                            >
                                {content.catalogue?.description || catalogue.description || 'Discover our meticulously selected collection of fine home decor, where timeless elegance meets contemporary design.'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Top decorative elements */}
                <div className="absolute top-8 left-16 z-20">
                    <span
                        className="text-gray-500 text-xs tracking-[0.25em] uppercase font-light"
                        style={{
                            fontFamily: fontCustomization?.fontFamily?.description || "'Inter', sans-serif"
                        }}
                    >
                        {content.profile?.companyName || profile.companyName || (catalogue?.settings as any)?.companyInfo?.companyName || 'AURUM'}
                    </span>
                </div>

                <div className="absolute top-8 right-16 z-20">
                    <span
                        className="text-gray-500 text-xs tracking-[0.25em] uppercase font-light"
                        style={{
                            fontFamily: fontCustomization?.fontFamily?.description || "'Inter', sans-serif"
                        }}
                    >
                        {new Date().getFullYear()} Collection
                    </span>
                </div>
            </div>
        </div>
    );
}