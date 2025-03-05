import { DashboardLayout } from './DashboardLayout';
import { useStaffCheck } from '../../hooks/useStaffCheck';
import { usePageLoading } from '../../hooks/usePageLoading';
import { LoadingScreen } from '../../components/ui/LoadingScreen';
import { DashboardRoutes } from './routes/DashboardRoutes';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../hooks';
import { useEffect, useRef, useCallback } from 'react';
import { orderService } from '../../services';

export default function Dashboard() {
  const { logout } = useAuth();
  const { isStaff, staffData, isLoading: staffLoading } = useStaffCheck();
  const { isLoading, settings } = useSettings();
  const { isLoading: pageLoading } = usePageLoading();

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const subscriptionRef = useRef<(() => void) | null>(null);
  const lastPlayedRef = useRef<number>(0);
  const isPlayingRef = useRef<boolean>(false);

  const playNotificationSound = useCallback(() => {
    if (!audioRef.current) {
      return;
    }

    const now = Date.now();
    if (now - lastPlayedRef.current < 1000) {
      return;
    }

    if (isPlayingRef.current) {
      return;
    }

    try {
      isPlayingRef.current = true;
      audioRef.current.currentTime = 0;

      const playPromise = audioRef.current.play();

      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            lastPlayedRef.current = now;

            // Reset playing state after the sound finishes
            audioRef.current?.addEventListener(
              'ended',
              () => {
                isPlayingRef.current = false;
              },
              { once: true }
            );
          })
          .catch(error => {
            console.warn('[Audio] Playback prevented:', error);
            isPlayingRef.current = false;
          });
      }
    } catch (error) {
      console.error('[Audio] Playback error:', error);
      isPlayingRef.current = false;
    }
  }, []);

  useEffect(() => {
    audioRef.current = new Audio('/notification.mp3');
    audioRef.current.volume = 0.7;

    subscriptionRef.current = orderService.subscribeToRecentOrders(
      () => {
        playNotificationSound();
      },
      error => {
        console.error('[Order] Subscription error:', error);
      }
    );

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current();
      }
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [playNotificationSound]);

  if (pageLoading || staffLoading || isLoading) {
    return <LoadingScreen isLoading={true} />;
  }

  return (
    <DashboardLayout
      onLogout={logout}
      settings={settings}
      isStaff={isStaff}
      staffData={staffData}
    >
      <DashboardRoutes
        isStaff={isStaff}
        staffData={staffData}
        settings={settings}
      />
    </DashboardLayout>
  );
}
