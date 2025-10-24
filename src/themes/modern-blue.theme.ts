import { ThemeConfig } from '@/lib/theme-registry'

const theme: Omit<ThemeConfig, 'id'> = {
  name: 'Modern Blue',
  description:
    'A clean, professional theme with blue accents perfect for corporate catalogs',
  category: 'modern',
  isPremium: false,
  version: '1.0.0',
  author: 'Catfy Team',
  previewImage: '/themes/modern-blue-preview.jpg',
  colors: {
    primary: '#3b82f6',
    secondary: '#1e40af',
    accent: '#60a5fa',
    background: '#ffffff',
    surface: '#f8fafc',
    text: {
      primary: '#1f2937',
      secondary: '#6b7280',
      muted: '#9ca3af',
    },
    border: '#e5e7eb',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
  },
  typography: {
    fontFamily: {
      primary: 'Inter, system-ui, sans-serif',
      secondary: 'Inter, system-ui, sans-serif',
      mono: 'JetBrains Mono, monospace',
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
      normal: '1.5',
      relaxed: '1.75',
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
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    full: '9999px',
  },
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
  },
  compatibleTemplates: ['*'], // Compatible with all templates
  requiredFeatures: [],
  customProperties: {
    gradients: {
      primary: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)',
      secondary: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)',
    },
    animations: {
      duration: {
        fast: '150ms',
        normal: '300ms',
        slow: '500ms',
      },
      easing: {
        default: 'cubic-bezier(0.4, 0, 0.2, 1)',
        in: 'cubic-bezier(0.4, 0, 1, 1)',
        out: 'cubic-bezier(0, 0, 0.2, 1)',
      },
    },
  },
  createdAt: new Date(),
  updatedAt: new Date(),
}

export default theme
