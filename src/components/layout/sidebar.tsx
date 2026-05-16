'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useSession } from 'next-auth/react'
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  UserCheck,
  Calendar,
  FileText,
  CheckCircle,
  Settings,
  LogOut,
  Bell,
  BookOpen,
  Award,
  ClipboardList,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { signOut } from 'next-auth/react'

interface SidebarItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  role?: string[]
}

const sidebarItems: SidebarItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Teachers',
    href: '/admin/teachers',
    icon: Users,
    role: ['ADMIN'],
  },
  {
    title: 'Parents',
    href: '/admin/parents',
    icon: UserCheck,
    role: ['ADMIN'],
  },
  {
    title: 'Students',
    href: '/admin/students',
    icon: GraduationCap,
    role: ['ADMIN'],
  },
  {
    title: 'Classes',
    href: '/admin/classes',
    icon: BookOpen,
    role: ['ADMIN'],
  },
  {
    title: 'Attendance',
    href: '/teacher/attendance',
    icon: ClipboardList,
    role: ['TEACHER'],
  },
  {
    title: 'Performance',
    href: '/teacher/performance',
    icon: Award,
    role: ['TEACHER'],
  },
  {
    title: 'Submissions',
    href: '/teacher/submissions',
    icon: FileText,
    role: ['TEACHER'],
  },
  {
    title: 'Approvals',
    href: '/admin/approvals',
    icon: CheckCircle,
    role: ['ADMIN'],
  },
  {
    title: 'Reports',
    href: '/admin/reports',
    icon: FileText,
    role: ['ADMIN'],
  },
  {
    title: 'My Students',
    href: '/parent/students',
    icon: GraduationCap,
    role: ['PARENT'],
  },
  {
    title: 'Announcements',
    href: '/parent/announcements',
    icon: Bell,
    role: ['PARENT'],
  },
  {
    title: 'Events',
    href: '/parent/events',
    icon: Calendar,
    role: ['PARENT'],
  },
  {
    title: 'Settings',
    href: '/settings',
    icon: Settings,
  },
]

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const userRole = session?.user.role

  const filteredItems = sidebarItems.filter(item => {
    if (!item.role) return true
    return userRole && item.role.includes(userRole)
  })

  const handleSignOut = () => {
    signOut({ callbackUrl: '/login' })
  }

  return (
    <div className={cn('pb-12 w-64', className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            School Management
          </h2>
          <div className="space-y-1">
            {filteredItems.map((item) => (
              <SidebarItem
                key={item.href}
                item={item}
                isActive={pathname === item.href}
              />
            ))}
          </div>
        </div>
        <div className="px-3 py-2">
          <div className="space-y-1">
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={handleSignOut}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

interface SidebarItemProps {
  item: SidebarItem
  isActive: boolean
}

function SidebarItem({ item, isActive }: SidebarItemProps) {
  return (
    <Button
      variant={isActive ? 'secondary' : 'ghost'}
      className={cn('w-full justify-start', isActive && 'bg-primary text-primary-foreground')}
      asChild
    >
      <Link href={item.href}>
        <item.icon className="mr-2 h-4 w-4" />
        {item.title}
      </Link>
    </Button>
  )
}