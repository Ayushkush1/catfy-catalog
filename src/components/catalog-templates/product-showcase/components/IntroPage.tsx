import React from 'react';
import { Catalogue, Profile } from '@prisma/client';
import { StandardizedContent } from '@/lib/content-schema';

interface IntroPageProps {
  catalogue: Catalogue;
  profile: Profile;
  themeColors?: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
  };
  isEditMode?: boolean;
  content: StandardizedContent;
  customColors?: {
    backgroundColors?: {
      intro?: string;
    };
    textColors?: {
      title?: string;
      description?: string;
      accent?: string;
    };
    accentColors?: {
      primary?: string;
    };
  };
  fontCustomization?: {
    fontFamily?: {
      title?: string;
      description?: string;
      accent?: string;
    };
    fontSize?: {
      title?: number;
      description?: number;
      accent?: number;
    };
  };
  spacingCustomization?: {
    padding?: {
      page?: number;
    };
    margin?: {
      sections?: number;
      elements?: number;
    };
  };
  advancedStyles?: any;
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
  const primaryColor = themeColors?.primary || '#D2691E';
  const secondaryColor = themeColors?.secondary || '#2C2C2C';
  const backgroundColor = themeColors?.background || '#2C2C2C';
  const textColor = themeColors?.text || '#FFFFFF';

  return (
    <div className="relative w-full h-screen overflow-hidden print:h-screen print:break-after-page bg-white">
      {/* Two Column Layout */}
      <div className="flex h-full">
        {/* Left Side - Intro Image */}
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
            className="text-5xl md:text-6xl font-light mb-8 text-gray-900 leading-tight"
            style={{
              fontFamily: 'serif',
              letterSpacing: '0.05em',
              ...advancedStyles?.titleStyles,
            }}
          >
            {content.profile?.companyName || content.catalogue?.name  || 'CATALOG'}
            
          </h1>

          

          {/* Subtitle */}
          <h2 
            className="text-lg font-light mb-6 text-gray-700 tracking-wide uppercase"
            style={{
              fontFamily: 'sans-serif',
              letterSpacing: '0.2em',
              ...advancedStyles?.subtitleStyles,
            }}
          >
            {content.catalogue?.tagline || content.profile?.tagline || 'Atta mazii satak liiii bolo rosking '}
          </h2>

          

          {/* Quote */}
          <div className="mt-12 flex items-center gap-4">
            <div className="w-0.5 h-[70px] bg-red-300/50" />
            <div className="flex-1 bg-gray-100 p-6 rounded-md">
              <p className="text-md font-light italic text-gray-600 leading-relaxed" style={{ fontFamily: "'Playfair Display', serif" }}>
                "{content.catalogue?.quote || '"The best way to predict the future is to invent it. Distinguishes between a leader and a follower."'}"
              </p>
            </div>
          </div>

          

          {/* Company Information */}
          <div className="flex flex-col space-y-2 mt-auto">
            <span 
              className="text-sm tracking-widest uppercase text-gray-500 font-light"
              style={{
                fontFamily: 'sans-serif',
                letterSpacing: '0.3em',
                ...advancedStyles?.brandStyles,
              }}
            >
              {content.profile?.companyName || profile.companyName || (catalogue?.settings as any)?.companyInfo?.companyName || 'COMPANY NAME'}
            </span>
            
            {/* Company Description */}
            {content.catalogue?.description && (
              <p className="text-xs text-gray-400 font-light leading-relaxed max-w-md">
                {content.catalogue.description}
              </p>
            )}
            
            {/* Catalogue Year */}
            <p className="text-xs text-gray-500 font-light tracking-wider mt-2">
              {content.catalogue?.year ? `Catalogue ${content.catalogue.year}` : 'Catalogue 2025'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}