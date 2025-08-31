// Timezone utility functions

// Get user's timezone - either from settings or auto-detect
export const getUserTimezone = (): string => {
  // Try to get from localStorage first (user preference)
  const savedTimezone = localStorage.getItem('userTimezone');
  if (savedTimezone) {
    return savedTimezone;
  }
  
  // Auto-detect timezone
  const detectedTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  
  // Save the detected timezone for future use
  localStorage.setItem('userTimezone', detectedTimezone);
  
  return detectedTimezone;
};

// Set user's timezone preference
export const setUserTimezone = (timezone: string): void => {
  localStorage.setItem('userTimezone', timezone);
};

// Convert UTC date to user's local timezone
export const utcToLocal = (utcDate: string | Date): Date => {
  const date = typeof utcDate === 'string' ? new Date(utcDate) : utcDate;
  const userTimezone = getUserTimezone();
  
  // Create a new date in the user's timezone
  return new Date(date.toLocaleString('en-US', { timeZone: userTimezone }));
};

// Convert local date to UTC
export const localToUtc = (localDate: Date): Date => {
  const userTimezone = getUserTimezone();
  
  // Get the timezone offset in minutes
  const offset = new Date().toLocaleString('en-US', { timeZone: userTimezone });
  const utcDate = new Date(localDate.getTime() - (localDate.getTimezoneOffset() * 60000));
  
  return utcDate;
};

// Format date for display in user's timezone
export const formatDateForDisplay = (utcDate: string | Date, options?: Intl.DateTimeFormatOptions): string => {
  const date = typeof utcDate === 'string' ? new Date(utcDate) : utcDate;
  const userTimezone = getUserTimezone();
  
  return date.toLocaleDateString('en-US', {
    timeZone: userTimezone,
    ...options
  });
};

// Format time for display in user's timezone
export const formatTimeForDisplay = (utcDate: string | Date, options?: Intl.DateTimeFormatOptions): string => {
  const date = typeof utcDate === 'string' ? new Date(utcDate) : utcDate;
  const userTimezone = getUserTimezone();
  
  return date.toLocaleTimeString('en-US', {
    timeZone: userTimezone,
    ...options
  });
};

// Get start and end of day in UTC for a given local date in user's timezone
export const getDayBoundsInUtc = (localDate: Date): { start: Date; end: Date } => {
  const userTimezone = getUserTimezone();
  
  // Create a date string for the start of the day in the user's timezone
  const year = localDate.getFullYear();
  const month = String(localDate.getMonth() + 1).padStart(2, '0');
  const day = String(localDate.getDate()).padStart(2, '0');
  const dateString = `${year}-${month}-${day}`;
  
  // Create start of day (00:00:00) in user's timezone
  const startOfDayLocal = new Date(`${dateString}T00:00:00`);
  
  // Create end of day (23:59:59.999) in user's timezone
  const endOfDayLocal = new Date(`${dateString}T23:59:59.999`);
  
  // Simple approach: create dates in the user's timezone and convert to UTC
  // For EDT (UTC-4), if user selects "today", we want entries from 4am UTC to 4am UTC next day
  const startUtc = new Date(startOfDayLocal.toLocaleString('en-US', { timeZone: userTimezone }));
  const endUtc = new Date(endOfDayLocal.toLocaleString('en-US', { timeZone: userTimezone }));
  
  // Debug logging
  console.log('getDayBoundsInUtc debug:', {
    localDate: localDate.toISOString(),
    userTimezone,
    dateString,
    startOfDayLocal: startOfDayLocal.toISOString(),
    endOfDayLocal: endOfDayLocal.toISOString(),
    startUtc: startUtc.toISOString(),
    endUtc: endUtc.toISOString()
  });
  
  return { start: startUtc, end: endUtc };
};

// Get available timezones for user selection
export const getAvailableTimezones = (): string[] => {
  return Intl.supportedValuesOf('timeZone');
};
