#!/usr/bin/env node

import webpush from 'web-push';

console.log('🔑 Generating VAPID keys for push notifications...\n');

const vapidKeys = webpush.generateVAPIDKeys();

console.log('✅ VAPID keys generated successfully!\n');
console.log('📋 Add these to your .env.local file:\n');
console.log(`NEXT_PUBLIC_VAPID_PUBLIC_KEY=${vapidKeys.publicKey}`);
console.log(`VAPID_PRIVATE_KEY=${vapidKeys.privateKey}`);
console.log('\n🔒 Keep your private key secure and never expose it in client-side code!');
console.log('\n📧 Don\'t forget to update the email in src/app/api/push/send/route.ts');
console.log('   Replace "your-email@example.com" with your actual email address.'); 