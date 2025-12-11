import { Skeleton } from '@/components/ui/skeleton'

export default function AnalyticsLoading() {
    return (
        <div className="flex min-h-screen bg-gradient-to-br from-blue-50 via-pink-50 to-blue-50">
            <div className="ml-20 flex-1 p-8">
                <Skeleton className="mb-6 h-10 w-64" />
                <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-4">
                    {[...Array(4)].map((_, i) => (
                        <Skeleton key={i} className="h-32" />
                    ))}
                </div>
                <Skeleton className="mb-6 h-96" />
                <Skeleton className="h-64" />
            </div>
        </div>
    )
}
