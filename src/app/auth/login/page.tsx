'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Mail, Lock, Eye, EyeOff, User, Layout, Share2 } from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'

export default function LoginPage() {
  const [accountType, setAccountType] = useState<'INDIVIDUAL' | 'BUSINESS'>('INDIVIDUAL')
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
        password
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
    <div className="min-h-screen flex overflow-hidden">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-r from-[#2D1B69] to-[#6366F1] relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10 flex flex-col justify-center text-white px-40 h-screen">
          {/* Logo */}
          <div className="mb-6">
            <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center mb-4">
              <Image
                src="/assets/CATFYLogo.png"
                alt="CatalogueAI Logo"
                width={48}
                height={48}
                className="w-full h-full object-contain"
              />
            </div>
            <h1 className="text-2xl xl:text-3xl font-bold mb-3">AI-Powered<br />Catalogue Builder</h1>
            <p className="text-base xl:text-lg text-purple-100 mb-2 leading-relaxed">Create stunning product catalogues in minutes with AI assistance.</p>
          </div>

          {/* Features */}
          <div className="space-y-5 mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Mail className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-semibold">AI-Generated Content</h3>
                <p className="text-xs text-purple-100">Smart descriptions & categorization</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Layout className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-semibold">Professional Themes</h3>
                <p className="text-xs text-purple-100">5 stunning designs to choose from</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Share2 className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-semibold">Export & Share</h3>
                <p className="text-xs text-purple-100">PDF-ready catalogues in one click</p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="flex space-x-4">
            <div>
              <div className="text-lg font-bold">10K+</div>
              <div className="text-purple-200 text-xs">Happy Users</div>
            </div>
            <div>
              <div className="text-lg font-bold">50K+</div>
              <div className="text-purple-200 text-xs">Catalogues Created</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-4 lg:p-6 bg-gray-50 h-screen overflow-hidden">
        <div className="w-full max-w-sm">
          {/* Header */}
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-1">Welcome to CATFY</h2>
            <p className="text-sm text-gray-600">Sign in to access your catalogues</p>

            {/* Toggle Buttons */}
            <div className="flex bg-gray-100 rounded-lg p-1 mt-4">
              <button className="flex-1 py-1.5 px-3 bg-white text-gray-900 rounded-md shadow-sm font-medium text-sm">
                Sign In
              </button>
              <Link
                href="/auth/signup"
                className="flex-1 py-1.5 px-3 text-gray-600 hover:text-gray-900 font-medium text-center text-sm"
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
                <Label className="text-xs font-medium text-gray-700">Account Type</Label>
                <div className="grid grid-cols-2 gap-2">
                  <div
                    onClick={() => setAccountType('INDIVIDUAL')}
                    className={`relative cursor-pointer rounded-lg border-2 p-2 transition-all ${accountType === 'INDIVIDUAL'
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300'
                      }`}
                  >
                    <div className="flex items-center space-x-2">
                      <div className={`flex h-6 w-6 items-center justify-center rounded ${accountType === 'INDIVIDUAL' ? 'bg-purple-100' : 'bg-gray-100'
                        }`}>
                        <User className={`h-3 w-3 ${accountType === 'INDIVIDUAL' ? 'text-purple-600' : 'text-gray-600'
                          }`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 text-xs">Individual</h3>
                        <p className="text-xs text-gray-500">Personal use</p>
                      </div>
                    </div>
                    {accountType === 'INDIVIDUAL' && (
                      <div className="absolute top-1 right-1">
                        <div className="flex h-3 w-3 items-center justify-center rounded-full bg-purple-500">
                          <svg className="h-2 w-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                    )}
                  </div>

                  <div
                    onClick={() => setAccountType('BUSINESS')}
                    className={`relative cursor-pointer rounded-lg border-2 p-2 transition-all ${accountType === 'BUSINESS'
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300'
                      }`}
                  >
                    <div className="flex items-center space-x-2">
                      <div className={`flex h-6 w-6 items-center justify-center rounded ${accountType === 'BUSINESS' ? 'bg-purple-100' : 'bg-gray-100'
                        }`}>
                        <svg className={`h-3 w-3 ${accountType === 'BUSINESS' ? 'text-purple-600' : 'text-gray-600'
                          }`} fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 text-xs">Business</h3>
                        <p className="text-xs text-gray-500">Teams & commercial</p>
                      </div>
                    </div>
                    {accountType === 'BUSINESS' && (
                      <div className="absolute top-1 right-1">
                        <div className="flex h-3 w-3 items-center justify-center rounded-full bg-purple-500">
                          <svg className="h-2 w-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

              </div>

              {/* Email Field */}
              <div className="space-y-1">
                <Label htmlFor="email" className="text-xs font-medium text-gray-700">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-9 pl-9 text-sm rounded-lg border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-1">
                <Label htmlFor="password" className="text-xs font-medium text-gray-700">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-9 pl-9 pr-9 text-sm rounded-lg border-gray-200 focus:border-purple-500 focus:ring-purple-500"
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
                className="w-full h-9 bg-black hover:bg-gray-800 text-white rounded-lg font-medium text-sm"
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
                <span className="bg-gray-50 px-2 text-gray-500 font-medium">
                  OR
                </span>
              </div>
            </div>

            {/* Google Sign In */}
            <Button
              type="button"
              variant="outline"
              className="w-full h-9 border-gray-200 hover:bg-gray-50 rounded-lg font-medium text-sm"
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
            <div className="text-center space-y-2">
              <div className="text-xs text-gray-600">
                <Link
                  href="/auth/forgot-password"
                  className="text-purple-600 hover:text-purple-500 font-medium"
                >
                  Forgot your password?
                </Link>
              </div>
              <div className="text-xs text-gray-600">
                <Link
                  href="/admin/login"
                  className="text-red-500 hover:text-red-700 font-medium underline"
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