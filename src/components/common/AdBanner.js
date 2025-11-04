import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
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
  const bannerRef = useRef(null);

  // Auto-slide functionality
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef(null);

    // Fetch banners from API (cache disabled for instant updates)
  const fetchBanners = async (skipCache = false) => {
    try {
      setLoading(true);
      setError(null);

      // Skip cache for immediate updates when skipCache is true
      const cacheKey = 'hero_banners_cache';
      const cachedData = localStorage.getItem(cacheKey);
      const cacheTime = localStorage.getItem(cacheKey + '_time');
      const now = Date.now();

      // Use cache only if skipCache is false and cache is less than 10 seconds old (very short cache)
      if (!skipCache && cachedData && cacheTime && (now - parseInt(cacheTime)) < 10 * 1000) {                                                                             
        const cachedBanners = JSON.parse(cachedData);
        // Only use cache if it has banners
        if (Array.isArray(cachedBanners) && cachedBanners.length > 0) {
          console.log('Using cached banners:', cachedBanners.length);
          setBanners(cachedBanners);
          setLoading(false);
          return;
        }
      }

      // Fetch banners from the API
      console.log('Fetching banners from API...');
      const response = await bannerAPI.getAllBanners();
      console.log('Banner API response:', response.data);

      if (response.data.success && response.data.data && Array.isArray(response.data.data)) {                                                                   
        // Filter banners to only include those with images and are active
        const fetchedBanners = response.data.data.filter(banner => {
          const hasImage = !!(banner.imageUrl || banner.image);
          const isActive = banner.isActive !== false; // Default to true if not specified
          return hasImage && isActive;
        });

        console.log('Fetched banners after filtering:', fetchedBanners.length);
        
        if (fetchedBanners.length > 0) {
          setBanners(fetchedBanners);

          // Cache the banners
          localStorage.setItem(cacheKey, JSON.stringify(fetchedBanners));
          localStorage.setItem(cacheKey + '_time', now.toString());

          // Preload images for faster display
          fetchedBanners.forEach((banner, index) => {
            const imageUrl = banner.imageUrl || banner.image;
            if (imageUrl) {
              const img = new Image();
              img.src = imageUrl;
              img.onload = () => {
                console.log(`Banner ${index + 1} preloaded successfully`);        
              };
              img.onerror = () => {
                console.error(`Banner ${index + 1} image failed to load:`, imageUrl);
              };
            }
          });
        } else {
          console.warn('No valid banners found after filtering');
          // Clear cache if no banners found
          localStorage.removeItem(cacheKey);
          localStorage.removeItem(cacheKey + '_time');
          setBanners([]);
        }
      } else {
        console.warn('Invalid API response structure:', response.data);
        // Clear cache on invalid response
        localStorage.removeItem(cacheKey);
        localStorage.removeItem(cacheKey + '_time');
        setBanners([]);
      }
    } catch (error) {
      console.error('Error fetching banners:', error);
      setError('Failed to load banners');
      // Clear cache on error
      const cacheKey = 'hero_banners_cache';
      localStorage.removeItem(cacheKey);
      localStorage.removeItem(cacheKey + '_time');
      setBanners([]);
    } finally {
      setLoading(false);
    }
  };

    useEffect(() => {
    // Always fetch fresh data on mount (skip cache)
    fetchBanners(true);

    // Refresh banners every 10 seconds to get updates from admin immediately        
    const refreshInterval = setInterval(() => {
      fetchBanners(true); // Skip cache for refresh
    }, 10000); // 10 seconds

    return () => clearInterval(refreshInterval);
  }, []);

  // Refresh banners when page becomes visible (user switches back to tab) with cache skip      
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchBanners(true); // Skip cache when page becomes visible
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);      
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);                                                                      
  }, []);

  // Also refresh on window focus (when user clicks back to tab)
  useEffect(() => {
    const handleFocus = () => {
      fetchBanners(true); // Skip cache on focus
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

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

  // Auto-rotate banner every 5 seconds (only if we have banners and not paused)
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

    // Restart auto-slide after a short delay
    setTimeout(() => {
      startAutoSlide();
    }, 1000);
  }, [startAutoSlide]);

  const handleDotClick = (index) => {
    setCurrentIndex(index);
    resetAutoSlide(); // Reset auto-slide timer when user manually navigates
  };

  // Touch/swipe handlers
  const minSwipeDistance = 50; // Minimum distance for a swipe
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
      // Swipe left - go to next banner
      setCurrentIndex((prev) => (prev + 1) % banners.length);
      resetAutoSlide(); // Reset auto-slide timer
    }
    if (isRightSwipe && banners.length > 1) {
      // Swipe right - go to previous banner
      setCurrentIndex((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
      resetAutoSlide(); // Reset auto-slide timer
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
      // Swipe left - go to next banner
      setCurrentIndex((prev) => (prev + 1) % banners.length);
      resetAutoSlide(); // Reset auto-slide timer
    }
    if (isRightSwipe && banners.length > 1) {
      // Swipe right - go to previous banner
      setCurrentIndex((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
      resetAutoSlide(); // Reset auto-slide timer
    }

    setIsDragging(false);
  };

  // If no banners and not loading, don't render anything
  // But log for debugging
  if (!loading && banners.length === 0) {
    if (process.env.NODE_ENV === 'development') {
      console.log('AdBanner: No banners to display. Check if banner is active and has an image.');
    }
    return null;
  }

  return (
    <div className="relative w-full -mb-4 sm:-mb-2 md:mb-0 lg:mb-0 mt-3 sm:mt-4 md:mt-5 lg:mt-6 px-4 sm:px-6 lg:px-8">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl blur-3xl opacity-20 animate-pulse" />
      <div className="relative rounded-3xl overflow-hidden max-w-7xl mx-auto">
        {loading ? (
          <div className="w-full h-32 sm:h-40 md:h-48 lg:h-80 xl:h-[450px] bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 rounded-3xl animate-pulse">
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center">
                <div className="w-12 h-12 bg-gray-300 rounded-full mx-auto mb-3 animate-bounce"></div>
                <p className="text-sm text-gray-500 font-medium">Loading banners...</p>
              </div>
            </div>
          </div>
        ) : (
          <div
            ref={bannerRef}
            className={`relative w-full h-32 sm:h-40 md:h-48 lg:h-80 xl:h-[450px] bg-gray-100 select-none rounded-3xl ${
              isDragging ? 'cursor-grabbing' : 'cursor-grab'
            }`}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseEnter={() => setIsPaused(true)} // Pause auto-slide on hover
            onMouseLeave={(e) => {
              handleMouseUp(); // Handle mouse up
              setIsPaused(false); // Resume auto-slide when mouse leaves
            }}
            style={{ userSelect: 'none' }}
          >
            {banners.map((banner, index) => {
              const imageUrl = banner.imageUrl || banner.image;
              const bannerLink = banner.buttonLink || '/products';
              const bannerTitle = banner.title || `Banner ${index + 1}`;

              return (
                <div
                  key={banner._id || index}
                  className={`absolute inset-0 transition-opacity duration-1000 ${
                    index === currentIndex ? 'opacity-100' : 'opacity-0'
                  }`}
                >
                  {bannerLink ? (
                    <Link to={bannerLink} className="block w-full h-full">
                      <div 
                        className="w-full h-full rounded-3xl shadow-2xl bg-cover bg-center bg-no-repeat"
                        style={{ backgroundImage: `url(${imageUrl})` }}
                        role="img"
                        aria-label={bannerTitle}
                      />
                    </Link>
                  ) : (
                    <div 
                      className="w-full h-full rounded-3xl shadow-2xl bg-cover bg-center bg-no-repeat"
                      style={{ backgroundImage: `url(${imageUrl})` }}
                      role="img"
                      aria-label={bannerTitle}
                    />
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Banner Indicators */}
        {!loading && banners.length > 1 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => handleDotClick(index)}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex ? 'bg-white' : 'bg-white/50'
                } hover:bg-white/75`}
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
