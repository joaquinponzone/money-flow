import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';
import { db } from '@/db';
import { pushSubscriptions, notificationHistory } from '@/db/schema';
import { eq } from 'drizzle-orm';
import webpush from 'web-push';

// Configure web-push with your VAPID keys
// You'll need to generate these and add them to your environment variables
const vapidKeys = {
  publicKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  privateKey: process.env.VAPID_PRIVATE_KEY!,
};

webpush.setVapidDetails(
  'mailto:admin@money-flow.app', // Replace with your actual email
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, body: messageBody, type, data } = body;

    if (!title || !messageBody || !type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get user's push subscriptions
    const subscriptions = await db
      .select()
      .from(pushSubscriptions)
      .where(eq(pushSubscriptions.userId, user.id));

    if (subscriptions.length === 0) {
      return NextResponse.json({ error: 'No push subscriptions found' }, { status: 404 });
    }

    const notificationPayload = {
      title,
      body: messageBody,
      icon: '/icon-192x192.png',
      badge: '/icon-192x192.png',
      data: {
        url: '/',
        type,
        ...data,
      },
      actions: [
        {
          action: 'open',
          title: 'Open App',
          icon: '/icon-192x192.png',
        },
        {
          action: 'close',
          title: 'Close',
          icon: '/icon-192x192.png',
        },
      ],
      requireInteraction: true,
      tag: 'money-flow-notification',
    };

    // Send notifications to all user's subscriptions
    const results = await Promise.allSettled(
      subscriptions.map(async (subscription) => {
        try {
          const pushSubscription = {
            endpoint: subscription.endpoint,
            keys: {
              p256dh: subscription.p256dh,
              auth: subscription.auth,
            },
          };

          await webpush.sendNotification(
            pushSubscription,
            JSON.stringify(notificationPayload)
          );

          // Log successful notification
          await db.insert(notificationHistory).values({
            userId: user.id,
            title,
            body: messageBody,
            type,
            data,
          });

          return { success: true, subscriptionId: subscription.id };
        } catch (error) {
          console.error('Error sending notification to subscription:', subscription.id, error);
          
          // Check if it's a 410 error (subscription expired/unsubscribed)
          const is410Error = error instanceof Error && 
            (error.message.includes('410') || 
             (error as { statusCode?: number }).statusCode === 410 ||
             error.message.includes('unsubscribed') ||
             error.message.includes('expired'));
          
          if (is410Error) {
            console.log('Removing expired subscription:', subscription.id);
            
            // Remove the invalid subscription from database
            try {
              await db
                .delete(pushSubscriptions)
                .where(eq(pushSubscriptions.id, subscription.id));
              console.log('Successfully removed expired subscription:', subscription.id);
            } catch (deleteError) {
              console.error('Error removing expired subscription:', deleteError);
            }
          }
          
          return { 
            success: false, 
            subscriptionId: subscription.id, 
            error: error instanceof Error ? error.message : 'Unknown error',
            removed: is410Error
          };
        }
      })
    );

    const successful = results.filter(result => 
      result.status === 'fulfilled' && result.value.success
    );
    const failed = results.filter(result => 
      result.status === 'rejected' || !result.value.success
    );
    const removed = results.filter(result => 
      result.status === 'fulfilled' && result.value.removed
    );

    console.log(`Notification results: ${successful.length} sent, ${failed.length} failed, ${removed.length} removed`);

    return NextResponse.json({
      success: true,
      sent: successful.length,
      failed: failed.length,
      removed: removed.length,
      total: subscriptions.length,
    });
  } catch (error) {
    console.error('Error sending push notifications:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 