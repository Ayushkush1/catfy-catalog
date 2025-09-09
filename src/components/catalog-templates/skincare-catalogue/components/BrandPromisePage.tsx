'use client';

import React from 'react';
import { Catalogue, Profile } from '@prisma/client';
import { ColorCustomization } from '../types/ColorCustomization';

interface BrandPromisePageProps {
    catalogue: Catalogue;
    profile: Profile;
    themeColors?: any;
    isEditMode?: boolean;
    customColors?: ColorCustomization;
    fontCustomization?: any;
    spacingCustomization?: any;
    advancedStyles?: any;
    onContentChange?: (field: string, value: string) => void;
}

export function BrandPromisePage({
    catalogue,
    profile,
    themeColors,
    isEditMode,
    customColors,
    fontCustomization,
    spacingCustomization,
    advancedStyles,
    onContentChange
}: BrandPromisePageProps) {
    return (
        <div className="relative w-full h-screen overflow-hidden bg-black">
            {/* Two column layout */}
            <div className="flex h-full">
                {/* Left side - Product image with marble background */}
                <div className="w-1/2 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-900 via-stone-800 to-black opacity-90"></div>

                    {/* Marble texture overlay */}
                    <div className="absolute inset-0" style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                    }}></div>

                    {/* Product arrangement */}
                    <div className="relative z-10 h-full flex items-center justify-center p-12">
                        <div className="relative">
                            {/* Essential oil bottles */}
                            <div className="flex items-center space-x-6">
                                <div className="w-20 h-32 bg-gradient-to-b from-amber-800 to-amber-900 rounded-lg shadow-2xl relative">
                                    <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-3 h-4 bg-black rounded-full"></div>
                                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-center">
                                        <div className="text-orange-400 text-xs font-light">L'LICE</div>
                                    </div>
                                </div>

                                <div className="w-16 h-24 bg-gradient-to-b from-amber-700 to-amber-800 rounded-lg shadow-2xl relative">
                                    <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-2 h-3 bg-black rounded-full"></div>
                                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-center">
                                        <div className="text-orange-400 text-xs font-light">L'LICE</div>
                                    </div>
                                </div>
                            </div>

                            {/* Rose petals */}
                            <div className="absolute -top-8 -left-8">
                                <div className="w-16 h-12 bg-red-500 rounded-full opacity-80 transform rotate-45"></div>
                                <div className="w-12 h-8 bg-red-600 rounded-full opacity-70 transform -rotate-12 mt-2 ml-4"></div>
                            </div>

                            <div className="absolute -bottom-8 -right-8">
                                <div className="w-14 h-10 bg-red-500 rounded-full opacity-75 transform rotate-12"></div>
                                <div className="w-10 h-6 bg-red-600 rounded-full opacity-80 transform -rotate-45 mt-2 ml-2"></div>
                            </div>

                            {/* Yellow rose accent */}
                            <div className="absolute top-4 right-8">
                                <div className="w-20 h-16 relative">
                                    <div className="absolute inset-0 bg-gradient-to-br from-yellow-200 to-yellow-400 rounded-full opacity-90"></div>
                                    <div className="absolute inset-2 bg-gradient-to-br from-yellow-300 to-orange-300 rounded-full"></div>
                                </div>
                                <div className="w-2 h-16 bg-green-500 absolute bottom-0 left-1/2 transform -translate-x-1/2"></div>
                            </div>

                            {/* Decorative elements */}
                            <div className="absolute bottom-0 left-0 w-6 h-6 bg-amber-600 rounded-full opacity-60"></div>
                            <div className="absolute top-8 left-4 w-4 h-4 bg-amber-500 rounded-full opacity-70"></div>
                        </div>
                    </div>
                </div>

                {/* Right side - Text content */}
                <div className="w-1/2 bg-black text-white p-16 flex flex-col justify-center">
                    <div className="max-w-md">
                        {/* Header */}
                        <div className="mb-8">
                            <span className="text-orange-500 text-sm font-medium tracking-wider uppercase">
                                LUXURY WELLNESS
                            </span>
                        </div>

                        {/* Main heading */}
                        <h1 className="text-4xl font-light mb-12 leading-tight">
                            Our Promise
                        </h1>

                        {/* First paragraph */}
                        <div className="mb-12">
                            <p className="text-gray-300 leading-relaxed text-sm">
                                At the heart of our philosophy lies a profound commitment to purity and
                                effectiveness. Each formula is meticulously crafted using only the finest botanical
                                ingredients, sourced ethically from around the world. We believe that true luxury is
                                found in the harmonious balance between nature's wisdom and scientific
                                innovation.
                            </p>
                        </div>

                        {/* Divider */}
                        <div className="w-16 h-px bg-gray-600 mb-12"></div>

                        {/* Second paragraph */}
                        <div className="mb-16">
                            <p className="text-gray-300 leading-relaxed text-sm">
                                Our promise to you extends beyond skincare—it's a pledge to enhance your
                                wellbeing through rituals that nurture both skin and spirit. We create products
                                that not only transform your complexion but elevate your daily self-care practice
                                into moments of genuine tranquility and renewal. This commitment to holistic
                                beauty is woven into every aspect of our brand, from our sustainable packaging to
                                our transparent ingredient philosophy.
                            </p>
                        </div>
                    </div>

                    {/* Bottom logo */}
                    <div className="mt-auto">
                        <div className="flex items-center space-x-4">
                            <div className="w-8 h-8 border border-orange-500 rounded-full flex items-center justify-center">
                                <span className="text-orange-500 text-sm">L</span>
                            </div>
                            <div className="w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center">
                                <div className="w-2 h-2 bg-white rounded-full"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
