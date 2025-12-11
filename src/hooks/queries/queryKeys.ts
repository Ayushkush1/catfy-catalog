/**
 * Centralized query key factory
 * This ensures type-safe and consistent query keys across the application
 */

export const queryKeys = {
  // Auth & Profile
  profile: ['profile'] as const,

  // Subscription & Billing
  subscription: ['subscription'] as const,
  billing: ['billing'] as const,

  // Catalogues
  catalogues: {
    all: ['catalogues'] as const,
    list: (filters?: { search?: string; page?: number }) =>
      ['catalogues', 'list', filters] as const,
    detail: (id: string) => ['catalogues', 'detail', id] as const,
    products: (catalogueId: string) =>
      ['catalogues', catalogueId, 'products'] as const,
    categories: (catalogueId: string) =>
      ['catalogues', catalogueId, 'categories'] as const,
    team: (catalogueId: string) => ['catalogues', catalogueId, 'team'] as const,
    stats: (catalogueId: string) =>
      ['catalogues', catalogueId, 'stats'] as const,
  },

  // Notifications
  notifications: {
    all: ['notifications'] as const,
    unread: ['notifications', 'unread'] as const,
  },

  // Dashboard
  dashboard: {
    stats: ['dashboard', 'stats'] as const,
    recentCatalogues: ['dashboard', 'recent-catalogues'] as const,
  },

  // Team
  team: {
    members: (catalogueId: string) => ['team', 'members', catalogueId] as const,
    invitations: ['team', 'invitations'] as const,
  },

  // Analytics
  analytics: {
    overview: ['analytics', 'overview'] as const,
    catalogue: (catalogueId: string) =>
      ['analytics', 'catalogue', catalogueId] as const,
  },
} as const
