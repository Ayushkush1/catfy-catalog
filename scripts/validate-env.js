#!/usr/bin/env node

/**
 * Environment validation script for build-time checks
 * This script validates that all required environment variables are present
 * and provides helpful error messages if they're missing.
 */

const requiredEnvVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY'
]

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
]

function validateEnvironment() {
  console.log('🔍 Validating environment variables...')
  
  const missing = []
  const present = []
  
  // Check required environment variables
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      missing.push(envVar)
    } else {
      present.push(envVar)
    }
  }
  
  // Check optional environment variables
  const optionalPresent = []
  const optionalMissing = []
  
  for (const envVar of optionalEnvVars) {
    if (!process.env[envVar]) {
      optionalMissing.push(envVar)
    } else {
      optionalPresent.push(envVar)
    }
  }
  
  // Report results
  console.log(`✅ Required variables present: ${present.length}/${requiredEnvVars.length}`)
  if (present.length > 0) {
    console.log(`   - ${present.join(', ')}`)
  }
  
  console.log(`📊 Optional variables present: ${optionalPresent.length}/${optionalEnvVars.length}`)
  if (optionalPresent.length > 0) {
    console.log(`   - ${optionalPresent.join(', ')}`)
  }
  
  if (missing.length > 0) {
    console.error('\n❌ Missing required environment variables:')
    missing.forEach(envVar => {
      console.error(`   - ${envVar}`)
    })
    
    console.error('\n📝 To fix this:')
    console.error('   1. Create a .env.local file in your project root')
    console.error('   2. Add the missing environment variables')
    console.error('   3. See .env.example for reference')
    console.error('   4. For Vercel deployment, add these in your project settings')
    
    process.exit(1)
  }
  
  if (optionalMissing.length > 0) {
    console.warn('\n⚠️  Optional environment variables not set:')
    optionalMissing.forEach(envVar => {
      console.warn(`   - ${envVar}`)
    })
    console.warn('   These are optional but may be needed for full functionality.')
  }
  
  console.log('\n🎉 Environment validation passed!')
}

// Run validation
try {
  validateEnvironment()
} catch (error) {
  console.error('❌ Environment validation failed:', error.message)
  process.exit(1)
}