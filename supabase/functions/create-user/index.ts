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

    // 2. Profile should be created by a trigger, but let's update it with provided info
    // We'll wait a bit or just use upsert to be safe
    const { error: profileError } = await supabaseClient
      .from('profiles')
      .update({
        first_name,
        last_name,
        phone,
      })
      .eq('id', userId)

    if (profileError) {
      // If profile doesn't exist yet (trigger delay), try upsert
      const { error: upsertError } = await supabaseClient
        .from('profiles')
        .upsert({
          id: userId,
          email,
          first_name,
          last_name,
          phone,
        })
      if (upsertError) throw upsertError
    }

    // 3. Create account if details provided
    if (account_type && account_number) {
      const { error: accountError } = await supabaseClient
        .from('accounts')
        .insert({
          user_id: userId,
          account_number,
          account_type,
          balance: parseFloat(account_balance) || 0,
          status: 'active',
          currency: 'USD'
        })

      if (accountError) throw accountError
    }

    return new Response(
      JSON.stringify({ success: true, user: authUser.user }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
