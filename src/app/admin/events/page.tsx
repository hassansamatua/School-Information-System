'use client'

import React, { useEffect, useState } from 'react'
import { DashboardLayout, PageHeader } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { useRequireAuth } from '@/hooks/use-auth'
import { Plus, Pencil, Trash2, Calendar, RefreshCw, MapPin } from 'lucide-react'
import { toast } from 'sonner'

interface EventItem {
  id: string
  title: string
  description: string
  type: string
  targetAudience: string
  status: string
  eventDate: string
  eventTime?: string | null
  venue?: string | null
  postedByName?: string
  createdAt: string
}

const TYPES = ['GENERAL', 'ACADEMIC', 'SPORTS', 'CULTURAL', 'MEETING', 'HOLIDAY']
const AUDIENCES = ['ALL', 'TEACHERS', 'PARENTS']

const empty = {
  title: '',
  description: '',
  type: 'GENERAL',
  targetAudience: 'ALL',
  status: 'PUBLISHED',
  eventDate: '',
  eventTime: '',
  venue: '',
}

export default function AdminEventsPage() {
  const { isAuthorized } = useRequireAuth('ADMIN')
  const [items, setItems] = useState<EventItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({ ...empty })

  const load = async () => {
    try {
      setIsLoading(true)
      const res = await fetch('/api/events')
      if (!res.ok) throw new Error(`Failed (${res.status})`)
      setItems(await res.json())
    } catch (e: any) {
      toast.error(e?.message || 'Failed to load events')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { if (isAuthorized) load() }, [isAuthorized])

  const openCreate = () => { setEditingId(null); setForm({ ...empty }); setOpen(true) }
  const openEdit = (e: EventItem) => {
    setEditingId(e.id)
    setForm({
      title: e.title,
      description: e.description,
      type: e.type,
      targetAudience: e.targetAudience,
      status: e.status,
      eventDate: e.eventDate ? e.eventDate.slice(0, 10) : '',
      eventTime: e.eventTime || '',
      venue: e.venue || '',
    })
    setOpen(true)
  }

  const submit = async () => {
    if (!form.title.trim() || !form.description.trim() || !form.eventDate) {
      toast.error('Title, description, and event date are required')
      return
    }
    try {
      const url = editingId ? `/api/events/${editingId}` : '/api/events'
      const method = editingId ? 'PATCH' : 'POST'
      const body: any = { ...form, eventTime: form.eventTime || null, venue: form.venue || null }
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || `Failed (${res.status})`)
      }
      toast.success(editingId ? 'Event updated' : 'Event published')
      setOpen(false)
      await load()
    } catch (e: any) {
      toast.error(e?.message || 'Failed to save event')
    }
  }

  const remove = async (id: string) => {
    if (!confirm('Delete this event?')) return
    try {
      const res = await fetch(`/api/events/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error(`Failed (${res.status})`)
      toast.success('Deleted')
      await load()
    } catch (e: any) {
      toast.error(e?.message || 'Failed to delete')
    }
  }

  if (!isAuthorized) return <div className="p-6">Loading...</div>

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader title="Events" description="Schedule and manage school events">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" />New Event</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>{editingId ? 'Edit Event' : 'New Event'}</DialogTitle>
                <DialogDescription>Publishes to the selected audience immediately.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-2">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Audience</Label>
                    <Select value={form.targetAudience} onValueChange={(v) => setForm({ ...form, targetAudience: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{AUDIENCES.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea rows={5} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Date</Label>
                    <Input type="date" value={form.eventDate} onChange={(e) => setForm({ ...form, eventDate: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Time</Label>
                    <Input type="time" value={form.eventTime} onChange={(e) => setForm({ ...form, eventTime: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DRAFT">DRAFT</SelectItem>
                        <SelectItem value="PUBLISHED">PUBLISHED</SelectItem>
                        <SelectItem value="CANCELLED">CANCELLED</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Venue</Label>
                  <Input value={form.venue} onChange={(e) => setForm({ ...form, venue: e.target.value })} placeholder="Optional" />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button onClick={submit}>{editingId ? 'Save' : 'Publish'}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </PageHeader>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5" /> All Events</CardTitle>
            <CardDescription>{items.length} total</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-10 text-muted-foreground">
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> Loading...
              </div>
            ) : items.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">No events scheduled</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Audience</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Venue</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map(e => (
                    <TableRow key={e.id}>
                      <TableCell className="font-medium max-w-[220px] truncate">{e.title}</TableCell>
                      <TableCell><Badge variant="outline">{e.type}</Badge></TableCell>
                      <TableCell>{e.targetAudience}</TableCell>
                      <TableCell>
                        {new Date(e.eventDate).toLocaleDateString()}
                        {e.eventTime ? <span className="text-xs text-muted-foreground ml-1">{e.eventTime}</span> : null}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {e.venue ? <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" />{e.venue}</span> : '—'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={e.status === 'PUBLISHED' ? 'default' : e.status === 'CANCELLED' ? 'destructive' : 'secondary'}>
                          {e.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button size="icon" variant="ghost" onClick={() => openEdit(e)}><Pencil className="h-4 w-4" /></Button>
                          <Button size="icon" variant="ghost" onClick={() => remove(e.id)}><Trash2 className="h-4 w-4 text-red-600" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
