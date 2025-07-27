import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';
import { db } from '@/db';
import { pushSubscriptions, notificationPreferences } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { endpoint, p256dh, auth } = body;

    if (!endpoint || !p256dh || !auth) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if subscription already exists
    const existingSubscription = await db
      .select()
      .from(pushSubscriptions)
      .where(and(
        eq(pushSubscriptions.userId, user.id),
        eq(pushSubscriptions.endpoint, endpoint)
      ))
      .limit(1);

    if (existingSubscription.length > 0) {
      // Update existing subscription
      await db
        .update(pushSubscriptions)
        .set({
          p256dh,
          auth,
          updatedAt: new Date(),
        })
        .where(eq(pushSubscriptions.id, existingSubscription[0].id));
    } else {
      // Create new subscription
      await db.insert(pushSubscriptions).values({
        userId: user.id,
        endpoint,
        p256dh,
        auth,
      });
    }

    // Ensure user has notification preferences
    const existingPreferences = await db
      .select()
      .from(notificationPreferences)
      .where(eq(notificationPreferences.userId, user.id))
      .limit(1);

    if (existingPreferences.length === 0) {
      await db.insert(notificationPreferences).values({
        userId: user.id,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error subscribing to push notifications:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const endpoint = searchParams.get('endpoint');

    if (!endpoint) {
      return NextResponse.json({ error: 'Missing endpoint' }, { status: 400 });
    }

    // Delete subscription
    await db
      .delete(pushSubscriptions)
      .where(and(
        eq(pushSubscriptions.userId, user.id),
        eq(pushSubscriptions.endpoint, endpoint)
      ));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error unsubscribing from push notifications:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 