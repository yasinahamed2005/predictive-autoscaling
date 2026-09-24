import React, { useState } from 'react';
import { MapPin, Plus, Edit2, Trash2, CheckCircle2, Home as HomeIcon, Briefcase, Bookmark } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';

const labelIcons = {
  Home: HomeIcon,
  Work: Briefcase,
  Other: Bookmark,
};

const AddressBook = () => {
  const { currentUser, addAddress, updateAddress, deleteAddress, setDefaultAddress } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);

  const [formData, setFormData] = useState({
    label: 'Home',
    fullName: '',
    phone: '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    pincode: '',
  });

  const addresses = currentUser?.addresses || [];

  const openCreateModal = () => {
    setEditingAddress(null);
    setFormData({
      label: 'Home',
      fullName: currentUser?.name || '',
      phone: currentUser?.phone || '',
      line1: '',
      line2: '',
      city: '',
      state: '',
      pincode: '',
    });
    setShowModal(true);
  };

  const openEditModal = (addr) => {
    setEditingAddress(addr);
    setFormData({
      label: addr.label || 'Home',
      fullName: addr.fullName || '',
      phone: addr.phone || '',
      line1: addr.line1 || '',
      line2: addr.line2 || '',
      city: addr.city || '',
      state: addr.state || '',
      pincode: addr.pincode || '',
    });
    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingAddress) {
      updateAddress(editingAddress._id || editingAddress.id, formData);
    } else {
      addAddress(formData);
    }
    setShowModal(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-display font-bold text-ink dark:text-paper">My Saved Addresses</h3>
          <p className="text-xs text-ink/60 dark:text-paper/60">
            Manage your delivery addresses for fast checkout.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-1.5 bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold px-3.5 py-2 rounded-full transition-colors shadow-sm"
        >
          <Plus size={15} /> Add New Address
        </button>
      </div>

      {addresses.length === 0 ? (
        <div className="card-surface rounded-2xl p-8 text-center border border-ink/10 dark:border-paper/10 text-ink/50 dark:text-paper/50">
          <MapPin size={36} className="mx-auto mb-2 opacity-40" />
          <p className="text-sm font-semibold mb-1">No saved addresses yet</p>
          <p className="text-xs mb-4">Add your home or work address for quicker order delivery.</p>
          <button
            onClick={openCreateModal}
            className="text-xs font-bold text-brand-500 hover:underline"
          >
            + Add address now
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {addresses.map((addr) => {
            const addrId = addr._id || addr.id;
            const Icon = labelIcons[addr.label] || MapPin;
            return (
              <div
                key={addrId}
                className={`card-surface rounded-2xl p-4 border transition-all ${
                  addr.isDefault
                    ? 'border-brand-500 shadow-md bg-brand-500/[0.02]'
                    : 'border-ink/10 dark:border-paper/10 hover:border-ink/30'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="inline-flex items-center gap-1.5 bg-ink/5 dark:bg-paper/10 text-ink dark:text-paper text-xs font-bold px-2.5 py-1 rounded-full">
                    <Icon size={13} className="text-brand-500" /> {addr.label}
                  </span>
                  {addr.isDefault && (
                    <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <CheckCircle2 size={11} /> Default
                    </span>
                  )}
                </div>

                <h4 className="text-sm font-bold text-ink dark:text-paper">{addr.fullName}</h4>
                <p className="text-xs text-ink/70 dark:text-paper/70 mt-1 leading-relaxed">
                  {addr.line1} {addr.line2 ? `, ${addr.line2}` : ''}<br />
                  {addr.city}, {addr.state} - <strong>{addr.pincode}</strong>
                </p>
                <p className="text-xs text-ink/50 dark:text-paper/50 mt-1">Phone: {addr.phone}</p>

                <div className="flex items-center justify-between pt-3 mt-3 border-t border-ink/10 dark:border-paper/10 text-xs">
                  {!addr.isDefault && (
                    <button
                      onClick={() => setDefaultAddress(addrId)}
                      className="text-xs font-semibold text-brand-500 hover:underline"
                    >
                      Set as default
                    </button>
                  )}
                  <div className="flex items-center gap-2 ml-auto">
                    <button
                      onClick={() => openEditModal(addr)}
                      className="p-1 rounded text-ink/60 dark:text-paper/60 hover:text-brand-500"
                      title="Edit address"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => deleteAddress(addrId)}
                      className="p-1 rounded text-rose-500 hover:bg-rose-500/10"
                      title="Delete address"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Address Form Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg card-surface rounded-2xl p-6 shadow-2xl my-8"
            >
              <h3 className="text-lg font-display font-bold text-ink dark:text-paper mb-4">
                {editingAddress ? 'Edit Delivery Address' : 'Add Delivery Address'}
              </h3>

              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="flex items-center gap-3 mb-2">
                  {['Home', 'Work', 'Other'].map((lbl) => (
                    <button
                      type="button"
                      key={lbl}
                      onClick={() => setFormData({ ...formData, label: lbl })}
                      className={`flex-1 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
                        formData.label === lbl
                          ? 'bg-brand-500 text-white border-brand-500'
                          : 'border-ink/15 dark:border-paper/20 text-ink dark:text-paper hover:bg-ink/5'
                      }`}
                    >
                      {lbl}
                    </button>
                  ))}
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-ink/70 dark:text-paper/70 mb-0.5">Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="Receiver's name"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full bg-ink/[0.04] dark:bg-paper/10 border border-ink/15 dark:border-paper/20 rounded-xl px-3 py-2 text-xs text-ink dark:text-paper outline-none focus:ring-1 focus:ring-brand-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-ink/70 dark:text-paper/70 mb-0.5">Mobile Number</label>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      placeholder="10-digit number"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full bg-ink/[0.04] dark:bg-paper/10 border border-ink/15 dark:border-paper/20 rounded-xl px-3 py-2 text-xs text-ink dark:text-paper outline-none focus:ring-1 focus:ring-brand-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-ink/70 dark:text-paper/70 mb-0.5">Flat, House No., Building</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Flat 302, Green Acres"
                    value={formData.line1}
                    onChange={(e) => setFormData({ ...formData, line1: e.target.value })}
                    className="w-full bg-ink/[0.04] dark:bg-paper/10 border border-ink/15 dark:border-paper/20 rounded-xl px-3 py-2 text-xs text-ink dark:text-paper outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-ink/70 dark:text-paper/70 mb-0.5">Street, Area, Colony</label>
                  <input
                    type="text"
                    placeholder="e.g. MG Road, Near Central Mall"
                    value={formData.line2}
                    onChange={(e) => setFormData({ ...formData, line2: e.target.value })}
                    className="w-full bg-ink/[0.04] dark:bg-paper/10 border border-ink/15 dark:border-paper/20 rounded-xl px-3 py-2 text-xs text-ink dark:text-paper outline-none focus:ring-1 focus:ring-brand-500"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-ink/70 dark:text-paper/70 mb-0.5">City</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Guntur"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full bg-ink/[0.04] dark:bg-paper/10 border border-ink/15 dark:border-paper/20 rounded-xl px-3 py-2 text-xs text-ink dark:text-paper outline-none focus:ring-1 focus:ring-brand-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-ink/70 dark:text-paper/70 mb-0.5">State</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. AP"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      className="w-full bg-ink/[0.04] dark:bg-paper/10 border border-ink/15 dark:border-paper/20 rounded-xl px-3 py-2 text-xs text-ink dark:text-paper outline-none focus:ring-1 focus:ring-brand-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-ink/70 dark:text-paper/70 mb-0.5">Pincode</label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      placeholder="522001"
                      value={formData.pincode}
                      onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                      className="w-full bg-ink/[0.04] dark:bg-paper/10 border border-ink/15 dark:border-paper/20 rounded-xl px-3 py-2 text-xs font-mono text-ink dark:text-paper outline-none focus:ring-1 focus:ring-brand-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3">
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
                    Save Address
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AddressBook;
