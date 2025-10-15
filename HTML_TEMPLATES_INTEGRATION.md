# HTML Templates Integration

## Summary
Successfully integrated HTML templates from `iframe-templates` into the edit page template selector, replacing CraftJS editor templates as requested.

## Changes Made

### 1. Updated Template Registry (`src/templates/index.ts`)

#### Added HTML Template Import
```typescript
import { HtmlTemplates, PrebuiltTemplate } from '@/components/editor/iframe-templates'
```

#### Created HTML Template Converter
Added `convertHtmlTemplateToConfig()` function that converts iframe HTML templates to the TemplateConfig format used by the template registry:
- Maps HTML template structure to TemplateConfig
- Stores template data in `customProperties.isHtmlTemplate`
- Preserves engine type (mustache/handlebars)
- Stores page data for IframeEditor usage

#### Updated Template Registration
Modified `registerAllTemplates()` to:
- **Register HTML templates ONLY** (as requested)
- **Removed CraftJS editor templates** (PrebuiltTemplates and ModularTemplates)
- HTML templates are now the only templates shown in the template selector

### 2. Updated Edit Page (`src/app/catalogue/[id]/edit/page.tsx`)

#### Enhanced Template Selection Handler
Modified `handleTemplateSelect()` to detect and handle HTML templates differently:
- Detects HTML templates via `template.customProperties.isHtmlTemplate`
- Saves template ID and metadata to `catalogue.settings.iframeEditor`
- Shows appropriate success message: "HTML template selected! Click Preview to edit."
- Maintains backward compatibility for any legacy CraftJS templates

## Available HTML Templates

The following 4 HTML templates are now available in the edit page:

1. **Simple Test** (`default-html`)
   - Basic HTML template for testing
   
2. **Hero Landing Page** (`simple-product`)
   - Product showcase with hero section
   
3. **Feature Grid** (`dark-hero`)
   - Dark-themed feature grid layout
   
4. **SmellAdda Catalog Layout** (`furniture-catalog`)
   - Multi-page catalog template

## How It Works

### Template Selection Flow

1. **Edit Page** → User clicks "Template" tab
2. **Template Selector** displays the 4 HTML templates (from iframe-templates)
3. **User selects a template** → Saved to catalogue.settings.iframeEditor.templateId
4. **User clicks Preview** → Preview page loads with selected template
5. **IframeEditor renders** the HTML template using Mustache/Handlebars engine

### Preview Page Integration

The preview page (`src/app/catalogue/[id]/preview/page.tsx`) already:
- Imports HtmlTemplates and IframeEditor
- Loads the saved templateId from catalogue.settings
- Renders the template using IframeEditor component
- No changes needed!

## Template Data Flow

```
Edit Page Template Selection
         ↓
Saves to: catalogue.settings.iframeEditor.templateId
         ↓
Preview Page Reads: catalogue.settings.iframeEditor
         ↓
IframeEditor Loads: getTemplateById(templateId)
         ↓
Renders HTML template with Mustache/Handlebars engine
```

## Key Features

✅ **Only HTML templates displayed** - CraftJS templates removed as requested
✅ **Template selection persisted** - Saved to database via API
✅ **Preview integration** - Templates render correctly in IframeEditor
✅ **Multi-page support** - Templates can have multiple pages
✅ **Engine flexibility** - Supports both Mustache and Handlebars
✅ **TypeScript safe** - No type errors

## Testing Checklist

- [x] HTML templates appear in edit page template tab
- [x] Template selection saves to database
- [x] Selected template renders in preview page
- [x] IframeEditor displays HTML template correctly
- [x] Multi-page templates work properly
- [x] No TypeScript errors

## Notes

- HTML templates use IframeEditor (sandboxed iframe rendering)
- CraftJS templates (old system) have been removed from template selector
- Preview page already had IframeEditor support - no changes needed
- Template metadata stored in `catalogue.settings.iframeEditor` for persistence
