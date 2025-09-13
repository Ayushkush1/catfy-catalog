'use client';

import React from 'react';
import { Catalogue, Profile, Product, Category } from '@prisma/client';
import { StandardizedContent } from '@/lib/content-schema';
import { ColorCustomization } from '../types/ColorCustomization';
import { FontCustomization, SpacingCustomization, AdvancedStyleCustomization } from '@/components/shared/StyleCustomizer';

interface DailyRoutinePageProps {
    catalogue: Catalogue & {
        products: (Product & { category: Category | null })[]
        categories: Category[]
    };
    profile: Profile;
    themeColors?: any;
    isEditMode?: boolean;
    content: StandardizedContent;
    customColors?: ColorCustomization;
    fontCustomization?: FontCustomization;
    spacingCustomization?: SpacingCustomization;
    advancedStyles?: AdvancedStyleCustomization;
    onProductUpdate?: (productId: string, updates: Partial<Product>) => void;
    onContentChange?: (field: string, value: string) => void;
}

export function DailyRoutinePage({
    catalogue,
    profile,
    themeColors,
    isEditMode,
    content,
    customColors,
    fontCustomization,
    spacingCustomization,
    advancedStyles,
    onProductUpdate,
    onContentChange
}: DailyRoutinePageProps) {
    // Get first three products or create default routine steps
    const routineSteps = catalogue.products.slice(0, 3).length > 0
        ? catalogue.products.slice(0, 3).map((product, index) => ({
            id: product.id,
            step: index + 1,
            title: product.name,
            description: product.description || 'Essential step in your daily skincare routine',
            image: product.imageUrl || product.images?.[0] || null
        }))
        : [
            {
                step: 1,
                title: 'Daily Facial Cleanser',
                description: 'Gently removes impurities without disrupting skin\'s natural balance. Use morning and evening for best results.',
                image: null
            },
            {
                step: 2,
                title: 'Revitalizing Essence',
                description: 'Powerful active ingredients target specific concerns while preparing skin for maximum hydration absorption.',
                image: null
            },
            {
                step: 3,
                title: 'Moisture Complex',
                description: 'Locks in essential moisture and strengthens skin barrier for lasting protection throughout the day.',
                image: null
            }
        ];

    return (
        <div className="relative w-full h-screen overflow-hidden print:h-screen print:break-after-page bg-[#1f1616]">
            {/* Main content container */}
            <div className="h-full flex flex-col justify-center items-center p-16">
                {/* Header */}
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-light text-white mt-10">DAILY ROUTINE</h1>
                </div>

                {/* Routine steps grid */}
                <div className="flex justify-center mb-16">
                    {routineSteps.map((step, index) => (
                        <div key={step.step || index} className="flex flex-col items-center max-w-xs">
                            

                            {/* Product image container */}
                            <div className="w-[300px] h-[350px] bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl mb-6 flex items-center justify-center shadow-xl overflow-hidden">
                                {step.image ? (
                                    <img
                                        src={step.image}
                                        alt={step.title}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="text-center p-8">
                                        {/* Default product visualization */}
                                        {step.step === 1 && (
                                            <div className="w-24 h-32 bg-gradient-to-b from-blue-200 to-blue-300 rounded-lg mx-auto mb-4 relative shadow-md">
                                                <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-6 h-6 bg-white rounded-full"></div>
                                                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-center">
                                                    <div className="text-blue-800 text-xs font-medium">Act+Acre</div>
                                                    <div className="text-blue-600 text-xs mt-1">Restorative<br />Treatment Mask</div>
                                                </div>
                                            </div>
                                        )}
                                        {step.step === 2 && (
                                            <div className="w-20 h-28 bg-gradient-to-b from-gray-50 to-gray-100 rounded-lg mx-auto mb-4 relative shadow-md">
                                                <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-4 h-6 bg-gray-300 rounded-full"></div>
                                                <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2 text-center">
                                                    <div className="text-gray-700 text-xs">Intensive<br />Hair Mask Treatment<br />| Damaged Hair</div>
                                                </div>
                                            </div>
                                        )}
                                        {step.step === 3 && (
                                            <div className="w-32 h-20 bg-gradient-to-r from-green-50 to-green-100 rounded-xl mx-auto mb-4 relative shadow-md">
                                                <div className="absolute top-2 left-2 w-4 h-4 bg-green-200 rounded-full"></div>
                                                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                                                    <div className="text-green-800 text-xs font-medium">Corefiance</div>
                                                    <div className="text-green-600 text-xs">Moisture Gel</div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Step info */}
                            <div className="text-center">
                                <h4 className="text-gray-300 text-md mb-4">{step.title}</h4>
                                <p className="text-gray-400 text-xs leading-relaxed max-w-xs">
                                    {step.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                
            </div>
        </div>
    );
}
