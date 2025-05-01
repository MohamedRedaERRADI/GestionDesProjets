/**
 * Format a date string to a readable format
 * @param {string} dateString - The date string to format
 * @returns {string} - The formatted date string
 */
export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Invalid date';
  
  return date.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

/**
 * Get relative time from now (e.g. "2 days ago", "in 3 hours")
 * @param {string} dateString - The date string 
 * @returns {string} - Relative time string
 */
export const getRelativeTime = (dateString) => {
  if (!dateString) return 'N/A';
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Invalid date';
  
  const now = new Date();
  const diffTime = date.getTime() - now.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    if (diffHours === 0) {
      const diffMinutes = Math.floor(diffTime / (1000 * 60));
      if (diffMinutes === 0) {
        return "maintenant";
      } else if (diffMinutes > 0) {
        return `dans ${diffMinutes} minute${diffMinutes > 1 ? 's' : ''}`;
      } else {
        return `il y a ${Math.abs(diffMinutes)} minute${Math.abs(diffMinutes) > 1 ? 's' : ''}`;
      }
    } else if (diffHours > 0) {
      return `dans ${diffHours} heure${diffHours > 1 ? 's' : ''}`;
    } else {
      return `il y a ${Math.abs(diffHours)} heure${Math.abs(diffHours) > 1 ? 's' : ''}`;
    }
  } else if (diffDays > 0) {
    return `dans ${diffDays} jour${diffDays > 1 ? 's' : ''}`;
  } else {
    return `il y a ${Math.abs(diffDays)} jour${Math.abs(diffDays) > 1 ? 's' : ''}`;
  }
}; 