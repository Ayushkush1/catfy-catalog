// src/components/editor/iframe-templates/SkinCareCatalogueTemplate.ts

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
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@300;400&family=Inter:wght@300;400&display=swap');

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
    }

    .catalogue-cover {
      position: relative;
      width: 100%;
      height: 100vh;
      overflow: hidden;
      font-family: 'Inter', sans-serif;
      color: white;
    }

    .catalogue-cover__background {
      position: absolute;
      inset: 0;
      z-index: 0;
    }

    .catalogue-cover__background img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .catalogue-cover__overlay {
      position: absolute;
      inset: 0;
      background: linear-gradient(to right, rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.2));
      z-index: 1;
    }

    .catalogue-cover__brand {
      position: absolute;
      top: 3rem;
      left: 4rem;
      font-size: 0.75rem;
      letter-spacing: 0.2em;
      color: #fff;
      font-family: 'Inter', sans-serif;
      font-weight: 300;
      text-transform: uppercase;
      z-index: 2;
      text-shadow: 2px 2px 10px rgba(0, 0, 0, 0.8);
    }

    .catalogue-cover__description-card {
      position: absolute;
      top: 50%;
      left: 4rem;
      transform: translateY(-50%);
      max-width: 380px;
      background: linear-gradient(135deg, rgba(139, 101, 64, 0.55), rgba(115, 80, 50, 0.6));
      padding: 2.5rem;
      color: #fff;
      font-size: 0.875rem;
      line-height: 1.8;
      z-index: 2;
      backdrop-filter: blur(12px);
      border-radius: 4px;
      font-family: 'Inter', sans-serif;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
      border: 1px solid rgba(255, 255, 255, 0.15);
    }

    .catalogue-cover__main-heading {
      position: absolute;
      top: 50%;
      right: 4rem;
      transform: translateY(-50%);
      text-align: right;
      max-width: 350px;
      font-family: 'Inter', sans-serif;
      z-index: 2;
      line-height: 1.2;
    }

    .catalogue-cover__main-heading h1 {
      font-size: 4rem;
      font-weight: 400;
      letter-spacing: 0.02em;
      color: #fff;
      text-shadow: 2px 2px 20px rgba(0, 0, 0, 0.8), 0 0 40px rgba(0, 0, 0, 0.5);
    }

    .catalogue-cover__highlight {
      color: #f97316;
    }

    .catalogue-cover__footer-text {
      position: absolute;
      bottom: 3rem;
      left: 50%;
      transform: translateX(-50%);
      font-size: 0.7rem;
      letter-spacing: 0.3em;
      font-weight: 300;
      text-transform: uppercase;
      color: #fff;
      z-index: 2;
      text-shadow: 2px 2px 10px rgba(0, 0, 0, 0.8);
    }

    @media (max-width: 768px) {
      .catalogue-cover__description-card,
      .catalogue-cover__main-heading {
        position: static;
        transform: none;
        text-align: center;
        margin: 2rem auto;
      }
      .catalogue-cover {
        height: auto;
        padding: 4rem 2rem;
      }
    }

    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@300;400&family=Inter:wght@300;400&display=swap');

    .brand-promise {
      position: relative;
      width: 100%;
      height: 100vh;
      overflow: hidden;
      background-color: #1f1616;
      font-family: 'Inter', sans-serif;
      color: white;
      display: flex;
      margin: 0;
      padding: 0;
    }

    .brand-promise__left {
      position: relative;
      width: 50%;
      overflow: hidden;
    }

    .brand-promise__image {
      position: absolute;
      inset: 0;
      background-color: #f3f4f6; /* Tailwind gray-100 */
      z-index: 1;
    }

    .brand-promise__image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .brand-promise__overlay {
      position: absolute;
      inset: 0;
      background-color: rgba(0, 0, 0, 0.1);
      z-index: 2;
    }

    .brand-promise__right {
      width: 50%;
      padding: 4rem;
      display: flex;
      flex-direction: column;
      justify-content: center;
      color: #fff;
      z-index: 3;
    }

    .brand-promise__content {
      max-width: 28rem;
    }

    .brand-promise__tag {
      color: #d97706;
      text-transform: uppercase;
      font-size: 0.75rem;
      font-weight: 500;
      letter-spacing: 0.2em;
      margin-bottom: 1rem;
      font-family: 'Inter', sans-serif;
    }

    .brand-promise__heading {
      font-family: 'Inter', sans-serif;
      font-weight: 300;
      font-size: 3rem;
      margin-bottom: 3rem;
      line-height: 1.2;
      color: #ffffff;
    }

    .brand-promise__paragraph {
      color: rgba(255, 255, 255, 0.7);
      font-size: 0.95rem;
      line-height: 1.8;
      margin-bottom: 2.5rem;
      font-family: 'Inter', sans-serif;
      font-weight: 300;
    }

    .brand-promise__divider {
      width: 5rem;
      height: 1px;
      background-color: rgba(255, 255, 255, 0.2);
      margin-bottom: 2.5rem;
    }

    .brand-promise__quote {
      color: rgba(255, 255, 255, 0.7);
      font-size: 0.95rem;
      line-height: 1.8;
      margin-bottom: 4rem;
      font-family: 'Inter', sans-serif;
      font-weight: 300;
    }

    @media (max-width: 900px) {
      .brand-promise {
        flex-direction: column;
      }
      .brand-promise__left,
      .brand-promise__right {
        width: 100%;
        height: 50vh;
      }
      .brand-promise__right {
        padding: 2rem;
      }
    }

@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@300;400&family=Inter:wght@300;400&display=swap');

    .daily-routine-page {
  position: relative;
  width: 100%;
  height: 100vh;
  background-color: #1f1616;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
}

.daily-routine-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 4rem;
}

.daily-routine-header h1 {
  color: white;
  font-weight: 300;
  font-size: 2.5rem;
  margin-bottom: 4rem;
  margin-top: 2rem;
}

.daily-routine-grid {
  display: flex;
  justify-content: center;
  gap: 4rem;
  flex-wrap: wrap;
}

.routine-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 250px;
}

.product-image-box {
  width: 300px;
  height: 350px;
  background: linear-gradient(to bottom right, #f5f5f5, #e5e5e5);
  border-radius: 16px;
  margin-bottom: 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
}

/* Step 1 */
.product-visual.step1 {
  position: relative;
  width: 6rem;
  height: 8rem;
  background: linear-gradient(to bottom, #bfdbfe, #93c5fd);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
}

.product-visual.step1 .product-top-dot {
  position: absolute;
  top: 0.5rem;
  left: 50%;
  transform: translateX(-50%);
  width: 1.5rem;
  height: 1.5rem;
  background: white;
  border-radius: 50%;
}

.product-visual.step1 .product-text {
  position: absolute;
  bottom: 1rem;
  left: 50%;
  transform: translateX(-50%);
  text-align: center;
}

.product-visual.step1 .product-brand {
  color: #1e3a8a;
  font-size: 0.75rem;
  font-weight: 500;
}

.product-visual.step1 .product-name {
  color: #2563eb;
  font-size: 0.7rem;
  margin-top: 0.25rem;
}

/* Step 2 */
.product-visual.step2 {
  position: relative;
  width: 5rem;
  height: 7rem;
  background: linear-gradient(to bottom, #f9fafb, #f3f4f6);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
}

.product-visual.step2 .product-top-gray {
  position: absolute;
  top: 0.5rem;
  left: 50%;
  transform: translateX(-50%);
  width: 1rem;
  height: 1.5rem;
  background: #d1d5db;
  border-radius: 6px;
}

.product-visual.step2 .product-text2 {
  position: absolute;
  top: 35%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #374151;
  font-size: 0.7rem;
  text-align: center;
  line-height: 1rem;
}

/* Step 3 */
.product-visual.step3 {
  position: relative;
  width: 8rem;
  height: 5rem;
  background: linear-gradient(to right, #ecfdf5, #d1fae5);
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
}

.product-visual.step3 .product-green-dot {
  position: absolute;
  top: 0.5rem;
  left: 0.5rem;
  width: 1rem;
  height: 1rem;
  background: #bbf7d0;
  border-radius: 50%;
}

.product-visual.step3 .product-text3 {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.product-visual.step3 .product-brand {
  color: #065f46;
  font-size: 0.75rem;
  font-weight: 500;
}

.product-visual.step3 .product-name {
  color: #16a34a;
  font-size: 0.7rem;
  margin-top: 0.25rem;
}

/* Step info */
.step-info h4 {
  color: #d1d5db;
  font-size: 1rem;
  margin-bottom: 0.5rem;
}

.step-info p {
  color: #9ca3af;
  font-size: 0.75rem;
  line-height: 1.2rem;
}


    .contactpage-container {
  width: 100%;
  height: 100vh;
  overflow: hidden;
  margin: 0;
  padding: 0;
}

.contactpage-wrapper {
  display: flex;
  height: 100%;
}

/* Left Section */
.contactpage-left {
  width: 50%;
  background-color: #f3f3f3;
  position: relative;
}

.contactpage-image-wrapper {
  width: 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
}

.contactpage-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.contactpage-image-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom right, rgba(0, 0, 0, 0.1), transparent);
}

/* Right Section */
.contactpage-right {
  width: 50%;
  background-color: #1f1616;
  display: flex;
  align-items: center;
  justify-content: center;
}

.contactpage-card {
  background-color: #f9ede8;
  border-radius: 12px;
  padding: 40px;
  max-width: 400px;
  width: 90%;
  text-align: center;
}

.contactpage-title {
  color: #b33b15;
  font-family: serif;
  font-size: 36px;
  font-weight: 300;
  margin-bottom: 40px;
  letter-spacing: 1px;
}

.contactpage-details {
  margin-bottom: 40px;
}

.contactpage-details > div {
  margin-bottom: 24px;
}

.contactpage-subtitle {
  color: #555;
  font-size: 12px;
  letter-spacing: 2px;
  text-transform: uppercase;
  margin-bottom: 8px;
  font-weight: 500;
}

.contactpage-text {
  color: #222;
  font-size: 14px;
  line-height: 1.5;
}

/* Social Media */
.contactpage-socials {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-bottom: 32px;
}

.contactpage-social {
  background-color: #b33b15;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.3s;
}

.contactpage-social:hover {
  background-color: #333;
}

.contactpage-social img {
  width: 20px;
  height: 20px;
}

/* QR Code */
.contactpage-qr {
  text-align: center;
}

.contactpage-qr-box {
  width: 80px;
  height: 80px;
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  margin: 0 auto 10px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.contactpage-qr-text {
  color: #666;
  font-size: 10px;
  letter-spacing: 1px;
  text-transform: uppercase;
}

/* Print Styles */
@media print {
  body, html {
    width: 210mm;
    height: 297mm;
    margin: 0;
    padding: 0;
  }
  
  .catalogue-cover,
  .brand-promise,
  .daily-routine,
  .contactpage-container {
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

.dailyRoutineSection {
  position: relative;
  width: 100%;
  height: 100vh;
  background-color: #1f1616;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
}

.dailyRoutineSection .dailyRoutineContainer {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 4rem;
  width: 100%;
}

.dailyRoutineSection .dailyRoutineHeader {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  margin-bottom: 4rem;
}

.dailyRoutineSection .dailyRoutineHeader h1 {
  color: #fff;
  font-weight: 300;
  font-size: 2.5rem;
  margin: 0 0 0.5rem 0;
  text-align: center;
  letter-spacing: 0.1em;
  font-family: 'Inter', sans-serif;
}

.dailyRoutineSection .dailyRoutinePagination {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.875rem;
  font-weight: 300;
  letter-spacing: 0.05em;
}

.dailyRoutineSection .dailyRoutineGrid {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  gap: 2rem;
  flex-wrap: nowrap;
  max-width: 1200px;
  margin: 0 auto;
}

.dailyRoutineSection .dailyRoutineStep {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  max-width: 350px;
}

.dailyRoutineSection .dailyRoutineImageBox {
  width: 100%;
  height: 350px;
  background: linear-gradient(to bottom right, #f5f5f5, #e5e5e5);
  border-radius: 12px;
  margin-bottom: 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
}

/* Step 1 */
.dailyRoutineSection .dailyRoutineVisual.step1 {
  position: relative;
  width: 6rem;
  height: 8rem;
  background: linear-gradient(to bottom, #bfdbfe, #93c5fd);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.dailyRoutineSection .dailyRoutineVisual.step1 .topDot {
  position: absolute;
  top: 0.5rem;
  left: 50%;
  transform: translateX(-50%);
  width: 1.5rem;
  height: 1.5rem;
  background: white;
  border-radius: 50%;
}

.dailyRoutineSection .dailyRoutineVisual.step1 .routineText {
  position: absolute;
  bottom: 1rem;
  left: 50%;
  transform: translateX(-50%);
  text-align: center;
}

.dailyRoutineSection .dailyRoutineVisual.step1 .brand {
  color: #1e3a8a;
  font-size: 0.75rem;
  font-weight: 500;
}

.dailyRoutineSection .dailyRoutineVisual.step1 .name {
  color: #2563eb;
  font-size: 0.7rem;
  margin-top: 0.25rem;
}

/* Step 2 */
.dailyRoutineSection .dailyRoutineVisual.step2 {
  position: relative;
  width: 5rem;
  height: 7rem;
  background: linear-gradient(to bottom, #f9fafb, #f3f4f6);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.dailyRoutineSection .dailyRoutineVisual.step2 .topGray {
  position: absolute;
  top: 0.5rem;
  left: 50%;
  transform: translateX(-50%);
  width: 1rem;
  height: 1.5rem;
  background: #d1d5db;
  border-radius: 6px;
}

.dailyRoutineSection .dailyRoutineVisual.step2 .routineText2 {
  position: absolute;
  top: 35%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #374151;
  font-size: 0.7rem;
  text-align: center;
  line-height: 1rem;
}

/* Step 3 */
.dailyRoutineSection .dailyRoutineVisual.step3 {
  position: relative;
  width: 8rem;
  height: 5rem;
  background: linear-gradient(to right, #ecfdf5, #d1fae5);
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.dailyRoutineSection .dailyRoutineVisual.step3 .greenDot {
  position: absolute;
  top: 0.5rem;
  left: 0.5rem;
  width: 1rem;
  height: 1rem;
  background: #bbf7d0;
  border-radius: 50%;
}

.dailyRoutineSection .dailyRoutineVisual.step3 .routineText3 {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.dailyRoutineSection .dailyRoutineVisual.step3 .brand {
  color: #065f46;
  font-size: 0.75rem;
  font-weight: 500;
}

.dailyRoutineSection .dailyRoutineVisual.step3 .name {
  color: #16a34a;
  font-size: 0.7rem;
  margin-top: 0.25rem;
}

/* Info */
.dailyRoutineSection .dailyRoutineInfo h4 {
  color: #fff;
  font-size: 1.125rem;
  margin-bottom: 0.75rem;
  font-weight: 400;
  font-family: 'Inter', sans-serif;
}

.dailyRoutineSection .dailyRoutineInfo p {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.75rem;
  line-height: 1.5;
  margin-bottom: 0.75rem;
    font-family: 'Inter', sans-serif;

}

.dailyRoutineSection .dailyRoutinePrice {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #fff;
  font-size: 0.875rem;
  font-weight: 400;
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid rgba(255, 255, 255, 0.15);
  font-family: 'Inter', sans-serif;
}

.dailyRoutineSection .dailyRoutinePrice .price-label {
  color: rgba(255, 255, 255, 0.7);
  font-weight: 300;
}

.dailyRoutineSection .dailyRoutinePrice .price-value {
  color: #fff;
  font-weight: 500;
  letter-spacing: 0.02em;
}


`

const pages: IframePage[] = [
  {
    id: 'cover',
    name: 'Cover',
    html: `<section class="catalogue-cover">
    <div class="catalogue-cover__background">
      <img src="{{#catalogue.settings.mediaAssets.coverImageUrl}}{{catalogue.settings.mediaAssets.coverImageUrl}}{{/catalogue.settings.mediaAssets.coverImageUrl}}{{^catalogue.settings.mediaAssets.coverImageUrl}}{{#catalogue.products.0.imageUrl}}{{catalogue.products.0.imageUrl}}{{/catalogue.products.0.imageUrl}}{{^catalogue.products.0.imageUrl}}https://images.unsplash.com/photo-1556228852-80c3b20a41cb?auto=format&fit=crop&w=1200&q=80{{/catalogue.products.0.imageUrl}}{{/catalogue.settings.mediaAssets.coverImageUrl}}" alt="Cover Background">
    </div>
    <div class="catalogue-cover__overlay"></div>

    <header class="catalogue-cover__brand">
      {{#catalogue.settings.companyInfo.companyName}}{{catalogue.settings.companyInfo.companyName}}{{/catalogue.settings.companyInfo.companyName}}
      {{^catalogue.settings.companyInfo.companyName}}{{#profile.companyName}}{{profile.companyName}}{{/profile.companyName}}{{^profile.companyName}}SKIN CARE{{/profile.companyName}}{{/catalogue.settings.companyInfo.companyName}}
    </header>

    <article class="catalogue-cover__description-card">
      {{#catalogue.settings.companyInfo.companyDescription}}{{catalogue.settings.companyInfo.companyDescription}}{{/catalogue.settings.companyInfo.companyDescription}}
      {{^catalogue.settings.companyInfo.companyDescription}}{{#catalogue.description}}{{catalogue.description}}{{/catalogue.description}}{{^catalogue.description}}Discover our signature collection of botanical essences, meticulously crafted from rare ingredients sourced from pristine locations around the world. Each formulation embodies the perfect balance of science and nature, delivering transformative results with every application.{{/catalogue.description}}{{/catalogue.settings.companyInfo.companyDescription}}
    </article>

    <div class="catalogue-cover__main-heading">
      <h1>
        {{#catalogue.titleTop}}
          {{catalogue.titleTop}}<br><span class="catalogue-cover__highlight">{{catalogue.titleBottom}}</span>
        {{/catalogue.titleTop}}
        {{^catalogue.titleTop}}
          {{#catalogue.name}}{{catalogue.name}}{{/catalogue.name}}
          {{^catalogue.name}}THE<br>ESSENCE<br>OF<br><span class="catalogue-cover__highlight">LUXURY</span>{{/catalogue.name}}
        {{/catalogue.titleTop}}
      </h1>
    </div>

    <footer class="catalogue-cover__footer-text">
      {{#catalogue.year}}Catalogue {{catalogue.year}}{{/catalogue.year}}
      {{^catalogue.year}}Catalogue 2025{{/catalogue.year}}
    </footer>
  </section>

    `,
  },

  {
    id: 'intro',
    name: 'About',
    html: `
<div class="brand-promise">
    <!-- Left image section -->
    <div class="brand-promise__left">
      <div class="brand-promise__image">
        <img src="{{#catalogue.settings.mediaAssets.introImage}}{{catalogue.settings.mediaAssets.introImage}}{{/catalogue.settings.mediaAssets.introImage}}{{^catalogue.settings.mediaAssets.introImage}}{{#catalogue.products.1.imageUrl}}{{catalogue.products.1.imageUrl}}{{/catalogue.products.1.imageUrl}}{{^catalogue.products.1.imageUrl}}https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=800&q=80{{/catalogue.products.1.imageUrl}}{{/catalogue.settings.mediaAssets.introImage}}" alt="About" style="width: 100%; height: 100%; object-fit: cover;">
      </div>
      <div class="brand-promise__overlay"></div>
    </div>

    <!-- Right text content -->
    <div class="brand-promise__right">
      <div class="brand-promise__content">
        <div class="brand-promise__tag">
          {{#catalogue.tagline}}{{catalogue.tagline}}{{/catalogue.tagline}}
          {{^catalogue.tagline}}LUXURY WELLNESS{{/catalogue.tagline}}
        </div>
        <h1 class="brand-promise__heading">
          {{#catalogue.settings.companyInfo.companyName}}{{catalogue.settings.companyInfo.companyName}}{{/catalogue.settings.companyInfo.companyName}}
          {{^catalogue.settings.companyInfo.companyName}}{{#profile.companyName}}{{profile.companyName}}{{/profile.companyName}}{{^profile.companyName}}Our Promise{{/profile.companyName}}{{/catalogue.settings.companyInfo.companyName}}
        </h1>

        <p class="brand-promise__paragraph">
          {{#catalogue.settings.companyInfo.companyDescription}}{{catalogue.settings.companyInfo.companyDescription}}{{/catalogue.settings.companyInfo.companyDescription}}
          {{^catalogue.settings.companyInfo.companyDescription}}{{#catalogue.description}}{{catalogue.description}}{{/catalogue.description}}{{^catalogue.description}}We believe in the power of natural beauty. Our carefully curated collection combines traditional wisdom with modern science to deliver exceptional results.{{/catalogue.description}}{{/catalogue.settings.companyInfo.companyDescription}}
        </p>

        <div class="brand-promise__divider"></div>

        <p class="brand-promise__quote">
          {{#catalogue.quote}}"{{catalogue.quote}}"{{/catalogue.quote}}
          {{^catalogue.quote}}"The best way to predict the future is to invent it. This is what distinguishes a leader from a follower."{{/catalogue.quote}}
        </p>
      </div>
    </div>
  </div>

    `,
  },

  {
    id: 'products',
    name: 'Products',
    html: `
<div class="dailyRoutineSection">
  <div class="dailyRoutineContainer">
    <div class="dailyRoutineHeader">
      <h1>DAILY ROUTINE</h1>
      <div class="dailyRoutinePagination">{{pageNumber}} of {{totalProductPages}}</div>
    </div>

    <div class="dailyRoutineGrid">
      {{#pageProducts}}
      <div class="dailyRoutineStep">
        <div class="dailyRoutineImageBox">
          {{#imageUrl}}
          <img src="{{imageUrl}}" alt="{{name}}" style="width: 100%; height: 100%; object-fit: cover;" />
          {{/imageUrl}}
          {{^imageUrl}}
          <div class="dailyRoutineVisual step1">
            <div class="topDot"></div>
            <div class="routineText">
              <div class="brand">{{#category.name}}{{category.name}}{{/category.name}}{{^category.name}}Premium{{/category.name}}</div>
              <div class="name">{{name}}</div>
            </div>
          </div>
          {{/imageUrl}}
        </div>
        <div class="dailyRoutineInfo">
          <h4>{{name}}</h4>
          {{#description}}
          <p>{{description}}</p>
          {{/description}}
          {{^description}}
          <p>Premium quality product for your daily routine.</p>
          {{/description}}
          {{#price}}
          <div class="dailyRoutinePrice">
            <span class="price-label">Price</span>
            <span class="price-value">₹{{price}}</span>
          </div>
          {{/price}}
        </div>
      </div>
      {{/pageProducts}}
      
      {{^pageProducts}}
      <!-- Fallback when no products on this page -->
      <div class="dailyRoutineStep">
        <div class="dailyRoutineImageBox">
          <div class="dailyRoutineVisual step1">
            <div class="topDot"></div>
            <div class="routineText">
              <div class="brand">Act+Acre</div>
              <div class="name">Restorative<br />Treatment Mask</div>
            </div>
          </div>
        </div>
        <div class="dailyRoutineInfo">
          <h4>Daily Facial Cleanser</h4>
          <p>Gently removes impurities without disrupting skin's natural balance. Use morning and evening for best results.</p>
          <div class="dailyRoutinePrice">
            <span class="price-label">Price</span>
            <span class="price-value">₹1,250</span>
          </div>
        </div>
      </div>

      <!-- Step 2 -->
      <div class="dailyRoutineStep">
        <div class="dailyRoutineImageBox">
          <div class="dailyRoutineVisual step2">
            <div class="topGray"></div>
            <div class="routineText2">
              Intensive<br />Hair Mask Treatment<br />| Damaged Hair
            </div>
          </div>
        </div>
        <div class="dailyRoutineInfo">
          <h4>Revitalizing Essence</h4>
          <p>Powerful active ingredients target specific concerns while preparing skin for maximum hydration absorption.</p>
          <div class="dailyRoutinePrice">
            <span class="price-label">Price</span>
            <span class="price-value">₹2,100</span>
          </div>
        </div>
      </div>

      <!-- Step 3 -->
      <div class="dailyRoutineStep">
        <div class="dailyRoutineImageBox">
          <div class="dailyRoutineVisual step3">
            <div class="greenDot"></div>
            <div class="routineText3">
              <div class="brand">Corefiance</div>
              <div class="name">Moisture Gel</div>
            </div>
          </div>
        </div>
        <div class="dailyRoutineInfo">
          <h4>Moisture Complex</h4>
          <p>Locks in essential moisture and strengthens skin barrier for lasting protection throughout the day.</p>
          <div class="dailyRoutinePrice">
            <span class="price-label">Price</span>
            <span class="price-value">₹1,850</span>
          </div>
        </div>
      </div>
      {{/pageProducts}}
    </div>
  </div>
</div>



    `,
  },

  {
    id: 'contact',
    name: 'Contact',
    html: `
<section class="contactpage-container">
  <div class="contactpage-wrapper">
    <!-- Left Side -->
    <figure class="contactpage-left">
      <div class="contactpage-image-wrapper">
        <img src="{{#catalogue.settings.contactDetails.contactImage}}{{catalogue.settings.contactDetails.contactImage}}{{/catalogue.settings.contactDetails.contactImage}}{{^catalogue.settings.contactDetails.contactImage}}{{#catalogue.products.2.imageUrl}}{{catalogue.products.2.imageUrl}}{{/catalogue.products.2.imageUrl}}{{^catalogue.products.2.imageUrl}}https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&w=800&q=80{{/catalogue.products.2.imageUrl}}{{/catalogue.settings.contactDetails.contactImage}}" alt="Contact" class="contactpage-image" />
        <div class="contactpage-image-overlay"></div>
      </div>
    </figure>

    <!-- Right Side -->
    <article class="contactpage-right">
      <div class="contactpage-card">
        <h2 class="contactpage-title">Get in Touch</h2>

        <address class="contactpage-details">
          {{#catalogue.settings.contactDetails.address}}
          <div>
            <h3 class="contactpage-subtitle">ADDRESS</h3>
            <p class="contactpage-text">{{catalogue.settings.contactDetails.address}}</p>
          </div>
          {{/catalogue.settings.contactDetails.address}}
          {{^catalogue.settings.contactDetails.address}}
          {{#profile.address}}
          <div>
            <h3 class="contactpage-subtitle">ADDRESS</h3>
            <p class="contactpage-text">{{profile.address}}{{#profile.city}}, {{profile.city}}{{/profile.city}}{{#profile.postalCode}} {{profile.postalCode}}{{/profile.postalCode}}</p>
          </div>
          {{/profile.address}}
          {{/catalogue.settings.contactDetails.address}}

          {{#catalogue.settings.contactDetails.phone}}
          <div>
            <h3 class="contactpage-subtitle">TELEPHONE</h3>
            <p class="contactpage-text">{{catalogue.settings.contactDetails.phone}}</p>
          </div>
          {{/catalogue.settings.contactDetails.phone}}
          {{^catalogue.settings.contactDetails.phone}}
          {{#profile.phone}}
          <div>
            <h3 class="contactpage-subtitle">TELEPHONE</h3>
            <p class="contactpage-text">{{profile.phone}}</p>
          </div>
          {{/profile.phone}}
          {{/catalogue.settings.contactDetails.phone}}

          {{#catalogue.settings.contactDetails.email}}
          <div>
            <h3 class="contactpage-subtitle">EMAIL</h3>
            <p class="contactpage-text">{{catalogue.settings.contactDetails.email}}</p>
          </div>
          {{/catalogue.settings.contactDetails.email}}
          {{^catalogue.settings.contactDetails.email}}
          {{#profile.email}}
          <div>
            <h3 class="contactpage-subtitle">EMAIL</h3>
            <p class="contactpage-text">{{profile.email}}</p>
          </div>
          {{/profile.email}}
          {{/catalogue.settings.contactDetails.email}}

          {{#catalogue.settings.contactDetails.website}}
          <div>
            <h3 class="contactpage-subtitle">WEBSITE</h3>
            <p class="contactpage-text">{{catalogue.settings.contactDetails.website}}</p>
          </div>
          {{/catalogue.settings.contactDetails.website}}
          {{^catalogue.settings.contactDetails.website}}
          {{#profile.website}}
          <div>
            <h3 class="contactpage-subtitle">WEBSITE</h3>
            <p class="contactpage-text">{{profile.website}}</p>
          </div>
          {{/profile.website}}
          {{/catalogue.settings.contactDetails.website}}
        </address>

        <nav class="contactpage-socials" aria-label="Social Media Links">
          {{#catalogue.settings.socialMedia.instagram}}
          <a href="{{catalogue.settings.socialMedia.instagram}}" target="_blank" class="contactpage-social" aria-label="Instagram">
            <svg viewBox="0 0 24 24" fill="white" width="20" height="20">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5" stroke="white" stroke-width="2" fill="none"/>
              <circle cx="12" cy="12" r="4" stroke="white" stroke-width="2" fill="none"/>
              <circle cx="17.5" cy="6.5" r="1.5" fill="white"/>
            </svg>
          </a>
          {{/catalogue.settings.socialMedia.instagram}}
          
          {{#catalogue.settings.socialMedia.facebook}}
          <a href="{{catalogue.settings.socialMedia.facebook}}" target="_blank" class="contactpage-social" aria-label="Facebook">
            <svg viewBox="0 0 24 24" fill="white" width="20" height="20">
              <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" stroke="white" stroke-width="2" fill="none"/>
            </svg>
          </a>
          {{/catalogue.settings.socialMedia.facebook}}
          
          {{#catalogue.settings.socialMedia.linkedin}}
          <a href="{{catalogue.settings.socialMedia.linkedin}}" target="_blank" class="contactpage-social" aria-label="LinkedIn">
            <svg viewBox="0 0 24 24" fill="white" width="20" height="20">
              <path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z" stroke="white" stroke-width="2" fill="none"/>
              <circle cx="4" cy="4" r="2" fill="white"/>
            </svg>
          </a>
          {{/catalogue.settings.socialMedia.linkedin}}
          
          {{#catalogue.settings.socialMedia.twitter}}
          <a href="{{catalogue.settings.socialMedia.twitter}}" target="_blank" class="contactpage-social" aria-label="Twitter">
            <svg viewBox="0 0 24 24" fill="white" width="20" height="20">
              <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" stroke="white" stroke-width="2" fill="none"/>
            </svg>
          </a>
          {{/catalogue.settings.socialMedia.twitter}}
        </nav>

        <aside class="contactpage-qr">
          <div class="contactpage-qr-box">
            <svg viewBox="0 0 100 100" style="width: 100%; height: 100%;">
              <!-- Simple QR code pattern -->
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
          <p class="contactpage-qr-text">SCAN FOR DIGITAL CATALOGUE</p>
        </aside>
      </div>
    </article>
  </div>
</section>

    `,
  },
]

export const SkinCareCatalogueTemplate: PrebuiltHtmlTemplate = {
  id: 'skincare-catalogue',
  name: 'Skin Care Catalogue',
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
    // No transformation needed, pageGenerator handles the pages
    return data
  }
}

export default SkinCareCatalogueTemplate
