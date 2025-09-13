/**
 * Environment variable validation utility
 * Helps catch missing environment variables early in development and build processes
 */

interface EnvConfig {
  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: string
  NEXT_PUBLIC_SUPABASE_ANON_KEY: string
  SUPABASE_SERVICE_ROLE_KEY?: string
  
  // Database
  DATABASE_URL?: string
  DIRECT_URL?: string
  
  // Authentication
  NEXTAUTH_URL?: string
  NEXTAUTH_SECRET?: string
  
  // Application
  NEXT_PUBLIC_APP_URL?: string
  
  // Stripe (optional)
  STRIPE_SECRET_KEY?: string
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?: string
  STRIPE_WEBHOOK_SECRET?: string
  
  // Google Cloud (optional)
  GOOGLE_CLOUD_PROJECT_ID?: string
  GOOGLE_CLOUD_PRIVATE_KEY?: string
  GOOGLE_CLOUD_CLIENT_EMAIL?: string
  
  // Storage
  NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET?: string
  
  // Email (optional)
  EMAIL_SERVER_HOST?: string
  EMAIL_SERVER_PORT?: string
  EMAIL_SERVER_USER?: string
  EMAIL_SERVER_PASSWORD?: string
  EMAIL_FROM?: string
  
  // Analytics (optional)
  NEXT_PUBLIC_GOOGLE_ANALYTICS_ID?: string
}

const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY'
] as const

const optionalEnvVars = [
  'SUPABASE_SERVICE_ROLE_KEY',
  'DATABASE_URL',
  'DIRECT_URL',
  'NEXTAUTH_URL',
  'NEXTAUTH_SECRET',
  'NEXT_PUBLIC_APP_URL',
  'STRIPE_SECRET_KEY',
  'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'GOOGLE_CLOUD_PROJECT_ID',
  'GOOGLE_CLOUD_PRIVATE_KEY',
  'GOOGLE_CLOUD_CLIENT_EMAIL',
  'NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET',
  'EMAIL_SERVER_HOST',
  'EMAIL_SERVER_PORT',
  'EMAIL_SERVER_USER',
  'EMAIL_SERVER_PASSWORD',
  'EMAIL_FROM',
  'NEXT_PUBLIC_GOOGLE_ANALYTICS_ID'
] as const

/**
 * Validates that all required environment variables are present
 * @param throwOnMissing - Whether to throw an error if required vars are missing
 * @returns Object with validation results
 */
export function validateEnv(throwOnMissing = true) {
  const missing: string[] = []
  const present: string[] = []
  
  // Check required environment variables
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      missing.push(envVar)
    } else {
      present.push(envVar)
    }
  }
  
  // Check optional environment variables
  const optionalPresent: string[] = []
  const optionalMissing: string[] = []
  
  for (const envVar of optionalEnvVars) {
    if (!process.env[envVar]) {
      optionalMissing.push(envVar)
    } else {
      optionalPresent.push(envVar)
    }
  }
  
  const isValid = missing.length === 0
  
  if (!isValid && throwOnMissing) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
      `Please check your .env.local file or deployment environment variables.\n` +
      `See .env.example for reference.`
    )
  }
  
  return {
    isValid,
    missing,
    present,
    optionalPresent,
    optionalMissing,
    summary: {
      required: `${present.length}/${requiredEnvVars.length} required variables present`,
      optional: `${optionalPresent.length}/${optionalEnvVars.length} optional variables present`
    }
  }
}

/**
 * Gets environment variables with validation
 * @returns Validated environment configuration
 */
export function getEnv(): EnvConfig {
  validateEnv(true)
  
  return {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    DATABASE_URL: process.env.DATABASE_URL,
    DIRECT_URL: process.env.DIRECT_URL,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    GOOGLE_CLOUD_PROJECT_ID: process.env.GOOGLE_CLOUD_PROJECT_ID,
    GOOGLE_CLOUD_PRIVATE_KEY: process.env.GOOGLE_CLOUD_PRIVATE_KEY,
    GOOGLE_CLOUD_CLIENT_EMAIL: process.env.GOOGLE_CLOUD_CLIENT_EMAIL,
    NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET: process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET,
    EMAIL_SERVER_HOST: process.env.EMAIL_SERVER_HOST,
    EMAIL_SERVER_PORT: process.env.EMAIL_SERVER_PORT,
    EMAIL_SERVER_USER: process.env.EMAIL_SERVER_USER,
    EMAIL_SERVER_PASSWORD: process.env.EMAIL_SERVER_PASSWORD,
    EMAIL_FROM: process.env.EMAIL_FROM,
    NEXT_PUBLIC_GOOGLE_ANALYTICS_ID: process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID
  }
}

/**
 * Safely gets Supabase configuration with validation
 * @returns Supabase configuration object
 */
export function getSupabaseConfig() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing required Supabase environment variables: ' +
      (!supabaseUrl ? 'NEXT_PUBLIC_SUPABASE_URL ' : '') +
      (!supabaseAnonKey ? 'NEXT_PUBLIC_SUPABASE_ANON_KEY' : '')
    )
  }

  return {
    url: supabaseUrl,
    anonKey: supabaseAnonKey,
    serviceRoleKey
  }
}

// Validate environment on module load in development
if (process.env.NODE_ENV === 'development') {
  try {
    const validation = validateEnv(false)
    if (!validation.isValid) {
      console.warn('⚠️  Missing required environment variables:', validation.missing.join(', '))
      console.warn('📝 Please check your .env.local file or see .env.example for reference')
    } else {
      console.log('✅ All required environment variables are present')
    }
  } catch (error) {
    console.error('❌ Environment validation error:', error)
  }
}