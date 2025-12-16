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
    const {email, password} = req.body;

    if (!email || !password)
      return res.status(400).json({error: "Email & password required"});

    const emailLower = email.trim().toLowerCase();

    // Create supabase user
    const {data: userData, error: userErr} =
      await db.auth.admin.createUser({
        email: emailLower,
        password,
        email_confirm: false
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
    const resetLink = `/reset-password?token=${resetToken}&email=${encodeURIComponent(emailLower)}`; // Frontend URL
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

    // Get the latest valid token
    const {data: rows, error: tokenErr} = await db
      .from("password_reset_tokens")
      .select("*")
      .eq("email", emailLower)
      .eq("consumed", false)
      .order("created_at", {ascending: false});

    if (tokenErr || !rows.length) {
      return res.status(400).json({error: "Invalid or expired password reset link."});
    }

    const record = rows[0];

    // Check expiry
    if (new Date(record.expires_at) < new Date()) {
      return res.status(400).json({error: "Password reset link has expired."});
    }

    // Compare the provided token with the hashed token in the DB
    const validToken = await bcrypt.compare(token, record.token_hash);
    if (!validToken) {
      return res.status(400).json({error: "Invalid or expired password reset link."});
    }

    // Update user's password in Supabase Auth
    const {error: updateErr} = await db.auth.admin.updateUserById(record.user_id, {
      password: newPassword,
    });

    if (updateErr) {
      console.error("PASSWORD UPDATE ERROR:", updateErr);
      return res.status(500).json({error: "Failed to update password."});
    }

    // Mark the token as consumed
    await db
      .from("password_reset_tokens")
      .update({consumed: true})
      .eq("id", record.id);

    return res.json({success: true, message: "Password has been reset successfully."});

  } catch (err) {
    console.error("RESET PASSWORD ERROR:", err);
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
// 404 for all other routes
// ---------------------------
// START SERVER
// ---------------------------
app.listen(PORT || 3000, () =>
  console.log(`Auth server running on port ${PORT || 3000}`)
);

