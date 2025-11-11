import { LucideIcon } from 'lucide-react'

export interface ToolStat {
  label: string
  value: string | number
  icon?: LucideIcon
  color?: string
}

export interface ToolCard {
  id: string
  name: string
  description: string
  icon: LucideIcon
  color: string
  gradient: string
  route: string
  stats: ToolStat[]
  isActive: boolean
  isComingSoon?: boolean
  features: string[]
  badge?: {
    text: string
    variant: 'default' | 'secondary' | 'destructive' | 'outline'
  }
}

export interface DashboardStats {
  totalProjects: number
  activeTools: number
  totalGenerations: number
  lastActivity?: string
}

export interface RecentActivity {
  id: string
  type: 'CATALOGUE' | 'PDF' | 'EXPORT' | 'SHARE'
  title: string
  description?: string
  timestamp: string
  toolId: string
  metadata?: Record<string, any>
}
