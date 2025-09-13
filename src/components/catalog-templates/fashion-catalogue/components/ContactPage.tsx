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
  content,
  customColors,
  fontCustomization,
  spacingCustomization,
  advancedStyles,
  onCatalogueUpdate,
  onContentChange
}: ContactPageProps) {
  const primaryColor = themeColors?.primary || '#000000';
  const secondaryColor = themeColors?.secondary || '#666666';
  const backgroundColor = themeColors?.background || '#ffffff';
  const textColor = themeColors?.text || '#000000';

  return (
    <div className="relative w-full h-screen overflow-hidden print:h-screen bg-white">
      {/* Two Column Layout */}
      <div className="flex h-full">
        {/* Left Side - Atelier Windows Grid */}
        <div className="w-1/2 relative overflow-hidden bg-gray-100">
          {/* Image Section */}
          <div className="h-full w-full relative overflow-hidden">
            {content?.catalogue?.settings?.contactDetails?.contactImage ? (
              <img
                src={content.catalogue.settings.contactDetails.contactImage}
                alt="Contact"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <div className="text-center p-8">
                  <svg className="w-40 h-40 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-gray-500 text-sm">No image uploaded</p>
                </div>
              </div>
            )}
            {/* Image Overlay Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-black/10 to-transparent" />
          </div>

          {/* Quote Overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-white/90 backdrop-blur-sm p-8 rounded-lg max-w-sm text-center shadow-lg">
              <blockquote className="text-lg italic mb-4 text-gray-800" style={{ fontFamily: 'serif' }}>
                "{content?.catalogue?.settings?.contactDetails?.contactQuote || 'Where creativity meets craftsmanship'}"
              </blockquote>
              <cite className="text-sm tracking-wider uppercase text-gray-600 font-light">
                {content?.catalogue?.settings?.contactDetails?.contactQuoteBy || 'VERITE ATELIER'}
              </cite>
            </div>
          </div>
        </div>

        {/* Right Side - Contact Information */}
        <div className="w-1/2 flex flex-col items-center justify-center px-16 py-12 bg-gray-50">
          {/* Contact Title */}
          <h1 className="text-4xl text-center font-light mb-12 text-gray-900 tracking-wide" style={{ fontFamily: 'serif' }}>
            CONTACT
          </h1>

          {/* Contact Details */}
          <div className="space-y-4 text-center mb-12">
            {/* Address */}
            <div>
              <h3 className="text-sm font-medium mb-1 tracking-widest uppercase text-gray-600">
                ADDRESS
              </h3>
              <p className="text-sm text-center leading-relaxed text-gray-800">
                {profile.address || '123 Fashion District\nParis, France 75001'}
              </p>
            </div>

            {/* Phone */}
            <div>
              <h3 className="text-sm font-medium mb-1 tracking-widest uppercase text-gray-600">
                TELEPHONE
              </h3>
              <p className="text-sm text-gray-800">
                {profile.phone || '+33 1 42 86 87 88'}
              </p>
            </div>

            {/* Email */}
            <div>
              <h3 className="text-sm font-medium mb-1 tracking-widest uppercase text-gray-600">
                Email
              </h3>
              <p className="text-sm text-gray-800">
                {profile.email || 'contact@verite.fr'}
              </p>
            </div>

            {/* Website */}
            {profile.website && (
              <div>
                <h3 className="text-sm font-medium mb-1 tracking-widest uppercase text-gray-600">
                  WEBSITE
                </h3>
                <p className="text-sm text-gray-800">
                  {profile.website}
                </p>
              </div>
            )}


          </div>

          {/* Social Media Icons */}
          <div className="flex space-x-4 mb-8">
            {/* Instagram */}
            {content?.catalogue?.settings?.socialMedia?.instagram && (
              <a
                href={content.catalogue.settings.socialMedia.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors"
              >
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </a>
            )}

            {/* Facebook */}
            {content?.catalogue?.settings?.socialMedia?.facebook && (
              <a
                href={content.catalogue.settings.socialMedia.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors"
              >
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </a>
            )}

            {/* LinkedIn */}
            {content?.catalogue?.settings?.socialMedia?.linkedin && (
              <a
                href={content.catalogue.settings.socialMedia.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors"
              >
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </a>
            )}

            {/* Twitter/X */}
            {content?.catalogue?.settings?.socialMedia?.twitter && (
              <a
                href={content.catalogue.settings.socialMedia.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors"
              >
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
            )}
          </div>

          {/* QR Code */}
          <div className="text-center">
            <div className="w-20 h-20 bg-white mx-auto mb-4 rounded-lg flex items-center justify-center shadow-md border border-gray-200">
              {/* QR Code Pattern */}
              <svg className="w-16 h-16" viewBox="0 0 100 100">
                <rect x="0" y="0" width="100" height="100" fill="white" />
                {/* QR Code pattern - simplified */}
                <rect x="10" y="10" width="15" height="15" fill="black" />
                <rect x="75" y="10" width="15" height="15" fill="black" />
                <rect x="10" y="75" width="15" height="15" fill="black" />
                <rect x="30" y="30" width="5" height="5" fill="black" />
                <rect x="40" y="20" width="5" height="5" fill="black" />
                <rect x="50" y="30" width="5" height="5" fill="black" />
                <rect x="60" y="40" width="5" height="5" fill="black" />
                <rect x="70" y="50" width="5" height="5" fill="black" />
                <rect x="30" y="60" width="5" height="5" fill="black" />
                <rect x="45" y="70" width="5" height="5" fill="black" />
                <rect x="65" y="65" width="5" height="5" fill="black" />
                <rect x="80" y="80" width="5" height="5" fill="black" />
              </svg>
            </div>
            <p className="text-xs text-gray-500 tracking-wide uppercase">
              SCAN FOR DIGITAL CATALOGUE
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}