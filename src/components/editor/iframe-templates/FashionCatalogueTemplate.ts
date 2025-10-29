// src/components/editor/iframe-templates/FashionCatalogueTemplate.ts

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
}

const sharedCss = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Inter:wght@300;400;500&display=swap');

:root {
  --fashion-cover-bg: #000;
  --fashion-cover-overlay: rgba(0, 0, 0, 0.25);
  --fashion-cover-text: #ffffff;
  /* Use Playfair for titles and Inter for body text */
  --fashion-cover-font-title: 'Playfair Display', Georgia, 'Times New Roman', serif;
  --fashion-cover-font-sub: 'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif;
  --fashion-cover-title-size: 14rem;
  --fashion-cover-spacing: 0.25em;
  --intro-bg-color: #ffffff;
  --intro-text-color: #2c2c2c;
  --intro-accent-color: #d2691e;
  --intro-secondary-color: #777;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body, html {
  height: 100%;
  width: 100%;
  background: var(--fashion-cover-bg);
  font-family: var(--fashion-cover-font-sub);
  margin: 0;
  padding: 0;
}

.fashion-cover {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  color: var(--fashion-cover-text);
}

.fashion-cover__background {
  position: absolute;
  inset: 0;
  z-index: 1;
}

.fashion-cover__background img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.fashion-cover__overlay {
  position: absolute;
  inset: 0;
  background: var(--fashion-cover-overlay);
  z-index: 2;
}

.fashion-cover__content {
  position: relative;
  z-index: 3;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.fashion-cover__title {
  font-family: var(--fashion-cover-font-title);
  font-size: var(--fashion-cover-title-size);
  font-weight: 700;
  letter-spacing: var(--fashion-cover-spacing);
  text-transform: uppercase;
  text-shadow: 2px 2px 6px rgba(0, 0, 0, 0.5);
  line-height: 1;
  text-align: center;
}

.fashion-cover__divider {
  display: flex;
  align-items: center;
  gap: 2rem;
  margin-top: 1rem;
}

.fashion-cover__line {
  width: 60px;
  height: 1px;
  background-color: rgba(255, 255, 255, 0.7);
}

.fashion-cover__subtitle {
  font-size: 0.9rem;
  font-weight: 300;
  letter-spacing: 0.25em;
  text-transform: uppercase;
  color: var(--fashion-cover-text);
}

.fashion-cover__footer {
  position: absolute;
  bottom: 30px;
  left: 50%;
  transform: translateX(-50%);
  text-align: center;
  z-index: 3;
}

.fashion-cover__year {
  font-size: 1rem;
  font-weight: 600;
  letter-spacing: 0.2em;
  text-transform: uppercase;
}

/* ===== Fashion Intro Page ===== */
    .fashion-intro-container {
      display: flex;
      height: 100vh;
      width: 100%;
      overflow: hidden;
      --fashion-bg: #ffffff;
      --fashion-text: #1a1a1a;
      --fashion-accent: #d2691e;
      --fashion-secondary: #777;
      font-family: "Inter", sans-serif;
      background-color: var(--fashion-bg);
      color: var(--fashion-text);
    }

    /* Left image */
    .fashion-intro-left {
      width: 50%;
      position: relative;
      overflow: hidden;
    }

    .fashion-intro-img-wrap {
      position: absolute;
      inset: 0;
    }

    .fashion-intro-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      filter: brightness(1.05);
    }

    .fashion-intro-overlay {
      position: absolute;
      inset: 0;
      background-color: rgba(0, 0, 0, 0.1);
    }

    /* Right content */
    .fashion-intro-right {
      width: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 4rem 3rem;
      box-sizing: border-box;
      background: var(--fashion-bg);
    }

    .fashion-intro-content {
      max-width: 90%;
    }

    .fashion-intro-title {
      font-family: "Playfair Display", serif;
      font-size: 4.5rem;
      letter-spacing: 0.03em;
      font-weight: 600;
      margin-bottom: 1rem;
      color: var(--fashion-text);
      line-height: 1.1;
    }

    .fashion-intro-subtitle {
      font-family: "Inter", sans-serif;
      font-size: 1rem;
      letter-spacing: 0.25em;
      text-transform: uppercase;
      color: var(--fashion-secondary);
      font-weight: 400;
      margin-bottom: 3rem;
    }

    .fashion-intro-quote-wrap {
      display: flex;
      align-items: flex-start;
      gap: 1.25rem;
      margin-bottom: 3.5rem;
    }

    .fashion-intro-quote-line {
      width: 2px;
      height: 70px;
      background: var(--fashion-accent);
      opacity: 0.5;
    }

    .fashion-intro-quote-box {
      background: #f9f9f9;
      padding: 1.5rem 2rem;
      border-radius: 8px;
      border-left: 3px solid var(--fashion-accent);
    }

    .fashion-intro-quote {
      font-family: "Playfair Display", serif;
      font-style: italic;
      font-weight: 400;
      font-size: 1rem;
      color: #444;
      line-height: 1.7;
    }

    .fashion-intro-company {
      margin-top: 4rem;
    }

    .fashion-intro-company-name {
      display: block;
      text-transform: uppercase;
      letter-spacing: 0.25em;
      font-size: 0.9rem;
      color: var(--fashion-secondary);
      font-weight: 500;
      margin-bottom: 0.5rem;
      font-family: "Inter", sans-serif;
    }

    .fashion-intro-company-desc {
      font-family: "Inter", sans-serif;
      font-size: 0.9rem;
      color: #555;
      line-height: 1.7;
      max-width: 400px;
    }

    .fashion-intro-year {
      margin-top: 1rem;
      font-family: "Inter", sans-serif;
      font-size: 0.8rem;
      color: #999;
      letter-spacing: 0.15em;
    }
.fashion-product-page {
      font-family: 'Poppins', Arial, sans-serif;
      color: #fff;
      width: 100%;
      overflow: hidden;
    }

    .fashion-product-section {
      display: flex;
      width: 100%;
      height: 100vh;
      min-height: 100vh;
    }

    .fashion-product-image {
      width: 50%;
      height: 100%;
      overflow: hidden;
      position: relative;
    }

    .fashion-product-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .fashion-product-details {
      width: 50%;
      background-color: #111;
      color: #fff;
      display: flex;
      flex-direction: column;
      justify-content: center;
      padding: 80px;
    }

    .fashion-product-details h1 {
      font-size: 44px;
      font-weight: 300;
      letter-spacing: 1px;
      margin-bottom: 10px;
    }

    .fashion-product-category {
      color: #888;
      text-transform: uppercase;
      font-size: 14px;
      letter-spacing: 2px;
      margin-bottom: 30px;
    }

    .fashion-divider {
      width: 60px;
      height: 1px;
      background-color: #ccc;
      margin-bottom: 30px;
    }

    .fashion-product-description {
      color: #bbb;
      font-size: 15px;
      line-height: 1.7;
      margin-bottom: 60px;
      max-width: 90%;
    }

    .fashion-bottom-line {
      width: 60px;
      height: 1px;
      background-color: #555;
      margin-bottom: 30px;
    }

    .fashion-footer-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-top: 80px;
    }

    .fashion-footer-row p {
      font-size: 13px;
      text-transform: uppercase;
      color: #999;
      letter-spacing: 1px;
    }

    .fashion-price {
      font-size: 28px;
      font-weight: 300;
      color: #fff;
    }

    /* Alternate layout */
    .fashion-product-section.reverse {
      flex-direction: row-reverse;
    }

    /* Unique class prefixes: cp- for Contact Page */
    .cp-container {
      width: 100%;
      height: 100vh;
      display: flex;
      overflow: hidden;
      background-color: #ffffff;
      font-family: sans-serif;
    }

    /* Left Column */
    .cp-left {
      width: 50%;
      position: relative;
      overflow: hidden;
      background-color: #f3f3f3;
    }
    .cp-left img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .cp-left-placeholder {
      width: 100%;
      height: 100%;
      background-color: #e0e0e0;
      display: flex;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 2rem;
    }
    .cp-left-placeholder svg {
      width: 10rem;
      height: 10rem;
      color: #9ca3af;
      margin-bottom: 1rem;
    }
    .cp-left-overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(to bottom right, rgba(0,0,0,0.1), transparent);
    }
    .cp-quote-box {
      position: absolute;
      inset: 0;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .cp-quote-inner {
      background-color: rgba(255,255,255,0.9);
      backdrop-filter: blur(4px);
      padding: 2rem;
      border-radius: 0.5rem;
      max-width: 20rem;
      text-align: center;
      box-shadow: 0 5px 15px rgba(0,0,0,0.1);
    }
    .cp-quote-text {
      font-size: 1.125rem;
      font-style: italic;
      margin-bottom: 1rem;
      color: #1f2937;
      font-family: serif;
    }
    .cp-quote-author {
      font-size: 0.875rem;
      text-transform: uppercase;
      color: #4b5563;
      font-weight: 300;
      letter-spacing: 1px;
    }

    /* Right Column */
    .cp-right {
      width: 50%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 3rem 4rem;
      background-color: #f9fafb;
    }
    .cp-contact-title {
      font-size: 2.5rem;
      font-weight: 300;
      text-align: center;
      margin-bottom: 3rem;
      letter-spacing: 2px;
      font-family: serif;
      color: #111827;
    }
    .cp-contact-details {
      text-align: center;
      margin-bottom: 3rem;
    }
    .cp-contact-item {
      margin-bottom: 1.5rem;
    }
    .cp-contact-item h3 {
      font-size: 0.75rem;
      font-weight: 500;
      margin-bottom: 0.25rem;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #4b5563;
    }
    .cp-contact-item p {
      font-size: 0.875rem;
      color: #1f2937;
      white-space: pre-line;
    }

    /* Social Media Icons */
    .cp-socials {
      display: flex;
      gap: 1rem;
      margin-bottom: 2rem;
    }
    .cp-socials a {
      width: 2.5rem;
      height: 2.5rem;
      background-color: #1f2937;
      border-radius: 9999px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background-color 0.3s;
    }
    .cp-socials a:hover {
      background-color: #374151;
    }
    .cp-socials svg {
      width: 1.25rem;
      height: 1.25rem;
      color: #ffffff;
    }

    /* QR Code */
    .cp-qr {
      text-align: center;
    }
    .cp-qr-box {
      width: 5rem;
      height: 5rem;
      margin: 0 auto 0.5rem;
      background-color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 0.25rem;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      border: 1px solid #e5e7eb;
    }
    .cp-qr-text {
      font-size: 0.625rem;
      text-transform: uppercase;
      color: #6b7280;
      letter-spacing: 1px;
    }



`

const pages: IframePage[] = [
  {
    id: 'cover',
    name: 'Cover',
    html: `
<section class="fashion-cover">
  <div class="fashion-cover__background">
    <img src="{{#catalogue.settings.mediaAssets.coverImageUrl}}{{catalogue.settings.mediaAssets.coverImageUrl}}{{/catalogue.settings.mediaAssets.coverImageUrl}}{{^catalogue.settings.mediaAssets.coverImageUrl}}{{#catalogue.products.0.imageUrl}}{{catalogue.products.0.imageUrl}}{{/catalogue.products.0.imageUrl}}{{^catalogue.products.0.imageUrl}}https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?auto=format&fit=crop&w=1200&q=80{{/catalogue.products.0.imageUrl}}{{/catalogue.settings.mediaAssets.coverImageUrl}}" alt="Catalogue Cover">
  </div>

  <div class="fashion-cover__overlay"></div>

  <div class="fashion-cover__content">
    <h1 class="fashion-cover__title" data-editor-path="catalogue.name">{{#catalogue.name}}{{catalogue.name}}{{/catalogue.name}}{{^catalogue.name}}{{#catalogue.settings.companyInfo.companyName}}{{catalogue.settings.companyInfo.companyName}}{{/catalogue.settings.companyInfo.companyName}}{{^catalogue.settings.companyInfo.companyName}}{{#profile.companyName}}{{profile.companyName}}{{/profile.companyName}}{{^profile.companyName}}VERITE{{/profile.companyName}}{{/catalogue.settings.companyInfo.companyName}}{{/catalogue.name}}</h1>
    <div class="fashion-cover__divider">
      <div class="fashion-cover__line"></div>
      <p class="fashion-cover__subtitle" data-editor-path="catalogue.description">{{#catalogue.description}}{{catalogue.description}}{{/catalogue.description}}{{^catalogue.description}}{{#catalogue.tagline}}{{catalogue.tagline}}{{/catalogue.tagline}}{{^catalogue.tagline}}FASHION COLLECTION{{/catalogue.tagline}}{{/catalogue.description}}</p>
      <div class="fashion-cover__line"></div>
    </div>
  </div>

  <div class="fashion-cover__footer">
    <span class="fashion-cover__year" data-editor-path="catalogue.year">{{#catalogue.year}}Catalogue {{catalogue.year}}{{/catalogue.year}}{{^catalogue.year}}Catalogue 2025{{/catalogue.year}}</span>
  </div>
</section>
    `,
  },

  {
    id: 'intro',
    name: 'Intro',
    html: `
<section class="fashion-intro-container">
  <!-- Left: Image -->
  <div class="fashion-intro-left">
    <div class="fashion-intro-img-wrap">
      <img src="{{#catalogue.introImage}}{{catalogue.introImage}}{{/catalogue.introImage}}{{^catalogue.introImage}}{{#catalogue.settings.mediaAssets.coverImageUrl}}{{catalogue.settings.mediaAssets.coverImageUrl}}{{/catalogue.settings.mediaAssets.coverImageUrl}}{{^catalogue.settings.mediaAssets.coverImageUrl}}https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f{{/catalogue.settings.mediaAssets.coverImageUrl}}{{/catalogue.introImage}}" alt="Fashion Intro" class="fashion-intro-img" />
    </div>
    <div class="fashion-intro-overlay"></div>
  </div>

  <!-- Right: Text -->
  <div class="fashion-intro-right">
    <div class="fashion-intro-content">
      <h1 class="fashion-intro-title">{{#catalogue.settings.companyInfo.companyName}}{{catalogue.settings.companyInfo.companyName}}{{/catalogue.settings.companyInfo.companyName}}{{^catalogue.settings.companyInfo.companyName}}{{#profile.companyName}}{{profile.companyName}}{{/profile.companyName}}{{^profile.companyName}}{{#catalogue.name}}{{catalogue.name}}{{/catalogue.name}}{{^catalogue.name}}VERITE{{/catalogue.name}}{{/profile.companyName}}{{/catalogue.settings.companyInfo.companyName}}</h1>
      <h2 class="fashion-intro-subtitle">{{#catalogue.tagline}}{{catalogue.tagline}}{{/catalogue.tagline}}{{^catalogue.tagline}}{{#profile.tagline}}{{profile.tagline}}{{/profile.tagline}}{{^profile.tagline}}FASHION IS FREEDOM{{/profile.tagline}}{{/catalogue.tagline}}</h2>

      <div class="fashion-intro-quote-wrap">
        <div class="fashion-intro-quote-line"></div>
        <div class="fashion-intro-quote-box">
          <p class="fashion-intro-quote">
            "{{#catalogue.quote}}{{catalogue.quote}}{{/catalogue.quote}}{{^catalogue.quote}}The best way to predict the future is to invent it. Distinguishes between a leader and a follower.{{/catalogue.quote}}"
          </p>
        </div>
      </div>

      <div class="fashion-intro-company">
        <span class="fashion-intro-company-name">{{#catalogue.settings.companyInfo.companyName}}{{catalogue.settings.companyInfo.companyName}}{{/catalogue.settings.companyInfo.companyName}}{{^catalogue.settings.companyInfo.companyName}}{{#profile.companyName}}{{profile.companyName}}{{/profile.companyName}}{{^profile.companyName}}VERITE HOUSE{{/profile.companyName}}{{/catalogue.settings.companyInfo.companyName}}</span>
        <p class="fashion-intro-company-desc">
          {{#catalogue.settings.companyInfo.companyDescription}}{{catalogue.settings.companyInfo.companyDescription}}{{/catalogue.settings.companyInfo.companyDescription}}{{^catalogue.settings.companyInfo.companyDescription}}{{#catalogue.description}}{{catalogue.description}}{{/catalogue.description}}{{^catalogue.description}}We blend timeless design with contemporary fashion, empowering individuals to express their unique style through elegance and simplicity.{{/catalogue.description}}{{/catalogue.settings.companyInfo.companyDescription}}
        </p>
        <p class="fashion-intro-year">{{#catalogue.year}}Catalogue {{catalogue.year}}{{/catalogue.year}}{{^catalogue.year}}Catalogue 2025{{/catalogue.year}}</p>
      </div>
    </div>
  </div>
</section>
    `,
  },

  {
    id: 'products',
    name: 'Products',
    html: `
{{#catalogue.products}}
<!-- Product (alternating layout) -->
<div class="fashion-product-section{{#even}} reverse{{/even}}">
  <div class="fashion-product-image">
    <img src="{{#imageUrl}}{{imageUrl}}{{/imageUrl}}{{^imageUrl}}https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f{{/imageUrl}}" alt="{{name}}">
  </div>
  <div class="fashion-product-details">
    <h1>{{name}}</h1>
    <p class="fashion-product-category">{{#category}}{{category.name}}{{/category}}{{^category}}Premium Collection{{/category}}</p>
    <div class="fashion-divider"></div>
    <p class="fashion-product-description">
      {{#description}}{{description}}{{/description}}{{^description}}Discover timeless elegance with this exclusive piece from our collection.{{/description}}
    </p>
    <div class="fashion-bottom-line"></div>
    <div class="fashion-footer-row">
      <p>Exclusive Collection</p>
      {{#price}}<span class="fashion-price">₹{{price}}</span>{{/price}}{{^price}}<span class="fashion-price">Contact for Price</span>{{/price}}
    </div>
  </div>
</div>
{{/catalogue.products}}

{{^catalogue.products}}
<!-- Fallback: Sample Products when no products available -->
<div class="fashion-product-section">
  <div class="fashion-product-image">
    <img src="https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f" alt="Sample Product">
  </div>
  <div class="fashion-product-details">
    <h1>Sample Product</h1>
    <p class="fashion-product-category">Add Products</p>
    <div class="fashion-divider"></div>
    <p class="fashion-product-description">
      Add your products to the catalogue to display them here. Each product will be beautifully showcased with images and details.
    </p>
    <div class="fashion-bottom-line"></div>
    <div class="fashion-footer-row">
      <p>Exclusive Collection</p>
      <span class="fashion-price">₹0</span>
    </div>
  </div>
</div>
{{/catalogue.products}}
    `,
  },

  {
    id: 'contact',
    name: 'Contact',
    html: `
<div class="cp-container">
  <!-- Left Side -->
  <div class="cp-left">
    <!-- Dynamic contact image -->
    <img src="{{#catalogue.settings.contactDetails.contactImage}}{{catalogue.settings.contactDetails.contactImage}}{{/catalogue.settings.contactDetails.contactImage}}{{^catalogue.settings.contactDetails.contactImage}}https://images.unsplash.com/photo-1524504388940-b1c1722653e1{{/catalogue.settings.contactDetails.contactImage}}" alt="Contact" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
    <div class="cp-left-placeholder" style="display:none;">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
      </svg>
      <p>No image uploaded</p>
    </div>
    <div class="cp-left-overlay"></div>
    <div class="cp-quote-box">
      <div class="cp-quote-inner">
        <blockquote class="cp-quote-text">"{{#catalogue.settings.contactDetails.contactQuote}}{{catalogue.settings.contactDetails.contactQuote}}{{/catalogue.settings.contactDetails.contactQuote}}{{^catalogue.settings.contactDetails.contactQuote}}Where creativity meets craftsmanship{{/catalogue.settings.contactDetails.contactQuote}}"</blockquote>
        <cite class="cp-quote-author">{{#catalogue.settings.contactDetails.contactQuoteBy}}{{catalogue.settings.contactDetails.contactQuoteBy}}{{/catalogue.settings.contactDetails.contactQuoteBy}}{{^catalogue.settings.contactDetails.contactQuoteBy}}{{#catalogue.settings.companyInfo.companyName}}{{catalogue.settings.companyInfo.companyName}}{{/catalogue.settings.companyInfo.companyName}}{{^catalogue.settings.companyInfo.companyName}}{{#profile.companyName}}{{profile.companyName}}{{/profile.companyName}}{{^profile.companyName}}VERITE ATELIER{{/profile.companyName}}{{/catalogue.settings.companyInfo.companyName}}{{/catalogue.settings.contactDetails.contactQuoteBy}}</cite>
      </div>
    </div>
  </div>

  <!-- Right Side -->
  <div class="cp-right">
    <h1 class="cp-contact-title">CONTACT</h1>

    <div class="cp-contact-details">
      {{#catalogue.settings.contactDetails.address}}
      <div class="cp-contact-item">
        <h3>ADDRESS</h3>
        <p>{{catalogue.settings.contactDetails.address}}{{#catalogue.settings.contactDetails.city}}<br>{{catalogue.settings.contactDetails.city}}{{#catalogue.settings.contactDetails.state}}, {{catalogue.settings.contactDetails.state}}{{/catalogue.settings.contactDetails.state}} {{#catalogue.settings.contactDetails.country}}{{catalogue.settings.contactDetails.country}}{{/catalogue.settings.contactDetails.country}}{{/catalogue.settings.contactDetails.city}}</p>
      </div>
      {{/catalogue.settings.contactDetails.address}}
      {{^catalogue.settings.contactDetails.address}}
      {{#profile.address}}
      <div class="cp-contact-item">
        <h3>ADDRESS</h3>
        <p>{{profile.address}}{{#profile.city}}<br>{{profile.city}}{{#profile.state}}, {{profile.state}}{{/profile.state}}{{/profile.city}}</p>
      </div>
      {{/profile.address}}
      {{/catalogue.settings.contactDetails.address}}
      
      {{#catalogue.settings.contactDetails.phone}}
      <div class="cp-contact-item">
        <h3>TELEPHONE</h3>
        <p>{{catalogue.settings.contactDetails.phone}}</p>
      </div>
      {{/catalogue.settings.contactDetails.phone}}
      {{^catalogue.settings.contactDetails.phone}}
      {{#profile.phone}}
      <div class="cp-contact-item">
        <h3>TELEPHONE</h3>
        <p>{{profile.phone}}</p>
      </div>
      {{/profile.phone}}
      {{/catalogue.settings.contactDetails.phone}}
      
      {{#catalogue.settings.contactDetails.email}}
      <div class="cp-contact-item">
        <h3>EMAIL</h3>
        <p>{{catalogue.settings.contactDetails.email}}</p>
      </div>
      {{/catalogue.settings.contactDetails.email}}
      {{^catalogue.settings.contactDetails.email}}
      {{#profile.email}}
      <div class="cp-contact-item">
        <h3>EMAIL</h3>
        <p>{{profile.email}}</p>
      </div>
      {{/profile.email}}
      {{/catalogue.settings.contactDetails.email}}
      
      {{#catalogue.settings.contactDetails.website}}
      <div class="cp-contact-item">
        <h3>WEBSITE</h3>
        <p>{{catalogue.settings.contactDetails.website}}</p>
      </div>
      {{/catalogue.settings.contactDetails.website}}
      {{^catalogue.settings.contactDetails.website}}
      {{#profile.website}}
      <div class="cp-contact-item">
        <h3>WEBSITE</h3>
        <p>{{profile.website}}</p>
      </div>
      {{/profile.website}}
      {{/catalogue.settings.contactDetails.website}}
    </div>

    <div class="cp-socials">
      {{#catalogue.settings.socialMedia.instagram}}
      <a href="{{catalogue.settings.socialMedia.instagram}}" target="_blank" title="Instagram"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg></a>
      {{/catalogue.settings.socialMedia.instagram}}
      {{#catalogue.settings.socialMedia.facebook}}
      <a href="{{catalogue.settings.socialMedia.facebook}}" target="_blank" title="Facebook"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg></a>
      {{/catalogue.settings.socialMedia.facebook}}
      {{#catalogue.settings.socialMedia.twitter}}
      <a href="{{catalogue.settings.socialMedia.twitter}}" target="_blank" title="Twitter"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg></a>
      {{/catalogue.settings.socialMedia.twitter}}
      {{#catalogue.settings.socialMedia.linkedin}}
      <a href="{{catalogue.settings.socialMedia.linkedin}}" target="_blank" title="LinkedIn"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg></a>
      {{/catalogue.settings.socialMedia.linkedin}}
    </div>

    <div class="cp-qr">
      <div class="cp-qr-box">
        <svg viewBox="0 0 100 100">
          <rect x="0" y="0" width="100" height="100" fill="white"/>
          <rect x="10" y="10" width="15" height="15" fill="black"/>
          <rect x="75" y="10" width="15" height="15" fill="black"/>
          <rect x="10" y="75" width="15" height="15" fill="black"/>
          <rect x="30" y="30" width="5" height="5" fill="black"/>
          <rect x="40" y="20" width="5" height="5" fill="black"/>
          <rect x="50" y="30" width="5" height="5" fill="black"/>
          <rect x="60" y="40" width="5" height="5" fill="black"/>
          <rect x="70" y="50" width="5" height="5" fill="black"/>
          <rect x="30" y="60" width="5" height="5" fill="black"/>
          <rect x="45" y="70" width="5" height="5" fill="black"/>
          <rect x="65" y="65" width="5" height="5" fill="black"/>
          <rect x="80" y="80" width="5" height="5" fill="black"/>
        </svg>
      </div>
      <p class="cp-qr-text">SCAN FOR DIGITAL CATALOGUE</p>
    </div>
  </div>
</div>
    `,
  },
]

export const FashionCatalogueTemplate: PrebuiltHtmlTemplate = {
  id: 'fashion-catalogue',
  name: 'Fashion Catalogue',
  engine: 'mustache',
  sharedCss,
  pages,
}

export default FashionCatalogueTemplate
