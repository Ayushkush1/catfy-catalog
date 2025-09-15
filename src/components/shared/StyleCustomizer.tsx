import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Palette, Type, Layout, Settings, Package, Edit, Image, Check, X, Upload } from 'lucide-react'

// Font and color interfaces
interface FontCustomization {
  fontFamily: {
    title: string
    description: string
    price: string
    productDescription: string
    companyName: string
    categoryName: string
    productName: string
  }
  fontSize: {
    title: number
    description: number
    price: number
    productDescription: number
    companyName: number
    categoryName: number
    productName: number
  }
  fontWeight: {
    title: string
    description: string
    price: string
    productDescription: string
    companyName: string
    categoryName: string
    productName: string
  }
}

interface SpacingCustomization {
  padding: {
    page: number
    sections: number
    section: number
    cards: number
    productCard: number
  }
  margin: {
    sections: number
    elements: number
    cards: number
  }
  gap: {
    content: number
    products: number
  }
}

interface AdvancedStyleCustomization {
  borderRadius: {
    cards: number
    buttons: number
    images: number
  }
  borders: {
    productCard: {
      width: number
      color: string
      radius: number
    }
  }
  shadows: {
    cards: string
    buttons: string
    productCard: {
      enabled: boolean
      blur: number
      color: string
      opacity: number
    }
  }
  animations: {
    enabled: boolean
    duration: number
  }
}

interface CustomColors {
  primary: string
  secondary: string
  accent: string
  background: string
  surface: string
  textColors: {
    primary: string
    secondary: string
    accent: string
    price: string
    productDescription: string
    companyName: string
    title: string
    description: string
  }
}

interface StyleCustomizerProps {
  fontCustomization: FontCustomization
  spacingCustomization: SpacingCustomization
  advancedStyleCustomization: AdvancedStyleCustomization
  customColors: CustomColors
  onFontChange: (path: string, value: any) => void
  onSpacingChange: (path: string, value: number) => void
  onAdvancedStyleChange: (path: string, value: any) => void
  onColorChange: (type: string, colors: any) => void
  content?: any
  onContentChange?: (field: string, value: string) => void
  onProductUpdate?: (productId: string, updates: any) => void
  onCategoryUpdate?: (categoryId: string, updates: any) => void
  onCategoryCreate?: (category: any) => void
  onCategoryDelete?: (categoryId: string) => void
  onProductImageUpdate?: (productId: string, imageUrl: string) => void
  onBulkContentUpdate?: (updates: any) => void
}

// Default values
const defaultFontCustomization: FontCustomization = {
  fontFamily: {
    title: 'Inter, sans-serif',
    description: 'Inter, sans-serif',
    price: 'Inter, sans-serif',
    productDescription: 'Inter, sans-serif',
    companyName: 'Inter, sans-serif',
    categoryName: 'Inter, sans-serif',
    productName: 'Inter, sans-serif',
  },
  fontSize: {
    title: 24,
    description: 16,
    price: 18,
    productDescription: 14,
    companyName: 20,
    categoryName: 24,
    productName: 18,
  },
  fontWeight: {
    title: '700',
    description: '400',
    price: '600',
    productDescription: '400',
    companyName: '600',
    categoryName: '700',
    productName: 'bold',
  },
}

const defaultSpacingCustomization: SpacingCustomization = {
  padding: {
    page: 24,
    sections: 32,
    section: 32,
    cards: 16,
    productCard: 16
  },
  margin: {
    sections: 48,
    elements: 16,
    cards: 12
  },
  gap: {
    content: 12,
    products: 32
  }
}

const defaultAdvancedStyleCustomization: AdvancedStyleCustomization = {
  borderRadius: {
    cards: 12,
    buttons: 8,
    images: 8
  },
  borders: {
    productCard: {
      width: 0,
      color: 'transparent',
      radius: 8
    }
  },
  shadows: {
    cards: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    buttons: '0 2px 4px -1px rgba(0, 0, 0, 0.1)',
    productCard: {
      enabled: true,
      blur: 4,
      color: '#000000',
      opacity: 0.1
    }
  },
  animations: {
    enabled: true,
    duration: 300
  }
}

const fontOptions = [
  { value: 'Inter, sans-serif', label: 'Inter' },
  { value: 'Roboto, sans-serif', label: 'Roboto' },
  { value: 'Open Sans, sans-serif', label: 'Open Sans' },
  { value: 'Lato, sans-serif', label: 'Lato' },
  { value: 'Montserrat, sans-serif', label: 'Montserrat' },
  { value: 'Poppins, sans-serif', label: 'Poppins' },
  { value: 'Source Sans Pro, sans-serif', label: 'Source Sans Pro' },
  { value: 'Nunito, sans-serif', label: 'Nunito' },
  { value: 'Raleway, sans-serif', label: 'Raleway' },
  { value: 'Ubuntu, sans-serif', label: 'Ubuntu' },
  { value: 'Playfair Display, serif', label: 'Playfair Display' },
  { value: 'Merriweather, serif', label: 'Merriweather' },
  { value: 'Georgia, serif', label: 'Georgia' },
  { value: 'Times New Roman, serif', label: 'Times New Roman' },
]

const ColorPicker: React.FC<{
  label: string
  value: string
  onChange: (color: string) => void
  elementKey?: string
}> = ({ label, value, onChange, elementKey }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [tempColor, setTempColor] = useState(value)

  const presetColors = [
    '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
    '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1',
    '#14b8a6', '#f43f5e', '#8b5cf6', '#06b6d4', '#84cc16',
    '#1f2937', '#374151', '#6b7280', '#9ca3af', '#d1d5db'
  ]

  const handleColorChange = (color: string) => {
    setTempColor(color)
    onChange(color)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const color = e.target.value
    setTempColor(color)
    onChange(color)
  }

  return (
    <div className="space-y-2">
      <Label className="text-xs text-gray-600">{label}</Label>
      <div className="flex items-center space-x-2">
        <div
          className="w-8 h-8 rounded border-2 border-gray-300 cursor-pointer flex-shrink-0"
          style={{ backgroundColor: value }}
          onClick={() => setIsOpen(!isOpen)}
          title={`Select color for ${label}`}
        />
        <Input
          type="text"
          value={tempColor}
          onChange={handleInputChange}
          className="flex-1 text-xs"
          placeholder="#000000"
        />
      </div>
      {isOpen && (
        <div className="grid grid-cols-5 gap-1 p-2 border rounded bg-white shadow-lg">
          {presetColors.map((color) => (
            <div
              key={color}
              className="w-6 h-6 rounded cursor-pointer border border-gray-200 hover:scale-110 transition-transform"
              style={{ backgroundColor: color }}
              onClick={() => {
                handleColorChange(color)
                setIsOpen(false)
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}

const getFontDisplayName = (fontValue: string): string => {
  const font = fontOptions.find(f => f.value === fontValue)
  return font ? font.label : fontValue.split(',')[0]
}

export function StyleCustomizer({
  fontCustomization = defaultFontCustomization,
  spacingCustomization = defaultSpacingCustomization,
  advancedStyleCustomization = defaultAdvancedStyleCustomization,
  customColors,
  onFontChange,
  onSpacingChange,
  onAdvancedStyleChange,
  onColorChange,
  content,
  onContentChange,
  onProductUpdate,
  onCategoryUpdate,
  onCategoryCreate,
  onCategoryDelete,
  onProductImageUpdate,
  onBulkContentUpdate
}: StyleCustomizerProps) {
  const [activeTab, setActiveTab] = useState('content')
  const [editingField, setEditingField] = useState<string | null>(null)
  const [editValues, setEditValues] = useState<Record<string, string>>({})
  const [showImageUpload, setShowImageUpload] = useState<string>('')
  const [bulkEditMode, setBulkEditMode] = useState(false)
  const [selectedProducts, setSelectedProducts] = useState<string[]>([])
  const [imagePreview, setImagePreview] = useState<string>('')
  useEffect(() => {
    if (content) {
      setEditValues({
        // Catalogue fields
        name: content.catalogue?.name || content.name || '',
        description: content.catalogue?.description || content.description || '',

        // Company/Profile fields
        companyName: content.catalogue?.settings?.companyInfo?.companyName || content.profile?.companyName || '',
        fullName: content.profile?.fullName || '',
        companyDescription: content.catalogue?.settings?.companyInfo?.companyDescription || '',
        tagline: content.catalogue?.tagline || content.profile?.tagline || '',
        catalogueQuote: content.catalogue?.quote || '',

        // Category fields
        categoryName: content.categories?.[0]?.name || '',
        categoryDescription: content.categories?.[0]?.description || '',

        // New Collection fields
        newCollectionTitle: (content as any).newCollection?.title || 'New Collection',
        newCollectionDescription: (content as any).newCollection?.description || 'Discover our latest products and innovations',

        // Catalogue year (bottom decorative text)
        year: content.catalogue?.year || '2025',

        // Contact fields
        email: content.profile?.email || content.catalogue?.settings?.contactDetails?.email || '',
        phone: content.profile?.phone || content.catalogue?.settings?.contactDetails?.phone || '',
        website: content.profile?.website || content.catalogue?.settings?.contactDetails?.website || '',
        address: content.profile?.address || content.catalogue?.settings?.contactDetails?.address || '',
        contactDescription: content.catalogue?.settings?.contactDescription || 'Get in touch with us for more information about our products',
        storeDescription: content.catalogue?.settings?.storeDescription || 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation.',

        // Social Media fields
        facebook: content.catalogue?.settings?.socialMedia?.facebook || '',
        instagram: content.catalogue?.settings?.socialMedia?.instagram || '',
        linkedin: content.catalogue?.settings?.socialMedia?.linkedin || '',
        twitter: content.catalogue?.settings?.socialMedia?.twitter || '',

        // Contact quote fields
        contactQuote: content.catalogue?.settings?.contactDetails?.contactQuote || '',
        contactQuoteBy: content.catalogue?.settings?.contactDetails?.contactQuoteBy || ''
      })
    }
  }, [content])

  const handleColorChange = (type: string, colors: any) => {
    onColorChange(type, colors)
  }

  const handleFontChange = (path: string, value: any) => {
    onFontChange(path, value)
  }

  const handleSpacingChange = (path: string, value: number) => {
    onSpacingChange(path, value)
  }

  const handleAdvancedStyleChange = (path: string, value: any) => {
    onAdvancedStyleChange(path, value)
  }

  const handleFieldEdit = (field: string) => {
    setEditingField(field)
  }

  const handleFieldSave = (field: string) => {
    if (!onContentChange || !content) return;

    const newContent = { ...content };

    switch (field) {
      case 'name':
        if (newContent.catalogue) {
          newContent.catalogue.name = editValues.name;
        } else {
          (newContent as any).name = editValues.name;
        }
        break;
      case 'description':
        if (newContent.catalogue) {
          newContent.catalogue.description = editValues.description;
        } else {
          (newContent as any).description = editValues.description;
        }
        break;
      case 'companyName':
        // Save to catalogue.settings.companyInfo.companyName
        if (!newContent.catalogue) {
          newContent.catalogue = { settings: {} };
        }
        if (!newContent.catalogue.settings) {
          newContent.catalogue.settings = {};
        }
        if (!newContent.catalogue.settings.companyInfo) {
          newContent.catalogue.settings.companyInfo = {};
        }
        newContent.catalogue.settings.companyInfo.companyName = editValues.companyName;
        break;
      case 'fullName':
        if (newContent.profile) {
          newContent.profile.fullName = editValues.fullName;
        }
        break;
      case 'companyDescription':
        // Save to catalogue.settings.companyInfo.companyDescription
        if (!newContent.catalogue) {
          newContent.catalogue = { settings: {} };
        }
        if (!newContent.catalogue.settings) {
          newContent.catalogue.settings = {};
        }
        if (!newContent.catalogue.settings.companyInfo) {
          newContent.catalogue.settings.companyInfo = {};
        }
        newContent.catalogue.settings.companyInfo.companyDescription = editValues.companyDescription;
        break;
      case 'tagline':
        if (newContent.catalogue) {
          newContent.catalogue.tagline = editValues.tagline;
        }
        if (newContent.profile) {
          newContent.profile.tagline = editValues.tagline;
        }
        break;
      case 'email':
        if (newContent.profile) {
          newContent.profile.email = editValues.email;
        }
        // Also save to catalogue.settings.contactDetails for edit dialog compatibility
        if (!newContent.catalogue) {
          newContent.catalogue = { settings: {} };
        }
        if (!newContent.catalogue.settings) {
          newContent.catalogue.settings = {};
        }
        if (!newContent.catalogue.settings.contactDetails) {
          newContent.catalogue.settings.contactDetails = {};
        }
        newContent.catalogue.settings.contactDetails.email = editValues.email;
        break;
      case 'phone':
        if (newContent.profile) {
          newContent.profile.phone = editValues.phone;
        }
        // Also save to catalogue.settings.contactDetails for edit dialog compatibility
        if (!newContent.catalogue) {
          newContent.catalogue = { settings: {} };
        }
        if (!newContent.catalogue.settings) {
          newContent.catalogue.settings = {};
        }
        if (!newContent.catalogue.settings.contactDetails) {
          newContent.catalogue.settings.contactDetails = {};
        }
        newContent.catalogue.settings.contactDetails.phone = editValues.phone;
        break;
      case 'address':
        if (newContent.profile) {
          newContent.profile.address = editValues.address;
        }
        // Also save to catalogue.settings.contactDetails for edit dialog compatibility
        if (!newContent.catalogue) {
          newContent.catalogue = { settings: {} };
        }
        if (!newContent.catalogue.settings) {
          newContent.catalogue.settings = {};
        }
        if (!newContent.catalogue.settings.contactDetails) {
          newContent.catalogue.settings.contactDetails = {};
        }
        newContent.catalogue.settings.contactDetails.address = editValues.address;
        break;
      case 'website':
        if (newContent.profile) {
          newContent.profile.website = editValues.website;
        }
        // Also save to catalogue.settings.contactDetails for edit dialog compatibility
        if (!newContent.catalogue) {
          newContent.catalogue = { settings: {} };
        }
        if (!newContent.catalogue.settings) {
          newContent.catalogue.settings = {};
        }
        if (!newContent.catalogue.settings.contactDetails) {
          newContent.catalogue.settings.contactDetails = {};
        }
        newContent.catalogue.settings.contactDetails.website = editValues.website;
        break;
      case 'categoryName':
        if (newContent.categories && newContent.categories[0]) {
          newContent.categories[0].name = editValues.categoryName;
        }
        break;
      case 'categoryDescription':
        if (newContent.categories && newContent.categories[0]) {
          newContent.categories[0].description = editValues.categoryDescription;
        }
        break;
      case 'newCollectionTitle':
        (newContent as any).newCollection = {
          ...(newContent as any).newCollection,
          title: editValues.newCollectionTitle
        };
        break;
      case 'newCollectionDescription':
        (newContent as any).newCollection = {
          ...(newContent as any).newCollection,
          description: editValues.newCollectionDescription
        };
        break;
      case 'contactDescription':
        if (!newContent.catalogue) {
          newContent.catalogue = { settings: {} };
        }
        if (!newContent.catalogue.settings) {
          newContent.catalogue.settings = {};
        }
        newContent.catalogue.settings.contactDescription = editValues.contactDescription;
        break;
      case 'storeDescription':
        if (!newContent.catalogue) {
          newContent.catalogue = { settings: {} };
        }
        if (!newContent.catalogue.settings) {
          newContent.catalogue.settings = {};
        }
        newContent.catalogue.settings.storeDescription = editValues.storeDescription;
        break;
      case 'year':
        if (newContent.catalogue) {
          newContent.catalogue.year = editValues.year;
        }
        break;
      case 'catalogueQuote':
        if (newContent.catalogue) {
          newContent.catalogue.quote = editValues.catalogueQuote;
        }
        break;
      case 'facebook':
        if (!newContent.catalogue) {
          newContent.catalogue = { settings: {} };
        }
        if (!newContent.catalogue.settings) {
          newContent.catalogue.settings = {};
        }
        if (!newContent.catalogue.settings.socialMedia) {
          newContent.catalogue.settings.socialMedia = {};
        }
        newContent.catalogue.settings.socialMedia.facebook = editValues.facebook;
        break;
      case 'instagram':
        if (!newContent.catalogue) {
          newContent.catalogue = { settings: {} };
        }
        if (!newContent.catalogue.settings) {
          newContent.catalogue.settings = {};
        }
        if (!newContent.catalogue.settings.socialMedia) {
          newContent.catalogue.settings.socialMedia = {};
        }
        newContent.catalogue.settings.socialMedia.instagram = editValues.instagram;
        break;
      case 'linkedin':
        if (!newContent.catalogue) {
          newContent.catalogue = { settings: {} };
        }
        if (!newContent.catalogue.settings) {
          newContent.catalogue.settings = {};
        }
        if (!newContent.catalogue.settings.socialMedia) {
          newContent.catalogue.settings.socialMedia = {};
        }
        newContent.catalogue.settings.socialMedia.linkedin = editValues.linkedin;
        break;
      case 'twitter':
        if (!newContent.catalogue) {
          newContent.catalogue = { settings: {} };
        }
        if (!newContent.catalogue.settings) {
          newContent.catalogue.settings = {};
        }
        if (!newContent.catalogue.settings.socialMedia) {
          newContent.catalogue.settings.socialMedia = {};
        }
        newContent.catalogue.settings.socialMedia.twitter = editValues.twitter;
        break;
      case 'contactQuote':
        if (!newContent.catalogue) {
          newContent.catalogue = { settings: {} };
        }
        if (!newContent.catalogue.settings) {
          newContent.catalogue.settings = {};
        }
        if (!newContent.catalogue.settings.contactDetails) {
          newContent.catalogue.settings.contactDetails = {};
        }
        newContent.catalogue.settings.contactDetails.contactQuote = editValues.contactQuote;
        break;
      case 'contactQuoteBy':
        if (!newContent.catalogue) {
          newContent.catalogue = { settings: {} };
        }
        if (!newContent.catalogue.settings) {
          newContent.catalogue.settings = {};
        }
        if (!newContent.catalogue.settings.contactDetails) {
          newContent.catalogue.settings.contactDetails = {};
        }
        newContent.catalogue.settings.contactDetails.contactQuoteBy = editValues.contactQuoteBy;
        break;
    }

    if (onContentChange) {
      // Call onContentChange for each field that was updated
      switch (field) {
        case 'name':
          onContentChange('catalogue.name', editValues.name);
          break;
        case 'description':
          onContentChange('catalogue.description', editValues.description);
          break;
        case 'year':
          onContentChange('catalogue.year', editValues.year);
          break;
        case 'tagline':
          onContentChange('catalogue.tagline', editValues.tagline);
          break;
        case 'catalogueQuote':
          onContentChange('catalogue.quote', editValues.catalogueQuote);
          break;
        case 'companyName':
          onContentChange('catalogue.settings.companyInfo.companyName', editValues.companyName);
          break;
        case 'companyDescription':
          onContentChange('catalogue.settings.companyInfo.companyDescription', editValues.companyDescription);
          break;
        case 'email':
          onContentChange('profile.email', editValues.email);
          onContentChange('catalogue.settings.contactDetails.email', editValues.email);
          break;
        case 'phone':
          onContentChange('profile.phone', editValues.phone);
          onContentChange('catalogue.settings.contactDetails.phone', editValues.phone);
          break;
        case 'address':
          onContentChange('profile.address', editValues.address);
          onContentChange('catalogue.settings.contactDetails.address', editValues.address);
          break;
        case 'website':
          onContentChange('profile.website', editValues.website);
          onContentChange('catalogue.settings.contactDetails.website', editValues.website);
          break;
        case 'categoryName':
          onContentChange('categories.0.name', editValues.categoryName);
          break;
        case 'categoryDescription':
          onContentChange('categories.0.description', editValues.categoryDescription);
          break;
        case 'newCollectionTitle':
          onContentChange('newCollection.title', editValues.newCollectionTitle);
          break;
        case 'newCollectionDescription':
          onContentChange('newCollection.description', editValues.newCollectionDescription);
          break;
        case 'contactDescription':
          onContentChange('catalogue.settings.contactDescription', editValues.contactDescription);
          break;
        case 'storeDescription':
          onContentChange('catalogue.settings.storeDescription', editValues.storeDescription);
          break;
        case 'year':
          onContentChange('catalogue.year', editValues.year);
          break;
        case 'catalogueQuote':
          onContentChange('catalogue.quote', editValues.catalogueQuote);
          break;
        case 'facebook':
          onContentChange('catalogue.settings.socialMedia.facebook', editValues.facebook);
          break;
        case 'instagram':
          onContentChange('catalogue.settings.socialMedia.instagram', editValues.instagram);
          break;
        case 'linkedin':
          onContentChange('catalogue.settings.socialMedia.linkedin', editValues.linkedin);
          break;
        case 'twitter':
          onContentChange('catalogue.settings.socialMedia.twitter', editValues.twitter);
          break;
        case 'contactQuote':
          onContentChange('catalogue.settings.contactDetails.contactQuote', editValues.contactQuote);
          break;
        case 'contactQuoteBy':
          onContentChange('catalogue.settings.contactDetails.contactQuoteBy', editValues.contactQuoteBy);
          break;
      }
    }
    setEditingField(null);
  }

  const handleKeyPress = (e: React.KeyboardEvent, field: string) => {
    if (e.key === 'Enter') {
      handleFieldSave(field)
    } else if (e.key === 'Escape') {
      setEditingField(null)
      // Reset to original value
    }
  }

  const handleProductFieldEdit = (productId: string, field: string, currentValue: string) => {
    const fieldKey = `product-${field}-${productId}`
    setEditingField(fieldKey)
    setEditValues(prev => ({ ...prev, [fieldKey]: currentValue || '' }))
  }

  const handleProductFieldSave = async (productId: string, field: string) => {
    const fieldKey = `product-${field}-${productId}`
    const newValue = editValues[fieldKey]

    if (newValue !== undefined && onProductUpdate) {
      try {
        await onProductUpdate(productId, { [field]: newValue })
        setEditingField('')
        setEditValues(prev => {
          const newValues = { ...prev }
          delete newValues[fieldKey]
          return newValues
        })
      } catch (error) {
        console.error('Failed to update product:', error)
      }
    } else {
      setEditingField('')
    }
  }

  // Enhanced product handlers
  const handleProductPriceUpdate = async (productId: string, price: number) => {
    if (onProductUpdate) {
      try {
        await onProductUpdate(productId, { price })
      } catch (error) {
        console.error('Failed to update product price:', error)
      }
    }
  }

  const handleProductTagsUpdate = async (productId: string, tags: string[]) => {
    if (onProductUpdate) {
      try {
        await onProductUpdate(productId, { tags })
      } catch (error) {
        console.error('Failed to update product tags:', error)
      }
    }
  }

  const handleProductImageUpdate = async (productId: string, imageUrl: string) => {
    if (onProductImageUpdate) {
      try {
        await onProductImageUpdate(productId, imageUrl)
        setShowImageUpload('')
        setImagePreview('')
      } catch (error) {
        console.error('Failed to update product image:', error)
      }
    }
  }

  const handleProductVisibilityToggle = async (productId: string, isActive: boolean) => {
    if (onProductUpdate) {
      try {
        await onProductUpdate(productId, { isActive })
      } catch (error) {
        console.error('Failed to update product visibility:', error)
      }
    }
  }

  // Bulk editing handlers
  const handleBulkProductUpdate = async (updates: any) => {
    if (onProductUpdate && selectedProducts.length > 0) {
      try {
        for (const productId of selectedProducts) {
          await onProductUpdate(productId, updates)
        }
        setSelectedProducts([])
        setBulkEditMode(false)
      } catch (error) {
        console.error('Failed to bulk update products:', error)
      }
    }
  }

  const toggleProductSelection = (productId: string) => {
    setSelectedProducts(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    )
  }

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>, productId: string) => {
    const file = event.target.files?.[0]
    if (file) {
      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => setImagePreview(e.target?.result as string)
      reader.readAsDataURL(file)

      // TODO: Upload to your storage service and get URL
      // For now, we'll use a placeholder URL
      const imageUrl = `https://placeholder.image.url/${file.name}`
      await handleProductImageUpdate(productId, imageUrl)
    }
  }

  const defaultColors = {
    primary: '#3b82f6',
    secondary: '#64748b',
    accent: '#f59e0b',
    background: '#ffffff',
    surface: '#f8fafc',
    textColors: {
      primary: '#1f2937',
      secondary: '#6b7280',
      accent: '#3b82f6',
      price: '#059669',
      productDescription: '#6b7280',
      companyName: '#1f2937',
      title: '#1f2937',
      description: '#6b7280',
    }
  }

  const currentColors = { ...defaultColors, ...customColors }

  return (
    <Card className="w-full max-w-md">
      {/* Sidebar Header */}
      <div className="sticky top-0 bg-gradient-to-r from-[#301F70] to-[#1A1B41] p-4 border-b border-gray-200/60">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center">
            <Edit className="h-4 w-4 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-white">Style Customizer</h3>
            <p className="text-xs text-white/80">Live preview editing</p>
          </div>
        </div>
      </div>
      <CardContent className="space-y-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 text-xs">
            <TabsTrigger value="content" className="flex items-center gap-1 px-1">
              <Settings className="w-2 h-2" />
              <span className="hidden text-xs sm:inline">Content</span>
            </TabsTrigger>
            <TabsTrigger value="products" className="flex items-center gap-1 px-1">
              <Package className="w-2 h-2" />
              <span className="hidden text-xs sm:inline">Product</span>
            </TabsTrigger>
            <TabsTrigger value="colors" className="flex items-center gap-1 px-1">
              <Palette className="w-2 h-2" />
              <span className="hidden text-xs sm:inline">Colors</span>
            </TabsTrigger>
            <TabsTrigger value="typography" className="flex items-center gap-1 px-1">
              <Type className="w-2 h-2" />
              <span className="hidden text-xs sm:inline">Fonts</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="colors" className="space-y-3 p-2">
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-700">Text Colors</h4>
              <ColorPicker
                label="Company Name"
                value={currentColors.textColors?.companyName || '#1f2937'}
                onChange={(color) => handleColorChange('textColors', { ...currentColors.textColors, companyName: color })}
                elementKey="companyName"
              />
              <ColorPicker
                label="Catalog Title"
                value={currentColors.textColors?.title || '#1f2937'}
                onChange={(color) => handleColorChange('textColors', { ...currentColors.textColors, title: color })}
                elementKey="title"
              />
              <ColorPicker
                label="Description Text"
                value={currentColors.textColors?.description || '#6b7280'}
                onChange={(color) => handleColorChange('textColors', { ...currentColors.textColors, description: color })}
                elementKey="description"
              />
              <ColorPicker
                label="Price"
                value={currentColors.textColors?.price || '#059669'}
                onChange={(color) => handleColorChange('textColors', { ...currentColors.textColors, price: color })}
              />
              <ColorPicker
                label="Product Description"
                value={currentColors.textColors?.productDescription || '#6b7280'}
                onChange={(color) => handleColorChange('textColors', { ...currentColors.textColors, productDescription: color })}
                elementKey="productDescription"
              />
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-700">Theme Colors</h4>
              <ColorPicker
                label="Primary"
                value={currentColors.primary || '#3b82f6'}
                onChange={(color) => handleColorChange('primary', color)}
              />
              <ColorPicker
                label="Secondary"
                value={currentColors.secondary || '#64748b'}
                onChange={(color) => handleColorChange('secondary', color)}
              />
              <ColorPicker
                label="Accent"
                value={currentColors.accent || '#f59e0b'}
                onChange={(color) => handleColorChange('accent', color)}
              />
              <ColorPicker
                label="Background"
                value={currentColors.background || '#ffffff'}
                onChange={(color) => handleColorChange('background', color)}
              />
            </div>
          </TabsContent>

          <TabsContent value="typography" className="space-y-3 p-2">
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-700">Font Family</h4>
              <div className="space-y-2">
                <Label className="text-xs text-gray-600">Title</Label>
                <Select
                  value={fontCustomization.fontFamily?.title || 'Inter, sans-serif'}
                  onValueChange={(value) => handleFontChange('fontFamily.title', value)}
                >
                  <SelectTrigger className="text-xs">
                    <SelectValue>
                      {getFontDisplayName(fontCustomization.fontFamily?.title || 'Inter, sans-serif')}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {fontOptions.map((font) => (
                      <SelectItem key={font.value} value={font.value} className="text-xs">
                        {font.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-gray-600">Company Name</Label>
                <Select
                  value={fontCustomization.fontFamily?.companyName || 'Inter, sans-serif'}
                  onValueChange={(value) => handleFontChange('fontFamily.companyName', value)}
                >
                  <SelectTrigger className="text-xs">
                    <SelectValue>
                      {getFontDisplayName(fontCustomization.fontFamily?.companyName || 'Inter, sans-serif')}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {fontOptions.map((font) => (
                      <SelectItem key={font.value} value={font.value} className="text-xs">
                        {font.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-gray-600">Price</Label>
                <Select
                  value={fontCustomization.fontFamily?.price || 'Inter, sans-serif'}
                  onValueChange={(value) => handleFontChange('fontFamily.price', value)}
                >
                  <SelectTrigger className="text-xs">
                    <SelectValue>
                      {getFontDisplayName(fontCustomization.fontFamily?.price || 'Inter, sans-serif')}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {fontOptions.map((font) => (
                      <SelectItem key={font.value} value={font.value} className="text-xs">
                        {font.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-gray-600">Product Description</Label>
                <Select
                  value={fontCustomization.fontFamily?.productDescription || 'Inter, sans-serif'}
                  onValueChange={(value) => handleFontChange('fontFamily.productDescription', value)}
                >
                  <SelectTrigger className="text-xs">
                    <SelectValue>
                      {getFontDisplayName(fontCustomization.fontFamily?.productDescription || 'Inter, sans-serif')}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {fontOptions.map((font) => (
                      <SelectItem key={font.value} value={font.value} className="text-xs">
                        {font.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-gray-600">Description</Label>
                <Select
                  value={fontCustomization.fontFamily?.description || 'Inter, sans-serif'}
                  onValueChange={(value) => handleFontChange('fontFamily.description', value)}
                >
                  <SelectTrigger className="text-xs">
                    <SelectValue>
                      {getFontDisplayName(fontCustomization.fontFamily?.description || 'Inter, sans-serif')}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {fontOptions.map((font) => (
                      <SelectItem key={font.value} value={font.value} className="text-xs">
                        {font.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-700">Font Size</h4>
              <div className="space-y-3">
                <div>
                  <Label className="text-xs text-gray-600">Title: {fontCustomization.fontSize?.title || 24}px</Label>
                  <Slider
                    value={[fontCustomization.fontSize?.title || 24]}
                    onValueChange={([value]) => handleFontChange('fontSize.title', value)}
                    min={12}
                    max={48}
                    step={1}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs text-gray-600">Company Name: {fontCustomization.fontSize?.companyName || 20}px</Label>
                  <Slider
                    value={[fontCustomization.fontSize?.companyName || 20]}
                    onValueChange={([value]) => handleFontChange('fontSize.companyName', value)}
                    min={12}
                    max={36}
                    step={1}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs text-gray-600">Price: {fontCustomization.fontSize?.price || 18}px</Label>
                  <Slider
                    value={[fontCustomization.fontSize?.price || 18]}
                    onValueChange={([value]) => handleFontChange('fontSize.price', value)}
                    min={10}
                    max={32}
                    step={1}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs text-gray-600">Product Description: {fontCustomization.fontSize?.productDescription || 14}px</Label>
                  <Slider
                    value={[fontCustomization.fontSize?.productDescription || 14]}
                    onValueChange={([value]) => handleFontChange('fontSize.productDescription', value)}
                    min={10}
                    max={24}
                    step={1}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs text-gray-600">Description: {fontCustomization.fontSize?.description || 16}px</Label>
                  <Slider
                    value={[fontCustomization.fontSize?.description || 16]}
                    onValueChange={([value]) => handleFontChange('fontSize.description', value)}
                    min={10}
                    max={28}
                    step={1}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-700">Font Weight</h4>
              <div className="space-y-3">
                <div>
                  <Label className="text-xs text-gray-600">Title: {fontCustomization.fontWeight?.title || '700'}</Label>
                  <Slider
                    value={[parseInt(fontCustomization.fontWeight?.title || '700')]}
                    onValueChange={([value]) => handleFontChange('fontWeight.title', value.toString())}
                    min={100}
                    max={900}
                    step={100}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs text-gray-600">Company Name: {fontCustomization.fontWeight?.companyName || '600'}</Label>
                  <Slider
                    value={[parseInt(fontCustomization.fontWeight?.companyName || '600')]}
                    onValueChange={([value]) => handleFontChange('fontWeight.companyName', value.toString())}
                    min={100}
                    max={900}
                    step={100}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs text-gray-600">Price: {fontCustomization.fontWeight?.price || '600'}</Label>
                  <Slider
                    value={[parseInt(fontCustomization.fontWeight?.price || '600')]}
                    onValueChange={([value]) => handleFontChange('fontWeight.price', value.toString())}
                    min={100}
                    max={900}
                    step={100}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs text-gray-600">Product Description: {fontCustomization.fontWeight?.productDescription || '400'}</Label>
                  <Slider
                    value={[parseInt(fontCustomization.fontWeight?.productDescription || '400')]}
                    onValueChange={([value]) => handleFontChange('fontWeight.productDescription', value.toString())}
                    min={100}
                    max={900}
                    step={100}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs text-gray-600">Description: {fontCustomization.fontWeight?.description || '400'}</Label>
                  <Slider
                    value={[parseInt(fontCustomization.fontWeight?.description || '400')]}
                    onValueChange={([value]) => handleFontChange('fontWeight.description', value.toString())}
                    min={100}
                    max={900}
                    step={100}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="products" className="space-y-3 p-2">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-gray-700">Edit Products</h4>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={bulkEditMode ? "destructive" : "outline"}
                    onClick={() => setBulkEditMode(!bulkEditMode)}
                    className="text-xs"
                  >
                    {bulkEditMode ? 'Cancel Bulk' : 'Bulk Edit'}
                  </Button>
                  {bulkEditMode && selectedProducts.length > 0 && (
                    <Button
                      size="sm"
                      onClick={() => setEditingField('bulk-actions')}
                      className="text-xs"
                    >
                      Actions ({selectedProducts.length})
                    </Button>
                  )}
                </div>
              </div>

              {/* Bulk Actions Panel */}
              {editingField === 'bulk-actions' && (
                <div className="p-3 border rounded-lg bg-blue-50">
                  <div className="flex items-center justify-between mb-3">
                    <h5 className="text-sm font-medium">Bulk Actions</h5>
                    <span className="text-xs text-blue-600">
                      {selectedProducts.length} products selected
                    </span>
                  </div>
                  <div className="space-y-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleBulkProductUpdate({ isActive: true })}
                      className="w-full text-xs flex items-center gap-2"
                    >
                      <Check className="w-3 h-3" />
                      Activate Selected Products
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleBulkProductUpdate({ isActive: false })}
                      className="w-full text-xs flex items-center gap-2"
                    >
                      <X className="w-3 h-3" />
                      Deactivate Selected Products
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingField('')}
                      className="w-full text-xs"
                    >
                      Close
                    </Button>
                  </div>
                </div>
              )}

              {content?.products && content.products.length > 0 ? (
                <div className="space-y-4">
                  {content.products.map((product: any, index: number) => (
                    <div key={product.id || index} className="border rounded-lg p-3 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {bulkEditMode && (
                            <input
                              type="checkbox"
                              checked={selectedProducts.includes(product.id)}
                              onChange={() => toggleProductSelection(product.id)}
                              className="rounded"
                            />
                          )}
                          <span className="text-xs font-medium text-gray-500">Product {index + 1}</span>
                          <div className="flex items-center gap-1">
                            <div
                              className={`w-2 h-2 rounded-full ${product.isActive ? 'bg-green-400' : 'bg-red-400'}`}
                              title={product.isActive ? 'Active' : 'Inactive'}
                            />
                            <button
                              onClick={() => handleProductVisibilityToggle(product.id, !product.isActive)}
                              className="text-xs text-gray-500 hover:text-gray-700"
                            >
                              {product.isActive ? 'Hide' : 'Show'}
                            </button>
                          </div>
                        </div>
                        {product.category && (
                          <span className="text-xs px-2 py-1 bg-gray-100 rounded text-gray-600">
                            {product.category.name || 'Uncategorized'}
                          </span>
                        )}
                      </div>

                      {/* Product Image */}
                      <div className="space-y-2">
                        <Label className="text-xs text-gray-600">Product Image</Label>
                        <div className="flex items-center gap-2">
                          {(product.imageUrl || imagePreview) && (
                            <img
                              src={imagePreview || product.imageUrl}
                              alt={product.name}
                              className="w-16 h-16 object-cover rounded border"
                            />
                          )}
                          <div className="flex-1">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleImageUpload(e, product.id)}
                              className="text-xs"
                              placeholder="Upload product image"
                              title="Upload product image"
                            />
                            {product.imageUrl && (
                              <p className="text-xs text-gray-500 mt-1 truncate">
                                Current: {product.imageUrl.split('/').pop()}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Product Name */}
                      <div className="space-y-2">
                        <Label className="text-xs text-gray-600">Product Name</Label>
                        {editingField === `product-name-${product.id}` ? (
                          <div className="flex gap-2">
                            <Input
                              value={editValues[`product-name-${product.id}`] || ''}
                              onChange={(e) => setEditValues(prev => ({ ...prev, [`product-name-${product.id}`]: e.target.value }))}
                              onKeyDown={(e) => handleKeyPress(e, `product-name-${product.id}`)}
                              onBlur={() => handleProductFieldSave(product.id, 'name')}
                              className="flex-1 text-sm"
                              autoFocus
                            />
                            <Button size="sm" onClick={() => handleProductFieldSave(product.id, 'name')}>Save</Button>
                          </div>
                        ) : (
                          <div
                            className="p-2 border rounded cursor-pointer hover:bg-gray-50 text-sm"
                            onClick={() => handleProductFieldEdit(product.id, 'name', product.name)}
                          >
                            {product.name || 'Click to edit product name...'}
                          </div>
                        )}
                      </div>

                      {/* Product Description */}
                      <div className="space-y-2">
                        <Label className="text-xs text-gray-600">Product Description</Label>
                        {editingField === `product-description-${product.id}` ? (
                          <div className="flex gap-2">
                            <textarea
                              value={editValues[`product-description-${product.id}`] || ''}
                              onChange={(e) => setEditValues(prev => ({ ...prev, [`product-description-${product.id}`]: e.target.value }))}
                              onBlur={() => handleProductFieldSave(product.id, 'description')}
                              className="flex-1 text-sm p-2 border rounded resize-none"
                              rows={3}
                              autoFocus
                              placeholder="Enter product description"
                              title="Product Description"
                            />
                            <Button size="sm" onClick={() => handleProductFieldSave(product.id, 'description')}>Save</Button>
                          </div>
                        ) : (
                          <div
                            className="p-2 border rounded cursor-pointer hover:bg-gray-50 text-sm min-h-[60px]"
                            onClick={() => handleProductFieldEdit(product.id, 'description', product.description)}
                          >
                            {product.description || 'Click to edit product description...'}
                          </div>
                        )}
                      </div>

                      {/* Product Price */}
                      <div className="space-y-2">
                        <Label className="text-xs text-gray-600">Product Price</Label>
                        {editingField === `product-price-${product.id}` ? (
                          <div className="flex gap-2">
                            <Input
                              type="number"
                              value={editValues[`product-price-${product.id}`] || ''}
                              onChange={(e) => setEditValues(prev => ({ ...prev, [`product-price-${product.id}`]: e.target.value }))}
                              onBlur={() => {
                                const price = parseFloat(editValues[`product-price-${product.id}`]) || 0
                                handleProductPriceUpdate(product.id, price)
                                setEditingField('')
                              }}
                              className="flex-1 text-sm"
                              step="0.01"
                              min="0"
                              autoFocus
                            />
                            <Button
                              size="sm"
                              onClick={() => {
                                const price = parseFloat(editValues[`product-price-${product.id}`]) || 0
                                handleProductPriceUpdate(product.id, price)
                                setEditingField('')
                              }}
                            >
                              Save
                            </Button>
                          </div>
                        ) : (
                          <div
                            className="p-2 border rounded cursor-pointer hover:bg-gray-50 text-sm"
                            onClick={() => {
                              setEditingField(`product-price-${product.id}`)
                              setEditValues(prev => ({ ...prev, [`product-price-${product.id}`]: product.price?.toString() || '0' }))
                            }}
                          >
                            {product.price ? `₹${Number(product.price).toLocaleString('en-IN')}` : 'Click to set price...'}
                          </div>
                        )}
                      </div>

                      {/* Product Tags */}
                      <div className="space-y-2">
                        <Label className="text-xs text-gray-600">Product Tags</Label>
                        {editingField === `product-tags-${product.id}` ? (
                          <div className="space-y-2">
                            <Input
                              value={editValues[`product-tags-${product.id}`] || ''}
                              onChange={(e) => setEditValues(prev => ({ ...prev, [`product-tags-${product.id}`]: e.target.value }))}
                              placeholder="Enter tags separated by commas"
                              className="text-sm"
                              autoFocus
                            />
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => {
                                  const tagsString = editValues[`product-tags-${product.id}`] || ''
                                  const tags = tagsString.split(',').map(tag => tag.trim()).filter(Boolean)
                                  handleProductTagsUpdate(product.id, tags)
                                  setEditingField('')
                                }}
                              >
                                Save
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setEditingField('')}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div
                            className="p-2 border rounded cursor-pointer hover:bg-gray-50 text-sm min-h-[40px]"
                            onClick={() => {
                              setEditingField(`product-tags-${product.id}`)
                              setEditValues(prev => ({
                                ...prev,
                                [`product-tags-${product.id}`]: (product.tags || []).join(', ')
                              }))
                            }}
                          >
                            {product.tags && product.tags.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {product.tags.map((tag: string, tagIndex: number) => (
                                  <span key={tagIndex} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              'Click to add tags...'
                            )}
                          </div>
                        )}
                      </div>

                      {/* Category Assignment */}
                      <div className="space-y-2">
                        <Label className="text-xs text-gray-600">Category</Label>
                        <Select
                          value={product.categoryId || 'uncategorized'}
                          onValueChange={(categoryId) => {
                            const actualCategoryId = categoryId === 'uncategorized' ? null : categoryId
                            if (onProductUpdate) {
                              onProductUpdate(product.id, { categoryId: actualCategoryId })
                            }
                          }}
                        >
                          <SelectTrigger className="text-sm">
                            <SelectValue>
                              {product.categoryId && content?.categories?.find((cat: any) => cat.id === product.categoryId)?.name || 'Uncategorized'}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="uncategorized">Uncategorized</SelectItem>
                            {content?.categories?.map((category: any) => (
                              <SelectItem key={category.id} value={category.id}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No products found</p>
                  <p className="text-xs">Add products to your catalogue to edit them here</p>
                </div>
              )}
            </div>
          </TabsContent>





          <TabsContent value="content" className="space-y-3 p-2">
            {content && onContentChange && (
              <div className="space-y-4">



                {/* Catalog Information Section */}
                <div className="space-y-3">
                  <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Catalog Information</h5>

                  {/* Catalog Name */}
                  <div className="space-y-2">
                    <Label className="text-xs text-gray-600">Catalog Name</Label>
                    {editingField === 'name' ? (
                      <div className="flex gap-2">
                        <Input
                          value={editValues.name}
                          onChange={(e) => setEditValues(prev => ({ ...prev, name: e.target.value }))}
                          onKeyDown={(e) => handleKeyPress(e, 'name')}
                          onBlur={() => handleFieldSave('name')}
                          className="flex-1"
                          autoFocus
                        />
                        <Button size="sm" onClick={() => handleFieldSave('name')}>Save</Button>
                      </div>
                    ) : (
                      <div
                        className="p-2 border rounded cursor-pointer hover:bg-gray-50"
                        onClick={() => handleFieldEdit('name')}
                      >
                        {content.catalogue?.name || content.name || 'Click to edit catalog name...'}
                      </div>
                    )}
                  </div>

                  {/* Catalog Description */}
                  <div className="space-y-2">
                    <Label className="text-xs text-gray-600">Catalog Description</Label>
                    {editingField === 'description' ? (
                      <div className="flex gap-2">
                        <Input
                          value={editValues.description}
                          onChange={(e) => setEditValues(prev => ({ ...prev, description: e.target.value }))}
                          onKeyDown={(e) => handleKeyPress(e, 'description')}
                          onBlur={() => handleFieldSave('description')}
                          className="flex-1"
                          autoFocus
                        />
                        <Button size="sm" onClick={() => handleFieldSave('description')}>Save</Button>
                      </div>
                    ) : (
                      <div
                        className="p-2 border rounded cursor-pointer hover:bg-gray-50"
                        onClick={() => handleFieldEdit('description')}
                      >
                        {content.catalogue?.description || content.description || 'Click to edit catalog description...'}
                      </div>
                    )}
                  </div>

                  {/* Catalogue Year (Bottom Decorative Text) */}
                  <div className="space-y-2">
                    <Label className="text-xs text-gray-600">Catalogue Year</Label>
                    {editingField === 'year' ? (
                      <div className="flex gap-2">
                        <Input
                          value={editValues.year}
                          onChange={(e) => setEditValues(prev => ({ ...prev, year: e.target.value }))}
                          onKeyDown={(e) => handleKeyPress(e, 'year')}
                          onBlur={() => handleFieldSave('year')}
                          className="flex-1"
                          placeholder="2025"
                          autoFocus
                        />
                        <Button size="sm" onClick={() => handleFieldSave('year')}>Save</Button>
                      </div>
                    ) : (
                      <div
                        className="p-2 border rounded cursor-pointer hover:bg-gray-50"
                        onClick={() => handleFieldEdit('year')}
                      >
                        {editValues.year || 'Click to edit catalogue year...'}
                      </div>
                    )}
                  </div>

                  {/*Catalogue Tagline */}
                  <div className="space-y-2">
                    <Label className="text-xs text-gray-600">Catalogue Tagline</Label>
                    {editingField === 'tagline' ? (
                      <div className="flex gap-2">
                        <Input
                          value={editValues.tagline}
                          onChange={(e) => setEditValues(prev => ({ ...prev, tagline: e.target.value }))}
                          onKeyDown={(e) => handleKeyPress(e, 'tagline')}
                          onBlur={() => handleFieldSave('tagline')}
                          className="flex-1"
                          autoFocus
                        />
                        <Button size="sm" onClick={() => handleFieldSave('tagline')}>Save</Button>
                      </div>
                    ) : (
                      <div
                        className="p-2 border rounded cursor-pointer hover:bg-gray-50"
                        onClick={() => handleFieldEdit('tagline')}
                      >
                        {editValues.tagline || content.catalogue?.tagline || content.profile?.tagline || 'Your Business Tagline Here'}
                      </div>
                    )}
                  </div>

                  {/* Catalogue Quote */}
                  <div className="space-y-2">
                    <Label className="text-xs text-gray-600">Catalogue Quote</Label>
                    {editingField === 'catalogueQuote' ? (
                      <div className="flex gap-2">
                        <Input
                          value={editValues.catalogueQuote || ''}
                          onChange={(e) => setEditValues(prev => ({ ...prev, catalogueQuote: e.target.value }))}
                          onKeyDown={(e) => handleKeyPress(e, 'catalogueQuote')}
                          onBlur={() => handleFieldSave('catalogueQuote')}
                          className="flex-1"
                          autoFocus
                        />
                        <Button size="sm" onClick={() => handleFieldSave('catalogueQuote')}>Save</Button>
                      </div>
                    ) : (
                      <div
                        className="p-2 border rounded cursor-pointer hover:bg-gray-50"
                        onClick={() => handleFieldEdit('catalogueQuote')}
                      >
                        {editValues.catalogueQuote || content.catalogue?.quote || 'Your Inspirational Catalogue Quote'}
                      </div>
                    )}
                  </div>


                </div>





                {/* Company Information Section */}
                <div className="space-y-3">
                  <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Company Information</h5>

                  {/* Company Name */}
                  <div className="space-y-2">
                    <Label className="text-xs text-gray-600">Company Name</Label>
                    {editingField === 'companyName' ? (
                      <div className="flex gap-2">
                        <Input
                          value={editValues.companyName}
                          onChange={(e) => setEditValues(prev => ({ ...prev, companyName: e.target.value }))}
                          onKeyDown={(e) => handleKeyPress(e, 'companyName')}
                          onBlur={() => handleFieldSave('companyName')}
                          className="flex-1"
                          autoFocus
                        />
                        <Button size="sm" onClick={() => handleFieldSave('companyName')}>Save</Button>
                      </div>
                    ) : (
                      <div
                        className="p-2 border rounded cursor-pointer hover:bg-gray-50"
                        onClick={() => handleFieldEdit('companyName')}
                      >
                        {editValues.companyName || content.catalogue?.settings?.companyInfo?.companyName || content.profile?.companyName || 'Your Company Name'}
                      </div>
                    )}
                  </div>



                  {/* Company Description */}
                  <div className="space-y-2">
                    <Label className="text-xs text-gray-600">Company Description</Label>
                    {editingField === 'companyDescription' ? (
                      <div className="flex gap-2">
                        <Input
                          value={editValues.companyDescription}
                          onChange={(e) => setEditValues(prev => ({ ...prev, companyDescription: e.target.value }))}
                          onKeyDown={(e) => handleKeyPress(e, 'companyDescription')}
                          onBlur={() => handleFieldSave('companyDescription')}
                          className="flex-1"
                          autoFocus
                        />
                        <Button size="sm" onClick={() => handleFieldSave('companyDescription')}>Save</Button>
                      </div>
                    ) : (
                      <div
                        className="p-2 border rounded cursor-pointer hover:bg-gray-50"
                        onClick={() => handleFieldEdit('companyDescription')}
                      >
                        {content.catalogue?.description || 'Click to edit company description...'}
                      </div>
                    )}
                  </div>

                </div>

                {/* Contact Information Section */}
                <div className="space-y-3">
                  <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Contact Information</h5>

                  {/* Address */}
                  <div className="space-y-2">
                    <Label className="text-xs text-gray-600">Address</Label>
                    {editingField === 'address' ? (
                      <div className="flex gap-2">
                        <Input
                          value={editValues.address}
                          onChange={(e) => setEditValues(prev => ({ ...prev, address: e.target.value }))}
                          onKeyDown={(e) => handleKeyPress(e, 'address')}
                          onBlur={() => handleFieldSave('address')}
                          className="flex-1"
                          autoFocus
                        />
                        <Button size="sm" onClick={() => handleFieldSave('address')}>Save</Button>
                      </div>
                    ) : (
                      <div
                        className="p-2 border rounded cursor-pointer hover:bg-gray-50"
                        onClick={() => handleFieldEdit('address')}
                      >
                        {content.profile?.address || 'Click to edit address...'}
                      </div>
                    )}
                  </div>

                  {/* Phone */}
                  <div className="space-y-2">
                    <Label className="text-xs text-gray-600">Phone</Label>
                    {editingField === 'phone' ? (
                      <div className="flex gap-2">
                        <Input
                          type="tel"
                          value={editValues.phone}
                          onChange={(e) => setEditValues(prev => ({ ...prev, phone: e.target.value }))}
                          onKeyDown={(e) => handleKeyPress(e, 'phone')}
                          onBlur={() => handleFieldSave('phone')}
                          className="flex-1"
                          autoFocus
                        />
                        <Button size="sm" onClick={() => handleFieldSave('phone')}>Save</Button>
                      </div>
                    ) : (
                      <div
                        className="p-2 border rounded cursor-pointer hover:bg-gray-50"
                        onClick={() => handleFieldEdit('phone')}
                      >
                        {content.profile?.phone || 'Click to edit phone...'}
                      </div>
                    )}
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <Label className="text-xs text-gray-600">Email</Label>
                    {editingField === 'email' ? (
                      <div className="flex gap-2">
                        <Input
                          type="email"
                          value={editValues.email}
                          onChange={(e) => setEditValues(prev => ({ ...prev, email: e.target.value }))}
                          onKeyDown={(e) => handleKeyPress(e, 'email')}
                          onBlur={() => handleFieldSave('email')}
                          className="flex-1"
                          autoFocus
                        />
                        <Button size="sm" onClick={() => handleFieldSave('email')}>Save</Button>
                      </div>
                    ) : (
                      <div
                        className="p-2 border rounded cursor-pointer hover:bg-gray-50"
                        onClick={() => handleFieldEdit('email')}
                      >
                        {content.profile?.email || 'Click to edit email...'}
                      </div>
                    )}
                  </div>



                  {/* Website */}
                  <div className="space-y-2">
                    <Label className="text-xs text-gray-600">Website</Label>
                    {editingField === 'website' ? (
                      <div className="flex gap-2">
                        <Input
                          type="url"
                          value={editValues.website}
                          onChange={(e) => setEditValues(prev => ({ ...prev, website: e.target.value }))}
                          onKeyDown={(e) => handleKeyPress(e, 'website')}
                          onBlur={() => handleFieldSave('website')}
                          className="flex-1"
                          autoFocus
                        />
                        <Button size="sm" onClick={() => handleFieldSave('website')}>Save</Button>
                      </div>
                    ) : (
                      <div
                        className="p-2 border rounded cursor-pointer hover:bg-gray-50"
                        onClick={() => handleFieldEdit('website')}
                      >
                        {content.profile?.website || 'Click to edit website...'}
                      </div>
                    )}
                  </div>

                </div>

                {/* Social Media Links */}
                <div className="space-y-3">
                  <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Social Media Links</h5>

                  <div className="space-y-2">
                    <Label className="text-xs text-gray-600">Facebook</Label>
                    {editingField === 'facebook' ? (
                      <div className="flex gap-2">
                        <Input
                          value={editValues.facebook || ''}
                          onChange={(e) => setEditValues(prev => ({ ...prev, facebook: e.target.value }))}
                          onKeyDown={(e) => handleKeyPress(e, 'facebook')}
                          onBlur={() => handleFieldSave('facebook')}
                          className="flex-1"
                          placeholder="Facebook URL"
                          autoFocus
                        />
                        <Button size="sm" onClick={() => handleFieldSave('facebook')}>Save</Button>
                      </div>
                    ) : (
                      <div
                        className="p-2 border rounded cursor-pointer hover:bg-gray-50"
                        onClick={() => handleFieldEdit('facebook')}
                      >
                        {editValues.facebook || content.profile?.facebook || 'Click to edit Facebook link...'}
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-gray-600">Instagram</Label>
                    {editingField === 'instagram' ? (
                      <div className="flex gap-2">
                        <Input
                          value={editValues.instagram || ''}
                          onChange={(e) => setEditValues(prev => ({ ...prev, instagram: e.target.value }))}
                          onKeyDown={(e) => handleKeyPress(e, 'instagram')}
                          onBlur={() => handleFieldSave('instagram')}
                          className="flex-1"
                          placeholder="Instagram URL"
                          autoFocus
                        />
                        <Button size="sm" onClick={() => handleFieldSave('instagram')}>Save</Button>
                      </div>
                    ) : (
                      <div
                        className="p-2 border rounded cursor-pointer hover:bg-gray-50"
                        onClick={() => handleFieldEdit('instagram')}
                      >
                        {editValues.instagram || content.profile?.instagram || 'Click to edit Instagram link...'}
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-gray-600">Twitter</Label>
                    {editingField === 'twitter' ? (
                      <div className="flex gap-2">
                        <Input
                          value={editValues.twitter || ''}
                          onChange={(e) => setEditValues(prev => ({ ...prev, twitter: e.target.value }))}
                          onKeyDown={(e) => handleKeyPress(e, 'twitter')}
                          onBlur={() => handleFieldSave('twitter')}
                          className="flex-1"
                          placeholder="Twitter URL"
                          autoFocus
                        />
                        <Button size="sm" onClick={() => handleFieldSave('twitter')}>Save</Button>
                      </div>
                    ) : (
                      <div
                        className="p-2 border rounded cursor-pointer hover:bg-gray-50"
                        onClick={() => handleFieldEdit('twitter')}
                      >
                        {editValues.twitter || content.profile?.twitter || 'Click to edit Twitter link...'}
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-gray-600">LinkedIn</Label>
                    {editingField === 'linkedin' ? (
                      <div className="flex gap-2">
                        <Input
                          value={editValues.linkedin || ''}
                          onChange={(e) => setEditValues(prev => ({ ...prev, linkedin: e.target.value }))}
                          onKeyDown={(e) => handleKeyPress(e, 'linkedin')}
                          onBlur={() => handleFieldSave('linkedin')}
                          className="flex-1"
                          placeholder="LinkedIn URL"
                          autoFocus
                        />
                        <Button size="sm" onClick={() => handleFieldSave('linkedin')}>Save</Button>
                      </div>
                    ) : (
                      <div
                        className="p-2 border rounded cursor-pointer hover:bg-gray-50"
                        onClick={() => handleFieldEdit('linkedin')}
                      >
                        {editValues.linkedin || content.profile?.linkedin || 'Click to edit LinkedIn link...'}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs text-gray-600">Contact Quote</Label>
                    {editingField === 'contactQuote' ? (
                      <div className="flex gap-2">
                        <Input
                          value={editValues.contactQuote || ''}
                          onChange={(e) => setEditValues(prev => ({ ...prev, contactQuote: e.target.value }))}
                          onKeyDown={(e) => handleKeyPress(e, 'contactQuote')}
                          onBlur={() => handleFieldSave('contactQuote')}
                          className="flex-1"
                          placeholder="Enter a quote for contact section"
                          autoFocus
                        />
                        <Button size="sm" onClick={() => handleFieldSave('contactQuote')}>Save</Button>
                      </div>
                    ) : (
                      <div
                        className="p-2 border rounded cursor-pointer hover:bg-gray-50"
                        onClick={() => handleFieldEdit('contactQuote')}
                      >
                        {editValues.contactQuote || content.profile?.contactQuote || 'Click to edit contact quote...'}
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-gray-600">Contact Quote By</Label>
                    {editingField === 'contactQuoteBy' ? (
                      <div className="flex gap-2">
                        <Input
                          value={editValues.contactQuoteBy || ''}
                          onChange={(e) => setEditValues(prev => ({ ...prev, contactQuoteBy: e.target.value }))}
                          onKeyDown={(e) => handleKeyPress(e, 'contactQuoteBy')}
                          onBlur={() => handleFieldSave('contactQuoteBy')}
                          className="flex-1"
                          placeholder="Enter the author of the contact quote"
                          autoFocus
                        />
                        <Button size="sm" onClick={() => handleFieldSave('contactQuoteBy')}>Save</Button>
                      </div>
                    ) : (
                      <div
                        className="p-2 border rounded cursor-pointer hover:bg-gray-50"
                        onClick={() => handleFieldEdit('contactQuoteBy')}
                      >
                        {editValues.contactQuoteBy || content.profile?.contactQuoteBy || 'Click to edit contact quote author...'}
                      </div>
                    )}
                  </div>

                </div>

              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

export default StyleCustomizer

// Export interfaces for use in other components
export type { FontCustomization, SpacingCustomization, AdvancedStyleCustomization, CustomColors, StyleCustomizerProps }

// Export default values for use in other components
export { defaultFontCustomization as DEFAULT_FONT_CUSTOMIZATION, defaultSpacingCustomization as DEFAULT_SPACING_CUSTOMIZATION, defaultAdvancedStyleCustomization as DEFAULT_ADVANCED_STYLES }