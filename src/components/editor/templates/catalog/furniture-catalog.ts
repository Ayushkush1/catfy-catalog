import { Template } from '../types'
import {
  createTemplate,
  createContainer,
  createHeading,
  createText,
  createImage,
  createButton,
  createGrid,
} from '../utils/template-builder'

export interface Page {
  id: string
  name: string
  thumbnail?: string
  data: string // JSON serialized data
}

/**
 * 4-Page Furniture Catalog Template
 * Pages: 1. Cover Page, 2. Intro Page, 3. Product Page, 4. Contact Page
 */
export const furnitureCatalogTemplate: Template = createTemplate()
  .setId('furniture-catalog')
  .setName('Furniture Catalog')
  .setDescription(
    'A 4-page furniture catalog: Cover, Intro, Products, and Contact pages'
  )
  .setCategory('catalog')
  .addTags('furniture', 'catalog', 'modern', 'products', 'showcase', '4-page')
  .setPageCount(4)
  .setMultiPageData([
    // PAGE 1: COVER PAGE
    {
      id: 'cover-page',
      name: 'Cover Page',
      data: JSON.stringify({
        ROOT: {
          ...createContainer(
            'ROOT',
            {
              padding: 0,
              backgroundColor: '#2a2a2a',
              minHeight: '100vh',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              color: '#ffffff',
            },
            'Cover Page',
            ['cover-header', 'cover-main-layout', 'cover-footer']
          ),
        },
        'cover-header': {
          ...createContainer(
            'cover-header',
            {
              width: '100%',
              padding: '40px 60px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              zIndex: 10,
            },
            'Cover Header',
            ['cover-brand', 'cover-year'],
            'ROOT'
          ),
        },
        'cover-brand': {
          ...createText(
            'SMELLADDA',
            {
              fontSize: 14,
              fontWeight: '400',
              color: '#ffffff',
              letterSpacing: '2px',
            },
            'Cover Brand',
            'cover-header'
          ),
        },
        'cover-year': {
          ...createText(
            'CATALOGUE 2025',
            {
              fontSize: 14,
              fontWeight: '400',
              color: '#ffffff',
              letterSpacing: '2px',
            },
            'Cover Year',
            'cover-header'
          ),
        },
        'cover-main-layout': {
          ...createContainer(
            'cover-main-layout',
            {
              display: 'flex',
              width: '100%',
              flex: 1,
              position: 'relative',
            },
            'Cover Main Layout',
            [
              'cover-left-section',
              'cover-orange-accent',
              'cover-right-section',
            ],
            'ROOT'
          ),
        },
        'cover-left-section': {
          ...createContainer(
            'cover-left-section',
            {
              flex: '1',
              padding: '80px 60px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              backgroundColor: '#2a2a2a',
            },
            'Cover Left Section',
            ['cover-title', 'cover-subtitle', 'cover-cta'],
            'cover-main-layout'
          ),
        },
        'cover-title': {
          ...createHeading(
            'CRAFTED\nEXCELLENCE',
            1,
            {
              fontSize: 64,
              fontWeight: 'bold',
              color: '#ffffff',
              lineHeight: 0.85,
              marginBottom: 40,
              letterSpacing: '-0.02em',
            },
            'Cover Title',
            'cover-left-section'
          ),
        },
        'cover-subtitle': {
          ...createContainer(
            'cover-subtitle',
            {
              border: '1px solid #ffffff',
              padding: '20px',
              marginBottom: 40,
              maxWidth: '400px',
            },
            'Cover Subtitle',
            ['subtitle-label', 'subtitle-text'],
            'cover-left-section'
          ),
        },
        'subtitle-label': {
          ...createText(
            'CATALOG',
            {
              fontSize: 14,
              fontWeight: '600',
              color: '#ffffff',
              marginBottom: 8,
              letterSpacing: '2px',
            },
            'Subtitle Label',
            'cover-subtitle'
          ),
        },
        'subtitle-text': {
          ...createText(
            'Premium selections for the discerning palate',
            {
              fontSize: 16,
              color: '#cccccc',
              lineHeight: 1.4,
            },
            'Subtitle Text',
            'cover-subtitle'
          ),
        },
        'cover-cta': {
          ...createButton(
            'EXPLORE COLLECTION →',
            {
              backgroundColor: 'transparent',
              color: '#ffffff',
              border: '1px solid #ffffff',
              padding: '12px 24px',
              fontSize: 14,
              fontWeight: '500',
              letterSpacing: '1px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              alignSelf: 'flex-start',
            },
            'Cover CTA',
            'cover-left-section'
          ),
        },
        'cover-orange-accent': {
          ...createContainer(
            'cover-orange-accent',
            {
              width: '120px',
              backgroundColor: '#ff6b35',
              position: 'relative',
              zIndex: 5,
            },
            'Cover Orange Accent',
            [],
            'cover-main-layout'
          ),
        },
        'cover-right-section': {
          ...createContainer(
            'cover-right-section',
            {
              flex: '1',
              position: 'relative',
              backgroundColor: '#2a2a2a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            },
            'Cover Right Section',
            ['cover-image-container'],
            'cover-main-layout'
          ),
        },
        'cover-image-container': {
          ...createContainer(
            'cover-image-container',
            {
              position: 'relative',
              width: '80%',
              height: '80%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            },
            'Cover Image Container',
            ['cover-chair-image', 'new-arrivals-badge'],
            'cover-right-section'
          ),
        },
        'cover-chair-image': {
          ...createImage(
            'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&h=600&fit=crop&crop=center',
            'Orange Modern Chair',
            {
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              borderRadius: '8px',
            },
            'Cover Chair Image',
            'cover-image-container'
          ),
        },
        'new-arrivals-badge': {
          ...createContainer(
            'new-arrivals-badge',
            {
              position: 'absolute',
              bottom: 20,
              right: 20,
              backgroundColor: '#ff6b35',
              color: '#ffffff',
              padding: '8px 16px',
              fontSize: 12,
              fontWeight: '600',
              letterSpacing: '1px',
              zIndex: 10,
            },
            'New Arrivals Badge',
            ['badge-text'],
            'cover-image-container'
          ),
        },
        'badge-text': {
          ...createText(
            'NEW ARRIVALS',
            {
              fontSize: 12,
              fontWeight: '600',
              color: '#ffffff',
            },
            'Badge Text',
            'new-arrivals-badge'
          ),
        },
        'cover-footer': {
          ...createContainer(
            'cover-footer',
            {
              width: '100%',
              padding: '40px 60px',
              textAlign: 'center',
              backgroundColor: '#2a2a2a',
            },
            'Cover Footer',
            ['cover-tagline'],
            'ROOT'
          ),
        },
        'cover-tagline': {
          ...createText(
            'PREMIUM QUALITY • SUSTAINABLE MATERIALS • TIMELESS DESIGN',
            {
              fontSize: 12,
              color: '#888888',
              letterSpacing: '2px',
            },
            'Cover Tagline',
            'cover-footer'
          ),
        },
      }),
    },

    // PAGE 2: INTRO PAGE
    {
      id: 'intro-page',
      name: 'Intro Page',
      data: JSON.stringify({
        ROOT: {
          ...createContainer(
            'ROOT',
            {
              padding: 0,
              backgroundColor: '#ffffff',
              minHeight: '100vh',
              display: 'flex',
            },
            'Intro Page',
            ['intro-image-section', 'intro-content-section']
          ),
        },
        'intro-image-section': {
          ...createContainer(
            'intro-image-section',
            {
              flex: '1',
              minHeight: '100vh',
              position: 'relative',
              overflow: 'hidden',
            },
            'Intro Image Section',
            ['intro-background-image'],
            'ROOT'
          ),
        },
        'intro-background-image': {
          ...createImage(
            'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&h=1200&fit=crop&crop=center',
            'Modern Interior Living Room',
            {
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            },
            'Intro Background Image',
            'intro-image-section'
          ),
        },
        'intro-content-section': {
          ...createContainer(
            'intro-content-section',
            {
              flex: '1',
              backgroundColor: '#f8f8f8',
              padding: '80px 60px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            },
            'Intro Content Section',
            ['intro-title', 'intro-description', 'intro-brand-section'],
            'ROOT'
          ),
        },
        'intro-title': {
          ...createHeading(
            'Crafted Excellence',
            1,
            {
              fontSize: 48,
              fontWeight: 'bold',
              color: '#2c3e50',
              marginBottom: 40,
              lineHeight: 1.2,
            },
            'Intro Title',
            'intro-content-section'
          ),
        },
        'intro-description': {
          ...createText(
            "At the heart of our philosophy lies a profound commitment to purity and effectiveness. Our promise to you extends beyond skincare—it's a pledge to enhance your wellbeing through rituals that nurture both skin and spirit. We create products that not only transform your complexion but elevate your daily self-care practice into moments of genuine tranquility and renewal.",
            {
              fontSize: 16,
              color: '#666666',
              lineHeight: 1.8,
              marginBottom: 60,
            },
            'Intro Description',
            'intro-content-section'
          ),
        },
        'intro-brand-section': {
          ...createContainer(
            'intro-brand-section',
            {
              borderTop: '1px solid #e0e0e0',
              paddingTop: 40,
            },
            'Intro Brand Section',
            ['intro-brand-name', 'intro-brand-tagline'],
            'intro-content-section'
          ),
        },
        'intro-brand-name': {
          ...createText(
            'SMELLADDA',
            {
              fontSize: 18,
              fontWeight: '600',
              color: '#2c3e50',
              marginBottom: 8,
              letterSpacing: '2px',
            },
            'Intro Brand Name',
            'intro-brand-section'
          ),
        },
        'intro-brand-tagline': {
          ...createText(
            'Premium selections for the discerning palate',
            {
              fontSize: 14,
              color: '#888888',
              letterSpacing: '1px',
            },
            'Intro Brand Tagline',
            'intro-brand-section'
          ),
        },
      }),
    },

    // PAGE 3: PRODUCT PAGE
    {
      id: 'product-page',
      name: 'Product Page',
      data: JSON.stringify({
        ROOT: {
          ...createContainer(
            'ROOT',
            {
              padding: '60px',
              backgroundColor: '#ffffff',
              minHeight: '100vh',
            },
            'Product Page',
            ['product-header', 'product-grid', 'product-footer']
          ),
        },
        'product-header': {
          ...createContainer(
            'product-header',
            {
              marginBottom: 60,
              textAlign: 'center',
            },
            'Product Header',
            ['product-page-title', 'product-page-number'],
            'ROOT'
          ),
        },
        'product-page-title': {
          ...createHeading(
            'SmellAdda',
            1,
            {
              fontSize: 36,
              fontWeight: '300',
              color: '#2c3e50',
              marginBottom: 8,
            },
            'Product Page Title',
            'product-header'
          ),
        },
        'product-page-number': {
          ...createText(
            'Premium selections for the discerning palate- Page 1',
            {
              fontSize: 14,
              color: '#888888',
              position: 'absolute',
              top: 60,
              right: 60,
            },
            'Product Page Number',
            'product-header'
          ),
        },
        'product-grid': {
          ...createGrid(
            3,
            {
              gap: 40,
              gridTemplateColumns: 'repeat(3, 1fr)',
              marginBottom: 60,
            },
            'Product Grid',
            ['product-item-1', 'product-item-2', 'product-item-3'],
            'ROOT'
          ),
        },
        'product-item-1': {
          ...createContainer(
            'product-item-1',
            {
              backgroundColor: '#ffffff',
              borderRadius: 8,
              overflow: 'hidden',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            },
            'Product Item 1',
            ['product-1-image', 'product-1-info'],
            'product-grid'
          ),
        },
        'product-1-image': {
          ...createImage(
            'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=400&h=300&fit=crop&crop=center',
            'Modern Armchair',
            {
              width: '100%',
              height: 250,
              objectFit: 'cover',
            },
            'Product 1 Image',
            'product-item-1'
          ),
        },
        'product-1-info': {
          ...createContainer(
            'product-1-info',
            {
              padding: 20,
            },
            'Product 1 Info',
            ['product-1-name', 'product-1-price', 'product-1-description'],
            'product-item-1'
          ),
        },
        'product-1-name': {
          ...createHeading(
            'Zex Perfumerjhv',
            3,
            {
              fontSize: 20,
              fontWeight: '600',
              color: '#2c3e50',
              marginBottom: 8,
            },
            'Product 1 Name',
            'product-1-info'
          ),
        },
        'product-1-price': {
          ...createText(
            '₹100',
            {
              fontSize: 18,
              fontWeight: '700',
              color: '#ff6b35',
              marginBottom: 8,
            },
            'Product 1 Price',
            'product-1-info'
          ),
        },
        'product-1-description': {
          ...createText(
            'Your recently tech of the Innovative solution that combines style with functionality.',
            {
              fontSize: 14,
              color: '#666666',
              lineHeight: 1.4,
            },
            'Product 1 Description',
            'product-1-info'
          ),
        },
        'product-item-2': {
          ...createContainer(
            'product-item-2',
            {
              backgroundColor: '#ffffff',
              borderRadius: 8,
              overflow: 'hidden',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            },
            'Product Item 2',
            ['product-2-image', 'product-2-info'],
            'product-grid'
          ),
        },
        'product-2-image': {
          ...createImage(
            'https://images.unsplash.com/photo-1549497538-303791108f95?w=400&h=300&fit=crop&crop=center',
            'Dining Table Set',
            {
              width: '100%',
              height: 250,
              objectFit: 'cover',
            },
            'Product 2 Image',
            'product-item-2'
          ),
        },
        'product-2-info': {
          ...createContainer(
            'product-2-info',
            {
              padding: 20,
            },
            'Product 2 Info',
            ['product-2-name', 'product-2-price', 'product-2-description'],
            'product-item-2'
          ),
        },
        'product-2-name': {
          ...createHeading(
            'Rosemaryh',
            3,
            {
              fontSize: 20,
              fontWeight: '600',
              color: '#2c3e50',
              marginBottom: 8,
            },
            'Product 2 Name',
            'product-2-info'
          ),
        },
        'product-2-price': {
          ...createText(
            '₹50',
            {
              fontSize: 18,
              fontWeight: '700',
              color: '#ff6b35',
              marginBottom: 8,
            },
            'Product 2 Price',
            'product-2-info'
          ),
        },
        'product-2-description': {
          ...createText(
            'Invigorate your senses with our Rosemary fragrance from the EuPerfume collection.',
            {
              fontSize: 14,
              color: '#666666',
              lineHeight: 1.4,
            },
            'Product 2 Description',
            'product-2-info'
          ),
        },
        'product-item-3': {
          ...createContainer(
            'product-item-3',
            {
              backgroundColor: '#ffffff',
              borderRadius: 8,
              overflow: 'hidden',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            },
            'Product Item 3',
            ['product-3-image', 'product-3-info'],
            'product-grid'
          ),
        },
        'product-3-image': {
          ...createImage(
            'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop&crop=center',
            'Modern Storage Unit',
            {
              width: '100%',
              height: 250,
              objectFit: 'cover',
            },
            'Product 3 Image',
            'product-item-3'
          ),
        },
        'product-3-info': {
          ...createContainer(
            'product-3-info',
            {
              padding: 20,
            },
            'Product 3 Info',
            ['product-3-name', 'product-3-price', 'product-3-description'],
            'product-item-3'
          ),
        },
        'product-3-name': {
          ...createHeading(
            'Mr. X',
            3,
            {
              fontSize: 20,
              fontWeight: '600',
              color: '#2c3e50',
              marginBottom: 8,
            },
            'Product 3 Name',
            'product-3-info'
          ),
        },
        'product-3-price': {
          ...createText(
            '₹100',
            {
              fontSize: 18,
              fontWeight: '700',
              color: '#ff6b35',
              marginBottom: 8,
            },
            'Product 3 Price',
            'product-3-info'
          ),
        },
        'product-3-description': {
          ...createText(
            'Mr. X: Ultra sensual fragrance. Premium scent, unforgettable allure.',
            {
              fontSize: 14,
              color: '#666666',
              lineHeight: 1.4,
            },
            'Product 3 Description',
            'product-3-info'
          ),
        },
        'product-footer': {
          ...createContainer(
            'product-footer',
            {
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingTop: 40,
              borderTop: '1px solid #e0e0e0',
            },
            'Product Footer',
            ['product-footer-brand', 'product-footer-copyright'],
            'ROOT'
          ),
        },
        'product-footer-brand': {
          ...createText(
            'SmellAdda',
            {
              fontSize: 16,
              color: '#2c3e50',
              fontWeight: '500',
            },
            'Product Footer Brand',
            'product-footer'
          ),
        },
        'product-footer-copyright': {
          ...createText(
            '© 2025 All rights reserved',
            {
              fontSize: 14,
              color: '#888888',
            },
            'Product Footer Copyright',
            'product-footer'
          ),
        },
      }),
    },

    // PAGE 4: CONTACT PAGE
    {
      id: 'contact-page',
      name: 'Contact Page',
      data: JSON.stringify({
        ROOT: {
          ...createContainer(
            'ROOT',
            {
              padding: 0,
              backgroundColor: '#ffffff',
              minHeight: '100vh',
              display: 'flex',
            },
            'Contact Page',
            ['contact-image-section', 'contact-info-section']
          ),
        },
        'contact-image-section': {
          ...createContainer(
            'contact-image-section',
            {
              flex: '1',
              minHeight: '100vh',
              position: 'relative',
              overflow: 'hidden',
            },
            'Contact Image Section',
            ['contact-background-image', 'contact-quote-overlay'],
            'ROOT'
          ),
        },
        'contact-background-image': {
          ...createImage(
            'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=1200&fit=crop&crop=center',
            'Modern Living Room Interior',
            {
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            },
            'Contact Background Image',
            'contact-image-section'
          ),
        },
        'contact-quote-overlay': {
          ...createContainer(
            'contact-quote-overlay',
            {
              position: 'absolute',
              bottom: 60,
              left: 60,
              right: 60,
              color: '#ffffff',
            },
            'Contact Quote Overlay',
            ['contact-quote', 'contact-quote-author'],
            'contact-image-section'
          ),
        },
        'contact-quote': {
          ...createText(
            '"Be yourself everyone else is already taken."',
            {
              fontSize: 24,
              fontStyle: 'italic',
              color: '#ffffff',
              marginBottom: 16,
              lineHeight: 1.4,
            },
            'Contact Quote',
            'contact-quote-overlay'
          ),
        },
        'contact-quote-author': {
          ...createText(
            'OSCAR WILDE',
            {
              fontSize: 14,
              color: '#ff6b35',
              letterSpacing: '2px',
              fontWeight: '600',
            },
            'Contact Quote Author',
            'contact-quote-overlay'
          ),
        },
        'contact-info-section': {
          ...createContainer(
            'contact-info-section',
            {
              flex: '1',
              backgroundColor: '#f8f8f8',
              padding: '80px 60px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
            },
            'Contact Info Section',
            [
              'contact-title',
              'contact-details',
              'contact-social',
              'contact-footer',
            ],
            'ROOT'
          ),
        },
        'contact-title': {
          ...createHeading(
            'CONTACT',
            1,
            {
              fontSize: 48,
              fontWeight: 'bold',
              color: '#2c3e50',
              marginBottom: 60,
              borderBottom: '3px solid #ff6b35',
              paddingBottom: 20,
              display: 'inline-block',
            },
            'Contact Title',
            'contact-info-section'
          ),
        },
        'contact-details': {
          ...createContainer(
            'contact-details',
            {
              marginBottom: 60,
            },
            'Contact Details',
            [
              'contact-address-section',
              'contact-phone-section',
              'contact-email-section',
              'contact-website-section',
            ],
            'contact-info-section'
          ),
        },
        'contact-address-section': {
          ...createContainer(
            'contact-address-section',
            {
              marginBottom: 40,
            },
            'Contact Address Section',
            ['contact-address-label', 'contact-address-value'],
            'contact-details'
          ),
        },
        'contact-address-label': {
          ...createText(
            'ADDRESS',
            {
              fontSize: 14,
              fontWeight: '600',
              color: '#2c3e50',
              marginBottom: 8,
              letterSpacing: '2px',
            },
            'Contact Address Label',
            'contact-address-section'
          ),
        },
        'contact-address-value': {
          ...createText(
            'Bahadurpur, saralinayat, Allahabad.',
            {
              fontSize: 16,
              color: '#666666',
              lineHeight: 1.4,
            },
            'Contact Address Value',
            'contact-address-section'
          ),
        },
        'contact-phone-section': {
          ...createContainer(
            'contact-phone-section',
            {
              marginBottom: 40,
            },
            'Contact Phone Section',
            ['contact-phone-label', 'contact-phone-value'],
            'contact-details'
          ),
        },
        'contact-phone-label': {
          ...createText(
            'TELEPHONE',
            {
              fontSize: 14,
              fontWeight: '600',
              color: '#2c3e50',
              marginBottom: 8,
              letterSpacing: '2px',
            },
            'Contact Phone Label',
            'contact-phone-section'
          ),
        },
        'contact-phone-value': {
          ...createText(
            '+91 9876543210',
            {
              fontSize: 16,
              color: '#666666',
            },
            'Contact Phone Value',
            'contact-phone-section'
          ),
        },
        'contact-email-section': {
          ...createContainer(
            'contact-email-section',
            {
              marginBottom: 40,
            },
            'Contact Email Section',
            ['contact-email-label', 'contact-email-value'],
            'contact-details'
          ),
        },
        'contact-email-label': {
          ...createText(
            'EMAIL',
            {
              fontSize: 14,
              fontWeight: '600',
              color: '#2c3e50',
              marginBottom: 8,
              letterSpacing: '2px',
            },
            'Contact Email Label',
            'contact-email-section'
          ),
        },
        'contact-email-value': {
          ...createText(
            'admin@smelladda.com',
            {
              fontSize: 16,
              color: '#666666',
            },
            'Contact Email Value',
            'contact-email-section'
          ),
        },
        'contact-website-section': {
          ...createContainer(
            'contact-website-section',
            {
              marginBottom: 40,
            },
            'Contact Website Section',
            ['contact-website-label', 'contact-website-value'],
            'contact-details'
          ),
        },
        'contact-website-label': {
          ...createText(
            'WEBSITE',
            {
              fontSize: 14,
              fontWeight: '600',
              color: '#2c3e50',
              marginBottom: 8,
              letterSpacing: '2px',
            },
            'Contact Website Label',
            'contact-website-section'
          ),
        },
        'contact-website-value': {
          ...createText(
            'https://smelladda.com',
            {
              fontSize: 16,
              color: '#666666',
            },
            'Contact Website Value',
            'contact-website-section'
          ),
        },
        'contact-social': {
          ...createContainer(
            'contact-social',
            {
              display: 'flex',
              gap: 20,
              marginBottom: 60,
            },
            'Contact Social',
            ['social-instagram', 'social-facebook', 'social-twitter'],
            'contact-info-section'
          ),
        },
        'social-instagram': {
          ...createContainer(
            'social-instagram',
            {
              width: 40,
              height: 40,
              backgroundColor: '#2c3e50',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'background-color 0.3s ease',
            },
            'Social Instagram',
            ['instagram-icon'],
            'contact-social'
          ),
        },
        'instagram-icon': {
          ...createText(
            '📷',
            {
              fontSize: 18,
              color: '#ffffff',
            },
            'Instagram Icon',
            'social-instagram'
          ),
        },
        'social-facebook': {
          ...createContainer(
            'social-facebook',
            {
              width: 40,
              height: 40,
              backgroundColor: '#2c3e50',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'background-color 0.3s ease',
            },
            'Social Facebook',
            ['facebook-icon'],
            'contact-social'
          ),
        },
        'facebook-icon': {
          ...createText(
            '📘',
            {
              fontSize: 18,
              color: '#ffffff',
            },
            'Facebook Icon',
            'social-facebook'
          ),
        },
        'social-twitter': {
          ...createContainer(
            'social-twitter',
            {
              width: 40,
              height: 40,
              backgroundColor: '#2c3e50',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'background-color 0.3s ease',
            },
            'Social Twitter',
            ['twitter-icon'],
            'contact-social'
          ),
        },
        'twitter-icon': {
          ...createText(
            '🐦',
            {
              fontSize: 18,
              color: '#ffffff',
            },
            'Twitter Icon',
            'social-twitter'
          ),
        },
        'contact-footer': {
          ...createContainer(
            'contact-footer',
            {
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingTop: 40,
              borderTop: '1px solid #e0e0e0',
            },
            'Contact Footer',
            ['contact-footer-brand', 'contact-footer-copyright'],
            'contact-info-section'
          ),
        },
        'contact-footer-brand': {
          ...createText(
            'SmellAdda',
            {
              fontSize: 16,
              color: '#2c3e50',
              fontWeight: '500',
            },
            'Contact Footer Brand',
            'contact-footer'
          ),
        },
        'contact-footer-copyright': {
          ...createText(
            '© 2025 All rights reserved',
            {
              fontSize: 14,
              color: '#888888',
            },
            'Contact Footer Copyright',
            'contact-footer'
          ),
        },
      }),
    },
  ])
  .build()
