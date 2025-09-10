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
    companyName: '#ffffff',
    title: '#ffffff',
    description: '#cccccc',
    productName: '#ffffff',
    productDescription: '#cccccc',
    productPrice: '#ff6b35',
    categoryName: '#ffffff',
    metadata: '#999999'
  },
  backgroundColors: {
    main: '#1a1a1a',
    cover: '#0a0a0a',
    productCard: '#2a2a2a',
    categorySection: '#1e1e1e'
  },
  accentColors: {
    primary: '#ff6b35',
    secondary: '#d4af37'
  }
}