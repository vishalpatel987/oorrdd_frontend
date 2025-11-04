import React, { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination, A11y } from 'swiper';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import bannerAPI from '../../api/bannerAPI';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const contentVariants = {
  initial: { opacity: 0, y: 20, scale: 0.95 },
  animate: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { 
      duration: 1.2, 
      ease: [0.25, 0.46, 0.45, 0.94],
      delay: 0.3
    } 
  },
  exit: { 
    opacity: 0, 
    y: -20, 
    scale: 0.95,
    transition: { 
      duration: 0.8, 
      ease: [0.25, 0.46, 0.45, 0.94] 
    } 
  },
};

const HeroCarousel = () => {
  const [banners, setBanners] = useState([]);
  const [bannersLoading, setBannersLoading] = useState(true);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  // Fetch banners from backend
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        setBannersLoading(true);
        const response = await bannerAPI.getAllBanners();
        console.log('Banners response:', response);
        
        if (response.data.success && response.data.data) {
          // Always use banners from backend if available
          if (response.data.data.length > 0) {
            setBanners(response.data.data);
          } else {
            // Empty array - no banners from backend
            setBanners([]);
          }
        } else {
          // If response is not successful, use empty array
          setBanners([]);
        }
      } catch (error) {
        console.error('Error fetching banners:', error);
        // On error, set empty array instead of defaults
        setBanners([]);
      } finally {
        setBannersLoading(false);
      }
    };

    fetchBanners();

    // Refetch banners when window gains focus (user might have added banner in another tab)
    const handleFocus = () => {
      fetchBanners();
    };

    window.addEventListener('focus', handleFocus);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  // Auto-scroll banners
  useEffect(() => {
    if (banners.length <= 1) return; // Don't auto-scroll if there's only one banner
    const interval = setInterval(() => {
      setCurrentBannerIndex((prev) => (prev + 1) % banners.length);
    }, 5000); // Change banner every 5 seconds
    return () => clearInterval(interval);
  }, [banners.length]);

  // Touch handlers for mobile swipe
  const onTouchStart = (e) => {
    setTouchEnd(0); // Reset touch end
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && banners.length > 1) {
      setCurrentBannerIndex((prev) => (prev + 1) % banners.length);
    }
    if (isRightSwipe && banners.length > 1) {
      setCurrentBannerIndex((prev) => (prev - 1 + banners.length) % banners.length);
    }
  };

  // If banners are loading, show loading state
  if (bannersLoading) {
    return (
      <section className="relative w-full min-h-[30vh] md:min-h-[80vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </section>
    );
  }

  // If no banners, show empty state or fallback
  if (banners.length === 0) {
    return (
      <section className="relative w-full min-h-[30vh] md:min-h-[80vh] flex items-center justify-center overflow-hidden bg-gray-100">
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-gray-500 text-sm md:text-base">No banners available</p>
        </div>
      </section>
    );
  }

  // If using Swiper (for desktop with multiple banners)
  if (banners.length > 1) {
    return (
      <section className="relative w-full min-h-[30vh] md:min-h-[80vh] flex items-center justify-center overflow-hidden">
        <Swiper
          key={`swiper-${banners.map(b => b._id).join('-')}`} // Force re-initialization when banners change
          modules={[Autoplay, Navigation, Pagination, A11y]}
          autoplay={{ 
            delay: 5000,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
            waitForTransition: true,
            stopOnLastSlide: false
          }}
          speed={800}
          spaceBetween={0}
          slidesPerView={1}
          centeredSlides={true}
          pagination={{ 
            clickable: true,
            dynamicBullets: true,
            renderBullet: function (index, className) {
              return `<span class="${className} hero-pagination-bullet"></span>`;
            }
          }}
          loop={true}
          allowTouchMove={true}
          a11y={{
            prevSlideMessage: 'Previous slide',
            nextSlideMessage: 'Next slide',
          }}
          className="w-full h-full hero-carousel"
          grabCursor={true}
          watchSlidesProgress={true}
          onSwiper={(swiper) => {
            // Ensure autoplay starts when Swiper is initialized
            setTimeout(() => {
              if (swiper && swiper.autoplay) {
                swiper.autoplay.start();
              }
            }, 100);
          }}
          onSlideChange={(swiper) => {
            // Ensure autoplay continues after slide change
            if (swiper && swiper.autoplay && !swiper.autoplay.running) {
              swiper.autoplay.start();
            }
          }}
        >
          {banners.map((banner, idx) => (
            <SwiperSlide key={banner._id || idx}>
              <div className="flex items-center justify-center absolute inset-0 w-full h-full z-0">
                <motion.img
                  src={banner.imageUrl || banner.image}
                  alt={banner.title || 'Banner'}
                  className="object-cover w-full h-full max-h-[100vh]"
                  draggable="false"
                  initial={{ scale: 1.05, opacity: 0.9 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{
                    duration: 1.5,
                    ease: [0.25, 0.46, 0.45, 0.94]
                  }}
                />
              </div>
              <div className="relative z-10 flex flex-col items-center justify-center h-[30vh] md:h-[100vh] px-4">
                <motion.div
                  className="text-center"
                  initial="initial"
                  whileInView="animate"
                  exit="exit"
                  variants={contentVariants}
                  viewport={{ once: false }}
                  key={banner._id || idx}
                >
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.8,
                      ease: [0.25, 0.46, 0.45, 0.94],
                      delay: 0.3
                    }}
                  >
                    <Link
                      to={banner.buttonLink || '/products'}
                      className="inline-block bg-white/90 backdrop-blur-sm text-primary-600 px-6 py-3 md:px-10 md:py-5 rounded-full font-semibold hover:bg-white hover:scale-105 transition-all duration-500 ease-out text-sm md:text-base shadow-lg hover:shadow-xl"
                    >
                      {banner.buttonText || 'Shop Now'}
                    </Link>
                  </motion.div>
                </motion.div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
        {/* Enhanced overlay for better readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary-900/40 via-primary-800/30 to-primary-700/40 z-5 pointer-events-none" />
      </section>
    );
  }

  // Mobile-friendly simple banner display (for single banner or mobile)
  return (
    <section className="mx-4 mt-4 mb-2 md:mx-0 md:mt-0 md:mb-0" data-aos="fade-down">
      <div className="relative h-32 md:h-[80vh] overflow-hidden rounded-2xl md:rounded-none shadow-2xl md:shadow-none">
        <div 
          key={banners[currentBannerIndex]?._id || currentBannerIndex}
          className="absolute inset-0"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <img 
            src={banners[currentBannerIndex]?.imageUrl || banners[currentBannerIndex]?.image} 
            alt={banners[currentBannerIndex]?.title || 'Banner'}
            className="absolute inset-0 w-full h-full object-cover"
          />
          {/* Overlay for better readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary-900/40 via-primary-800/30 to-primary-700/40" />
          
          {/* Button for mobile */}
          {banners[currentBannerIndex]?.buttonText && (
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <Link
                to={banners[currentBannerIndex]?.buttonLink || '/products'}
                className="inline-block bg-white/90 backdrop-blur-sm text-primary-600 px-6 py-3 md:px-10 md:py-5 rounded-full font-semibold hover:bg-white hover:scale-105 transition-all duration-500 ease-out text-sm md:text-base shadow-lg hover:shadow-xl"
              >
                {banners[currentBannerIndex]?.buttonText || 'Shop Now'}
              </Link>
            </div>
          )}
        </div>
        
        {/* Banner Indicators */}
        {banners.length > 1 && (
          <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
            {banners.map((banner, index) => (
              <button
                key={banner._id || index}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  currentBannerIndex === index ? 'bg-white' : 'bg-white/50'
                }`}
                onClick={() => setCurrentBannerIndex(index)}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default HeroCarousel; 