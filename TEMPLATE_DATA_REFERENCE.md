# Quick Reference: Dynamic Data Fields in Furniture Template

## Products Page Variables

### Loop Through Products
```mustache
{{#catalogue.products}}
  <!-- Each product -->
{{/catalogue.products}}
```

### Product Fields
```mustache
{{name}}           → Product name
{{price}}          → Product price (number)
{{description}}    → Product description
{{imageUrl}}       → Product image URL
{{category.name}}  → Category name
{{category.color}} → Category color
```

### Example Product Card
```html
<div class="aurum-card">
  <div class="aurum-card-image">
    {{#imageUrl}}
      <img src="{{imageUrl}}" alt="{{name}}" />
    {{/imageUrl}}
    {{^imageUrl}}
      <div class="aurum-card-icon">🪑</div>
    {{/imageUrl}}
  </div>
  <div class="aurum-card-body">
    <h3>{{name}}</h3>
    {{#price}}<p>₹{{price}}</p>{{/price}}
    {{#description}}<p>{{description}}</p>{{/description}}
    {{#category}}<span>{{category.name}}</span>{{/category}}
  </div>
</div>
```

---

## Contact Page Variables

### Company Information
```mustache
{{catalogue.settings.companyInfo.companyName}}
{{catalogue.settings.companyInfo.companyDescription}}
{{profile.companyName}}
{{profile.fullName}}
```

### Contact Details
```mustache
{{catalogue.settings.contactDetails.email}}
{{catalogue.settings.contactDetails.phone}}
{{catalogue.settings.contactDetails.website}}
{{catalogue.settings.contactDetails.address}}
{{catalogue.settings.contactDetails.city}}
{{catalogue.settings.contactDetails.state}}
{{catalogue.settings.contactDetails.country}}
```

### Contact Page Customization
```mustache
{{catalogue.settings.contactDetails.contactImage}}
{{catalogue.settings.contactDetails.contactQuote}}
{{catalogue.settings.contactDetails.contactQuoteBy}}
```

### Social Media
```mustache
{{catalogue.settings.socialMedia.instagram}}
{{catalogue.settings.socialMedia.linkedin}}
{{catalogue.settings.socialMedia.facebook}}
{{catalogue.settings.socialMedia.twitter}}
```

### Example Contact Section
```html
<div class="contact-info">
  <h1>{{catalogue.settings.companyInfo.companyName}}</h1>
  
  {{#catalogue.settings.contactDetails.address}}
  <p>{{catalogue.settings.contactDetails.address}}</p>
  {{/catalogue.settings.contactDetails.address}}
  
  {{#catalogue.settings.contactDetails.phone}}
  <a href="tel:{{catalogue.settings.contactDetails.phone}}">
    {{catalogue.settings.contactDetails.phone}}
  </a>
  {{/catalogue.settings.contactDetails.phone}}
  
  {{#catalogue.settings.contactDetails.email}}
  <a href="mailto:{{catalogue.settings.contactDetails.email}}">
    {{catalogue.settings.contactDetails.email}}
  </a>
  {{/catalogue.settings.contactDetails.email}}
</div>

<div class="socials">
  {{#catalogue.settings.socialMedia.instagram}}
  <a href="{{catalogue.settings.socialMedia.instagram}}" target="_blank">
    Instagram
  </a>
  {{/catalogue.settings.socialMedia.instagram}}
</div>
```

---

## Cover Page Variables

### Basic Info
```mustache
{{catalogue.name}}
{{catalogue.description}}
{{catalogue.quote}}
{{catalogue.tagline}}
{{catalogue.year}}
```

### Images
```mustache
{{catalogue.settings.mediaAssets.coverImageUrl}}
{{catalogue.settings.mediaAssets.logoUrl}}
{{catalogue.introImage}}
{{catalogue.products.0.imageUrl}}  ← First product image
```

### Example Hero Section
```html
<div class="hero">
  <h1>{{catalogue.name}}</h1>
  <p>{{catalogue.description}}</p>
  
  <img src="{{#catalogue.settings.mediaAssets.coverImageUrl}}
             {{catalogue.settings.mediaAssets.coverImageUrl}}
           {{/catalogue.settings.mediaAssets.coverImageUrl}}
           {{^catalogue.settings.mediaAssets.coverImageUrl}}
             {{#catalogue.products.0.imageUrl}}
               {{catalogue.products.0.imageUrl}}
             {{/catalogue.products.0.imageUrl}}
           {{/catalogue.settings.mediaAssets.coverImageUrl}}" 
       alt="Cover">
</div>
```

---

## Story/Intro Page Variables

```mustache
{{profile.companyName}}
{{profile.tagline}}
{{catalogue.introImage}}
{{catalogue.quote}}
{{catalogue.tagline}}
```

---

## Mustache Syntax Cheatsheet

### Conditional Rendering
```mustache
{{#variable}}
  Shows if variable exists and is truthy
{{/variable}}

{{^variable}}
  Shows if variable doesn't exist or is falsy
{{/variable}}
```

### Nested Access
```mustache
{{catalogue.settings.companyInfo.companyName}}
```

### Array Access
```mustache
{{catalogue.products.0.name}}  ← First product's name
```

### Loop
```mustache
{{#array}}
  {{property}}  ← Access property of current item
{{/array}}
```

### Fallback Pattern
```mustache
{{#primary}}{{primary}}{{/primary}}
{{^primary}}
  {{#secondary}}{{secondary}}{{/secondary}}
  {{^secondary}}Default Value{{/secondary}}
{{/primary}}
```

---

## Common Fallback Chains

### Company Name
```mustache
{{#catalogue.settings.companyInfo.companyName}}
  {{catalogue.settings.companyInfo.companyName}}
{{/catalogue.settings.companyInfo.companyName}}
{{^catalogue.settings.companyInfo.companyName}}
  {{#profile.companyName}}
    {{profile.companyName}}
  {{/profile.companyName}}
  {{^profile.companyName}}
    Default Company Name
  {{/profile.companyName}}
{{/catalogue.settings.companyInfo.companyName}}
```

### Contact Email
```mustache
{{#catalogue.settings.contactDetails.email}}
  {{catalogue.settings.contactDetails.email}}
{{/catalogue.settings.contactDetails.email}}
{{^catalogue.settings.contactDetails.email}}
  {{#profile.email}}
    {{profile.email}}
  {{/profile.email}}
{{/catalogue.settings.contactDetails.email}}
```

---

## Page Numbers

```mustache
{{#page.number}}{{page.number}}{{/page.number}}{{^page.number}}1{{/page.number}}
{{#page.total}}{{page.total}}{{/page.total}}{{^page.total}}4{{/page.total}}
```

Current template has:
- Page 1: Cover
- Page 2: Story/Intro
- Page 3: Products
- Page 4: Contact
