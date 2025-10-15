# Template ID Standardization Fix

## Issue
User selected "Dark Hero Section" template but the preview was showing a different template (SmellAdda Catalog Layout).

## Root Cause
Template IDs in the actual template files didn't match the expected simple IDs:

### Before (Inconsistent IDs):
| Template File | Old ID | Expected ID |
|--------------|---------|-------------|
| DefaultHtmlTemplate.ts | `default-html` | ✅ `default-html` |
| SimpleProductTemplate.ts | `simple-product-template` | ❌ Should be `simple-product` |
| DarkHeroTemplate.ts | `dark-hero-template` | ❌ Should be `dark-hero` |
| FurnitureCatalogueTemplate.ts | `smelladda-catalog` | ❌ Should be `furniture-catalog` |

## Solution Applied

Updated template IDs to use simple, consistent naming:

### 1. DarkHeroTemplate.ts
```typescript
export const DarkHeroTemplate: PrebuiltHtmlTemplate = {
  id: 'dark-hero',  // Changed from 'dark-hero-template'
  name: 'Dark Hero Section',
  engine: 'mustache',
  // ...
}
```

### 2. SimpleProductTemplate.ts
```typescript
export const SimpleProductTemplate: PrebuiltTemplate = {
  id: 'simple-product',  // Changed from 'simple-product-template'
  name: 'Simple Product',
  engine: 'mustache',
  // ...
}
```

### 3. FurnitureCatalogueTemplate.ts
```typescript
export const SmellAddaCatalogTemplate: PrebuiltHtmlTemplate = {
  id: 'furniture-catalog',  // Changed from 'smelladda-catalog'
  name: 'SmellAdda Catalog Layout',
  engine: 'mustache',
  // ...
}
```

## After (Standardized IDs):
| Template | ID | Name |
|----------|-----|------|
| 1️⃣ | `default-html` | Simple Test |
| 2️⃣ | `simple-product` | Simple Product |
| 3️⃣ | `dark-hero` | Dark Hero Section |
| 4️⃣ | `furniture-catalog` | SmellAdda Catalog Layout |

## Impact

### Before Fix:
- ❌ Selecting "Dark Hero" template would save with ID `dark-hero-template`
- ❌ Preview would fail to find template with that exact ID
- ❌ Might fall back to default template or show wrong template

### After Fix:
- ✅ Template IDs are simple and consistent
- ✅ Selection saves correct ID
- ✅ Preview loads exact selected template
- ✅ No ID mismatch issues

## Files Modified

1. ✅ `src/components/editor/iframe-templates/DarkHeroTemplate.ts`
   - Changed ID: `dark-hero-template` → `dark-hero`

2. ✅ `src/components/editor/iframe-templates/SimpleProductTemplate.ts`
   - Changed ID: `simple-product-template` → `simple-product`

3. ✅ `src/components/editor/iframe-templates/FurnitureCatalogueTemplate.ts`
   - Changed ID: `smelladda-catalog` → `furniture-catalog`

## Testing

### Clear Old Data (Important!)
Since you previously selected templates with old IDs, you need to clear the saved data:

**Option 1: Delete and recreate catalogue**
1. Delete the current catalogue
2. Create a new one
3. Select template
4. Verify it works

**Option 2: Clear browser storage**
1. Open DevTools → Application → Storage
2. Clear Local Storage
3. Clear IndexedDB
4. Refresh page

**Option 3: Update database directly**
```sql
-- Clear template selection for specific catalogue
UPDATE catalogues 
SET template = NULL, 
    settings = jsonb_set(settings, '{iframeEditor}', '{}')
WHERE id = 'b4313e11-2c30-4175-966e-5feed5839872';
```

### Verify Fix:
1. Go to edit page
2. Click "Template" tab
3. Select "Dark Hero Section"
4. Console should show:
   ```
   ✅ HTML template detected, saving template ID: dark-hero
   ```
5. Click "Preview"
6. Console should show:
   ```
   📋 Loading template from catalogue: {
     templateId: "dark-hero",
     source: "settings.iframeEditor.templateId"
   }
   🎨 Preview - Rendering template: {
     templateId: "dark-hero",
     templateFound: true,
     templateName: "Dark Hero Section",
     ...
   }
   ```
7. Preview should show the dark hero template (black background with "CRAFTING EXCELLENCE")

## Expected Behavior

### Template Selection Flow:
```
Edit Page → Select "Dark Hero Section"
          ↓
Save: catalogue.template = "dark-hero"
      settings.iframeEditor.templateId = "dark-hero"
          ↓
Preview → Load template ID "dark-hero"
          ↓
Find template in HtmlTemplates array by ID
          ↓
Render: Dark Hero template with black background
```

## Benefits

1. **Consistency** - All template IDs follow the same pattern
2. **Predictability** - ID matches the template name pattern
3. **Debugging** - Easier to track which template is selected
4. **Documentation** - IDs match what's in the docs

## Template ID Reference

Quick reference for developers:

```typescript
// Available HTML Templates
const TEMPLATE_IDS = {
  DEFAULT: 'default-html',
  SIMPLE_PRODUCT: 'simple-product',
  DARK_HERO: 'dark-hero',
  FURNITURE_CATALOG: 'furniture-catalog'
}

// Usage
import { getTemplateById } from '@/components/editor/iframe-templates'

const template = getTemplateById(TEMPLATE_IDS.DARK_HERO)
```

---

**Status:** ✅ Fixed  
**Date:** October 15, 2025  
**Impact:** Template selection now works correctly - selected template matches rendered template
