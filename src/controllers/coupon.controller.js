import Coupon from '../models/Coupon.js'; // Ensure you have a Coupon model or create one
import asyncHandler from 'express-async-handler';

// @desc    Get all coupons
// @route   GET /api/admin/coupons
// @access  Private/Admin
export const getCoupons = asyncHandler(async (req, res) => {
  const coupons = await Coupon.find({});
  res.status(200).json({ success: true, data: coupons });
});

// @desc    Create a coupon
// @route   POST /api/admin/coupons
// @access  Private/Admin
export const createCoupon = asyncHandler(async (req, res) => {
  const { code, discountPercentage, expirationDate, isActive } = req.body;

  const couponExists = await Coupon.findOne({ code });
  if (couponExists) {
    res.status(400);
    throw new Error('Coupon code already exists');
  }

  const coupon = await Coupon.create({
    code,
    discountPercentage,
    expirationDate,
    isActive,
  });

  res.status(201).json({ success: true, data: coupon });
});

// @desc    Delete a coupon
// @route   DELETE /api/admin/coupons/:id
// @access  Private/Admin
export const deleteCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);
  if (!coupon) {
    res.status(404);
    throw new Error('Coupon not found');
  }

  await coupon.deleteOne();
  res.status(200).json({ success: true, message: 'Coupon removed' });
});