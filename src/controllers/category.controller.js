import Category from '../models/Category.js';
import asyncHandler from 'express-async-handler';

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
export const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({});
  res.status(200).json({ success: true, data: categories });
});

// @desc    Create a category
// @route   POST /api/categories (or /api/admin/categories)
// @access  Private/Admin
export const createCategory = asyncHandler(async (req, res) => {
  const { name, slug, description, image, type } = req.body;

  const categoryExists = await Category.findOne({ slug });
  if (categoryExists) {
    res.status(400);
    throw new Error('Category with this slug already exists');
  }

  const category = await Category.create({
    name,
    slug,
    description,
    image,
    type,
  });

  res.status(201).json({ success: true, data: category });
});

// @desc    Update a category
// @route   PUT /api/categories/:id
// @access  Private/Admin
export const updateCategory = asyncHandler(async (req, res) => {
  const { name, slug, description, image, type } = req.body;

  const category = await Category.findById(req.params.id);

  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }

  category.name = name || category.name;
  category.slug = slug || category.slug;
  category.description = description !== undefined ? description : category.description;
  category.image = image !== undefined ? image : category.image;
  category.type = type || category.type;

  const updatedCategory = await category.save();
  res.status(200).json({ success: true, data: updatedCategory });
});

// @desc    Delete a category
// @route   DELETE /api/categories/:id
// @access  Private/Admin
export const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }

  await category.deleteOne();
  res.status(200).json({ success: true, message: 'Category removed successfully' });
});