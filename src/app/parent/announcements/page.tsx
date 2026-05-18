'use client'

import React, { useEffect, useState } from 'react'
import { DashboardLayout, PageHeader } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useRequireAuth } from '@/hooks/use-auth'
import { Bell, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'

interface Announcement {
  id: string
  title: string
  content: string
  type: string
  targetAudience: string
  publishedAt?: string | null
  postedByName?: string
  createdAt: string
}

export default function ParentAnnouncementsPage() {
  const { isAuthorized } = useRequireAuth('PARENT')
  const [items, setItems] = useState<Announcement[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!isAuthorized) return
    ;(async () => {
      try {
        const res = await fetch('/api/announcements')
        if (!res.ok) throw new Error(`Failed (${res.status})`)
        setItems(await res.json())
      } catch (e: any) {
        toast.error(e?.message || 'Failed to load announcements')
      } finally {
        setIsLoading(false)
      }
    })()
  }, [isAuthorized])

  if (!isAuthorized) return <div className="p-6">Loading...</div>

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <PageHeader title="Announcements" description="School announcements for parents" />

        {isLoading ? (
          <div className="flex items-center justify-center py-10 text-muted-foreground">
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> Loading announcements...
          </div>
        ) : items.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No announcements yet
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {items.map(a => (
              <Card key={a.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-4">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Bell className="h-4 w-4 text-blue-600" />
                      {a.title}
                    </CardTitle>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Badge variant={a.type === 'URGENT' ? 'destructive' : 'outline'}>{a.type}</Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(a.publishedAt || a.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{a.content}</p>
                  {a.postedByName ? (
                    <p className="text-xs text-muted-foreground mt-3">— {a.postedByName}</p>
                  ) : null}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
