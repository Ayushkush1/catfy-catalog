'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Loader2,
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  Layout,
  Share2,
} from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'

export default function LoginPage() {
  const [accountType, setAccountType] = useState<'INDIVIDUAL' | 'BUSINESS'>(
    'INDIVIDUAL'
  )
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setError(error.message)
        return
      }

      if (data.user) {
        toast.success('Welcome back!')
        router.push('/dashboard')
        router.refresh()
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setIsLoading(true)
    setError('')

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) {
        setError(error.message)
      }
    } catch (err) {
      setError('Failed to sign in with Google')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen overflow-hidden">
      {/* Left Side - Branding */}
      <div className="relative hidden overflow-hidden bg-gradient-to-r from-[#2D1B69] to-[#6366F1] lg:flex lg:w-1/2">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10 flex h-screen flex-col justify-center px-40 text-white">
          {/* Logo */}
          <div className="mb-6">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-xl bg-white/20">
              <Image
                src="/assets/CATFYLogo.png"
                alt="CatalogueAI Logo"
                width={48}
                height={48}
                className="h-full w-full object-contain"
              />
            </div>
            <h1 className="mb-3 text-2xl font-bold xl:text-3xl">
              AI-Powered
              <br />
              Catalogue Builder
            </h1>
            <p className="mb-2 text-base leading-relaxed text-purple-100 xl:text-lg">
              Create stunning product catalogues in minutes with AI assistance.
            </p>
          </div>

          {/* Features */}
          <div className="mb-6 space-y-5">
            <div className="flex items-center space-x-3">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-white/20">
                <Mail className="h-4 w-4 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-semibold">AI-Generated Content</h3>
                <p className="text-xs text-purple-100">
                  Smart descriptions & categorization
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-white/20">
                <Layout className="h-4 w-4 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-semibold">Professional Themes</h3>
                <p className="text-xs text-purple-100">
                  5 stunning designs to choose from
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-white/20">
                <Share2 className="h-4 w-4 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-semibold">Export & Share</h3>
                <p className="text-xs text-purple-100">
                  PDF-ready catalogues in one click
                </p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="flex space-x-4">
            <div>
              <div className="text-lg font-bold">10K+</div>
              <div className="text-xs text-purple-200">Happy Users</div>
            </div>
            <div>
              <div className="text-lg font-bold">50K+</div>
              <div className="text-xs text-purple-200">Catalogues Created</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex h-screen flex-1 items-center justify-center overflow-hidden bg-gray-50 p-4 lg:p-6">
        <div className="w-full max-w-sm">
          {/* Header */}
          <div className="mb-6 text-center">
            <h2 className="mb-1 text-3xl font-bold text-gray-900">
              Welcome to CATFY
            </h2>
            <p className="text-sm text-gray-600">
              Sign in to access your catalogues
            </p>

            {/* Toggle Buttons */}
            <div className="mt-4 flex rounded-lg bg-gray-100 p-1">
              <button className="flex-1 rounded-md bg-white px-3 py-1.5 text-sm font-medium text-gray-900 shadow-sm">
                Sign In
              </button>
              <Link
                href="/auth/signup"
                className="flex-1 px-3 py-1.5 text-center text-sm font-medium text-gray-600 hover:text-gray-900"
              >
                Sign Up
              </Link>
            </div>
          </div>

          <div className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              {/* Account Type Selection */}
              <div className="space-y-2">
                <Label className="text-xs font-medium text-gray-700">
                  Account Type
                </Label>
                <div className="grid grid-cols-2 gap-2">
                  <div
                    onClick={() => setAccountType('INDIVIDUAL')}
                    className={`relative cursor-pointer rounded-lg border-2 p-2 transition-all ${
                      accountType === 'INDIVIDUAL'
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <div
                        className={`flex h-6 w-6 items-center justify-center rounded ${
                          accountType === 'INDIVIDUAL'
                            ? 'bg-purple-100'
                            : 'bg-gray-100'
                        }`}
                      >
                        <User
                          className={`h-3 w-3 ${
                            accountType === 'INDIVIDUAL'
                              ? 'text-purple-600'
                              : 'text-gray-600'
                          }`}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-xs font-medium text-gray-900">
                          Individual
                        </h3>
                        <p className="text-xs text-gray-500">Personal use</p>
                      </div>
                    </div>
                    {accountType === 'INDIVIDUAL' && (
                      <div className="absolute right-1 top-1">
                        <div className="flex h-3 w-3 items-center justify-center rounded-full bg-purple-500">
                          <svg
                            className="h-2 w-2 text-white"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      </div>
                    )}
                  </div>

                  <div
                    onClick={() => setAccountType('BUSINESS')}
                    className={`relative cursor-pointer rounded-lg border-2 p-2 transition-all ${
                      accountType === 'BUSINESS'
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <div
                        className={`flex h-6 w-6 items-center justify-center rounded ${
                          accountType === 'BUSINESS'
                            ? 'bg-purple-100'
                            : 'bg-gray-100'
                        }`}
                      >
                        <svg
                          className={`h-3 w-3 ${
                            accountType === 'BUSINESS'
                              ? 'text-purple-600'
                              : 'text-gray-600'
                          }`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-xs font-medium text-gray-900">
                          Business
                        </h3>
                        <p className="text-xs text-gray-500">
                          Teams & commercial
                        </p>
                      </div>
                    </div>
                    {accountType === 'BUSINESS' && (
                      <div className="absolute right-1 top-1">
                        <div className="flex h-3 w-3 items-center justify-center rounded-full bg-purple-500">
                          <svg
                            className="h-2 w-2 text-white"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Email Field */}
              <div className="space-y-1">
                <Label
                  htmlFor="email"
                  className="text-xs font-medium text-gray-700"
                >
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="h-9 rounded-lg border-gray-200 pl-9 text-sm focus:border-purple-500 focus:ring-purple-500"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-1">
                <Label
                  htmlFor="password"
                  className="text-xs font-medium text-gray-700"
                >
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="h-9 rounded-lg border-gray-200 pl-9 pr-9 text-sm focus:border-purple-500 focus:ring-purple-500"
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="h-3.5 w-3.5" />
                    ) : (
                      <Eye className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Sign In Button */}
              <Button
                type="submit"
                className="h-9 w-full rounded-lg bg-black text-sm font-medium text-white hover:bg-gray-800"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-gray-50 px-2 font-medium text-gray-500">
                  OR
                </span>
              </div>
            </div>

            {/* Google Sign In */}
            <Button
              type="button"
              variant="outline"
              className="h-9 w-full rounded-lg border-gray-200 text-sm font-medium hover:bg-gray-50"
              onClick={handleGoogleLogin}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
              ) : (
                <svg className="mr-2 h-3.5 w-3.5" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
              )}
              Continue with Google
            </Button>

            {/* Footer Links */}
            <div className="space-y-2 text-center">
              <div className="text-xs text-gray-600">
                <Link
                  href="/auth/forgot-password"
                  className="font-medium text-purple-600 hover:text-purple-500"
                >
                  Forgot your password?
                </Link>
              </div>
              <div className="text-xs text-gray-600">
                <Link
                  href="/admin/login"
                  className="font-medium text-red-500 underline hover:text-red-700"
                >
                  Admin Login
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
