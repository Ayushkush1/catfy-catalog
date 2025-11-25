import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { PreviewPageClient } from '@/app/preview/[id]/PreviewPageClient'

interface PreviewPageProps {
    params: {
        id: string
    }
}

// Minimal embed preview page used for small card previews and embeds.
// Renders only the catalogue content (no top toolbar / share UI) so it is lightweight
// and scrollable to show multiple pages vertically.
export default async function EmbedPreviewPage({ params }: PreviewPageProps) {
    const { id } = params

    const catalogue = await prisma.catalogue.findFirst({
        where: { id },
        include: {
            products: {
                include: { category: true },
                orderBy: { sortOrder: 'asc' },
            },
            categories: { orderBy: { sortOrder: 'asc' } },
            profile: {
                select: {
                    id: true,
                    fullName: true,
                    companyName: true,
                    phone: true,
                    email: true,
                    website: true,
                    address: true,
                    city: true,
                    state: true,
                    country: true,
                    postalCode: true,
                },
            },
        },
    })

    if (!catalogue) return notFound()

    // Render only the preview client content without surrounding toolbar
    return (
        <div className="min-h-[300px] overflow-auto bg-transparent p-0">
            {/* PreviewPageClient already renders the catalogue content and supports responsive toggle.
          We render it directly so embed route is minimal. */}
            {/* Note: This is a client component import — it will handle its own viewport/toggle.
          CSS in the preview client ensures the catalogue pages are stacked and scrollable. */}
            <PreviewPageClient catalogue={catalogue} compact={true} />
        </div>
    )
}
