"use client";

import { useState, useEffect } from 'react';

interface PushNotificationState {
  isSupported: boolean;
  isSubscribed: boolean;
  isLoading: boolean;
  error: string | null;
}

interface NotificationPreferences {
  expenseReminders: boolean;
  budgetAlerts: boolean;
  paymentReminders: boolean;
  weeklyReports: boolean;
  monthlyReports: boolean;
}

export function usePushNotifications() {
  const [state, setState] = useState<PushNotificationState>({
    isSupported: false,
    isSubscribed: false,
    isLoading: true,
    error: null,
  });

  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);

  // Check if push notifications are supported
  useEffect(() => {
    const checkSupport = () => {
      const isSupported = 'serviceWorker' in navigator && 'PushManager' in window;
      setState(prev => ({ ...prev, isSupported, isLoading: false }));
    };

    checkSupport();
  }, []);

  // Check subscription status
  const checkSubscriptionStatus = async () => {
    try {
      if (!state.isSupported) return;

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      setState(prev => ({ 
        ...prev, 
        isSubscribed: !!subscription,
        isLoading: false 
      }));
    } catch (error) {
      console.error('Error checking subscription status:', error);
      setState(prev => ({ 
        ...prev, 
        error: 'Failed to check subscription status',
        isLoading: false 
      }));
    }
  };

  // Load notification preferences
  const loadPreferences = async () => {
    try {
      const response = await fetch('/api/push/preferences');
      if (response.ok) {
        const prefs = await response.json();
        setPreferences(prefs);
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  };

  useEffect(() => {
    checkSubscriptionStatus();
    loadPreferences();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Subscribe to push notifications
  const subscribe = async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const registration = await navigator.serviceWorker.ready;
      
      // Request notification permission
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        throw new Error('Notification permission denied');
      }

      // Check if already subscribed
      let subscription = await registration.pushManager.getSubscription();
      
      // If subscription exists but might be invalid, unsubscribe first
      if (subscription) {
        console.log('Existing subscription found, checking validity...');
        try {
          await subscription.unsubscribe();
          console.log('Unsubscribed from existing subscription');
        } catch (error) {
          console.log('Error unsubscribing from existing subscription:', error);
        }
      }

      // Subscribe to push notifications
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      });

      if (!subscription) {
        throw new Error('Failed to create subscription');
      }

      // Send subscription to server
      const response = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          endpoint: subscription.endpoint,
          p256dh: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('p256dh')!))),
          auth: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('auth')!))),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save subscription');
      }

      setState(prev => ({ 
        ...prev, 
        isSubscribed: true, 
        isLoading: false 
      }));
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to subscribe',
        isLoading: false 
      }));
    }
  };

  // Unsubscribe from push notifications
  const unsubscribe = async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        // Unsubscribe from push manager
        await subscription.unsubscribe();

        // Remove subscription from server
        await fetch(`/api/push/subscribe?endpoint=${encodeURIComponent(subscription.endpoint)}`, {
          method: 'DELETE',
        });
      }

      setState(prev => ({ 
        ...prev, 
        isSubscribed: false, 
        isLoading: false 
      }));
    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error);
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to unsubscribe',
        isLoading: false 
      }));
    }
  };

  // Update notification preferences
  const updatePreferences = async (newPreferences: Partial<NotificationPreferences>) => {
    try {
      const response = await fetch('/api/push/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newPreferences),
      });

      if (response.ok) {
        const updatedPrefs = await response.json();
        setPreferences(updatedPrefs);
      } else {
        throw new Error('Failed to update preferences');
      }
    } catch (error) {
      console.error('Error updating preferences:', error);
      throw error;
    }
  };

  // Send test notification
  const sendTestNotification = async () => {
    try {
      const response = await fetch('/api/push/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: 'Test Notification',
          body: 'This is a test notification from Money Flow!',
          type: 'test',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send test notification');
      }

      const result = await response.json();
      console.log('Test notification result:', result);
    } catch (error) {
      console.error('Error sending test notification:', error);
      throw error;
    }
  };

  return {
    ...state,
    preferences,
    subscribe,
    unsubscribe,
    updatePreferences,
    sendTestNotification,
    checkSubscriptionStatus,
  };
} 