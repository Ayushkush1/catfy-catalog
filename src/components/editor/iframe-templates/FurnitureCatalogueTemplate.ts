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

  .intro-left::after {
    content: '';
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.1);
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
    width: 400px;
    height: 400px;
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
  }

  .aurum-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 32px;
    height: 100%;
  }

  .aurum-card {
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 6px rgba(0,0,0,0.05);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    transition: all 0.3s ease;
  }

  .aurum-card:hover {
    box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  }

  .aurum-card-image {
    height: 250px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .aurum-card-icon {
    font-size: 48px;
    color: rgba(255,255,255,0.9);
  }

  .aurum-card-body {
    padding: 24px;
  }

  .aurum-card-title {
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 8px;
  }

  .aurum-card-price {
    font-size: 20px;
    font-weight: bold;
    color: var(--aurum-accent);
    margin-bottom: 12px;
  }

  .aurum-specs {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .aurum-spec {
    display: flex;
    justify-content: space-between;
    font-size: 14px;
    color: #555;
  }

  .aurum-spec-label {
    color: var(--aurum-muted);
  }

  .aurum-spec-value {
    font-weight: 600;
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


`;

// ---------- Pages ----------

const pages: IframePage[] = [
  // 1. Cover Page (Dark)
  {
    id: 'cover',
    name: 'Cover',
    html: `
<div class="cover"><header class="catalogue-hero-header">
  <div>SMELLADDA</div>
  <div>CATALOGUE 2025</div>
</header>

<div class="catalogue-hero-container">
  <div class="catalogue-hero-left">
    <h1>CRAFTED<br>EXCELLENCE</h1>
    <h2>CATALOG</h2>
    <p>Curated designs that transform spaces into expressions of elegance and comfort.</p>
    <a href="#" class="catalogue-hero-btn">EXPLORE COLLECTION</a>
  </div>

  <div class="catalogue-hero-right">
    <div class="catalogue-hero-product">
      <img src="https://images.unsplash.com/photo-1616627454908-b60f3e5af327?auto=format&fit=crop&w=600&q=80" alt="Product">
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
    <img src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80" alt="Intro Image">
  </div>

  <!-- Right Side Content -->
  <div class="intro-right">
    <h1>CATALOG</h1>
    <h2>Atta mazii satak liiii bolo rosking</h2>

    <div class="intro-company">
      <span>COMPANY NAME</span>
      <p>Curated designs that transform spaces into expressions of elegance and comfort.</p>
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
      <h1>AURUM</h1>
      <p>LUXURY FURNITURE CATALOGUE – PAGE 1</p>
    </div>
    <div class="aurum-header-right">
      <span>1 / 2</span>
    </div>
  </header>

  <!-- Content -->
  <main class="aurum-content">
    <div class="aurum-grid">
      <!-- Card 1 -->
      <div class="aurum-card">
        <div class="aurum-card-image" style="background-color:#D2B48C;">
          <div class="aurum-card-icon">🪑</div>
        </div>
        <div class="aurum-card-body">
          <h3 class="aurum-card-title">Langley Armchair</h3>
          <p class="aurum-card-price">₹1,52,450</p>
          <div class="aurum-specs">
            <div class="aurum-spec"><span class="aurum-spec-label">Dimensions:</span><span class="aurum-spec-value">W30" × D30" × H32"</span></div>
            <div class="aurum-spec"><span class="aurum-spec-label">Finishes:</span><span class="aurum-spec-value">Oak, Walnut, Mahogany</span></div>
          </div>
        </div>
      </div>

      <!-- Card 2 -->
      <div class="aurum-card">
        <div class="aurum-card-image" style="background-color:#8B4513;">
          <div class="aurum-card-icon">🛏️</div>
        </div>
        <div class="aurum-card-body">
          <h3 class="aurum-card-title">Vienna Dining Table</h3>
          <p class="aurum-card-price">₹2,78,250</p>
          <div class="aurum-specs">
            <div class="aurum-spec"><span class="aurum-spec-label">Dimensions:</span><span class="aurum-spec-value">L72" × W42" × H30"</span></div>
            <div class="aurum-spec"><span class="aurum-spec-label">Finishes:</span><span class="aurum-spec-value">Oak, Cherry, Birch</span></div>
          </div>
        </div>
      </div>

      <!-- Card 3 -->
      <div class="aurum-card">
        <div class="aurum-card-image" style="background-color:#696969;">
          <div class="aurum-card-icon">🪞</div>
        </div>
        <div class="aurum-card-body">
          <h3 class="aurum-card-title">Montauk Lounge Chair</h3>
          <p class="aurum-card-price">₹1,91,250</p>
          <div class="aurum-specs">
            <div class="aurum-spec"><span class="aurum-spec-label">Dimensions:</span><span class="aurum-spec-value">W32" × D32" × H30"</span></div>
            <div class="aurum-spec"><span class="aurum-spec-label">Finishes:</span><span class="aurum-spec-value">Natural Steel, Charcoal</span></div>
          </div>
        </div>
      </div>
    </div>
  </main>

  <!-- Footer -->
  <footer class="aurum-footer">
    <span>AURUM</span>
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
      <div class="aurum-contact-left" data-editor-path="left-section">
        <div class="aurum-contact-overlay" data-editor-path="overlay"></div>
        <div class="aurum-contact-quote" data-editor-path="quote">
          <p class="aurum-contact-quote-text">
            “Design is the silent ambassador of your brand.”
          </p>
          <p class="aurum-contact-quote-author">— Paul Rand</p>
        </div>
      </div>

      <!-- Right section with info -->
      <div class="aurum-contact-right" data-editor-path="right-section">
        <h1 class="aurum-contact-title" data-editor-path="title">Contact Us</h1>

        <div class="aurum-contact-details" data-editor-path="details">
          <p class="aurum-contact-info">Aurum Interiors Studio</p>
          <p class="aurum-contact-info">123 Serenity Lane, Bangalore, India</p>
          <p class="aurum-contact-info">+91 98765 43210</p>
          <p class="aurum-contact-info">hello@aurumstudio.com</p>
        </div>

        <div class="aurum-contact-socials" data-editor-path="socials">
          <a href="#" class="aurum-social-link">Instagram</a>
          <a href="#" class="aurum-social-link">LinkedIn</a>
          <a href="#" class="aurum-social-link">Behance</a>
        </div>

        <footer class="aurum-contact-footer" data-editor-path="footer">
          <p>© 2025 Aurum Studio. All rights reserved.</p>
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
}

export default SmellAddaCatalogTemplate
