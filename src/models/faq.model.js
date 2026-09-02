import mongoose from 'mongoose';

const faqSchema = new mongoose.Schema({
  question: { 
    type: String, 
    required: [true, 'Question is required'], 
    trim: true 
  },
  answer: { 
    type: String, 
    required: [true, 'Answer is required'], 
    trim: true 
  },
  category: { 
    type: String, 
    default: 'General', 
    trim: true 
  }
}, { timestamps: true });

export default mongoose.model('Faq', faqSchema);