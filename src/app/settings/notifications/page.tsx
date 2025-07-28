import { NotificationSettings } from "@/components/notification-settings";
import { getUserSession } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function NotificationsSettingsPage() {
  const user = await getUserSession();
  
  if (!user) {
    redirect('/auth/login');
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Notification Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your push notification preferences and settings for Money Flow.
        </p>
      </div>
      
      <div className="grid gap-6">
        <NotificationSettings />
      </div>
    </div>
  );
} 