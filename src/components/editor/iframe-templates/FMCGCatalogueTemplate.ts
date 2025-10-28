// src/components/editor/iframe-templates/FMCGCatalogueTemplate.ts

type IframePage = {
    id: string
    name: string
    html: string
    css?: string
}

export type PrebuiltHtmlTemplate = {
    id: string
    name: string
    engine: 'mustache' | 'handlebars'
    pages: IframePage[]
    sharedCss?: string
    dataTransform?: (data: any) => any
    pageGenerator?: (data: any, basePages: IframePage[]) => IframePage[]
}

const sharedCss = `
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600&display=swap');

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body, html {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
  font-family: 'Poppins', sans-serif;
}

/* ==================== COVER PAGE ==================== */
.cover-page {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  background-color: #f5f5f0;
  font-family: sans-serif;
}

/* Background Layers */
.cover-bg {
  position: absolute;
  inset: 0;
  overflow: hidden;
}

.cover-bg-gradient {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, #f5f5f0 0%, #f0ead6 40%, #e8dcc0 100%);
}

.cover-bg-triangle {
  position: absolute;
  inset: 0;
  clip-path: polygon(0 0, 45% 40%, 0 100%);
  background: linear-gradient(135deg, #d4722a15 0%, #d4722a08 50%, transparent 100%);
}

.cover-bg-triangle-alt {
  position: absolute;
  inset: 0;
  clip-path: polygon(0 0, 35% 45%, 0 100%);
  background: linear-gradient(145deg, #d4722a10 0%, transparent 70%);
}

/* Circle Image */
.cover-image-wrapper {
  position: absolute;
  top: 0;
  right: 0;
  width: 60%;
  height: 100%;
}

.cover-image-circle {
  width: 100%;
  height: 100%;
  clip-path: circle(55% at 100% 50%);
  position: relative;
  overflow: hidden;
  background: radial-gradient(circle at right center, #d4722a10 0%, transparent 70%);
  box-shadow: 0 0 30px rgba(0, 0, 0, 0.15);
}

.cover-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  filter: brightness(1.1) contrast(1.1) saturate(1.1);
}

.cover-image-overlay {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at 100% 50%, transparent 40%, #f5f5f015 100%);
}

/* Brand Label */
.cover-brand {
  position: absolute;
  top: 3rem;
  left: 3rem;
  z-index: 20;
}

.cover-company-name {
  text-transform: uppercase;
  letter-spacing: 0.3em;
  color: #f97316;
  font-weight: 300;
  font-size: 0.875rem;
}

/* Main Content */
.cover-content {
  position: relative;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 0 6rem;
  text-align: center;
}

.cover-text-container {
  max-width: 700px;
  margin: auto;
}

.cover-title {
  font-size: 5rem;
  font-weight: 700;
  background: linear-gradient(135deg, #8b4513 0%, #a0522d 30%, #cd853f 60%, #daa520 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.5));
  margin-bottom: 1rem;
}

.cover-subtitle {
  font-size: 1.25rem;
  color: #f97316;
  letter-spacing: 0.05em;
}

/* ==================== INTRO/ABOUT PAGE ==================== */
.crafted-page {
  display: flex;
  width: 100%;
  height: 100vh;
  background-color: #f8f6f0;
  font-family: "Inter", sans-serif;
  overflow: hidden;
}

/* Left Section */
.crafted-left {
  width: 60%;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 6rem 4rem 4rem 6rem;
}

.crafted-content {
  max-width: 100%;
  width: 100%;
}

.crafted-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #d4722a;
  letter-spacing: 0.08em;
  margin-bottom: 3rem;
  line-height: 1.2;
}

.crafted-paragraph {
  font-size: 0.95rem;
  color: #6b5d4f;
  line-height: 1.8;
  margin-bottom: 2.5rem;
  max-width: 85%;
}

.crafted-line-text {
  display: flex;
  align-items: flex-start;
  gap: 1.2rem;
  margin-bottom: 4rem;
  max-width: 85%;
}

.crafted-line {
  width: 4px;
  min-height: 150px;
  background-color: #d4722a;
  flex-shrink: 0;
  margin-top: 0;
}

.crafted-quote {
  font-size: 0.9rem;
  color: #6b5d4f;
  line-height: 1.8;
  font-style: italic;
  font-weight: 400;
}

/* Bottom Heritage + QR */
.crafted-bottom {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 1.2rem;
  margin-top: 5rem;
  max-width: 85%;
}

.crafted-heritage-text {
  color: #6b5d4f;
  font-size: 0.85rem;
  letter-spacing: 0.02em;
  font-weight: 400;
}

.crafted-qr {
  width: 2.5rem;
  height: 2.5rem;
  border: 1px solid #b8b8b8;
  display: flex;
  align-items: center;
  justify-content: center;
}

.crafted-qr-inner {
  width: 1.8rem;
  height: 1.8rem;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
}

.crafted-qr-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2px;
  width: 1.2rem;
  height: 1.2rem;
}

.crafted-qr-grid div {
  background: black;
  width: 100%;
  height: 100%;
  opacity: 0.7;
}

/* Right Image Section */
.crafted-right {
  width: 40%;
  height: 100%;
  overflow: hidden;
}

.crafted-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}

/* Responsive */
@media (max-width: 900px) {
  .crafted-page {
    flex-direction: column;
    height: auto;
  }

  .crafted-right {
    width: 100%;
    height: 40vh;
  }

  .crafted-left {
    padding: 3rem 2rem;
  }

  .crafted-title {
    font-size: 1.6rem;
  }
}

/* ==================== PRODUCTS PAGE ==================== */
.fmcg-products-page {
  width: 100%;
  min-height: 100vh;
  height: auto;
  background: linear-gradient(to bottom, #fef9f3 0%, #f9f5ed 100%);
  padding: 2rem 2.5rem 2rem 2.5rem;
  font-family: 'Inter', sans-serif;
  display: flex;
  flex-direction: column;
  page-break-after: always;
  overflow: visible;
  position: relative;
}

.fmcg-products-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 4rem;
}

.fmcg-products-header-left {
  flex: 1;
}

.fmcg-products-tag {
  font-size: 0.9rem;
  letter-spacing: 0.2em;
  color: #d97706;
  text-transform: uppercase;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.fmcg-products-title {
  font-size: 2.5rem;
  font-weight: 400;
  color: #2d2d2d;
  letter-spacing: 0.02em;
  font-family: 'Poppins', sans-serif;
}

.fmcg-products-pagination {
  font-size: 0.875rem;
  color: #d97706;
  font-weight: 500;
  white-space: nowrap;
}

.fmcg-products-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1.5rem;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
  padding: 0 2rem;
  flex: 1;
  align-content: start;
  grid-auto-flow: row;
}

.fmcg-product-card {
  background: #ffffff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  display: flex;
  flex-direction: column;
  height: 100%;
  min-width: 0;
}

.fmcg-product-image-wrapper {
  position: relative;
  width: 100%;
  height: 280px;
  background: linear-gradient(135deg, #f5f5f5 0%, #ececec 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.fmcg-product-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.fmcg-product-placeholder {
  font-size: 4rem;
  opacity: 0.3;
}

.fmcg-product-body {
  padding: 1.75rem;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.fmcg-product-name {
  font-size: 1.25rem;
  font-weight: 500;
  color: #1a1a1a;
  margin-bottom: 0.5rem;
  line-height: 1.3;
}

.fmcg-product-description {
  font-size: 0.9rem;
  color: #666;
  line-height: 1.6;
  margin-bottom: 1rem;
  flex: 1;
}

.fmcg-product-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 1rem;
  border-top: 1px solid #f0f0f0;
}

.fmcg-product-price {
  font-size: 1.5rem;
  font-weight: 600;
  color: #d97706;
}

.fmcg-product-badge {
  background: #fef3c7;
  color: #92400e;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

@media print {
  .fmcg-products-page {
    page-break-after: always;
    break-after: page;
  }
}

/* ==================== CONTACT PAGE ==================== */
.fmcg-contact-wrapper {
  width: 100%;
  height: 100vh;
  display: flex;
  background: #ffffff;
  overflow: hidden;
}

.fmcg-contact-left {
  width: 50%;
  position: relative;
  overflow: hidden;
  background: #f3f3f3;
}

.fmcg-contact-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.fmcg-contact-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom right, rgba(0, 0, 0, 0.2), transparent);
}

.fmcg-contact-left-content {
  position: absolute;
  bottom: 4rem;
  left: 3rem;
  right: 3rem;
  z-index: 2;
}

.fmcg-contact-tagline {
  font-size: 0.75rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: white;
  margin-bottom: 1.5rem;
  font-weight: 500;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.fmcg-contact-quote {
  font-size: 1.1rem;
  line-height: 1.7;
  color: white;
  font-weight: 300;
  text-shadow: 0 2px 12px rgba(0, 0, 0, 0.4);
  font-style: italic;
}

.fmcg-contact-quote-box {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  padding: 2rem;
  border-radius: 8px;
  border-left: 4px solid #d97706;
}

.fmcg-contact-cta {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: #d97706;
  color: white;
  text-decoration: none;
  border-radius: 6px;
  font-weight: 500;
  font-size: 0.875rem;
  margin-top: 1.5rem;
}

.fmcg-contact-right {
  width: 50%;
  padding: 4rem 3rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  background: #fefefe;
}

.fmcg-contact-title {
  font-size: 2.5rem;
  font-weight: 400;
  color: #1a1a1a;
  margin-bottom: 0.5rem;
  letter-spacing: 0.05em;
}

.fmcg-contact-subtitle {
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 3rem;
  font-weight: 300;
}

.fmcg-contact-details {
  margin-bottom: 3rem;
}

.fmcg-contact-item {
  margin-bottom: 2rem;
}

.fmcg-contact-label {
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #1a1a1a;
  margin-bottom: 0.5rem;
}

.fmcg-contact-value {
  font-size: 0.95rem;
  color: #d97706;
  line-height: 1.6;
  font-weight: 400;
}

.fmcg-contact-value-text {
  font-size: 0.9rem;
  color: #666;
  line-height: 1.6;
}

.fmcg-contact-socials-title {
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #1a1a1a;
  margin-bottom: 1rem;
}

.fmcg-contact-socials {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
}

.fmcg-contact-social {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  border: 2px solid #d97706;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #d97706;
  text-decoration: none;
}

.fmcg-contact-social svg {
  width: 20px;
  height: 20px;
}

.fmcg-contact-qr-section {
  margin-top: 2rem;
  text-align: center;
}

.fmcg-contact-qr-box {
  width: 80px;
  height: 80px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  margin: 0 auto 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.fmcg-contact-qr-text {
  font-size: 0.65rem;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: #999;
}

@media (max-width: 900px) {
  .fmcg-contact-wrapper {
    flex-direction: column;
  }
  
  .fmcg-contact-left,
  .fmcg-contact-right {
    width: 100%;
    height: auto;
    min-height: 50vh;
  }
  
  .fmcg-products-grid {
    grid-template-columns: 1fr;
    padding: 0 1rem;
  }
}

/* ==================== PRINT STYLES ==================== */
@media print {
  body, html {
    width: 210mm;
    height: 297mm;
    margin: 0;
    padding: 0;
  }
  
  .cover-page,
  .crafted-page,
  .fmcg-products-page,
  .fmcg-contact-wrapper {
    page-break-after: always;
    page-break-inside: avoid;
    width: 100%;
    height: 100vh;
    margin: 0;
    padding: 0;
  }
  
  @page {
    size: A4;
    margin: 0;
  }
}
`

const pages: IframePage[] = [
    {
        id: 'cover',
        name: 'Cover',
        html: `
<div class="cover-page">
  <div class="cover-bg">
    <div class="cover-bg-gradient"></div>
    <div class="cover-bg-triangle"></div>
    <div class="cover-bg-triangle-alt"></div>

    <div class="cover-image-wrapper">
      <div class="cover-image-circle">
        <img
          src="{{#catalogue.settings.mediaAssets.coverImageUrl}}{{catalogue.settings.mediaAssets.coverImageUrl}}{{/catalogue.settings.mediaAssets.coverImageUrl}}{{^catalogue.settings.mediaAssets.coverImageUrl}}{{#catalogue.products.0.imageUrl}}{{catalogue.products.0.imageUrl}}{{/catalogue.products.0.imageUrl}}{{^catalogue.products.0.imageUrl}}https://images.unsplash.com/photo-1657958977261-d75e81b4713f?auto=format&fit=crop&w=1200&q=80{{/catalogue.products.0.imageUrl}}{{/catalogue.settings.mediaAssets.coverImageUrl}}"
          alt="Cover"
          class="cover-image"
        />
        <div class="cover-image-overlay"></div>
      </div>
    </div>
  </div>

  <div class="cover-brand">
    <span class="cover-company-name">{{#catalogue.settings.companyInfo.companyName}}{{catalogue.settings.companyInfo.companyName}}{{/catalogue.settings.companyInfo.companyName}}{{^catalogue.settings.companyInfo.companyName}}{{#profile.companyName}}{{profile.companyName}}{{/profile.companyName}}{{^profile.companyName}}FMCG BRAND{{/profile.companyName}}{{/catalogue.settings.companyInfo.companyName}}</span>
  </div>

  <div class="cover-content">
    <div class="cover-text-container">
      <h1 class="cover-title">{{#catalogue.name}}{{catalogue.name}}{{/catalogue.name}}{{^catalogue.name}}{{#catalogue.titleTop}}{{catalogue.titleTop}}{{/catalogue.titleTop}}{{^catalogue.titleTop}}CRAFTED{{/catalogue.titleTop}}{{/catalogue.name}}</h1>
      <p class="cover-subtitle">{{#catalogue.tagline}}{{catalogue.tagline}}{{/catalogue.tagline}}{{^catalogue.tagline}}{{#catalogue.description}}{{catalogue.description}}{{/catalogue.description}}{{^catalogue.description}}Premium selections for the discerning palate{{/catalogue.description}}{{/catalogue.tagline}}</p>
    </div>
  </div>
</div>
    `,
    },

    {
        id: 'intro',
        name: 'About',
        html: `
<div class="crafted-page">
  <!-- Left Content -->
  <div class="crafted-left">
    <div class="crafted-content">
      <h1 class="crafted-title">{{#catalogue.settings.companyInfo.companyName}}{{catalogue.settings.companyInfo.companyName}}{{/catalogue.settings.companyInfo.companyName}}{{^catalogue.settings.companyInfo.companyName}}{{#profile.companyName}}{{profile.companyName}}{{/profile.companyName}}{{^profile.companyName}}CRAFTED EXCELLENCE{{/profile.companyName}}{{/catalogue.settings.companyInfo.companyName}}</h1>

      <p class="crafted-paragraph">
        {{#catalogue.settings.companyInfo.companyDescription}}{{catalogue.settings.companyInfo.companyDescription}}{{/catalogue.settings.companyInfo.companyDescription}}{{^catalogue.settings.companyInfo.companyDescription}}{{#catalogue.description}}{{catalogue.description}}{{/catalogue.description}}{{^catalogue.description}}At the heart of our philosophy lies a profound commitment to purity and effectiveness. Each formula is meticulously crafted using only the finest ingredients, sourced ethically from around the world.{{/catalogue.description}}{{/catalogue.settings.companyInfo.companyDescription}}
      </p>

      <div class="crafted-line-text">
        <div class="crafted-line"></div>
        <p class="crafted-quote">
          "{{#catalogue.quote}}{{catalogue.quote}}{{/catalogue.quote}}{{^catalogue.quote}}Our promise to you extends beyond products — it's a pledge to enhance your wellbeing through quality that nurtures both health and spirit. We create products that not only transform your lifestyle but elevate your daily experience into moments of genuine satisfaction and renewal.{{/catalogue.quote}}"
        </p>
      </div>

      <div class="crafted-bottom">
        <div class="crafted-heritage-text">{{#catalogue.tagline}}{{catalogue.tagline}}{{/catalogue.tagline}}{{^catalogue.tagline}}Discover our heritage{{/catalogue.tagline}}</div>
        <div class="crafted-qr">
          <div class="crafted-qr-inner">
            <div class="crafted-qr-grid">
              <div></div><div></div><div></div>
              <div></div><div></div><div></div>
              <div></div><div></div><div></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Right Image -->
  <div class="crafted-right">
    <img
      src="{{#catalogue.settings.mediaAssets.introImage}}{{catalogue.settings.mediaAssets.introImage}}{{/catalogue.settings.mediaAssets.introImage}}{{^catalogue.settings.mediaAssets.introImage}}{{#catalogue.products.1.imageUrl}}{{catalogue.products.1.imageUrl}}{{/catalogue.products.1.imageUrl}}{{^catalogue.products.1.imageUrl}}https://images.unsplash.com/photo-1657958977261-d75e81b4713f?auto=format&fit=crop&w=800&q=80{{/catalogue.products.1.imageUrl}}{{/catalogue.settings.mediaAssets.introImage}}"
      alt="Product Display"
      class="crafted-image"
    />
  </div>
</div>
    `,
    },

    {
        id: 'products',
        name: 'Products',
        html: `
<!-- Products Page (shows 3 products per page) -->
<div class="fmcg-products-page">
  <div class="fmcg-products-header">
    <div class="fmcg-products-header-left">
      <div class="fmcg-products-tag">{{#catalogue.tagline}}{{catalogue.tagline}}{{/catalogue.tagline}}{{^catalogue.tagline}}LUXE COLLECTION{{/catalogue.tagline}}</div>
      <h1 class="fmcg-products-title">{{#catalogue.name}}{{catalogue.name}}{{/catalogue.name}}{{^catalogue.name}}Premium Collection{{/catalogue.name}} - Page {{pageNumber}}</h1>
    </div>
    <div class="fmcg-products-pagination">{{pageNumber}} of {{totalProductPages}}</div>
  </div>

  <div class="fmcg-products-grid">
    {{#pageProducts}}
    <div class="fmcg-product-card">
      <div class="fmcg-product-image-wrapper">
        {{#imageUrl}}
        <img src="{{imageUrl}}" alt="{{name}}" class="fmcg-product-image">
        {{/imageUrl}}
        {{^imageUrl}}
        <div class="fmcg-product-placeholder">📦</div>
        {{/imageUrl}}
      </div>
      
      <div class="fmcg-product-body">
        <h3 class="fmcg-product-name">{{name}}</h3>
        {{#description}}
        <p class="fmcg-product-description">{{description}}</p>
        {{/description}}
        <div class="fmcg-product-footer">
          {{#price}}
          <div class="fmcg-product-price">₹{{price}}</div>
          {{/price}}
          {{^price}}
          <div class="fmcg-product-price">Contact for Price</div>
          {{/price}}
          {{#category}}
          <div class="fmcg-product-badge">{{category.name}}</div>
          {{/category}}
        </div>
      </div>
    </div>
    {{/pageProducts}}
    
    {{^pageProducts}}
    <!-- Fallback when no products on this page -->
    <div class="fmcg-product-card">
      <div class="fmcg-product-image-wrapper">
        <img src="https://images.unsplash.com/photo-1599490659213-e2b9527bd087?auto=format&fit=crop&w=400&q=80" alt="Sample Product" class="fmcg-product-image">
      </div>
      <div class="fmcg-product-body">
        <h3 class="fmcg-product-name">Sample Product 1</h3>
        <p class="fmcg-product-description">Add products to your catalogue to display them here. Each page shows up to 3 products.</p>
        <div class="fmcg-product-footer">
          <div class="fmcg-product-price">₹0</div>
          <div class="fmcg-product-badge">Sample</div>
        </div>
      </div>
    </div>
    
    <div class="fmcg-product-card">
      <div class="fmcg-product-image-wrapper">
        <img src="https://images.unsplash.com/photo-1585559700398-1385b3a8aeb6?auto=format&fit=crop&w=400&q=80" alt="Sample Product 2" class="fmcg-product-image">
      </div>
      <div class="fmcg-product-body">
        <h3 class="fmcg-product-name">Sample Product 2</h3>
        <p class="fmcg-product-description">When you add more than 3 products, additional pages are automatically created.</p>
        <div class="fmcg-product-footer">
          <div class="fmcg-product-price">₹0</div>
          <div class="fmcg-product-badge">Sample</div>
        </div>
      </div>
    </div>
    
    <div class="fmcg-product-card">
      <div class="fmcg-product-image-wrapper">
        <img src="https://images.unsplash.com/photo-1625772452859-1c03d5bf1137?auto=format&fit=crop&w=400&q=80" alt="Sample Product 3" class="fmcg-product-image">
      </div>
      <div class="fmcg-product-body">
        <h3 class="fmcg-product-name">Sample Product 3</h3>
        <p class="fmcg-product-description">Product 4 and onwards will appear on the next page automatically.</p>
        <div class="fmcg-product-footer">
          <div class="fmcg-product-price">₹0</div>
          <div class="fmcg-product-badge">Sample</div>
        </div>
      </div>
    </div>
    {{/pageProducts}}
  </div>
</div>
    `,
    }, {
        id: 'contact',
        name: 'Contact',
        html: `
<div class="fmcg-contact-wrapper">
  <div class="fmcg-contact-left">
    <img 
      src="{{#catalogue.settings.contactDetails.contactImage}}{{catalogue.settings.contactDetails.contactImage}}{{/catalogue.settings.contactDetails.contactImage}}{{^catalogue.settings.contactDetails.contactImage}}{{#catalogue.products.2.imageUrl}}{{catalogue.products.2.imageUrl}}{{/catalogue.products.2.imageUrl}}{{^catalogue.products.2.imageUrl}}https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?auto=format&fit=crop&w=800&q=80{{/catalogue.products.2.imageUrl}}{{/catalogue.settings.contactDetails.contactImage}}" 
      alt="Contact" 
      class="fmcg-contact-image"
    />
    <div class="fmcg-contact-overlay"></div>
    
    <div class="fmcg-contact-left-content">
      <div class="fmcg-contact-quote-box">
        <div class="fmcg-contact-tagline">{{#catalogue.settings.companyInfo.companyName}}{{catalogue.settings.companyInfo.companyName}}{{/catalogue.settings.companyInfo.companyName}}{{^catalogue.settings.companyInfo.companyName}}{{#profile.companyName}}{{profile.companyName}}{{/profile.companyName}}{{^profile.companyName}}Our Brand{{/profile.companyName}}{{/catalogue.settings.companyInfo.companyName}}</div>
        
        <p class="fmcg-contact-quote">"{{#catalogue.quote}}{{catalogue.quote}}{{/catalogue.quote}}{{^catalogue.quote}}{{#catalogue.tagline}}{{catalogue.tagline}}{{/catalogue.tagline}}{{^catalogue.tagline}}Crafting tomorrow's consumer experiences through premium quality and innovative solutions.{{/catalogue.tagline}}{{/catalogue.quote}}"</p>
        
        <p class="fmcg-contact-quote-small">
          {{#catalogue.settings.companyInfo.companyDescription}}{{catalogue.settings.companyInfo.companyDescription}}{{/catalogue.settings.companyInfo.companyDescription}}{{^catalogue.settings.companyInfo.companyDescription}}{{#catalogue.description}}{{catalogue.description}}{{/catalogue.description}}{{^catalogue.description}}Contact us to discover how we can help your brand excel in the FMCG world.{{/catalogue.description}}{{/catalogue.settings.companyInfo.companyDescription}}
        </p>
      </div>
      
    </div>
  </div>

  <div class="fmcg-contact-right">
    <h1 class="fmcg-contact-title">CONTACT US</h1>
    <p class="fmcg-contact-subtitle">We're here to assist you</p>
    
    <div class="fmcg-contact-details">
      {{#catalogue.settings.contactDetails.phone}}
      <div class="fmcg-contact-item">
        <div class="fmcg-contact-label">Customer Service</div>
        <div class="fmcg-contact-value">{{catalogue.settings.contactDetails.phone}}</div>
        {{#catalogue.settings.contactDetails.phoneHours}}
        <div class="fmcg-contact-value-text">{{catalogue.settings.contactDetails.phoneHours}}</div>
        {{/catalogue.settings.contactDetails.phoneHours}}
        {{^catalogue.settings.contactDetails.phoneHours}}
        <div class="fmcg-contact-value-text">Monday to Friday: 9am - 6pm EST<br>Saturday: 10am - 4pm EST</div>
        {{/catalogue.settings.contactDetails.phoneHours}}
      </div>
      {{/catalogue.settings.contactDetails.phone}}
      {{^catalogue.settings.contactDetails.phone}}
      {{#profile.phone}}
      <div class="fmcg-contact-item">
        <div class="fmcg-contact-label">Customer Service</div>
        <div class="fmcg-contact-value">{{profile.phone}}</div>
        <div class="fmcg-contact-value-text">Monday to Friday: 9am - 6pm EST</div>
      </div>
      {{/profile.phone}}
      {{/catalogue.settings.contactDetails.phone}}
      
      {{#catalogue.settings.contactDetails.email}}
      <div class="fmcg-contact-item">
        <div class="fmcg-contact-label">Email Inquiries</div>
        <div class="fmcg-contact-value">{{catalogue.settings.contactDetails.email}}</div>
      </div>
      {{/catalogue.settings.contactDetails.email}}
      {{^catalogue.settings.contactDetails.email}}
      {{#profile.email}}
      <div class="fmcg-contact-item">
        <div class="fmcg-contact-label">Email Inquiries</div>
        <div class="fmcg-contact-value">{{profile.email}}</div>
      </div>
      {{/profile.email}}
      {{/catalogue.settings.contactDetails.email}}
      
      {{#catalogue.settings.contactDetails.address}}
      <div class="fmcg-contact-item">
        <div class="fmcg-contact-label">Corporate Office</div>
        <div class="fmcg-contact-value-text">{{catalogue.settings.contactDetails.address}}{{#catalogue.settings.contactDetails.city}}, {{catalogue.settings.contactDetails.city}}{{/catalogue.settings.contactDetails.city}}</div>
      </div>
      {{/catalogue.settings.contactDetails.address}}
      {{^catalogue.settings.contactDetails.address}}
      {{#profile.address}}
      <div class="fmcg-contact-item">
        <div class="fmcg-contact-label">Corporate Office</div>
        <div class="fmcg-contact-value-text">{{profile.address}}{{#profile.city}}, {{profile.city}}{{/profile.city}}</div>
      </div>
      {{/profile.address}}
      {{/catalogue.settings.contactDetails.address}}
    </div>

    <div class="fmcg-contact-socials-title">Social Media</div>
    <div class="fmcg-contact-socials">
      {{#catalogue.settings.socialMedia.twitter}}
      <a href="{{catalogue.settings.socialMedia.twitter}}" target="_blank" class="fmcg-contact-social" title="Twitter">
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
      </a>
      {{/catalogue.settings.socialMedia.twitter}}
      
      {{#catalogue.settings.socialMedia.youtube}}
      <a href="{{catalogue.settings.socialMedia.youtube}}" target="_blank" class="fmcg-contact-social" title="YouTube">
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
      </a>
      {{/catalogue.settings.socialMedia.youtube}}
      
      {{#catalogue.settings.socialMedia.linkedin}}
      <a href="{{catalogue.settings.socialMedia.linkedin}}" target="_blank" class="fmcg-contact-social" title="LinkedIn">
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
      </a>
      {{/catalogue.settings.socialMedia.linkedin}}
      
      {{#catalogue.settings.socialMedia.facebook}}
      <a href="{{catalogue.settings.socialMedia.facebook}}" target="_blank" class="fmcg-contact-social" title="Facebook">
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
      </a>
      {{/catalogue.settings.socialMedia.facebook}}
    </div>
    
    <div class="fmcg-contact-qr-section">
      <div class="fmcg-contact-qr-box">
        <svg viewBox="0 0 100 100" style="width: 100%; height: 100%;">
          <rect x="10" y="10" width="15" height="15" fill="black"/>
          <rect x="30" y="10" width="5" height="5" fill="black"/>
          <rect x="40" y="10" width="5" height="5" fill="black"/>
          <rect x="50" y="10" width="5" height="5" fill="black"/>
          <rect x="75" y="10" width="15" height="15" fill="black"/>
          <rect x="10" y="30" width="5" height="5" fill="black"/>
          <rect x="20" y="30" width="5" height="5" fill="black"/>
          <rect x="35" y="35" width="5" height="5" fill="black"/>
          <rect x="45" y="30" width="5" height="5" fill="black"/>
          <rect x="75" y="30" width="5" height="5" fill="black"/>
          <rect x="85" y="30" width="5" height="5" fill="black"/>
          <rect x="10" y="75" width="15" height="15" fill="black"/>
          <rect x="30" y="85" width="5" height="5" fill="black"/>
          <rect x="50" y="75" width="5" height="5" fill="black"/>
          <rect x="65" y="80" width="5" height="5" fill="black"/>
          <rect x="80" y="85" width="5" height="5" fill="black"/>
        </svg>
      </div>
      <p class="fmcg-contact-qr-text">Scan for Digital Catalogue</p>
    </div>
  </div>
</div>
    `,
    },
]

export const FMCGCatalogueTemplate: PrebuiltHtmlTemplate = {
    id: 'fmcg-catalogue',
    name: 'FMCG Catalogue',
    engine: 'mustache',
    sharedCss,
    pages,
    pageGenerator: (data: any, basePages: IframePage[]) => {
        // Generate dynamic product pages based on products count
        const products = data?.catalogue?.products || []

        if (products.length === 0) {
            // Return base pages if no products
            return basePages
        }

        // Get non-product pages (cover, intro, contact)
        const coverPage = basePages.find(p => p.id === 'cover')
        const introPage = basePages.find(p => p.id === 'intro')
        const productPageTemplate = basePages.find(p => p.id === 'products')
        const contactPage = basePages.find(p => p.id === 'contact')

        const result: IframePage[] = []

        // Add cover and intro pages
        if (coverPage) result.push(coverPage)
        if (introPage) result.push(introPage)

        // Generate product pages (3 products per page)
        if (productPageTemplate) {
            const productsPerPage = 3
            const totalPages = Math.ceil(products.length / productsPerPage)

            for (let i = 0; i < totalPages; i++) {
                const startIdx = i * productsPerPage
                const pageProducts = products.slice(startIdx, startIdx + productsPerPage)

                result.push({
                    ...productPageTemplate,
                    id: `products-${i + 1}`,
                    name: `Products ${i + 1}`,
                })
            }
        }

        // Add contact page
        if (contactPage) result.push(contactPage)

        return result
    },
    dataTransform: (data: any) => {
        // This transform is called per-page during rendering
        // We don't need to modify the global data structure anymore
        // The pageGenerator handles page creation
        return data
    }
}

export default FMCGCatalogueTemplate
