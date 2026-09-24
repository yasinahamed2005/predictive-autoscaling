import mongoose from 'mongoose';
import { COUPON_TYPE } from '../constants/index.js';

const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true, trim: true, index: true },
  type: { type: String, enum: Object.values(COUPON_TYPE), required: true },
  value: { type: Number, required: true, min: 0 }, // percent (0-100) or flat INR amount
  minOrderValue: { type: Number, default: 0 },
  maxDiscount: Number, // caps a percent coupon's rupee value
  usageLimit: { type: Number, default: null }, // null = unlimited
  usedCount: { type: Number, default: 0 },
  expiresAt: { type: Date, required: true },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

couponSchema.index({ code: 1, isActive: 1 });

export default mongoose.model('Coupon', couponSchema);
