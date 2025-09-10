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
  const primaryColor = customColors?.accentColors?.primary || themeColors?.primary || '#f97316';
  const textColor = customColors?.textColors?.title || '#ffffff';
  const backgroundColor = customColors?.backgroundColors?.main || '#1a1a1a';

  // Ensure settings is parsed and has the correct shape
  const settings = typeof catalogue.settings === 'string'
    ? JSON.parse(catalogue.settings)
    : catalogue.settings;

  return (
    <div
      className="relative w-full h-screen overflow-hidden print:h-screen print:break-after-page flex"
      style={{ backgroundColor: '#f5f5f0' }}
    >
      {/* Left Side - Content with Vertical Orange Line */}
      <div className="flex-1 flex relative">
        {/* Vertical Orange Accent Line */}
        <div
          className="absolute left-12 bottom-44 w-1 h-60"
          style={{ backgroundColor: '#d4722a' }}
        />

        {/* Content Area */}
        <div className="flex-1 flex flex-col justify-center pl-24 pr-16 py-16">
          {/* Main Title */}
          <div className="mb-12">
            <h1
              className="text-lg font-bold leading-tight"
              style={{
                fontFamily: fontCustomization?.fontFamily?.title || '"Inter", sans-serif',
                fontSize: fontCustomization?.fontSize?.title
                  ? `${fontCustomization.fontSize.title}px`
                  : '1rem',
                color: '#d4722a',
                letterSpacing: '0.02em',
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
              {content.profile?.companyName || content.catalogue?.name.toUpperCase() || 'CATALOG'}
            </h1>
          </div>

          {/* Content Paragraphs */}
          <div className="space-y-6 max-w-lg">
            <p
              className="text-base leading-relaxed"
              style={{
                fontFamily: fontCustomization?.fontFamily?.description || '"Inter", sans-serif',
                color: '#5a4a3a',
                lineHeight: '1.7'
              }}
            >
              {content.catalogue?.tagline || content.profile?.tagline || 'Atta mazii satak liiii bolo rosking '}

            </p>

            <p
              className="text-base leading-relaxed"
              style={{
                fontFamily: fontCustomization?.fontFamily?.description || '"Inter", sans-serif',
                color: '#5a4a3a',
                lineHeight: '1.7'
              }}
            >
              "{content.catalogue?.quote || '"The best way to predict the future is to invent it. Distinguishes between a leader and a follower."'}"
            </p>


          </div>
        </div>
      </div>

      {/* Right Side - Hero Image */}
      <div className="w-96 relative overflow-hidden">
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

      {/* Bottom Elements */}
      <div className="absolute bottom-16 left-24 right-24 flex items-end justify-between">


        {/* Heritage Section - Bottom Right */}
        <div className="flex items-center space-x-4">
          <span
            className="text-sm tracking-wider"
            style={{
              color: '#5a4a3a',
              fontFamily: fontCustomization?.fontFamily?.description || '"Inter", sans-serif'
            }}
          >
            Discover our heritage
          </span>

          {/* QR Code */}
          <div className="w-12 h-12 border border-gray-400 flex items-center justify-center">
            <div className="w-8 h-8 bg-white opacity-90 flex items-center justify-center">
              <div className="grid grid-cols-3 gap-0.5 w-6 h-6">
                {[...Array(9)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-black"
                    style={{
                      width: '1.5px',
                      height: '1.5px',
                      opacity: Math.random() > 0.3 ? 1 : 0
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}