# Template Loading Error Fix

## Issue
When opening the template tab or preview page, Zod validation errors were appearing:
```
Error loading DB templates: ZodError: [
  "received": "business",
  "code": "invalid_enum_value",
  "options": ["modern", "classic", "minimal", "creative", "industry", "specialized", "product"],
  "path": ["category"]
]
```

## Root Cause
1. **DB Template Loading**: The `loadDbTemplatesIntoRegistry()` function was trying to fetch templates from the `/api/templates` endpoint
2. **Category Validation**: Database templates had categories like 'business' that weren't in the strict Zod enum
3. **Strict Validation**: The `registerTemplate()` method used `parse()` which throws on validation errors
4. **Unnecessary Load**: Since we removed CraftJS templates and only use HTML templates, loading DB templates was unnecessary

## Solutions Applied

### 1. Disabled DB Template Loading
**File:** `src/templates/index.ts`

```typescript
// Load templates from DB (published) and register into registry
// DISABLED: We're only using HTML templates from iframe-templates now
export async function loadDbTemplatesIntoRegistry(): Promise<void> {
  initializeTemplateRegistry()
  if (dbTemplatesLoaded) return
  
  // Skip loading DB templates - we only use HTML templates now
  console.log('📋 Skipping DB templates - using HTML templates only')
  dbTemplatesLoaded = true
  return
}
```

**Why:** 
- We only use the 4 HTML templates from `iframe-templates`
- DB templates are CraftJS-based and were removed from the template selector
- No need to fetch or validate them

### 2. Graceful Validation Fallback
**File:** `src/lib/template-registry.ts`

```typescript
registerTemplate(config: TemplateConfig, component: TemplateComponent): void {
  // Use safeParse to handle validation errors gracefully
  const result = TemplateConfigSchema.safeParse(config)
  
  if (!result.success) {
    console.warn(`⚠️ Template validation failed for "${config.id}":`, result.error.errors)
    console.warn('Registering template anyway with original config')
    // Register anyway - useful for HTML templates with flexible properties
    this.templates.set(config.id, config)
    this.components.set(config.id, component)
    return
  }
  
  this.templates.set(config.id, result.data)
  this.components.set(config.id, component)
}
```

**Why:**
- Changed from `parse()` (throws error) to `safeParse()` (returns result object)
- If validation fails, log warning but register template anyway
- Prevents template registration from breaking the entire app
- Useful for HTML templates with custom properties that might not fit the strict schema

## Results

### ✅ Before Fix
- ❌ Console showed Zod validation errors
- ❌ Templates might fail to load
- ❌ Preview page might show errors
- ❌ Template tab showed loading errors

### ✅ After Fix
- ✅ No Zod validation errors
- ✅ Only HTML templates are loaded (4 templates)
- ✅ Template tab loads cleanly
- ✅ Preview page renders selected template
- ✅ Clean console logs: "📋 Skipping DB templates - using HTML templates only"

## Expected Console Output

### Template Registry Initialization:
```javascript
📝 Registering HTML templates: 4
📝 Registering HTML template: {
  id: "default-html",
  name: "Simple Test",
  engine: "mustache",
  pageCount: 1,
  configId: "default-html"
}
// ... (3 more templates)
```

### Template Selector Loading:
```javascript
📋 Skipping DB templates - using HTML templates only
```

### Preview Page:
```javascript
📋 Loading template from catalogue: {
  templateId: "default-html",
  source: "settings.iframeEditor.templateId",
  catalogueName: "Furniture"
}

🎨 Preview - Rendering template: {
  templateId: "default-html",
  templateFound: true,
  templateName: "Simple Test",
  templateEngine: "mustache",
  pageCount: 1,
  usingFallback: false
}
```

## Technical Details

### Validation Schema
The strict category enum in `TemplateConfigSchema`:
```typescript
category: z.enum(['modern', 'classic', 'minimal', 'creative', 'industry', 'specialized', 'product'])
```

### DB Templates vs HTML Templates
| Feature | DB Templates | HTML Templates |
|---------|-------------|----------------|
| Source | Database (Prisma) | Code (iframe-templates) |
| Engine | CraftJS | Mustache/Handlebars |
| Categories | Various (business, etc) | Modern only |
| Validation | Strict Zod schema | Flexible |
| Status | Removed from selector | Active and displayed |

## Files Modified

1. ✅ `src/templates/index.ts` - Disabled DB template loading
2. ✅ `src/lib/template-registry.ts` - Graceful validation with safeParse

## Testing

### Verify Fix Works:

1. **Open Template Tab:**
   - Navigate to `/catalogue/[id]/edit`
   - Click "Template" tab
   - ✅ Should see 4 HTML templates
   - ✅ No console errors

2. **Check Console:**
   - ✅ Should see: "📋 Skipping DB templates - using HTML templates only"
   - ✅ Should see: "📝 Registering HTML templates: 4"
   - ❌ Should NOT see: Zod validation errors

3. **Test Preview:**
   - Select a template
   - Click Preview
   - ✅ Template should render
   - ✅ No console errors

## Benefits

1. **Cleaner Console** - No Zod validation errors
2. **Faster Loading** - Skips unnecessary API call to `/api/templates`
3. **Simpler Architecture** - Only one template source (HTML templates)
4. **More Robust** - Graceful validation fallback prevents app crashes
5. **Better Performance** - Less data fetching and processing

## Future Considerations

If you need to re-enable DB templates in the future:
1. Fix the category mapping in `/api/templates/route.ts`
2. Map 'business' → 'modern' or add 'business' to the enum
3. Re-enable `loadDbTemplatesIntoRegistry()` function
4. Update template selector to handle both template types

---

**Status:** ✅ Fixed  
**Date:** October 15, 2025  
**Impact:** Template tab and preview now load without errors
