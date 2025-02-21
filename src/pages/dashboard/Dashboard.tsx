import { DashboardLayout } from './DashboardLayout';
import { useStaffCheck } from '../../hooks/useStaffCheck';
import { usePageLoading } from '../../hooks/usePageLoading';
import { LoadingScreen } from '../../components/ui/LoadingScreen';
import { DashboardRoutes } from './routes/DashboardRoutes';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../hooks';
import { useEffect, useRef } from 'react';
import { orderService } from '../../services';

export default function Dashboard() {
  const { logout } = useAuth();
  const { isStaff, staffData, isLoading: staffLoading } = useStaffCheck();
  const { isLoading, settings } = useSettings();
  const { isLoading: pageLoading } = usePageLoading();

  // Add a ref to track initial load
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize audio element once
  useEffect(() => {
    audioRef.current = new Audio('/notification.mp3');
    audioRef.current.volume = 0.7;
  }, []);

  useEffect(() => {
    const unsubscribe = orderService.subscribeToRecentOrders(
      () => {
        playNotificationSound();
      },
      error => {
        console.log('subscribeToRecentOrders', error);
      }
    );

    return () => unsubscribe();
  }, []);

  const playNotificationSound = () => {
    if (!audioRef.current) {
      console.log('Audio ref not initialized');
      return;
    }

    try {
      console.log('Attempting to play notification sound');
      audioRef.current.currentTime = 0;
      const playPromise = audioRef.current.play();

      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log('Notification sound played successfully');
          })
          .catch(error => {
            console.warn('Audio playback was prevented:', error);
          });
      }
    } catch (error) {
      console.error('Error playing notification sound:', error);
    }
  };

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
