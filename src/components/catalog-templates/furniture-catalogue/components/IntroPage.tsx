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

                {/* Right Side - Content */}
                <div className="w-1/2 flex flex-col justify-center px-16 py-12">
                    {/* Main Title */}
                    <h1
                        className="text-5xl text-center md:text-5xl font-bold mb-10 mt-10 text-gray-900 leading-tight"
                        style={{
                            
                        }}
                    >
                        {content.profile?.companyName || content.catalogue?.name || 'CATALOG'}

                    </h1>



                    {/* Subtitle */}
                    <h2
                        className="text-sm text-center font-normal mb-6 text-gray-700 tracking-widest max-w-[420px] mx-auto"
                        style={{
                            
                            letterSpacing: '0.2em',
                        }}
                    >
                        {content.catalogue?.tagline || content.profile?.tagline || 'Atta mazii satak liiii bolo rosking '}
                    </h2>



                   



                    {/* Company Information */}
                    <div className="flex flex-col  mt-auto">
                        <span
                            className="text-sm tracking-widest uppercase text-gray-500 font-light"
                            style={{
                                fontFamily: 'sans-serif',
                                letterSpacing: '0.3em',
                            }}
                        >
                            {content.profile?.companyName || profile.companyName || (catalogue?.settings as any)?.companyInfo?.companyName || 'COMPANY NAME'}
                        </span>

                        {/* Company Description */}
                        {content.catalogue?.description && (
                            <p className="text-xs text-gray-500 font-light leading-relaxed max-w-md">
                                {content.catalogue.description}
                            </p>
                        )}

                        
                    </div>
                </div>
            </div>

        </div>
    );
}