import { Template } from '../types'
import {
  createTemplate,
  createContainer,
  createHeading,
  createText,
  createButton,
} from '../utils/template-builder'

/**
 * Hero Landing Page Template
 * Migrated from the original PrebuiltTemplates.ts to demonstrate modular structure
 */
export const heroLandingTemplate: Template = createTemplate()
  .setId('landing-hero')
  .setName('Hero Landing Page')
  .setDescription(
    'A modern hero section with heading, description, and call-to-action button'
  )
  .setCategory('landing')
  .addTags('hero', 'landing', 'cta', 'modern')
  .setData({
    ROOT: {
      ...createContainer(
        'ROOT',
        {
          padding: 0,
          backgroundColor: 'transparent',
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
        },
        'Container',
        ['hero-heading', 'hero-description', 'hero-button']
      ),
    },
    'hero-heading': {
      ...createHeading(
        'Build Amazing Websites',
        1,
        {
          fontSize: 48,
          fontWeight: 'bold',
          color: '#1f2937',
          marginBottom: 16,
        },
        'Heading',
        'ROOT'
      ),
    },
    'hero-description': {
      ...createText(
        'Create stunning, responsive websites with our intuitive drag-and-drop editor. No coding required.',
        {
          fontSize: 18,
          color: '#6b7280',
          marginBottom: 32,
          maxWidth: 600,
        },
        'Text',
        'ROOT'
      ),
    },
    'hero-button': {
      ...createButton(
        'Get Started',
        {
          variant: 'primary',
          size: 'lg',
          backgroundColor: '#3b82f6',
          color: '#ffffff',
          padding: '12px 32px',
          borderRadius: 8,
        },
        'Button',
        'ROOT'
      ),
    },
  })
  .build()
