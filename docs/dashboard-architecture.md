# Dashboard Architecture

## Overview
The dashboard has been restructured into a main hub dashboard and tool-specific dashboards to provide better organization and user experience.

## Structure

### Main Dashboard (`/dashboard`)
- **Purpose**: Central hub showing all available tools
- **Features**:
  - Welcome section with user greeting
  - Quick stats overview (total projects, active tools, total items)
  - Tool cards for each available tool (Product Catalogues, PDF Editor, etc.)
  - Recent activity feed across all tools
  - First-time user onboarding guide

### Tool-Specific Dashboards
Each tool has its own dedicated dashboard showing tool-specific features and content.

#### Catalogue Dashboard (`/dashboard/catalogue`)
- **Purpose**: Manage product catalogues
- **Features**:
  - Catalogue-specific stats (catalogues, products, views, exports)
  - Recent catalogue activity
  - All catalogues grid view
  - Quick actions (create, browse, export, share)
  - Breadcrumb navigation
  - Tool switcher

## Navigation Flow

```
Login → Main Dashboard (/dashboard)
   ├── Tool Card Click → Tool Dashboard (/dashboard/{tool})
   │   ├── Breadcrumb → Back to Main Dashboard
   │   ├── Tool Switcher → Switch to Another Tool
   │   └── Create/Browse → Tool Features
   └── Recent Activity → Direct to Item
```

## Components

### Breadcrumb (`/components/dashboard/Breadcrumb.tsx`)
- Shows navigation path
- Supports light/dark variants
- Auto-hides on main dashboard

### ToolCard (`/components/dashboard/ToolCard.tsx`)
- Displays tool information
- Shows stats and features
- Handles active/inactive states
- "Coming Soon" support

### OnboardingGuide (`/components/dashboard/OnboardingGuide.tsx`)
- First-time user tour
- 3-step introduction
- Skippable
- Stored in localStorage

### ToolSwitcher (`/components/dashboard/ToolSwitcher.tsx`)
- Quick tool switching dropdown
- Shows current active tool
- Links back to main dashboard

## User Experience

### First-Time Users
1. Login → Onboarding guide appears
2. 3-step tour of the platform
3. Tool selection from main dashboard
4. Start creating

### Returning Users
1. Login → Main dashboard with recent activity
2. Quick access to last used tool
3. Or select different tool

## Future Tools
To add a new tool:

1. **Add Tool Definition** in `/dashboard/page.tsx`:
```typescript
{
  id: 'new-tool',
  name: 'New Tool Name',
  description: 'Tool description',
  icon: IconComponent,
  color: '[#COLOR]',
  gradient: 'bg-gradient-to-br from-[#COLOR1] to-[#COLOR2]',
  route: '/dashboard/new-tool',
  isActive: true,
  features: ['Feature 1', 'Feature 2', 'Feature 3'],
  stats: [
    { label: 'Stat 1', value: 0 },
    { label: 'Stat 2', value: 0 }
  ]
}
```

2. **Create Tool Dashboard** at `/app/dashboard/{tool}/page.tsx`

3. **Update ToolSwitcher** in `/components/dashboard/ToolSwitcher.tsx`:
```typescript
{
  id: 'new-tool',
  name: 'New Tool Name',
  icon: IconComponent,
  href: '/dashboard/new-tool',
  isActive: true
}
```

4. **Add API Routes** if needed at `/app/api/{tool}/`

## Key Benefits

1. **Scalability**: Easy to add new tools without cluttering
2. **Organization**: Each tool has dedicated space
3. **User-Friendly**: Clear navigation paths
4. **Onboarding**: Guides new users effectively
5. **Flexibility**: Tools can be active/inactive/coming soon
6. **Consistency**: Shared components for unified experience

## Migration Notes

- Old dashboard moved to `/dashboard/catalogue`
- Main `/dashboard` is now the hub
- All existing catalogue features preserved
- Breadcrumb navigation added
- Tool switcher for quick navigation
- No breaking changes to existing functionality
