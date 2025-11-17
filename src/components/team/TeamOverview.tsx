'use client'

import { useEffect, useMemo, useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { Loader2, Users, Mail, Sparkles } from 'lucide-react'

interface CatalogueSummary {
  id: string
  name: string
  isOwner: boolean
}

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
}

export default function TeamOverview() {
  const [catalogues, setCatalogues] = useState<CatalogueSummary[]>([])
  const [selectedCatalogueId, setSelectedCatalogueId] = useState<string>('')
  const [team, setTeam] = useState<TeamMemberLite[]>([])
  const [pendingInvitations, setPendingInvitations] = useState<
    PendingInvitationLite[]
  >([])
  const [isLoading, setIsLoading] = useState(true)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviting, setInviting] = useState(false)
  const [planSharingEnabled, setPlanSharingEnabled] = useState(false)
  const [planSaving, setPlanSaving] = useState(false)

  useEffect(() => {
    const loadCatalogues = async () => {
      try {
        const res = await fetch('/api/catalogues?limit=20')
        if (!res.ok) throw new Error('Failed to load catalogues')
        const data = await res.json()
        const cats = (data.catalogues || []).map((c: any) => ({
          id: c.id,
          name: c.name,
          isOwner: c.isOwner,
        }))
        setCatalogues(cats)
        if (cats.length > 0) {
          setSelectedCatalogueId(cats[0].id)
        }
      } catch (e) {
        console.error(e)
        toast.error('Failed to load your catalogues')
      }
    }
    loadCatalogues()
  }, [])

  useEffect(() => {
    const loadTeamData = async () => {
      if (!selectedCatalogueId) return
      setIsLoading(true)
      try {
        const res = await fetch(`/api/catalogues/${selectedCatalogueId}/team`)
        if (!res.ok) throw new Error('Failed to load team')
        const data = await res.json()
        setTeam(data.team || [])
        setPendingInvitations(data.pendingInvitations || [])
      } catch (e) {
        console.error(e)
        toast.error('Failed to load team data')
      } finally {
        setIsLoading(false)
      }
    }
    const loadPlan = async () => {
      if (!selectedCatalogueId) return
      try {
        const res = await fetch(
          `/api/catalogues/${selectedCatalogueId}/plan-sharing`
        )
        if (!res.ok) throw new Error('Failed to load plan sharing')
        const data = await res.json()
        setPlanSharingEnabled(Boolean(data.planSharingEnabled))
      } catch (e) {
        console.error(e)
      }
    }
    loadTeamData()
    loadPlan()
  }, [selectedCatalogueId])

  const totalMembers = useMemo(
    () => team.filter(m => m.role === 'MEMBER').length,
    [team]
  )
  const totalOwners = useMemo(
    () => team.filter(m => m.role === 'OWNER').length,
    [team]
  )
  const totalInvites = useMemo(
    () => pendingInvitations.length,
    [pendingInvitations]
  )

  const validateEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

  const sendInvitation = async () => {
    if (!selectedCatalogueId) return
    const email = inviteEmail.trim()
    if (!email) {
      toast.error('Please enter an email')
      return
    }
    if (!validateEmail(email)) {
      toast.error('Enter a valid email')
      return
    }
    setInviting(true)
    try {
      const res = await fetch(`/api/catalogues/${selectedCatalogueId}/team`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        throw new Error(d.error || 'Failed to send invitation')
      }
      toast.success('Invitation sent!')
      setInviteEmail('')
      // Refresh
      const refresh = await fetch(`/api/catalogues/${selectedCatalogueId}/team`)
      const data = await refresh.json()
      setTeam(data.team || [])
      setPendingInvitations(data.pendingInvitations || [])
    } catch (e: any) {
      console.error(e)
      toast.error(e.message || 'Failed to invite')
    } finally {
      setInviting(false)
    }
  }

  const togglePlanSharing = async (enabled: boolean) => {
    if (!selectedCatalogueId) return
    setPlanSaving(true)
    try {
      const res = await fetch(
        `/api/catalogues/${selectedCatalogueId}/plan-sharing`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            enabled,
            memberIds: team
              .filter(t => t.role === 'MEMBER')
              .slice(0, 3)
              .map(t => t.id),
          }),
        }
      )
      if (!res.ok) throw new Error('Failed to update plan sharing')
      setPlanSharingEnabled(enabled)
      toast.success(enabled ? 'Plan sharing enabled' : 'Plan sharing disabled')
    } catch (e) {
      console.error(e)
      toast.error('Could not update plan sharing')
    } finally {
      setPlanSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Team Overview</CardTitle>
          </div>
          <div className="w-64">
            <Label className="mb-1 block">Catalogue</Label>
            <Select
              value={selectedCatalogueId}
              onValueChange={setSelectedCatalogueId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a catalogue" />
              </SelectTrigger>
              <SelectContent>
                {catalogues.map(c => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading team...
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="rounded-lg border p-4">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" /> Members
                </div>
                <div className="mt-2 text-2xl font-semibold">
                  {totalMembers}
                </div>
              </div>
              <div className="rounded-lg border p-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4" /> Owners
                </div>
                <div className="mt-2 text-2xl font-semibold">{totalOwners}</div>
              </div>
              <div className="rounded-lg border p-4">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" /> Pending Invites
                </div>
                <div className="mt-2 text-2xl font-semibold">
                  {totalInvites}
                </div>
              </div>
            </div>
          )}

          <Separator className="my-6" />

          <div className="flex flex-col items-end gap-6 md:flex-row">
            <div className="flex-1">
              <Label htmlFor="invite-email">Quick invite</Label>
              <div className="mt-2 flex gap-2">
                <Input
                  id="invite-email"
                  placeholder="name@example.com"
                  value={inviteEmail}
                  onChange={e => setInviteEmail(e.target.value)}
                />
                <Button
                  disabled={inviting || !selectedCatalogueId}
                  onClick={sendInvitation}
                >
                  {inviting ? 'Sending...' : 'Invite'}
                </Button>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div>
                <Label className="block">Plan sharing</Label>
                <div className="text-xs text-muted-foreground">
                  Share premium features with up to 3 members
                </div>
              </div>
              <Switch
                checked={planSharingEnabled}
                disabled={planSaving || !selectedCatalogueId}
                onCheckedChange={togglePlanSharing}
              />
            </div>
          </div>

          <Separator className="my-6" />

          <div>
            <Label>Team Members</Label>
            <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
              {team.map(m => (
                <div
                  key={m.id}
                  className="flex items-center justify-between rounded border p-3 text-sm"
                >
                  <div>
                    <div className="font-medium">{m.fullName || m.email}</div>
                    <div className="text-muted-foreground">
                      {m.role === 'OWNER' ? 'Owner' : 'Member'}
                      {m.hasPremiumAccess ? ' · Premium' : ''}
                    </div>
                  </div>
                  {m.role === 'MEMBER' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        toast.info(
                          'Use the catalogue Edit page > Team tab for advanced settings.'
                        )
                      }
                    >
                      Manage
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
