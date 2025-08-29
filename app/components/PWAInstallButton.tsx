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
  const { theme } = useTheme();

  useEffect(() => {
    // Only run in browser environment
    if (typeof window === 'undefined') {
      return;
    }

    // Check if app is already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    if (isStandalone) {
      return;
    }

    // Check if user has dismissed the install prompt before
    const hasDismissed = localStorage.getItem('pwa-install-dismissed');
    if (hasDismissed) {
      return;
    }

    function beforeInstallPromptHandler(e: Event) {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsVisible(true);
      
      // Show banner after a delay to not be intrusive
      setTimeout(() => {
        setShowBanner(true);
      }, 3000);
    }

    window.addEventListener("beforeinstallprompt", beforeInstallPromptHandler);

    return () => {
      window.removeEventListener("beforeinstallprompt", beforeInstallPromptHandler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      return;
    }

    setIsInstalling(true);
    try {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      
      if (choiceResult.outcome === "accepted") {
        console.log("User accepted the install prompt");
        // Hide the button after successful installation
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
  };

  const handleDismiss = () => {
    setShowBanner(false);
    setIsVisible(false);
    // Remember that user dismissed the prompt
    if (typeof window !== 'undefined') {
      localStorage.setItem('pwa-install-dismissed', 'true');
    }
  };

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
              Get quick access to your study materials and quizzes. Works offline too!
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
                  'Install App'
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
