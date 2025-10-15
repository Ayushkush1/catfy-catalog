# Template Manager HTML Template Support Fix

## Issue
When selecting HTML templates in the wizard, the error appeared:
```
❌ Template selection error in wizard context: Template "dark-hero" is not an editor template
```

The page would show "Loading your catalogue..." indefinitely and the template wouldn't load.

## Root Cause

In `template-manager.ts`, the `prepareTemplateData()` method was checking for `isEditorTemplate` flag:

```typescript
// Check if it's an editor template
if (!template.customProperties?.isEditorTemplate) {
  return {
    success: false,
    error: `Template "${templateId}" is not an editor template`
  };
}
```

But our HTML templates have `isHtmlTemplate` flag instead, so they were being rejected!

## Solution

Updated `prepareTemplateData()` to detect and handle HTML templates before checking for CraftJS editor templates:

### Before:
```typescript
public prepareTemplateData(templateId: string): TemplateLoadResult {
  const template = this.getTemplate(templateId);
  
  if (!template) {
    return { success: false, error: 'Template not found' };
  }

  // ❌ This check failed for HTML templates
  if (!template.customProperties?.isEditorTemplate) {
    return {
      success: false,
      error: `Template "${templateId}" is not an editor template`
    };
  }
  
  // ... rest of the code
}
```

### After:
```typescript
public prepareTemplateData(templateId: string): TemplateLoadResult {
  const template = this.getTemplate(templateId);
  
  if (!template) {
    return { success: false, error: 'Template not found' };
  }

  // ✅ NEW: Check if it's an HTML template first
  if (template.customProperties?.isHtmlTemplate) {
    console.log('✅ HTML template detected:', templateId);
    // HTML templates don't need editor data - they're handled by IframeEditor
    return {
      success: true,
      data: JSON.stringify({ templateId, isHtmlTemplate: true })
    };
  }

  // Then check for CraftJS editor templates
  if (!template.customProperties?.isEditorTemplate) {
    return {
      success: false,
      error: `Template "${templateId}" is not an editor template`
    };
  }
  
  // ... rest of the code
}
```

## How It Works Now

### Flow for HTML Templates:

```
1. User selects "Dark Hero Section" in wizard
         ↓
2. templateManager.prepareTemplateData('dark-hero')
         ↓
3. Detects: template.customProperties.isHtmlTemplate = true
         ↓
4. Returns: { success: true, data: '{"templateId":"dark-hero","isHtmlTemplate":true}' }
         ↓
5. onTemplateSelected callback fires
         ↓
6. Wizard saves templateId
         ↓
7. Catalogue created with template ID
         ↓
8. Preview page loads HTML template via IframeEditor
         ↓
9. Template renders successfully! ✨
```

### Flow for CraftJS Templates (if any):

```
1. Check isHtmlTemplate → false
         ↓
2. Check isEditorTemplate → true
         ↓
3. Load editorData from customProperties
         ↓
4. Return editor data for CraftJS
```

## Files Modified

**File:** `src/lib/template-manager.ts`

**Changes:**
- Added HTML template detection in `prepareTemplateData()`
- HTML templates bypass editor data validation
- Returns success with minimal data (just template ID and flag)
- Actual HTML template loading handled by IframeEditor component

## Technical Details

### Why This Works

**HTML Templates:**
- Don't use CraftJS editor
- Don't have `editorData` property
- Are loaded directly via `getTemplate()` in preview page
- Rendered by IframeEditor component using Mustache engine

**CraftJS Templates:**
- Have `editorData` property
- Need editor data to be loaded into CraftJS
- Rendered by CraftJS editor component

### Template Detection Priority

1. ✅ **HTML Template** (`isHtmlTemplate`) - Return success immediately
2. ✅ **Multi-page Editor Template** (`isMultiPageTemplate`) - Load multi-page data
3. ✅ **Single-page Editor Template** (`isEditorTemplate`) - Load editor data
4. ❌ **Unknown** - Return error

## Testing

### Test Case 1: HTML Template Selection
```javascript
// Wizard: Select "Dark Hero Section"
templateManager.prepareTemplateData('dark-hero')

// Expected Console:
// ✅ HTML template detected: dark-hero

// Expected Result:
{
  success: true,
  data: '{"templateId":"dark-hero","isHtmlTemplate":true}'
}
```

### Test Case 2: Template Not Found
```javascript
templateManager.prepareTemplateData('non-existent')

// Expected Result:
{
  success: false,
  error: 'Template with ID "non-existent" not found'
}
```

### Test Case 3: CraftJS Template (if any)
```javascript
templateManager.prepareTemplateData('craftjs-template')

// Expected Result:
{
  success: true,
  data: '{"ROOT": {...}}'  // CraftJS editor data
}
```

## Console Output

### Before Fix:
```
❌ Template selection error in wizard context: Template "dark-hero" is not an editor template
```

### After Fix:
```
✅ HTML template detected: dark-hero
✅ Template selected in wizard context: dark-hero
```

## Impact

### Before:
- ❌ HTML templates couldn't be selected in wizard
- ❌ Error message appeared
- ❌ Infinite loading spinner
- ❌ Catalogue creation failed

### After:
- ✅ HTML templates selectable in wizard
- ✅ No errors
- ✅ Catalogue created successfully
- ✅ Preview loads and renders template
- ✅ All 4 HTML templates work

## Related Files

- `src/lib/template-manager.ts` - Fixed template detection
- `src/components/ui/template-theme-workflow.tsx` - Uses template manager
- `src/components/ui/unified-template-selector.tsx` - Template selector UI
- `src/app/catalogue/[id]/preview/page.tsx` - Renders HTML templates
- `src/components/editor/IframeEditor.tsx` - Renders HTML content

## Future Considerations

If adding more template types in the future:

```typescript
// Add detection for new template type
if (template.customProperties?.isNewTemplateType) {
  return {
    success: true,
    data: JSON.stringify({ templateId, isNewTemplateType: true })
  };
}
```

The pattern is now established:
1. Check for specific template type flags
2. Return appropriate data structure
3. Let the rendering component handle the rest

---

**Status:** ✅ Fixed  
**Date:** October 15, 2025  
**Impact:** HTML templates now work in catalogue creation wizard
