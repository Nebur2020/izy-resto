import { useState, useEffect } from 'react';
import { useSettings } from './useSettings';

interface UseLayoutMountReturn {
  isLayoutMounted: boolean;
  isLoading: boolean;
}

export function useLayoutMount(): UseLayoutMountReturn {
  const [isLayoutMounted, setIsLayoutMounted] = useState(false);
  const [isLoadingComplete, setIsLoadingComplete] = useState(false);
  const { settings, isLoading: isSettingsLoading } = useSettings();

  useEffect(() => {
    // let timeout: NodeJS.Timeout;
    // let loadingTimeout: NodeJS.Timeout;

    if (!isSettingsLoading && settings) {
      setIsLayoutMounted(true);
      setIsLoadingComplete(true);
      // // First mount the layout
      // timeout = setTimeout(() => {
      //   setIsLayoutMounted(true);
      //   // Then wait 2 seconds before completing loading
      //   loadingTimeout = setTimeout(() => {
      //     setIsLoadingComplete(true);
      //   }, 1500);
      // }, 100);
    }

    // return () => {
    //   if (timeout) clearTimeout(timeout);
    //   if (loadingTimeout) clearTimeout(loadingTimeout);
    // };
  }, [isSettingsLoading, settings]);

  return {
    isLayoutMounted,
    isLoading: isSettingsLoading || !isLoadingComplete,
  };
}
