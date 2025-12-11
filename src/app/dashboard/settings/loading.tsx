import { Skeleton } from '@/components/ui/skeleton'

export default function SettingsLoading() {
    return (
        <div className="flex min-h-screen bg-gradient-to-br from-blue-50 via-pink-50 to-blue-50">
            <div className="ml-20 flex-1 p-8">
                <Skeleton className="mb-6 h-10 w-64" />
                <div className="space-y-6">
                    <Skeleton className="h-96" />
                    <Skeleton className="h-64" />
                    <Skeleton className="h-48" />
                </div>
            </div>
        </div>
    )
}
