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
  isEditMode?: boolean;
  content: StandardizedContent;
  customColors?: ColorCustomization;
  fontCustomization?: FontCustomization;
  spacingCustomization?: SpacingCustomization;
  advancedStyles?: AdvancedStyleCustomization;
  onCatalogueUpdate?: (updates: Partial<Catalogue>) => void;
  onContentChange?: (field: string, value: string) => void;
}

export function ContactPage({
  catalogue,
  profile,
  themeColors,
  isEditMode,
  content,
  customColors,
  fontCustomization,
  spacingCustomization,
  advancedStyles,
  onCatalogueUpdate,
  onContentChange
}: ContactPageProps) {
  const primaryColor = '#d4722a';
  const textColor = '#2c1810';
  const backgroundColor = '#f5f5f0';

  // Ensure settings is parsed and has the correct shape
  const settings = typeof catalogue.settings === 'string'
    ? JSON.parse(catalogue.settings)
    : catalogue.settings;

  return (
    <div
      className="relative w-full h-screen overflow-hidden print:h-screen  flex"
      style={{ backgroundColor }}
    >
      {/* Left Side - Hero Image with Text Overlay */}
      <div className="flex-1 relative overflow-hidden">
        {content?.catalogue?.settings?.contactDetails?.contactImage ? (
          <img
            src={content.catalogue.settings.contactDetails.contactImage}
            alt="Contact"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
            <div className="text-center p-4">
              <div className="w-16 h-20 bg-gradient-to-b from-orange-200 to-orange-300 rounded-lg mx-auto mb-3 relative shadow-md">
                <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white rounded-full opacity-80"></div>
                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-center">
                  <div className="text-orange-800 text-xs font-medium">FMCG</div>
                </div>
              </div>
              <div className="text-gray-600 text-xs">Product Image</div>
            </div>
          </div>
        )}

        {/* Light overlay for text readability */}
        <div className="absolute inset-0 bg-black bg-opacity-50" />
        {/* Modern Text Overlay - Two Content Paragraphs, styled beautifully */}
        <div className="absolute bottom-0 left-0 p-16">
          <div className="relative flex items-start">
            {/* Vertical Accent Bar */}
            <div
              className="absolute -left-6 top-0 h-full w-1.5 rounded-full shadow-lg"
              style={{ background: `linear-gradient(180deg, ${primaryColor} 60%, #fff0 100%)` }}
            />
            <div className="pl-10">
              {/* First Paragraph */}
              <p
                className="text-white text-opacity-95 text-xl font-medium mb-3 max-w-md leading-snug drop-shadow-lg"
                style={{
                  fontFamily: fontCustomization?.fontFamily?.description || 'sans-serif',
                  letterSpacing: '0.01em'
                }}
              >
                {content.catalogue?.settings?.contactDetails?.para1 ||
                  "Crafting tomorrow's consumer experiences through premium quality and innovative solutions."}
              </p>
              
              {/* Second Paragraph */}
              <p
                className="text-white text-opacity-80 text-sm max-w-md leading-relaxed italic"
                style={{
                  fontFamily: fontCustomization?.fontFamily?.description || 'sans-serif'
                }}
              >
                {content.catalogue?.settings?.contactDetails?.para2 ||
                  "Contact us to discover how we can help your brand excel in the FMCG world."}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Contact Information */}
      <div className="w-1/2 bg-white p-16 flex flex-col">
        <div className="h-full flex flex-col">
          <h1
            className="text-4xl font-bold  tracking-wider"
            style={{
              fontFamily: fontCustomization?.fontFamily?.title || 'serif',
              color: textColor
            }}
          >
            CONTACT US
          </h1>

          <p
            className="text-md mb-4"
            style={{
              color: '#6b5b4a',
              fontFamily: fontCustomization?.fontFamily?.description || 'sans-serif'
            }}
          >
            We're here to assist you
          </p>

         

          {/* Contact Information */}
          <div className="space-y-4 flex-1">
            {/* Customer Service */}
            <div>
              <h3
                className="text-lg font-semibold mb-2"
                style={{ color: textColor }}
              >
                Customer Service
              </h3>
              <p className="mb-2 text-sm" style={{ color: '#5a4a3a' }}>
                {content.profile.phone || '+1 (800) 555-7890'}
              </p>
              <p className="text-sm" style={{ color: '#8a7a6a' }}>
                Monday to Friday: 9am - 6pm EST
              </p>
              <p className="text-sm" style={{ color: '#8a7a6a' }}>
                Saturday: 10am - 4pm EST
              </p>
            </div>

            {/* Email Inquiries */}
            <div>
              <h3
                className="text-lg font-semibold mb-2"
                style={{ color: textColor }}
              >
                Email Inquiries
              </h3>
              <p className="mb-2 text-sm" style={{ color: '#5a4a3a' }}>
                {content.profile.email || 'customer.care@luxuryfmcg.com'}
              </p>

            </div>

            {/* Corporate Office */}
            <div>
              <h3
                className="text-lg font-semibold mb-2"
                style={{ color: textColor }}
              >
                Corporate Office
              </h3>
              <p className="text-sm" style={{ color: '#5a4a3a' }}>
                {content.profile.address || '123 Luxury Avenue'}
              </p>

            </div>

            {/* Social Media */}
            <div>
              <h3
                className="text-xl font-semibold mb-6"
                style={{ color: textColor }}
              >
                Social Media
              </h3>
              <div className="flex space-x-4">
                {/* Twitter */}
                <div className="w-12 h-12 rounded-full border-2 flex items-center justify-center hover:border-orange-600 transition-colors cursor-pointer" style={{ borderColor: primaryColor }}>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" style={{ color: primaryColor }}>
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                  </svg>
                </div>
                {/* Instagram */}
                <div className="w-12 h-12 rounded-full border-2 flex items-center justify-center hover:border-orange-600 transition-colors cursor-pointer" style={{ borderColor: primaryColor }}>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" style={{ color: primaryColor }}>
                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987s11.987-5.367 11.987-11.987C24.004 5.367 18.637.001 12.017.001zM8.449 16.988c-2.51 0-4.551-2.041-4.551-4.551s2.041-4.551 4.551-4.551 4.551 2.041 4.551 4.551-2.041 4.551-4.551 4.551zm7.718 0c-2.51 0-4.551-2.041-4.551-4.551s2.041-4.551 4.551-4.551 4.551 2.041 4.551 4.551-2.041 4.551-4.551 4.551z" />
                  </svg>
                </div>
                {/* LinkedIn */}
                <div className="w-12 h-12 rounded-full border-2 flex items-center justify-center hover:border-orange-600 transition-colors cursor-pointer" style={{ borderColor: primaryColor }}>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" style={{ color: primaryColor }}>
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </div>
                {/* Facebook */}
                <div className="w-12 h-12 rounded-full border-2 flex items-center justify-center hover:border-orange-600 transition-colors cursor-pointer" style={{ borderColor: primaryColor }}>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" style={{ color: primaryColor }}>
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* QR Code section at bottom */}
          <div className="mt-auto pt-12">
            <p
              className="text-sm tracking-wider mb-4"
              style={{ color: '#8a7a6a' }}
            >
              Discover our heritage
            </p>
            <div className="w-20 h-20 border-2 flex items-center justify-center" style={{ borderColor: primaryColor }}>
              {/* Simple QR code pattern */}
              <div className="grid grid-cols-5 gap-px w-16 h-16">
                {[...Array(25)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-full h-full ${[0, 1, 2, 3, 4, 5, 9, 10, 14, 15, 19, 20, 21, 22, 23, 24].includes(i)
                      ? 'bg-orange-600'
                      : Math.random() > 0.6
                        ? 'bg-orange-600'
                        : 'bg-transparent'
                      }`}
                    style={{ backgroundColor: [0, 1, 2, 3, 4, 5, 9, 10, 14, 15, 19, 20, 21, 22, 23, 24].includes(i) || Math.random() > 0.6 ? primaryColor : 'transparent' }}
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