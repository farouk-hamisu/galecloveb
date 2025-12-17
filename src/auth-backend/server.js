import express from "express";
import cors from "cors";
import bcrypt from "bcryptjs";
import {Resend} from "resend";
import {createClient} from "@supabase/supabase-js";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import {fileURLToPath} from 'url';

// ---------------------------
// ENV
// ---------------------------
dotenv.config();
const {
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  RESEND_API_KEY,
  RESEND_FROM,
  PORT
} = process.env;

// ---------------------------
// INIT
// ---------------------------
const app = express();
app.use(express.json());
app.use(cors({origin: "*"}));
console.log("checking supabase url");
console.log(SUPABASE_URL);
const db = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {persistSession: false}
});

const resend = new Resend(RESEND_API_KEY);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const verificationEmailTemplate = fs.readFileSync(path.join(__dirname, 'emails', 'verification-email.html'), 'utf8');
const passwordResetEmailTemplate = fs.readFileSync(path.join(__dirname, 'emails', 'password-reset-email.html'), 'utf8');
const transferPinEmailTemplate = fs.readFileSync(path.join(__dirname, 'emails', 'transfer-pin-email.html'), 'utf8');
const debitNotificationEmailTemplate = fs.readFileSync(path.join(__dirname, 'emails', 'debit-notification-email.html'), 'utf8');
const creditNotificationEmailTemplate = fs.readFileSync(path.join(__dirname, 'emails', 'credit-notification-email.html'), 'utf8');


// ---------------------------
// Helpers
// ---------------------------
const genOtp = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

// ---------------------------
// ROUTE: SEND OTP
// POST /send-otp
// ---------------------------
app.post("/send-otp", async (req, res) => {
  try {
    const {email, password, firstName, lastName} = req.body;

    if (!email || !password || !firstName || !lastName)
      return res.status(400).json({error: "Email, password, first name and last name required"});

    const emailLower = email.trim().toLowerCase();

    // Create supabase user
    const {data: userData, error: userErr} =
      await db.auth.admin.createUser({
        email: emailLower,
        password,
        email_confirm: false,
        user_metadata: {
          first_name: firstName,
          last_name: lastName,
          full_name: `${firstName} ${lastName}`
        }
      });

    if (userErr) {
      console.error("CREATE USER ERROR:", userErr);
      return res.status(400).json({error: userErr.message});
    }

    const userId = userData.user.id;

    // Generate OTP
    const otp = genOtp();
    const otpHash = await bcrypt.hash(otp, 10);
    const expires = new Date(Date.now() + 3 * 60 * 1000).toISOString();

    // Save OTP
    const {error: insertErr} = await db
      .from("email_otps")
      .insert({
        user_id: userId,
        email: emailLower,
        otp_hash: otpHash,
        purpose: "signup",
        expires_at: expires,
        consumed: false
      });

    if (insertErr) {
      console.error("OTP INSERT ERROR:", insertErr);
      return res.status(500).json({error: "Failed to save OTP"});
    }

    // Send Email
    const emailHtml = verificationEmailTemplate.replace('{{otp}}', otp);
    await resend.emails.send({
      from: RESEND_FROM,
      to: emailLower,
      subject: "Your Verification Code",
      html: emailHtml
    });

    return res.json({success: true, message: "OTP sent"});
  } catch (err) {
    console.error("SEND OTP ERROR:", err);
    return res.status(500).json({error: err.toString()});
  }
});

// ---------------------------
// ROUTE: RESEND OTP
// POST /resend-otp
// ---------------------------
app.post("/resend-otp", async (req, res) => {
  console.log("resend otp sent check your email");
  try {
    const {email} = req.body;

    if (!email) {
      return res.status(400).json({error: "Email is required"});
    }

    const emailLower = email.trim().toLowerCase();

    // Get user from Supabase auth
    const {data: {users}, error: userErr} = await db.auth.admin.listUsers({
      email: emailLower,
    });

    if (userErr || !users || users.length === 0) {
      console.error("User lookup error:", userErr);
      return res.status(404).json({error: "User not found"});
    }

    const user = users[0];
    const userId = user.id;

    // Generate OTP
    const otp = genOtp();
    const otpHash = await bcrypt.hash(otp, 10);
    const expires = new Date(Date.now() + 3 * 60 * 1000).toISOString();

    // Save OTP
    const {error: insertErr} = await db.from("email_otps").insert({
      user_id: userId,
      email: emailLower,
      otp_hash: otpHash,
      purpose: "signup",
      expires_at: expires,
      consumed: false,
    });

    if (insertErr) {
      console.error("OTP INSERT ERROR:", insertErr);
      return res.status(500).json({error: "Failed to save OTP"});
    }

    // Send Email
    const emailHtml = verificationEmailTemplate.replace('{{otp}}', otp);
    await resend.emails.send({
      from: RESEND_FROM,
      to: emailLower,
      subject: "Your New Verification Code",
      html: emailHtml,
    });

    return res.json({success: true, message: "New OTP sent"});
  } catch (err) {
    console.error("RESEND OTP ERROR:", err);
    return res.status(500).json({error: err.toString()});
  }
});

// ---------------------------
// ROUTE: FORGOT PASSWORD
// POST /forgot-password
// ---------------------------
app.post("/forgot-password", async (req, res) => {
  try {
    const {email} = req.body;

    if (!email) {
      return res.status(400).json({error: "Email is required"});
    }

    const emailLower = email.trim().toLowerCase();

    // Check if user exists in Supabase auth
    const {data: {users}, error: userErr} = await db.auth.admin.listUsers({
      email: emailLower,
    });

    if (userErr || !users || users.length === 0) {
      // For security, always return a generic success message even if email not found
      console.log(`Password reset attempt for non-existent user: ${emailLower}`);
      return res.json({success: true, message: "If an account with that email exists, a password reset link has been sent."});
    }

    const user = users[0];
    const userId = user.id;

    // Generate a unique reset token
    const resetToken = genOtp(); // Reusing genOtp for simplicity, but consider a more robust token generation
    const tokenHash = await bcrypt.hash(resetToken, 10);
    const expires = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour expiry

    // Save reset token
    const {error: insertErr} = await db.from("password_reset_tokens").insert({
      user_id: userId,
      email: emailLower,
      token_hash: tokenHash,
      expires_at: expires,
      consumed: false,
    });

    if (insertErr) {
      console.error("PASSWORD RESET TOKEN INSERT ERROR:", insertErr);
      return res.status(500).json({error: "Failed to save password reset token"});
    }

    // Send password reset email
    const resetLink = `https://nationalunioncreditbank.netlify.app/reset-password?token=${resetToken}&email=${encodeURIComponent(emailLower)}`; // Frontend URL
    const emailHtml = passwordResetEmailTemplate.replace('{{resetLink}}', resetLink);
    await resend.emails.send({
      from: RESEND_FROM,
      to: emailLower,
      subject: "Password Reset Request",
      html: emailHtml,
    });

    return res.json({success: true, message: "If an account with that email exists, a password reset link has been sent."});
  } catch (err) {
    console.error("FORGOT PASSWORD ERROR:", err);
    return res.status(500).json({error: err.toString()});
  }
});


// ---------------------------
// ROUTE: RESET PASSWORD
// POST /reset-password
// ---------------------------
app.post("/reset-password", async (req, res) => {
  try {
    const {email, token, newPassword} = req.body;

    if (!email || !token || !newPassword) {
      return res.status(400).json({error: "Email, token, and new password are required"});
    }

    const emailLower = email.trim().toLowerCase();

    const {data: rows, error} = await db
      .from("password_reset_tokens")
      .select("*")
      .eq("email", emailLower)
      .eq("consumed", false);

    if (error || !rows?.length) {
      return res.status(400).json({error: "Invalid or expired password reset link."});
    }

    let matchedRecord = null;
    for (const row of rows) {
      const isMatch = await bcrypt.compare(token, row.token_hash);
      if (isMatch) {
        matchedRecord = row;
        break;
      }
    }

    if (!matchedRecord) {
      return res.status(400).json({error: "Invalid or expired password reset link."});
    }

    if (Date.parse(matchedRecord.expires_at) < Date.now()) {
      return res.status(400).json({error: "Password reset link has expired."});
    }

    const {error: updateErr} = await db.auth.admin.updateUserById(
      matchedRecord.user_id,
      {password: newPassword}
    );

    if (updateErr) {
      return res.status(500).json({error: "Failed to update password."});
    }

    await db
      .from("password_reset_tokens")
      .update({consumed: true})
      .eq("id", matchedRecord.id);

    return res.json({success: true, message: "Password has been reset successfully."});
  } catch (err) {
    console.error("RESET PASSWORD ERROR:", err);
    return res.status(500).json({error: "Server error"});
  }
});

// ---------------------------
// ROUTE: SEND TRANSFER PIN
// POST /send-transfer-pin
// ---------------------------
app.post("/send-transfer-pin", async (req, res) => {
  try {
    const {email} = req.body;

    if (!email) {
      return res.status(400).json({error: "Email is required"});
    }

    const emailLower = email.trim().toLowerCase();

    // Get user from Supabase auth
    const {data: {users}, error: userErr} = await db.auth.admin.listUsers({
      email: emailLower,
    });

    if (userErr || !users || users.length === 0) {
      console.error("User lookup error:", userErr);
      return res.status(404).json({error: "User not found"});
    }

    const user = users[0];
    const userId = user.id;

    // Generate PIN
    const pin = genOtp();
    const pinHash = await bcrypt.hash(pin, 10);
    const expires = new Date(Date.now() + 3 * 60 * 1000).toISOString();

    // Save PIN
    const {error: insertErr} = await db
      .from("transfer_pins")
      .insert({
        user_id: userId,
        email: emailLower,
        pin_hash: pinHash,
        expires_at: expires,
        consumed: false
      });

    if (insertErr) {
      console.error("PIN INSERT ERROR:", insertErr);
      return res.status(500).json({error: "Failed to save PIN"});
    }

    // Send Email
    const emailHtml = transferPinEmailTemplate.replace('{{otp}}', pin);
    await resend.emails.send({
      from: RESEND_FROM,
      to: emailLower,
      subject: "Your Transfer PIN",
      html: emailHtml
    });

    return res.json({success: true, message: "Transfer PIN sent"});
  } catch (err) {
    console.error("SEND TRANSFER PIN ERROR:", err);
    return res.status(500).json({error: err.toString()});
  }
});

// ---------------------------
// ROUTE: VERIFY TRANSFER PIN
// POST /verify-transfer-pin
// ---------------------------
app.post("/verify-transfer-pin", async (req, res) => {
  try {
    const {email, pin} = req.body;

    if (!email || !pin)
      return res.status(400).json({error: "Email & PIN required"});

    const emailLower = email.trim().toLowerCase();

    // Get latest PIN record
    const {data: rows, error} = await db
      .from("transfer_pins")
      .select("*")
      .eq("email", emailLower)
      .eq("consumed", false)
      .order("created_at", {ascending: false});

    if (error || !rows.length)
      return res.status(400).json({error: "Invalid PIN"});

    const record = rows[0];

    // Compare PIN
    const valid = await bcrypt.compare(pin, record.pin_hash);
    if (!valid) return res.status(400).json({error: "Invalid PIN"});

    // Check expiry
    if (new Date(record.expires_at) < new Date())
      return res.status(400).json({error: "PIN expired"});

    // Mark consumed
    await db
      .from("transfer_pins")
      .update({consumed: true})
      .eq("id", record.id);

    return res.json({success: true, message: "PIN verified"});
  } catch (err) {
    console.error("VERIFY TRANSFER PIN ERROR:", err);
    return res.status(500).json({error: err.toString()});
  }
});

// ---------------------------
// ROUTE: VERIFY OTP
// POST /verify-otp
// ---------------------------
app.post("/verify-otp", async (req, res) => {
  try {
    const {email, otp} = req.body;

    if (!email || !otp)
      return res.status(400).json({error: "Email & OTP required"});

    const emailLower = email.trim().toLowerCase();

    // Get latest OTP record
    const {data: rows, error} = await db
      .from("email_otps")
      .select("*")
      .eq("email", emailLower)
      .eq("purpose", "signup")
      .eq("consumed", false)
      .order("created_at", {ascending: false});

    if (error || !rows.length)
      return res.status(400).json({error: "Invalid OTP"});

    const record = rows[0];

    // Compare OTP
    const valid = await bcrypt.compare(otp, record.otp_hash);
    if (!valid) return res.status(400).json({error: "Invalid OTP"});

    // Check expiry
    if (new Date(record.expires_at) < new Date())
      return res.status(400).json({error: "OTP expired"});

    // Mark consumed
    await db
      .from("email_otps")
      .update({consumed: true})
      .eq("id", record.id);

    // Confirm email in Supabase Auth
    await db.auth.admin.updateUserById(record.user_id, {
      email_confirm: true
    });

    return res.json({success: true, message: "Email verified"});
  } catch (err) {
    console.error("VERIFY OTP ERROR:", err);
    return res.status(500).json({error: err.toString()});
  }
});

// ---------------------------
// ROUTE: SEND TRANSACTION NOTIFICATION
// POST /send-transaction-notification
// ---------------------------
app.post("/send-transaction-notification", async (req, res) => {
  console.log('Received request to send transaction notification');
  console.log('Request body:', req.body);
  try {
    const {senderName, receiverName, amount, senderEmail, receiverEmail, date} = req.body;

    console.log('senderName:', senderName);
    console.log('receiverName:', receiverName);
    console.log('amount:', amount);
    console.log('senderEmail:', senderEmail);
    console.log('receiverEmail:', receiverEmail);
    console.log('date:', date);

    if (!senderName || !receiverName || !amount || !senderEmail || !receiverEmail || !date) {
      return res.status(400).json({error: "Missing required fields"});
    }

    // Send Debit Notification
    const debitEmailHtml = debitNotificationEmailTemplate
      .replace('{{senderName}}', senderName)
      .replace('{{amount}}', amount)
      .replace('{{receiverName}}', receiverName)
      .replace('{{date}}', date);

    await resend.emails.send({
      from: RESEND_FROM,
      to: senderEmail,
      subject: "Debit Transaction Notification",
      html: debitEmailHtml
    });

    // Send Credit Notification
    const creditEmailHtml = creditNotificationEmailTemplate
      .replace('{{receiverName}}', receiverName)
      .replace('{{amount}}', amount)
      .replace('{{senderName}}', senderName)
      .replace('{{date}}', date);

    await resend.emails.send({
      from: RESEND_FROM,
      to: receiverEmail,
      subject: "Credit Transaction Notification",
      html: creditEmailHtml
    });

    return res.json({success: true, message: "Transaction notifications sent"});
  } catch (err) {
    console.error("SEND TRANSACTION NOTIFICATION ERROR:", err);
    return res.status(500).json({error: err.toString()});
  }
});

// ---------------------------
// 404 for all other routes
// ---------------------------
// START SERVER
// ---------------------------
app.listen(PORT || 3000, () =>
  console.log(`Auth server running on port ${PORT || 3000}`)
);

