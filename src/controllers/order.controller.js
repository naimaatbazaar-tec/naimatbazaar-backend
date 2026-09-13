import mongoose from 'mongoose'; 
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import Payment from '../models/Payment.js';
import asyncHandler from '../utils/asyncHandler.js';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_dummy_key_until_env_loaded');

// Helper to generate custom order numbers (e.g., NB-2026-1001)
const generateOrderNumber = () => {
  return `NB-${Date.now().toString().slice(-6)}`;
};

// POST /api/orders (Create Order - COD or Card)
export const createOrder = asyncHandler(async (req, res) => {
  const { items, shippingInfo, paymentMethod, user: bodyUser } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ success: false, message: 'Cart items are required' });
  }

  // Determine user ID from auth middleware (req.user) or fallback to body payload
  const userId = req.user?._id || req.user?.id || bodyUser || null;

  let subtotal = 0;
  const verifiedItems = [];

  // Validate stock and calculate prices server-side
  for (const item of items) {
    const targetProductId = item.productId || item.product;
    const product = await Product.findById(targetProductId);
    
    if (!product || !product.isActive) {
      return res.status(404).json({ success: false, message: `Product not found: ${item.title || 'Item'}` });
    }

    const variant = product.variants.find((v) => v.grammage === item.grammage);
    if (!variant || variant.stock < item.qty) {
      return res.status(400).json({ success: false, message: `Insufficient stock for ${product.title} (${item.grammage})` });
    }

    subtotal += variant.price * item.qty;
    
    // Captured image from frontend item or fallback to product's first image
    const itemImage = item.image || item.imageUrl || (product.images && product.images[0]) || '';

    verifiedItems.push({
      product: product._id,
      title: product.title,
      image: itemImage, // <-- Included image field
      grammage: variant.grammage,
      price: variant.price,
      qty: item.qty,
    });
  }

  const deliveryFee = Number(process.env.DELIVERY_FEE || 200);
  const total = subtotal + deliveryFee;

  const order = await Order.create({
    orderNumber: generateOrderNumber(),
    user: userId,
    items: verifiedItems,
    shippingInfo,
    subtotal,
    deliveryFee,
    total,
    paymentMethod,
    paymentStatus: 'pending',
    orderStatus: 'placed',
    statusHistory: [{ status: 'placed', note: 'Order created' }],
  });

  // Automatically save/update address to User profile if logged in
  if (userId) {
    await User.findByIdAndUpdate(userId, {
      $push: {
        addresses: {
          $each: [shippingInfo],
          $position: 0, // Keeps the most recent address at the top of the array
        },
      },
    }).catch((err) => console.error('Failed to save address to user profile:', err));
  }

  // Reduce inventory stock
  for (const item of verifiedItems) {
    await Product.updateOne(
      { _id: item.product, 'variants.grammage': item.grammage },
      { $inc: { 'variants.$.stock': -item.qty } }
    );
  }

  // Handle Stripe Payment Intent creation if card is selected
  let clientSecret = null;
  if (paymentMethod === 'card' || paymentMethod === 'online') {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(total * 100),
      currency: 'pkr',
      metadata: { orderId: order._id.toString() },
    });

    clientSecret = paymentIntent.client_secret;

    await Payment.create({
      order: order._id,
      user: userId,
      method: 'stripe',
      stripePaymentIntentId: paymentIntent.id,
      amount: total,
    });
  } else {
    await Payment.create({
      order: order._id,
      user: userId,
      method: 'cod',
      amount: total,
    });
  }

  res.status(201).json({
    success: true,
    data: { order, clientSecret },
  });
});

// GET /api/orders/my-orders
export const getMyOrders = asyncHandler(async (req, res) => {
  const userId = req.user?._id || req.user?.id;
  const userEmail = req.user?.email;

  const queryConditions = [];
  if (userId) queryConditions.push({ user: userId });
  if (userEmail) queryConditions.push({ 'shippingInfo.email': userEmail });

  if (queryConditions.length === 0) {
    return res.status(401).json({ success: false, message: 'Not authorized or user missing' });
  }

  const orders = await Order.find({ $or: queryConditions }).sort({ createdAt: -1 });
  res.json({ success: true, data: orders });
});

// GET /api/orders/:id
export const getOrderById = asyncHandler(async (req, res) => {
  const userId = req.user?._id || req.user?.id;
  const userEmail = req.user?.email;
  const identifier = req.params.id;

  // Check if identifier is a valid MongoDB ObjectId or fallback to orderNumber
  const isObjectId = mongoose.Types.ObjectId.isValid(identifier);
  const queryIdentifier = isObjectId 
    ? { _id: identifier } 
    : { orderNumber: identifier };

  const order = await Order.findOne(queryIdentifier);

  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }
  
  res.json({ success: true, data: order });
});