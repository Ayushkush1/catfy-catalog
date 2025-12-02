import PlanSharingDashboard from '@/components/team/PlanSharingDashboard'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'

export default function DashboardTeamPage() {
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 via-pink-50 to-blue-50">
      <div className="ml-20 flex-1">
        <DashboardHeader
          title="Team Management"
          subtitle="Plan sharing and invites in one place"
        />
        <div className="p-8">
          <PlanSharingDashboard />
        </div>
      </div>
    </div>
  )
}
