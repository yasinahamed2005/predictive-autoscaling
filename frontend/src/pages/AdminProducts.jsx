import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Package, Plus, Edit2, Trash2, FileSpreadsheet, Upload, CheckCircle2, AlertCircle, ArrowLeft, Tag, Search, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Helmet } from '../components/Helmet';
import AdminRoute from '../components/AdminRoute';
import ImageWithFallback from '../components/ui/ImageWithFallback';
import { useToast } from '../context/ToastContext';
import { products as initialProducts } from '../data/products';
import { categories as categoryList } from '../data/categories';
import { brands as brandList } from '../data/brands';

const API_BASE = 'http://localhost:5000/api/v1';

const AdminProductsContent = () => {
  const showToast = useToast();
  const [productList, setProductList] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // CSV Import State
  const [csvText, setCsvText] = useState('');
  const [csvResult, setCsvResult] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'grocery',
    brand: 'tata',
    price: 199,
    mrp: 299,
    stock: 50,
    image: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?auto=format&fit=crop&w=600&q=70',
    tags: ['trending'],
  });

  useEffect(() => {
    const saved = localStorage.getItem('dukaan_admin_products');
    if (saved) {
      setProductList(JSON.parse(saved));
    } else {
      setProductList(initialProducts);
      localStorage.setItem('dukaan_admin_products', JSON.stringify(initialProducts));
    }
  }, []);

  const saveProducts = (updated) => {
    setProductList(updated);
    localStorage.setItem('dukaan_admin_products', JSON.stringify(updated));
  };

  const openCreateModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      description: 'High quality product delivered fast with Dukaan.',
      category: 'grocery',
      brand: 'tata',
      price: 199,
      mrp: 299,
      stock: 50,
      image: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?auto=format&fit=crop&w=600&q=70',
      tags: ['trending'],
    });
    setShowModal(true);
  };

  const openEditModal = (p) => {
    setEditingProduct(p);
    setFormData({
      name: p.name || '',
      description: p.description || '',
      category: p.category || 'grocery',
      brand: p.brand || 'tata',
      price: p.price || 0,
      mrp: p.mrp || 0,
      stock: p.stock !== undefined ? p.stock : 25,
      image: p.image || p.images?.[0]?.url || '',
      tags: p.tags || ['trending'],
    });
    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    let updated;
    if (editingProduct) {
      updated = productList.map((p) =>
        (p.id === editingProduct.id || p._id === editingProduct._id)
          ? { ...p, ...formData }
          : p
      );
      showToast('Product updated successfully');
    } else {
      const newProd = {
        id: Date.now(),
        _id: `prod_${Date.now()}`,
        ...formData,
        rating: 4.5,
        ratingCount: 1,
      };
      updated = [newProd, ...productList];
      showToast('New product added & published!');
    }
    saveProducts(updated);
    setShowModal(false);
  };

  const handleDelete = (id) => {
    if (!window.confirm('Delete this product permanently?')) return;
    const updated = productList.filter((p) => (p.id !== id && p._id !== id));
    saveProducts(updated);
    showToast('Product deleted');
  };

  // CSV Bulk Import Processor
  const handleBulkImport = () => {
    if (!csvText.trim()) {
      showToast('Please paste CSV text data to import');
      return;
    }

    const lines = csvText.trim().split('\n');
    let successCount = 0;
    let failCount = 0;
    const newItems = [];

    lines.forEach((line, index) => {
      if (index === 0 && line.toLowerCase().includes('name')) return; // skip header
      const parts = line.split(',');
      if (parts.length >= 4) {
        const name = parts[0]?.trim();
        const price = Number(parts[1]?.trim()) || 100;
        const mrp = Number(parts[2]?.trim()) || price * 1.3;
        const category = parts[3]?.trim()?.toLowerCase() || 'grocery';
        const brand = parts[4]?.trim()?.toLowerCase() || 'tata';
        const stock = Number(parts[5]?.trim()) || 30;
        const image = parts[6]?.trim() || 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?auto=format&fit=crop&w=600&q=70';

        if (name) {
          newItems.push({
            id: Date.now() + index,
            _id: `prod_${Date.now()}_${index}`,
            name,
            price,
            mrp,
            category,
            brand,
            stock,
            image,
            rating: 4.3,
            ratingCount: 10,
            tags: ['newArrival'],
            description: `${name} - Genuine product available at Dukaan.`,
          });
          successCount++;
        } else {
          failCount++;
        }
      } else {
        failCount++;
      }
    });

    if (newItems.length > 0) {
      const updated = [...newItems, ...productList];
      saveProducts(updated);
      setCsvResult({ total: lines.length, success: successCount, failed: failCount });
      showToast(`Successfully imported ${successCount} products!`);
    } else {
      setCsvResult({ total: lines.length, success: 0, failed: lines.length });
    }
  };

  const filteredProducts = productList.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <Helmet title="Admin Product Management — Dukaan" />
      <div className="container-page py-8">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <Link to="/admin/dashboard" className="p-2 rounded-full hover:bg-ink/5 dark:hover:bg-paper/10 text-ink/70 dark:text-paper/70">
              <ArrowLeft size={20} />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <Package size={22} className="text-brand-500" />
                <h1 className="text-2xl font-display font-extrabold text-ink dark:text-paper">
                  Product Inventory Management
                </h1>
              </div>
              <p className="text-xs text-ink/60 dark:text-paper/60">
                Total Products: <strong>{productList.length}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowBulkModal(true)}
              className="inline-flex items-center gap-1.5 border border-ink/15 dark:border-paper/20 hover:bg-ink/5 dark:hover:bg-paper/10 text-ink dark:text-paper text-xs font-bold px-3.5 py-2.5 rounded-full transition-colors"
            >
              <FileSpreadsheet size={16} className="text-emerald-500" /> Bulk CSV Import
            </button>
            <button
              onClick={openCreateModal}
              className="inline-flex items-center gap-1.5 bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold px-4 py-2.5 rounded-full transition-colors shadow-md"
            >
              <Plus size={16} /> Add Single Product
            </button>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="card-surface p-3 rounded-2xl border border-ink/10 dark:border-paper/10 mb-6 flex items-center gap-3">
          <Search size={18} className="text-ink/40 dark:text-paper/40 ml-2" />
          <input
            type="text"
            placeholder="Search products by name or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent text-xs sm:text-sm text-ink dark:text-paper outline-none"
          />
        </div>

        {/* Product Table */}
        <div className="card-surface rounded-2xl border border-ink/10 dark:border-paper/10 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-ink/5 dark:bg-paper/5 text-ink/70 dark:text-paper/70 text-xs uppercase tracking-wider font-semibold border-b border-ink/10 dark:border-paper/10">
                <tr>
                  <th className="py-3.5 px-4">Product</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Price / MRP</th>
                  <th className="py-3.5 px-4">Stock</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink/10 dark:divide-paper/10">
                {filteredProducts.map((p) => {
                  const pid = p.id || p._id;
                  const stock = p.stock !== undefined ? p.stock : 25;
                  return (
                    <tr key={pid} className="hover:bg-ink/[0.02] dark:hover:bg-paper/[0.02]">
                      <td className="py-3 px-4 flex items-center gap-3">
                        <ImageWithFallback
                          src={p.image || p.images?.[0]?.url}
                          alt={p.name}
                          fallbackText={p.name}
                          className="w-10 h-10 rounded-lg object-cover border border-ink/10"
                        />
                        <div>
                          <div className="font-bold text-xs sm:text-sm text-ink dark:text-paper line-clamp-1">{p.name}</div>
                          <div className="text-[11px] text-ink/50 dark:text-paper/50 capitalize">Brand: {p.brand}</div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-xs font-semibold capitalize text-ink/80 dark:text-paper/80">
                        {p.category}
                      </td>
                      <td className="py-3 px-4 text-xs">
                        <span className="font-mono font-bold text-ink dark:text-paper">₹{p.price}</span>
                        {p.mrp > p.price && (
                          <span className="text-ink/40 line-through ml-1.5 font-mono">₹{p.mrp}</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-xs">
                        <span className={`font-bold ${stock > 10 ? 'text-emerald-600' : stock > 0 ? 'text-amber-600' : 'text-rose-500'}`}>
                          {stock} in stock
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right space-x-1">
                        <button
                          onClick={() => openEditModal(p)}
                          className="p-1.5 rounded-lg hover:bg-ink/5 text-ink/70 dark:text-paper/70"
                          title="Edit Product"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(pid)}
                          className="p-1.5 rounded-lg hover:bg-rose-500/10 text-rose-500"
                          title="Delete Product"
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add / Edit Product Modal */}
        <AnimatePresence>
          {showModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-xl card-surface rounded-2xl p-6 shadow-2xl my-8 max-h-[90vh] overflow-y-auto"
              >
                <h2 className="text-xl font-display font-bold text-ink dark:text-paper mb-4">
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-ink/70 dark:text-paper/70 mb-1">Product Title</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-ink/[0.04] dark:bg-paper/10 border border-ink/15 dark:border-paper/20 rounded-xl px-3 py-2 text-xs text-ink dark:text-paper outline-none focus:ring-1 focus:ring-brand-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-ink/70 dark:text-paper/70 mb-1">Category</label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full bg-ink/[0.04] dark:bg-paper/10 border border-ink/15 dark:border-paper/20 rounded-xl px-3 py-2 text-xs text-ink dark:text-paper outline-none"
                      >
                        {categoryList.map((c) => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-ink/70 dark:text-paper/70 mb-1">Brand</label>
                      <select
                        value={formData.brand}
                        onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                        className="w-full bg-ink/[0.04] dark:bg-paper/10 border border-ink/15 dark:border-paper/20 rounded-xl px-3 py-2 text-xs text-ink dark:text-paper outline-none"
                      >
                        {brandList.map((b) => (
                          <option key={b.id} value={b.id}>{b.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-ink/70 dark:text-paper/70 mb-1">Sale Price (₹)</label>
                      <input
                        type="number"
                        required
                        min="1"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                        className="w-full bg-ink/[0.04] dark:bg-paper/10 border border-ink/15 dark:border-paper/20 rounded-xl px-3 py-2 text-xs text-ink dark:text-paper outline-none font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-ink/70 dark:text-paper/70 mb-1">MRP (₹)</label>
                      <input
                        type="number"
                        min="1"
                        value={formData.mrp}
                        onChange={(e) => setFormData({ ...formData, mrp: Number(e.target.value) })}
                        className="w-full bg-ink/[0.04] dark:bg-paper/10 border border-ink/15 dark:border-paper/20 rounded-xl px-3 py-2 text-xs text-ink dark:text-paper outline-none font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-ink/70 dark:text-paper/70 mb-1">Stock</label>
                      <input
                        type="number"
                        min="0"
                        value={formData.stock}
                        onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                        className="w-full bg-ink/[0.04] dark:bg-paper/10 border border-ink/15 dark:border-paper/20 rounded-xl px-3 py-2 text-xs text-ink dark:text-paper outline-none font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-ink/70 dark:text-paper/70 mb-1">Image URL</label>
                    <input
                      type="text"
                      required
                      value={formData.image}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                      className="w-full bg-ink/[0.04] dark:bg-paper/10 border border-ink/15 dark:border-paper/20 rounded-xl px-3 py-2 text-xs text-ink dark:text-paper outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-ink/70 dark:text-paper/70 mb-1">Description</label>
                    <textarea
                      rows={2}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full bg-ink/[0.04] dark:bg-paper/10 border border-ink/15 dark:border-paper/20 rounded-xl px-3 py-2 text-xs text-ink dark:text-paper outline-none"
                    />
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
                      {editingProduct ? 'Save Changes' : 'Publish Product'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* CSV Bulk Import Modal */}
        <AnimatePresence>
          {showBulkModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-lg card-surface rounded-2xl p-6 shadow-2xl my-8"
              >
                <div className="flex items-center gap-2 mb-2">
                  <FileSpreadsheet className="text-emerald-500" size={24} />
                  <h3 className="text-lg font-display font-bold text-ink dark:text-paper">
                    Bulk Product CSV Import
                  </h3>
                </div>
                <p className="text-xs text-ink/60 dark:text-paper/60 mb-3">
                  Paste comma-separated rows in format:<br />
                  <code className="text-brand-500 bg-ink/5 px-1.5 py-0.5 rounded">Name, Price, MRP, Category, Brand, Stock, ImageURL</code>
                </p>

                <textarea
                  rows={6}
                  placeholder={`Organic Apples, 180, 220, grocery, tata, 40, https://images.unsplash.com/...\nSmart Watch, 1999, 3999, electronics, boat, 15, https://images.unsplash.com/...`}
                  value={csvText}
                  onChange={(e) => setCsvText(e.target.value)}
                  className="w-full bg-ink/[0.04] dark:bg-paper/10 border border-ink/15 dark:border-paper/20 rounded-xl p-3 text-xs font-mono text-ink dark:text-paper outline-none mb-3"
                />

                {csvResult && (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs font-semibold text-emerald-600 mb-3">
                    Processed rows: Total {csvResult.total} | Imported {csvResult.success} | Failed {csvResult.failed}
                  </div>
                )}

                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setShowBulkModal(false)}
                    className="px-4 py-2 rounded-full text-xs font-semibold text-ink/70 dark:text-paper/70 hover:bg-ink/5"
                  >
                    Close
                  </button>
                  <button
                    onClick={handleBulkImport}
                    className="px-5 py-2 rounded-full text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors inline-flex items-center gap-1.5"
                  >
                    <Upload size={14} /> Import Products
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

const AdminProducts = () => (
  <AdminRoute>
    <AdminProductsContent />
  </AdminRoute>
);

export default AdminProducts;
