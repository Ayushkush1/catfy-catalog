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
}

export function ContactPage({ 
  catalogue, 
  profile, 
  themeColors, 
  content,
  customColors,
  fontCustomization,
  spacingCustomization,
  advancedStyles
}: ContactPageProps) {
  const primaryColor = themeColors?.primary || '#000000';
  const secondaryColor = themeColors?.secondary || '#666666';
  const backgroundColor = themeColors?.background || '#ffffff';
  const textColor = themeColors?.text || '#000000';

  return (
    <div 
      className="w-full min-h-screen p-8 print:break-after-page relative overflow-hidden"
      style={{ backgroundColor }}
    >
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-32 h-32 opacity-10">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <path d="M20,20 Q50,5 80,20 Q95,50 80,80 Q50,95 20,80 Q5,50 20,20" fill={primaryColor} />
        </svg>
      </div>
      
      <div className="absolute bottom-0 right-0 w-40 h-40 opacity-10">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <path d="M10,50 Q30,10 50,30 Q70,10 90,50 Q70,90 50,70 Q30,90 10,50" fill={primaryColor} />
        </svg>
      </div>

      <div className="absolute top-1/4 right-1/4 w-24 h-24 opacity-5">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <circle cx="50" cy="50" r="40" fill={primaryColor} />
        </svg>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 
            className="text-5xl md:text-6xl font-bold mb-6"
            style={{ color: textColor }}
          >
            Contact Us
          </h1>
          
          <p 
            className="text-xl max-w-2xl mx-auto leading-relaxed"
            style={{ color: secondaryColor }}
          >
            {content.catalogue.settings?.contactDescription || 'Get in touch with us for more information about our products'}
          </p>
        </div>

        {/* Contact Information Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
          {/* Contact Details */}
          <div className="space-y-8">
            <div>
              <h2 
                className="text-2xl font-bold mb-4"
                style={{ color: textColor }}
              >
                Get In Touch
              </h2>
              
              <div className="space-y-4">
                {profile.email && (
                  <div className="flex items-center space-x-3">
                    <svg className="w-5 h-5" style={{ color: primaryColor }} fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                    <span style={{ color: secondaryColor }}>{profile.email}</span>
                  </div>
                )}
                
                {profile.phone && (
                  <div className="flex items-center space-x-3">
                    <svg className="w-5 h-5" style={{ color: primaryColor }} fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                    </svg>
                    <span style={{ color: secondaryColor }}>{profile.phone}</span>
                  </div>
                )}
                
                {profile.website && (
                  <div className="flex items-center space-x-3">
                    <svg className="w-5 h-5" style={{ color: primaryColor }} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.083 9h1.946c.089-1.546.383-2.97.837-4.118A6.004 6.004 0 004.083 9zM10 2a8 8 0 100 16 8 8 0 000-16zm0 2c-.076 0-.232.032-.465.262-.238.234-.497.623-.737 1.182-.389.907-.673 2.142-.766 3.556h3.936c-.093-1.414-.377-2.649-.766-3.556-.24-.56-.5-.948-.737-1.182C10.232 4.032 10.076 4 10 4zm3.971 5c-.089-1.546-.383-2.97-.837-4.118A6.004 6.004 0 0115.917 9h-1.946zm-2.003 2H8.032c.093 1.414.377 2.649.766 3.556.24.56.5.948.737 1.182.233.23.389.262.465.262.076 0 .232-.032.465-.262.238-.234.498-.623.737-1.182.389-.907.673-2.142.766-3.556zm1.166 4.118c.454-1.147.748-2.572.837-4.118h1.946a6.004 6.004 0 01-2.783 4.118zm-6.268 0C6.412 13.97 6.118 12.546 6.03 11H4.083a6.004 6.004 0 002.783 4.118z" clipRule="evenodd" />
                    </svg>
                    <span style={{ color: secondaryColor }}>{profile.website}</span>
                  </div>
                )}
                
                {profile.address && (
                  <div className="flex items-start space-x-3">
                    <svg className="w-5 h-5 mt-1" style={{ color: primaryColor }} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    <span style={{ color: secondaryColor }}>{profile.address}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Company Information */}
          <div className="space-y-8">
            <div>
              <h2 
                className="text-2xl font-bold mb-4"
                style={{ color: textColor }}
              >
                Our Store
              </h2>
              
              <div className="space-y-4">
                <p 
                  className="text-base leading-relaxed mb-6"
                  style={{ color: secondaryColor }}
                >
                  {content.catalogue.settings?.storeDescription || 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation.'}
                </p>
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <svg className="w-5 h-5" style={{ color: primaryColor }} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span style={{ color: secondaryColor }}>Premium Quality Products</span>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <svg className="w-5 h-5" style={{ color: primaryColor }} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span style={{ color: secondaryColor }}>Expert Customer Service</span>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <svg className="w-5 h-5" style={{ color: primaryColor }} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span style={{ color: secondaryColor }}>Fast & Reliable Delivery</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center pt-8 border-t border-gray-200">
          <div 
            className="text-3xl font-bold mb-4"
            style={{ color: primaryColor }}
          >
            {profile.companyName || profile.fullName || 'Company'}
          </div>
          
          <div className="flex justify-center space-x-8 text-sm" style={{ color: secondaryColor }}>
            {profile.website && <span>{profile.website}</span>}
            {profile.email && <span>{profile.email}</span>}
            {profile.phone && <span>{profile.phone}</span>}
          </div>
          
          <p 
            className="text-sm mt-4"
            style={{ color: secondaryColor }}
          >
            Page 4 of 4
          </p>
        </div>
      </div>
    </div>
  );
}