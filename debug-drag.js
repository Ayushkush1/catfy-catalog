// Test script to run in browser console to debug drag functionality

// Test 1: Check if iframe exists and has content
console.log('=== DRAG DEBUG TEST ===');
const iframe = document.querySelector('iframe');
console.log('1. Iframe found:', !!iframe);

if (iframe && iframe.contentDocument) {
  const doc = iframe.contentDocument;
  console.log('2. Iframe document accessible:', !!doc);

  // Test 2: Check for elements with data-id
  const elementsWithDataId = doc.querySelectorAll('[data-id]');
  console.log('3. Elements with data-id:', elementsWithDataId.length);
  elementsWithDataId.forEach((el, i) => {
    console.log(`   Element ${i + 1}:`, el.tagName, el.dataset.id);
  });

  // Test 3: Check if drag script was injected
  const dragHandles = doc.querySelectorAll('.drag-handle');
  console.log('4. Drag handles found:', dragHandles.length);

  // Test 4: Check if interact.js is loaded
  const interactExists = iframe.contentWindow.interact;
  console.log('5. Interact.js loaded:', !!interactExists);

  // Test 5: Check if drag initialization flag is set
  const dragInitialized = iframe.contentWindow.dragDropInitialized;
  console.log('6. Drag initialized:', !!dragInitialized);

  // Test 6: Manual drag handle injection (if needed)
  if (elementsWithDataId.length > 0 && dragHandles.length === 0) {
    console.log('⚠️ Elements found but no drag handles - manually adding...');
    elementsWithDataId.forEach(el => {
      const handle = doc.createElement('div');
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
      handle.innerHTML = '⋮⋮';
      el.style.position = 'relative';
      el.appendChild(handle);
    });
    console.log('✅ Manually added drag handles');
  }
} else {
  console.log('❌ Cannot access iframe document');
}