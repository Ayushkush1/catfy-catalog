// Dark hero cover template inspired by the provided UI
// Uses live data: profile.companyName, catalogue.year/name, product.title, product.description, product.image, product.badge

export type IframePage = {
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

export const DarkHeroTemplate: PrebuiltHtmlTemplate = {
  id: 'dark-hero-template',
  name: 'Dark Hero Section',
  engine: 'mustache',
  sharedCss: `
    :root {
    --bg: #0f0f0f;
    --text: #fff;
    --muted: #b5b5b5;
    --yellow: #f9c900;
  }

  * {
    box-sizing: border-box;
  }

  body {
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

  header {
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

  footer {
    position: absolute;
    bottom: 40px;
    width: 100%;
    text-align: center;
    color: #777;
    font-size: 12px;
    letter-spacing: 3px;
  }

  .container {
    width: 1100px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 80px;
  }

  .left {
    border: 1px solid #555;
    padding: 60px;
    max-width: 420px;
  }

  .left h1 {
    font-size: 60px;
    font-weight: 800;
    line-height: 1.1;
    letter-spacing: 5px;
    margin: 0 0 20px 0;
  }

  .left h2 {
    font-size: 20px;
    font-weight: 700;
    letter-spacing: 4px;
    margin: 0 0 10px 0;
  }

  .left p {
    color: var(--muted);
    font-size: 13px;
    line-height: 1.6;
    margin-bottom: 30px;
  }

  .btn {
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

  .btn::after {
    content: '→';
    font-size: 14px;
  }

  .right {
    position: relative;
  }

  .product-image {
    width: 400px;
    height: 400px;
    border-radius: 4px;
    overflow: hidden;
  }

  .product-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
    filter: brightness(1.1) contrast(1.1) saturate(1.1);
  }

  .badge {
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
:root {
    --bg: #fafafa;
    --text-dark: #222;
    --text-gray: #666;
    --muted: #999;
  }

  * {
    box-sizing: border-box;
  }

  body {
    margin: 0;
    font-family: 'Inter', sans-serif;
    background: var(--bg);
    height: 100vh;
    overflow: hidden;
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
    .intro-page {
      flex-direction: column;
    }

    .intro-left, .intro-right {
      width: 100%;
      height: 50vh;
    }

    .intro-right {
      padding: 40px 20px;
    }
  }

  `,
  pages: [
    {
      id: 'cover',
      name: 'Hero',
      html: `
       <header>
  <div>SMELLADDA</div>
  <div>CATALOGUE 2025</div>
</header>

<div class="container">
  <div class="left">
    <h1>CRAFTED<br>EXCELLENCE</h1>
    <h2>CATALOG</h2>
    <p>Curated designs that transform spaces into expressions of elegance and comfort.</p>
    <a href="#" class="btn">EXPLORE COLLECTION</a>
  </div>

  <div class="right">
    <div class="product-image">
      <img src="https://images.unsplash.com/photo-1616627454908-b60f3e5af327?auto=format&fit=crop&w=600&q=80" alt="Product">
    </div>
    <div class="badge">NEW ARRIVALS</div>
  </div>
</div>

<footer>
  PREMIUM QUALITY • SUSTAINABLE MATERIALS • TIMELESS DESIGN
</footer>

      `
    },
    {
      id: 'intro',
      name: 'Intro',
      html:`
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

      `
    }
  ]
}

export default DarkHeroTemplate