import React from 'react';
import { Link } from 'react-router-dom';
import { Package, CheckCircle2, XCircle, Clock, Truck } from 'lucide-react';
import { Helmet } from '../components/Helmet';
import { useAuth } from '../context/AuthContext';
import { formatINR } from '../components/ui/PriceTag';
import ProtectedRoute from '../components/ProtectedRoute';

const statusMeta = {
  Processing: { icon: Clock, color: 'text-amber-600 bg-amber-500/10' },
  Confirmed: { icon: Clock, color: 'text-blue-600 bg-blue-500/10' },
  Shipped: { icon: Truck, color: 'text-indigo-600 bg-indigo-500/10' },
  Completed: { icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-500/10' },
  Delivered: { icon: CheckCircle2, color: 'text-emerald-600 bg-emerald-500/10' },
  Cancelled: { icon: XCircle, color: 'text-rose-500 bg-rose-500/10' },
};

const OrdersContent = () => {
  const { currentUser, updateOrderStatus } = useAuth();
  const activities = currentUser?.activities || [];

  return (
    <>
      <Helmet title="My Orders — Dukaan" />
      <div className="container-page py-8 max-w-3xl">
        <h1 className="text-2xl font-display font-bold text-ink dark:text-paper mb-6">My Orders</h1>
        {activities.length === 0 ? (
          <div className="flex flex-col items-center text-center py-20 card-surface rounded-2xl border border-ink/10 dark:border-paper/10 text-ink/50 dark:text-paper/50">
            <Package size={44} className="mb-3 opacity-40 text-brand-500" />
            <p className="text-base font-bold text-ink dark:text-paper mb-1">You haven't placed any orders yet</p>
            <p className="text-xs mb-4">Discover great products and place your first order today.</p>
            <Link
              to="/products"
              className="bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs px-5 py-2.5 rounded-full transition-colors"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((a) => {
              const meta = statusMeta[a.status] || statusMeta.Processing;
              const Icon = meta.icon;
              return (
                <div key={a.id} className="card-surface p-5 rounded-2xl border border-ink/10 dark:border-paper/10">
                  <div className="flex justify-between items-start gap-3">
                    <div>
                      <h3 className="font-bold text-sm text-ink dark:text-paper">{a.action}</h3>
                      <p className="text-xs text-ink/50 dark:text-paper/50 mt-0.5">
                        Order #{a.id} • {a.date} • {(a.items || []).length || 1} item(s)
                      </p>
                    </div>
                    <span className={`inline-flex items-center gap-1 text-xs font-extrabold px-3 py-1 rounded-full ${meta.color}`}>
                      <Icon size={13} /> {a.status}
                    </span>
                  </div>
                  {a.total != null && (
                    <p className="mt-3 font-mono font-extrabold text-brand-500 text-base">
                      {formatINR(a.total)}
                    </p>
                  )}
                  {a.status === 'Processing' && (
                    <div className="flex gap-3 mt-3 pt-3 border-t border-ink/10 dark:border-paper/10">
                      <button
                        onClick={() => updateOrderStatus(a.id, 'Completed', 'Order Delivered')}
                        className="text-xs font-bold text-emerald-600 hover:underline"
                      >
                        Mark Delivered
                      </button>
                      <button
                        onClick={() => updateOrderStatus(a.id, 'Cancelled', 'Order Cancelled')}
                        className="text-xs font-bold text-rose-500 hover:underline"
                      >
                        Cancel Order
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
};

const Orders = () => (
  <ProtectedRoute>
    <OrdersContent />
  </ProtectedRoute>
);

export default Orders;
