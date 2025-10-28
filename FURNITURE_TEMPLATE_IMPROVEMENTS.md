# Furniture Catalogue Template - Dynamic Data Integration

## Changes Made

### 1. **Products Page - Dynamic Product Data** 
Previously used: `{{#productsPreview}}` (static preview data)
Now uses: `{{#catalogue.products}}` (actual catalogue products)

#### Product Card Improvements:
- **Dynamic Product Data:**
  - Product name: `{{name}}`
  - Product price: `₹{{price}}`
  - Product image: `{{imageUrl}}`
  - Product description: `{{description}}`
  - Product category: `{{category.name}}`

- **Fallback Support:**
  - Shows sample product card when no products are available
  - Graceful handling of missing product images (shows furniture icon 🪑)

#### UI Enhancements:
- **Better Card Styling:**
  - Increased border radius (8px → 12px)
  - Enhanced shadow on hover (`translateY(-4px)`)
  - Accent border color on hover
  - Smooth transitions with cubic-bezier easing
  
- **Improved Image Section:**
  - Increased height (250px → 280px)
  - Gradient background (light gray)
  - Image zoom effect on hover (scale 1.05)
  - Better icon styling (larger, amber colored)

- **Better Typography:**
  - Larger price display (20px → 22px)
  - Better color hierarchy
  - Improved line height for title

- **Enhanced Product Details:**
  - Better spacing between specs (4px → 8px)
  - Dashed border separators
  - Two-column layout for labels and values
  - Better visual hierarchy

### 2. **Contact Page - Dynamic Contact Information**

#### Dynamic Data Integration:
- **Contact Image:** `{{catalogue.settings.contactDetails.contactImage}}`
  - Fallback to default Unsplash image
  
- **Contact Quote:** `{{catalogue.settings.contactDetails.contactQuote}}`
  - Fallback: "Design is the silent ambassador of your brand."
  
- **Quote Attribution:** `{{catalogue.settings.contactDetails.contactQuoteBy}}`
  - Fallback chain: contactQuoteBy → profile.companyName → "Company Name"

- **Company Information:**
  - Company name from settings or profile
  - Full address with city and state
  - Phone number from settings or profile
  - Email from settings or profile

- **Social Media Links:**
  - Instagram (conditional display)
  - LinkedIn (conditional display)
  - Facebook (conditional display)
  - Twitter (conditional display)
  - All links open in new tab with proper href

- **Dynamic Footer:**
  - Shows current year from catalogue or defaults to 2025
  - Shows company name

### 3. **Cover Page - Dynamic Product Image**

- **Enhanced Fallback Chain for Hero Image:**
  1. `catalogue.settings.mediaAssets.coverImageUrl`
  2. `catalogue.products.0.imageUrl` (first product's image) **NEW**
  3. `product.image` (preview data)
  4. Default Unsplash furniture image

### 4. **Consistent Data Bindings Across All Pages**

All pages now consistently use:
- `catalogue.settings.companyInfo.companyName` with fallback to `profile.companyName`
- `catalogue.name` for catalogue title
- `profile` data for user information
- Proper Mustache syntax with `{{#variable}}` and `{{^variable}}` for conditionals

## Data Structure Expected

### Catalogue Object:
```javascript
{
  name: string,
  description: string,
  quote: string,
  tagline: string,
  year: string,
  introImage: string,
  products: [
    {
      id: string,
      name: string,
      description: string,
      price: number,
      imageUrl: string,
      category: {
        id: string,
        name: string,
        color: string
      }
    }
  ],
  settings: {
    companyInfo: {
      companyName: string,
      companyDescription: string
    },
    contactDetails: {
      email: string,
      phone: string,
      website: string,
      address: string,
      city: string,
      state: string,
      country: string,
      contactImage: string,
      contactQuote: string,
      contactQuoteBy: string
    },
    socialMedia: {
      instagram: string,
      linkedin: string,
      facebook: string,
      twitter: string
    },
    mediaAssets: {
      logoUrl: string,
      coverImageUrl: string
    }
  }
}
```

### Profile Object:
```javascript
{
  companyName: string,
  fullName: string,
  email: string,
  phone: string,
  address: string,
  city: string,
  state: string,
  tagline: string
}
```

## Benefits

1. **Fully Dynamic:** Template now renders actual catalogue data instead of placeholders
2. **Better UI:** Improved product cards with modern design and smooth interactions
3. **Robust Fallbacks:** Graceful degradation when data is missing
4. **Complete Integration:** Uses the same data structure as the rest of the application
5. **Professional Look:** Enhanced styling that matches modern e-commerce standards

## Testing Checklist

- [x] Products display correctly with real data
- [x] Product images render or show fallback icon
- [x] Contact information displays from catalogue settings
- [x] Contact page uses custom image and quote
- [x] Social media links only show when URLs are provided
- [x] Cover page uses product images when no cover image is set
- [x] All pages show company name consistently
- [x] Fallback chains work when data is missing
