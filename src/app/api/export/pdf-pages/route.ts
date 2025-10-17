import { NextRequest, NextResponse } from 'next/server'
import { chromium } from 'playwright'
import { z } from 'zod'

const exportPdfPagesSchema = z.object({
    pages: z.array(z.object({
        html: z.string(),
        name: z.string(),
        width: z.number().optional(),
        height: z.number().optional(),
    })),
    catalogueName: z.string(),
})

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { pages, catalogueName } = exportPdfPagesSchema.parse(body)

        if (!pages || pages.length === 0) {
            return NextResponse.json(
                { error: 'No pages provided' },
                { status: 400 }
            )
        }

        // Launch browser
        const browser = await chromium.launch({
            headless: process.env.PLAYWRIGHT_HEADLESS !== 'false',
        })

        try {
            const context = await browser.newContext()

            // For multi-page PDF, we'll render each page separately and combine them
            const page = await context.newPage()

            // Build a single HTML document with all pages and proper page breaks
            const pagesHtml = pages.map((pageData, index) => {
                // Extract the body content from each page HTML
                const bodyMatch = pageData.html.match(/<body[^>]*>([\s\S]*?)<\/body>/i)
                const bodyContent = bodyMatch ? bodyMatch[1] : pageData.html

                // Extract styles from head
                const styleMatches = pageData.html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/gi)
                const styles = Array.from(styleMatches).map(match => match[1]).join('\n')

                return {
                    content: bodyContent,
                    styles: styles,
                    name: pageData.name
                }
            })

            // Combine all styles
            const allStyles = pagesHtml.map(p => p.styles).filter(Boolean).join('\n')

            // Create combined HTML with proper page sizing
            const combinedHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            html, body { margin: 0; padding: 0; }
            .pdf-page { 
              page-break-after: always;
              page-break-inside: avoid;
              position: relative;
              overflow: hidden;
            }
            .pdf-page:last-child { 
              page-break-after: auto; 
            }
            ${allStyles}
          </style>
        </head>
        <body>
          ${pagesHtml.map((p, i) => `
            <div class="pdf-page">
              ${p.content}
            </div>
          `).join('')}
        </body>
        </html>
      `

            // Set content
            await page.setContent(combinedHtml, {
                waitUntil: 'networkidle',
                timeout: 30000,
            })

            // Wait for rendering
            await page.waitForTimeout(1000)

            // Get dimensions - use provided dimensions from first page, or detect from element
            let width = pages[0]?.width || 1200
            let height = pages[0]?.height || 1600

            // If no dimensions provided, try to detect from page element
            if (!pages[0]?.width || !pages[0]?.height) {
                const firstPageElement = await page.$('.pdf-page')
                if (firstPageElement) {
                    const box = await firstPageElement.boundingBox()
                    if (box && box.width > 100 && box.height > 100) {
                        width = Math.ceil(box.width)
                        height = Math.ceil(box.height)
                    }
                }
            }

            console.log(`Generating PDF with dimensions: ${width}x${height}`)

            // Generate the PDF with proper dimensions
            const pdfBuffer = await page.pdf({
                width: `${width}px`,
                height: `${height}px`,
                printBackground: true,
                margin: {
                    top: '0px',
                    right: '0px',
                    bottom: '0px',
                    left: '0px',
                },
                scale: 1,
                preferCSSPageSize: false,
            })

            await context.close()
            await browser.close()

            const filename = `${catalogueName.replace(/[^a-zA-Z0-9]/g, '-')}.pdf`
            const headers = new Headers()
            headers.set('Content-Type', 'application/pdf')
            headers.set('Content-Disposition', `attachment; filename="${filename}"`)
            headers.set('Content-Length', pdfBuffer.length.toString())

            return new NextResponse(pdfBuffer as BodyInit, {
                status: 200,
                headers,
            })

        } catch (error) {
            await browser.close()
            throw error
        }
    } catch (error) {
        console.error('PDF export error:', error)

        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Invalid request data', details: error.errors },
                { status: 400 }
            )
        }

        const message = error instanceof Error ? error.message : 'Failed to export PDF'
        return NextResponse.json(
            { error: message },
            { status: 500 }
        )
    }
}
