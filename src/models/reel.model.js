import mongoose from 'mongoose';

const reelSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: [true, 'Reel title is required'], 
    trim: true 
  },
  subtitle: { 
    type: String, 
    required: [true, 'Reel subtitle is required'], 
    trim: true 
  },
  desc: { 
    type: String, 
    required: [true, 'Reel description is required'], 
    trim: true 
  },
  thumb: { 
    type: String, 
    required: [true, 'Thumbnail image URL/path is required'], 
    trim: true 
  },
  videoUrl: { 
    type: String, 
    required: [true, 'Video URL is required'], 
    trim: true 
  },
  order: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

export default mongoose.model('Reel', reelSchema);