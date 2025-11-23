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
import { UpgradePrompt } from '@/components/UpgradePrompt'
import { SubscriptionPlan } from '@prisma/client'
import { createClient } from '@/lib/supabase/client'

interface SharedUser {
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
  permission?: 'VIEW' | 'EDIT'
}

interface TeamManagementProps {
  catalogueId: string
  isOwner: boolean
}

export function TeamManagement({ catalogueId, isOwner }: TeamManagementProps) {
  const [team, setTeam] = useState<SharedUser[]>([])
  const [pendingInvitations, setPendingInvitations] = useState<
    PendingInvitation[]
  >([])
  const [activityLog, setActivityLog] = useState<ActivityLogEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isInviting, setIsInviting] = useState(false)
  const [showInviteDialog, setShowInviteDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [editingMember, setEditingMember] = useState<SharedUser | null>(null)
  const [inviteEmail, setInviteEmail] = useState('')
  const [invitePermission, setInvitePermission] = useState<'edit' | 'view'>(
    'edit'
  )
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false)
  const [emailError, setEmailError] = useState('')
  const [activeTab, setActiveTab] = useState('members')
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  const canInvite = true // All plans support catalogue sharing with unlimited collaborators

  // Load team data
  const loadTeamData = async () => {
    const CACHE_KEY = `catfy:team:${catalogueId}`
    const CACHE_TTL = 1000 * 60 * 5 // 5 minutes

    try {
      // Try session cache first (stale-while-revalidate)
      try {
        const raw = sessionStorage.getItem(CACHE_KEY)
        if (raw) {
          const parsed = JSON.parse(raw)
          if (parsed?._ts && Date.now() - parsed._ts < CACHE_TTL) {
            const data = parsed.data
            setTeam(data.team || [])
            setPendingInvitations(data.pendingInvitations || [])

            const apiActivityLog = data.activityLog || []
            if (apiActivityLog.length === 0 && (data.team || []).length > 0) {
              const owner = (data.team || []).find(
                (m: SharedUser) => m.role === 'OWNER'
              )
              if (owner) {
                setActivityLog([
                  {
                    id: 'sample-1',
                    action: 'Created catalogue',
                    performedBy: owner.id,
                    performedByName: owner.fullName || owner.email,
                    timestamp: new Date().toISOString(),
                    details: 'Catalogue sharing started',
                  },
                ])
              }
            } else {
              setActivityLog(apiActivityLog)
            }

            setIsLoading(false)

            // revalidate in background
            ;(async () => {
              try {
                const response = await fetch(
                  `/api/catalogues/${catalogueId}/team`
                )
                if (response.ok) {
                  const fresh = await response.json()
                  setTeam(fresh.team || [])
                  setPendingInvitations(fresh.pendingInvitations || [])

                  const freshActivity = fresh.activityLog || []
                  setActivityLog(freshActivity.length ? freshActivity : [])
                  try {
                    sessionStorage.setItem(
                      CACHE_KEY,
                      JSON.stringify({ _ts: Date.now(), data: fresh })
                    )
                  } catch (e) {}
                }
              } catch (e) {
                // ignore
              }
            })()

            return
          }
        }
      } catch (e) {
        // ignore cache errors
      }

      // No fresh cache - fetch normally
      const response = await fetch(`/api/catalogues/${catalogueId}/team`)
      if (!response.ok) {
        throw new Error('Failed to load team data')
      }
      const data = await response.json()
      setTeam(data.team || [])
      setPendingInvitations(data.pendingInvitations || [])

      const apiActivityLog = data.activityLog || []
      if (apiActivityLog.length === 0 && (data.team || []).length > 0) {
        const owner = (data.team || []).find(
          (m: SharedUser) => m.role === 'OWNER'
        )
        if (owner) {
          setActivityLog([
            {
              id: 'sample-1',
              action: 'Created catalogue',
              performedBy: owner.id,
              performedByName: owner.fullName || owner.email,
              timestamp: new Date().toISOString(),
              details: 'Team collaboration started',
            },
          ])
        }
      } else {
        setActivityLog(apiActivityLog)
      }

      try {
        sessionStorage.setItem(
          CACHE_KEY,
          JSON.stringify({ _ts: Date.now(), data })
        )
      } catch (e) {}
    } catch (error) {
      console.error('Error loading team data:', error)
      toast.error('Failed to load team data')
    } finally {
      setIsLoading(false)
    }
  }

  // Update member permission
  const updateMemberPermission = async (
    memberId: string,
    permission: 'ADMIN' | 'EDITOR' | 'VIEWER'
  ) => {
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
        targetUserName: member?.fullName || member?.email || 'Collaborator',
        timestamp: new Date().toISOString(),
        details: `Permission level updated to ${permission}`,
      }
      setActivityLog(prev => [newActivity, ...prev])

      toast.success('Permission updated successfully')
      try {
        sessionStorage.removeItem(`catfy:team:${catalogueId}`)
      } catch (e) {}
      loadTeamData()
    } catch (error) {
      console.error('Error updating permission:', error)
      toast.error('Failed to update permission')
    }
  }

  // Update member responsibility
  const updateMemberResponsibility = async (
    memberId: string,
    responsibility: string
  ) => {
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
        targetUserName: member?.fullName || member?.email || 'Collaborator',
        timestamp: new Date().toISOString(),
        details: responsibility,
      }
      setActivityLog(prev => [newActivity, ...prev])

      toast.success('Responsibility updated successfully')
      setShowEditDialog(false)
      setEditingMember(null)
      try {
        sessionStorage.removeItem(`catfy:team:${catalogueId}`)
      } catch (e) {}
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

    // Check if email already has access
    const existingMember = team.find(
      member => member.email.toLowerCase() === email.toLowerCase()
    )
    if (existingMember) {
      setEmailError('This email already has access')
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

    setEmailError('')

    setIsInviting(true)
    try {
      let response: Response
      // Use team endpoint for EDIT invites (preserves subscription/team limits)
      if (invitePermission === 'edit') {
        response = await fetch(`/api/catalogues/${catalogueId}/team`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        })
      } else {
        // Use share endpoint for VIEW invites
        response = await fetch(`/api/catalogues/${catalogueId}/share`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, permission: 'view' }),
        })
      }

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send invitation')
      }

      // Add activity log entry
      const newActivity: ActivityLogEntry = {
        id: Date.now().toString(),
        action:
          invitePermission === 'edit'
            ? 'Invited collaborator (edit)'
            : 'Invited viewer (view only)',
        performedBy: 'current-user-id',
        performedByName: 'You',
        targetUserName: email,
        timestamp: new Date().toISOString(),
        details: `Invitation sent to ${email}`,
      }
      setActivityLog(prev => [newActivity, ...prev])

      toast.success('Invitation sent successfully!')
      setInviteEmail('')
      setInvitePermission('edit')
      setShowInviteDialog(false)
      try {
        sessionStorage.removeItem(`catfy:team:${catalogueId}`)
      } catch (e) {}
      loadTeamData() // Refresh data
    } catch (error: any) {
      console.error('Error sending invitation:', error)
      toast.error(error.message || 'Failed to send invitation')
    } finally {
      setIsInviting(false)
    }
  }

  // Remove collaborator
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
        throw new Error(data.error || 'Failed to remove collaborator')
      }

      // Add activity log entry
      const newActivity: ActivityLogEntry = {
        id: Date.now().toString(),
        action: 'Removed collaborator',
        performedBy: 'current-user-id',
        performedByName: 'You',
        targetUser: memberId,
        targetUserName: member?.fullName || member?.email || 'Collaborator',
        timestamp: new Date().toISOString(),
        details: `Removed ${member?.fullName || member?.email} from catalogue`,
      }
      setActivityLog(prev => [newActivity, ...prev])

      toast.success('Collaborator removed successfully')
      try {
        sessionStorage.removeItem(`catfy:team:${catalogueId}`)
      } catch (e) {}
      loadTeamData() // Refresh data
    } catch (error: any) {
      console.error('Error removing collaborator:', error)
      toast.error(error.message || 'Failed to remove collaborator')
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
      try {
        sessionStorage.removeItem(`catfy:team:${catalogueId}`)
      } catch (e) {}
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
      try {
        sessionStorage.removeItem(`catfy:team:${catalogueId}`)
      } catch (e) {}
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
  const getMemberDisplayName = (member: SharedUser) => {
    if (member.fullName) return member.fullName
    if (member.firstName && member.lastName)
      return `${member.firstName} ${member.lastName}`
    if (member.firstName) return member.firstName
    return member.email
  }

  // Get member initials
  const getMemberInitials = (member: SharedUser) => {
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
      const {
        data: { user },
      } = await supabase.auth.getUser()
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
            Catalogue Sharing
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
                Catalogue Sharing
                {isActualOwner && (
                  <Badge
                    variant="secondary"
                    className="ml-2 bg-purple-600 text-white hover:bg-purple-600 hover:text-white"
                  >
                    <Crown className="mr-1 h-3 w-3" />
                    You are the Owner
                  </Badge>
                )}
                {!isActualOwner && currentUserMember && (
                  <Badge
                    variant="secondary"
                    className="ml-2 bg-blue-600 text-white hover:bg-blue-600 hover:text-white"
                  >
                    Collaborator
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                {isActualOwner
                  ? 'Manage shared users and their permissions'
                  : 'View collaborators on this catalogue'}
                {canInvite && isActualOwner && (
                  <span className="mt-1 block text-sm">
                    {team.filter(m => m.role === 'MEMBER').length} collaborators
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
                Invite Collaborator
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Info for non-owners */}
          {!isActualOwner && currentUserMember && (
            <Alert className="border-blue-200 bg-blue-50">
              <Users className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                You have access to this catalogue. Only the owner can invite or
                remove collaborators.
              </AlertDescription>
            </Alert>
          )}

          {/* Tabs for Shared Users and Activity Log */}
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 rounded-xl bg-gradient-to-r from-gray-100 to-gray-50 p-1">
              <TabsTrigger
                value="members"
                className="flex items-center gap-2 rounded-lg transition-all data-[state=active]:bg-white data-[state=active]:shadow-md"
              >
                <Users className="h-4 w-4" />
                <span className="font-medium">Shared Users</span>
              </TabsTrigger>
              <TabsTrigger
                value="activity"
                className="flex items-center gap-2 rounded-lg transition-all data-[state=active]:bg-white data-[state=active]:shadow-md"
              >
                <Activity className="h-4 w-4" />
                <span className="font-medium">Activity Log</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="members" className="mt-8 space-y-6">
              {/* Shared Users */}
              <div>
                <div className="mb-6 flex items-center justify-between">
                  <h3 className="flex items-center gap-2 text-xl font-semibold text-gray-900">
                    <div className="h-8 w-1 rounded-full bg-gradient-to-b from-blue-600 to-purple-600"></div>
                    Shared Users
                    <span className="ml-2 rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-600">
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
                        className={`group relative flex items-center justify-between rounded-xl border-2 p-5 transition-all duration-200 hover:shadow-lg ${
                          isCurrentUser
                            ? 'border-blue-300 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-sm'
                            : member.role === 'OWNER'
                              ? 'border-purple-300 bg-gradient-to-br from-purple-50 to-pink-50 shadow-sm'
                              : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center space-x-4">
                          <div className="relative">
                            <Avatar
                              className={`h-12 w-12 ${isCurrentUser ? 'ring-2 ring-blue-500 ring-offset-2' : ''}`}
                            >
                              <AvatarImage
                                src={member.avatarUrl || undefined}
                              />
                              <AvatarFallback className="text-base font-semibold">
                                {getMemberInitials(member)}
                              </AvatarFallback>
                            </Avatar>
                            {member.role === 'OWNER' && (
                              <div className="absolute -right-1 -top-1 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 p-1">
                                <Crown className="h-3 w-3 text-white" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="mb-1 flex flex-wrap items-center gap-2">
                              <p className="text-base font-semibold text-gray-900">
                                {getMemberDisplayName(member)}
                              </p>
                              {member.role === 'OWNER' && (
                                <Badge
                                  variant="secondary"
                                  className="flex items-center gap-1 border-0 bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-sm"
                                >
                                  <Crown className="h-3 w-3" />
                                  Owner
                                </Badge>
                              )}
                              {isCurrentUser && (
                                <Badge
                                  variant="default"
                                  className="flex items-center gap-1 border-0 bg-gradient-to-r from-blue-600 to-indigo-600 shadow-sm"
                                >
                                  You
                                </Badge>
                              )}
                              {member.permission && (
                                <Badge
                                  variant="outline"
                                  className={`flex items-center gap-1 font-medium ${
                                    member.permission === 'ADMIN'
                                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                                      : member.permission === 'EDITOR'
                                        ? 'border-green-500 bg-green-50 text-green-700'
                                        : 'border-gray-400 bg-gray-50 text-gray-700'
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
                            <p className="text-sm font-medium text-gray-600">
                              {member.email}
                            </p>
                            {member.responsibility && (
                              <div className="mt-2 flex items-start gap-2">
                                <div className="mt-0.5 h-4 w-4 text-gray-400">
                                  <Edit2 className="h-3.5 w-3.5" />
                                </div>
                                <p className="text-sm italic text-gray-600">
                                  {member.responsibility}
                                </p>
                              </div>
                            )}
                            <p className="mt-2 flex items-center gap-1 text-xs text-gray-500">
                              <Clock className="h-3 w-3" />
                              Joined{' '}
                              {new Date(member.joinedAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        {isActualOwner && member.role === 'MEMBER' && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="opacity-0 transition-opacity group-hover:opacity-100"
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
                                Edit Collaborator
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => removeMember(member.id)}
                                className="cursor-pointer text-red-600 focus:text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Remove access
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
                    <div className="mb-6 flex items-center gap-2">
                      <div className="h-8 w-1 rounded-full bg-gradient-to-b from-yellow-500 to-orange-500"></div>
                      <h3 className="text-xl font-semibold text-gray-900">
                        Pending Invitations
                      </h3>
                      <span className="rounded-full bg-yellow-100 px-3 py-1 text-sm font-medium text-yellow-700">
                        {pendingInvitations.length}
                      </span>
                    </div>
                    <div className="space-y-4">
                      {pendingInvitations.map(invitation => (
                        <div
                          key={invitation.id}
                          className="group flex items-center justify-between rounded-xl border-2 border-yellow-200 bg-gradient-to-br from-yellow-50 to-orange-50 p-5 transition-all hover:border-yellow-300 hover:shadow-lg"
                        >
                          <div className="flex items-center space-x-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-yellow-400 to-orange-400 shadow-md">
                              <Mail className="h-6 w-6 text-white" />
                            </div>
                            <div>
                              <p className="text-base font-semibold text-gray-900">
                                {invitation.email}
                              </p>
                              <div className="mt-1 flex items-center gap-3 text-sm text-gray-600">
                                {invitation.permission && (
                                  <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-700">
                                    {invitation.permission === 'EDIT'
                                      ? 'Edit'
                                      : 'View'}
                                  </span>
                                )}
                                <span className="flex items-center gap-1">
                                  <Send className="h-3.5 w-3.5" />
                                  Invited{' '}
                                  {new Date(
                                    invitation.createdAt
                                  ).toLocaleDateString()}
                                </span>
                                <span className="text-gray-400">•</span>
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3.5 w-3.5" />
                                  Expires{' '}
                                  {new Date(
                                    invitation.expiresAt
                                  ).toLocaleDateString()}
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
                                className="border-blue-300 text-blue-600 transition-colors hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700"
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
                                    onClick={() =>
                                      cancelInvitation(invitation.id)
                                    }
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
              <div className="mb-6 flex items-center gap-2">
                <div className="h-8 w-1 rounded-full bg-gradient-to-b from-green-500 to-teal-500"></div>
                <h3 className="text-xl font-semibold text-gray-900">
                  Activity Timeline
                </h3>
                {activityLog.length > 0 && (
                  <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-600">
                    {activityLog.length}
                  </span>
                )}
              </div>

              <div className="space-y-4">
                {activityLog.length === 0 ? (
                  <div className="rounded-xl border-2 border-dashed border-gray-300 bg-gradient-to-br from-gray-50 to-gray-100 py-16 text-center">
                    <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-gray-200">
                      <Activity className="h-8 w-8 text-gray-400" />
                    </div>
                    <p className="text-lg font-medium text-gray-600">
                      No activity recorded yet
                    </p>
                    <p className="mt-2 text-sm text-gray-500">
                      Catalogue sharing actions will appear here
                    </p>
                  </div>
                ) : (
                  <div className="relative">
                    {/* Timeline line */}
                    <div className="absolute bottom-0 left-6 top-0 w-0.5 bg-gradient-to-b from-gray-200 via-gray-300 to-gray-200"></div>

                    <div className="space-y-6">
                      {activityLog.map((log, index) => (
                        <div
                          key={index}
                          className="group relative flex items-start gap-4"
                        >
                          {/* Icon */}
                          <div
                            className={`relative z-10 flex h-12 w-12 items-center justify-center rounded-full shadow-lg transition-transform group-hover:scale-110 ${
                              log.action.includes('permission')
                                ? 'bg-gradient-to-br from-blue-500 to-blue-600'
                                : log.action.includes('responsibility')
                                  ? 'bg-gradient-to-br from-green-500 to-green-600'
                                  : log.action.includes('Invited') ||
                                      log.action.includes('added')
                                    ? 'bg-gradient-to-br from-purple-500 to-purple-600'
                                    : 'bg-gradient-to-br from-red-500 to-red-600'
                            }`}
                          >
                            {log.action.includes('permission') ? (
                              <Shield className="h-5 w-5 text-white" />
                            ) : log.action.includes('responsibility') ? (
                              <Edit2 className="h-5 w-5 text-white" />
                            ) : log.action.includes('Invited') ||
                              log.action.includes('added') ? (
                              <UserPlus className="h-5 w-5 text-white" />
                            ) : (
                              <UserMinus className="h-5 w-5 text-white" />
                            )}
                          </div>

                          {/* Content */}
                          <div className="flex-1 rounded-xl border-2 border-gray-200 bg-white p-5 shadow-sm transition-all group-hover:border-gray-300 group-hover:shadow-md">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <p className="mb-1 text-base font-semibold text-gray-900">
                                  {log.action}
                                </p>
                                <div className="mb-2 flex items-center gap-2 text-sm text-gray-600">
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
                                  <div className="mt-2 rounded-lg border border-gray-200 bg-gray-50 p-3">
                                    <p className="text-sm italic text-gray-700">
                                      {log.details}
                                    </p>
                                  </div>
                                )}
                              </div>

                              <div className="flex flex-col items-end gap-1">
                                <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-500">
                                  {new Date(log.timestamp).toLocaleDateString()}
                                </span>
                                <span className="text-xs text-gray-400">
                                  {new Date(log.timestamp).toLocaleTimeString(
                                    [],
                                    { hour: '2-digit', minute: '2-digit' }
                                  )}
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
            <DialogTitle>Invite Collaborator</DialogTitle>
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
            <div>
              <Label htmlFor="invitePermission">Permission</Label>
              <div className="mt-2 flex items-center gap-2">
                <select
                  id="invitePermission"
                  value={invitePermission}
                  onChange={e =>
                    setInvitePermission(e.target.value as 'edit' | 'view')
                  }
                  className="rounded border px-2 py-1 text-sm"
                >
                  <option value="edit">Edit (collaborator)</option>
                  <option value="view">View (read-only)</option>
                </select>
                <p className="text-xs text-gray-500">
                  Choose whether the invitee can edit or only view.
                </p>
              </div>
            </div>
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
              disabled={isInviting || !inviteEmail.trim()}
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
            <DialogTitle>Edit Collaborator</DialogTitle>
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
                      responsibility: e.target.value,
                    })
                  }
                  placeholder="e.g., Product Photography, Content Writing, Quality Control"
                  rows={3}
                  className="resize-none"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Describe this member&apos;s role and responsibilities
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
                  toast.error('Failed to update collaborator')
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
        feature="catalogue sharing"
        currentPlan={SubscriptionPlan.FREE}
      />
    </>
  )
}
