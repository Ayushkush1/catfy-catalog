# Dynamic Templates Comparison - Furniture vs Fashion

## 🎨 Overview

Both templates are now **fully dynamic** and ready for production use!

---

## 📊 Side-by-Side Comparison

| Feature | Furniture Template | Fashion Template |
|---------|-------------------|------------------|
| **Template ID** | `furniture-catalog` | `fashion-catalogue` |
| **Pages** | 4 pages | 4 pages |
| **Design Style** | Modern, Clean, Aurum-themed | Elegant, Fashion-forward, High-end |
| **Product Layout** | 3-column grid | Full-screen alternating |
| **Color Scheme** | Warm aurum accents (#d97706) | Dark sophisticated (#111) |

---

## 📄 Page Structure Comparison

### Page 1: Cover/Hero

**Furniture (Aurum):**
- Dark gradient background with noise texture
- Split layout: text left, product image right
- Header/footer with company info
- "NEW ARRIVALS" badge on product

**Fashion (Verite):**
- Full-screen background image with overlay
- Centered title with dividers
- Minimalist footer with year
- Playfair Display font for elegance

---

### Page 2: Intro/Story

**Furniture:**
- 50/50 split: image left, content right
- Clean white background
- Company name, tagline, and quote
- Simple, modern typography

**Fashion:**
- 50/50 split: image left, content right
- Quote in styled box with accent line
- Company description with year
- Serif fonts for sophistication

---

### Page 3: Products

**Furniture (Grid Layout):**
```
┌─────┬─────┬─────┐
│ P1  │ P2  │ P3  │
├─────┼─────┼─────┤
│ P4  │ P5  │ P6  │
└─────┴─────┴─────┘
```
- 3 products per row
- Card-based design
- Hover effects (lift + zoom)
- Compact, efficient use of space

**Fashion (Alternating Layout):**
```
┌──────────┬──────────┐
│  Image   │ Details  │  Product 1
├──────────┼──────────┤
│ Details  │  Image   │  Product 2 (reverse)
├──────────┼──────────┤
│  Image   │ Details  │  Product 3
└──────────┴──────────┘
```
- Full-screen per product
- Alternating image/details
- Dark sophisticated aesthetic
- Maximum visual impact

---

### Page 4: Contact

**Furniture:**
- Image left with quote overlay
- Contact details right side
- Social links as text
- Amber accent colors
- Modern, approachable

**Fashion:**
- Image left with floating quote box
- Contact details right side
- Circular social media icons
- QR code for digital catalogue
- Elegant, professional

---

## 🎯 Dynamic Data Integration

### Both Templates Now Use:

#### ✅ Products
```javascript
{{#catalogue.products}}
  {{name}}
  {{price}}
  {{imageUrl}}
  {{description}}
  {{category.name}}
{{/catalogue.products}}
```

#### ✅ Company Information
```javascript
{{catalogue.settings.companyInfo.companyName}}
{{catalogue.settings.companyInfo.companyDescription}}
{{profile.companyName}}
{{profile.fullName}}
```

#### ✅ Contact Details
```javascript
{{catalogue.settings.contactDetails.email}}
{{catalogue.settings.contactDetails.phone}}
{{catalogue.settings.contactDetails.address}}
{{catalogue.settings.contactDetails.website}}
```

#### ✅ Images
```javascript
// Cover image fallback chain
{{catalogue.settings.mediaAssets.coverImageUrl}}
  → {{catalogue.products.0.imageUrl}}
  → Default image

// Contact image
{{catalogue.settings.contactDetails.contactImage}}
```

#### ✅ Social Media
```javascript
{{catalogue.settings.socialMedia.instagram}}
{{catalogue.settings.socialMedia.facebook}}
{{catalogue.settings.socialMedia.twitter}}
{{catalogue.settings.socialMedia.linkedin}}
```

---

## 🎨 Design Philosophy

### Furniture Template (Aurum)
**Target:** Furniture stores, home decor, interior design
**Vibe:** Warm, inviting, premium but approachable
**Colors:** 
- Aurum accent: `#d97706` (amber/orange)
- Background: `#fafafa` (off-white)
- Text: `#222` (dark gray)

**Typography:** Sans-serif throughout
**Layout:** Grid-based, efficient
**Best For:** 
- Large product catalogues (50+ items)
- Products that work well in grid format
- Modern, minimalist brands

---

### Fashion Template (Verite)
**Target:** Fashion brands, luxury goods, high-end retailers
**Vibe:** Elegant, sophisticated, editorial
**Colors:** 
- Primary: `#000` / `#111` (black)
- Accent: `#d2691e` (chocolate brown)
- Background: `#ffffff` (pure white)

**Typography:** 
- Titles: Playfair Display (serif)
- Body: Inter (sans-serif)

**Layout:** Full-screen showcase
**Best For:**
- Curated collections (10-30 items)
- High-quality product photography
- Premium, luxury brands
- Fashion lookbooks

---

## 📊 Product Display Comparison

### Furniture Template Cards:

```
┌───────────────────┐
│                   │
│   Product Image   │ 280px height
│   (hover zoom)    │
│                   │
├───────────────────┤
│  Product Name     │
│  ₹1,299          │ 22px, bold
│  ─────────────    │
│  Details: ...     │
│  Category: ...    │
└───────────────────┘
```

**Features:**
- Compact card design
- Hover effects (lift 4px, border color change)
- Visible category and details
- Efficient space usage

---

### Fashion Template Sections:

```
┌──────────────────────────────────────┐
│                        │             │
│                        │ TITLE       │
│   Full-screen         │ Category    │
│   Product Image       │ ───────     │
│                        │ Description │
│                        │             │
│                        │ ₹12,499     │
└────────────────────────┴─────────────┘
```

**Features:**
- Maximum visual impact
- Editorial magazine feel
- Plenty of white space
- Premium presentation

---

## 🔄 Mustache Template Usage

Both templates use identical Mustache syntax:

### Conditional Rendering
```mustache
{{#variable}}
  Shows if exists
{{/variable}}
{{^variable}}
  Shows if doesn't exist
{{/variable}}
```

### Fallback Chains
```mustache
{{#primary}}{{primary}}{{/primary}}
{{^primary}}
  {{#secondary}}{{secondary}}{{/secondary}}
  {{^secondary}}Default{{/secondary}}
{{/primary}}
```

### Loops
```mustache
{{#array}}
  {{property}}
{{/array}}
```

---

## 🚀 When to Use Each Template

### Choose **Furniture Template** when:
- ✅ You have 30+ products
- ✅ Products work well in grid format
- ✅ You want efficient space usage
- ✅ Brand is modern and minimalist
- ✅ Quick browsing is important
- ✅ Products are similar in type

### Choose **Fashion Template** when:
- ✅ You have curated collection (10-30 items)
- ✅ High-quality product photography
- ✅ Each product needs detailed showcase
- ✅ Brand is premium/luxury
- ✅ Visual impact over efficiency
- ✅ Products vary significantly

---

## 📈 Performance

Both templates:
- ✅ Load quickly (static HTML + CSS)
- ✅ Responsive design
- ✅ No JavaScript dependencies
- ✅ Print-ready (CSS optimized)
- ✅ Work with Mustache rendering engine

---

## 🎯 Common Features

Both templates share:

1. **4-Page Structure**
   - Cover
   - Intro/Story
   - Products
   - Contact

2. **Dynamic Data**
   - Real product information
   - Contact details
   - Company information
   - Social media integration

3. **Fallback Support**
   - Graceful degradation
   - Default values
   - Multiple data sources

4. **Professional Design**
   - Print-ready quality
   - Consistent branding
   - Mobile-responsive

---

## 🎨 Customization Options

### Furniture Template Variables:
```css
--aurum-bg: #fafafa
--aurum-text: #222
--aurum-accent: #d97706
--aurum-border: #e0e0e0
--aurum-muted: #777
```

### Fashion Template Variables:
```css
--fashion-cover-bg: #000
--fashion-cover-text: #ffffff
--fashion-cover-font-title: 'Playfair Display'
--fashion-cover-font-sub: 'Inter'
--fashion-accent: #d2691e
```

---

## ✅ Migration Checklist

To use either template, ensure:
- [ ] Products added to catalogue
- [ ] Contact information filled in settings
- [ ] Company name and description set
- [ ] (Optional) Cover image uploaded
- [ ] (Optional) Intro image uploaded
- [ ] (Optional) Contact page image uploaded
- [ ] (Optional) Social media URLs configured
- [ ] (Optional) Quote and tagline set

---

## 🎉 Summary

**Furniture Template:**
- Grid-based product showcase
- Modern, clean aesthetic
- Efficient for large catalogues
- Warm, inviting colors

**Fashion Template:**
- Full-screen product showcase  
- Elegant, editorial aesthetic
- Best for curated collections
- Sophisticated, luxury feel

**Both templates are:**
- ✅ 100% Dynamic
- ✅ Production-ready
- ✅ Beautifully designed
- ✅ Fully integrated
- ✅ Data-driven

Choose based on your brand identity and product catalogue size! 🌟
