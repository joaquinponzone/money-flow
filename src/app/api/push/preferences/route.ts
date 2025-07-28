import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase';
import { db } from '@/db';
import { notificationPreferences } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const preferences = await db
      .select()
      .from(notificationPreferences)
      .where(eq(notificationPreferences.userId, user.id))
      .limit(1);

    if (preferences.length === 0) {
      // Create default preferences if none exist
      const defaultPreferences = await db.insert(notificationPreferences).values({
        userId: user.id,
      }).returning();

      return NextResponse.json(defaultPreferences[0]);
    }

    return NextResponse.json(preferences[0]);
  } catch (error) {
    console.error('Error fetching notification preferences:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      expenseReminders,
      budgetAlerts,
      paymentReminders,
      weeklyReports,
      monthlyReports,
    } = body;

    // Check if preferences exist
    const existingPreferences = await db
      .select()
      .from(notificationPreferences)
      .where(eq(notificationPreferences.userId, user.id))
      .limit(1);

    let updatedPreferences;

    if (existingPreferences.length === 0) {
      // Create new preferences
      updatedPreferences = await db.insert(notificationPreferences).values({
        userId: user.id,
        expenseReminders: expenseReminders ?? true,
        budgetAlerts: budgetAlerts ?? true,
        paymentReminders: paymentReminders ?? true,
        weeklyReports: weeklyReports ?? false,
        monthlyReports: monthlyReports ?? true,
      }).returning();
    } else {
      // Update existing preferences
      updatedPreferences = await db
        .update(notificationPreferences)
        .set({
          expenseReminders: expenseReminders ?? existingPreferences[0].expenseReminders,
          budgetAlerts: budgetAlerts ?? existingPreferences[0].budgetAlerts,
          paymentReminders: paymentReminders ?? existingPreferences[0].paymentReminders,
          weeklyReports: weeklyReports ?? existingPreferences[0].weeklyReports,
          monthlyReports: monthlyReports ?? existingPreferences[0].monthlyReports,
          updatedAt: new Date(),
        })
        .where(eq(notificationPreferences.userId, user.id))
        .returning();
    }

    return NextResponse.json(updatedPreferences[0]);
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 