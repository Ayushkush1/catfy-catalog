import { generateWithGemini } from '@/lib/gemini'
import { NextRequest, NextResponse } from 'next/server'

interface RequestBody {
  productName: string
  category?: string
  tags?: string[]
  price?: number
}

export async function POST(request: NextRequest) {
  const DEBUG = process.env.NODE_ENV === 'development'

  try {
    const body: RequestBody = await request.json()
    const { productName, category, tags, price } = body

    if (DEBUG) {
      console.log('AI Description Request:', {
        productName,
        category,
        tags,
        price,
      })
    }

    if (
      !productName ||
      typeof productName !== 'string' ||
      productName.trim().length === 0
    ) {
      return NextResponse.json(
        { success: false, error: 'Product name is required' },
        { status: 400 }
      )
    }

    const prompt = `Generate a compelling and professional description (1 sentence, around 25-30 words) for:
      Name: ${productName}
      ${category ? `Category: ${category}` : ''}
      ${tags?.length ? `Tags: ${tags.join(', ')}` : ''}
      ${price ? `Price: ₹${Number(price).toLocaleString('en-IN')}` : ''}
      
      The description should:
      - Be engaging and professional
      - Highlight key features and benefits
      - Appeal to potential customers
      - Be complete sentences with proper punctuation
      
      IMPORTANT: 
      - Return ONLY the description text, nothing else
      - Do NOT use markdown, asterisks (*), underscores (_), hashtags (#), or special formatting
      - Make sure the description is COMPLETE and not cut off
      - Write in a natural, flowing style`

    if (DEBUG) {
      console.log('Generating description with prompt:', prompt)
    }

    let description = await generateWithGemini(prompt)

    // Clean and validate the generated description
    description = description.trim().replace(/[*_#]/g, '')
    if (!description) {
      throw new Error('Generated description is empty')
    }

    // Ensure description isn't too long (optional)
    if (description.length > 500) {
      description = description.slice(0, 497) + '...'
    }

    if (DEBUG) {
      console.log('Generated description:', description)
    }

    // Return in the exact format expected by the frontend
    return NextResponse.json({
      success: true,
      description,
      metadata: {
        model: 'gemini-2.5-flash',
        promptLength: prompt.length,
      },
    })
  } catch (error) {
    console.error('Description generation error:', error)
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to generate description'

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        description: '', // Ensure consistent response format
      },
      { status: 500 }
    )
  }
}

function getApiStatus() {
  return {
    env: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
    aiProvider: 'OpenAI',
  }
}

export async function GET() {
  // Health check endpoint
  const apiStatus = getApiStatus()

  return NextResponse.json({
    status: 'AI Description Generator API',
    version: '1.0.0',
    apiStatus,
    endpoints: {
      generate: 'POST /api/ai/description',
    },
  })
}
