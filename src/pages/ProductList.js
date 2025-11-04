import React, { useState, useEffect, useLayoutEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaSearch, FaShoppingCart, FaHeart, FaArrowLeft } from 'react-icons/fa';
import { formatINR } from '../utils/formatCurrency';
import { useDispatch, useSelector } from 'react-redux';
import { addToCartAsync, loadCart } from '../redux/slices/cartSlice';
import { fetchWishlist, addToWishlist, removeFromWishlist } from '../redux/slices/wishlistSlice';
import { useStore } from 'react-redux';
import productAPI from '../api/productAPI';
import { toast } from 'react-toastify';
import { setLoading } from '../redux/slices/authSlice';
import ProductCard from '../components/common/ProductCard';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('all');
  const [categories, setCategories] = useState([]);
  const [sortBy, setSortBy] = useState('name');
  const location = useLocation();
  const navigate = useNavigate();

  const dispatch = useDispatch();
  const store = useStore();
  const { items: wishlistItems } = useSelector((state) => state.wishlist);
  const { isAuthenticated } = useSelector((state) => state.auth);

  // Load cart from localStorage on mount
  useLayoutEffect(() => {
    const cartData = localStorage.getItem('cart');
    if (cartData) {
      try {
        const parsed = JSON.parse(cartData);
        // Validate structure before dispatching
        if (
          parsed &&
          typeof parsed === 'object' &&
          Array.isArray(parsed.items) &&
          typeof parsed.total === 'number' &&
          typeof parsed.itemCount === 'number'
        ) {
          dispatch(loadCart(parsed));
        } else {
          // Remove invalid cart
          localStorage.removeItem('cart');
        }
      } catch {
        localStorage.removeItem('cart');
      }
    }
  }, [dispatch]);

  // Save cart to localStorage on every change
  useEffect(() => {
    const unsubscribe = store.subscribe(() => {
      const state = store.getState();
      localStorage.setItem('cart', JSON.stringify(state.cart));
    });
    return unsubscribe;
  }, []);

  // Fetch wishlist on mount if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchWishlist());
    }
  }, [dispatch, isAuthenticated]);

  // Fetch categories from backend
  useEffect(() => {
    productAPI.getCategories().then(res => setCategories(res.data)).catch(() => setCategories([]));
  }, []);

  // Pre-select category from URL query param
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const cat = params.get('category');
    if (cat) setCategory(cat);
  }, [location.search]);

  // Fetch products (optionally by category)
  useEffect(() => {
    setLoading(true);
    const fetchProducts = async () => {
      try {
        let response;
        if (category && category !== 'all') {
          response = await productAPI.getProductsByCategory(category);
        } else {
          response = await productAPI.getProducts();
        }
        setProducts(response.data || []);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching products:', err);
        setProducts([]);
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, [category]);

  // Helper to slugify product name
  const slugify = (name) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  // Helper to get image for product (try local, fallback to unsplash)
  const getProductImage = (name) => {
    const localPath = `/product-images/${slugify(name)}.webp`;
    return localPath;
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Category matching - check both main category and subcategory
    let matchesCategory = true;
    if (category !== 'all') {
      const productCategoryId = product.category?._id?.toString() || product.category?.toString() || product.category;
      const productSubCategoryId = product.subCategory?._id?.toString() || product.subCategory?.toString() || product.subCategory;
      const selectedCategoryId = category?.toString() || category;
      
      matchesCategory = 
        productCategoryId === selectedCategoryId ||
        productSubCategoryId === selectedCategoryId ||
        String(product.category) === String(category) ||
        String(product.subCategory) === String(category);
    }
    
    return matchesSearch && matchesCategory;
  });
  // console.log('Filtered products:', filteredProducts);

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'rating':
        return b.rating - a.rating;
      default:
        return a.name.localeCompare(b.name);
    }
  });
  // console.log('Sorted products:', sortedProducts);

  // Add to Cart handler
  const handleAddToCart = (product) => {
    if (!isAuthenticated) {
      toast.info('Please login to add items to your cart.');
      navigate('/login');
      return;
    }
    console.log('Dispatching addToCartAsync:', addToCartAsync, product);
    dispatch(addToCartAsync({ product: product._id, quantity: 1 }));
  };

  // Wishlist handler
  const isInWishlist = (productId) => wishlistItems.some((item) => String(item._id) === String(productId));
  const handleWishlist = (product) => {
    if (!isAuthenticated) {
      toast.info('Please login to use wishlist!');
      navigate('/login');
      return;
    }
    if (isInWishlist(product._id)) {
      console.log('Dispatching removeFromWishlist:', removeFromWishlist, product._id);
      dispatch(removeFromWishlist(product._id));
    } else {
      console.log('Dispatching addToWishlist:', addToWishlist, product._id);
      dispatch(addToWishlist(product._id));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 py-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4 hidden md:flex">
          <div className="flex items-center gap-4">
            {/* Back Button - Show only on desktop when category is selected or on filtered view */}
            {(category !== 'all' || location.search.includes('category=')) && (
              <button
                onClick={() => {
                  // Check if we came from categories page or use browser history
                  const referrer = document.referrer;
                  const currentUrl = window.location.href;
                  
                  // If referrer is from categories page, go back to categories
                  if (referrer && (referrer.includes('/categories') || referrer.includes('localhost:3000/categories'))) {
                    navigate('/categories');
                  } else if (window.history.length > 1) {
                    // Use browser history to go back to previous page
                    window.history.back();
                  } else {
                    // Fallback: navigate to home page
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
        </div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Our Products</h1>
        <p className="text-gray-600">Discover amazing products at great prices</p>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="md:w-48">
            <select
              value={category}
              onChange={(e) => {
                const selectedCategory = e.target.value;
                setCategory(selectedCategory);
                // Update URL with category query param
                const params = new URLSearchParams(location.search);
                if (selectedCategory === 'all') {
                  params.delete('category');
                } else {
                  params.set('category', selectedCategory);
                }
                navigate({ search: params.toString() });
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
            >
              <option value="all">All Categories</option>
              {categories
                .filter(cat => !cat.parentCategory || cat.parentCategory === null || cat.parentCategory === '')
                .map(main => {
                  const subcategories = categories.filter(sub => {
                    const parentId = sub.parentCategory?._id || sub.parentCategory;
                    const mainId = main._id?.toString() || main._id;
                    return parentId?.toString() === mainId;
                  });
                  
                  return (
                    <React.Fragment key={main._id}>
                      <option value={main._id} style={{ fontWeight: 'bold', background: '#f3f4f6' }}>{main.name}</option>
                      {subcategories.map(sub => (
                        <option key={sub._id} value={sub._id} style={{ paddingLeft: 20 }}>
                          &nbsp;&nbsp;› {sub.name}
                        </option>
                      ))}
                    </React.Fragment>
                  );
                })}
            </select>
          </div>

          {/* Sort */}
          <div className="md:w-48">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="name">Sort by Name</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      {sortedProducts.length === 0 ? (
        <div className="text-center py-12">
          <FaSearch className="mx-auto text-6xl text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No products found</h3>
          <p className="text-gray-500">Try adjusting your search or filter criteria</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-5 p-1 md:p-2 justify-center">
          {sortedProducts.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              isInWishlist={isInWishlist}
              handleWishlist={handleWishlist}
              handleAddToCart={() => handleAddToCart({ ...product, _id: product._id })}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductList; 