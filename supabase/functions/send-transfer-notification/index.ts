import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TransferNotificationRequest {
  senderUserId: string;
  recipientUserId: string;
  amount: number;
  currency: string;
  referenceNumber: string;
  transferType: 'internal' | 'international';
  description?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { 
      senderUserId, 
      recipientUserId, 
      amount, 
      currency, 
      referenceNumber, 
      transferType, 
      description 
    }: TransferNotificationRequest = await req.json();

    console.log("Processing transfer notification:", { senderUserId, recipientUserId, amount, referenceNumber });

    // Fetch sender and recipient profiles
    const [senderResult, recipientResult] = await Promise.all([
      supabase.from('profiles').select('email, first_name, last_name').eq('id', senderUserId).single(),
      supabase.from('profiles').select('email, first_name, last_name').eq('id', recipientUserId).single()
    ]);

    const senderProfile = senderResult.data;
    const recipientProfile = recipientResult.data;

    if (!senderProfile || !recipientProfile) {
      console.error("Could not find sender or recipient profile");
      return new Response(
        JSON.stringify({ error: "Profile not found" }),
        { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const currencySymbol = currency === 'EUR' ? '€' : '$';
    const formattedAmount = `${currencySymbol}${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
    const senderName = `${senderProfile.first_name || ''} ${senderProfile.last_name || ''}`.trim() || 'User';
    const recipientName = `${recipientProfile.first_name || ''} ${recipientProfile.last_name || ''}`.trim() || 'User';

    // Create in-app notifications for both users
    const notifications = [
      {
        user_id: senderUserId,
        title: 'Transfer Sent Successfully',
        message: `You sent ${formattedAmount} to ${recipientName}. Reference: ${referenceNumber}`,
        type: 'transaction'
      },
      {
        user_id: recipientUserId,
        title: 'Money Received',
        message: `You received ${formattedAmount} from ${senderName}. Reference: ${referenceNumber}`,
        type: 'transaction'
      }
    ];

    const { error: notificationError } = await supabase
      .from('notifications')
      .insert(notifications);

    if (notificationError) {
      console.error("Error creating notifications:", notificationError);
    } else {
      console.log("In-app notifications created successfully");
    }

    // Send emails (fault-tolerant - don't crash if email fails)
    const emailPromises = [];

    // Sender email
    if (senderProfile.email) {
      emailPromises.push(
        resend.emails.send({
          from: "National Credit Union Bank <onboarding@resend.dev>",
          to: [senderProfile.email],
          subject: `Transfer Confirmation - ${referenceNumber}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #FF4D4D, #FF6B6B); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
                <h1 style="color: white; margin: 0;">Transfer Successful</h1>
              </div>
              <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 12px 12px;">
                <p style="color: #333; font-size: 16px;">Dear ${senderName},</p>
                <p style="color: #666; font-size: 14px;">Your ${transferType} transfer has been completed successfully.</p>
                
                <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                      <td style="padding: 10px 0; color: #666; border-bottom: 1px solid #eee;">Amount Sent</td>
                      <td style="padding: 10px 0; color: #333; font-weight: bold; text-align: right; border-bottom: 1px solid #eee;">${formattedAmount}</td>
                    </tr>
                    <tr>
                      <td style="padding: 10px 0; color: #666; border-bottom: 1px solid #eee;">Recipient</td>
                      <td style="padding: 10px 0; color: #333; text-align: right; border-bottom: 1px solid #eee;">${recipientName}</td>
                    </tr>
                    <tr>
                      <td style="padding: 10px 0; color: #666; border-bottom: 1px solid #eee;">Reference</td>
                      <td style="padding: 10px 0; color: #333; text-align: right; border-bottom: 1px solid #eee;">${referenceNumber}</td>
                    </tr>
                    ${description ? `<tr>
                      <td style="padding: 10px 0; color: #666;">Description</td>
                      <td style="padding: 10px 0; color: #333; text-align: right;">${description}</td>
                    </tr>` : ''}
                  </table>
                </div>
                
                <p style="color: #666; font-size: 12px; text-align: center;">
                  Thank you for banking with National Credit Union Bank.
                </p>
              </div>
            </div>
          `,
        }).catch(err => {
          console.error("Failed to send sender email:", err);
          return null;
        })
      );
    }

    // Recipient email
    if (recipientProfile.email) {
      emailPromises.push(
        resend.emails.send({
          from: "National Credit Union Bank <onboarding@resend.dev>",
          to: [recipientProfile.email],
          subject: `You've Received Money - ${referenceNumber}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #22c55e, #16a34a); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
                <h1 style="color: white; margin: 0;">Money Received!</h1>
              </div>
              <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 12px 12px;">
                <p style="color: #333; font-size: 16px;">Dear ${recipientName},</p>
                <p style="color: #666; font-size: 14px;">Great news! You've received a ${transferType} transfer.</p>
                
                <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                      <td style="padding: 10px 0; color: #666; border-bottom: 1px solid #eee;">Amount Received</td>
                      <td style="padding: 10px 0; color: #22c55e; font-weight: bold; text-align: right; border-bottom: 1px solid #eee;">${formattedAmount}</td>
                    </tr>
                    <tr>
                      <td style="padding: 10px 0; color: #666; border-bottom: 1px solid #eee;">From</td>
                      <td style="padding: 10px 0; color: #333; text-align: right; border-bottom: 1px solid #eee;">${senderName}</td>
                    </tr>
                    <tr>
                      <td style="padding: 10px 0; color: #666; border-bottom: 1px solid #eee;">Reference</td>
                      <td style="padding: 10px 0; color: #333; text-align: right; border-bottom: 1px solid #eee;">${referenceNumber}</td>
                    </tr>
                    ${description ? `<tr>
                      <td style="padding: 10px 0; color: #666;">Description</td>
                      <td style="padding: 10px 0; color: #333; text-align: right;">${description}</td>
                    </tr>` : ''}
                  </table>
                </div>
                
                <p style="color: #666; font-size: 12px; text-align: center;">
                  Thank you for banking with National Credit Union Bank.
                </p>
              </div>
            </div>
          `,
        }).catch(err => {
          console.error("Failed to send recipient email:", err);
          return null;
        })
      );
    }

    // Wait for all emails (but don't fail if they fail)
    await Promise.allSettled(emailPromises);
    console.log("Email notifications processed (may have partial failures)");

    return new Response(
      JSON.stringify({ success: true, message: "Notifications sent successfully" }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );

  } catch (error: unknown) {
    console.error("Error in send-transfer-notification:", error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
