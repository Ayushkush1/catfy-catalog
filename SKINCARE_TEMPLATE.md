# Skin Care Catalogue Template 🌸

## Overview

A beautiful, elegant skin care product catalogue template designed for beauty brands, cosmetics companies, and wellness products. Features a soft, premium aesthetic with warm pastel colors and sophisticated typography.

---

## ✨ Design Features

### Color Palette
- **Primary:** `#e8b4a8` (Soft Peach)
- **Secondary:** `#d4a5a5` (Rose)
- **Accent:** `#c77dff` (Lavender)
- **Dark:** `#2d2d2d` (Charcoal)
- **Light:** `#faf8f5` (Cream White)
- **Background:** `#fff9f3` (Warm Cream)

### Typography
- **Headings:** Cormorant Garamond (Elegant Serif)
- **Body:** Montserrat (Clean Sans-serif)

### Key Visual Elements
- Rounded product images with soft shadows
- Gradient backgrounds
- Floating quote boxes with glassmorphism effect
- Icon-based contact information
- Hover animations on product cards

---

## 📄 Page Structure

### 1. Cover Page
**Layout:** Split layout with text and hero image

**Features:**
- Company logo/name in header
- Year badge in top-right
- Large catalogue title
- Tagline/description
- Rounded bottle-shaped image container
- Premium quality footer badge

**Dynamic Data:**
- `catalogue.settings.companyInfo.companyName` or `profile.companyName`
- `catalogue.year`
- `catalogue.name`
- `catalogue.tagline` or `catalogue.settings.companyInfo.companyDescription`
- `catalogue.settings.mediaAssets.coverImageUrl` (fallback to first product image)

---

### 2. Intro/About Page
**Layout:** 50/50 split - image left, content right

**Features:**
- "Our Story" badge
- Company name as large heading
- Tagline in italic accent color
- Company description
- Inspirational quote in bordered box
- Rounded image with shadow

**Dynamic Data:**
- `catalogue.settings.mediaAssets.introImage`
- `catalogue.settings.companyInfo.companyName`
- `catalogue.tagline`
- `catalogue.settings.companyInfo.companyDescription`
- `catalogue.quote`

---

### 3. Products Page
**Layout:** 3-column grid of product cards

**Features:**
- "Our Collection" header
- Subtitle tagline
- Product cards with:
  - Large product image (350px height)
  - Category badge (uppercase)
  - Product name (large serif font)
  - Description (2-line clamp)
  - Price in accent color
  - "Premium" badge
  - Hover effects (lift + image zoom)

**Dynamic Data:**
```javascript
{{#catalogue.products}}
  {{imageUrl}}
  {{name}}
  {{category.name}}
  {{description}}
  {{price}}
{{/catalogue.products}}
```

**Empty State:**
- Centered sparkle icon (✨)
- "Beautiful Products Coming Soon" message
- Helpful instruction text

---

### 4. Contact Page
**Layout:** Split layout - image left, contact details right

**Features:**
- Large contact image with floating quote box
- Glassmorphism quote overlay
- Icon-based contact information:
  - Email (envelope icon)
  - Phone (phone icon)
  - Address (location pin icon)
  - Website (globe icon)
- Social media links with icons:
  - Instagram
  - Facebook
  - Twitter
  - LinkedIn
- Rounded icon containers with hover effects

**Dynamic Data:**
- `catalogue.settings.contactDetails.contactImage`
- `catalogue.settings.contactDetails.contactQuote` or `catalogue.quote`
- `catalogue.settings.contactDetails.email` (fallback to `profile.email`)
- `catalogue.settings.contactDetails.phone` (fallback to `profile.phone`)
- `catalogue.settings.contactDetails.address` (fallback to `profile.address`)
- `catalogue.settings.contactDetails.website` (fallback to `profile.website`)
- `catalogue.settings.socialMedia.instagram/facebook/twitter/linkedin`

---

## 🎨 Styling Details

### Product Cards
```css
- Background: White
- Border Radius: 20px
- Shadow: 0 10px 30px rgba(0, 0, 0, 0.08)
- Hover Transform: translateY(-8px)
- Hover Shadow: 0 20px 50px rgba(232, 180, 168, 0.25)
- Image Zoom: scale(1.05) on hover
```

### Contact Icons
```css
- Size: 50px × 50px
- Border Radius: 12px
- Background: Primary color (#e8b4a8)
- Icon Color: White
- Hover: Lift effect (translateY(-3px))
```

### Quote Box
```css
- Background: rgba(255, 255, 255, 0.95)
- Backdrop Filter: blur(10px)
- Border Radius: 15px
- Position: Absolute bottom overlay
- Shadow: 0 10px 30px rgba(0, 0, 0, 0.1)
```

---

## 📊 Data Requirements

### Required Data
```javascript
{
  catalogue: {
    name: string,           // Catalogue name
    products: Array,        // Product list
    settings: {
      companyInfo: {
        companyName: string,
        companyDescription: string
      },
      contactDetails: {
        email: string,
        phone: string,
        address: string,
        website: string,
        contactImage: string,
        contactQuote: string
      },
      socialMedia: {
        instagram: string,
        facebook: string,
        twitter: string,
        linkedin: string
      },
      mediaAssets: {
        coverImageUrl: string,
        introImage: string
      }
    }
  },
  profile: {
    companyName: string,
    email: string,
    phone: string,
    address: string,
    website: string
  }
}
```

### Optional Data (with Fallbacks)
- `catalogue.year` → defaults to "2025"
- `catalogue.tagline` → falls back to company description
- `catalogue.quote` → has generic fallback quote
- All images → have Unsplash placeholder fallbacks

---

## 🎯 Best For

✅ **Ideal Use Cases:**
- Skin care product lines
- Beauty and cosmetics brands
- Wellness products
- Organic/natural beauty
- Premium spa products
- Dermatologist-recommended products
- Luxury beauty collections

✅ **Product Types:**
- Face creams and serums
- Moisturizers and lotions
- Cleansers and toners
- Masks and treatments
- Eye care products
- Lip care products
- Body care items

---

## 🌟 Template Highlights

### Strengths
1. **Elegant & Premium:** Sophisticated design perfect for high-end beauty brands
2. **Clean Layout:** Lots of white space for visual breathing room
3. **Product Focus:** Beautiful product card grid showcases items effectively
4. **Responsive Typography:** Readable text hierarchy with serif/sans-serif mix
5. **Soft Color Palette:** Warm, inviting colors that appeal to beauty consumers
6. **Professional Contact:** Icon-based contact section looks modern and organized

### Visual Style
- **Aesthetic:** Minimalist, elegant, premium
- **Vibe:** Calm, luxurious, trustworthy
- **Mood:** Feminine, sophisticated, clean

---

## 🔄 Comparison with Other Templates

| Feature | Furniture | Fashion | **Skin Care** |
|---------|-----------|---------|---------------|
| **Layout** | Grid | Alternating | Grid |
| **Products per Row** | 3 | 1 (full-screen) | 3 |
| **Color Scheme** | Warm amber | Black/white | Soft peach/lavender |
| **Typography** | Sans-serif | Playfair/Inter | Cormorant/Montserrat |
| **Vibe** | Modern, efficient | Editorial, luxury | Elegant, wellness |
| **Best For** | 30+ products | 10-30 products | 15-40 products |
| **Image Style** | Rectangular | Full-bleed | Rounded containers |

---

## 💡 Customization Tips

### To Adjust Colors:
Edit CSS variables in `sharedCss`:
```css
--skincare-primary: #e8b4a8;      /* Primary brand color */
--skincare-accent: #c77dff;       /* Accent/price color */
--skincare-light: #faf8f5;        /* Background color */
```

### To Change Fonts:
Update Google Fonts import and variables:
```css
@import url('https://fonts.googleapis.com/...');
--font-heading: 'Your Serif Font', serif;
--font-body: 'Your Sans Font', sans-serif;
```

### To Modify Product Grid:
Change grid columns in `.skincare-products__grid`:
```css
grid-template-columns: repeat(3, 1fr);  /* 3 columns */
/* Change to repeat(2, 1fr) for 2 columns */
/* Change to repeat(4, 1fr) for 4 columns */
```

---

## ✅ Technical Details

- **Template ID:** `skincare-catalogue`
- **Engine:** Mustache
- **Pages:** 4 (Cover, Intro, Products, Contact)
- **Fully Dynamic:** ✅ Yes
- **Print Ready:** ✅ Yes (with print styles)
- **Responsive:** ✅ Yes
- **Dependencies:** None (uses Google Fonts CDN)

---

## 🚀 Usage

The template is automatically available in the catalogue preview page. Select "Skin Care Catalogue" from the template dropdown to apply it to your catalogue.

**File Location:**
```
src/components/editor/iframe-templates/SkinCareCatalogueTemplate.ts
```

**Registration:**
Already registered in `src/components/editor/iframe-templates/index.ts`

---

## 🎨 Sample Product Display

Each product card shows:
1. **Image** - 350px height, cover fit, rounded corners
2. **Category** - Small uppercase badge in primary color
3. **Name** - Large serif heading
4. **Description** - 2-line truncated body text
5. **Price** - Accent color with ₹ symbol
6. **Badge** - "Premium" label

**Hover Effect:**
- Card lifts up 8px
- Shadow intensifies
- Product image zooms to 105%

---

Perfect for beauty brands looking to showcase their products with elegance! 🌸✨
