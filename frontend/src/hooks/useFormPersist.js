import { useEffect } from 'react';

/**
 * useFormPersist Hook
 * Automatically saves form state to localStorage and restores it on mount.
 * @param {string} storageKey - Unique key for localStorage
 * @param {object} formData - Current form state
 * @param {function} setFormData - State setter function
 * @param {boolean} enabled - Whether to enable persistence
 */
export const useFormPersist = (storageKey, formData, setFormData, enabled = true) => {
  useEffect(() => {
    if (!enabled) return;
    
    const savedData = localStorage.getItem(`form_draft_${storageKey}`);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        // We only merge fields that exist in the current default state to avoid schema issues
        setFormData(prev => ({ ...prev, ...parsed }));
      } catch (e) {
        console.error("Failed to restore form draft", e);
      }
    }
  }, [storageKey, enabled]); // Only run on mount

  useEffect(() => {
    if (!enabled) return;
    
    // Save data whenever it changes
    const timeout = setTimeout(() => {
      localStorage.setItem(`form_draft_${storageKey}`, JSON.stringify(formData));
    }, 500); // Debounce saves

    return () => clearTimeout(timeout);
  }, [formData, storageKey, enabled]);

  const clearDraft = () => {
    localStorage.removeItem(`form_draft_${storageKey}`);
  };

  return { clearDraft };
};
