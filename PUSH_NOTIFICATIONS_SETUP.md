# Push Notifications Setup Guide

This guide will help you set up push notifications for your Money Flow application.

## Prerequisites

- A modern browser that supports Service Workers and Push API
- Vercel or similar hosting platform for deployment
- A cron job service (like Vercel Cron Jobs)

## Step 1: Generate VAPID Keys

VAPID (Voluntary Application Server Identification) keys are required for push notifications.

1. Install the web-push CLI globally:
```bash
npm install -g web-push
```

2. Generate VAPID keys:
```bash
web-push generate-vapid-keys
```

3. Add the keys to your environment variables:
```env
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_public_key_here
VAPID_PRIVATE_KEY=your_private_key_here
```

## Step 2: Update Environment Variables

Add these environment variables to your `.env.local` file:

```env
# VAPID Keys for Push Notifications
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_public_key_here
VAPID_PRIVATE_KEY=your_private_key_here

# App URL (for notification sending)
NEXT_PUBLIC_APP_URL=https://your-app-domain.vercel.app

# Cron Secret Token (for scheduled notifications)
CRON_SECRET_TOKEN=your_secret_token_here
```

## Step 3: Update VAPID Email

In `src/app/api/push/send/route.ts`, update the email address:

```typescript
webpush.setVapidDetails(
  'mailto:your-email@example.com', // Replace with your email
  vapidKeys.publicKey,
  vapidKeys.privateKey
);
```

## Step 4: Deploy and Test

1. Deploy your application to Vercel
2. Navigate to `/settings/notifications` in your app
3. Click "Enable" to subscribe to push notifications
4. Test the notification by clicking "Send Test"

## Step 5: Set Up Cron Jobs (Optional)

For scheduled notifications, set up cron jobs in Vercel:

1. Create a `vercel.json` file in your project root:

```json
{
  "crons": [
    {
      "path": "/api/cron/notifications",
      "schedule": "0 9 * * *"
    }
  ]
}
```

2. The cron job will run daily at 9 AM and send notifications based on user preferences.

## Features Implemented

### 1. Push Notification Subscription
- Users can enable/disable push notifications
- Automatic subscription management
- Browser compatibility checking

### 2. Notification Types
- **Expense Reminders**: Notify users about upcoming bill payments
- **Budget Alerts**: Alert when spending exceeds 80% of monthly income
- **Payment Confirmations**: Confirm when payments are recorded
- **Weekly Reports**: Send weekly financial summaries
- **Monthly Reports**: Send monthly financial summaries

### 3. User Preferences
- Granular control over notification types
- Easy-to-use settings interface
- Persistent preferences storage

### 4. Service Worker
- Handles push notifications in the background
- Manages notification clicks and actions
- Provides offline functionality

## API Endpoints

### POST /api/push/subscribe
Subscribe to push notifications

### DELETE /api/push/subscribe?endpoint={endpoint}
Unsubscribe from push notifications

### POST /api/push/send
Send a push notification

### GET /api/push/preferences
Get user notification preferences

### PUT /api/push/preferences
Update user notification preferences

### POST /api/cron/notifications
Process scheduled notifications (requires authentication)

## Database Schema

The following tables have been added:

### push_subscriptions
- Stores user push notification subscriptions
- Contains endpoint, p256dh, and auth keys

### notification_preferences
- Stores user notification preferences
- Controls which types of notifications are enabled

### notification_history
- Logs all sent notifications
- Tracks read status and click events

## Troubleshooting

### Common Issues

1. **"Notifications not supported"**
   - Ensure you're using a modern browser (Chrome, Firefox, Safari)
   - Check that HTTPS is enabled (required for service workers)

2. **"Failed to subscribe"**
   - Verify VAPID keys are correctly set
   - Check that the service worker is properly registered

3. **"No notifications received"**
   - Check browser notification permissions
   - Verify the service worker is active
   - Check the browser console for errors

4. **"Cron jobs not working"**
   - Verify the CRON_SECRET_TOKEN is set
   - Check Vercel cron job configuration
   - Review server logs for errors

### Debug Steps

1. Open browser developer tools
2. Check the Console tab for errors
3. Check the Application tab > Service Workers
4. Verify the service worker is registered and active
5. Test the notification API endpoints manually

## Security Considerations

1. **VAPID Keys**: Keep your private key secure and never expose it in client-side code
2. **Authentication**: All API endpoints require user authentication
3. **Cron Security**: Use a strong secret token for cron job authentication
4. **HTTPS**: Push notifications require HTTPS in production

## Browser Support

- Chrome 42+
- Firefox 44+
- Safari 16+
- Edge 17+

## Performance Notes

- Service workers are cached for offline functionality
- Notifications are sent asynchronously
- Database queries are optimized for performance
- Failed subscriptions are automatically cleaned up

## Future Enhancements

- Rich notifications with images and actions
- Notification grouping and management
- Advanced scheduling options
- Notification analytics and insights
- Cross-platform push notifications (mobile apps) 