'use client'

import React, { useState } from 'react'
import { DashboardLayout, PageHeader } from '@/components/layout/dashboard-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useRequireAuth } from '@/hooks/use-auth'
import {
  Settings,
  User,
  Shield,
  Database,
  Bell,
  Mail,
  Phone,
  Globe,
  Palette,
  Lock,
  CreditCard,
  Download,
  Upload,
  RefreshCw,
  Save,
  AlertTriangle,
  CheckCircle,
  Info,
  HelpCircle,
  FileText,
  Users,
  GraduationCap,
  Calendar,
  BarChart3,
  Activity,
  Clock,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Copy,
  Share,
  MoreHorizontal,
} from 'lucide-react'
import { toast } from 'sonner'

export default function AdminSettingsPage() {
  const { user } = useRequireAuth('ADMIN')
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('general')

  // General Settings
  const [generalSettings, setGeneralSettings] = useState({
    schoolName: 'School Information System',
    schoolCode: 'SIS001',
    address: '123 Education Street, City',
    phone: '+1-234-567-8900',
    email: 'admin@school.edu',
    website: 'https://school.edu',
    timezone: 'UTC',
    language: 'en',
    currency: 'USD',
  })

  // Security Settings
  const [securitySettings, setSecuritySettings] = useState({
    passwordMinLength: 8,
    passwordRequireUppercase: true,
    passwordRequireNumbers: true,
    passwordRequireSymbols: true,
    sessionTimeout: 30,
    twoFactorAuth: false,
    ipWhitelist: '',
    loginAttempts: 5,
    lockoutDuration: 15,
  })

  // Notification Settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    attendanceAlerts: true,
    gradeAlerts: true,
    deadlineAlerts: true,
    systemAlerts: true,
    maintenanceAlerts: true,
  })

  // System Settings
  const [systemSettings, setSystemSettings] = useState({
    maintenanceMode: false,
    debugMode: false,
    logLevel: 'info',
    backupFrequency: 'daily',
    autoCleanup: true,
    maxFileSize: 10,
    fileRetention: 30,
    apiRateLimit: 1000,
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

  const handleImportData = async () => {
    setIsLoading(true)
    try {
      // Simulate data import
      await new Promise(resolve => setTimeout(resolve, 2000))
      toast.success('Data imported successfully')
    } catch (error) {
      toast.error('Failed to import data')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSystemBackup = async () => {
    setIsLoading(true)
    try {
      // Simulate system backup
      await new Promise(resolve => setTimeout(resolve, 3000))
      toast.success('System backup completed successfully')
    } catch (error) {
      toast.error('Failed to create backup')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          title="Settings"
          description="Manage system settings and preferences"
        />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
            <TabsTrigger value="data">Data</TabsTrigger>
            <TabsTrigger value="backup">Backup</TabsTrigger>
          </TabsList>

          {/* General Settings */}
          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  General Settings
                </CardTitle>
                <CardDescription>
                  Configure basic school information and system preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="schoolName">School Name</Label>
                      <Input
                        id="schoolName"
                        value={generalSettings.schoolName}
                        onChange={(e) => setGeneralSettings(prev => ({ ...prev, schoolName: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="schoolCode">School Code</Label>
                      <Input
                        id="schoolCode"
                        value={generalSettings.schoolCode}
                        onChange={(e) => setGeneralSettings(prev => ({ ...prev, schoolCode: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={generalSettings.phone}
                        onChange={(e) => setGeneralSettings(prev => ({ ...prev, phone: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={generalSettings.email}
                        onChange={(e) => setGeneralSettings(prev => ({ ...prev, email: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="website">Website</Label>
                      <Input
                        id="website"
                        value={generalSettings.website}
                        onChange={(e) => setGeneralSettings(prev => ({ ...prev, website: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="address">Address</Label>
                      <Textarea
                        id="address"
                        value={generalSettings.address}
                        onChange={(e) => setGeneralSettings(prev => ({ ...prev, address: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select value={generalSettings.timezone} onValueChange={(value) => setGeneralSettings(prev => ({ ...prev, timezone: value }))}>
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
                    <Label htmlFor="language">Language</Label>
                    <Select value={generalSettings.language} onValueChange={(value) => setGeneralSettings(prev => ({ ...prev, language: value }))}>
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
                    <Label htmlFor="currency">Currency</Label>
                    <Select value={generalSettings.currency} onValueChange={(value) => setGeneralSettings(prev => ({ ...prev, currency: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="GBP">GBP</SelectItem>
                        <SelectItem value="JPY">JPY</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button onClick={() => handleSaveSettings('General')} disabled={isLoading}>
                    {isLoading ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Save General Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Settings */}
          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Security Settings
                </CardTitle>
                <CardDescription>
                  Configure security policies and authentication settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Password Requirements</h4>
                      <p className="text-sm text-muted-foreground">Configure password complexity requirements</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="passwordMinLength">Minimum Length</Label>
                      <Input
                        id="passwordMinLength"
                        type="number"
                        value={securitySettings.passwordMinLength}
                        onChange={(e) => setSecuritySettings(prev => ({ ...prev, passwordMinLength: parseInt(e.target.value) }))}
                      />
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="passwordRequireUppercase"
                          checked={securitySettings.passwordRequireUppercase}
                          onCheckedChange={(checked) => setSecuritySettings(prev => ({ ...prev, passwordRequireUppercase: checked }))}
                        />
                        <Label htmlFor="passwordRequireUppercase">Require Uppercase</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="passwordRequireNumbers"
                          checked={securitySettings.passwordRequireNumbers}
                          onCheckedChange={(checked) => setSecuritySettings(prev => ({ ...prev, passwordRequireNumbers: checked }))}
                        />
                        <Label htmlFor="passwordRequireNumbers">Require Numbers</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="passwordRequireSymbols"
                          checked={securitySettings.passwordRequireSymbols}
                          onCheckedChange={(checked) => setSecuritySettings(prev => ({ ...prev, passwordRequireSymbols: checked }))}
                        />
                        <Label htmlFor="passwordRequireSymbols">Require Symbols</Label>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Session Management</h4>
                      <p className="text-sm text-muted-foreground">Configure user session settings</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                      <Input
                        id="sessionTimeout"
                        type="number"
                        value={securitySettings.sessionTimeout}
                        onChange={(e) => setSecuritySettings(prev => ({ ...prev, sessionTimeout: parseInt(e.target.value) }))}
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="twoFactorAuth"
                        checked={securitySettings.twoFactorAuth}
                        onCheckedChange={(checked) => setSecuritySettings(prev => ({ ...prev, twoFactorAuth: checked }))}
                      />
                      <Label htmlFor="twoFactorAuth">Enable Two-Factor Authentication</Label>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Login Protection</h4>
                      <p className="text-sm text-muted-foreground">Configure login attempt limits and lockout policies</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="loginAttempts">Max Login Attempts</Label>
                      <Input
                        id="loginAttempts"
                        type="number"
                        value={securitySettings.loginAttempts}
                        onChange={(e) => setSecuritySettings(prev => ({ ...prev, loginAttempts: parseInt(e.target.value) }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="lockoutDuration">Lockout Duration (minutes)</Label>
                      <Input
                        id="lockoutDuration"
                        type="number"
                        value={securitySettings.lockoutDuration}
                        onChange={(e) => setSecuritySettings(prev => ({ ...prev, lockoutDuration: parseInt(e.target.value) }))}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={() => handleSaveSettings('Security')} disabled={isLoading}>
                    {isLoading ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Save Security Settings
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
                  Notification Settings
                </CardTitle>
                <CardDescription>
                  Configure notification preferences and alert settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Notification Channels</h4>
                      <p className="text-sm text-muted-foreground">Choose how to receive notifications</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="emailNotifications"
                        checked={notificationSettings.emailNotifications}
                        onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, emailNotifications: checked }))}
                      />
                      <Label htmlFor="emailNotifications">Email Notifications</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="smsNotifications"
                        checked={notificationSettings.smsNotifications}
                        onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, smsNotifications: checked }))}
                      />
                      <Label htmlFor="smsNotifications">SMS Notifications</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="pushNotifications"
                        checked={notificationSettings.pushNotifications}
                        onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, pushNotifications: checked }))}
                      />
                      <Label htmlFor="pushNotifications">Push Notifications</Label>
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
                        id="attendanceAlerts"
                        checked={notificationSettings.attendanceAlerts}
                        onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, attendanceAlerts: checked }))}
                      />
                      <Label htmlFor="attendanceAlerts">Attendance Alerts</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="gradeAlerts"
                        checked={notificationSettings.gradeAlerts}
                        onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, gradeAlerts: checked }))}
                      />
                      <Label htmlFor="gradeAlerts">Grade Alerts</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="deadlineAlerts"
                        checked={notificationSettings.deadlineAlerts}
                        onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, deadlineAlerts: checked }))}
                      />
                      <Label htmlFor="deadlineAlerts">Deadline Alerts</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="systemAlerts"
                        checked={notificationSettings.systemAlerts}
                        onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, systemAlerts: checked }))}
                      />
                      <Label htmlFor="systemAlerts">System Alerts</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="maintenanceAlerts"
                        checked={notificationSettings.maintenanceAlerts}
                        onCheckedChange={(checked) => setNotificationSettings(prev => ({ ...prev, maintenanceAlerts: checked }))}
                      />
                      <Label htmlFor="maintenanceAlerts">Maintenance Alerts</Label>
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
                    Save Notification Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* System Settings */}
          <TabsContent value="system" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  System Settings
                </CardTitle>
                <CardDescription>
                  Configure system behavior and maintenance options
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">System Status</h4>
                      <p className="text-sm text-muted-foreground">Configure system mode and debugging</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="maintenanceMode"
                        checked={systemSettings.maintenanceMode}
                        onCheckedChange={(checked) => setSystemSettings(prev => ({ ...prev, maintenanceMode: checked }))}
                      />
                      <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="debugMode"
                        checked={systemSettings.debugMode}
                        onCheckedChange={(checked) => setSystemSettings(prev => ({ ...prev, debugMode: checked }))}
                      />
                      <Label htmlFor="debugMode">Debug Mode</Label>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Logging</h4>
                      <p className="text-sm text-muted-foreground">Configure logging level and behavior</p>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="logLevel">Log Level</Label>
                    <Select value={systemSettings.logLevel} onValueChange={(value) => setSystemSettings(prev => ({ ...prev, logLevel: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="debug">Debug</SelectItem>
                        <SelectItem value="info">Info</SelectItem>
                        <SelectItem value="warning">Warning</SelectItem>
                        <SelectItem value="error">Error</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">Data Management</h4>
                      <p className="text-sm text-muted-foreground">Configure data retention and cleanup</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="backupFrequency">Backup Frequency</Label>
                      <Select value={systemSettings.backupFrequency} onValueChange={(value) => setSystemSettings(prev => ({ ...prev, backupFrequency: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="autoCleanup"
                        checked={systemSettings.autoCleanup}
                        onCheckedChange={(checked) => setSystemSettings(prev => ({ ...prev, autoCleanup: checked }))}
                      />
                      <Label htmlFor="autoCleanup">Auto Cleanup</Label>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="maxFileSize">Max File Size (MB)</Label>
                      <Input
                        id="maxFileSize"
                        type="number"
                        value={systemSettings.maxFileSize}
                        onChange={(e) => setSystemSettings(prev => ({ ...prev, maxFileSize: parseInt(e.target.value) }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="fileRetention">File Retention (days)</Label>
                      <Input
                        id="fileRetention"
                        type="number"
                        value={systemSettings.fileRetention}
                        onChange={(e) => setSystemSettings(prev => ({ ...prev, fileRetention: parseInt(e.target.value) }))}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={() => handleSaveSettings('System')} disabled={isLoading}>
                    {isLoading ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Save System Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Data Management */}
          <TabsContent value="data" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Download className="h-5 w-5" />
                    Export Data
                  </CardTitle>
                  <CardDescription>
                    Export system data for backup or analysis
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => handleExportData()}
                      disabled={isLoading}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export All Data
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => handleExportData()}
                      disabled={isLoading}
                    >
                      <Users className="h-4 w-4 mr-2" />
                      Export Users
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => handleExportData()}
                      disabled={isLoading}
                    >
                      <GraduationCap className="h-4 w-4 mr-2" />
                      Export Students
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => handleExportData()}
                      disabled={isLoading}
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Export Attendance
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => handleExportData()}
                      disabled={isLoading}
                    >
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Export Reports
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="h-5 w-5" />
                    Import Data
                  </CardTitle>
                  <CardDescription>
                    Import data from external sources
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => handleImportData()}
                      disabled={isLoading}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Import Users
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => handleImportData()}
                      disabled={isLoading}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Import Students
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => handleImportData()}
                      disabled={isLoading}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Import Classes
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => handleImportData()}
                      disabled={isLoading}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Import Attendance
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Backup Settings */}
          <TabsContent value="backup" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Backup & Recovery
                </CardTitle>
                <CardDescription>
                  Manage system backups and recovery options
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium">Manual Backup</h4>
                    <p className="text-sm text-muted-foreground">
                      Create a manual backup of the entire system
                    </p>
                    <Button
                      onClick={handleSystemBackup}
                      disabled={isLoading}
                      className="w-full"
                    >
                      {isLoading ? (
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Database className="h-4 w-4 mr-2" />
                      )}
                      Create Backup
                    </Button>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium">Restore from Backup</h4>
                    <p className="text-sm text-muted-foreground">
                      Restore system from a previous backup
                    </p>
                    <Button variant="outline" className="w-full">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Restore Backup
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Recent Backups</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium">Full System Backup</p>
                          <p className="text-sm text-muted-foreground">2 hours ago • 245 MB</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                          <CheckCircle className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">Users Backup</p>
                          <p className="text-sm text-muted-foreground">1 day ago • 12 MB</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="h-8 w-8 rounded-full bg-yellow-100 flex items-center justify-center">
                          <AlertTriangle className="h-4 w-4 text-yellow-600" />
                        </div>
                        <div>
                          <p className="font-medium">Partial Backup</p>
                          <p className="text-sm text-muted-foreground">3 days ago • 89 MB</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}