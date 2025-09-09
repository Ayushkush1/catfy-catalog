'use client';

import React from 'react';
import { Catalogue, Profile } from '@prisma/client';
import { ColorCustomization } from '../types/ColorCustomization';

interface ContactPageProps {
  catalogue: Catalogue;
  profile: Profile;
  themeColors?: any;
  customColors?: ColorCustomization;
  fontCustomization?: any;
  spacingCustomization?: any;
  advancedStyles?: any;
  onContentChange?: (field: string, value: string) => void;
}

export function ContactPage({
  catalogue,
  profile,
  themeColors,
  customColors,
  fontCustomization,
  spacingCustomization,
  advancedStyles,
  onContentChange
}: ContactPageProps) {
  return (
    <div className="relative w-full h-screen overflow-hidden bg-gradient-to-br from-stone-100 to-pink-50">
      {/* Two column layout */}
      <div className="flex h-full">
        {/* Left side - Product image */}
        <div className="w-1/2 relative overflow-hidden flex items-center justify-center p-16">
          {/* Product arrangement */}
          <div className="relative">
            {/* Main product bottle */}
            <div className="w-48 h-72 bg-gradient-to-b from-gray-50 to-gray-100 rounded-full relative shadow-2xl">
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-16 h-8 bg-white rounded-full"></div>
              <div className="absolute top-12 left-1/2 transform -translate-x-1/2 w-12 h-6 bg-gray-200 rounded-full"></div>
            </div>

            {/* Tulips */}
            <div className="absolute -right-16 top-8">
              <div className="flex space-x-2">
                {/* Pink tulip */}
                <div className="relative">
                  <div className="w-8 h-12 bg-gradient-to-t from-pink-400 to-pink-300 rounded-t-full"></div>
                  <div className="w-2 h-16 bg-green-500 mx-auto"></div>
                  <div className="w-6 h-3 bg-green-400 absolute bottom-8 left-1 transform rotate-45 rounded-full"></div>
                </div>

                {/* Pink tulip 2 */}
                <div className="relative">
                  <div className="w-8 h-12 bg-gradient-to-t from-pink-500 to-pink-400 rounded-t-full"></div>
                  <div className="w-2 h-16 bg-green-500 mx-auto"></div>
                  <div className="w-6 h-3 bg-green-400 absolute bottom-8 right-1 transform -rotate-45 rounded-full"></div>
                </div>

                {/* Pink tulip 3 */}
                <div className="relative">
                  <div className="w-8 h-12 bg-gradient-to-t from-pink-400 to-pink-300 rounded-t-full"></div>
                  <div className="w-2 h-16 bg-green-500 mx-auto"></div>
                  <div className="w-6 h-3 bg-green-400 absolute bottom-8 left-1 transform rotate-12 rounded-full"></div>
                </div>
              </div>
            </div>

            {/* Towel */}
            <div className="absolute -left-12 bottom-8 w-32 h-20 bg-gradient-to-r from-stone-200 to-stone-300 rounded-lg shadow-lg">
              <div className="w-full h-2 bg-stone-400 mt-2 opacity-50"></div>
              <div className="w-full h-2 bg-stone-400 mt-2 opacity-30"></div>
              <div className="w-full h-2 bg-stone-400 mt-2 opacity-20"></div>
            </div>

            {/* Candle */}
            <div className="absolute -left-8 top-12 w-12 h-16 bg-gradient-to-b from-cream to-white rounded-lg shadow-md">
              <div className="w-2 h-3 bg-orange-400 mx-auto mt-1 rounded-full"></div>
              <div className="w-1 h-1 bg-orange-300 mx-auto"></div>
            </div>

            {/* Brand name at bottom */}
            <div className="absolute bottom-0 left-0 text-gray-600 text-sm font-light tracking-wider">
              LUXESKIN
            </div>
          </div>
        </div>

        {/* Right side - Contact information */}
        <div className="w-1/2 bg-black text-white flex items-center justify-center p-16">
          <div className="w-96 h-96 bg-white text-black rounded-lg flex flex-col items-center justify-center p-12 shadow-2xl">
            {/* Header */}
            <h1 className="text-2xl font-light mb-8 text-orange-500">GET IN TOUCH</h1>

            {/* Contact details */}
            <div className="text-center space-y-4 mb-8">
              <p className="text-gray-800 text-sm">
                {profile.address || '28 Serenity Avenue, Suite 120, New York, NY 10001'}
              </p>

              <p className="text-gray-800 text-sm">
                {profile.phone || '+1 (212) 555-8730'}
              </p>

              <p className="text-gray-800 text-sm">
                {profile.email || 'connect@luxeskin.com'}
              </p>

              <p className="text-gray-600 text-xs mt-4">
                Monday–Friday: 10AM–7PM | Saturday: 11AM–5PM
              </p>
            </div>

            {/* Social media icons */}
            <div className="flex space-x-4 mb-8">
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                <span className="text-orange-500 text-sm">📷</span>
              </div>
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                <span className="text-orange-500 text-sm">📘</span>
              </div>
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                <span className="text-orange-500 text-sm">📌</span>
              </div>
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                <span className="text-orange-500 text-sm">📺</span>
              </div>
            </div>

            {/* QR Code */}
            <div className="w-24 h-24 bg-black flex items-center justify-center mb-4">
              <div className="w-20 h-20 bg-white p-2">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  <rect x="0" y="0" width="20" height="20" fill="black" />
                  <rect x="10" y="10" width="10" height="10" fill="white" />
                  <rect x="80" y="0" width="20" height="20" fill="black" />
                  <rect x="90" y="10" width="10" height="10" fill="white" />
                  <rect x="0" y="80" width="20" height="20" fill="black" />
                  <rect x="10" y="90" width="10" height="10" fill="white" />
                  <rect x="40" y="40" width="20" height="20" fill="black" />
                  <rect x="45" y="45" width="10" height="10" fill="white" />

                  {/* Random pattern */}
                  <rect x="25" y="15" width="5" height="5" fill="black" />
                  <rect x="35" y="25" width="5" height="5" fill="black" />
                  <rect x="55" y="15" width="5" height="5" fill="black" />
                  <rect x="65" y="25" width="5" height="5" fill="black" />
                  <rect x="15" y="55" width="5" height="5" fill="black" />
                  <rect x="25" y="65" width="5" height="5" fill="black" />
                  <rect x="75" y="55" width="5" height="5" fill="black" />
                  <rect x="85" y="65" width="5" height="5" fill="black" />
                </svg>
              </div>
            </div>

            <p className="text-gray-600 text-xs text-center">
              SCAN TO VISIT OUR WEBSITE
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}