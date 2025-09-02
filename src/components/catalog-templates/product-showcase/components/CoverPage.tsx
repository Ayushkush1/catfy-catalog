'use client';

import React, { useState, useEffect } from 'react';
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
  const [editableName, setEditableName] = useState(content.catalogue.name)
  const [editableDescription, setEditableDescription] = useState(content.catalogue.description || 'Discover our premium collection of products')

  useEffect(() => {
    setEditableName(content.catalogue.name)
    setEditableDescription(content.catalogue.description || 'Discover our premium collection of products')
  }, [content.catalogue.name, content.catalogue.description])

  const handleNameChange = (value: string) => {
    setEditableName(value)
    onContentChange?.('name', value)
  }

  const handleDescriptionChange = (value: string) => {
    setEditableDescription(value)
    onContentChange?.('description', value)
  }
  const primaryColor = themeColors?.primary || '#000000';
  const secondaryColor = themeColors?.secondary || '#666666';
  const backgroundColor = themeColors?.background || '#ffffff';
  const textColor = themeColors?.text || '#000000';

  return (
    <div 
      className="w-full min-h-screen flex flex-col justify-between p-8 print:break-after-page"
      style={{ 
        backgroundColor: customColors?.backgroundColors?.cover || backgroundColor,
        padding: spacingCustomization?.padding?.page ? `${spacingCustomization.padding.page}px` : '2rem'
      }}
    >
      {/* Header with Title */}
      <div className="flex-1 flex flex-col justify-center items-center text-center">
        {isEditMode ? (
          <input
            type="text"
            value={editableName}
            onChange={(e) => handleNameChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.currentTarget.blur()
              }
            }}
            className="text-6xl md:text-7xl lg:text-8xl font-bold tracking-wider mb-6 bg-transparent border-none outline-none text-center w-full"
            style={{ 
              color: customColors?.textColors?.title || textColor,
              fontFamily: fontCustomization?.fontFamily?.title || 'inherit',
              fontSize: fontCustomization?.fontSize?.title ? `${fontCustomization.fontSize.title}px` : 'inherit',
              marginBottom: spacingCustomization?.margin?.elements ? `${spacingCustomization.margin.elements}px` : '1.5rem'
            }}
          />
        ) : (
          <h1 
            className="text-6xl md:text-7xl lg:text-8xl font-bold tracking-wider mb-6"
            style={{ 
              color: customColors?.textColors?.title || textColor,
              fontFamily: fontCustomization?.fontFamily?.title || 'inherit',
              fontSize: fontCustomization?.fontSize?.title ? `${fontCustomization.fontSize.title}px` : 'inherit',
              marginBottom: spacingCustomization?.margin?.elements ? `${spacingCustomization.margin.elements}px` : '1.5rem'
            }}
          >
            {editableName}
          </h1>
        )}
        
        <div className="max-w-2xl mx-auto mb-8">
          {isEditMode ? (
            <textarea
              value={editableDescription}
              onChange={(e) => handleDescriptionChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.currentTarget.blur()
                }
              }}
              className="text-lg md:text-xl leading-relaxed bg-transparent border-none outline-none text-center w-full resize-none"
              style={{ 
                color: customColors?.textColors?.description || secondaryColor,
                fontFamily: fontCustomization?.fontFamily?.description || 'inherit',
                fontSize: fontCustomization?.fontSize?.description ? `${fontCustomization.fontSize.description}px` : 'inherit'
              }}
              rows={3}
            />
          ) : (
            <p 
              className="text-lg md:text-xl leading-relaxed"
              style={{ 
                color: customColors?.textColors?.description || secondaryColor,
                fontFamily: fontCustomization?.fontFamily?.description || 'inherit',
                fontSize: fontCustomization?.fontSize?.description ? `${fontCustomization.fontSize.description}px` : 'inherit'
              }}
            >
              {editableDescription}
            </p>
          )}
        </div>

        {/* Hero Image Placeholder */}
        <div className="w-full max-w-4xl mx-auto mb-8">
          <div 
            className="aspect-[4/3] rounded-lg flex items-center justify-center"
            style={{ backgroundColor: '#f5f5f5' }}
          >
            {catalogue.settings && typeof catalogue.settings === 'object' && 'mediaAssets' in catalogue.settings && 
              catalogue.settings.mediaAssets && typeof catalogue.settings.mediaAssets === 'object' && 
              'coverImageUrl' in catalogue.settings.mediaAssets ? (
              <img 
                src={(catalogue.settings.mediaAssets as any).coverImageUrl} 
                alt="Cover" 
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              <div className="text-center p-8">
                <div className="w-full h-64 bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
                  <svg className="w-16 h-16 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="text-gray-500">Product showcase image</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer with Date and Company Info */}
      <div 
        className="flex justify-between items-end"
        style={{ marginTop: spacingCustomization?.margin?.sections ? `${spacingCustomization.margin.sections}px` : '2rem' }}
      >
        <div>
          <p 
            className="text-sm font-medium"
            style={{ 
              color: customColors?.textColors?.metadata || secondaryColor,
              fontFamily: fontCustomization?.fontFamily?.description || 'inherit'
            }}
          >
            {new Date().getFullYear()}
          </p>
        </div>
        
        <div className="text-right">
          <div className="flex items-center gap-4">
            <div>
              <p 
                className="text-sm"
                style={{ 
                  color: customColors?.textColors?.metadata || secondaryColor,
                  fontFamily: fontCustomization?.fontFamily?.description || 'inherit'
                }}
              >
                {profile.website || ''}
              </p>
              <p 
                className="text-sm"
                style={{ 
                  color: customColors?.textColors?.metadata || secondaryColor,
                  fontFamily: fontCustomization?.fontFamily?.description || 'inherit'
                }}
              >
                {profile.email || ''}
              </p>
            </div>
            
            <div 
              className="text-2xl font-bold px-4 py-2 rounded"
              style={{ 
                backgroundColor: customColors?.accentColors?.primary || primaryColor, 
                color: customColors?.backgroundColors?.cover || backgroundColor,
                fontFamily: fontCustomization?.fontFamily?.companyName || 'inherit'
              }}
            >
              {profile.companyName || profile.fullName || 'Company'}
            </div>
          </div>
        </div>
      </div>

      {/* Vertical Text on Right Side */}
      <div className="absolute right-8 top-1/2 transform -translate-y-1/2 rotate-90">
        <p 
          className="text-sm font-medium tracking-widest whitespace-nowrap"
          style={{ color: secondaryColor }}
        >
          THE CATALOG 2025
        </p>
      </div>
    </div>
  );
}