# Phosphor Icons Visual Style Guide

## Icon Weights Comparison

Phosphor Icons supports 6 different weights to match your UI's visual style:

### Available Weights

```tsx
// Thin - Lightest, most delicate
<Heart size={32} weight="thin" />

// Light - Subtle and clean
<Heart size={32} weight="light" />

// Regular - Default, balanced (recommended for most UIs)
<Heart size={32} weight="regular" />

// Bold - Strong emphasis
<Heart size={32} weight="bold" />

// Fill - Solid, high emphasis
<Heart size={32} weight="fill" />

// Duotone - Two-tone style, modern
<Heart size={32} weight="duotone" />
```

## Recommended Usage by Context

### Regular Weight

**Use for**: Default UI elements, body content, general interface

```tsx
<Settings size={20} weight="regular" />
<File size={20} weight="regular" />
<User size={20} weight="regular" />
```

### Bold Weight

**Use for**: Selected states, active items, emphasized actions

```tsx
// Selected layer in layers panel
{
  isSelected && <Square size={16} weight="bold" />
}

// Active tab
{
  isActive && <Folder size={24} weight="bold" />
}

// Primary action buttons
;<Plus size={24} weight="bold" />
```

### Fill Weight

**Use for**: High-emphasis states, toggle on, favorites

```tsx
// Favorited item
{
  isFavorited && <Star size={20} weight="fill" />
}

// Toggle enabled
{
  isEnabled && <CheckCircle size={24} weight="fill" />
}

// Notification badge
;<Bell size={20} weight="fill" />
```

## UI Patterns in Catfy Editor

### Layer Panel Icons (Regular Weight)

Clean, readable element type indicators:

```tsx
const getElementIcon = (tagName: string) => {
  const iconProps = { size: 16, weight: 'regular' as const }

  if (tagName === 'img') return <Image {...iconProps} />
  if (tagName === 'button') return <SquaresFour {...iconProps} />
  // ... etc
}
```

### Icons Panel (Weight Selector)

Users can choose their preferred icon style:

- **Regular**: Clean, professional look
- **Bold**: More prominent, easier to identify
- **Fill**: Solid shapes, modern aesthetic

### Hover States

Transition between weights for interactive feedback:

```tsx
// Default state
<Icon weight="regular" />

// Hover state (can transition to bold)
<Icon weight="bold" className="group-hover:opacity-100" />
```

## Size Guidelines

### Icon Sizes by Context

| Context           | Size    | Example Usage                 |
| ----------------- | ------- | ----------------------------- |
| Small UI elements | 12-14px | Inline indicators, badges     |
| List items        | 16px    | Layer panel, file lists       |
| Buttons           | 20-24px | Toolbar buttons, actions      |
| Tab navigation    | 24-28px | Left sidebar tabs             |
| Headers           | 32-40px | Section headers, empty states |
| Hero elements     | 48-64px | Onboarding, large CTAs        |

### Implementation Examples

```tsx
// Small inline icon
<Warning size={12} weight="fill" className="text-yellow-500" />

// Standard button icon
<Plus size={20} weight="regular" />

// Large empty state
<FolderOpen size={64} weight="light" className="text-gray-300" />
```

## Color Strategy

### Using currentColor (Recommended)

Icons inherit text color from parent:

```tsx
<IconContext.Provider value={{ color: 'currentColor' }}>
  <div className="text-blue-600">
    <Heart /> {/* Will be blue-600 */}
  </div>
</IconContext.Provider>
```

### Custom Colors

Override when needed:

```tsx
// Success state
<CheckCircle color="#10b981" weight="fill" />

// Error state
<XCircle color="#ef4444" weight="fill" />

// Warning
<Warning color="#f59e0b" weight="fill" />
```

### Semantic Colors

```tsx
// Primary action
<button className="text-blue-600">
  <Plus /> {/* Inherits blue-600 */}
</button>

// Danger action
<button className="text-red-600">
  <Trash /> {/* Inherits red-600 */}
</button>

// Disabled state
<button className="text-gray-400" disabled>
  <Lock /> {/* Inherits gray-400 */}
</button>
```

## State Indicators

### Selected vs Unselected

```tsx
// Layer panel item
<div className={isSelected ? 'bg-blue-50 text-blue-600' : 'text-gray-600'}>
  <Square size={16} weight={isSelected ? 'bold' : 'regular'} />
  <span>{layerName}</span>
</div>
```

### Active vs Inactive

```tsx
// Tab navigation
<button className={isActive ? 'bg-blue-50 text-blue-600' : 'text-gray-600'}>
  <Icon size={24} weight={isActive ? 'fill' : 'regular'} />
</button>
```

### Enabled vs Disabled

```tsx
// Feature toggle
{
  isEnabled ? (
    <ToggleRight size={24} weight="fill" className="text-green-500" />
  ) : (
    <ToggleLeft size={24} weight="regular" className="text-gray-400" />
  )
}
```

## Animation & Transitions

### Smooth Weight Transitions

```css
.icon-transition {
  transition: all 200ms ease-in-out;
}
```

```tsx
<div className="group">
  <Heart
    size={24}
    weight={isHovered ? 'fill' : 'regular'}
    className="transition-all duration-200 group-hover:scale-110"
  />
</div>
```

### Color Transitions

```tsx
<Icon
  size={20}
  className="text-gray-600 transition-colors duration-200 hover:text-blue-600"
/>
```

## Accessibility

### Size Contrast

Ensure icons are large enough to be clearly visible:

- **Minimum**: 16px for UI elements
- **Recommended**: 20-24px for interactive elements
- **Touch targets**: 44px minimum (iOS), 48px (Material Design)

### Color Contrast

Follow WCAG guidelines:

- **Normal text**: 4.5:1 contrast ratio
- **Large text/icons**: 3:1 contrast ratio
- Use bold weight for better visibility at smaller sizes

### Semantic Meaning

Don't rely on color alone:

```tsx
// ❌ Bad - color only
<Heart color="red" />

// ✅ Good - weight + color + label
<div className="flex items-center gap-2">
  <Heart weight="fill" className="text-red-500" />
  <span>Favorite</span>
</div>
```

## Performance Tips

### Tree-Shaking

Import only what you need:

```tsx
// ✅ Good - only bundles used icons
import { Heart, Star, User } from '@phosphor-icons/react'

// ❌ Avoid in production - bundles everything
import * as PhosphorIcons from '@phosphor-icons/react'
```

### Icon Context

Set defaults once, use everywhere:

```tsx
// Set at root level
<IconContext.Provider value={{ size: 20, weight: 'regular' }}>
  <App />
</IconContext.Provider>

// Use throughout app without props
<Heart />  // Automatically 20px, regular weight
```

## Quick Reference: Most Used Icons

### Navigation

- `House` - Home
- `CaretLeft/Right` - Navigation arrows
- `List` - Menu
- `X` - Close
- `MagnifyingGlass` - Search

### Actions

- `Plus` - Add
- `Minus` - Remove
- `Trash` - Delete
- `PencilLine` - Edit
- `Check` - Confirm

### Content

- `Image` - Images
- `TextT` - Text
- `VideoCamera` - Video
- `File` - Files
- `Folder` - Folders

### Social

- `Heart` - Favorite/Like
- `Star` - Rating/Featured
- `ShareNetwork` - Share
- `ChatCircle` - Comments
- `Users` - People

### Status

- `CheckCircle` - Success
- `XCircle` - Error
- `Warning` - Warning
- `Info` - Information
- `Bell` - Notifications

---

**Last Updated**: October 30, 2025  
**Version**: 1.0  
**Icon Library**: Phosphor Icons React
