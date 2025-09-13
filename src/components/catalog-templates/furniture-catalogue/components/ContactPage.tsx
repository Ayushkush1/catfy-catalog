'use client';

import React from 'react';
import { Catalogue, Profile } from '@prisma/client';
import { StandardizedContent } from '@/lib/content-schema';
import { ColorCustomization } from '../types/ColorCustomization';
import { FontCustomization, SpacingCustomization, AdvancedStyleCustomization } from '@/components/shared/StyleCustomizer';

interface ContactPageProps {
    catalogue: Catalogue;
    profile: Profile;
    themeColors?: any;
    content: StandardizedContent;
    onCatalogueUpdate?: (updates: Partial<Catalogue>) => void;
    onContentChange?: (field: string, value: string) => void;
    customColors?: ColorCustomization;
    fontCustomization?: FontCustomization;
    spacingCustomization?: SpacingCustomization;
    advancedStyles?: AdvancedStyleCustomization;
}

export function ContactPage({
    catalogue,
    profile,
    themeColors,
    content,
    onCatalogueUpdate,
    onContentChange,
    customColors,
    fontCustomization,
    spacingCustomization,
    advancedStyles
}: ContactPageProps) {

    return (
        <div className="relative w-full h-screen overflow-hidden print:h-screen print:break-after-page bg-neutral-100">

            {/* Main content container */}
            <div className="flex h-full">

                {/* Left side - Contact information and images */}
                <div className="w-1/2 bg-white p-16 relative">

                    {/* Header */}
                    <div className="mb-12">
                        <h1
                            className="text-4xl font-bold text-orange-600 mb-4"
                            style={{
                                fontFamily: fontCustomization?.fontFamily?.title || 'serif',
                                fontSize: fontCustomization?.fontSize?.title ? `${fontCustomization.fontSize.title * 1.3}px` : 'inherit',
                                ...(advancedStyles && Object.fromEntries(
                                    Object.entries(advancedStyles).filter(([key]) =>
                                        [
                                            'color', 'background', 'backgroundColor', 'border', 'borderColor', 'borderRadius', 'boxShadow', 'margin', 'padding', 'letterSpacing', 'wordSpacing', 'lineHeight', 'fontWeight', 'fontStyle', 'textTransform', 'textDecoration', 'opacity', 'textAlign'
                                        ].includes(key)
                                    )
                                ))
                            }}
                        >
                            Let's Stay Connected
                        </h1>
                    </div>

                    {/* Image gallery */}
                    <div className="grid grid-cols-2 gap-6 mb-12">

                        {/* Top left - Tools/Materials */}
                        <div className="space-y-4">
                            <div
                                className="w-full h-32 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg relative overflow-hidden"
                                style={{
                                    backgroundImage: `
                    linear-gradient(45deg, rgba(255,255,255,0.1) 25%, transparent 25%),
                    linear-gradient(-45deg, rgba(255,255,255,0.1) 25%, transparent 25%),
                    linear-gradient(45deg, transparent 75%, rgba(255,255,255,0.1) 75%),
                    linear-gradient(-45deg, transparent 75%, rgba(255,255,255,0.1) 75%)
                  `,
                                    backgroundSize: '20px 20px'
                                }}
                            >
                                {/* Tool icons representation */}
                                <div className="absolute inset-0 flex items-center justify-center space-x-2">
                                    <div className="w-4 h-8 bg-orange-400 rounded transform rotate-12"></div>
                                    <div className="w-6 h-2 bg-yellow-400 rounded"></div>
                                    <div className="w-3 h-6 bg-red-400 rounded transform -rotate-12"></div>
                                </div>
                            </div>

                            <div
                                className="w-full h-32 bg-gradient-to-br from-neutral-600 to-neutral-800 rounded-lg relative overflow-hidden"
                                style={{
                                    backgroundImage: `
                    radial-gradient(circle at 30% 30%, rgba(255,255,255,0.1) 0%, transparent 50%),
                    linear-gradient(135deg, rgba(139,115,85,0.2) 0%, transparent 50%)
                  `
                                }}
                            >
                                {/* Paper/Book representation */}
                                <div className="absolute inset-2 bg-neutral-100 rounded transform rotate-1">
                                    <div className="absolute inset-2 space-y-1">
                                        <div className="h-1 bg-neutral-300 rounded w-3/4"></div>
                                        <div className="h-1 bg-neutral-300 rounded w-1/2"></div>
                                        <div className="h-1 bg-neutral-300 rounded w-2/3"></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Top right - Wood texture */}
                        <div
                            className="w-full h-full bg-gradient-to-br from-amber-600 to-amber-800 rounded-lg relative"
                            style={{
                                backgroundImage: `
                  repeating-linear-gradient(
                    90deg,
                    rgba(139,115,85,0.3) 0px,
                    rgba(139,115,85,0.3) 2px,
                    transparent 2px,
                    transparent 8px
                  ),
                  repeating-linear-gradient(
                    0deg,
                    rgba(160,82,45,0.2) 0px,
                    rgba(160,82,45,0.2) 1px,
                    transparent 1px,
                    transparent 12px
                  )
                `
                            }}
                        >
                            {/* Wood grain pattern */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
                        </div>

                    </div>

                    {/* Connect With Us section */}
                    <div className="mb-8">
                        <h3
                            className="text-orange-600 text-xl font-semibold mb-6"
                            style={{
                                fontFamily: fontCustomization?.fontFamily?.title || 'serif'
                            }}
                        >
                            Connect With Us
                        </h3>

                        <div className="space-y-4">

                            {/* Email */}
                            <div className="flex items-center space-x-3">
                                <div className="w-5 h-5 bg-orange-500 rounded flex items-center justify-center">
                                    <span className="text-white text-xs">@</span>
                                </div>
                                <span
                                    className="text-neutral-600"
                                    style={{
                                        fontFamily: fontCustomization?.fontFamily?.description || 'Arial, sans-serif'
                                    }}
                                >
                                    {content.profile.email || 'contact@luxuryfurniture.com'}
                                </span>
                            </div>

                            {/* Phone */}
                            <div className="flex items-center space-x-3">
                                <div className="w-5 h-5 bg-orange-500 rounded flex items-center justify-center">
                                    <span className="text-white text-xs">📞</span>
                                </div>
                                <span
                                    className="text-neutral-600"
                                    style={{
                                        fontFamily: fontCustomization?.fontFamily?.description || 'Arial, sans-serif'
                                    }}
                                >
                                    {content.profile.phone || '+1 (800) 555-7890'}
                                </span>
                            </div>

                            {/* Address */}
                            <div className="flex items-center space-x-3">
                                <div className="w-5 h-5 bg-orange-500 rounded flex items-center justify-center">
                                    <span className="text-white text-xs">📍</span>
                                </div>
                                <span
                                    className="text-neutral-600"
                                    style={{
                                        fontFamily: fontCustomization?.fontFamily?.description || 'Arial, sans-serif'
                                    }}
                                >
                                    {content.profile.address || '78 Madison Avenue, New York, NY 10016'}
                                </span>
                            </div>

                            {/* Social links */}
                            <div className="flex items-center space-x-3 pt-2">
                                <div className="w-5 h-5 bg-blue-500 rounded flex items-center justify-center">
                                    <span className="text-white text-xs">f</span>
                                </div>
                                <div className="w-5 h-5 bg-pink-500 rounded flex items-center justify-center">
                                    <span className="text-white text-xs">i</span>
                                </div>
                                <div className="w-5 h-5 bg-red-500 rounded flex items-center justify-center">
                                    <span className="text-white text-xs">p</span>
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* Signature line */}
                    <div className="absolute bottom-8 left-16">
                        <p
                            className="text-neutral-400 text-sm italic"
                            style={{
                                fontFamily: fontCustomization?.fontFamily?.description || 'Arial, sans-serif'
                            }}
                        >
                            Our signature living collection
                        </p>
                    </div>

                </div>

                {/* Right side - Contact form */}
                <div className="w-1/2 bg-neutral-50 p-16 flex flex-col justify-center">

                    {/* Decorative background image */}
                    <div
                        className="absolute inset-0 opacity-5 bg-cover bg-center"
                        style={{
                            backgroundImage: `
                radial-gradient(circle at 70% 30%, rgba(139,115,85,0.1) 0%, transparent 50%),
                linear-gradient(135deg, rgba(212,165,116,0.05) 0%, transparent 50%)
              `
                        }}
                    ></div>

                    <div className="relative z-10">

                        {/* Form fields */}
                        <div className="space-y-6">

                            {/* Name field */}
                            <div>
                                <label
                                    className="block text-neutral-700 text-sm font-medium mb-2"
                                    style={{
                                        fontFamily: fontCustomization?.fontFamily?.description || 'Arial, sans-serif'
                                    }}
                                >
                                    Name
                                </label>
                                <input
                                    type="text"
                                    placeholder="Your name"
                                    className="w-full p-4 border border-neutral-300 rounded-lg focus:outline-none focus:border-orange-500 bg-white"
                                    style={{
                                        fontFamily: fontCustomization?.fontFamily?.description || 'Arial, sans-serif'
                                    }}
                                />
                            </div>

                            {/* Email field */}
                            <div>
                                <label
                                    className="block text-neutral-700 text-sm font-medium mb-2"
                                    style={{
                                        fontFamily: fontCustomization?.fontFamily?.description || 'Arial, sans-serif'
                                    }}
                                >
                                    Email
                                </label>
                                <input
                                    type="email"
                                    placeholder="Your email address"
                                    className="w-full p-4 border border-neutral-300 rounded-lg focus:outline-none focus:border-orange-500 bg-white"
                                    style={{
                                        fontFamily: fontCustomization?.fontFamily?.description || 'Arial, sans-serif'
                                    }}
                                />
                            </div>

                            {/* Message field */}
                            <div>
                                <label
                                    className="block text-neutral-700 text-sm font-medium mb-2"
                                    style={{
                                        fontFamily: fontCustomization?.fontFamily?.description || 'Arial, sans-serif'
                                    }}
                                >
                                    Message
                                </label>
                                <textarea
                                    rows={6}
                                    placeholder="How can we help you?"
                                    className="w-full p-4 border border-neutral-300 rounded-lg focus:outline-none focus:border-orange-500 resize-none bg-white"
                                    style={{
                                        fontFamily: fontCustomization?.fontFamily?.description || 'Arial, sans-serif'
                                    }}
                                ></textarea>
                            </div>

                            {/* Submit button */}
                            <button
                                className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 rounded-lg font-medium transition-colors"
                                style={{
                                    fontFamily: fontCustomization?.fontFamily?.description || 'Arial, sans-serif'
                                }}
                            >
                                Send
                            </button>

                        </div>

                    </div>

                </div>

            </div>

        </div>
    );
}