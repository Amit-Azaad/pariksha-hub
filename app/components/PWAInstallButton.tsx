import React, { useEffect, useState } from "react";
import { useTheme } from "../hooks/useTheme";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function PWAInstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    // Only run in browser environment
    if (typeof window === 'undefined') {
      return;
    }

    console.log('PWA Install Button: useEffect running');

    // Check if it's a mobile device
    const checkMobile = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
      console.log('PWA Install Button: Mobile device detected:', isMobileDevice, 'User Agent:', userAgent);
      setIsMobile(isMobileDevice);
      return isMobileDevice;
    };

    const mobile = checkMobile();

    // Check if app is already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    if (isStandalone) {
      console.log('PWA Install Button: App is already installed in standalone mode');
      return;
    }

    // Check if user has dismissed the install prompt before
    const hasDismissed = localStorage.getItem('pwa-install-dismissed');
    if (hasDismissed) {
      console.log('PWA Install Button: User previously dismissed install prompt');
      return;
    }

    function beforeInstallPromptHandler(e: Event) {
      console.log('beforeinstallprompt event fired');
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsVisible(true);
      
      // Show banner immediately for mobile devices, with shorter delay for desktop
      const delay = mobile ? 1000 : 3000;
      setTimeout(() => {
        setShowBanner(true);
        console.log('Showing install banner');
      }, delay);
    }

    // Also check for appinstalled event
    function appInstalledHandler() {
      console.log('App was installed');
      setIsVisible(false);
      setShowBanner(false);
    }

    // Listen for the beforeinstallprompt event
    window.addEventListener("beforeinstallprompt", beforeInstallPromptHandler);
    window.addEventListener("appinstalled", appInstalledHandler);

    // For mobile devices, also check if we can show a manual install prompt
    if (mobile) {
      // Check if the app meets PWA criteria
      const checkPWACriteria = () => {
        // Basic PWA criteria check
        const hasManifest = !!document.querySelector('link[rel="manifest"]');
        const hasServiceWorker = 'serviceWorker' in navigator;
        const isHTTPS = window.location.protocol === 'https:' || window.location.hostname === 'localhost';
        
        console.log('PWA Criteria:', { hasManifest, hasServiceWorker, isHTTPS });
        
        if (hasManifest && hasServiceWorker && isHTTPS) {
          // If we meet PWA criteria but no beforeinstallprompt event, show manual install option
          setTimeout(() => {
            if (!isVisible) {
              console.log('Showing manual install option for mobile');
              setIsVisible(true);
              setShowBanner(true);
            }
          }, 2000);
        }
      };

      // Check after a short delay
      setTimeout(checkPWACriteria, 1000);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", beforeInstallPromptHandler);
      window.removeEventListener("appinstalled", appInstalledHandler);
    };
  }, [isVisible]);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      // Use the native install prompt if available
      setIsInstalling(true);
      try {
        deferredPrompt.prompt();
        const choiceResult = await deferredPrompt.userChoice;
        
        if (choiceResult.outcome === "accepted") {
          console.log("User accepted the install prompt");
          setIsVisible(false);
          setShowBanner(false);
        } else {
          console.log("User dismissed the install prompt");
        }
        
        setDeferredPrompt(null);
      } catch (error) {
        console.error("Error during installation:", error);
      } finally {
        setIsInstalling(false);
      }
    } else {
      // Fallback for manual installation
      if (isMobile) {
        // Show instructions for manual installation
        alert('To install this app:\n\nAndroid: Tap the menu (⋮) → "Add to Home screen"\niOS: Tap the share button → "Add to Home Screen"');
      }
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    setIsVisible(false);
    // Remember that user dismissed the prompt
    if (typeof window !== 'undefined') {
      localStorage.setItem('pwa-install-dismissed', 'true');
    }
  };

  // Don't show if not visible or if banner is hidden
  if (!isVisible || !showBanner) {
    return null;
  }

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 animate-fade-in">
      <div className={`
        bg-[var(--color-card)] 
        border border-[var(--color-border)] 
        rounded-xl shadow-lg 
        p-4 
        backdrop-blur-sm
        ${theme === 'dark' ? 'bg-opacity-90' : 'bg-opacity-95'}
      `}>
        <div className="flex items-start space-x-3">
          {/* App Icon */}
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-[var(--color-accent-primary)] rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-[var(--color-text-primary)] mb-1">
              Install Exam Prep Platform
            </h3>
            <p className="text-xs text-[var(--color-text-secondary)] mb-3">
              {isMobile 
                ? "Get quick access from your home screen. Works offline too!"
                : "Get quick access to your study materials and quizzes. Works offline too!"
              }
            </p>

            {/* Action Buttons */}
            <div className="flex space-x-2">
              <button
                onClick={handleInstallClick}
                disabled={isInstalling}
                className={`
                  flex-1 px-4 py-2 text-xs font-medium rounded-lg transition-all duration-200
                  ${isInstalling 
                    ? 'bg-[var(--color-interactive-disabled)] text-[var(--color-text-muted)] cursor-not-allowed' 
                    : 'bg-[var(--color-accent-primary)] hover:bg-[var(--color-accent-secondary)] text-white shadow-sm hover:shadow-md'
                  }
                `}
              >
                {isInstalling ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Installing...
                  </span>
                ) : (
                  deferredPrompt ? 'Install App' : 'Install Instructions'
                )}
              </button>

              <button
                onClick={handleDismiss}
                className="px-3 py-2 text-xs font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors duration-200"
              >
                Maybe Later
              </button>
            </div>
          </div>

          {/* Close Button */}
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 p-1 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] transition-colors duration-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
