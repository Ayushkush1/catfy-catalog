'use client'

import { Sidebar } from '@/components/dashboard/Sidebar'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Users, UserPlus, Mail, Crown, MoreVertical, Shield } from 'lucide-react'

export default function TeamPage() {
  const teamMembers = [
    {
      id: 1,
      name: 'Sarah Johnson',
      email: 'sarah.j@company.com',
      role: 'Admin',
      avatar: null,
      status: 'active',
      joinedDate: 'Jan 2024'
    },
    {
      id: 2,
      name: 'Michael Chen',
      email: 'michael.c@company.com',
      role: 'Editor',
      avatar: null,
      status: 'active',
      joinedDate: 'Feb 2024'
    },
    {
      id: 3,
      name: 'Emily Rodriguez',
      email: 'emily.r@company.com',
      role: 'Viewer',
      avatar: null,
      status: 'active',
      joinedDate: 'Mar 2024'
    }
  ]

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
  }

  return (
    <div className="flex min-h-screen bg-[#E8EAF6]">
      <Sidebar />
      <div className="ml-32 flex-1">
        <DashboardHeader title="Team Management" subtitle="Manage your team members and permissions" />

        <div className="p-8">
          {/* Header with Action Button */}
          <div className="mb-8 flex items-center justify-end">
            <Button className="bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] hover:from-[#5558E3] hover:to-[#7C4DE8] text-white shadow-lg">
              <UserPlus className="h-4 w-4 mr-2" />
              Invite Member
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3 mb-8">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Total Members</p>
                    <h3 className="text-3xl font-bold text-gray-900">{teamMembers.length}</h3>
                  </div>
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Admins</p>
                    <h3 className="text-3xl font-bold text-gray-900">1</h3>
                  </div>
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg">
                    <Shield className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Pending Invites</p>
                    <h3 className="text-3xl font-bold text-gray-900">2</h3>
                  </div>
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-lg">
                    <Mail className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Team Members List */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-purple-600" />
                Team Members
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {teamMembers.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12 border-2 border-purple-200">
                        <AvatarImage src={member.avatar || ''} alt={member.name} />
                        <AvatarFallback className="bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] text-white font-semibold">
                          {getInitials(member.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-semibold text-gray-900">{member.name}</h4>
                        <p className="text-sm text-gray-600">{member.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge 
                        variant={member.role === 'Admin' ? 'default' : 'secondary'}
                        className={member.role === 'Admin' ? 'bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white border-0' : ''}
                      >
                        {member.role === 'Admin' && <Crown className="h-3 w-3 mr-1" />}
                        {member.role}
                      </Badge>
                      <span className="text-sm text-gray-500">{member.joinedDate}</span>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
