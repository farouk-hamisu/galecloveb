import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { 
      email, 
      password, 
      first_name, 
      last_name, 
      phone, 
      account_type, 
      account_balance,
      account_number 
    } = await req.json()

    // 1. Create user in Auth
    const { data: authUser, error: authError } = await supabaseClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { first_name, last_name }
    })

    if (authError) throw authError

    const userId = authUser.user.id

    // 2. Update or Create Profile
    // The handle_new_user trigger usually creates the profile, but we upsert to be sure
    // and to include any extra fields like phone.
    const { error: profileError } = await supabaseClient
      .from('profiles')
      .upsert({
        id: userId,
        email,
        first_name,
        last_name,
        phone,
      })

    if (profileError) {
      console.error("Profile sync error:", profileError)
      throw new Error(`Failed to sync profile: ${profileError.message}`)
    }

    // 3. Create account if details provided
    if (account_type && account_number) {
      console.log(`Creating ${account_type} account for user ${userId} with number ${account_number}`)
      const { error: accountError } = await supabaseClient
        .from('accounts')
        .insert({
          user_id: userId,
          account_number,
          account_type,
          balance: parseFloat(account_balance) || 0,
          is_active: true,
          currency: 'USD'
        })

      if (accountError) {
        console.error("Account creation error:", accountError)
        throw new Error(`Failed to create account: ${accountError.message}`)
      }
    }

    return new Response(
      JSON.stringify({ success: true, user: authUser.user }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )

  } catch (error) {
    console.error("Function error:", error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: error.description || error.toString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
