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

// A simple two-page template with common product/profile placeholders
export const DefaultHtmlTemplate: PrebuiltHtmlTemplate = {
  id: 'default-html',
  name: 'Default HTML Template',
  engine: 'mustache',
  sharedCss: `
    :root{
--bg1: #0f172a;
--bg2: #0b1220;
--accent: #7c5cff;
--accent-2: #00d4ff;
--muted: rgba(255,255,255,0.75);
--glass: rgba(255,255,255,0.06);
--radius: 14px;
font-family: 'Inter', system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial;
}


*{box-sizing:border-box}
html,body{height:100%}
body{
margin:0;
background: radial-gradient(1200px 600px at 10% 10%, rgba(124,92,255,0.12), transparent),
radial-gradient(1000px 500px at 90% 90%, rgba(0,212,255,0.06), transparent),
linear-gradient(180deg,var(--bg1),var(--bg2));
color:#fff; -webkit-font-smoothing:antialiased; -moz-osx-font-smoothing:grayscale;
padding:48px;
display:flex; align-items:center; justify-content:center;
min-height:100vh;
}


.container{
width:min(1200px,96%);
background: linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01));
border-radius:20px;
padding:48px;
display:grid;
grid-template-columns: 1fr 420px;
gap:32px;
align-items:center;
box-shadow: 0 10px 40px rgba(2,6,23,0.6), inset 0 1px 0 rgba(255,255,255,0.02);
position:relative;
overflow:visible;
}


/* Decorative floating blob */
.blob{
position:absolute; right:-120px; top:-80px; width:520px; height:520px; pointer-events:none;
filter: blur(36px) saturate(120%);
opacity:0.7; transform:translateZ(0);
}


.left h1{
font-size:clamp(28px,4vw,48px);
line-height:1.03;
margin:0 0 12px 0;
letter-spacing:-0.4px;
font-weight:800;
}

/* Lead paragraph */
.lead{
  color: var(--muted);
  font-size: 16px;
  line-height: 1.6;
  max-width: 780px;
  margin: 6px 0 18px 0;
}

/* CTA buttons */
.cta-row{ display:flex; gap:14px; align-items:center; margin: 18px 0 16px 0; }
.btn{ display:inline-flex; align-items:center; gap:10px; padding:12px 18px; border-radius: 12px; text-decoration:none; transition: all .18s ease; font-weight:600; }
.btn-primary{ color:#0b1220; background: linear-gradient(90deg, var(--accent), var(--accent-2)); box-shadow: 0 10px 30px rgba(124,92,255,0.25); }
.btn-primary:hover{ filter: brightness(1.05); box-shadow: 0 12px 34px rgba(124,92,255,0.32); }
.btn-ghost{ color:#e5e7eb; background: var(--glass); border:1px solid rgba(255,255,255,0.15); }
.btn-ghost:hover{ background: rgba(255,255,255,0.12); }

/* Feature chips */
.features{ display:flex; gap:12px; flex-wrap:wrap; margin: 14px 0 8px 0; }
.feature{ display:flex; align-items:center; gap:10px; padding:10px 14px; border-radius: 12px; background: rgba(255,255,255,0.06); border:1px solid rgba(255,255,255,0.12); color:#e5e7eb; font-weight:600; }
.dot{ width:10px; height:10px; border-radius:50%; background: radial-gradient(60% 60% at 50% 50%, var(--accent), var(--accent-2)); box-shadow: 0 0 0 3px rgba(124,92,255,0.18); }

/* Product mock card */
.card{ background: rgba(2,6,23,0.66); border-radius: 22px; padding: 20px; box-shadow: inset 0 1px 0 rgba(255,255,255,0.04), 0 20px 60px rgba(2,6,23,0.75); }
.mock{ position:relative; background: radial-gradient(1200px 600px at 10% 10%, rgba(124,92,255,0.12), transparent), radial-gradient(1000px 500px at 90% 90%, rgba(0,212,255,0.06), transparent), linear-gradient(180deg,#0b1220,#0b1220); border-radius: 18px; padding: 48px 24px; min-height: 260px; box-shadow: inset 0 0 0 1px rgba(255,255,255,0.06); }
.screen{ color:#e5e7eb; opacity:0.86; text-align:center; letter-spacing:0.2px; font-weight:700; }
.badge{ position:absolute; display:inline-flex; align-items:center; justify-content:center; padding:8px 12px; border-radius: 18px; color:#0b1220; font-weight:800; box-shadow: 0 10px 30px rgba(124,92,255,0.25); }
.badge.one{ left:20px; top:20px; background: linear-gradient(90deg, var(--accent), var(--accent-2)); }
.badge.two{ right:20px; bottom:20px; background: linear-gradient(90deg, var(--accent-2), var(--accent)); }
`,
  pages: [
    {
      id: 'cover',
      name: 'Cover',
      css: `.page.cover { background: #f8fafc; }`,
      html: `
       <div class="container">

<svg class="blob" viewBox="0 0 600 600" xmlns="http://www.w3.org/2000/svg" aria-hidden>
<defs>
<linearGradient id="g" x1="0" x2="1">
<stop offset="0" stop-color="#7c5cff" stop-opacity="0.86" />
<stop offset="1" stop-color="#00d4ff" stop-opacity="0.6" />
</linearGradient>
</defs>
<g transform="translate(300,300)">
<path d="M115,-141C148,-112,165,-73,170,-34C176,5,170,43,149,78C128,114,92,146,49,160C6,174,-44,170,-79,145C-114,120,-134,76,-155,34C-177,-8,-200,-46,-184,-86C-168,-125,-114,-166,-63,-178C-12,-190,36,-173,80,-151C124,-128,84,-171,115,-141Z" fill="url(#g)"/>
</g>
</svg>


<div class="left">
<h1>Design beautiful landing pages — fast.</h1>
<p class="lead">A minimal, responsive hero built with only HTML & CSS. Clean typography, subtle motion and a visual mock to show your product — ready to drop into any project.</p>


<div class="cta-row">
<a class="btn btn-primary" href="#">Get started<span aria-hidden>→</span></a>
<a class="btn btn-ghost" href="#">Live demo</a>
</div>


<div class="features">
<div class="feature"><span class="dot"></span>Responsive</div>
<div class="feature"><span class="dot"></span>No JS needed</div>
<div class="feature"><span class="dot"></span>Accessible</div>
</div>
</div>


<div class="card">
<div class="mock">
<div class="badge one">New</div>
<div class="screen">Product preview • Replace this with your image</div>
<div class="badge two">Pro</div>
</div>
</div>
</div>
      `
    },
    {
      id: 'details',
      name: 'Details',
      html: `
        <div class="page">
          <div class="section-title">Product Details</div>
          <div class="grid-2">
            <div>
              <div class="muted">Name</div>
              <div>{{product.title}}</div>
            </div>
            <div>
              <div class="muted">Price</div>
              <div>{{product.price}}</div>
            </div>
            <div>
              <div class="muted">Description</div>
              <div>{{product.description}}</div>
            </div>
            <div>
              <div class="muted">Company</div>
              <div>{{profile.companyName}}</div>
            </div>
          </div>

          <div class="section-title">Contact</div>
          <div class="grid-2">
            <div>
              <div class="muted">Email</div>
              <div>{{profile.email}}</div>
            </div>
            <div>
              <div class="muted">Phone</div>
              <div>{{profile.phone}}</div>
            </div>
            <div>
              <div class="muted">Website</div>
              <div>{{profile.website}}</div>
            </div>
            <div>
              <div class="muted">Address</div>
              <div>{{profile.address}}, {{profile.city}}, {{profile.state}}, {{profile.country}}</div>
            </div>
          </div>

          <div class="footer">Generated with Catfy Iframe Editor</div>
        </div>
      `
    }
  ]
}