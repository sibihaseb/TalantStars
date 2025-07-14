import crypto from 'crypto';
import { storage } from './storage';
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
  const user = await storage.getUser(email);
  if (!user) {
    // Don't reveal if user exists or not
    return true;
  }

  const token = await generatePasswordResetToken(user.id);
  return await sendPasswordResetEmail(email, token);
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