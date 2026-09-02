import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  author: { 
    type: String, 
    required: [true, 'Author name is required'], 
    trim: true 
  },
  location: { 
    type: String, 
    required: [true, 'Location is required'], 
    trim: true 
  },
  text: { 
    type: String, 
    required: [true, 'Review text is required'], 
    trim: true 
  },
  rating: { 
    type: Number, 
    default: 5, 
    min: 1, 
    max: 5 
  },
  isApproved: { 
    type: Boolean, 
    default: true 
  }
}, { timestamps: true });

export default mongoose.model('Review', reviewSchema);