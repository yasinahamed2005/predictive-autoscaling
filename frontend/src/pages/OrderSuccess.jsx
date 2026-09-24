import React from 'react';
import { motion } from 'framer-motion';
import { Link, useParams } from 'react-router-dom';
import { CheckCircle2, Package, ShoppingBag, ArrowRight, Truck } from 'lucide-react';
import { Helmet } from '../components/Helmet';
import ProtectedRoute from '../components/ProtectedRoute';

const OrderSuccessContent = () => {
  const { orderId } = useParams();

  const estimatedDelivery = new Date(Date.now() + 3 * 86400000).toLocaleDateString('en-IN', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  return (
    <>
      <Helmet title="Order Placed Successfully — Dukaan" />
      <div className="container-page py-16 max-w-xl text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card-surface p-8 sm:p-10 rounded-2xl border border-emerald-500/30 shadow-2xl space-y-5"
        >
          <div className="w-20 h-20 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <CheckCircle2 size={52} />
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-500/10 px-3 py-1 rounded-full">
              Order Confirmed
            </span>
            <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-ink dark:text-paper mt-3">
              🎉 Order Placed Successfully!
            </h1>
            <p className="text-ink/60 dark:text-paper/60 text-xs sm:text-sm mt-1">
              Thank you for your purchase. We are preparing your package for shipment.
            </p>
          </div>

          <div className="bg-ink/[0.03] dark:bg-paper/5 p-4 rounded-2xl border border-ink/10 dark:border-paper/10 text-left text-xs space-y-2 font-medium">
            <div className="flex justify-between">
              <span className="text-ink/60 dark:text-paper/60">Order Number</span>
              <strong className="font-mono text-brand-500 font-bold">{orderId || 'DKN-98212'}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-ink/60 dark:text-paper/60">Estimated Delivery</span>
              <strong className="text-ink dark:text-paper flex items-center gap-1">
                <Truck size={14} className="text-emerald-500" /> {estimatedDelivery}
              </strong>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/orders"
              className="w-full sm:w-auto bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs px-6 py-3 rounded-full transition-colors flex items-center justify-center gap-1.5 shadow-md"
            >
              <Package size={15} /> Track My Order
            </Link>
            <Link
              to="/products"
              className="w-full sm:w-auto border border-ink/20 dark:border-paper/20 text-ink dark:text-paper hover:bg-ink/5 font-bold text-xs px-6 py-3 rounded-full transition-colors flex items-center justify-center gap-1.5"
            >
              <ShoppingBag size={15} /> Continue Shopping
            </Link>
          </div>
        </motion.div>
      </div>
    </>
  );
};

const OrderSuccess = () => (
  <ProtectedRoute>
    <OrderSuccessContent />
  </ProtectedRoute>
);

export default OrderSuccess;
