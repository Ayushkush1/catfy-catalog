const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables:')
  console.error('NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl)
  console.error('SUPABASE_SERVICE_ROLE_KEY:', !!supabaseServiceKey)
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function createAdminUser() {
  const adminEmail = 'admin@catfy.com'
  const adminPassword = 'CatfyAdmin2024!'

  console.log('Creating admin user...')

  try {
    // Create the admin user
    const { data, error } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true
    })

    if (error) {
      if (error.message.includes('already registered')) {
        console.log('✅ Admin user already exists')
        return
      }
      throw error
    }

    console.log('✅ Admin user created successfully:', data.user.id)
    console.log('📧 Email:', adminEmail)
    console.log('🔑 Password:', adminPassword)
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error.message)
    process.exit(1)
  }
}

createAdminUser()