'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Users,
  UserPlus,
  UserMinus,
  Mail,
  MoreVertical,
  Trash2,
  Crown,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Copy,
  Send,
  Loader2,
  Shield,
  Edit2,
  Activity,
  Eye,
  FileEdit,
  Settings,
  UserCog,
} from 'lucide-react'
import { toast } from 'sonner'
import { useSubscription } from '@/contexts/SubscriptionContext'
import { UpgradePrompt } from '@/components/UpgradePrompt'
import { createClient } from '@/lib/supabase/client'
import {
  canInviteTeamMembers,
  getMaxTeamMembers,
  canAddTeamMember,
  getTeamMemberUpgradeMessage,
} from '@/lib/subscription'

interface TeamMember {
  id: string
  email: string
  fullName: string | null
  firstName: string | null
  lastName: string | null
  avatarUrl: string | null
  role: 'OWNER' | 'MEMBER'
  permission?: 'ADMIN' | 'EDITOR' | 'VIEWER'
  responsibility?: string
  joinedAt: string
}

interface ActivityLogEntry {
  id: string
  action: string
  performedBy: string
  performedByName: string
  targetUser?: string
  targetUserName?: string
  timestamp: string
  details?: string
}

interface PendingInvitation {
  id: string
  email: string
  status: 'PENDING'
  createdAt: string
  expiresAt: string
  token?: string
}

interface TeamManagementProps {
  catalogueId: string
  isOwner: boolean
}

export function TeamManagement({ catalogueId, isOwner }: TeamManagementProps) {
  const [team, setTeam] = useState<TeamMember[]>([])
  const [pendingInvitations, setPendingInvitations] = useState<
    PendingInvitation[]
  >([])
  const [activityLog, setActivityLog] = useState<ActivityLogEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isInviting, setIsInviting] = useState(false)
  const [showInviteDialog, setShowInviteDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null)
  const [inviteEmail, setInviteEmail] = useState('')
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false)
  const [emailError, setEmailError] = useState('')
  const [activeTab, setActiveTab] = useState('members')
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const { currentPlan } = useSubscription()
  const maxTeamMembers = getMaxTeamMembers(currentPlan)
  const currentTeamCount = team.filter(
    member => member.role === 'MEMBER'
  ).length
  const canInvite = true // All plans now support team collaboration
  const canAddMore = canAddTeamMember(currentPlan, currentTeamCount)

  // Load team data
  const loadTeamData = async () => {
    try {
      const response = await fetch(`/api/catalogues/${catalogueId}/team`)
      if (!response.ok) {
        throw new Error('Failed to load team data')
      }
      const data = await response.json()
      setTeam(data.team || [])
      setPendingInvitations(data.pendingInvitations || [])

      // Set activity log from API or use sample data if empty
      const apiActivityLog = data.activityLog || []
      if (apiActivityLog.length === 0 && (data.team || []).length > 0) {
        // Add sample activity log entry for demonstration
        const owner = (data.team || []).find((m: TeamMember) => m.role === 'OWNER')
        if (owner) {
          setActivityLog([
            {
              id: 'sample-1',
              action: 'Created catalogue',
              performedBy: owner.id,
              performedByName: owner.fullName || owner.email,
              timestamp: new Date().toISOString(),
              details: 'Team collaboration started'
            }
          ])
        }
      } else {
        setActivityLog(apiActivityLog)
      }
    } catch (error) {
      console.error('Error loading team data:', error)
      toast.error('Failed to load team data')
    } finally {
      setIsLoading(false)
    }
  }

  // Update member permission
  const updateMemberPermission = async (memberId: string, permission: 'ADMIN' | 'EDITOR' | 'VIEWER') => {
    try {
      const member = team.find(m => m.id === memberId)
      const response = await fetch(
        `/api/catalogues/${catalogueId}/team/permission`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ memberId, permission }),
        }
      )

      if (!response.ok) {
        throw new Error('Failed to update permission')
      }

      // Add activity log entry
      const newActivity: ActivityLogEntry = {
        id: Date.now().toString(),
        action: `Changed permission to ${permission}`,
        performedBy: 'current-user-id',
        performedByName: 'You',
        targetUser: memberId,
        targetUserName: member?.fullName || member?.email || 'Team member',
        timestamp: new Date().toISOString(),
        details: `Permission level updated to ${permission}`
      }
      setActivityLog(prev => [newActivity, ...prev])

      toast.success('Permission updated successfully')
      loadTeamData()
    } catch (error) {
      console.error('Error updating permission:', error)
      toast.error('Failed to update permission')
    }
  }

  // Update member responsibility
  const updateMemberResponsibility = async (memberId: string, responsibility: string) => {
    try {
      const member = team.find(m => m.id === memberId)
      const response = await fetch(
        `/api/catalogues/${catalogueId}/team/responsibility`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ memberId, responsibility }),
        }
      )

      if (!response.ok) {
        throw new Error('Failed to update responsibility')
      }

      // Add activity log entry
      const newActivity: ActivityLogEntry = {
        id: Date.now().toString(),
        action: 'Updated responsibility',
        performedBy: 'current-user-id',
        performedByName: 'You',
        targetUser: memberId,
        targetUserName: member?.fullName || member?.email || 'Team member',
        timestamp: new Date().toISOString(),
        details: responsibility
      }
      setActivityLog(prev => [newActivity, ...prev])

      toast.success('Responsibility updated successfully')
      setShowEditDialog(false)
      setEditingMember(null)
      loadTeamData()
    } catch (error) {
      console.error('Error updating responsibility:', error)
      toast.error('Failed to update responsibility')
    }
  }

  // Validate email
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // Send invitation
  const sendInvitation = async () => {
    const email = inviteEmail.trim()

    if (!email) {
      setEmailError('Please enter an email address')
      return
    }

    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address')
      return
    }

    // Check if email is already a team member
    const existingMember = team.find(
      member => member.email.toLowerCase() === email.toLowerCase()
    )
    if (existingMember) {
      setEmailError('This email is already a team member')
      return
    }

    // Check if email already has a pending invitation
    const existingInvitation = pendingInvitations.find(
      inv => inv.email.toLowerCase() === email.toLowerCase()
    )
    if (existingInvitation) {
      setEmailError('An invitation has already been sent to this email')
      return
    }

    if (!canAddMore) {
      setEmailError(
        `You have reached the maximum team member limit (${maxTeamMembers}) for your ${currentPlan} plan.`
      )
      return
    }

    setEmailError('')

    setIsInviting(true)
    try {
      const response = await fetch(`/api/catalogues/${catalogueId}/team`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send invitation')
      }

      // Add activity log entry
      const newActivity: ActivityLogEntry = {
        id: Date.now().toString(),
        action: 'Invited new member',
        performedBy: 'current-user-id',
        performedByName: 'You',
        targetUserName: email,
        timestamp: new Date().toISOString(),
        details: `Invitation sent to ${email}`
      }
      setActivityLog(prev => [newActivity, ...prev])

      toast.success('Invitation sent successfully!')
      setInviteEmail('')
      setShowInviteDialog(false)
      loadTeamData() // Refresh data
    } catch (error: any) {
      console.error('Error sending invitation:', error)
      toast.error(error.message || 'Failed to send invitation')
    } finally {
      setIsInviting(false)
    }
  }

  // Remove team member
  const removeMember = async (memberId: string) => {
    try {
      const member = team.find(m => m.id === memberId)
      const response = await fetch(
        `/api/catalogues/${catalogueId}/team?memberId=${memberId}`,
        {
          method: 'DELETE',
        }
      )

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to remove team member')
      }

      // Add activity log entry
      const newActivity: ActivityLogEntry = {
        id: Date.now().toString(),
        action: 'Removed team member',
        performedBy: 'current-user-id',
        performedByName: 'You',
        targetUser: memberId,
        targetUserName: member?.fullName || member?.email || 'Team member',
        timestamp: new Date().toISOString(),
        details: `Removed ${member?.fullName || member?.email} from team`
      }
      setActivityLog(prev => [newActivity, ...prev])

      toast.success('Team member removed successfully')
      loadTeamData() // Refresh data
    } catch (error: any) {
      console.error('Error removing team member:', error)
      toast.error(error.message || 'Failed to remove team member')
    }
  }

  // Cancel invitation
  const cancelInvitation = async (invitationId: string) => {
    try {
      const response = await fetch(`/api/invitations/${invitationId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to cancel invitation')
      }

      toast.success('Invitation cancelled successfully')
      loadTeamData() // Refresh data
    } catch (error: any) {
      console.error('Error cancelling invitation:', error)
      toast.error(error.message || 'Failed to cancel invitation')
    }
  }

  // Resend invitation
  const resendInvitation = async (email: string) => {
    setIsInviting(true)
    try {
      const response = await fetch(`/api/catalogues/${catalogueId}/team`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to resend invitation')
      }

      toast.success('Invitation resent successfully!')
      loadTeamData() // Refresh data
    } catch (error: any) {
      console.error('Error resending invitation:', error)
      toast.error(error.message || 'Failed to resend invitation')
    } finally {
      setIsInviting(false)
    }
  }

  // Copy invitation link
  const copyInvitationLink = async (invitation: PendingInvitation) => {
    try {
      // Use the token from invitation data if available, otherwise fetch it
      let token = invitation.token
      if (!token) {
        const response = await fetch(`/api/invitations/${invitation.id}/token`)
        if (!response.ok) {
          throw new Error('Failed to get invitation token')
        }
        const data = await response.json()
        token = data.token
      }
      const invitationLink = `${window.location.origin}/invitations/accept?token=${token}`
      await navigator.clipboard.writeText(invitationLink)
      toast.success('Invitation link copied to clipboard!')
    } catch (error) {
      toast.error('Failed to copy invitation link')
    }
  }

  // Get member display name
  const getMemberDisplayName = (member: TeamMember) => {
    if (member.fullName) return member.fullName
    if (member.firstName && member.lastName)
      return `${member.firstName} ${member.lastName}`
    if (member.firstName) return member.firstName
    return member.email
  }

  // Get member initials
  const getMemberInitials = (member: TeamMember) => {
    if (member.firstName && member.lastName) {
      return `${member.firstName[0]}${member.lastName[0]}`.toUpperCase()
    }
    if (member.fullName) {
      const names = member.fullName.split(' ')
      return names.length > 1
        ? `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase()
        : names[0][0].toUpperCase()
    }
    return member.email[0].toUpperCase()
  }

  useEffect(() => {
    loadTeamData()
  }, [catalogueId])

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setCurrentUserId(user.id)
      }
    }
    fetchCurrentUser()
  }, [])

  // Determine if current user is the actual owner based on team data
  const currentUserMember = team.find(member => member.id === currentUserId)
  const isActualOwner = currentUserMember?.role === 'OWNER'

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Team Management
          </CardTitle>
          <CardDescription>Loading team data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div
                key={i}
                className="flex animate-pulse items-center space-x-3"
              >
                <div className="h-10 w-10 rounded-full bg-gray-200" />
                <div className="flex-1">
                  <div className="mb-2 h-4 w-1/3 rounded bg-gray-200" />
                  <div className="h-3 w-1/2 rounded bg-gray-200" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Team Management
                {isActualOwner && (
                  <Badge variant="secondary" className="ml-2 bg-purple-600 text-white">
                    <Crown className="h-3 w-3 mr-1" />
                    You are the Owner
                  </Badge>
                )}
                {!isActualOwner && currentUserMember && (
                  <Badge variant="secondary" className="ml-2 bg-blue-600 text-white">
                    Team Member
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                {isActualOwner
                  ? 'Manage your team members and their permissions'
                  : 'View team members on this catalogue'}
                {canInvite && isActualOwner && (
                  <span className="mt-1 block text-sm">
                    {currentTeamCount} of{' '}
                    {maxTeamMembers === -1 ? '∞' : maxTeamMembers} team members
                  </span>
                )}
              </CardDescription>
            </div>
            {isActualOwner && (
              <Button
                onClick={() => setShowInviteDialog(true)}
                className="flex items-center gap-2 bg-gradient-to-r from-[#6366F1] to-[#2D1B69]"
              >
                <UserPlus className="h-4 w-4" />
                Invite Member
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">


          {/* Team member limit notice */}
          {!canAddMore && isActualOwner && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                You have reached the maximum team member limit ({maxTeamMembers}
                ) for your {currentPlan} plan.
              </AlertDescription>
            </Alert>
          )}

          {/* Tabs for Team Members and Activity Log */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-gradient-to-r from-gray-100 to-gray-50 p-1 rounded-xl">
              <TabsTrigger
                value="members"
                className="flex items-center gap-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-md transition-all"
              >
                <Users className="h-4 w-4" />
                <span className="font-medium">Team Members</span>
              </TabsTrigger>
              <TabsTrigger
                value="activity"
                className="flex items-center gap-2 rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-md transition-all"
              >
                <Activity className="h-4 w-4" />
                <span className="font-medium">Activity Log</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="members" className="space-y-6 mt-8">
              {/* Team Members */}
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                    <div className="h-8 w-1 bg-gradient-to-b from-blue-600 to-purple-600 rounded-full"></div>
                    Team Members
                    <span className="ml-2 px-3 py-1 bg-gray-100 text-gray-600 text-sm font-medium rounded-full">
                      {team.length}
                    </span>
                  </h3>
                </div>
                <div className="space-y-4">
                  {team.map(member => {
                    const isCurrentUser = member.id === currentUserId
                    return (
                      <div
                        key={member.id}
                        className={`group relative flex items-center justify-between rounded-xl border-2 p-5 transition-all duration-200 hover:shadow-lg ${isCurrentUser
                            ? 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-300 shadow-sm'
                            : member.role === 'OWNER'
                              ? 'bg-gradient-to-br from-purple-50 to-pink-50 border-purple-300 shadow-sm'
                              : 'bg-white border-gray-200 hover:border-gray-300'
                          }`}
                      >
                        <div className="flex items-center space-x-4">
                          <div className="relative">
                            <Avatar className={`h-12 w-12 ${isCurrentUser ? 'ring-2 ring-blue-500 ring-offset-2' : ''}`}>
                              <AvatarImage src={member.avatarUrl || undefined} />
                              <AvatarFallback className="text-base font-semibold">
                                {getMemberInitials(member)}
                              </AvatarFallback>
                            </Avatar>
                            {member.role === 'OWNER' && (
                              <div className="absolute -top-1 -right-1 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full p-1">
                                <Crown className="h-3 w-3 text-white" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <p className="font-semibold text-gray-900 text-base">
                                {getMemberDisplayName(member)}
                              </p>
                              {member.role === 'OWNER' && (
                                <Badge
                                  variant="secondary"
                                  className="flex items-center gap-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0 shadow-sm"
                                >
                                  <Crown className="h-3 w-3" />
                                  Owner
                                </Badge>
                              )}
                              {isCurrentUser && (
                                <Badge
                                  variant="default"
                                  className="flex items-center gap-1 bg-gradient-to-r from-blue-600 to-indigo-600 border-0 shadow-sm"
                                >
                                  You
                                </Badge>
                              )}
                              {member.permission && (
                                <Badge
                                  variant="outline"
                                  className={`flex items-center gap-1 font-medium ${member.permission === 'ADMIN'
                                      ? 'border-blue-500 text-blue-700 bg-blue-50'
                                      : member.permission === 'EDITOR'
                                        ? 'border-green-500 text-green-700 bg-green-50'
                                        : 'border-gray-400 text-gray-700 bg-gray-50'
                                    }`}
                                >
                                  {member.permission === 'ADMIN' ? (
                                    <Shield className="h-3 w-3" />
                                  ) : member.permission === 'EDITOR' ? (
                                    <FileEdit className="h-3 w-3" />
                                  ) : (
                                    <Eye className="h-3 w-3" />
                                  )}
                                  {member.permission}
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 font-medium">{member.email}</p>
                            {member.responsibility && (
                              <div className="mt-2 flex items-start gap-2">
                                <div className="mt-0.5 h-4 w-4 text-gray-400">
                                  <Edit2 className="h-3.5 w-3.5" />
                                </div>
                                <p className="text-sm text-gray-600 italic">
                                  {member.responsibility}
                                </p>
                              </div>
                            )}
                            <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              Joined {new Date(member.joinedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        {isActualOwner && member.role === 'MEMBER' && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                              <DropdownMenuItem
                                onClick={() => {
                                  setEditingMember(member)
                                  setShowEditDialog(true)
                                }}
                                className="cursor-pointer"
                              >
                                <UserCog className="mr-2 h-4 w-4" />
                                Edit Member
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => removeMember(member.id)}
                                className="text-red-600 focus:text-red-600 cursor-pointer"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Remove from team
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Pending Invitations - Only visible to owner */}
              {isActualOwner && pendingInvitations.length > 0 && (
                <>
                  <Separator className="my-8" />
                  <div>
                    <div className="flex items-center gap-2 mb-6">
                      <div className="h-8 w-1 bg-gradient-to-b from-yellow-500 to-orange-500 rounded-full"></div>
                      <h3 className="text-xl font-semibold text-gray-900">
                        Pending Invitations
                      </h3>
                      <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-sm font-medium rounded-full">
                        {pendingInvitations.length}
                      </span>
                    </div>
                    <div className="space-y-4">
                      {pendingInvitations.map(invitation => (
                        <div
                          key={invitation.id}
                          className="group flex items-center justify-between rounded-xl border-2 border-yellow-200 bg-gradient-to-br from-yellow-50 to-orange-50 p-5 transition-all hover:shadow-lg hover:border-yellow-300"
                        >
                          <div className="flex items-center space-x-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-orange-400 shadow-md">
                              <Mail className="h-6 w-6 text-white" />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900 text-base">{invitation.email}</p>
                              <div className="flex items-center gap-3 text-sm text-gray-600 mt-1">
                                <span className="flex items-center gap-1">
                                  <Send className="h-3.5 w-3.5" />
                                  Invited {new Date(invitation.createdAt).toLocaleDateString()}
                                </span>
                                <span className="text-gray-400">•</span>
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3.5 w-3.5" />
                                  Expires {new Date(invitation.expiresAt).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                          {isActualOwner && (
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => copyInvitationLink(invitation)}
                                className="border-blue-300 text-blue-600 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-400 transition-colors"
                              >
                                <Copy className="mr-2 h-4 w-4" />
                                Copy Link
                              </Button>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={() =>
                                      resendInvitation(invitation.email)
                                    }
                                    disabled={isInviting}
                                  >
                                    <Send className="mr-2 h-4 w-4" />
                                    Resend Invitation
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => cancelInvitation(invitation.id)}
                                    className="text-red-600 focus:text-red-600"
                                  >
                                    <XCircle className="mr-2 h-4 w-4" />
                                    Cancel Invitation
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </TabsContent>

            {/* Activity Log Tab */}
            <TabsContent value="activity" className="mt-8">
              <div className="flex items-center gap-2 mb-6">
                <div className="h-8 w-1 bg-gradient-to-b from-green-500 to-teal-500 rounded-full"></div>
                <h3 className="text-xl font-semibold text-gray-900">
                  Activity Timeline
                </h3>
                {activityLog.length > 0 && (
                  <span className="px-3 py-1 bg-gray-100 text-gray-600 text-sm font-medium rounded-full">
                    {activityLog.length}
                  </span>
                )}
              </div>

              <div className="space-y-4">
                {activityLog.length === 0 ? (
                  <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-dashed border-gray-300">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-200 mb-4">
                      <Activity className="h-8 w-8 text-gray-400" />
                    </div>
                    <p className="text-gray-600 font-medium text-lg">No activity recorded yet</p>
                    <p className="text-gray-500 text-sm mt-2">Team actions will appear here</p>
                  </div>
                ) : (
                  <div className="relative">
                    {/* Timeline line */}
                    <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-gray-200 via-gray-300 to-gray-200"></div>

                    <div className="space-y-6">
                      {activityLog.map((log, index) => (
                        <div
                          key={index}
                          className="relative flex items-start gap-4 group"
                        >
                          {/* Icon */}
                          <div className={`relative z-10 flex items-center justify-center w-12 h-12 rounded-full shadow-lg transition-transform group-hover:scale-110 ${log.action.includes('permission')
                              ? 'bg-gradient-to-br from-blue-500 to-blue-600'
                              : log.action.includes('responsibility')
                                ? 'bg-gradient-to-br from-green-500 to-green-600'
                                : log.action.includes('Invited') || log.action.includes('added')
                                  ? 'bg-gradient-to-br from-purple-500 to-purple-600'
                                  : 'bg-gradient-to-br from-red-500 to-red-600'
                            }`}>
                            {log.action.includes('permission') ? (
                              <Shield className="h-5 w-5 text-white" />
                            ) : log.action.includes('responsibility') ? (
                              <Edit2 className="h-5 w-5 text-white" />
                            ) : log.action.includes('Invited') || log.action.includes('added') ? (
                              <UserPlus className="h-5 w-5 text-white" />
                            ) : (
                              <UserMinus className="h-5 w-5 text-white" />
                            )}
                          </div>

                          {/* Content */}
                          <div className="flex-1 bg-white rounded-xl border-2 border-gray-200 p-5 shadow-sm transition-all group-hover:shadow-md group-hover:border-gray-300">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <p className="font-semibold text-gray-900 text-base mb-1">
                                  {log.action}
                                </p>
                                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                                  <span className="font-medium text-gray-700">
                                    {log.performedByName}
                                  </span>
                                  {log.targetUserName && (
                                    <>
                                      <span className="text-gray-400">→</span>
                                      <span className="font-medium text-gray-700">
                                        {log.targetUserName}
                                      </span>
                                    </>
                                  )}
                                </div>
                                {log.details && (
                                  <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                    <p className="text-sm text-gray-700 italic">
                                      {log.details}
                                    </p>
                                  </div>
                                )}
                              </div>

                              <div className="flex flex-col items-end gap-1">
                                <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                                  {new Date(log.timestamp).toLocaleDateString()}
                                </span>
                                <span className="text-xs text-gray-400">
                                  {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Invite Dialog */}
      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Team Member</DialogTitle>
            <DialogDescription>
              Send an invitation to collaborate on this catalogue. They will
              receive an email with instructions to join.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="inviteEmail">Email Address</Label>
              <Input
                id="inviteEmail"
                type="email"
                value={inviteEmail}
                onChange={e => {
                  setInviteEmail(e.target.value)
                  if (emailError) setEmailError('')
                }}
                placeholder="colleague@company.com"
                className={
                  emailError ? 'border-red-500 focus:border-red-500' : ''
                }
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    sendInvitation()
                  }
                }}
              />
              {emailError && (
                <p className="mt-1 text-sm text-red-600">{emailError}</p>
              )}
            </div>
            {!canAddMore && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  You have reached the maximum team member limit (
                  {maxTeamMembers}) for your {currentPlan} plan.
                </AlertDescription>
              </Alert>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowInviteDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={sendInvitation}
              disabled={isInviting || !canAddMore || !inviteEmail.trim()}
              className="flex items-center gap-2"
            >
              {isInviting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Send Invitation
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Member Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Team Member</DialogTitle>
            <DialogDescription>
              Update permissions and responsibilities for{' '}
              {editingMember?.fullName || editingMember?.email}
            </DialogDescription>
          </DialogHeader>
          {editingMember && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="permission">Permission Level</Label>
                <Select
                  value={editingMember.permission || 'VIEWER'}
                  onValueChange={(value: 'ADMIN' | 'EDITOR' | 'VIEWER') => {
                    setEditingMember({ ...editingMember, permission: value })
                  }}
                >
                  <SelectTrigger id="permission">
                    <SelectValue placeholder="Select permission" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ADMIN">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-blue-500" />
                        <div>
                          <div className="font-medium">Admin</div>
                          <div className="text-xs text-muted-foreground">
                            Full access to manage team and content
                          </div>
                        </div>
                      </div>
                    </SelectItem>
                    <SelectItem value="EDITOR">
                      <div className="flex items-center gap-2">
                        <FileEdit className="h-4 w-4 text-green-500" />
                        <div>
                          <div className="font-medium">Editor</div>
                          <div className="text-xs text-muted-foreground">
                            Can edit and manage content
                          </div>
                        </div>
                      </div>
                    </SelectItem>
                    <SelectItem value="VIEWER">
                      <div className="flex items-center gap-2">
                        <Eye className="h-4 w-4 text-gray-500" />
                        <div>
                          <div className="font-medium">Viewer</div>
                          <div className="text-xs text-muted-foreground">
                            View-only access
                          </div>
                        </div>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="responsibility">Responsibility</Label>
                <Textarea
                  id="responsibility"
                  value={editingMember.responsibility || ''}
                  onChange={e =>
                    setEditingMember({
                      ...editingMember,
                      responsibility: e.target.value
                    })
                  }
                  placeholder="e.g., Product Photography, Content Writing, Quality Control"
                  rows={3}
                  className="resize-none"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Describe this member's role and responsibilities
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowEditDialog(false)
                setEditingMember(null)
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={async () => {
                if (!editingMember) return
                try {
                  if (editingMember.permission) {
                    await updateMemberPermission(
                      editingMember.id,
                      editingMember.permission
                    )
                  }
                  if (editingMember.responsibility !== undefined) {
                    await updateMemberResponsibility(
                      editingMember.id,
                      editingMember.responsibility
                    )
                  }
                  setShowEditDialog(false)
                  setEditingMember(null)
                  await loadTeamData()
                } catch (error) {
                  console.error('Failed to update member:', error)
                  toast.error('Failed to update team member')
                }
              }}
              className="flex items-center gap-2"
            >
              <Settings className="h-4 w-4" />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upgrade Prompt */}
      <UpgradePrompt
        isOpen={showUpgradePrompt}
        onClose={() => setShowUpgradePrompt(false)}
        feature="team collaboration"
        currentPlan={currentPlan as any}
      />
    </>
  )
}
