import crypto from 'crypto';
import { storage as storage } from './simple-storage';
import { sendPasswordResetEmail } from './email';

export async function generatePasswordResetToken(userId: string): Promise<string> {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now
  
  await storage.createPasswordResetToken({
    userId,
    token,
    expiresAt,
    used: false,
  });

  return token;
}

export async function requestPasswordReset(email: string): Promise<boolean> {
  try {
    console.log(`🔐 Looking up user by email: ${email}`);
    const user = await storage.getUserByEmail(email);
    if (!user) {
      console.log(`⚠️ User not found for email: ${email}`);
      // Don't reveal if user exists or not
      return true;
    }

    console.log(`📧 Sending password reset email to: ${email}`);
    const resetToken = 'reset-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    return await sendPasswordResetEmail(email, resetToken);
  } catch (error) {
    console.error('Error in requestPasswordReset:', error);
    return false;
  }
}

export async function validatePasswordResetToken(token: string): Promise<{ valid: boolean; userId?: string }> {
  const resetToken = await storage.getPasswordResetToken(token);
  
  if (!resetToken) {
    return { valid: false };
  }

  if (resetToken.used) {
    return { valid: false };
  }

  if (resetToken.expiresAt < new Date()) {
    return { valid: false };
  }

  return { valid: true, userId: resetToken.userId };
}

export async function resetPassword(token: string, newPassword: string): Promise<boolean> {
  const validation = await validatePasswordResetToken(token);
  
  if (!validation.valid || !validation.userId) {
    return false;
  }

  // In a real app, you would hash the password here
  // For now, we'll just update the user record
  await storage.upsertUser({
    id: validation.userId,
    // Note: In a real app, you'd have a password field and hash it
    // For this demo, we'll just mark the token as used
  });

  await storage.usePasswordResetToken(token);
  return true;
}