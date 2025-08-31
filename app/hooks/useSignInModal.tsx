import { useState, useCallback } from 'react';

export function useSignInModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState({
    title: "Sign in to continue",
    message: "Please sign in to access this feature.",
    showGuestOption: true
  });

  const openModal = useCallback((config?: {
    title?: string;
    message?: string;
    showGuestOption?: boolean;
  }) => {
    if (config) {
      setModalConfig({
        title: config.title || "Sign in to continue",
        message: config.message || "Please sign in to access this feature.",
        showGuestOption: config.showGuestOption !== false
      });
    }
    setIsOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
  }, []);

  return {
    isOpen,
    modalConfig,
    openModal,
    closeModal
  };
}
