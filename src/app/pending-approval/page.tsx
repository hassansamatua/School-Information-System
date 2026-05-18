'use client'

import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Clock, CheckCircle, Mail, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { signOut } from 'next-auth/react'
import Link from 'next/link'

export default function PendingApprovalPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Clock className="mx-auto h-16 w-16 text-orange-500 mb-4" />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Account Pending Approval
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Your parent account is waiting for admin approval
          </p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Approval Status</CardTitle>
            <CardDescription>
              Your account has been submitted and is under review
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <p className="font-medium">Registration Complete</p>
                <p className="text-sm text-gray-600">
                  Your account has been successfully registered in our system.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Clock className="h-5 w-5 text-orange-500 mt-0.5" />
              <div>
                <p className="font-medium">Approval in Progress</p>
                <p className="text-sm text-gray-600">
                  Our administrators are reviewing your account. This typically takes <strong className="text-orange-600">24 working hours</strong>.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Mail className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <p className="font-medium">Notification</p>
                <p className="text-sm text-gray-600">
                  You will receive an email notification once your account is approved.
                </p>
              </div>
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <p className="text-sm text-orange-800">
                <strong>Note:</strong> You can sign in to check your approval status at any time.
              </p>
            </div>

            <div className="flex flex-col space-y-3 pt-4">
              <Button
                onClick={() => signOut({ callbackUrl: '/login' })}
                variant="outline"
                className="w-full"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
              <Link href="/login">
                <Button variant="ghost" className="w-full">
                  Back to Login
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Need help? Contact the school administration.
          </p>
        </div>
      </div>
    </div>
  )
}
