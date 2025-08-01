import { useEffect, useRef } from 'react';

export function useRealTimeUpdates(fetchFunction, interval = 5000, dependencies = [], enabled = true) {
  const intervalRef = useRef(null);
  const isInitialized = useRef(false);
  const fetchFunctionRef = useRef(fetchFunction);

  // Update the ref when fetchFunction changes
  useEffect(() => {
    fetchFunctionRef.current = fetchFunction;
  }, [fetchFunction]);

  useEffect(() => {
    // Initial fetch
    if (enabled && !isInitialized.current) {
      fetchFunctionRef.current();
      isInitialized.current = true;
    }

    // Set up polling
    if (enabled) {
      intervalRef.current = setInterval(() => {
        fetchFunctionRef.current();
      }, interval);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      };
    }
  }, [interval, enabled, ...dependencies]); // eslint-disable-line react-hooks/exhaustive-deps

  // Manual refresh function
  const refresh = () => {
    fetchFunctionRef.current();
  };

  return { refresh };
}

export function useImmediateUpdates(fetchFunction, dependencies = []) {
  const fetchFunctionRef = useRef(fetchFunction);

  useEffect(() => {
    fetchFunctionRef.current = fetchFunction;
  }, [fetchFunction]);

  useEffect(() => {
    fetchFunctionRef.current();
  }, dependencies); // eslint-disable-line react-hooks/exhaustive-deps

  const refresh = () => {
    fetchFunctionRef.current();
  };

  return { refresh };
} 