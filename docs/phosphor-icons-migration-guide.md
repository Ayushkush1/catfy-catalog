# Migration Guide: From Custom SVG to Phosphor Icons

## Overview

This guide helps you migrate from hardcoded SVG icons to Phosphor Icons in your components.

## Before & After

### Before (Custom SVG)

```tsx
const icon = (
  <svg viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
  </svg>
)
```

### After (Phosphor Icons)

```tsx
import { Heart } from '@phosphor-icons/react'

const icon = <Heart size={24} weight="regular" />
```

## Step-by-Step Migration

### Step 1: Import Phosphor Icons

```tsx
// Add at the top of your file
import { Heart, Star, User, Settings } from '@phosphor-icons/react'
```

### Step 2: Replace SVG with Icon Component

```tsx
// Before
<svg className="h-6 w-6" viewBox="0 0 24 24">
  <path d="..." />
</svg>

// After
<Heart size={24} weight="regular" />
```

### Step 3: Map Icon Names

Common icon mappings from generic names to Phosphor:

| Old Name      | Phosphor Icon   | Import                                                    |
| ------------- | --------------- | --------------------------------------------------------- |
| menu          | List            | `import { List } from '@phosphor-icons/react'`            |
| close/cross   | X               | `import { X } from '@phosphor-icons/react'`               |
| check/tick    | Check           | `import { Check } from '@phosphor-icons/react'`           |
| settings/gear | Gear            | `import { Gear } from '@phosphor-icons/react'`            |
| search        | MagnifyingGlass | `import { MagnifyingGlass } from '@phosphor-icons/react'` |
| plus/add      | Plus            | `import { Plus } from '@phosphor-icons/react'`            |
| trash/delete  | Trash           | `import { Trash } from '@phosphor-icons/react'`           |
| edit/pencil   | PencilLine      | `import { PencilLine } from '@phosphor-icons/react'`      |
| image/picture | Image           | `import { Image } from '@phosphor-icons/react'`           |
| user/profile  | User            | `import { User } from '@phosphor-icons/react'`            |
| home          | House           | `import { House } from '@phosphor-icons/react'`           |
| folder        | Folder          | `import { Folder } from '@phosphor-icons/react'`          |
| file          | File            | `import { File } from '@phosphor-icons/react'`            |
| video         | VideoCamera     | `import { VideoCamera } from '@phosphor-icons/react'`     |
| arrow-right   | ArrowRight      | `import { ArrowRight } from '@phosphor-icons/react'`      |

### Step 4: Convert className to Props

```tsx
// Before
<svg className="h-6 w-6 text-blue-600">
  <path d="..." />
</svg>

// After
<Heart
  size={24}
  className="text-blue-600"
/>
```

## Common Patterns

### Pattern 1: Conditional Icons

```tsx
// Before
{isLiked ? (
  <svg><!-- filled heart --></svg>
) : (
  <svg><!-- outline heart --></svg>
)}

// After
<Heart weight={isLiked ? 'fill' : 'regular'} />
```

### Pattern 2: Icon with State

```tsx
// Before
<svg className={isActive ? 'text-blue-600' : 'text-gray-400'}>
  <path d="..." />
</svg>

// After
<Heart
  weight={isActive ? 'bold' : 'regular'}
  className={isActive ? 'text-blue-600' : 'text-gray-400'}
/>
```

### Pattern 3: Icon Button

```tsx
// Before
<button className="p-2 hover:bg-gray-100">
  <svg className="h-5 w-5">
    <path d="..." />
  </svg>
</button>

// After
<button className="p-2 hover:bg-gray-100">
  <Trash size={20} weight="regular" />
</button>
```

### Pattern 4: Icon in Array/Map

```tsx
// Before
const icons = {
  heart: '<svg>...</svg>',
  star: '<svg>...</svg>',
}

// After
import { Heart, Star } from '@phosphor-icons/react'

const icons = {
  heart: Heart,
  star: Star,
}

// Usage
const IconComponent = icons.heart
<IconComponent size={20} />
```

## Finding the Right Icon

### Method 1: Browse the Website

Visit [phosphoricons.com](https://phosphoricons.com/) and search by keyword

### Method 2: Search in VS Code

With TypeScript autocomplete:

```tsx
import {} from /* Type to search */ '@phosphor-icons/react'
//         ^ Autocomplete will show all available icons
```

### Method 3: Common Categories

```tsx
// Text & Typography
import { TextT, TextHOne, TextAlignLeft, Quotes } from '@phosphor-icons/react'

// Layout
import {
  Square,
  Rectangle,
  Circle,
  SquaresFour,
  Rows,
} from '@phosphor-icons/react'

// Media
import { Image, VideoCamera, Camera, FilmStrip } from '@phosphor-icons/react'

// Actions
import { Plus, Minus, X, Check, Trash, PencilLine } from '@phosphor-icons/react'

// Navigation
import {
  ArrowLeft,
  ArrowRight,
  CaretDown,
  House,
  List,
} from '@phosphor-icons/react'

// Business
import {
  Briefcase,
  ChartBar,
  CurrencyDollar,
  ShoppingCart,
} from '@phosphor-icons/react'
```

## Advanced: Dynamic Icons

### Loading Icons Dynamically

```tsx
import * as PhosphorIcons from '@phosphor-icons/react'

function DynamicIcon({ iconName, ...props }: { iconName: string }) {
  const Icon = PhosphorIcons[iconName as keyof typeof PhosphorIcons]

  if (!Icon) return null

  return <Icon {...props} />
}

// Usage
;<DynamicIcon iconName="Heart" size={24} weight="fill" />
```

### Icon Registry

```tsx
import { Heart, Star, User, Settings } from '@phosphor-icons/react'

const iconRegistry = {
  favorite: Heart,
  rating: Star,
  profile: User,
  config: Settings,
} as const

type IconName = keyof typeof iconRegistry

function RegistryIcon({ name, ...props }: { name: IconName }) {
  const Icon = iconRegistry[name]
  return <Icon {...props} />
}

// Usage
;<RegistryIcon name="favorite" size={20} weight="fill" />
```

## Troubleshooting

### Icon Not Found

```tsx
// ❌ Error: Property 'MyIcon' does not exist
import { MyIcon } from '@phosphor-icons/react'

// ✅ Solution: Check the correct name at phosphoricons.com
// Icon names are PascalCase and may differ from what you expect
```

### Wrong Size

```tsx
// ❌ Icon too small/large
<Heart className="h-6 w-6" />  // Tailwind classes don't work

// ✅ Use size prop
<Heart size={24} />
```

### Color Not Applying

```tsx
// ❌ Color not showing
<Heart color="blue" />

// ✅ Use valid CSS color or className
<Heart color="#0000ff" />
<Heart className="text-blue-600" />
```

### Weight Not Changing

```tsx
// ❌ Typo in weight
<Heart weight="filled" />  // Invalid

// ✅ Use valid weight
<Heart weight="fill" />  // Valid: thin, light, regular, bold, fill, duotone
```

## Performance Checklist

- ✅ Import only needed icons (not `* as PhosphorIcons`)
- ✅ Use IconContext for common props
- ✅ Avoid inline icon definitions in loops
- ✅ Memoize dynamic icon components if needed

## Before You Migrate: Checklist

- [ ] Identify all icon usages in your component
- [ ] Find equivalent Phosphor icons
- [ ] Note any custom styling/behavior
- [ ] Test icon sizes and weights
- [ ] Verify color inheritance works
- [ ] Check responsive behavior
- [ ] Test hover/active states
- [ ] Validate accessibility (ARIA labels if needed)

## Need Help?

- 📚 [Phosphor Icons Documentation](https://github.com/phosphor-icons/react)
- 🎨 [Icon Gallery](https://phosphoricons.com/)
- 💬 [GitHub Issues](https://github.com/phosphor-icons/react/issues)
- 📖 See `PHOSPHOR_ICONS_INTEGRATION.md` for implementation details

---

**Created**: October 30, 2025  
**Status**: Ready for use
