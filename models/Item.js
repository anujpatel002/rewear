import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema({
  title: String,
  description: String,
  category: String,
  type: String,
  size: String,
  condition: String,
  tags: String,
  imageUrl: String,
  points: { type: Number, default: 0, min: 0 },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'rewear_User',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// ✅ Fix overwrite error by checking if model already exists
const tbl_item = mongoose.models.tbl_item || mongoose.model('tbl_item', itemSchema);

const swapRequestSchema = new mongoose.Schema({
  item: { type: mongoose.Schema.Types.ObjectId, ref: 'tbl_item', required: true },
  requester: { type: mongoose.Schema.Types.ObjectId, ref: 'rewear_User', required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'rewear_User', required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
});

const SwapRequest = mongoose.models.SwapRequest || mongoose.model('SwapRequest', swapRequestSchema);

export { SwapRequest };
export default tbl_item;
