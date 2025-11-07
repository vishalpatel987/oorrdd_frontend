import { useState, useEffect, useRef, useCallback } from 'react';
import bannerAPI from '../../api/bannerAPI';

const AdBanner = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Touch/swipe functionality
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  
  // Auto-slide functionality
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef(null);

  // Fetch banners from API with caching
  const fetchBanners = useCallback(async (skipCache = false) => {
    try {
      setLoading(true);
      setError(null);

      // Check cache first (only if not skipping)
      if (!skipCache) {
        const cacheKey = 'banners_cache';
        const cachedData = localStorage.getItem(cacheKey);
        const cacheTime = localStorage.getItem(cacheKey + '_time');
        const now = Date.now();

        // Use cache if it's less than 5 minutes old and contains banners
        if (cachedData && cacheTime && (now - parseInt(cacheTime)) < 300000) {
          try {
            const cachedBanners = JSON.parse(cachedData);
            if (Array.isArray(cachedBanners) && cachedBanners.length > 0) {
              setBanners(cachedBanners);
              setLoading(false);
              return;
            }
          } catch (e) {
            // Invalid cache, continue to fetch
          }
        }
      }

      // Fetch banners from the API
      const response = await bannerAPI.getAllBanners();
      
      if (response.data && response.data.success && Array.isArray(response.data.data)) {
        const fetchedBanners = response.data.data.filter(
          banner => banner && (banner.imageUrl || banner.image) && banner.isActive !== false
        );
        
        setBanners(fetchedBanners);
        
        // Cache the banners
        if (fetchedBanners.length > 0) {
          const cacheKey = 'banners_cache';
          localStorage.setItem(cacheKey, JSON.stringify(fetchedBanners));
          localStorage.setItem(cacheKey + '_time', Date.now().toString());
          
          // Preload images
          fetchedBanners.forEach((banner) => {
            const imgUrl = banner.imageUrl || banner.image;
            if (imgUrl) {
              const img = new Image();
              img.src = imgUrl;
            }
          });
        }
      } else {
        setBanners([]);
      }
    } catch (err) {
      console.error('Error fetching banners:', err);
      setError('Failed to load banners');
      setBanners([]);
      // Clear invalid cache
      localStorage.removeItem('banners_cache');
      localStorage.removeItem('banners_cache_time');
    } finally {
      setLoading(false);
    }
  }, []);

  // Use ref to prevent duplicate calls from React StrictMode
  const hasFetchedRef = useRef(false);
  
  // Initial fetch and refresh on mount
  useEffect(() => {
    // Prevent duplicate calls from StrictMode double rendering
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;
    
    // Small delay on initial load to avoid rate limiting with other components
    const initialTimeout = setTimeout(() => {
      fetchBanners(true); // Skip cache on mount
    }, 300); // 300ms delay

    // Refresh banners every 5 minutes (300000ms) instead of 10 seconds
    // This prevents too many API calls
    const refreshInterval = setInterval(() => {
      fetchBanners(false); // Use cache if available
    }, 300000); // 5 minutes

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(refreshInterval);
    };
  }, [fetchBanners]);

  // Refresh banners when page becomes visible or window gains focus
  // But only if cache is older than 2 minutes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        const cacheTime = localStorage.getItem('banners_cache_time');
        const now = Date.now();
        // Only refresh if cache is older than 2 minutes
        if (!cacheTime || (now - parseInt(cacheTime)) > 120000) {
          fetchBanners(false); // Use cache if available
        }
      }
    };

    const handleFocus = () => {
      const cacheTime = localStorage.getItem('banners_cache_time');
      const now = Date.now();
      // Only refresh if cache is older than 2 minutes
      if (!cacheTime || (now - parseInt(cacheTime)) > 120000) {
        fetchBanners(false); // Use cache if available
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [fetchBanners]);

  // Auto-slide function
  const startAutoSlide = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    if (banners.length > 1 && !isPaused) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % banners.length);
      }, 5000);
    }
  }, [banners.length, isPaused]);

  // Auto-rotate banner every 5 seconds
  useEffect(() => {
    startAutoSlide();
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [startAutoSlide]);

  // Reset auto-slide timer when user manually navigates
  const resetAutoSlide = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setTimeout(() => {
      startAutoSlide();
    }, 1000);
  }, [startAutoSlide]);

  const handleDotClick = (index) => {
    setCurrentIndex(index);
    resetAutoSlide();
  };

  // Touch/swipe handlers
  const minSwipeDistance = 50;

  const handleTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && banners.length > 1) {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
      resetAutoSlide();
    }
    
    if (isRightSwipe && banners.length > 1) {
      setCurrentIndex((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
      resetAutoSlide();
    }
    
    setIsDragging(false);
  };

  // Mouse drag support for desktop
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setTouchStart(e.clientX);
    setTouchEnd(null);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setTouchEnd(e.clientX);
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    if (!touchStart || !touchEnd) {
      setIsDragging(false);
      return;
    }

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && banners.length > 1) {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
      resetAutoSlide();
    }
    
    if (isRightSwipe && banners.length > 1) {
      setCurrentIndex((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
      resetAutoSlide();
    }
    
    setIsDragging(false);
  };

  // Don't render if no banners
  if (loading) {
    return (
      <div className="w-full h-32 sm:h-40 md:h-48 lg:h-80 xl:h-[450px] bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse rounded-3xl mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-3 sm:mt-4 md:mt-5 lg:mt-6 mb-0">
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 bg-gray-300 rounded-full mx-auto mb-3 animate-bounce"></div>
            <p className="text-sm text-gray-500 font-medium">Loading banners...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !banners || banners.length === 0) {
    return null; // Don't show anything if there's an error or no banners
  }

  const currentBanner = banners[currentIndex];
  const bannerImage = currentBanner.imageUrl || currentBanner.image;

  return (
    <div className="w-full mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-3 sm:mt-4 md:mt-5 lg:mt-6 mb-0">
      <div className="relative rounded-3xl overflow-hidden">
        <div
          className={`relative w-full h-32 sm:h-40 md:h-48 lg:h-80 xl:h-[450px] select-none ${
            isDragging ? 'cursor-grabbing' : 'cursor-grab'
          }`}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => {
            handleMouseUp();
            setIsPaused(false);
          }}
          style={{ userSelect: 'none' }}
        >
          {bannerImage && (
            <div
              className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat transition-opacity duration-1000"
              style={{
                backgroundImage: `url(${bannerImage})`,
                opacity: 1
              }}
            />
          )}
        </div>

        {/* Banner Indicators */}
        {banners.length > 1 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => handleDotClick(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex ? 'bg-white w-6' : 'bg-white/50'
                }`}
                aria-label={`Go to banner ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdBanner;
