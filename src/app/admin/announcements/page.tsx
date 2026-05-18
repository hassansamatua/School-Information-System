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
import { Plus, Pencil, Trash2, Bell, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'

interface Announcement {
  id: string
  title: string
  content: string
  type: string
  targetAudience: string
  targetId?: string | null
  status: string
  publishedAt?: string | null
  expiresAt?: string | null
  postedByName?: string
  createdAt: string
}

const TYPES = ['GENERAL', 'URGENT', 'ACADEMIC', 'EVENT', 'POLICY']
const AUDIENCES = ['ALL', 'TEACHERS', 'PARENTS']

const empty = {
  title: '',
  content: '',
  type: 'GENERAL',
  targetAudience: 'ALL',
  status: 'PUBLISHED',
  expiresAt: '',
}

export default function AdminAnnouncementsPage() {
  const { isAuthorized } = useRequireAuth('ADMIN')
  const [items, setItems] = useState<Announcement[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({ ...empty })

  const load = async () => {
    try {
      setIsLoading(true)
      const res = await fetch('/api/announcements')
      if (!res.ok) throw new Error(`Failed (${res.status})`)
      setItems(await res.json())
    } catch (e: any) {
      toast.error(e?.message || 'Failed to load announcements')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { if (isAuthorized) load() }, [isAuthorized])

  const openCreate = () => { setEditingId(null); setForm({ ...empty }); setOpen(true) }
  const openEdit = (a: Announcement) => {
    setEditingId(a.id)
    setForm({
      title: a.title,
      content: a.content,
      type: a.type,
      targetAudience: a.targetAudience,
      status: a.status,
      expiresAt: a.expiresAt ? a.expiresAt.slice(0, 10) : '',
    })
    setOpen(true)
  }

  const submit = async () => {
    if (!form.title.trim() || !form.content.trim()) {
      toast.error('Title and content are required')
      return
    }
    try {
      const url = editingId ? `/api/announcements/${editingId}` : '/api/announcements'
      const method = editingId ? 'PATCH' : 'POST'
      const body: any = { ...form, expiresAt: form.expiresAt || null }
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || `Failed (${res.status})`)
      }
      toast.success(editingId ? 'Announcement updated' : 'Announcement published')
      setOpen(false)
      await load()
    } catch (e: any) {
      toast.error(e?.message || 'Failed to save announcement')
    }
  }

  const remove = async (id: string) => {
    if (!confirm('Delete this announcement?')) return
    try {
      const res = await fetch(`/api/announcements/${id}`, { method: 'DELETE' })
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
        <PageHeader title="Announcements" description="Publish and manage school announcements">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" />New Announcement</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>{editingId ? 'Edit Announcement' : 'New Announcement'}</DialogTitle>
                <DialogDescription>Publishes immediately when status is PUBLISHED.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-2">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Audience</Label>
                    <Select value={form.targetAudience} onValueChange={(v) => setForm({ ...form, targetAudience: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {AUDIENCES.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Content</Label>
                  <Textarea rows={6} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DRAFT">DRAFT</SelectItem>
                        <SelectItem value="PUBLISHED">PUBLISHED</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Expires (optional)</Label>
                    <Input type="date" value={form.expiresAt} onChange={(e) => setForm({ ...form, expiresAt: e.target.value })} />
                  </div>
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
            <CardTitle className="flex items-center gap-2"><Bell className="h-5 w-5" /> All Announcements</CardTitle>
            <CardDescription>{items.length} total</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-10 text-muted-foreground">
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> Loading...
              </div>
            ) : items.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">No announcements yet</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Audience</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Posted</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map(a => (
                    <TableRow key={a.id}>
                      <TableCell className="font-medium max-w-[260px] truncate">{a.title}</TableCell>
                      <TableCell><Badge variant="outline">{a.type}</Badge></TableCell>
                      <TableCell>{a.targetAudience}</TableCell>
                      <TableCell>
                        <Badge variant={a.status === 'PUBLISHED' ? 'default' : 'secondary'}>{a.status}</Badge>
                      </TableCell>
                      <TableCell>{new Date(a.publishedAt || a.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button size="icon" variant="ghost" onClick={() => openEdit(a)}><Pencil className="h-4 w-4" /></Button>
                          <Button size="icon" variant="ghost" onClick={() => remove(a.id)}><Trash2 className="h-4 w-4 text-red-600" /></Button>
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
