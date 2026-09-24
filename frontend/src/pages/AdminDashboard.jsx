import React from 'react';
import { motion } from 'framer-motion';
import { LayoutDashboard, Package, ShoppingBag, Users, Tag, AlertTriangle, ArrowRight, TrendingUp, DollarSign } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Helmet } from '../components/Helmet';
import { products } from '../data/products';
import AdminRoute from '../components/AdminRoute';
import { formatINR } from '../components/ui/PriceTag';

const AdminDashboardContent = () => {
  const totalProducts = products.length;
  const lowStockProducts = products.filter((p) => (p.stock || 25) <= 10).length;
  const outOfStockProducts = products.filter((p) => (p.stock || 25) <= 0).length;

  return (
    <>
      <Helmet title="Admin Dashboard — Dukaan Store Control" />
      <div className="container-page py-8">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2">
              <LayoutDashboard className="text-brand-500" size={24} />
              <h1 className="text-2xl font-display font-extrabold text-ink dark:text-paper">Store Overview Dashboard</h1>
            </div>
            <p className="text-xs text-ink/60 dark:text-paper/60">
              Real-time monitoring of products, orders, sales analytics, and dynamic promotional deals.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/admin/products"
              className="bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs px-4 py-2.5 rounded-full transition-colors shadow-sm"
            >
              Manage Products
            </Link>
            <Link
              to="/admin/deals"
              className="bg-saffron-500 hover:bg-saffron-600 text-white font-bold text-xs px-4 py-2.5 rounded-full transition-colors shadow-sm"
            >
              Manage Deals
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="card-surface p-5 rounded-2xl border border-ink/10 dark:border-paper/10">
            <div className="flex items-center justify-between text-ink/50 dark:text-paper/50 mb-2">
              <span className="text-xs font-semibold">Total Revenue</span>
              <DollarSign size={18} className="text-emerald-500" />
            </div>
            <p className="text-2xl font-mono font-extrabold text-ink dark:text-paper">
              {formatINR(148920)}
            </p>
            <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1 mt-1">
              <TrendingUp size={12} /> +18.4% this month
            </span>
          </div>

          <div className="card-surface p-5 rounded-2xl border border-ink/10 dark:border-paper/10">
            <div className="flex items-center justify-between text-ink/50 dark:text-paper/50 mb-2">
              <span className="text-xs font-semibold">Total Orders</span>
              <ShoppingBag size={18} className="text-brand-500" />
            </div>
            <p className="text-2xl font-extrabold text-ink dark:text-paper">
              342
            </p>
            <span className="text-[11px] font-bold text-ink/50 dark:text-paper/50 mt-1 block">
              12 pending delivery
            </span>
          </div>

          <div className="card-surface p-5 rounded-2xl border border-ink/10 dark:border-paper/10">
            <div className="flex items-center justify-between text-ink/50 dark:text-paper/50 mb-2">
              <span className="text-xs font-semibold">Active Products</span>
              <Package size={18} className="text-indigo-500" />
            </div>
            <p className="text-2xl font-extrabold text-ink dark:text-paper">
              {totalProducts}
            </p>
            <span className="text-[11px] font-bold text-amber-600 flex items-center gap-1 mt-1">
              <AlertTriangle size={12} /> {lowStockProducts} low stock items
            </span>
          </div>

          <div className="card-surface p-5 rounded-2xl border border-ink/10 dark:border-paper/10">
            <div className="flex items-center justify-between text-ink/50 dark:text-paper/50 mb-2">
              <span className="text-xs font-semibold">Registered Users</span>
              <Users size={18} className="text-marigold-500" />
            </div>
            <p className="text-2xl font-extrabold text-ink dark:text-paper">
              1,280
            </p>
            <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1 mt-1">
              <TrendingUp size={12} /> +45 new today
            </span>
          </div>
        </div>

        {/* Admin Quick Action Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          <Link
            to="/admin/products"
            className="card-surface p-6 rounded-2xl border border-ink/10 dark:border-paper/10 hover:border-brand-500 transition-all group"
          >
            <Package size={28} className="text-brand-500 mb-3" />
            <h3 className="text-base font-bold text-ink dark:text-paper mb-1 flex items-center justify-between">
              <span>Product Inventory</span>
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </h3>
            <p className="text-xs text-ink/60 dark:text-paper/60 leading-relaxed">
              Add new products, adjust stock levels, set sale prices, and perform bulk CSV imports.
            </p>
          </Link>

          <Link
            to="/admin/deals"
            className="card-surface p-6 rounded-2xl border border-ink/10 dark:border-paper/10 hover:border-saffron-500 transition-all group"
          >
            <Tag size={28} className="text-saffron-500 mb-3" />
            <h3 className="text-base font-bold text-ink dark:text-paper mb-1 flex items-center justify-between">
              <span>Deals & Offers</span>
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </h3>
            <p className="text-xs text-ink/60 dark:text-paper/60 leading-relaxed">
              Publish dynamic promotional banners, set deal countdown timers, and control customer homepage offers.
            </p>
          </Link>

          <Link
            to="/admin/orders"
            className="card-surface p-6 rounded-2xl border border-ink/10 dark:border-paper/10 hover:border-emerald-500 transition-all group"
          >
            <ShoppingBag size={28} className="text-emerald-500 mb-3" />
            <h3 className="text-base font-bold text-ink dark:text-paper mb-1 flex items-center justify-between">
              <span>Order Fulfillment</span>
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </h3>
            <p className="text-xs text-ink/60 dark:text-paper/60 leading-relaxed">
              Manage incoming customer orders, update tracking status (Confirmed, Packed, Shipped, Delivered), and process returns.
            </p>
          </Link>
        </div>
      </div>
    </>
  );
};

const AdminDashboard = () => (
  <AdminRoute>
    <AdminDashboardContent />
  </AdminRoute>
);

export default AdminDashboard;
