import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider, useToast } from './context/ToastContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { AuthProvider } from './context/AuthContext';
import { RecentlyViewedProvider } from './context/RecentlyViewedContext';
import { ComparisonProvider } from './context/ComparisonContext';

import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import MobileBottomNav from './components/layout/MobileBottomNav';
import CartSidebar from './components/CartSidebar';
import ComparisonModal from './components/ComparisonModal';
import ErrorBoundary from './components/ErrorBoundary';
import { SystemHealthGuard } from './components/SystemHealthGuard';
import { PageSkeleton } from './components/ui/Skeleton';
import { useScrollToTop } from './hooks/useScrollToTop';

// Route-level code splitting: each page loads on demand instead of
// bloating the initial bundle.
const Home = lazy(() => import('./pages/Home'));
const Products = lazy(() => import('./pages/Products'));
const ProductDetails = lazy(() => import('./pages/ProductDetails'));
const Search = lazy(() => import('./pages/Search'));
const Wishlist = lazy(() => import('./pages/Wishlist'));
const Cart = lazy(() => import('./pages/Cart'));
const Checkout = lazy(() => import('./pages/Checkout'));
const OrderSuccess = lazy(() => import('./pages/OrderSuccess'));
const Orders = lazy(() => import('./pages/Orders'));
const Profile = lazy(() => import('./pages/Profile'));
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const OTPVerification = lazy(() => import('./pages/OTPVerification'));
const About = lazy(() => import('./pages/About'));
const Contact = lazy(() => import('./pages/Contact'));
const Help = lazy(() => import('./pages/Help'));

// Admin pages
const AdminLogin = lazy(() => import('./pages/AdminLogin'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const AdminProducts = lazy(() => import('./pages/AdminProducts'));
const AdminOrders = lazy(() => import('./pages/AdminOrders'));
const AdminDeals = lazy(() => import('./pages/AdminDeals'));
const NotFound = lazy(() => import('./pages/NotFound'));

const AppShell = () => {
  useScrollToTop();
  return (
    <div className="min-h-screen flex flex-col bg-paper dark:bg-ink text-ink dark:text-paper transition-colors">
      <a href="#main-content" className="sr-only-focusable fixed top-2 left-2 z-[100] bg-brand-500 text-white px-4 py-2 rounded-full">
        Skip to content
      </a>
      <Navbar />
      <CartSidebar />
      <ComparisonModal />
      <main id="main-content" className="flex-1 pb-16 md:pb-0">
        <ErrorBoundary>
          <Suspense fallback={<PageSkeleton />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/products" element={<Products />} />
              <Route path="/product/:id" element={<ProductDetails />} />
              <Route path="/search" element={<Search />} />
              <Route path="/wishlist" element={<Wishlist />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/order-success/:orderId" element={<OrderSuccess />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/otp-verification" element={<OTPVerification />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/help" element={<Help />} />

              {/* Admin Routes */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/products" element={<AdminProducts />} />
              <Route path="/admin/orders" element={<AdminOrders />} />
              <Route path="/admin/deals" element={<AdminDeals />} />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
};

// Bridges the toast context into providers that need to fire toasts
// (cart/wishlist/auth/comparison) without those providers importing ToastContext directly.
const ProvidersWithToast = ({ children }) => {
  const showToast = useToast();
  return (
    <AuthProvider onToast={showToast}>
      <CartProvider onToast={showToast}>
        <WishlistProvider onToast={showToast}>
          <ComparisonProvider onToast={showToast}>
            <RecentlyViewedProvider>
              {children}
            </RecentlyViewedProvider>
          </ComparisonProvider>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
};

function App() {
  return (
    <ThemeProvider>
      <Router>
        <ToastProvider>
          <ProvidersWithToast>
            <ErrorBoundary>
              <SystemHealthGuard>
                <AppShell />
              </SystemHealthGuard>
            </ErrorBoundary>
          </ProvidersWithToast>
        </ToastProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
