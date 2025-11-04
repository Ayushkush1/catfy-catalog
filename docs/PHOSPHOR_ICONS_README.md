# 🎨 Phosphor Icons - Quick Start Guide

## 🚀 Getting Started

Phosphor Icons is now fully integrated into your Catfy editor! Here's everything you need to know to start using it.

## 📦 Installation (Already Done ✅)

```bash
npm install @phosphor-icons/react
```

## 🎯 Quick Usage

### Import Icons
```tsx
import { Heart, Star, User, Settings } from '@phosphor-icons/react'
```

### Basic Usage
```tsx
<Heart size={24} />
<Star size={20} weight="fill" />
<User size={32} weight="bold" className="text-blue-600" />
```

## 🎨 Icon Properties

| Property | Type | Options | Default | Description |
|----------|------|---------|---------|-------------|
| `size` | number | Any px value | 20 | Icon size in pixels |
| `weight` | string | thin, light, regular, bold, fill, duotone | regular | Icon stroke weight |
| `color` | string | Any CSS color | currentColor | Icon color |
| `className` | string | Any CSS classes | - | Additional styling |

## 💡 Common Patterns

### Like Button
```tsx
const [isLiked, setIsLiked] = useState(false)

<Heart 
  size={24} 
  weight={isLiked ? 'fill' : 'regular'}
  className={isLiked ? 'text-red-500' : 'text-gray-400'}
  onClick={() => setIsLiked(!isLiked)}
/>
```

### Button with Icon
```tsx
<button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg">
  <Plus size={20} weight="bold" />
  <span>Add Item</span>
</button>
```

### Icon with Badge
```tsx
<div className="relative">
  <Bell size={24} />
  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
    3
  </span>
</div>
```

## 🏷️ Categories Available

### In Icons Panel (Left Sidebar → Icons Tab)

- **Business** (12): Briefcase, Chart, Dollar, Bank, etc.
- **Social** (12): Heart, Share, Star, Chat, etc.
- **Arrows** (12): Right, Left, Up, Down, Circle, etc.
- **UI** (12): List, X, Check, Gear, Search, etc.
- **Design** (12): Pencil, Palette, Image, Shapes, etc.
- **E-commerce** (12): Cart, Bag, Tag, Gift, etc.
- **Media** (12): Play, Camera, Video, Music, etc.

**Total: 84+ icons** organized and searchable!

## ⚙️ Icon Context (Global Settings)

Already configured in your editor:

```tsx
<IconContext.Provider value={{ 
  size: 20, 
  weight: 'regular', 
  color: 'currentColor' 
}}>
  {/* All icons inherit these defaults */}
  <Heart />  {/* size=20, weight=regular */}
</IconContext.Provider>
```

## 🎨 Weight Visual Guide

| Weight | Use Case | Example |
|--------|----------|---------|
| **thin** | Minimal, delicate | Backgrounds, large icons |
| **light** | Subtle, clean | Secondary actions |
| **regular** | Default, balanced | Most UI elements |
| **bold** | Emphasis, selected | Active states, primary |
| **fill** | Solid, high emphasis | Favorites, toggles on |
| **duotone** | Two-tone, modern | Special features |

## 📚 Where to Find Icons

### 1. Icons Panel in Editor
- Click "Icons" tab in left sidebar
- Search or browse categories
- Select weight (Regular/Bold/Fill)
- Click to add to canvas

### 2. Phosphor Website
- Visit: https://phosphoricons.com/
- Browse 6000+ icons
- Copy icon name
- Import and use

### 3. Examples Component
Check `src/components/examples/PhosphorIconsExamples.tsx` for:
- 10 complete examples
- Interactive demos
- Common patterns
- Best practices

## 🔍 Finding the Right Icon

### Search Tips
- Be descriptive: "shopping" finds ShoppingCart, ShoppingBag
- Try synonyms: "delete" → try Trash, X, Minus
- Browse categories in Icons Panel
- Check Phosphor website for visual search

### Icon Name Patterns
- **Actions**: Plus, Minus, X, Check, Trash
- **Objects**: Heart, Star, ShoppingCart, User
- **Navigation**: ArrowRight, CaretDown, House
- **Media**: Image, VideoCamera, Camera
- **Text**: TextT, TextHOne, TextAlignLeft

## 🛠️ Customization

### Override Size
```tsx
<Heart size={32} />  {/* Larger */}
<Star size={12} />   {/* Smaller */}
```

### Override Weight
```tsx
<User weight="bold" />   {/* Heavier */}
<Gear weight="light" />  {/* Lighter */}
```

### Override Color
```tsx
<Heart color="#ff0000" />
<Star className="text-yellow-500" />
```

## 🎯 Best Practices

### ✅ Do's
- Use named imports for tree-shaking
- Set defaults with IconContext
- Use semantic icon names
- Include labels for accessibility
- Use `currentColor` for flexibility

### ❌ Don'ts
- Avoid `import *` in production
- Don't use Tailwind h-/w- for sizing (use `size` prop)
- Don't hardcode colors everywhere
- Don't use icons without context

## 📱 Responsive Sizing

```tsx
// Responsive with Tailwind
<Heart className="h-4 w-4 sm:h-6 sm:w-6 lg:h-8 lg:w-8" />

// Or use different sizes per breakpoint
const iconSize = useBreakpoint({
  sm: 16,
  md: 20,
  lg: 24,
})
<Heart size={iconSize} />
```

## 🔗 Resources

- 📖 **Main Guide**: `PHOSPHOR_ICONS_INTEGRATION.md`
- 🎨 **Visual Guide**: `docs/phosphor-icons-visual-guide.md`
- 🔄 **Migration Guide**: `docs/phosphor-icons-migration-guide.md`
- 💻 **Examples**: `src/components/examples/PhosphorIconsExamples.tsx`
- 🌐 **Website**: https://phosphoricons.com/
- 📦 **NPM**: https://npmjs.com/package/@phosphor-icons/react

## ❓ Troubleshooting

### Icon not found?
→ Check correct name at phosphoricons.com (case-sensitive)

### Icon too small/large?
→ Use `size` prop, not className for sizing

### Color not working?
→ Use valid CSS color or Tailwind class

### Weight not changing?
→ Check spelling: thin, light, regular, bold, fill, duotone

## 💡 Pro Tips

1. **Use IconContext** for consistent styling across your app
2. **Browse the website** to discover new icons
3. **Check examples** for common patterns
4. **Combine weights** for state changes (regular → bold on hover)
5. **Use fill weight** for selected/active states
6. **Keep accessibility in mind** - add labels!

## 🎉 You're All Set!

Start using Phosphor Icons in your components:

```tsx
import { Heart, Star, ShoppingCart } from '@phosphor-icons/react'

function MyComponent() {
  return (
    <div className="flex gap-4">
      <Heart size={24} weight="fill" className="text-red-500" />
      <Star size={24} weight="fill" className="text-yellow-500" />
      <ShoppingCart size={24} weight="regular" />
    </div>
  )
}
```

**Happy coding! 🚀**

---

Need help? Check the comprehensive guides in the `docs/` folder!
