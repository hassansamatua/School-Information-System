'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { Loader2, Plus, Trash2, Eye, EyeOff } from 'lucide-react'
import { registerSchema } from '@/lib/validations'

interface ChildEntry {
  registrationNumber: string
  dateOfBirth: string
}

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
  })
  const [children, setChildren] = useState<ChildEntry[]>([
    { registrationNumber: '', dateOfBirth: '' },
  ])
  const [lockedUntil, setLockedUntil] = useState<number | null>(null)
  const [remainingAttempts, setRemainingAttempts] = useState<number | null>(null)
  const [now, setNow] = useState(Date.now())
  const router = useRouter()

  // Tick clock while locked so countdown updates
  React.useEffect(() => {
    if (!lockedUntil) return
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [lockedUntil])

  const isLocked = !!(lockedUntil && now < lockedUntil)
  const lockMsLeft = isLocked ? (lockedUntil! - now) : 0
  const lockMinutes = Math.floor(lockMsLeft / 60000)
  const lockSeconds = Math.floor((lockMsLeft % 60000) / 1000)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isLocked) return
    setIsLoading(true)

    try {
      const payload = { ...formData, children }
      const validatedData = registerSchema.parse(payload)

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(validatedData),
      })

      const result = await response.json()

      if (!response.ok) {
        if (result.lockedUntil) {
          setLockedUntil(result.lockedUntil)
          setRemainingAttempts(0)
        } else if (typeof result.remainingAttempts === 'number') {
          setRemainingAttempts(result.remainingAttempts)
        }
        throw new Error(result.error || 'Registration failed')
      }

      toast.success(result.message || 'Registration successful! Your account is pending approval.')
      router.push('/login')
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message)
      } else {
        toast.error('An error occurred during registration')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const updateChild = (index: number, field: keyof ChildEntry, value: string) => {
    setChildren(prev => prev.map((c, i) => (i === index ? { ...c, [field]: value } : c)))
  }

  const addChild = () => {
    setChildren(prev => [...prev, { registrationNumber: '', dateOfBirth: '' }])
  }

  const removeChild = (index: number) => {
    setChildren(prev => prev.length > 1 ? prev.filter((_, i) => i !== index) : prev)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Parent Registration
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Create your parent account
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Register</CardTitle>
            <CardDescription>
              Fill in your information and link your child(ren)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLocked && (
              <div className="mb-4 p-3 rounded-md border border-red-300 bg-red-50 text-red-800">
                <p className="text-sm font-semibold">Registration temporarily locked</p>
                <p className="text-xs mt-1">
                  Too many failed attempts. Please try again in {lockMinutes}m {lockSeconds}s.
                </p>
              </div>
            )}
            {!isLocked && remainingAttempts !== null && remainingAttempts < 5 && (
              <div className="mb-4 p-3 rounded-md border border-amber-300 bg-amber-50 text-amber-800">
                <p className="text-xs">
                  <strong>{remainingAttempts}</strong> attempt{remainingAttempts === 1 ? '' : 's'} remaining before lock-out.
                </p>
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="First name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Last name"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Password"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(v => !v)}
                      className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-gray-700"
                      tabIndex={-1}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      required
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirm password"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(v => !v)}
                      className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-gray-700"
                      tabIndex={-1}
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone (Optional)</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Phone number"
                />
              </div>

              <div className="space-y-3 pt-2 border-t">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">Your Children</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addChild}>
                    <Plus className="h-4 w-4 mr-1" /> Add Child
                  </Button>
                </div>
                <p className="text-xs text-gray-500">
                  Add each of your children. Both registration number and date of birth must match school records.
                </p>

                {children.map((child, index) => (
                  <div key={index} className="border rounded-md p-3 space-y-3 bg-gray-50">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Child {index + 1}</span>
                      {children.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeChild(index)}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`reg-${index}`}>Registration Number</Label>
                      <Input
                        id={`reg-${index}`}
                        type="text"
                        required
                        value={child.registrationNumber}
                        onChange={(e) => updateChild(index, 'registrationNumber', e.target.value)}
                        placeholder="e.g. REG2024001"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`dob-${index}`}>Date of Birth</Label>
                      <Input
                        id={`dob-${index}`}
                        type="date"
                        required
                        value={child.dateOfBirth}
                        onChange={(e) => updateChild(index, 'dateOfBirth', e.target.value)}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || isLocked}
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isLocked ? `Locked (${lockMinutes}m ${lockSeconds}s)` : 'Register'}
              </Button>
            </form>

            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
                  Sign in here
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}