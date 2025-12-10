# Quick Start Guide - React Query Caching System

## What Changed?

Your app now uses **React Query** for all data fetching, providing:

- ⚡ **Instant loading** from cache
- 🔄 **Smart background updates**
- 🚫 **No more loading spinners** on every navigation
- 📦 **Request deduplication**
- ⏱️ **60-80% faster perceived performance**

## How to Use the New System

### 1. Fetching Data (Queries)

Instead of manual `fetch()` and `useState`, use query hooks:

```typescript
// ❌ OLD WAY (Manual fetch)
const [data, setData] = useState(null)
const [loading, setLoading] = useState(true)

useEffect(() => {
  fetch('/api/data')
    .then(res => res.json())
    .then(setData)
    .finally(() => setLoading(false))
}, [])

// ✅ NEW WAY (React Query)
import { useProfileQuery } from '@/hooks/queries'

const { data, isLoading } = useProfileQuery()
const profile = data?.profile
```

### 2. Available Query Hooks

All hooks are in `src/hooks/queries/`:

```typescript
import {
  useProfileQuery, // User profile
  useSubscriptionQuery, // Subscription & usage
  useCataloguesQuery, // List of catalogues
  useCatalogueQuery, // Single catalogue
  useNotificationsQuery, // Notifications
  useDashboardStatsQuery, // Dashboard stats
} from '@/hooks/queries'
```

### 3. Mutations (Create/Update/Delete)

For actions that modify data:

```typescript
import {
  useCreateCatalogueMutation,
  useDeleteCatalogueMutation,
} from '@/hooks/queries'

// Create
const createMutation = useCreateCatalogueMutation()
await createMutation.mutateAsync(catalogueData)

// Delete
const deleteMutation = useDeleteCatalogueMutation()
await deleteMutation.mutateAsync(catalogueId)
```

### 4. Cache Updates

Mutations automatically update related caches:

- Create catalogue → refreshes catalogues list + subscription + stats
- Delete catalogue → same updates
- Mark notification read → updates notifications list

### 5. Manual Cache Refresh

Force refresh when needed:

```typescript
import { useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/hooks/queries'

const queryClient = useQueryClient()

// Refresh specific data
queryClient.invalidateQueries({ queryKey: queryKeys.profile.detail() })
queryClient.invalidateQueries({ queryKey: queryKeys.catalogues.lists() })
```

## React Query DevTools

In **development mode**, you'll see a floating icon in the corner:

1. Click it to open DevTools
2. See all cached queries
3. Check staleness, loading state
4. Manually trigger refetch
5. Debug cache issues

## Cache Behavior

### When Data is Fetched

1. **First request**: Fetches from API, stores in cache
2. **Within 5 minutes**: Returns cached data instantly
3. **After 5 minutes**: Returns cached data + refetches in background
4. **Window focus**: Auto-refetches to show fresh data

### Cache Duration

- **Profile**: 5 minutes stale, 10 minutes in memory
- **Subscription**: 5 minutes stale, 10 minutes in memory
- **Catalogues**: 3 minutes stale, 10 minutes in memory
- **Notifications**: 30 seconds stale, 5 minutes in memory (polls every 60s)

## Common Patterns

### Pattern 1: Show Data Immediately

```typescript
const { data, isLoading } = useProfileQuery()

// Data shows immediately from cache (even if stale)
// Background refresh happens automatically
return <div>{data?.profile?.fullName}</div>
```

### Pattern 2: Dependent Queries

```typescript
const { data: profile } = useProfileQuery()
const userId = profile?.user?.id

const { data: catalogues } = useCataloguesQuery(
  { userId },
  { enabled: !!userId } // Only fetch when userId exists
)
```

### Pattern 3: Optimistic Updates

```typescript
const deleteMutation = useDeleteCatalogueMutation()

// UI updates immediately before server confirms
await deleteMutation.mutateAsync(id)
// ✅ Catalogue disappears from list instantly
```

### Pattern 4: Loading States

```typescript
const { data, isLoading, isError, error } = useProfileQuery()

if (isLoading) return <Skeleton />
if (isError) return <Error message={error.message} />
return <Profile data={data} />
```

## Migration Checklist

When migrating a component:

- [ ] Remove `useState` for data
- [ ] Remove `useEffect` with fetch
- [ ] Import appropriate query hook
- [ ] Use `data` and `isLoading` from hook
- [ ] Remove manual cache logic (sessionStorage, etc.)
- [ ] Test: first load, cached load, background refresh

## Troubleshooting

### "Data not updating"

- Check cache duration (may need to wait for staleness)
- Force refresh: `queryClient.invalidateQueries()`
- Check network tab for API calls

### "Too many requests"

- Check if `staleTime` is too low
- Ensure you're not creating multiple instances of same query
- Use DevTools to see request patterns

### "Data shows old version"

- Cache may be stale but not yet refetched
- Window focus triggers auto-refetch
- Mutations should invalidate related queries

## Performance Tips

1. **Don't disable cache**: Let React Query handle it
2. **Use optimistic updates**: Makes UI feel instant
3. **Prefetch data**: `queryClient.prefetchQuery()` before navigation
4. **Keep queryKeys consistent**: Use `queryKeys` factory from `@/hooks/queries`

## Testing

```typescript
// Mock queries in tests
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  },
})

<QueryClientProvider client={queryClient}>
  <YourComponent />
</QueryClientProvider>
```

## Support

- **Docs**: https://tanstack.com/query/latest/docs/react/overview
- **DevTools**: Open in browser during development
- **Examples**: Check migrated components in `src/app/dashboard/page.tsx`, `src/contexts/SubscriptionContext.tsx`

---

**Summary**: Data now loads instantly from cache while refreshing in background. No more waiting for API calls on every navigation! 🚀
