import React from 'react';

// Example brand data for different categories
// NOTE: Removed external logo URLs to prevent 404 errors - logos are handled by getBrandLogo() function
const brandMap = {
  Electronics: [
    { name: 'Samsung' },
    { name: 'Apple' },
    { name: 'Sony' },
    { name: 'OnePlus' },
    { name: 'Vivo' },
    { name: 'Oppo' },
    { name: 'Realme' },
    { name: 'Xiaomi' },
    { name: 'Motorola' },
    { name: 'Nokia' },
  ],
  Fashion: [
    { name: 'Nike' },
    { name: 'Adidas' },
    { name: 'Puma' },
    { name: 'Zara' },
    { name: 'H&M' },
    { name: 'Levi\'s' },
    { name: 'Gucci' },
    { name: 'Louis Vuitton' },
  ],
  Books: [
    { name: 'Penguin' },
    { name: 'HarperCollins' },
    { name: 'Simon & Schuster' },
    { name: 'Random House' },
  ],
  Home: [
    { name: 'IKEA' },
    { name: 'Philips' },
    { name: 'Whirlpool' },
    { name: 'LG' },
  ],
  Sports: [
    { name: 'Nike' },
    { name: 'Adidas' },
    { name: 'Puma' },
    { name: 'Reebok' },
  ],
  Beauty: [
    { name: 'L\'Oreal' },
    { name: 'Maybelline' },
    { name: 'Lakme' },
    { name: 'Dove' },
  ],
  Automotive: [
    { name: 'Toyota' },
    { name: 'Honda' },
    { name: 'Ford' },
    { name: 'BMW' },
  ],
  Food: [
    { name: 'Nestle' },
    { name: 'Kellogg\'s' },
    { name: 'Pepsi' },
    { name: 'Coca-Cola' },
  ],
  Jewelry: [
    { name: 'Tiffany & Co.' },
    { name: 'Cartier' },
    { name: 'Swarovski' },
    { name: 'Pandora' },
  ],
  Pets: [
    { name: 'Pedigree' },
    { name: 'Whiskas' },
    { name: 'Purina' },
    { name: 'Royal Canin' },
  ],
};

const BrandMarquee = ({ category }) => {
  const normalize = (str) => (str || '').toLowerCase().replace(/[^a-z0-9]+/g, '');
  const localBrandLogoMap = {
    samsung: '/images/brands/samsung.svg',
    apple: '/images/brands/apple.svg',
    sony: '/images/brands/sony.svg',
    oneplus: '/images/brands/oneplus.svg',
    vivo: '/images/brands/vivo.svg',
    oppo: '/images/brands/oppo.svg',
    realme: '/images/brands/realme.svg',
    xiaomi: '/images/brands/xiaomi.svg',
    motorola: '/images/brands/motorola.svg',
    nokia: '/images/brands/nokia.svg',
    nike: '/images/brands/nike.svg',
    adidas: '/images/brands/adidas.svg',
    puma: '/images/brands/puma.svg',
  };

  const getBrandLogo = (brand) => {
    const key = normalize(brand?.name);
    // Prioritize local logos first to avoid 404 errors
    if (localBrandLogoMap[key]) {
      return localBrandLogoMap[key];
    }
    // Don't use external URLs - they cause 404 errors
    // Use default logo instead for all brands without local logos
    return '/images/logo.png';
  };

  let brands = [];
  if (category && brandMap[category]) {
    brands = brandMap[category];
  } else {
    // Show all brands if no category or unknown category
    brands = Object.values(brandMap).flat();
  }
  // Duplicate brands for seamless looping
  const marqueeBrands = [...brands, ...brands];
  return (
    <div className="w-full bg-white py-6 overflow-hidden">
      <div className="relative">
        <div className="brand-marquee flex items-center whitespace-nowrap animate-marquee">
          {marqueeBrands.map((brand, idx) => (
            <div
              key={idx}
              className="flex flex-col items-center justify-center mx-8 min-w-[120px]"
            >
              <img
                src={getBrandLogo(brand)}
                alt={brand.name}
                className="h-12 w-auto mb-2 object-contain grayscale hover:grayscale-0 transition duration-300"
                loading="lazy"
                onError={(e) => {
                  // Final fallback if default logo also fails
                  e.target.src = '/images/logo.png';
                  e.target.onerror = null; // Prevent infinite loop
                }}
                style={{ maxWidth: 80 }}
              />
              <span className="font-semibold text-gray-800 text-base md:text-lg text-center">
                {brand.name}
              </span>
            </div>
          ))}
        </div>
      </div>
      {/* Marquee animation styles */}
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 10s linear infinite;
        }
        @media (max-width: 768px) {
          .brand-marquee > div { min-width: 90px; margin-left: 1rem; margin-right: 1rem; }
        }
      `}</style>
    </div>
  );
};

export default BrandMarquee; 