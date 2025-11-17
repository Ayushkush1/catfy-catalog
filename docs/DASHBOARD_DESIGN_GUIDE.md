# Dashboard Design Guide

## Color Palette

### Primary Colors

```
Purple Gradient: from-[#2D1B69] to-[#6366F1]
Background: #F7F8FC (light gray-blue)
Card Background: #FFFFFF
```

### Accent Colors

```
Blue Stats:    #2784e0 (with gradient to #43d8a9)
Emerald:       #10B981 (success indicators)
Amber:         #F59E0B (warnings/badges)
Purple Accent: #8B5CF6 (highlights)
```

### Text Colors

```
Headings: text-gray-900 (#111827)
Body:     text-gray-600 (#4B5563)
Muted:    text-gray-500 (#6B7280)
```

## Component Styles

### Sidebar

```tsx
- Width: 264px (w-64)
- Position: fixed left
- Background: white
- Border: border-r border-gray-200
- Active Item: bg-gradient-to-r from-[#2D1B69] to-[#6366F1] text-white
- Hover: hover:bg-gray-100
- Border Radius: rounded-xl
- Padding: px-4 py-3
```

### Stats Cards

```tsx
- Border Radius: rounded-3xl
- Shadow: shadow-lg
- Padding: p-6
- Icon Container: h-12 w-12 rounded-2xl
- Title: text-3xl font-bold
- Badge: text-xs with colored background
- Hover: hover:-translate-y-1 hover:shadow-xl
```

### Quick Action Buttons

```tsx
- Border Radius: rounded-2xl
- Padding: py-6
- Shadow: shadow-lg
- Icon Container: h-12 w-12 rounded-xl
- Hover: hover:shadow-xl hover:-translate-y-0.5
- Background: bg-white with border
```

### Activity Graph

```tsx
- Bar: rounded-t-xl
- Gradient: from-[#6366F1] to-[#8B5CF6]
- Hover: hover:from-[#4f46e5] hover:to-[#7c3aed]
- Height: Proportional (40%-80%)
- Spacing: gap-2
```

## Layout Grid

### Main Container

```tsx
className = 'flex min-h-screen bg-[#F7F8FC]'
```

### Content Area (with Sidebar)

```tsx
className = 'ml-64 flex-1'
```

### Stats Grid

```tsx
className = 'grid grid-cols-1 gap-6 md:grid-cols-4'
```

### Main Content Grid

```tsx
className = 'grid grid-cols-1 gap-6 lg:grid-cols-3'
// Left: lg:col-span-2 (66%)
// Right: 1 column (33%)
```

## Animation Classes

### Hover Lift

```css
transition-all duration-300 hover:-translate-y-1 hover:shadow-lg
```

### Hover Glow

```css
transition-all duration-200 hover:shadow-xl hover:-translate-y-0.5
```

### Icon Scale

```css
transition-transform duration-300 group-hover:scale-110
```

## Spacing System

```
Gap between sections: mb-8
Gap between cards: gap-6
Card internal padding: p-6
Stats card padding: p-5
```

## Typography

### Headings

```
H1: text-3xl font-bold
H2: text-xl font-bold
H3: text-lg font-semibold
```

### Body

```
Large: text-sm
Regular: text-xs
Muted: text-xs text-gray-500
```

## Icon Sizes

```
Sidebar: h-5 w-5
Stats Cards: h-6 w-6 (in h-12 w-12 container)
Quick Actions: h-6 w-6 (in h-12 w-12 container)
Small indicators: h-4 w-4
Tiny: h-3 w-3
```

## Badge Styles

### Percentage Badge

```tsx
className = 'bg-blue-100 text-xs text-blue-700 hover:bg-blue-100'
```

### Coming Soon

```tsx
className =
  'rounded-full px-2 py-0.5 text-xs font-semibold bg-amber-100 text-amber-700'
```

### Plan Badge

```tsx
className =
  'border-amber-200 bg-amber-100 px-3 py-1.5 text-sm font-medium text-amber-700'
```

## Shadow Layers

```css
Small:  shadow-sm
Medium: shadow-md
Large:  shadow-lg
Extra:  shadow-xl
Double: shadow-2xl
```

## Border Radius Scale

```
Small:   rounded-lg (8px)
Medium:  rounded-xl (12px)
Large:   rounded-2xl (16px)
Extra:   rounded-3xl (24px)
Full:    rounded-full
```

## Gradient Patterns

### Primary Gradient

```tsx
bg-gradient-to-r from-[#2D1B69] to-[#6366F1]
bg-gradient-to-br from-[#2D1B69] to-[#6366F1]
```

### Stats Gradients

```tsx
// Blue-Purple
bg-gradient-to-br from-blue-100 to-purple-100

// Emerald-Teal
bg-gradient-to-br from-emerald-100 to-teal-100

// Amber-Orange
bg-gradient-to-br from-amber-100 to-orange-100

// Purple-Pink
bg-gradient-to-br from-purple-100 to-pink-100
```

### Icon Backgrounds

```tsx
bg-gradient-to-r from-[#43d8a9] to-[#2784e0d3]
```

## Responsive Breakpoints

```
Mobile: default (< 768px)
Tablet: md: (768px - 1024px)
Desktop: lg: (> 1024px)
Wide: xl: (> 1280px)
```

## Usage Examples

### Create a Stat Card

```tsx
<Card className="group relative overflow-hidden rounded-3xl border-0 bg-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
  <div className="absolute right-0 top-0 h-32 w-32 -translate-y-8 translate-x-8 transform">
    <div className="h-full w-full rounded-full bg-gradient-to-br from-blue-400/20 to-purple-400/20"></div>
  </div>
  <CardContent className="relative p-6">
    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-100 to-purple-100">
      <Icon className="h-6 w-6 text-blue-600" />
    </div>
    <div className="mb-2">
      <div className="mb-1 flex items-center gap-2">
        <h3 className="text-3xl font-bold text-gray-900">{value}</h3>
        <Badge className="bg-blue-100 text-xs text-blue-700">+2%</Badge>
      </div>
      <p className="text-sm font-medium text-gray-600">{label}</p>
    </div>
    <p className="text-xs text-gray-500">Description</p>
  </CardContent>
</Card>
```

### Create a Sidebar Item

```tsx
<Link
  href={href}
  className={cn(
    'group flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200',
    isActive
      ? 'bg-gradient-to-r from-[#2D1B69] to-[#6366F1] text-white shadow-md'
      : 'text-gray-700 hover:bg-gray-100'
  )}
>
  <div className="flex items-center space-x-3">
    <Icon className="h-5 w-5" />
    <span>{label}</span>
  </div>
</Link>
```
