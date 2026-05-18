'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Home,
  Users,
  GraduationCap,
  Settings,
  LogOut,
  User,
  Bell,
  FileText,
  Calendar,
  CheckCircle,
  BarChart3,
  BookOpen,
  Target,
  Award,
  TrendingUp,
  Menu,
  X,
  ChevronDown,
  Shield,
  Database,
  HelpCircle,
  Palette,
  Globe,
  Lock,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Download,
  Upload,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Copy,
  Share,
  RefreshCw,
  Save,
  XCircle,
  AlertTriangle,
  Info,
  ChevronRight,
  ChevronLeft,
  MoreHorizontal,
  MoreVertical,
} from 'lucide-react'

interface SidebarItem {
  title: string
  href: string
  icon: React.ReactNode
  badge?: string | number
  children?: SidebarItem[]
}

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [isCollapsed, setIsCollapsed] = React.useState(false)
  const [isMobile, setIsMobile] = React.useState(false)
  const [pendingApprovals, setPendingApprovals] = React.useState<number>(0)
  const [pendingSubmissions, setPendingSubmissions] = React.useState<number>(0)

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Fetch dynamic badge counts
  React.useEffect(() => {
    if (!session?.user?.role) return

    const fetchCounts = async () => {
      try {
        if (session.user.role === 'ADMIN') {
          const res = await fetch('/api/approvals?status=PENDING')
          if (res.ok) {
            const data = await res.json()
            setPendingApprovals(data.length || 0)
          }
        } else if (session.user.role === 'TEACHER') {
          const res = await fetch('/api/submissions?status=PENDING_APPROVAL')
          if (res.ok) {
            const data = await res.json()
            setPendingSubmissions(data.length || 0)
          }
        }
      } catch (e) {
        console.error('Failed to fetch badge counts:', e)
      }
    }

    fetchCounts()
    const interval = setInterval(fetchCounts, 60000) // Refresh every minute
    return () => clearInterval(interval)
  }, [session])

  const getSidebarItems = (): SidebarItem[] => {
    if (!session?.user?.role) return []

    switch (session.user.role) {
      case 'ADMIN':
        return [
          {
            title: 'Dashboard',
            href: '/admin',
            icon: <Home className="h-4 w-4" />,
          },
          {
            title: 'Teachers',
            href: '/admin/teachers',
            icon: <Users className="h-4 w-4" />,
          },
          {
            title: 'Parents',
            href: '/admin/parents',
            icon: <Users className="h-4 w-4" />,
          },
          {
            title: 'Students',
            href: '/admin/students',
            icon: <GraduationCap className="h-4 w-4" />,
          },
          {
            title: 'Classes',
            href: '/admin/classes',
            icon: <BookOpen className="h-4 w-4" />,
          },
          {
            title: 'Approvals',
            href: '/admin/approvals',
            icon: <CheckCircle className="h-4 w-4" />,
            badge: pendingApprovals > 0 ? pendingApprovals : undefined,
          },
          {
            title: 'Announcements',
            href: '/admin/announcements',
            icon: <Bell className="h-4 w-4" />,
          },
          {
            title: 'Events',
            href: '/admin/events',
            icon: <Calendar className="h-4 w-4" />,
          },
          {
            title: 'Reports',
            href: '/admin/reports',
            icon: <BarChart3 className="h-4 w-4" />,
          },
          {
            title: 'Settings',
            href: '/admin/settings',
            icon: <Settings className="h-4 w-4" />,
          },
        ]
      case 'TEACHER':
        return [
          {
            title: 'Dashboard',
            href: '/teacher',
            icon: <Home className="h-4 w-4" />,
          },
          {
            title: 'My Classes',
            href: '/teacher/classes',
            icon: <BookOpen className="h-4 w-4" />,
          },
          {
            title: 'Attendance',
            href: '/teacher/attendance',
            icon: <Calendar className="h-4 w-4" />,
          },
          {
            title: 'Performance',
            href: '/teacher/performance',
            icon: <Target className="h-4 w-4" />,
          },
          {
            title: 'Submissions',
            href: '/teacher/submissions',
            icon: <FileText className="h-4 w-4" />,
            badge: pendingSubmissions > 0 ? pendingSubmissions : undefined,
          },
          {
            title: 'Settings',
            href: '/teacher/settings',
            icon: <Settings className="h-4 w-4" />,
          },
        ]
      case 'PARENT':
        return [
          {
            title: 'Dashboard',
            href: '/parent',
            icon: <Home className="h-4 w-4" />,
          },
          {
            title: 'My Children',
            href: '/parent/students',
            icon: <Users className="h-4 w-4" />,
          },
          {
            title: 'Attendance',
            href: '/parent/attendance',
            icon: <Calendar className="h-4 w-4" />,
          },
          {
            title: 'Performance',
            href: '/parent/performance',
            icon: <TrendingUp className="h-4 w-4" />,
          },
          {
            title: 'Results',
            href: '/parent/results',
            icon: <Award className="h-4 w-4" />,
          },
          {
            title: 'Announcements',
            href: '/parent/announcements',
            icon: <Bell className="h-4 w-4" />,
          },
          {
            title: 'Events',
            href: '/parent/events',
            icon: <Calendar className="h-4 w-4" />,
          },
          {
            title: 'Settings',
            href: '/parent/settings',
            icon: <Settings className="h-4 w-4" />,
          },
        ]
      default:
        return []
    }
  }

  const sidebarItems = getSidebarItems()

  const isActive = (href: string) => {
    if (href === '/admin' && pathname.startsWith('/admin')) return true
    if (href === '/teacher' && pathname.startsWith('/teacher')) return true
    if (href === '/parent' && pathname.startsWith('/parent')) return true
    return pathname === href
  }

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed)
  }

  if (isMobile && isCollapsed) {
    return (
      <div className={cn("fixed inset-0 z-50 bg-background/80 backdrop-blur-sm", className)}>
        <div className="fixed inset-y-0 left-0 z-50 w-64 bg-background shadow-lg">
          <SidebarContent
            items={sidebarItems}
            isActive={isActive}
            session={session}
            onClose={() => setIsCollapsed(false)}
          />
        </div>
      </div>
    )
  }

  return (
    <div className={cn(
      "relative flex h-full border-r bg-background",
      isCollapsed ? "w-16" : "w-64",
      className
    )}>
      <div className="flex h-full flex-col">
        <div className="flex h-14 items-center justify-between border-b px-4">
          <div className={cn("flex items-center space-x-2", isCollapsed && "justify-center")}>
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <GraduationCap className="h-5 w-5 text-primary-foreground" />
            </div>
            {!isCollapsed && (
              <span className="font-semibold text-lg">SIS</span>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSidebar}
            className="h-8 w-8 p-0"
          >
            <Menu className="h-4 w-4" />
          </Button>
        </div>
        <ScrollArea className="flex-1 px-3 py-2">
          <SidebarContent
            items={sidebarItems}
            isActive={isActive}
            session={session}
            isCollapsed={isCollapsed}
          />
        </ScrollArea>
        <div className="border-t p-4">
          <div className={cn("flex items-center space-x-2", isCollapsed && "justify-center")}>
            <Avatar className="h-8 w-8">
              <AvatarImage src={session?.user?.image || ""} alt={session?.user?.name || ""} />
              <AvatarFallback>
                {session?.user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{session?.user?.name}</p>
                <p className="text-xs text-muted-foreground truncate">{session?.user?.email}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

interface SidebarContentProps {
  items: SidebarItem[]
  isActive: (href: string) => boolean
  session: any
  isCollapsed?: boolean
  onClose?: () => void
}

function SidebarContent({ items, isActive, session, isCollapsed = false, onClose }: SidebarContentProps) {
  return (
    <nav className="space-y-2">
      {items.map((item) => (
        <SidebarItemComponent
          key={item.href}
          item={item}
          isActive={isActive}
          isCollapsed={isCollapsed}
          onClose={onClose}
        />
      ))}
    </nav>
  )
}

interface SidebarItemComponentProps {
  item: SidebarItem
  isActive: (href: string) => boolean
  isCollapsed: boolean
  onClose?: () => void
}

function SidebarItemComponent({ item, isActive, isCollapsed, onClose }: SidebarItemComponentProps) {
  const [isExpanded, setIsExpanded] = React.useState(false)

  if (item.children) {
    return (
      <div className="space-y-1">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={cn(
            "w-full flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors",
            isActive(item.href) && "bg-accent text-accent-foreground",
            isCollapsed && "justify-center px-2"
          )}
        >
          <div className="flex items-center space-x-2">
            {item.icon}
            {!isCollapsed && <span>{item.title}</span>}
          </div>
          {!isCollapsed && (
            <ChevronDown className={cn("h-4 w-4 transition-transform", isExpanded && "rotate-180")} />
          )}
        </button>
        {isExpanded && !isCollapsed && (
          <div className="ml-4 space-y-1">
            {item.children.map((child) => (
              <SidebarItemComponent
                key={child.href}
                item={child}
                isActive={isActive}
                isCollapsed={isCollapsed}
                onClose={onClose}
              />
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <Link
      href={item.href}
      onClick={onClose}
      className={cn(
        "flex items-center space-x-2 rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors",
        isActive(item.href) && "bg-accent text-accent-foreground",
        isCollapsed && "justify-center px-2"
      )}
    >
      {item.icon}
      {!isCollapsed && (
        <>
          <span className="flex-1">{item.title}</span>
          {item.badge && (
            <span className="ml-auto bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-xs">
              {item.badge}
            </span>
          )}
        </>
      )}
    </Link>
  )
}