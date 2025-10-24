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

    @media (max-width: 900px) {
      .fashion-product-section {
        flex-direction: column;
        height: auto;
      }

      .fashion-product-image,
      .fashion-product-details {
        width: 100%;
        height: auto;
      }

      .fashion-product-details {
        padding: 40px;
      }
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
    <img src="https://images.unsplash.com/photo-1503341455253-b2e723bb3dbb?auto=format&fit=crop&w=1200&q=80" alt="Catalogue Cover">
  </div>

  <div class="fashion-cover__overlay"></div>

  <div class="fashion-cover__content">
    <h1 class="fashion-cover__title" data-editor-path="catalogue.name">VERITE</h1>
    <div class="fashion-cover__divider">
      <div class="fashion-cover__line"></div>
      <p class="fashion-cover__subtitle" data-editor-path="catalogue.description">FASHION COLLECTION</p>
      <div class="fashion-cover__line"></div>
    </div>
  </div>

  <div class="fashion-cover__footer">
    <span class="fashion-cover__year" data-editor-path="catalogue.year">Catalogue 2025</span>
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
      <img src="https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f" alt="Fashion Intro" class="fashion-intro-img" />
    </div>
    <div class="fashion-intro-overlay"></div>
  </div>

  <!-- Right: Text -->
  <div class="fashion-intro-right">
    <div class="fashion-intro-content">
      <h1 class="fashion-intro-title">VERITE</h1>
      <h2 class="fashion-intro-subtitle">FASHION IS FREEDOM</h2>

      <div class="fashion-intro-quote-wrap">
        <div class="fashion-intro-quote-line"></div>
        <div class="fashion-intro-quote-box">
          <p class="fashion-intro-quote">
            "The best way to predict the future is to invent it. Distinguishes between a leader and a follower."
          </p>
        </div>
      </div>

      <div class="fashion-intro-company">
        <span class="fashion-intro-company-name">VERITE HOUSE</span>
        <p class="fashion-intro-company-desc">
          We blend timeless design with contemporary fashion, empowering individuals to express their unique style through elegance and simplicity.
        </p>
        <p class="fashion-intro-year">Catalogue 2025</p>
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
<!-- Product 1 -->
<div class="fashion-product-section">
  <div class="fashion-product-image">
    <img src="https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f" alt="Langley Armchair">
  </div>
  <div class="fashion-product-details">
    <h1>Langley Armchair</h1>
    <p class="fashion-product-category">Modern Comfort</p>
    <div class="fashion-divider"></div>
    <p class="fashion-product-description">
      A modern interpretation of timeless elegance. The Langley Armchair combines minimalist structure with plush upholstery, perfect for creating a relaxing corner in your space.
    </p>
    <div class="fashion-bottom-line"></div>
    <div class="fashion-footer-row">
      <p>Exclusive Collection</p>
      <span class="fashion-price">₹12,499</span>
    </div>
  </div>
</div>

<!-- Product 2 -->
<div class="fashion-product-section reverse">
  <div class="fashion-product-image">
    <img src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d" alt="Elegant Fashion">
  </div>
  <div class="fashion-product-details">
    <h1>Vienna Dining Table</h1>
    <p class="fashion-product-category">Luxury Craft</p>
    <div class="fashion-divider"></div>
    <p class="fashion-product-description">
      Designed for gatherings and crafted with precision, the Vienna Table brings character and warmth to every meal. Its natural oak finish highlights fine craftsmanship.
    </p>
    <div class="fashion-bottom-line"></div>
    <div class="fashion-footer-row">
      <p>Exclusive Collection</p>
      <span class="fashion-price">₹24,999</span>
    </div>
  </div>
</div>

<!-- Product 3 -->
<div class="fashion-product-section">
  <div class="fashion-product-image">
    <img src="https://images.unsplash.com/photo-1523381210434-271e8be1f52b" alt="Fashion Collection">
  </div>
  <div class="fashion-product-details">
    <h1>Noir Sofa</h1>
    <p class="fashion-product-category">Urban Classic</p>
    <div class="fashion-divider"></div>
    <p class="fashion-product-description">
      With bold lines and deep tones, the Noir Sofa is an urban centerpiece designed for contemporary homes. A perfect balance of comfort and sophistication.
    </p>
    <div class="fashion-bottom-line"></div>
    <div class="fashion-footer-row">
      <p>Exclusive Collection</p>
      <span class="fashion-price">₹18,999</span>
    </div>
  </div>
</div>
    `,
  },

  {
    id: 'contact',
    name: 'Contact',
    html: `
<div class="cp-container">
  <!-- Left Side -->
  <div class="cp-left">
    <!-- Replace this src with your image URL -->
    <img src="https://images.unsplash.com/photo-1524504388940-b1c1722653e1" alt="Contact" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
    <div class="cp-left-placeholder" style="display:none;">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
      </svg>
      <p>No image uploaded</p>
    </div>
    <div class="cp-left-overlay"></div>
    <div class="cp-quote-box">
      <div class="cp-quote-inner">
        <blockquote class="cp-quote-text">"Where creativity meets craftsmanship"</blockquote>
        <cite class="cp-quote-author">VERITE ATELIER</cite>
      </div>
    </div>
  </div>

  <!-- Right Side -->
  <div class="cp-right">
    <h1 class="cp-contact-title">CONTACT</h1>

    <div class="cp-contact-details">
      <div class="cp-contact-item">
        <h3>ADDRESS</h3>
        <p>123 Fashion District<br>Paris, France 75001</p>
      </div>
      <div class="cp-contact-item">
        <h3>TELEPHONE</h3>
        <p>+33 1 42 86 87 88</p>
      </div>
      <div class="cp-contact-item">
        <h3>Email</h3>
        <p>contact@verite.fr</p>
      </div>
      <div class="cp-contact-item">
        <h3>Website</h3>
        <p>www.verite.fr</p>
      </div>
    </div>

    <div class="cp-socials">
      <!-- Replace # with your social links -->
      <a href="#"><svg viewBox="0 0 24 24"><path d="..."/></svg></a>
      <a href="#"><svg viewBox="0 0 24 24"><path d="..."/></svg></a>
      <a href="#"><svg viewBox="0 0 24 24"><path d="..."/></svg></a>
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
