import { useEffect, useRef, useCallback } from 'react';
import { authService } from '../services/authService';
import { getSocket } from '../services/socketService';

let watcherId = null;

export default function useLocationTracker(enabled) {
  const startedRef = useRef(false);

  const requestNotificationPermission = useCallback(async () => {
    if (!('Notification' in window)) return;
    if (Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  }, []);

  const startTracking = useCallback(() => {
    if (!navigator.geolocation) return;
    if (startedRef.current) return;
    startedRef.current = true;

    requestNotificationPermission();

    watcherId = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        authService.saveLocation(latitude, longitude).catch(() => {});
      },
      () => {},
      { enableHighAccuracy: false, maximumAge: 300000, timeout: 30000 }
    );
  }, [requestNotificationPermission]);

  const stopTracking = useCallback(() => {
    if (watcherId !== null) {
      navigator.geolocation.clearWatch(watcherId);
      watcherId = null;
    }
    startedRef.current = false;
  }, []);

  useEffect(() => {
    if (enabled) {
      startTracking();
    } else {
      stopTracking();
    }
    return () => stopTracking();
  }, [enabled, startTracking, stopTracking]);

  // Socket listener per notifiche in tempo reale
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handler = (notif) => {
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(notif.title, {
          body: notif.message,
          icon: '/Movo.png',
          tag: 'ride-imminent',
        });
      }
      // Emetti un evento custom per aggiornare la pagina notifiche
      window.dispatchEvent(new CustomEvent('new-notification', { detail: notif }));
    };

    socket.on('notification', handler);
    return () => socket.off('notification', handler);
  }, []);
}
