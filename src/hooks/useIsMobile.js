/*
 * useIsMobile.js Reactive hook returning true when the viewport width
 * is at or below 1024px. Debounced at 150ms to avoid flooding state
 * updates during resize. Shared across all components that need to
 * switch between desktop and mobile layouts.
 */

import { useState, useEffect } from 'react';

const MOBILE_BREAKPOINT = 1024;

// Returns true when the window width is at or below the mobile breakpoint.
export default function useIsMobile() {
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== 'undefined' && window.innerWidth <= MOBILE_BREAKPOINT
  );

  useEffect(() => {
    let timer;
    const handler = () => {
      clearTimeout(timer);
      timer = setTimeout(() => setIsMobile(window.innerWidth <= MOBILE_BREAKPOINT), 150);
    };
    window.addEventListener('resize', handler);
    return () => { window.removeEventListener('resize', handler); clearTimeout(timer); };
  }, []);

  return isMobile;
}
