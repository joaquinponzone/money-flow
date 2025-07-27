import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';
import { db } from '@/db';
import { pushSubscriptions } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all user's subscriptions
    const subscriptions = await db
      .select()
      .from(pushSubscriptions)
      .where(eq(pushSubscriptions.userId, user.id));

    return NextResponse.json({
      userId: user.id,
      subscriptionCount: subscriptions.length,
      subscriptions: subscriptions.map(sub => ({
        id: sub.id,
        endpoint: sub.endpoint.substring(0, 50) + '...',
        createdAt: sub.createdAt,
        updatedAt: sub.updatedAt,
      })),
      environment: {
        hasVapidPublicKey: !!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
        hasVapidPrivateKey: !!process.env.VAPID_PRIVATE_KEY,
        appUrl: process.env.VERCEL_URL || process.env.NEXT_PUBLIC_APP_URL,
      }
    });
  } catch (error) {
    console.error('Error debugging subscriptions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 