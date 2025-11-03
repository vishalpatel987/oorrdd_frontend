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

  const prev = () => setCurrent((i) => (i - 1 + events.length) % events.length);
  const next = () => setCurrent((i) => (i + 1) % events.length);

  return (
    <section className="w-full my-12">
      <div className="relative">
        <div className="w-full bg-gradient-to-r from-pink-100 to-blue-100 rounded-xl shadow-lg p-4 md:p-8">
      <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12 relative transition-all duration-500">
        {/* Left: Product */}
        <div className="flex flex-col items-center md:items-center w-full md:w-1/3 mb-6 md:mb-0">
          <img
            src={event.product.images && event.product.images[0]?.url ? event.product.images[0].url : '/product-images/default.webp'}
            alt={event.product.name}
            className="w-48 h-36 md:w-64 md:h-48 object-contain rounded-lg shadow-md bg-white"
          />
          <div className="mt-4 text-center">
            <h3 className="text-xl font-bold">{event.product.name}</h3>
            <p className="text-primary-600 font-semibold text-lg">₹{event.product.price}</p>
          </div>
        </div>
        {/* Right: Event Info & Countdown */}
        <div className="flex flex-col items-center md:items-start w-full md:w-2/3">
          <h2 className="text-3xl md:text-4xl font-bold mb-2 text-center md:text-left">{event.title}</h2>
          <p className="text-lg mb-6 text-center md:text-left">{event.description}</p>
          <div className="flex flex-wrap justify-center md:justify-start gap-4 mb-6">
            <div className="bg-white rounded-lg shadow px-4 py-2 text-center min-w-[70px]">
              <div className="text-2xl font-bold">{timeLeft.days}</div>
              <div className="text-xs text-gray-500">Days</div>
            </div>
            <div className="bg-white rounded-lg shadow px-4 py-2 text-center min-w-[70px]">
              <div className="text-2xl font-bold">{String(timeLeft.hours).padStart(2, '0')}</div>
              <div className="text-xs text-gray-500">Hr</div>
            </div>
            <div className="bg-white rounded-lg shadow px-4 py-2 text-center min-w-[70px]">
              <div className="text-2xl font-bold">{String(timeLeft.minutes).padStart(2, '0')}</div>
              <div className="text-xs text-gray-500">Min</div>
            </div>
            <div className="bg-white rounded-lg shadow px-4 py-2 text-center min-w-[70px]">
              <div className="text-2xl font-bold">{String(timeLeft.seconds).padStart(2, '0')}</div>
              <div className="text-xs text-gray-500">Sc</div>
            </div>
          </div>
          <Link
            to={`/products/${event.product._id}`}
            className="bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors text-lg shadow w-full md:w-auto text-center"
          >
            Go Shopping &rarr;
          </Link>
        </div>
        {/* Animated Promo Text on Right */}
        <div className="hidden md:block absolute right-8 top-1/2 transform -translate-y-1/2 w-1/3 text-right pointer-events-none select-none">
          <span
            className={`text-4xl font-extrabold text-primary-700 drop-shadow-lg transition-opacity duration-500 ${fade ? 'opacity-100' : 'opacity-0'}`}
            style={{ letterSpacing: '2px' }}
          >
            {promoPhrases[promoIndex]}
          </span>
        </div>
        {/* On mobile, show below */}
        <div className="block md:hidden w-full text-center mt-6">
          <span
            className={`text-2xl font-extrabold text-primary-700 drop-shadow-lg transition-opacity duration-500 ${fade ? 'opacity-100' : 'opacity-0'}`}
            style={{ letterSpacing: '2px' }}
          >
            {promoPhrases[promoIndex]}
          </span>
        </div>
      </div>
        {/* Slider controls */}
        {events.length > 1 && (
          <>
            <button aria-label="Previous" onClick={prev} className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full w-9 h-9 flex items-center justify-center shadow">‹</button>
            <button aria-label="Next" onClick={next} className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full w-9 h-9 flex items-center justify-center shadow">›</button>
            <div className="flex items-center justify-center gap-2 mt-3">
              {events.map((_, i) => (
                <button key={i} onClick={() => setCurrent(i)} className={`w-2.5 h-2.5 rounded-full ${i === current ? 'bg-primary-600' : 'bg-gray-300'}`} aria-label={`Slide ${i + 1}`}></button>
              ))}
            </div>
          </>
        )}
      </div>
      </div>
    </section>
  );
};

export default EventBanner; 