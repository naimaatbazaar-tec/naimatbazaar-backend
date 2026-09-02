import mongoose from 'mongoose';

const variantSchema = new mongoose.Schema({
  grammage: { 
    type: String, 
    required: true,
    enum: ['500g', '750g', '1kg', '3 pack', 'standard', 'Custom'], // Added your suggested options
    default: '1kg'
  },
  price: { 
    type: Number, 
    required: true 
  },
  stock: { 
    type: Number, 
    required: true, 
    default: 0 
  }
});

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String },
    ingredients: [{ type: String }],
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    images: [{ url: String, publicId: String }],
    variants: [variantSchema],
    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    ratingAvg: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model('Product', productSchema);