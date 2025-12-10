/**
 * Centralized Query Keys Factory
 * Provides type-safe query keys for React Query
 */

export const queryKeys = {
  // Profile queries
  profile: {
    all: ['profile'] as const,
    detail: () => [...queryKeys.profile.all, 'detail'] as const,
  },

  // Subscription queries
  subscription: {
    all: ['subscription'] as const,
    current: () => [...queryKeys.subscription.all, 'current'] as const,
    usage: () => [...queryKeys.subscription.all, 'usage'] as const,
  },

  // Catalogues queries
  catalogues: {
    all: ['catalogues'] as const,
    lists: () => [...queryKeys.catalogues.all, 'list'] as const,
    list: (filters?: { search?: string; sort?: string }) =>
      [...queryKeys.catalogues.lists(), filters] as const,
    details: () => [...queryKeys.catalogues.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.catalogues.details(), id] as const,
    products: (id: string) =>
      [...queryKeys.catalogues.detail(id), 'products'] as const,
    categories: (id: string) =>
      [...queryKeys.catalogues.detail(id), 'categories'] as const,
    team: (id: string) => [...queryKeys.catalogues.detail(id), 'team'] as const,
    stats: (id: string) =>
      [...queryKeys.catalogues.detail(id), 'stats'] as const,
  },

  // Notifications queries
  notifications: {
    all: ['notifications'] as const,
    list: (filters?: { unreadOnly?: boolean }) =>
      [...queryKeys.notifications.all, 'list', filters] as const,
    unreadCount: () => [...queryKeys.notifications.all, 'unreadCount'] as const,
  },

  // Dashboard queries
  dashboard: {
    all: ['dashboard'] as const,
    stats: () => [...queryKeys.dashboard.all, 'stats'] as const,
    recentActivity: () =>
      [...queryKeys.dashboard.all, 'recentActivity'] as const,
    analytics: (dateRange?: string) =>
      [...queryKeys.dashboard.all, 'analytics', dateRange] as const,
  },

  // Team queries
  team: {
    all: ['team'] as const,
    members: (catalogueId?: string) =>
      [...queryKeys.team.all, 'members', catalogueId] as const,
    invitations: () => [...queryKeys.team.all, 'invitations'] as const,
  },

  // Templates queries
  templates: {
    all: ['templates'] as const,
    list: () => [...queryKeys.templates.all, 'list'] as const,
    detail: (id: string) => [...queryKeys.templates.all, id] as const,
  },
} as const
