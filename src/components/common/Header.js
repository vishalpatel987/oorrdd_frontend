import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { 
  FaSearch, 
  FaShoppingCart, 
  FaUser, 
  FaBars, 
  FaTimes,
  FaHeart,
  FaSignOutAlt,
  FaComments,
  FaTachometerAlt
} from 'react-icons/fa';
import { logout } from '../../redux/slices/authSlice';
import { setChatUnreadCounts } from '../../redux/slices/uiSlice';
import io from 'socket.io-client';
import axiosInstance from '../../api/axiosConfig';
import { clearCart } from '../../redux/slices/cartSlice';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceTimeout = useRef();
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { itemCount } = useSelector((state) => state.cart);
  const { chatUnreadCounts } = useSelector((state) => state.ui);
  const totalUnread = Object.values(chatUnreadCounts || {}).reduce((a, b) => a + b, 0);
  const wishlistItems = useSelector((state) => state.wishlist.items);
    const drawerRef = useRef();
  const socketRef = useRef();
  const userMenuRef = useRef();


  // Close drawer on outside click
  useEffect(() => {
    if (!isMenuOpen) return;
    function handleClick(e) {
      if (drawerRef.current && !drawerRef.current.contains(e.target)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);        
  }, [isMenuOpen]);

  // Close user menu on outside click
  useEffect(() => {
    if (!isUserMenuOpen) return;
    function handleClick(e) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);        
  }, [isUserMenuOpen]);

  // Use ref to prevent duplicate calls from React StrictMode
  const hasFetchedChatRef = useRef(false);
  
  useEffect(() => {
    if (!isAuthenticated || !user || !user._id) return;
    
    // Prevent duplicate calls from StrictMode double rendering
    if (hasFetchedChatRef.current) return;
    hasFetchedChatRef.current = true;
    
    // Fetch unread counts on mount
    const fetchUnreadCounts = async () => {
      try {
        const convRes = await axiosInstance.get('/chat/conversations');
        if (convRes.data.unreadCounts) {
          dispatch(setChatUnreadCounts(convRes.data.unreadCounts));
        }
      } catch (err) {
        console.log('Failed to fetch unread counts:', err.message);
      }
    };
    fetchUnreadCounts();
    
    // Set up socket connection for unread updates with better error handling
    // In development, always use localhost:5000 (backend server)
    // In production, use REACT_APP_API_URL or default to production backend
    let SOCKET_URL;
    if (process.env.NODE_ENV === 'development') {
      // Force localhost:5000 in development (override any incorrect env vars)
      SOCKET_URL = 'http://localhost:5000';
    } else {
      // Production: use env var or default to production backend
      SOCKET_URL = process.env.REACT_APP_API_URL?.replace('/api', '') || 'https://oorrdd-backend.onrender.com';
    }
    
    try {
      socketRef.current = io(SOCKET_URL, { 
        transports: ['websocket', 'polling'],
        timeout: 20000,
        forceNew: true,
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5
      });
      
      socketRef.current.on('connect', () => {
        console.log('Socket connected successfully to:', SOCKET_URL);
        socketRef.current.emit('join', user._id);
      });
      
      socketRef.current.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason);
      });
      
      socketRef.current.on('connect_error', (error) => {
        console.log('Socket connection error:', error.message);
        // Don't show error if it's a known development issue
        if (process.env.NODE_ENV === 'production') {
          console.warn('⚠️ WebSocket connection failed. Real-time features may not work.');
        }
      });
      
      socketRef.current.on('unreadCountsUpdate', (unreadCounts) => {
        dispatch(setChatUnreadCounts(unreadCounts));
      });
      
    } catch (error) {
      console.log('Failed to initialize socket:', error.message);
    }
    
    return () => {
      if (socketRef.current) {
        socketRef.current.removeAllListeners();
        socketRef.current.disconnect();
      }
    };
  }, [isAuthenticated, user, dispatch]);

  const fetchSuggestions = async (term) => {
    if (!term.trim()) {
      setSuggestions([]);
      return;
    }
    try {
      const res = await axiosInstance.get(`/products/search?query=${encodeURIComponent(term)}`);
      setSuggestions(res.data || []);
    } catch (err) {
      setSuggestions([]);
    }
  };

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
    setShowSuggestions(true);
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    debounceTimeout.current = setTimeout(() => {
      fetchSuggestions(e.target.value);
    }, 300);
  };

  const handleSuggestionClick = (id) => {
    setShowSuggestions(false);
    setSearchTerm('');
    setSuggestions([]);
    navigate(`/products/${id}`);
  };

  const handleBlur = () => {
    setTimeout(() => setShowSuggestions(false), 150);
  };

  const handleLogout = () => {
    dispatch(logout());
    dispatch(clearCart());
    setIsUserMenuOpen(false);
    navigate('/');
  };

  const toggleMobileMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleUserMenu = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchTerm.trim())}`);
      setShowSuggestions(false);
      setSuggestions([]);
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-full mx-auto px-2 sm:px-4 lg:px-6">
        <div className="flex justify-between items-center h-14 md:h-16">
          {/* Left: Logo & Main Nav */}
          <div className="flex items-center min-w-0">
            <Link to="/" className="flex items-center mr-3">
              {/* <span className="font-extrabold text-primary-600 text-lg md:text-xl tracking-tight whitespace-nowrap select-none">MV Store</span> */}
              <img 
                src={process.env.PUBLIC_URL + "/images/logo.png"} 
                alt="MV Store Logo" 
                className="h-8 md:h-10 w-auto object-contain mr-2 select-none" 
                style={{ maxHeight: '2.25rem' }} // matches md:text-xl
              />
            </Link>
            <nav className="hidden md:flex items-center space-x-2 text-sm font-medium text-gray-700">
              <Link to="/" className="px-1.5 py-1 rounded transition-colors duration-200 hover:bg-primary-50 hover:text-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-200">Home</Link>
              <Link to="/products" className="px-1.5 py-1 rounded transition-colors duration-200 hover:bg-primary-50 hover:text-primary-600">Products</Link>
              <Link to="/categories" className="px-1.5 py-1 rounded transition-colors duration-200 hover:bg-primary-50 hover:text-primary-600">Categories</Link>
              {/* Conditionally render Become a Vendor */}
              {(!isAuthenticated || (user && user.role !== 'seller') || (user && user.role === 'admin')) && (
                <Link to="/vendor-registration" className="px-1.5 py-1 rounded transition-colors duration-200 hover:bg-primary-50 hover:text-primary-600">Become a Vendor</Link>
              )}
            </nav>
          </div>  

          {/* Center: Wider Search Bar (Desktop) */}
          <div className="hidden md:flex flex-1 justify-center mx-2">
            <form onSubmit={handleSearch} className="w-full max-w-lg md:max-w-2xl">
              <div className="relative group">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={handleInputChange}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={handleBlur}
                  className="w-full pl-4 pr-10 py-2 border border-gray-200 rounded-full text-base focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all duration-200 shadow-sm group-focus-within:shadow-md bg-gray-50"
                />
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
                    {suggestions.map((product) => (
                      <div
                        key={product._id}
                        className="flex items-center px-4 py-2 cursor-pointer hover:bg-primary-50"
                        onMouseDown={() => handleSuggestionClick(product._id)}
                      >
                        {product.images && product.images[0]?.url && (
                          <img src={product.images[0].url} alt={product.name} className="w-10 h-10 object-cover rounded mr-3" />
                        )}
                        <div className="flex-1">
                          <div className="font-medium text-gray-900 truncate">{product.name}</div>
                          <div className="text-xs text-gray-500">₹{product.price}</div>
                        </div>
                        {product.numReviews > 0 && (
                          <div className="ml-2 text-xs text-yellow-600">★ {product.numReviews} reviews</div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                <button
                  type="submit"
                  className="absolute right-0 top-0 mt-2 mr-3 text-gray-400 hover:text-primary-600 transition-colors duration-200"
                >
                  <FaSearch />
                </button>
              </div>
            </form>
          </div>

                      {/* Right: Icons */}
          <div className="flex items-center space-x-1">
            {/* Mobile Search Icon */}
            <button
              className="md:hidden p-2 text-gray-600 hover:text-primary-600 focus:outline-none transition-colors duration-200"
              aria-label="Open search"
              onClick={() => setIsMobileSearchOpen(true)}
            >
              <FaSearch className="text-lg" />
            </button>
          
            {/* Cart */}
            <Link to="/cart" className="relative p-2 text-gray-600 hover:text-primary-600 transition-colors duration-200">
              <FaShoppingCart className="text-lg md:text-xl" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-bounce">{itemCount}</span>
              )}
            </Link>
                        {/* Wishlist */}
            <Link to="/wishlist" className="relative p-2 text-gray-600 hover:text-primary-600 transition-colors duration-200">                                  
              <FaHeart className="text-lg md:text-xl" />
              {wishlistItems && wishlistItems.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-bounce">{wishlistItems.length}</span>                                                    
              )}
            </Link>
            
            {/* Chat - Desktop only */}
            {isAuthenticated && (
              <Link to="/chat" className="hidden md:block relative p-2 text-gray-600 hover:text-primary-600 transition-colors duration-200">
                <FaComments className="text-lg md:text-xl" />
                {totalUnread > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-bounce">{totalUnread}</span>
                )}
              </Link>
            )}
            
            {/* Dashboard + Profile + Name & Role - Desktop only */}
            {isAuthenticated && (
              <div className="hidden md:flex md:items-center md:gap-2 relative">
                {/* Dashboard Icon */}
                {(user?.role === 'seller' || user?.role === 'admin') && (
                  <Link 
                    to={user?.role === 'admin' ? '/admin' : '/seller'} 
                    className="p-2 text-gray-600 hover:text-primary-600 transition-colors duration-200"
                    aria-label={user?.role === 'admin' ? 'Admin Dashboard' : 'Vendor Dashboard'}
                  >
                    <FaTachometerAlt className="text-lg md:text-xl" />
                  </Link>
                )}
                
                {/* Profile Icon */}
                <div className="relative" ref={userMenuRef}>    
                  <button
                    onClick={toggleUserMenu}
                    className="p-2 text-gray-600 hover:text-primary-600 transition-colors duration-200 focus:outline-none"
                    aria-label="User menu"
                  >
                    <FaUser className="text-lg md:text-xl" />
                  </button>
                  {/* User Dropdown Menu */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-colors"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        Profile
                      </Link>
                      {user?.role === 'admin' && (
                        <Link
                          to="/admin"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-colors flex items-center"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <FaTachometerAlt className="mr-2" /> Admin Dashboard
                        </Link>
                      )}
                      {user?.role === 'seller' && (
                        <Link
                          to="/seller"
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-colors flex items-center"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          <FaTachometerAlt className="mr-2" /> Vendor Dashboard
                        </Link>
                      )}
                      <button
                        onClick={() => {
                          handleLogout();
                          setIsUserMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-colors flex items-center"
                      >
                        <FaSignOutAlt className="mr-2" /> Logout
                      </button>
                    </div>
                  )}
                </div>
                
                {/* Name and Role */}
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-medium text-gray-700 max-w-[100px] truncate">
                    {user?.name || user?.firstName || 'User'}
                  </span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold whitespace-nowrap ${
                    user?.role === 'admin' ? 'bg-red-100 text-red-700' :
                    user?.role === 'seller' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {user?.role === 'admin' ? 'Admin' :
                     user?.role === 'seller' ? 'Vendor' :
                     'User'}
                  </span>
                </div>
              </div>
            )}
            
            {/* Login/Register - Desktop only (when not authenticated) */}
            {!isAuthenticated && (
              <>
                <Link to="/login" className="hidden md:block px-3 py-1.5 text-sm text-gray-600 hover:text-primary-600 transition-colors duration-200">
                  Login
                </Link>
                <Link to="/register" className="hidden md:block px-3 py-1.5 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200">
                  Register
                </Link>
              </>
            )}
            
            {/* Mobile Menu Button */}
            <button
              onClick={toggleMobileMenu}
              className="md:hidden p-2 text-gray-600 hover:text-primary-600 focus:outline-none transition-colors duration-200"                                  
              aria-label="Open menu"
            >
              {isMenuOpen ? <FaTimes /> : <FaBars />}
            </button>
          </div>
        </div>
      </div>
      {/* Mobile Search Modal */}
      {isMobileSearchOpen && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-start bg-black bg-opacity-40 transition-opacity duration-300 md:hidden animate-fade-in">
          <div className="w-full bg-white shadow-lg rounded-b-2xl animate-slide-down-smooth p-4 pt-5 relative transition-transform duration-500">
            <form onSubmit={handleSearch} className="w-full">
              <div className="relative group flex items-center">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={handleInputChange}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={handleBlur}
                  autoFocus
                  className="w-full pl-4 pr-12 py-3 border border-gray-200 rounded-full text-base focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-transparent transition-all duration-200 shadow-sm group-focus-within:shadow-md bg-gray-50"
                />
                {/* Close Icon inside input */}
                <button
                  type="button"
                  className="absolute right-10 top-1/2 -translate-y-1/2 bg-white rounded-full p-1 shadow text-gray-500 hover:text-primary-600 focus:outline-none z-20"
                  style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}
                  onClick={() => setIsMobileSearchOpen(false)}
                  aria-label="Close search"
                >
                  <FaTimes size={18} />
                </button>
                {/* Search Icon at far right */}
                <button
                  type="submit"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary-600 transition-colors duration-200 z-10"
                >
                  <FaSearch />
                </button>
              </div>
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
                  {suggestions.map((product) => (
                    <div
                      key={product._id}
                      className="flex items-center px-4 py-2 cursor-pointer hover:bg-primary-50"
                      onMouseDown={() => {
                        handleSuggestionClick(product._id);
                        setIsMobileSearchOpen(false);
                      }}
                    >
                      {product.images && product.images[0]?.url && (
                        <img src={product.images[0].url} alt={product.name} className="w-10 h-10 object-cover rounded mr-3" />
                      )}
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 truncate">{product.name}</div>
                        <div className="text-xs text-gray-500">₹{product.price}</div>
                      </div>
                      {product.numReviews > 0 && (
                        <div className="ml-2 text-xs text-yellow-600">★ {product.numReviews} reviews</div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </form>
          </div>
          {/* Click outside to close */}
          <div className="flex-1 w-full" onClick={() => setIsMobileSearchOpen(false)} />
        </div>
      )}
      {/* Mobile Drawer & Overlay */}
      <div className={`fixed inset-0 z-40 md:hidden transition-all duration-300 ${isMenuOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}> 
        {/* Overlay */}
        <div
          className={`fixed inset-0 bg-black bg-opacity-40 transition-opacity duration-300 ${isMenuOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => setIsMenuOpen(false)}
        />
        {/* Drawer */}
        <aside
          ref={drawerRef}
          className={`fixed top-0 right-0 h-full w-4/5 max-w-xs bg-white shadow-lg z-50 transform transition-transform duration-300 ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
        >
          <div className="flex justify-between items-center px-4 py-4 border-b">
            <span className="text-xl font-bold text-primary-600">Menu</span>
          </div>
          <nav className="flex flex-col space-y-2 px-6 py-6 text-base font-medium">
            <Link to="/" className="nav-link px-2 py-2 rounded hover:bg-primary-50 hover:text-primary-600 transition-colors duration-200" onClick={() => setIsMenuOpen(false)}>Home</Link>
            <Link to="/products" className="nav-link px-2 py-2 rounded hover:bg-primary-50 hover:text-primary-600 transition-colors duration-200" onClick={() => setIsMenuOpen(false)}>Products</Link>
            <Link to="/categories" className="nav-link px-2 py-2 rounded hover:bg-primary-50 hover:text-primary-600 transition-colors duration-200" onClick={() => setIsMenuOpen(false)}>Categories</Link>
            {/* Conditionally render Become a Vendor */}
            {(!isAuthenticated || (user && user.role !== 'seller') || (user && user.role === 'admin')) && (
              <Link to="/vendor-registration" className="nav-link px-2 py-2 rounded hover:bg-primary-50 hover:text-primary-600 transition-colors duration-200" onClick={() => setIsMenuOpen(false)}>Become a Vendor</Link>
            )}
            <Link to="/chat" className="nav-link flex items-center relative px-2 py-2 rounded hover:bg-primary-50 hover:text-primary-600 transition-colors duration-200" onClick={() => setIsMenuOpen(false)}>
              <FaComments className="mr-1" /> Chat
              {totalUnread > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 animate-pulse">{totalUnread}</span>
              )}
            </Link>
            {isAuthenticated && user?.role === 'seller' && (
              <Link to="/seller" className="nav-link px-2 py-2 rounded hover:bg-primary-50 hover:text-primary-600 transition-colors duration-200" onClick={() => setIsMenuOpen(false)}>Seller Dashboard</Link>
            )}
            {isAuthenticated && user?.role === 'admin' && (
              <Link to="/admin" className="nav-link flex items-center px-2 py-2 rounded hover:bg-primary-50 hover:text-primary-600 transition-colors duration-200" onClick={() => setIsMenuOpen(false)}>
                <FaTachometerAlt className="mr-1" /> Admin Dashboard
              </Link>
            )}
            <div className="border-t pt-4 mt-4">
              {isAuthenticated ? (
                <>
                  <Link to="/profile" className="nav-link px-2 py-2 rounded hover:bg-primary-50 hover:text-primary-600 transition-colors duration-200" onClick={() => setIsMenuOpen(false)}>Profile</Link>
                  <button onClick={handleLogout} className="nav-link flex items-center w-full text-left px-2 py-2 rounded hover:bg-primary-50 hover:text-primary-600 transition-colors duration-200">
                    <FaSignOutAlt className="mr-2" /> Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="btn-outline w-full mb-2 text-center px-3 py-2 text-sm" onClick={() => setIsMenuOpen(false)}>Login</Link>
                  <Link to="/register" className="btn-primary w-full text-center px-3 py-2 text-sm" onClick={() => setIsMenuOpen(false)}>Register</Link>
                </>
              )}
            </div>
            
          </nav>
        </aside>
      </div>
    </header>
  );
};

export default Header; 