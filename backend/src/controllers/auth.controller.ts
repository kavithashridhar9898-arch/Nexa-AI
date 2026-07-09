import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../config/db';
import { hashPassword, comparePassword, generateOtp, generateRandomId } from '../utils/crypto';
import { sendOtpEmail } from '../services/mail.service';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-jwt-key-for-nexus-ai-platform-2026';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

const getFormattedDate = (futureMs: number = 0) => {
  return new Date(Date.now() + futureMs).toISOString().slice(0, 19).replace('T', ' ');
};

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    // Check if user already exists
    const users = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length > 0) {
      return res.status(400).json({ error: 'User with this email already exists.' });
    }

    const userId = generateRandomId();
    const hashedPassword = await hashPassword(password);

    // Save user as verified directly
    await db.execute(
      'INSERT INTO users (id, name, email, password_hash, is_verified) VALUES (?, ?, ?, ?, 1)',
      [userId, name, email, hashedPassword]
    );

    // Sign JWT
    const token = jwt.sign({ userId, email }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN as any
    });

    // Add a Welcome Notification
    const notificationId = generateRandomId();
    await db.execute(
      'INSERT INTO notifications (id, user_id, title, message, type, is_read) VALUES (?, ?, ?, ?, ?, 0)',
      [
        notificationId,
        userId,
        'Welcome to Nexus AI!',
        'Unlock extreme automated productivity with nodes, triggers, webhooks, and integrations.',
        'SUCCESS'
      ]
    );

    return res.status(201).json({
      message: 'Registration successful.',
      token,
      user: { id: userId, name, email }
    });
  } catch (error) {
    console.error('[Auth Register] Error:', error);
    return res.status(500).json({ error: 'Registration failed due to server error.' });
  }
};

export const verifyOtp = async (req: Request, res: Response) => {
  try {
    const { email, code, type } = req.body; // type is 'VERIFY_EMAIL' or 'RESET_PASSWORD'

    if (!email || !code || !type) {
      return res.status(400).json({ error: 'Email, OTP code, and type are required.' });
    }

    // Retrieve active OTP
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

    // Handle verification
    if (type === 'VERIFY_EMAIL') {
      await db.execute('UPDATE users SET is_verified = 1 WHERE email = ?', [email]);
      await db.execute('DELETE FROM otps WHERE email = ? AND type = ?', [email, 'VERIFY_EMAIL']);

      // Fetch verified user
      const users = await db.query('SELECT id, name, email FROM users WHERE email = ?', [email]);
      const user = users[0];

      // Sign JWT
      const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN as any
      });

      // Add a Welcome Notification
      const notificationId = generateRandomId();
      await db.execute(
        'INSERT INTO notifications (id, user_id, title, message, type, is_read) VALUES (?, ?, ?, ?, ?, 0)',
        [
          notificationId,
          user.id,
          'Welcome to Nexus AI!',
          'Unlock extreme automated productivity with nodes, triggers, webhooks, and integrations.',
          'SUCCESS'
        ]
      );

      return res.status(200).json({
        message: 'Account verified successfully.',
        token,
        user: { id: user.id, name: user.name, email: user.email }
      });
    } else if (type === 'RESET_PASSWORD') {
      // Return success indicating token can be reset
      return res.status(200).json({
        message: 'OTP verified. Proceed to reset password.',
        email,
        code
      });
    }

    return res.status(400).json({ error: 'Invalid verification type.' });
  } catch (error) {
    console.error('[Auth Verify] Error:', error);
    return res.status(500).json({ error: 'Verification failed due to server error.' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password, rememberMe } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    // Fetch user
    const users = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const user = users[0];

    // Compare passwords
    const isMatch = await comparePassword(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }



    // Sign JWT
    const expiresIn = rememberMe ? '30d' : JWT_EXPIRES_IN;
    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: expiresIn as any
    });

    return res.status(200).json({
      message: 'Login successful.',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('[Auth Login] Error:', error);
    return res.status(500).json({ error: 'Login failed due to server error.' });
  }
};

export const requestOtp = async (req: Request, res: Response) => {
  try {
    const { email, type } = req.body; // type is 'VERIFY_EMAIL' or 'RESET_PASSWORD'

    if (!email || !type) {
      return res.status(400).json({ error: 'Email and verification type are required.' });
    }

    // For reset password, verify user exists
    if (type === 'RESET_PASSWORD') {
      const users = await db.query('SELECT * FROM users WHERE email = ?', [email]);
      if (users.length === 0) {
        // Obfuscate user exists, but we can return success so email accounts are not harvested
        return res.status(200).json({ message: 'If the email exists, an OTP has been sent.' });
      }
    }

    // Clean old OTPs of same type
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
  } catch (error) {
    console.error('[Auth Request OTP] Error:', error);
    return res.status(500).json({ error: 'Failed to request OTP.' });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { email, code, password } = req.body;

    if (!email || !code || !password) {
      return res.status(400).json({ error: 'Email, OTP code, and new password are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    // Validate OTP
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

    // Hash and update
    const hashedPassword = await hashPassword(password);
    await db.execute('UPDATE users SET password_hash = ? WHERE email = ?', [hashedPassword, email]);
    
    // Clear OTPs
    await db.execute('DELETE FROM otps WHERE email = ? AND type = ?', [email, 'RESET_PASSWORD']);

    // Send a success notification if user exists
    const users = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (users.length > 0) {
      const notificationId = generateRandomId();
      await db.execute(
        'INSERT INTO notifications (id, user_id, title, message, type, is_read) VALUES (?, ?, ?, ?, ?, 0)',
        [
          notificationId,
          users[0].id,
          'Password Changed',
          'Your account password was updated successfully. If you did not do this, contact support immediately.',
          'WARNING'
        ]
      );
    }

    return res.status(200).json({
      message: 'Password reset successful. You can now login with your new password.'
    });
  } catch (error) {
    console.error('[Auth Reset Password] Error:', error);
    return res.status(500).json({ error: 'Password reset failed due to server error.' });
  }
};
