import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Reel from '../models/reel.model.js';

dotenv.config();

const reviewsData = [
  { id: 1, title: "Talbina POV", subtitle: "Rustom Power Talbina", desc: "Real Customer Unboxing", thumb: "/images/Talbina.jpeg", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", order: 1 },
  { id: 2, title: "Oats With Nuts", subtitle: "Oats With Nuts", desc: "Healthy Breakfast Routine", thumb: "/images/Oats.jpeg", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", order: 2 },
  { id: 3, title: "Multicare Dermix", subtitle: "Skincare Powder", desc: "Organic Glow Skin Review", thumb: "/images/Skincare.jpeg", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", order: 3 },
  { id: 4, title: "Body Shapify", subtitle: "Body Shapify Powder", desc: "Weight Loss Journey", thumb: "/images/Weightloss.jpeg", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", order: 4 },
  { id: 5, title: "Special Pack", subtitle: "Naimat Bazaar Pack", desc: "Combo Results Review", thumb: "/images/Packs.jpeg", videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ", order: 5 },
];

const seedReels = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected for Reel Seeding...');

    await Reel.deleteMany();
    console.log('Old reels cleared.');

    // Strip out the non-schema numeric id if needed, or mongoose handles it
    const cleanData = reviewsData.map(({ id, ...rest }) => rest);
    await Reel.insertMany(cleanData);
    console.log('Unboxing Reels Seeded Successfully!');

    process.exit();
  } catch (error) {
    console.error('Error seeding reels:', error);
    process.exit(1);
  }
};

seedReels();