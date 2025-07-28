import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';
import { db } from '@/db';
import { pushSubscriptions } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST() {
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

    if (subscriptions.length === 0) {
      return NextResponse.json({ 
        message: 'No subscriptions found',
        removed: 0 
      });
    }

    // Remove all subscriptions for this user
    await db
      .delete(pushSubscriptions)
      .where(eq(pushSubscriptions.userId, user.id));

    console.log(`Cleaned up ${subscriptions.length} subscriptions for user ${user.id}`);

    return NextResponse.json({
      message: 'All subscriptions cleaned up',
      removed: subscriptions.length
    });
  } catch (error) {
    console.error('Error cleaning up subscriptions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 