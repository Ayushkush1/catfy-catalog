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
    onCatalogueUpdate?: (updates: Partial<Catalogue>) => void;
    onContentChange?: (field: string, value: string) => void;
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
    onCatalogueUpdate,
    onContentChange,
    customColors,
    fontCustomization,
    spacingCustomization,
    advancedStyles
}: ContactPageProps) {

    return (
        <div className="relative w-full h-screen overflow-hidden print:h-screen print:m-0 print:p-0 bg-neutral-50">

            {/* Main content container */}
            <div className="flex h-full print:h-screen">

                {/* Left side - Contact Image with Quote Overlay */}
                <div className="w-1/2 relative overflow-hidden">
                    {/* Contact Image */}
                    <div className="absolute inset-0 bg-gray-100">
                        {content?.catalogue?.settings?.contactDetails?.contactImage ? (
                            <img
                                src={content.catalogue.settings.contactDetails.contactImage}
                                alt="Contact"
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            /* Elegant placeholder matching furniture theme */
                            <div className="w-full h-full bg-gradient-to-br from-amber-100 via-orange-50 to-neutral-100 flex items-center justify-center">
                                <div className="text-center">
                                    {/* Sophisticated furniture workshop illustration */}
                                    <div className="w-64 h-64 mx-auto mb-8 relative">
                                        {/* Workshop table */}
                                        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 w-48 h-3 bg-amber-800 rounded-full shadow-lg"></div>
                                        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 w-44 h-2 bg-amber-900 rounded-full"></div>

                                        {/* Tools and furniture pieces */}
                                        <div className="absolute top-12 left-16 w-8 h-16 bg-orange-600 rounded transform rotate-12 shadow-md"></div>
                                        <div className="absolute top-20 left-32 w-12 h-12 bg-amber-700 rounded-lg transform -rotate-6 shadow-md"></div>
                                        <div className="absolute top-16 right-20 w-6 h-20 bg-orange-700 rounded transform rotate-45 shadow-md"></div>
                                        <div className="absolute top-24 right-12 w-10 h-10 bg-amber-600 rounded-full shadow-md"></div>

                                        {/* Wood shavings effect */}
                                        <div className="absolute bottom-12 left-20 w-2 h-1 bg-amber-300 rounded-full transform rotate-45"></div>
                                        <div className="absolute bottom-14 left-28 w-1 h-2 bg-orange-300 rounded-full transform -rotate-12"></div>
                                        <div className="absolute bottom-10 right-24 w-1 h-1 bg-amber-400 rounded-full"></div>
                                    </div>
                                    <p className="text-neutral-500 text-sm font-light tracking-wide">CRAFTSMANSHIP STUDIO</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Elegant overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-black/20 via-transparent to-black/10" />

                    {/* Quote Overlay */}
                    {(content?.catalogue?.settings?.contactDetails?.contactQuote || content?.catalogue?.settings?.contactDetails?.contactQuoteBy) && (
                        <div className="absolute inset-0 flex items-center justify-center p-12">
                            <div className="bg-white/10 backdrop-blur-md p-8 rounded-2xl max-w-md text-center shadow-2xl border border-white/20">
                                <blockquote
                                    className="text-sm italic mb-4 text-black/60 leading-tight"
                                    style={{
                                        fontFamily: fontCustomization?.fontFamily?.title || 'serif',
                                        fontSize: fontCustomization?.fontSize?.title ? `${fontCustomization.fontSize.title * 0.4}px` : 'inherit'
                                    }}
                                >
                                    "{content?.catalogue?.settings?.contactDetails?.contactQuote || 'Where creativity meets craftsmanship in every piece we create'}"
                                </blockquote>
                                <cite
                                    className="text-xs tracking-wider uppercase text-orange-600 font-medium"
                                    style={{
                                        fontFamily: fontCustomization?.fontFamily?.description || 'Arial, sans-serif'
                                    }}
                                >
                                    {content?.catalogue?.settings?.contactDetails?.contactQuoteBy || profile.companyName || 'AURUM FURNITURE'}
                                </cite>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Side - Contact Information */}
                <div className="w-1/2 flex flex-col justify-center px-16 py-12 print:px-0 print:py-0 print:p-8 bg-white">

                    {/* Contact Header */}
                    <div className="text-center mb-12">
                        <h1
                            className="text-3xl font-light mb-4 text-gray-900 tracking-wide"
                            style={{
                                fontFamily: fontCustomization?.fontFamily?.title || 'serif',
                                fontSize: fontCustomization?.fontSize?.title ? `${fontCustomization.fontSize.title * 1.2}px` : 'inherit'
                            }}
                        >
                            CONTACT
                        </h1>
                        <div className="w-16 h-0.5 bg-orange-500 mx-auto"></div>
                    </div>

                    {/* Contact Details */}
                    <div className="space-y-8 text-center max-w-sm mx-auto">



                        {/* Address */}
                        <div>
                            <h3 className="text-sm font-medium mb-2 tracking-widest uppercase text-gray-600">
                                ADDRESS
                            </h3>
                            <p
                                className="text-sm leading-relaxed text-gray-800"
                                style={{
                                    fontFamily: fontCustomization?.fontFamily?.description || 'Arial, sans-serif'
                                }}
                            >
                                {profile.address || content.profile.address || content.catalogue?.settings?.contactDetails?.address || 'Contact us for our address'}
                                {(profile.city || content.profile.city || content.catalogue?.settings?.contactDetails?.city) && (
                                    <><br />{profile.city || content.profile.city || content.catalogue?.settings?.contactDetails?.city}</>
                                )}
                                {(profile.state || content.profile.state || content.catalogue?.settings?.contactDetails?.state) && (
                                    <>, {profile.state || content.profile.state || content.catalogue?.settings?.contactDetails?.state}</>
                                )}
                                {(profile.country || content.profile.country || content.catalogue?.settings?.contactDetails?.country) && (
                                    <><br />{profile.country || content.profile.country || content.catalogue?.settings?.contactDetails?.country}</>
                                )}
                            </p>
                        </div>

                        {/* Phone */}
                        <div>
                            <h3 className="text-sm font-medium mb-2 tracking-widest uppercase text-gray-600">
                                TELEPHONE
                            </h3>
                            <p
                                className="text-sm text-gray-800"
                                style={{
                                    fontFamily: fontCustomization?.fontFamily?.description || 'Arial, sans-serif'
                                }}
                            >
                                {profile.phone || content.profile.phone || content.catalogue?.settings?.contactDetails?.phone || 'Contact us for phone number'}
                            </p>
                        </div>

                        {/* Email - Always show */}
                        <div>
                            <h3 className="text-sm font-medium mb-2 tracking-widest uppercase text-gray-600">
                                EMAIL
                            </h3>
                            <p
                                className="text-sm text-gray-800"
                                style={{
                                    fontFamily: fontCustomization?.fontFamily?.description || 'Arial, sans-serif'
                                }}
                            >
                                {profile.email || content.profile.email || content.catalogue?.settings?.contactDetails?.email || 'info@company.com'}
                            </p>
                        </div>

                        {/* Website */}
                        <div>
                            <h3 className="text-sm font-medium mb-2 tracking-widest uppercase text-gray-600">
                                WEBSITE
                            </h3>
                            <p
                                className="text-sm text-gray-800"
                                style={{
                                    fontFamily: fontCustomization?.fontFamily?.description || 'Arial, sans-serif'
                                }}
                            >
                                {profile.website || content.profile.website || content.catalogue?.settings?.contactDetails?.website || 'www.company.com'}
                            </p>
                        </div>
                    </div>

                    {/* Social Media Icons */}
                    <div className="flex justify-center space-x-4 mt-12">
                        {content?.catalogue?.settings?.socialMedia?.instagram && (
                            <a
                                href={content.catalogue.settings.socialMedia.instagram}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-orange-600 transition-colors duration-300"
                            >
                                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                                </svg>
                            </a>
                        )}

                        {content?.catalogue?.settings?.socialMedia?.facebook && (
                            <a
                                href={content.catalogue.settings.socialMedia.facebook}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-orange-600 transition-colors duration-300"
                            >
                                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                </svg>
                            </a>
                        )}

                        {content?.catalogue?.settings?.socialMedia?.twitter && (
                            <a
                                href={content.catalogue.settings.socialMedia.twitter}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-orange-600 transition-colors duration-300"
                            >
                                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                                </svg>
                            </a>
                        )}

                        {/* Default placeholder icons if no social media configured */}
                        {!content?.catalogue?.settings?.socialMedia && (
                            <>
                                <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-orange-600 transition-colors duration-300 cursor-pointer">
                                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                    </svg>
                                </div>
                                <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-orange-600 transition-colors duration-300 cursor-pointer">
                                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.40z" />
                                    </svg>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
            {/* Footer */}
            <div className="absolute bottom-0 left-0 right-0 bg-white px-16 py-4 print:px-8 print:py-2 border-t border-neutral-100">
                <div className="flex justify-between items-center">
                    <span
                        className="text-neutral-400 text-sm"
                        style={{
                            fontFamily: fontCustomization?.fontFamily?.description || 'Arial, sans-serif'
                        }}
                    >
                        {content.profile?.companyName || profile.companyName || (catalogue?.settings as any)?.companyInfo?.companyName || 'AURUM'}

                    </span>
                    <span
                        className="text-neutral-400 text-sm"
                        style={{
                            fontFamily: fontCustomization?.fontFamily?.description || 'Arial, sans-serif'
                        }}
                    >
                        © 2025 All rights reserved
                    </span>
                </div>
            </div>

        </div>
    );
}