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
  // Remove inline editing - content is managed centrally in StyleCustomizer
  const primaryColor = themeColors?.primary || '#000000';
  const secondaryColor = themeColors?.secondary || '#666666';
  const backgroundColor = themeColors?.background || '#000000';
  const textColor = themeColors?.text || '#ffffff';

  // Sample fashion images for the grid layout
  const sampleImages = [
    { id: 1, color: '#F4D03F', alt: 'Yellow fashion outfit' },
    { id: 2, color: '#E8DAEF', alt: 'Pink elegant dress' },
    { id: 3, color: '#DC7633', alt: 'Red streetwear' },
    { id: 4, color: '#48C9B0', alt: 'Green neon style' },
    { id: 5, color: '#8E44AD', alt: 'Purple formal wear' }
  ];

  return (
    <div className="relative w-full h-screen overflow-hidden print:h-screen print:break-after-page">
      {/* Cover Image Background */}
      <div className="absolute inset-0 overflow-hidden">
        <img
          src={catalogue.settings.mediaAssets?.coverImageUrl || '/default-cover.jpg'} 
          alt="Catalogue Cover"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Semi-transparent overlay for text readability */}
      <div className="absolute inset-0 bg-black bg-opacity-20" />

      {/* VERITE Title - Large and Centered */}
      <div className="relative z-10 flex items-center justify-center h-full">
        <h1 
          className="text-[12rem] md:text-[15rem] lg:text-[18rem] font-bold text-white tracking-[0.2em] text-center leading-none"
          style={{
            fontFamily: fontCustomization?.fontFamily?.title || 'serif',
            fontSize: fontCustomization?.fontSize?.title ? `${fontCustomization.fontSize.title * 3}px` : 'inherit',
            textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
            ...advancedStyles
          }}
        >          {content.catalogue.name?.toUpperCase() || content.profile.companyName?.toUpperCase() || 'CATALOG'}
        </h1>
      </div>
    {/* {console.log(content)} */}

      {/* Bottom decorative text */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10">
        <div className="flex items-center space-x-6">
          <div className="w-12 h-px bg-white opacity-60" />
          <p 
            className="text-white text-sm tracking-[0.3em] uppercase font-light"
            style={{ 
              fontFamily: fontCustomization?.fontFamily?.description || 'Arial, sans-serif'
            }}
          >
            {content.catalogue.description || 'FASHION COLLECTION'}
          </p>
          <div className="w-12 h-px bg-white opacity-60" />
        </div>
      </div>
    </div>
  );
}