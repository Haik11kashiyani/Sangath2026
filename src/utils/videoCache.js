// Purge legacy media cache if present
if (typeof window !== 'undefined' && 'caches' in window) {
  try {
    caches.delete('sangath-media-cache-v1').catch(() => {});
  } catch {
    // Ignore cache delete error
  }
}

/**
 * Direct URL pass-through without caching
 */
export async function getCachedMediaUrl(url) {
  return url;
}

/**
 * Direct URL pass-through hook
 */
export function useCachedVideo(videoUrl) {
  return videoUrl || '';
}

