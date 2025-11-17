import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Placeholder implementation: return 501 Not Implemented.
    // Implementers can replace this with logic to generate or fetch
    // a preview image (e.g., render catalogue HTML to image or return stored image).
    return NextResponse.json(
      { error: 'Preview image generation not implemented' },
      { status: 501 }
    )
  } catch (err) {
    console.error('Preview image error:', err)
    return NextResponse.json(
      { error: 'Failed to generate preview image' },
      { status: 500 }
    )
  }
}

// Note: This file previously was empty which caused the build/type errors
// because Next attempted to import it as a module. Exporting a route
// handler resolves the build-time module import issue.
