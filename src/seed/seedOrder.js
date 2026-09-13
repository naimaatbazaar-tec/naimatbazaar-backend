import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Order from '../models/Order.js'; // Adjust the path to your order model

dotenv.config();

const sampleOrders = [
  {
    orderNumber: 'NB-126217',
    user: null, // Can be replaced with a valid User ObjectId if needed
    items: [
      {
        product: new mongoose.Types.ObjectId(), // Mock product ID
        title: 'Powder',
        image: '',
        grammage: '1 Unit',
        price: 1500,
        qty: 1,
      },
      {
        product: new mongoose.Types.ObjectId(),
        title: 'H0Ney',
        image: '',
        grammage: '500g',
        price: 2050,
        qty: 1,
      },
    ],
    shippingInfo: {
      fullName: 'Usman Ali',
      email: 'usman@example.com',
      phone: '03001234567',
      addressLine: 'House 123, Street 4',
      city: 'Lahore',
      postalCode: '54000',
    },
    subtotal: 3550,
    deliveryFee: 300,
    total: 3850,
    paymentMethod: 'cod',
    paymentStatus: 'pending',
    orderStatus: 'placed',
  },
  {
    orderNumber: 'NB-905337',
    user: null,
    items: [
      {
        product: new mongoose.Types.ObjectId(),
        title: 'Sidr Honey (Berry Ka Shahad)',
        image: '',
        grammage: '250g',
        price: 1200,
        qty: 1,
      },
    ],
    shippingInfo: {
      fullName: 'Tariq Mahmood',
      email: 'tariq@example.com',
      phone: '03219876543',
      addressLine: 'Flat 4B, Building 9',
      city: 'Karachi',
      postalCode: '74000',
    },
    subtotal: 1200,
    deliveryFee: 200,
    total: 1400,
    paymentMethod: 'online',
    paymentStatus: 'paid',
    orderStatus: 'delivered',
  },
];

const seedOrders = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected for Order Seeding...');

    await Order.deleteMany();
    console.log('Old orders cleared.');

    await Order.insertMany(sampleOrders);
    console.log('Orders Seeded Successfully!');

    process.exit();
  } catch (error) {
    console.error('Error seeding orders:', error);
    process.exit(1);
  }
};

seedOrders();