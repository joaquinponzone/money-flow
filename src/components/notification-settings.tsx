"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Bell, BellOff, Settings, TestTube } from "lucide-react";
import { usePushNotifications } from "@/hooks/use-push-notifications";
import { toast } from "sonner";

export function NotificationSettings() {
  const {
    isSupported,
    isSubscribed,
    isLoading,
    error,
    preferences,
    subscribe,
    unsubscribe,
    updatePreferences,
    sendTestNotification,
    checkSubscriptionStatus,
  } = usePushNotifications();

  const [isUpdating, setIsUpdating] = useState(false);

  const handleToggleSubscription = async () => {
    try {
      if (isSubscribed) {
        await unsubscribe();
        toast.success("Notifications disabled");
      } else {
        await subscribe();
        toast.success("Notifications enabled");
      }
    } catch {
      toast.error("Failed to toggle notifications");
    }
  };

  const handlePreferenceChange = async (key: keyof NonNullable<typeof preferences>, value: boolean) => {
    if (!preferences) return;

    try {
      setIsUpdating(true);
      await updatePreferences({ [key]: value });
      toast.success("Preferences updated");
    } catch {
      toast.error("Failed to update preferences");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleTestNotification = async () => {
    try {
      await sendTestNotification();
      toast.success("Test notification sent!");
    } catch {
      toast.error("Failed to send test notification");
    }
  };

  const handleCleanupSubscriptions = async () => {
    try {
      const response = await fetch('/api/push/cleanup', {
        method: 'POST',
      });

      if (response.ok) {
        const result = await response.json();
        toast.success(`Cleaned up ${result.removed} subscriptions`);
        // Refresh subscription status
        checkSubscriptionStatus();
      } else {
        throw new Error('Failed to cleanup subscriptions');
      }
    } catch {
      toast.error("Failed to cleanup subscriptions");
    }
  };

  if (!isSupported) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BellOff className="h-5 w-5" />
            Push Notifications Not Supported
          </CardTitle>
          <CardDescription>
            Your browser doesn&apos;t support push notifications. Please use a modern browser like Chrome, Firefox, or Safari.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Notification Settings
        </CardTitle>
        <CardDescription>
          Manage your push notification preferences and settings.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Subscription Status */}
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-base font-medium">Push Notifications</Label>
            <p className="text-sm text-muted-foreground">
              {isSubscribed ? "Notifications are enabled" : "Notifications are disabled"}
            </p>
          </div>
          <Button
            onClick={handleToggleSubscription}
            disabled={isLoading}
            variant={isSubscribed ? "outline" : "default"}
            className="flex items-center gap-2"
          >
            {isSubscribed ? (
              <>
                <BellOff className="h-4 w-4" />
                Disable
              </>
            ) : (
              <>
                <Bell className="h-4 w-4" />
                Enable
              </>
            )}
          </Button>
        </div>

        {error && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        <Separator />

        {/* Notification Preferences */}
        {isSubscribed && preferences && (
          <>
            <div>
              <h3 className="text-lg font-medium mb-4">Notification Types</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Expense Reminders</Label>
                    <p className="text-sm text-muted-foreground">
                      Get reminded about upcoming bill payments
                    </p>
                  </div>
                  <Switch
                    checked={preferences.expenseReminders}
                    onCheckedChange={(checked) => handlePreferenceChange('expenseReminders', checked)}
                    disabled={isUpdating}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Budget Alerts</Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified when you exceed budget limits
                    </p>
                  </div>
                  <Switch
                    checked={preferences.budgetAlerts}
                    onCheckedChange={(checked) => handlePreferenceChange('budgetAlerts', checked)}
                    disabled={isUpdating}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Payment Confirmations</Label>
                    <p className="text-sm text-muted-foreground">
                      Receive confirmations when payments are recorded
                    </p>
                  </div>
                  <Switch
                    checked={preferences.paymentReminders}
                    onCheckedChange={(checked) => handlePreferenceChange('paymentReminders', checked)}
                    disabled={isUpdating}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Weekly Reports</Label>
                    <p className="text-sm text-muted-foreground">
                      Get weekly spending summaries
                    </p>
                  </div>
                  <Switch
                    checked={preferences.weeklyReports}
                    onCheckedChange={(checked) => handlePreferenceChange('weeklyReports', checked)}
                    disabled={isUpdating}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Monthly Reports</Label>
                    <p className="text-sm text-muted-foreground">
                      Get monthly spending summaries
                    </p>
                  </div>
                  <Switch
                    checked={preferences.monthlyReports}
                    onCheckedChange={(checked) => handlePreferenceChange('monthlyReports', checked)}
                    disabled={isUpdating}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Test Notification */}
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base font-medium">Test Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Send a test notification to verify everything is working
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleCleanupSubscriptions}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Settings className="h-4 w-4" />
                  Cleanup
                </Button>
                <Button
                  onClick={handleTestNotification}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <TestTube className="h-4 w-4" />
                  Send Test
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
} 