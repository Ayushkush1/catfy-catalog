'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import {
  Loader2,
  Sparkles,
  ShieldCheck,
  Users,
  Mail,
  Crown,
  Trash2,
  Clock,
  Copy,
  Send,
  XCircle,
  CheckCircle,
  UserPlus,
} from 'lucide-react'
import { useRouter } from 'next/navigation'

interface TeamMemberLite {
  id: string
  email: string
  fullName: string | null
  role: 'OWNER' | 'MEMBER'
  hasPremiumAccess?: boolean
}

interface PendingInvitationLite {
  id: string
  email: string
  status: 'PENDING'
  createdAt: string
  expiresAt: string
}

export default function PlanSharingDashboard() {
  const router = useRouter()
  const [defaultCatalogueId, setDefaultCatalogueId] = useState<string>('')
  const [team, setTeam] = useState<TeamMemberLite[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [enabled, setEnabled] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviting, setInviting] = useState(false)
  const [pendingInvitations, setPendingInvitations] = useState<
    PendingInvitationLite[]
  >([])
  const [isOwner, setIsOwner] = useState(false)

  // Choose a sensible default catalogue (prefer one owned by the user)
  useEffect(() => {
    const chooseCatalogue = async () => {
      try {
        const res = await fetch('/api/catalogues?limit=10')
        if (!res.ok) throw new Error('Failed to load catalogues')
        const data = await res.json()
        const owned = (data.catalogues || []).filter((c: any) => c.isOwner)
        const chosen = owned[0] || (data.catalogues || [])[0]
        if (!chosen) {
          toast.info('Create a catalogue to enable team plan sharing')
          setLoading(false)
          return
        }
        setDefaultCatalogueId(chosen.id)
      } catch (e) {
        console.error(e)
        toast.error('Could not load account data')
        setLoading(false)
      }
    }
    chooseCatalogue()
  }, [])

  // Load team + plan sharing for the default catalogue silently
  useEffect(() => {
    const load = async () => {
      if (!defaultCatalogueId) return
      setLoading(true)
      try {
        const [teamRes, planRes] = await Promise.all([
          fetch(`/api/catalogues/${defaultCatalogueId}/team`),
          fetch(`/api/catalogues/${defaultCatalogueId}/plan-sharing`),
        ])
        if (!teamRes.ok) throw new Error('Failed to load team')
        if (!planRes.ok) throw new Error('Failed to load plan sharing')
        const teamData = await teamRes.json()
        const planData = await planRes.json()
        setTeam(teamData.team || [])
        setPendingInvitations(teamData.pendingInvitations || [])
        setIsOwner(Boolean(teamData.isOwner))
        setEnabled(Boolean(planData.planSharingEnabled))
      } catch (e) {
        console.error(e)
        toast.error('Unable to fetch team plan sharing')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [defaultCatalogueId])

  const premiumRecipients = useMemo(
    () =>
      team.filter(t => t.role === 'MEMBER' && t.hasPremiumAccess).slice(0, 3),
    [team]
  )

  const togglePlan = async (checked: boolean) => {
    if (!defaultCatalogueId) return
    setSaving(true)
    try {
      const selectedIds =
        premiumRecipients.length > 0
          ? premiumRecipients.map(p => p.id)
          : team
              .filter(t => t.role === 'MEMBER')
              .slice(0, 3)
              .map(t => t.id)
      const res = await fetch(
        `/api/catalogues/${defaultCatalogueId}/plan-sharing`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ enabled: checked, memberIds: selectedIds }),
        }
      )
      if (!res.ok) throw new Error('Failed to update plan sharing')
      setEnabled(checked)
      toast.success(checked ? 'Plan sharing enabled' : 'Plan sharing disabled')
    } catch (e) {
      console.error(e)
      toast.error('Could not update plan sharing')
    } finally {
      setSaving(false)
    }
  }

  const validateEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

  const sendInvitation = async () => {
    if (!defaultCatalogueId) {
      toast.error('Create a catalogue first')
      return
    }
    const email = inviteEmail.trim()
    if (!email) {
      toast.error('Enter an email to invite')
      return
    }
    if (!validateEmail(email)) {
      toast.error('Enter a valid email')
      return
    }
    setInviting(true)
    try {
      const res = await fetch(`/api/catalogues/${defaultCatalogueId}/team`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'Failed to send invitation')
      toast.success('Invitation sent!')
      setInviteEmail('')
      // refresh invitations and team
      try {
        const res2 = await fetch(`/api/catalogues/${defaultCatalogueId}/team`)
        const d2 = await res2.json()
        setTeam(d2.team || [])
        setPendingInvitations(d2.pendingInvitations || [])
      } catch {}
    } catch (e: any) {
      console.error(e)
      toast.error(e.message || 'Failed to invite')
    } finally {
      setInviting(false)
    }
  }

  const cancelInvitation = async (invitationId: string) => {
    if (!isOwner) {
      toast.error('Only owner can cancel invitations')
      return
    }
    try {
      const res = await fetch(`/api/invitations/${invitationId}`, {
        method: 'DELETE',
      })
      const d = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(d.error || 'Failed to cancel invitation')
      toast.success('Invitation cancelled')
      const refreshed = await fetch(
        `/api/catalogues/${defaultCatalogueId}/team`
      )
      const data = await refreshed.json()
      setPendingInvitations(data.pendingInvitations || [])
    } catch (e: any) {
      console.error(e)
      toast.error(e.message || 'Failed to cancel')
    }
  }

  const resendInvitation = async (email: string) => {
    if (!isOwner) {
      toast.error('Only owner can resend invitations')
      return
    }
    try {
      const res = await fetch(`/api/catalogues/${defaultCatalogueId}/team`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const d = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(d.error || 'Failed to resend')
      toast.success('Invitation resent')
    } catch (e: any) {
      console.error(e)
      toast.error(e.message || 'Failed to resend')
    }
  }

  const copyInvitationLink = async (invitationId: string) => {
    try {
      const res = await fetch(`/api/invitations/${invitationId}/token`)
      const d = await res.json()
      const token = d.token
      if (!token) throw new Error('Token not found')
      const invitationLink = `${window.location.origin}/invitations/accept?token=${token}`
      await navigator.clipboard.writeText(invitationLink)
      toast.success('Invitation link copied')
    } catch (e: any) {
      console.error(e)
      toast.error(e.message || 'Failed to copy link')
    }
  }

  const removeMember = async (memberId: string) => {
    if (!isOwner) {
      toast.error('Only owner can remove members')
      return
    }
    try {
      const res = await fetch(
        `/api/catalogues/${defaultCatalogueId}/team?memberId=${memberId}`,
        { method: 'DELETE' }
      )
      const d = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(d.error || 'Failed to remove member')
      toast.success('Member removed')
      const refreshed = await fetch(
        `/api/catalogues/${defaultCatalogueId}/team`
      )
      const data = await refreshed.json()
      setTeam(data.team || [])
    } catch (e: any) {
      console.error(e)
      toast.error(e.message || 'Failed to remove member')
    }
  }

  return (
    <div className="space-y-6">
      {/* Compact Header */}
      <Card className="relative overflow-hidden rounded-3xl border-0 bg-white/60 shadow-lg backdrop-blur">
        <div className="absolute right-0 top-0 h-20 w-20 -translate-y-10 translate-x-10 transform opacity-10">
          <div className="h-full w-full rounded-full bg-gradient-to-br from-indigo-500 to-purple-600" />
        </div>
        <CardContent className="relative p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 p-3">
                <ShieldCheck className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Team Plan Sharing
                </h1>
                <p className="text-sm text-gray-500">
                  Share premium features with your team
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm font-medium text-gray-600">Status</div>
                <div
                  className={`text-lg font-bold ${enabled ? 'text-emerald-600' : 'text-gray-500'}`}
                >
                  {enabled ? 'Active' : 'Disabled'}
                </div>
              </div>
              <Switch
                checked={enabled}
                onCheckedChange={togglePlan}
                disabled={saving || loading}
                className="data-[state=checked]:bg-emerald-500"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <Card className="rounded-3xl border-0 bg-white/60 shadow-lg backdrop-blur">
          <CardContent className="flex items-center justify-center p-12">
            <div className="flex items-center gap-3 text-gray-600">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span className="text-lg">Loading team data...</span>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Invite Section */}
            <Card className="relative overflow-hidden rounded-3xl border-0 bg-white/60 shadow-lg backdrop-blur">
              <div className="absolute right-0 top-0 h-16 w-16 -translate-y-8 translate-x-8 transform opacity-10">
                <div className="h-full w-full rounded-full bg-gradient-to-br from-indigo-500 to-purple-600" />
              </div>
              <CardHeader className="relative pb-4">
                <CardTitle className="flex items-center gap-3 text-lg font-semibold text-gray-900">
                  <div className="rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 p-2">
                    <UserPlus className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <span>Invite Team Member</span>
                    <p className="mt-1 text-sm font-normal text-gray-500">
                      Expand your creative team
                    </p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="relative">
                <div className="flex max-w-2xl gap-3">
                  <div className="relative flex-1">
                    <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <Input
                      type="email"
                      placeholder="name@example.com"
                      value={inviteEmail}
                      onChange={e => setInviteEmail(e.target.value)}
                      disabled={loading || inviting}
                      className="h-12 rounded-2xl border-2 border-gray-200 bg-gray-50 pl-12 focus:border-indigo-500 focus:bg-white"
                    />
                  </div>
                  <Button
                    onClick={sendInvitation}
                    disabled={inviting || loading || !defaultCatalogueId}
                    className="h-12 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 px-6 font-semibold shadow-lg hover:shadow-xl"
                  >
                    {inviting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        <span>Send Invite</span>
                      </>
                    )}
                  </Button>
                </div>

                <div className="mt-4 rounded-xl bg-indigo-50 p-4">
                  <p className="text-sm text-indigo-700">
                    💡 <strong>Pro Tip:</strong> Premium features will be
                    automatically shared with up to 3 team members when enabled.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Premium Recipients */}
            <Card className="relative overflow-hidden rounded-3xl border-0 bg-white/60 shadow-lg backdrop-blur">
              <div className="absolute right-0 top-0 h-16 w-16 -translate-y-8 translate-x-8 transform opacity-10">
                <div className="h-full w-full rounded-full bg-gradient-to-br from-amber-500 to-orange-600" />
              </div>
              <CardHeader className="relative pb-4">
                <CardTitle className="flex items-center gap-3 text-lg font-semibold text-gray-900">
                  <div className="rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 p-2">
                    <Crown className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <span>Premium Access</span>
                    <p className="mt-1 text-sm font-normal text-gray-500">
                      Up to 3 members receive premium benefits
                    </p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="relative">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  {premiumRecipients.map(m => (
                    <div
                      key={m.id}
                      className="group relative overflow-hidden rounded-2xl border-2 border-gray-100 bg-gradient-to-br from-white to-amber-50 p-4 transition-all hover:border-amber-300 hover:shadow-lg"
                    >
                      <div className="absolute right-0 top-0 h-16 w-16 -translate-y-6 translate-x-6 rounded-full bg-amber-200/30" />
                      <div className="relative">
                        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-lg font-bold text-white">
                          {(m.fullName || m.email).charAt(0).toUpperCase()}
                        </div>
                        <div className="mb-1 text-sm font-semibold text-gray-900">
                          {m.fullName || m.email}
                        </div>
                        <div className="mb-3 text-xs text-gray-500">
                          {m.email}
                        </div>
                        {enabled && (
                          <div className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-700">
                            <Sparkles className="h-3 w-3" />
                            Premium Active
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {premiumRecipients.length === 0 && (
                    <div className="col-span-3 rounded-2xl border-2 border-dashed border-gray-200 p-6 text-center">
                      <Users className="mx-auto mb-3 h-10 w-10 text-gray-300" />
                      <p className="text-sm text-gray-500">
                        No team members found yet. Invite members to get
                        started!
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Team Members */}
            <Card className="relative overflow-hidden rounded-3xl border-0 bg-white/60 shadow-lg backdrop-blur">
              <div className="absolute right-0 top-0 h-16 w-16 -translate-y-8 translate-x-8 transform opacity-10">
                <div className="h-full w-full rounded-full bg-gradient-to-br from-blue-500 to-cyan-600" />
              </div>
              <CardHeader className="relative pb-4">
                <CardTitle className="flex items-center justify-between text-lg font-semibold text-gray-900">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 p-2">
                      <Users className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <span>Team Members</span>
                      <p className="mt-1 text-sm font-normal text-gray-500">
                        {team.length} active members
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (!defaultCatalogueId) {
                        toast.info(
                          'Create a catalogue to manage detailed team settings.'
                        )
                        return
                      }
                      router.push(`/catalogue/${defaultCatalogueId}/edit`)
                    }}
                    className="rounded-xl border-2 border-gray-200 bg-white hover:border-gray-300"
                  >
                    Team Settings
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="relative">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {team.map(member => (
                    <div
                      key={member.id}
                      className="group rounded-2xl border-2 border-gray-100 bg-white p-4 transition-all hover:border-blue-300 hover:shadow-lg"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 text-sm font-bold text-white">
                            {(member.fullName || member.email)
                              .charAt(0)
                              .toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="truncate text-sm font-semibold text-gray-900">
                                {member.fullName || member.email}
                              </span>
                              {member.role === 'OWNER' && (
                                <Crown className="h-3 w-3 flex-shrink-0 text-amber-500" />
                              )}
                            </div>
                            <div className="truncate text-xs text-gray-500">
                              {member.email}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-shrink-0 items-center gap-2">
                          <span
                            className={`rounded-full px-2 py-1 text-xs font-semibold ${member.role === 'OWNER' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}
                          >
                            {member.role === 'OWNER' ? 'Owner' : 'Member'}
                          </span>
                          {isOwner && member.role !== 'OWNER' && (
                            <button
                              onClick={() => removeMember(member.id)}
                              className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {team.length === 0 && (
                    <div className="col-span-2 rounded-2xl border-2 border-dashed border-gray-200 p-6 text-center">
                      <Users className="mx-auto mb-3 h-10 w-10 text-gray-300" />
                      <p className="text-sm text-gray-500">
                        No team members yet.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Pending Invitations */}
            <Card className="relative overflow-hidden rounded-3xl border-0 bg-white/60 shadow-lg backdrop-blur">
              <div className="absolute right-0 top-0 h-16 w-16 -translate-y-8 translate-x-8 transform opacity-10">
                <div className="h-full w-full rounded-full bg-gradient-to-br from-purple-500 to-pink-600" />
              </div>
              <CardHeader className="relative pb-4">
                <CardTitle className="flex items-center gap-3 text-lg font-semibold text-gray-900">
                  <div className="rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 p-2">
                    <Clock className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <span>Pending Invitations</span>
                    <p className="mt-1 text-sm font-normal text-gray-500">
                      {pendingInvitations.length} awaiting response
                    </p>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="relative">
                <div className="space-y-3">
                  {pendingInvitations.map(inv => (
                    <div
                      key={inv.id}
                      className="group rounded-2xl border-2 border-gray-100 bg-white p-4 transition-all hover:border-purple-300 hover:shadow-lg"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-400 to-pink-500">
                            <Mail className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-gray-900">
                              {inv.email}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-700">
                                <Clock className="h-3 w-3" />
                                {inv.status}
                              </span>
                              <span>•</span>
                              <span>
                                Expires{' '}
                                {new Date(inv.expiresAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyInvitationLink(inv.id)}
                            className="h-8 rounded-lg border-gray-200 px-3 hover:border-gray-300"
                          >
                            <Copy className="mr-1 h-3 w-3" />
                            Copy Link
                          </Button>
                          {isOwner && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => resendInvitation(inv.email)}
                                className="h-8 rounded-lg border-blue-200 bg-blue-50 px-3 text-blue-700 hover:bg-blue-100"
                              >
                                <Send className="mr-1 h-3 w-3" />
                                Resend
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => cancelInvitation(inv.id)}
                                className="h-8 rounded-lg px-3"
                              >
                                <XCircle className="mr-1 h-3 w-3" />
                                Cancel
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  {pendingInvitations.length === 0 && (
                    <div className="rounded-2xl border-2 border-dashed border-gray-200 p-6 text-center">
                      <CheckCircle className="mx-auto mb-3 h-10 w-10 text-gray-300" />
                      <p className="text-sm text-gray-500">
                        No pending invitations.
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
      {/* Help Section */}
      <Card className="rounded-3xl border-0 bg-gradient-to-br from-indigo-50 to-purple-50">
        <CardContent className="p-8">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600">
              <ShieldCheck className="h-6 w-6 text-white" />
            </div>
            <h3 className="mb-2 text-xl font-bold text-gray-900">
              Need Help Managing Your Team?
            </h3>
            <p className="mb-6 text-gray-600">
              Visit the Team tab in your catalogue settings for detailed role
              management, permissions, and collaboration features.
            </p>
            <Button
              onClick={() => {
                if (!defaultCatalogueId) {
                  toast.info(
                    'Create a catalogue to manage detailed team settings.'
                  )
                  return
                }
                router.push(`/catalogue/${defaultCatalogueId}/edit`)
              }}
              className="rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-3 font-semibold text-white shadow-lg transition-all hover:shadow-xl"
            >
              Open Team Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
