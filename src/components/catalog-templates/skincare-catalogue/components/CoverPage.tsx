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

            {/* Main container */}
            <div className="relative z-10 h-screen">
                {/* Company brand text - Top left */}
                <div className="absolute top-12 left-16">
                    <h2
                        className="font-light tracking-[0.3em] text-sm"
                        style={{
                            fontFamily: fontCustomization?.fontFamily?.companyName || 'serif',
                            color: '#f97316'
                        }}
                    >
                        {content.profile?.companyName || profile.companyName || (catalogue?.settings as any)?.companyInfo?.companyName || 'AURUM'}
                    </h2>
                </div>

                {/* Description card - Left side, vertically centered */}
                <div className="absolute left-16 top-1/2 transform -translate-y-1/2 max-w-sm">
                    <div
                        className="backdrop-blur-sm p-6 rounded-sm"
                        style={{
                            backgroundColor: 'rgba(139, 69, 19, 0.4)',
                            color: '#ffffff'
                        }}
                    >
                        <p
                            className="text-sm leading-relaxed"
                            style={{
                                fontFamily: fontCustomization?.fontFamily?.description || 'Arial, sans-serif',
                                color: '#ffffff'
                            }}
                        >
                            {content.catalogue?.description || catalogue.description ||
                                'Discover our signature collection of botanical essences, meticulously crafted from rare ingredients sourced from pristine locations around the world.'}
                        </p>

                    </div>
                </div>

                {/* Main heading - Right side, vertically centered */}
                <div className="absolute right-16 top-1/2 transform -translate-y-1/2">
                    <div className="text-right max-w-sm">
                        <h1
                            className="font-extralight tracking-wider text-right leading-tight"
                            style={{
                                fontFamily: fontCustomization?.fontFamily?.title || 'serif',
                                color: '#ffffff',
                                fontSize: '3.5rem',
                                fontWeight: '100'
                            }}
                        >
                            <div
                                className="text-lg leading-tight font-extralight mb-4"
                                style={{
                                    fontSize: fontCustomization?.fontSize?.title ? `${fontCustomization.fontSize.title * 1.5}px` : '2rem',
                                    fontWeight: '100'
                                }}
                            >
                                {(() => {
                                    const text = content.catalogue?.name || catalogue.name || 'CATALOGUE NAME';
                                    const words = text.split(' ');
                                    const lastWord = words.pop();
                                    const restWords = words.join(' ');

                                    return (
                                        <>
                                            {restWords && <span>{restWords} </span>}
                                            <span style={{ color: '#f97316' }}>{lastWord}</span>
                                        </>
                                    );
                                })()}
                            </div>
                        </h1>
                    </div>
                </div>
            </div>

            {/* Bottom tagline */}
            <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2">
                <p
                    className="font-light tracking-[0.4em] text-sm text-white"
                    style={{
                        fontFamily: fontCustomization?.fontFamily?.description || 'Arial, sans-serif'
                    }}
                >
                    {(content.catalogue as any).year ? `Catalogue ${(content.catalogue as any).year}` : 'Catalogue 2025'}
                </p>
            </div>

            
        </div>
    );
}
