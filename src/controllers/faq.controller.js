import Faq from '../models/faq.model.js';

// @desc    Get all FAQs
// @route   GET /api/faqs
// @access  Public
export const getFaqs = async (req, res) => {
  try {
    const faqs = await Faq.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: faqs.length, data: faqs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create a new FAQ
// @route   POST /api/faqs
// @access  Private/Admin
export const createFaq = async (req, res) => {
  try {
    const { question, answer, category } = req.body;
    const faq = await Faq.create({ question, answer, category });

    // Trigger real-time sync event via Socket.io if available
    const io = req.app.get('io');
    if (io) {
      io.emit('store_updated', { message: 'New FAQ added' });
    }

    res.status(201).json({ success: true, data: faq });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update an FAQ
// @route   PUT /api/faqs/:id
// @access  Private/Admin
export const updateFaq = async (req, res) => {
  try {
    const faq = await Faq.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!faq) {
      return res.status(404).json({ success: false, message: 'FAQ not found' });
    }

    const io = req.app.get('io');
    if (io) {
      io.emit('store_updated', { message: 'FAQ updated' });
    }

    res.status(200).json({ success: true, data: faq });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete an FAQ
// @route   DELETE /api/faqs/:id
// @access  Private/Admin
export const deleteFaq = async (req, res) => {
  try {
    const faq = await Faq.findByIdAndDelete(req.params.id);

    if (!faq) {
      return res.status(404).json({ success: false, message: 'FAQ not found' });
    }

    const io = req.app.get('io');
    if (io) {
      io.emit('store_updated', { message: 'FAQ deleted' });
    }

    res.status(200).json({ success: true, message: 'FAQ removed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};