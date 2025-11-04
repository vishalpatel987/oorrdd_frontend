import React, { useEffect, useState } from 'react';
import productAPI from '../api/productAPI';
import { Link, useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';

// Helper to normalize category names for mapping
const normalize = name =>
  name
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]/g, '')
    .trim();

const categoryImageMap = {
  electronics: '/images/electronics.jpeg',
  homeandkitchen: '/images/home and kitchen.jpeg',
  beautyandpersonalcare: '/images/beauty and personal care.jpeg',
  clothingshoesandjewelry: '/images/clothing shoose.jpeg',
  sportsandoutdoors: '/images/sport and outdoor.jpeg',
  toysandgames: '/images/toy and game.jpeg',
  // Additional common categories without dedicated images use banners as fallback
  books: '/images/banner_1.jpg',
  automotive: '/images/banner_2.jpg',
  petsupplies: '/images/banner_3.jpg',
  healthhousehold: '/images/banner_2.jpg',
};

// Resolve which image to show for a category or subcategory
const getCategoryImage = (cat, allCategories) => {
  if (!cat) return '/images/logo.png';
  if (cat.image) return cat.image;
  const mapped = categoryImageMap[normalize(cat.name)];
  if (mapped) return mapped;
  if (cat.parentCategory) {
    const parent = allCategories.find(c => c._id === cat.parentCategory);
    if (parent) {
      if (parent.image) return parent.image;
      const parentMapped = categoryImageMap[normalize(parent.name)];
      if (parentMapped) return parentMapped;
    }
  }
  return '/images/logo.png';
};

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMain, setSelectedMain] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    productAPI.getCategories().then(res => {
      setCategories(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, []);

  // Filter main categories - those without parentCategory
  const mainCategories = categories.filter(cat => {
    const parentId = cat.parentCategory?._id || cat.parentCategory;
    return !parentId || parentId === null || parentId === '';
  });

  // Filter subcategories - those with parentCategory matching selectedMain
  const subcategories = selectedMain ? categories.filter(cat => {
    const parentId = cat.parentCategory?._id || cat.parentCategory;
    const selectedMainId = selectedMain?.toString() || selectedMain;
    const parentIdStr = parentId?.toString() || parentId;
    return parentIdStr === selectedMainId;
  }) : [];

  return (
    <div className="min-h-screen py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button - Show only on desktop (hidden on mobile) */}
        <div className="mb-6 hidden md:block">
          {selectedMain ? (
            <button
              onClick={() => setSelectedMain(null)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors font-medium"
            >
              <FaArrowLeft className="text-sm" />
              <span>Back to All Categories</span>
            </button>
          ) : (
            <button
              onClick={() => {
                // Go back to previous page or home if no history
                if (window.history.length > 1) {
                  navigate(-1);
                } else {
                  navigate('/');
                }
              }}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors font-medium"
            >
              <FaArrowLeft className="text-sm" />
              <span>Back</span>
            </button>
          )}
        </div>
        <h2 className="text-3xl font-bold text-center mb-12">{selectedMain ? 'Select a Subcategory' : 'All Categories'}</h2>
        {loading ? (
          <div className="flex justify-center items-center min-h-[200px]">Loading...</div>
        ) : selectedMain ? (
          <>
            {/* Subcategories Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-6">
              {subcategories && subcategories.length > 0 ? subcategories.map((subcat) => (
                <Link
                  key={subcat._id}
                  to={`/products?category=${subcat._id}`}
                  className="group"
                >
                  <div className="relative bg-gray-100 rounded-lg p-2 md:p-6 text-center hover:bg-primary-50 transition-colors overflow-hidden h-28 md:h-48 flex flex-col justify-end items-center">
                    <img
                      src={getCategoryImage(subcat, categories)}
                      alt={subcat.name || 'Subcategory'}
                      onError={e => {
                        if (!e.target.src.endsWith('/images/logo.png')) {
                          e.target.src = '/images/logo.png';
                        }
                      }}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 ease-in-out group-hover:scale-110 z-0"
                      style={{ filter: 'brightness(0.7)' }}
                    />
                    <div className="relative z-10 px-1">
                      <h3 className="font-semibold mb-0 md:mb-2 group-hover:text-primary-600 text-white text-xs md:text-lg drop-shadow-lg leading-tight">
                        {subcat.name || 'Unnamed Subcategory'}
                      </h3>
                    </div>
                  </div>
                </Link>
              )) : (
                <div className="col-span-full text-center text-gray-500 py-12">
                  <p className="text-lg mb-2">No subcategories found.</p>
                  <p className="text-sm text-gray-400">This category doesn't have any subcategories yet.</p>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-6">
            {mainCategories.map((cat) => (
              <button
                key={cat._id}
                onClick={() => setSelectedMain(cat._id)}
                className="group w-full"
              >
                <div className="relative bg-gray-100 rounded-lg p-2 md:p-6 text-center hover:bg-primary-50 transition-colors overflow-hidden h-28 md:h-48 flex flex-col justify-end items-center">
                  <img
                    src={getCategoryImage(cat, categories)}
                    alt={cat.name || 'Category'}
                    onError={e => {
                      if (!e.target.src.endsWith('/images/logo.png')) {
                        e.target.src = '/images/logo.png';
                      }
                    }}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 ease-in-out group-hover:scale-110 z-0"
                    style={{ filter: 'brightness(0.7)' }}
                  />
                  <div className="relative z-10 px-1">
                    <h3 className="font-semibold mb-0 md:mb-2 group-hover:text-primary-600 text-white text-xs md:text-lg drop-shadow-lg leading-tight">
                      {cat.name || 'Unnamed Category'}
                    </h3>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Categories; 