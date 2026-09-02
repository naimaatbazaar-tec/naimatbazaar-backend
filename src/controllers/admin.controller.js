import Order from '../models/Order.js';
import User from '../models/User.js';
import Product from '../models/Product.js';
import asyncHandler from '../utils/asyncHandler.js';

// GET /api/admin/dashboard (Analytics summary)
export const getDashboardStats = asyncHandler(async (req, res) => {
  const totalUsers = await User.countDocuments({ role: 'user' });
  const totalProducts = await Product.countDocuments();
  const totalOrders = await Order.countDocuments();

  const revenueData = await Order.aggregate([
    { $match: { orderStatus: { $ne: 'cancelled' } } },
    { $group: { _id: null, totalRevenue: { $sum: '$total' } } },
  ]);

  const recentOrders = await Order.find()
    .populate('user', 'name email')
    .sort({ createdAt: -1 })
    .limit(5);

  res.json({
    success: true,
    data: {
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue: revenueData[0]?.totalRevenue || 0,
      recentOrders,
    },
  });
});

// GET /api/admin/orders (Fetch all orders with filter)
export const getAllOrders = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query;
  const query = {};

  if (status) query.orderStatus = status;

  const skip = (page - 1) * limit;
  const total = await Order.countDocuments(query);
  const orders = await Order.find(query)
    .populate('user', 'name email phone')
    .skip(skip)
    .limit(Number(limit))
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    data: {
      orders,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / limit),
      },
    },
  });
});

// PUT /api/admin/orders/:id/status (Update Order & Payment Status)
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { orderStatus, paymentStatus, note } = req.body;
  const order = await Order.findById(req.params.id);

  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found' });
  }

  if (orderStatus) {
    order.orderStatus = orderStatus;
    order.statusHistory.push({
      status: orderStatus,
      note: note || `Status updated to ${orderStatus}`,
    });
  }

  if (paymentStatus) {
    order.paymentStatus = paymentStatus;
  }

  await order.save();
  res.json({ success: true, data: order });
});

// GET /api/admin/users (List all registered users)
export const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select('-password').sort({ createdAt: -1 });
  res.json({ success: true, data: users });
});

// PUT /api/admin/users/:id/status (Block / Unblock User)
export const toggleUserStatus = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  user.status = user.status === 'active' ? 'blocked' : 'active';
  await user.save();

  res.json({ success: true, data: user });
});

// Add these functions to your existing controllers/admin.controller.js

// GET /api/admin/profile (Get logged-in admin profile)
export const getAdminProfile = asyncHandler(async (req, res) => {
  const admin = await User.findById(req.user.id || req.user._id).select('-password');
  if (!admin) {
    return res.status(404).json({ success: false, message: 'Admin not found' });
  }
  res.json({ success: true, data: { admin } });
});

// PUT /api/admin/profile (Update admin name, email, phone)
export const updateAdminProfile = asyncHandler(async (req, res) => {
  const { name, email, phone } = req.body;
  const admin = await User.findById(req.user.id || req.user._id);

  if (!admin) {
    return res.status(404).json({ success: false, message: 'Admin not found' });
  }

  admin.name = name || admin.name;
  admin.email = email || admin.email;
  admin.phone = phone !== undefined ? phone : admin.phone;

  await admin.save();

  const updatedAdmin = await User.findById(admin._id).select('-password');
  res.json({ success: true, data: { admin: updatedAdmin }, message: 'Profile updated successfully' });
});

// PUT /api/admin/password (Update admin password)
export const updateAdminPassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  
  // Find user and include the password field since it has select: false by default
  const admin = await User.findById(req.user.id || req.user._id).select('+password');

  if (!admin) {
    return res.status(404).json({ success: false, message: 'Admin not found' });
  }

  const isMatch = await admin.comparePassword(currentPassword);
  if (!isMatch) {
    return res.status(400).json({ success: false, message: 'Current password is incorrect' });
  }

  admin.password = newPassword;
  await admin.save();

  res.json({ success: true, message: 'Password updated successfully' });
});