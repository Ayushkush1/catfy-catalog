import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { PreviewPageClient } from './PreviewPageClient'

interface PreviewPageProps {
  params: {
    id: string
  }
}

export default async function PreviewPage({ params }: PreviewPageProps) {
  const { id } = params

  // Fetch catalogue data server-side
  const catalogue = await prisma.catalogue.findFirst({
    where: {
      id,
      // Allow both public catalogues and any catalogue for PDF generation
    },
    include: {
      products: {
        include: {
          category: true,
        },
        orderBy: {
          sortOrder: 'asc',
        },
      },
      categories: {
        orderBy: {
          sortOrder: 'asc',
        },
      },
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

  if (!catalogue) {
    notFound()
  }

  // Pass the catalogue data to the client component
  return <PreviewPageClient catalogue={catalogue} />
}
