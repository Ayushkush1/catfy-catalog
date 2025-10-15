# HTML Templates in Catalogue Creation Wizard

## Summary
Successfully integrated the 4 HTML templates into the catalogue creation wizard (`/catalogue/new` page) so users can select them when creating a new catalogue.

## What Was Already Working

The catalogue creation wizard (`CreateCatalogWizard.tsx`) was already using the `TemplateThemeWorkflow` component:

```tsx
<TemplateThemeWorkflow
  userProfile={profile}
  initialTemplateId={data.templateId}
  onSelectionComplete={(templateId) => {
    updateData('templateId', templateId)
    updateData('settings.templateId', templateId)
  }}
  showPreview={true}
  className="mt-4"
/>
```

Since we updated the template registry to only show HTML templates, the wizard automatically inherited this change! ✅

## What Needed Fixing

The catalogue creation API (`/api/catalogues/route.ts`) wasn't saving the template ID in the correct format for HTML templates.

### Before:
```typescript
const catalogue = await prisma.catalogue.create({
  data: {
    name,
    theme,
    // ...
    settings: {
      templateId,  // Only saved here
      // ...
    }
  }
})
```

### After:
```typescript
const catalogue = await prisma.catalogue.create({
  data: {
    name,
    theme,
    template: templateId,  // ✅ Also save to catalogue.template field
    settings: {
      templateId,
      // ...
      iframeEditor: {  // ✅ Add iframe editor settings
        templateId,
        engine: 'mustache',
        pageCount: 1
      }
    }
  }
})
```

## Changes Made

### File: `src/app/api/catalogues/route.ts`

Added iframe editor settings to the catalogue creation:

```typescript
// IframeEditor settings for HTML templates
...(templateId ? {
  iframeEditor: {
    templateId,
    engine: 'mustache',
    pageCount: 1,
  }
} : {})
```

Also added `template: templateId` to save the template ID to the catalogue's template field.

## Complete Flow

### 1. Create New Catalogue
```
User visits: /catalogue/new
         ↓
CreateCatalogWizard loads
         ↓
Step 2: Template Selection (using TemplateThemeWorkflow)
```

### 2. Template Selection
```
TemplateThemeWorkflow component
         ↓
UnifiedTemplateSelector component
         ↓
Loads HTML templates from registry (4 templates)
         ↓
User selects template (e.g., "Dark Hero Section")
```

### 3. Template Saved
```
onSelectionComplete callback
         ↓
updateData('templateId', 'dark-hero')
         ↓
saveCatalogue() sends to API
         ↓
POST /api/catalogues
```

### 4. Database Save
```
Catalogue created with:
  - catalogue.template = "dark-hero"
  - settings.templateId = "dark-hero"
  - settings.iframeEditor.templateId = "dark-hero"
  - settings.iframeEditor.engine = "mustache"
```

### 5. Redirect to Edit
```
Wizard completes
         ↓
Redirects to: /catalogue/{id}/edit
         ↓
User can now preview with HTML template
```

## Available Templates in Wizard

The wizard now shows these 4 HTML templates:

| # | Template ID | Template Name | Engine | Description |
|---|-------------|---------------|--------|-------------|
| 1 | `default-html` | Simple Test | Mustache | Basic HTML template for testing |
| 2 | `simple-product` | Simple Product | Mustache | Product showcase with hero section |
| 3 | `dark-hero` | Dark Hero Section | Mustache | Dark-themed feature grid layout |
| 4 | `furniture-catalog` | SmellAdda Catalog Layout | Mustache | Multi-page catalog template |

## User Experience

### Step-by-Step:

**Step 1: Basic Info**
- Enter catalogue name
- Enter description (optional)
- Click "Next"

**Step 2: Choose Template** ✨
- See 4 HTML templates in grid/list view
- Search templates (if needed)
- Filter by category (if needed)
- Preview template (optional)
- Click on template to select
- Selected template highlights
- Click "Next"

**Step 3: Company Information**
- Fill in company details
- Upload logo/images (optional)
- Add contact info
- Click "Next"

**Step 4: Review & Create**
- Review all information
- Click "Create Catalogue"

**Step 5: Success!**
- Catalogue created with selected template
- Redirects to edit page
- Click "Preview" to see template rendered

## Template Selection UI

The wizard uses the same `UnifiedTemplateSelector` as the edit page, which provides:

- ✅ Grid and list view options
- ✅ Search functionality
- ✅ Category filtering
- ✅ Template preview modal
- ✅ Premium badge (if applicable)
- ✅ Template cards with thumbnails
- ✅ Responsive design

## Data Saved to Database

When a user creates a catalogue with a template:

```json
{
  "id": "uuid",
  "name": "My Catalogue",
  "template": "dark-hero",
  "theme": "modern",
  "settings": {
    "templateId": "dark-hero",
    "iframeEditor": {
      "templateId": "dark-hero",
      "engine": "mustache",
      "pageCount": 1
    },
    "showPrices": true,
    "companyInfo": { ... },
    "mediaAssets": { ... },
    "contactDetails": { ... },
    "socialMedia": { ... }
  }
}
```

## Preview Integration

After creating a catalogue with a template, when the user goes to preview:

```javascript
// Preview page loads catalogue
const catalogue = await fetch(`/api/catalogues/${id}`)

// Extract template ID
const templateId = catalogue.settings?.iframeEditor?.templateId || catalogue.template

// Load HTML template
const template = getTemplate(templateId)

// Render in IframeEditor
<IframeEditor template={template} ... />
```

## Testing the Integration

### Test 1: Create Catalogue with Default Template
1. Go to `/catalogue/new`
2. Step 1: Enter "Test Catalogue"
3. Step 2: Select "Simple Test" template
4. Step 3: Fill company name "Test Company"
5. Step 4: Click "Create Catalogue"
6. ✅ Should create and redirect to edit page
7. Click "Preview"
8. ✅ Should show Simple Test template

### Test 2: Create Catalogue with Dark Hero
1. Go to `/catalogue/new`
2. Step 1: Enter "Dark Hero Test"
3. Step 2: Select "Dark Hero Section" template
4. Step 3: Fill company info
5. Step 4: Create
6. Go to Preview
7. ✅ Should show black background with "CRAFTING EXCELLENCE"

### Test 3: Create Catalogue with Furniture Catalog
1. Go to `/catalogue/new`
2. Select "SmellAdda Catalog Layout"
3. Complete wizard
4. Go to Preview
5. ✅ Should show multi-page catalog template
6. ✅ Page navigation should show "Page 1 of 4"

## Console Logs to Verify

### During Template Selection:
```javascript
✅ Template selected in wizard context: dark-hero
```

### During Catalogue Creation:
```javascript
POST /api/catalogues
{
  name: "My Catalogue",
  templateId: "dark-hero",
  // ...
}
```

### On Preview Page:
```javascript
📋 Loading template from catalogue: {
  templateId: "dark-hero",
  source: "settings.iframeEditor.templateId",
  catalogueName: "My Catalogue"
}

🎨 Preview - Rendering template: {
  templateId: "dark-hero",
  templateFound: true,
  templateName: "Dark Hero Section",
  templateEngine: "mustache",
  pageCount: 2
}
```

## Files Modified

1. ✅ `src/app/api/catalogues/route.ts`
   - Added `template: templateId` field
   - Added `settings.iframeEditor` object with template info

## Benefits

1. **Consistent Experience** - Same templates in wizard as edit page
2. **Proper Persistence** - Template saved to multiple locations for reliability
3. **No Extra Code** - Wizard already used TemplateThemeWorkflow
4. **Preview Works** - Preview page can load the template correctly
5. **User-Friendly** - Select template during creation instead of after

## Technical Notes

### Why Save to Multiple Locations?

```typescript
template: templateId,              // Direct field for quick access
settings.templateId: templateId,   // Backward compatibility
settings.iframeEditor: {           // For IframeEditor component
  templateId: templateId,          // Template to render
  engine: 'mustache',              // Template engine
  pageCount: 1                     // Number of pages
}
```

This ensures:
- Edit page can find template: `catalogue.template`
- Preview page can find template: `settings.iframeEditor.templateId`
- Fallback available: `settings.templateId`

### Template Engine Default

All HTML templates currently use Mustache engine, so we default to `'mustache'`. If Handlebars templates are added later, this can be determined from the template metadata.

## Future Enhancements

Potential improvements:
- [ ] Save actual page count from template
- [ ] Detect template engine from template data
- [ ] Pre-populate sample data based on template
- [ ] Show template-specific form fields in wizard
- [ ] Template recommendation based on business type

---

**Status:** ✅ Complete  
**Date:** October 15, 2025  
**Impact:** Users can now select HTML templates when creating new catalogues
