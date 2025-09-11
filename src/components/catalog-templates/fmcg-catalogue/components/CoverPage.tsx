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
  const primaryColor = '#d4722a';
  const textColor = '#2c1810';
  const backgroundColor = '#f5f5f0';

  // Ensure settings is parsed and has the correct shape
  const settings = typeof catalogue.settings === 'string'
    ? JSON.parse(catalogue.settings)
    : catalogue.settings;

  return (
    <div
      className="relative w-full h-screen overflow-hidden print:h-screen print:break-after-page"
      style={{ backgroundColor }}
    >
      {/* Unique Creative Background Implementation */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Main Background with warm gradient */}
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(135deg, ${backgroundColor} 0%, #f0ead6 40%, #e8dcc0 100%)`
          }}
        />

        {/* Triangle gradient overlay - modernized */}
        <div
          className="absolute inset-0"
          style={{
            clipPath: 'polygon(0 0, 45% 40%, 0 100%)',
            background: `linear-gradient(135deg, ${primaryColor}15 0%, ${primaryColor}08 50%, transparent 100%)`
          }}
        />

        {/* Additional triangle for depth */}
        <div
          className="absolute inset-0"
          style={{
            clipPath: 'polygon(0 0, 35% 45%, 0 100%)',
            background: `linear-gradient(145deg, ${primaryColor}10 0%, transparent 70%)`
          }}
        />

        {/* Secondary Image Section - Semi-Circle Crop */}
        <div className="absolute top-0 right-0 w-[60%] h-full">
          <div
            className="w-full h-full overflow-hidden shadow-xl relative"
            style={{
              clipPath: 'circle(55% at 100% 50%)',
              background: `radial-gradient(circle at right center, ${primaryColor}10 0%, transparent 70%)`
            }}
          >
            {settings?.mediaAssets?.coverImageUrl ? (
              <img
                src={settings.mediaAssets.coverImageUrl}
                alt="Product Detail"
                className="w-full h-full object-cover object-center"
                style={{
                  filter: 'brightness(1.1) contrast(1.1) saturate(1.1)',
                  transform: 'scale(1.0)'
                }}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
                <div className="text-center p-8">
                  <div className="w-24 h-32 bg-gradient-to-b from-orange-200 to-orange-300 rounded-lg mx-auto mb-4 relative shadow-lg">
                    <div className="absolute top-3 left-1/2 transform -translate-x-1/2 w-6 h-6 bg-white rounded-full opacity-80"></div>
                    <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 text-center">
                      <div className="text-orange-800 text-sm font-medium">FMCG</div>
                    </div>
                  </div>
                  <div className="text-orange-700 text-sm">Premium Products</div>
                </div>
              </div>
            )}

            {/* Subtle overlay for better text contrast */}
            <div
              className="absolute inset-0"
              style={{
                background: `radial-gradient(ellipse at 100% 50%, transparent 40%, ${backgroundColor}15 100%)`
              }}
            />
          </div>
        </div>
      </div>

      {/* Brand Label at Top */}
      <div className="absolute top-12 left-12 z-20">
        <span
          className="text-sm tracking-[0.3em] uppercase font-light"
          style={{
            color: '#f97316',
            fontFamily: fontCustomization?.fontFamily?.description || 'sans-serif'
          }}
        >
          {content.profile?.companyName || profile.companyName || (catalogue?.settings as any)?.companyInfo?.companyName || 'AURUM'}
        </span>
      </div>

      {/* Main Content Container */}
      <div className="relative z-10 flex items-center justify-center h-full px-24">
        {/* Central Content */}
        <div className="text-center max-w-2xl">
          {/* Main Title */}
          <div className="mb-4">
            <h1
              className="font-bold leading-none mb-2 text-bold"
              style={{
                fontFamily: fontCustomization?.fontFamily?.title || 'serif',
                fontSize: fontCustomization?.fontSize?.title
                  ? `${fontCustomization.fontSize.title + 50}px`
                  : '5rem',
                background: `linear-gradient(135deg, #8b4513  0%, #a0522d  30%, #cd853f  60%, #daa520  100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',

                filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.5))',
                ...(advancedStyles &&
                  Object.fromEntries(
                    Object.entries(advancedStyles).filter(([key]) =>
                      [
                        'background',
                        'backgroundColor',
                        'border',
                        'borderColor',
                        'borderRadius',
                        'boxShadow',
                        'margin',
                        'padding',
                        'letterSpacing',
                        'wordSpacing',
                        'lineHeight',
                        'fontWeight',
                        'fontStyle',
                        'textTransform',
                        'textDecoration',
                        'opacity',
                        'textAlign',
                      ].includes(key)
                    )
                  )),
              }}
            >
              {content.catalogue.name?.toUpperCase() || 'CRAFTED'}
            </h1>

          </div>

          {/* Subtitle */}
          <p
            className="text-xl text-center mb-12 tracking-wide"
            style={{
              fontFamily: fontCustomization?.fontFamily?.description || 'sans-serif',
              color: '#f97316'
            }}
          >
            {content.catalogue.description || 'Premium selections for the discerning palate'}
          </p>
        </div>




      </div>

    </div>
  );
}