import type { PrebuiltTemplate } from '../IframeEditor'

// A simple single-product, two-page HTML template using Mustache placeholders
export const SimpleProductTemplate: PrebuiltTemplate = {
  id: 'simple-product-template',
  name: 'Simple Product',
  engine: 'mustache',
  sharedCss: `
    :root {
--bg: #0f0f0f;
--text: #ffffff;
--muted: #b5b5b5;
--yellow: #f9c900;
font-family: 'Inter', sans-serif;
}


body {
background: radial-gradient(circle at center, #101010, #0a0a0a);
color: var(--text);
margin: 0;
height: 100vh;
display: flex;
align-items: center;
justify-content: center;
}


.hero {
display: flex;
align-items: center;
justify-content: space-between;
width: 1000px;
padding: 60px;
background: #0f0f0f;
box-shadow: 0 0 80px rgba(0,0,0,0.6);
}


.left {
flex: 1;
border: 1px solid rgba(255,255,255,0.15);
padding: 40px;
}


.left h1 {
font-size: 60px;
font-weight: 800;
line-height: 1.1;
margin-bottom: 20px;
letter-spacing: 2px;
}


.left h3 {
font-size: 18px;
font-weight: 600;
margin-bottom: 10px;
letter-spacing: 2px;
}


.left p {
color: var(--muted);
margin-bottom: 30px;
font-size: 14px;
}


.btn {
display: inline-flex;
align-items: center;
gap: 8px;
color: #fff;
text-decoration: none;
border-bottom: 1px solid rgba(255,255,255,0.5);
padding-bottom: 4px;
letter-spacing: 1px;
font-weight: 600;
}


.btn::after {
content: '→';
font-size: 14px;
}


.right {
flex: 0 0 380px;
position: relative;
}


.right img {
width: 100%;
border-radius: 4px;
display: block;
}


.badge {
position: absolute;
bottom: 20px;
right: 20px;
background: var(--yellow);
color: #000;
font-weight: 700;
font-size: 13px;
padding: 8px 14px;
}


header {
position: absolute;
top: 40px;
left: 80px;
right: 80px;
display: flex;
justify-content: space-between;
font-size: 13px;
letter-spacing: 2px;
color: var(--muted);
}


footer {
position: absolute;
bottom: 40px;
width: 100%;
text-align: center;
color: var(--muted);
font-size: 12px;
letter-spacing: 2px;
}
  `,
  pages: [
    {
      id: 'cover',
      name: 'Cover',
      html: `
        <header>
<div>SMELLADDA</div>
<div>CATALOGUE 2025</div>
</header>


<div class="hero">
<div class="left">
<h1>CRAFTED<br>EXCELLENCE</h1>
<h3>CATALOG</h3>
<p>Premium selections for the discerning palate</p>
<a href="#" class="btn">EXPLORE COLLECTION</a>
</div>


<div class="right">
<img src="https://images.unsplash.com/photo-1616627454908-b60f3e5af327?auto=format&fit=crop&w=600&q=80" alt="Sofa">
<div class="badge">NEW ARRIVALS</div>
</div>
</div>


<footer>
PREMIUM QUALITY • SUSTAINABLE MATERIALS • TIMELESS DESIGN
</footer>
      `,
    },
    {
      id: 'grid',
      name: 'Product Grid',
      html: `
        <div class="page">
          <div class="title" style="margin-bottom:16px">Featured Products</div>
          <div class="grid">
            {{#products}}
              <div class="card">
                {{#image}}<img src="{{image}}" alt="{{title}}" />{{/image}}
                <div style="font-weight:700; margin-top:8px">{{title}}</div>
                <div class="price">{{priceFormatted}}</div>
              </div>
            {{/products}}
          </div>
        </div>
      `,
    },
  ],
}

export default SimpleProductTemplate