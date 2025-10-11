# Multi-Page Furniture Catalog Template Guide

## Overview
This template system provides a complete multi-page furniture catalog solution with consistent dark theme styling, professional typography, and responsive layouts. The templates maintain visual consistency while offering flexible content structures for different catalog pages.

## Template Files

### 1. `furniture-catalog-multipage-template.json`
**Product Grid Layout** - Main catalog page featuring:
- 3-column responsive product grid
- Product cards with images, names, descriptions, and pricing
- Color and material option displays
- Standardized header with page numbering
- Professional footer with branding

### 2. `furniture-catalog-page2-template.json`
**Featured Product & Contact Layout** - Secondary page featuring:
- Large featured product showcase with detailed specifications
- Contact information section with social media links
- Quote/testimonial display
- Product badge system for highlighting bestsellers

## Design System

### Color Palette
- **Background**: `#2a2a2a` (Dark charcoal)
- **Text Primary**: `#ffffff` (White)
- **Text Secondary**: `#cccccc` (Light gray)
- **Text Muted**: `#888888` (Medium gray)
- **Accent**: `#ff6b35` (Orange)
- **Borders**: `#444444` (Dark gray)
- **Cards**: `#333333` (Darker gray)

### Typography
- **Font Family**: `system-ui, -apple-system, sans-serif`
- **Brand Text**: 14px, 600 weight, 0.2em letter-spacing
- **Headings**: 32px, 700 weight, 0.05em letter-spacing
- **Body Text**: 14px, 400 weight, 1.5 line-height
- **Labels**: 12px, 600 weight, 0.15em letter-spacing

### Spacing System
- **Page Padding**: 40px horizontal, 30-60px vertical
- **Component Gaps**: 20px, 40px, 60px for different hierarchy levels
- **Card Padding**: 24px internal spacing
- **Border Radius**: 8px for cards and images

## Component Structure

### Header Component
```
Header Container
├── Left Section
│   ├── Brand Name (SMELLADDA)
│   └── Catalog Subtitle
├── Center Section
│   └── Page Title
└── Right Section
    └── Page Number (Page X of Y)
```

### Product Grid (Page 1)
```
Product Grid Container
├── Product Card 1
│   ├── Product Image
│   ├── Product Name
│   ├── Product Description
│   ├── Price Display
│   └── Options (Colors/Materials)
├── Product Card 2
└── Product Card 3
```

### Featured Layout (Page 2)
```
Content Container
├── Featured Section (60% width)
│   ├── Featured Title
│   └── Product Showcase
│       ├── Large Product Image
│       └── Product Details
└── Contact Section (40% width)
    ├── Contact Information
    └── Social Media Links
```

## Customization Guide

### Adding New Products
1. **Product Images**: Use high-quality images (300x400px minimum)
2. **Product Names**: Keep concise, use title case
3. **Descriptions**: 2-3 lines maximum for grid layout
4. **Pricing**: Use consistent currency formatting
5. **Options**: List 2-3 color/material variants

### Page Numbering
- Update `header-right` text content: "Page X of Y"
- Maintain consistent numbering across all pages

### Brand Customization
- **Brand Name**: Update `brand-name` text content
- **Tagline**: Modify `catalog-title` text content
- **Colors**: Adjust accent color (`#ff6b35`) throughout templates

### Content Sections
- **Page Titles**: Update `header-center` for each page theme
- **Product Categories**: Modify section titles and content
- **Contact Info**: Update all contact details in page 2 template

## Responsive Considerations

### Desktop (1200px+)
- Full 3-column grid layout
- 60/40 split for featured/contact sections
- Optimal spacing and typography

### Tablet (768px-1199px)
- 2-column grid layout
- Adjusted padding and gaps
- Maintained readability

### Mobile (767px and below)
- Single column layout
- Stacked sections
- Touch-friendly spacing

## Best Practices

### Image Guidelines
- **Format**: Use WebP or high-quality JPEG
- **Dimensions**: Maintain consistent aspect ratios
- **Alt Text**: Include descriptive alt text for accessibility
- **Loading**: Consider lazy loading for performance

### Content Guidelines
- **Consistency**: Maintain consistent tone and style
- **Hierarchy**: Use proper heading levels and text sizes
- **Spacing**: Follow the established spacing system
- **Contrast**: Ensure sufficient color contrast for readability

### Performance Tips
- Optimize images for web delivery
- Use consistent component structures
- Minimize custom styling variations
- Test across different devices and browsers

## Template Extensions

### Adding New Page Types
1. Copy base template structure
2. Modify content sections while maintaining header/footer
3. Update page numbering and titles
4. Ensure consistent styling and spacing

### Custom Components
- Follow existing naming conventions
- Maintain color palette and typography
- Use established spacing system
- Test responsive behavior

## Technical Notes

### JSON Structure
- Each component has a unique ID
- Parent-child relationships are maintained through `nodes` arrays
- Props contain all styling and content information
- Canvas components can contain child elements

### Styling Properties
- All measurements use CSS units (px, %, vh, etc.)
- Colors use hex values for consistency
- Font weights use numeric values (400, 500, 600, 700)
- Spacing follows consistent increments

This template system provides a solid foundation for creating professional furniture catalogs while maintaining design consistency and flexibility for customization.