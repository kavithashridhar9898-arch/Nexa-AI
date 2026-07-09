import { VercelRequest, VercelResponse } from '@vercel/node';
import jwt from 'jsonwebtoken';
import { db } from './_config/db';
import { hashPassword, comparePassword, generateOtp, generateRandomId } from './_utils/crypto';
import { sendOtpEmail } from './_services/mail.service';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-jwt-key-for-nexus-ai-platform-2026';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

const getFormattedDate = (futureMs: number = 0) => {
  return new Date(Date.now() + futureMs).toISOString().slice(0, 19).replace('T', ' ');
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const url = req.url || '';
  
  // Resolve action from URL path
  let action = '';
  if (url.includes('/login')) action = 'login';
  else if (url.includes('/register')) action = 'register';
  else if (url.includes('/verify-otp')) action = 'verify-otp';
  else if (url.includes('/request-otp')) action = 'request-otp';
  else if (url.includes('/reset-password')) action = 'reset-password';

  if (!action) {
    return res.status(400).json({ error: `Action not recognized for URL: ${url}` });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed.' });
  }

  try {
    // --------------------------------------------------
    // REGISTER
    // --------------------------------------------------
    if (action === 'register') {
      const { name, email, password } = req.body;
      if (!name || !email || !password) {
        return res.status(400).json({ error: 'Name, email, and password are required.' });
      }
      if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
      }

      const users = await db.query('SELECT * FROM users WHERE email = ?', [email]);
      if (users.length > 0) {
        return res.status(400).json({ error: 'User with this email already exists.' });
      }

      const userId = generateRandomId();
      const hashedPassword = await hashPassword(password);

      await db.execute(
        'INSERT INTO users (id, name, email, password_hash, is_verified) VALUES (?, ?, ?, ?, 1)',
        [userId, name, email, hashedPassword]
      );

      const token = jwt.sign({ userId, email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN as any });
      const notificationId = generateRandomId();
      await db.execute(
        'INSERT INTO notifications (id, user_id, title, message, type, is_read) VALUES (?, ?, ?, ?, ?, 0)',
        [notificationId, userId, 'Welcome to Nexus AI!', 'Unlock extreme automated productivity with nodes, triggers, webhooks, and integrations.', 'SUCCESS']
      );

      return res.status(201).json({
        message: 'Registration successful.',
        token,
        user: { id: userId, name, email }
      });
    }

    // --------------------------------------------------
    // LOGIN
    // --------------------------------------------------
    if (action === 'login') {
      const { email, password, rememberMe } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required.' });
      }

      const users = await db.query('SELECT * FROM users WHERE email = ?', [email]);
      if (users.length === 0) {
        return res.status(401).json({ error: 'Invalid email or password.' });
      }

      const user = users[0];
      const isMatch = await comparePassword(password, user.password_hash);
      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid email or password.' });
      }

      const expiresIn = rememberMe ? '30d' : JWT_EXPIRES_IN;
      const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: expiresIn as any });

      return res.status(200).json({
        message: 'Login successful.',
        token,
        user: { id: user.id, name: user.name, email: user.email }
      });
    }

    // --------------------------------------------------
    // VERIFY-OTP
    // --------------------------------------------------
    if (action === 'verify-otp') {
      const { email, code, type } = req.body;
      if (!email || !code || !type) {
        return res.status(400).json({ error: 'Email, OTP code, and type are required.' });
      }

      const otps = await db.query(
        'SELECT * FROM otps WHERE email = ? AND code = ? AND type = ? ORDER BY created_at DESC LIMIT 1',
        [email, code, type]
      );

      if (otps.length === 0) {
        return res.status(400).json({ error: 'Invalid verification code.' });
      }

      const otp = otps[0];
      const now = new Date();
      const expiry = new Date(otp.expires_at);

      if (expiry < now) {
        return res.status(400).json({ error: 'Verification code has expired.' });
      }

      if (type === 'VERIFY_EMAIL') {
        await db.execute('UPDATE users SET is_verified = 1 WHERE email = ?', [email]);
        await db.execute('DELETE FROM otps WHERE email = ? AND type = ?', [email, 'VERIFY_EMAIL']);

        const users = await db.query('SELECT id, name, email FROM users WHERE email = ?', [email]);
        const user = users[0];

        const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN as any });
        const notificationId = generateRandomId();
        await db.execute(
          'INSERT INTO notifications (id, user_id, title, message, type, is_read) VALUES (?, ?, ?, ?, ?, 0)',
          [notificationId, user.id, 'Welcome to Nexus AI!', 'Unlock extreme automated productivity with nodes, triggers, webhooks, and integrations.', 'SUCCESS']
        );

        return res.status(200).json({
          message: 'Account verified successfully.',
          token,
          user: { id: user.id, name: user.name, email: user.email }
        });
      } else if (type === 'RESET_PASSWORD') {
        return res.status(200).json({
          message: 'OTP verified. Proceed to reset password.',
          email,
          code
        });
      }

      return res.status(400).json({ error: 'Invalid verification type.' });
    }

    // --------------------------------------------------
    // REQUEST-OTP
    // --------------------------------------------------
    if (action === 'request-otp') {
      const { email, type } = req.body;
      if (!email || !type) {
        return res.status(400).json({ error: 'Email and verification type are required.' });
      }

      if (type === 'RESET_PASSWORD') {
        const users = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
          return res.status(200).json({ message: 'If the email exists, an OTP has been sent.' });
        }
      }

      await db.execute('DELETE FROM otps WHERE email = ? AND type = ?', [email, type]);

      const otpCode = generateOtp();
      const otpId = generateRandomId();
      const expiresAt = getFormattedDate(15 * 60 * 1000);

      await db.execute(
        'INSERT INTO otps (id, email, code, type, expires_at) VALUES (?, ?, ?, ?, ?)',
        [otpId, email, otpCode, type, expiresAt]
      );

      await sendOtpEmail(email, otpCode, type);

      return res.status(200).json({
        message: 'Verification code sent.',
        email
      });
    }

    // --------------------------------------------------
    // RESET-PASSWORD
    // --------------------------------------------------
    if (action === 'reset-password') {
      const { email, code, password } = req.body;
      if (!email || !code || !password) {
        return res.status(400).json({ error: 'Email, OTP code, and new password are required.' });
      }
      if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
      }

      const otps = await db.query(
        'SELECT * FROM otps WHERE email = ? AND code = ? AND type = ? ORDER BY created_at DESC LIMIT 1',
        [email, code, 'RESET_PASSWORD']
      );

      if (otps.length === 0) {
        return res.status(400).json({ error: 'Invalid reset code.' });
      }

      const otp = otps[0];
      const now = new Date();
      const expiry = new Date(otp.expires_at);

      if (expiry < now) {
        return res.status(400).json({ error: 'Reset code has expired.' });
      }

      const hashedPassword = await hashPassword(password);
      await db.execute('UPDATE users SET password_hash = ? WHERE email = ?', [hashedPassword, email]);
      await db.execute('DELETE FROM otps WHERE email = ? AND type = ?', [email, 'RESET_PASSWORD']);

      const users = await db.query('SELECT id FROM users WHERE email = ?', [email]);
      if (users.length > 0) {
        const notificationId = generateRandomId();
        await db.execute(
          'INSERT INTO notifications (id, user_id, title, message, type, is_read) VALUES (?, ?, ?, ?, ?, 0)',
          [notificationId, users[0].id, 'Password Changed', 'Your account password was updated successfully. If you did not do this, contact support immediately.', 'WARNING']
        );
      }

      return res.status(200).json({
        message: 'Password reset successful. You can now login with your new password.'
      });
    }

  } catch (error) {
    console.error(`[Auth Action: ${action}] Error:`, error);
    return res.status(500).json({ error: 'Action failed due to server error.' });
  }
}
