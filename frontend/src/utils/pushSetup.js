import api from '../components/api';

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export const subscribeToPushNotifications = async () => {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.log('Push notifications are not supported by this browser.');
    return;
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.log('Push notification permission denied.');
      return;
    }

    // Register service worker manually to bypass VitePWA dev limits
    let registration = await navigator.serviceWorker.getRegistration();
    if (!registration) {
        registration = await navigator.serviceWorker.register('/service-worker.js', { scope: '/', type: 'module' });
    }
    
    // Wait for the service worker to be ready
    registration = await navigator.serviceWorker.ready;
    let subscription = await registration.pushManager.getSubscription();
    
    if (!subscription) {
      const response = await api.get('/push/vapid-public-key');
      const vapidPublicKey = response.data.publicKey;
      const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);

      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey
      });
    }

    // Send subscription to backend
    await api.post('/push/subscribe', subscription);
    console.log('Push notification subscription saved.');
    alert('✅ Push Notifications Successfully Enabled! You will now receive MD Announcements instantly.');
  } catch (error) {
    console.warn('Push Notifications are disabled or unsupported.');
  }
};
