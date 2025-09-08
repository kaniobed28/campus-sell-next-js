// utils/timestampUtils.js
/**
 * Safely convert various timestamp formats to JavaScript Date objects
 * Handles Firestore Timestamps, Date objects, strings, numbers, and other formats
 * 
 * @param {*} timestamp - The timestamp to convert
 * @returns {Date|null} - The converted Date object or null if conversion fails
 */
export const convertTimestamp = (timestamp) => {
  try {
    // Handle null/undefined values
    if (!timestamp) return null;
    
    // If it's already a Date object
    if (timestamp instanceof Date) return timestamp;
    
    // If it's a Firestore Timestamp with toDate method
    if (timestamp.toDate && typeof timestamp.toDate === 'function') {
      return timestamp.toDate();
    }
    
    // If it's a timestamp object with seconds/nanoseconds
    if (timestamp.seconds !== undefined) {
      return new Date(timestamp.seconds * 1000 + (timestamp.nanoseconds || 0) / 1000000);
    }
    
    // If it's a string date
    if (typeof timestamp === 'string') {
      const date = new Date(timestamp);
      return isNaN(date.getTime()) ? null : date;
    }
    
    // If it's a number (milliseconds since epoch)
    if (typeof timestamp === 'number') {
      return new Date(timestamp);
    }
    
    // If it's an ISO string nested in a weird object
    if (typeof timestamp === 'object' && timestamp._seconds !== undefined) {
      return new Date(timestamp._seconds * 1000 + (timestamp._nanoseconds || 0) / 1000000);
    }
    
    // If we can't determine the format, return null
    return null;
  } catch (error) {
    console.warn('Error converting timestamp:', timestamp, error);
    return null;
  }
};

export default { convertTimestamp };