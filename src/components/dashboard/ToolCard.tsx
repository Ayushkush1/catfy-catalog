'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, Eye, ArrowRight } from 'lucide-react'
import { ToolCard as ToolCardType } from '@/types/dashboard'
import { useRouter } from 'next/navigation'

interface ToolCardProps {
  tool: ToolCardType
  onBrowseClick?: () => void
  onCreateClick?: () => void
}

export function ToolCard({ tool, onBrowseClick, onCreateClick }: ToolCardProps) {
  const router = useRouter()

  const handleBrowse = () => {
    if (onBrowseClick) {
      onBrowseClick()
    } else if (tool.isActive) {
      router.push(tool.route)
    }
  }

  const handleCreate = () => {
    if (onCreateClick) {
      onCreateClick()
    } else if (tool.isActive) {
      router.push(`${tool.route}/new`)
    }
  }

  const Icon = tool.icon

  return (
    <Card
      className={`group relative overflow-hidden rounded-2xl p-2 border-0 shadow-md transition-all duration-300 flex flex-col ${tool.isActive
          ? `hover:-translate-y-1 hover:border-${tool.color} hover:shadow-lg`
          : 'opacity-75'
        }`}
    >
      {/* Background Icon */}
      <div className="absolute -right-3 top-0 h-32 w-32 -translate-y-4 translate-x-4 transform opacity-5 transition-all duration-500 group-hover:opacity-10">
        <Icon className={`h-full w-full text-${tool.color}`} />
      </div>

      <CardHeader className="relative pb-3">
        <div className="mb-2 flex items-center gap-3">
          <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${tool.gradient} shadow-md transition-transform duration-300 group-hover:scale-110`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg font-bold text-gray-900">
                {tool.name}
              </CardTitle>
              {tool.badge && (
                <Badge
                  variant={tool.badge.variant}
                  className="text-xs"
                >
                  {tool.badge.text}
                </Badge>
              )}
            </div>
            <CardDescription className="text-xs text-gray-600">
              {tool.description}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="relative space-y-4 pt-0 flex-1 flex flex-col justify-between">
        {/* Features */}
        <div className="space-y-2">
          {tool.features.map((feature, index) => (
            <div key={index} className="flex items-center space-x-2 text-xs text-gray-700">
              <div className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-100">
                <svg className="h-2.5 w-2.5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span>{feature}</span>
            </div>
          ))}
        </div>

        {/* Stats */}
        {tool.stats.length > 0 && (
          <div className={`flex items-center gap-3 rounded-lg ${tool.isComingSoon ? 'bg-gradient-to-r from-amber-50 to-orange-50' : `bg-gradient-to-r from-blue-50 to-purple-50`} p-3`}>
            {tool.isComingSoon ? (
              <div className="flex items-center justify-center w-full">
                <Badge className="border-amber-200 bg-transparent px-3 py-1.5 text-xs font-semibold text-amber-700">
                  Coming Soon
                </Badge>
              </div>
            ) : (
              tool.stats.map((stat, index) => (
                <div key={index} className="flex-1 text-center">
                  <div className={`text-xl font-bold text-${tool.color}`}>
                    {stat.value}
                  </div>
                  <div className="text-[10px] text-gray-600">{stat.label}</div>
                  {index < tool.stats.length - 1 && (
                    <div className="absolute h-10 w-px bg-gray-300" style={{ left: `${((index + 1) / tool.stats.length) * 100}%` }}></div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            onClick={handleBrowse}
            disabled={!tool.isActive}
            variant="outline"
            className={`flex-1 rounded-lg border-${tool.color} py-2.5 text-xs font-semibold text-${tool.color} transition-all hover:bg-${tool.color} hover:text-white disabled:cursor-not-allowed disabled:opacity-50`}
          >
            <Eye className="mr-1.5 h-3.5 w-3.5" />
            Browse
          </Button>
          <Button
            onClick={handleCreate}
            disabled={!tool.isActive}
            className={`flex-1 rounded-lg ${tool.gradient} py-2.5 text-xs font-semibold text-white shadow-sm transition-all hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50`}
          >
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Create New
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
