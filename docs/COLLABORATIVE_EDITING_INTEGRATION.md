# Integration Guide: Optimistic Locking, Real-time Sync & Presence Tracking

This guide shows how to integrate the three collaborative editing features into the catalogue editor.

## Features Implemented

### 1. Optimistic Locking (Version Conflict Detection)
- **Backend**: Version field in database, conflict detection in API
- **Location**: `src/app/api/catalogues/[id]/route.ts`
- **How it works**: Each save increments version, conflicts return 409 status

### 2. Real-time Subscriptions
- **Hook**: `useCatalogueRealtime`
- **Location**: `src/hooks/useCatalogueRealtime.ts`
- **Features**: Toast notifications for catalogue/category/product changes

### 3. Presence Tracking
- **Hook**: `useCataloguePresence`
- **Location**: `src/hooks/useCataloguePresence.ts`
- **Component**: `ActiveUsersCard`
- **Location**: `src/components/editor/ActiveUsersCard.tsx`

## Integration Example

Add this code to `src/app/catalogue/[id]/edit/page.tsx`:

\`\`\`typescript
'use client'

import { useState, useEffect } from 'react'
import { useCatalogueRealtime } from '@/hooks/useCatalogueRealtime'
import { useCataloguePresence } from '@/hooks/useCataloguePresence'
import { VersionConflictDialog } from '@/components/editor/VersionConflictDialog'
import { ActiveUsersCard } from '@/components/editor/ActiveUsersCard'
import { useToast } from '@/hooks/use-toast'

export default function EditCataloguePage() {
  const params = useParams()
  const catalogueId = params.id as string
  const { toast } = useToast()
  
  // State for version tracking
  const [catalogueVersion, setCatalogueVersion] = useState<number>(1)
  const [showConflictDialog, setShowConflictDialog] = useState(false)
  const [conflictData, setConflictData] = useState<any>(null)
  
  // State for current section (for presence tracking)
  const [currentSection, setCurrentSection] = useState<string>('general')
  
  // State for current user
  const [currentUser, setCurrentUser] = useState<{
    userId: string
    fullName: string
    email: string
  } | null>(null)

  // Load initial catalogue data (including version)
  useEffect(() => {
    const loadCatalogue = async () => {
      const res = await fetch(\`/api/catalogues/\${catalogueId}\`)
      const data = await res.json()
      setCatalogueVersion(data.catalogue.version || 1)
      
      // Set current user from profile
      if (data.catalogue.profile) {
        setCurrentUser({
          userId: data.catalogue.profile.id,
          fullName: data.catalogue.profile.fullName,
          email: data.catalogue.profile.email,
        })
      }
    }
    loadCatalogue()
  }, [catalogueId])

  // Real-time updates
  const { lastUpdate } = useCatalogueRealtime({
    catalogueId,
    onUpdate: (update) => {
      console.log('Real-time update received:', update)
      // Optionally reload data here
    },
    enabled: true,
  })

  // Presence tracking
  const { activeUsers, isTracking } = useCataloguePresence({
    catalogueId,
    currentUser: currentUser!,
    currentSection,
    enabled: !!currentUser,
  })

  // Save with version checking
  const handleSaveChanges = async (updates: any, forceUpdate = false) => {
    try {
      const res = await fetch(\`/api/catalogues/\${catalogueId}\`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...updates,
          version: catalogueVersion,
          forceUpdate,
        }),
      })

      if (res.status === 409) {
        // Version conflict detected
        const conflictInfo = await res.json()
        setConflictData(conflictInfo)
        setShowConflictDialog(true)
        return false
      }

      if (!res.ok) {
        throw new Error('Failed to save changes')
      }

      const data = await res.json()
      setCatalogueVersion(data.catalogue.version) // Update to new version
      
      toast({
        title: 'Changes saved',
        description: 'Your changes have been saved successfully.',
      })
      
      return true
    } catch (error) {
      console.error('Save error:', error)
      toast({
        title: 'Error',
        description: 'Failed to save changes. Please try again.',
        variant: 'destructive',
      })
      return false
    }
  }

  // Handle conflict resolution
  const handleReloadChanges = () => {
    setShowConflictDialog(false)
    window.location.reload() // Reload to get latest version
  }

  const handleOverwriteChanges = async () => {
    setShowConflictDialog(false)
    // Save again with forceUpdate flag
    // You would pass the pending changes here
    await handleSaveChanges(conflictData.pendingChanges, true)
  }

  return (
    <>
      {/* Your existing editor UI */}
      
      {/* Active users presence indicator */}
      <ActiveUsersCard users={activeUsers} isTracking={isTracking} />
      
      {/* Version conflict dialog */}
      <VersionConflictDialog
        open={showConflictDialog}
        onOpenChange={setShowConflictDialog}
        onReload={handleReloadChanges}
        onOverwrite={handleOverwriteChanges}
        updatedAt={conflictData?.updatedAt}
      />
    </>
  )
}
\`\`\`

## Key Implementation Points

### 1. Loading Catalogue with Version

When fetching catalogue data, the API now returns the \`version\` field:

\`\`\`typescript
const res = await fetch(\`/api/catalogues/\${catalogueId}\`)
const data = await res.json()
setCatalogueVersion(data.catalogue.version)
\`\`\`

### 2. Saving with Version Check

Include the current version when saving:

\`\`\`typescript
await fetch(\`/api/catalogues/\${catalogueId}\`, {
  method: 'PUT',
  body: JSON.stringify({
    ...updates,
    version: catalogueVersion, // Current version
  }),
})
\`\`\`

### 3. Handling Conflicts

Check for 409 status code (conflict):

\`\`\`typescript
if (res.status === 409) {
  // Show conflict dialog
  setShowConflictDialog(true)
}
\`\`\`

### 4. Section Tracking

Update section when user navigates:

\`\`\`typescript
// When user clicks on Products tab
setCurrentSection('products')

// When user clicks on Categories tab
setCurrentSection('categories')

// When user clicks on Settings tab
setCurrentSection('settings')
\`\`\`

### 5. Real-time Notifications

The \`useCatalogueRealtime\` hook automatically shows toast notifications when:
- Another user updates the catalogue
- A category is added/updated/deleted
- A product is added/updated/deleted

## Testing the Features

### Test Optimistic Locking:
1. Open catalogue in Browser A
2. Open same catalogue in Browser B
3. Make changes in Browser A, save
4. Make different changes in Browser B, save
5. Browser B should show conflict dialog

### Test Real-time Sync:
1. Open catalogue in Browser A
2. Open same catalogue in Browser B
3. Add a product in Browser A
4. Browser B should show toast notification

### Test Presence Tracking:
1. Open catalogue in Browser A
2. Open same catalogue in Browser B (different user)
3. Both browsers should show active users card
4. Change sections - should update in real-time

## Database Schema

The following fields were added:

\`\`\`prisma
model Catalogue {
  // ... existing fields
  version Int @default(1) // For optimistic locking
}
\`\`\`

## API Changes

### GET /api/catalogues/[id]
Returns: \`{ catalogue: { ..., version: 1 } }\`

### PUT /api/catalogues/[id]
Accepts: \`{ ..., version: 1, forceUpdate?: boolean }\`
Returns:
- 200: \`{ catalogue: { ..., version: 2 } }\`
- 409: \`{ error: 'Version conflict', currentVersion: 2, clientVersion: 1 }\`

### GET /api/catalogues/[id]/version
Returns: \`{ version: 1, updatedAt: '...', lastModifiedBy: '...' }\`

## Supabase Real-time Setup

Ensure Supabase Real-time is enabled for these tables:
- \`catalogues\`
- \`categories\`
- \`products\`

Enable in Supabase Dashboard:
1. Go to Database → Replication
2. Enable for tables: catalogues, categories, products

## Performance Considerations

- Presence tracking updates every few seconds
- Real-time subscriptions are lightweight (WebSocket)
- Version checking adds minimal overhead (single int comparison)
- Toast notifications auto-dismiss after 10 seconds

## Future Enhancements

- **Section-level locking**: Lock specific sections (e.g., "Product #123 is being edited")
- **Conflict resolution UI**: Show diff view of changes
- **Auto-save with debouncing**: Save every 30 seconds
- **Offline support**: Queue changes when offline
- **Change history**: Track who changed what and when
\`\`\`
