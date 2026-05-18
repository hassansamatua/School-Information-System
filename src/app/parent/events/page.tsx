'use client'

import React, { useEffect, useState } from 'react'
import { DashboardLayout, PageHeader } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useRequireAuth } from '@/hooks/use-auth'
import { Calendar, MapPin, Clock, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'

interface EventItem {
  id: string
  title: string
  description: string
  type: string
  eventDate: string
  eventTime?: string | null
  venue?: string | null
  postedByName?: string
}

export default function ParentEventsPage() {
  const { isAuthorized } = useRequireAuth('PARENT')
  const [items, setItems] = useState<EventItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!isAuthorized) return
    ;(async () => {
      try {
        const res = await fetch('/api/events?upcoming=1')
        if (!res.ok) throw new Error(`Failed (${res.status})`)
        setItems(await res.json())
      } catch (e: any) {
        toast.error(e?.message || 'Failed to load events')
      } finally {
        setIsLoading(false)
      }
    })()
  }, [isAuthorized])

  if (!isAuthorized) return <div className="p-6">Loading...</div>

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <PageHeader title="School Events" description="Upcoming school events" />

        {isLoading ? (
          <div className="flex items-center justify-center py-10 text-muted-foreground">
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> Loading events...
          </div>
        ) : items.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">No upcoming events</CardContent>
          </Card>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {items.map(e => (
              <Card key={e.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Calendar className="h-4 w-4 text-purple-600" />
                      {e.title}
                    </CardTitle>
                    <Badge variant="outline">{e.type}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 space-y-2 text-sm">
                  <p className="text-muted-foreground whitespace-pre-wrap">{e.description}</p>
                  <div className="flex flex-wrap gap-3 text-xs text-muted-foreground pt-2">
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(e.eventDate).toLocaleDateString()}
                    </span>
                    {e.eventTime ? (
                      <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" />{e.eventTime}</span>
                    ) : null}
                    {e.venue ? (
                      <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" />{e.venue}</span>
                    ) : null}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
