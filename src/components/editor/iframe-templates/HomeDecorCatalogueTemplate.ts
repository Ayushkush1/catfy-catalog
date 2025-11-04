// src/components/editor/iframe-templates/HomeDecorCatalogueTemplate.ts

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
@import url('https://fonts.googleapis.com/css2?family=Gilda+Display:wght@400&family=Montserrat:wght@300;400;500;600&display=swap');

:root {
  --primary: #2c3639;
  --secondary: #3f4e4f;
  --accent: #a27b5c;
  --light: #dcd7c9;
  --bg-cream: #f9f5f0;
  --text-dark: #2c3639;
  --text-light: #f9f5f0;
  --muted: #8b8b8b;
  --border: rgba(44, 54, 57, 0.1);
  --shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

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
  font-family: 'Montserrat', sans-serif;
  color: var(--text-dark);
  background: var(--bg-cream);
  overflow: hidden;
}

.page {
  width: 1200px;
  height: 800px;
  margin: 0 auto;
  position: relative;
  overflow: hidden;
}

/* Cover Page */
.cover {
  height: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
  background: var(--bg-cream);
}

.cover-header {
  padding: 2rem 4rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.875rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--text-dark);
}

.cover-content {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  padding: 2rem 4rem;
  align-items: center;
}

.cover-text {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.cover-title {
  font-family: 'Gilda Display', serif;
  font-size: 4rem;
  line-height: 1.2;
  color: var(--primary);
}

.cover-subtitle {
  font-size: 1rem;
  line-height: 1.8;
  color: var(--secondary);
  max-width: 400px;
}

.cover-image {
  width: 100%;
  height: 500px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: var(--shadow);
}

.cover-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Product Cards */
.products-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2.5rem;
  padding: 3rem;
  height: 100%;
  align-content: center;
}

.product-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
  box-shadow: var(--shadow);
  display: flex;
  flex-direction: column;
}

.product-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
}

.product-image {
  width: 100%;
  height: 240px;
  position: relative;
  overflow: hidden;
  background: var(--bg-cream);
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.6s ease;
}

.product-card:hover .product-image img {
  transform: scale(1.08);
}

.product-info {
  padding: 1.5rem;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.product-category {
  font-size: 0.75rem;
  color: var(--accent);
  text-transform: uppercase;
  letter-spacing: 0.15em;
  margin-bottom: 0.75rem;
  font-weight: 500;
}

.product-name {
  font-family: 'Gilda Display', serif;
  font-size: 1.375rem;
  color: var(--primary);
  margin-bottom: 0.75rem;
  line-height: 1.3;
}

.product-description {
  font-size: 0.875rem;
  color: var(--muted);
  line-height: 1.7;
  margin-bottom: 1rem;
  flex: 1;
}

.products-header {
  margin-top: 1.5rem;
  margin-bottom: -2.5rem;
  text-align: center;
}

.product-price {
  font-size: 1.25rem;
  color: var(--primary);
  font-weight: 600;
  margin-top: auto;
}

/* Intro/Story Page */
.intro-page {
  display: flex;
  height: 100%;
  background: white;
}

.intro-left {
  width: 50%;
  position: relative;
  overflow: hidden;
}

.intro-left img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.intro-right {
  width: 50%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 4rem 5rem;
  background: var(--bg-cream);
}

.intro-badge {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  color: var(--accent);
  margin-bottom: 2rem;
}

.intro-title {
  font-family: 'Gilda Display', serif;
  font-size: 3rem;
  color: var(--primary);
  margin-bottom: 1rem;
  line-height: 1.2;
}

.intro-tagline {
  font-size: 1.125rem;
  font-style: italic;
  color: var(--accent);
  margin-bottom: 2rem;
}

.intro-description {
  font-size: 1rem;
  line-height: 1.8;
  color: var(--secondary);
  margin-bottom: 3rem;
}

.intro-quote {
  padding: 2rem;
  border-left: 3px solid var(--accent);
  background: white;
  border-radius: 8px;
  font-style: italic;
  color: var(--secondary);
  line-height: 1.8;
  box-shadow: var(--shadow);
}

/* Contact Section */
.contact {
  padding: 3rem 4rem;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;
  height: calc(100% - 100px);
}

.contact-image {
  width: 100%;
  height: 450px;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  position: relative;
}

.contact-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.contact-info {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.contact-title {
  font-family: 'Gilda Display', serif;
  font-size: 3rem;
  color: var(--primary);
  line-height: 1.2;
  margin-bottom: 0.5rem;
}

.contact-text {
  font-size: 1.0625rem;
  line-height: 1.8;
  color: var(--secondary);
  margin-bottom: 1rem;
}

.contact-details {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2rem;
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: var(--shadow);
}

.contact-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.contact-label {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  color: var(--accent);
  font-weight: 500;
}

.contact-value {
  font-size: 0.9375rem;
  color: var(--primary);
  line-height: 1.5;
  font-weight: 500;
}

/* Footer */
.footer {
  padding: 1.5rem 4rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 2px solid var(--border);
  background: white;
}

.footer-text {
  font-size: 0.8125rem;
  color: var(--muted);
  letter-spacing: 0.02em;
}

.social-links {
  display: flex;
  gap: 1.5rem;
  align-items: center;
}

.social-link {
  color: var(--secondary);
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 500;
  transition: color 0.3s ease;
}

.social-link:hover {
  color: var(--accent);
}

`

const pages: IframePage[] = [
  // Cover Page
  {
    id: 'cover',
    name: 'Cover',
    html: `
    <div class="page">
      <div class="cover">
        <header class="cover-header">
          <div>{{#catalogue.settings.companyInfo.companyName}}{{catalogue.settings.companyInfo.companyName}}{{/catalogue.settings.companyInfo.companyName}}{{^catalogue.settings.companyInfo.companyName}}{{#profile.companyName}}{{profile.companyName}}{{/profile.companyName}}{{^profile.companyName}}ELEGANT LIVING{{/profile.companyName}}{{/catalogue.settings.companyInfo.companyName}}</div>
          <div>{{#catalogue.year}}{{catalogue.year}}{{/catalogue.year}}{{^catalogue.year}}2025{{/catalogue.year}}</div>
        </header>

        <div class="cover-content">
          <div class="cover-text">
            <h1 class="cover-title">
              {{#catalogue.name}}{{catalogue.name}}{{/catalogue.name}}{{^catalogue.name}}Transform Your Space{{/catalogue.name}}
            </h1>
            <p class="cover-subtitle">
              {{#catalogue.description}}{{catalogue.description}}{{/catalogue.description}}{{^catalogue.description}}Discover our curated collection of premium home decor pieces that blend timeless elegance with contemporary design.{{/catalogue.description}}
            </p>
          </div>
          <div class="cover-image">
            {{#catalogue.settings.mediaAssets.coverImageUrl}}<img src="{{catalogue.settings.mediaAssets.coverImageUrl}}" alt="Cover Image" />{{/catalogue.settings.mediaAssets.coverImageUrl}}
            {{^catalogue.settings.mediaAssets.coverImageUrl}}{{#catalogue.products.0.imageUrl}}<img src="{{catalogue.products.0.imageUrl}}" alt="Cover Image" />{{/catalogue.products.0.imageUrl}}{{/catalogue.settings.mediaAssets.coverImageUrl}}
          </div>
        </div>
      </div>
    </div>
    `,
  },

  // Intro/Story Page
  {
    id: 'intro',
    name: 'Our Story',
    html: `
    <div class="page">
      <div class="intro-page">
        <div class="intro-left">
          {{#catalogue.settings.mediaAssets.introImage}}<img src="{{catalogue.settings.mediaAssets.introImage}}" alt="Our Story" />{{/catalogue.settings.mediaAssets.introImage}}
          {{^catalogue.settings.mediaAssets.introImage}}{{#catalogue.products.1.imageUrl}}<img src="{{catalogue.products.1.imageUrl}}" alt="Our Story" />{{/catalogue.products.1.imageUrl}}{{/catalogue.settings.mediaAssets.introImage}}
        </div>
        <div class="intro-right">
          <div class="intro-badge">Our Story</div>
          <h1 class="intro-title">
            {{#catalogue.settings.companyInfo.companyName}}{{catalogue.settings.companyInfo.companyName}}{{/catalogue.settings.companyInfo.companyName}}{{^catalogue.settings.companyInfo.companyName}}{{#profile.companyName}}{{profile.companyName}}{{/profile.companyName}}{{^profile.companyName}}Elegant Living{{/profile.companyName}}{{/catalogue.settings.companyInfo.companyName}}
          </h1>
          <p class="intro-tagline">
            {{#catalogue.tagline}}{{catalogue.tagline}}{{/catalogue.tagline}}{{^catalogue.tagline}}{{#profile.tagline}}{{profile.tagline}}{{/profile.tagline}}{{^profile.tagline}}Where elegance meets comfort{{/profile.tagline}}{{/catalogue.tagline}}
          </p>
          <p class="intro-description">
            {{#catalogue.settings.companyInfo.description}}{{catalogue.settings.companyInfo.description}}{{/catalogue.settings.companyInfo.description}}{{^catalogue.settings.companyInfo.description}}{{#catalogue.description}}{{catalogue.description}}{{/catalogue.description}}{{^catalogue.description}}We believe that every home deserves to be extraordinary. Our carefully curated collection brings together timeless design, exceptional craftsmanship, and sustainable materials to create pieces that transform houses into homes. Each item in our catalogue is selected with care, ensuring it meets our high standards for quality, beauty, and functionality.{{/catalogue.description}}{{/catalogue.settings.companyInfo.description}}
          </p>
          <div class="intro-quote">
            {{#catalogue.quote}}{{catalogue.quote}}{{/catalogue.quote}}{{^catalogue.quote}}"Design is not just what it looks like and feels like. Design is how it works." - Creating spaces that inspire and delight every day.{{/catalogue.quote}}
          </div>
        </div>
      </div>
    </div>
    `,
  },

  // Products Page Template
  {
    id: 'products',
    name: 'Products',
    html: `
    <div class="page">
      <header class="cover-header">
        <div>{{#catalogue.settings.companyInfo.companyName}}{{catalogue.settings.companyInfo.companyName}}{{/catalogue.settings.companyInfo.companyName}}{{^catalogue.settings.companyInfo.companyName}}{{#profile.companyName}}{{profile.companyName}}{{/profile.companyName}}{{^profile.companyName}}ELEGANT LIVING{{/profile.companyName}}{{/catalogue.settings.companyInfo.companyName}}</div>
        <div>COLLECTION</div>
      </header>
      <div class="products-header">
        <h2>Featured Products</h2>
        <p>Discover our curated selection of home decor items.</p>
      </div>
      <div class="products-grid">
        {{#pageProducts}}
        <div class="product-card">
          <div class="product-image">
            {{#imageUrl}}<img src="{{imageUrl}}" alt="{{name}}" />{{/imageUrl}}
            {{^imageUrl}}<div style="width:100%;height:100%;background:var(--bg-cream);display:flex;align-items:center;justify-content:center;color:var(--muted);font-size:3rem;">🏠</div>{{/imageUrl}}
          </div>
          <div class="product-info">
            {{#category}}<div class="product-category">{{category.name}}</div>{{/category}}
            <h3 class="product-name">{{name}}</h3>
            {{#description}}<p class="product-description">{{description}}</p>{{/description}}
            {{#price}}<div class="product-price">₹{{price}}</div>{{/price}}
          </div>
        </div>
        {{/pageProducts}}
      </div>
    </div>
    `,
  },

  // Contact Page
  {
    id: 'contact',
    name: 'Contact',
    html: `
    <div class="page">
      <div class="contact">
        <div class="contact-image">
          {{#catalogue.settings.contactDetails.contactImage}}<img src="{{catalogue.settings.contactDetails.contactImage}}" alt="Contact" />{{/catalogue.settings.contactDetails.contactImage}}
          {{^catalogue.settings.contactDetails.contactImage}}{{#catalogue.products.2.imageUrl}}<img src="{{catalogue.products.2.imageUrl}}" alt="Contact" />{{/catalogue.products.2.imageUrl}}{{/catalogue.settings.contactDetails.contactImage}}
        </div>
        <div class="contact-info">
          <h2 class="contact-title">Get in Touch</h2>
          <p class="contact-text">
            {{#catalogue.settings.contactDetails.contactQuote}}{{catalogue.settings.contactDetails.contactQuote}}{{/catalogue.settings.contactDetails.contactQuote}}
            {{^catalogue.settings.contactDetails.contactQuote}}Let's create your perfect space together. Reach out to us for personalized design consultations and product inquiries.{{/catalogue.settings.contactDetails.contactQuote}}
          </p>
          <div class="contact-details">
            <div class="contact-item">
              <span class="contact-label">Email</span>
              <span class="contact-value">{{#catalogue.settings.contactDetails.email}}{{catalogue.settings.contactDetails.email}}{{/catalogue.settings.contactDetails.email}}{{^catalogue.settings.contactDetails.email}}{{#profile.email}}{{profile.email}}{{/profile.email}}{{^profile.email}}hello@elegantliving.com{{/profile.email}}{{/catalogue.settings.contactDetails.email}}</span>
            </div>
            <div class="contact-item">
              <span class="contact-label">Phone</span>
              <span class="contact-value">{{#catalogue.settings.contactDetails.phone}}{{catalogue.settings.contactDetails.phone}}{{/catalogue.settings.contactDetails.phone}}{{^catalogue.settings.contactDetails.phone}}{{#profile.phone}}{{profile.phone}}{{/profile.phone}}{{^profile.phone}}+91 98765 43210{{/profile.phone}}{{/catalogue.settings.contactDetails.phone}}</span>
            </div>
            <div class="contact-item">
              <span class="contact-label">Address</span>
              <span class="contact-value">{{#catalogue.settings.contactDetails.address}}{{catalogue.settings.contactDetails.address}}{{/catalogue.settings.contactDetails.address}}{{^catalogue.settings.contactDetails.address}}{{#profile.address}}{{profile.address}}{{/profile.address}}{{^profile.address}}123 Design Street, Mumbai{{/profile.address}}{{/catalogue.settings.contactDetails.address}}</span>
            </div>
            <div class="contact-item">
              <span class="contact-label">Website</span>
              <span class="contact-value">{{#catalogue.settings.contactDetails.website}}{{catalogue.settings.contactDetails.website}}{{/catalogue.settings.contactDetails.website}}{{^catalogue.settings.contactDetails.website}}{{#profile.website}}{{profile.website}}{{/profile.website}}{{^profile.website}}www.elegantliving.com{{/profile.website}}{{/catalogue.settings.contactDetails.website}}</span>
            </div>
          </div>
        </div>
      </div>
      <footer class="footer">
        <div class="footer-text">© {{#catalogue.year}}{{catalogue.year}}{{/catalogue.year}}{{^catalogue.year}}2025{{/catalogue.year}} {{#catalogue.settings.companyInfo.companyName}}{{catalogue.settings.companyInfo.companyName}}{{/catalogue.settings.companyInfo.companyName}}{{^catalogue.settings.companyInfo.companyName}}{{#profile.companyName}}{{profile.companyName}}{{/profile.companyName}}{{^profile.companyName}}Elegant Living{{/profile.companyName}}{{/catalogue.settings.companyInfo.companyName}}. All rights reserved.</div>
        <div class="social-links">
          {{#catalogue.settings.socialMedia.instagram}}<a href="{{catalogue.settings.socialMedia.instagram}}" class="social-link" target="_blank">Instagram</a>{{/catalogue.settings.socialMedia.instagram}}
          {{#catalogue.settings.socialMedia.facebook}}<a href="{{catalogue.settings.socialMedia.facebook}}" class="social-link" target="_blank">Facebook</a>{{/catalogue.settings.socialMedia.facebook}}
          {{#catalogue.settings.socialMedia.linkedin}}<a href="{{catalogue.settings.socialMedia.linkedin}}" class="social-link" target="_blank">LinkedIn</a>{{/catalogue.settings.socialMedia.linkedin}}
          {{^catalogue.settings.socialMedia.instagram}}{{^catalogue.settings.socialMedia.facebook}}{{^catalogue.settings.socialMedia.linkedin}}<span class="social-link">Follow us on social media</span>{{/catalogue.settings.socialMedia.linkedin}}{{/catalogue.settings.socialMedia.facebook}}{{/catalogue.settings.socialMedia.instagram}}
        </div>
      </footer>
    </div>
    `,
  },
]

export const HomeDecorCatalogueTemplate: PrebuiltHtmlTemplate = {
  id: 'home-decor-catalogue',
  name: 'Home Decor Catalogue',
  engine: 'mustache',
  sharedCss,
  pages,
  pageGenerator: (data: any, basePages: IframePage[]) => {
    const products = data?.catalogue?.products || []

    if (products.length === 0) {
      return basePages
    }

    const coverPage = basePages.find(p => p.id === 'cover')
    const introPage = basePages.find(p => p.id === 'intro')
    const productPageTemplate = basePages.find(p => p.id === 'products')
    const contactPage = basePages.find(p => p.id === 'contact')

    const result: IframePage[] = []

    // Add cover page (Page 1)
    if (coverPage) result.push(coverPage)

    // Add intro page (Page 2)
    if (introPage) result.push(introPage)

    // Generate product pages (Page 3+) - 3 products per page
    if (productPageTemplate) {
      const productsPerPage = 3
      const totalPages = Math.ceil(products.length / productsPerPage)

      for (let i = 0; i < totalPages; i++) {
        result.push({
          ...productPageTemplate,
          id: `products-${i + 1}`,
          name: `Products ${i + 1}`,
        })
      }
    }

    // Add contact page (Last page)
    if (contactPage) result.push(contactPage)

    return result
  },
  dataTransform: (data: any) => {
    // Add debug logging
    console.log('🔄 HomeDecor dataTransform called with:', {
      hasProducts: !!data?.catalogue?.products,
      productsCount: data?.catalogue?.products?.length || 0,
      products: data?.catalogue?.products
    });

    return {
      ...data,
      // Add any additional transformations here if needed
    };
  }
}

export default HomeDecorCatalogueTemplate