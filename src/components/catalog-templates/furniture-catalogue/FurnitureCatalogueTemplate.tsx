'use client';

import React, { useMemo } from 'react';
import { Catalogue, Category, Product, Profile } from '@prisma/client';
import { CoverPage } from './components/CoverPage';
import { IntroPage } from './components/IntroPage';
import { ProductCategoryPage } from './components/ProductCategoryPage';
import { ContactPage } from './components/ContactPage';
import { ContentMapper } from '@/lib/content-schema';
import { TemplateComponentProps } from '@/lib/template-registry';
import { ColorCustomization, DEFAULT_COLORS } from './types/ColorCustomization';
import { FontCustomization, SpacingCustomization, AdvancedStyleCustomization } from '@/components/shared/StyleCustomizer'

interface FurnitureCatalogueTemplateProps {
    catalogue: Catalogue & {
        products: (Product & { category: Category | null })[]
        categories: Category[]
    }
    profile: Profile
    themeColors: {
        primary: string
        secondary: string
        accent: string
        background?: string
        text?: string
    }
    isEditMode?: boolean
    catalogueId?: string
    onProductsReorder?: (products: (Product & { category: Category | null })[]) => void
    onCatalogueUpdate?: (catalogueId: string, updates: Partial<Catalogue>) => void
    onProductUpdate?: (productId: string, updates: Partial<Product>) => void
    onContentChange?: (field: string, value: string) => void
    customColors?: ColorCustomization | any
    fontCustomization?: FontCustomization
    spacingCustomization?: SpacingCustomization
    advancedStyles?: AdvancedStyleCustomization
    smartSortEnabled?: boolean
    themeId?: string
}

export function FurnitureCatalogueTemplate({
    catalogue,
    profile,
    themeColors,
    isEditMode,
    catalogueId,
    onCatalogueUpdate,
    onProductUpdate,
    onProductsReorder,
    onContentChange,
    customColors = DEFAULT_COLORS,
    fontCustomization,
    spacingCustomization,
    advancedStyles,
    smartSortEnabled = false,
    themeId
}: FurnitureCatalogueTemplateProps) {
    // Convert raw data to standardized format
    const content = useMemo(() => {
        return ContentMapper.mapToStandardized({
            ...catalogue,
            products: catalogue.products,
            categories: catalogue.categories
        }, profile);
    }, [catalogue, profile]);

    // Create wrapper function for onCatalogueUpdate to match component expectations
    const handleCatalogueUpdate = (updates: Partial<Catalogue>) => {
        if (onCatalogueUpdate && catalogueId) {
            onCatalogueUpdate(catalogueId, updates)
        }
    }

    // Create wrapper function for onProductsReorder to match component expectations
    const handleProductsReorder = (productIds: string[]) => {
        if (onProductsReorder) {
            // Convert productIds back to products array
            const reorderedProducts = productIds.map(id =>
                catalogue.products.find(p => p.id === id)
            ).filter(Boolean) as (Product & { category: Category | null })[]
            onProductsReorder(reorderedProducts)
        }
    };

    return (
        <div
            className="furniture-catalogue-template bg-neutral-900"
            style={{
                transform: 'translateZ(0)', // Enable hardware acceleration
                backfaceVisibility: 'hidden', // Prevent flickering
                perspective: '1000px' // Enable 3D rendering context
            }}
        >
            {/* Page 1: Cover Page */}
            <CoverPage
                catalogue={catalogue}
                profile={profile}
                themeColors={themeColors}
                isEditMode={isEditMode}
                content={content}
                customColors={customColors}
                fontCustomization={fontCustomization}
                spacingCustomization={spacingCustomization}
                advancedStyles={advancedStyles}
                onContentChange={onContentChange}
            />

            {/* Page 2: Intro Page - The Details Speak Volumes */}
            <IntroPage
                catalogue={catalogue}
                profile={profile}
                themeColors={{
                    primary: themeColors.primary,
                    secondary: themeColors.secondary,
                    background: themeColors.background || '#F5F5F0',
                    text: themeColors.text || '#2C2C2C'
                }}
                isEditMode={isEditMode}
                content={content}
                customColors={customColors}
                fontCustomization={fontCustomization}
                spacingCustomization={spacingCustomization}
                advancedStyles={advancedStyles}
                onContentChange={onContentChange}
            />

            {/* Page 3: Product Category Page */}
            <ProductCategoryPage
                catalogue={catalogue}
                profile={profile}
                themeColors={themeColors}
                isEditMode={isEditMode}
                content={content}
                onProductsReorder={handleProductsReorder}
                onProductUpdate={onProductUpdate}
                onContentChange={onContentChange}
                customColors={customColors}
                fontCustomization={fontCustomization}
                spacingCustomization={spacingCustomization}
                advancedStyles={advancedStyles}
            />

            {/* Page 4: Contact Page */}
            <ContactPage
                catalogue={catalogue}
                profile={profile}
                themeColors={themeColors}
                content={content}
                onCatalogueUpdate={handleCatalogueUpdate}
                onContentChange={onContentChange}
                customColors={customColors}
                fontCustomization={fontCustomization}
                spacingCustomization={spacingCustomization}
                advancedStyles={advancedStyles}
            />
        </div>
    );
}

// Wrapper component for template registry compatibility
export function FurnitureCatalogueTemplateWrapper(props: TemplateComponentProps) {
    const { content, theme, ...otherProps } = props;

    // Extract data from standardized content
    const catalogue = {
        id: content.catalogue.id,
        title: content.catalogue.name,
        description: content.catalogue.description,
        settings: content.catalogue.settings,
        products: content.products.map(p => ({
            id: p.id,
            name: p.name,
            description: p.description,
            price: p.price,
            images: p.images,
            sku: p.sku,
            tags: p.tags,
            currency: p.currency,
            priceDisplay: p.priceDisplay,
            category: p.category ? {
                id: p.category.id,
                name: p.category.name,
                description: p.category.description,
                color: p.category.color
            } : null
        })),
        categories: content.categories.map(c => ({
            id: c.id,
            name: c.name,
            description: c.description,
            color: c.color
        }))
    } as any;

    const profile = {
        id: content.profile.id,
        companyName: content.profile.companyName,
        fullName: content.profile.fullName,
        email: content.profile.email,
        phone: content.profile.phone,
        website: content.profile.website,
        address: content.profile.address,
        logo: content.profile.logo,
        tagline: content.profile.tagline,
        socialLinks: content.profile.socialLinks
    } as any;

    const themeColors = {
        primary: theme.colors.primary,
        secondary: theme.colors.secondary,
        accent: theme.colors.accent,
        background: theme.colors.background || '#1A1A1A',
        text: typeof theme.colors.text === 'string' ? theme.colors.text : theme.colors.text?.primary || '#FFFFFF'
    };

    return (
        <FurnitureCatalogueTemplate
            catalogue={catalogue}
            profile={profile}
            themeColors={themeColors}
            {...otherProps}
        />
    );
}

export default FurnitureCatalogueTemplate;