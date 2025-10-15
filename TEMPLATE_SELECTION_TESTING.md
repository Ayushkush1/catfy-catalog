# Template Selection & Rendering - Testing Guide

## Overview
This guide explains how to test the HTML template selection flow from the edit page to the preview page with proper rendering.

## What Was Fixed

### 1. Preview Page Template Loading
**File:** `src/app/catalogue/[id]/preview/page.tsx`

#### Changes:
- ✅ Added dual-source template loading (settings.iframeEditor.templateId OR catalogue.template)
- ✅ Created `getTemplate()` helper function to retrieve HTML templates from registry
- ✅ Added comprehensive debug logging for template loading and rendering
- ✅ Template lookup now checks both direct HTML templates and registry-wrapped templates

### 2. Template Data Flow
```
Edit Page Template Selection
         ↓
Saves to BOTH:
  - catalogue.template (direct field)
  - catalogue.settings.iframeEditor.templateId (nested)
         ↓
Preview Page Loads:
  - Checks settings.iframeEditor.templateId first
  - Falls back to catalogue.template
  - Uses getTemplate() to retrieve HTML template data
         ↓
IframeEditor Renders:
  - Receives PrebuiltTemplate object
  - Renders HTML with Mustache/Handlebars engine
  - Displays selected template
```

## How to Test

### Step 1: Select a Template in Edit Page

1. Navigate to a catalogue edit page: `/catalogue/[id]/edit`
2. Click on the **"Template"** tab in the left sidebar
3. You should see **4 HTML templates**:
   - ✨ Simple Test
   - 🎨 Hero Landing Page  
   - 🌙 Feature Grid
   - 🛋️ SmellAdda Catalog Layout
4. Click on any template to select it
5. You should see toast message: **"HTML template selected! Click Preview to edit."**

### Step 2: Verify Template Saved

**Check Console Logs:**
```
✅ HTML template detected, saving template ID: <template-id>
```

**Check Database (Optional):**
- Open your database browser
- Find the catalogue record
- Verify `template` field has the selected template ID
- Verify `settings.iframeEditor.templateId` has the same ID

### Step 3: Navigate to Preview

1. Click the **"Preview"** button in the edit page
2. Should navigate to: `/catalogue/[id]/preview`

### Step 4: Verify Template Loading

**Check Console Logs in Preview Page:**

Expected logs:
```javascript
📋 Loading template from catalogue: {
  templateId: "default-html",  // or selected template ID
  source: "settings.iframeEditor.templateId",  // or "catalogue.template"
  catalogueName: "Your Catalogue Name"
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

### Step 5: Verify Template Rendering

**Visual Verification:**
- ✅ IframeEditor should render the selected HTML template
- ✅ Template content should be visible (not blank white page)
- ✅ Template should match the one selected in edit page
- ✅ No console errors about missing templates

**Check IframeEditor:**
- The canvas should show the HTML template rendered inside an iframe
- Template should be editable (can click on elements)
- Template should respond to data changes

## Debug Checklist

### If Template Not Loading:

**1. Check Template ID is Saved:**
```sql
SELECT id, name, template, settings FROM catalogues WHERE id = '<your-catalogue-id>';
```

**2. Check Console for Errors:**
- Open browser DevTools → Console
- Look for errors about missing templates
- Check the debug logs (📋 and 🎨 emojis)

**3. Verify Template Registry:**
Open browser console and run:
```javascript
// This should show all registered templates
console.log(window.__NEXT_DATA__)
```

**4. Check Template Exists:**
In preview page console:
```javascript
import { HtmlTemplates } from '@/components/editor/iframe-templates'
console.log(HtmlTemplates)  // Should show 4 templates
```

### Common Issues:

#### Issue: Preview shows default template instead of selected one
**Solution:** Check that `catalogue.template` is saved in the database

#### Issue: Template selector is empty
**Solution:** Verify that `HtmlTemplates` are registered in template registry

#### Issue: Console shows "template not found"
**Solution:** Check that template ID matches exactly (case-sensitive)

#### Issue: Blank white page in preview
**Solution:** Check browser console for JavaScript errors

## Expected Template IDs

The following template IDs should be available:

1. `default-html` - Simple Test
2. `simple-product` - Hero Landing Page
3. `dark-hero` - Feature Grid
4. `furniture-catalog` - SmellAdda Catalog Layout

## Success Criteria

✅ **Template Selection Works:**
- Can select template in edit page
- Toast confirms selection
- Template saves to database

✅ **Template Loading Works:**
- Preview page loads correct template ID
- Console shows template found
- No fallback to default

✅ **Template Rendering Works:**
- IframeEditor displays selected template
- Template is visible and interactive
- No blank screen or errors

✅ **Template Persistence Works:**
- Refresh preview page → template still loads
- Navigate back to edit → can select different template
- Change template → preview updates

## Advanced Testing

### Test Multi-Page Templates

1. Select "SmellAdda Catalog Layout" (multi-page template)
2. Navigate to preview
3. Check page controls in toolbar
4. Verify page count matches template pages

### Test Template Switching

1. Select Template A in edit page
2. Navigate to preview → verify Template A renders
3. Go back to edit page
4. Select Template B
5. Navigate to preview → verify Template B renders

### Test Auto-Save

1. Make changes in IframeEditor
2. Wait 10 seconds (auto-save interval)
3. Refresh page
4. Changes should persist

## Files Modified

1. ✅ `src/templates/index.ts` - Template registry
2. ✅ `src/app/catalogue/[id]/edit/page.tsx` - Template selection
3. ✅ `src/app/catalogue/[id]/preview/page.tsx` - Template loading & rendering

## Next Steps

If all tests pass:
- ✅ Template selection is working correctly
- ✅ Template rendering is functional
- ✅ Ready for production use

If tests fail, check the debug logs and verify each step in the data flow.
