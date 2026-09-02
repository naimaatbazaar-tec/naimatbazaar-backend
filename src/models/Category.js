import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String },
    image: { type: String },
    type: { type: String, enum: ['retail', 'wholesale'], default: 'retail' },
  },
  { timestamps: true }
);

export default mongoose.model('Category', categorySchema);