'use client'

import React, { useState } from 'react'
import { DashboardLayout, PageHeader } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useRequireAuth } from '@/hooks/use-auth'
import {
  Settings,
  User,
  Bell,
  Mail,
  Phone,
  Calendar,
  Clock,
  Save,
  RefreshCw,
  Eye,
  EyeOff,
  Lock,
  Globe,
  Palette,
  HelpCircle,
  GraduationCap,
  BookOpen,
  Target,
  Award,
  TrendingUp,
  FileText,
  Download,
  Upload,
  AlertTriangle,
  CheckCircle,
  Info,
} from 'lucide-react'
import { toast } from 'sonner'

export default function TeacherSettingsPage() {
  const { user } = useRequireAuth('TEACHER')
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('profile')

  // Profile Settings
  const [profileSettings, setProfileSettings] = useState({
    firstName: 'John',
    lastName: 'Teacher',
    email: 'teacher@school.edu',
    phone: '+1-234-567-8900',
    specialization: 'Mathematics',
    qualification: 'M.Sc. Mathematics',
    employeeId: 'T001',
    department: 'Mathematics',
    bio: 'Experienced mathematics teacher with 10+ years of teaching experience.',
  })

  // Notification Settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    attendanceReminders: true,
    gradeAlerts: true,
    deadlineAlerts: true,
    systemUpdates: false,
    parentMessages: true,
    adminAnnouncements: true,
  })

  // Preferences Settings
  const [preferencesSettings, setPreferencesSettings] = useState({
    language: 'en',
    timezone: 'UTC',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h',
    theme: 'light',
    defaultView: 'dashboard',
    itemsPerPage: 10,
  })

  // Privacy Settings
  const [privacySettings, setPrivacySettings] = useState({
    showProfile: true,
    showEmail: false,
    showPhone: false,
    showQualifications: true,
    allowMessages: true,
    allowDataSharing: false,
  })

  const handleSaveSettings = async (section: string) => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success(`${section} settings saved successfully`)
    } catch (error) {
      toast.error(`Failed to save ${section} settings`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleExportData = async () => {
    setIsLoading(true)
    try {
      // Simulate data export
      await new Promise(resolve => setTimeout(resolve, 2000))
      toast.success('Data exported successfully')
    } catch (error) {
      toast.error('Failed to export data')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          title="Settings"
          description="Manage your profile and preferences"
        />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
            <TabsTrigger value="privacy">Privacy</TabsTrigger>
          </TabsList>

          {/* Profile Settings */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Profile Information
                </CardTitle>
                <CardDescription>
                  Update your personal and professional information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        value={profileSettings.firstName}
                        onChange={(e) => setProfileSettings(prev => ({ ...prev, firstName: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={profileSettings.lastName}
                        onChange={(e) => setProfileSettings(prev => ({ ...prev, lastName: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profileSettings.email}
                        onChange={(e) => setProfileSettings(prev => ({ ...prev, email: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={profileSettings.phone}
                        onChange={(e) => setProfileSettings(prev => ({ ...prev, phone: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="employeeId">Employee ID</Label>
                      <Input
                        id="employeeId"
                        value={profileSettings.employeeId}
                        onChange={(e) => setProfileSettings(prev => ({ ...prev, employeeId: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="department">Department</Label>
                      <Input
                        id="department"
                        value={profileSettings.department}
                        onChange={(e) => setProfileSettings(prev => ({ ...prev, department: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="specialization">Specialization</Label>
                    <Input
                      id="specialization"
                      value={profileSettings.specialization}
                      onChange={(e) => setProfileSettings(prev => ({ ...prev, specialization: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="qualification">Qualification</Label>
                    <Input
                      id="qualification"
                      value={profileSettings.qualification}
                      onChange={(e) => setProfileSettings(prev => ({ ...prev, qualification: e.target.value }))}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={profileSettings.bio}
                    onChange={(e) => setProfileSettings(prev => ({ ...prev, bio: e.target.value }))}
                    rows={4}
                  />
                </div>

                <div className="flex justify-end">
                  <Button onClick={() => handleSaveSettings('Profile')} disabled={isLoading}>
                    {isLoading ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Save Profile
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notification Settings */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notification Preferences
                </CardTitle>
                <CardDescription>
                  Choose which notifications you want to receive
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Email Notifications</h4>
                      <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                    </div>
                    <Switch
                      checked={notificationSettings.emailNotifications}
                      onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, emailNotifications: checked }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Attendance Reminders</h4>
                      <p className="text-sm text-muted-foreground">Get reminded to take attendance</p>
                    </div>
                    <Switch
                      checked={notificationSettings.attendanceReminders}
                      onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, attendanceReminders: checked }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Grade Alerts</h4>
                      <p className="text-sm text-muted-foreground">Alerts when grades are submitted</p>
                    </div>
                    <Switch
                      checked={notificationSettings.gradeAlerts}
                      onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, gradeAlerts: checked }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Deadline Alerts</h4>
                      <p className="text-sm text-muted-foreground">Reminders for upcoming deadlines</p>
                    </div>
                    <Switch
                      checked={notificationSettings.deadlineAlerts}
                      onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, deadlineAlerts: checked }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">System Updates</h4>
                      <p className="text-sm text-muted-foreground">System maintenance and updates</p>
                    </div>
                    <Switch
                      checked={notificationSettings.systemUpdates}
                      onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, systemUpdates: checked }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Parent Messages</h4>
                      <p className="text-sm text-muted-foreground">Messages from parents</p>
                    </div>
                    <Switch
                      checked={notificationSettings.parentMessages}
                      onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, parentMessages: checked }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Admin Announcements</h4>
                      <p className="text-sm text-muted-foreground">Announcements from administrators</p>
                    </div>
                    <Switch
                      checked={notificationSettings.adminAnnouncements}
                      onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, adminAnnouncements: checked }))}
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={() => handleSaveSettings('Notifications')} disabled={isLoading}>
                    {isLoading ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Save Notifications
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Preferences Settings */}
          <TabsContent value="preferences" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Preferences
                </CardTitle>
                <CardDescription>
                  Customize your interface and display preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="language">Language</Label>
                      <Select value={preferencesSettings.language} onValueChange={(value) => setPreferencesSettings(prev => ({ ...prev, language: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="es">Spanish</SelectItem>
                          <SelectItem value="fr">French</SelectItem>
                          <SelectItem value="de">German</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="timezone">Timezone</Label>
                      <Select value={preferencesSettings.timezone} onValueChange={(value) => setPreferencesSettings(prev => ({ ...prev, timezone: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="UTC">UTC</SelectItem>
                          <SelectItem value="EST">EST</SelectItem>
                          <SelectItem value="PST">PST</SelectItem>
                          <SelectItem value="CST">CST</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="dateFormat">Date Format</Label>
                      <Select value={preferencesSettings.dateFormat} onValueChange={(value) => setPreferencesSettings(prev => ({ ...prev, dateFormat: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                          <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                          <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="timeFormat">Time Format</Label>
                      <Select value={preferencesSettings.timeFormat} onValueChange={(value) => setPreferencesSettings(prev => ({ ...prev, timeFormat: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="12h">12-hour</SelectItem>
                          <SelectItem value="24h">24-hour</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="theme">Theme</Label>
                      <Select value={preferencesSettings.theme} onValueChange={(value) => setPreferencesSettings(prev => ({ ...prev, theme: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="light">Light</SelectItem>
                          <SelectItem value="dark">Dark</SelectItem>
                          <SelectItem value="system">System</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="defaultView">Default View</Label>
                      <Select value={preferencesSettings.defaultView} onValueChange={(value) => setPreferencesSettings(prev => ({ ...prev, defaultView: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="dashboard">Dashboard</SelectItem>
                          <SelectItem value="classes">Classes</SelectItem>
                          <SelectItem value="attendance">Attendance</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="itemsPerPage">Items Per Page</Label>
                    <Select value={preferencesSettings.itemsPerPage.toString()} onValueChange={(value) => setPreferencesSettings(prev => ({ ...prev, itemsPerPage: parseInt(value) }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="25">25</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                        <SelectItem value="100">100</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={() => handleSaveSettings('Preferences')} disabled={isLoading}>
                    {isLoading ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Save Preferences
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Privacy Settings */}
          <TabsContent value="privacy" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Privacy Settings
                </CardTitle>
                <CardDescription>
                  Control your privacy and data sharing preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Show Profile</h4>
                      <p className="text-sm text-muted-foreground">Make your profile visible to others</p>
                    </div>
                    <Switch
                      checked={privacySettings.showProfile}
                      onCheckedChange={(checked) => setPrivacySettings(prev => ({ ...prev, showProfile: checked }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Show Email</h4>
                      <p className="text-sm text-muted-foreground">Display email address publicly</p>
                    </div>
                    <Switch
                      checked={privacySettings.showEmail}
                      onCheckedChange={(checked) => setPrivacySettings(prev => ({ ...prev, showEmail: checked }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Show Phone</h4>
                      <p className="text-sm text-muted-foreground">Display phone number publicly</p>
                    </div>
                    <Switch
                      checked={privacySettings.showPhone}
                      onCheckedChange={(checked) => setPrivacySettings(prev => ({ ...prev, showPhone: checked }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Show Qualifications</h4>
                      <p className="text-sm text-muted-foreground">Display your qualifications</p>
                    </div>
                    <Switch
                      checked={privacySettings.showQualifications}
                      onCheckedChange={(checked) => setPrivacySettings(prev => ({ ...prev, showQualifications: checked }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Allow Messages</h4>
                      <p className="text-sm text-muted-foreground">Allow others to send you messages</p>
                    </div>
                    <Switch
                      checked={privacySettings.allowMessages}
                      onCheckedChange={(checked) => setPrivacySettings(prev => ({ ...prev, allowMessages: checked }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Data Sharing</h4>
                      <p className="text-sm text-muted-foreground">Share data with third-party services</p>
                    </div>
                    <Switch
                      checked={privacySettings.allowDataSharing}
                      onCheckedChange={(checked) => setPrivacySettings(prev => ({ ...prev, allowDataSharing: checked }))}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Export Data</h4>
                      <p className="text-sm text-muted-foreground">Download your personal data</p>
                    </div>
                    <Button variant="outline" onClick={handleExportData} disabled={isLoading}>
                      {isLoading ? (
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Download className="h-4 w-4 mr-2" />
                      )}
                      Export
                    </Button>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={() => handleSaveSettings('Privacy')} disabled={isLoading}>
                    {isLoading ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Save Privacy Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}