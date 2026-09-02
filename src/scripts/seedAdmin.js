import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/naimat-bazaar');
    console.log('Connected to MongoDB for admin seeding...');

    const adminEmail = 'admin@naimatbazaar.com';
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      existingAdmin.role = 'admin';
      existingAdmin.password = 'admin123'; // Will trigger pre-save hash hook
      await existingAdmin.save();
      console.log('Existing admin account updated successfully.');
    } else {
      await User.create({
        name: 'Super Admin',
        email: adminEmail,
        password: 'admin123', // Will trigger pre-save hash hook
        role: 'admin',
        status: 'active',
      });
      console.log('Admin account created successfully.');
    }

    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedAdmin();