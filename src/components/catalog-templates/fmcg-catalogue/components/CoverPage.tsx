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
  const primaryColor = customColors?.accentColors?.primary || themeColors?.primary || '#ff6b35';
  const textColor = customColors?.textColors?.title || '#ffffff';
  const backgroundColor = customColors?.backgroundColors?.cover || '#1a1a1a';

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
      <div className="absolute inset-0 overflow-hidden bg-gradient-to-br from-[#d4a37378] via-transparent to-[#d4a373]">
        {/* Main Background Image with Creative Masking */}
        <div className="absolute inset-0">
          {/* Triangle gradient overlay - full height with vertex under text */}
          <div
            className="absolute inset-0"
            style={{
              clipPath: 'polygon(0 0, 45% 40%, 0 100%)',
              background: `linear-gradient(135deg, ${primaryColor}25 0%, ${backgroundColor}50 30%, ${primaryColor}15 70%, transparent 100%)`
            }}
          />
          {/* Additional triangle for depth */}
          <div
            className="absolute inset-0"
            style={{
              clipPath: 'polygon(0 0, 35% 45%, 0 100%)',
              background: `linear-gradient(145deg, transparent 0%, ${primaryColor}10 40%, ${backgroundColor}30 100%)`
            }}
          />
        </div>

        {/* Secondary Image Section - Semi-Circle Crop */}
        <div className="absolute top-0 right-0 w-[600px] h-full">
          <div
            className="w-full h-full overflow-hidden shadow-2xl border-white/20 relative"
            style={{
              clipPath: 'circle(365px at 490px 50%)',
              background: `radial-gradient(circle at right center, ${primaryColor}20 0%, transparent 70%)`
            }}
          >
            <img
              src={settings?.mediaAssets?.coverImageUrl || '/default-cover.jpg'}
              alt="Product Detail"
              className="w-full h-full object-cover"
              style={{
                filter: 'brightness(0.9) contrast(1.3) sepia(0.1)',
                transform: 'scale(1.1)'
              }}
            />
            {/* Inner gradient overlay */}
            <div
              className="absolute inset-0"
              style={{
                background: `radial-gradient(ellipse at 80% 30%, transparent 30%, ${primaryColor}10 60%, ${backgroundColor}30 100%)`
              }}
            />
            {/* Decorative edge highlight */}
            <div
              className="absolute top-0 left-0 w-1 h-full"
              style={{
                background: `linear-gradient(to bottom, ${primaryColor}40, transparent 50%, ${primaryColor}20)`
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