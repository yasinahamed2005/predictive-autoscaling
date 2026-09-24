import mongoose from 'mongoose';

// Storing hashed refresh tokens server-side lets us revoke individual
// sessions (logout, "sign out of all devices") instead of trusting the
// JWT's expiry alone.
const refreshTokenSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  tokenHash: { type: String, required: true },
  userAgent: String,
  ip: String,
  revoked: { type: Boolean, default: false },
  expiresAt: { type: Date, required: true },
}, { timestamps: true });

refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model('RefreshToken', refreshTokenSchema);
