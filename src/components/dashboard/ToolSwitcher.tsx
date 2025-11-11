'use client'

import { Book, FileText, Grid3x3 } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface Tool {
  id: string
  name: string
  icon: React.ComponentType<{ className?: string }>
  href: string
  isActive: boolean
}

const tools: Tool[] = [
  {
    id: 'catalogue',
    name: 'Product Catalogues',
    icon: Book,
    href: '/dashboard/catalogue',
    isActive: true
  },
  {
    id: 'pdf-editor',
    name: 'PDF Editor',
    icon: FileText,
    href: '/dashboard/pdf-editor',
    isActive: false
  }
]

export function ToolSwitcher() {
  const pathname = usePathname()

  // Determine current tool based on pathname
  const currentTool = tools.find(tool => pathname.includes(tool.id)) || null

  // Don't show on main dashboard
  if (pathname === '/dashboard') return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="flex items-center gap-2 border-white/20 bg-white/10 text-white hover:bg-white/20 hover:text-white"
        >
          {currentTool ? (
            <>
              <currentTool.icon className="h-4 w-4" />
              <span>{currentTool.name}</span>
            </>
          ) : (
            <>
              <Grid3x3 className="h-4 w-4" />
              <span>Switch Tool</span>
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56">
        <DropdownMenuItem asChild>
          <Link href="/dashboard" className="cursor-pointer">
            <Grid3x3 className="mr-2 h-4 w-4" />
            All Tools
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {tools.map(tool => {
          const Icon = tool.icon
          return (
            <DropdownMenuItem
              key={tool.id}
              asChild
              disabled={!tool.isActive}
            >
              <Link
                href={tool.href}
                className={`cursor-pointer ${!tool.isActive ? 'opacity-50' : ''}`}
              >
                <Icon className="mr-2 h-4 w-4" />
                {tool.name}
                {!tool.isActive && (
                  <span className="ml-auto text-xs text-gray-400">Soon</span>
                )}
              </Link>
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
