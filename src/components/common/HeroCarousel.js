import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination, A11y } from 'swiper';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const slides = [
  {
    image: './images/banner_1.jpg',
    buttonText: 'Shop Now',
    buttonLink: '/products',
  },
  {
    image: './images/banner_3.jpg',
    buttonText: 'Shop Now',
    buttonLink: '/products',
  },
  {
    image: './images/banner_2.jpg',
    buttonText: 'Shop Now',
    buttonLink: '/products',
  },
];

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
  return (
    <section className="relative w-full min-h-[30vh] md:min-h-[80vh] flex items-center justify-center overflow-hidden max-w-full">
      <Swiper
        modules={[Autoplay, Navigation, Pagination, A11y]}
        autoplay={{ 
          delay: 4000,
          disableOnInteraction: false,
          pauseOnMouseEnter: true,
          waitForTransition: true
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
        a11y={{
          prevSlideMessage: 'Previous slide',
          nextSlideMessage: 'Next slide',
        }}
        className="w-full h-full hero-carousel"
        grabCursor={true}
        watchSlidesProgress={true}
      >
        {slides.map((slide, idx) => (
          <SwiperSlide key={idx}>
            <div className="flex items-center justify-center absolute inset-0 w-full h-full z-0">
              <motion.img
                src={slide.image}
                alt="Banner"
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
            <div className="relative z-10 flex flex-col items-center justify-center h-[30vh] md:h-[100vh] w-full px-3 sm:px-4 md:px-6 max-w-full overflow-visible">
              <motion.div
                className="text-center w-full max-w-full"
                initial="initial"
                whileInView="animate"
                exit="exit"
                variants={contentVariants}
                viewport={{ once: false }}
                key={idx}
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.8,
                    ease: [0.25, 0.46, 0.45, 0.94],
                    delay: 0.3
                  }}
                  className="w-full max-w-full"
                >
                  <Link
                    to={slide.buttonLink}
                    className="inline-block bg-white/90 backdrop-blur-sm text-primary-600 px-6 py-3 sm:px-8 sm:py-4 md:px-10 md:py-5 rounded-full font-semibold hover:bg-white hover:scale-105 transition-all duration-500 ease-out text-xs sm:text-sm md:text-base shadow-lg hover:shadow-xl whitespace-nowrap"
                  >
                    {slide.buttonText}
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
};

export default HeroCarousel; 