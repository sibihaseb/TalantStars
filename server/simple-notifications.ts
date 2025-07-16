import { storage } from './simple-storage';

export interface CreateNotificationData {
  userId: number;
  type: string;
  title: string;
  message: string;
}

export async function createNotification(data: CreateNotificationData) {
  // For now, just create a simple notification - in a real system this would go to database
  // Since we're using simple storage, we'll just log it
  console.log('Creating notification:', data);
  
  // In a real implementation, this would call storage.createNotification
  // For now, we'll just return a mock notification
  return {
    id: Date.now(),
    userId: data.userId,
    type: data.type,
    title: data.title,
    message: data.message,
    read: false,
    createdAt: new Date().toISOString()
  };
}

export async function createWelcomeNotification(userId: number) {
  return await createNotification({
    userId,
    type: 'system',
    title: 'Welcome to Talents & Stars!',
    message: 'Complete your profile to get started and discover amazing opportunities.'
  });
}

export async function createUploadNotification(userId: number, filename: string) {
  return await createNotification({
    userId,
    type: 'media',
    title: 'Media Upload Successful',
    message: `Your file "${filename}" has been uploaded successfully.`
  });
}