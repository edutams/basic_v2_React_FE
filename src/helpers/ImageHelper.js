/**
 * ImageHelper - Utility functions for handling image URLs
 * Similar to the backend ImageHelper.php
 */

/**
 * Get the API base URL from environment variables
 * @returns {string} The API base URL
 */
const getApiBaseUrl = () => {
  const appMode = import.meta.env.MODE;
  const apiBaseUrl =
    appMode === 'production'
      ? import.meta.env.VITE_API_BASE_URL_PROD
      : import.meta.env.VITE_API_BASE_URL_LOCAL;
  return apiBaseUrl.replace(/\/$/, '');
};

/**
 * Convert a relative image path to a full URL
 * @param {string|null} relativePath - The relative path (e.g., '/school-logos/filename.png')
 * @returns {string|null} - The full URL or null if path is invalid
 */
export const getFullImageUrl = (relativePath) => {
  if (!relativePath) return null;
  // If already a full URL, return as-is
  if (relativePath.startsWith('http://') || relativePath.startsWith('https://')) {
    return relativePath;
  }
  // Prepend API base URL to relative path
  return `${getApiBaseUrl()}${relativePath}`;
};

/**
 * Get the storage URL prefix for images
 * @returns {string} The storage URL prefix
 */
export const getStorageUrl = () => {
  return `${getApiBaseUrl()}/storage`;
};

/**
 * Check if a URL string is a valid image URL
 * @param {string|null} url - The URL to check
 * @returns {boolean} - True if valid image URL
 */
export const isValidImageUrl = (url) => {
  if (!url) return false;
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return true;
  }
  // Check for common image extensions
  const imageExtensions = /\.(jpg|jpeg|png|gif|svg|webp|bmp)$/i;
  return imageExtensions.test(url);
};

export default {
  getFullImageUrl,
  getStorageUrl,
  isValidImageUrl,
};
