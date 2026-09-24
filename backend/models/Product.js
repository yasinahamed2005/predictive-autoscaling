import mongoose from 'mongoose';
import slugify from 'slugify';

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, index: true },
  slug: { type: String, unique: true, index: true },
  description: { type: String, required: true },
  images: [{ url: String, alt: String }],

  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true, index: true },
  brand: { type: mongoose.Schema.Types.ObjectId, ref: 'Brand', index: true },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },

  price: { type: Number, required: true, min: 0 },
  mrp: { type: Number, min: 0 },
  currency: { type: String, default: 'INR' },

  stock: { type: Number, required: true, default: 0, min: 0 },
  sku: { type: String, unique: true, sparse: true },

  attributes: { type: Map, of: String }, // size, color, material, etc.
  tags: [{ type: String, index: true }], // trending, newArrival, bestSeller, deal, flashSale, recommended

  ratingAvg: { type: Number, default: 0, min: 0, max: 5 },
  ratingCount: { type: Number, default: 0 },

  isActive: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
}, { timestamps: true });

productSchema.pre('validate', function setSlug(next) {
  if (this.isModified('name') || !this.slug) {
    this.slug = `${slugify(this.name || '', { lower: true, strict: true })}-${Date.now().toString(36)}`;
  }
  next();
});

// Text index powers full-text search; compound indexes speed up the
// common filter/sort combinations used by the product listing page.
productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ category: 1, price: 1 });
productSchema.index({ category: 1, ratingAvg: -1 });
productSchema.index({ tags: 1, isActive: 1 });
productSchema.index({ seller: 1, isActive: 1 });

productSchema.virtual('discountPercent').get(function discountPercent() {
  if (!this.mrp || this.mrp <= this.price) return 0;
  return Math.round(((this.mrp - this.price) / this.mrp) * 100);
});
productSchema.set('toJSON', { virtuals: true });

export default mongoose.model('Product', productSchema);
