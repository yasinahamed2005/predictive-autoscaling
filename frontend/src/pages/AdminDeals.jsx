import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tag, Plus, Edit2, Trash2, CheckCircle2, XCircle, Calendar, Percent, Image, Layers, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Helmet } from '../components/Helmet';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { products as localProducts } from '../data/products';

const API_BASE = 'http://localhost:5000/api/v1';

const AdminDeals = () => {
  const { currentUser } = useAuth();
  const showToast = useToast();
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingDeal, setEditingDeal] = useState(null);

  // Form fields
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    banner: '',
    products: [],
    discountPercentage: 50,
    startDate: new Date().toISOString().slice(0, 10),
    endDate: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString().slice(0, 10),
    isActive: true,
    displayOrder: 1,
  });

  const fetchDeals = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
      const res = await fetch(`${API_BASE}/admin/deals`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data && json.data.length > 0) {
          setDeals(json.data);
          setLoading(false);
          return;
        }
      }
    } catch {
      // Backend fallback
    }

    // Local fallback for storage/demo
    const saved = localStorage.getItem('dukaan_admin_deals');
    if (saved) {
      setDeals(JSON.parse(saved));
    } else {
      const defaultDeals = [
        {
          _id: 'deal-1',
          title: 'Independence Day Mega Sale',
          description: 'Flat 50% OFF on selected products!',
          banner: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&w=800&q=80',
          products: localProducts.slice(0, 4).map((p) => String(p.id)),
          discountPercentage: 50,
          startDate: '2026-08-14',
          endDate: '2026-08-20',
          isActive: true,
          displayOrder: 1,
        },
      ];
      setDeals(defaultDeals);
      localStorage.setItem('dukaan_admin_deals', JSON.stringify(defaultDeals));
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDeals();
  }, []);

  const openCreateModal = () => {
    setEditingDeal(null);
    setFormData({
      title: '',
      description: '',
      banner: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&w=800&q=80',
      products: [String(localProducts[0].id), String(localProducts[1].id)],
      discountPercentage: 50,
      startDate: new Date().toISOString().slice(0, 10),
      endDate: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString().slice(0, 10),
      isActive: true,
      displayOrder: 1,
    });
    setShowModal(true);
  };

  const openEditModal = (deal) => {
    setEditingDeal(deal);
    setFormData({
      title: deal.title || '',
      description: deal.description || '',
      banner: deal.banner || '',
      products: Array.isArray(deal.products) ? deal.products.map((p) => (typeof p === 'object' ? String(p._id || p.id) : String(p))) : [],
      discountPercentage: deal.discountPercentage || 0,
      startDate: deal.startDate ? new Date(deal.startDate).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
      endDate: deal.endDate ? new Date(deal.endDate).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
      isActive: deal.isActive !== undefined ? deal.isActive : true,
      displayOrder: deal.displayOrder || 1,
    });
    setShowModal(true);
  };

  const handleProductToggle = (productId) => {
    setFormData((prev) => {
      const exists = prev.products.includes(productId);
      if (exists) {
        return { ...prev, products: prev.products.filter((id) => id !== productId) };
      } else {
        return { ...prev, products: [...prev.products, productId] };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingDeal ? `${API_BASE}/admin/deals/${editingDeal._id}` : `${API_BASE}/admin/deals`;
      const method = editingDeal ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        const json = await res.json();
        const serverDeal = json.data || formData;
        let updated;
        if (editingDeal) {
          updated = deals.map((d) => (d._id === editingDeal._id ? serverDeal : d));
        } else {
          updated = [serverDeal, ...deals];
        }
        setDeals(updated);
        localStorage.setItem('dukaan_admin_deals', JSON.stringify(updated));
        window.dispatchEvent(new Event('storage'));
        window.dispatchEvent(new CustomEvent('dukaan_deals_updated'));
        showToast(editingDeal ? 'Deal updated & published live!' : 'Deal created & published live!');
        setShowModal(false);
        return;
      }
    } catch {
      // Backend offline, fallback to local state
    }

    // Local fallback update
    let updated;
    if (editingDeal) {
      updated = deals.map((d) => (d._id === editingDeal._id ? { ...formData, _id: editingDeal._id } : d));
    } else {
      const newDeal = { ...formData, _id: `deal-${Date.now()}` };
      updated = [newDeal, ...deals];
    }
    setDeals(updated);
    localStorage.setItem('dukaan_admin_deals', JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new CustomEvent('dukaan_deals_updated'));
    showToast(editingDeal ? 'Deal updated & published live!' : 'Deal created & published live!');
    setShowModal(false);
  };

  const toggleStatus = async (deal) => {
    const newStatus = !deal.isActive;
    try {
      const res = await fetch(`${API_BASE}/admin/deals/${deal._id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: newStatus }),
      });
      if (res.ok) {
        showToast(`Deal ${newStatus ? 'activated' : 'deactivated'}`);
        fetchDeals();
        return;
      }
    } catch {
      // Fallback
    }

    const updated = deals.map((d) => (d._id === deal._id ? { ...d, isActive: newStatus } : d));
    setDeals(updated);
    localStorage.setItem('dukaan_admin_deals', JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
    showToast(`Deal ${newStatus ? 'activated' : 'deactivated'}`);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this deal?')) return;

    try {
      const res = await fetch(`${API_BASE}/admin/deals/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        showToast('Deal deleted');
        fetchDeals();
        return;
      }
    } catch {
      // Fallback
    }

    const updated = deals.filter((d) => d._id !== id);
    setDeals(updated);
    localStorage.setItem('dukaan_admin_deals', JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
    showToast('Deal deleted');
  };

  return (
    <>
      <Helmet title="Admin Deal Management — Dukaan" />
      <div className="container-page py-8 max-w-6xl">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <Link to="/admin/dashboard" className="p-2 rounded-full hover:bg-ink/5 dark:hover:bg-paper/10 text-ink/70 dark:text-paper/70">
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-2xl font-display font-extrabold text-ink dark:text-paper flex items-center gap-2">
                <Tag className="text-saffron-500" size={24} /> Admin Deals & Promotional Banners
              </h1>
              <p className="text-xs text-ink/60 dark:text-paper/60">
                Create, edit, and publish dynamic discount deals on the customer homepage.
              </p>
            </div>
          </div>

          <button
            onClick={openCreateModal}
            className="inline-flex items-center gap-1.5 bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs px-4 py-2.5 rounded-full transition-colors shadow-md"
          >
            <Plus size={16} /> Create New Deal
          </button>
        </div>

        {/* Deals List */}
        {loading ? (
          <div className="card-surface p-12 text-center text-ink/50 dark:text-paper/50 rounded-2xl">
            Loading sales deals...
          </div>
        ) : deals.length === 0 ? (
          <div className="card-surface p-12 text-center rounded-2xl border border-ink/10 dark:border-paper/10 text-ink/50 dark:text-paper/50">
            <Tag size={44} className="mx-auto mb-3 opacity-40 text-saffron-500" />
            <p className="text-sm font-bold mb-1">No deals published yet</p>
            <p className="text-xs mb-4">Click below to create your first promotional sales deal.</p>
            <button
              onClick={openCreateModal}
              className="bg-brand-500 text-white font-bold text-xs px-5 py-2.5 rounded-full"
            >
              + Create First Deal
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {deals.map((deal) => (
              <div
                key={deal._id}
                className={`card-surface rounded-2xl overflow-hidden border transition-all ${
                  deal.isActive
                    ? 'border-saffron-500/40 shadow-sm'
                    : 'border-ink/10 dark:border-paper/10 opacity-70'
                }`}
              >
                {deal.banner && (
                  <div className="h-32 w-full overflow-hidden relative bg-ink/10">
                    <img src={deal.banner} alt={deal.title} className="w-full h-full object-cover" />
                    <span className="absolute top-2 right-2 bg-saffron-500 text-white text-[10px] font-extrabold px-2.5 py-1 rounded-full shadow-md">
                      {deal.discountPercentage}% OFF
                    </span>
                  </div>
                )}

                <div className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-bold text-base text-ink dark:text-paper">{deal.title}</h3>
                      <p className="text-xs text-ink/60 dark:text-paper/60 line-clamp-2 mt-0.5">{deal.description}</p>
                    </div>
                    <button
                      onClick={() => toggleStatus(deal)}
                      className={`text-[11px] font-bold px-2.5 py-1 rounded-full shrink-0 flex items-center gap-1 ${
                        deal.isActive
                          ? 'bg-emerald-500/10 text-emerald-600'
                          : 'bg-ink/10 dark:bg-paper/10 text-ink/50 dark:text-paper/50'
                      }`}
                    >
                      {deal.isActive ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                      {deal.isActive ? 'ACTIVE' : 'INACTIVE'}
                    </button>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-ink/50 dark:text-paper/50 my-3">
                    <span className="flex items-center gap-1">
                      <Calendar size={13} /> {deal.startDate} to {deal.endDate}
                    </span>
                    <span className="flex items-center gap-1">
                      <Layers size={13} /> {deal.products?.length || 0} Products Included
                    </span>
                  </div>

                  <div className="flex justify-end gap-2 pt-3 border-t border-ink/10 dark:border-paper/10">
                    <button
                      onClick={() => openEditModal(deal)}
                      className="p-1.5 rounded-lg hover:bg-ink/5 text-ink/70 dark:text-paper/70 text-xs font-bold flex items-center gap-1"
                    >
                      <Edit2 size={14} /> Edit Deal
                    </button>
                    <button
                      onClick={() => handleDelete(deal._id)}
                      className="p-1.5 rounded-lg hover:bg-rose-500/10 text-rose-500 text-xs font-bold flex items-center gap-1"
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create / Edit Deal Modal */}
        <AnimatePresence>
          {showModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-xl card-surface rounded-2xl p-6 shadow-2xl my-8 max-h-[90vh] overflow-y-auto"
              >
                <h2 className="text-lg font-display font-bold text-ink dark:text-paper mb-4">
                  {editingDeal ? 'Edit Sales Deal' : 'Create New Sales Deal'}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-ink/70 dark:text-paper/70 mb-1">Deal Title</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Festival Mega Sale"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full bg-ink/[0.04] dark:bg-paper/10 border border-ink/15 dark:border-paper/20 rounded-xl px-3 py-2 text-xs text-ink dark:text-paper outline-none focus:ring-1 focus:ring-brand-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-ink/70 dark:text-paper/70 mb-1">Description / Subtitle</label>
                    <input
                      type="text"
                      placeholder="e.g. Flat 50% OFF on customer favorites"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full bg-ink/[0.04] dark:bg-paper/10 border border-ink/15 dark:border-paper/20 rounded-xl px-3 py-2 text-xs text-ink dark:text-paper outline-none focus:ring-1 focus:ring-brand-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-ink/70 dark:text-paper/70 mb-1">Discount %</label>
                      <input
                        type="number"
                        required
                        min="1"
                        max="99"
                        value={formData.discountPercentage}
                        onChange={(e) => setFormData({ ...formData, discountPercentage: Number(e.target.value) })}
                        className="w-full bg-ink/[0.04] dark:bg-paper/10 border border-ink/15 dark:border-paper/20 rounded-xl px-3 py-2 text-xs text-ink dark:text-paper outline-none font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-ink/70 dark:text-paper/70 mb-1">End Date</label>
                      <input
                        type="date"
                        required
                        value={formData.endDate}
                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        className="w-full bg-ink/[0.04] dark:bg-paper/10 border border-ink/15 dark:border-paper/20 rounded-xl px-3 py-2 text-xs text-ink dark:text-paper outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-ink/70 dark:text-paper/70 mb-1">Banner Image URL</label>
                    <input
                      type="text"
                      required
                      value={formData.banner}
                      onChange={(e) => setFormData({ ...formData, banner: e.target.value })}
                      className="w-full bg-ink/[0.04] dark:bg-paper/10 border border-ink/15 dark:border-paper/20 rounded-xl px-3 py-2 text-xs text-ink dark:text-paper outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-ink/70 dark:text-paper/70 mb-1">
                      Select Included Products ({formData.products.length} selected)
                    </label>
                    <div className="max-h-40 overflow-y-auto space-y-1.5 border border-ink/15 dark:border-paper/20 rounded-xl p-2 bg-ink/[0.02]">
                      {localProducts.map((p) => {
                        const pid = String(p.id);
                        const isSelected = formData.products.includes(pid);
                        return (
                          <div
                            key={pid}
                            onClick={() => handleProductToggle(pid)}
                            className={`p-2 rounded-lg text-xs cursor-pointer flex items-center justify-between transition-colors ${
                              isSelected
                                ? 'bg-brand-500 text-white font-bold'
                                : 'hover:bg-ink/5 text-ink dark:text-paper'
                            }`}
                          >
                            <span className="truncate">{p.name}</span>
                            <span className="font-mono text-[11px]">₹{p.price}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="px-4 py-2 rounded-full text-xs font-semibold text-ink/70 dark:text-paper/70 hover:bg-ink/5"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 rounded-full text-xs font-bold bg-brand-500 hover:bg-brand-600 text-white transition-colors"
                    >
                      {editingDeal ? 'Save Deal Changes' : 'Publish Sales Deal'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default AdminDeals;
