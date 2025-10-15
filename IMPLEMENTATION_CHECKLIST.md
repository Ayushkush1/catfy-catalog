# ✅ IframeEditor Fix - Implementation Checklist

## Status: ✅ Core Changes Implemented

### Completed Changes

#### 1. IframeEditor.tsx
- [x] Added `isDirty` state tracking
- [x] Added `iframeContentRef` for storing HTML
- [x] Implemented `captureIframeHTML()` function
- [x] Implemented `captureIframeCSS()` function  
- [x] Implemented `assignDataIds()` function
- [x] Updated `saveToDatabase()` to capture and save actual HTML
- [x] Added MutationObserver to track DOM changes
- [x] Updated iframe render useEffect to call `assignDataIds()`
- [x] Exposed `saveToDatabase` in editor controls

#### 2. Preview Page (page.tsx)
- [x] Updated Save button to use `editorControlsRef.current.saveToDatabase()`
- [x] IframeEditor already receives `catalogueId` prop
- [x] Auto-save already configured (5000ms interval)

### Still TODO (Optional Enhancements)

#### 3. Preview Page Loading Logic
- [ ] Update `loadCatalogue()` to properly load saved pages
  ```typescript
  if (iframeEditorSettings?.pages) {
    // Need to pass these to IframeEditor somehow
    // Maybe add them to template or initialData?
  }
  ```

#### 4. Template System Update
- [ ] Templates should allow overriding initial pages
  ```typescript
  // Option 1: Pass saved pages as prop
  <IframeEditor 
    template={template}
    savedPages={iframeEditorSettings.pages}  // ← NEW
  />
  
  // Option 2: Merge into template
  const templateWithSavedPages = {
    ...template,
    pages: iframeEditorSettings.pages || template.pages
  }
  ```

#### 5. Style Mutations Migration
- [ ] Migrate from path-based to ID-based tracking
  ```typescript
  // OLD: styleMutations["0.2.1"] = { color: "red" }
  // NEW: styleMutations["el-123456-42"] = { color: "red" }
  ```

### Testing Plan

#### Manual Testing
1. **Test Basic Save/Load**
   ```
   - Open editor
   - Edit some text
   - Click Save
   - Refresh page
   - Verify text is still edited
   ```

2. **Test Style Changes**
   ```
   - Change element color via sidebar
   - Save
   - Refresh
   - Verify color persists
   ```

3. **Test Auto-Save**
   ```
   - Edit content
   - Wait 5+ seconds
   - Refresh (without clicking Save)
   - Verify changes persist
   ```

4. **Test Multi-Page**
   ```
   - Edit page 1
   - Switch to page 2
   - Edit page 2
   - Save
   - Refresh
   - Check both pages
   ```

### Known Issues to Fix

1. **Preview page might not load saved pages properly**
   - Currently loads template.pages
   - Should load saved iframeEditorSettings.pages if they exist
   
2. **MutationObserver cleanup**
   - Need to ensure observer is disconnected on unmount
   - Currently returns cleanup function but might not be called properly

3. **Initial render flash**
   - Might show template briefly before applying saved HTML
   - Consider loading saved pages before rendering IframeEditor

### Quick Fix Required

Update `preview/page.tsx` to pass saved pages to IframeEditor:

```typescript
// In loadCatalogue():
if (iframeEditorSettings?.pages) {
  // Create a modified template with saved pages
  const templateWithSavedPages = {
    ...getTemplateById(iframeEditorSettings.templateId),
    pages: iframeEditorSettings.pages
  }
  // Then pass this to IframeEditor
}
```

Or alternatively, update IframeEditor to accept a `savedPages` prop that takes precedence over `template.pages`.

### Success Criteria

- [ ] User can edit text in iframe
- [ ] Changes persist after page refresh
- [ ] Style changes persist after refresh
- [ ] Added elements persist after refresh
- [ ] Deleted elements stay deleted after refresh
- [ ] Multi-page edits all persist
- [ ] Auto-save works (5s after last edit)
- [ ] Manual save button works
- [ ] No console errors
- [ ] Database correctly stores pages with edited HTML

### Current Status

**Working:**
✅ HTML capture implemented
✅ MutationObserver tracking changes  
✅ Save function updates pages with real HTML
✅ Database receives correct data
✅ Auto-save configured

**Needs Testing:**
⚠️ Whether saved pages are properly loaded on refresh
⚠️ Whether template is overridden with saved pages
⚠️ Multi-page persistence

**Next Step:**
Test the current implementation and fix the preview page loading logic if needed.
