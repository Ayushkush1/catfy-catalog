import { ThemeConfig } from '@/lib/theme-registry'

const theme: Omit<ThemeConfig, 'id'> = {
  name: 'Classic Warm',
  description:
    'A timeless theme with warm earth tones, perfect for traditional businesses and artisanal products',
  category: 'classic',
  isPremium: false,
  version: '1.0.0',
  author: 'Catfy Team',
  previewImage: '/themes/classic-warm-preview.jpg',
  colors: {
    primary: '#d97706',
    secondary: '#92400e',
    accent: '#f59e0b',
    background: '#fefdf8',
    surface: '#faf9f5',
    text: {
      primary: '#451a03',
      secondary: '#78716c',
      muted: '#a8a29e',
    },
    border: '#e7e5e4',
    success: '#059669',
    warning: '#d97706',
    error: '#dc2626',
  },
  typography: {
    fontFamily: {
      primary: 'Crimson Text, Georgia, serif',
      secondary: 'Source Sans Pro, system-ui, sans-serif',
      mono: 'Source Code Pro, monospace',
    },
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },
    lineHeight: {
      tight: '1.25',
      normal: '1.6',
      relaxed: '1.8',
    },
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
    '3xl': '4rem',
  },
  borderRadius: {
    none: '0',
    sm: '0.125rem',
    md: '0.25rem',
    lg: '0.375rem',
    xl: '0.5rem',
    full: '9999px',
  },
  shadows: {
    sm: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
  },
  compatibleTemplates: ['*'],
  requiredFeatures: [],
  customProperties: {
    gradients: {
      primary: 'linear-gradient(135deg, #d97706 0%, #92400e 100%)',
      secondary: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      warm: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
    },
    textures: {
      paper:
        'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23fbbf24" fill-opacity="0.05"%3E%3Ccircle cx="30" cy="30" r="1"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
      linen:
        'url("data:image/svg+xml,%3Csvg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="%23d97706" fill-opacity="0.03"%3E%3Cpath d="M0 0h40v40H0z"/%3E%3C/g%3E%3C/svg%3E")',
    },
    animations: {
      duration: {
        fast: '200ms',
        normal: '400ms',
        slow: '600ms',
      },
      easing: {
        default: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        in: 'cubic-bezier(0.55, 0.055, 0.675, 0.19)',
        out: 'cubic-bezier(0.215, 0.61, 0.355, 1)',
      },
    },
  },
  createdAt: new Date(),
  updatedAt: new Date(),
}

export default theme
