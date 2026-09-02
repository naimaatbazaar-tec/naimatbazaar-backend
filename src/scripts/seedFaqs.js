import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Faq from '../models/faq.model.js';

dotenv.config();

const faqsData = [
  { 
    question: "Delivery charges kitne hain?", 
    answer: "Lahore ke liye Rs. 250, Lahore se bahar Rs. 350 standard charges hain. Lekin Rs. 4,000 se zyaada ke order par Delivery FREE hai!",
    category: "Shipping"
  },
  { 
    question: "Order kitne din mein deliver hota hai?", 
    answer: "Lahore mein 24-48 ghante, aur baaqi cities mein 2 se 4 working days mein Cash on Delivery pohnch jata hai.",
    category: "Delivery"
  },
  { 
    question: "Payment ka kya tarika hai?", 
    answer: "Aap parcel received hone par Cash on Delivery (COD) de sakte hain.",
    category: "Payment"
  }
];

const seedFaqs = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected for Seeding...');

    // Clear existing FAQs (optional)
    await Faq.deleteMany();
    console.log('Old FAQs cleared.');

    // Insert new seed data
    await Faq.insertMany(faqsData);
    console.log('FAQs Seeded Successfully!');

    process.exit();
  } catch (error) {
    console.error('Error seeding FAQs:', error);
    process.exit(1);
  }
};

seedFaqs();