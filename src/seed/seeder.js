import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Category from '../models/Category.js';
import Product from '../models/Product.js';

dotenv.config();

const categories = [
  { name: 'Organic Honey', slug: 'organic-honey', type: 'retail' },
  { name: 'Desi Ghee', slug: 'desi-ghee', type: 'retail' },
  { name: 'Herbal & Spices', slug: 'herbal-spices', type: 'retail' },
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB for seeding...');

    await Category.deleteMany();
    await Product.deleteMany();

    const createdCategories = await Category.insertMany(categories);
    const honeyCategory = createdCategories.find((c) => c.slug === 'organic-honey');

    await Product.create({
      title: 'Sidr Honey (Berry Ka Shahad)',
      slug: 'sidr-honey',
      description: '100% pure raw Sidr honey harvested from natural wild flowers.',
      ingredients: ['100% Raw Sidr Honey'],
      category: honeyCategory._id,
      images: [{ url: 'https://via.placeholder.com/500', publicId: 'sample_1' }],
      variants: [
        { grammage: '250g', price: 1200, stock: 50 },
        { grammage: '500g', price: 2200, stock: 30 },
        { grammage: '1kg', price: 4000, stock: 20 },
      ],
      isFeatured: true,
    });

    console.log('Database Seeded Successfully!');
    process.exit();
  } catch (error) {
    console.error('Seeding Error:', error);
    process.exit(1);
  }
};

seedDB();