import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Review from '../models/review.model.js';

dotenv.config();

const reviewsData = [
  { 
    text: "Rustom Power Talbina boht zabardast hai, energy restore rehti hai. Quality 100% pure hai!", 
    author: "Usman Ali", 
    location: "Lahore",
    rating: 5
  },
  { 
    text: "Oats with nuts ki packing aur taste boht acha tha. Fast delivery in Karachi!", 
    author: "Tariq Mahmood", 
    location: "Karachi",
    rating: 5
  },
  { 
    text: "Multicare Dermix use kiya, result original hai. Naimat Bazaar ki service boht trusted hai.", 
    author: "Mrs. Bilal", 
    location: "Islamabad",
    rating: 5
  },
  { 
    text: "Fitness Combo purchase kiya tha. Body shapify aur skin product dono high quality hain. Recommended!", 
    author: "Hamza Khan", 
    location: "Rawalpindi",
    rating: 5
  },
];

const seedReviews = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected for Review Seeding...');

    await Review.deleteMany();
    console.log('Old reviews cleared.');

    await Review.insertMany(reviewsData);
    console.log('Reviews Seeded Successfully!');

    process.exit();
  } catch (error) {
    console.error('Error seeding reviews:', error);
    process.exit(1);
  }
};

seedReviews();