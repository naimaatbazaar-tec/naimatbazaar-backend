import Order from '../models/Order.js';
import User from '../models/User.js';
import Product from '../models/Product.js';
import asyncHandler from 'express-async-handler';

// @desc    Get store analytics and overview metrics
// @route   GET /api/admin/analytics
// @access  Private/Admin
export const getAdminAnalytics = asyncHandler(async (req, res) => {
  // Fetch all orders
  const orders = await Order.find({});
  
  // Compute total sales dynamically by checking all known order pricing patterns
  const totalSales = orders.reduce((acc, order) => {
    // 1. Check direct properties on the order model
    let orderTotal = order.totalPrice || order.totalAmount || order.grandTotal || order.subtotal || order.itemsPrice || 0;
    
    // 2. Fallback: If no direct total field exists, calculate it from order items if they exist
    if (orderTotal === 0 && order.orderItems && Array.isArray(order.orderItems)) {
      orderTotal = order.orderItems.reduce((sum, item) => {
        const price = item.price || item.productPrice || 0;
        const qty = item.quantity || item.qty || 1;
        return sum + (price * qty);
      }, 0);
    }

    return acc + orderTotal;
  }, 0);

  const totalOrders = orders.length;

  // Count customers securely with fallback to all users if role field differs
  let totalCustomers = await User.countDocuments({ role: { $regex: /customer/i } });
  if (totalCustomers === 0) {
    totalCustomers = await User.countDocuments({});
  }

  // Find low stock items with check for both 'stock' and 'countInStock'
  const lowStockItems = await Product.find({ 
    $or: [
      { stock: { $lte: 10 } },
      { countInStock: { $lte: 10 } }
    ]
  }).select('name stock countInStock category');

  // Normalize low stock items structure for frontend display
  const formattedLowStock = lowStockItems.map(item => ({
    _id: item._id,
    name: item.name,
    stock: item.stock !== undefined ? item.stock : item.countInStock,
    category: item.category
  }));

  res.status(200).json({
    success: true,
    data: {
      totalSales,
      totalOrders,
      totalCustomers,
      lowStockItems: formattedLowStock,
    },
  });
});