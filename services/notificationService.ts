
import { ADMIN_EMAIL } from '../constants';

export const NotificationService = {
  sendAdminNewUserNotification: async (userEmail: string, fullName: string) => {
    try {
      await fetch('/api/notify-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'NEW_USER',
          data: { email: userEmail, fullName }
        }),
      });
      return true;
    } catch (err) {
      console.error('Failed to notify admin via API:', err);
      return false;
    }
  },

  sendDeadlineReminder: async (email: string, topic: string, date: string) => {
    try {
      await fetch('/api/notify-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'DEADLINE',
          data: { email, topic, date, fullName: 'Системное напоминание' }
        }),
      });
      return true;
    } catch (err) {
      return false;
    }
  }
};
