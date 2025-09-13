'use client';

import React from 'react';
import { Catalogue, Profile } from '@prisma/client';
import { StandardizedContent } from '@/lib/content-schema';
import { ColorCustomization } from '../types/ColorCustomization';
import { FontCustomization, SpacingCustomization, AdvancedStyleCustomization } from '@/components/shared/StyleCustomizer';

interface BrandPromisePageProps {
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

export function BrandPromisePage({
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
}: BrandPromisePageProps) {
    return (
        <div className="relative w-full h-screen overflow-hidden print:h-screen print:break-after-page bg-[#1f1616]">
            {/* Two column layout */}
            <div className="flex h-full">
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

                {/* Right side - Text content */}
                <div className="w-1/2 text-white p-16 flex flex-col justify-center">
                    <div className="max-w-md">
                        {/* Header */}
                        <div className="mb-4">
                            <span className="text-orange-500 text-sm font-medium tracking-wider uppercase">
                                LUXURY WELLNESS
                            </span>
                        </div>

                        {/* Main heading */}
                        <h1 className="text-4xl font-light mb-12 leading-tight">
                            Our Promise
                        </h1>

                        {/* First paragraph */}
                        <div className="mb-10">
                            <p className="text-gray-300 leading-relaxed text-sm">
                                {content.catalogue?.tagline || content.profile?.tagline || 'Atta mazii satak liiii bolo rosking '}

                            </p>
                        </div>

                        {/* Divider */}
                        <div className="w-20 h-px bg-gray-600 mb-10"></div>

                        {/* Second paragraph */}
                        <div className="mb-16 text-gray-300 leading-relaxed text-sm">
                            {content.catalogue?.quote || '"The best way to predict the future is to invent it. Distinguishes between a leader and a follower."'}

                        </div>


                    </div>

                    
                </div>
            </div>
        </div>
    );
}
