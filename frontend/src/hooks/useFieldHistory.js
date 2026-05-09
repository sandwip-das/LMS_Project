import { useState, useEffect } from 'react';

/**
 * useFieldHistory Hook
 * Manages a history of previously submitted values for specific input fields.
 * @param {string} fieldKey - Unique identifier for the field (e.g., 'city', 'district')
 */
export const useFieldHistory = (fieldKey) => {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem(`field_history_${fieldKey}`);
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load field history", e);
      }
    }
  }, [fieldKey]);

  const addValue = (value) => {
    if (!value || typeof value !== 'string') return;
    const trimmed = value.trim();
    if (!trimmed) return;

    // Move new value to top, keep unique, limit to 10 items
    const newHistory = [trimmed, ...history.filter(v => v !== trimmed)].slice(0, 10);
    setHistory(newHistory);
    localStorage.setItem(`field_history_${fieldKey}`, JSON.stringify(newHistory));
  };

  return { history, addValue };
};
