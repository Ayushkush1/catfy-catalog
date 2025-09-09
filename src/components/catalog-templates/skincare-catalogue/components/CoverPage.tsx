'use client';

import React from 'react';
import { Catalogue, Profile } from '@prisma/client';
import { ColorCustomization } from '../types/ColorCustomization';

interface CoverPageProps {
    catalogue: Catalogue;
    profile: Profile;
    themeColors?: any;
    isEditMode?: boolean;
    customColors?: ColorCustomization;
    fontCustomization?: any;
    spacingCustomization?: any;
    advancedStyles?: any;
    onCatalogueUpdate?: (updates: Partial<Catalogue>) => void;
    onContentChange?: (field: string, value: string) => void;
}

export function CoverPage({
    catalogue,
    profile,
    themeColors,
    isEditMode,
    customColors,
    fontCustomization,
    spacingCustomization,
    advancedStyles,
    onCatalogueUpdate,
    onContentChange
}: CoverPageProps) {
    return (
        <div className="relative w-full h-screen overflow-hidden bg-gradient-to-br from-amber-50 via-stone-100 to-amber-100">
            {/* Background botanical element */}
            <div className="absolute top-0 left-0 w-full h-full">
                <div className="absolute top-0 left-0 w-80 h-80 opacity-30">
                    <svg viewBox="0 0 300 300" className="w-full h-full">
                        <path d="M50 150 Q100 50, 150 150 Q200 250, 250 150"
                            stroke="#4ade80" strokeWidth="3" fill="none" opacity="0.6" />
                        <path d="M30 180 Q80 80, 130 180 Q180 280, 230 180"
                            stroke="#22c55e" strokeWidth="2" fill="none" opacity="0.4" />
                    </svg>
                </div>
            </div>

            {/* Main content */}
            <div className="relative z-10 flex h-full">
                {/* Left side - Text content */}
                <div className="w-1/2 flex flex-col justify-center items-start pl-16 pr-8">
                    {/* Brand name */}
                    <div className="mb-8">
                        <span className="text-orange-500 text-sm font-medium tracking-wider uppercase">
                            {profile.companyName || 'AURUM'}
                        </span>
                    </div>

                    {/* Main heading */}
                    <div className="mb-12">
                        <h1 className="text-6xl font-light text-right leading-tight text-gray-800">
                            THE<br />
                            ESSENCE<br />
                            OF
                        </h1>
                        <h2 className="text-6xl font-normal text-orange-500 mt-2">
                            LUXURY
                        </h2>
                    </div>

                    {/* Description box */}
                    <div className="bg-black/20 backdrop-blur-sm p-6 rounded-lg max-w-sm mb-8">
                        <p className="text-white text-sm leading-relaxed">
                            {catalogue.description ||
                                'Discover our signature collection of botanical essences, meticulously crafted from rare ingredients sourced from pristine locations around the world.'}
                        </p>
                        <p className="text-white text-sm leading-relaxed mt-4">
                            Each formulation embodies the perfect balance of science and nature, delivering transformative results with every application.
                        </p>
                    </div>

                    {/* Bottom text */}
                    <div className="mt-auto mb-16">
                        <p className="text-gray-600 text-sm tracking-wide">
                            CURATED BOTANICAL FORMULATIONS
                        </p>
                    </div>
                </div>

                {/* Right side - Product showcase */}
                <div className="w-1/2 flex items-center justify-center pr-16">
                    <div className="relative">
                        {/* Product bottles */}
                        <div className="flex items-end space-x-6">
                            {/* Bottle 1 */}
                            <div className="w-24 h-40 bg-gradient-to-b from-gray-200 to-gray-300 rounded-full relative shadow-lg">
                                <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-4 h-6 bg-white rounded-full"></div>
                                <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 text-xs text-center">
                                    <div className="text-gray-700 font-light">cel</div>
                                    <div className="text-xs text-gray-500 mt-2 leading-tight">
                                        R E P A I R  &<br />
                                        P R O T E C T<br />
                                        S E R U M
                                    </div>
                                    <div className="text-xs text-gray-500 mt-4">40 ml<br />1.41 FL OZ</div>
                                </div>
                            </div>

                            {/* Bottle 2 - Center, taller */}
                            <div className="w-28 h-48 bg-gradient-to-b from-gray-100 to-gray-200 rounded-full relative shadow-xl">
                                <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-5 h-8 bg-white rounded-full"></div>
                                <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 text-xs text-center">
                                    <div className="text-gray-700 font-light text-sm">cel</div>
                                    <div className="text-xs text-gray-500 mt-3 leading-tight">
                                        R E P A I R  &<br />
                                        P R O T E C T
                                    </div>
                                    <div className="text-xs text-gray-600 mt-2 font-medium">
                                        Revive and strengthen<br />
                                        Damaged Skin
                                    </div>
                                    <div className="text-xs text-gray-600 mt-2">
                                        Defence for all from barrier<br />
                                        and micro function.
                                    </div>
                                    <div className="text-xs text-gray-500 mt-4">236 ml<br />8 FL OZ</div>
                                </div>
                            </div>

                            {/* Bottle 3 */}
                            <div className="w-28 h-48 bg-gradient-to-b from-gray-100 to-gray-200 rounded-full relative shadow-xl">
                                <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-5 h-8 bg-white rounded-full"></div>
                                <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 text-xs text-center">
                                    <div className="text-gray-700 font-light text-sm">cel</div>
                                    <div className="text-xs text-gray-500 mt-3 leading-tight">
                                        R E P A I R  &<br />
                                        P R O T E C T
                                    </div>
                                    <div className="text-orange-500 text-xs mt-2 font-medium">
                                        Hydrate and protect<br />
                                        damaged skin
                                    </div>
                                    <div className="text-xs text-gray-600 mt-2">
                                        Suitable for all skin types
                                    </div>
                                    <div className="text-xs text-gray-500 mt-4">236 ml<br />8 FL OZ</div>
                                </div>
                            </div>
                        </div>

                        {/* Decorative plant element */}
                        <div className="absolute -top-20 -left-12 opacity-60">
                            <div className="w-32 h-32 text-green-600">
                                <svg viewBox="0 0 100 100" className="w-full h-full">
                                    <path d="M50 90 Q30 50, 50 10 Q70 50, 50 90" fill="currentColor" opacity="0.7" />
                                    <path d="M35 80 Q25 60, 35 40" stroke="currentColor" strokeWidth="2" fill="none" />
                                    <path d="M65 80 Q75 60, 65 40" stroke="currentColor" strokeWidth="2" fill="none" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom right logo/brand mark */}
            <div className="absolute bottom-8 right-8">
                <div className="w-12 h-12 border-2 border-orange-500 flex items-center justify-center">
                    <span className="text-orange-500 text-sm font-bold">⬜</span>
                </div>
            </div>
        </div>
    );
}
