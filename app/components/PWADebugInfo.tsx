import React, { useEffect, useState } from "react";

export default function PWADebugInfo() {
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const checkPWADebugInfo = () => {
      const info: any = {};

      // Check PWA criteria
      info.hasManifest = !!document.querySelector('link[rel="manifest"]');
      info.manifestHref = document.querySelector('link[rel="manifest"]')?.getAttribute('href');
      info.hasServiceWorker = 'serviceWorker' in navigator;
      info.isHTTPS = window.location.protocol === 'https:' || window.location.hostname === 'localhost';
      info.isStandalone = window.matchMedia('(display-mode: standalone)').matches;
      info.userAgent = navigator.userAgent;
      info.isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(navigator.userAgent.toLowerCase());
      
      // Check if beforeinstallprompt event has fired
      info.beforeInstallPromptFired = false;
      info.deferredPrompt = null;

      // Check service worker registration
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(registrations => {
          info.serviceWorkerRegistrations = registrations.length;
          info.serviceWorkerRegistered = registrations.length > 0;
        });
      }

      // Check if app meets PWA criteria
      info.meetsPWACriteria = info.hasManifest && info.hasServiceWorker && info.isHTTPS;

      setDebugInfo(info);
    };

    // Check immediately
    checkPWADebugInfo();

    // Check again after a delay
    setTimeout(checkPWADebugInfo, 2000);

    // Listen for beforeinstallprompt event
    const beforeInstallPromptHandler = (e: Event) => {
      info.beforeInstallPromptFired = true;
      info.deferredPrompt = e;
      setDebugInfo({ ...info });
    };

    window.addEventListener('beforeinstallprompt', beforeInstallPromptHandler);

    return () => {
      window.removeEventListener('beforeinstallprompt', beforeInstallPromptHandler);
    };
  }, []);

  const toggleVisibility = () => {
    setIsVisible(!isVisible);
  };

  if (!isVisible) {
    return (
      <button
        onClick={toggleVisibility}
        className="fixed top-14 right-4 z-50 bg-red-500 text-white px-3 py-2 rounded-lg text-xs"
      >
        PWA Debug
      </button>
    );
  }

  return (
    <div className="fixed top-4 right-4 z-50 bg-white border border-gray-300 rounded-lg p-4 max-w-sm text-xs shadow-lg">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold">PWA Debug Info</h3>
        <button onClick={toggleVisibility} className="text-gray-500 hover:text-gray-700">×</button>
      </div>
      
      <div className="space-y-1">
        <div><strong>Manifest:</strong> {debugInfo.hasManifest ? '✅' : '❌'} {debugInfo.manifestHref}</div>
        <div><strong>Service Worker:</strong> {debugInfo.hasServiceWorker ? '✅' : '❌'}</div>
        <div><strong>HTTPS:</strong> {debugInfo.isHTTPS ? '✅' : '❌'}</div>
        <div><strong>Standalone:</strong> {debugInfo.isStandalone ? '✅' : '❌'}</div>
        <div><strong>Mobile:</strong> {debugInfo.isMobile ? '✅' : '❌'}</div>
        <div><strong>PWA Criteria:</strong> {debugInfo.meetsPWACriteria ? '✅' : '❌'}</div>
        <div><strong>Before Install Prompt:</strong> {debugInfo.beforeInstallPromptFired ? '✅' : '❌'}</div>
        <div><strong>User Agent:</strong> {debugInfo.userAgent?.substring(0, 50)}...</div>
      </div>

      <div className="mt-3 text-xs text-gray-600">
        <p>Check browser console for more details</p>
      </div>
    </div>
  );
}
