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
  Users,
  GraduationCap,
  Download,
  Upload,
  AlertTriangle,
  CheckCircle,
  Info,
  MapPin,
  CreditCard,
  Shield,
  Smartphone,
  MessageSquare,
  Trash2,
} from 'lucide-react'
import { toast } from 'sonner'

export default function ParentSettingsPage() {
  const { user } = useRequireAuth('PARENT')
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('profile')

  // Profile Settings
  const [profileSettings, setProfileSettings] = useState({
    firstName: 'Jane',
    lastName: 'Parent',
    email: 'parent@school.edu',
    phone: '+1-234-567-8900',
    address: '123 Main St, City',
    emergencyContact: '+1-234-567-8901',
    occupation: 'Software Engineer',
    bio: 'Parent of two students, actively involved in school activities.',
  })

  // Notification Settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: true,
    attendanceAlerts: true,
    gradeAlerts: true,
    deadlineAlerts: true,
    schoolAnnouncements: true,
    teacherMessages: true,
    systemUpdates: false,
  })

  // Communication Settings
  const [communicationSettings, setCommunicationSettings] = useState({
    preferredLanguage: 'en',
    preferredContact: 'email',
    allowTeacherMessages: true,
    allowSchoolCalls: true,
    allowSmsAlerts: true,
    emailDigest: 'weekly',
  })

  // Privacy Settings
  const [privacySettings, setPrivacySettings] = useState({
    showProfile: true,
    showEmail: false,
    showPhone: false,
    showAddress: false,
    allowDirectoryListing: false,
    allowDataSharing: false,
  })

  // Payment Settings
  const [paymentSettings, setPaymentSettings] = useState({
    paymentMethod: 'credit_card',
    autoPay: false,
    billingAddress: '123 Main St, City',
    billingEmail: 'parent@school.edu',
    paymentReminders: true,
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
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="communication">Communication</TabsTrigger>
            <TabsTrigger value="privacy">Privacy</TabsTrigger>
            <TabsTrigger value="payment">Payment</TabsTrigger>
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
                  Update your personal and contact information
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
                      <Label htmlFor="address">Address</Label>
                      <Textarea
                        id="address"
                        value={profileSettings.address}
                        onChange={(e) => setProfileSettings(prev => ({ ...prev, address: e.target.value }))}
                        rows={2}
                      />
                    </div>
                    <div>
                      <Label htmlFor="emergencyContact">Emergency Contact</Label>
                      <Input
                        id="emergencyContact"
                        value={profileSettings.emergencyContact}
                        onChange={(e) => setProfileSettings(prev => ({ ...prev, emergencyContact: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="occupation">Occupation</Label>
                    <Input
                      id="occupation"
                      value={profileSettings.occupation}
                      onChange={(e) => setProfileSettings(prev => ({ ...prev, occupation: e.target.value }))}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={profileSettings.bio}
                    onChange={(e) => setProfileSettings(prev => ({ ...prev, bio: e.target.value }))}
                    rows={3}
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
                  Choose how and when you want to receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Notification Channels</h4>
                      <p className="text-sm text-muted-foreground">Select your preferred notification methods</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={notificationSettings.emailNotifications}
                        onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, emailNotifications: checked }))}
                      />
                      <Label htmlFor="emailNotifications">Email Notifications</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={notificationSettings.smsNotifications}
                        onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, smsNotifications: checked }))}
                      />
                      <Label htmlFor="smsNotifications">SMS Notifications</Label>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Alert Types</h4>
                      <p className="text-sm text-muted-foreground">Choose which alerts to receive</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={notificationSettings.attendanceAlerts}
                        onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, attendanceAlerts: checked }))}
                      />
                      <Label htmlFor="attendanceAlerts">Attendance Alerts</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={notificationSettings.gradeAlerts}
                        onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, gradeAlerts: checked }))}
                      />
                      <Label htmlFor="gradeAlerts">Grade Alerts</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={notificationSettings.deadlineAlerts}
                        onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, deadlineAlerts: checked }))}
                      />
                      <Label htmlFor="deadlineAlerts">Deadline Alerts</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={notificationSettings.schoolAnnouncements}
                        onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, schoolAnnouncements: checked }))}
                      />
                      <Label htmlFor="schoolAnnouncements">School Announcements</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={notificationSettings.teacherMessages}
                        onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, teacherMessages: checked }))}
                      />
                      <Label htmlFor="teacherMessages">Teacher Messages</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={notificationSettings.systemUpdates}
                        onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, systemUpdates: checked }))}
                      />
                      <Label htmlFor="systemUpdates">System Updates</Label>
                    </div>
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

          {/* Communication Settings */}
          <TabsContent value="communication" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Communication Preferences
                </CardTitle>
                <CardDescription>
                  Set your communication preferences and contact methods
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="preferredLanguage">Preferred Language</Label>
                      <Select value={communicationSettings.preferredLanguage} onValueChange={(value) => setCommunicationSettings(prev => ({ ...prev, preferredLanguage: value }))}>
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
                      <Label htmlFor="preferredContact">Preferred Contact Method</Label>
                      <Select value={communicationSettings.preferredContact} onValueChange={(value) => setCommunicationSettings(prev => ({ ...prev, preferredContact: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="email">Email</SelectItem>
                          <SelectItem value="phone">Phone</SelectItem>
                          <SelectItem value="sms">SMS</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="emailDigest">Email Digest Frequency</Label>
                      <Select value={communicationSettings.emailDigest} onValueChange={(value) => setCommunicationSettings(prev => ({ ...prev, emailDigest: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                          <SelectItem value="never">Never</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Communication Options</h4>
                      <p className="text-sm text-muted-foreground">Configure your communication preferences</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={communicationSettings.allowTeacherMessages}
                        onCheckedChange={(checked) => setCommunicationSettings(prev => ({ ...prev, allowTeacherMessages: checked }))}
                      />
                      <Label htmlFor="allowTeacherMessages">Allow Teacher Messages</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={communicationSettings.allowSchoolCalls}
                        onCheckedChange={(checked) => setCommunicationSettings(prev => ({ ...prev, allowSchoolCalls: checked }))}
                      />
                      <Label htmlFor="allowSchoolCalls">Allow School Calls</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={communicationSettings.allowSmsAlerts}
                        onCheckedChange={(checked) => setCommunicationSettings(prev => ({ ...prev, allowSmsAlerts: checked }))}
                      />
                      <Label htmlFor="allowSmsAlerts">Allow SMS Alerts</Label>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={() => handleSaveSettings('Communication')} disabled={isLoading}>
                    {isLoading ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Save Communication Settings
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
                      <h4 className="font-medium">Profile Visibility</h4>
                      <p className="text-sm text-muted-foreground">Control what information is visible to others</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={privacySettings.showProfile}
                        onCheckedChange={(checked) => setPrivacySettings(prev => ({ ...prev, showProfile: checked }))}
                      />
                      <Label htmlFor="showProfile">Show Profile</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={privacySettings.showEmail}
                        onCheckedChange={(checked) => setPrivacySettings(prev => ({ ...prev, showEmail: checked }))}
                      />
                      <Label htmlFor="showEmail">Show Email</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={privacySettings.showPhone}
                        onCheckedChange={(checked) => setPrivacySettings(prev => ({ ...prev, showPhone: checked }))}
                      />
                      <Label htmlFor="showPhone">Show Phone</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={privacySettings.showAddress}
                        onCheckedChange={(checked) => setPrivacySettings(prev => ({ ...prev, showAddress: checked }))}
                      />
                      <Label htmlFor="showAddress">Show Address</Label>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Data Sharing</h4>
                      <p className="text-sm text-muted-foreground">Control how your data is shared</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={privacySettings.allowDirectoryListing}
                        onCheckedChange={(checked) => setPrivacySettings(prev => ({ ...prev, allowDirectoryListing: checked }))}
                      />
                      <Label htmlFor="allowDirectoryListing">Allow Directory Listing</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={privacySettings.allowDataSharing}
                        onCheckedChange={(checked) => setPrivacySettings(prev => ({ ...prev, allowDataSharing: checked }))}
                      />
                      <Label htmlFor="allowDataSharing">Allow Data Sharing</Label>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Data Management</h4>
                      <p className="text-sm text-muted-foreground">Export or delete your data</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" onClick={handleExportData} disabled={isLoading}>
                      {isLoading ? (
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Download className="h-4 w-4 mr-2" />
                      )}
                      Export Data
                    </Button>
                    <Button variant="outline" className="text-red-600 hover:text-red-700">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Account
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

          {/* Payment Settings */}
          <TabsContent value="payment" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Settings
                </CardTitle>
                <CardDescription>
                  Manage your payment methods and billing information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Payment Method</h4>
                      <p className="text-sm text-muted-foreground">Choose your preferred payment method</p>
                    </div>
                  </div>
                  <Select value={paymentSettings.paymentMethod} onValueChange={(value) => setPaymentSettings(prev => ({ ...prev, paymentMethod: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="credit_card">Credit Card</SelectItem>
                      <SelectItem value="debit_card">Debit Card</SelectItem>
                      <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                      <SelectItem value="paypal">PayPal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={paymentSettings.autoPay}
                    onCheckedChange={(checked) => setPaymentSettings(prev => ({ ...prev, autoPay: checked }))}
                  />
                  <Label htmlFor="autoPay">Enable Auto-Pay</Label>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium">Billing Information</h4>
                    <p className="text-sm text-muted-foreground">Update your billing address and preferences</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="billingAddress">Billing Address</Label>
                      <Textarea
                        id="billingAddress"
                        value={paymentSettings.billingAddress}
                        onChange={(e) => setPaymentSettings(prev => ({ ...prev, billingAddress: e.target.value }))}
                        rows={2}
                      />
                    </div>
                    <div>
                      <Label htmlFor="billingEmail">Billing Email</Label>
                      <Input
                        id="billingEmail"
                        type="email"
                        value={paymentSettings.billingEmail}
                        onChange={(e) => setPaymentSettings(prev => ({ ...prev, billingEmail: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    checked={paymentSettings.paymentReminders}
                    onCheckedChange={(checked) => setPaymentSettings(prev => ({ ...prev, paymentReminders: checked }))}
                  />
                  <Label htmlFor="paymentReminders">Payment Reminders</Label>
                </div>

                <div className="flex justify-end">
                  <Button onClick={() => handleSaveSettings('Payment')} disabled={isLoading}>
                    {isLoading ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Save Payment Settings
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