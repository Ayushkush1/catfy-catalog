import { ThemeConfig } from '@/lib/theme-registry'

const theme: Omit<ThemeConfig, 'id'> = {
  name: 'Minimal Mono',
  description:
    'A clean, minimalist monochromatic theme focusing on typography and whitespace',
  category: 'minimal',
  isPremium: true,
  version: '1.0.0',
  author: 'Catfy Team',
  previewImage: '/themes/minimal-mono-preview.jpg',
  colors: {
    primary: '#000000',
    secondary: '#404040',
    accent: '#666666',
    background: '#ffffff',
    surface: '#fafafa',
    text: {
      primary: '#000000',
      secondary: '#404040',
      muted: '#808080',
    },
    border: '#e0e0e0',
    success: '#000000',
    warning: '#000000',
    error: '#000000',
  },
  typography: {
    fontFamily: {
      primary: 'Helvetica Neue, Arial, sans-serif',
      secondary: 'Helvetica Neue, Arial, sans-serif',
      mono: 'SF Mono, Monaco, monospace',
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
      normal: '300',
      medium: '400',
      semibold: '500',
      bold: '600',
    },
    lineHeight: {
      tight: '1.2',
      normal: '1.5',
      relaxed: '1.8',
    },
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '2rem',
    xl: '3rem',
    '2xl': '4rem',
    '3xl': '6rem',
  },
  borderRadius: {
    none: '0',
    sm: '0',
    md: '0',
    lg: '0',
    xl: '0',
    full: '0',
  },
  shadows: {
    sm: 'none',
    md: 'none',
    lg: 'none',
    xl: 'none',
  },
  compatibleTemplates: ['*'],
  requiredFeatures: ['typography-focus'],
  customProperties: {
    layout: {
      maxWidth: '800px',
      contentSpacing: '4rem',
      sectionSpacing: '6rem',
    },
    typography: {
      letterSpacing: {
        tight: '-0.025em',
        normal: '0',
        wide: '0.025em',
      },
      textTransform: {
        uppercase: 'uppercase',
        lowercase: 'lowercase',
        capitalize: 'capitalize',
      },
    },
    animations: {
      duration: {
        fast: '100ms',
        normal: '200ms',
        slow: '300ms',
      },
      easing: {
        default: 'ease',
        in: 'ease-in',
        out: 'ease-out',
      },
    },
    effects: {
      focus: {
        outline: '2px solid #000000',
        outlineOffset: '2px',
      },
      hover: {
        opacity: '0.7',
      },
    },
  },
  createdAt: new Date(),
  updatedAt: new Date(),
}

export default theme
