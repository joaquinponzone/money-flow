import { db } from '@/db';
import { notificationPreferences, expenses, incomes } from '@/db/schema';
import { eq, and, gte, lte, isNull } from 'drizzle-orm';
import { addDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, format } from 'date-fns';

interface NotificationData {
  title: string;
  body: string;
  type: string;
  data?: Record<string, unknown>;
}

export async function sendNotification(userId: string, notification: NotificationData) {
  try {
    const response = await fetch(`${process.env.VERCEL_URL || process.env.NEXT_PUBLIC_APP_URL}/api/push/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(notification),
    });

    if (!response.ok) {
      console.error('Failed to send notification:', await response.text());
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error sending notification:', error);
    return false;
  }
}

export async function checkAndSendExpenseReminders() {
  try {
    // Get all users with expense reminders enabled
    const usersWithReminders = await db
      .select({
        userId: notificationPreferences.userId,
      })
      .from(notificationPreferences)
      .where(eq(notificationPreferences.expenseReminders, true));

    const today = new Date();
    const tomorrow = addDays(today, 1);

    for (const { userId } of usersWithReminders) {
      // Get upcoming expenses due tomorrow
      const upcomingExpenses = await db
        .select()
        .from(expenses)
        .where(and(
          eq(expenses.userId, userId),
          gte(expenses.dueDate, today),
          lte(expenses.dueDate, tomorrow),
          isNull(expenses.paidAt)
        ));

      if (upcomingExpenses.length > 0) {
        const totalAmount = upcomingExpenses.reduce((sum, expense) => 
          sum + parseFloat(expense.amount), 0
        );

        await sendNotification(userId, {
          title: 'Upcoming Bills Due Tomorrow',
          body: `You have ${upcomingExpenses.length} bill(s) due tomorrow totaling $${totalAmount.toFixed(2)}`,
          type: 'expense_reminder',
          data: {
            expenseCount: upcomingExpenses.length,
            totalAmount,
            dueDate: format(tomorrow, 'yyyy-MM-dd'),
          },
        });
      }
    }
  } catch (error) {
    console.error('Error checking expense reminders:', error);
  }
}

export async function checkAndSendBudgetAlerts() {
  try {
    // Get all users with budget alerts enabled
    const usersWithAlerts = await db
      .select({
        userId: notificationPreferences.userId,
      })
      .from(notificationPreferences)
      .where(eq(notificationPreferences.budgetAlerts, true));

    for (const { userId } of usersWithAlerts) {
      // Get current month expenses
      const currentMonthExpenses = await db
        .select()
        .from(expenses)
        .where(and(
          eq(expenses.userId, userId),
          gte(expenses.date, startOfMonth(new Date())),
          lte(expenses.date, endOfMonth(new Date()))
        ));

      const totalExpenses = currentMonthExpenses.reduce((sum, expense) => 
        sum + parseFloat(expense.amount), 0
      );

      // Get current month incomes
      const currentMonthIncomes = await db
        .select()
        .from(incomes)
        .where(and(
          eq(incomes.userId, userId),
          gte(incomes.date, startOfMonth(new Date())),
          lte(incomes.date, endOfMonth(new Date()))
        ));

      const totalIncome = currentMonthIncomes.reduce((sum, income) => 
        sum + parseFloat(income.amount), 0
      );

      // Send alert if expenses exceed 80% of income
      if (totalIncome > 0 && (totalExpenses / totalIncome) > 0.8) {
        await sendNotification(userId, {
          title: 'Budget Alert',
          body: `You've spent ${((totalExpenses / totalIncome) * 100).toFixed(1)}% of your monthly income. Consider reviewing your expenses.`,
          type: 'budget_alert',
          data: {
            totalExpenses,
            totalIncome,
            percentage: (totalExpenses / totalIncome) * 100,
          },
        });
      }
    }
  } catch (error) {
    console.error('Error checking budget alerts:', error);
  }
}

export async function sendWeeklyReports() {
  try {
    // Get all users with weekly reports enabled
    const usersWithReports = await db
      .select({
        userId: notificationPreferences.userId,
      })
      .from(notificationPreferences)
      .where(eq(notificationPreferences.weeklyReports, true));

    const weekStart = startOfWeek(new Date());
    const weekEnd = endOfWeek(new Date());

    for (const { userId } of usersWithReports) {
      // Get weekly expenses
      const weeklyExpenses = await db
        .select()
        .from(expenses)
        .where(and(
          eq(expenses.userId, userId),
          gte(expenses.date, weekStart),
          lte(expenses.date, weekEnd)
        ));

      const totalExpenses = weeklyExpenses.reduce((sum, expense) => 
        sum + parseFloat(expense.amount), 0
      );

      // Get weekly incomes
      const weeklyIncomes = await db
        .select()
        .from(incomes)
        .where(and(
          eq(incomes.userId, userId),
          gte(incomes.date, weekStart),
          lte(incomes.date, weekEnd)
        ));

      const totalIncome = weeklyIncomes.reduce((sum, income) => 
        sum + parseFloat(income.amount), 0
      );

      const balance = totalIncome - totalExpenses;

      await sendNotification(userId, {
        title: 'Weekly Financial Summary',
        body: `This week: Income $${totalIncome.toFixed(2)}, Expenses $${totalExpenses.toFixed(2)}, Balance $${balance.toFixed(2)}`,
        type: 'weekly_report',
        data: {
          totalIncome,
          totalExpenses,
          balance,
          weekStart: format(weekStart, 'yyyy-MM-dd'),
          weekEnd: format(weekEnd, 'yyyy-MM-dd'),
        },
      });
    }
  } catch (error) {
    console.error('Error sending weekly reports:', error);
  }
}

export async function sendMonthlyReports() {
  try {
    // Get all users with monthly reports enabled
    const usersWithReports = await db
      .select({
        userId: notificationPreferences.userId,
      })
      .from(notificationPreferences)
      .where(eq(notificationPreferences.monthlyReports, true));

    const monthStart = startOfMonth(new Date());
    const monthEnd = endOfMonth(new Date());

    for (const { userId } of usersWithReports) {
      // Get monthly expenses
      const monthlyExpenses = await db
        .select()
        .from(expenses)
        .where(and(
          eq(expenses.userId, userId),
          gte(expenses.date, monthStart),
          lte(expenses.date, monthEnd)
        ));

      const totalExpenses = monthlyExpenses.reduce((sum, expense) => 
        sum + parseFloat(expense.amount), 0
      );

      // Get monthly incomes
      const monthlyIncomes = await db
        .select()
        .from(incomes)
        .where(and(
          eq(incomes.userId, userId),
          gte(incomes.date, monthStart),
          lte(incomes.date, monthEnd)
        ));

      const totalIncome = monthlyIncomes.reduce((sum, income) => 
        sum + parseFloat(income.amount), 0
      );

      const balance = totalIncome - totalExpenses;

      await sendNotification(userId, {
        title: 'Monthly Financial Summary',
        body: `This month: Income $${totalIncome.toFixed(2)}, Expenses $${totalExpenses.toFixed(2)}, Balance $${balance.toFixed(2)}`,
        type: 'monthly_report',
        data: {
          totalIncome,
          totalExpenses,
          balance,
          monthStart: format(monthStart, 'yyyy-MM-dd'),
          monthEnd: format(monthEnd, 'yyyy-MM-dd'),
        },
      });
    }
  } catch (error) {
    console.error('Error sending monthly reports:', error);
  }
}

export async function sendPaymentConfirmation(userId: string, expenseTitle: string, amount: string) {
  try {
    const userPreferences = await db
      .select()
      .from(notificationPreferences)
      .where(eq(notificationPreferences.userId, userId))
      .limit(1);

    if (userPreferences.length > 0 && userPreferences[0].paymentReminders) {
      await sendNotification(userId, {
        title: 'Payment Confirmed',
        body: `Payment of $${amount} for "${expenseTitle}" has been recorded.`,
        type: 'payment_reminder',
        data: {
          expenseTitle,
          amount,
          paidAt: new Date().toISOString(),
        },
      });
    }
  } catch (error) {
    console.error('Error sending payment confirmation:', error);
  }
} 