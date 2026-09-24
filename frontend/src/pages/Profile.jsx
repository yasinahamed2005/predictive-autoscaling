import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Package, LogOut, Heart, MapPin, User, ShieldCheck, Settings, Key, Tag } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from '../components/Helmet';
import { useAuth } from '../context/AuthContext';
import { formatINR } from '../components/ui/PriceTag';
import AddressBook from '../components/profile/AddressBook';
import ProtectedRoute from '../components/ProtectedRoute';

const ProfileContent = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  const activities = currentUser?.activities || [];

  const stats = useMemo(() => {
    const completed = activities.filter((a) => a.status === 'Completed');
    const totalSpent = completed.reduce((sum, o) => sum + (o.total || 0), 0);
    return {
      totalSpent,
      totalOrders: activities.length,
      completed: completed.length,
      pending: activities.filter((a) => a.status === 'Processing').length,
    };
  }, [activities]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isAdmin = currentUser?.role === 'admin' || currentUser?.email === 'admin@dukaan.com' || currentUser?.email === 'admin@dukaan.example';

  return (
    <>
      <Helmet title="My Account — Dukaan" />
      <div className="container-page py-8 max-w-5xl">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="grid md:grid-cols-4 gap-6">
          {/* User Sidebar */}
          <div className="md:col-span-1 card-surface p-5 rounded-2xl border border-ink/10 dark:border-paper/10 h-fit sticky top-24 space-y-4">
            <div className="text-center">
              <div className="w-20 h-20 rounded-full mx-auto mb-3 flex items-center justify-center text-2xl font-extrabold text-white bg-gradient-to-br from-brand-500 to-brand-700 shadow-md">
                {currentUser?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <h2 className="text-base font-display font-extrabold text-ink dark:text-paper">{currentUser?.name}</h2>
              <p className="text-xs text-ink/50 dark:text-paper/50 truncate mb-1">{currentUser?.email}</p>
              {isAdmin && (
                <span className="inline-block bg-brand-500 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full mb-2">
                  Admin Account
                </span>
              )}
            </div>

            {/* Navigation Tabs */}
            <nav className="space-y-1 pt-2 border-t border-ink/10 dark:border-paper/10 text-xs font-semibold">
              <button
                onClick={() => setActiveTab('overview')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-colors ${
                  activeTab === 'overview' ? 'bg-brand-500 text-white font-bold' : 'hover:bg-ink/5 text-ink/80 dark:text-paper/80'
                }`}
              >
                <User size={15} /> Overview
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-colors ${
                  activeTab === 'orders' ? 'bg-brand-500 text-white font-bold' : 'hover:bg-ink/5 text-ink/80 dark:text-paper/80'
                }`}
              >
                <Package size={15} /> My Orders
              </button>
              <button
                onClick={() => setActiveTab('addresses')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl transition-colors ${
                  activeTab === 'addresses' ? 'bg-brand-500 text-white font-bold' : 'hover:bg-ink/5 text-ink/80 dark:text-paper/80'
                }`}
              >
                <MapPin size={15} /> Address Book
              </button>
              <Link
                to="/wishlist"
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-ink/80 dark:text-paper/80 hover:bg-ink/5 transition-colors"
              >
                <Heart size={15} /> Wishlist
              </Link>
              {isAdmin && (
                <Link
                  to="/admin/deals"
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-brand-500 font-bold hover:bg-brand-500/10 transition-colors"
                >
                  <Tag size={15} /> Admin Deals
                </Link>
              )}
            </nav>

            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 bg-rose-500/10 text-rose-500 py-2.5 rounded-xl font-bold text-xs hover:bg-rose-500/20 transition-colors"
            >
              <LogOut size={15} /> Sign Out
            </button>
          </div>

          {/* Tab Main Content */}
          <div className="md:col-span-3 space-y-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-3 gap-3 sm:gap-4">
                  <div className="card-surface p-4 rounded-2xl border border-ink/10 dark:border-paper/10 text-center">
                    <p className="text-xs text-ink/50 dark:text-paper/50 mb-1">Total Spent</p>
                    <p className="font-mono font-extrabold text-ink dark:text-paper text-sm sm:text-base">
                      {formatINR(stats.totalSpent)}
                    </p>
                  </div>
                  <div className="card-surface p-4 rounded-2xl border border-ink/10 dark:border-paper/10 text-center">
                    <p className="text-xs text-ink/50 dark:text-paper/50 mb-1">Total Orders</p>
                    <p className="font-extrabold text-ink dark:text-paper text-base sm:text-lg">
                      {stats.totalOrders}
                    </p>
                  </div>
                  <div className="card-surface p-4 rounded-2xl border border-ink/10 dark:border-paper/10 text-center">
                    <p className="text-xs text-ink/50 dark:text-paper/50 mb-1">Pending Delivery</p>
                    <p className="font-extrabold text-marigold-600 text-base sm:text-lg">
                      {stats.pending}
                    </p>
                  </div>
                </div>

                {/* Account Details */}
                <div className="card-surface p-6 rounded-2xl border border-ink/10 dark:border-paper/10 space-y-4">
                  <h3 className="text-base font-display font-bold text-ink dark:text-paper">
                    Personal Information
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <span className="text-ink/50 dark:text-paper/50 block mb-0.5">Full Name</span>
                      <strong className="text-ink dark:text-paper text-sm">{currentUser?.name}</strong>
                    </div>
                    <div>
                      <span className="text-ink/50 dark:text-paper/50 block mb-0.5">Email Address</span>
                      <strong className="text-ink dark:text-paper text-sm">{currentUser?.email}</strong>
                    </div>
                    <div>
                      <span className="text-ink/50 dark:text-paper/50 block mb-0.5">Mobile Number</span>
                      <strong className="text-ink dark:text-paper text-sm">{currentUser?.phone || '+91 9876543210'}</strong>
                    </div>
                    <div>
                      <span className="text-ink/50 dark:text-paper/50 block mb-0.5">Account Status</span>
                      <span className="inline-flex items-center gap-1 text-emerald-600 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full">
                        <ShieldCheck size={13} /> Active & Verified
                      </span>
                    </div>
                  </div>
                </div>

                <AddressBook />
              </div>
            )}

            {activeTab === 'orders' && (
              <div className="card-surface p-6 rounded-2xl border border-ink/10 dark:border-paper/10">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-display font-bold">My Order History</h3>
                  <Link to="/orders" className="text-xs font-bold text-brand-500 hover:underline">
                    View Full Order Tracking
                  </Link>
                </div>
                <AddressBook />
              </div>
            )}

            {activeTab === 'addresses' && <AddressBook />}
          </div>
        </motion.div>
      </div>
    </>
  );
};

const Profile = () => (
  <ProtectedRoute>
    <ProfileContent />
  </ProtectedRoute>
);

export default Profile;
