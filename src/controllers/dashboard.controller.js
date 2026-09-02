import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import asyncHandler from 'express-async-handler';

// @desc    Get admin dashboard overview statistics and recent orders
// @route   GET /api/admin/dashboard
// @access  Private/Admin
export const getAdminDashboardStats = asyncHandler(async (req, res) => {
  // 1. Fetch all orders to compute total revenue and total order count
  const orders = await Order.find({}).populate('user', 'name email');
  
  const totalRevenue = orders.reduce((acc, order) => {
    const amount = order.totalPrice || order.totalAmount || order.total || order.grandTotal || 0;
    return acc + amount;
  }, 0);

  const totalOrders = orders.length;

  // 2. Fetch total products in catalog
  const totalProducts = await Product.countDocuments({});

  // 3. Fetch total registered users
  const totalUsers = await User.countDocuments({});

  // 4. Get 5 most recent orders for the table
  const recentOrdersRaw = await Order.find({})
    .sort({ createdAt: -1 })
    .limit(5)
    .populate('user', 'name');

  // Map orders to match frontend fields expected by the table (`orderNumber`, `total`, `orderStatus`)
  const recentOrders = recentOrdersRaw.map((order, index) => ({
    _id: order._id,
    orderNumber: order.orderNumber || order._id.toString().slice(-6).toUpperCase(),
    user: order.user || { name: 'Guest' },
    total: order.totalPrice || order.totalAmount || order.total || order.grandTotal || 0,
    orderStatus: order.status || order.orderStatus || 'pending',
    createdAt: order.createdAt,
  }));

  res.status(200).json({
    success: true,
    data: {
      totalRevenue,
      totalOrders,
      totalProducts,
      totalUsers,
      recentOrders,
    },
  });
});