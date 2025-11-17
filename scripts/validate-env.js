#!/usr/bin/env node

/**
 * Environment validation script
 * Validates required environment variables before build
 */

const requiredEnvVars = [
  'DATABASE_URL',
  'NEXTAUTH_SECRET',
  'NEXTAUTH_URL',
  'SUPABASE_URL',
  'SUPABASE_ANON_KEY',
]

// Default values for CLI/development mode
const defaultValues = {
  DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/catfy',
  NEXTAUTH_SECRET: 'dev-secret-key-change-in-production',
  NEXTAUTH_URL: 'http://localhost:3000',
  SUPABASE_URL: 'https://placeholder.supabase.co',
  SUPABASE_ANON_KEY: 'placeholder-anon-key',
}

const optionalEnvVars = [
  'STRIPE_SECRET_KEY',
  'STRIPE_PUBLISHABLE_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'GEMINI_API_KEY',
  'RESEND_API_KEY',
]

function validateEnvironment() {
  console.log('🔍 Validating environment variables...')

  const missing = []
  const warnings = []
  const usingDefaults = []

  // Check required variables and apply defaults if missing
  requiredEnvVars.forEach(varName => {
    if (!process.env[varName]) {
      if (defaultValues[varName]) {
        process.env[varName] = defaultValues[varName]
        usingDefaults.push(varName)
      } else {
        missing.push(varName)
      }
    }
  })

  // Check optional variables
  optionalEnvVars.forEach(varName => {
    if (!process.env[varName]) {
      warnings.push(varName)
    }
  })

  if (usingDefaults.length > 0) {
    console.log('ℹ️  Using default values for:')
    usingDefaults.forEach(varName => {
      console.log(`   - ${varName}`)
    })
    console.log('')
  }

  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:')
    missing.forEach(varName => {
      console.error(`   - ${varName}`)
    })
    console.error(
      '\nPlease check your .env.local file or environment configuration.'
    )
    process.exit(1)
  }

  if (warnings.length > 0) {
    console.warn('⚠️  Optional environment variables not set:')
    warnings.forEach(varName => {
      console.warn(`   - ${varName}`)
    })
    console.warn(
      'Some features may not work properly without these variables.\n'
    )
  }

  console.log('✅ Environment validation passed!')
}

// Run validation
validateEnvironment()
