import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingCart, Heart, Search, Menu, X, Sun, Moon, User, ChevronDown, MapPin, LogOut, Package, Tag, ShieldCheck, Settings
} from 'lucide-react';
import MegaMenu from './MegaMenu';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { products } from '../../data/products';
import { categories } from '../../data/categories';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [suggestOpen, setSuggestOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const searchRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const { cartCount, setIsCartOpen } = useCart();
  const { wishlistCount } = useWishlist();
  const { currentUser, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const isAdmin = currentUser?.role === 'admin' || currentUser?.email === 'admin@dukaan.com' || currentUser?.email === 'admin@dukaan.example';

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) setSuggestOpen(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setUserMenuOpen(false);
    setMegaOpen(false);
  }, [location.pathname]);

  const suggestions = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    return products.filter((p) => p.name.toLowerCase().includes(q)).slice(0, 6);
  }, [query]);

  const submitSearch = (e) => {
    e?.preventDefault();
    setSuggestOpen(false);
    navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <header
      className={`sticky top-0 z-50 bg-white/95 dark:bg-ink/95 backdrop-blur border-b transition-shadow ${
        scrolled ? 'border-ink/10 dark:border-paper/10 shadow-sm' : 'border-transparent'
      }`}
    >
      {/* Top utility bar */}
      <div className="hidden md:block bg-brand-800 text-brand-100 text-xs">
        <div className="container-page flex justify-between items-center py-1.5">
          <span className="flex items-center gap-1">
            <MapPin size={12} /> Deliver to India — Fast 24-48h shipping available
          </span>
          <span>Free delivery on orders above ₹499 | Easy 7-day returns</span>
        </div>
      </div>

      <div className="container-page flex items-center gap-3 py-3">
        {/* Mobile menu toggle */}
        <button
          className="md:hidden p-2 -ml-2 text-ink dark:text-paper"
          onClick={() => setMobileOpen((o) => !o)}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>

        <Link to="/" className="flex items-center gap-2 shrink-0">
          <span className="w-9 h-9 rounded-xl bg-brand-500 text-white flex items-center justify-center font-display font-extrabold text-lg shadow-sm">
            D
          </span>
          <span className="hidden sm:block text-xl font-display font-extrabold text-ink dark:text-paper">
            Dukaan
          </span>
        </Link>

        {/* Search Bar */}
        <form onSubmit={submitSearch} ref={searchRef} className="relative flex-1 max-w-2xl mx-1 sm:mx-4">
          <div className="flex items-center bg-ink/[0.04] dark:bg-paper/10 rounded-full px-4 py-2 focus-within:ring-2 focus-within:ring-brand-500">
            <Search size={18} className="text-ink/40 dark:text-paper/40 shrink-0" />
            <input
              type="search"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSuggestOpen(true);
              }}
              onFocus={() => setSuggestOpen(true)}
              placeholder="Search for products, brands, groceries..."
              aria-label="Search products"
              className="w-full bg-transparent outline-none px-2.5 text-sm text-ink dark:text-paper placeholder:text-ink/40 dark:placeholder:text-paper/40"
            />
          </div>
          <AnimatePresence>
            {suggestOpen && suggestions.length > 0 && (
              <motion.ul
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="absolute mt-2 w-full bg-white dark:bg-ink-soft border border-ink/10 dark:border-paper/10 rounded-xl shadow-card-hover overflow-hidden z-50"
                role="listbox"
              >
                {suggestions.map((p) => (
                  <li key={p.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setQuery(p.name);
                        setSuggestOpen(false);
                        navigate(`/product/${p.id}`);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-ink/5 dark:hover:bg-paper/10 text-sm"
                    >
                      <img src={p.image} alt="" className="w-8 h-8 rounded object-cover" />
                      <span className="text-ink dark:text-paper line-clamp-1">{p.name}</span>
                    </button>
                  </li>
                ))}
              </motion.ul>
            )}
          </AnimatePresence>
        </form>

        {/* Right icons */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-ink/5 dark:hover:bg-paper/10 text-ink dark:text-paper"
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {/* User Profile Menu */}
          <div className="relative hidden sm:block">
            <button
              onClick={() => setUserMenuOpen((o) => !o)}
              className="flex items-center gap-1 p-2 rounded-full hover:bg-ink/5 dark:hover:bg-paper/10 text-ink dark:text-paper"
              aria-haspopup="menu"
              aria-expanded={userMenuOpen}
            >
              <User size={20} />
              <ChevronDown size={14} />
            </button>
            <AnimatePresence>
              {userMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  role="menu"
                  className="absolute right-0 mt-2 w-56 bg-white dark:bg-ink-soft border border-ink/10 dark:border-paper/10 rounded-xl shadow-card-hover overflow-hidden z-50"
                >
                  {currentUser ? (
                    <>
                      <div className="px-4 py-3 border-b border-ink/10 dark:border-paper/10 bg-ink/[0.02]">
                        <p className="text-sm font-bold text-ink dark:text-paper">Hi, {currentUser.name}</p>
                        <p className="text-xs text-ink/50 dark:text-paper/50 line-clamp-1">{currentUser.email}</p>
                        {isAdmin && (
                          <span className="inline-block bg-brand-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full mt-1">
                            Admin Account
                          </span>
                        )}
                      </div>
                      <Link to="/profile" className="flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-ink/5 dark:hover:bg-paper/10 font-semibold">
                        <User size={15} /> My Profile
                      </Link>
                      <Link to="/orders" className="flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-ink/5 dark:hover:bg-paper/10 font-semibold">
                        <Package size={15} /> My Orders
                      </Link>
                      <Link to="/wishlist" className="flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-ink/5 dark:hover:bg-paper/10 font-semibold">
                        <Heart size={15} /> Wishlist
                      </Link>
                      {isAdmin && (
                        <Link to="/admin/dashboard" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-brand-500 font-bold hover:bg-brand-500/10">
                          <ShieldCheck size={15} /> Admin Dashboard
                        </Link>
                      )}
                      <button onClick={logout} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-rose-500 font-bold hover:bg-rose-500/10">
                        <LogOut size={15} /> Logout
                      </button>
                    </>
                  ) : (
                    <div className="p-3 space-y-2">
                      <Link to="/login" className="block text-center bg-brand-500 hover:bg-brand-600 text-white rounded-full py-2 text-sm font-bold shadow-sm">
                        Login
                      </Link>
                      <Link to="/signup" className="block text-center border border-ink/15 dark:border-paper/20 rounded-full py-2 text-sm font-bold text-ink dark:text-paper hover:bg-ink/5">
                        Create Account
                      </Link>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Wishlist */}
          <Link to="/wishlist" className="relative p-2 rounded-full hover:bg-ink/5 dark:hover:bg-paper/10 text-ink dark:text-paper" aria-label={`Wishlist, ${wishlistCount} items`}>
            <Heart size={20} />
            {wishlistCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-rose-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {wishlistCount}
              </span>
            )}
          </Link>

          {/* Cart */}
          <button onClick={() => setIsCartOpen(true)} className="relative p-2 rounded-full hover:bg-ink/5 dark:hover:bg-paper/10 text-ink dark:text-paper" aria-label={`Cart, ${cartCount} items`}>
            <ShoppingCart size={20} />
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-brand-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Desktop Navigation & Category Bar */}
      <div className="hidden md:block relative border-t border-ink/5 dark:border-paper/5">
        <div className="container-page flex items-center gap-6 py-2.5 text-sm font-medium text-ink/80 dark:text-paper/80">
          <button
            onClick={() => setMegaOpen((o) => !o)}
            onMouseEnter={() => setMegaOpen(true)}
            className="flex items-center gap-1.5 hover:text-brand-500 font-bold text-ink dark:text-paper transition-colors cursor-pointer"
          >
            <Menu size={16} /> All Categories <ChevronDown size={14} />
          </button>
          {categories.slice(0, 6).map((c) => (
            <Link key={c.id} to={`/products?category=${c.id}`} className="hover:text-brand-500 whitespace-nowrap transition-colors">
              {c.name}
            </Link>
          ))}
          {isAdmin && (
            <Link to="/admin/dashboard" className="ml-auto text-xs font-extrabold bg-brand-500/10 text-brand-500 px-3 py-1 rounded-full hover:bg-brand-500 hover:text-white transition-colors flex items-center gap-1">
              <Tag size={13} /> Admin Portal
            </Link>
          )}
        </div>

        <MegaMenu open={megaOpen} onClose={() => setMegaOpen(false)} />
      </div>

      {/* Mobile Accordion Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden overflow-hidden border-t border-ink/10 dark:border-paper/10 bg-white dark:bg-ink"
          >
            <div className="container-page py-4 space-y-2">
              <p className="text-xs font-bold uppercase text-ink/40 dark:text-paper/40">Categories</p>
              {categories.map((c) => (
                <Link key={c.id} to={`/products?category=${c.id}`} className="block py-1.5 text-sm font-semibold text-ink dark:text-paper hover:text-brand-500">
                  {c.name}
                </Link>
              ))}

              <div className="border-t border-ink/10 dark:border-paper/10 pt-3 mt-3 space-y-2">
                {currentUser ? (
                  <>
                    <Link to="/profile" className="block py-1.5 text-sm font-semibold">My Profile</Link>
                    <Link to="/orders" className="block py-1.5 text-sm font-semibold">My Orders</Link>
                    <Link to="/wishlist" className="block py-1.5 text-sm font-semibold">Wishlist</Link>
                    {isAdmin && (
                      <Link to="/admin/dashboard" className="block py-1.5 text-sm font-bold text-brand-500">
                        Admin Dashboard
                      </Link>
                    )}
                    <button onClick={logout} className="block py-1.5 text-sm font-bold text-rose-500">
                      Logout
                    </button>
                  </>
                ) : (
                  <div className="flex gap-2 pt-2">
                    <Link to="/login" className="flex-1 text-center bg-brand-500 text-white rounded-full py-2 text-sm font-bold">
                      Login
                    </Link>
                    <Link to="/signup" className="flex-1 text-center border border-ink/15 dark:border-paper/20 rounded-full py-2 text-sm font-bold text-ink dark:text-paper">
                      Create Account
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
