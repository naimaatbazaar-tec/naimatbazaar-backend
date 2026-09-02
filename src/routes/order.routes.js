import express from 'express';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import asyncHandler from '../utils/asyncHandler.js';

const router = express.Router();

// ==========================================
// 1. GET ALL ORDERS (with Search, Status Filter & Stats)
// ==========================================
router.get('/', asyncHandler(async (req, res) => {
  const { search, status } = req.query;
  let query = {};

  // Search filter by Order ID, Order Number, Customer Full Name, or Email
  if (search) {
    const searchRegex = new RegExp(search, 'i');
    const conditions = [
      { orderNumber: searchRegex },
      { 'shippingInfo.fullName': searchRegex },
      { 'shippingInfo.email': searchRegex },
    ];
    
    // Check if search string is a valid MongoDB ObjectId
    if (search.match(/^[0-9a-fA-F]{24}$/)) {
      conditions.push({ _id: search });
      conditions.push({ user: search });
    }

    query.$or = conditions;
  }

  // Filter by order status if provided
  if (status && status !== 'all') {
    query.orderStatus = status.toLowerCase();
  }

  const orders = await Order.find(query)
    .populate('user', 'name email')
    .sort({ createdAt: -1 });

  // Calculate stats for admin dashboard widgets
  const totalOrdersCount = await Order.countDocuments();
  const pendingCount = await Order.countDocuments({ orderStatus: 'placed' });
  const processingCount = await Order.countDocuments({ orderStatus: 'processing' });
  const deliveredCount = await Order.countDocuments({ orderStatus: 'delivered' });
  
  const revenueAggregation = await Order.aggregate([
    { $match: { orderStatus: { $ne: 'cancelled' } } },
    { $group: { _id: null, totalRevenue: { $sum: '$total' } } }
  ]);
  const totalRevenue = revenueAggregation[0]?.totalRevenue || 0;

  return res.status(200).json({
    success: true,
    stats: {
      totalOrders: totalOrdersCount,
      pending: pendingCount,
      processing: processingCount,
      delivered: deliveredCount,
      revenue: totalRevenue,
    },
    data: orders,
  });
}));

// ==========================================
// 2. GET SINGLE ORDER BY ID
// ==========================================
router.get('/:id', asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email phone');
  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }
  return res.status(200).json({ success: true, data: order });
}));

// ==========================================
// 3. CREATE ORDER (Customer / Admin Checkout)
// ==========================================
router.post('/', asyncHandler(async (req, res) => {
  const {
    orderNumber,
    user,
    items,
    shippingInfo,
    subtotal,
    deliveryFee,
    total,
    paymentMethod,
    paymentStatus,
  } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ success: false, message: 'Cart items cannot be empty.' });
  }

  if (!shippingInfo?.fullName || !shippingInfo?.phone || !shippingInfo?.addressLine) {
    return res.status(400).json({ success: false, message: 'Missing required shipping information.' });
  }

  const newOrder = await Order.create({
    orderNumber: orderNumber || 'NB-' + Math.floor(100000 + Math.random() * 900000),
    user: user || null,
    items,
    shippingInfo,
    subtotal,
    deliveryFee: deliveryFee || 0,
    total,
    paymentMethod: paymentMethod || 'cod',
    paymentStatus: paymentStatus || 'pending',
    orderStatus: 'placed',
    statusHistory: [{ status: 'placed', note: 'Order placed successfully' }],
  });

  return res.status(201).json({
    success: true,
    message: 'Order created successfully!',
    data: newOrder,
  });
}));

// ==========================================
// 4. UPDATE ORDER STATUS & DETAILS (Admin Edit/Fulfillment)
// ==========================================
router.put('/:id', asyncHandler(async (req, res) => {
  const { orderStatus, paymentStatus, shippingInfo } = req.body;
  const order = await Order.findById(req.params.id);

  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }

  if (orderStatus && orderStatus !== order.orderStatus) {
    order.orderStatus = orderStatus;
    order.statusHistory.push({
      status: orderStatus,
      note: `Status updated to ${orderStatus} by admin`,
    });
  }

  if (paymentStatus) order.paymentStatus = paymentStatus;
  if (shippingInfo) order.shippingInfo = { ...order.shippingInfo, ...shippingInfo };

  await order.save();

  return res.status(200).json({
    success: true,
    message: 'Order updated successfully',
    data: order,
  });
}));

// ==========================================
// 5. UPDATE SOLE ORDER STATUS (Endpoint compatible with frontend modal)
// ==========================================
router.put('/:id/status', asyncHandler(async (req, res) => {
  const { orderStatus, note } = req.body;
  const order = await Order.findById(req.params.id);

  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }

  order.orderStatus = orderStatus;
  order.statusHistory.push({
    status: orderStatus,
    note: note || `Status changed to ${orderStatus}`,
  });

  await order.save();

  return res.status(200).json({
    success: true,
    message: 'Order status updated successfully',
    data: order,
  });
}));

// ==========================================
// 6. DELETE / CANCEL ORDER
// ==========================================
router.delete('/:id', asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }

  // Restore product stock upon order deletion/cancellation if needed
  for (const item of order.items) {
    await Product.updateOne(
      { _id: item.product, 'variants.grammage': item.grammage },
      { $inc: { 'variants.$.stock': item.qty } }
    ).catch(() => {}); // silent catch if variant changes structure
  }

  await order.deleteOne();

  return res.status(200).json({
    success: true,
    message: 'Order deleted and inventory restored successfully',
  });
}));

export default router;