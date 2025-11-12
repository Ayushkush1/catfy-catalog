"use client"

import { useEffect, useMemo, useState } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { Loader2, Sparkles, ShieldCheck, Users } from 'lucide-react'
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
  const [pendingInvitations, setPendingInvitations] = useState<PendingInvitationLite[]>([])
  const [isOwner, setIsOwner] = useState(false)

  // Choose a sensible default catalogue (prefer one owned by the user)
  useEffect(() => {
    const chooseCatalogue = async () => {
      try {
        const res = await fetch('/api/catalogues?limit=10')
        if (!res.ok) throw new Error('Failed to load catalogues')
        const data = await res.json()
        const owned = (data.catalogues || []).filter((c: any) => c.isOwner)
        const chosen = (owned[0] || (data.catalogues || [])[0])
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
    () => team.filter(t => t.role === 'MEMBER').slice(0, 3),
    [team]
  )

  const togglePlan = async (checked: boolean) => {
    if (!defaultCatalogueId) return
    setSaving(true)
    try {
      const res = await fetch(`/api/catalogues/${defaultCatalogueId}/plan-sharing`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: checked, memberIds: premiumRecipients.map(p => p.id) }),
      })
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

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

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
      const res = await fetch(`/api/invitations/${invitationId}`, { method: 'DELETE' })
      const d = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(d.error || 'Failed to cancel invitation')
      toast.success('Invitation cancelled')
      const refreshed = await fetch(`/api/catalogues/${defaultCatalogueId}/team`)
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
      const res = await fetch(`/api/catalogues/${defaultCatalogueId}/team?memberId=${memberId}`, { method: 'DELETE' })
      const d = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(d.error || 'Failed to remove member')
      toast.success('Member removed')
      const refreshed = await fetch(`/api/catalogues/${defaultCatalogueId}/team`)
      const data = await refreshed.json()
      setTeam(data.team || [])
    } catch (e: any) {
      console.error(e)
      toast.error(e.message || 'Failed to remove member')
    }
  }

  return (
    <div className="space-y-8">
      <Card className="border-0 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-[#6366F1] via-[#7C4DE8] to-[#8B5CF6] text-white rounded-t-xl">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-white">
                <ShieldCheck className="h-5 w-5" /> Team Plan Sharing
              </CardTitle>
              <CardDescription className="text-indigo-50">
                Share your premium features with your core team members.
              </CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm">{enabled ? 'Enabled' : 'Disabled'}</span>
              <Switch checked={enabled} disabled={saving || loading} onCheckedChange={togglePlan} />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {loading ? (
            <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin"/> Loading team...</div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="rounded-xl bg-white border p-4 shadow-sm">
                  <div className="flex items-center gap-2 text-muted-foreground"><Users className="h-4 w-4"/> Members</div>
                  <div className="text-2xl font-semibold mt-2">{team.filter(t => t.role === 'MEMBER').length}</div>
                </div>
                <div className="rounded-xl bg-white border p-4 shadow-sm">
                  <div className="flex items-center gap-2 text-muted-foreground"><Sparkles className="h-4 w-4"/> Eligible Premium</div>
                  <div className="text-2xl font-semibold mt-2">{premiumRecipients.length}</div>
                </div>
                <div className="rounded-xl bg-white border p-4 shadow-sm">
                  <div className="text-muted-foreground">Status</div>
                  <div className="text-2xl font-semibold mt-2">{enabled ? 'Active' : 'Off'}</div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="text-sm text-muted-foreground">Invite a team member</div>
                <div className="flex items-center gap-2 max-w-lg">
                  <Input
                    placeholder="name@example.com"
                    value={inviteEmail}
                    onChange={e => setInviteEmail(e.target.value)}
                    disabled={loading || inviting}
                  />
                  <Button onClick={sendInvitation} disabled={inviting || loading || !defaultCatalogueId}>
                    {inviting ? (<span className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin"/>Sending</span>) : 'Invite'}
                  </Button>
                </div>

                <Separator />

                <div className="text-sm text-muted-foreground">Premium access will be shared with up to 3 members:</div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {premiumRecipients.map(m => (
                    <div key={m.id} className="rounded-lg border p-3 text-sm flex items-center justify-between">
                      <div>
                        <div className="font-medium">{m.fullName || m.email}</div>
                        <div className="text-muted-foreground">Member</div>
                      </div>
                      {enabled && <span className="rounded bg-indigo-50 text-indigo-600 px-2 py-1 text-xs">Premium</span>}
                    </div>
                  ))}
                  {premiumRecipients.length === 0 && (
                    <div className="text-sm text-muted-foreground">No team members found yet.</div>
                  )}
                </div>
              </div>

              <div className="text-xs text-muted-foreground">
                Manage detailed roles, invites, and responsibilities in the catalogue’s Team tab.
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    if (!defaultCatalogueId) {
                      toast.info('Create a catalogue to manage detailed team settings.')
                      return
                    }
                    router.push(`/catalogue/${defaultCatalogueId}/edit`)
                  }}
                >
                  Open Team settings
                </Button>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold">Team Members</h3>
                  <span className="px-2 py-1 text-xs rounded bg-slate-100 text-slate-700">{team.length}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {team.map(member => (
                    <div key={member.id} className="rounded-lg border p-3 flex items-center justify-between">
                      <div>
                        <div className="font-medium">{member.fullName || member.email}</div>
                        <div className="text-xs text-muted-foreground">{member.email}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs px-2 py-1 rounded bg-slate-100 text-slate-700">{member.role === 'OWNER' ? 'Owner' : 'Member'}</span>
                        {isOwner && member.role !== 'OWNER' && (
                          <Button variant="outline" size="sm" onClick={() => removeMember(member.id)}>Remove</Button>
                        )}
                      </div>
                    </div>
                  ))}
                  {team.length === 0 && (
                    <div className="text-sm text-muted-foreground">No members yet.</div>
                  )}
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold">Invitations</h3>
                  <span className="px-2 py-1 text-xs rounded bg-slate-100 text-slate-700">{pendingInvitations.length}</span>
                </div>
                <div className="space-y-3">
                  {pendingInvitations.map(inv => (
                    <div key={inv.id} className="rounded-lg border p-3 flex items-center justify-between">
                      <div>
                        <div className="font-medium">{inv.email}</div>
                        <div className="text-xs text-muted-foreground">Status: {inv.status} • Expires {new Date(inv.expiresAt).toLocaleDateString()}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" onClick={() => copyInvitationLink(inv.id)}>Copy link</Button>
                        {isOwner && (
                          <>
                            <Button variant="outline" size="sm" onClick={() => resendInvitation(inv.email)}>Resend</Button>
                            <Button variant="destructive" size="sm" onClick={() => cancelInvitation(inv.id)}>Cancel</Button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                  {pendingInvitations.length === 0 && (
                    <div className="text-sm text-muted-foreground">No pending invitations.</div>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}