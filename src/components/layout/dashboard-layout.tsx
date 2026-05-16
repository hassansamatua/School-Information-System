'use client'

import React from 'react'
import { Sidebar } from './sidebar'
import { Header } from './header'
import { cn } from '@/lib/utils'

interface DashboardLayoutProps {
  children: React.ReactNode
  title?: string
  subtitle?: string
  className?: string
}

export function DashboardLayout({ children, title, subtitle, className }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden md:block md:w-64 md:fixed md:h-screen md:inset-y-0 md:z-50">
          <div className="flex h-full max-h-screen flex-col gap-2">
            <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
              <h2 className="text-xl font-semibold">School System</h2>
            </div>
            <div className="flex-1">
              <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
                <Sidebar />
              </nav>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex flex-1 flex-col md:ml-64">
          {/* Header */}
          <Header title={title} subtitle={subtitle} />

          {/* Page Content */}
          <main className={cn('flex-1 space-y-4 p-4 md:p-8', className)}>
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}

interface PageHeaderProps {
  title: string
  description?: string
  children?: React.ReactNode
}

export function PageHeader({ title, description, children }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between space-y-2 pb-4">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
        {description && (
          <p className="text-muted-foreground">{description}</p>
        )}
      </div>
      {children && <div className="flex items-center space-x-2">{children}</div>}
    </div>
  )
}

interface SectionHeaderProps {
  title: string
  description?: string
  children?: React.ReactNode
}

export function SectionHeader({ title, description, children }: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between space-y-2 pb-4">
      <div>
        <h3 className="text-lg font-semibold">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {children && <div className="flex items-center space-x-2">{children}</div>}
    </div>
  )
}