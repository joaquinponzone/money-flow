import { NextRequest, NextResponse } from 'next/server';
import { 
  checkAndSendExpenseReminders, 
  checkAndSendBudgetAlerts, 
  sendWeeklyReports, 
  sendMonthlyReports 
} from '@/lib/notifications';

export async function POST(request: NextRequest) {
  try {
    // Verify the request is from a legitimate cron service
    const authHeader = request.headers.get('authorization');
    const expectedToken = process.env.CRON_SECRET_TOKEN;
    
    if (!expectedToken || authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { type } = body;

    let results = {};

    switch (type) {
      case 'expense_reminders':
        await checkAndSendExpenseReminders();
        results = { message: 'Expense reminders processed' };
        break;
      
      case 'budget_alerts':
        await checkAndSendBudgetAlerts();
        results = { message: 'Budget alerts processed' };
        break;
      
      case 'weekly_reports':
        await sendWeeklyReports();
        results = { message: 'Weekly reports sent' };
        break;
      
      case 'monthly_reports':
        await sendMonthlyReports();
        results = { message: 'Monthly reports sent' };
        break;
      
      case 'all':
        await Promise.all([
          checkAndSendExpenseReminders(),
          checkAndSendBudgetAlerts(),
          sendWeeklyReports(),
          sendMonthlyReports(),
        ]);
        results = { message: 'All notifications processed' };
        break;
      
      default:
        return NextResponse.json({ error: 'Invalid notification type' }, { status: 400 });
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error('Error processing notifications:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 