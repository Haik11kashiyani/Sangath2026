import { useState, useEffect } from 'react';

const CACHE_NAME = 'sangath-media-cache-v1';

/**
 * Get cached blob URL for a media file or cache it for future visits
 * @param {string} url 
 * @returns {Promise<string>}
 */
export async function getCachedMediaUrl(url) {
  if (!url || typeof url !== 'string') return url;

  // Don't attempt to cache data URIs or blob URLs
  if (url.startsWith('data:') || url.startsWith('blob:')) return url;

  if (!('caches' in window)) {
    return url;
  }

  try {
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(url);

    if (cachedResponse) {
      const blob = await cachedResponse.blob();
      return URL.createObjectURL(blob);
    }

    // Background fetch & cache if not already in cache
    fetch(url, { mode: 'cors' })
      .then(response => {
        if (response.ok && response.status === 200) {
          cache.put(url, response.clone()).catch(e => console.warn('Cache put failed:', e));
        }
      })
      .catch(() => {
        // Fetch failed or CORS prevented caching - fallback to direct URL
      });

    return url;
  } catch (err) {
    console.warn('VideoCache error:', err);
    return url;
  }
}

/**
 * React hook to effortlessly use cached video/media with instant resolution
 * @param {string} videoUrl 
 * @returns {string} resolved video URL (cached blob URL or direct URL)
 */
export function useCachedVideo(videoUrl) {
  const [resolvedUrl, setResolvedUrl] = useState(videoUrl);

  useEffect(() => {
    let isMounted = true;
    let objectUrlToRevoke = null;

    if (!videoUrl) {
      setResolvedUrl('');
      return;
    }

    getCachedMediaUrl(videoUrl).then(cached => {
      if (isMounted) {
        if (cached && cached.startsWith('blob:')) {
          objectUrlToRevoke = cached;
        }
        setResolvedUrl(cached || videoUrl);
      }
    });

    return () => {
      isMounted = false;
      if (objectUrlToRevoke) {
        URL.revokeObjectURL(objectUrlToRevoke);
      }
    };
  }, [videoUrl]);

  return resolvedUrl;
}
