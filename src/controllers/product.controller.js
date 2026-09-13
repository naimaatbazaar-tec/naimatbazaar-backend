import Product from '../models/Product.js';
import Category from '../models/Category.js';
import asyncHandler from '../utils/asyncHandler.js';
import cloudinary from '../config/cloudinary.js';
import connectDB from '../config/db.js'; // <-- 1. IMPORT CONNECTDB

// GET /api/products (With search, category filter, pagination)
export const getProducts = asyncHandler(async (req, res) => {
  await connectDB(); // <-- 2. AWAIT CONNECTION HERE

  const { category, search, page = 1, limit = 12 } = req.query;
  const query = { isActive: true };

  if (category) {
    const catDoc = await Category.findOne({ slug: category });
    if (catDoc) query.category = catDoc._id;
  }

  if (search) {
    query.title = { $regex: search, $options: 'i' };
  }

  const skip = (page - 1) * limit;
  const total = await Product.countDocuments(query);
  const products = await Product.find(query)
    .populate('category', 'name slug')
    .skip(skip)
    .limit(Number(limit))
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    data: {
      products,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / limit),
      },
    },
  });
});

// GET /api/products/:slug
export const getProductBySlug = asyncHandler(async (req, res) => {
  await connectDB(); // <-- AWAIT CONNECTION HERE

  const product = await Product.findOne({ slug: req.params.slug, isActive: true }).populate('category', 'name slug');

  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }

  res.json({ success: true, data: product });
});

// POST /api/products (Admin Only)
export const createProduct = asyncHandler(async (req, res) => {
  await connectDB(); // <-- AWAIT CONNECTION HERE

  let { title, description, category, variants, images, isFeatured } = req.body;

  let slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  let categoryId = category;
  if (category && typeof category === 'string' && category.length !== 24) {
    const catDoc = await Category.findOne({
      $or: [{ slug: category }, { name: new RegExp('^' + category + '$', 'i') }]
    });
    if (catDoc) {
      categoryId = catDoc._id;
    }
  }

  let parsedVariants = typeof variants === 'string' ? JSON.parse(variants) : variants;
  if (Array.isArray(parsedVariants)) {
    parsedVariants = parsedVariants.map(v => ({
      price: Number(v.price),
      stock: Number(v.stock),
      grammage: v.grammage || 'Standard',
      unit: v.unit || 'piece'
    }));
  } else {
    parsedVariants = [{ price: 0, stock: 0, grammage: 'Standard', unit: 'piece' }];
  }

  let parsedImages = typeof images === 'string' ? JSON.parse(images) : images;

  const product = await Product.create({
    title,
    slug,
    description,
    category: categoryId,
    variants: parsedVariants,
    images: parsedImages || [],
    isFeatured: isFeatured || false,
  });

  res.status(201).json({ success: true, data: product });
});

// PUT /api/products/:id (Admin Only - Update Product)
export const updateProduct = asyncHandler(async (req, res) => {
  await connectDB(); // <-- AWAIT CONNECTION HERE

  const { title, slug, description, ingredients, category, variants, isFeatured, isActive } = req.body;

  let product = await Product.findById(req.params.id);
  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }

  let uploadedImages = product.images || [];
  if (req.files && req.files.length > 0) {
    for (const file of req.files) {
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'naimatbazaar/products' },
          (error, result) => (error ? reject(error) : resolve(result))
        );
        stream.end(file.buffer);
      });
      uploadedImages.push({ url: result.secure_url, publicId: result.public_id });
    }
  }

  product.title = title || product.title;
  product.slug = slug || product.slug;
  product.description = description || product.description;
  if (ingredients) {
    product.ingredients = Array.isArray(ingredients) ? ingredients : JSON.parse(ingredients || '[]');
  }
  product.category = category || product.category;
  product.images = uploadedImages;
  if (variants) {
    product.variants = typeof variants === 'string' ? JSON.parse(variants) : variants;
  }
  if (isFeatured !== undefined) product.isFeatured = isFeatured;
  if (isActive !== undefined) product.isActive = isActive;

  const updatedProduct = await product.save();

  res.json({ success: true, data: updatedProduct });
});

export const deleteProduct = asyncHandler(async (req, res) => {
  await connectDB(); // <-- AWAIT CONNECTION HERE

  const product = await Product.findById(req.params.id);

  if (!product) {
    return res.status(404).json({ success: false, message: 'Product not found' });
  }

  try {
    if (product.images && product.images.length > 0) {
      for (const img of product.images) {
        if (img.publicId && process.env.CLOUDINARY_API_KEY) {
          await cloudinary.uploader.destroy(img.publicId);
        }
      }
    }
  } catch (cloudinaryErr) {
    console.warn('Cloudinary image cleanup skipped:', cloudinaryErr.message);
  }

  await product.deleteOne();

  res.json({ success: true, message: 'Product removed successfully' });
});