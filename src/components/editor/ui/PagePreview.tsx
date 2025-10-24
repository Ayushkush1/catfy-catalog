'use client'

import React, { useEffect, useRef, useState } from 'react'
import { Editor, Frame, Element } from '@craftjs/core'
import html2canvas from 'html2canvas'
import {
  TextBlock,
  HeadingBlock,
  ButtonBlock,
  ImageBlock,
  ContainerBlock,
  DividerBlock,
  SpacerBlock,
  VideoBlock,
  IconBlock,
  GridBlock,
  FlexboxBlock,
  TabsBlock,
  AccordionBlock,
  CarouselBlock,
  FormBlock,
} from '../blocks'

interface PagePreviewProps {
  pageData: string
  width?: number
  height?: number
  className?: string
  onPreviewGenerated?: (dataUrl: string) => void
}

export const PagePreview: React.FC<PagePreviewProps> = ({
  pageData,
  width = 120,
  height = 80,
  className = '',
  onPreviewGenerated,
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const editorRef = useRef<HTMLDivElement>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)

  // Generate thumbnail from the rendered content
  const generateThumbnail = async () => {
    if (!editorRef.current || !isLoaded || isGenerating) return

    setIsGenerating(true)

    try {
      // Wait a bit for the content to fully render
      await new Promise(resolve => setTimeout(resolve, 500))

      // Find the Frame content area specifically (the actual template content)
      const frameElement =
        editorRef.current.querySelector('[data-cy="frame"]') ||
        editorRef.current.querySelector('.craftjs-renderer') ||
        editorRef.current.querySelector('[data-testid="frame"]') ||
        editorRef.current.querySelector('div[style*="background"]') ||
        editorRef.current

      // Use html2canvas to capture only the template content area
      const canvas = await html2canvas(frameElement as HTMLElement, {
        width: 1600,
        height: 1000,
        scale: 1.5,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        ignoreElements: element => {
          // Ignore editor UI elements, indicators, and toolbars
          return (
            element.classList.contains('craft-layer') ||
            element.classList.contains('craft-indicator') ||
            element.classList.contains('craft-node-indicator') ||
            element.classList.contains('craft-toolbar') ||
            element.classList.contains('craft-sidebar') ||
            element.classList.contains('craft-panel') ||
            element.hasAttribute('data-craft-node-indicator') ||
            !!element.closest(
              '.craft-layer, .craft-indicator, .craft-toolbar, .craft-sidebar'
            )
          )
        },
      })

      // Resize the canvas to the desired thumbnail size
      const thumbnailCanvas = document.createElement('canvas')
      const ctx = thumbnailCanvas.getContext('2d')

      if (!ctx) return

      thumbnailCanvas.width = width
      thumbnailCanvas.height = height

      // Draw the captured content scaled to fit while maintaining aspect ratio
      const sourceAspect = canvas.width / canvas.height
      const targetAspect = width / height

      let drawWidth = width
      let drawHeight = height
      let offsetX = 0
      let offsetY = 0

      if (sourceAspect > targetAspect) {
        // Source is wider, fit to width
        drawHeight = width / sourceAspect
        offsetY = (height - drawHeight) / 2
      } else {
        // Source is taller, fit to height
        drawWidth = height * sourceAspect
        offsetX = (width - drawWidth) / 2
      }

      // Fill background
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, width, height)

      // Draw the captured content
      ctx.drawImage(canvas, offsetX, offsetY, drawWidth, drawHeight)

      // Convert to data URL
      const dataUrl = thumbnailCanvas.toDataURL('image/png', 0.8)
      onPreviewGenerated?.(dataUrl)
    } catch (error) {
      console.error('Failed to generate thumbnail:', error)

      // Fallback to simple representation
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')

      if (!ctx) return

      canvas.width = width
      canvas.height = height

      // Create a simple representation based on the page data
      const parsedData = JSON.parse(pageData || '{}')

      // Fill background
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, width, height)

      // Add border
      ctx.strokeStyle = '#e5e7eb'
      ctx.lineWidth = 1
      ctx.strokeRect(0, 0, width, height)

      // Simple content representation
      if (
        parsedData.ROOT &&
        parsedData.ROOT.nodes &&
        parsedData.ROOT.nodes.length > 0
      ) {
        // Draw some basic shapes to represent content
        ctx.fillStyle = '#f3f4f6'
        ctx.fillRect(8, 8, width - 16, 12)

        ctx.fillStyle = '#d1d5db'
        ctx.fillRect(8, 24, width - 16, 8)
        ctx.fillRect(8, 36, (width - 16) * 0.7, 8)

        ctx.fillStyle = '#e5e7eb'
        ctx.fillRect(8, 48, width - 16, 20)
      } else {
        // Empty page indicator
        ctx.fillStyle = '#f9fafb'
        ctx.fillRect(8, 8, width - 16, height - 16)

        ctx.fillStyle = '#9ca3af'
        ctx.font = '10px sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText('Empty', width / 2, height / 2)
      }

      // Convert to data URL
      const dataUrl = canvas.toDataURL('image/png')
      onPreviewGenerated?.(dataUrl)
    } finally {
      setIsGenerating(false)
    }
  }

  useEffect(() => {
    if (isLoaded) {
      // Small delay to ensure rendering is complete
      const timer = setTimeout(generateThumbnail, 100)
      return () => clearTimeout(timer)
    }
  }, [isLoaded, pageData])

  // Parse page data safely
  let parsedData
  try {
    parsedData = JSON.parse(pageData || '{}')
  } catch (error) {
    console.error('Failed to parse page data:', error)
    parsedData = {}
  }

  return (
    <div
      ref={containerRef}
      className={`overflow-hidden bg-white ${className}`}
      style={{ width, height }}
    >
      <div
        ref={editorRef}
        className="origin-top-left transform"
        style={{
          transform: `scale(${Math.min(width / 1600, height / 1000)})`,
          width: '1600px',
          height: '1000px',
        }}
      >
        <Editor
          resolver={{
            TextBlock,
            HeadingBlock,
            ButtonBlock,
            ImageBlock,
            ContainerBlock,
            DividerBlock,
            SpacerBlock,
            VideoBlock,
            IconBlock,
            GridBlock,
            FlexboxBlock,
            TabsBlock,
            AccordionBlock,
            CarouselBlock,
            FormBlock,
            // Legacy aliases
            Container: ContainerBlock,
            Text: TextBlock,
            Heading: HeadingBlock,
            Button: ButtonBlock,
            Image: ImageBlock,
            Divider: DividerBlock,
            Spacer: SpacerBlock,
            Video: VideoBlock,
            Icon: IconBlock,
            Grid: GridBlock,
            Flexbox: FlexboxBlock,
            Tabs: TabsBlock,
            Accordion: AccordionBlock,
            Carousel: CarouselBlock,
            Form: FormBlock,
          }}
          enabled={false}
          onRender={({ render }) => {
            setIsLoaded(true)
            return render
          }}
        >
          <Frame data={parsedData}>
            <Element
              is={ContainerBlock}
              canvas
              custom={{
                displayName: 'Preview Container',
              }}
              backgroundColor="transparent"
              width="100%"
              height="100%"
              padding={{
                top: 4,
                right: 4,
                bottom: 4,
                left: 4,
              }}
            />
          </Frame>
        </Editor>
      </div>
    </div>
  )
}
