import React, { useState, useEffect } from 'react';
import brandAPI from '../../api/brandAPI';

const BrandMarquee = ({ category }) => {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        setLoading(true);
        const params = category ? { category } : {};
        const response = await brandAPI.getAllBrands(params);
        
        if (response.data && response.data.success) {
          const fetchedBrands = response.data.data || [];
          setBrands(fetchedBrands);
        } else {
          setBrands([]);
        }
      } catch (error) {
        console.error('Error fetching brands:', error);
        setBrands([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBrands();
  }, [category]);

  const getBrandLogo = (brand) => {
    // Use logo from API if available
    if (brand?.logo || brand?.logoUrl) {
      return brand.logo || brand.logoUrl;
    }
    // Fallback to default logo
    return '/images/logo.png';
  };

  if (loading) {
    return (
      <div className="w-full bg-white py-6 overflow-hidden">
        <div className="flex items-center justify-center">
          <div className="text-gray-500">Loading brands...</div>
        </div>
      </div>
    );
  }

  if (!brands || brands.length === 0) {
    return null; // Don't show anything if no brands
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