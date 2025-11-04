import React, { useEffect, useState } from 'react';
import productAPI from '../../api/productAPI';
import { Link } from 'react-router-dom';

const promoPhrases = [
  'Limited Time Offer!',
  'Hurry Up!',
  'Best Deal Today!',
  'Don\'t Miss Out!',
  'Shop Now & Save!',
  'Exclusive Event!',
];

const EventBanner = () => {
  // Support multiple banners
  const [events, setEvents] = useState([]);
  const [nowTs, setNowTs] = useState(Date.now());
  const [promoIndex, setPromoIndex] = useState(0);
  const [fade, setFade] = useState(true);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    // Try multi banners first; fallback to single if API returns null
    productAPI.getEventBanners().then(res => {
      const list = Array.isArray(res.data) ? res.data : [];
      if (list.length > 0) {
        setEvents(list.filter(e => e && e.product));
      } else {
        productAPI.getEventBanner().then(r => {
          if (r.data) setEvents([r.data]);
        });
      }
    });
    // eslint-disable-next-line
  }, []);

  // Tick every second to re-render countdowns
  useEffect(() => {
    const interval = setInterval(() => setNowTs(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Auto-rotate banners every 5 seconds when multiple exist
  useEffect(() => {
    if (!events || events.length <= 1) return;
    const t = setInterval(() => {
      setCurrent((idx) => (idx + 1) % events.length);
    }, 5000);
    return () => clearInterval(t);
  }, [events]);

  // Animated promo text
  useEffect(() => {
    const timer = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setPromoIndex((prev) => (prev + 1) % promoPhrases.length);
        setFade(true);
      }, 400);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const getTimeLeft = (endDate) => {
    const end = new Date(endDate).getTime();
    const diff = Math.max(0, end - nowTs);
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);
    return { days, hours, minutes, seconds };
  };

  if (!events || events.length === 0) return null;

  const event = events[Math.min(current, events.length - 1)];
  const timeLeft = getTimeLeft(event.endDate);

  return (
    <section className="w-full my-4 md:my-8">
      <div className="relative">
        <div className="w-full bg-gradient-to-r from-pink-100 to-blue-100 rounded-xl shadow-lg p-3 md:p-6">                                                     
      {/* Mobile Layout */}
      <div className="md:hidden flex flex-col gap-3 relative transition-all duration-500">
        {/* Top Row: Image (Left) and Timer (Right) */}
        <div className="flex items-start gap-3">
          {/* Image Section - Left */}
          <div className="flex flex-col items-start flex-shrink-0">
            <img
              src={event.product.images && event.product.images[0]?.url ? event.product.images[0].url : '/product-images/default.webp'}                           
              alt={event.product.name}
              className="w-24 h-20 object-contain rounded-lg shadow-md bg-white"                                                                  
            />
            {/* Name and Price below image */}
            <div className="mt-1.5 text-left">
              <h3 className="text-xs font-bold leading-tight">{event.product.name}</h3>                                                                            
              <p className="text-primary-600 font-semibold text-xs mt-0.5">₹{event.product.price}</p>                                                     
            </div>
          </div>
          
          {/* Timer Section - Right */}
          <div className="flex-1 flex flex-col items-end">
            <div className="flex flex-wrap justify-end gap-1.5 mb-2">
              <div className="bg-white rounded-lg shadow px-2 py-1 text-center min-w-[45px]">
                <div className="text-sm font-bold">{timeLeft.days}</div>
                <div className="text-[10px] text-gray-500">Days</div>
              </div>
              <div className="bg-white rounded-lg shadow px-2 py-1 text-center min-w-[45px]">
                <div className="text-sm font-bold">{String(timeLeft.hours).padStart(2, '0')}</div>
                <div className="text-[10px] text-gray-500">Hr</div>
              </div>
              <div className="bg-white rounded-lg shadow px-2 py-1 text-center min-w-[45px]">
                <div className="text-sm font-bold">{String(timeLeft.minutes).padStart(2, '0')}</div>
                <div className="text-[10px] text-gray-500">Min</div>
              </div>
              <div className="bg-white rounded-lg shadow px-2 py-1 text-center min-w-[45px]">
                <div className="text-sm font-bold">{String(timeLeft.seconds).padStart(2, '0')}</div>
                <div className="text-[10px] text-gray-500">Sc</div>
              </div>
            </div>
                          {/* Small Go Button below timer */}
              <Link
                to={`/products/${event.product._id}`}
                className="bg-primary-600 text-white px-4 py-1.5 rounded-lg font-semibold hover:bg-primary-700 transition-colors text-xs shadow text-center"
              >
                Go Shopping →
              </Link>
              {/* Animated Promo Text below Go Shopping button */}
              <div className="mt-2 text-center">
                <span
                  className={`text-sm font-extrabold text-primary-700 drop-shadow-lg transition-opacity duration-500 ${fade ? 'opacity-100' : 'opacity-0'}`}
                  style={{ letterSpacing: '1px' }}
                >
                  {promoPhrases[promoIndex]}
                </span>
              </div>
            </div>
          </div>

          {/* Description below everything */}
        <div className="mt-1">
          <h2 className="text-sm font-bold mb-1 text-left">{event.title}</h2>
          <p className="text-xs text-left">{event.description}</p>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:flex flex-row items-center justify-center gap-4 md:gap-8 relative transition-all duration-500">                               
        {/* Left: Product */}
        <div className="flex flex-col items-center md:items-center w-full md:w-1/3 mb-3 md:mb-0">                                                               
          <img
            src={event.product.images && event.product.images[0]?.url ? event.product.images[0].url : '/product-images/default.webp'}                           
            alt={event.product.name}
            className="w-32 h-24 md:w-48 md:h-36 object-contain rounded-lg shadow-md bg-white"                                                                  
          />
          <div className="mt-2 text-center">
            <h3 className="text-base md:text-lg font-bold">{event.product.name}</h3>                                                                            
            <p className="text-primary-600 font-semibold text-sm md:text-base">₹{event.product.price}</p>                                                     
          </div>
        </div>
        {/* Right: Event Info & Countdown */}
        <div className="flex flex-col items-center md:items-start w-full md:w-2/3">                                                                             
          <h2 className="text-xl md:text-2xl font-bold mb-1 text-center md:text-left">{event.title}</h2>                                                        
          <p className="text-sm md:text-base mb-3 text-center md:text-left">{event.description}</p>                                                             
          <div className="flex flex-wrap justify-center md:justify-start gap-2 md:gap-3 mb-3">                                                                  
            <div className="bg-white rounded-lg shadow px-3 py-1.5 md:px-4 md:py-2 text-center min-w-[60px] md:min-w-[70px]">                       
              <div className="text-lg md:text-2xl font-bold">{timeLeft.days}</div>                                                                              
              <div className="text-xs text-gray-500">Days</div>
            </div>
            <div className="bg-white rounded-lg shadow px-3 py-1.5 md:px-4 md:py-2 text-center min-w-[60px] md:min-w-[70px]">                                   
              <div className="text-lg md:text-2xl font-bold">{String(timeLeft.hours).padStart(2, '0')}</div>                                                    
              <div className="text-xs text-gray-500">Hr</div>
            </div>
            <div className="bg-white rounded-lg shadow px-3 py-1.5 md:px-4 md:py-2 text-center min-w-[60px] md:min-w-[70px]">                                   
              <div className="text-lg md:text-2xl font-bold">{String(timeLeft.minutes).padStart(2, '0')}</div>                                                  
              <div className="text-xs text-gray-500">Min</div>
            </div>
            <div className="bg-white rounded-lg shadow px-3 py-1.5 md:px-4 md:py-2 text-center min-w-[60px] md:min-w-[70px]">                                   
              <div className="text-lg md:text-2xl font-bold">{String(timeLeft.seconds).padStart(2, '0')}</div>                                                  
              <div className="text-xs text-gray-500">Sc</div>
            </div>
          </div>
          <Link
            to={`/products/${event.product._id}`}
            className="bg-primary-600 text-white px-6 py-2 md:px-8 md:py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors text-sm md:text-lg shadow w-full md:w-auto text-center"                                              
          >
            Go Shopping &rarr;
          </Link>
        </div>
        {/* Animated Promo Text on Right */}
        <div className="hidden md:block absolute right-8 top-1/2 transform -translate-y-1/2 w-1/3 text-right pointer-events-none select-none">                  
          <span
            className={`text-2xl md:text-3xl font-extrabold text-primary-700 drop-shadow-lg transition-opacity duration-500 ${fade ? 'opacity-100' : 'opacity-0'}`}                                                                             
            style={{ letterSpacing: '2px' }}
          >
            {promoPhrases[promoIndex]}
          </span>
        </div>
      </div>
        {/* Pagination dots - only show if multiple banners exist */}
        {events.length > 1 && (
          <div className="flex items-center justify-center gap-2 mt-3">       
            {events.map((_, i) => (
              <div key={i} className={`w-2.5 h-2.5 rounded-full ${i === current ? 'bg-primary-600' : 'bg-gray-300'}`}></div>                                                
            ))}
          </div>
        )}
      </div>
      </div>
    </section>
  );
};

export default EventBanner; 