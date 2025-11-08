# Quick Start: Collaborative Editing Features

## ✅ All Features Implemented Successfully!

Three collaborative editing features are now ready to use:

1. **Optimistic Locking** - Prevents data loss from concurrent edits
2. **Real-time Sync** - Notifies users when others make changes
3. **Presence Tracking** - Shows who's currently editing

---

## 🚀 Quick Integration (5 Minutes)

### Step 1: Import the Hooks and Components

```typescript
import { useCatalogueRealtime } from '@/hooks/useCatalogueRealtime'
import { useCataloguePresence } from '@/hooks/useCataloguePresence'
import { VersionConflictDialog } from '@/components/editor/VersionConflictDialog'
import { ActiveUsersCard } from '@/components/editor/ActiveUsersCard'
```

### Step 2: Add State Variables

```typescript
const [catalogueVersion, setCatalogueVersion] = useState(1)
const [showConflictDialog, setShowConflictDialog] = useState(false)
const [conflictData, setConflictData] = useState<any>(null)
```

### Step 3: Enable Real-time Updates

```typescript
useCatalogueRealtime({
  catalogueId: 'your-catalogue-id',
  enabled: true,
})
```

### Step 4: Track Active Users

```typescript
const { activeUsers, isTracking } = useCataloguePresence({
  catalogueId: 'your-catalogue-id',
  currentUser: {
    userId: user.id,
    fullName: user.name,
    email: user.email,
  },
  currentSection: 'general', // or 'products', 'categories', 'settings'
  enabled: true,
})
```

### Step 5: Update Save Function

```typescript
const handleSave = async (updates: any) => {
  const response = await fetch(`/api/catalogues/${catalogueId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...updates,
      version: catalogueVersion, // Include current version
    }),
  })

  // Check for version conflict
  if (response.status === 409) {
    const conflict = await response.json()
    setConflictData(conflict)
    setShowConflictDialog(true)
    return
  }

  if (response.ok) {
    const data = await response.json()
    setCatalogueVersion(data.catalogue.version) // Update version
  }
}
```

### Step 6: Add UI Components

```typescript
return (
  <div>
    {/* Your existing editor UI */}
    
    {/* Active users card (bottom-right corner) */}
    <ActiveUsersCard users={activeUsers} isTracking={isTracking} />
    
    {/* Version conflict dialog */}
    <VersionConflictDialog
      open={showConflictDialog}
      onOpenChange={setShowConflictDialog}
      onReload={() => window.location.reload()}
      onOverwrite={async () => {
        setShowConflictDialog(false)
        // Save with forceUpdate flag
        await fetch(`/api/catalogues/${catalogueId}`, {
          method: 'PUT',
          body: JSON.stringify({ ...updates, forceUpdate: true }),
        })
      }}
      updatedAt={conflictData?.updatedAt}
    />
  </div>
)
```

---

## 📋 Required: Enable Supabase Real-time

**Important:** Real-time features won't work until you enable replication!

1. Go to your Supabase Dashboard
2. Navigate to **Database → Replication**
3. Enable replication for these tables:
   - ✅ `catalogues`
   - ✅ `categories`
   - ✅ `products`

---

## 🧪 Test It Out

### Test Version Conflicts:
1. Open catalogue in two browser tabs
2. Make changes in Tab 1, save
3. Make different changes in Tab 2, save
4. Tab 2 shows conflict dialog ✅

### Test Real-time Notifications:
1. Open catalogue in two browser tabs
2. Add a product in Tab 1
3. Tab 2 shows toast notification ✅

### Test Presence Tracking:
1. Open catalogue in Tab 1 (User A)
2. Open same catalogue in Tab 2 (User B)
3. Both tabs show active users card ✅
4. User avatars and sections display ✅

---

## 📦 What Was Installed

### Database Changes:
- Added `version` field to `catalogues` table
- Migration: `20251108000000_add_version_to_catalogues`

### New Files:
1. `src/hooks/useCatalogueRealtime.ts` - Real-time subscriptions
2. `src/hooks/useCataloguePresence.ts` - Presence tracking
3. `src/components/editor/VersionConflictDialog.tsx` - Conflict UI
4. `src/components/editor/ActiveUsersCard.tsx` - Active users display
5. `src/app/api/catalogues/[id]/version/route.ts` - Version check endpoint

### Modified Files:
1. `src/app/api/catalogues/[id]/route.ts` - Added version checking
2. `prisma/schema.prisma` - Added version field

---

## 🎯 API Changes

### GET /api/catalogues/[id]
```json
{
  "catalogue": {
    "id": "...",
    "name": "...",
    "version": 1,  // ← New field
    "..."
  }
}
```

### PUT /api/catalogues/[id]
**Request:**
```json
{
  "name": "...",
  "version": 1,  // ← Required for conflict detection
  "forceUpdate": false  // ← Optional: skip version check
}
```

**Success Response (200):**
```json
{
  "catalogue": {
    "version": 2,  // ← Incremented
    "..."
  }
}
```

**Conflict Response (409):**
```json
{
  "error": "Version conflict",
  "currentVersion": 2,
  "clientVersion": 1,
  "updatedAt": "2024-01-15T10:30:00Z"
}
```

### GET /api/catalogues/[id]/version
**Response:**
```json
{
  "version": 2,
  "updatedAt": "2024-01-15T10:30:00Z",
  "lastModifiedBy": "John Doe"
}
```

---

## 💡 Usage Tips

### Update Section When User Navigates:

```typescript
// When user clicks Products tab
setCurrentSection('products')

// When user clicks Categories tab
setCurrentSection('categories')

// When user clicks Settings
setCurrentSection('settings')
```

### Handle Real-time Updates:

```typescript
const { lastUpdate } = useCatalogueRealtime({
  catalogueId,
  onUpdate: (update) => {
    if (update.type === 'product') {
      // Reload products list
      refetchProducts()
    }
  },
})
```

### Custom Notifications:

```typescript
import { useToast } from '@/hooks/use-toast'

const { toast } = useToast()

// Show custom notification
toast({
  title: 'Saved!',
  description: 'Your changes have been saved.',
  duration: 3000,
})
```

---

## 📚 Full Documentation

- **Integration Guide:** `docs/COLLABORATIVE_EDITING_INTEGRATION.md`
- **Implementation Summary:** `docs/COLLABORATIVE_EDITING_SUMMARY.md`

---

## ❓ Troubleshooting

**Q: Real-time notifications not showing?**
- Check Supabase replication is enabled
- Verify Supabase credentials in `.env`
- Check browser console for WebSocket errors

**Q: Version conflicts not detected?**
- Ensure `version` field is included in save requests
- Check API response includes updated version
- Verify database has version column

**Q: Active users not showing?**
- Ensure `currentUser` prop is provided
- Check presence is enabled (`enabled: true`)
- Wait 2-3 seconds for presence sync

**Q: TypeScript errors about 'version'?**
- Run `npx prisma generate` to refresh types
- Restart VS Code or TypeScript server
- Types will auto-fix after reload

---

## ✨ All Done!

You now have enterprise-grade collaborative editing features! 🎉

**Next Steps:**
1. Test the features
2. Enable Supabase replication
3. Integrate into your catalogue editor
4. Enjoy conflict-free collaboration!
