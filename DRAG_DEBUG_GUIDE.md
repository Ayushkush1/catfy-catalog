## 🔧 **Drag & Drop Debug Guide**

### 🐛 **Issue**: Elements not draggable, no drag handles appearing

### 🔍 **Debug Steps**

#### 1. **Check Browser Console**
Open your browser's developer tools and look for these logs:
- `🎯 Injecting drag script into iframe...`
- `🚀 Initializing drag and drop in iframe...`
- `📦 Found X elements with data-id: [...]`
- `✅ Added drag handle to element [id]`

#### 2. **Run Debug Script**
Copy and paste this into your browser console:
```javascript
// Test if iframe and elements exist
const iframe = document.querySelector('iframe');
if (iframe && iframe.contentDocument) {
  const elements = iframe.contentDocument.querySelectorAll('[data-id]');
  console.log('Elements with data-id:', elements.length);
  const handles = iframe.contentDocument.querySelectorAll('.drag-handle');
  console.log('Drag handles:', handles.length);
  console.log('Interact.js loaded:', !!iframe.contentWindow.interact);
}
```

#### 3. **Manual Fix (If Needed)**
If elements exist but no drag handles, run this in console:
```javascript
const iframe = document.querySelector('iframe');
if (iframe && iframe.contentDocument) {
  const elements = iframe.contentDocument.querySelectorAll('[data-id]');
  elements.forEach(el => {
    const handle = iframe.contentDocument.createElement('div');
    handle.className = 'drag-handle';
    handle.style.cssText = `
      position: absolute;
      top: -8px;
      right: -8px;
      width: 20px;
      height: 20px;
      background: #3b82f6;
      border: 2px solid white;
      border-radius: 50%;
      cursor: grab;
      z-index: 10;
    `;
    el.style.position = 'relative';
    el.appendChild(handle);
  });
  console.log('✅ Added drag handles manually');
}
```

### 🔧 **Common Issues & Solutions**

#### **Issue 1: Script injection timing**
**Solution**: Click the "🔧 Force Init Drag" button in the canvas

#### **Issue 2: interact.js not loading**
**Solution**: Check network tab for CDN loading issues

#### **Issue 3: Elements don't have data-id**
**Solution**: The assignDataIds() function should run first

#### **Issue 4: iframe sandbox restrictions**
**Solution**: Ensure iframe has `allow-scripts` in sandbox

### ⚡ **Quick Fix Commands**

Run in browser console to force initialization:
```javascript
// Force re-initialize drag system
window.postMessage({ type: 'FORCE_DRAG_INIT' }, '*');
```

### 🎯 **Expected Behavior**
1. **Hover** any element → Blue outline appears
2. **Click** element → Gets selected (right sidebar opens)
3. **Hover** selected element → Blue drag handle appears (top-right)
4. **Drag** handle → Element moves with snap-to-grid
5. **Drop** on container → Element reparents

### 📝 **Debug Checklist**
- [ ] Console shows "Injecting drag script"
- [ ] Console shows "Found X elements with data-id"
- [ ] Console shows "Added drag handle to element"
- [ ] Elements have blue outline on hover
- [ ] Drag handles appear on selected elements
- [ ] Console shows interact.js is loaded
- [ ] Dragging triggers console logs

If any step fails, use the Force Init button or manual console fixes above.