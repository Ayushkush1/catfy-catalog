// src/components/editor/iframe-templates/SmellAddaCatalogTemplate.ts

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

// ---------- Shared CSS ----------
const sharedCss = `
:root {
  --dark-bg: #0b1220;
  --light-bg: #ffffff;
  --panel: #f3f4f6;
  --muted: #64748b;
  --text-dark: #0f172a;
  --text-light: #e2e8f0;
  --accent: #7c3aed;
  --accent-2: #22d3ee;
   --bg: #0f0f0f;
    --text: #fff;
    --muted: #b5b5b5;
    --yellow: #f9c900;
    --aurum-bg: #fafafa;
    --aurum-text: #222;
    --aurum-accent: #d97706;
    --aurum-border: #e0e0e0;
    --aurum-muted: #777;
}
* { box-sizing: border-box; }
html, body {
  margin: 0;
  padding: 0;
  font-family: system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, sans-serif;
  color: var(--text-dark);
}



.page {
  /* Rectangular canvas optimized for catalogue display */
  width: 1200px;
  height: 800px;
  margin: 0 auto;
  padding: 32px;
  border-radius: 16px;
  border: 1px solid rgba(0,0,0,0.08);
  overflow: hidden;
  background: var(--light-bg);
}
.page.dark {
  background: linear-gradient(180deg, #0b1220, #0b1220);
  color: var(--text-light);
  border: 1px solid rgba(255,255,255,0.06);
}

/* Common header/footer */
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid rgba(0,0,0,0.08);
}
.page.dark .header { border-color: rgba(255,255,255,0.08); }

.brand { font-weight: 700; letter-spacing: .3px; font-size: 18px; }
.nav { display: flex; gap: 12px; }
.nav a { text-decoration: none; color: inherit; opacity: .8; font-size: 14px; }
.nav a:hover { opacity: 1; }

.section {
  margin-top: 28px;
  padding: 24px;
  border-radius: 12px;
}

/* Headings & text */
.h1 { font-size: 36px; font-weight: 800; }
.h2 { font-size: 24px; font-weight: 700; margin-bottom: 12px; }
.lead { color: var(--muted); line-height: 1.6; font-size: 15px; }

/* Buttons */
.btn-row { display: flex; gap: 12px; margin-top: 20px; flex-wrap: wrap; }
.btn {
  display: inline-flex; align-items: center; gap: 8px;
  height: 38px; padding: 0 16px;
  font-weight: 600; border-radius: 8px;
  border: 1px solid rgba(0,0,0,.1);
  background: rgba(0,0,0,.04);
  color: var(--text-dark);
}
.page.dark .btn { color: var(--text-light); border-color: rgba(255,255,255,.08); background: rgba(255,255,255,.06); }
.btn-primary {
  background: linear-gradient(180deg, var(--accent), var(--accent-2));
  color: white; border: none;
}

/* Grid + cards */
.grid {
  display: grid;
  /* Use four columns to utilize wider rectangular canvas */
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}
.card {
  background: var(--panel);
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid rgba(0,0,0,0.06);
}
.card .media {
  height: 140px;
  background-size: cover;
  background-position: center;
}
.card .body { padding: 12px 14px; }
.card .title { font-weight: 700; font-size: 15px; }
.card .price { font-weight: 600; color: var(--accent); margin-top: 6px; }
.card .desc { color: var(--muted); font-size: 13px; margin-top: 4px; }

/* Split layout (story/contact) */
.split {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  align-items: center;
}
.split .image {
  width: 100%;
  height: 420px;
  border-radius: 12px;
  background-size: cover;
  background-position: center;
}
.split .content { padding: 8px; }

/* Footer */
.footer {
  margin-top: 32px;
  padding-top: 16px;
  border-top: 1px dashed rgba(0,0,0,0.1);
  display: flex;
  justify-content: space-between;
  color: var(--muted);
  font-size: 13px;
}
.page.dark .footer { border-color: rgba(255,255,255,0.08); color: var(--text-light); }

/* Social icons simple row */
.socials {
  display: flex;
  gap: 12px;
  margin-top: 16px;
}
.socials a {
  text-decoration: none;
  font-size: 14px;
  color: var(--accent);
}

.intro-page {
  display: flex;
  
  height: 100vh;
}

  /* LEFT SIDE - Image section */
  .intro-left {
    position: relative;
    width: 50%;
    overflow: hidden;
    background: #e5e5e5;
  }
  .intro-left img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  /* Explicit overlay element placed inside .intro-left */
  .intro-left .intro-overlay {
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.1);
    pointer-events: none;
  }

  /* RIGHT SIDE - Content */
  .intro-right {
    width: 50%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 60px 80px;
    text-align: center;
  }

  .intro-right h1 {
    font-size: 48px;
    font-weight: 700;
    color: var(--text-dark);
    margin-bottom: 20px;
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }

  .intro-right h2 {
    font-size: 13px;
    font-weight: 400;
    color: var(--text-gray);
    margin-bottom: 60px;
    letter-spacing: 0.2em;
  }

  .intro-company {
    margin-top: auto;
    text-align: center;
  }

  .intro-company span {
    display: block;
    font-size: 12px;
    font-weight: 300;
    color: var(--muted);
    letter-spacing: 0.3em;
    text-transform: uppercase;
    margin-bottom: 10px;
  }

  .intro-company p {
    font-size: 12px;
    color: var(--muted);
    font-weight: 300;
    line-height: 1.6;
    max-width: 400px;
    margin: 0 auto;
  }

  @media (max-width: 900px) {
    .intro-page { flex-direction: column; }
    .intro-left, .intro-right { width: 100%; height: auto; }
    .intro-right { padding: 40px 20px; }
  }

  .catalogue-hero-header {
    position: absolute;
    top: 40px;
    left: 80px;
    right: 80px;
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    color: #aaa;
    letter-spacing: 3px;
  }

  .catalogue-hero-footer {
    position: absolute;
    bottom: 40px;
    width: 100%;
    text-align: center;
    color: #777;
    font-size: 12px;
    letter-spacing: 3px;
  }

  .catalogue-hero-container {
    width: 1100px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 80px;
  }

  .catalogue-hero-left {
    border: 1px solid #555;
    padding: 60px;
    max-width: 420px;
  }

  .catalogue-hero-left h1 {
    font-size: 60px;
    font-weight: 800;
    line-height: 1.1;
    letter-spacing: 5px;
    margin: 0 0 20px 0;
  }

  .catalogue-hero-left h2 {
    font-size: 20px;
    font-weight: 700;
    letter-spacing: 4px;
    margin: 0 0 10px 0;
  }

  .catalogue-hero-left p {
    color: var(--muted);
    font-size: 13px;
    line-height: 1.6;
    margin-bottom: 30px;
  }

  .catalogue-hero-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    color: #fff;
    text-decoration: none;
    border-bottom: 1px solid rgba(255,255,255,0.5);
    padding-bottom: 4px;
    letter-spacing: 2px;
    font-weight: 600;
    font-size: 12px;
  }

  .catalogue-hero-btn::after {
    content: '→';
    font-size: 14px;
  }

  .catalogue-hero-right {
    position: relative;
  }

  .catalogue-hero-product {
    width: 280px;
    height: 280px;
    border-radius: 4px;
    overflow: hidden;
  }

  .catalogue-hero-product img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
    filter: brightness(1.1) contrast(1.1) saturate(1.1);
  }

  .catalogue-hero-badge {
    position: absolute;
    bottom: -16px;
    right: -16px;
    background: var(--yellow);
    color: #000;
    font-weight: 700;
    font-size: 12px;
    padding: 10px 18px;
    letter-spacing: 2px;
  }

.cover {
    margin: 0;
    height: 100vh;
    font-family: 'Inter', sans-serif;
    background:
      radial-gradient(circle at 20% 30%, rgba(45,45,45,0.3) 0%, transparent 40%),
      radial-gradient(circle at 80% 70%, rgba(35,35,35,0.4) 0%, transparent 40%),
      linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 50%, #0f0f0f 100%),
      repeating-linear-gradient(
        45deg,
        rgba(255,255,255,0.005) 0px,
        rgba(255,255,255,0.005) 1px,
        transparent 1px,
        transparent 3px
      ),
      repeating-linear-gradient(
        -45deg,
        rgba(0,0,0,0.1) 0px,
        rgba(0,0,0,0.1) 1px,
        transparent 1px,
        transparent 4px
      );
    background-size: 100% 100%, 100% 100%, 100% 100%, 20px 20px, 25px 25px;
    color: var(--text);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .aurum-page {
    width: 100%;
    height: 100vh;
    display: flex;
    flex-direction: column;
    background: var(--aurum-bg);
    overflow: hidden;
  }

  /* Header */
  .aurum-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 32px 64px;
    background: #fff;
    border-bottom: 1px solid var(--aurum-border);
  }

  .aurum-header-left h1 {
    font-size: 28px;
    font-weight: bold;
    letter-spacing: 0.08em;
  }

  .aurum-header-left p {
    font-size: 13px;
    color: var(--aurum-muted);
    letter-spacing: 0.2em;
    margin-top: 4px;
  }

  .aurum-header-right span {
    font-size: 13px;
    color: #aaa;
    letter-spacing: 0.1em;
  }

  /* Product grid */
  .aurum-content {
    flex: 1;
    padding: 48px 64px;
    overflow: hidden;
  }

  .aurum-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 32px;
    height: 100%;
    align-content: start;
  }

  .aurum-card {
    background: #ffffff;
    border-radius: 0;
    box-shadow: 0 1px 4px rgba(0,0,0,0.06);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
    border: 1px solid rgba(0,0,0,0.08);
    position: relative;
  }

  .aurum-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(90deg, var(--aurum-accent), transparent);
    transform: scaleX(0);
    transform-origin: left;
    transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .aurum-card:hover::before {
    transform: scaleX(1);
  }

  .aurum-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 16px 48px rgba(0,0,0,0.12), 0 0 0 1px rgba(217,119,6,0.1);
    border-color: rgba(217,119,6,0.15);
  }

  .aurum-card-image {
    height: 320px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #fafafa 0%, #f0f0f0 100%);
    position: relative;
    overflow: hidden;
  }

  .aurum-card-image img {
    transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1), filter 0.5s ease;
    filter: grayscale(0%);
  }

  .aurum-card:hover .aurum-card-image img {
    transform: scale(1.1);
    filter: grayscale(0%) brightness(1.02);
  }

  .aurum-card-icon {
    font-size: 80px;
    color: rgba(217,119,6,0.15);
    opacity: 0.6;
  }

  .aurum-card-body {
    padding: 32px;
    flex: 1;
    display: flex;
    flex-direction: column;
    background: #ffffff;
    position: relative;
  }

  .aurum-card-title {
    font-size: 1.125rem;
    font-weight: 500;
    margin-bottom: 10px;
    color: #111;
    line-height: 1.3;
    letter-spacing: 0.005em;
    transition: color 0.3s ease;
  }

  .aurum-card:hover .aurum-card-title {
    color: var(--aurum-accent);
  }

  .aurum-card-price {
    font-size: 1.5rem;
    font-weight: 600;
    color: var(--aurum-accent);
    margin-bottom: 24px;
    letter-spacing: -0.02em;
    font-family: 'Georgia', serif;
  }
    margin-bottom: 12px;
  }

  .aurum-specs {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-top: auto;
    padding-top: 20px;
    border-top: 1px solid rgba(0,0,0,0.05);
  }

  .aurum-spec {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    font-size: 0.8125rem;
    color: #666;
    padding: 0;
    border-bottom: none;
    gap: 12px;
  }

  .aurum-spec:last-child {
    border-bottom: none;
  }

  .aurum-spec-label {
    font-weight: 600;
    color: #999;
    text-transform: uppercase;
    font-size: 0.625rem;
    letter-spacing: 0.08em;
    flex-shrink: 0;
  }

  .aurum-spec-value {
    font-weight: 400;
    color: #444;
    text-align: right;
    line-height: 1.5;
    font-size: 0.875rem;
  }
    border-bottom: none;
  }

  .aurum-spec-label {
    color: var(--aurum-muted);
    font-weight: 500;
  }

  .aurum-spec-value {
    font-weight: 600;
    color: #333;
    text-align: right;
    flex: 1;
    margin-left: 12px;
  }

  /* Footer */
  .aurum-footer {
    background: #fff;
    border-top: 1px solid var(--aurum-border);
    padding: 16px 64px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .aurum-footer span {
    font-size: 13px;
    color: #999;
    letter-spacing: 0.1em;
  }
.aurum-contact-page {
  display: flex;
  height: 100vh;
  width: 100%;
  font-family: Arial, sans-serif;
  overflow: hidden;
  background-color: #faf9f7;
}

/* Left Side */
.aurum-contact-left {
  flex: 1;
  position: relative;
  background-image: url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c');
  background-size: cover;
  background-position: center;
}

.aurum-contact-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
}

.aurum-contact-quote {
  position: absolute;
  bottom: 50px;
  left: 50px;
  color: #ffffff;
  max-width: 400px;
}

.aurum-contact-quote-text {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  line-height: 1.4;
}

.aurum-contact-quote-author {
  font-size: 1rem;
  opacity: 0.85;
}

/* Right Side */
.aurum-contact-right {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 60px;
  background-color: #ffffff;
  color: #222;
}

.aurum-contact-title {
  font-size: 2.5rem;
  margin-bottom: 2rem;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.aurum-contact-details {
  margin-bottom: 2rem;
}

.aurum-contact-info {
  margin: 0.3rem 0;
  font-size: 1rem;
  line-height: 1.6;
}

.aurum-contact-socials {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 2.5rem;
}

.aurum-social-link {
  text-decoration: none;
  color: #000;
  font-weight: 500;
  border-bottom: 1px solid transparent;
  transition: border 0.3s;
}

.aurum-social-link:hover {
  border-bottom: 1px solid #000;
}

.aurum-contact-footer {
  font-size: 0.85rem;
  color: #666;
}

/* ===== Responsive ===== */
@media (max-width: 900px) {
  .aurum-contact-page {
    flex-direction: column;
  }

  .aurum-contact-left,
  .aurum-contact-right {
    flex: unset;
    height: 50vh;
  }

  .aurum-contact-quote {
    bottom: 30px;
    left: 20px;
  }

  .aurum-contact-right {
    padding: 40px 20px;
    align-items: center;
    text-align: center;
  }
}


`

// ---------- Pages ----------

const pages: IframePage[] = [
  // 1. Cover Page (Dark)
  {
    id: 'cover',
    name: 'Cover',
    html: `
          <div class="cover">
          <header class="catalogue-hero-header">
            <div>{{#catalogue.settings.companyInfo.companyName}}{{catalogue.settings.companyInfo.companyName}}{{/catalogue.settings.companyInfo.companyName}}{{^catalogue.settings.companyInfo.companyName}}{{#profile.companyName}}{{profile.companyName}}{{/profile.companyName}}{{^profile.companyName}}AURUM{{/profile.companyName}}{{/catalogue.settings.companyInfo.companyName}}</div>
            <div>{{#catalogue.year}}Catalogue {{catalogue.year}}{{/catalogue.year}}{{^catalogue.year}}CATALOGUE 2025{{/catalogue.year}}</div>
          </header>

          <div class="catalogue-hero-container">
            <div class="catalogue-hero-left">
              <h1>
                {{#catalogue.titleTop}}{{catalogue.titleTop}}{{/catalogue.titleTop}}{{^catalogue.titleTop}}CRAFTED{{/catalogue.titleTop}}<br>
                {{#catalogue.titleBottom}}{{catalogue.titleBottom}}{{/catalogue.titleBottom}}{{^catalogue.titleBottom}}EXCELLENCE{{/catalogue.titleBottom}}
              </h1>
              <p>{{#catalogue.description}}{{catalogue.description}}{{/catalogue.description}}{{^catalogue.description}}Curated designs that transform spaces into expressions of elegance and comfort.{{/catalogue.description}}</p>
              <a href="#" class="catalogue-hero-btn">EXPLORE COLLECTION</a>
            </div>

            <div class="catalogue-hero-right">
              <div class="catalogue-hero-product">
                <img src="{{#catalogue.settings.mediaAssets.coverImageUrl}}{{catalogue.settings.mediaAssets.coverImageUrl}}{{/catalogue.settings.mediaAssets.coverImageUrl}}{{^catalogue.settings.mediaAssets.coverImageUrl}}{{#catalogue.products.0.imageUrl}}{{catalogue.products.0.imageUrl}}{{/catalogue.products.0.imageUrl}}{{^catalogue.products.0.imageUrl}}{{#product.image}}{{product.image}}{{/product.image}}{{^product.image}}https://images.unsplash.com/photo-1567016432779-094069958ea5?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=880{{/product.image}}{{/catalogue.products.0.imageUrl}}{{/catalogue.settings.mediaAssets.coverImageUrl}}" alt="Product">
              </div>
              <div class="catalogue-hero-badge">NEW ARRIVALS</div>
            </div>
          </div>

          <footer class="catalogue-hero-footer">
            PREMIUM QUALITY • SUSTAINABLE MATERIALS • TIMELESS DESIGN
          </footer>

          </div>
    `,
  },

  // 2. Story Page (Light)
  {
    id: 'story',
    name: 'Our Story',
    html: `
            <div class="intro-page">

              <!-- Left Side Image -->
              <div class="intro-left">
                <img src="{{#catalogue.introImage}}{{catalogue.introImage}}{{/catalogue.introImage}}{{^catalogue.introImage}}https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80{{/catalogue.introImage}}" alt="Intro Image">
              </div>

              <!-- Right Side Content -->
              <div class="intro-right">
                <h1>{{#profile.companyName}}{{profile.companyName}}{{/profile.companyName}}{{^profile.companyName}}{{#catalogue.name}}{{catalogue.name}}{{/catalogue.name}}{{^catalogue.name}}CATALOG{{/catalogue.name}}{{/profile.companyName}}</h1>
                <h2>{{#catalogue.tagline}}{{catalogue.tagline}}{{/catalogue.tagline}}{{^catalogue.tagline}}{{#profile.tagline}}{{profile.tagline}}{{/profile.tagline}}{{^profile.tagline}}Atta mazii satak liiii bolo rosking{{/profile.tagline}}{{/catalogue.tagline}}</h2>
                <h2>"{{#catalogue.quote}}{{catalogue.quote}}{{/catalogue.quote}}{{^catalogue.quote}}{{#catalogue.tagline}}{{catalogue.tagline}}{{/catalogue.tagline}}{{^catalogue.tagline}}{{#profile.tagline}}{{profile.tagline}}{{/profile.tagline}}{{^profile.tagline}}We are her to make an impact and make your profile shine{{/profile.tagline}}{{/catalogue.tagline}}{{/catalogue.quote}}"</h2>

                <div class="intro-company">
                  <span>{{#catalogue.settings.companyInfo.companyName}}{{catalogue.settings.companyInfo.companyName}}{{/catalogue.settings.companyInfo.companyName}}{{^catalogue.settings.companyInfo.companyName}}{{#profile.companyName}}{{profile.companyName}}{{/profile.companyName}}{{^profile.companyName}}AURUM{{/profile.companyName}}{{/catalogue.settings.companyInfo.companyName}}</span>
                  <p>{{#catalogue.settings.companyInfo.description}}{{catalogue.settings.companyInfo.description}}{{/catalogue.settings.companyInfo.description}}{{^catalogue.settings.companyInfo.description}}{{#catalogue.description}}{{catalogue.description}}{{/catalogue.description}}{{^catalogue.description}}Curated designs that transform spaces into expressions of elegance and comfort for us.{{/catalogue.description}}{{/catalogue.settings.companyInfo.description}}</p>
                </div>
              </div>

            </div>


    `,
  },

  // 3. Products Page (Light)
  {
    id: 'products',
    name: 'Products',
    html: `
            <div class="aurum-page">
              <!-- Header -->
              <header class="aurum-header">
                <div class="aurum-header-left">
                  <h1>{{#catalogue.settings.companyInfo.companyName}}{{catalogue.settings.companyInfo.companyName}}{{/catalogue.settings.companyInfo.companyName}}{{^catalogue.settings.companyInfo.companyName}}{{#profile.companyName}}{{profile.companyName}}{{/profile.companyName}}{{^profile.companyName}}AURUM{{/profile.companyName}}{{/catalogue.settings.companyInfo.companyName}}</h1>
                  <p>{{#catalogue.name}}{{catalogue.name}}{{/catalogue.name}}{{^catalogue.name}}LUXURY FURNITURE CATALOGUE{{/catalogue.name}}</p>
                </div>
                <div class="aurum-header-right">
                  <span>{{pageNumber}} / {{totalProductPages}}</span>
                </div>
              </header>

              <!-- Content -->
              <main class="aurum-content">
                <div class="aurum-grid">
                  {{#pageProducts}}
                  <div class="aurum-card">
                    <div class="aurum-card-image" style="background-color:#f3f4f6;">
                      {{#imageUrl}}<img src="{{imageUrl}}" alt="{{name}}" style="width:100%;height:100%;object-fit:cover" />{{/imageUrl}}{{^imageUrl}}<div class="aurum-card-icon">🪑</div>{{/imageUrl}}
                    </div>
                    <div class="aurum-card-body">
                      <h3 class="aurum-card-title">{{name}}</h3>
                      {{#price}}<p class="aurum-card-price">₹{{price}}</p>{{/price}}
                      <div class="aurum-specs">
                        {{#description}}<div class="aurum-spec"><span class="aurum-spec-label">Details</span><span class="aurum-spec-value">{{description}}</span></div>{{/description}}
                        {{#category}}<div class="aurum-spec"><span class="aurum-spec-label">Category</span><span class="aurum-spec-value">{{category.name}}</span></div>{{/category}}
                      </div>
                    </div>
                  </div>
                  {{/pageProducts}}
                  {{^pageProducts}}
                  <!-- Fallback products if no products available -->
                  <div class="aurum-card">
                    <div class="aurum-card-image" style="background-color:#f3f4f6;">
                      <div class="aurum-card-icon">🪑</div>
                    </div>
                    <div class="aurum-card-body">
                      <h3 class="aurum-card-title">Premium Sofa</h3>
                      <p class="aurum-card-price">₹45,999</p>
                      <div class="aurum-specs">
                        <div class="aurum-spec"><span class="aurum-spec-label">Details</span><span class="aurum-spec-value">Luxury comfort seating</span></div>
                        <div class="aurum-spec"><span class="aurum-spec-label">Category</span><span class="aurum-spec-value">Living Room</span></div>
                      </div>
                    </div>
                  </div>
                  <div class="aurum-card">
                    <div class="aurum-card-image" style="background-color:#f3f4f6;">
                      <div class="aurum-card-icon">🪑</div>
                    </div>
                    <div class="aurum-card-body">
                      <h3 class="aurum-card-title">Dining Table</h3>
                      <p class="aurum-card-price">₹32,500</p>
                      <div class="aurum-specs">
                        <div class="aurum-spec"><span class="aurum-spec-label">Details</span><span class="aurum-spec-value">Solid wood construction</span></div>
                        <div class="aurum-spec"><span class="aurum-spec-label">Category</span><span class="aurum-spec-value">Dining</span></div>
                      </div>
                    </div>
                  </div>
                  <div class="aurum-card">
                    <div class="aurum-card-image" style="background-color:#f3f4f6;">
                      <div class="aurum-card-icon">🪑</div>
                    </div>
                    <div class="aurum-card-body">
                      <h3 class="aurum-card-title">Office Chair</h3>
                      <p class="aurum-card-price">₹18,999</p>
                      <div class="aurum-specs">
                        <div class="aurum-spec"><span class="aurum-spec-label">Details</span><span class="aurum-spec-value">Ergonomic design</span></div>
                        <div class="aurum-spec"><span class="aurum-spec-label">Category</span><span class="aurum-spec-value">Office</span></div>
                      </div>
                    </div>
                  </div>
                  {{/pageProducts}}
                </div>
              </main>

              <!-- Footer -->
              <footer class="aurum-footer">
                <span>{{#catalogue.settings.companyInfo.companyName}}{{catalogue.settings.companyInfo.companyName}}{{/catalogue.settings.companyInfo.companyName}}{{^catalogue.settings.companyInfo.companyName}}{{#profile.companyName}}{{profile.companyName}}{{/profile.companyName}}{{^profile.companyName}}AURUM{{/profile.companyName}}{{/catalogue.settings.companyInfo.companyName}}</span>
                <span>© 2025 All rights reserved</span>
              </footer>
            </div>

    `,
  },

  // 4. Contact Page (Light)
  {
    id: 'contact',
    name: 'Contact',
    html: `
           <section class="aurum-contact-page" data-editor-path="contact-page">
              <!-- Left section with image & quote -->
              <div class="aurum-contact-left" data-editor-path="left-section" style="background-image: url('{{#catalogue.settings.contactDetails.contactImage}}{{catalogue.settings.contactDetails.contactImage}}{{/catalogue.settings.contactDetails.contactImage}}{{^catalogue.settings.contactDetails.contactImage}}https://images.unsplash.com/photo-1600585154340-be6161a56a0c{{/catalogue.settings.contactDetails.contactImage}}');">
                <div class="aurum-contact-overlay" data-editor-path="overlay"></div>
                <div class="aurum-contact-quote" data-editor-path="quote">
                  <p class="aurum-contact-quote-text">
                    "{{#catalogue.settings.contactDetails.contactQuote}}{{catalogue.settings.contactDetails.contactQuote}}{{/catalogue.settings.contactDetails.contactQuote}}{{^catalogue.settings.contactDetails.contactQuote}}Design is the silent ambassador of your brand.{{/catalogue.settings.contactDetails.contactQuote}}"
                  </p>
                  <p class="aurum-contact-quote-author">— {{#catalogue.settings.contactDetails.contactQuoteBy}}{{catalogue.settings.contactDetails.contactQuoteBy}}{{/catalogue.settings.contactDetails.contactQuoteBy}}{{^catalogue.settings.contactDetails.contactQuoteBy}}{{#profile.companyName}}{{profile.companyName}}{{/profile.companyName}}{{^profile.companyName}}Company Name{{/profile.companyName}}{{/catalogue.settings.contactDetails.contactQuoteBy}}</p>
                </div>
              </div>

              <!-- Right section with info -->
              <div class="aurum-contact-right" data-editor-path="right-section">
                <h1 class="aurum-contact-title" data-editor-path="title">Contact Us</h1>

                <div class="aurum-contact-details" data-editor-path="details">
                  <p class="aurum-contact-info">{{#catalogue.settings.companyInfo.companyName}}{{catalogue.settings.companyInfo.companyName}}{{/catalogue.settings.companyInfo.companyName}}{{^catalogue.settings.companyInfo.companyName}}{{#profile.companyName}}{{profile.companyName}}{{/profile.companyName}}{{^profile.companyName}}{{#profile.fullName}}{{profile.fullName}}{{/profile.fullName}}{{^profile.fullName}}Your Company{{/profile.fullName}}{{/profile.companyName}}{{/catalogue.settings.companyInfo.companyName}}</p>
                  
                  {{#catalogue.settings.contactDetails.address}}
                  <p class="aurum-contact-info">{{catalogue.settings.contactDetails.address}}{{#catalogue.settings.contactDetails.city}}, {{catalogue.settings.contactDetails.city}}{{/catalogue.settings.contactDetails.city}}{{#catalogue.settings.contactDetails.state}}, {{catalogue.settings.contactDetails.state}}{{/catalogue.settings.contactDetails.state}}</p>
                  {{/catalogue.settings.contactDetails.address}}
                  {{^catalogue.settings.contactDetails.address}}
                  {{#profile.address}}
                  <p class="aurum-contact-info">{{profile.address}}{{#profile.city}}, {{profile.city}}{{/profile.city}}{{#profile.state}}, {{profile.state}}{{/profile.state}}</p>
                  {{/profile.address}}
                  {{/catalogue.settings.contactDetails.address}}
                  
                  {{#catalogue.settings.contactDetails.phone}}
                  <p class="aurum-contact-info">{{catalogue.settings.contactDetails.phone}}</p>
                  {{/catalogue.settings.contactDetails.phone}}
                  {{^catalogue.settings.contactDetails.phone}}
                  {{#profile.phone}}
                  <p class="aurum-contact-info">{{profile.phone}}</p>
                  {{/profile.phone}}
                  {{/catalogue.settings.contactDetails.phone}}
                  
                  {{#catalogue.settings.contactDetails.email}}
                  <p class="aurum-contact-info">{{catalogue.settings.contactDetails.email}}</p>
                  {{/catalogue.settings.contactDetails.email}}
                  {{^catalogue.settings.contactDetails.email}}
                  {{#profile.email}}
                  <p class="aurum-contact-info">{{profile.email}}</p>
                  {{/profile.email}}
                  {{/catalogue.settings.contactDetails.email}}
                </div>

                <div class="aurum-contact-socials" data-editor-path="socials">
                  {{#catalogue.settings.socialMedia.instagram}}
                  <a href="{{catalogue.settings.socialMedia.instagram}}" target="_blank" class="aurum-social-link">Instagram</a>
                  {{/catalogue.settings.socialMedia.instagram}}
                  {{#catalogue.settings.socialMedia.linkedin}}
                  <a href="{{catalogue.settings.socialMedia.linkedin}}" target="_blank" class="aurum-social-link">LinkedIn</a>
                  {{/catalogue.settings.socialMedia.linkedin}}
                  {{#catalogue.settings.socialMedia.facebook}}
                  <a href="{{catalogue.settings.socialMedia.facebook}}" target="_blank" class="aurum-social-link">Facebook</a>
                  {{/catalogue.settings.socialMedia.facebook}}
                  {{#catalogue.settings.socialMedia.twitter}}
                  <a href="{{catalogue.settings.socialMedia.twitter}}" target="_blank" class="aurum-social-link">Twitter</a>
                  {{/catalogue.settings.socialMedia.twitter}}
                </div>

                <footer class="aurum-contact-footer" data-editor-path="footer">
                  <p>© {{#catalogue.year}}{{catalogue.year}}{{/catalogue.year}}{{^catalogue.year}}2025{{/catalogue.year}} {{#catalogue.settings.companyInfo.companyName}}{{catalogue.settings.companyInfo.companyName}}{{/catalogue.settings.companyInfo.companyName}}{{^catalogue.settings.companyInfo.companyName}}{{#profile.companyName}}{{profile.companyName}}{{/profile.companyName}}{{^profile.companyName}}Your Company{{/profile.companyName}}{{/catalogue.settings.companyInfo.companyName}}. All rights reserved.</p>
                </footer>
              </div>
            </section>

    `,
  },
]

// ---------- Export Template ----------
export const SmellAddaCatalogTemplate: PrebuiltHtmlTemplate = {
  id: 'furniture-catalog',
  name: 'Furniture Catalogue',
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

    // Get non-product pages
    const coverPage = basePages.find(p => p.id === 'cover')
    const storyPage = basePages.find(p => p.id === 'story')
    const productPageTemplate = basePages.find(p => p.id === 'products')
    const contactPage = basePages.find(p => p.id === 'contact')

    const result: IframePage[] = []

    // Add cover and story pages
    if (coverPage) result.push(coverPage)
    if (storyPage) result.push(storyPage)

    // Generate product pages (3 products per page)
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

    // Add contact page
    if (contactPage) result.push(contactPage)

    return result
  },
  dataTransform: (data: any) => {
    return data
  }
}

export default SmellAddaCatalogTemplate
