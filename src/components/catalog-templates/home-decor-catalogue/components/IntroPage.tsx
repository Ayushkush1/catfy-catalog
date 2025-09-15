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
        <div className="relative w-full h-screen overflow-hidden print:h-screen print:break-after-page bg-gray-50">


            {/* Main content container */}
            <div className="relative z-10 h-full flex">
                {/* Left side - Image collage section */}
                <div className="w-1/2 relative overflow-hidden">
                    {/* Intro Image */}
                    <div className="absolute inset-0 bg-gray-100">
                        {catalogue.introImage ? (
                            <img
                                src={catalogue.introImage}
                                alt="Catalogue Intro"
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            /* Placeholder for intro image */
                            <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                                <div className="w-48 h-80 bg-gray-400 opacity-30 rounded-full" />
                            </div>
                        )}
                    </div>

                    {/* Subtle overlay */}
                    <div className="absolute inset-0 bg-black bg-opacity-10" />
                </div>

                {/* Right side - Content and living room */}
                <div className="w-1/2 h-full relative bg-[#eaddd455]">
                    {/* Top section - Living room image */}
                    <div className="h-1/2 relative mx-10 mt-4">
                        <div className="absolute inset-4 bg-gray-100 rounded-lg overflow-hidden shadow-lg">

                            {/* Intro Image */}
                            <div className="absolute  inset-0 bg-gray-100">
                                {catalogue.introImage ? (
                                    <img
                                        src={catalogue.introImage}
                                        alt="Catalogue Intro"
                                        className="w-full h-full object-fill"
                                    />
                                ) : (
                                    /* Placeholder for intro image */
                                    <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                                        <div className="w-48 h-80 bg-gray-400 opacity-30 rounded-full" />
                                    </div>
                                )}
                            </div>

                            {/* Subtle overlay */}
                            <div className="absolute inset-0 bg-black bg-opacity-10" />

                        </div>
                    </div>

                    {/* Bottom section - Text content */}
                    <div className="h-1/2 p-16 flex flex-col justify-center">
                        <div className="space-y-6">
                            <h2
                                className="text-4xl font-light text-gray-800 leading-tight"
                                style={{
                                    fontFamily: fontCustomization?.fontFamily?.description || "'Playfair Display', serif",
                                    fontSize: fontCustomization?.fontSize?.description || '2.25rem'
                                }}
                            >
                                {content.profile?.companyName || content.catalogue?.name || 'CATALOG'}

                            </h2>

                            <p
                                className="text-gray-600 leading-relaxed max-w-sm"
                                style={{
                                    fontFamily: fontCustomization?.fontFamily?.description || "'Inter', sans-serif"
                                }}
                            >
                                {content.catalogue?.tagline || content.profile?.tagline || 'Atta mazii satak liiii bolo rosking '}
                            </p>

                            
                        </div>
                    </div>
                </div>
            </div>

            
        </div>
    );
}