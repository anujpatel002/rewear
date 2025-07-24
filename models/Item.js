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
export default tbl_item;
