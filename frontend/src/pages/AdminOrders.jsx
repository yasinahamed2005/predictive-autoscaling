import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, ArrowLeft, Clock, CheckCircle2, Truck, XCircle, Package } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Helmet } from '../components/Helmet';
import AdminRoute from '../components/AdminRoute';
import { formatINR } from '../components/ui/PriceTag';
import { useToast } from '../context/ToastContext';

const initialOrders = [
  {
    id: 'ORD-9821',
    customerName: 'Rahul Sharma',
    customerEmail: 'rahul@example.com',
    date: new Date().toLocaleDateString(),
    total: 2499,
    paymentStatus: 'PAID',
    paymentMethod: 'Razorpay',
    orderStatus: 'Confirmed',
    address: 'Flat 402, Green Valley Apartments, Guntur, AP - 522001',
    items: ['boAt Rockerz 450 Headphones'],
  },
  {
    id: 'ORD-9820',
    customerName: 'Priya Patel',
    customerEmail: 'priya@example.com',
    date: new Date(Date.now() - 86400000).toLocaleDateString(),
    total: 1299,
    paymentStatus: 'PAID',
    paymentMethod: 'Razorpay',
    orderStatus: 'Shipped',
    address: '12-B MG Road, Vijayawada, AP - 520002',
    items: ['Organic Avocados Pack of 4', 'Raw Forest Honey 500g'],
  },
];

const statusOptions = ['Processing', 'Confirmed', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'];

const AdminOrdersContent = () => {
  const showToast = useToast();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem('dukaan_admin_orders');
    if (saved) {
      setOrders(JSON.parse(saved));
    } else {
      setOrders(initialOrders);
      localStorage.setItem('dukaan_admin_orders', JSON.stringify(initialOrders));
    }
  }, []);

  const updateStatus = (orderId, newStatus) => {
    const updated = orders.map((o) => (o.id === orderId ? { ...o, orderStatus: newStatus } : o));
    setOrders(updated);
    localStorage.setItem('dukaan_admin_orders', JSON.stringify(updated));
    showToast(`Order #${orderId} status updated to ${newStatus}`);
  };

  return (
    <>
      <Helmet title="Admin Order Fulfillment — Dukaan" />
      <div className="container-page py-8">
        <div className="flex items-center gap-3 mb-6">
          <Link to="/admin/dashboard" className="p-2 rounded-full hover:bg-ink/5 dark:hover:bg-paper/10 text-ink/70 dark:text-paper/70">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <ShoppingBag size={22} className="text-emerald-500" />
              <h1 className="text-2xl font-display font-extrabold text-ink dark:text-paper">
                Order Fulfillment & Tracking
              </h1>
            </div>
            <p className="text-xs text-ink/60 dark:text-paper/60">
              Manage incoming orders, update shipping tracking status, and process deliveries.
            </p>
          </div>
        </div>

        {/* Orders Table */}
        <div className="card-surface rounded-2xl border border-ink/10 dark:border-paper/10 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-ink/5 dark:bg-paper/5 text-ink/70 dark:text-paper/70 text-xs uppercase tracking-wider font-semibold border-b border-ink/10 dark:border-paper/10">
                <tr>
                  <th className="py-3.5 px-4">Order ID & Date</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Address</th>
                  <th className="py-3.5 px-4">Total</th>
                  <th className="py-3.5 px-4">Payment</th>
                  <th className="py-3.5 px-4">Status Update</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/10 dark:divide-paper/10">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-ink/[0.02] dark:hover:bg-paper/[0.02]">
                    <td className="py-4 px-4 font-semibold text-ink dark:text-paper">
                      <div className="font-mono text-brand-500">#{o.id}</div>
                      <div className="text-xs text-ink/50 dark:text-paper/50">{o.date}</div>
                    </td>
                    <td className="py-4 px-4 text-xs font-medium">
                      <div className="font-bold text-ink dark:text-paper">{o.customerName}</div>
                      <div className="text-ink/50 dark:text-paper/50">{o.customerEmail}</div>
                    </td>
                    <td className="py-4 px-4 text-xs text-ink/70 dark:text-paper/70 max-w-xs truncate">
                      {o.address}
                    </td>
                    <td className="py-4 px-4 text-xs font-mono font-bold text-ink dark:text-paper">
                      {formatINR(o.total)}
                    </td>
                    <td className="py-4 px-4 text-xs">
                      <span className="bg-emerald-500/10 text-emerald-600 font-extrabold px-2.5 py-1 rounded-full">
                        {o.paymentStatus} ({o.paymentMethod || 'Razorpay'})
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <select
                        value={o.orderStatus}
                        onChange={(e) => updateStatus(o.id, e.target.value)}
                        className="bg-ink/[0.04] dark:bg-paper/10 border border-ink/15 dark:border-paper/20 rounded-xl px-2.5 py-1.5 text-xs font-bold text-ink dark:text-paper outline-none cursor-pointer"
                      >
                        {statusOptions.map((st) => (
                          <option key={st} value={st}>{st}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

const AdminOrders = () => (
  <AdminRoute>
    <AdminOrdersContent />
  </AdminRoute>
);

export default AdminOrders;
