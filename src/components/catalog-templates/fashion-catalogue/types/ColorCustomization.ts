export interface ColorCustomization {
  textColors: {
    companyName: string
    title: string
    description: string
    productName: string
    productDescription: string
    productPrice: string
    categoryName: string
    metadata: string
  }
  backgroundColors: {
    main: string
    cover: string
    productCard: string
    categorySection: string
  }
  accentColors: {
    primary: string
    secondary: string
  }
}

export const DEFAULT_COLORS: ColorCustomization = {
  textColors: {
    companyName: '#1f2937',
    title: '#1f2937',
    description: '#6b7280',
    productName: '#1f2937',
    productDescription: '#6b7280',
    productPrice: '#059669',
    categoryName: '#1f2937',
    metadata: '#6b7280'
  },
  backgroundColors: {
    main: '#ffffff',
    cover: '#f9fafb',
    productCard: '#ffffff',
    categorySection: '#f3f4f6'
  },
  accentColors: {
    primary: '#3b82f6',
    secondary: '#6366f1'
  }
}