import mongoose from 'mongoose';
import slugify from 'slugify';

const brandSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true },
  slug: { type: String, unique: true, index: true },
  logo: String,
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

brandSchema.pre('validate', function setSlug(next) {
  if (this.name) this.slug = slugify(this.name, { lower: true, strict: true });
  next();
});

export default mongoose.model('Brand', brandSchema);
