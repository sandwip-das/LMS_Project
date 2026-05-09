/**
 * Standard Date Formatter for the LMS Platform
 * Formats: DD MMM YY (e.g., 29 Apr 26)
 */
export const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A';
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return 'N/A';
    
    const day = String(date.getDate()).padStart(2, '0');
    const month = date.toLocaleString('en-US', { month: 'short' });
    const year = String(date.getFullYear()).slice(-2);
    
    return `${day} ${month} ${year}`;
  } catch (e) {
    return 'N/A';
  }
};
